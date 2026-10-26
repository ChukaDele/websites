"use client";
import { useStoredState } from "./useStoredState";
import { ToolActions, toNum } from "./ToolActions";
import { CodeBlock } from "./CodeBlock";
import { PlainSummary, Terms } from "./Explainers";

/* Data freshness and SLA planner. A pipeline is a chain of stages; each one
 * either runs on its own schedule (data can just miss it and wait a whole
 * interval) or is chained to the stage before (it starts when that finishes).
 * Worst case = source lag + sum over scheduled stages of (interval + run time)
 * + sum over chained stages of run time. Typical uses half the interval.
 * Alert thresholds become dbt source freshness config (dbt 1.10 syntax). */

type Stage = { name: string; every: string; duration: string; chained: boolean };
type State = { sourceLag: string; sla: string; stages: Stage[]; source: string; table: string; loadedAt: string };

const INITIAL: State = {
  sourceLag: "5",
  sla: "240",
  source: "stripe",
  table: "charges",
  loadedAt: "_fivetran_synced",
  stages: [
    { name: "Connector sync (Fivetran or Airbyte)", every: "60", duration: "10", chained: false },
    { name: "dbt build", every: "60", duration: "20", chained: false },
    { name: "BI refresh (Power BI import)", every: "180", duration: "15", chained: false },
  ],
};

const mins = (m: number) => {
  if (!Number.isFinite(m)) return "n/a";
  const r = Math.round(m);
  if (r < 60) return `${r} min`;
  const h = Math.floor(r / 60); const mm = r % 60;
  return mm ? `${h} h ${mm} min` : `${h} h`;
};
/** dbt freshness wants count + period (minute | hour | day). */
const period = (m: number) => {
  const r = Math.max(1, Math.ceil(m));
  if (r % 1440 === 0) return `{count: ${r / 1440}, period: day}`;
  if (r % 60 === 0) return `{count: ${r / 60}, period: hour}`;
  return `{count: ${r}, period: minute}`;
};
const clean = (v: string, fb: string) => (v || fb).replace(/[^A-Za-z0-9_]/g, "") || fb;

export function FreshnessPlanner() {
  const [raw, set, reset] = useStoredState<State>("bredge:rs:freshness-sla:v1", INITIAL);
  const s: State = { ...INITIAL, ...raw, stages: raw.stages?.length ? raw.stages : INITIAL.stages };
  const update = (patch: Partial<State>) => set((p) => ({ ...p, ...patch }));
  const setStage = (i: number, patch: Partial<Stage>) => set((p) => {
    const st = [...(p.stages?.length ? p.stages : INITIAL.stages)];
    st[i] = { ...st[i], ...patch };
    return { ...p, stages: st };
  });
  const addStage = () => set((p) => ({ ...p, stages: [...(p.stages?.length ? p.stages : INITIAL.stages), { name: "New stage", every: "60", duration: "5", chained: true }] }));
  const removeStage = (i: number) => set((p) => ({ ...p, stages: (p.stages?.length ? p.stages : INITIAL.stages).filter((_, j) => j !== i) }));

  const lag = Math.max(0, toNum(s.sourceLag));
  const sla = Math.max(0, toNum(s.sla));
  const st = s.stages.map((x, i) => {
    const every = Math.max(0, toNum(x.every));
    const dur = Math.max(0, toNum(x.duration));
    const chained = i > 0 && x.chained;
    return { ...x, i, every, dur, chained, worst: (chained ? 0 : every) + dur, typical: (chained ? 0 : every / 2) + dur, best: dur };
  });
  const worst = lag + st.reduce((a, x) => a + x.worst, 0);
  const typical = lag + st.reduce((a, x) => a + x.typical, 0);
  const best = lag + st.reduce((a, x) => a + x.best, 0);
  const bottleneck = [...st].sort((a, b) => b.worst - a.worst)[0];
  const parts = [{ name: "Source lag", worst: lag, i: -1 }, ...st];
  const unchained = st.filter((x) => x.i > 0 && !x.chained && x.every > 0);
  const chainSaving = unchained.reduce((a, x) => a + x.every, 0);
  const holds = sla > 0 ? worst <= sla : true;

  // Alert thresholds for the load stage (stage 1): its loaded_at age.
  const load = st[0];
  const normalAge = load ? load.every + load.dur : 0;           // max age of loaded_at in normal running
  const warnAt = load ? normalAge + load.every : 0;              // one sync missed
  const downstreamWorst = st.slice(1).reduce((a, x) => a + x.worst, 0);
  const errorBudget = sla - lag - downstreamWorst;              // latest a load can be and still meet the SLA
  const errorAt = Math.max(warnAt + 1, errorBudget);
  const slaTooTight = sla > 0 && errorBudget < normalAge;

  const yaml = `# models/staging/${clean(s.source, "my_source")}/_sources.yml  (dbt 1.10+ syntax)
sources:
  - name: ${clean(s.source, "my_source")}
    config:
      loaded_at_field: ${clean(s.loadedAt, "_fivetran_synced")}
      freshness:
        warn_after: ${period(warnAt)}   # one ${load ? mins(load.every) : ""} sync missed
        error_after: ${period(errorAt)}   # ${slaTooTight ? "the SLA cannot hold even in normal running: see the planner" : "past this, the dashboard SLA is at risk"}
    tables:
      - name: ${clean(s.table, "my_table")}

# Run it before the build, and build only what got fresher:
#   dbt source freshness
#   dbt build --select source_status:fresher+ --state <previous run artifacts>`;

  const text = () => [
    "Data freshness and SLA plan",
    `Source lag ${mins(lag)}; ${st.map((x) => `${x.name}: ${x.chained ? "chained" : `every ${mins(x.every)}`}, runs ${mins(x.dur)}`).join("; ")}`,
    `Worst-case staleness: ${mins(worst)}. Typical: ${mins(typical)}. Best: ${mins(best)}.`,
    sla > 0 ? `Target SLA ${mins(sla)}: ${holds ? "holds in the worst case" : `missed by ${mins(worst - sla)} in the worst case`}.` : "",
    bottleneck ? `Bottleneck: ${bottleneck.name} (${mins(bottleneck.worst)} of the worst case).` : "",
    unchained.length ? `Chaining ${unchained.map((x) => x.name).join(", ")} to the stage before would cut up to ${mins(chainSaving)} from the worst case.` : "",
    `Alerts on ${clean(s.source, "my_source")}: warn after ${mins(warnAt)}, error after ${mins(errorAt)}.`,
    "", yaml,
  ].filter(Boolean).join("\n");

  return (
    <div className="rs-toolwrap">
      <section id="pipeline" className="rs-card">
        <header className="rs-card-head">
          <p className="rs-label">Step 1 · The pipeline behind one dashboard</p>
          <h2>Each stage, in order</h2>
          <p className="rs-note"><b>The starting stages are an illustrative example</b>: an hourly connector, an hourly dbt job on its own cron, and a Power BI import refresh every three hours. Replace them with your own schedules and run times from your orchestrator&apos;s history.</p>
          <Terms items={[
            ["Freshness / staleness", "How old the newest data on a dashboard is at the moment someone looks at it."],
            ["SLA", "Service level agreement: the oldest the data is allowed to be, agreed with the people who use it."],
            ["Source lag", "Delay before a change in the source system can be read, such as database replication lag or an API that publishes hourly."],
            ["Connector sync", "The job that copies data from a source into the warehouse, for example Fivetran or Airbyte."],
            ["dbt build", "The job that turns raw tables into the cleaned, modelled tables reports read."],
            ["BI refresh", "The dashboard tool reloading its copy of the data, such as a Power BI import refresh."],
            ["Chained", "A stage that starts as soon as the one before finishes, instead of on its own clock."],
            ["loaded_at_field", "The column dbt checks to see when a source table last received data."],
          ]} />
        </header>
        <div className="rs-cost-fields">
          <label className="rs-field"><span>Source lag (minutes)</span><input inputMode="decimal" value={s.sourceLag} onChange={(e) => update({ sourceLag: e.target.value })} /><small className="rs-hint">Delay before a change is readable by the connector: replication lag, API delay, a nightly export.</small></label>
          <label className="rs-field"><span>Target SLA (minutes)</span><input inputMode="decimal" value={s.sla} onChange={(e) => update({ sla: e.target.value })} /><small className="rs-hint">The oldest the dashboard may be, as agreed with its users. 240 = four hours.</small></label>
        </div>
        <ol className="rs-stages">
          {s.stages.map((x, i) => (
            <li key={i}>
              <span className="rs-step-n">{i + 1}</span>
              <label className="rs-field"><span>Stage</span><input value={x.name} onChange={(e) => setStage(i, { name: e.target.value })} /></label>
              <label className="rs-field"><span>Runs every (min)</span><input inputMode="decimal" value={x.every} disabled={i > 0 && x.chained} onChange={(e) => setStage(i, { every: e.target.value })} /></label>
              <label className="rs-field"><span>Run time (min)</span><input inputMode="decimal" value={x.duration} onChange={(e) => setStage(i, { duration: e.target.value })} /></label>
              {i > 0
                ? <div className="rs-seg rs-seg-sm" role="group" aria-label={`How stage ${i + 1} starts`}>
                    <button type="button" className={!x.chained ? "is-on" : undefined} aria-pressed={!x.chained} onClick={() => setStage(i, { chained: false })}>Own schedule</button>
                    <button type="button" className={x.chained ? "is-on" : undefined} aria-pressed={x.chained} onClick={() => setStage(i, { chained: true })}>Starts when stage {i} ends</button>
                  </div>
                : <small className="rs-hint">The load stage. Its loaded-at column drives the alerts.</small>}
              <button type="button" className="rs-btn rs-btn-quiet rs-btn-sm" disabled={s.stages.length < 2} onClick={() => removeStage(i)} aria-label={`Remove stage ${i + 1}`}>Remove</button>
            </li>
          ))}
        </ol>
        <button type="button" className="rs-btn" onClick={addStage}>Add a stage</button>
      </section>

      <section id="staleness" className="rs-card" aria-live="polite">
        <header className="rs-card-head">
          <p className="rs-label">Step 2 · How stale it can get</p>
          <h2>Worst case {mins(worst)}, typically {mins(typical)}</h2>
        </header>
        <div className="rs-timeline" aria-hidden="true">
          {parts.filter((p) => p.worst > 0).map((p) => (
            <i key={p.i} className={p.i === bottleneck?.i ? "is-bottleneck" : undefined} style={{ flexGrow: p.worst }} title={`${p.name}: ${mins(p.worst)}`}><span>{p.name}</span></i>
          ))}
          {sla > 0 && worst > 0 && <b style={{ left: `${Math.min(100, (sla / Math.max(worst, sla)) * 100)}%` }}><span>SLA</span></b>}
        </div>
        <div className="rs-kpis">
          <div><small>Best case (data lands right before each stage)</small><b>{mins(best)}</b></div>
          <div><small>Typical (average wait at each schedule)</small><b>{mins(typical)}</b></div>
          <div className={holds ? "is-good" : "is-warn"}><small>Worst case (misses every schedule by a minute)</small><b>{mins(worst)}</b></div>
          <div><small>Bottleneck</small><b className="rs-kpi-text">{bottleneck?.name ?? "n/a"}</b></div>
        </div>
        <p className={`rs-verdict ${holds ? "is-good" : "is-warn"}`}>
          {sla > 0
            ? holds
              ? <>The {mins(sla)} SLA holds even in the worst case, with {mins(sla - worst)} to spare.</>
              : <>The {mins(sla)} SLA is <b>missed by up to {mins(worst - sla)}</b> when a change arrives right after each stage starts. {bottleneck && <>The biggest share is {bottleneck.name} ({mins(bottleneck.worst)}).</>}</>
            : "Enter a target SLA to check it."}
        </p>
        <PlainSummary>
          someone opening this dashboard may be looking at data up to {mins(worst)} old, and {mins(typical)} old on a typical visit.{sla > 0 ? (holds ? " That is inside the promise made to its users." : ` That breaks the ${mins(sla)} promise made to its users, so decisions may rest on numbers older than people think.`) : ""}
        </PlainSummary>

        <h3>What would move it</h3>
        <ul className="rs-plainlist">
          {unchained.length > 0 && <li><b>Chain the schedules.</b> Starting {unchained.map((x) => x.name).join(" and ")} when the stage before finishes removes up to {mins(chainSaving)} of waiting from the worst case, with no extra compute. Fivetran and Airbyte can trigger downstream jobs; so can Airflow, Dagster or dbt Cloud job triggers.</li>}
          {bottleneck && bottleneck.i >= 0 && <li><b>Shorten the bottleneck.</b> Halving the interval of {bottleneck.name} saves about {mins(bottleneck.every / 2)} in the worst case. Check what it costs first: more runs means more compute.</li>}
          <li><b>BI refresh limits.</b> Power BI import models allow up to 8 scheduled refreshes a day on Pro and 48 on Premium capacity or Premium Per User; DirectQuery or a semantic layer avoids the import step but moves cost to query time.</li>
          <li><b>Freshness is not correctness.</b> A pipeline can be on time and wrong. Pair these alerts with row-count and reconciliation tests.</li>
        </ul>
      </section>

      <section id="alerts" className="rs-card">
        <header className="rs-card-head">
          <p className="rs-label">Step 3 · Alert thresholds</p>
          <h2>Warn after {mins(warnAt)}, error after {mins(errorAt)}</h2>
          <p className="rs-muted">The warning fires when one sync has been missed. The error fires when the load is so late that, after the downstream stages run, the dashboard would breach the SLA.{slaTooTight && <> <b>Here the SLA leaves less time than one normal sync cycle</b>, so the error threshold is set one minute past the warning: fix the schedule before tuning alerts.</>}</p>
        </header>
        <div className="rs-cost-fields">
          <label className="rs-field"><span>dbt source name</span><input value={s.source} spellCheck={false} onChange={(e) => update({ source: e.target.value })} /></label>
          <label className="rs-field"><span>Table</span><input value={s.table} spellCheck={false} onChange={(e) => update({ table: e.target.value })} /></label>
          <label className="rs-field"><span>Loaded-at column</span><input value={s.loadedAt} spellCheck={false} onChange={(e) => update({ loadedAt: e.target.value })} /><small className="rs-hint">Fivetran: _fivetran_synced. Airbyte: _airbyte_extracted_at. Or your own load timestamp.</small></label>
        </div>
        <CodeBlock label="_sources.yml" lang="YAML" code={yaml} />
        <p className="rs-muted">On dbt versions before 1.10, put loaded_at_field outside the config block, and before 1.9 put freshness there too.</p>
      </section>

      <ToolActions getText={text} copyLabel="Copy the plan" onReset={reset} resetLabel="Restore the example" confirmText="Replace your pipeline with the example?" />
    </div>
  );
}
