"use client";
import { useStoredState } from "./useStoredState";
import { ToolActions, fmtNum, toNum } from "./ToolActions";
import { PlainSummary, Terms } from "./Explainers";

/* Fivetran MAR estimator. Per connection: distinct rows inserted, updated and
 * deleted in a month, plus history mode, give monthly active rows (MAR) under
 * Fivetran's published rules: distinct primary keys per connection and table
 * per month; deletes count; initial syncs are free; in history mode each
 * change adds a new row. Cost uses the visitor's own effective rate plus the
 * published base charge per connection (editable). Rules checked against
 * fivetran.com/docs/usage-based-pricing on 21 October 2026. */

type Row = { name: string; inserted: string; updated: string; deleted: string; history: boolean; changes: string; block: boolean };
type State = { rows: Row[]; rate: string; base: string; cur: string };

const INITIAL: State = {
  cur: "$", rate: "", base: "5",
  rows: [
    { name: "Postgres: orders and events", inserted: "1800000", updated: "600000", deleted: "20000", history: false, changes: "2", block: false },
    { name: "Salesforce", inserted: "40000", updated: "250000", deleted: "2000", history: true, changes: "3", block: false },
    { name: "Stripe", inserted: "120000", updated: "90000", deleted: "0", history: false, changes: "1", block: false },
    { name: "Google Ads", inserted: "900000", updated: "0", deleted: "0", history: false, changes: "1", block: false },
    { name: "Unused Zendesk tables", inserted: "60000", updated: "30000", deleted: "0", history: false, changes: "1", block: false },
  ],
};

function mar(r: Row, opts: { noHistory?: boolean } = {}) {
  if (r.block) return 0;
  const ins = Math.max(0, toNum(r.inserted)), upd = Math.max(0, toNum(r.updated)), del = Math.max(0, toNum(r.deleted));
  const ch = Math.max(1, toNum(r.changes) || 1);
  return ins + (r.history && !opts.noHistory ? upd * ch : upd) + del;
}

export function FivetranMar() {
  const [raw, set, reset] = useStoredState<State>("bredge:rs:fivetran-mar:v1", INITIAL);
  const s: State = { ...INITIAL, ...raw, rows: raw.rows ?? INITIAL.rows };
  const update = (patch: Partial<State>) => set((p) => ({ ...p, ...patch }));
  const setRow = (i: number, patch: Partial<Row>) => set((p) => { const rows = [...(p.rows ?? INITIAL.rows)]; rows[i] = { ...rows[i], ...patch }; return { ...p, rows }; });
  const addRow = () => set((p) => ({ ...p, rows: [...(p.rows ?? INITIAL.rows), { name: "New connection", inserted: "", updated: "", deleted: "", history: false, changes: "1", block: false }] }));
  const removeRow = (i: number) => set((p) => ({ ...p, rows: (p.rows ?? INITIAL.rows).filter((_, j) => j !== i) }));

  const rate = toNum(s.rate);
  const base = Math.max(0, toNum(s.base));
  const c = s.cur || "$";
  const rows = s.rows.map((r) => {
    const m = mar(r);
    const baseCharge = m >= 1 && m <= 1_000_000 ? base : 0;
    return { r, m, cost: rate > 0 ? (m / 1_000_000) * rate + baseCharge : NaN, historyExtra: r.history && !r.block ? mar(r) - mar(r, { noHistory: true }) : 0 };
  });
  const total = rows.reduce((a, x) => a + x.m, 0);
  const totalCost = rate > 0 ? rows.reduce((a, x) => a + x.cost, 0) : NaN;
  const top = [...rows].sort((a, b) => b.m - a.m)[0];
  const historyExtra = rows.reduce((a, x) => a + x.historyExtra, 0);
  const max = Math.max(1, ...rows.map((x) => x.m));
  const money = (v: number) => (Number.isFinite(v) ? `${c}${fmtNum(v, v < 100 ? 2 : 0)}` : "Enter a rate");


  const text = () => [
    "Fivetran MAR estimate (illustrative; confirm in the Fivetran usage dashboard)",
    ...rows.map(({ r, m, cost }) => `- ${r.name}: ${fmtNum(m)} MAR${r.history ? " (history mode)" : ""}${r.block ? " (blocked)" : ""}${rate > 0 ? `, ${money(cost)}` : ""}`),
    `Total: ${fmtNum(total)} MAR${rate > 0 ? `, ${money(totalCost)} a month at ${c}${s.rate} per million plus ${c}${s.base} base charge per connection between 1 and 1M MAR` : ""}`,
  ].join("\n");

  return (
    <div className="rs-toolwrap">
      <section id="inputs" className="rs-card">
        <header className="rs-card-head">
          <p className="rs-label">Step 1 · Your connections</p>
          <h2>How many rows change in each connection a month?</h2>
          <p className="rs-note"><b>The starting connections are illustrative.</b> Replace them with your own: the Fivetran usage dashboard shows MAR by connection and table, and a source query can count distinct keys created, updated and deleted in a month.</p>
          <Terms items={[
            ["MAR", "Monthly active rows: the distinct rows Fivetran inserts, updates or deletes in your destination in a calendar month, counted by primary key."],
            ["Connection", "One source Fivetran syncs, such as one Postgres database or one Salesforce org. Keys are counted separately per connection and table."],
            ["History mode", "Fivetran keeps every version of a row instead of overwriting it. Each change adds a new row, and each new row counts."],
            ["Re-sync", "Reloading a table from scratch. Under pricing from 1 March 2025, some re-syncs are free, such as unchanged rows in re-import tables."],
          ]} />
        </header>
        <ol className="rs-marrows">
          {s.rows.map((r, i) => (
            <li key={i} className={r.block ? "is-blocked" : undefined}>
              <label className="rs-field rs-field-wide"><span>Connection</span><input value={r.name} onChange={(e) => setRow(i, { name: e.target.value })} /></label>
              <label className="rs-field"><span>New rows a month</span><input inputMode="numeric" value={r.inserted} onChange={(e) => setRow(i, { inserted: e.target.value })} /></label>
              <label className="rs-field"><span>Distinct rows updated</span><input inputMode="numeric" value={r.updated} onChange={(e) => setRow(i, { updated: e.target.value })} /></label>
              <label className="rs-field"><span>Rows deleted</span><input inputMode="numeric" value={r.deleted} onChange={(e) => setRow(i, { deleted: e.target.value })} /></label>
              <div className="rs-cols-flags">
                <label><input type="checkbox" checked={r.history} onChange={(e) => setRow(i, { history: e.target.checked })} />History mode</label>
                {r.history && <label className="rs-field rs-field-inline rs-cols-example"><span className="rs-sr">Changes per updated row</span><input inputMode="decimal" value={r.changes} title="Average changes per updated row in a month" onChange={(e) => setRow(i, { changes: e.target.value })} /></label>}
                <label><input type="checkbox" checked={r.block} onChange={(e) => setRow(i, { block: e.target.checked })} />Block (stop syncing)</label>
                <span className="rs-step-actions"><button type="button" aria-label={`Remove ${r.name}`} onClick={() => removeRow(i)}>×</button></span>
              </div>
            </li>
          ))}
        </ol>
        <button type="button" className="rs-btn" onClick={addRow}>Add a connection</button>
        <div className="rs-cost-fields rs-gap">
          <label className="rs-field"><span>Currency symbol</span><input value={s.cur} maxLength={3} onChange={(e) => update({ cur: e.target.value })} /></label>
          <label className="rs-field"><span>Your effective rate per million MAR</span><input inputMode="decimal" value={s.rate} placeholder="From your invoice" onChange={(e) => update({ rate: e.target.value })} /><small className="rs-hint">Your last invoice ÷ (MAR billed ÷ 1,000,000). The rate per million falls as volume rises, so use your own.</small></label>
          <label className="rs-field"><span>Base charge per connection (1 to 1M MAR)</span><input inputMode="decimal" value={s.base} onChange={(e) => update({ base: e.target.value })} /><small className="rs-hint">$5 on Fivetran&apos;s pricing documentation, checked 21 Oct 2026. Not charged on the Free plan.</small></label>
        </div>
      </section>

      <section id="result" className="rs-card" aria-live="polite">
        <header className="rs-card-head">
          <p className="rs-label">Step 2 · MAR and cost by connection</p>
          <h2>{fmtNum(total)} MAR a month{rate > 0 ? `, about ${money(totalCost)}` : ""}</h2>
          {top && top.m > 0 && <PlainSummary>{top.r.name} drives {fmtNum((top.m / Math.max(1, total)) * 100)}% of the rows you pay for. Cutting rows there, or not syncing what nobody uses, moves the bill more than anything else.</PlainSummary>}
        </header>
        <ul className="rs-cost-bars">
          {rows.map(({ r, m, cost }, i) => (
            <li key={i} className={r.block ? "is-proj" : undefined}>
              <span><b>{r.name}</b><small>{r.block ? "Blocked" : r.history ? "History mode on" : `${fmtNum(m)} MAR`}</small></span>
              <span className="rs-track"><i style={{ width: `${Math.max(0.5, (m / max) * 100)}%` }} /></span>
              <strong>{rate > 0 ? money(cost) : fmtNum(m)}</strong>
            </li>
          ))}
        </ul>
        <h3>Levers that cut MAR</h3>
        <ul className="rs-plainlist">
          <li><b>Block tables nobody uses:</b> a blocked table stops syncing and stops counting. Tick Block above to see the effect.</li>
          {historyExtra > 0 && <li><b>Turn off history mode where you do not need it:</b> on these inputs it adds {fmtNum(historyExtra)} MAR a month. Keep it only on tables where you report on past versions.</li>}
          <li><b>Sync frequency matters less than you think:</b> a row counts once a month however often it changes or syncs. Slower syncs cut MAR only in history mode, where each captured change is a new row.</li>
          <li><b>Fix noisy updates at the source:</b> a job that touches updated_at on every row, or a soft-delete sweep, makes every row active every month.</li>
          <li><b>Initial syncs are free:</b> adding a connection or a column does not bill its history, but deletes and re-imports of changed rows do.</li>
          <li><b>Compare alternatives on the heaviest connection only:</b> high-volume database tables are where self-managed loaders or warehouse-native replication usually pay back first.</li>
        </ul>
      </section>

      <ToolActions getText={text} copyLabel="Copy the estimate" onReset={reset} resetLabel="Restore the example" confirmText="Replace your connections with the example?" />
    </div>
  );
}
