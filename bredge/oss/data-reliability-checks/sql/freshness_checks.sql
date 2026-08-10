-- ============================================================================
-- Bredge Data Reliability Checks — freshness
-- ----------------------------------------------------------------------------
-- Convention: every query returns rows ONLY when the check fails.
--             An empty result means the check passed.
--
-- Why this matters: a table can hold entirely correct values and still be
-- stale. Freshness is the age of the newest record measured against an agreed
-- limit — and the limit is set by the decision the data feeds, not by the
-- clock. A monthly board figure sourced from a table that refreshes weekly is
-- fresh; a live operational figure that is a day old may be badly stale. State
-- the tolerance per asset, then let the check hold you to it.
--
-- We read loaded_at (when the row landed in the warehouse) rather than an
-- event timestamp such as ordered_at, because freshness is a property of the
-- pipeline, not of the business event. A quiet trading day is not a stale
-- table.
--
-- All data is synthetic.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 1. Per-table freshness against an agreed tolerance.
--    Each row states its own limit. The VALUES list is the one place to edit
--    when a service-level expectation changes; the logic never moves. A table
--    fails when the newest row is older than now() minus its tolerance.
-- ----------------------------------------------------------------------------
with expectations (table_name, max_lag) as (
  values
    ('crm.customers',         interval '24 hours'),
    ('crm.orders',            interval '6 hours'),
    ('billing.accounts',      interval '24 hours'),
    ('billing.invoices',      interval '12 hours'),
    ('billing.invoice_lines', interval '12 hours')
),
observed (table_name, last_loaded_at) as (
  select 'crm.customers',         max(loaded_at) from crm.customers
  union all select 'crm.orders',            max(loaded_at) from crm.orders
  union all select 'billing.accounts',      max(loaded_at) from billing.accounts
  union all select 'billing.invoices',      max(loaded_at) from billing.invoices
  union all select 'billing.invoice_lines', max(loaded_at) from billing.invoice_lines
)
select e.table_name,
       o.last_loaded_at,
       e.max_lag,
       now() - o.last_loaded_at as actual_lag
from   expectations e
join   observed     o using (table_name)
where  o.last_loaded_at is null                       -- never loaded at all
   or  o.last_loaded_at < now() - e.max_lag;          -- older than allowed


-- ----------------------------------------------------------------------------
-- 2. Freshness of the *latest partition*, not just the table.
--    A table can look fresh in aggregate while the most recent day is missing:
--    old rows keep max(loaded_at) low is not the risk — the risk is that
--    today's slice never arrived. Here we assert that orders exist for the
--    current day once the daily load should have completed. Returns a row when
--    today has no data after the expected load time.
-- ----------------------------------------------------------------------------
select current_date as expected_day,
       count(*)     as rows_today
from   crm.orders
where  ordered_at >= current_date
having count(*) = 0;


-- ----------------------------------------------------------------------------
-- 3. Cross-source freshness skew.
--    Two sources that feed the same number should be measured at close to the
--    same moment. When CRM refreshed an hour ago and billing refreshed
--    yesterday, any comparison between them will disagree for entirely correct
--    reasons — a timing gap, not a logic gap. This check fails when the two
--    load times are more than a chosen window apart, so you rule timing out
--    before suspecting the logic.
-- ----------------------------------------------------------------------------
with loads as (
  select (select max(loaded_at) from crm.orders)            as crm_loaded_at,
         (select max(loaded_at) from billing.invoice_lines)  as billing_loaded_at
)
select crm_loaded_at,
       billing_loaded_at,
       abs(extract(epoch from crm_loaded_at - billing_loaded_at)) / 3600.0 as skew_hours
from   loads
where  abs(extract(epoch from crm_loaded_at - billing_loaded_at)) > 6 * 3600;  -- > 6 hours apart
