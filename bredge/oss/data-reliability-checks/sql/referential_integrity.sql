-- ============================================================================
-- Bredge Data Reliability Checks — referential integrity
-- ----------------------------------------------------------------------------
-- Convention: every query returns rows ONLY when the check fails.
--             An empty result means the check passed.
--
-- Why this matters: an orphaned child row — an order whose customer does not
-- exist, an invoice line whose invoice does not exist — drops silently out of
-- any INNER JOIN. The query still runs, the chart still renders, and the total
-- is quietly understated. Nothing errors, so nothing warns you. These checks
-- make the orphans visible.
--
-- The interesting case here is the CRM-to-billing link. It is a soft text
-- reference (billing.accounts.crm_customer_ref), not an enforced foreign key,
-- so the database will never complain when it breaks. That is exactly the join
-- that decides whether "one customer" means the same thing in both systems.
--
-- All data is synthetic.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 1. Every order must reference a customer that exists.
--    An anti-join (LEFT JOIN ... WHERE parent IS NULL) is the clearest way to
--    express "child rows with no matching parent" and lets the planner use the
--    index on the parent key.
-- ----------------------------------------------------------------------------
select o.order_id,
       o.order_ref,
       o.customer_id as missing_customer_id
from   crm.orders o
left join crm.customers c on c.customer_id = o.customer_id
where  c.customer_id is null;


-- ----------------------------------------------------------------------------
-- 2. Every invoice must reference an account that exists.
-- ----------------------------------------------------------------------------
select i.invoice_id,
       i.invoice_ref,
       i.account_id as missing_account_id
from   billing.invoices i
left join billing.accounts a on a.account_id = i.account_id
where  a.account_id is null;


-- ----------------------------------------------------------------------------
-- 3. Every invoice line must reference an invoice that exists.
--    Orphaned lines are a common consequence of loading child tables before
--    their parents, or of a partial re-load that dropped the header rows.
-- ----------------------------------------------------------------------------
select l.invoice_line_id,
       l.invoice_id as missing_invoice_id,
       l.amount_gbp
from   billing.invoice_lines l
left join billing.invoices i on i.invoice_id = l.invoice_id
where  i.invoice_id is null;


-- ----------------------------------------------------------------------------
-- 4. The soft cross-system link must resolve.
--    billing.accounts.crm_customer_ref is meant to point at
--    crm.customers.customer_ref, but nothing enforces it. A non-null value that
--    matches no CRM customer is a broken link — usually a typo, a deleted CRM
--    record, or a customer that only ever existed in billing. We keep null
--    apart from wrong: a null link is "not yet matched", a non-matching value
--    is "matched to nothing", and they have different owners and fixes.
-- ----------------------------------------------------------------------------
select a.account_id,
       a.account_ref,
       a.crm_customer_ref as unresolved_crm_ref,
       case
         when a.crm_customer_ref is null then 'unlinked'   -- no attempt to link
         else 'broken_link'                                -- links to nothing
       end as link_state
from   billing.accounts a
left join crm.customers c on c.customer_ref = a.crm_customer_ref
where  c.customer_ref is null;


-- ----------------------------------------------------------------------------
-- 5. No invoiced money should be stranded from the CRM.
--    A reliability question with commercial teeth: is there billed revenue that
--    cannot be traced back to a CRM customer at all? Any row returned is money
--    the CRM-based revenue view will never see. This is the check that most
--    often explains a billing total that runs higher than the CRM total.
-- ----------------------------------------------------------------------------
select a.account_id,
       a.account_ref,
       sum(l.amount_gbp) as untraceable_gbp
from   billing.accounts a
join   billing.invoices i      on i.account_id = a.account_id
join   billing.invoice_lines l on l.invoice_id = i.invoice_id
left join crm.customers c      on c.customer_ref = a.crm_customer_ref
where  c.customer_ref is null
group  by a.account_id, a.account_ref
having sum(l.amount_gbp) <> 0;
