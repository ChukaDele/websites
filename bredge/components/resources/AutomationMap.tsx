"use client";
import { useStoredState } from "./useStoredState";
import { ToolActions, fmtNum, toNum } from "./ToolActions";
import { CodeBlock } from "./CodeBlock";
import { DataPersonNote } from "./Explainers";

/* Reporting automation map: the reader's own steps, hours and assumptions in,
 * hours spent on mechanical work and a scoped list out. */

type Step = { id: string; name: string; owner: string; hours: string; kind: "mech" | "judge"; single: boolean; audit: boolean };
type State = { report: string; runs: string; share: string; rate: string; currency: string; steps: Step[] };

let seq = 0;
const nid = () => `s${Date.now().toString(36)}${(seq++).toString(36)}`;

const EXAMPLE_STEPS: Step[] = [
  { id: "e1", name: "Export trial balance and sales from the accounting system (Xero, QuickBooks, Sage or NetSuite)", owner: "Accountant", hours: "1", kind: "mech", single: false, audit: true },
  { id: "e2", name: "Export pipeline or orders from the CRM", owner: "Sales ops", hours: "0.5", kind: "mech", single: false, audit: false },
  { id: "e3", name: "Clean and reformat the exports in Excel", owner: "Accountant", hours: "3", kind: "mech", single: false, audit: false },
  { id: "e4", name: "VLOOKUPs to map accounts, customers and branches", owner: "Accountant", hours: "2", kind: "mech", single: true, audit: true },
  { id: "e5", name: "Consolidate branches or entities", owner: "Financial controller", hours: "2", kind: "mech", single: true, audit: true },
  { id: "e6", name: "Translate foreign-currency balances at the month-end rate", owner: "Financial controller", hours: "1", kind: "mech", single: false, audit: true },
  { id: "e7", name: "Refresh pivots and charts in the pack", owner: "Accountant", hours: "2", kind: "mech", single: false, audit: false },
  { id: "e8", name: "Check totals tie to the general ledger", owner: "Financial controller", hours: "1", kind: "judge", single: false, audit: true },
  { id: "e9", name: "Write variance commentary", owner: "Finance manager", hours: "2", kind: "judge", single: false, audit: false },
  { id: "e10", name: "Review and sign off before distribution", owner: "CFO", hours: "1", kind: "judge", single: false, audit: true },
];

const INITIAL: State = { report: "Monthly management pack", runs: "1", share: "70", rate: "", currency: "£", steps: EXAMPLE_STEPS };

export function AutomationMap() {
  const [s, set, reset] = useStoredState<State>("bredge:rs:reporting-automation:v2", INITIAL);
  const steps = s.steps ?? [];
  const runs = Math.max(0, toNum(s.runs));
  const share = Math.min(100, Math.max(0, toNum(s.share))) / 100;
  const rate = toNum(s.rate);
  const mech = steps.filter((x) => x.kind === "mech").reduce((n, x) => n + toNum(x.hours), 0);
  const judge = steps.filter((x) => x.kind === "judge").reduce((n, x) => n + toNum(x.hours), 0);
  const perRun = mech + judge;
  const savedMonth = mech * share * runs;
  const savedYear = savedMonth * 12;
  const isExample = steps === EXAMPLE_STEPS || steps.every((x) => x.id.startsWith("e"));

  const update = (patch: Partial<State>) => set((p) => ({ ...p, ...patch }));
  const setStep = (id: string, patch: Partial<Step>) => set((p) => ({ ...p, steps: (p.steps ?? []).map((x) => (x.id === id ? { ...x, ...patch } : x)) }));
  const removeStep = (id: string) => set((p) => ({ ...p, steps: (p.steps ?? []).filter((x) => x.id !== id) }));
  const move = (id: string, dir: -1 | 1) => set((p) => {
    const arr = [...(p.steps ?? [])];
    const i = arr.findIndex((x) => x.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= arr.length) return p;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    return { ...p, steps: arr };
  });
  const addStep = () => set((p) => ({ ...p, steps: [...(p.steps ?? []), { id: nid(), name: "", owner: "", hours: "", kind: "mech", single: false, audit: false }] }));

  const upstream = steps.filter((x) => x.kind === "mech" && x.name);
  const keep = steps.filter((x) => x.kind === "judge" && x.name);
  const spof = steps.filter((x) => x.single && x.name);
  const audit = steps.filter((x) => x.audit && x.name);

  const text = () => [
    `Reporting automation map: ${s.report}`,
    `Runs per month: ${s.runs}. Hours per run: ${fmtNum(perRun, 1)} (mechanical ${fmtNum(mech, 1)}, judgement ${fmtNum(judge, 1)})`,
    `Assumed share of mechanical time removed: ${s.share}%`,
    `Estimated hours freed: ${fmtNum(savedMonth, 1)} a month, ${fmtNum(savedYear, 0)} a year${rate ? ` (about ${s.currency}${fmtNum(savedYear * rate)} a year at ${s.currency}${fmtNum(rate)} an hour)` : ""}`,
    "",
    "Steps:",
    ...steps.map((x, i) => `${i + 1}. ${x.name || "(unnamed)"} | ${x.owner || "no owner"} | ${x.hours || 0}h | ${x.kind === "mech" ? "mechanical" : "judgement"}${x.single ? " | only one person can do it" : ""}${x.audit ? " | must stay auditable" : ""}`),
    "",
    "Move upstream into tested logic:", ...upstream.map((x) => `- ${x.name}`),
    "Keep with people:", ...keep.map((x) => `- ${x.name}`),
    "Single points of failure:", ...(spof.length ? spof.map((x) => `- ${x.name} (${x.owner || "no owner"})`) : ["- none flagged"]),
    "Keep an audit trail or review gate:", ...(audit.length ? audit.map((x) => `- ${x.name}`) : ["- none flagged"]),
  ].join("\n");

  return (
    <div className="rs-toolwrap">
      <section id="map" className="rs-card">
        <header className="rs-card-head">
          <p className="rs-label">Step 1 · Map one report</p>
          <h2>Every step, in order</h2>
          {isExample && <p className="rs-note">The steps and hours below are an example of a typical monthly management pack, as placeholders. They are not benchmarks. Replace them with your own.</p>}
        </header>
        <div className="rs-grid-figs rs-grid-3">
          <label className="rs-field"><span>Report</span><input value={s.report} onChange={(e) => update({ report: e.target.value })} /></label>
          <label className="rs-field"><span>Runs per month</span><input inputMode="decimal" value={s.runs} onChange={(e) => update({ runs: e.target.value })} /></label>
          <div className="rs-field rs-field-pair">
            <label><span>Cost per hour (optional)</span><input inputMode="decimal" value={s.rate} placeholder="e.g. 15000" onChange={(e) => update({ rate: e.target.value })} /></label>
            <label><span className="rs-sr">Currency</span>
              <select value={s.currency} onChange={(e) => update({ currency: e.target.value })} aria-label="Currency">
                <option value="£">£</option><option value="$">$</option><option value="€">€</option>
              </select>
            </label>
          </div>
        </div>

        <div className="rs-steps" role="table" aria-label="Report steps">
          <div className="rs-steps-head" role="row">
            <span role="columnheader">#</span><span role="columnheader">Step</span><span role="columnheader">Who</span><span role="columnheader">Hours per run</span><span role="columnheader">Type</span><span role="columnheader">Flags</span><span role="columnheader"><span className="rs-sr">Actions</span></span>
          </div>
          {steps.map((x, i) => (
            <div key={x.id} className={`rs-step ${x.kind === "mech" ? "is-mech" : "is-judge"}`} role="row">
              <span role="cell" className="rs-step-n">{i + 1}</span>
              <label role="cell" className="rs-field rs-field-inline"><span className="rs-sr">Step {i + 1} name</span><input value={x.name} placeholder="What happens" onChange={(e) => setStep(x.id, { name: e.target.value })} /></label>
              <label role="cell" className="rs-field rs-field-inline"><span className="rs-sr">Step {i + 1} owner</span><input value={x.owner} placeholder="Who" onChange={(e) => setStep(x.id, { owner: e.target.value })} /></label>
              <label role="cell" className="rs-field rs-field-inline"><span className="rs-sr">Step {i + 1} hours</span><input inputMode="decimal" value={x.hours} placeholder="0" onChange={(e) => setStep(x.id, { hours: e.target.value })} /></label>
              <span role="cell" className="rs-seg rs-seg-sm">
                <button type="button" aria-pressed={x.kind === "mech"} className={x.kind === "mech" ? "is-on" : undefined} onClick={() => setStep(x.id, { kind: "mech" })}>Mechanical</button>
                <button type="button" aria-pressed={x.kind === "judge"} className={x.kind === "judge" ? "is-on" : undefined} onClick={() => setStep(x.id, { kind: "judge" })}>Judgement</button>
              </span>
              <span role="cell" className="rs-flags">
                <label><input type="checkbox" checked={x.single} onChange={(e) => setStep(x.id, { single: e.target.checked })} />Only one person</label>
                <label><input type="checkbox" checked={x.audit} onChange={(e) => setStep(x.id, { audit: e.target.checked })} />Must be auditable</label>
              </span>
              <span role="cell" className="rs-step-actions">
                <button type="button" onClick={() => move(x.id, -1)} aria-label={`Move step ${i + 1} up`} disabled={i === 0}>↑</button>
                <button type="button" onClick={() => move(x.id, 1)} aria-label={`Move step ${i + 1} down`} disabled={i === steps.length - 1}>↓</button>
                <button type="button" onClick={() => removeStep(x.id)} aria-label={`Remove step ${i + 1}`}>×</button>
              </span>
            </div>
          ))}
        </div>
        <button type="button" className="rs-btn" onClick={addStep}>Add a step</button>
      </section>

      <section id="results" className="rs-card">
        <header className="rs-card-head">
          <p className="rs-label">Step 2 · What it tells you</p>
          <h2>Where the time goes</h2>
        </header>
        <div className="rs-split" aria-hidden="true">
          <i className="is-mech" style={{ flexGrow: mech || 0.0001 }}><span>Mechanical {fmtNum(mech, 1)}h</span></i>
          <i className="is-judge" style={{ flexGrow: judge || 0.0001 }}><span>Judgement {fmtNum(judge, 1)}h</span></i>
        </div>
        <label className="rs-range">
          <span>Share of mechanical time you expect automation to remove: <b>{s.share}%</b></span>
          <input type="range" min={0} max={100} step={5} value={toNum(s.share)} onChange={(e) => update({ share: e.target.value })} />
          <small>Your assumption. Some mechanical steps keep a short check even when automated.</small>
        </label>
        <div className="rs-kpis">
          <div><small>Hours per run</small><b>{fmtNum(perRun, 1)}</b></div>
          <div><small>Mechanical share</small><b>{perRun ? `${Math.round((mech / perRun) * 100)}%` : "n/a"}</b></div>
          <div className="is-good"><small>Hours freed a month</small><b>{fmtNum(savedMonth, 1)}</b></div>
          <div className="is-good"><small>Hours freed a year</small><b>{fmtNum(savedYear, 0)}</b></div>
          {rate > 0 && <div><small>Value a year</small><b>{s.currency}{fmtNum(savedYear * rate)}</b></div>}
        </div>
        <p className="rs-note">Estimate = mechanical hours per run × runs per month × your share × 12. It sizes the opportunity from your inputs; it is not a quote or a forecast.</p>

        <div className="rs-lists">
          <div><h3>Move upstream</h3><p className="rs-muted">Write once as tested, documented logic.</p><ul>{upstream.map((x) => <li key={x.id}>{x.name}</li>)}</ul></div>
          <div><h3>Keep with people</h3><p className="rs-muted">Automate the preparation so time goes here.</p><ul>{keep.map((x) => <li key={x.id}>{x.name}</li>)}</ul></div>
          <div className={spof.length ? "is-warn" : undefined}><h3>Single points of failure</h3><p className="rs-muted">Document or automate these first: the report stops if this person is away.</p><ul>{spof.length ? spof.map((x) => <li key={x.id}>{x.name}{x.owner ? ` (${x.owner})` : ""}</li>) : <li>None flagged</li>}</ul></div>
          <div><h3>Keep auditable</h3><p className="rs-muted">Keep a trail or a human review gate before distribution.</p><ul>{audit.length ? audit.map((x) => <li key={x.id}>{x.name}</li>) : <li>None flagged</li>}</ul></div>
        </div>
      </section>
      <DataPersonNote>
        <CodeBlock label="Formulas" lang="text" code={`hours_per_run   = sum(step hours)
mechanical      = sum(hours of steps marked mechanical)
saved_per_month = mechanical * share_automated% * runs_per_month
saved_per_year  = saved_per_month * 12
value_per_year  = saved_per_year * hourly_cost   (if a cost is entered)`} />
        <p className="rs-muted">How the mechanical steps usually move upstream, in order:</p>
        <ul className="rs-plainlist">
          <li><b>Extract:</b> pull the ledger, invoices and journals through the accounting API rather than exports (<a href="https://developer.xero.com/documentation/api/accounting/overview">Xero accounting API</a>, <a href="https://developer.intuit.com/app/developer/qbo/docs/get-started">QuickBooks Online API</a>), or through a managed connector such as <a href="https://fivetran.com/docs/connectors">Fivetran</a> or <a href="https://docs.airbyte.com/integrations/">Airbyte</a>.</li>
          <li><b>Transform:</b> put mappings (chart of accounts to report lines, entity, currency) in version-controlled tables and SQL, or in <a href="https://learn.microsoft.com/en-us/power-query/">Power Query</a> for a smaller setup. Never in hidden spreadsheet formulas.</li>
          <li><b>Test:</b> add checks that the trial balance sums to zero, that report totals agree with the ledger, and that every account maps to a line (<a href="https://docs.getdbt.com/docs/build/data-tests">dbt data tests</a> or equivalent).</li>
          <li><b>Schedule:</b> refresh after the books close, and keep a dated copy of each month-end run for audit. Power BI import models allow up to 8 scheduled refreshes a day on Pro (<a href="https://learn.microsoft.com/en-us/power-bi/connect-data/refresh-scheduled-refresh">Microsoft documentation</a>).</li>
          <li><b>Keep a review gate</b> on every step flagged as auditable: a named person signs off before distribution.</li>
        </ul>
      </DataPersonNote>

      <ToolActions getText={text} onReset={reset} resetLabel="Restore the example" />
    </div>
  );
}
