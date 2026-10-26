"use client";
import { useStoredState } from "./useStoredState";
import { ToolActions, fmtNum, toNum } from "./ToolActions";
import { CodeBlock } from "./CodeBlock";
import { PlainSummary, Terms } from "./Explainers";

/* Backfill planner for very large tables. Splits a date range into
 * half-open chunks [start, end), sizes each from the visitor's measured
 * throughput, runs them in waves of N concurrent jobs, and adds per-chunk
 * overhead and a retry allowance. Output: chunk count, rows and minutes per
 * chunk, wall-clock and calendar time, the first and last chunks as commands,
 * and an idempotency checklist. Throughput is the visitor's own trial figure. */

type Grain = "day" | "week" | "month";
type Out = "microbatch" | "vars" | "sql";
type State = {
  begin: string; end: string; totalRows: string; grain: Grain;
  rowsPerSec: string; overhead: string; concurrency: string; retry: string; hoursPerDay: string; timeout: string;
  out: Out; model: string; target: string; source: string; ts: string;
};

const INITIAL: State = {
  begin: "2023-01-01", end: "2026-10-01", totalRows: "5000000000", grain: "week",
  rowsPerSec: "150000", overhead: "45", concurrency: "4", retry: "15", hoursPerDay: "24", timeout: "60",
  out: "microbatch", model: "fct_events", target: "analytics.fct_events", source: "raw.events", ts: "event_ts",
};

const DAY = 86400000;
const iso = (d: Date) => d.toISOString().slice(0, 10);
const clean = (v: string, fb: string) => (v || fb).replace(/[^A-Za-z0-9_.]/g, "") || fb;

function chunks(begin: string, end: string, grain: Grain) {
  const b = new Date(`${begin}T00:00:00Z`);
  const e = new Date(`${end}T00:00:00Z`);
  if (Number.isNaN(b.getTime()) || Number.isNaN(e.getTime()) || e <= b) return [] as [string, string][];
  const out: [string, string][] = [];
  let cur = b;
  while (cur < e && out.length < 20000) {
    const next = grain === "day" ? new Date(cur.getTime() + DAY)
      : grain === "week" ? new Date(cur.getTime() + 7 * DAY)
      : new Date(Date.UTC(cur.getUTCFullYear(), cur.getUTCMonth() + 1, cur.getUTCDate()));
    const stop = next < e ? next : e;
    out.push([iso(cur), iso(stop)]);
    cur = stop;
  }
  return out;
}

const dur = (mins: number) => {
  if (!Number.isFinite(mins)) return "n/a";
  if (mins < 1) return `${Math.max(1, Math.round(mins * 60))}s`;
  if (mins < 90) return `${fmtNum(mins, mins < 10 ? 1 : 0)} min`;
  const h = mins / 60;
  if (h < 48) return `${fmtNum(h, 1)} h`;
  return `${fmtNum(h / 24, 1)} days`;
};

export function BackfillPlanner() {
  const [raw, set, reset] = useStoredState<State>("bredge:rs:backfill:v1", INITIAL);
  const s: State = { ...INITIAL, ...raw };
  const update = (patch: Partial<State>) => set((p) => ({ ...p, ...patch }));
  const n = (k: keyof State) => Math.max(0, toNum(String(s[k] ?? "")));

  const list = chunks(s.begin, s.end, s.grain);
  const days = list.length ? (new Date(`${s.end}T00:00:00Z`).getTime() - new Date(`${s.begin}T00:00:00Z`).getTime()) / DAY : 0;
  const rows = n("totalRows");
  const perDay = days > 0 ? rows / days : 0;
  const grainDays = s.grain === "day" ? 1 : s.grain === "week" ? 7 : 30.4;
  const rowsPerChunk = perDay * grainDays;
  const rate = n("rowsPerSec");
  const conc = Math.max(1, Math.round(n("concurrency")) || 1);
  const chunkMin = rate > 0 ? (rowsPerChunk / rate + n("overhead")) / 60 : NaN;
  const waves = Math.ceil(list.length / conc);
  const wallMin = waves * chunkMin * (1 + n("retry") / 100);
  const hpd = Math.min(24, Math.max(1, n("hoursPerDay") || 24));
  const calendarDays = wallMin / 60 / hpd;
  const timeout = n("timeout");
  const tooBig = timeout > 0 && chunkMin > timeout / 2;
  const tooSmall = Number.isFinite(chunkMin) && chunkMin < 2 && list.length > 200;
  const finer: Grain | null = s.grain === "month" ? "week" : s.grain === "week" ? "day" : null;

  const m = clean(s.model, "my_model");
  const tgt = clean(s.target, "analytics.my_table");
  const src = clean(s.source, "raw.my_table");
  const ts = clean(s.ts, "event_ts");
  const cmd = ([a, b]: [string, string]) => s.out === "microbatch"
    ? `dbt run --select ${m} --event-time-start "${a}" --event-time-end "${b}"`
    : s.out === "vars"
      ? `dbt run --select ${m} --vars '{"backfill_start": "${a}", "backfill_end": "${b}"}'`
      : `-- ${a} to ${b}\nbegin;\ndelete from ${tgt}\n where ${ts} >= '${a}' and ${ts} < '${b}';\ninsert into ${tgt}\nselect * from ${src}\n where ${ts} >= '${a}' and ${ts} < '${b}';\ncommit;`;
  const sep = s.out === "sql" ? "\n\n" : "\n";
  const commands = [
    `${s.out === "sql" ? "--" : "#"} ${fmtNum(list.length)} chunks, oldest first. Run ${conc} at a time.`,
    ...list.map(cmd),
  ].join(sep);

  const logSql = `-- One row per chunk: rerun anything not 'done'
create table if not exists ops.backfill_log (
  model        varchar,
  chunk_start  date,
  chunk_end    date,
  status       varchar,   -- pending, running, done, failed
  rows_loaded  bigint,
  source_rows  bigint,
  started_at   timestamp,
  finished_at  timestamp
);`;

  const text = () => [
    `Backfill plan for ${m}`,
    `${s.begin} to ${s.end} (${fmtNum(days)} days), about ${fmtNum(rows)} rows`,
    `${fmtNum(list.length)} ${s.grain} chunks of about ${fmtNum(rowsPerChunk)} rows; ${dur(chunkMin)} per chunk at ${fmtNum(rate)} rows a second plus ${fmtNum(n("overhead"))}s overhead`,
    `${conc} concurrent jobs, ${fmtNum(waves)} waves, ${s.retry}% retry allowance: about ${dur(wallMin)} of running, ${fmtNum(calendarDays, 1)} calendar days at ${hpd} hours a day`,
    tooBig ? `Warning: a chunk takes more than half the ${timeout}-minute job timeout. Use ${finer ?? "smaller"} chunks.` : "",
    "", commands,
  ].filter(Boolean).join("\n");

  const field = (k: keyof State, label: string, hint?: string, type = "text") => (
    <label key={k} className="rs-field">
      <span>{label}</span>
      <input type={type} inputMode={type === "text" ? "decimal" : undefined} value={String(s[k] ?? "")} onChange={(e) => update({ [k]: e.target.value } as Partial<State>)} />
      {hint && <small className="rs-hint">{hint}</small>}
    </label>
  );

  return (
    <div className="rs-toolwrap">
      <section id="inputs" className="rs-card">
        <header className="rs-card-head">
          <p className="rs-label">Step 1 · The history and your throughput</p>
          <h2>How much history, and how fast one job loads it</h2>
          <p className="rs-note"><b>The starting figures are an illustrative example</b> of 5 billion events over nearly four years. Load one trial chunk first and enter the rows a second you measured: that single figure drives the whole plan.</p>
          <Terms items={[
            ["Backfill", "Loading or reloading historical data into a table, for example after a new model, a logic fix or a migration."],
            ["Chunk", "One date range of the history, loaded as its own job, such as one week."],
            ["Throughput", "Rows one job loads per second. Measure it on one trial chunk."],
            ["Concurrency", "How many chunk jobs run at the same time."],
            ["Idempotent", "Safe to run twice: a rerun gives the same result instead of duplicating rows."],
            ["Half-open range", "A range that includes its start and excludes its end, so a row on the boundary belongs to one chunk only."],
          ]} />
        </header>
        <div className="rs-cost-fields">
          {field("begin", "History starts", undefined, "date")}
          {field("end", "Load up to (exclusive)", undefined, "date")}
          {field("totalRows", "Rows in that range (estimate)", "From a count on the source, or rows a day times days.")}
          <label className="rs-field">
            <span>Chunk size</span>
            <select value={s.grain} onChange={(e) => update({ grain: e.target.value as Grain })}>
              <option value="day">One day</option><option value="week">One week</option><option value="month">One month</option>
            </select>
            <small className="rs-hint">Match a partition boundary on the target where you can.</small>
          </label>
          {field("rowsPerSec", "Rows per second, one job", "Measured from a trial chunk: rows loaded ÷ seconds it took.")}
          {field("overhead", "Overhead per chunk (seconds)", "Job start, compile, warehouse resume, metadata queries.")}
          {field("concurrency", "Jobs at once", "Capped by warehouse concurrency, source database load and API rate limits.")}
          {field("retry", "Retry allowance (%)", "Time for chunks that fail and rerun.")}
          {field("hoursPerDay", "Hours a day you can run", "24, or an off-peak window if the source is a production database.")}
          {field("timeout", "Job timeout (minutes)", "Your orchestrator's or warehouse's statement timeout.")}
        </div>
      </section>

      <section id="plan" className="rs-card" aria-live="polite">
        <header className="rs-card-head">
          <p className="rs-label">Step 2 · The plan</p>
          <h2>{list.length ? <>{fmtNum(list.length)} chunks, about {dur(wallMin)} of running</> : "Enter a valid date range"}</h2>
        </header>
        <div className="rs-kpis">
          <div><small>Rows per chunk</small><b>{fmtNum(rowsPerChunk)}</b></div>
          <div className={tooBig ? "is-warn" : undefined}><small>Time per chunk</small><b>{dur(chunkMin)}</b></div>
          <div><small>Waves of {conc}</small><b>{fmtNum(waves)}</b></div>
          <div><small>Calendar days at {hpd} h a day</small><b>{fmtNum(calendarDays, 1)}</b></div>
        </div>
        <p className={`rs-verdict ${tooBig ? "is-warn" : "is-good"}`}>
          {tooBig
            ? <>Each chunk needs {dur(chunkMin)}, more than half the {fmtNum(timeout)}-minute timeout. One slow chunk will fail and retry from the start. {finer ? <>Switch to {finer} chunks.</> : "Raise throughput or the timeout."}</>
            : tooSmall
              ? <>Chunks finish in under two minutes, so start-up overhead is a large share of the run. Larger chunks would finish sooner.</>
              : <>Each chunk finishes well inside the timeout, so a failure costs one chunk, not the backfill.</>}
        </p>

        {list.length > 0 && <PlainSummary>reloading this history takes about {dur(wallMin)} of running, or {fmtNum(Math.max(1, Math.ceil(calendarDays)))} calendar day{Math.ceil(calendarDays) > 1 ? "s" : ""} at {hpd} hours a day. Existing dashboards keep working on the current table until the new data is checked and swapped in.</PlainSummary>}

        <div className="rs-seg rs-gap" role="group" aria-label="Command style">
          <span>Output</span>
          {([["microbatch", "dbt microbatch"], ["vars", "dbt with vars"], ["sql", "Plain SQL"]] as [Out, string][]).map(([id, label]) => (
            <button key={id} type="button" className={s.out === id ? "is-on" : undefined} aria-pressed={s.out === id} onClick={() => update({ out: id })}>{label}</button>
          ))}
        </div>
        <div className="rs-cost-fields rs-gap">
          {s.out !== "sql" ? field("model", "dbt model") : <>{field("target", "Target table")}{field("source", "Source table")}</>}
          {field("ts", "Timestamp column")}
        </div>
        <CodeBlock label="Chunk commands" lang={s.out === "sql" ? "SQL" : "shell"} code={commands} />
        {s.out === "sql" && <p className="rs-muted">The transaction syntax works on Snowflake, BigQuery, Postgres and Redshift. On Databricks, use <code>INSERT INTO … REPLACE WHERE</code> on a Delta table instead of delete and insert. The insert assumes source and target have the same columns in the same order; list them if not.</p>}
        {s.out === "vars" && <p className="rs-muted">The model needs a branch that filters on <code>backfill_start</code> and <code>backfill_end</code> instead of the incremental filter. The <a href="/resources/dbt-incremental-strategy-picker">dbt incremental strategy picker</a> generates it.</p>}
        <CodeBlock label="Progress table" lang="SQL" code={logSql} />
      </section>

      <section id="checklist" className="rs-card">
        <header className="rs-card-head">
          <p className="rs-label">Step 3 · Before you start</p>
          <h2>Make every chunk safe to run twice</h2>
          <p className="rs-muted">A backfill of this size will have failures. These checks make a rerun replace data rather than duplicate it.</p>
        </header>
        <ul className="rs-plainlist">
          <li><b>Replace, never append.</b> Each chunk deletes and reinserts its own range in one transaction, or overwrites whole partitions. An append that fails halfway leaves partial data that a rerun doubles.</li>
          <li><b>Half-open ranges.</b> Use <code>&gt;= start and &lt; end</code> so a row on a boundary belongs to exactly one chunk. Fix the time zone, ideally UTC.</li>
          <li><b>Oldest first.</b> If the model looks back at earlier data, loading in date order means each chunk reads history that is already there.</li>
          <li><b>Load beside, then swap.</b> Build into a new table and swap it in when the counts agree (Snowflake <code>ALTER TABLE … SWAP WITH</code>, or a rename or view switch elsewhere). Dashboards keep reading the old table until then.</li>
          <li><b>Cap the bill.</b> Set <code>maximum_bytes_billed</code> on BigQuery jobs or a resource monitor on the Snowflake warehouse, sized from the <a href="/resources/warehouse-query-cost-estimator">cost estimator</a>.</li>
          <li><b>Count every chunk.</b> Write source rows and loaded rows to the progress table and stop on a mismatch, instead of finding it at the end.</li>
          <li><b>Pause what reads the target.</b> Hold downstream schedules and incremental runs on the same table, or they will race the backfill.</li>
        </ul>
      </section>

      <ToolActions getText={text} copyLabel="Copy the plan" onReset={reset} resetLabel="Restore the example" confirmText="Replace your figures with the example?" />
    </div>
  );
}
