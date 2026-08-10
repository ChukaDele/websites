# Bredge Data Reliability Checks

A small, dependency-light set of SQL and dbt tests for the questions every
analytics team eventually has to answer out loud: *is this table safe to build
on, and can I explain the number when someone disagrees with it?*

Everything here runs on stock **PostgreSQL**. The checks are written as
**assertion queries**: each one returns rows only when something is wrong. An
empty result means the check passed. That single convention is what makes the
suite easy to automate — any output at all is a failure to investigate, so you
can wire the same query into a scheduler, a CI step, or a dbt test without
rewriting it.

All data in this repository is **synthetic**. The example schema below is
invented to make the checks concrete; no real customer, order, or revenue
figure appears anywhere.

## The synthetic example

The examples model a common shape: a business with the same customers and the
same money described in two systems that were never designed to agree — a
**CRM** where deals are booked, and a **billing** platform where invoices are
raised. The reliability question is whether the two still line up, and whether
either can be trusted on its own.

```
crm.customers
  customer_id      bigint        primary key      -- CRM-minted surrogate key
  customer_ref     text                           -- business key, e.g. 'CUS-1001'
  company_name     text                           -- free-text, entered by humans
  primary_email    text
  email_domain     text                           -- e.g. 'northwind.example'
  country          text
  created_at       timestamptz
  loaded_at        timestamptz                     -- when this row last landed in the warehouse

crm.orders
  order_id         bigint        primary key
  order_ref        text                           -- business key, e.g. 'ORD-50231'
  customer_id      bigint        -> crm.customers(customer_id)
  amount_gbp       numeric(12,2)
  order_status     text                           -- 'signed' | 'cancelled' | 'refunded'
  ordered_at       timestamptz
  loaded_at        timestamptz

billing.accounts
  account_id       bigint        primary key
  account_ref      text                           -- 'ACC-9001'
  crm_customer_ref text                           -- soft link to crm.customers.customer_ref (may be null or wrong)
  account_name     text
  billing_email    text
  loaded_at        timestamptz

billing.invoices
  invoice_id       bigint        primary key
  invoice_ref      text                           -- business key, e.g. 'INV-33110'
  account_id       bigint        -> billing.accounts(account_id)
  invoice_date     date
  currency_code    text                           -- 'GBP'
  loaded_at        timestamptz

billing.invoice_lines
  invoice_line_id  bigint        primary key
  invoice_id       bigint        -> billing.invoices(invoice_id)
  amount_gbp       numeric(12,2)
  line_kind        text                           -- 'charge' | 'discount' | 'refund'
  loaded_at        timestamptz
```

Two deliberate frictions are baked in, because they are the frictions that
break real reconciliations: the link between the two systems is a soft text
reference (`billing.accounts.crm_customer_ref`), not an enforced foreign key,
and the same company can appear more than once in `crm.customers` because the
name and email were typed by different people on different days.

## The checks, and when each one matters

**Uniqueness** (`sql/uniqueness_checks.sql`) — Every business key should point
at exactly one real-world thing. This matters the moment you sum or join,
because a business key that repeats quietly multiplies whatever you count
through it. Uniqueness is checked against the *business* key (`order_ref`,
`customer_ref`) rather than a system-generated surrogate, which is unique by
construction and therefore proves nothing.

**Referential integrity** (`sql/referential_integrity.sql`) — Every child row
should have a parent that exists: every order a real customer, every invoice
line a real invoice. This matters because orphaned rows drop silently out of
any query that joins the two tables, quietly understating a total that still
looks perfectly reasonable. The soft CRM-to-billing link is the interesting
case here — nothing in the database enforces it, so it has to be tested.

**Freshness** (`sql/freshness_checks.sql`) — A table can hold entirely correct
values and still be stale. Freshness measures the age of the newest record
against an agreed limit, so a daily board figure sourced from a table that last
refreshed three days ago fails the check even when every value in it is right.
Freshness is judged against the decision the data feeds, not against the clock.

**Duplicate identity** (`sql/duplicate_identity.sql`) — Deciding when two rows
describe the same customer. Source systems mint their own keys and humans type
names inconsistently, so one company becomes several records. This matters
because identity is the deepest cause of numbers that disagree: if "customer"
means something different in two systems, every per-customer metric inherits
the ambiguity. The check groups likely duplicates and assigns a single
canonical id, so the rest of the warehouse can count each customer once.

**Reconciliation** (`sql/reconciliation.sql`) — Whether two independent sources
agree at the record level, not merely on the total. Matching totals can hide
two errors that cancel out; differing totals can be completely correct for a
definitional reason. This is the check that turns "the dashboards disagree"
into a line-by-line account of *why*, classified as **time**, **grain**,
**identity**, or **definition**. The goal is not to force the numbers to
match; it is to explain every pound of the difference.

## How to run

The SQL files are plain PostgreSQL. Point them at a database that contains the
`crm` and `billing` schemas above (or adapt the identifiers to your own).

```bash
# run a single check; any rows returned mean the check failed
psql "$DATABASE_URL" -f sql/uniqueness_checks.sql

# run the whole suite and stop on the first error
for f in sql/*.sql; do
  echo "== $f =="
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$f"
done
```

Two of the files use PostgreSQL extensions for fuzzy matching. Enable them once
per database (each file also notes this at the top):

```sql
create extension if not exists pg_trgm;        -- trigram similarity for names
create extension if not exists fuzzystrmatch;  -- optional, for phonetic matching
```

### dbt

The `dbt/` directory shows the same intent expressed as dbt tests, which is
where most teams end up once the checks need to run on every build rather than
by hand. `dbt/schema.yml` attaches `unique`, `not_null`, `relationships`, and
`accepted_values` tests to the staged models; `dbt/tests/assert_revenue_reconciles.sql`
is a custom singular test that fails the build when CRM and billing revenue
drift beyond an agreed tolerance. Drop the files into a dbt project whose
sources match the schema above and run:

```bash
dbt test --select source:crm source:billing
dbt test --select assert_revenue_reconciles
```

## Why this exists

Reliable data is not data that is never wrong. It is data whose state you can
prove at any time, and whose disagreements you can explain before a stakeholder
finds them. The difference between the two is a handful of checks that run
close to the data, fail loudly, and are owned by a named person.

These are the checks we reach for first, published in the plainest form we
could — assertion queries anyone can read, adapt, and schedule. There is no
framework to adopt and nothing to install beyond PostgreSQL. If they save you
one archaeological meeting about which number is right, they have done their
job.

Maintained by **The Bredge**. Contributions and corrections are welcome.

## License

MIT. See [`LICENSE`](./LICENSE). Copyright (c) 2026 The Bredge.
