-- ============================================================================
-- Bredge Data Reliability Checks — duplicate customer identity
-- ----------------------------------------------------------------------------
-- Why this matters: source systems mint their own keys and humans type company
-- names inconsistently, so one real company becomes several rows. Identity is
-- the deepest cause of numbers that disagree — if "customer" resolves
-- differently in two systems, every per-customer metric inherits the ambiguity.
-- This file finds likely duplicates from three signals (exact email, shared
-- domain, and fuzzy name) and assigns each cluster a single canonical id, so
-- the rest of the warehouse can count each customer once.
--
-- Fuzzy matching uses trigram similarity from pg_trgm:
--     create extension if not exists pg_trgm;
--
-- All data is synthetic. Thresholds (0.60 similarity here) are examples; tune
-- them against your own false-positive tolerance before trusting a merge.
-- ============================================================================


-- ============================================================================
-- QUERY A — build the identity crosswalk (full output, one row per customer)
-- Maps every customer_id to a canonical_customer_id. rn = 1 is the surviving
-- record for its cluster; rn > 1 are duplicates that should collapse into it.
-- ============================================================================
with recursive
-- Stage 1: normalise the fields we match on, so cosmetic differences (case,
-- whitespace, a trailing "Ltd") do not defeat the comparison.
normalised as (
  select
    customer_id,
    customer_ref,
    company_name,
    created_at,
    nullif(lower(trim(primary_email)), '')                       as email_norm,
    nullif(lower(trim(email_domain)), '')                        as domain_norm,
    regexp_replace(
      lower(trim(company_name)),
      '[[:punct:]]|\s+(ltd|limited|plc|llp|inc|gmbh|co|company)\.?$',
      '', 'g'
    )                                                            as name_core
  from crm.customers
),

-- Stage 2: candidate duplicate PAIRS. a.customer_id < b.customer_id keeps each
-- pair once and removes self-pairs. A pair forms when the two records share an
-- exact email, OR share an email domain and have similar core names.
pairs as (
  select a.customer_id as id_a, b.customer_id as id_b
  from   normalised a
  join   normalised b
    on   a.customer_id < b.customer_id
   and ( (a.email_norm is not null and a.email_norm = b.email_norm)
      or (a.domain_norm is not null
          and a.domain_norm = b.domain_norm
          and similarity(a.name_core, b.name_core) >= 0.60) )
),

-- Stage 3: make the edges symmetric so reachability propagates both ways.
edges as (
  select id_a as src, id_b as dst from pairs
  union all
  select id_b as src, id_a as dst from pairs
),

-- Stage 4: connected components by transitive closure. Two customers belong to
-- the same identity even when they are only linked through a third
-- (A~B, B~C  =>  A, B and C are one customer). Every node reaches itself, so
-- singletons form their own one-member cluster. UNION (not UNION ALL)
-- deduplicates the working set and guarantees termination.
reach (node, reachable) as (
  select customer_id, customer_id from normalised
  union
  select r.node, e.dst
  from   reach r
  join   edges e on e.src = r.reachable
),

-- Stage 5: the cluster key is the smallest customer_id reachable from a node.
cluster_key as (
  select node as customer_id, min(reachable) as cluster_id
  from   reach
  group  by node
),

-- Stage 6: rank the members of each cluster to choose the survivor. The oldest
-- record wins (it usually carries the most history); customer_id breaks ties
-- so the result is deterministic. This is the ROW_NUMBER the crosswalk hangs on.
ranked as (
  select
    ck.customer_id,
    ck.cluster_id,
    n.customer_ref,
    n.company_name,
    n.email_norm,
    row_number() over (
      partition by ck.cluster_id
      order by n.created_at asc nulls last, ck.customer_id asc
    ) as rn
  from cluster_key ck
  join normalised  n using (customer_id)
)

select
  r.customer_id,
  r.customer_ref,
  r.company_name,
  -- the canonical id is the customer_id of the rn = 1 member of the cluster
  first_value(r.customer_id) over (
    partition by r.cluster_id order by r.rn
  ) as canonical_customer_id,
  (r.rn = 1) as is_canonical,
  count(*) over (partition by r.cluster_id) as cluster_size
from ranked r
order by r.cluster_id, r.rn;


-- ============================================================================
-- QUERY B — the reliability CHECK (assertion style)
-- Returns rows ONLY when duplicate identities exist. An empty result means no
-- customer resolves to more than one record. This is the query to schedule;
-- QUERY A is the reference crosswalk you build once you decide to merge.
-- ============================================================================
with recursive
normalised as (
  select
    customer_id, customer_ref, company_name, created_at,
    nullif(lower(trim(primary_email)), '')  as email_norm,
    nullif(lower(trim(email_domain)), '')   as domain_norm,
    regexp_replace(
      lower(trim(company_name)),
      '[[:punct:]]|\s+(ltd|limited|plc|llp|inc|gmbh|co|company)\.?$',
      '', 'g'
    )                                        as name_core
  from crm.customers
),
pairs as (
  select a.customer_id as id_a, b.customer_id as id_b
  from   normalised a
  join   normalised b
    on   a.customer_id < b.customer_id
   and ( (a.email_norm is not null and a.email_norm = b.email_norm)
      or (a.domain_norm is not null
          and a.domain_norm = b.domain_norm
          and similarity(a.name_core, b.name_core) >= 0.60) )
),
edges as (
  select id_a as src, id_b as dst from pairs
  union all
  select id_b as src, id_a as dst from pairs
),
reach (node, reachable) as (
  select customer_id, customer_id from normalised
  union
  select r.node, e.dst from reach r join edges e on e.src = r.reachable
),
cluster_key as (
  select node as customer_id, min(reachable) as cluster_id
  from reach group by node
)
select
  cluster_id,
  count(*)                                              as cluster_size,
  string_agg(distinct customer_ref, ', ' order by customer_ref) as customer_refs
from cluster_key
group by cluster_id
having count(*) > 1;   -- only clusters with more than one member are duplicates
