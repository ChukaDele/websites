"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDownRight, ArrowUpRight, Bank, ChartLineUp, Coins, CurrencyDollar, Info, Lightning, Scales, Warning, type Icon,
} from "@phosphor-icons/react";
import { Chip, Count, FilterChip, Topbar, useAlerts, useInView, type About } from "../landing/Dashboards";
import { majorCompaniesMeta } from "./meta";
import { AllColumns, FilterBar } from "../landing/PhoneFilters";

/**
 * Major Companies Financial Performance, rebuilt from the Power BI original.
 * Real public-company figures for 12 companies, 2009-2023 (Kaggle "Financial
 * Statements of Major Companies"). Source figures are USD millions; the
 * original labelled them "$M", so its "$12.2M" is really $12.2 trillion.
 * 2023 is a partial year in the source, so it is never used as a comparison.
 *
 * Exact values: per-company totals and ratios, the waterfall (derived from
 * them), the cash-flow totals and the printed averages. Yearly aggregate
 * revenue and operating cash flow were read off the original charts by eye:
 * shape only, always labelled "about".
 */

// Defined in ./meta so the Work page can list this board without loading it.
export { majorCompaniesMeta };

/* ───────────────────────── data (USD millions) ───────────────────────── */

type Co = {
  name: string; rev: number; ni: number; nm: number; roe: number; gp: number; ebitda: number; cap: number;
  cr: number; de: number; roa: number; roi: number; shape: string;
};
const COS: Co[] = [
  { name: "Apple", rev: 2965609, ni: 680563, nm: 22.5, roe: 61.3, gp: 1185107, ebitda: 953126, cap: 13.9, cr: 1.5, de: 0.8, roa: 19.1, roi: 33.6, shape: "Steady" },
  { name: "Microsoft", rev: 1668065, ni: 482077, nm: 27.4, roe: 32.4, gp: 1154780, ebitda: 724329, cap: 13.7, cr: 2.4, de: 0.4, roa: 14.8, roi: 24.6, shape: "Steady" },
  { name: "Alphabet", rev: 1556228, ni: 351687, nm: 22.9, roe: 17.1, gp: 896715, ebitda: 499612, cap: 9.2, cr: 4.7, de: 0.0, roa: 13.1, roi: 16.5, shape: "Steady" },
  { name: "Amazon", rev: 2635460, ni: 82313, nm: 2.4, roe: 11.2, gp: 1018705, ebitda: 279235, cap: 7.7, cr: 1.1, de: 0.4, roa: 3.3, roi: 8.5, shape: "Thin but steady" },
  { name: "NVIDIA", rev: 142215.7, ni: 33085.7, nm: 17.5, roe: 19.1, gp: 82772.142, ebitda: 40537.7558, cap: 2.9, cr: 5.1, de: 0.2, roa: 12.3, roi: 15.3, shape: "Steady" },
  { name: "Intel", rev: 834929, ni: 183323, nm: 21.4, roe: 19.9, gp: 492270, ebitda: 338520, cap: 2.2, cr: 2.1, de: 0.3, roa: 12.2, roi: 15.8, shape: "Steady" },
  { name: "McDonald's", rev: 338030.2, ni: 75619.8, nm: 22.7, roe: -42.2, gp: 149456.601, ebitda: 139199.104, cap: 1.8, cr: 1.5, de: -2.8, roa: 14.3, roi: 19.7, shape: "Steady" },
  { name: "PayPal", rev: 148775, ni: 20149, nm: 13.0, roe: 12.7, gp: 69228, ebitda: 30855, cap: 1.0, cr: 1.4, de: 0.2, roa: 4.3, roi: 10.6, shape: "Series starts mid-period" },
  { name: "AIG", rev: 827454, ni: 41880, nm: 4.7, roe: 4.1, gp: 201594, ebitda: 199912, cap: 0.7, cr: 1.0, de: 0.6, roa: 0.7, roi: 3.3, shape: "Swings widely" },
  { name: "Barclays", rev: 515288.8, ni: 40250.2, nm: 8.3, roe: 5.0, gp: 515288.82, ebitda: 14, cap: 0.6, cr: 1.0, de: 6.3, roa: 0.2, roi: 1.1, shape: "Steady" },
  { name: "PG&E", rev: 236237, ni: -3985, nm: -1.5, roe: -8.8, gp: 165477, ebitda: 42500, cap: 0.3, cr: 0.8, de: 1.3, roa: 0.0, roi: -11.3, shape: "Falls to about -40% late on" },
  { name: "Sears", rev: 345587, ni: -10429, nm: -3.5, roe: 16.7, gp: 87344, ebitda: 178, cap: 0.0, cr: 1.1, de: -0.3, roa: -7.7, roi: -0.3, shape: "Series ends early" },
];
const NEG_EQUITY = new Set(["McDonald's", "Sears"]);
// Banks and insurers: no cost of sales and no current/non-current split, so
// gross profit and the current ratio do not mean what they do elsewhere.
const FINANCIALS = new Set(["AIG", "Barclays"]);
const EBITDA_GAP = new Set(["Barclays", "Sears"]);
const TOTAL_REV = COS.reduce((a, c) => a + c.rev, 0);
const TOTAL_NI = COS.reduce((a, c) => a + c.ni, 0);
const TOTAL_GP = COS.reduce((a, c) => a + c.gp, 0);
const TOTAL_EBITDA = COS.reduce((a, c) => a + c.ebitda, 0);
// Averages as printed in the original (simple averages of company-years, so a
// small company counts as much as Apple). The revenue-weighted margin is the
// aggregate: total net income / total revenue.
const AVG = { nm: 13.7, roe: 12.4, cr: 2.0, de: 0.6, roa: 7.8, roi: 11.9 };
const WEIGHTED_NM = (TOTAL_NI / TOTAL_REV) * 100;

const YEARS = Array.from({ length: 15 }, (_, i) => 2009 + i);
const PARTIAL = 14; // index of 2023
// Read off the original charts (all 12 companies): revenue in $T, operating cash flow in $B. Shape only.
const REV_T = [0.38, 0.43, 0.5, 0.58, 0.62, 0.67, 0.75, 0.76, 0.83, 0.95, 1.03, 1.2, 1.48, 1.65, 0.25];
const OCF_B = [148, 132, 162, 115, 105, 142, 208, 205, 265, 258, 250, 380, 443, 433, 90];
// Cash flow totals, all companies, 2009-2023 (USD millions, as printed in thousands of millions).
const CF = { op: 3.3e6, inv: -1.5e6, fin: -1.4e6, net: 420.3e3, fcfShare: 0.19 };
// The source prints the three activities rounded to $0.1T, so they sum to
// $0.40T against the exact $0.42T net change; FX effects on cash also sit in the gap.
const CF_GAP = CF.net - (CF.op + CF.inv + CF.fin);
// Revenue growth 2009 to 2022 (both full years), from the approximate yearly values.
const REV_MULT = REV_T[13] / REV_T[0];
const REV_CAGR = (Math.pow(REV_MULT, 1 / 13) - 1) * 100;

/** USD millions to a readable label: $12.2T, $680.6B, $14M. */
const usd = (m: number, dT = 2) => {
  const a = Math.abs(m), s = m < 0 ? "-" : "";
  if (a >= 1e6) return `${s}$${(a / 1e6).toFixed(a >= 1e7 ? 1 : dT)}T`;
  if (a >= 1e3) return `${s}$${(a / 1e3).toFixed(1)}B`;
  return `${s}$${a.toFixed(0)}M`;
};
const exact = (m: number) => `USD ${m.toLocaleString("en-US", { maximumFractionDigits: 1 })}M`;
const pct = (n: number) => `${n.toFixed(1)}%`;
const x1 = (n: number) => `${n.toFixed(1)}x`;
const pts = (n: number) => `${Math.abs(n).toFixed(1)} pts`;
const aboutT = (n: number) => `about $${n.toFixed(2)}T`;
const aboutB = (n: number) => `about $${Math.round(n / 5) * 5}B`;

const MC_ABOUT: About = {
  question: "Across 12 major public companies, which ones are efficient and which are simply large?",
  built: [
    "Income statement, cash flow and balance sheet in one model per company",
    "Units checked: the source is USD millions, so totals read in trillions",
    "Ratios (ROE, ROA, ROI, current ratio, debt to equity) worked out the same way for all",
    "Partial 2023 kept out of every year-on-year comparison",
  ],
  defs: [
    ["Totals", "Sum of every year in the source, 2009 to 2023, with 2023 a partial year. Companies whose series start late (PayPal) or end early (Sears) cover fewer years."],
    ["Net profit margin", "Net income / revenue. The printed average (13.7%) is a simple average of company-years; revenue-weighted it is total net income / total revenue."],
    ["Return on equity (ROE)", "Net income / shareholders' equity. Meaningless when equity is negative (McDonald's, Sears)."],
    ["Return on assets (ROA)", "Net income / total assets. The fairest efficiency comparison across company sizes."],
    ["ROI", "Return on investment as the source dataset reports it. Its exact formula is not documented there, so compare it within this table only."],
    ["Current ratio", "Current assets / current liabilities. Not meaningful for banks and insurers (AIG, Barclays), whose balance sheets are not split this way."],
    ["Debt to equity", "Total debt / shareholders' equity. Negative when equity is negative."],
    ["Gross profit and EBITDA", "Gross profit = revenue - cost of sales (equal to revenue for Barclays, which has no cost of sales). EBITDA = operating profit before depreciation and amortisation; the source looks incomplete for Barclays and Sears."],
    ["Growth", "Year on year on full years only: 2023 is partial and never compared. CAGR 2009 to 2022 uses the approximate yearly chart values."],
    ["Currency", "USD millions in the source, nominal (not inflation-adjusted). Barclays files in GBP; the source does not say which rate it used to convert."],
  ],
  sources: "Source: public filings, 2009-2022 (2023 partial), via the Kaggle Financial Statements of Major Companies dataset. Yearly trend values are read from the original charts and are approximate.",
};

/* ───────────────────────── shared pieces ───────────────────────── */

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

function smooth(p: Array<[number, number]>) {
  let d = `M${p[0][0]},${p[0][1]}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] ?? p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] ?? p2;
    d += ` C${p1[0] + (p2[0] - p0[0]) / 6},${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6},${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]},${p2[1]}`;
  }
  return d;
}

/** Yearly area chart (all companies), 2023 drawn as partial. Hover for values, click to pick a year. */
function YearArea({ vals, max, ticks, tick, tip, height, year, onYear, label }: {
  vals: number[]; max: number; ticks: number[]; tick: (n: number) => string; tip: (n: number) => string;
  height: number; year: number | null; onYear: (i: number | null) => void; label: string;
}) {
  const [ref, w] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const P = { l: 44, r: 10, t: 10, b: 20 };
  const iw = Math.max(0, w - P.l - P.r), ih = height - P.t - P.b;
  const x = (i: number) => P.l + (i + 0.5) * (iw / YEARS.length);
  const y = (v: number) => P.t + ih - (v / max) * ih;
  const full = vals.slice(0, PARTIAL).map((v, i) => [x(i), y(v)] as [number, number]);
  const at = hover ?? year;
  const base = P.t + ih;
  return (
    <div className="pc-mc-chart" ref={ref} style={{ height }} onMouseLeave={() => setHover(null)}>
      {w > 0 && (
        <svg width={w} height={height} aria-hidden="true">
          <defs>
            <pattern id="pc-mc-hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="5" stroke="#90d26f" strokeWidth="2" /></pattern>
          </defs>
          <g className="pc-mc-grid">
            {ticks.map((t) => <g key={t}><line x1={P.l} x2={w - P.r} y1={y(t)} y2={y(t)} /><text x={P.l - 6} y={y(t) + 3} textAnchor="end">{tick(t)}</text></g>)}
            {YEARS.map((yr, i) => (i % 2 === 0 || i === PARTIAL ? <text key={yr} x={x(i)} y={height - 5} textAnchor="middle">{i === PARTIAL ? "'23*" : `'${String(yr).slice(2)}`}</text> : null))}
          </g>
          <path className="pc-mc-area" d={`${smooth(full)} L${full[full.length - 1][0]},${base} L${full[0][0]},${base} Z`} />
          <path className="pc-mc-line" d={smooth(full)} pathLength={1} />
          <rect className="pc-mc-partial" x={x(PARTIAL) - iw / YEARS.length * 0.32} width={iw / YEARS.length * 0.64} y={y(vals[PARTIAL])} height={base - y(vals[PARTIAL])} rx={3} fill="url(#pc-mc-hatch)" />
          {at !== null && <line className="pc-mc-guide" x1={x(at)} x2={x(at)} y1={P.t} y2={base} />}
          {at !== null && <circle cx={x(at)} cy={y(vals[at])} r={3.5} fill="#fff" stroke="#1f3a2c" strokeWidth={2} />}
        </svg>
      )}
      <div className="pc-mc-hit" style={{ left: P.l, right: P.r, bottom: P.b }} role="group" aria-label={label}>
        {YEARS.map((yr, i) => (
          <button key={yr} type="button" aria-pressed={year === i} className={year === i ? "is-sel" : undefined}
            aria-label={`${yr}${i === PARTIAL ? " (partial year)" : ""}: ${tip(vals[i])}`}
            onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} onBlur={() => setHover(null)} onClick={() => onYear(year === i ? null : i)} />
        ))}
      </div>
      {at !== null && w > 0 && (
        <div className={`pc-mc-tip${x(at) > w - 90 ? " is-end" : x(at) < 90 ? " is-start" : ""}`} style={{ left: x(at), top: y(vals[at]) - 8 }}>
          <small>{YEARS[at]}{at === PARTIAL ? ", partial year" : ""}</small>{tip(vals[at])}
        </div>
      )}
    </div>
  );
}

type Step = { label: string; v: number; total?: boolean };
/** Low and high end of each waterfall bar: totals stand on zero, steps start where the last bar ended. */
function waterfallSpans(steps: Step[]) {
  const out: Array<readonly [number, number]> = [];
  let level = 0;
  for (const s of steps) {
    const a = s.total ? 0 : level, b = s.total ? s.v : level + s.v;
    level = b;
    out.push([Math.min(a, b), Math.max(a, b)] as const);
  }
  return out;
}
/** Waterfall: start, signed steps, end total. */
function Waterfall({ steps, on, label }: { steps: Step[]; on: boolean; label: string }) {
  const spans = waterfallSpans(steps);
  const lo = Math.min(0, ...spans.map((s) => s[0])), hi = Math.max(...spans.map((s) => s[1]));
  const f = (v: number) => (v - lo) / (hi - lo || 1);
  return (
    <div className="pc-mc-fall" role="list" aria-label={label} style={{ "--zero": f(0) } as React.CSSProperties}>
      {steps.map((s, i) => (
        <div key={s.label} role="listitem" className={`pc-mc-step${s.total ? " is-total" : s.v < 0 ? " is-neg" : " is-pos"}`} title={exact(s.v)}
          style={{ "--b": f(spans[i][0]), "--h": f(spans[i][1]) - f(spans[i][0]), "--i": i } as React.CSSProperties}>
          <span className="pc-mc-step-col"><i><em>{on ? usd(s.v) : ""}</em></i></span>
          <small>{s.label}</small>
        </div>
      ))}
    </div>
  );
}

function Compare({ v, avg, f, unit, label }: { v: number; avg: number; f: (n: number) => string; unit: "pts" | "x"; label: string }) {
  const d = v - avg;
  return (
    <span className="db-delta-row">
      <span className={`db-delta${d < 0 ? " is-down" : ""}`}>{d < 0 ? <ArrowDownRight size={11} weight="bold" /> : <ArrowUpRight size={11} weight="bold" />}{unit === "pts" ? pts(d) : `${Math.abs(d).toFixed(1)}x`}</span>
      <span className="db-note">vs {label} {f(avg)}</span>
    </span>
  );
}

/* ───────────────────────── board ───────────────────────── */

type SortKey = "rev" | "ni" | "nm" | "roe" | "gp" | "ebitda" | "cr" | "de" | "roa" | "roi";
type Sort = { key: SortKey; dir: 1 | -1 };
const sorted = (s: Sort) => [...COS].sort((a, b) => (a[s.key] - b[s.key]) * s.dir);
const PAGE = 6;

export function MajorCompaniesBoard() {
  const [ref, on] = useInView<HTMLDivElement>();
  const [tab, setTab] = useState("Summary");
  const [co, setCo] = useState<string | null>(null);
  const [year, setYear] = useState<number | null>(13); // 2022, the latest full year
  const [hoverDot, setHoverDot] = useState<string | null>(null);
  const [sortP, setSortP] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "nm", dir: -1 });
  const [sortR, setSortR] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "roa", dir: -1 });
  const [pageP, setPageP] = useState(0);
  const [pageR, setPageR] = useState(0);
  const [alerts, read] = useAlerts([
    { id: "m1", title: "PG&E and Sears made a net loss over 2009-2023", when: "Income, profitability" },
    { id: "m2", title: "2023 is a partial year: kept out of comparisons", when: "Data check" },
    { id: "m3", title: "EBITDA looks incomplete for Barclays and Sears", when: "Data check, source gap" },
  ]);

  const sel = COS.find((c) => c.name === co) ?? null;
  const pick = (name: string | null) => {
    setCo((c) => (c === name ? null : name));
    // Keep the picked company on the visible page of each table.
    if (name) {
      const at = (s: Sort) => sorted(s).findIndex((c) => c.name === name);
      setPageP(Math.floor(at(sortP) / PAGE));
      setPageR(Math.floor(at(sortR) / PAGE));
    }
  };

  const profRows = useMemo(() => sorted(sortP), [sortP]);
  const ratioRows = useMemo(() => sorted(sortR), [sortR]);
  const sortBy = (set: typeof setSortP, setPage: (n: number) => void) => (key: SortKey) => { set((s) => ({ key, dir: s.key === key ? (s.dir === 1 ? -1 : 1) : -1 })); setPage(0); };

  const scope = sel ? sel.name : "12 companies";
  const period = "2009-2023, 2023 partial";

  const filters = (note?: string) => (
    <FilterBar>
      <label className="dd-pill">
        <span>Company</span>
        <select value={co ?? ""} onChange={(e) => pick(e.target.value || null)}>
          <option value="">All 12</option>
          {COS.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
        </select>
      </label>
      {sel && <FilterChip label={sel.name} onClear={() => setCo(null)} />}
      <p className="db-context"><b>{period}</b>, USD{note ? ` · ${note}` : ""}</p>
    </FilterBar>
  );

  const yoy = (vals: number[], i: number) => (i === PARTIAL ? null : i === 0 ? null : (vals[i] / vals[i - 1] - 1) * 100);
  const yearHead = (vals: number[], about: (n: number) => string, what: string) => {
    if (year === null) return `${what}: hover or click a year`;
    if (year === PARTIAL) return `2023 is a partial year in the source (${about(vals[PARTIAL])}), so it is not compared`;
    const g = yoy(vals, year);
    return `${YEARS[year]}: ${about(vals[year])}${g === null ? "" : `, ${g >= 0 ? "up" : "down"} about ${Math.round(Math.abs(g))}% on ${YEARS[year] - 1}`}`;
  };

  const kpis: Array<{ label: string; sub: string; icon: Icon; to: number; f: (n: number) => string; cmp: React.ReactNode }> = [
    {
      label: "Total revenue", sub: `${scope}, ${period}`, icon: CurrencyDollar, to: sel ? sel.rev : TOTAL_REV, f: (n) => usd(n),
      cmp: sel
        ? <span className="db-delta-row"><span className="db-delta">{pct((sel.rev / TOTAL_REV) * 100)}</span><span className="db-note">of the 12-company total</span></span>
        : <span className="db-delta-row"><span className="db-delta"><ArrowUpRight size={11} weight="bold" />about {REV_MULT.toFixed(1)}x</span><span className="db-note">2022 vs 2009, {Math.round(REV_CAGR)}% a year</span></span>,
    },
    {
      label: "Net profit margin", sub: sel ? `${sel.name}, ${period}` : `Simple average; weighted ${pct(WEIGHTED_NM)}`, icon: ChartLineUp, to: sel ? sel.nm : AVG.nm, f: pct,
      cmp: sel ? <Compare v={sel.nm} avg={AVG.nm} f={pct} unit="pts" label="12-co. avg" /> : <span className="db-note">Range -3.5% (Sears) to 27.4% (Microsoft)</span>,
    },
    {
      label: "Return on equity", sub: sel ? `${sel.name}, ${period}` : `Average, ${period}`, icon: Coins, to: sel ? sel.roe : AVG.roe, f: pct,
      cmp: sel ? <Compare v={sel.roe} avg={AVG.roe} f={pct} unit="pts" label="12-co. avg" /> : <span className="db-note">Range -42.2% (McDonald&apos;s) to 61.3% (Apple)</span>,
    },
    {
      label: "Current ratio", sub: sel ? `${sel.name}, ${period}${FINANCIALS.has(sel.name) ? ", not meaningful for a financial" : ""}` : `Average, ${period}`, icon: Scales, to: sel ? sel.cr : AVG.cr, f: x1,
      cmp: sel ? <Compare v={sel.cr} avg={AVG.cr} f={x1} unit="x" label="12-co. avg" /> : <span className="db-note">Range 0.8x (PG&amp;E) to 5.1x (NVIDIA)</span>,
    },
  ];

  const basis = sel ?? { rev: TOTAL_REV, gp: TOTAL_GP, ebitda: TOTAL_EBITDA, ni: TOTAL_NI, name: "All 12" };
  const steps: Step[] = [
    { label: "Revenue", v: basis.rev, total: true },
    { label: "Cost of sales", v: -(basis.rev - basis.gp) },
    { label: "Operating costs", v: -(basis.gp - basis.ebitda) },
    { label: "Interest, tax, D&A", v: -(basis.ebitda - basis.ni) },
    { label: "Net income", v: basis.ni, total: true },
  ];
  const maxCap = COS[0].cap;

  // Scatter: ROA (x) against ROE (y).
  const SX = [-10, 25], SY = [-50, 70];
  const sx = (v: number) => ((v - SX[0]) / (SX[1] - SX[0])) * 100;
  const sy = (v: number) => 100 - ((v - SY[0]) / (SY[1] - SY[0])) * 100;
  const dotCo = COS.find((c) => c.name === (hoverDot ?? co)) ?? null;

  const ratioTiles: Array<[string, number, number, (n: number) => string, "pts" | "x", SortKey]> = [
    ["Current ratio", sel ? sel.cr : AVG.cr, AVG.cr, x1, "x", "cr"],
    ["Debt to equity", sel ? sel.de : AVG.de, AVG.de, x1, "x", "de"],
    ["ROE", sel ? sel.roe : AVG.roe, AVG.roe, pct, "pts", "roe"],
    ["ROA", sel ? sel.roa : AVG.roa, AVG.roa, pct, "pts", "roa"],
    ["ROI", sel ? sel.roi : AVG.roi, AVG.roi, pct, "pts", "roi"],
    ["Net margin", sel ? sel.nm : AVG.nm, AVG.nm, pct, "pts", "nm"],
  ];

  const pager = (page: number, setPage: (f: (p: number) => number) => void, label: string) => (
    <div className="pc-mc-pager">
      <button type="button" disabled={page === 0} onClick={() => setPage((p) => p - 1)} aria-label={`Previous ${label}`}>‹</button>
      <span>{page + 1} / {Math.ceil(COS.length / PAGE)}</span>
      <button type="button" disabled={page >= Math.ceil(COS.length / PAGE) - 1} onClick={() => setPage((p) => p + 1)} aria-label={`Next ${label}`}>›</button>
    </div>
  );
  const head = (cols: Array<[SortKey, string]>, s: { key: SortKey; dir: 1 | -1 }, by: (k: SortKey) => void) => (
    <div className="pc-mc-tr is-head" role="row">
      <span role="columnheader">Company</span>
      {cols.map(([k, l]) => (
        <span key={k} role="columnheader" className={`pc-mc-c-${k}`} aria-sort={s.key === k ? (s.dir === 1 ? "ascending" : "descending") : "none"}>
          <button type="button" className={s.key === k ? "is-on" : undefined} onClick={() => by(k)}>{l}{s.key === k ? (s.dir === 1 ? " ↑" : " ↓") : ""}</button>
        </span>
      ))}
    </div>
  );

  return (
    <div ref={ref} className={`db pc-mc${on ? " is-on" : ""}`}>
      <Topbar title="Major companies" tabs={["Summary", "Income", "Cash flow", "Ratios"]} tab={tab} onTab={setTab} alerts={alerts} onRead={read} about={MC_ABOUT} />

      {tab === "Summary" && (
        <div className="db-page" key="summary">
          {filters()}
          <div className="db-kpis">
            {kpis.map((c, i) => (
              <article key={c.label} className="db-card db-kpi" style={{ "--i": i } as React.CSSProperties}>
                <header><span>{c.label}<small>{c.sub}</small></span><Chip icon={c.icon} /></header>
                <strong><Count to={c.to} on={on} format={c.f} /></strong>
                {c.cmp}
              </article>
            ))}
          </div>
          <div className="db-row db-row-2">
            <article className="db-card pc-mc-card">
              <header>
                <div><span className="db-label">Revenue by year, all 12 companies, approx.</span><strong className="db-big db-big-sm">{yearHead(REV_T, aboutT, "Revenue")}</strong></div>
                {year !== null && year !== 13 && <FilterChip label={String(YEARS[year])} onClear={() => setYear(13)} />}
              </header>
              <YearArea vals={REV_T} max={2} ticks={[0, 0.5, 1, 1.5, 2]} tick={(n) => `$${n}T`} tip={aboutT} height={150} year={year} onYear={setYear} label="Revenue by year for all 12 companies. Click a year to read it." />
              <div className="pc-mc-ni" style={{ "--v": Math.max(0, TOTAL_NI / TOTAL_REV) } as React.CSSProperties}>
                <span className="pc-mc-ni-top"><span>Net income, same scale, 2009-2023</span><b>{usd(TOTAL_NI)} of {usd(TOTAL_REV)} ({pct((TOTAL_NI / TOTAL_REV) * 100)})</b></span>
                <span className="pc-mc-ni-bar"><i /></span>
                <small><Info size={11} /> The original drew net income on a hidden second axis, which made it look nearly as large as revenue. Yearly net income is not in the export, so we show the honest total.</small>
              </div>
            </article>
            <article className="db-card pc-mc-card">
              <header><div><span className="db-label">Market cap, yearly values summed (USD bn)</span><strong className="db-big db-big-sm">{sel ? `${sel.name}: ${sel.cap.toFixed(1)}K bn` : "Apple and Microsoft lead"}</strong></div></header>
              <div className="pc-mc-hbars" role="group" aria-label="Market cap by company. Click a company to filter the report.">
                {COS.map((c, i) => (
                  <button key={c.name} type="button" aria-pressed={co === c.name} className={co && co !== c.name ? "is-dim" : undefined} style={{ "--v": c.cap / maxCap, "--i": i } as React.CSSProperties} onClick={() => pick(c.name)}>
                    <span>{c.name}</span><span className="pc-mc-hbar"><i /></span><b>{c.cap.toFixed(1)}K</b>
                  </button>
                ))}
              </div>
              <p className="pc-mc-foot">Summed across years in the source: use it to rank, not to value.</p>
            </article>
          </div>
        </div>
      )}

      {tab === "Income" && (
        <div className="db-page" key="income">
          {filters()}
          <div className="db-row pc-mc-row-income">
            <article className="db-card pc-mc-card">
              <header><div><span className="db-label">From revenue to net income, {basis.name}</span><strong className="db-big db-big-sm">{usd(basis.ni)} kept from {usd(basis.rev)} ({pct((basis.ni / basis.rev) * 100)})</strong></div></header>
              <Waterfall steps={steps} on={on} label={`Revenue to net income for ${basis.name}`} />
              {sel && EBITDA_GAP.has(sel.name)
                ? <p className="db-hint is-warn"><Warning size={13} weight="fill" /> EBITDA looks incomplete in the source for {sel.name}, so the split between operating costs and interest, tax and D&amp;A is not reliable.</p>
                : <p className="db-hint"><Lightning size={13} weight="fill" /> Interest, tax, D&amp;A is EBITDA minus net income, so it includes depreciation and amortisation.</p>}
            </article>
            <article className="db-card pc-mc-card">
              <header><div><span className="db-label">Net profit margin, 2009-2023 (-50% to 50%)</span><strong className="db-big db-big-sm">{sel ? `${sel.name}: ${pct(sel.nm)}, ${sel.shape.toLowerCase()}` : "Most sit between 10% and 30%"}</strong></div></header>
              <div className="pc-mc-multi" role="group" aria-label="Net profit margin by company. Click a company to filter the report.">
                {[...COS].sort((a, b) => a.name.localeCompare(b.name)).map((c) => (
                  <button key={c.name} type="button" aria-pressed={co === c.name} className={`${co && co !== c.name ? "is-dim" : ""}${c.nm < 0 ? " is-neg" : ""}`} onClick={() => pick(c.name)}
                    aria-label={`${c.name}: net margin ${pct(c.nm)}. Pattern in the original: ${c.shape}.`}>
                    <span className="pc-mc-multi-top"><b>{c.name}</b><em>{pct(c.nm)}</em></span>
                    <span className="pc-mc-multi-bar" style={{ "--v": c.nm / 50 } as React.CSSProperties}><i /></span>
                    <small>{c.shape}</small>
                  </button>
                ))}
              </div>
            </article>
          </div>
          <article className="db-card pc-mc-card">
            <header><div><span className="db-label">Profitability by company, {period}</span><strong className="db-big db-big-sm">{sel ? `${sel.name} ranks ${profRows.findIndex((c) => c.name === sel.name) + 1} of 12 by this sort` : "Sort any column"}</strong></div>{pager(pageP, setPageP, "companies")}</header>
            <AllColumns />
            <div className="db-table pc-mc-table" role="table" aria-label="Profitability by company">
              {head([["rev", "Revenue"], ["gp", "Gross profit"], ["ni", "Net income"], ["ebitda", "EBITDA"], ["nm", "Margin"]], sortP, sortBy(setSortP, setPageP))}
              {profRows.slice(pageP * PAGE, pageP * PAGE + PAGE).map((c) => (
                <div key={c.name} role="row" className={`pc-mc-tr${co === c.name ? " is-sel" : ""}`}>
                  <span role="cell" className="db-who"><button type="button" onClick={() => pick(c.name)} aria-pressed={co === c.name}><b>{c.name}</b></button></span>
                  <span role="cell" className="pc-mc-c-rev" title={exact(c.rev)}>{usd(c.rev)}</span>
                  <span role="cell" className="pc-mc-c-gp" title={exact(c.gp)}>{usd(c.gp)}</span>
                  <span role="cell" className={`pc-mc-c-ni ${c.ni < 0 ? "is-neg" : "is-pos"}`} title={exact(c.ni)}>{usd(c.ni)}</span>
                  <span role="cell" className={`pc-mc-c-ebitda${EBITDA_GAP.has(c.name) ? " is-gap" : ""}`} title={EBITDA_GAP.has(c.name) ? `${exact(c.ebitda)}: looks like a gap in the source` : exact(c.ebitda)}>{usd(c.ebitda)}{EBITDA_GAP.has(c.name) ? "*" : ""}</span>
                  <span role="cell" className={`pc-mc-c-nm ${c.nm < 0 ? "is-neg" : ""}`}>{pct(c.nm)}</span>
                </div>
              ))}
            </div>
            <p className="pc-mc-foot">* EBITDA looks like a gap in the source. Barclays reports no cost of sales, so its gross profit equals revenue. Hover a value for the exact figure in USD millions.</p>
          </article>
        </div>
      )}

      {tab === "Cash flow" && (
        <div className="db-page" key="cash">
          {filters(sel ? "cash flow covers all 12: the source has no company split" : undefined)}
          <div className="pc-mc-kpis5">
            {([
              ["Operating cash flow", CF.op, Bank, "All 12, 2009-2023"],
              ["Investing cash flow", CF.inv, ArrowDownRight, "All 12, 2009-2023"],
              ["Financing cash flow", CF.fin, ArrowDownRight, "All 12, 2009-2023"],
              ["Net cash change", CF.net, CurrencyDollar, "Operating + investing + financing"],
            ] as Array<[string, number, Icon, string]>).map(([l, v, I, sub], i) => (
              <article key={l} className="db-card db-kpi" style={{ "--i": i } as React.CSSProperties}>
                <header><span>{l}<small>{sub}</small></span><Chip icon={I} /></header>
                <strong className={v < 0 ? "is-neg" : undefined}><Count to={v} on={on} format={(n) => usd(n, 1)} /></strong>
                <span className="db-note">{v < 0 ? "Cash out" : "Cash in"}, USD</span>
              </article>
            ))}
            <article className="db-card db-kpi" style={{ "--i": 4 } as React.CSSProperties}>
              <header><span>Free cash flow per share<small>Average, 2009-2023</small></span><Chip icon={Coins} /></header>
              <strong><Count to={CF.fcfShare} on={on} format={(n) => `$${n.toFixed(2)}`} /></strong>
              <span className="db-note">As printed; not comparable across firms</span>
            </article>
          </div>
          <div className="db-row db-row-2">
            <article className="db-card pc-mc-card">
              <header>
                <div><span className="db-label">Operating cash flow by year, all 12, approx.</span><strong className="db-big db-big-sm">{yearHead(OCF_B, aboutB, "Operating cash flow")}</strong></div>
                {year !== null && year !== 13 && <FilterChip label={String(YEARS[year])} onClear={() => setYear(13)} />}
              </header>
              <YearArea vals={OCF_B} max={500} ticks={[0, 250, 500]} tick={(n) => `$${n}B`} tip={aboutB} height={176} year={year} onYear={setYear} label="Operating cash flow by year for all 12 companies. Click a year to read it." />
            </article>
            <article className="db-card pc-mc-card">
              <header><div><span className="db-label">Cash flow by activity, 2009-2023</span><strong className="db-big db-big-sm">{usd(CF.net, 1)} net, after {usd(-CF.inv - CF.fin, 1)} out</strong></div></header>
              <Waterfall on={on} label="Cash flow by activity" steps={[
                { label: "Operating", v: CF.op, total: true }, { label: "Investing", v: CF.inv }, { label: "Financing", v: CF.fin }, { label: "Net change", v: CF.net, total: true },
              ]} />
              <p className="pc-mc-foot">The source rounds each activity to $0.1T, so the steps land {usd(Math.abs(CF_GAP), 1)} {CF_GAP >= 0 ? "short of" : "above"} the exact net change; FX effects on cash also sit in that gap.</p>
            </article>
          </div>
        </div>
      )}

      {tab === "Ratios" && (
        <div className="db-page" key="ratios">
          {filters()}
          <div className="db-row pc-mc-row-ratios">
            <article className="db-card pc-mc-card">
              <header><div><span className="db-label">Key ratios, {sel ? `${sel.name} vs 12-company average` : "averages across companies"}</span><strong className="db-big db-big-sm">{sel ? (NEG_EQUITY.has(sel.name) ? `${sel.name} has negative equity in the source, so ROE and debt to equity read oddly` : `${sel.name} at a glance`) : "Click a tile to sort the table"}</strong></div></header>
              <div className="pc-mc-tiles" role="group" aria-label="Key ratios. Click one to sort the comparison table by it.">
                {ratioTiles.map(([l, v, avg, f, unit, key]) => (
                  <button key={l} type="button" aria-pressed={sortR.key === key} onClick={() => { setSortR({ key, dir: -1 }); setPageR(0); }}>
                    <span>{l}</span>
                    <b><Count to={v} on={on} format={f} /></b>
                    {sel ? <Compare v={v} avg={avg} f={f} unit={unit} label="avg" /> : <small>Average</small>}
                  </button>
                ))}
              </div>
            </article>
            <article className="db-card pc-mc-card">
              <header><div><span className="db-label">ROA against ROE, 2009-2023</span><strong className="db-big db-big-sm">{dotCo ? `${dotCo.name}: ROA ${pct(dotCo.roa)}, ROE ${pct(dotCo.roe)}` : "Efficient vs simply large"}</strong></div></header>
              <div className="pc-mc-scatter" onMouseLeave={() => setHoverDot(null)}>
                <span className="pc-mc-avg-x" style={{ left: `${sx(AVG.roa)}%` }} aria-hidden="true" />
                <span className="pc-mc-avg-y" style={{ top: `${sy(AVG.roe)}%` }} aria-hidden="true" />
                <span className="pc-mc-zero-y" style={{ top: `${sy(0)}%` }} aria-hidden="true" />
                <em className="pc-mc-quad" aria-hidden="true">Efficient</em>
                <span className="pc-mc-ax is-y" aria-hidden="true"><i>70%</i><i>ROE</i><i>-50%</i></span>
                <span className="pc-mc-ax is-x" aria-hidden="true"><i>-10%</i><i>ROA</i><i>25%</i></span>
                {COS.map((c, i) => (
                  <button key={c.name} type="button" className={`pc-mc-dot${co === c.name ? " is-sel" : ""}${co && co !== c.name ? " is-dim" : ""}`}
                    style={{ left: `${sx(c.roa)}%`, top: `${sy(c.roe)}%`, "--i": i } as React.CSSProperties}
                    aria-label={`${c.name}: ROA ${pct(c.roa)}, ROE ${pct(c.roe)}`} aria-pressed={co === c.name}
                    onMouseEnter={() => setHoverDot(c.name)} onFocus={() => setHoverDot(c.name)} onBlur={() => setHoverDot(null)} onClick={() => pick(c.name)}>
                    {(hoverDot === c.name || co === c.name) && <span className={`pc-mc-dot-tip${sx(c.roa) > 70 ? " is-end" : ""}`}>{c.name}</span>}
                  </button>
                ))}
              </div>
            </article>
          </div>
          <article className="db-card pc-mc-card">
            <header><div><span className="db-label">Ratio comparison, {period}</span><strong className="db-big db-big-sm">{sel ? `${sel.name} ranks ${ratioRows.findIndex((c) => c.name === sel.name) + 1} of 12 by this sort` : "Sorted by ROA, highest first"}</strong></div>{pager(pageR, setPageR, "companies")}</header>
            <AllColumns />
            <div className="db-table pc-mc-table" role="table" aria-label="Ratio comparison by company">
              {head([["cr", "Current"], ["de", "Debt/equity"], ["roe", "ROE"], ["roa", "ROA"], ["roi", "ROI"]], sortR, sortBy(setSortR, setPageR))}
              {ratioRows.slice(pageR * PAGE, pageR * PAGE + PAGE).map((c) => (
                <div key={c.name} role="row" className={`pc-mc-tr${co === c.name ? " is-sel" : ""}`}>
                  <span role="cell" className="db-who"><button type="button" onClick={() => pick(c.name)} aria-pressed={co === c.name}><b>{c.name}{NEG_EQUITY.has(c.name) ? "*" : ""}{FINANCIALS.has(c.name) ? "†" : ""}</b></button></span>
                  <span role="cell" className="pc-mc-c-cr">{x1(c.cr)}</span>
                  <span role="cell" className={`pc-mc-c-de${c.de < 0 ? " is-neg" : ""}`}>{x1(c.de)}</span>
                  <span role="cell" className={`pc-mc-c-roe${c.roe < 0 ? " is-neg" : ""}`}>{pct(c.roe)}</span>
                  <span role="cell" className={`pc-mc-c-roa${c.roa < 0 ? " is-neg" : ""}`}>{pct(c.roa)}</span>
                  <span role="cell" className={`pc-mc-c-roi${c.roi < 0 ? " is-neg" : ""}`}>{pct(c.roi)}</span>
                </div>
              ))}
            </div>
            <p className="pc-mc-foot">* Negative shareholders&apos; equity in the source, which turns debt to equity negative and distorts ROE. † Bank or insurer: the current ratio does not apply. Averages are simple averages of company-years.</p>
          </article>
        </div>
      )}
    </div>
  );
}
