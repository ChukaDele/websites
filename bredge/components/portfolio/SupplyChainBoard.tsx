"use client";

import { useMemo, useState } from "react";
import { ChartLineUp, Clock, CurrencyDollar, Lightning, Timer, Truck, Warning } from "@phosphor-icons/react";
import { Chip, Count, Delta, FilterChip, Slicer, Topbar, useAlerts, useInView, type About } from "../landing/Dashboards";
import { supplyChainMeta } from "./meta";
import { AllColumns, FilterBar } from "../landing/PhoneFilters";

/**
 * Supply Chain Performance, rebuilt from the original Power BI report.
 * Four report pages, a segment slicer and market cross-filter that stay in
 * sync across pages (like synced slicers), hover tooltips, sortable tables
 * and clickable donuts. Built on the public DataCo supply chain sample.
 *
 * Exact figures are the ones printed on the original. Values read off its
 * charts by eye (monthly trend, shipping days by mode, departments, discount
 * curve) only shape the charts and appear as "about" in tooltips.
 */

// Defined in ./meta so the Work page can list this board without loading it.
export { supplyChainMeta };

const ABOUT: About = {
  question: "Where are deliveries running late, which markets and categories make the money, and does discounting hurt margin?",
  built: [
    "Orders, shipping and customers modelled into one sales table",
    "Late, on time and early worked out from actual vs scheduled days",
    "Sales and profit reconciled across market, segment and category",
    "Discount rates tested against profit ratio, band by band",
    "Late rate shown on all orders and on shipped orders, so cancellations do not flatter it",
  ],
  sources: "Built on the public DataCo supply chain sample. Sample data, not client figures. All money in USD, full year. Late means actual shipping days exceed scheduled days. Average delay is the mean of actual minus scheduled days, so early orders net off late ones; read it with the late rate. The sample has no shipped quantities or stock levels, so OTIF, fill rate and inventory turns cannot be measured here and are not estimated. Profit and delivery figures are not split by market or segment in the source, so those tiles say so when a filter is on.",
};

/* ───────────── data (printed on the original unless marked "about") ───────────── */

const MARKETS = ["Europe", "LATAM", "Pacific Asia", "USCA", "Africa"] as const;
type Market = typeof MARKETS[number];
const SEGMENTS = ["Consumer", "Corporate", "Home Office"] as const;
type Segment = typeof SEGMENTS[number];
const SEG_OPTS = ["All", ...SEGMENTS] as const;
type SegOpt = typeof SEG_OPTS[number];

// Customer segment x market, sales in USD.
const MATRIX: Record<Market, Record<Segment, number>> = {
  Africa: { Consumer: 1187434, Corporate: 699758, "Home Office": 407261 },
  Europe: { Consumer: 5671565, Corporate: 3303071, "Home Office": 1897761 },
  LATAM: { Consumer: 5289639, Corporate: 3139115, "Home Office": 1848859 },
  "Pacific Asia": { Consumer: 4286861, Corporate: 2515593, "Home Office": 1471290 },
  USCA: { Consumer: 2660291, Corporate: 1510871, "Home Office": 895366 },
};
const ORDERS: Record<Market, number> = { Africa: 10603, Europe: 43855, LATAM: 47084, "Pacific Asia": 32533, USCA: 23562 };
const marketSales = (m: Market, s: SegOpt) => (s === "All" ? SEGMENTS.reduce((t, x) => t + MATRIX[m][x], 0) : MATRIX[m][s]);
const segSales = (s: Segment) => MARKETS.reduce((t, m) => t + MATRIX[m][s], 0);
const ALL_SALES = MARKETS.reduce((t, m) => t + marketSales(m, "All"), 0);

const MN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MN_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
// About: monthly sales in $M read off the trend chart. Profit follows the 10.9% overall margin.
// Scaled so the twelve months add up exactly to total sales from the matrix (one series, no drift).
const SALES_READ = [3.45, 2.9, 3.1, 3.05, 3.2, 3.05, 3.2, 3.2, 3.15, 3.15, 2.7, 2.6];
const SALES_M = SALES_READ.map((v) => v * (ALL_SALES / 1e6) / SALES_READ.reduce((t, x) => t + x, 0));
const PROFIT_M = 4.0; // printed total profit, $M
const MARGIN = PROFIT_M / (ALL_SALES / 1e6);

type Cat = { name: string; orders: number; sales: number; profit: number };
const CATS: Cat[] = [
  { name: "Fishing", orders: 17325, sales: 6929653.7, profit: 756220.8 },
  { name: "Cleats", orders: 24551, sales: 4431942.8, profit: 494636.9 },
  { name: "Camping & Hiking", orders: 13729, sales: 4118425.6, profit: 427455.6 },
  { name: "Cardio Equipment", orders: 12487, sales: 3694843.2, profit: 383011.1 },
  { name: "Women's Apparel", orders: 21035, sales: 3147800.0, profit: 350421.0 },
  { name: "Water Sports", orders: 15540, sales: 3113844.7, profit: 325147.0 },
  { name: "Men's Footwear", orders: 22246, sales: 2891757.7, profit: 311902.8 },
  { name: "Indoor/Outdoor Games", orders: 19298, sales: 2888993.9, profit: 318451.4 },
  { name: "Shop By Sport", orders: 10984, sales: 1309522.0, profit: 129814.0 },
  { name: "Computers", orders: 442, sales: 663000.0, profit: 69656.8 },
];

// About: average shipping days by mode, read off the clustered column chart.
const MODES = [
  { name: "Standard Class", sched: 4, real: 4 },
  { name: "Second Class", sched: 2, real: 4 },
  { name: "First Class", sched: 1, real: 2 },
  { name: "Same Day", sched: 0, real: 0.5 },
];

const STATUS = [
  { key: "late", label: "Late delivery", v: 54.83, color: "#d65c2c" },
  { key: "adv", label: "Advance shipping", v: 23.04, color: "#90d26f" },
  { key: "on", label: "Shipping on time", v: 17.84, color: "#1f3a2c" },
  { key: "can", label: "Shipping cancelled", v: 4.3, color: "#c9cfc6" },
];
const statusV = (k: string) => STATUS.find((s) => s.key === k)!.v;
// Shares of all orders, and of shipped orders (cancelled taken out of the base).
const SHIPPED = 100 - statusV("can");
const LATE_ALL = statusV("late");
const LATE_SHIPPED = (statusV("late") / SHIPPED) * 100;
const ONTIME_ALL = statusV("adv") + statusV("on");
const ONTIME_SHIPPED = (ONTIME_ALL / SHIPPED) * 100;

// Order status counts as labelled on the original (thousands). Complete was not labelled.
const ORDER_STATUS: Array<[string, number]> = [
  ["Pending Payment", 40], ["Processing", 22], ["Pending", 20], ["Closed", 20],
  ["On Hold", 10], ["Suspected Fraud", 4], ["Canceled", 4], ["Payment Review", 2],
];

const SEG_COLOR: Record<Segment, string> = { Consumer: "#1f3a2c", Corporate: "#90d26f", "Home Office": "#2e9bf0" };

// About: sales and profit by department in $M, read off the bar chart.
const DEPTS: Array<[string, number, number]> = [
  ["Fan Shop", 17.1, 1.8], ["Apparel", 8.0, 0.9], ["Golf", 4.6, 0.5], ["Footwear", 4.0, 0.45],
  ["Outdoors", 1.3, 0.15], ["Technology", 1.1, 0.1], ["Fitness", 0.4, 0.05],
];

// About: profit ratio by discount rate, the shape of the original scatter.
const DISCOUNT: Array<[number, number]> = Array.from({ length: 26 }, (_, x) => {
  const y = x <= 4.5 ? 12.1 + 0.3 * Math.sin((Math.PI / 2) * (x / 4.5))
    : x <= 19.75 ? 12.4 - 1.1 * ((x - 4.5) / 15.25)
      : 11.3 + 1.3 * Math.pow((x - 19.75) / 5.25, 1.5);
  return [x, +y.toFixed(2)];
});

/* ───────────── formatting ───────────── */

const usdM = (n: number) => `$${(n / 1_000_000).toFixed(1)}M`;
const usdK = (n: number) => `$${Math.round(n / 1000).toLocaleString("en-US")}K`;
const int = (n: number) => Math.round(n).toLocaleString("en-US");
const pct1 = (n: number) => `${n.toFixed(1)}%`;

/* ───────────── visuals ───────────── */

type HBar = { key: string; label: string; value: number; shown: string; tip?: string };

/** Horizontal bars with a hover tooltip and click-to-filter. */
function HBars({ items, max, selected, onSelect, on, label, dense = false }: { items: HBar[]; max: number; selected: string | null; onSelect: (k: string | null) => void; on: boolean; label: string; dense?: boolean }) {
  const [hover, setHover] = useState<string | null>(null);
  return (
    <div className={`pc-sc-hbars${selected ? " has-sel" : ""}${dense ? " is-dense" : ""}`} role="group" aria-label={label} onMouseLeave={() => setHover(null)}>
      {items.map((d, i) => (
        <button
          key={d.key}
          type="button"
          className={`pc-sc-hbar${selected === d.key ? " is-sel" : ""}`}
          style={{ "--v": on ? d.value / max : 0, "--i": i } as React.CSSProperties}
          aria-pressed={selected === d.key}
          aria-label={`${d.label}: ${d.shown}${d.tip ? `. ${d.tip}` : ""}`}
          onMouseEnter={() => setHover(d.key)}
          onFocus={() => setHover(d.key)}
          onBlur={() => setHover(null)}
          onClick={() => onSelect(selected === d.key ? null : d.key)}
        >
          <span className="pc-sc-hbar-l">{d.label}</span>
          <span className="pc-sc-hbar-t"><i /></span>
          <b>{d.shown}</b>
          {hover === d.key && d.tip && <span className="pc-sc-tip" aria-hidden="true">{d.tip}</span>}
        </button>
      ))}
    </div>
  );
}

type Slice = { key: string; label: string; value: number; shown: string; color: string };

/** Donut with a clickable legend. Hover or pick a slice to read it in the middle. */
function Donut({ slices, selected, onSelect, on, center, label }: { slices: Slice[]; selected: string | null; onSelect: (k: string | null) => void; on: boolean; center: (k: string | null) => React.ReactNode; label: string }) {
  const [hover, setHover] = useState<string | null>(null);
  const total = slices.reduce((t, s) => t + s.value, 0);
  const starts = slices.map((_, i) => slices.slice(0, i).reduce((t, s) => t + (s.value / total) * 100, 0));
  return (
    <div className="pc-sc-donut">
      <div className="db-donut-wrap">
        <svg className="db-donut" viewBox="0 0 140 140" aria-hidden="true">
          <circle className="db-donut-bg" cx="70" cy="70" r="56" pathLength={100} />
          {slices.map((s, i) => {
            const p = (s.value / total) * 100;
            const off = starts[i];
            const len = on ? Math.max(p - 0.8, 0.2) : 0;
            return (
              <circle
                key={s.key}
                cx="70" cy="70" r="56" pathLength={100}
                stroke={s.color}
                strokeDasharray={`${len} ${100 - len}`}
                strokeDashoffset={-off}
                className={(selected ?? hover) && (selected ?? hover) !== s.key ? "is-dim" : undefined}
                onMouseEnter={() => setHover(s.key)}
                onMouseLeave={() => setHover(null)}
                onClick={() => onSelect(selected === s.key ? null : s.key)}
              />
            );
          })}
        </svg>
        <div className="db-donut-mid">{center(hover ?? selected)}</div>
      </div>
      <ul className="db-legend" aria-label={label}>
        {slices.map((s) => (
          <li key={s.key}>
            <button type="button" aria-pressed={selected === s.key} className={selected && selected !== s.key ? "is-dim" : undefined} onMouseEnter={() => setHover(s.key)} onMouseLeave={() => setHover(null)} onClick={() => onSelect(selected === s.key ? null : s.key)}>
              <i style={{ background: s.color }} />{s.label}<b>{s.shown}</b>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

type Series = { name: string; values: number[]; cls: string };

const smooth = (pts: Array<[number, number]>) => pts.reduce((d, p, i, a) => {
  if (i === 0) return `M${p[0]},${p[1]}`;
  const p0 = a[i - 2] ?? a[i - 1], p1 = a[i - 1], p3 = a[i + 1] ?? p;
  const c1 = [p1[0] + (p[0] - p0[0]) / 6, p1[1] + (p[1] - p0[1]) / 6];
  const c2 = [p[0] - (p3[0] - p1[0]) / 6, p[1] - (p3[1] - p1[1]) / 6];
  return `${d} C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${p[0]},${p[1]}`;
}, "");

/** Smoothed area chart with a hover guide and tooltip. */
function Trend({ series, min, max, ticks, tip, on, label }: { series: Series[]; min: number; max: number; ticks: Array<[number, string]>; tip: (i: number) => string[]; on: boolean; label: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const n = MN.length;
  const x = (i: number) => (i / (n - 1)) * 100;
  const y = (v: number) => 100 - ((v - min) / (max - min)) * 100;
  return (
    <div className={`pc-sc-trend${on ? " is-on" : ""}`} role="group" aria-label={label} onMouseLeave={() => setHover(null)}>
      <div className="pc-sc-plot">
        {ticks.map(([v, l]) => <span key={l} className="pc-sc-grid" style={{ top: `${y(v)}%` }}><em>{l}</em></span>)}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {series.map((s) => {
            const line = smooth(s.values.map((v, i) => [x(i), y(v)]));
            return <g key={s.name} className={s.cls}><path className="pc-sc-area" d={`${line} L100,100 L0,100 Z`} /><path className="pc-sc-line" d={line} /></g>;
          })}
        </svg>
        {hover !== null && (
          <>
            <span className="pc-sc-guide" style={{ left: `${x(hover)}%` }} />
            {series.map((s) => <span key={s.name} className={`pc-sc-dot ${s.cls}`} style={{ left: `${x(hover)}%`, top: `${y(s.values[hover])}%` }} />)}
            <span className={`pc-sc-tip pc-sc-tip-trend${hover > n - 4 ? " is-end" : hover < 3 ? " is-start" : ""}`} style={{ left: `${x(hover)}%` }}>
              <small>{tip(hover)[0]}</small>{tip(hover).slice(1).map((t) => <span key={t}>{t}</span>)}
            </span>
          </>
        )}
        {MN.map((m, i) => (
          <button key={m} type="button" className="pc-sc-hit" style={{ left: `${x(i)}%`, width: `${100 / (n - 1)}%` }} aria-label={tip(i).join(", ")} onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} onBlur={() => setHover(null)} onClick={() => setHover(i)} />
        ))}
      </div>
      <div className="pc-sc-x" aria-hidden="true">{MN.map((m, i) => <span key={m} style={{ left: `${x(i)}%` }}>{m}</span>)}</div>
    </div>
  );
}

/* ───────────── board ───────────── */

const TABS = ["Overview", "Delivery", "Sales & profit", "Insights"] as const;
type SortKey = "orders" | "sales" | "profit" | "margin";
const margin = (c: Cat) => c.profit / c.sales;

export function SupplyChainBoard() {
  const [ref, on] = useInView<HTMLDivElement>();
  const [tab, setTab] = useState<string>("Overview");
  // Synced across pages: the segment slicer, the donut and the matrix columns; the market bars and the matrix rows.
  const [seg, setSeg] = useState<SegOpt>("All");
  const [market, setMarket] = useState<Market | null>(null);
  const [view, setView] = useState<"Actual vs scheduled" | "Days over schedule">("Actual vs scheduled");
  const [mode, setMode] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "sales", dir: -1 });
  const [cat, setCat] = useState<string | null>(null);
  const [ostat, setOstat] = useState<string | null>(null);
  const [cell, setCell] = useState<"Sales" | "Share of market">("Sales");
  const [dept, setDept] = useState<string | null>(null);
  const [discHover, setDiscHover] = useState<number | null>(null);
  const [discPin, setDiscPin] = useState<number | null>(null);
  const disc = discHover ?? discPin;
  const [alerts, read] = useAlerts([
    { id: "s1", title: "Late deliveries at 54.8% of orders", when: "Today, 07:30" },
    { id: "s2", title: "Second Class runs about 2 days over schedule", when: "Yesterday" },
    { id: "s3", title: "Margin is lowest near a 20% discount", when: "Mon" },
  ]);

  const filtered = seg !== "All" || market !== null;
  const notSplit = "all markets and segments: not split by this filter";
  const sales = market ? marketSales(market, seg) : seg === "All" ? ALL_SALES : segSales(seg);
  const scope = `${market ?? "All markets"}, ${seg === "All" ? "all segments" : seg}`;
  const pickSeg = (s: string | null) => setSeg((s ?? "All") as SegOpt);

  const chips = (
    <>
      {seg !== "All" && <FilterChip label={seg} onClear={() => setSeg("All")} />}
      {market && <FilterChip label={market} onClear={() => setMarket(null)} />}
    </>
  );

  /* Overview */
  const kpis = [
    { label: "Total sales", sub: filtered ? scope : "full year, all markets", icon: CurrencyDollar, to: sales, f: usdM, delta: filtered ? null : { d: "43.3%", down: false, vs: "vs prior year" }, note: filtered ? `${pct1((sales / ALL_SALES) * 100)} of all sales` : "" },
    { label: "Total profit", sub: filtered ? notSplit : `full year, ${pct1(MARGIN * 100)} of sales`, icon: ChartLineUp, to: PROFIT_M, f: (n: number) => `$${n.toFixed(1)}M`, delta: { d: "44.6%", down: false, vs: "vs prior year" }, note: "" },
    { label: "Avg shipping delay", sub: filtered ? notSplit : "mean of actual minus scheduled days", icon: Clock, to: 0.6, f: (n: number) => `${n.toFixed(1)} days`, delta: null, note: "Flat vs prior year; early orders net off late ones" },
    { label: "Late delivery rate", sub: filtered ? notSplit : `all orders; ${pct1(LATE_SHIPPED)} of shipped`, icon: Warning, to: LATE_ALL, f: pct1, delta: { d: "0.1 pts", down: false, vs: "lower vs prior year" }, note: "" },
  ];
  const marketBars: HBar[] = MARKETS.map((m) => {
    const v = marketSales(m, seg);
    return {
      key: m, label: m, value: v, shown: usdM(v),
      tip: seg === "All" ? `${int(ORDERS[m])} orders · $${Math.round(v / ORDERS[m])} per order` : `${seg}: ${pct1((v / marketSales(m, "All")) * 100)} of ${m} sales`,
    };
  });
  const maxMarket = Math.max(...marketBars.map((b) => b.value));
  const top2 = (marketSales("Europe", seg) + marketSales("LATAM", seg)) / MARKETS.reduce((t, m) => t + marketSales(m, seg), 0);
  const overviewHint = market
    ? `${market}: ${SEGMENTS.map((s) => `${s} ${Math.round((MATRIX[market][s] / marketSales(market, "All")) * 100)}%`).join(", ")} of sales, from ${int(ORDERS[market])} orders.`
    : `Europe and LATAM bring ${Math.round(top2 * 100)}% of ${seg === "All" ? "" : `${seg} `}sales. Click a market to filter the report.`;

  /* Delivery */
  const modeSel = MODES.find((m) => m.name === mode);
  const st = STATUS.find((s) => s.key === status);
  const statusHint: Record<string, string> = {
    late: "More than half of all orders arrive after the scheduled date.",
    adv: "Almost a quarter of orders arrive before the scheduled date.",
    on: "Fewer than one order in five arrives exactly on schedule.",
    can: "Cancelled shipments. They stay in the base of these shares; the shipped-order rates on the cards leave them out.",
  };

  /* Sales & profit */
  const cats = useMemo(() => [...CATS].sort((a, b) => ((sort.key === "margin" ? margin(a) - margin(b) : a[sort.key] - b[sort.key]) * sort.dir)), [sort]);
  const sortBy = (key: SortKey) => setSort((s) => ({ key, dir: s.key === key ? (s.dir === 1 ? -1 : 1) : -1 }));
  const arrow = (key: SortKey) => (sort.key === key ? (sort.dir === -1 ? " ↓" : " ↑") : "");
  const maxProfit = Math.max(...CATS.map((c) => c.profit));
  const catSel = CATS.find((c) => c.name === cat);
  // The segment donut follows the market filter, so it always agrees with the market bars.
  const segIn = (s: Segment) => (market ? MATRIX[market][s] : segSales(s));
  const segBase = market ? marketSales(market, "All") : ALL_SALES;
  const segSlices: Slice[] = SEGMENTS.map((s) => ({ key: s, label: s, value: segIn(s), shown: pct1((segIn(s) / segBase) * 100), color: SEG_COLOR[s] }));
  const statusBars: HBar[] = ORDER_STATUS.map(([l, v]) => ({ key: l, label: l, value: v, shown: `${v}K`, tip: `About ${v}K orders` }));

  /* Insights */
  const maxCell = Math.max(...MARKETS.flatMap((m) => SEGMENTS.map((s) => MATRIX[m][s])));
  const deptSel = DEPTS.find(([d]) => d === dept);
  const discSel = disc === null ? null : DISCOUNT[disc];

  return (
    <div ref={ref} className={`db pc-sc${on ? " is-on" : ""}`}>
      <Topbar title="Supply chain" tabs={TABS} tab={tab} onTab={setTab} alerts={alerts} onRead={read} about={ABOUT} />

      {tab === "Overview" && (
        <div className="db-page" key="overview">
          <FilterBar>
            <Slicer label="Customer segment" options={SEG_OPTS} value={seg} onChange={setSeg} />
            {market && <FilterChip label={market} onClear={() => setMarket(null)} />}
            <p className="db-context"><b>Full year</b> compared with <b>prior year</b>, USD</p>
          </FilterBar>
          <div className="db-kpis">
            {kpis.map((c, i) => (
              <article key={c.label} className="db-card db-kpi" style={{ "--i": i } as React.CSSProperties}>
                <header><span>{c.label}<small>{c.sub}</small></span><Chip icon={c.icon} /></header>
                <strong><Count to={c.to} on={on} format={c.f} /></strong>
                {c.delta ? <Delta value={c.delta.d} down={c.delta.down} note={c.delta.vs} /> : <span className="db-note">{c.note}</span>}
              </article>
            ))}
          </div>
          <div className="db-row db-row-2">
            <article className="db-card">
              <header>
                <div><span className="db-label">Sales and profit by month, all markets</span><strong className="db-big db-big-sm">Sales hold near $3M a month, profit near $0.35M</strong></div>
                <span className="pc-sc-key"><i className="is-sales" />Sales<i className="is-profit" />Profit</span>
              </header>
              <Trend
                on={on}
                label="Sales and profit by month. Hover a month to read it."
                min={0} max={4} ticks={[[0, "$0M"], [2, "$2M"], [4, "$4M"]]}
                series={[{ name: "Sales", values: SALES_M, cls: "is-sales" }, { name: "Profit", values: SALES_M.map((v) => v * MARGIN), cls: "is-profit" }]}
                tip={(i) => [MN_LONG[i], `Sales about $${SALES_M[i].toFixed(1)}M`, `Profit about $${(SALES_M[i] * MARGIN).toFixed(2)}M`]}
              />
            </article>
            <article className="db-card">
              <header><div><span className="db-label">Sales by market, {seg === "All" ? "all segments" : seg}</span><strong className="db-big db-big-sm">{market ? `Filtered to ${market}` : "Europe leads, Africa trails"}</strong></div></header>
              <HBars items={marketBars} max={maxMarket} selected={market} onSelect={(k) => setMarket(k as Market | null)} on={on} label="Sales by market. Click a market to filter the report to it." />
              <p className="db-hint"><Lightning size={13} weight="fill" /> {overviewHint}</p>
            </article>
          </div>
        </div>
      )}

      {tab === "Delivery" && (
        <div className="db-page" key="delivery">
          <FilterBar>
            <Slicer label="Chart view" options={["Actual vs scheduled", "Days over schedule"] as const} value={view} onChange={setView} />
            {mode && <FilterChip label={mode} onClear={() => setMode(null)} />}
            <p className="db-context"><b>All orders, full year</b> against <b>the scheduled date</b>, all markets</p>
          </FilterBar>
          <div className="db-kpis">
            <article className="db-card db-kpi" style={{ "--i": 0 } as React.CSSProperties}>
              <header><span>Actual shipping time<small>mean actual shipping days, per order line</small></span><Chip icon={Truck} /></header>
              <strong><Count to={3.5} on={on} format={(n) => `${n.toFixed(1)} days`} /></strong>
              <Delta value="0.6 days" down note="slower than the 2.9-day schedule" />
            </article>
            <article className="db-card db-kpi" style={{ "--i": 1 } as React.CSSProperties}>
              <header><span>Late deliveries<small>{`all orders; ${pct1(LATE_SHIPPED)} of shipped orders`}</small></span><Chip icon={Warning} /></header>
              <strong><Count to={LATE_ALL} on={on} format={pct1} /></strong>
              <Delta value="0.1 pts" note="lower vs prior year" />
            </article>
            <article className="db-card db-kpi" style={{ "--i": 2 } as React.CSSProperties}>
              <header><span>On time or early<small>{`all orders; ${pct1(ONTIME_SHIPPED)} of shipped orders`}</small></span><Chip icon={Clock} /></header>
              <strong><Count to={ONTIME_ALL} on={on} format={pct1} /></strong>
              <span className="db-note">{`The other ${pct1(statusV("can"))} were cancelled. On time only: no OTIF, as the sample has no shipped quantities`}</span>
            </article>
            <article className="db-card db-kpi" style={{ "--i": 3 } as React.CSSProperties}>
              <header><span>Fastest mode<small>average actual days</small></span><Chip icon={Timer} /></header>
              <strong>Same Day</strong>
              <span className="db-note">About half a day, vs about 4 for Standard</span>
            </article>
          </div>
          <div className="db-row db-row-2">
            <article className="db-card">
              <header>
                <div><span className="db-label">{view === "Actual vs scheduled" ? "Average shipping days by mode" : "Days over schedule by mode"}</span>
                  <strong className="db-big db-big-sm">{modeSel ? `${modeSel.name}: about ${modeSel.real} days actual, ${modeSel.sched} scheduled` : "Second Class runs about 2 days over"}</strong></div>
                {view === "Actual vs scheduled" && <span className="pc-sc-key"><i className="is-sched" />Scheduled<i className="is-real" />Actual</span>}
              </header>
              <div className="pc-sc-cols" role="group" aria-label="Shipping days by mode. Click a mode to select it.">
                {MODES.map((m, i) => {
                  const gap = m.real - m.sched;
                  return (
                    <button key={m.name} type="button" className={`pc-sc-col${mode === m.name ? " is-sel" : ""}${mode && mode !== m.name ? " is-dim" : ""}`} aria-pressed={mode === m.name} aria-label={`${m.name}: about ${m.real} days actual, ${m.sched} scheduled`} onClick={() => setMode(mode === m.name ? null : m.name)} style={{ "--i": i } as React.CSSProperties}>
                      <span className="pc-sc-col-bars">
                        {view === "Actual vs scheduled"
                          ? <><i className="is-sched" style={{ "--h": on ? m.sched / 4.5 : 0 } as React.CSSProperties} /><i className="is-real" style={{ "--h": on ? m.real / 4.5 : 0 } as React.CSSProperties} /></>
                          : <i className={gap >= 1 ? "is-over" : "is-real"} style={{ "--h": on ? gap / 2.5 : 0 } as React.CSSProperties} />}
                      </span>
                      <span className="pc-sc-col-v">{view === "Actual vs scheduled" ? `~${m.real}d` : `+${gap}d`}</span>
                      <em>{m.name}</em>
                    </button>
                  );
                })}
              </div>
              <p className="db-hint"><Lightning size={13} weight="fill" /> {modeSel
                ? modeSel.real - modeSel.sched >= 1 ? `${modeSel.name} promises ${modeSel.sched} ${modeSel.sched === 1 ? "day" : "days"} and takes about ${modeSel.real}: reset the promise or the carrier.` : `${modeSel.name} lands close to what it promises.`
                : "Every market averages the same 0.6-day delay, so the gap comes from shipping mode, not region."}</p>
            </article>
            <article className="db-card">
              <header><div><span className="db-label">Delivery status, share of all orders</span><strong className="db-big db-big-sm">{st ? st.label : "More than half arrive late"}</strong></div></header>
              <Donut
                on={on}
                label="Delivery status. Pick a status to read it."
                slices={STATUS.map((s) => ({ key: s.key, label: s.label, value: s.v, shown: `${s.v.toFixed(2)}%`, color: s.color }))}
                selected={status}
                onSelect={setStatus}
                center={(k) => { const s = STATUS.find((x) => x.key === k) ?? STATUS[0]; return <><b>{s.v.toFixed(1)}%</b><small>{s.label.toLowerCase()}</small></>; }}
              />
              <p className="db-hint"><Lightning size={13} weight="fill" /> {st ? statusHint[st.key] : "Late means actual shipping days exceed scheduled days, counted per order line. Shares are of all orders, cancelled included."}</p>
            </article>
          </div>
        </div>
      )}

      {tab === "Sales & profit" && (
        <div className="db-page" key="sales">
          {(seg !== "All" || cat || market) && (
            <FilterBar>
              {chips}
              {cat && <FilterChip label={cat} onClear={() => setCat(null)} />}
              <p className="db-context"><b>Full year</b>, USD. Category and order status tables cover all markets and segments</p>
            </FilterBar>
          )}
          <div className="db-row db-row-2">
            <article className="db-card">
              <header>
                <div><span className="db-label">Top 10 categories, full year, all markets</span><strong className="db-big db-big-sm">{catSel ? `${catSel.name}: ${pct1(margin(catSel) * 100)} margin on ${usdM(catSel.sales)}` : "Fishing earns the most profit"}</strong></div>
                <div className="db-sorts" role="group" aria-label="Sort categories">
                  {(["sales", "profit", "margin", "orders"] as const).map((key) => (
                    <button key={key} type="button" className={sort.key === key ? "is-on" : undefined} aria-pressed={sort.key === key} onClick={() => sortBy(key)}>{key[0].toUpperCase() + key.slice(1)}{arrow(key)}</button>
                  ))}
                </div>
              </header>
              <AllColumns />
              <div className="pc-sc-table" role="group" aria-label="Top categories">
                <div className="pc-sc-tr is-head"><span>Category</span><span className="is-orders">Orders</span><span>Sales</span><span>Profit</span><span>Margin</span></div>
                {cats.map((c) => (
                  <button key={c.name} type="button" className={`pc-sc-tr${cat === c.name ? " is-sel" : ""}${cat && cat !== c.name ? " is-dim" : ""}`} aria-pressed={cat === c.name} onClick={() => setCat(cat === c.name ? null : c.name)}>
                    <span className="pc-sc-name">{c.name}</span>
                    <span className="is-orders">{int(c.orders)}</span>
                    <span>{usdM(c.sales)}</span>
                    <span className="pc-sc-pbar" style={{ "--v": on ? c.profit / maxProfit : 0 } as React.CSSProperties}><i /><b>{usdK(c.profit)}</b></span>
                    <span>{pct1(margin(c) * 100)}</span>
                  </button>
                ))}
              </div>
              {catSel && <p className="db-hint"><Lightning size={13} weight="fill" /> {catSel.name}: {int(catSel.orders)} orders at ${Math.round(catSel.sales / catSel.orders)} each, {pct1((catSel.sales / ALL_SALES) * 100)} of all sales.</p>}
            </article>
            <div className="db-stack">
              <article className="db-card">
                <header><div><span className="db-label">Sales by customer segment, {market ?? "all markets"}</span><strong className="db-big db-big-sm">{seg === "All" ? `Consumers buy ${Math.round((segIn("Consumer") / segBase) * 100)}%` : `${seg}: ${usdM(segIn(seg))}`}</strong></div></header>
                <Donut
                  on={on}
                  label="Sales by segment. Pick a segment to filter the report."
                  slices={segSlices}
                  selected={seg === "All" ? null : seg}
                  onSelect={pickSeg}
                  center={(k) => k ? <><b>{usdM(segIn(k as Segment))}</b><small>{k}</small></> : <><b>{usdM(segBase)}</b><small>all segments</small></>}
                />
              </article>
              <article className="db-card">
                <header><div><span className="db-label">Orders by status, excluding complete, rounded to thousands</span><strong className="db-big db-big-sm">{ostat ? `${ostat}: about ${ORDER_STATUS.find(([l]) => l === ostat)?.[1]}K orders` : "40K orders wait on payment"}</strong></div></header>
                <HBars items={statusBars} max={40} selected={ostat} onSelect={setOstat} on={on} dense label="Orders by status. Click a status to select it." />
              </article>
            </div>
          </div>
        </div>
      )}

      {tab === "Insights" && (
        <div className="db-page" key="insights">
          <FilterBar>
            <Slicer label="Matrix values" options={["Sales", "Share of market"] as const} value={cell} onChange={setCell} />
            {chips}
            {discPin !== null && <FilterChip label={`${DISCOUNT[discPin][0]}% discount`} onClear={() => setDiscPin(null)} />}
            <p className="db-context"><b>Full year</b>, all orders</p>
          </FilterBar>
          <div className="db-row pc-sc-row-even">
            <article className="db-card">
              <header><div><span className="db-label">Avg profit ratio by discount rate, axis from 11%</span><strong className="db-big db-big-sm">{discSel ? `${discSel[0]}% discount: about ${discSel[1].toFixed(1)}% profit ratio` : "Margin peaks near a 4-5% discount"}</strong></div></header>
              <div className="pc-sc-scatter" role="group" aria-label="Profit ratio by discount rate. Pick a point to read it." onMouseLeave={() => setDiscHover(null)}>
                {[11, 12, 13].map((t) => <span key={t} className="pc-sc-grid" style={{ top: `${100 - ((t - 11) / 2) * 100}%` }}><em>{t}%</em></span>)}
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                  <path className="pc-sc-area" d={`${smooth(DISCOUNT.map(([dx, dy]) => [(dx / 30) * 100, 100 - ((dy - 11) / 2) * 100]))} L${(25 / 30) * 100},100 L0,100 Z`} />
                </svg>
                {DISCOUNT.map(([dx, dy], i) => (
                  <button key={dx} type="button" aria-pressed={discPin === i} className={`pc-sc-pt${disc === i ? " is-sel" : ""}${dx >= 17 && dx <= 22 ? " is-low" : ""}`} style={{ left: `${(dx / 30) * 100}%`, bottom: `${((dy - 11) / 2) * 100}%`, "--i": i } as React.CSSProperties} aria-label={`${dx}% discount: profit ratio about ${dy.toFixed(1)}%`} onMouseEnter={() => setDiscHover(i)} onFocus={() => setDiscHover(i)} onBlur={() => setDiscHover(null)} onClick={() => setDiscPin(discPin === i ? null : i)} />
                ))}
                {discSel && <span className={`pc-sc-tip${discSel[0] > 20 ? " is-end" : ""}`} style={{ left: `${(discSel[0] / 30) * 100}%`, bottom: `calc(${((discSel[1] - 11) / 2) * 100}% + 12px)` }}><small>{discSel[0]}% discount</small>About {discSel[1].toFixed(1)}% profit</span>}
              </div>
              <div className="pc-sc-x is-disc" aria-hidden="true">{[0, 10, 20, 30].map((t) => <span key={t} style={{ left: `${(t / 30) * 100}%` }}>{t}%</span>)}</div>
              <p className="db-hint"><Lightning size={13} weight="fill" /> Profit ratio falls from about 12.4% to about 11.3% as discounts climb to 20%. It is an unweighted average of order-line ratios, so it sits above the {pct1(MARGIN * 100)} sales-weighted margin. A pattern, not proof of cause: test a cap near 5% before making it policy.</p>
            </article>
            <article className="db-card">
              <header>
                <div><span className="db-label">Sales and profit by department</span><strong className="db-big db-big-sm">{deptSel ? `${deptSel[0]}: about $${deptSel[1]}M sales, $${deptSel[2]}M profit` : "Fan Shop brings almost half of sales"}</strong></div>
                <span className="pc-sc-key"><i className="is-sales" />Sales<i className="is-profit" />Profit</span>
              </header>
              <div className="pc-sc-depts" role="group" aria-label="Sales and profit by department. Click a department to select it.">
                {DEPTS.map(([d, s, p], i) => (
                  <button key={d} type="button" className={`pc-sc-dept${dept === d ? " is-sel" : ""}${dept && dept !== d ? " is-dim" : ""}`} aria-pressed={dept === d} aria-label={`${d}: about $${s}M sales, about $${p}M profit`} onClick={() => setDept(dept === d ? null : d)} style={{ "--s": on ? s / 20 : 0, "--p": on ? p / 20 : 0, "--i": i } as React.CSSProperties}>
                    <span>{d}</span>
                    <span className="pc-sc-dept-bars"><i className="is-sales" /><i className="is-profit" /></span>
                  </button>
                ))}
              </div>
              <div className="pc-sc-x is-dept" aria-hidden="true">{[0, 5, 10, 15, 20].map((t) => <span key={t} style={{ left: `${(t / 20) * 100}%` }}>${t}M</span>)}</div>
            </article>
          </div>
          <article className="db-card">
            <header><div><span className="db-label">Sales by market and customer segment, full year</span><strong className="db-big db-big-sm">The segment mix barely moves between markets</strong></div><span className="db-pill">Click a market or segment</span></header>
            <div className="pc-sc-matrix" role="group" aria-label="Sales by market and segment">
              <div className="pc-sc-mrow is-head">
                <span>Market</span>
                {SEGMENTS.map((s) => (
                  <button key={s} type="button" aria-pressed={seg === s} className={seg === s ? "is-sel" : undefined} onClick={() => setSeg(seg === s ? "All" : s)}>{s}</button>
                ))}
                <span>Total</span>
              </div>
              {MARKETS.map((m) => {
                const tot = marketSales(m, "All");
                return (
                  <div key={m} className={`pc-sc-mrow${market === m ? " is-sel" : ""}${market && market !== m ? " is-dim" : ""}`}>
                    <button type="button" aria-pressed={market === m} onClick={() => setMarket(market === m ? null : m)}>{m}</button>
                    {SEGMENTS.map((s) => (
                      <span key={s} className={`pc-sc-cell${seg !== "All" && seg !== s ? " is-dim" : ""}`} style={{ "--a": MATRIX[m][s] / maxCell } as React.CSSProperties}>
                        {cell === "Sales" ? `$${int(MATRIX[m][s])}` : pct1((MATRIX[m][s] / tot) * 100)}
                      </span>
                    ))}
                    <span className="pc-sc-tot">{usdM(tot)}</span>
                  </div>
                );
              })}
            </div>
          </article>
        </div>
      )}
    </div>
  );
}
