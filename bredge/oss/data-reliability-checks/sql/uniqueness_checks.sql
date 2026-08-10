-- ============================================================================
-- Bredge Data Reliability Checks — uniqueness
-- ----------------------------------------------------------------------------
-- Convention: every query returns rows ONLY when the check fails.
--             An empty result means the check passed.
--
-- Why this matters: a key that is meant to identify one real-world thing, but
-- appears more than once, silently multiplies whatever you count or join
-- through it. A duplicated order_ref inflates revenue; a duplicated customer
-- key fans out every per-customer metric. We check the *business* key, not the
-- system-generated surrogate, because a surrogate is unique by construction and
-- proves nothing about the data.
--
-- All data is synthetic.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 1. Surrogate primary keys must be unique.
--    These are the keys the warehouse relies on for joins. If the load process
--    is healthy this can never fail, so a failure points at a double load or a
--    broken merge rather than at the source.
-- ----------------------------------------------------------------------------
select 'crm.customers' as table_name, customer_id::text as key_value, count(*) as row_count
from   crm.customers
group  by customer_id
having count(*) > 1

union all

select 'crm.orders', order_id::text, count(*)
from   crm.orders
group  by order_id
having count(*) > 1

union all

select 'billing.invoices', invoice_id::text, count(*)
from   billing.invoices
group  by invoice_id
having count(*) > 1

union all

select 'billing.invoice_lines', invoice_line_id::text, count(*)
from   billing.invoice_lines
group  by invoice_line_id
having count(*) > 1;


-- ----------------------------------------------------------------------------
-- 2. Business keys must be unique.
--    These are the identifiers a human uses to mean "this specific order" or
--    "this specific customer". This is the check that actually catches
--    accidental duplication, because business keys travel across systems and
--    re-imports whereas surrogates are regenerated.
-- ----------------------------------------------------------------------------
select 'crm.customers' as table_name, customer_ref as key_value, count(*) as row_count
from   crm.customers
where  customer_ref is not null
group  by customer_ref
having count(*) > 1

union all

select 'crm.orders', order_ref, count(*)
from   crm.orders
where  order_ref is not null
group  by order_ref
having count(*) > 1

union all

select 'billing.invoices', invoice_ref, count(*)
from   billing.invoices
where  invoice_ref is not null
group  by invoice_ref
having count(*) > 1;


-- ----------------------------------------------------------------------------
-- 3. A business key should not be null.
--    A null business key is a different failure from a duplicate one: the row
--    exists but cannot be identified, so it can neither be deduplicated nor
--    matched to another system. We surface it separately so the cause is clear.
-- ----------------------------------------------------------------------------
select 'crm.customers'    as table_name, 'customer_ref' as key_column, customer_id::text as surrogate_id
from   crm.customers
where  customer_ref is null

union all

select 'crm.orders', 'order_ref', order_id::text
from   crm.orders
where  order_ref is null

union all

select 'billing.invoices', 'invoice_ref', invoice_id::text
from   billing.invoices
where  invoice_ref is null;


-- ----------------------------------------------------------------------------
-- 4. Composite / conditional uniqueness.
--    A single customer should hold at most one 'signed' order per order_ref in
--    a given period. This catches the subtle case where the surrogate and the
--    business key are both unique, but the *combination* that the business
--    treats as unique has been violated (for example, the same deal re-booked
--    under a new order_id after a correction). Adjust the grain to your rule.
-- ----------------------------------------------------------------------------
select customer_id,
       date_trunc('month', ordered_at) as order_month,
       order_ref,
       count(*) as signed_rows
from   crm.orders
where  order_status = 'signed'
group  by customer_id, date_trunc('month', ordered_at), order_ref
having count(*) > 1;
