"use client";
import { useState } from "react";
import { useStoredState } from "./useStoredState";
import { ToolActions, sheetSafe } from "./ToolActions";

/* KPI dictionary: starter packs of standard definitions the reader edits,
 * a completeness check per KPI, and exports for Excel, Sheets and CSV. */

type Kpi = { id: string; name: string; definition: string; formula: string; grain: string; source: string; owner: string; refresh: string; rules: string; currency: string };
const FIELDS: { key: keyof Omit<Kpi, "id">; label: string; hint: string; required: boolean; long?: boolean }[] = [
  { key: "name", label: "KPI", hint: "Short name used in every report", required: true },
  { key: "definition", label: "Business definition", hint: "One sentence anyone in the business would agree with", required: true, long: true },
  { key: "formula", label: "Formula", hint: "Exactly how it is calculated", required: true, long: true },
  { key: "grain", label: "Grain and period", hint: "Per what, over what period", required: true },
  { key: "source", label: "Source system", hint: "Where the inputs come from", required: true },
  { key: "owner", label: "Owner", hint: "Who decides the definition and answers for the number", required: true },
  { key: "refresh", label: "Refresh", hint: "How often it updates, and the cut-off", required: false },
  { key: "rules", label: "Includes and excludes", hint: "Edge cases written down", required: false, long: true },
  { key: "currency", label: "Currency treatment", hint: "Functional currency, rate source and date", required: false, long: true },
];

const k = (id: string, name: string, definition: string, formula: string, grain: string, source: string, refresh: string, rules: string, currency: string): Kpi =>
  ({ id, name, definition, formula, grain, source, owner: "", refresh, rules, currency });

const PACKS: Record<string, { label: string; for: string; kpis: Kpi[] }> = {
  sb: { label: "Small business management pack", for: "Owners, MDs and finance managers", kpis: [
    k("sb1", "Revenue", "Income from sales recognised in the period.", "Sum of invoiced sales net of VAT or sales tax, credit notes and discounts.", "Company, month; also year to date", "Accounting system (e.g. Xero, QuickBooks, Sage)", "Monthly, at close", "Excludes grants and other income. State whether revenue is on an invoice or cash basis.", "Functional currency; convert foreign sales at the invoice-date rate."),
    k("sb2", "Gross margin %", "Share of revenue left after the direct cost of delivering it.", "(Revenue − cost of sales) ÷ revenue.", "Company and product line, month", "Accounting system", "Monthly, at close", "Write down what sits in cost of sales (materials, freight, direct labour, subcontractors).", "Calculated in functional currency."),
    k("sb3", "Overheads as % of revenue", "How much of revenue goes on running costs that do not scale with sales.", "Operating expenses excluding cost of sales ÷ revenue.", "Company, month and trailing 12 months", "Accounting system", "Monthly", "List which cost codes are overheads, and keep the list stable.", "Functional currency."),
    k("sb4", "Cash and headroom", "Cash available now, plus undrawn facilities.", "Bank balances + undrawn overdraft or credit facility.", "Company, month end", "Bank feeds, facility letters", "Weekly", "Exclude money held for others, such as client deposits.", "By currency held, then a total at the closing rate."),
    k("sb5", "Debtor days", "How long customers take to pay, on average.", "Trade receivables ÷ revenue for the period × days in the period.", "Company, month end", "Accounting system", "Monthly", "Use revenue including VAT or sales tax if receivables include it, or exclude both.", "Same currency basis for receivables and revenue."),
    k("sb6", "Customer concentration", "Share of revenue from the largest customers.", "Revenue from the top 5 customers ÷ total revenue.", "Company, trailing 12 months", "Accounting system or CRM", "Monthly", "Group related accounts under one parent before ranking.", "Functional currency."),
    k("sb7", "Revenue per employee", "Revenue generated per full-time equivalent.", "Trailing 12-month revenue ÷ average FTE over the same months.", "Company, month", "Accounting system, payroll", "Quarterly", "State whether contractors are counted.", "Functional currency."),
  ] },
  pe: { label: "Investor and PE portfolio pack", for: "Investors and portfolio company CFOs", kpis: [
    k("pe1", "Revenue", "Income from the sale of goods and services recognised in the period under the company's accounting policy.", "Sum of recognised revenue, net of VAT, returns, rebates and discounts.", "Company, month; also year to date", "General ledger", "Monthly, at close", "Excludes other income and intercompany sales. State whether rebates are netted.", "Functional currency; investor view at a disclosed rate."),
    k("pe2", "Gross margin %", "Share of revenue left after the direct cost of delivering it.", "(Revenue − cost of sales) ÷ revenue.", "Company, month", "General ledger", "Monthly, at close", "Write down what sits in cost of sales (freight, direct labour, inventory write-downs).", "Calculated in functional currency."),
    k("pe3", "EBITDA", "Operating profit before depreciation and amortisation.", "Operating profit + depreciation + amortisation.", "Company, month and last twelve months", "General ledger", "Monthly, at close", "Report adjusted EBITDA separately, listing each adjustment with an amount.", "Functional currency; investor view at average rate for the period."),
    k("pe4", "Cash balance", "Cash and cash equivalents at period end.", "Sum of bank and cash balances at the period-end date.", "Company, month end, by currency", "Bank reconciliations", "Monthly", "Show restricted cash separately.", "Report by currency held, then a total at the closing rate."),
    k("pe5", "Net debt", "Borrowings less cash.", "Total borrowings (incl. leases if your agreement says so) − cash and equivalents.", "Company, month end", "General ledger, loan schedules", "Monthly", "State whether leases and shareholder loans are included, per the facility agreement.", "Foreign-currency debt revalued at the closing rate."),
    k("pe6", "Debtor days (DSO)", "How long customers take to pay, on average.", "Trade receivables ÷ revenue for the period × days in the period.", "Company, month end", "AR ledger, general ledger", "Monthly", "Use revenue including VAT if receivables include VAT, or exclude both.", "Same currency basis for receivables and revenue."),
    k("pe7", "Headcount (FTE)", "People employed, in full-time equivalents.", "Sum of contracted hours ÷ standard full-time hours, at period end.", "Company, month end", "HR or payroll system", "Monthly", "State whether contractors and outsourced staff are included.", "Not applicable."),
    k("pe8", "Revenue growth: reported and constant currency", "How revenue changed against the same period last year, with and without exchange-rate effects.", "Reported: this ÷ last − 1. Constant currency: both periods translated at the same rate, then this ÷ last − 1.", "Company, month and year to date", "General ledger, rate source", "Monthly", "Compare the same months; state whether acquisitions are included (reported) or excluded (like for like).", "Name the rate source and rate date for the constant-currency view."),
  ] },
  saas: { label: "SaaS and subscription", for: "Founders, RevOps and finance at startups", kpis: [
    k("sa1", "MRR", "Recurring revenue normalised to one month, for active subscriptions at a point in time.", "Sum over active subscriptions of recurring price ÷ billing interval in months, after discounts.", "Account, month end", "Billing system (e.g. Stripe)", "Daily", "Excludes one-off fees, usage overages unless contracted, taxes and trials at zero.", "Convert at a fixed or month-end rate; say which."),
    k("sa2", "ARR", "Annualised recurring revenue.", "MRR × 12.", "Account, month end", "Derived from MRR", "Daily", "Do not mix contract value (bookings) with ARR.", "As MRR."),
    k("sa3", "Net revenue retention", "Revenue kept and grown from an existing customer group over twelve months.", "(Starting MRR + expansion − contraction − churned MRR) ÷ starting MRR, for customers active at the start.", "Cohort of customers, trailing 12 months", "Billing system", "Monthly", "New customers acquired in the period are excluded.", "Constant rate across the period, or currency effects will look like expansion."),
    k("sa4", "Gross revenue retention", "Revenue kept from an existing customer group, ignoring expansion.", "(Starting MRR − contraction − churned MRR) ÷ starting MRR.", "Cohort of customers, trailing 12 months", "Billing system", "Monthly", "Capped at 100% by definition.", "As net revenue retention."),
    k("sa5", "Logo churn rate", "Share of customers lost in the period.", "Customers lost in the period ÷ customers at the start of the period.", "Customers, month", "Billing system or CRM", "Monthly", "Define lost: cancelled, not renewed, or unpaid after a set number of days.", "Not applicable."),
    k("sa6", "CAC payback (months)", "How many months of gross margin it takes to recover the cost of acquiring a customer.", "Sales and marketing cost to acquire ÷ (new MRR × gross margin %).", "Cohort acquired, quarter", "General ledger, billing system", "Quarterly", "State which costs are in sales and marketing, and the lag used.", "Same currency for costs and MRR."),
    k("sa7", "Activation rate", "Share of new sign-ups who reach the product moment that predicts retention.", "Sign-ups reaching the activation event within N days ÷ sign-ups.", "Sign-up cohort, week", "Product analytics (e.g. Amplitude)", "Daily", "Write the activation event and N down; change them only with a new version.", "Not applicable."),
  ] },
  dist: { label: "Distribution and wholesale", for: "Finance and commercial leads at distributors, wholesalers and manufacturers", kpis: [
    k("di1", "Net revenue", "Invoiced sales net of VAT, returns, trade discounts and rebates.", "Gross invoiced value − VAT − credit notes − discounts and rebates.", "Customer, SKU, branch, month", "ERP or accounting system (e.g. NetSuite, Sage, Xero)", "Daily, final at close", "Write down how customer rebates and free goods are treated.", "Functional currency; group view at a disclosed rate."),
    k("di2", "Customer concentration", "Share of revenue from the largest customers.", "Net revenue from the top 10 customers ÷ total net revenue.", "Company, month and trailing 12 months", "ERP sales ledger", "Monthly", "Group related accounts under one parent customer before ranking.", "Functional currency."),
    k("di3", "Price and volume effect", "How much of revenue growth came from price and how much from volume.", "Price effect: (this year's price − last year's) × this year's volume. Volume effect: (this year's volume − last year's) × last year's price.", "SKU, month", "ERP sales lines", "Monthly", "Mix effects need SKU-level data; report them separately if material.", "Functional currency."),
    k("di4", "Gross margin by channel", "Margin after cost of goods, split by channel (wholesale, retail, direct, online).", "(Net revenue − cost of goods sold) ÷ net revenue, per channel.", "Channel, month", "ERP", "Monthly", "Allocate freight consistently; write the rule down.", "Imported cost at the rate on the goods-received date, per policy."),
    k("di5", "Stock cover (days)", "How many days of sales the current stock would cover.", "Closing stock quantity ÷ average daily sales quantity over the last N days.", "SKU, warehouse, week", "ERP and warehouse system", "Weekly", "Exclude damaged and expired stock.", "Not applicable (quantities)."),
    k("di6", "Debtor days by customer", "How long each customer takes to pay.", "Receivables from the customer ÷ their revenue in the period × days in the period.", "Customer, month end", "AR ledger", "Monthly", "Same VAT basis for receivables and revenue.", "Functional currency."),
    k("di7", "Fill rate", "Share of ordered quantity delivered.", "Quantity delivered ÷ quantity ordered.", "Order line, week", "ERP orders and deliveries", "Weekly", "Define whether substitutions count, and the cut-off for late deliveries.", "Not applicable."),
  ] },
  ops: { label: "Operations and logistics", for: "COOs and operations leads", kpis: [
    k("op1", "OTIF (on time, in full)", "Share of orders delivered by the promised date with the full quantity.", "Orders delivered on time and in full ÷ orders delivered.", "Order, week", "Order management and delivery records", "Daily", "Write down the on-time window and whether in full is judged per line or per order.", "Not applicable."),
    k("op2", "Inventory accuracy", "Share of counted locations where the system matches the physical count.", "Locations (or SKUs) where counted quantity = system quantity, within tolerance ÷ locations counted.", "Warehouse, count cycle", "Warehouse system, cycle counts", "Each count", "State the tolerance and whether it is by quantity or value.", "Not applicable."),
    k("op3", "Order cycle time", "Time from order received to delivered.", "Median of (delivery timestamp − order timestamp).", "Order, week", "Order management system", "Daily", "Use the median, and state working or calendar hours.", "Not applicable."),
    k("op4", "Fleet utilisation", "Share of available vehicle time spent on deliveries.", "Hours on delivery ÷ available vehicle hours.", "Vehicle, week", "Telematics or trip logs", "Weekly", "Define available: excludes planned maintenance.", "Not applicable."),
    k("op5", "Cost per delivery", "Total delivery cost divided by deliveries made.", "(Fuel + driver cost + maintenance + third-party haulage) ÷ deliveries.", "Route or region, month", "General ledger, trip logs", "Monthly", "Write down which costs are included.", "Functional currency; fuel at actual price paid."),
    k("op6", "Patient or customer wait time", "Time from arrival or request to service start.", "Median of (service start − arrival).", "Site, day", "Booking or queue system", "Daily", "State how no-shows and walk-ins are handled.", "Not applicable."),
  ] },
};

type State = { kpis: Kpi[]; pack: string };
const INITIAL: State = { kpis: PACKS.sb.kpis, pack: "sb" };

const missing = (x: Kpi) => FIELDS.filter((f) => f.required && !x[f.key].trim()).map((f) => f.label);
const csvCell = (v: string) => `"${sheetSafe(v).replace(/"/g, '""')}"`;

export function KpiDictionary() {
  const [s, set, reset] = useStoredState<State>("bredge:rs:kpi-dictionary:v2", INITIAL);
  const [open, setOpen] = useState<string | null>(null);
  const kpis = s.kpis ?? [];
  const complete = kpis.filter((x) => missing(x).length === 0).length;
  const owners = kpis.filter((x) => x.owner.trim()).length;

  const setKpi = (id: string, patch: Partial<Kpi>) => set((p) => ({ ...p, kpis: (p.kpis ?? []).map((x) => (x.id === id ? { ...x, ...patch } : x)) }));
  const loadPack = (key: string, mode: "replace" | "add") => set((p) => {
    const incoming = PACKS[key].kpis;
    const existing = new Set((p.kpis ?? []).map((x) => x.id));
    return { pack: key, kpis: mode === "replace" ? incoming : [...(p.kpis ?? []), ...incoming.filter((x) => !existing.has(x.id))] };
  });
  const addKpi = () => {
    const id = `u${Date.now().toString(36)}`;
    set((p) => ({ ...p, kpis: [...(p.kpis ?? []), { id, name: "", definition: "", formula: "", grain: "", source: "", owner: "", refresh: "", rules: "", currency: "" }] }));
    setOpen(id);
  };
  const remove = (id: string) => set((p) => ({ ...p, kpis: (p.kpis ?? []).filter((x) => x.id !== id) }));

  const text = () => ["KPI dictionary", ...kpis.flatMap((x, i) => [
    "",
    `${i + 1}. ${x.name || "(unnamed KPI)"}`,
    ...FIELDS.slice(1).map((f) => `   ${f.label}: ${x[f.key] || "to be agreed"}`),
  ])].join("\n");
  const rowsFor = (cell: (v: string) => string, sep: string) =>
    [FIELDS.map((f) => cell(f.label)).join(sep), ...kpis.map((x) => FIELDS.map((f) => cell(x[f.key])).join(sep))].join("\n");
  const tsv = () => rowsFor((v) => sheetSafe(v.replace(/[\t\r\n]/g, " ")), "\t");
  const csv = () => "﻿" + rowsFor(csvCell, ",");

  return (
    <div className="rs-toolwrap">
      <section id="dictionary" className="rs-card">
        <header className="rs-card-head">
          <p className="rs-label">Start from a pack</p>
          <div className="rs-packs">
            {Object.entries(PACKS).map(([key, p]) => (
              <div key={key} className={`rs-pack${s.pack === key ? " is-on" : ""}`}>
                <b>{p.label}</b><small>{p.for} · {p.kpis.length} KPIs</small>
                <div>
                  <button type="button" className="rs-chip" onClick={() => { if (!kpis.length || window.confirm("Replace your current dictionary with this pack?")) loadPack(key, "replace"); }}>Use this pack</button>
                  <button type="button" className="rs-chip" onClick={() => loadPack(key, "add")}>Add to mine</button>
                </div>
              </div>
            ))}
          </div>
          <p className="rs-note">Starter definitions use standard formulas. Your accounting policy, facility agreement or investment documents override them where they define a metric. For SaaS metrics with a calculator, see <a href="/resources/saas-metrics-definitions">SaaS metrics definitions</a>.</p>
        </header>

        <div className="rs-kpis">
          <div><small>KPIs</small><b>{kpis.length}</b></div>
          <div className={complete === kpis.length && kpis.length ? "is-good" : "is-warn"}><small>Fully defined</small><b>{complete} of {kpis.length}</b></div>
          <div className={owners === kpis.length && kpis.length ? "is-good" : "is-warn"}><small>With an owner</small><b>{owners} of {kpis.length}</b></div>
        </div>

        <ul className="rs-dict">
          {kpis.map((x) => {
            const gaps = missing(x);
            const isOpen = open === x.id;
            return (
              <li key={x.id} className={isOpen ? "is-open" : undefined}>
                <button type="button" className="rs-dict-row" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : x.id)}>
                  <b>{x.name || "Unnamed KPI"}</b>
                  <span>{x.formula || x.definition || "Add a definition"}</span>
                  {gaps.length ? <em className="is-warn">Missing: {gaps.join(", ").toLowerCase()}</em> : <em className="is-good">Defined</em>}
                </button>
                {isOpen && (
                  <div className="rs-dict-edit">
                    {FIELDS.map((f) => (
                      <label key={f.key} className={`rs-field${f.long ? " rs-field-wide" : ""}`}>
                        <span>{f.label}{f.required ? "" : " (optional)"}</span>
                        {f.long
                          ? <textarea rows={2} value={x[f.key]} placeholder={f.hint} onChange={(e) => setKpi(x.id, { [f.key]: e.target.value })} />
                          : <input value={x[f.key]} placeholder={f.hint} onChange={(e) => setKpi(x.id, { [f.key]: e.target.value })} />}
                      </label>
                    ))}
                    <div className="rs-dict-actions">
                      <button type="button" className="rs-btn" onClick={() => setOpen(null)}>Done</button>
                      <button type="button" className="rs-btn rs-btn-quiet" onClick={() => remove(x.id)}>Remove this KPI</button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
        <button type="button" className="rs-btn" onClick={addKpi}>Add a KPI</button>
        <table className="rs-print-only rs-print-table">
          <thead><tr>{FIELDS.map((f) => <th key={f.key}>{f.label}</th>)}</tr></thead>
          <tbody>{kpis.map((x) => <tr key={x.id}>{FIELDS.map((f) => <td key={f.key}>{x[f.key]}</td>)}</tr>)}</tbody>
        </table>
      </section>
      <ToolActions getText={text} getTsv={tsv} csv={{ filename: "kpi-dictionary.csv", get: csv }} onReset={reset} resetLabel="Restore the starter pack" />
    </div>
  );
}
