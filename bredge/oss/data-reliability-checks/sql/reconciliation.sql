-- ============================================================================
-- Bredge Data Reliability Checks — reconciliation
-- ----------------------------------------------------------------------------
-- Why this matters: two systems built for different jobs will report different
-- revenue, and both can be correct. Reconciliation does not force them to
-- match; it explains the gap by breaking it into named, understood parts. A
-- reconciliation is finished when every pound of difference has a reason, not
-- when the difference happens to be small.
--
-- We reconcile on four axes:
--   TIME       — the exact same half-open window for every source.
--   GRAIN      — customer-per-period, the only grain where the systems share a
--                key. CRM has no invoice key and billing has no order key, so
--                the customer (via the identity crosswalk) is where they meet.
--   IDENTITY   — billing accounts resolved to CRM customers through
--                crm_customer_ref; money that will not resolve is its own item.
--   DEFINITION — CRM books gross value at signature; billing shows net invoiced
--                (charges minus discounts and refunds). That difference is a
--                reconciling item, not an error.
--
-- Convention for the checks: a query returns rows only when something needs a
-- human. Sections 1, 3 and 4 are reports; Section 2 is the assertion check.
--
-- Line sign convention: billing.invoice_lines stores 'charge' as positive and
-- 'discount' / 'refund' as negative, so SUM(amount_gbp) is net revenue.
-- Board figures live in a small, manually maintained table:
--   board.reported_metrics(metric_name text, period_month date, reported_gbp numeric)
--
-- All data is synthetic. Illustrative window: June 2026.
-- ============================================================================


-- ============================================================================
-- SECTION 1 — the headline. Three sources, three numbers, one window.
-- This is the meeting in one row: CRM ~£4.5m, billing ~£4.3m, board ~£4.2m.
-- It states the disagreement precisely; Section 3 explains it.
-- ============================================================================
with params as (
  select date '2026-06-01' as period_start,
         date '2026-07-01' as period_end          -- half-open: [start, end)
)
select 'crm.signed_orders' as source,
       'booked at signature (gross)' as definition,
       coalesce(sum(o.amount_gbp), 0) as revenue_gbp
from   crm.orders o, params p
where  o.order_status = 'signed'
  and  o.ordered_at >= p.period_start
  and  o.ordered_at <  p.period_end

union all

select 'billing.invoice_lines',
       'net invoiced (charges less discounts and refunds)',
       coalesce(sum(l.amount_gbp), 0)
from   billing.invoice_lines l
join   billing.invoices i on i.invoice_id = l.invoice_id, params p
where  i.invoice_date >= p.period_start
  and  i.invoice_date <  p.period_end

union all

select 'board.reported',
       'figure quoted in the board pack',
       coalesce(sum(reported_gbp), 0)
from   board.reported_metrics, params p
where  metric_name  = 'revenue'
  and  period_month = p.period_start;


-- ============================================================================
-- SECTION 2 — the reliability CHECK: per-customer variance rows.
-- Reconciles CRM against billing at the customer/period grain, matched on
-- identity, and returns only the customers whose gap is material. An empty
-- result means every customer reconciles within tolerance.
-- ============================================================================
with params as (
  select date '2026-06-01' as period_start,
         date '2026-07-01' as period_end,
         numeric '1000'    as materiality_gbp        -- ignore sub-£1,000 noise
),
crm_rev as (
  select o.customer_id, sum(o.amount_gbp) as crm_signed_gbp
  from   crm.orders o, params p
  where  o.order_status = 'signed'
    and  o.ordered_at >= p.period_start
    and  o.ordered_at <  p.period_end
  group  by o.customer_id
),
billing_rev as (
  -- billing resolved to a CRM customer through the soft link
  select c.customer_id, sum(l.amount_gbp) as billing_net_gbp
  from   billing.invoice_lines l
  join   billing.invoices i on i.invoice_id = l.invoice_id
  join   billing.accounts  a on a.account_id = i.account_id
  join   crm.customers     c on c.customer_ref = a.crm_customer_ref, params p
  where  i.invoice_date >= p.period_start
    and  i.invoice_date <  p.period_end
  group  by c.customer_id
)
select
  coalesce(cr.customer_id, br.customer_id)                        as customer_id,
  coalesce(cr.crm_signed_gbp, 0)                                  as crm_signed_gbp,
  coalesce(br.billing_net_gbp, 0)                                 as billing_net_gbp,
  coalesce(cr.crm_signed_gbp, 0) - coalesce(br.billing_net_gbp, 0) as variance_gbp,
  case
    when br.customer_id is null then 'in CRM only (timing or not yet invoiced)'
    when cr.customer_id is null then 'in billing only (identity or scope)'
    else 'present in both (definition, duplication or timing)'
  end                                                             as likely_class
from crm_rev cr
full join billing_rev br using (customer_id)
cross join params p
where abs(coalesce(cr.crm_signed_gbp, 0) - coalesce(br.billing_net_gbp, 0)) >= p.materiality_gbp
order by abs(coalesce(cr.crm_signed_gbp, 0) - coalesce(br.billing_net_gbp, 0)) desc;


-- ============================================================================
-- SECTION 3 — the reconciliation statement (the bridge).
-- Decomposes the total CRM-to-billing gap into named reconciling items, each
-- computed from records, and ends with a residual. The residual is the part of
-- the gap you have NOT yet explained: keep naming items until it reaches zero.
-- gap_contribution_gbp is signed so it reads as "makes CRM higher than billing".
-- ============================================================================
with params as (
  select date '2026-06-01' as period_start,
         date '2026-07-01' as period_end
),
crm_rev as (
  select o.customer_id, sum(o.amount_gbp) as crm_signed_gbp
  from   crm.orders o, params p
  where  o.order_status = 'signed'
    and  o.ordered_at >= p.period_start
    and  o.ordered_at <  p.period_end
  group  by o.customer_id
),
billing_rev as (
  select c.customer_id, sum(l.amount_gbp) as billing_net_gbp
  from   billing.invoice_lines l
  join   billing.invoices i on i.invoice_id = l.invoice_id
  join   billing.accounts  a on a.account_id = i.account_id
  join   crm.customers     c on c.customer_ref = a.crm_customer_ref, params p
  where  i.invoice_date >= p.period_start
    and  i.invoice_date <  p.period_end
  group  by c.customer_id
),
totals as (
  select
    (select coalesce(sum(crm_signed_gbp), 0)  from crm_rev)      as crm_total,
    (select coalesce(sum(l.amount_gbp), 0)
       from billing.invoice_lines l
       join billing.invoices i on i.invoice_id = l.invoice_id, params p
      where i.invoice_date >= p.period_start
        and i.invoice_date <  p.period_end)                      as billing_total
),
-- DEFINITION: discounts and refunds billing nets off but CRM never booked.
definition_item as (
  select coalesce(-sum(l.amount_gbp), 0) as gbp
  from   billing.invoice_lines l
  join   billing.invoices i on i.invoice_id = l.invoice_id, params p
  where  i.invoice_date >= p.period_start
    and  i.invoice_date <  p.period_end
    and  l.line_kind in ('discount', 'refund')     -- negative amounts; negate to positive
),
-- TIMING: signed in the period, not yet invoiced (customer absent from billing).
timing_item as (
  select coalesce(sum(cr.crm_signed_gbp), 0) as gbp
  from   crm_rev cr
  left join billing_rev br using (customer_id)
  where  br.customer_id is null
),
-- IDENTITY: billed revenue that does not resolve to any CRM customer.
identity_item as (
  select coalesce(sum(l.amount_gbp), 0) as gbp
  from   billing.invoice_lines l
  join   billing.invoices i on i.invoice_id = l.invoice_id
  join   billing.accounts  a on a.account_id = i.account_id
  left join crm.customers  c on c.customer_ref = a.crm_customer_ref, params p
  where  i.invoice_date >= p.period_start
    and  i.invoice_date <  p.period_end
    and  c.customer_ref is null
),
-- DUPLICATION: identical invoice lines counted more than once, inflating billing.
duplication_item as (
  select coalesce(sum((cnt - 1) * amount_gbp), 0) as gbp
  from (
    select l.invoice_id, l.amount_gbp, l.line_kind, count(*) as cnt
    from   billing.invoice_lines l
    join   billing.invoices i on i.invoice_id = l.invoice_id, params p
    where  i.invoice_date >= p.period_start
      and  i.invoice_date <  p.period_end
    group  by l.invoice_id, l.amount_gbp, l.line_kind
    having count(*) > 1
  ) d
)
select item.line_item, item.reconciling_class, item.gap_contribution_gbp
from (
  select 1 as ord, 'CRM signed total (opening)'                    as line_item,
         'definition'  as reconciling_class,
         (select crm_total from totals)                            as gap_contribution_gbp
  union all
  select 2, 'less: discounts & refunds billing nets off', 'definition',
         (select gbp from definition_item)
  union all
  select 3, 'less: signed but not yet invoiced this period', 'timing',
         (select gbp from timing_item)
  union all
  select 4, 'add: billed revenue not linked to any CRM customer', 'identity',
         -(select gbp from identity_item)
  union all
  select 5, 'less: duplicate invoice lines inflating billing', 'duplication',
         -(select gbp from duplication_item)
  union all
  select 6, 'residual (still unexplained — reconcile until ~0)', 'residual',
         (select crm_total - billing_total from totals)
         - (select gbp from definition_item)
         - (select gbp from timing_item)
         + (select gbp from identity_item)
         + (select gbp from duplication_item)
  union all
  select 7, 'billing net total (closing)', 'definition',
         (select billing_total from totals)
) item
order by item.ord;


-- ============================================================================
-- SECTION 4 — board figure variance.
-- The board pack is a fourth source, keyed by hand. Compare it to both systems
-- so the number quoted in the room can be traced, not just trusted.
-- ============================================================================
with params as (
  select date '2026-06-01' as period_start,
         date '2026-07-01' as period_end
),
sources as (
  select
    (select coalesce(sum(o.amount_gbp), 0)
       from crm.orders o, params p
      where o.order_status = 'signed'
        and o.ordered_at >= p.period_start
        and o.ordered_at <  p.period_end)                         as crm_gbp,
    (select coalesce(sum(l.amount_gbp), 0)
       from billing.invoice_lines l
       join billing.invoices i on i.invoice_id = l.invoice_id, params p
      where i.invoice_date >= p.period_start
        and i.invoice_date <  p.period_end)                       as billing_gbp,
    (select coalesce(sum(reported_gbp), 0)
       from board.reported_metrics, params p
      where metric_name = 'revenue'
        and period_month = p.period_start)                        as board_gbp
)
select board_gbp,
       crm_gbp,
       billing_gbp,
       board_gbp - crm_gbp     as board_vs_crm_gbp,
       board_gbp - billing_gbp as board_vs_billing_gbp
from   sources;
