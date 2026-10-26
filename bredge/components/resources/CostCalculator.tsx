"use client";
import { useStoredState } from "./useStoredState";
import { ToolActions, fmtNum, toNum } from "./ToolActions";
import { CodeBlock } from "./CodeBlock";
import { DataPersonNote } from "./Explainers";

/* Hire vs fractional vs project: every figure is the visitor's own. The
 * starting values are labelled examples to overwrite, not market data and not
 * Bredge prices. Outputs: total over the period, time to first useful work,
 * days of work bought and the effective cost per day of work. */

type Cur = "£" | "$";
type Fields = {
  salary: string; onCost: string; fee: string; tools: string; monthsToHire: string; ramp: string; mgrHours: string; mgrRate: string; hires: string; workDays: string;
  fracRate: string; fracDays: string; fracStart: string;
  projRate: string; projDays: string; projMonths: string; supportDays: string;
};
type State = Fields & { currency: Cur; horizon: string };

const EXAMPLES: Record<Cur, Fields> = {
  "£": { salary: "50000", onCost: "18", fee: "20", tools: "3000", monthsToHire: "3", ramp: "3", mgrHours: "8", mgrRate: "60", hires: "1", workDays: "18", fracRate: "650", fracDays: "4", fracStart: "2", projRate: "650", projDays: "30", projMonths: "3", supportDays: "1" },
  "$": { salary: "85000", onCost: "25", fee: "20", tools: "4000", monthsToHire: "3", ramp: "3", mgrHours: "8", mgrRate: "90", hires: "1", workDays: "18", fracRate: "1000", fracDays: "4", fracStart: "2", projRate: "1000", projDays: "30", projMonths: "3", supportDays: "1" },
};
const INITIAL: State = { currency: "£", horizon: "12", ...EXAMPLES["£"] };
const KEYS = Object.keys(EXAMPLES["£"]) as (keyof Fields)[];
const isExampleSet = (s: State, c: Cur) => KEYS.every((k) => s[k] === EXAMPLES[c][k]);

type F = { key: keyof Fields; label: (c: Cur) => string; hint: string };
const HIRE: F[] = [
  { key: "salary", label: (c) => `Annual base salary (${c})`, hint: "From a job board or recruiter for your city and level." },
  { key: "onCost", label: () => "Employer on-costs (% of salary)", hint: "UK: employer NI and pension. US: payroll taxes, health and retirement. Ask payroll." },
  { key: "fee", label: () => "Recruiting fee (% of salary)", hint: "Agency fee, or 0 if you recruit directly." },
  { key: "tools", label: (c) => `Tools and equipment per year (${c})`, hint: "Laptop, software licences, training." },
  { key: "monthsToHire", label: () => "Months to hire", hint: "From opening the role to the first day, notice period included." },
  { key: "ramp", label: () => "Ramp-up months", hint: "Counted at half output while they learn your systems." },
  { key: "mgrHours", label: () => "Manager hours a month", hint: "Senior time spent directing and reviewing the work." },
  { key: "mgrRate", label: (c) => `Manager cost per hour (${c})`, hint: "Their loaded salary divided by working hours." },
  { key: "workDays", label: () => "Working days a month", hint: "After holidays, sickness and internal meetings." },
  { key: "hires", label: () => "Number of hires", hint: "How many people to cover the skills you need." },
];
const FRAC: F[] = [
  { key: "fracRate", label: (c) => `Day rate from a quote (${c})`, hint: "Or a monthly retainer divided by its days." },
  { key: "fracDays", label: () => "Days a month you need", hint: "Your estimate of the ongoing workload." },
  { key: "fracStart", label: () => "Weeks to start", hint: "From signing to the first working day." },
];
const PROJ: F[] = [
  { key: "projRate", label: (c) => `Day rate from a quote (${c})`, hint: "Or enter a fixed quote as days × 1." },
  { key: "projDays", label: () => "Project days quoted", hint: "The supplier's estimate for the defined scope." },
  { key: "projMonths", label: () => "Months to deliver", hint: "From start to accepted delivery." },
  { key: "supportDays", label: () => "Support days a month after", hint: "Ongoing changes and fixes once delivered. 0 if you own it." },
];

const WEEKS_PER_MONTH = 52 / 12;

export function CostCalculator() {
  const [s, set, reset] = useStoredState<State>("bredge:rs:hire-vs-fractional:v1", INITIAL);
  const c: Cur = s.currency === "$" ? "$" : "£";
  const n = (k: keyof Fields) => Math.max(0, toNum(s[k]));
  const H = Math.max(1, toNum(s.horizon) || 12);
  const money = (v: number) => (Number.isFinite(v) ? `${c}${fmtNum(Math.round(v))}` : "n/a");
  const months = (v: number) => (Number.isFinite(v) ? `${fmtNum(v, v % 1 ? 1 : 0)} ${v === 1 ? "month" : "months"}` : "n/a");

  // Hire
  const hires = Math.max(1, Math.round(n("hires")) || 1);
  const workDays = Math.max(1, n("workDays"));
  const employed = Math.max(0, H - n("monthsToHire"));
  const monthlyLoaded = (n("salary") * (1 + n("onCost") / 100)) / 12 + n("tools") / 12 + n("mgrHours") * n("mgrRate");
  const recruiting = employed > 0 ? n("salary") * (n("fee") / 100) : 0;
  const hireTotal = hires * (monthlyLoaded * employed + recruiting);
  const hireMonths = Math.max(0, employed - Math.min(n("ramp"), employed) * 0.5);
  const hireDays = hires * hireMonths * workDays;
  const hireDayCost = hireDays > 0 ? hireTotal / hireDays : NaN;
  const steadyDayCost = monthlyLoaded / workDays;

  // Fractional
  const fracStartM = n("fracStart") / WEEKS_PER_MONTH;
  const fracActive = Math.max(0, H - fracStartM);
  const fracTotal = n("fracRate") * n("fracDays") * fracActive;
  const fracDays = n("fracDays") * fracActive;
  const breakEven = n("fracRate") > 0 && fracActive > 0 ? hireTotal / (n("fracRate") * fracActive) : NaN;

  // Project
  const projDone = fracStartM + n("projMonths");
  const supportMonths = Math.max(0, H - projDone);
  const projBuild = n("projRate") * n("projDays");
  const projSupport = n("projRate") * n("supportDays") * supportMonths;
  const projTotal = projBuild + projSupport;
  const projDaysAll = n("projDays") + n("supportDays") * supportMonths;

  const options = [
    { id: "hire", name: hires > 1 ? `Hire ${hires} people` : "Hire one person", total: hireTotal, starts: n("monthsToHire"), days: hireDays, perDay: hireDayCost },
    { id: "frac", name: "Fractional team", total: fracTotal, starts: fracStartM, days: fracDays, perDay: fracDays > 0 ? fracTotal / fracDays : NaN },
    { id: "proj", name: "Project, then support", total: projTotal, starts: fracStartM, days: projDaysAll, perDay: projDaysAll > 0 ? projTotal / projDaysAll : NaN },
  ];
  const max = Math.max(1, ...options.map((o) => o.total));
  const exampleNow = isExampleSet(s, c);

  const update = (patch: Partial<State>) => set((p) => ({ ...p, ...patch }));
  const setCurrency = (next: Cur) => set((p) => {
    const prev: Cur = p.currency === "$" ? "$" : "£";
    return isExampleSet(p, prev) ? { ...p, ...EXAMPLES[next], currency: next } : { ...p, currency: next };
  });

  const text = () => [
    `Hire vs fractional vs project, over ${H} months (${c})${exampleNow ? ". Example figures, not real quotes" : ""}`,
    ...options.map((o) => `- ${o.name}: ${money(o.total)} total; useful work from month ${fmtNum(o.starts, 1)}; ${fmtNum(o.days)} days of work; ${money(o.perDay)} per day of work`),
    "",
    `Hire, per person: salary ${money(n("salary"))}, on-costs ${s.onCost}%, recruiting fee ${s.fee}%, tools ${money(n("tools"))} a year, ${s.monthsToHire} months to hire, ${s.ramp} months ramp-up, ${s.mgrHours} manager hours a month at ${money(n("mgrRate"))}`,
    `Hire steady-state cost per working day: ${money(steadyDayCost)}`,
    `Fractional: ${money(n("fracRate"))} a day, ${s.fracDays} days a month, ${s.fracStart} weeks to start`,
    `Project: ${s.projDays} days at ${money(n("projRate"))}, ${s.projMonths} months to deliver, then ${s.supportDays} support days a month`,
    Number.isFinite(breakEven) ? `Break-even: over ${H} months, a fractional team at this day rate costs the same as the hire at ${fmtNum(breakEven, 1)} days a month.` : "",
  ].filter(Boolean).join("\n");

  const field = (f: F) => (
    <label key={f.key} className="rs-field">
      <span>{f.label(c)}</span>
      <input inputMode="decimal" value={s[f.key]} onChange={(e) => update({ [f.key]: e.target.value } as Partial<State>)} />
      <small className="rs-hint">{f.hint}</small>
    </label>
  );

  return (
    <div className="rs-toolwrap">
      <section id="inputs" className="rs-card">
        <header className="rs-card-head">
          <p className="rs-label">Step 1 · Your numbers</p>
          <h2>What each option would cost you</h2>
          <div className="rs-cost-switches">
            <div className="rs-seg" role="group" aria-label="Currency">
              <span>Currency</span>
              {(["£", "$"] as Cur[]).map((x) => <button key={x} type="button" className={c === x ? "is-on" : undefined} aria-pressed={c === x} onClick={() => setCurrency(x)}>{x === "£" ? "£ GBP" : "$ USD"}</button>)}
            </div>
            <div className="rs-seg" role="group" aria-label="Period">
              <span>Period</span>
              {["12", "24", "36"].map((h) => <button key={h} type="button" className={s.horizon === h ? "is-on" : undefined} aria-pressed={s.horizon === h} onClick={() => update({ horizon: h })}>{h} months</button>)}
            </div>
          </div>
          <p className="rs-note"><b>Every starting figure is an editable example</b>, there so the calculator shows something. They are not market data, benchmarks or our prices. Replace each one with a salary from your market, your payroll on-costs and day rates from quotes you have.</p>
        </header>

        <div className="rs-cost-groups">
          <fieldset className="rs-cost-group">
            <legend>Hire</legend>
            <div className="rs-cost-fields">{HIRE.map(field)}</div>
          </fieldset>
          <fieldset className="rs-cost-group">
            <legend>Fractional team</legend>
            <div className="rs-cost-fields">{FRAC.map(field)}</div>
          </fieldset>
          <fieldset className="rs-cost-group">
            <legend>Outsourced project</legend>
            <div className="rs-cost-fields">{PROJ.map(field)}</div>
          </fieldset>
        </div>
      </section>

      <section id="compare" className="rs-card" aria-live="polite">
        <header className="rs-card-head">
          <p className="rs-label">Step 2 · The comparison over {H} months</p>
          <h2>Total cost, and when work starts</h2>
          {exampleNow && <p className="rs-note">Showing the example figures. Enter yours above for a real comparison.</p>}
        </header>

        <ul className="rs-cost-bars">
          {options.map((o) => (
            <li key={o.id} className={`is-${o.id}`}>
              <span><b>{o.name}</b><small>Useful work from month {fmtNum(o.starts, 1)}</small></span>
              <span className="rs-track"><i style={{ width: `${(o.total / max) * 100}%` }} /></span>
              <strong>{money(o.total)}</strong>
            </li>
          ))}
        </ul>

        <div className="rs-table-scroll">
          <table className="rs-cost-table">
            <thead><tr><th scope="col"><span className="rs-sr">Measure</span></th>{options.map((o) => <th key={o.id} scope="col">{o.name}</th>)}</tr></thead>
            <tbody>
              <tr><th scope="row">Total over {H} months</th>{options.map((o) => <td key={o.id}>{money(o.total)}</td>)}</tr>
              <tr><th scope="row">Useful work starts</th>{options.map((o) => <td key={o.id}>Month {fmtNum(o.starts, 1)}</td>)}</tr>
              <tr><th scope="row">Days of work in the period</th>{options.map((o) => <td key={o.id}>{fmtNum(o.days)}</td>)}</tr>
              <tr><th scope="row">Cost per day of work</th>{options.map((o) => <td key={o.id}>{money(o.perDay)}</td>)}</tr>
            </tbody>
          </table>
        </div>

        <div className="rs-kpis">
          <div><small>Hire: fully loaded cost per month, per person</small><b>{money(monthlyLoaded)}</b></div>
          <div><small>Hire: steady-state cost per working day</small><b>{money(steadyDayCost)}</b></div>
          <div><small>Recruiting fee, per hire</small><b>{money(recruiting)}</b></div>
          <div><small>Months with the seat empty</small><b>{months(Math.min(H, n("monthsToHire")))}</b></div>
        </div>

        <p className="rs-verdict">
          {Number.isFinite(breakEven)
            ? <>Over {H} months, a fractional team at {money(n("fracRate"))} a day costs the same as {hires > 1 ? "these hires" : "this hire"} if you need about <b>{fmtNum(breakEven, 1)} days a month</b>. Need fewer days and fractional costs less; need more and the hire does, provided the role is filled on time and directed well. The project finishes delivery around month {fmtNum(projDone, 1)}.</>
            : "Enter a fractional day rate and a period longer than the start time to see the break-even."}
        </p>
        <p className="rs-anchor">Where we fit: The Bredge’s embedded team is <b>designed to cost less than one full-time data hire</b> once salary, recruiting and employer costs are counted. Send us this result and we’ll reply with a fixed monthly price for the days you need.</p>

        <h3>What the numbers leave out</h3>
        <ul className="rs-plainlist">
          <li><b>Breadth of skills.</b> One hire brings one profile. A fractional team or project can bring analysis, modelling and engineering in the same month.</li>
          <li><b>Knowledge you keep.</b> A hire builds context inside the company. With outside help, insist on documentation and handover.</li>
          <li><b>Risk of a wrong hire.</b> If the role is scoped wrongly, the months to hire and ramp up repeat. The decision tree helps scope it.</li>
          <li><b>Direction.</b> A first hire needs someone senior to set priorities and review the work. The manager hours above are a proxy for that.</li>
        </ul>
        <p className="rs-muted">Next: <a href="/resources/first-data-hire-decision-tree">which role to hire first</a> · <a href="/resources/data-project-brief-template">brief a project so quotes are comparable</a></p>
      </section>

      <DataPersonNote>
        <p className="rs-muted">Every output comes from these formulas. Months are calendar months; H is the period you chose.</p>
        <CodeBlock label="Formulas" lang="text" code={`employed_months      = H - months_to_hire
monthly_loaded       = salary * (1 + on_cost%) / 12 + tools / 12
                       + manager_hours * manager_rate
recruiting           = salary * fee%            (0 if never employed in H)
hire_total           = hires * (monthly_loaded * employed_months + recruiting)
productive_months    = employed_months - 0.5 * min(ramp, employed_months)
hire_days            = hires * productive_months * working_days
cost_per_day_of_work = hire_total / hire_days

fractional_start     = weeks_to_start / (52 / 12)
fractional_total     = day_rate * days_per_month * (H - fractional_start)
break_even_days      = hire_total / (day_rate * (H - fractional_start))

project_done         = fractional_start + months_to_deliver
project_total        = day_rate * project_days
                       + day_rate * support_days * max(0, H - project_done)`} />
        <ul className="rs-plainlist">
          <li><b>On-costs, UK:</b> employer National Insurance above the secondary threshold, plus the employer pension contribution (minimum 3% of qualifying earnings under auto-enrolment). Take the rate from HMRC&apos;s <a href="https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2026-to-2027">rates and thresholds for employers</a> and <a href="https://www.gov.uk/workplace-pensions-employers">workplace pensions guidance</a>.</li>
          <li><b>On-costs, US:</b> employer FICA, federal and state unemployment taxes, and benefits. See IRS <a href="https://www.irs.gov/publications/p15">Publication 15</a> and the BLS <a href="https://www.bls.gov/news.release/ecec.toc.htm">Employer Costs for Employee Compensation</a> series for benefit shares by occupation.</li>
          <li><b>Ramp-up</b> is modelled at half output. Change it by adjusting ramp months: two months at half output equals one month lost.</li>
          <li><b>Not modelled:</b> notice periods on exit, equity, redundancy risk, and VAT or sales tax on supplier invoices.</li>
        </ul>
      </DataPersonNote>

      <ToolActions getText={text} onReset={reset} resetLabel="Restore the example figures" confirmText="Replace your figures with the example figures?" />
    </div>
  );
}
