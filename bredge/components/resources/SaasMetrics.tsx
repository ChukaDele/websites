"use client";
import { useStoredState } from "./useStoredState";
import { ToolActions, fmtNum, fmtPct, toNum } from "./ToolActions";

/* SaaS metrics: the reader's own MRR movements, customer counts and spend in,
 * the standard metrics out with the formula beside each, plus one written
 * definition and the common mistakes for every metric. */

type Inputs = { startMrr: string; newMrr: string; expansion: string; contraction: string; churned: string; custStart: string; custNew: string; custLost: string; sm: string; margin: string };
type State = Inputs & { currency: string; period: "month" | "year"; example: boolean };

const BLANK: Inputs = { startMrr: "", newMrr: "", expansion: "", contraction: "", churned: "", custStart: "", custNew: "", custLost: "", sm: "", margin: "" };
const EXAMPLE: Inputs = { startMrr: "120000", newMrr: "9000", expansion: "4000", contraction: "1500", churned: "3000", custStart: "400", custNew: "30", custLost: "12", sm: "60000", margin: "78" };
const INITIAL: State = { ...BLANK, currency: "£", period: "month", example: false };

const FIELDS: { key: keyof Inputs; label: string; money?: boolean; hint: string }[] = [
  { key: "startMrr", label: "MRR at the start of the period", money: true, hint: "Active subscriptions, normalised to one month" },
  { key: "newMrr", label: "New MRR", money: true, hint: "From customers who joined in the period" },
  { key: "expansion", label: "Expansion MRR", money: true, hint: "Upgrades and seats added by existing customers" },
  { key: "contraction", label: "Contraction MRR", money: true, hint: "Downgrades by customers who stayed" },
  { key: "churned", label: "Churned MRR", money: true, hint: "From customers who left" },
  { key: "custStart", label: "Customers at the start", hint: "Paying accounts, not users" },
  { key: "custNew", label: "New customers", hint: "Paying accounts acquired in the period" },
  { key: "custLost", label: "Customers lost", hint: "Cancelled or not renewed in the period" },
  { key: "sm", label: "Sales and marketing cost", money: true, hint: "For the same period; say what is included" },
  { key: "margin", label: "Gross margin (%)", hint: "Subscription gross margin" },
];

const DEFS: { id: string; name: string; definition: string; formula: string; mistake: string }[] = [
  { id: "mrr", name: "MRR (monthly recurring revenue)", definition: "Recurring revenue from active subscriptions, normalised to one month, after discounts.", formula: "Sum of each active subscription's recurring price ÷ its billing interval in months.", mistake: "Including one-off fees, taxes, usage not under contract, or free trials. An annual plan counts as one twelfth a month, not the full amount in the month it is billed." },
  { id: "arr", name: "ARR (annual recurring revenue)", definition: "MRR expressed as an annual figure.", formula: "Ending MRR × 12.", mistake: "Reporting total contract value or bookings as ARR. Multi-year contracts count only their annual recurring amount." },
  { id: "nrr", name: "NRR (net revenue retention)", definition: "Revenue kept and grown from customers who were active at the start of the period.", formula: "(Starting MRR + expansion − contraction − churned MRR) ÷ starting MRR.", mistake: "Letting new customers into the cohort, or mixing currency movements into expansion. Investors usually expect a trailing 12-month figure." },
  { id: "grr", name: "GRR (gross revenue retention)", definition: "Revenue kept from the starting customers, ignoring expansion.", formula: "(Starting MRR − contraction − churned MRR) ÷ starting MRR.", mistake: "Netting expansion against churn. GRR cannot exceed 100%." },
  { id: "rchurn", name: "Revenue churn", definition: "Share of starting MRR lost to downgrades and cancellations.", formula: "(Contraction + churned MRR) ÷ starting MRR.", mistake: "Calling net churn (after expansion) revenue churn without saying so." },
  { id: "lchurn", name: "Logo churn", definition: "Share of starting customers who left.", formula: "Customers lost ÷ customers at the start.", mistake: "Not writing down what counts as lost: cancelled, not renewed, or unpaid after a set number of days." },
  { id: "arpa", name: "ARPA (average revenue per account)", definition: "Average MRR per paying customer.", formula: "Ending MRR ÷ customers at the end.", mistake: "Dividing by users or seats instead of paying accounts." },
  { id: "cac", name: "CAC (customer acquisition cost)", definition: "Average sales and marketing cost to win one new customer.", formula: "Sales and marketing cost ÷ new customers.", mistake: "Leaving out salaries, tools or agency fees, or using a different period for cost and customers." },
  { id: "payback", name: "CAC payback", definition: "Months of gross margin needed to recover what it cost to acquire new customers.", formula: "Sales and marketing cost ÷ (new MRR × gross margin %).", mistake: "Using revenue instead of gross margin, which flatters the result." },
];

export function SaasMetrics() {
  const [s, set, reset] = useStoredState<State>("bredge:rs:saas-metrics:v1", INITIAL);
  const n = (k: keyof Inputs) => toNum(s[k]);
  const c = s.currency || "£";
  const monthly = s.period !== "year";
  const start = n("startMrr");
  const end = start + n("newMrr") + n("expansion") - n("contraction") - n("churned");
  const has = start > 0;
  const custEnd = n("custStart") + n("custNew") - n("custLost");
  const nrr = has ? (start + n("expansion") - n("contraction") - n("churned")) / start : NaN;
  const grr = has ? (start - n("contraction") - n("churned")) / start : NaN;
  const rchurn = has ? (n("contraction") + n("churned")) / start : NaN;
  const lchurn = n("custStart") > 0 ? n("custLost") / n("custStart") : NaN;
  const arpa = custEnd > 0 ? end / custEnd : NaN;
  const cac = n("custNew") > 0 ? n("sm") / n("custNew") : NaN;
  const gm = n("margin") / 100;
  const payback = n("newMrr") > 0 && gm > 0 ? n("sm") / (n("newMrr") * gm) : NaN;
  const money = (v: number) => (Number.isFinite(v) && (has || v !== 0) ? `${v < 0 ? "−" : ""}${c}${fmtNum(Math.abs(Math.round(v)))}` : "n/a");
  const pct = (v: number) => (Number.isFinite(v) ? fmtPct(v) : "n/a");
  const annual = (r: number) => (Number.isFinite(r) ? 1 - Math.pow(1 - r, 12) : NaN);

  const values: Record<string, { value: string; note?: string }> = {
    mrr: { value: money(end), note: has ? `Net new MRR ${money(end - start)}` : undefined },
    arr: { value: money(end * 12) },
    nrr: { value: pct(nrr), note: monthly && Number.isFinite(nrr) ? `${pct(Math.pow(nrr, 12))} if every month were like this one` : undefined },
    grr: { value: pct(grr), note: monthly && Number.isFinite(grr) ? `${pct(Math.pow(grr, 12))} if every month were like this one` : undefined },
    rchurn: { value: pct(rchurn), note: monthly && Number.isFinite(rchurn) ? `${pct(annual(rchurn))} compounded over a year` : undefined },
    lchurn: { value: pct(lchurn), note: monthly && Number.isFinite(lchurn) ? `${pct(annual(lchurn))} compounded over a year` : undefined },
    arpa: { value: money(arpa) },
    cac: { value: money(cac) },
    payback: { value: Number.isFinite(payback) ? `${fmtNum(payback, 1)} months` : "n/a" },
  };

  const update = (patch: Partial<State>) => set((p) => ({ ...p, ...patch }));

  const text = () => [
    `SaaS metrics for one ${monthly ? "month" : "year"} (${c})${s.example ? ". Illustrative example figures" : ""}`,
    ...DEFS.map((d) => `- ${d.name}: ${values[d.id].value}${values[d.id].note ? ` (${values[d.id].note})` : ""}. Formula: ${d.formula}`),
  ].join("\n");

  return (
    <div className="rs-toolwrap">
      <section id="calculator" className="rs-card">
        <header className="rs-card-head">
          <p className="rs-label">The calculator</p>
          <h2>Your metrics for one period</h2>
          <p className="rs-muted">Pull the MRR movements from your billing system for one period. Every result shows its formula in the definitions below.</p>
          <div className="rs-cost-switches">
            <div className="rs-seg" role="group" aria-label="Currency">
              <span>Currency</span>
              {["£", "$", "€"].map((x) => <button key={x} type="button" className={c === x ? "is-on" : undefined} aria-pressed={c === x} onClick={() => update({ currency: x })}>{x}</button>)}
            </div>
            <div className="rs-seg" role="group" aria-label="Period">
              <span>Period</span>
              <button type="button" className={monthly ? "is-on" : undefined} aria-pressed={monthly} onClick={() => update({ period: "month" })}>One month</button>
              <button type="button" className={!monthly ? "is-on" : undefined} aria-pressed={!monthly} onClick={() => update({ period: "year" })}>Twelve months</button>
            </div>
          </div>
          <div className="rs-chips">
            <span>No figures to hand?</span>
            <button type="button" className={`rs-chip${s.example ? " is-on" : ""}`} onClick={() => update({ ...EXAMPLE, example: true, period: "month" })}>Load an illustrative example</button>
            {s.example && <button type="button" className="rs-chip" onClick={() => update({ ...BLANK, example: false })}>Start blank</button>}
          </div>
          {s.example && <p className="rs-note">Illustrative example with invented figures, to show how the metrics relate. Replace them with yours.</p>}
        </header>

        <div className="rs-saas-fields">
          {FIELDS.map((f) => (
            <label key={f.key} className="rs-field">
              <span>{f.label}{f.money ? ` (${c})` : ""}</span>
              <input inputMode="decimal" value={s[f.key]} placeholder="0" onChange={(e) => update({ [f.key]: e.target.value, example: false } as Partial<State>)} />
              <small className="rs-hint">{f.hint}</small>
            </label>
          ))}
        </div>

        <div className="rs-kpis">
          {DEFS.map((d) => (
            <div key={d.id}>
              <small>{d.name.replace(/\s*\(.*\)$/, "")}</small>
              <b>{values[d.id].value}</b>
              {values[d.id].note && <small>{values[d.id].note}</small>}
            </div>
          ))}
        </div>
        {Number.isFinite(grr) && grr > 1 && <p className="rs-verdict is-warn">GRR above 100% means contraction or churn was entered as a negative number. Enter them as positive amounts.</p>}
      </section>

      <section id="definitions" className="rs-card">
        <header className="rs-card-head">
          <p className="rs-label">Definitions</p>
          <h2>One definition per metric, and the usual mistakes</h2>
          <p className="rs-muted">Paste these into your <a href="/resources/kpi-dictionary-template">KPI dictionary</a> and add the owner and source system for each.</p>
        </header>
        <ul className="rs-defs">
          {DEFS.map((d) => (
            <li key={d.id}>
              <h3>{d.name} <span className="rs-count">{values[d.id].value}</span></h3>
              <p>{d.definition}</p>
              <p className="rs-formula">{d.formula}</p>
              <p className="rs-mistake"><b>Common mistake: </b>{d.mistake}</p>
            </li>
          ))}
        </ul>
      </section>

      <ToolActions getText={text} onReset={reset} />
    </div>
  );
}
