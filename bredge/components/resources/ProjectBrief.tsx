"use client";
import { useStoredState } from "./useStoredState";
import { ToolActions } from "./ToolActions";

/* Data project brief (RFP) builder: the reader fills structured sections, a
 * completeness check shows what is missing, and the brief copies as a plain
 * document ready to send to several suppliers. */

type FieldDef = { key: string; label: string; hint: string; required?: boolean; long?: boolean };
const SECTIONS: { id: string; title: string; why: string; fields: FieldDef[] }[] = [
  { id: "background", title: "1. Background", why: "Enough context for a supplier who has never met you.", fields: [
    { key: "company", label: "Company and team", hint: "What the business does, its size, and which team owns this project.", required: true, long: true },
    { key: "whyNow", label: "Why now", hint: "What changed: growth, a new system, a board request, a team at capacity.", long: true },
  ] },
  { id: "problem", title: "2. The decision or problem", why: "Suppliers quote for outcomes, not tools. Start here.", fields: [
    { key: "question", label: "The decision or problem this serves", hint: "e.g. Finance and Sales report different revenue, so the board pack takes a week to agree.", required: true, long: true },
    { key: "users", label: "Who uses the result, and how often", hint: "e.g. CFO and regional heads, weekly; board, monthly.", required: true },
  ] },
  { id: "scope", title: "3. Scope and acceptance", why: "Acceptance tests turn done into something you can check.", fields: [
    { key: "deliverables", label: "Deliverables", hint: "e.g. Tested revenue model in the warehouse; Power BI report on top; documentation.", required: true, long: true },
    { key: "acceptance", label: "Acceptance tests", hint: "e.g. Revenue by month agrees with the general ledger within 0.5% for the last 12 months.", required: true, long: true },
    { key: "outOfScope", label: "Out of scope", hint: "e.g. Forecasting; migrating the CRM; dashboards beyond the two named.", required: true, long: true },
  ] },
  { id: "data", title: "4. Data and systems", why: "The biggest driver of effort, and the most common surprise.", fields: [
    { key: "sources", label: "Source systems", hint: "e.g. NetSuite, Salesforce, Stripe, two Excel trackers. Say which are cloud and which are on-premise.", required: true, long: true },
    { key: "platform", label: "Existing data platform and BI", hint: "e.g. Snowflake and Power BI already licensed; or none yet." },
    { key: "volume", label: "Data volumes and growth", hint: "e.g. 2m invoice lines a year; or 3bn events in history, 20m a day, growing 40% a year." },
  ] },
  { id: "nfr", title: "5. Non-functional requirements", why: "What makes the same scope a two-week or a two-month job. Large teams: fill this in.", fields: [
    { key: "freshness", label: "Freshness and latency", hint: "e.g. Finance dashboards no more than 4 hours old, 06:00 to 22:00 UK time; daily is fine for the board pack." },
    { key: "environments", label: "Environments, CI and deployment", hint: "e.g. dbt Core in GitHub; dev and prod on Snowflake; pull-request CI with slim builds; Airflow for orchestration." },
    { key: "cost", label: "Warehouse cost ceiling", hint: "e.g. The new models must not add more than an agreed share to the monthly Snowflake bill; cost per run reported." },
    { key: "observability", label: "Monitoring, alerting and on-call", hint: "e.g. Source freshness and test failures alert the platform channel; who responds out of hours." },
    { key: "schemaChange", label: "Schema changes from source teams", hint: "e.g. App teams warn us 30 days before renaming or removing a column; who approves the change." },
  ] },
  { id: "security", title: "6. Security and data protection", why: "Settle access and compliance before work starts, not after.", fields: [
    { key: "security", label: "Requirements", hint: "e.g. UK GDPR; data processing agreement; data stays in the UK or EU; SSO; SOC 2 or ISO 27001 expected.", required: true, long: true },
  ] },
  { id: "people", title: "7. People", why: "Named people keep decisions moving.", fields: [
    { key: "owner", label: "Business owner", hint: "The person who accepts the work.", required: true },
    { key: "technical", label: "Technical contact", hint: "Who grants access and answers system questions." },
    { key: "signoff", label: "Other stakeholders who sign off", hint: "e.g. Head of IT for access; Finance Director for definitions." },
  ] },
  { id: "timing", title: "8. Timing and budget", why: "A range lets suppliers propose a scope that fits.", fields: [
    { key: "dates", label: "Key dates", hint: "Proposal due, decision date, target start, hard deadline and why.", required: true },
    { key: "budget", label: "Budget range (optional)", hint: "Your own range, if you have one. Ask for options above and below it." },
    { key: "commercial", label: "Preferred commercial model", hint: "e.g. Paid discovery then fixed price; time and materials with a cap." },
  ] },
  { id: "handover", title: "9. Handover and after", why: "Plan for the people who run it after the supplier leaves.", fields: [
    { key: "runAfter", label: "Who runs it after delivery", hint: "e.g. Our BI analyst, with two support days a month from the supplier for three months.", required: true, long: true },
    { key: "docs", label: "Documentation and training expected", hint: "e.g. Model documentation, runbook, two training sessions recorded." },
  ] },
];

const SUPPLIER_QS = [
  "Name the people who will do the work and the share of their time committed.",
  "Describe how you will test that the numbers are right, against our acceptance tests.",
  "Propose a first phase that delivers something usable on its own.",
  "Say what you need from our team each week, and from whom.",
  "Describe what handover includes: documentation, training and a support period.",
  "Confirm who owns the code, models and documentation at the end.",
  "List the assumptions behind your estimate and what would change it.",
  "Describe a similar project you delivered and how it was accepted.",
  "Explain how you will backfill history and reprocess late data without double counting.",
  "Estimate the warehouse cost of the new pipelines per month, and say how you will measure it after go-live.",
];

const ALL = SECTIONS.flatMap((s) => s.fields);
const REQUIRED = ALL.filter((f) => f.required);

type State = { title: string; values: Record<string, string>; qs: boolean[] };
const INITIAL: State = { title: "", values: {}, qs: SUPPLIER_QS.map((_, i) => i < 6) };

export function ProjectBrief() {
  const [s, set, reset] = useStoredState<State>("bredge:rs:project-brief:v1", INITIAL);
  const v = s.values ?? {};
  const qs = s.qs ?? INITIAL.qs;
  const filled = REQUIRED.filter((f) => (v[f.key] ?? "").trim()).length;
  const missing = REQUIRED.filter((f) => !(v[f.key] ?? "").trim());
  const pct = REQUIRED.length ? filled / REQUIRED.length : 0;

  const setVal = (key: string, value: string) => set((p) => ({ ...p, values: { ...p.values, [key]: value } }));
  const toggleQ = (i: number) => set((p) => { const next = [...(p.qs ?? INITIAL.qs)]; next[i] = !next[i]; return { ...p, qs: next }; });

  const text = () => [
    s.title.trim() || "Data project brief",
    "",
    ...SECTIONS.flatMap((sec) => [
      sec.title.replace(/^\d+\.\s*/, "").toUpperCase(),
      ...sec.fields.map((f) => `${f.label}: ${(v[f.key] ?? "").trim() || (f.required ? "[to complete]" : "Not specified")}`),
      "",
    ]),
    "PLEASE ANSWER IN YOUR PROPOSAL",
    ...SUPPLIER_QS.filter((_, i) => qs[i]).map((q, i) => `${i + 1}. ${q}`),
  ].join("\n");

  return (
    <div className="rs-toolwrap">
      <section id="brief" className="rs-card">
        <header className="rs-card-head">
          <p className="rs-label">The brief</p>
          <div className="rs-grid-figs rs-grid-2">
            <label className="rs-field"><span>Project name</span><input value={s.title} placeholder="e.g. Revenue reporting rebuild: request for proposal" onChange={(e) => set((p) => ({ ...p, title: e.target.value }))} /></label>
            <div className="rs-progressbar" aria-label={`${filled} of ${REQUIRED.length} required fields complete`}>
              <span>{filled} of {REQUIRED.length} required fields complete</span>
              <i><b style={{ width: `${pct * 100}%` }} /></i>
            </div>
          </div>
          {missing.length > 0 && <p className="rs-note">Still to write: {missing.map((f) => f.label.toLowerCase()).join(", ")}.</p>}
        </header>

        {SECTIONS.map((sec) => (
          <fieldset key={sec.id} className="rs-brief-sec">
            <legend>{sec.title}</legend>
            <p className="rs-muted">{sec.why}</p>
            <div className="rs-brief-fields">
              {sec.fields.map((f) => (
                <label key={f.key} className={`rs-field${f.long ? " rs-field-wide" : ""}`}>
                  <span>{f.label}{f.required ? "" : " (optional)"}</span>
                  {f.long
                    ? <textarea rows={3} value={v[f.key] ?? ""} placeholder={f.hint} onChange={(e) => setVal(f.key, e.target.value)} />
                    : <input value={v[f.key] ?? ""} placeholder={f.hint} onChange={(e) => setVal(f.key, e.target.value)} />}
                </label>
              ))}
            </div>
          </fieldset>
        ))}
      </section>

      <section id="suppliers" className="rs-card">
        <header className="rs-card-head">
          <p className="rs-label">Questions for suppliers</p>
          <h2>Ask every supplier the same things <span className="rs-count">{qs.filter(Boolean).length} selected</span></h2>
          <p className="rs-muted">Ticked questions are added to the end of the brief, so proposals answer them in the same order and are easier to compare.</p>
        </header>
        <ul className="rs-checks">
          {SUPPLIER_QS.map((q, i) => (
            <li key={q} className={qs[i] ? "is-done" : undefined}>
              <label>
                <input type="checkbox" checked={!!qs[i]} onChange={() => toggleQ(i)} />
                <span>{q}</span>
              </label>
            </li>
          ))}
        </ul>
        <p className="rs-muted">Not sure what to scope yet? Start with the <a href="/resources/data-diagnostic-checklist">data audit checklist</a> to decide which problem the project should fix. For non-functional requirements, the <a href="/resources/data-freshness-sla-calculator">freshness planner</a> and <a href="/resources/warehouse-query-cost-estimator">warehouse cost estimator</a> give you figures to put in the brief.</p>
      </section>

      <ToolActions getText={text} copyLabel="Copy the brief" onReset={reset} resetLabel="Clear the brief" confirmText="Clear everything you wrote in this brief?" />
    </div>
  );
}
