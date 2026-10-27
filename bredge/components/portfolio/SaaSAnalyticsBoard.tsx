"use client";

import { useState, type CSSProperties } from "react";
import {
  ArrowCounterClockwise, ArrowsClockwise, ChartLineUp, Coins, CurrencyDollar, HandCoins, Heartbeat,
  Hourglass, Percent, Target, TrendDown, TrendUp, UserMinus, UserPlus, UsersThree, Wallet, type Icon,
} from "@phosphor-icons/react";
import { useInView, Count, Delta, Chip, Slicer, Topbar, useAlerts, Bars, FilterChip, type BarDatum, type About } from "../landing/Dashboards";
import { saasAnalyticsMeta } from "./meta";
import { AllColumns, FilterBar } from "../landing/PhoneFilters";

/**
 * SaaS Analytics: the rebuild of our Power BI report (Revenue, Churn,
 * Customer Dashboard), Jan 2024 to Jun 2025. Four report pages, a plan and a
 * period slicer, click a month to cross-filter the KPIs to it, click a plan
 * to filter by it. All figures are synthetic.
 *
 * Every number comes from one monthly table of new and churned customers per
 * plan, with a flat price per plan, so the pages always agree with each other.
 * June 2025 matches the printed report exactly. Rates are worked out from the
 * counts and rounded half up; the printed May 2025 churn rate (2.92%) was
 * truncated, so this board shows 2.93% (23 of 786).
 */

/* ───────────────────────── data ───────────────────────── */

const MN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const N = 18; // Jan 2024 to Jun 2025
const LAST = N - 1;
const yr = (i: number) => 2024 + Math.floor(i / 12);
const mShort = (i: number) => `${MN[i % 12]} ${yr(i)}`;
const range = (a: number, b: number) => (a === b ? mShort(a) : `${mShort(a)} to ${mShort(b)}`);

const PLANS = ["Basic", "Pro", "Enterprise"] as const;
const PRICE = [50, 200, 500]; // MRR per customer, per plan
const PLAN_COLOR = ["#8a92d6", "#90d26f", "#1f3a2c"];
const ALL = [0, 1, 2];

// New and churned customers per month, per plan (Basic, Pro, Enterprise).
const NEW_BY: number[][] = [[20, 20, 20], [17, 18, 17], [19, 20, 19], [18, 19, 18], [21, 21, 20], [19, 19, 19], [17, 19, 18], [20, 21, 20], [19, 18, 19], [19, 21, 19], [18, 18, 17], [16, 16, 16], [18, 20, 19], [18, 19, 18], [17, 17, 17], [17, 18, 17], [20, 20, 20], [14, 19, 17]];
const CH_BY: number[][] = [[0, 0, 0], [1, 0, 1], [0, 1, 1], [1, 0, 0], [0, 1, 1], [2, 1, 1], [1, 1, 1], [1, 2, 1], [1, 1, 2], [2, 1, 2], [2, 2, 1], [1, 2, 2], [2, 2, 2], [3, 3, 4], [10, 8, 9], [7, 8, 9], [8, 7, 8], [16, 13, 12]];
const ACT_BY: number[][] = (() => {
  let a = [0, 0, 0];
  return NEW_BY.map((r, m) => (a = a.map((v, p) => v + r[p] - CH_BY[m][p])));
})();

// Shown as printed in the source report; not split by plan or month there.
const CAC = 110.11;
const LIFETIME = 5.32;
const ACTIVE_TENURE: Array<[string, number]> = [["0-3 mo", 200], ["4-6 mo", 134], ["7-12 mo", 274], ["13+ mo", 224]]; // Jun 2025
const CHURN_TENURE: Array<[string, number]> = [["0-3 mo", 77], ["4-6 mo", 37], ["7-12 mo", 40], ["13+ mo", 14]]; // Jan 2024 to Jun 2025

type Stat = {
  active: number; prevActive: number; newC: number; churned: number; toDate: number;
  mrr: number; prevMrr: number; newMrr: number; churnedMrr: number;
  rate: number; retention: number; arpu: number; growth: number; revChurn: number;
};

const sumP = (arr: number[][], m: number, ps: number[], priced = false) => ps.reduce((t, p) => t + arr[m][p] * (priced ? PRICE[p] : 1), 0);

function stat(m: number, ps: number[]): Stat {
  const active = sumP(ACT_BY, m, ps);
  const prevActive = m > 0 ? sumP(ACT_BY, m - 1, ps) : 0;
  const churned = sumP(CH_BY, m, ps);
  const mrr = sumP(ACT_BY, m, ps, true);
  const prevMrr = m > 0 ? sumP(ACT_BY, m - 1, ps, true) : 0;
  const churnedMrr = sumP(CH_BY, m, ps, true);
  // Churn rate on customers at the start of the month (the end of the month before).
  const rate = prevActive ? (churned / prevActive) * 100 : 0;
  let toDate = 0;
  for (let i = 0; i <= m; i++) toDate += sumP(NEW_BY, i, ps);
  return {
    active, prevActive, churned, toDate, mrr, prevMrr, churnedMrr,
    newC: sumP(NEW_BY, m, ps),
    newMrr: sumP(NEW_BY, m, ps, true),
    rate, retention: 100 - rate,
    arpu: active ? mrr / active : 0,
    growth: prevMrr ? (mrr / prevMrr - 1) * 100 : 0,
    // Revenue churn on opening MRR, the same base as the customer churn rate.
    revChurn: prevMrr ? (churnedMrr / prevMrr) * 100 : 0,
  };
}

/* ───────────────────────── formats ───────────────────────── */

const kf = (n: number) => `$${(Math.round(n / 100) / 10).toFixed(1)}K`; // half up: 207,950 is $208.0K
const mf = (n: number) => `$${(n / 1_000_000).toFixed(1)}M`;
const usd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
const int = (n: number) => Math.round(n).toLocaleString("en-US");
const p1 = (n: number) => `${n.toFixed(1)}%`;
const p2 = (n: number) => `${n.toFixed(2)}%`;

type D = { value: string; down: boolean; note: string } | null;
/** Change against the month before; `down` marks it as bad (red). */
const rel = (now: number, prev: number, m: number, goodUp = true, words: [string, string] = ["up", "down"]): D =>
  m === 0 || !prev ? null : { value: p1(Math.abs((now / prev - 1) * 100)), down: goodUp ? now < prev : now > prev, note: `${now >= prev ? words[0] : words[1]} vs ${mShort(m - 1)}` };
const pts = (now: number, prev: number, m: number, goodUp: boolean, dp = 2): D =>
  m === 0 ? null : { value: `${Math.abs(now - prev).toFixed(dp)} pp`, down: goodUp ? now < prev : now > prev, note: `${now >= prev ? "higher" : "lower"} vs ${mShort(m - 1)}` };

type Kpi = { label: string; sub: string; icon: Icon; to: number; f: (n: number) => string; d: D; fixed?: string };

/* ───────────────────────── visuals ───────────────────────── */

type Pt = { idx: number; label: string; v: number; tip: string; tipLabel: string };

const axisStep = (n: number) => (n > 12 ? 3 : n > 6 ? 2 : 1);
const axisLabel = (m: number, step: number) => (step > 1 ? `${MN[m % 12]} ${String(yr(m)).slice(2)}` : MN[m % 12]);

/** Line chart with hover tooltip; click a month to cross-filter. */
function Line({ data, selected, onSelect, on, label }: { data: Pt[]; selected: number | null; onSelect: (m: number | null) => void; on: boolean; label: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const n = data.length;
  // Domain always includes zero, and goes below it when a value is negative
  // (MRR growth for one plan can be), so the line never leaves the plot.
  const hi = Math.max(0, ...data.map((d) => d.v)) * 1.12;
  const lo = Math.min(0, ...data.map((d) => d.v)) * 1.12;
  const spanV = hi - lo || 1;
  const selAt = data.findIndex((d) => d.idx === selected);
  const tipAt = hover ?? (selAt >= 0 ? selAt : n - 1);
  const x = (i: number) => ((i + 0.5) / n) * 100;
  const y = (v: number) => 100 - ((v - lo) / spanV) * 100;
  const line = data.map((d, i) => `${i ? "L" : "M"}${x(i).toFixed(2)} ${y(d.v).toFixed(2)}`).join(" ");
  const y0 = y(0).toFixed(2);
  const area = `${line} L${x(n - 1).toFixed(2)} ${y0} L${x(0).toFixed(2)} ${y0} Z`;
  const step = axisStep(n);
  return (
    <div className={`pc-sa-line${selAt >= 0 ? " has-sel" : ""}`} role="group" aria-label={label} onMouseLeave={() => setHover(null)}>
      <div className="pc-sa-plot">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <path className="pc-sa-area" d={area} style={{ d: `path("${area}")` } as CSSProperties} />
          <path className="pc-sa-path" d={line} style={{ d: `path("${line}")` } as CSSProperties} vectorEffect="non-scaling-stroke" />
          {lo < 0 && <path d={`M0 ${y0} L100 ${y0}`} stroke="currentColor" strokeOpacity={0.3} strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />}
        </svg>
        {data.map((d, i) => (
          <button
            key={d.idx}
            type="button"
            className={`pc-sa-pt${i === tipAt ? " is-peak" : ""}${selected === d.idx ? " is-sel" : ""}`}
            style={{ "--x": i / n, "--w": 1 / n, "--v": (d.v - lo) / spanV } as CSSProperties}
            aria-pressed={selected === d.idx}
            aria-label={`${d.tipLabel}: ${d.tip}`}
            onMouseEnter={() => setHover(i)}
            onFocus={() => setHover(i)}
            onBlur={() => setHover(null)}
            onClick={() => onSelect(selected === d.idx ? null : d.idx)}
          >
            <i />
            {on && i === tipAt && <span className={`pc-sa-tip${i >= n - 2 ? " is-end" : i <= 1 ? " is-start" : ""}`}><small>{d.tipLabel}</small>{d.tip}</span>}
          </button>
        ))}
      </div>
      <div className="pc-sa-axis" aria-hidden="true">
        {data.map((d, i) => <span key={d.idx}>{(n - 1 - i) % step === 0 ? axisLabel(d.idx, step) : ""}</span>)}
      </div>
    </div>
  );
}

type Group = { key: string; label: string; vals: number[]; tipLabel: string; tips: string[] };

/** Clustered columns (two series per group) with tooltip and click-to-filter. */
function Cluster({ data, selected, onSelect, on, label, colors }: { data: Group[]; selected: number | null; onSelect: (i: number | null) => void; on: boolean; label: string; colors: string[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(...data.flatMap((g) => g.vals)) * 1.08 || 1;
  const n = data.length;
  const tipAt = hover ?? selected ?? n - 1;
  return (
    <div className={`pc-sa-cols${selected !== null ? " has-sel" : ""}${n > 12 ? " is-dense" : ""}`} role="group" aria-label={label} onMouseLeave={() => setHover(null)}>
      {data.map((g, i) => (
        <button
          key={g.key}
          type="button"
          className={`pc-sa-col${selected === i ? " is-sel" : ""}${i === tipAt ? " is-peak" : ""}`}
          style={{ "--h": Math.max(...g.vals) / max, "--i": i } as CSSProperties}
          aria-pressed={selected === i}
          aria-label={`${g.tipLabel}: ${g.tips.join(", ")}`}
          onMouseEnter={() => setHover(i)}
          onFocus={() => setHover(i)}
          onBlur={() => setHover(null)}
          onClick={() => onSelect(selected === i ? null : i)}
        >
          {on && i === tipAt && (
            <span className={`pc-sa-tip${n > 3 && i >= n - 2 ? " is-end" : n > 3 && i <= 1 ? " is-start" : ""}`}>
              <small>{g.tipLabel}</small>
              {g.tips.map((t) => <span key={t}>{t}</span>)}
            </span>
          )}
          <span className="pc-sa-col-bars">{g.vals.map((v, s) => <i key={s} style={{ "--v": v / max, background: colors[s] } as CSSProperties} />)}</span>
          <em>{g.label}</em>
        </button>
      ))}
    </div>
  );
}

type HRow = { key: string; label: string; color: string; bars: Array<{ v: number; text: string; color?: string }> };

/** Horizontal bars by plan; click a plan to filter the report to it. */
function HBars({ rows, plan, onPlan, label }: { rows: HRow[]; plan: number | null; onPlan: (p: number | null) => void; label: string }) {
  return (
    <ul className="pc-sa-hbars" aria-label={label}>
      {rows.map((r, i) => (
        <li key={r.key}>
          <button type="button" aria-pressed={plan === i} className={plan !== null && plan !== i ? "is-dim" : undefined} onClick={() => onPlan(plan === i ? null : i)}>
            <span className="pc-sa-hname"><i style={{ background: r.color }} />{r.label}</span>
            <span className="pc-sa-hstack">
              {r.bars.map((b, j) => (
                <span key={j} className="pc-sa-hline">
                  <span className="pc-sa-htrack"><i style={{ "--v": b.v, background: b.color ?? r.color } as CSSProperties} /></span>
                  <b>{b.text}</b>
                </span>
              ))}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

/** Donut of active customers by plan, with a legend that filters. */
function Donut({ values, plan, onPlan, center, sub }: { values: number[]; plan: number | null; onPlan: (p: number | null) => void; center: string; sub: string }) {
  const total = values.reduce((a, b) => a + b, 0) || 1;
  const C = 2 * Math.PI * 40;
  const starts = values.map((_, i) => values.slice(0, i).reduce((a, b) => a + b, 0) / total * C);
  return (
    <div className="pc-sa-donut">
      <div className="db-donut-wrap">
        <svg className="db-donut" viewBox="0 0 100 100" aria-hidden="true">
          <circle className="db-donut-bg" cx="50" cy="50" r="40" />
          {values.map((v, i) => {
            const len = (v / total) * C;
            return <circle key={PLANS[i]} cx="50" cy="50" r="40" stroke={PLAN_COLOR[i]} strokeDasharray={`${Math.max(0, len - 2)} ${C}`} strokeDashoffset={-starts[i]} className={plan !== null && plan !== i ? "is-dim" : undefined} onClick={() => onPlan(plan === i ? null : i)} />;
          })}
        </svg>
        <span className="db-donut-mid"><b>{center}</b><small>{sub}</small></span>
      </div>
      <ul className="db-legend">
        {values.map((v, i) => (
          <li key={PLANS[i]}>
            <button type="button" aria-pressed={plan === i} className={plan !== null && plan !== i ? "is-dim" : undefined} onClick={() => onPlan(plan === i ? null : i)}>
              <i style={{ background: PLAN_COLOR[i] }} />{PLANS[i]}<b>{Math.round((v / total) * 100)}%</b>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Kpis({ items, on }: { items: Kpi[]; on: boolean }) {
  return (
    <div className="db-kpis pc-sa-kpis">
      {items.map((c, i) => (
        <article key={c.label} className="db-card db-kpi" style={{ "--i": i } as CSSProperties}>
          <header><span>{c.label}<small>{c.sub}</small></span><Chip icon={c.icon} /></header>
          <strong><Count to={c.to} on={on} format={c.f} /></strong>
          {c.d ? <Delta value={c.d.value} down={c.d.down} note={c.d.note} /> : <span className="db-note pc-sa-fixed">{c.fixed ?? "First month of data, no comparison"}</span>}
        </article>
      ))}
    </div>
  );
}

/* ───────────────────────── board ───────────────────────── */

const PLAN_OPTS = ["All plans", ...PLANS] as const;
type PlanOpt = typeof PLAN_OPTS[number];
const PERIODS = ["6 months", "12 months", "18 months"] as const;
type Period = typeof PERIODS[number];
const SPAN: Record<Period, number> = { "6 months": 6, "12 months": 12, "18 months": 18 };
const TABS = ["Overview", "Revenue", "Customers", "Churn"];

type SortKey = "plan" | "active" | "mrr" | "rate" | "arpu" | "newMrr" | "churnedMrr" | "arr";
const COLS: Array<[SortKey, string]> = [["plan", "Plan"], ["active", "Active"], ["mrr", "MRR"], ["rate", "Churn rate"], ["arpu", "ARPU"], ["newMrr", "New MRR"], ["churnedMrr", "Churned MRR"], ["arr", "ARR"]];

const ABOUT: About = {
  question: "Are we growing faster than we are losing customers, and which plan is driving it?",
  built: [
    "One definition of MRR and ARR, applied the same way to every plan",
    "New, churned and active customers per plan for every month",
    "Churn measured two ways: customers lost and recurring revenue lost",
    "Tenure bands that show when in a customer's life churn happens",
  ],
  defs: [
    ["MRR and ARR", "MRR = active customers at month end x their plan price (Basic $50, Pro $200, Enterprise $500). ARR = MRR x 12."],
    ["MRR growth", "MRR this month / MRR last month - 1."],
    ["ARPU", "MRR / active customers at month end (per account, as each customer is one account)."],
    ["Churn rate", "Customers lost in the month / active customers at the start of the month. Retention rate = 100% - churn rate."],
    ["Revenue churn rate", "Churned MRR / MRR at the start of the month. Prices are flat and there are no upgrades or downgrades in this data, so net and gross revenue retention are equal: 100% - revenue churn."],
    ["Quick ratio", "New MRR / churned MRR for the month. Above 4 is strong; below 1 means MRR is shrinking."],
    ["Average CAC", "Total acquisition spend / new customers, Jan 2024 to Jun 2025, as printed in the source. Not split by plan or month."],
    ["Avg. churn lifetime", "Average months a churned customer stayed. Counts churned customers only, so it understates the lifetime of the active base; do not use it for LTV."],
    ["Tenure bands", "Months since a customer's first paid month."],
  ],
  sources: "Synthetic data in USD, Jan 2024 to Jun 2025, as of the June 2025 close.",
};

// Defined in ./meta so the Work page can list this board without loading it.
export { saasAnalyticsMeta };

export function SaaSAnalyticsBoard() {
  const [ref, on] = useInView<HTMLDivElement>();
  const [tab, setTab] = useState("Overview");
  const [planOpt, setPlanOpt] = useState<PlanOpt>("All plans");
  const [period, setPeriod] = useState<Period>("18 months");
  const [sel, setSel] = useState<number | null>(null); // a month picked on any monthly chart
  const [tenure, setTenure] = useState<number | null>(null);
  const [churnTenure, setChurnTenure] = useState<number | null>(null);
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "mrr", dir: -1 });
  const [alerts, read] = useAlerts([
    { id: "sa1", title: "Churn rate hit 4.98% in Jun 2025, up 2.06 pp on May", when: "1 Jul 2025" },
    { id: "sa2", title: "Basic lost 16 customers and won 14 in Jun 2025", when: "1 Jul 2025" },
    { id: "sa3", title: "New customers down 16.7% in Jun 2025 (50 vs 60)", when: "1 Jul 2025" },
  ]);

  const plan = planOpt === "All plans" ? null : PLANS.indexOf(planOpt);
  const ps = plan === null ? ALL : [plan];
  const pickPlan = (p: number | null) => setPlanOpt(p === null ? "All plans" : PLANS[p]);
  const pickPeriod = (p: Period) => { setPeriod(p); setSel(null); };
  const isDefault = plan === null && period === "18 months" && sel === null;
  const clearAll = () => { setPlanOpt("All plans"); setPeriod("18 months"); setSel(null); };

  const ws = N - SPAN[period]; // first month of the chart window
  const end = sel ?? LAST; // the month the KPIs describe
  const prevM = end - 1;
  const now = stat(end, ps);
  const prev = end > 0 ? stat(prevM, ps) : now;
  const byPlan = PLANS.map((_, p) => stat(end, [p]));
  const planName = plan === null ? "all plans" : PLANS[plan];
  const at = mShort(end);
  const vsAt = end > 0 ? `${at} vs ${mShort(prevM)}` : at;

  // Monthly series for the chart window.
  const months = Array.from({ length: N - ws }, (_, i) => ws + i);
  const series = Array.from({ length: N }, (_, m) => stat(m, ps));
  const linePts = (from: number, get: (s: Stat) => number, fmt: (n: number) => string, what: string): Pt[] =>
    months.filter((m) => m >= from).map((m) => ({ idx: m, label: MN[m % 12], v: get(series[m]), tip: fmt(get(series[m])), tipLabel: `${what}, ${mShort(m)}` }));
  const step = axisStep(months.length);
  const groups = (get: (s: Stat) => [number, number], fmt: (n: number) => string): Group[] =>
    months.map((m) => {
      const [a, b] = get(series[m]);
      return { key: String(m), label: (LAST - m) % step === 0 ? axisLabel(m, step) : "", vals: [a, b], tipLabel: mShort(m), tips: [`New ${fmt(a)}`, `Churned ${fmt(b)}`] };
    });
  const selInWindow = sel === null ? null : sel - ws;
  const pickGroup = (i: number | null) => setSel(i === null ? null : ws + i);

  // Cumulative churn by plan across the window, up to the selected month.
  const lost = PLANS.map((_, p) => {
    let c = 0;
    for (let m = ws; m <= end; m++) c += CH_BY[m][p];
    return { c, mrr: c * PRICE[p] };
  });
  const lostIn = (p: number[]) => p.reduce((t, i) => ({ c: t.c + lost[i].c, mrr: t.mrr + lost[i].mrr }), { c: 0, mrr: 0 });
  const lostNow = lostIn(ps);
  const windowLabel = range(ws, end);

  const sortBy = (key: SortKey) => setSort((s) => ({ key, dir: s.key === key ? (s.dir === 1 ? -1 : 1) : key === "plan" ? 1 : -1 }));
  const sortVal = (s: Stat, p: number, key: SortKey) => key === "plan" ? p : key === "active" ? s.active : key === "mrr" ? s.mrr : key === "rate" ? s.rate : key === "arpu" ? s.arpu : key === "newMrr" ? s.newMrr : key === "churnedMrr" ? s.churnedMrr : s.mrr * 12;
  const rows = PLANS.map((_, p) => p).sort((a, b) => (sortVal(byPlan[a], a, sort.key) - sortVal(byPlan[b], b, sort.key)) * sort.dir);
  const total = stat(end, ALL);
  const argmax = (vals: number[]) => vals.reduce((b, v, i) => (v > vals[b] ? i : b), 0);
  const actShares = byPlan.map((s) => (total.active ? (s.active / total.active) * 100 : 0));
  const evenSplit = Math.max(...actShares) - Math.min(...actShares) < 10;
  const topRevPlan = PLANS[argmax(byPlan.map((s) => s.mrr))];
  const shrank = PLANS.filter((_, p) => byPlan[p].churned > byPlan[p].newC);
  const activeTotal = ACTIVE_TENURE.reduce((t, [, v]) => t + v, 0);
  const churnTotal = CHURN_TENURE.reduce((t, [, v]) => t + v, 0);
  const activeTop = argmax(ACTIVE_TENURE.map(([, v]) => v));
  const quick = now.churnedMrr ? now.newMrr / now.churnedMrr : null;

  const filters = (
    <FilterBar>
      <Slicer label="Plan" options={PLAN_OPTS} value={planOpt} onChange={setPlanOpt} />
      <Slicer label="Period" options={PERIODS} value={period} onChange={pickPeriod} className="is-small" />
      {sel !== null && <FilterChip label={mShort(sel)} onClear={() => setSel(null)} />}
      {!isDefault && <button type="button" className="db-pill db-pill-btn" onClick={clearAll}><ArrowCounterClockwise size={12} /> Clear all</button>}
      <p className="db-context"><b>{at}</b>{end > 0 ? <> compared with <b>{mShort(prevM)}</b></> : " (first month of data)"} · {planName}</p>
    </FilterBar>
  );

  const kpiSets: Record<string, Kpi[]> = {
    Overview: [
      { label: "MRR", sub: at, icon: CurrencyDollar, to: now.mrr, f: kf, d: rel(now.mrr, prev.mrr, end) },
      { label: "ARR", sub: at, icon: Coins, to: now.mrr * 12, f: mf, d: rel(now.mrr, prev.mrr, end) },
      { label: "Active customers", sub: `end of ${at}`, icon: UsersThree, to: now.active, f: int, d: rel(now.active, prev.active, end) },
      { label: "New customers", sub: at, icon: UserPlus, to: now.newC, f: int, d: rel(now.newC, prev.newC, end, true, ["more", "fewer"]) },
      { label: "Churn rate", sub: at, icon: TrendDown, to: now.rate, f: p2, d: pts(now.rate, prev.rate, end, false) },
      { label: "Average CAC", sub: "all plans, Jan 2024 to Jun 2025", icon: Target, to: CAC, f: (n) => `$${n.toFixed(2)}`, d: null, fixed: "As printed, no monthly comparison" },
    ],
    Revenue: [
      { label: "MRR", sub: at, icon: CurrencyDollar, to: now.mrr, f: kf, d: rel(now.mrr, prev.mrr, end) },
      { label: "ARR", sub: at, icon: Coins, to: now.mrr * 12, f: mf, d: rel(now.mrr, prev.mrr, end) },
      { label: "MRR growth", sub: vsAt, icon: ChartLineUp, to: now.growth, f: p1, d: end > 1 ? pts(now.growth, prev.growth, end, true, 1) : null },
      { label: "ARPU", sub: at, icon: Wallet, to: now.arpu, f: (n) => `$${n.toFixed(1)}`, d: rel(now.arpu, prev.arpu, end) },
      { label: "New MRR", sub: at, icon: TrendUp, to: now.newMrr, f: kf, d: rel(now.newMrr, prev.newMrr, end) },
      { label: "Churned MRR", sub: `${at} only`, icon: HandCoins, to: now.churnedMrr, f: kf, d: rel(now.churnedMrr, prev.churnedMrr, end, false, ["higher", "lower"]) },
    ],
    Customers: [
      { label: "Customers to date", sub: `Jan 2024 to ${at}`, icon: UsersThree, to: now.toDate, f: int, d: rel(now.toDate, prev.toDate, end, true, ["more", "fewer"]) },
      { label: "Active customers", sub: `end of ${at}`, icon: Heartbeat, to: now.active, f: int, d: rel(now.active, prev.active, end, true, ["more", "fewer"]) },
      { label: "New customers", sub: at, icon: UserPlus, to: now.newC, f: int, d: rel(now.newC, prev.newC, end, true, ["more", "fewer"]) },
      { label: "Churned customers", sub: at, icon: UserMinus, to: now.churned, f: int, d: rel(now.churned, prev.churned, end, false, ["more", "fewer"]) },
      { label: "Net growth", sub: `${at}, new minus churned`, icon: TrendUp, to: now.newC - now.churned, f: (n) => `${n < 0 ? "-" : n >= 0.5 ? "+" : ""}${int(Math.abs(n))}`, d: end > 0 ? { value: int(Math.abs((now.newC - now.churned) - (prev.newC - prev.churned))), down: now.newC - now.churned < prev.newC - prev.churned, note: `${now.newC - now.churned >= prev.newC - prev.churned ? "more" : "fewer"} vs ${mShort(prevM)}` } : null },
      { label: "Retention rate", sub: at, icon: ArrowsClockwise, to: now.retention, f: p2, d: pts(now.retention, prev.retention, end, true) },
    ],
    Churn: [
      { label: "Churned customers", sub: at, icon: UserMinus, to: now.churned, f: int, d: rel(now.churned, prev.churned, end, false, ["more", "fewer"]) },
      { label: "Churn rate", sub: at, icon: TrendDown, to: now.rate, f: p2, d: pts(now.rate, prev.rate, end, false) },
      { label: "Churned MRR", sub: `${at} only`, icon: HandCoins, to: now.churnedMrr, f: kf, d: rel(now.churnedMrr, prev.churnedMrr, end, false, ["higher", "lower"]) },
      { label: "MRR lost", sub: `running total, ${windowLabel}`, icon: Coins, to: lostNow.mrr, f: kf, d: null, fixed: `Sum of churned MRR, ${lostNow.c} customers` },
      { label: "Revenue churn rate", sub: `${at}, churned / opening MRR`, icon: Percent, to: now.revChurn, f: p1, d: pts(now.revChurn, prev.revChurn, end, false, 1) },
      { label: "Avg. churn lifetime", sub: "all churned, all plans", icon: Hourglass, to: LIFETIME, f: (n) => `${n.toFixed(2)} mo`, d: null, fixed: "Churned customers only, not an LTV input" },
    ],
  };

  const clickHint = <span className="db-pill pc-sa-pill">Click a month</span>;
  const planHint = <span className="db-pill pc-sa-pill">Click a plan</span>;
  const legend = (a: string, b: string, ca: string, cb: string) => (
    <span className="pc-sa-key" aria-hidden="true"><span><i style={{ background: ca }} />{a}</span><span><i style={{ background: cb }} />{b}</span></span>
  );
  const NEW_C = "#90d26f", CHURN_C = "#e98a64";

  return (
    <div ref={ref} className={`db pc-sa${on ? " is-on" : ""}`}>
      <Topbar title="SaaS analytics" tabs={TABS} tab={tab} onTab={setTab} alerts={alerts} onRead={read} about={ABOUT} />

      {tab === "Overview" && (
        <div className="db-page" key="overview">
          {filters}
          <Kpis items={kpiSets.Overview} on={on} />
          <div className="db-row db-row-2">
            <article className="db-card pc-sa-chart">
              <header>
                <div><span className="db-label">MRR by month, {range(ws, LAST)}</span><strong className="db-big db-big-sm">{kf(now.mrr)} in {at}</strong></div>
                {clickHint}
              </header>
              <Line data={linePts(ws, (s) => s.mrr, kf, "MRR")} selected={sel} onSelect={setSel} on={on} label="MRR by month. Click a month to filter the report to it." />
            </article>
            <article className="db-card pc-sa-chart">
              <header><div><span className="db-label">Active customers by plan, {at}</span><strong className="db-big db-big-sm">{plan === null ? (evenSplit ? "Close to an even split" : `${PLANS[argmax(actShares)]} is the largest plan`) : `${PLANS[plan]}: ${int(byPlan[plan].active)} active`}</strong></div></header>
              <Donut values={byPlan.map((s) => s.active)} plan={plan} onPlan={pickPlan} center={int(total.active)} sub="active" />
            </article>
          </div>
          <div className="db-row db-row-2">
            <article className="db-card pc-sa-chart">
              <header>
                <div><span className="db-label">New vs churned customers, {range(ws, LAST)}</span><strong className="db-big db-big-sm">{now.churned > now.newC ? `${at}: churn outpaced new` : `${at}: ${now.newC} new, ${now.churned} churned`}</strong></div>
                {legend("New", "Churned", NEW_C, CHURN_C)}
              </header>
              <Cluster data={groups((s) => [s.newC, s.churned], int)} selected={selInWindow} onSelect={pickGroup} on={on} colors={[NEW_C, CHURN_C]} label="New and churned customers by month. Click a month to filter the report to it." />
            </article>
            <article className="db-card pc-sa-chart">
              <header><div><span className="db-label">MRR by plan, {at}</span><strong className="db-big db-big-sm">{plan === null ? `${topRevPlan} brings most revenue` : `${PLANS[plan]}: ${total.mrr ? Math.round((byPlan[plan].mrr / total.mrr) * 100) : 0}% of MRR`}</strong></div>{planHint}</header>
              <HBars label="MRR by plan. Click a plan to filter the report to it." plan={plan} onPlan={pickPlan} rows={PLANS.map((n, p) => ({ key: n, label: n, color: PLAN_COLOR[p], bars: [{ v: byPlan[p].mrr / Math.max(...byPlan.map((s) => s.mrr)), text: `$${Math.round(byPlan[p].mrr / 1000)}K` }] }))} />
            </article>
          </div>
        </div>
      )}

      {tab === "Revenue" && (
        <div className="db-page" key="revenue">
          {filters}
          <Kpis items={kpiSets.Revenue} on={on} />
          <div className="db-row db-row-3">
            <article className="db-card pc-sa-chart">
              <header>
                <div><span className="db-label">MRR growth by month, {range(Math.max(1, ws), LAST)}</span><strong className="db-big db-big-sm">{end > 0 ? `${p1(now.growth)} in ${at}` : "No growth figure for the first month"}</strong></div>
                {clickHint}
              </header>
              <Line data={linePts(Math.max(1, ws), (s) => s.growth, p1, "MRR growth")} selected={sel} onSelect={setSel} on={on} label="MRR growth by month. Click a month to filter the report to it." />
            </article>
            <article className="db-card pc-sa-chart">
              <header>
                <div><span className="db-label">New vs churned MRR, {range(ws, LAST)}</span><strong className="db-big db-big-sm">{`${at}: ${kf(now.newMrr)} in, ${kf(now.churnedMrr)} out, quick ratio ${quick === null ? "n/a" : quick.toFixed(1)}`}</strong></div>
                {legend("New", "Churned", NEW_C, CHURN_C)}
              </header>
              <Cluster data={groups((s) => [s.newMrr, s.churnedMrr], kf)} selected={selInWindow} onSelect={pickGroup} on={on} colors={[NEW_C, CHURN_C]} label="New and churned MRR by month. Click a month to filter the report to it." />
            </article>
          </div>
          <article className="db-card pc-sa-tablecard">
            <header><div><span className="db-label">By plan, {at}. Sort by any column, click a plan to filter.</span></div></header>
            <AllColumns />
            <table className="pc-sa-table">
              <thead>
                <tr>
                  {COLS.map(([key, l]) => (
                    <th key={key} scope="col" className={`pc-sa-c-${key}`} aria-sort={sort.key === key ? (sort.dir === 1 ? "ascending" : "descending") : undefined}>
                      <button type="button" className={sort.key === key ? "is-on" : undefined} onClick={() => sortBy(key)}>{l}{sort.key === key ? (sort.dir === 1 ? " ↑" : " ↓") : ""}</button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => {
                  const s = byPlan[p];
                  return (
                    <tr key={PLANS[p]} className={plan !== null && plan !== p ? "is-dim" : plan === p ? "is-sel" : undefined} onClick={() => pickPlan(plan === p ? null : p)}>
                      <th scope="row" className="pc-sa-c-plan"><button type="button" aria-pressed={plan === p} onClick={(e) => { e.stopPropagation(); pickPlan(plan === p ? null : p); }}><i style={{ background: PLAN_COLOR[p] }} />{PLANS[p]}</button></th>
                      <td className="pc-sa-c-active">{int(s.active)}</td>
                      <td className="pc-sa-c-mrr">{usd(s.mrr)}</td>
                      <td className="pc-sa-c-rate">{end > 0 ? p2(s.rate) : "n/a"}</td>
                      <td className="pc-sa-c-arpu">{`$${s.arpu.toFixed(1)}`}</td>
                      <td className="pc-sa-c-newMrr">{usd(s.newMrr)}</td>
                      <td className="pc-sa-c-churnedMrr">{usd(s.churnedMrr)}</td>
                      <td className="pc-sa-c-arr">{usd(s.mrr * 12)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <th scope="row" className="pc-sa-c-plan">Total</th>
                  <td className="pc-sa-c-active">{int(total.active)}</td>
                  <td className="pc-sa-c-mrr">{usd(total.mrr)}</td>
                  <td className="pc-sa-c-rate">{end > 0 ? p2(total.rate) : "n/a"}</td>
                  <td className="pc-sa-c-arpu">{`$${total.arpu.toFixed(1)}`}</td>
                  <td className="pc-sa-c-newMrr">{usd(total.newMrr)}</td>
                  <td className="pc-sa-c-churnedMrr">{usd(total.churnedMrr)}</td>
                  <td className="pc-sa-c-arr">{usd(total.mrr * 12)}</td>
                </tr>
              </tfoot>
            </table>
          </article>
        </div>
      )}

      {tab === "Customers" && (
        <div className="db-page" key="customers">
          {filters}
          <Kpis items={kpiSets.Customers} on={on} />
          <div className="db-row db-row-2">
            <article className="db-card pc-sa-chart">
              <header>
                <div><span className="db-label">Active customers at month end, {range(ws, LAST)}</span><strong className="db-big db-big-sm">{int(now.active)} at the end of {at}</strong></div>
                {clickHint}
              </header>
              <Line data={linePts(ws, (s) => s.active, int, "Active customers")} selected={sel} onSelect={setSel} on={on} label="Active customers by month. Click a month to filter the report to it." />
            </article>
            <article className="db-card pc-sa-chart">
              <header><div><span className="db-label">Active customers by tenure, Jun 2025</span><strong className="db-big db-big-sm">{tenure === null ? `Largest band: ${ACTIVE_TENURE[activeTop][0].replace(" mo", " months")}` : `${ACTIVE_TENURE[tenure][0].replace(" mo", " months")}: ${Math.round((ACTIVE_TENURE[tenure][1] / activeTotal) * 100)}% of ${activeTotal}`}</strong></div></header>
              <Bars data={ACTIVE_TENURE.map(([l, v]): BarDatum => ({ key: l, label: l, h: v / Math.max(...ACTIVE_TENURE.map(([, x]) => x)), tip: int(v), tipLabel: `Active, ${l.replace(" mo", " months")}` }))} selected={tenure} onSelect={setTenure} on={on} label="Active customers by tenure. Click a band to select it." />
              <p className="pc-sa-fixnote">All plans, Jun 2025. Not affected by the slicers.</p>
            </article>
          </div>
          <div className="db-row db-row-3">
            <article className="db-card pc-sa-chart">
              <header>
                <div><span className="db-label">New vs churned customers by plan, {at}</span><strong className="db-big db-big-sm">{shrank.length === 0 ? "No plan lost more than it won" : shrank.length === 1 ? `${shrank[0]} shrank: ${byPlan[PLANS.indexOf(shrank[0])].churned} lost, ${byPlan[PLANS.indexOf(shrank[0])].newC} won` : `${shrank.join(" and ")} lost more than they won`}</strong></div>
                {legend("New", "Churned", NEW_C, CHURN_C)}
              </header>
              <Cluster data={PLANS.map((n, p) => ({ key: n, label: n, vals: [byPlan[p].newC, byPlan[p].churned], tipLabel: `${n}, ${at}`, tips: [`New ${byPlan[p].newC}`, `Churned ${byPlan[p].churned}`] }))} selected={plan} onSelect={pickPlan} on={on} colors={[NEW_C, CHURN_C]} label="New and churned customers by plan. Click a plan to filter the report to it." />
            </article>
            <article className="db-card pc-sa-chart">
              <header><div><span className="db-label">Retention rate by plan, {at}</span><strong className="db-big db-big-sm">{end > 0 ? `${plan === null ? "All plans" : PLANS[plan]}: ${p2(now.retention)} kept` : "No retention for the first month"}</strong></div>{planHint}</header>
              <HBars label="Retention rate by plan. Click a plan to filter the report to it." plan={plan} onPlan={pickPlan} rows={PLANS.map((n, p) => ({ key: n, label: n, color: PLAN_COLOR[p], bars: [{ v: byPlan[p].retention / 100, text: end > 0 ? p2(byPlan[p].retention) : "n/a" }] }))} />
            </article>
          </div>
        </div>
      )}

      {tab === "Churn" && (
        <div className="db-page" key="churn">
          {filters}
          <Kpis items={kpiSets.Churn} on={on} />
          <div className="db-row db-row-2">
            <article className="db-card pc-sa-chart">
              <header>
                <div><span className="db-label">Customer churn rate by month, {range(Math.max(1, ws), LAST)}</span><strong className="db-big db-big-sm">{end > 0 ? `${p2(now.rate)} in ${at}` : "No churn rate for the first month"}</strong></div>
                {clickHint}
              </header>
              <Line data={linePts(Math.max(1, ws), (s) => s.rate, p2, "Churn rate")} selected={sel} onSelect={setSel} on={on} label="Customer churn rate by month. Click a month to filter the report to it." />
            </article>
            <article className="db-card pc-sa-chart">
              <header><div><span className="db-label">Churned customers by tenure, Jan 2024 to Jun 2025</span><strong className="db-big db-big-sm">{churnTenure === null ? `${Math.round((CHURN_TENURE[0][1] / churnTotal) * 100)}% leave in their first 3 months` : `${CHURN_TENURE[churnTenure][0].replace(" mo", " months")}: ${CHURN_TENURE[churnTenure][1]} of ${churnTotal}`}</strong></div></header>
              <Bars data={CHURN_TENURE.map(([l, v]): BarDatum => ({ key: l, label: l, h: v / Math.max(...CHURN_TENURE.map(([, x]) => x)), tip: int(v), tipLabel: `Churned, ${l.replace(" mo", " months")}` }))} selected={churnTenure} onSelect={setChurnTenure} on={on} label="Churned customers by tenure. Click a band to select it." />
              <p className="pc-sa-fixnote">All plans, all months. Not affected by the slicers.</p>
            </article>
          </div>
          <div className="db-row db-row-3">
            <article className="db-card pc-sa-chart">
              <header>
                <div><span className="db-label">Churned customers and MRR lost by plan, {windowLabel}</span><strong className="db-big db-big-sm">{`${kf(lostIn(ALL).mrr)} MRR lost, ${lostIn(ALL).c} customers`}</strong></div>
                {legend("Customers", "MRR", "#1f3a2c", "#e98a64")}
              </header>
              <HBars label="Churned customers and MRR lost by plan. Click a plan to filter the report to it." plan={plan} onPlan={pickPlan} rows={PLANS.map((n, p) => ({ key: n, label: n, color: PLAN_COLOR[p], bars: [
                { v: lost[p].c / Math.max(1, ...lost.map((l) => l.c)), text: `${lost[p].c}`, color: "#1f3a2c" },
                { v: lost[p].mrr / Math.max(1, ...lost.map((l) => l.mrr)), text: usd(lost[p].mrr), color: "#e98a64" },
              ] }))} />
            </article>
            <article className="db-card pc-sa-chart">
              <header><div><span className="db-label">Churned MRR by plan, {at} only</span><strong className="db-big db-big-sm">{`${kf(total.churnedMrr)} lost in ${at}`}</strong></div>{planHint}</header>
              <HBars label="Churned MRR by plan for the month. Click a plan to filter the report to it." plan={plan} onPlan={pickPlan} rows={PLANS.map((n, p) => ({ key: n, label: n, color: PLAN_COLOR[p], bars: [{ v: byPlan[p].churnedMrr / Math.max(1, ...byPlan.map((s) => s.churnedMrr)), text: kf(byPlan[p].churnedMrr) }] }))} />
            </article>
          </div>
        </div>
      )}
    </div>
  );
}
