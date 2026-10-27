"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, ChatCircleText, Check, CurrencyDollar, Lightning,
  MagnifyingGlass, Package, Percent, TrendDown, TrendUp, X, type Icon,
} from "@phosphor-icons/react";
import { Chip, Count, FilterChip, Slicer, Topbar, useAlerts, useInView, type About } from "../landing/Dashboards";
import { financialPerformanceMeta } from "./meta";
import { AllColumns, FilterBar } from "../landing/PhoneFilters";

/**
 * Financial Performance Report, rebuilt from the Power BI original (CFO
 * audience). Data: Microsoft's public Power BI "Financial Sample" dataset,
 * Sep 2013 to Dec 2014. Sample data, not a client's.
 *
 * Exact values: KPI totals and their MoM / YoY changes, discount by product,
 * discount and profit by country, and the 18 transaction rows the original
 * shows. Year totals (2013, 2014) are split from the printed total and its
 * YoY change. Monthly series were read off the original charts by eye: they
 * drive chart shape only and are always labelled "about".
 */

// Defined in ./meta so the Work page can list this board without loading it.
export { financialPerformanceMeta };

/* ───────────────────────── data ───────────────────────── */

const MONTHS = ["Sep 2013", "Oct 2013", "Nov 2013", "Dec 2013", "Jan 2014", "Feb 2014", "Mar 2014", "Apr 2014", "May 2014", "Jun 2014", "Jul 2014", "Aug 2014", "Sep 2014", "Oct 2014", "Nov 2014", "Dec 2014"];
const N = MONTHS.length;
const short = (i: number) => MONTHS[i].slice(0, 3);

// Approximate monthly values in $M, read off the original charts (shape only).
const SALES = [4.5, 9.2, 7.2, 5.3, 6.5, 7.2, 5.5, 6.9, 6.2, 9.5, 8.0, 5.8, 6.5, 12.4, 5.3, 12.0];
const PROFIT = [0.6, 1.4, 1.0, 0.8, 0.9, 1.0, 0.7, 1.0, 0.8, 1.4, 1.1, 0.7, 0.8, 1.9, 0.7, 2.1];
const DISCOUNT = [0.25, 0.55, 0.85, 0.5, 0.7, 0.4, 0.45, 0.5, 0.55, 0.65, 0.72, 0.5, 0.55, 0.88, 0.5, 0.52];

const SEGMENTS = ["Channel Partners", "Enterprise", "Government", "Midmarket", "Small Business"] as const;
type Segment = typeof SEGMENTS[number];
const SEG_OPTIONS = ["All segments", ...SEGMENTS] as const;
type SegOption = typeof SEG_OPTIONS[number];
const SEG_COLOR: Record<Segment, string> = { "Channel Partners": "#1f3a2c", Enterprise: "#9aa39e", Government: "#e07b39", Midmarket: "#c9d3c4", "Small Business": "#90d26f" };
// Approximate profit by segment ($M), read off the original. Government is the remainder of total profit.
const SEG_SHAPE: Record<Exclude<Segment, "Government">, number[]> = {
  "Small Business": [0.2, 0.15, 0.25, 0.3, 0.3, 0.3, 0.25, 0.3, 0.3, 0.35, 0.3, 0.25, 0.3, 0.35, 0.3, 0.4],
  "Channel Partners": [0.05, 0.1, 0.08, 0.06, 0.07, 0.08, 0.06, 0.08, 0.07, 0.1, 0.09, 0.06, 0.07, 0.12, 0.06, 0.1],
  Midmarket: [0.03, 0.05, 0.04, 0.03, 0.04, 0.05, 0.03, 0.05, 0.04, 0.06, 0.05, 0.03, 0.04, 0.07, 0.03, 0.06],
  Enterprise: [-0.03, 0, 0.02, -0.05, 0.02, 0, -0.04, 0.03, -0.02, 0.04, 0, -0.05, 0.01, 0.02, -0.06, 0.03],
};
const SEG_SERIES: Record<Segment, number[]> = {
  ...SEG_SHAPE,
  Government: PROFIT.map((p, i) => +(p - SEG_SHAPE["Small Business"][i] - SEG_SHAPE["Channel Partners"][i] - SEG_SHAPE.Midmarket[i] - SEG_SHAPE.Enterprise[i]).toFixed(2)),
};

const RANGES = ["Sep 2013-Dec 2014", "2013", "2014"] as const;
type Range = typeof RANGES[number];
const RANGE_LABEL: Record<Range, string> = { "Sep 2013-Dec 2014": "Sep 2013-Dec 2014", "2013": "Sep-Dec 2013", "2014": "Jan-Dec 2014" };
const inRange = (r: Range, i: number) => (r === "2013" ? i < 4 : r === "2014" ? i >= 4 : true);

type Change = { v: string; up: boolean; good: boolean };
type Kpi = { label: string; icon: Icon; total: number; py: number; pm: Change; pyc: Change; f: (n: number) => string; goodUp: boolean; monthly?: number[] };
const m1 = (n: number) => `$${n.toFixed(1)}M`;
const KPIS: Kpi[] = [
  { label: "Total sales", icon: CurrencyDollar, total: 118.7, py: 249.5, pm: { v: "122.9%", up: true, good: true }, pyc: { v: "249.5%", up: true, good: true }, f: m1, goodUp: true, monthly: SALES },
  { label: "Total profit", icon: TrendUp, total: 17, py: 235.6, pm: { v: "235.1%", up: true, good: true }, pyc: { v: "235.6%", up: true, good: true }, f: m1, goodUp: true, monthly: PROFIT },
  { label: "Total loss", icon: TrendDown, total: 0.7773, py: 149.6, pm: { v: "37.5%", up: false, good: true }, pyc: { v: "149.6%", up: true, good: false }, f: (n) => `$${(n * 1000).toFixed(1)}K`, goodUp: false },
  { label: "Total discount", icon: Percent, total: 9.2, py: 229.0, pm: { v: "9.6%", up: false, good: true }, pyc: { v: "229.0%", up: true, good: false }, f: m1, goodUp: false, monthly: DISCOUNT },
  { label: "Units sold", icon: Package, total: 1.13, py: 225.4, pm: { v: "83.9%", up: true, good: true }, pyc: { v: "225.4%", up: true, good: true }, f: (n) => (n >= 1 ? `${n.toFixed(2)}M` : `${Math.round(n * 1000)}K`), goodUp: true },
];
/** Like-for-like change: Sep-Dec 2014 against Sep-Dec 2013, from the approximate
 *  monthly values. The printed YoY sets 12 months of 2014 against 4 of 2013. */
const likeForLike = (k: Kpi): Change | null => {
  if (!k.monthly) return null;
  const a = k.monthly.slice(0, 4).reduce((x, y) => x + y, 0), b = k.monthly.slice(12, 16).reduce((x, y) => x + y, 0);
  if (a <= 0) return null;
  const c = (b / a - 1) * 100;
  return { v: `about ${Math.round(Math.abs(c))}%`, up: c >= 0, good: k.goodUp ? c >= 0 : c < 0 };
};
// 2013 + 2014 = total and 2014 = 2013 * (1 + YoY), so 2013 = total / (2 + YoY).
const yearTotal = (k: Kpi, r: Range) => {
  if (r === "Sep 2013-Dec 2014") return k.total;
  const y13 = k.total / (2 + k.py / 100);
  return r === "2013" ? y13 : k.total - y13;
};

const PRODUCTS: Array<[string, number]> = [["Paseo", 2.6], ["Velo", 1.58], ["VTT", 1.46], ["Amarilla", 1.29], ["Montana", 1.16], ["Carretera", 1.12]];
const COUNTRIES: Array<[string, string, number, number]> = [
  ["United States of America", "USA", 2.2, 3.0], ["Canada", "Canada", 2.0, 3.5], ["Mexico", "Mexico", 1.8, 2.9], ["France", "France", 1.7, 3.8], ["Germany", "Germany", 1.4, 3.7],
];

type Row = { country: string; product: string; segment: Segment; sales: number; discount: number; profit: number };
const ROWS: Row[] = ([
  ["Amarilla", "Channel Partners", 67177.6, 8200.4, 48333], ["Amarilla", "Enterprise", 371647.5, 41352.5, -24833], ["Amarilla", "Government", 2579791.8, 204711.2, 520947],
  ["Amarilla", "Midmarket", 44741.0, 5861.5, 11006], ["Amarilla", "Small Business", 792408.0, 48792.0, 91408],
  ["Carretera", "Channel Partners", 110610.2, 6605.8, 81306], ["Carretera", "Enterprise", 356716.3, 38096.3, -22304], ["Carretera", "Government", 1332156.7, 63773.4, 307812],
  ["Carretera", "Midmarket", 126091.2, 14803.8, 32161], ["Carretera", "Small Business", 684630.0, 92370.0, 37130],
  ["Montana", "Channel Partners", 55561.3, 2506.7, 41044], ["Montana", "Enterprise", 376312.5, 0, 15053], ["Montana", "Government", 829859.9, 128219.1, 129630],
  ["Montana", "Midmarket", 57994.8, 6010.2, 15325], ["Montana", "Small Business", 1392190.5, 133459.5, 120816],
  ["Paseo", "Channel Partners", 165020.0, 12472.0, 120647], ["Paseo", "Enterprise", 965142.5, 46732.5, -6258], ["Paseo", "Government", 3956873.5, 299611.6, 861733],
] as Array<[string, Segment, number, number, number]>).map(([product, segment, sales, discount, profit]) => ({ country: "Canada", product, segment, sales, discount, profit }));
const usd = (n: number) => `${n < 0 ? "-" : ""}$${Math.abs(n).toLocaleString("en-US", { maximumFractionDigits: 1, minimumFractionDigits: Number.isInteger(n) ? 0 : 1 })}`;
const about = (n: number) => `about ${n < 0 ? "-" : ""}$${Math.abs(n) >= 3 ? Math.round(Math.abs(n)) : Math.abs(n).toFixed(1)}M`;

const COMPARES = ["Sales & profit", "Discount & sales", "Discount & profit"] as const;
type Compare = typeof COMPARES[number];
type Series = { name: string; color: string; vals: number[] };
const S_SALES: Series = { name: "Sales", color: "#90d26f", vals: SALES };
const S_PROFIT: Series = { name: "Profit", color: "#1f3a2c", vals: PROFIT };
const S_DISC: Series = { name: "Discount", color: "#c9a21a", vals: DISCOUNT };
const COMPARE: Record<Compare, { l: Series; r: Series; q: string }> = {
  "Sales & profit": { l: S_SALES, r: S_PROFIT, q: "Does profit follow sales?" },
  "Discount & sales": { l: S_SALES, r: S_DISC, q: "Does discount lift sales?" },
  "Discount & profit": { l: S_DISC, r: S_PROFIT, q: "Does discount eat into profit?" },
};

const FP_ABOUT: About = {
  question: "Does discounting buy us revenue, or does it just burn margin, and which lines lose money?",
  built: [
    "Sales, profit, loss, discount and units in one monthly model",
    "Month-on-month and year-on-year change on every headline number",
    "Discount traced to product, country and segment",
    "Loss-making country, product and segment lines flagged",
  ],
  defs: [
    ["Sales", "Gross sales (units x sale price) minus discounts, in USD."],
    ["Discount", "Gross sales minus sales: the price given away against the list price."],
    ["Profit and margin", "Profit = sales minus cost of goods sold. Margin = profit / sales."],
    ["Total loss", "Sum of profit on the lines where profit is below zero. Shown as a positive amount."],
    ["Month on month", "December 2014 against November 2014."],
    ["Year on year (printed)", "Full-year 2014 against 2013. The data starts in September 2013, so this sets 12 months against 4 and overstates growth."],
    ["Like for like", "Sep-Dec 2014 against Sep-Dec 2013, worked out from the monthly chart values, so approximate. Use this one to judge growth."],
    ["Profit per $1 of discount", "Country profit / country discount."],
  ],
  sources: "Source: Microsoft's public Power BI Financial Sample (sample data), Sep 2013 to Dec 2014. Monthly chart values are read from the original report and are approximate; year totals are split from the printed totals and changes.",
};

/* ───────────────────────── chart ───────────────────────── */

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

const niceMax = (v: number) => {
  if (v <= 0) return 0;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  for (const m of [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) if (m * p >= v - 1e-9) return m * p;
  return 10 * p;
};
const tick = (n: number) => `$${Number.isInteger(n) ? n : +n.toFixed(2)}M`;

/** Smooth path through points (Catmull-Rom as cubic Bezier). */
function smooth(pts: Array<[number, number]>) {
  if (!pts.length) return "";
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] ?? p2;
    d += ` C${p1[0] + (p2[0] - p0[0]) / 6},${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6},${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]},${p2[1]}`;
  }
  return d;
}

type LineDef = Series & { axis: "l" | "r"; area?: boolean; dim?: boolean; bold?: boolean };
const PAD = { l: 40, r: 40, t: 10, b: 20 };

/** Line / area chart over the 16 months, one or two value axes, hover tooltip and click to select a month. */
function MonthChart({ lines, height, selected, onSelect, out, label, dual }: {
  lines: LineDef[]; height: number; selected: number | null; onSelect: (i: number | null) => void;
  out?: (i: number) => boolean; label: string; dual: boolean;
}) {
  const [ref, w] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const padR = dual ? PAD.r : 12;
  const iw = Math.max(0, w - PAD.l - padR), ih = height - PAD.t - PAD.b;
  const dom = (axis: "l" | "r") => {
    const vals = lines.filter((l) => l.axis === axis).flatMap((l) => l.vals);
    if (!vals.length) return [0, 1] as const;
    const lo = Math.min(0, ...vals);
    return [lo < 0 ? -niceMax(-lo) : 0, niceMax(Math.max(...vals))] as const;
  };
  const dl = dom("l"), dr = dom("r");
  const x = (i: number) => PAD.l + (i + 0.5) * (iw / N);
  const y = (v: number, axis: "l" | "r") => { const [a, b] = axis === "l" ? dl : dr; return PAD.t + ih - ((v - a) / (b - a)) * ih; };
  const at = hover ?? selected;
  const lAxis = lines.find((l) => l.axis === "l"), rAxis = lines.find((l) => l.axis === "r");

  return (
    <div className="pc-fp-chart" ref={ref} style={{ height }} onMouseLeave={() => setHover(null)}>
      {w > 0 && (
        <svg width={w} height={height} aria-hidden="true">
          <g className="pc-fp-grid">
            {[0, 0.5, 1].map((t) => {
              const yy = PAD.t + ih - t * ih;
              return (
                <g key={t}>
                  <line x1={PAD.l} x2={w - padR} y1={yy} y2={yy} />
                  <text x={PAD.l - 6} y={yy + 3} textAnchor="end" fill={dual ? lAxis?.color : undefined} className={dual ? "is-key" : undefined}>{tick(dl[0] + t * (dl[1] - dl[0]))}</text>
                  {dual && rAxis && <text x={w - padR + 6} y={yy + 3} textAnchor="start" fill={rAxis.color} className="is-key">{tick(dr[0] + t * (dr[1] - dr[0]))}</text>}
                </g>
              );
            })}
            {dl[0] < 0 && <line className="pc-fp-zero" x1={PAD.l} x2={w - padR} y1={y(0, "l")} y2={y(0, "l")} />}
            {MONTHS.map((m, i) => (i % 2 === 0 ? <text key={m} x={x(i)} y={height - 5} textAnchor="middle">{short(i)}{i === 0 || i === 4 ? ` ${m.slice(-2)}` : ""}</text> : null))}
          </g>
          {out && MONTHS.map((m, i) => (out(i) ? <rect key={m} className="pc-fp-out" x={x(i) - iw / N / 2} y={PAD.t} width={iw / N} height={ih} /> : null))}
          {at !== null && <line className="pc-fp-guide" x1={x(at)} x2={x(at)} y1={PAD.t} y2={PAD.t + ih} />}
          {lines.map((l) => {
            const pts = l.vals.map((v, i) => [x(i), y(v, l.axis)] as [number, number]);
            const d = smooth(pts);
            const base = y(Math.max(0, (l.axis === "l" ? dl : dr)[0]), l.axis);
            return (
              <g key={l.name} className={l.dim ? "is-dim" : undefined}>
                {l.area && <path className="pc-fp-area" d={`${d} L${pts[N - 1][0]},${base} L${pts[0][0]},${base} Z`} fill={l.color} />}
                <path className="pc-fp-line" d={d} stroke={l.color} strokeWidth={l.bold ? 2.5 : 2} pathLength={1} />
                {at !== null && <circle cx={pts[at][0]} cy={pts[at][1]} r={3.5} fill="#fff" stroke={l.color} strokeWidth={2} />}
              </g>
            );
          })}
        </svg>
      )}
      <div className="pc-fp-hit" style={{ left: PAD.l, right: padR, bottom: PAD.b }} role="group" aria-label={label}>
        {MONTHS.map((m, i) => (
          <button
            key={m} type="button" aria-pressed={selected === i}
            aria-label={`${m}: ${lines.filter((l) => !l.dim).map((l) => `${l.name} ${about(l.vals[i])}`).join(", ")}`}
            className={selected === i ? "is-sel" : undefined}
            onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} onBlur={() => setHover(null)}
            onClick={() => onSelect(selected === i ? null : i)}
          />
        ))}
      </div>
      {at !== null && w > 0 && (
        <div className={`pc-fp-tip${x(at) > w - 120 ? " is-end" : x(at) < 120 ? " is-start" : ""}`} style={{ left: x(at) }}>
          <small>{MONTHS[at]}, approx.</small>
          {lines.filter((l) => !l.dim).map((l) => <span key={l.name}><i style={{ background: l.color }} />{l.name} {about(l.vals[at]).replace("about ", "")}</span>)}
        </div>
      )}
    </div>
  );
}

function Var({ c, note }: { c: Change; note: string }) {
  return (
    <span className="db-delta-row">
      <span className={`db-delta${c.good ? "" : " is-down"}`}>{c.up ? <ArrowUpRight size={11} weight="bold" /> : <ArrowDownRight size={11} weight="bold" />}{c.v}</span>
      <span className="db-note">{note}</span>
    </span>
  );
}

/* ───────────────────────── Ask ───────────────────────── */

type Go = { tab: string; range?: Range; seg?: SegOption; product?: string; country?: string; compare?: Compare };
type Question = { q: string; keys: string[]; answer: string; bars: Array<[string, number, string]>; go: Go; goLabel: string };
const perDollar = COUNTRIES.map(([, s, d, p]) => [s, p / d] as const).sort((a, b) => b[1] - a[1]);
const QUESTIONS: Question[] = [
  {
    q: "Which product gets the most discount?", keys: ["product", "discount by product", "most discount", "discounted"],
    answer: "Paseo, with $2.60M of discount: well ahead of Velo ($1.58M) and every other product.",
    bars: PRODUCTS.map(([p, v]) => [p, v, `$${v.toFixed(2)}M`]), go: { tab: "Details", product: "Paseo" }, goLabel: "Open Paseo in Details",
  },
  {
    q: "Which country turns discount into the most profit?", keys: ["country", "countries", "profit per", "turn discount"],
    answer: `Germany: $${perDollar[0][1].toFixed(2)} of profit for every $1 of discount. The US is lowest at $${perDollar[perDollar.length - 1][1].toFixed(2)}.`,
    bars: perDollar.map(([c, v]) => [c, v, `$${v.toFixed(2)}`]), go: { tab: "Details", country: "Germany" }, goLabel: "Open Germany in Details",
  },
  {
    q: "Which lines lose money?", keys: ["lose", "loss", "negative", "losing"],
    answer: "In the Canada lines shown, Enterprise loses money on three of four products: Amarilla (-$24,833), Carretera (-$22,304) and Paseo (-$6,258).",
    bars: ROWS.filter((r) => r.profit < 0).map((r) => [`${r.product}, Enterprise`, -r.profit / 1000, usd(r.profit)]), go: { tab: "Details", seg: "Enterprise" }, goLabel: "Open Enterprise in Details",
  },
  {
    q: "How did sales change in 2014?", keys: ["sales", "2014", "year", "yoy", "grow"],
    answer: `$${yearTotal(KPIS[0], "2014").toFixed(1)}M in 2014, up 249.5% on 2013, but 2013 only covers Sep to Dec. Like for like, Sep-Dec 2014 was ${likeForLike(KPIS[0])?.v ?? "n/a"} ${likeForLike(KPIS[0])?.up ? "up" : "down"} on Sep-Dec 2013.`,
    bars: [["2013 (Sep-Dec)", yearTotal(KPIS[0], "2013"), m1(yearTotal(KPIS[0], "2013"))], ["2014", yearTotal(KPIS[0], "2014"), m1(yearTotal(KPIS[0], "2014"))]], go: { tab: "Overview", range: "2014" }, goLabel: "Open 2014 in Overview",
  },
  {
    q: "Which segment drives profit?", keys: ["segment", "government", "drive"],
    answer: "Government. It carries almost every profit peak, while Enterprise hovers around zero and dips below it.",
    bars: SEGMENTS.map((s) => [s, Math.max(0, SEG_SERIES[s].reduce((a, b) => a + b, 0)), about(SEG_SERIES[s].reduce((a, b) => a + b, 0))] as [string, number, string]).sort((a, b) => b[1] - a[1]),
    go: { tab: "Overview", seg: "Government" }, goLabel: "Focus Government in Overview",
  },
  {
    q: "Does discounting lift sales?", keys: ["lift", "discounting", "discount vs", "does discount"],
    answer: "Not reliably. The Oct 2014 discount peak lined up with a sales high; the Nov 2013 peak did not. Every discount dollar still comes out of margin.",
    bars: [["Oct 2014 discount", DISCOUNT[13], about(DISCOUNT[13])], ["Nov 2013 discount", DISCOUNT[2], about(DISCOUNT[2])]], go: { tab: "Overview", compare: "Discount & sales" }, goLabel: "Compare discount and sales",
  },
];
const match = (text: string) => {
  const t = text.trim().toLowerCase();
  if (!t) return null;
  const exact = QUESTIONS.findIndex((q) => q.q.toLowerCase() === t);
  if (exact >= 0) return exact;
  let best = -1, score = 0;
  QUESTIONS.forEach((q, i) => { const s = q.keys.filter((k) => t.includes(k)).length; if (s > score) { score = s; best = i; } });
  return best >= 0 ? best : -1;
};

/* ───────────────────────── board ───────────────────────── */

const PAGE = 6;
type SortKey = "sales" | "discount" | "profit" | "margin";
const val = (r: Row, k: SortKey) => (k === "margin" ? (r.sales ? r.profit / r.sales : 0) : r[k]);

export function FinancialPerformanceBoard() {
  const [ref, on] = useInView<HTMLDivElement>();
  const [tab, setTab] = useState("Overview");
  const [range, setRange] = useState<Range>("Sep 2013-Dec 2014");
  const [seg, setSeg] = useState<SegOption>("All segments");
  const [month, setMonth] = useState<number | null>(null);
  const [compare, setCompare] = useState<Compare>("Sales & profit");
  const [product, setProduct] = useState<string | null>(null);
  const [country, setCountry] = useState<string | null>(null);
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "profit", dir: 1 });
  const [page, setPage] = useState(0);
  const [ask, setAsk] = useState("");
  const [asked, setAsked] = useState<number | null>(0);
  const [hoverCountry, setHoverCountry] = useState<number | null>(null);
  const [alerts, read] = useAlerts([
    { id: "f1", title: "Enterprise loses money on 3 of 4 Canada products", when: "Details, transaction lines" },
    { id: "f2", title: "Discount up 229.0% in 2014 (2013 is Sep-Dec only)", when: "Overview, total discount" },
    { id: "f3", title: "Paseo carries the most discount: $2.60M", when: "Details, discount by product" },
  ]);

  const segFocus = seg === "All segments" ? null : seg;
  const out = range === "Sep 2013-Dec 2014" ? undefined : (i: number) => !inRange(range, i);
  const pickRange = (r: Range) => { setRange(r); if (month !== null && !inRange(r, month)) setMonth(null); };
  const filterReset = () => setPage(0);

  const rows = useMemo(() => ROWS
    .filter((r) => (segFocus ? r.segment === segFocus : true) && (product ? r.product === product : true) && (country ? r.country === country : true))
    .sort((a, b) => (val(a, sort.key) - val(b, sort.key)) * sort.dir), [segFocus, product, country, sort]);
  const pages = Math.max(1, Math.ceil(rows.length / PAGE));
  const shown = rows.slice(page * PAGE, page * PAGE + PAGE);
  const sortBy = (key: SortKey) => { setSort((s) => ({ key, dir: s.key === key ? (s.dir === 1 ? -1 : 1) : -1 })); setPage(0); };

  const segSelect = (
    <label className="dd-pill">
      <span>Segment</span>
      <select value={seg} onChange={(e) => { setSeg(e.target.value as SegOption); filterReset(); }}>
        {SEG_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
    </label>
  );

  const run = (i: number) => { setAsked(i); setAsk(QUESTIONS[i].q); };
  const go = (g: Go) => {
    setTab(g.tab);
    if (g.range) pickRange(g.range);
    if (g.seg) setSeg(g.seg);
    setProduct(g.product ?? null);
    setCountry(g.country ?? null);
    if (g.compare) setCompare(g.compare);
    setPage(0);
  };

  const c = COMPARE[compare];
  const maxProd = PRODUCTS[0][1];
  const maxCountry = Math.max(...COUNTRIES.flatMap(([, , d, p]) => [d, p]));

  return (
    <div ref={ref} className={`db pc-fp${on ? " is-on" : ""}`}>
      <Topbar title="Financial performance" tabs={["Overview", "Details", "Insights", "Ask"]} tab={tab} onTab={setTab} alerts={alerts} onRead={read} about={FP_ABOUT} />

      {tab === "Overview" && (
        <div className="db-page" key="overview">
          <FilterBar>
            <Slicer label="Date range" options={RANGES} value={range} onChange={pickRange} className="is-small" />
            {segSelect}
            {month !== null && <FilterChip label={MONTHS[month]} onClear={() => setMonth(null)} />}
            <p className="db-context"><b>{RANGE_LABEL[range]}</b>, all segments, USD{segFocus ? `; charts focus ${segFocus}` : ""}{month !== null ? "; month marked on the charts, tiles stay range totals" : ""}</p>
          </FilterBar>

          <div className="pc-fp-kpis">
            {KPIS.map((k, i) => (
              <article key={k.label} className="db-card db-kpi" style={{ "--i": i } as React.CSSProperties}>
                <header><span>{k.label}<small>{RANGE_LABEL[range]}</small></span><Chip icon={k.icon} /></header>
                <strong><Count to={yearTotal(k, range)} on={on} format={k.f} /></strong>
                {range === "2013" ? (
                  <span className="pc-fp-vars"><span className="db-note">No earlier months to compare: the data starts in Sep 2013.</span></span>
                ) : (
                  <span className="pc-fp-vars">
                    <Var c={k.pm} note="Dec vs Nov 2014" />
                    <Var c={k.pyc} note="2014 (12 mo) vs 2013 (4 mo)" />
                    {(() => { const l = likeForLike(k); return l ? <Var c={l} note="Sep-Dec, like for like" /> : <span className="db-note">No monthly split, so no like-for-like</span>; })()}
                  </span>
                )}
              </article>
            ))}
          </div>

          <div className="db-row db-row-2">
            <article className="db-card pc-fp-card">
              <header>
                <div>
                  <span className="db-label">{c.l.name} and {c.r.name.toLowerCase()} by month, approx.</span>
                  <strong className="db-big db-big-sm">{month === null ? c.q : `${MONTHS[month]}: ${c.l.name.toLowerCase()} ${about(c.l.vals[month])}, ${c.r.name.toLowerCase()} ${about(c.r.vals[month])}`}</strong>
                </div>
                <Slicer label="Compare" options={COMPARES} value={compare} onChange={setCompare} className="is-small pc-fp-compare" />
              </header>
              <ul className="pc-fp-keys" aria-hidden="true">
                <li><i style={{ background: c.l.color }} />{c.l.name}, left axis</li>
                <li><i className="is-line" style={{ background: c.r.color }} />{c.r.name}, right axis</li>
              </ul>
              <MonthChart
                dual height={178} selected={month} onSelect={setMonth} out={out}
                lines={[{ ...c.l, axis: "l", area: true }, { ...c.r, axis: "r", bold: true }]}
                label={`${c.l.name} and ${c.r.name} by month. Click a month to highlight it on both charts.`}
              />
            </article>

            <article className="db-card pc-fp-card">
              <header>
                <div>
                  <span className="db-label">Profit by segment by month, approx.</span>
                  <strong className="db-big db-big-sm">{segFocus ? `${segFocus}: ${about(SEG_SERIES[segFocus].reduce((a, b) => a + b, 0))} over 16 months` : "Government carries the peaks"}</strong>
                </div>
              </header>
              <MonthChart
                dual={false} height={128} selected={month} onSelect={setMonth} out={out}
                lines={SEGMENTS.map((s) => ({ name: s, color: SEG_COLOR[s], vals: SEG_SERIES[s], axis: "l" as const, dim: segFocus !== null && segFocus !== s, bold: segFocus === s || s === "Government" }))}
                label="Profit by segment by month. Click a month to highlight it on both charts."
              />
              <div className="db-legend pc-fp-seglegend" role="group" aria-label="Focus a segment">
                {SEGMENTS.map((s) => (
                  <button key={s} type="button" aria-pressed={segFocus === s} className={segFocus && segFocus !== s ? "is-dim" : undefined} onClick={() => { setSeg(segFocus === s ? "All segments" : s); filterReset(); }}>
                    <i style={{ background: SEG_COLOR[s] }} />{s}
                  </button>
                ))}
              </div>
            </article>
          </div>
        </div>
      )}

      {tab === "Details" && (
        <div className="db-page" key="details">
          <FilterBar>
            {segSelect}
            {product && <FilterChip label={product} onClear={() => { setProduct(null); filterReset(); }} />}
            {country && <FilterChip label={country === "United States of America" ? "USA" : country} onClear={() => { setCountry(null); filterReset(); }} />}
            <p className="db-context"><b>Sep 2013-Dec 2014</b>, USD, click a bar to filter the lines</p>
          </FilterBar>

          <div className="db-row pc-fp-row-details">
            <article className="db-card pc-fp-card">
              <header><div><span className="db-label">Discount by product</span><strong className="db-big db-big-sm">{product ? `${product}: $${PRODUCTS.find((p) => p[0] === product)?.[1].toFixed(2)}M` : "Paseo is discounted most"}</strong></div></header>
              <div className="pc-fp-hbars" role="group" aria-label="Discount by product. Click a product to filter the transaction lines.">
                {PRODUCTS.map(([p, v], i) => (
                  <button key={p} type="button" aria-pressed={product === p} className={product && product !== p ? "is-dim" : undefined} style={{ "--v": v / maxProd, "--i": i } as React.CSSProperties} onClick={() => { setProduct(product === p ? null : p); filterReset(); }}>
                    <span>{p}</span><span className="pc-fp-hbar"><i /></span><b>${v.toFixed(2)}M</b>
                  </button>
                ))}
              </div>
            </article>

            <article className="db-card pc-fp-card">
              <header>
                <div><span className="db-label">Discount and profit by country</span><strong className="db-big db-big-sm">{(() => { const ci = hoverCountry ?? COUNTRIES.findIndex((x) => x[0] === country); if (ci < 0) return "Germany earns most per $1 of discount"; const [, s, d, p] = COUNTRIES[ci]; return `${s}: $${p.toFixed(1)}M profit on $${d.toFixed(1)}M discount`; })()}</strong></div>
                <ul className="pc-fp-keys is-col" aria-hidden="true"><li><i style={{ background: "#c9a21a" }} />Discount</li><li><i style={{ background: "#1f3a2c" }} />Profit</li></ul>
              </header>
              <div className="pc-fp-cols" role="group" aria-label="Discount and profit by country. Click a country to filter the transaction lines." onMouseLeave={() => setHoverCountry(null)}>
                {COUNTRIES.map(([name, s, d, p], i) => (
                  <button key={name} type="button" aria-pressed={country === name} aria-label={`${name}: discount $${d.toFixed(1)}M, profit $${p.toFixed(1)}M`} className={country && country !== name ? "is-dim" : undefined}
                    onMouseEnter={() => setHoverCountry(i)} onFocus={() => setHoverCountry(i)} onBlur={() => setHoverCountry(null)}
                    onClick={() => { setCountry(country === name ? null : name); filterReset(); }}>
                    <span className="pc-fp-pair">
                      <i style={{ "--h": d / maxCountry, "--i": i } as React.CSSProperties}><em>${d.toFixed(1)}M</em></i>
                      <i className="is-profit" style={{ "--h": p / maxCountry, "--i": i } as React.CSSProperties}><em>${p.toFixed(1)}M</em></i>
                    </span>
                    <small>{s}</small>
                  </button>
                ))}
              </div>
            </article>
          </div>

          <article className="db-card pc-fp-card">
            <header>
              <div><span className="db-label">Country, product and segment lines</span><strong className="db-big db-big-sm">{rows.length} of {ROWS.length} lines{rows.some((r) => r.profit < 0) ? `, ${rows.filter((r) => r.profit < 0).length} losing money` : ""}</strong></div>
              <div className="pc-fp-pager">
                <button type="button" disabled={page === 0} onClick={() => setPage((p) => p - 1)} aria-label="Previous lines">‹</button>
                <span>{rows.length ? `${page + 1} / ${pages}` : "0 / 0"}</span>
                <button type="button" disabled={page >= pages - 1} onClick={() => setPage((p) => p + 1)} aria-label="Next lines">›</button>
              </div>
            </header>
            <AllColumns />
            <div className="db-table pc-fp-table" role="table" aria-label="Transaction lines">
              <div className="pc-fp-tr is-head" role="row">
                <span role="columnheader">Line</span>
                {(["sales", "discount", "profit", "margin"] as SortKey[]).map((k) => (
                  <span key={k} role="columnheader" className={`pc-fp-c-${k}`} aria-sort={sort.key === k ? (sort.dir === 1 ? "ascending" : "descending") : "none"}>
                    <button type="button" className={sort.key === k ? "is-on" : undefined} onClick={() => sortBy(k)}>{k === "margin" ? "Margin" : k[0].toUpperCase() + k.slice(1)}{sort.key === k ? (sort.dir === 1 ? " ↑" : " ↓") : ""}</button>
                  </span>
                ))}
              </div>
              {shown.map((r) => (
                <div key={`${r.product}-${r.segment}`} className="pc-fp-tr" role="row">
                  <span className="db-who" role="cell"><b>{r.product}, {r.segment}</b><small>{r.country}</small></span>
                  <span role="cell" className="pc-fp-c-sales">{usd(r.sales)}</span>
                  <span role="cell" className="pc-fp-c-discount">{usd(r.discount)}</span>
                  <span role="cell" className={`pc-fp-c-profit ${r.profit < 0 ? "is-neg" : "is-pos"}`}>{usd(r.profit)}</span>
                  <span role="cell" className={`pc-fp-c-margin ${r.profit < 0 ? "is-neg" : ""}`}>{r.sales ? `${((r.profit / r.sales) * 100).toFixed(1)}%` : "n/a"}</span>
                </div>
              ))}
              {!rows.length && <p className="db-pop-empty">No lines match. The original export lists Canada lines only{country && country !== "Canada" ? `, so there are none for ${country === "United States of America" ? "the USA" : country}` : ""}.</p>}
            </div>
          </article>
        </div>
      )}

      {tab === "Insights" && (
        <div className="db-page" key="insights">
          <div className="db-row db-row-3">
            <article className="db-card pc-fp-card">
              <header><div><span className="db-label">Insights</span><strong className="db-big db-big-sm">What the numbers say</strong></div></header>
              <ol className="pc-fp-notes">
                <li><b>Sales and profit move together.</b> Profit follows sales month by month, with peaks in Oct and Dec 2014, which points to seasonality worth planning around.<button type="button" className="db-pill db-pill-btn" onClick={() => go({ tab: "Overview", compare: "Sales & profit" })}>See it <ArrowRight size={12} /></button></li>
                <li><b>Discount peaks do not reliably lift sales.</b> The Oct 2014 peak lined up with a sales high; Nov 2013 did not. Either way, discount comes out of margin.<button type="button" className="db-pill db-pill-btn" onClick={() => go({ tab: "Overview", compare: "Discount & sales" })}>See it <ArrowRight size={12} /></button></li>
                <li><b>Heavy discount can signal weak demand.</b> Paseo carries $2.60M of discount. That can mean it struggles at full price, a competitive pricing play, or older stock being cleared.<button type="button" className="db-pill db-pill-btn" onClick={() => go({ tab: "Details", product: "Paseo" })}>See it <ArrowRight size={12} /></button></li>
              </ol>
            </article>
            <article className="db-card pc-fp-card">
              <header><div><span className="db-label">Recommendations</span><strong className="db-big db-big-sm">What to do next</strong></div></header>
              <ul className="pc-fp-recs">
                {[
                  "Target discounts at high-volume customers and set periods, not across the board",
                  "Cut back discount on products with stable demand",
                  "Put marketing behind strong-selling, low-discount products",
                  "Find high-discount, low-return products and reprice them",
                  "Use dynamic pricing in peak months",
                  "Spend on marketing before peak seasons instead of discounting",
                ].map((r) => <li key={r}><Check size={12} weight="bold" />{r}</li>)}
              </ul>
            </article>
          </div>
        </div>
      )}

      {tab === "Ask" && (
        <div className="db-page" key="ask">
          <article className="db-card pc-fp-card">
            <header><div><span className="db-label">Ask the data</span><strong className="db-big db-big-sm">Questions this report can answer</strong></div><span className="db-pill"><ChatCircleText size={13} /> {QUESTIONS.length} questions</span></header>
            <form className="pc-fp-ask" onSubmit={(e) => { e.preventDefault(); setAsked(match(ask)); }}>
              <MagnifyingGlass size={14} aria-hidden="true" />
              <label className="sr-only" htmlFor="pc-fp-ask">Ask a question about the data</label>
              <input id="pc-fp-ask" type="search" value={ask} placeholder="Try: which lines lose money?" onChange={(e) => setAsk(e.target.value)} />
              {ask && <button type="button" aria-label="Clear question" onClick={() => { setAsk(""); setAsked(null); }}><X size={12} /></button>}
              <button type="submit" className="db-btn db-btn-dark">Ask</button>
            </form>
            <div className="pc-fp-chips" role="group" aria-label="Suggested questions">
              {QUESTIONS.map((q, i) => <button key={q.q} type="button" aria-pressed={asked === i} onClick={() => run(i)}>{q.q}</button>)}
            </div>
          </article>
          {asked !== null && asked >= 0 && (
            <article className="db-card pc-fp-card pc-fp-answer" key={asked}>
              <header><div><span className="db-label">{QUESTIONS[asked].q}</span><strong className="db-big db-big-sm">{QUESTIONS[asked].answer}</strong></div></header>
              <div className="pc-fp-hbars is-static">
                {QUESTIONS[asked].bars.map(([l, v, t], i) => {
                  const max = Math.max(...QUESTIONS[asked].bars.map((b) => b[1]));
                  return <div key={l} style={{ "--v": max ? v / max : 0, "--i": i } as React.CSSProperties}><span>{l}</span><span className="pc-fp-hbar"><i /></span><b>{t}</b></div>;
                })}
              </div>
              <p className="db-hint"><Lightning size={13} weight="fill" /> <span>{asked >= 3 ? "Monthly and segment values are read from the original charts, so they are approximate." : "Answers use the exact figures printed in the report."}</span>
                <button type="button" className="pc-fp-go" onClick={() => go(QUESTIONS[asked].go)}>{QUESTIONS[asked].goLabel} <ArrowRight size={12} /></button></p>
            </article>
          )}
          {asked === -1 && (
            <article className="db-card pc-fp-card pc-fp-answer">
              <p className="db-pop-empty">This report cannot answer that one yet. Pick one of the questions above: each answer comes straight from the report&apos;s data.</p>
            </article>
          )}
        </div>
      )}
    </div>
  );
}
