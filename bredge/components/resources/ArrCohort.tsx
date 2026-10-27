"use client";
import { useMemo, useState } from "react";
import { useStoredState } from "./useStoredState";
import { ToolActions, fmtNum } from "./ToolActions";
import { PlainSummary, Terms } from "./Explainers";

/* ARR bridge and cohort table builder. Input: one row per customer per month
 * with that month's MRR (CSV: customer_id, month, mrr). Output: an MRR/ARR
 * bridge by month (new, reactivation, expansion, contraction, churn), a
 * cohort grid (revenue or logo retention by months since first revenue), and
 * trailing-12-month NRR and GRR at the latest month. Everything runs in the
 * browser; the CSV is never uploaded. */

type Parsed = { months: string[]; byCust: Map<string, Map<string, number>>; errors: string[] };

const MAX_STORE = 300_000;
type Stored = { csv: string; mode: "revenue" | "logo"; cur: string };
const INIT: Stored = { csv: "", mode: "revenue", cur: "£" };

function monthKey(v: string) {
  const m = v.trim().replace(/^"|"$/g, "").match(/^(\d{4})[-/](\d{1,2})/);
  // Month 00 or 13+ is a typo or a DD/MM date read the wrong way: skip the row.
  if (!m || Number(m[2]) < 1 || Number(m[2]) > 12) return null;
  return `${m[1]}-${m[2].padStart(2, "0")}`;
}
function addMonths(k: string, n: number) {
  const [y, m] = k.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + n, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}
function parse(csv: string): Parsed {
  const errors: string[] = [];
  const byCust = new Map<string, Map<string, number>>();
  const lines = csv.split(/\r?\n/).filter((l) => l.trim());
  if (!lines.length) return { months: [], byCust, errors };
  const head = lines[0].toLowerCase().split(/[,;\t]/).map((h) => h.trim().replace(/^"|"$/g, ""));
  const ci = head.findIndex((h) => /customer|account|client/.test(h));
  const mi = head.findIndex((h) => /month|period|date/.test(h));
  const vi = head.findIndex((h) => /mrr|revenue|amount|value/.test(h));
  const hasHeader = ci >= 0 && mi >= 0 && vi >= 0;
  const [C, M, V] = hasHeader ? [ci, mi, vi] : [0, 1, 2];
  let min = "", max = "";
  lines.slice(hasHeader ? 1 : 0).forEach((line, i) => {
    const cells = line.split(/[,;\t]/).map((x) => x.trim().replace(/^"|"$/g, ""));
    const cust = cells[C];
    const mk = monthKey(cells[M] ?? "");
    const val = Number(String(cells[V] ?? "").replace(/[£$€,\s]/g, ""));
    if (!cust || !mk || !Number.isFinite(val)) { if (errors.length < 5) errors.push(`Row ${i + (hasHeader ? 2 : 1)} skipped: ${line.slice(0, 60)}`); return; }
    const mp = byCust.get(cust) ?? new Map<string, number>();
    mp.set(mk, (mp.get(mk) ?? 0) + val);
    byCust.set(cust, mp);
    if (!min || mk < min) min = mk;
    if (!max || mk > max) max = mk;
  });
  const months: string[] = [];
  if (min) { let k = min; while (k <= max && months.length < 240) { months.push(k); k = addMonths(k, 1); } }
  // One mistyped year (1024, 2924) would otherwise silently hide the real months.
  if (min && months[months.length - 1] < max) errors.unshift(`Months run from ${min} to ${max}, more than 20 years: only the first 240 months are shown. Check for a mistyped year.`);
  return { months, byCust, errors };
}

function example() {
  // Synthetic, deterministic sample: 2 years, a few customers joining each month.
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const rows = ["customer_id,month,mrr"];
  const start = "2024-11";
  let id = 0;
  for (let m = 0; m < 24; m++) {
    const joiners = 3 + Math.floor(rnd() * 4);
    for (let j = 0; j < joiners; j++) {
      id++;
      let mrr = [200, 400, 800, 1500][Math.floor(rnd() * 4)];
      for (let k = m; k < 24; k++) {
        if (k > m && rnd() < 0.03) break;
        if (k > m && rnd() < 0.06) mrr = Math.round(mrr * (rnd() < 0.7 ? 1.5 : 0.7));
        rows.push(`C${String(id).padStart(4, "0")},${addMonths(start, k)},${mrr}`);
      }
    }
  }
  return rows.join("\n");
}

type Bridge = { month: string; start: number; neu: number; react: number; exp: number; contr: number; churn: number; end: number; customers: number };

export function ArrCohort() {
  const [stored, setStored, reset] = useStoredState<Stored>("bredge:rs:arr-cohort:v1", INIT);
  const [big, setBig] = useState<string | null>(null);
  const csv = big ?? stored.csv ?? "";
  const setCsv = (v: string) => { if (v.length > MAX_STORE) { setBig(v); setStored((p) => ({ ...p, csv: "" })); } else { setBig(null); setStored((p) => ({ ...p, csv: v })); } };
  const mode = stored.mode === "logo" ? "logo" : "revenue";
  const cur = stored.cur || "£";
  const data = useMemo(() => parse(csv), [csv]);

  const { bridge, cohorts, t12 } = useMemo(() => {
    const { months, byCust } = data;
    const get = (c: string, m: string) => byCust.get(c)?.get(m) ?? 0;
    const custs = [...byCust.keys()];
    const first = new Map<string, string>();
    custs.forEach((c) => { const ms = [...(byCust.get(c)?.entries() ?? [])].filter(([, v]) => v > 0).map(([k]) => k).sort(); if (ms[0]) first.set(c, ms[0]); });
    const bridge: Bridge[] = months.map((m, i) => {
      const prevM = i > 0 ? months[i - 1] : null;
      let start = 0, neu = 0, react = 0, exp = 0, contr = 0, churn = 0, end = 0, customers = 0;
      custs.forEach((c) => {
        const cur = get(c, m), prev = prevM ? get(c, prevM) : 0;
        start += prev; end += cur; if (cur > 0) customers++;
        if (!prevM) { neu += cur; return; }
        if (prev <= 0 && cur > 0) { if ((first.get(c) ?? m) < m) react += cur; else neu += cur; }
        else if (prev > 0 && cur <= 0) churn += prev;
        else if (cur > prev) exp += cur - prev;
        else if (cur < prev) contr += prev - cur;
      });
      return { month: m, start, neu, react, exp, contr, churn, end, customers };
    });
    const cohortMap = new Map<string, string[]>();
    first.forEach((m, c) => cohortMap.set(m, [...(cohortMap.get(m) ?? []), c]));
    const cohorts = [...cohortMap.entries()].sort(([a], [b]) => (a < b ? -1 : 1)).map(([m, cs]) => {
      const base = cs.reduce((a, c) => a + get(c, m), 0);
      const idx = months.indexOf(m);
      const cells = months.slice(idx).slice(0, 25).map((mm) => {
        const rev = cs.reduce((a, c) => a + get(c, mm), 0);
        const logos = cs.filter((c) => get(c, mm) > 0).length;
        return mode === "logo" ? logos / cs.length : base > 0 ? rev / base : NaN;
      });
      return { month: m, size: cs.length, base, cells };
    });
    let t12: { nrr: number; grr: number; month: string } | null = null;
    if (months.length >= 13) {
      const L = months[months.length - 1], B = months[months.length - 13];
      let b = 0, now = 0, kept = 0;
      custs.forEach((c) => { const x = get(c, B); if (x > 0) { const y = Math.max(0, get(c, L)); b += x; now += y; kept += Math.min(x, y); } });
      t12 = b > 0 ? { nrr: now / b, grr: kept / b, month: L } : null;
    }
    return { bridge, cohorts, t12 };
  }, [data, mode]);

  const last = bridge[bridge.length - 1];
  const money = (v: number) => `${v < 0 ? "−" : ""}${cur}${fmtNum(Math.abs(v))}`;
  const pct = (v: number) => (Number.isFinite(v) ? `${fmtNum(v * 100, 0)}%` : "");
  const heat = (v: number) => (Number.isFinite(v) ? `rgba(31,58,44,${Math.min(0.85, Math.max(0.06, v * 0.6))})` : "transparent");

  const bridgeCsv = () => ["month,starting_mrr,new,reactivation,expansion,contraction,churn,ending_mrr,ending_arr,customers", ...bridge.map((b) => [b.month, b.start, b.neu, b.react, b.exp, b.contr, b.churn, b.end, b.end * 12, b.customers].join(","))].join("\n");
  const cohortCsv = () => {
    const w = Math.max(0, ...cohorts.map((c) => c.cells.length));
    return [["cohort", "customers", "starting_mrr", ...Array.from({ length: w }, (_, i) => `m${i}`)].join(","), ...cohorts.map((c) => [c.month, c.size, c.base, ...c.cells.map((x) => (Number.isFinite(x) ? x.toFixed(4) : ""))].join(","))].join("\n");
  };
  const text = () => [
    "ARR bridge and cohorts",
    t12 ? `Trailing 12-month NRR ${pct(t12.nrr)}, GRR ${pct(t12.grr)} (to ${t12.month})` : "Need 13 months of data for trailing 12-month NRR and GRR.",
    "", bridgeCsv(), "", `Cohort ${mode} retention`, cohortCsv(),
  ].join("\n");

  const onFile = (f: File | undefined) => { if (!f) return; const r = new FileReader(); r.onload = () => setCsv(String(r.result ?? "")); r.readAsText(f); };

  return (
    <div className="rs-toolwrap">
      <section id="data" className="rs-card">
        <header className="rs-card-head">
          <p className="rs-label">Step 1 · Your MRR by customer and month</p>
          <h2>Paste or upload a CSV</h2>
          <p className="rs-note"><b>Your data never leaves this browser.</b> The file is read and calculated on this page; nothing is uploaded. Columns: <code>customer_id, month, mrr</code>, one row per customer per month (month as YYYY-MM or a date). Export it from Stripe, ChartMogul or your billing database.</p>
          <Terms items={[
            ["MRR / ARR", "Monthly recurring revenue; ARR is MRR × 12."],
            ["ARR bridge", "How ARR moved from one month to the next: new, reactivated, expansion, contraction and churn."],
            ["Cohort", "Customers grouped by the month they first paid."],
            ["NRR (trailing 12 months)", "Revenue now from customers who were paying 12 months ago, divided by their revenue then. Includes expansion."],
            ["GRR", "The same, but each customer counts at most their revenue 12 months ago, so expansion cannot hide churn. Never above 100%."],
          ]} />
        </header>
        <label className="rs-field rs-field-wide"><span>CSV</span><textarea rows={6} spellCheck={false} value={big ? `${big.slice(0, 2000)}\n… (${fmtNum(big.length)} characters loaded, too large to show or save)` : csv} readOnly={!!big} placeholder={"customer_id,month,mrr\nC0001,2025-01,400\nC0001,2025-02,400"} onChange={(e) => setCsv(e.target.value)} /></label>
        <div className="rs-chips">
          <label className="rs-btn"><input type="file" accept=".csv,text/csv,text/plain" className="rs-sr" onChange={(e) => onFile(e.target.files?.[0])} />Upload CSV</label>
          <button type="button" className="rs-btn" onClick={() => setCsv(example())}>Load synthetic example</button>
          <label className="rs-field rs-field-inline rs-cols-example"><span className="rs-sr">Currency symbol</span><input value={cur} maxLength={3} title="Currency symbol" onChange={(e) => setStored((p) => ({ ...p, cur: e.target.value }))} /></label>
          <span>{data.byCust.size ? `${fmtNum(data.byCust.size)} customers, ${data.months.length} months` : "No data yet"}</span>
        </div>
        {data.errors.length > 0 && <p className="rs-note">{data.errors.join(" · ")}</p>}
        {big && <p className="rs-muted">Large file: kept in memory for this visit only, not saved in the browser.</p>}
      </section>

      {bridge.length > 0 && (
        <section id="bridge" className="rs-card" aria-live="polite">
          <header className="rs-card-head">
            <p className="rs-label">Step 2 · ARR bridge</p>
            <h2>ARR {money(last.end * 12)} at {last.month}</h2>
            <div className="rs-kpis">
              <div><small>Customers paying</small><b>{fmtNum(last.customers)}</b></div>
              <div className={t12 && t12.nrr >= 1 ? "is-good" : undefined}><small>NRR, trailing 12 months</small><b>{t12 ? pct(t12.nrr) : "Need 13 months"}</b></div>
              <div><small>GRR, trailing 12 months</small><b>{t12 ? pct(t12.grr) : "Need 13 months"}</b></div>
            </div>
            {t12 && <PlainSummary>for every {cur}100 of recurring revenue a year ago, the same customers now pay {cur}{fmtNum(t12.nrr * 100)}, and {cur}{fmtNum(100 - t12.grr * 100)} of it was lost to downgrades and cancellations before upsell.</PlainSummary>}
          </header>
          <div className="rs-table-scroll">
            <table className="rs-cost-table">
              <thead><tr><th scope="col">Month</th><th scope="col">Start MRR</th><th scope="col">New</th><th scope="col">Reactivation</th><th scope="col">Expansion</th><th scope="col">Contraction</th><th scope="col">Churn</th><th scope="col">End MRR</th><th scope="col">End ARR</th></tr></thead>
              <tbody>{bridge.slice(-18).map((b) => <tr key={b.month}><th scope="row">{b.month}</th><td>{money(b.start)}</td><td>{money(b.neu)}</td><td>{money(b.react)}</td><td>{money(b.exp)}</td><td>{money(-b.contr)}</td><td>{money(-b.churn)}</td><td>{money(b.end)}</td><td>{money(b.end * 12)}</td></tr>)}</tbody>
            </table>
          </div>
          {bridge.length > 18 && <p className="rs-muted">Showing the last 18 months. The CSV export has every month.</p>}
        </section>
      )}

      {cohorts.length > 0 && (
        <section id="cohorts" className="rs-card">
          <header className="rs-card-head">
            <p className="rs-label">Step 3 · Cohort retention</p>
            <h2>{mode === "revenue" ? "Revenue" : "Logo"} retention by months since first payment</h2>
            <div className="rs-seg" role="group" aria-label="Retention type">
              <button type="button" className={mode === "revenue" ? "is-on" : undefined} aria-pressed={mode === "revenue"} onClick={() => setStored((p) => ({ ...p, mode: "revenue" }))}>Revenue (net)</button>
              <button type="button" className={mode === "logo" ? "is-on" : undefined} aria-pressed={mode === "logo"} onClick={() => setStored((p) => ({ ...p, mode: "logo" }))}>Logos (customers)</button>
            </div>
          </header>
          <div className="rs-table-scroll">
            <table className="rs-cohort">
              <thead><tr><th scope="col">Cohort</th><th scope="col">Size</th>{Array.from({ length: Math.max(...cohorts.map((c) => c.cells.length)) }, (_, i) => <th key={i} scope="col">M{i}</th>)}</tr></thead>
              <tbody>{cohorts.map((c) => <tr key={c.month}><th scope="row">{c.month}</th><td>{c.size}</td>{c.cells.map((v, i) => <td key={i} style={{ background: heat(v), color: v > 0.7 ? "#f4f1e9" : undefined }}>{pct(v)}</td>)}</tr>)}</tbody>
            </table>
          </div>
          <ul className="rs-plainlist">
            <li><b>Read across a row</b> to see how one cohort retains; read down a column to see whether newer cohorts retain better than older ones.</li>
            <li><b>Revenue above 100%</b> means expansion outweighs churn for that cohort.</li>
            <li><b>Before diligence,</b> reconcile ending MRR to billing and recognised revenue, and write down what counts as recurring. The <a href="/resources/saas-metrics-definitions">SaaS metrics definitions</a> give the formulas.</li>
          </ul>
        </section>
      )}

      <ToolActions getText={text} copyLabel="Copy the bridge and cohorts" csv={bridge.length ? { filename: "arr-bridge.csv", get: bridgeCsv } : undefined} download={cohorts.length ? { filename: "cohort-retention.csv", label: "Download cohorts CSV", mime: "text/csv;charset=utf-8", get: cohortCsv } : undefined} onReset={() => { setBig(null); reset(); }} resetLabel="Clear the data" confirmText="Clear the data you pasted?" />
    </div>
  );
}
