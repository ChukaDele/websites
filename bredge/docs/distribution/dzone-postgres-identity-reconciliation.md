# A PostgreSQL Pattern for Reconciling Customer Identity Across Source Systems

Most reporting disagreements that look like a maths problem are really an
identity problem. Finance says revenue was one number, the CRM says another,
and when you sit down to reconcile them you discover the two systems do not
agree on something more basic than the total: they do not agree on who the
customer is. One company is three accounts in the CRM, two billing entities,
and a handful of product logins. Until "customer" resolves to the same thing
in both places, every per-customer metric inherits the ambiguity.

This article walks through a pattern for resolving that identity in plain
PostgreSQL — no MDM platform, no external service, just CTEs, a recursive
closure, and a `ROW_NUMBER()`. It runs on stock Postgres and produces a
crosswalk you can join to. All data here is synthetic.

## The setup

Two systems describe the same customers. A CRM, where deals are booked, and a
billing platform, where invoices are raised. They were never designed to share
a key, so the only link between them is a soft text reference that nobody
enforces.

```sql
create schema if not exists crm;

create table crm.customers (
  customer_id   bigint primary key,     -- CRM-minted surrogate
  customer_ref  text,                    -- business key, e.g. 'CUS-1001'
  company_name  text,                    -- typed by humans, inconsistently
  primary_email text,
  email_domain  text,
  created_at    timestamptz
);

insert into crm.customers values
  (1, 'CUS-1001', 'Northwind Trading Ltd', 'ap@northwind.example',      'northwind.example', '2025-02-11'),
  (2, 'CUS-1044', 'Northwind Trading',     'accounts@northwind.example','northwind.example', '2025-08-02'),
  (3, 'CUS-1102', 'NORTHWIND TRADING LTD.','ap@northwind.example',      'northwind.example', '2026-01-19'),
  (4, 'CUS-1200', 'Contoso Foods',         'finance@contoso.example',   'contoso.example',   '2025-05-30'),
  (5, 'CUS-1288', 'Contoso Foods PLC',     'finance@contoso.example',   'contoso.example',   '2026-03-14'),
  (6, 'CUS-1400', 'Fabrikam Ltd',          'pay@fabrikam.example',      'fabrikam.example',  '2025-11-01');
```

Three of those rows are the same company, entered on three different days by
three different people. Two more are a second company that a "PLC" and a fresh
signup split in two. Fabrikam is a genuine single customer. A human can see
this in seconds; the warehouse cannot, because nothing in the data says so.

## Step 1: normalise before you compare

Cosmetic differences — case, whitespace, a trailing `Ltd` — will defeat any
exact match. Normalise the fields you intend to compare into a stable form
first, and keep the raw values around for the audit trail.

```sql
with normalised as (
  select
    customer_id,
    customer_ref,
    company_name,
    created_at,
    nullif(lower(trim(primary_email)), '')                    as email_norm,
    nullif(lower(trim(email_domain)), '')                     as domain_norm,
    regexp_replace(
      lower(trim(company_name)),
      '[[:punct:]]|\s+(ltd|limited|plc|llp|inc|gmbh|co|company)\.?$',
      '', 'g'
    )                                                         as name_core
  from crm.customers
)
select customer_id, name_core, email_norm, domain_norm from normalised;
```

`name_core` strips punctuation and a common legal suffix, so `Northwind Trading
Ltd`, `Northwind Trading`, and `NORTHWIND TRADING LTD.` all collapse to
`northwind trading`. This is deliberately conservative: over-aggressive
normalisation merges companies that only look alike.

## Step 2: propose candidate pairs from more than one signal

Never merge on a single signal. Here a pair of records is a *candidate*
duplicate when they share an exact normalised email, or when they share an
email domain and their core names are similar. Fuzzy name similarity uses
trigrams from the `pg_trgm` extension.

```sql
create extension if not exists pg_trgm;

-- ...continuing from the normalised CTE...
pairs as (
  select a.customer_id as id_a, b.customer_id as id_b
  from   normalised a
  join   normalised b
    on   a.customer_id < b.customer_id        -- each unordered pair once, no self-pairs
   and ( (a.email_norm is not null and a.email_norm = b.email_norm)
      or (a.domain_norm is not null
          and a.domain_norm = b.domain_norm
          and similarity(a.name_core, b.name_core) >= 0.60) )
)
```

The `a.customer_id < b.customer_id` predicate is doing quiet work: it produces
each pair exactly once and removes the self-match, so the output is a clean
edge list. The `0.60` threshold is a starting point, not a law — tune it
against how many false positives you can tolerate, because every merge is
harder to undo than to prevent.

## Step 3: turn pairs into clusters with a recursive closure

Pairs are not enough. If record 1 matches record 2 on email, and record 2
matches record 3 on a fuzzy name, then 1, 2 and 3 are all the same customer
even though 1 and 3 were never directly compared. Identity is *transitive*, and
resolving it means finding connected components in the graph of candidate
pairs.

A recursive CTE computes the transitive closure. First make the edges
symmetric so reachability flows both ways, then let each node reach everything
connected to it. `UNION` (not `UNION ALL`) deduplicates the working set and
guarantees the recursion terminates.

```sql
edges as (
  select id_a as src, id_b as dst from pairs
  union all
  select id_b as src, id_a as dst from pairs
),
reach (node, reachable) as (
  select customer_id, customer_id from normalised   -- every node reaches itself
  union
  select r.node, e.dst
  from   reach r
  join   edges e on e.src = r.reachable
),
cluster_key as (
  select node as customer_id, min(reachable) as cluster_id
  from   reach
  group  by node
)
```

The cluster id is the smallest `customer_id` reachable from each node — a
stable, deterministic label shared by every member of a component. Records with
no matches reach only themselves, so they form their own single-member cluster
and pass through untouched.

## Step 4: choose a survivor with ROW_NUMBER()

Every cluster needs one canonical record — the row the others collapse into.
The choice should be deterministic and defensible. Here the oldest record wins,
because it usually carries the most history, with `customer_id` breaking ties.

```sql
ranked as (
  select
    ck.customer_id,
    ck.cluster_id,
    n.company_name,
    row_number() over (
      partition by ck.cluster_id
      order by n.created_at asc nulls last, ck.customer_id asc
    ) as rn
  from cluster_key ck
  join normalised  n using (customer_id)
)
select
  customer_id,
  company_name,
  first_value(customer_id) over (
    partition by cluster_id order by rn
  ) as canonical_customer_id,
  (rn = 1) as is_canonical,
  count(*) over (partition by cluster_id) as cluster_size
from ranked
order by cluster_id, rn;
```

`ROW_NUMBER()` ranks the members; `FIRST_VALUE()` broadcasts the `rn = 1`
customer_id to the whole cluster as the canonical id. The result is the
crosswalk: every original `customer_id` mapped to the one it should resolve to.
For the synthetic data, records 1, 2 and 3 collapse into customer 1; records 4
and 5 collapse into customer 4; Fabrikam stands alone.

## Step 5: test referential integrity, and quarantine the exceptions

A crosswalk is only safe to join if it is complete and unambiguous. Two checks
matter, and both are written as assertion queries — they return rows *only*
when something is wrong, so an empty result is a pass.

Every canonical id must exist:

```sql
-- orphaned crosswalk entries: a canonical id with no surviving record
select cw.customer_id, cw.canonical_customer_id
from   customer_crosswalk cw
left join crm.customers c on c.customer_id = cw.canonical_customer_id
where  c.customer_id is null;
```

And no source record may map to two canonical ids:

```sql
-- a record that resolved to more than one identity: a bug in the closure
select customer_id, count(distinct canonical_customer_id) as identities
from   customer_crosswalk
group  by customer_id
having count(distinct canonical_customer_id) > 1;
```

The harder cases are the ones the rules cannot decide: a shared email on an
outsourced finance address, two genuinely different subsidiaries under one
domain, a match that sits right on the threshold. Do not force these. Route
them to a review queue and leave them out of the automatic crosswalk until a
human rules.

```sql
create table customer_identity_exceptions (
  customer_id   bigint,
  reason        text,
  detected_at   timestamptz default now()
);

-- example: shared email across domains that do not otherwise agree
insert into customer_identity_exceptions (customer_id, reason)
select a.customer_id,
       'shared email across differing domains — needs human review'
from   crm.customers a
join   crm.customers b
  on   lower(trim(a.primary_email)) = lower(trim(b.primary_email))
 and   a.email_domain <> b.email_domain
 and   a.customer_id <> b.customer_id;
```

Exception handling is not an afterthought here; it is the feature that keeps the
automatic path trustworthy. A resolution process that quietly merges its
uncertain cases will, sooner or later, join two real companies into one and
understate a number that nobody thinks to question.

## Using the result

Persist the crosswalk as a table or a materialised view, join every fact table
to `canonical_customer_id` instead of the raw key, and the disagreement between
CRM and billing stops being about identity. What remains — differences of
timing, grain, and definition — is a smaller, cleaner reconciliation, and one
you can now actually finish.

---

*Written by the team at The Bredge, a data engineering and analytics
consultancy. The full set of synthetic reliability checks this pattern belongs
to is open-source under the MIT licence.*
