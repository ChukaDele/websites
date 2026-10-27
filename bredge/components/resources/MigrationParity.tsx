"use client";
import { useStoredState } from "./useStoredState";
import { ToolActions } from "./ToolActions";
import { CodeBlock } from "./CodeBlock";
import { PlainSummary, Terms } from "./Explainers";

/* Migration parity SQL generator. One description of a table (keys, a date
 * column, typed columns to compare) produces the same four checks in the
 * source dialect and the target dialect, with identical output columns so the
 * results can be diffed: counts by period, key health, column profiles and a
 * row fingerprint by period. The fingerprint hashes a canonical text form of
 * each row (decimals as scaled integers, timestamps as epoch seconds, dates as
 * ISO text) with MD5 and sums the first 28 bits, so engines that format values
 * differently still agree. */

type Dialect = "snowflake" | "bigquery" | "postgres" | "sqlserver";
type ColType = "string" | "integer" | "decimal" | "date" | "timestamp" | "boolean";
type Col = { name: string; type: ColType; scale: string };
type State = { src: Dialect; tgt: Dialect; srcTable: string; tgtTable: string; keys: string; dateCol: string; grain: "year" | "month" | "day"; cols: Col[] };

const INITIAL: State = {
  src: "sqlserver", tgt: "snowflake", srcTable: "dbo.invoice_lines", tgtTable: "analytics.raw.invoice_lines",
  keys: "invoice_id, line_no", dateCol: "invoice_date", grain: "month",
  cols: [
    { name: "customer_id", type: "string", scale: "" },
    { name: "quantity", type: "integer", scale: "" },
    { name: "net_amount", type: "decimal", scale: "2" },
    { name: "invoice_date", type: "date", scale: "" },
    { name: "updated_at", type: "timestamp", scale: "" },
  ],
};

const DL: { id: Dialect; label: string }[] = [{ id: "snowflake", label: "Snowflake" }, { id: "bigquery", label: "BigQuery" }, { id: "postgres", label: "Postgres" }, { id: "sqlserver", label: "SQL Server" }];
const ident = (s: string) => s.trim().replace(/[^A-Za-z0-9_.]/g, "");
const NULL = "'<null>'";

function period(d: Dialect, col: string, grain: State["grain"]) {
  const len = grain === "year" ? 4 : grain === "month" ? 7 : 10;
  switch (d) {
    case "snowflake": return `TO_CHAR(${col}, '${grain === "year" ? "YYYY" : grain === "month" ? "YYYY-MM" : "YYYY-MM-DD"}')`;
    case "bigquery": return `FORMAT_DATE('${grain === "year" ? "%Y" : grain === "month" ? "%Y-%m" : "%Y-%m-%d"}', DATE(${col}))`;
    case "postgres": return `to_char(${col}, '${grain === "year" ? "YYYY" : grain === "month" ? "YYYY-MM" : "YYYY-MM-DD"}')`;
    default: return `CONVERT(char(${len}), ${col}, 126)`;
  }
}

const asText = (d: Dialect, e: string) => (d === "bigquery" ? `CAST(${e} AS STRING)` : d === "sqlserver" ? `CAST(${e} AS varchar(60))` : d === "postgres" ? `(${e})::text` : `TO_VARCHAR(${e})`);
const textType = (d: Dialect) => (d === "bigquery" ? "STRING" : d === "sqlserver" ? "varchar(60)" : d === "postgres" ? "text" : "VARCHAR");

/** A sortable, engine-neutral value for one column: integers for numbers and
 *  timestamps, ISO text for dates, '1'/'0' for booleans, raw text for strings. */
function neutral(d: Dialect, c: Col): { expr: string; numeric: boolean } {
  const x = ident(c.name);
  const scale = Math.max(0, Math.min(12, Math.round(Number(c.scale) || 0)));
  const mult = `1${"0".repeat(scale)}`;
  switch (c.type) {
    case "integer": return { expr: x, numeric: true };
    case "decimal": return { expr: d === "bigquery" ? `CAST(ROUND(${x} * ${mult}) AS INT64)` : d === "sqlserver" ? `CAST(ROUND(${x} * ${mult}, 0) AS bigint)` : d === "postgres" ? `round(${x} * ${mult})::bigint` : `ROUND(${x} * ${mult})::NUMBER(38,0)`, numeric: true };
    case "timestamp": return { expr: d === "bigquery" ? `UNIX_SECONDS(TIMESTAMP(${x}))` : d === "sqlserver" ? `DATEDIFF_BIG(second, '1970-01-01', ${x})` : d === "postgres" ? `extract(epoch from ${x})::bigint` : `DATE_PART(epoch_second, ${x})`, numeric: true };
    case "date": return { expr: period(d, x, "day"), numeric: false };
    case "boolean": return { expr: d === "sqlserver" ? `CASE WHEN ${x} = 1 THEN '1' WHEN ${x} = 0 THEN '0' END` : `CASE WHEN ${x} THEN '1' WHEN NOT ${x} THEN '0' END`, numeric: false };
    default: return { expr: d === "sqlserver" ? `CAST(${x} AS varchar(max))` : x, numeric: false };
  }
}

/** Canonical text for one value: identical on every engine for the same data. */
function canon(d: Dialect, c: Col) {
  const n = neutral(d, c);
  return `COALESCE(${n.numeric ? asText(d, n.expr) : n.expr}, ${NULL})`;
}

function joinText(d: Dialect, parts: string[]) {
  if (d === "bigquery" || d === "sqlserver") return `CONCAT(${parts.join(", '|', ")})`;
  return parts.join(" || '|' || ");
}
function hash28(d: Dialect, s: string) {
  switch (d) {
    case "snowflake": return `TO_NUMBER(SUBSTR(MD5(${s}), 1, 7), 'XXXXXXX')`;
    case "bigquery": return `CAST(CONCAT('0x', SUBSTR(TO_HEX(MD5(${s})), 1, 7)) AS INT64)`;
    case "postgres": return `('x' || lpad(substr(md5(${s}), 1, 7), 8, '0'))::bit(32)::int`;
    default: return `CONVERT(bigint, CONVERT(varbinary(4), '0' + SUBSTRING(CONVERT(char(32), HASHBYTES('MD5', ${s}), 2), 1, 7), 2))`;
  }
}

function sql(d: Dialect, table: string, s: State) {
  const t = d === "bigquery" ? `\`${ident(table) || "my_dataset.my_table"}\`` : ident(table) || "my_table";
  const keys = s.keys.split(",").map(ident).filter(Boolean);
  const k = keys.length ? keys : ["id"];
  const dc = ident(s.dateCol) || "created_at";
  const p = period(d, dc, s.grain);
  const cols = s.cols.filter((c) => ident(c.name));
  const keyText = (x: string) => (d === "sqlserver" ? `CAST(${x} AS varchar(400))` : asText(d, x));
  const rowText = joinText(d, [...k.map((x) => `COALESCE(${keyText(x)}, ${NULL})`), ...cols.filter((c) => !k.includes(ident(c.name))).map((c) => canon(d, c))]);
  const nullKey = k.map((x) => `${x} IS NULL`).join(" OR ");
  const cnt = d === "sqlserver" ? "COUNT_BIG(*)" : "COUNT(*)";
  const one = d === "sqlserver" ? "CAST(1 AS bigint)" : "1";
  const prof = cols.map((c) => {
    const x = ident(c.name);
    const n = neutral(d, c);
    const nulls = `SUM(CASE WHEN ${x} IS NULL THEN ${one} ELSE 0 END)`;
    const sum = c.type === "integer" || c.type === "decimal" ? asText(d, `SUM(${n.expr})`) : `CAST(NULL AS ${textType(d)})`;
    const target = c.type === "string" ? (d === "sqlserver" ? `LEN(${x})` : `LENGTH(${x})`) : n.expr;
    const mm = (f: "MIN" | "MAX") => asText(d, `${f}(${target})`);
    return `SELECT '${x}' AS column_name, ${cnt} AS row_count, ${nulls} AS null_count,\n       ${sum} AS sum_value, ${mm("MIN")} AS min_value, ${mm("MAX")} AS max_value\nFROM ${t}`;
  });
  const distinctKeys = `SELECT ${cnt} FROM (SELECT DISTINCT ${k.join(", ")} FROM ${t}) AS k`;
  return `-- ${DL.find((x) => x.id === d)?.label}: parity checks for ${t}
-- 1. Rows by ${s.grain}
SELECT ${p} AS period,
       ${cnt} AS row_count
FROM ${t}
GROUP BY ${p}
ORDER BY period;

-- 2. Key health: duplicates and missing keys
SELECT ${cnt} AS row_count,
       (${distinctKeys}) AS distinct_keys,
       SUM(CASE WHEN ${nullKey} THEN ${one} ELSE 0 END) AS null_key_rows
FROM ${t};

-- 3. Column profiles: decimals as scaled integers, timestamps as epoch\n--    seconds, strings as lengths
${prof.length ? prof.join("\nUNION ALL\n") + "\nORDER BY column_name;" : "-- Add columns to profile."}

-- 4. Row fingerprint by ${s.grain}: equal sums mean equal rows
SELECT ${p} AS period,
       ${cnt} AS row_count,
       SUM(${hash28(d, rowText)}) AS row_fingerprint
FROM ${t}
GROUP BY ${p}
ORDER BY period;`;
}

export function MigrationParity() {
  const [raw, set, reset] = useStoredState<State>("bredge:rs:migration-parity:v1", INITIAL);
  const s: State = { ...INITIAL, ...raw, cols: raw.cols ?? INITIAL.cols };
  const update = (patch: Partial<State>) => set((p) => ({ ...p, ...patch }));
  const setCol = (i: number, patch: Partial<Col>) => set((p) => { const cols = [...(p.cols ?? INITIAL.cols)]; cols[i] = { ...cols[i], ...patch }; return { ...p, cols }; });
  const addCol = () => set((p) => ({ ...p, cols: [...(p.cols ?? INITIAL.cols), { name: "", type: "string", scale: "" }] }));
  const removeCol = (i: number) => set((p) => ({ ...p, cols: (p.cols ?? INITIAL.cols).filter((_, j) => j !== i) }));

  const srcSql = sql(s.src, s.srcTable, s);
  const tgtSql = sql(s.tgt, s.tgtTable, s);
  const text = () => `${srcSql}\n\n${tgtSql}`;
  const seg = (label: string, value: Dialect, on: (d: Dialect) => void) => (
    <div className="rs-q"><p className="rs-q-label">{label}</p><div className="rs-seg" role="group" aria-label={label}>{DL.map((x) => <button key={x.id} type="button" className={value === x.id ? "is-on" : undefined} aria-pressed={value === x.id} onClick={() => on(x.id)}>{x.label}</button>)}</div></div>
  );

  return (
    <div className="rs-toolwrap">
      <section id="inputs" className="rs-card">
        <header className="rs-card-head">
          <p className="rs-label">Step 1 · The table you migrated</p>
          <h2>Which table, which keys, which columns?</h2>
          <p className="rs-note"><b>The starting table is an illustrative example</b> of invoice lines moved from SQL Server to Snowflake. Replace it with yours.</p>
          <Terms items={[
            ["Parity check", "A query run on the old and the new system whose results must match if nothing changed in the move."],
            ["Key", "The column or columns that identify one row, such as invoice_id plus line_no."],
            ["Fingerprint", "A number computed from every value in every row of a period. One changed value changes it."],
            ["Canonical form", "Each value written the same way on both engines: decimals as whole numbers of the smallest unit, timestamps as seconds since 1970, dates as YYYY-MM-DD."],
          ]} />
        </header>
        <div className="rs-qs">
          {seg("Source (old system)", s.src, (src) => update({ src }))}
          {seg("Target (new system)", s.tgt, (tgt) => update({ tgt }))}
        </div>
        <div className="rs-cost-fields">
          <label className="rs-field"><span>Source table</span><input value={s.srcTable} spellCheck={false} onChange={(e) => update({ srcTable: e.target.value })} /></label>
          <label className="rs-field"><span>Target table</span><input value={s.tgtTable} spellCheck={false} onChange={(e) => update({ tgtTable: e.target.value })} /></label>
          <label className="rs-field"><span>Key columns (comma separated)</span><input value={s.keys} spellCheck={false} onChange={(e) => update({ keys: e.target.value })} /></label>
          <label className="rs-field"><span>Date column to group by</span><input value={s.dateCol} spellCheck={false} onChange={(e) => update({ dateCol: e.target.value })} /></label>
          <label className="rs-field"><span>Group by</span><select value={s.grain} onChange={(e) => update({ grain: e.target.value as State["grain"] })}><option value="year">Year</option><option value="month">Month</option><option value="day">Day</option></select></label>
        </div>
        <h3>Columns to compare</h3>
        <ol className="rs-cols">
          {s.cols.map((c, i) => (
            <li key={i}>
              <div className="rs-cols-main rs-cols-3">
                <label className="rs-field"><span>Column</span><input value={c.name} spellCheck={false} onChange={(e) => setCol(i, { name: e.target.value })} /></label>
                <label className="rs-field"><span>Type</span><select value={c.type} onChange={(e) => setCol(i, { type: e.target.value as ColType })}>{["string", "integer", "decimal", "date", "timestamp", "boolean"].map((t) => <option key={t}>{t}</option>)}</select></label>
                {c.type === "decimal" ? <label className="rs-field"><span>Decimal places</span><input inputMode="numeric" value={c.scale} onChange={(e) => setCol(i, { scale: e.target.value })} /></label> : <span />}
                <span className="rs-step-actions"><button type="button" aria-label={`Remove ${c.name || "column"}`} onClick={() => removeCol(i)}>×</button></span>
              </div>
            </li>
          ))}
        </ol>
        <button type="button" className="rs-btn" onClick={addCol}>Add a column</button>
      </section>

      <section id="sql" className="rs-card">
        <header className="rs-card-head">
          <p className="rs-label">Step 2 · Run the same checks on both sides</p>
          <h2>Copy the SQL, run it on each system, compare the results</h2>
          <PlainSummary>if every check matches, the numbers in the new system are the numbers in the old one, row for row. If a period differs, you know where to look before anyone reports from it.</PlainSummary>
        </header>
        <CodeBlock label={`Source: ${DL.find((x) => x.id === s.src)?.label}`} lang="SQL" code={srcSql} />
        <CodeBlock label={`Target: ${DL.find((x) => x.id === s.tgt)?.label}`} lang="SQL" code={tgtSql} />
        <h3>How to read the results</h3>
        <ul className="rs-plainlist">
          <li><b>Check 1, counts by period:</b> any period with a different count is where rows were lost or duplicated.</li>
          <li><b>Check 2, key health:</b> distinct keys below row count means duplicates; null key rows should be zero on both sides.</li>
          <li><b>Check 3, profiles:</b> sums, minimums and maximums catch truncation, rounding and time zone shifts in one column.</li>
          <li><b>Check 4, fingerprint:</b> where counts match but fingerprints differ, at least one value changed in that period. Drill into that period by day, then by key.</li>
        </ul>
      </section>

      <section id="caveats" className="rs-card">
        <header className="rs-card-head">
          <p className="rs-label">For your data person</p>
          <h2>What the generator assumes</h2>
        </header>
        <ul className="rs-plainlist">
          <li><b>Time zones:</b> timestamps become epoch seconds as stored. If one side stores local time and the other UTC, fingerprints differ by design; convert one side first.</li>
          <li><b>Text encoding:</b> SQL Server hashes varchar in its code page, other engines in UTF-8. Non-ASCII text can fingerprint differently even when equal; compare those columns with counts and lengths, or cast to a UTF-8 collation on SQL Server 2019 or later.</li>
          <li><b>Floats:</b> declare float columns as decimal with the precision you care about, or rounding noise will differ between engines.</li>
          <li><b>Trailing spaces and case:</b> SQL Server comparisons ignore trailing spaces, hashes do not. Trim in both queries if the old system padded values.</li>
          <li><b>Functions used:</b> Snowflake <code>MD5</code> and <code>TO_NUMBER</code> with a hex format, BigQuery <code>MD5</code> and <code>TO_HEX</code>, Postgres <code>md5</code>, SQL Server <code>HASHBYTES</code>. The first 7 hex digits are summed as a 28-bit integer, so the sum stays inside 64-bit integers for tens of billions of rows per period.</li>
        </ul>
      </section>

      <ToolActions getText={text} copyLabel="Copy both scripts" download={{ filename: "parity-checks.sql", label: "Download SQL", mime: "text/plain;charset=utf-8", get: text }} onReset={reset} resetLabel="Restore the example" confirmText="Replace your table with the example?" />
    </div>
  );
}
