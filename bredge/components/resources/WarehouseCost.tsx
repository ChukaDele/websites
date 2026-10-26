"use client";
import { useStoredState } from "./useStoredState";
import { ToolActions, fmtNum, toNum } from "./ToolActions";
import { PlainSummary, Terms } from "./Explainers";

/* Warehouse query cost and scan estimator for one dbt model on a large table.
 * Bytes per run follow BigQuery's published on-demand DML rule: a statement is
 * billed for the bytes it reads (q), plus the size of the target table (t), or
 * of the partitions it updates (t'), when a MERGE has an UPDATE or DELETE
 * clause. Compute-time platforms (Snowflake credits, Databricks DBUs) are
 * estimated from a measured runtime, scaled by bytes: a stated assumption.
 * No prices are built in: rates are the visitor's own. */

type Mode = "bytes" | "time";
type State = {
  mode: Mode;
  totalRows: string; newRows: string; readBytes: string; keyBytes: string; lookback: string; partsUpdated: string; runsPerDay: string;
  rate: string; cur: string;
  size: string; customRate: string; baseline: string; cold: boolean; creditPrice: string;
  h: { int: string; float: string; numeric: string; bool: string; time: string; str: string; strLen: string };
};

const INITIAL: State = {
  mode: "bytes",
  totalRows: "2000000000", newRows: "5000000", readBytes: "120", keyBytes: "16", lookback: "3", partsUpdated: "4", runsPerDay: "24",
  rate: "", cur: "$",
  size: "M", customRate: "", baseline: "600", cold: true, creditPrice: "",
  h: { int: "4", float: "2", numeric: "0", bool: "1", time: "2", str: "3", strLen: "12" },
};

/* Snowflake standard (Gen1) warehouse credits per hour, from Snowflake's
 * "Overview of warehouses" documentation. */
const SIZES: { id: string; label: string; credits: number }[] = [
  { id: "XS", label: "X-Small", credits: 1 }, { id: "S", label: "Small", credits: 2 }, { id: "M", label: "Medium", credits: 4 },
  { id: "L", label: "Large", credits: 8 }, { id: "XL", label: "X-Large", credits: 16 }, { id: "2XL", label: "2X-Large", credits: 32 },
  { id: "3XL", label: "3X-Large", credits: 64 }, { id: "4XL", label: "4X-Large", credits: 128 }, { id: "custom", label: "Other (enter per hour)", credits: 0 },
];

const TIB = 1024 ** 4;
const DAYS = 30;

function bytes(n: number) {
  if (!Number.isFinite(n)) return "n/a";
  const units = ["B", "KiB", "MiB", "GiB", "TiB", "PiB"];
  let i = 0; let v = n;
  while (v >= 1024 && i < units.length - 1) { v /= 1024; i++; }
  return `${fmtNum(v, v < 10 && i > 0 ? 2 : v < 100 && i > 0 ? 1 : 0)} ${units[i]}`;
}

type Field = { key: keyof State; label: string; hint: string };
const TABLE_FIELDS: Field[] = [
  { key: "totalRows", label: "Rows in the table (all history)", hint: "Source and model output, roughly the same grain." },
  { key: "newRows", label: "New or changed rows per day", hint: "From your loader's row counts or the table's daily growth." },
  { key: "readBytes", label: "Bytes per row of the columns the model reads", hint: "Logical (uncompressed) bytes. Use the helper below or a dry run." },
  { key: "keyBytes", label: "Bytes per row of the merge key and partition column", hint: "e.g. INT64 id (8) + DATE (8) = 16. STRING keys are 2 + their length." },
  { key: "lookback", label: "Lookback days for late data", hint: "Days before today reprocessed every run." },
  { key: "partsUpdated", label: "Daily partitions an update run touches", hint: "How far back changed rows reach. Usually lookback + 1, more if old rows get updated." },
  { key: "runsPerDay", label: "Runs per day", hint: "Hourly = 24. Include CI and ad hoc reruns if they hit production." },
];

export function WarehouseCost() {
  const [s, set, reset] = useStoredState<State>("bredge:rs:warehouse-cost:v1", INITIAL);
  const h = { ...INITIAL.h, ...s.h };
  const n = (k: keyof State) => Math.max(0, toNum(String(s[k] ?? "")));
  const update = (patch: Partial<State>) => set((p) => ({ ...p, ...patch }));

  const rows = n("totalRows");
  const perDay = n("newRows");
  const rb = n("readBytes");
  const kb = n("keyBytes");
  const windowDays = Math.max(1, Math.round(n("lookback")) + 1);
  const parts = Math.max(1, Math.round(n("partsUpdated")));
  const runs = n("runsPerDay");

  const S = rows * rb;                    // full read of the selected columns
  const T = rows * rb;                    // target table size (assumes the output keeps those columns)
  const K = rows * kb;                    // key and partition columns across the whole target
  const W = perDay * windowDays * rb;     // the lookback window, read from a partitioned source
  const Kw = perDay * windowDays * kb;    // key columns inside the window only
  const P = Math.min(T, perDay * parts * rb); // partitions an update touches

  const scenarios = [
    { id: "a", name: "Full refresh", config: "materialized='table'", run: S, formula: "q = rows × bytes read", why: "Rebuilds everything each run. Predictable, and safe to rerun." },
    { id: "b", name: "Merge into an unpartitioned table", config: "incremental, merge, no partition_by", run: S + K + T, formula: "q (whole source, filter cannot prune, plus key scan) + t (whole target)", why: "The is_incremental() filter cannot prune an unpartitioned source, and a MERGE with an UPDATE clause is billed for the whole target. Often dearer than a rebuild." },
    { id: "c", name: "Merge, partitioned, no incremental_predicates", config: "merge + partition_by", run: W + K + P, formula: "q′ (source window + key scan of every target partition) + t′ (partitions updated)", why: "Source reads are pruned to the window, but the ON clause still scans the key column in every target partition." },
    { id: "d", name: "Merge, partitioned, with incremental_predicates", config: "merge + partition_by + incremental_predicates", run: W + Kw + P, formula: "q′ (source window + key scan of window) + t′ (partitions updated)", why: "Target scan limited to the window. Only safe if updates never reach rows older than the predicate." },
    { id: "e", name: "insert_overwrite or microbatch on the window", config: "insert_overwrite (static partitions) or microbatch", run: W + W, formula: "q′ (source window) + t′ (partitions replaced)", why: "Replaces whole partitions in the window. Dynamic partitions add a temporary table and a max-partition query on top." },
  ].map((x) => ({ ...x, month: x.run * runs * DAYS }));

  const rate = toNum(s.rate);
  const cur = s.cur || "$";
  const money = (v: number, dp = 0) => (Number.isFinite(v) ? `${cur}${fmtNum(v, dp)}` : "n/a");

  // Compute-time model
  const sizeRow = SIZES.find((x) => x.id === s.size) ?? SIZES[2];
  const perHour = sizeRow.id === "custom" ? n("customRate") : sizeRow.credits;
  const base = n("baseline");
  const creditPrice = toNum(s.creditPrice);
  const timeRows = scenarios.map((x) => {
    const secs = S > 0 ? base * (x.run / S) : 0;
    const billed = s.cold ? Math.max(60, secs) : secs;
    const credits = (perHour * billed) / 3600 * runs * DAYS;
    return { ...x, secs, billed, credits };
  });

  const best = [...scenarios].sort((a, b) => a.month - b.month)[0];
  const full = scenarios[0];
  const unpart = scenarios[1];
  const mode: Mode = s.mode === "time" ? "time" : "bytes";
  const max = Math.max(1, ...(mode === "bytes" ? scenarios.map((x) => x.month) : timeRows.map((x) => x.credits)));

  // Row-size helper (BigQuery logical sizes)
  const hn = (k: keyof State["h"]) => Math.max(0, toNum(h[k]));
  const helperBytes = hn("int") * 8 + hn("float") * 8 + hn("numeric") * 16 + hn("bool") * 1 + hn("time") * 8 + hn("str") * (2 + hn("strLen"));

  const text = () => [
    "Warehouse cost and scan estimate for one dbt model (illustrative: confirm with a dry run or query history)",
    `Table: ${fmtNum(rows)} rows, ${fmtNum(perDay)} new or changed rows a day, ${fmtNum(rb)} bytes read per row, ${fmtNum(kb)} key bytes per row, lookback ${windowDays - 1} days, ${parts} partitions touched, ${fmtNum(runs)} runs a day`,
    "",
    ...(mode === "bytes"
      ? scenarios.map((x) => `- ${x.name}: ${bytes(x.run)} per run, ${bytes(x.month)} a month${rate > 0 ? `, ${money((x.month / TIB) * rate)} a month at ${money(rate, 2)} per TiB` : ""}`)
      : timeRows.map((x) => `- ${x.name}: about ${fmtNum(x.secs)} s per run (${fmtNum(x.billed)} s billed), ${fmtNum(x.credits, 1)} credits or DBUs a month${creditPrice > 0 ? `, ${money(x.credits * creditPrice)}` : ""}`)),
    "",
    `Cheapest pattern on these inputs: ${best.name}.`,
  ].join("\n");

  const field = (f: Field) => (
    <label key={f.key} className="rs-field">
      <span>{f.label}</span>
      <input inputMode="decimal" value={String(s[f.key] ?? "")} onChange={(e) => update({ [f.key]: e.target.value } as Partial<State>)} />
      <small className="rs-hint">{f.hint}</small>
    </label>
  );

  return (
    <div className="rs-toolwrap">
      <section id="inputs" className="rs-card">
        <header className="rs-card-head">
          <p className="rs-label">Step 1 · The table and the schedule</p>
          <h2>Describe one model on one large table</h2>
          <div className="rs-seg" role="group" aria-label="How your warehouse bills">
            <span>Billing</span>
            <button type="button" className={mode === "bytes" ? "is-on" : undefined} aria-pressed={mode === "bytes"} onClick={() => update({ mode: "bytes" })}>Bytes scanned (BigQuery on-demand)</button>
            <button type="button" className={mode === "time" ? "is-on" : undefined} aria-pressed={mode === "time"} onClick={() => update({ mode: "time" })}>Compute time (Snowflake, Databricks, BigQuery editions)</button>
          </div>
          <p className="rs-note"><b>The starting figures are an illustrative example</b> of a 2-billion-row event table run hourly. They are not benchmarks. Replace them with your own row counts and a dry-run byte count for your model.</p>
          <Terms items={[
            ["dbt model", "One SQL file that dbt turns into a table in your warehouse. Each run rebuilds or updates it."],
            ["Bytes scanned", "The data a query reads. BigQuery on-demand bills this, in logical (uncompressed) bytes."],
            ["TiB", "Tebibyte: 1,099,511,627,776 bytes. BigQuery bills on-demand queries per TiB."],
            ["Full refresh", "Drop and rebuild the whole table every run."],
            ["Incremental / merge", "Process only new or changed rows and update the table in place, matching rows on a unique key."],
            ["Partition", "A slice of a table, usually one day. Queries that filter on the partition column read only the slices they need."],
            ["Lookback", "How many recent days each run reprocesses, so rows that arrive late are still picked up."],
            ["insert_overwrite / microbatch", "Replace whole days (partitions) in the lookback window instead of matching row by row."],
            ["Credits / DBUs", "The compute units Snowflake and Databricks bill by the hour of warehouse time."],
          ]} />
        </header>
        <div className="rs-cost-fields">{TABLE_FIELDS.map(field)}</div>

        <details className="rs-helper dd-disclosure">
          <summary>Row-size helper: logical bytes per row by data type (BigQuery)</summary>
          <p className="rs-muted">BigQuery bills logical bytes: INT64, FLOAT64, DATE, DATETIME, TIME and TIMESTAMP are 8 bytes, NUMERIC 16, BOOL 1, and STRING is 2 bytes plus its UTF-8 length. Count only the columns your model selects.</p>
          <div className="rs-cost-fields rs-cost-fields-sm">
            {([
              ["int", "INT64 columns"], ["float", "FLOAT64 columns"], ["numeric", "NUMERIC columns"], ["bool", "BOOL columns"],
              ["time", "DATE, DATETIME or TIMESTAMP columns"], ["str", "STRING columns"], ["strLen", "Average string length (bytes)"],
            ] as [keyof State["h"], string][]).map(([k, label]) => (
              <label key={k} className="rs-field">
                <span>{label}</span>
                <input inputMode="decimal" value={h[k]} onChange={(e) => set((p) => ({ ...p, h: { ...INITIAL.h, ...p.h, [k]: e.target.value } }))} />
              </label>
            ))}
          </div>
          <p className="rs-verdict">Estimated <b>{fmtNum(helperBytes)} bytes per row</b>. <button type="button" className="rs-linkbtn" onClick={() => update({ readBytes: String(helperBytes) })}>Use this as bytes read per row</button></p>
        </details>
      </section>

      <section id="rates" className="rs-card">
        <header className="rs-card-head">
          <p className="rs-label">Step 2 · Your rate</p>
          <h2>{mode === "bytes" ? "What you pay per TiB scanned" : "What you pay for compute time"}</h2>
          <p className="rs-muted">{mode === "bytes"
            ? "Enter the on-demand rate from your contract or Google Cloud's pricing page for your region. Leave it blank to see volumes only."
            : "Under compute-time pricing you pay for how long a warehouse runs, not for bytes. Bytes still drive runtime, so enter one measured runtime for the full refresh and the estimate scales the others by bytes read."}</p>
        </header>
        {mode === "bytes" ? (
          <div className="rs-cost-fields">
            <label className="rs-field"><span>Currency symbol</span><input value={s.cur} maxLength={3} onChange={(e) => update({ cur: e.target.value })} /></label>
            <label className="rs-field"><span>Rate per TiB scanned</span><input inputMode="decimal" value={s.rate} placeholder="Your rate" onChange={(e) => update({ rate: e.target.value })} /><small className="rs-hint">On-demand list rates vary by region; editions and reservations bill slots instead.</small></label>
          </div>
        ) : (
          <div className="rs-cost-fields">
            <label className="rs-field">
              <span>Warehouse size</span>
              <select value={sizeRow.id} onChange={(e) => update({ size: e.target.value })}>
                {SIZES.map((x) => <option key={x.id} value={x.id}>{x.label}{x.credits ? ` · ${x.credits} credit${x.credits > 1 ? "s" : ""}/hour` : ""}</option>)}
              </select>
              <small className="rs-hint">Snowflake standard warehouse credits per hour. For Databricks, choose Other and enter DBUs per hour.</small>
            </label>
            {sizeRow.id === "custom" && <label className="rs-field"><span>Credits or DBUs per hour</span><input inputMode="decimal" value={s.customRate} onChange={(e) => update({ customRate: e.target.value })} /></label>}
            <label className="rs-field"><span>Measured full-refresh runtime (seconds)</span><input inputMode="decimal" value={s.baseline} onChange={(e) => update({ baseline: e.target.value })} /><small className="rs-hint">From query history (Snowflake QUERY_HISTORY, Databricks query history).</small></label>
            <label className="rs-field"><span>Currency symbol</span><input value={s.cur} maxLength={3} onChange={(e) => update({ cur: e.target.value })} /></label>
            <label className="rs-field"><span>Price per credit or DBU</span><input inputMode="decimal" value={s.creditPrice} placeholder="Your contract price" onChange={(e) => update({ creditPrice: e.target.value })} /></label>
            <label className="rs-field rs-field-check"><input type="checkbox" checked={!!s.cold} onChange={(e) => update({ cold: e.target.checked })} /><span>Warehouse resumes for each run (Snowflake bills at least 60 seconds per resume)</span></label>
          </div>
        )}
      </section>

      <section id="compare" className="rs-card" aria-live="polite">
        <header className="rs-card-head">
          <p className="rs-label">Step 3 · Five ways to build the same model</p>
          <h2>{mode === "bytes" ? "Which build pattern scans the fewest bytes?" : "Which build pattern uses the least compute?"}</h2>
        </header>

        <ul className="rs-cost-bars">
          {(mode === "bytes" ? scenarios : timeRows).map((x) => {
            const v = mode === "bytes" ? x.month : (x as (typeof timeRows)[number]).credits;
            return (
              <li key={x.id} className={x.id === best.id ? "is-frac" : x.id === "b" ? "is-warn" : undefined}>
                <span><b>{x.name}</b><small>{x.config}</small></span>
                <span className="rs-track"><i style={{ width: `${Math.max(0.5, (v / max) * 100)}%` }} /></span>
                <strong>{mode === "bytes" ? bytes(v) : `${fmtNum(v, v < 10 ? 1 : 0)} cr`}</strong>
              </li>
            );
          })}
        </ul>

        <div className="rs-table-scroll">
          <table className="rs-cost-table rs-cost-table-left">
            <thead>
              <tr><th scope="col">Pattern</th>{mode === "bytes" ? <><th scope="col">Per run</th><th scope="col">Per month</th><th scope="col">Cost a month</th></> : <><th scope="col">Runtime</th><th scope="col">Credits a month</th><th scope="col">Cost a month</th></>}</tr>
            </thead>
            <tbody>
              {mode === "bytes"
                ? scenarios.map((x) => <tr key={x.id}><th scope="row">{x.name}<small>{x.formula}</small></th><td>{bytes(x.run)}</td><td>{bytes(x.month)}</td><td>{rate > 0 ? money((x.month / TIB) * rate) : "Enter a rate"}</td></tr>)
                : timeRows.map((x) => <tr key={x.id}><th scope="row">{x.name}<small>{x.why}</small></th><td>{fmtNum(x.secs)} s{x.billed > x.secs ? ` (${fmtNum(x.billed)} billed)` : ""}</td><td>{fmtNum(x.credits, 1)}</td><td>{creditPrice > 0 ? money(x.credits * creditPrice) : "Enter a price"}</td></tr>)}
            </tbody>
          </table>
        </div>

        <p className="rs-verdict is-good">
          On these inputs the cheapest pattern is <b>{best.name.toLowerCase()}</b>, at {full.month > 0 ? `${fmtNum((best.month / full.month) * 100, 1)}%` : "n/a"} of the bytes of a full refresh.
          {unpart.month > full.month && <> A merge into an unpartitioned table bills <b>{fmtNum(unpart.month / Math.max(1, full.month), 1)}×</b> the bytes of rebuilding it, because the whole target is billed on every run.</>}
        </p>

        <PlainSummary>
          keeping this one table up to date costs between {rate > 0 && mode === "bytes" ? money((best.month / TIB) * rate) : bytes(best.month)} and {rate > 0 && mode === "bytes" ? money((Math.max(...scenarios.map((x) => x.month)) / TIB) * rate) : bytes(Math.max(...scenarios.map((x) => x.month)))} a month{mode === "time" ? " in bytes read" : ""}, depending only on how the model is built. The data and the dashboards stay the same; the bill changes.
        </PlainSummary>

        <h3>Read this before you quote it</h3>
        <ul className="rs-plainlist">
          <li><b>It is an estimate.</b> Run the compiled SQL as a BigQuery dry run (or check bytes scanned in Snowflake query history) and replace the per-row figures with what it reports. For clustered tables a dry run is an upper bound.</li>
          <li><b>Why merge can cost more than a rebuild.</b> BigQuery bills a MERGE with an UPDATE or DELETE clause for the bytes it reads plus the size of the table it updates, or of the partitions it updates if the table is partitioned. dbt&apos;s merge has an UPDATE clause whenever unique_key is set.</li>
          <li><b>incremental_predicates trade cost for risk.</b> They stop the target scan, but rows older than the predicate are never matched, so a late update to an old row becomes a duplicate.</li>
          <li><b>Compute-time platforms.</b> Snowflake prunes micro-partitions using min and max metadata, so scan reduction depends on how well the table is clustered on the filter column. Linear scaling of runtime with bytes is an assumption; measure after the change.</li>
          <li><b>Not included:</b> storage, streaming inserts, BI queries reading the table, the 10 MB minimum billed per table referenced, and any free tier.</li>
        </ul>
        <p className="rs-muted">Next: <a href="/resources/dbt-incremental-strategy-picker">pick the incremental strategy and copy its config</a> · <a href="/resources/data-freshness-sla-calculator">check what hourly runs buy you in freshness</a></p>
      </section>

      <ToolActions getText={text} copyLabel="Copy the estimate" onReset={reset} resetLabel="Restore the example" confirmText="Replace your figures with the example figures?" />
    </div>
  );
}
