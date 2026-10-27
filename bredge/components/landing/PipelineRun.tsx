"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bell, Check, CheckCircle, CircleNotch, Clock, Play, UsersThree, Warning, X, type Icon,
} from "@phosphor-icons/react";

/**
 * Customer 360 pipeline: the full data platform behind one agreed customer
 * count. Five sources are ingested, stored raw, matched into one customer
 * table, tested, then served to dashboards, the CRM and a forecast model.
 *
 * Click any step for what it does, rows in and out, freshness, owner and its
 * checks. Selecting a served output (or the Customers figure) lights its
 * upstream lineage and dims the rest. "Run pipeline" replays a run: steps go
 * queued, running, done; one check fails, its records are quarantined, and
 * the run finishes green. Node sub-labels name one sensible default tool.
 * Same design language as the reference dashboards (.db): top bar with the
 * mark, pill controls, KPI cards with icon chips, light cards throughout.
 * Reduced motion: a run completes at once. All figures are synthetic.
 */

/* ───────────────────────── data ───────────────────────── */

type ColId = "src" | "ing" | "wh" | "tr" | "te" | "srv";
const COLS: Array<{ id: ColId; label: string }> = [
  { id: "src", label: "Sources" },
  { id: "ing", label: "Collect" },
  { id: "wh", label: "Store" },
  { id: "tr", label: "Clean and match" },
  { id: "te", label: "Check" },
  { id: "srv", label: "Use" },
];

type Item = { label: string; alert?: boolean; dup?: boolean };
type Node = {
  id: string;
  col: ColId;
  name: string;
  tech: string;
  meta?: string;
  does: string;
  rowsIn: string;
  rowsOut: string;
  owner: string;
  /** Rows routed elsewhere, shown beside rows out so in = out + aside. */
  aside?: string;
  items: Item[];
  /** Upstream path lit when this is selected (serve outputs only). */
  lineage?: string[];
};

// Row counts, defined once so every stage reconciles: rows in = rows out + rows set aside.
const SRC = { product: 1842, billing: 1731, crm: 1809, support: 1795, finance: 1764 };
const RAW = Object.values(SRC).reduce((t, x) => t + x, 0); // 8,941
const EXACT = 7912; // matched on email or billing ID
const FUZZY = 694; // matched on domain and company name, score 0.9 or above
const UNMATCHED = RAW - EXACT - FUZZY; // 335: support contacts and CRM leads with no account, kept aside
const MATCHED = 1842; // customers after matching
const REVIEW = 70; // possible duplicates held back
const CLEAN = MATCHED - REVIEW; // 1,772
const n = (x: number) => x.toLocaleString("en-GB");
const pctOf = (a: number, b: number) => `${((a / b) * 100).toFixed(1)}%`;

const CHECKS: Item[] = [
  { label: "One row per customer ID (unique)" },
  { label: "Email and account ID present (not null)" },
  { label: "Every invoice links to a customer (relationships)" },
  { label: "Revenue within 0.5% of Finance.xlsx (reconciliation)" },
  { label: "No duplicate customers across CRM and Billing", dup: true },
  { label: "Every source under 24 hours old (freshness)" },
];

const SOURCE_ITEMS: Item[] = [{ label: "Schema unchanged since last load" }, { label: "Alert if rows drop more than 10%", alert: true }];

// Matching reads all five sources, so everything downstream of it traces back to all five.
const UPSTREAM = ["product", "billing", "crm", "support", "finance", "ingest", "warehouse", "match"];

const NODES: Node[] = [
  { id: "product", col: "src", name: "Product API", tech: "api/v2/accounts", meta: n(SRC.product), does: "Every account that has signed up in the product, pulled from its API.", rowsIn: "API", rowsOut: n(SRC.product), owner: "Product engineering", items: SOURCE_ITEMS },
  { id: "billing", col: "src", name: "Billing", tech: "billing.invoices", meta: n(SRC.billing), does: "Every account that has been sent an invoice, from the billing system.", rowsIn: "API", rowsOut: n(SRC.billing), owner: "Finance ops", items: SOURCE_ITEMS },
  { id: "crm", col: "src", name: "CRM", tech: "crm.accounts", meta: n(SRC.crm), does: "Sales' view of accounts, including some still in trial.", rowsIn: "API", rowsOut: n(SRC.crm), owner: "RevOps", items: SOURCE_ITEMS },
  { id: "support", col: "src", name: "Support", tech: "support.tickets", meta: n(SRC.support), does: "Anyone who has opened a support ticket, customer or not.", rowsIn: "API", rowsOut: n(SRC.support), owner: "Support ops", items: SOURCE_ITEMS },
  { id: "finance", col: "src", name: "Finance.xlsx", tech: "sftp/finance.xlsx", meta: n(SRC.finance), does: "Finance's monthly customer list, kept by hand in a spreadsheet.", rowsIn: "File", rowsOut: n(SRC.finance), owner: "Finance", items: [{ label: "File arrived by 05:30" }, { label: "Columns match the agreed template" }, { label: "If late, last month's file is used and revenue marked provisional" }, { label: "Alert if the file is late", alert: true }] },
  { id: "ingest", col: "ing", name: "Collect data", tech: "Python: extract.py", meta: `${n(RAW)} rows`, does: "Copies all five sources into the warehouse unchanged, so nothing is lost or edited on the way.", rowsIn: n(RAW), rowsOut: n(RAW), owner: "Data engineering", items: [{ label: "Row counts match each source" }, { label: "Re-runs replace the same load, never double-count" }, { label: "Alert if any source is late or fails", alert: true }] },
  { id: "warehouse", col: "wh", name: "Central store", tech: "PostgreSQL: raw", meta: "13 months kept", does: "Keeps a timestamped copy of every load, so any number can be traced back to where it came from.", rowsIn: n(RAW), rowsOut: n(RAW), owner: "Data engineering", items: [{ label: "Every row stamped with load time" }, { label: "Access limited by role" }, { label: "Emails hashed; personal fields masked outside the data team" }] },
  { id: "match", col: "tr", name: "Match customers", tech: "SQL: identity_resolution", meta: `${n(RAW)} → ${n(MATCHED)}`, does: `Finds the same customer across all five systems: exact matches on email or billing ID first, then domain and company name. ${pctOf(EXACT + FUZZY, RAW)} of rows match; the rest are kept aside, not dropped.`, rowsIn: n(RAW), rowsOut: `${n(MATCHED)} customers`, aside: `${n(UNMATCHED)} rows aside`, owner: "Analytics engineering", items: [{ label: `${n(EXACT)} rows matched exactly on email or billing ID` }, { label: `${n(FUZZY)} rows matched on domain and name, score 0.9+` }, { label: `${n(UNMATCHED)} rows with no account kept aside, not dropped` }, { label: "Survivor fields: CRM name, Billing address, newest non-empty value" }, { label: "Match rules versioned and reviewed" }] },
  { id: "revenue", col: "tr", name: "Revenue by customer", tech: "SQL: fct_revenue", meta: "ties to Finance", does: "Joins billing and the finance sheet to each matched customer, so revenue adds up the same everywhere.", rowsIn: n(SRC.billing + SRC.finance), rowsOut: n(MATCHED), owner: "Analytics engineering", items: [{ label: "Revenue ties to Finance.xlsx within 0.5%" }, { label: "No negative or orphan invoices" }, { label: "Late invoices: last 3 months rebuilt each run" }] },
  { id: "tests", col: "te", name: "Quality checks", tech: "SQL tests", meta: "6 checks", does: "Runs six checks before anything reaches a dashboard. Records that fail go to a review queue, not into the numbers.", rowsIn: n(MATCHED), rowsOut: n(CLEAN), aside: `+${REVIEW} to review`, owner: "Analytics engineering", items: [...CHECKS, { label: "Failures alert #data-alerts", alert: true }] },
  { id: "growth", col: "srv", name: "Growth dashboard", tech: "Power BI: Growth", does: "Customer growth, churn and activation for the head of growth, from the one customer table.", rowsIn: n(CLEAN), rowsOut: "14 visuals", owner: "Growth", items: [{ label: "Warns if data is over 24 hours old", alert: true }, { label: "Customer defined once, same as CFO view" }], lineage: [...UPSTREAM, "tests"] },
  { id: "cfo", col: "srv", name: "CFO dashboard", tech: "Power BI: CFO", does: "Revenue and margin by customer for the CFO, tied out to the finance sheet.", rowsIn: n(CLEAN), rowsOut: "9 visuals", owner: "Finance", items: [{ label: "Totals match Finance.xlsx" }, { label: "Warns if data is over 24 hours old", alert: true }], lineage: [...UPSTREAM, "revenue", "tests"] },
  { id: "crmsync", col: "srv", name: "CRM sync back", tech: "Python: crm_sync", does: "Writes the clean customer ID and status back into the CRM, so sales works from the same list.", rowsIn: n(CLEAN), rowsOut: `${n(CLEAN)} updated`, owner: "RevOps", items: [{ label: "Only changed fields are written" }, { label: "Alert on any rejected update", alert: true }], lineage: [...UPSTREAM, "tests"] },
  { id: "forecast", col: "srv", name: "Forecast model", tech: "Python: forecast", does: "Gives the forecast one trusted customer and revenue history, ready for planning or AI use.", rowsIn: n(CLEAN), rowsOut: "24-month history", owner: "Finance and data", items: [{ label: "Trained only on checked records" }, { label: "Alert if accuracy drifts", alert: true }], lineage: [...UPSTREAM, "revenue", "tests"] },
];

const CUSTOMERS: Node = {
  id: "kpi", col: "te", name: "Customers", tech: "SQL: dim_customer", does: "One agreed customer count, built from all five systems after matching and checks.", rowsIn: n(RAW), rowsOut: n(CLEAN), aside: `+${REVIEW} to review`, owner: "Data team, signed off by Finance", items: [{ label: "Defined once, used by every output" }, { label: "Customer: a matched account with a product sign-up or an invoice" }, { label: `${REVIEW} records held for review, not guessed` }, { label: `True count sits between ${n(CLEAN)} and ${n(MATCHED)} until review ends` }],
  lineage: ["product", "billing", "crm", "support", "finance", "ingest", "warehouse", "match", "tests"],
};

const byId = (id: string) => (id === "kpi" ? CUSTOMERS : NODES.find((n) => n.id === id)!);

/* ───────────────────────── run script ───────────────────────── */

type State = "running" | "fail" | "warn";
type Step = { ids: string[]; t: number; ms: number; log: string; state?: State; level?: "fail" | "warn" | "ok" };

/** t: simulated seconds since the run started (2m 14s in total). ms: real time on screen. */
const STEPS: Step[] = [
  { ids: [], t: 0, ms: 380, log: "run started" },
  { ids: ["product"], t: 4, ms: 300, log: `ingest product_api ${n(SRC.product)} rows` },
  { ids: ["billing"], t: 7, ms: 300, log: `ingest billing ${n(SRC.billing)} rows` },
  { ids: ["crm"], t: 10, ms: 300, log: `ingest crm ${n(SRC.crm)} rows` },
  { ids: ["support"], t: 12, ms: 300, log: `ingest support ${n(SRC.support)} rows` },
  { ids: ["finance"], t: 14, ms: 300, log: `ingest finance.xlsx ${n(SRC.finance)} rows` },
  { ids: ["ingest"], t: 31, ms: 520, log: `load raw ${n(RAW)} rows, counts match all 5 sources` },
  { ids: ["warehouse"], t: 39, ms: 420, log: "raw history updated" },
  { ids: ["match"], t: 78, ms: 820, log: `match ${n(RAW)} rows → ${n(MATCHED)} customers · ${n(UNMATCHED)} unmatched kept aside` },
  { ids: ["revenue"], t: 97, ms: 560, log: `revenue by customer ${n(MATCHED)} rows, within 0.5% of finance` },
  { ids: ["tests"], t: 108, ms: 620, log: "run 6 checks" },
  { ids: ["tests"], t: 111, ms: 760, log: `FAIL duplicate customers across CRM and Billing: ${REVIEW} (${pctOf(REVIEW, MATCHED)})`, state: "fail", level: "fail" },
  { ids: ["tests"], t: 112, ms: 420, log: "alert sent to #data-alerts", state: "fail", level: "warn" },
  { ids: ["tests"], t: 114, ms: 640, log: `${REVIEW} records moved to review queue`, state: "warn", level: "warn" },
  { ids: ["tests"], t: 117, ms: 360, log: `re-run on ${n(CLEAN)} rows: 6 of 6 checks pass`, level: "ok" },
  { ids: ["growth", "cfo"], t: 124, ms: 480, log: "refresh Growth and CFO dashboards" },
  { ids: ["crmsync"], t: 129, ms: 420, log: `sync ${n(CLEAN)} accounts back to CRM` },
  { ids: ["forecast"], t: 132, ms: 400, log: "forecast inputs ready" },
];
const N = STEPS.length;
const DONE = N; // step index once a run has finished
const IDLE = -1;
const IDX = (pred: (s: Step) => boolean) => STEPS.findIndex(pred);
const I_MATCH = IDX((s) => s.ids.includes("match"));
const I_TESTS = IDX((s) => s.ids.includes("tests"));
const I_FAIL = IDX((s) => s.state === "fail");
const I_QUAR = IDX((s) => s.state === "warn");
const I_PASS = IDX((s) => s.level === "ok");

type Line = { key: number; time: string; text: string; level?: "fail" | "warn" | "ok" };
const clock = (h: number, sec: number) => `${String(h).padStart(2, "0")}:${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;
let lineKey = 0;
const lineFor = (i: number, h: number, trigger: string): Line => {
  const s = i === N ? { t: 134, log: `run complete · ${n(CLEAN)} customers · ${REVIEW} to review · 2m 14s`, level: "ok" as const } : STEPS[i];
  return { key: ++lineKey, time: clock(h, s.t), text: i === 0 ? `${s.log} · ${trigger}` : s.log, level: s.level };
};
const fullLog = (h: number, trigger: string) => Array.from({ length: N + 1 }, (_, i) => lineFor(i, h, trigger));

type NodeStatus = "idle" | "queued" | "running" | "fail" | "warn" | "done";
function statusOf(id: string, step: number): NodeStatus {
  if (step === IDLE || step >= DONE) return "idle";
  const cur = STEPS[step];
  if (cur.ids.includes(id)) return cur.state ?? "running";
  const last = STEPS.reduce((a, s, i) => (s.ids.includes(id) ? i : a), -1);
  return last < step ? "done" : "queued";
}

/* ───────────────────────── small parts ───────────────────────── */

const reduceMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Eases the shown number toward `to`. */
function useTween(to: number, duration = 520) {
  const [v, setV] = useState(to);
  const shown = useRef(to);
  useEffect(() => {
    let raf = 0;
    const from = shown.current;
    if (from === to) return;
    const t0 = performance.now();
    const reduce = reduceMotion();
    const tick = (now: number) => {
      const p = reduce ? 1 : Math.min(1, (now - t0) / duration);
      const next = from + (to - from) * (1 - Math.pow(1 - p, 3));
      shown.current = next;
      setV(next);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, duration]);
  return Math.round(v).toLocaleString("en-GB");
}

function Kpi({ label, icon: I, value, note, tone, pressed, onClick }: { label: string; icon: Icon; value: React.ReactNode; note: string; tone?: "fail" | "warn" | "busy"; pressed: boolean; onClick: () => void }) {
  return (
    <button type="button" className={`pl-kpi${tone ? ` is-${tone}` : ""}`} aria-pressed={pressed} onClick={onClick}>
      <span className="pl-kpi-head"><span className="pl-kpi-label">{label}</span><span className="pl-chip" aria-hidden="true"><I size={14} /></span></span>
      <strong>{value}</strong>
      <span className="pl-kpi-note">{note}</span>
    </button>
  );
}

function Dot({ s }: { s: NodeStatus }) {
  if (s === "running") return <span className="pl-dot is-running" aria-hidden="true"><CircleNotch size={11} weight="bold" /></span>;
  if (s === "fail") return <span className="pl-dot is-fail" aria-hidden="true"><X size={9} weight="bold" /></span>;
  if (s === "warn") return <span className="pl-dot is-warn" aria-hidden="true"><Warning size={9} weight="bold" /></span>;
  return <span className={`pl-dot is-${s}`} aria-hidden="true" />;
}

const STATUS_WORD: Record<NodeStatus, string> = { idle: "done", queued: "queued", running: "running", fail: "check failed", warn: "quarantining", done: "done" };

/* ───────────────────────── component ───────────────────────── */

export function PipelineRun() {
  const [sel, setSel] = useState("match");
  const [step, setStep] = useState(IDLE);
  const [scheduled, setScheduled] = useState(true);
  const [ranAt, setRanAt] = useState(6); // hour of the last run
  const [log, setLog] = useState<Line[]>(() => fullLog(6, "scheduled"));
  const [pane, setPane] = useState<"detail" | "log">("detail");
  const logRef = useRef<HTMLOListElement>(null);

  const running = step !== IDLE && step < DONE;

  // Advance the run one step at a time.
  useEffect(() => {
    if (!running) return;
    const t = window.setTimeout(() => {
      const next = step + 1;
      setLog((l) => [...l, lineFor(next, 8, "manual")].slice(-60));
      if (next === DONE) setRanAt(8);
      setStep(next);
    }, STEPS[step].ms);
    return () => window.clearTimeout(t);
  }, [running, step]);

  // Keep the newest log line in view.
  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [log]);

  const run = () => {
    if (running) return;
    setPane("log");
    if (reduceMotion()) {
      setLog((l) => [...l, ...fullLog(8, "manual")].slice(-60));
      setRanAt(8);
      setStep(DONE);
      return;
    }
    setLog((l) => [...l, lineFor(0, 8, "manual")].slice(-60));
    setStep(0);
  };

  const pick = (id: string) => { setSel(id); setPane("detail"); };

  const node = byId(sel);
  const lineage = node.lineage ? new Set([...node.lineage, node.id]) : null;
  const hh = String(ranAt).padStart(2, "0");

  // KPI values, following the run.
  const live = running;
  const customers = !live || step >= I_QUAR + 1 ? CLEAN : step > I_MATCH ? MATCHED : 0;
  const custShown = useTween(customers);
  const review = !live || step >= I_QUAR ? REVIEW : 0;
  const reviewShown = useTween(review);
  const checksText = !live || step >= I_PASS ? "6 of 6" : step >= I_FAIL ? "5 of 6" : step >= I_TESTS ? "Running" : "Waiting";
  const freshness = live ? "Updating" : ranAt === 8 ? "Just now" : "2 hours";

  const dupState: "pass" | "fail" | "quarantined" = live && step >= I_FAIL && step < I_QUAR ? "fail" : live && step === I_QUAR ? "quarantined" : "pass";

  const pill = running
    ? step >= I_FAIL && step < I_PASS
      ? { tone: "warn", text: `Check failed · quarantining ${REVIEW} records` }
      : { tone: "busy", text: `Running · step ${step + 1} of ${N}` }
    : { tone: "ok", text: `Healthy · last run 20 Oct 2026, ${hh}:00 · 2m 14s` };

  const statusFor = (id: string) => statusOf(id, step);

  return (
    <div className={`pl${lineage ? " has-lineage" : ""}${running ? " is-running" : ""}`} data-pane={pane}>
      <header className="pl-head">
        <div className="pl-title"><span className="pl-avatar" aria-hidden="true">B</span><b>Customer 360</b></div>
        <span className={`pl-pill is-${pill.tone}`} role="status">
          <i aria-hidden="true" />{pill.text}
        </span>
        <button type="button" role="switch" aria-checked={scheduled} className="pl-switch" onClick={() => setScheduled((v) => !v)}>
          <i aria-hidden="true" />
          <span>{scheduled ? "Daily at 06:00" : "Schedule paused"}</span>
        </button>
        <button type="button" className="pl-run" onClick={run} disabled={running}>
          {running ? <CircleNotch size={13} weight="bold" className="pl-spin" aria-hidden="true" /> : <Play size={12} weight="fill" aria-hidden="true" />}
          {running ? "Running" : "Run pipeline"}
        </button>
      </header>

      <div className="pl-kpis">
        <Kpi label="Customers" icon={UsersThree} value={customers === 0 ? "…" : custShown} note={live ? (customers === MATCHED ? "before checks" : "matching") : "confirmed; was 5 different numbers"} tone={live ? "busy" : undefined} pressed={sel === "kpi"} onClick={() => pick("kpi")} />
        <Kpi label="Needing review" icon={Warning} value={live && step < I_QUAR ? "…" : reviewShown} note={`possible duplicates, ${pctOf(REVIEW, MATCHED)} of ${n(MATCHED)}`} tone={live && step >= I_QUAR ? "warn" : live ? "busy" : undefined} pressed={false} onClick={() => pick("tests")} />
        <Kpi label="Checks passed" icon={CheckCircle} value={checksText} note={checksText === "5 of 6" ? "1 failing" : live ? "before anything is shown" : `after ${REVIEW} held for review`} tone={checksText === "5 of 6" ? "fail" : live && step < I_PASS ? "busy" : undefined} pressed={false} onClick={() => pick("tests")} />
        <Kpi label="Data freshness" icon={Clock} value={freshness} note={scheduled ? "refreshed daily, 06:00" : "schedule paused"} tone={live ? "busy" : undefined} pressed={false} onClick={() => pick("ingest")} />
      </div>

      <div className="pl-flow" role="group" aria-label="Pipeline steps. Select a step for details.">
        {COLS.map((c, ci) => {
          const nodes = NODES.filter((n) => n.col === c.id);
          return (
            <div key={c.id} className={`pl-col pl-col-${c.id}${ci === 0 ? " is-first" : ""}${ci === COLS.length - 1 ? " is-last" : ""}`}>
              <span className="pl-col-h" aria-hidden="true"><em>{ci + 1}</em>{c.label}</span>
              <div className="pl-nodes">
                {nodes.length > 1 && ci > 0 && <i className="pl-bus is-l" aria-hidden="true" />}
                {nodes.length > 1 && ci < COLS.length - 1 && <i className="pl-bus is-r" aria-hidden="true" />}
                {nodes.map((n) => {
                  const s = statusFor(n.id);
                  return (
                    <button
                      key={n.id}
                      type="button"
                      className={`pl-node is-${s}${sel === n.id ? " is-sel" : ""}${lineage?.has(n.id) ? " is-lit" : ""}`}
                      aria-pressed={sel === n.id}
                      aria-label={`${c.label}: ${n.name}, ${n.tech}${n.meta ? `, ${n.meta}` : ""}${running ? `, ${STATUS_WORD[s]}` : ""}`}
                      onClick={() => pick(n.id)}
                    >
                      <span className="pl-node-top">
                        <b>{n.name}</b>
                        {c.id === "src" && <span className="pl-count">{n.meta}</span>}
                        <Dot s={s} />
                      </span>
                      <code>{n.tech}</code>
                      {c.id !== "src" && n.meta && <span className="pl-meta">{n.meta}</span>}
                      {(s === "running" || s === "fail" || s === "warn") && <span className="pl-prog" aria-hidden="true"><i key={step} style={{ "--dur": `${STEPS[step].ms}ms` } as React.CSSProperties} /></span>}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="pl-bottom">
        <div className="pl-tabs" role="group" aria-label="Show">
          <button type="button" aria-pressed={pane === "detail"} onClick={() => setPane("detail")}>Selected step</button>
          <button type="button" aria-pressed={pane === "log"} onClick={() => setPane("log")}>Run log{running && <i className="pl-live" aria-hidden="true" />}</button>
        </div>

        <section className="pl-detail" aria-label={`Details: ${node.name}`} key={node.id}>
          <header>
            <span className="pl-stage">{node.id === "kpi" ? "Metric" : COLS.find((c) => c.id === node.col)!.label}</span>
            <b>{node.name}</b>
            <code>{node.tech}</code>
            {lineage && <span className="pl-lineage-tag">Lineage shown</span>}
          </header>
          <p>{node.does}</p>
          <dl className="pl-stats">
            <div><dt>Rows in</dt><dd>{node.rowsIn}</dd></div>
            <div><dt>Rows out</dt><dd>{node.rowsOut}{node.aside && <small> {node.aside}</small>}</dd></div>
            <div><dt>Freshness</dt><dd>{node.col === "src" ? `Synced ${hh}:00` : `Updated ${hh}:02`}</dd></div>
            <div><dt>Owner</dt><dd>{node.owner}</dd></div>
          </dl>
          <ul className={`pl-items${node.items.length > 4 ? " is-two" : ""}`}>
            {node.items.map((it) => {
              const st = it.dup ? dupState : "pass";
              return (
                <li key={it.label} className={it.alert ? "is-alert" : `is-${st}`}>
                  {it.alert ? <Bell size={11} weight="bold" aria-hidden="true" /> : st === "fail" ? <X size={11} weight="bold" aria-hidden="true" /> : st === "quarantined" ? <Warning size={11} weight="bold" aria-hidden="true" /> : <Check size={11} weight="bold" aria-hidden="true" />}
                  <span>{it.label}{st === "fail" ? `: ${REVIEW} found` : st === "quarantined" ? `: ${REVIEW} to review` : ""}</span>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="pl-log" aria-label="Run log">
          <span className="pl-log-h">Run log</span>
          <ol ref={logRef} role="log" aria-live="polite" aria-relevant="additions">
            {log.map((l) => (
              <li key={l.key} className={l.level ? `is-${l.level}` : undefined}><time>{l.time}</time>{l.text}</li>
            ))}
          </ol>
        </section>
      </div>

    </div>
  );
}
