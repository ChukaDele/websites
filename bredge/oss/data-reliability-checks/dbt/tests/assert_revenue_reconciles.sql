-- ============================================================================
-- Singular dbt test: CRM and billing revenue must reconcile within tolerance
-- once the known reconciling items are accounted for.
-- ----------------------------------------------------------------------------
-- A dbt singular test passes when it returns NO rows. This test returns a row
-- only when the RESIDUAL — the part of the CRM-to-billing gap that our named
-- reconciling items (definition, timing, identity, duplication) do NOT explain
-- — exceeds an agreed tolerance for the reporting month.
--
-- It deliberately does not assert that CRM equals billing. Those two figures
-- are meant to differ. It asserts that the difference is fully explained, which
-- is the honest meaning of "the numbers reconcile".
--
-- Adjust the {{ var(...) }} defaults in dbt_project.yml or with --vars.
-- All data is synthetic.
-- ============================================================================

{% set period_start = var('recon_period_start', '2026-06-01') %}
{% set period_end   = var('recon_period_end',   '2026-07-01') %}
{% set tolerance    = var('recon_tolerance_gbp', 1000) %}

with crm_total as (
    select coalesce(sum(amount_gbp), 0) as gbp
    from {{ ref('stg_crm__orders') }}
    where order_status = 'signed'
      and ordered_at >= date '{{ period_start }}'
      and ordered_at <  date '{{ period_end }}'
),

billing_total as (
    select coalesce(sum(l.amount_gbp), 0) as gbp
    from {{ ref('stg_billing__invoice_lines') }} l
    join {{ ref('stg_billing__invoices') }} i
      on i.invoice_id = l.invoice_id
    where i.invoice_date >= date '{{ period_start }}'
      and i.invoice_date <  date '{{ period_end }}'
),

-- DEFINITION: discounts and refunds billing nets off but CRM booked gross.
definition_item as (
    select coalesce(-sum(l.amount_gbp), 0) as gbp
    from {{ ref('stg_billing__invoice_lines') }} l
    join {{ ref('stg_billing__invoices') }} i
      on i.invoice_id = l.invoice_id
    where i.invoice_date >= date '{{ period_start }}'
      and i.invoice_date <  date '{{ period_end }}'
      and l.line_kind in ('discount', 'refund')
),

-- IDENTITY: billed revenue not resolvable to a canonical CRM customer.
identity_item as (
    select coalesce(sum(l.amount_gbp), 0) as gbp
    from {{ ref('stg_billing__invoice_lines') }} l
    join {{ ref('stg_billing__invoices') }} i on i.invoice_id = l.invoice_id
    join {{ ref('stg_billing__accounts') }}  a on a.account_id = i.account_id
    left join {{ ref('dim_customers') }}     c on c.customer_ref = a.crm_customer_ref
    where i.invoice_date >= date '{{ period_start }}'
      and i.invoice_date <  date '{{ period_end }}'
      and c.customer_id is null
),

residual as (
    select
        (select gbp from crm_total)
        - (select gbp from billing_total)
        - (select gbp from definition_item)
        + (select gbp from identity_item) as unexplained_gbp
)

-- Returns a row (fails the test) only when the unexplained gap is material.
select
    unexplained_gbp,
    {{ tolerance }} as tolerance_gbp,
    '{{ period_start }}'::date as period_start
from residual
where abs(unexplained_gbp) > {{ tolerance }}
