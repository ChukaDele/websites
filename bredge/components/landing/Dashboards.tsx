"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDownRight, ArrowUpRight, Bell, CalendarBlank, Check, Clock, CurrencyDollar,
  Eye, EyeSlash, Info, Lightning, MagnifyingGlass, Receipt, TrendUp, UsersThree, X, type Icon,
} from "@phosphor-icons/react";
import { FilterBar } from "./PhoneFilters";

/**
 * The two reference dashboards, built to behave like a Power BI report:
 * report pages (tabs), slicers (period, currency, scenario), cross-filtering
 * (click a bar and the cards filter to it; click again to clear), hover
 * tooltips, sortable and searchable tables, and working buttons (alerts,
 * search, chase, export, checklist). All figures are synthetic.
 *
 * Motion: on first view numbers count up and bars grow; after that every
 * change eases from the old value to the new one. Reduced motion: values
 * change at once.
 */

/* ───────────────────────── shared ───────────────────────── */

export function useInView<T extends Element>() {
  const ref = useRef<T>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, on] as const;
}

/** Shows the real value from the first render (so it is never "$0.0K" on a
 *  slow connection or to a crawler), then eases from the value it shows to the
 *  new one whenever it changes. `on` is kept for call-site compatibility. */
export function Count({ to, format, duration = 650 }: { to: number; on?: boolean; format: (n: number) => string; duration?: number }) {
  const [v, setV] = useState(to);
  const shown = useRef(to);
  useEffect(() => {
    const from = shown.current;
    if (from === to) return;
    let raf = 0;
    const t0 = performance.now();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
  return <>{format(v)}</>;
}

/** A change chip. `down` colours it as bad; `dir` sets the arrow, so a fall
 *  in churn can point down and still read as good. */
export function Delta({ value, down = false, note, dir }: { value: string; down?: boolean; note?: string; dir?: "up" | "down" }) {
  const arrowDown = (dir ?? (down ? "down" : "up")) === "down";
  return (
    <span className="db-delta-row">
      <span className={`db-delta${down ? " is-down" : ""}`}>{arrowDown ? <ArrowDownRight size={11} weight="bold" /> : <ArrowUpRight size={11} weight="bold" />}{value}</span>
      {note && <span className="db-note">{note}</span>}
    </span>
  );
}

export function Chip({ icon: I }: { icon: Icon }) {
  return <span className="db-chip" aria-hidden="true"><I size={15} /></span>;
}

/** A row of slicer buttons (one selected). */
export function Slicer<T extends string>({ label, options, value, onChange, className = "" }: { label: string; options: readonly T[]; value: T; onChange: (v: T) => void; className?: string }) {
  return (
    <div className={`db-seg ${className}`} role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button key={o} type="button" role="radio" aria-checked={o === value} className={o === value ? "is-on" : undefined} onClick={() => onChange(o)}>{o}</button>
      ))}
    </div>
  );
}

// Marks for FilterBar (./PhoneFilters), which counts active slicers and chips.
(Slicer as { dbKind?: string }).dbKind = "slicer";

export type Alert = { id: string; title: string; when: string };

/** `defs` (optional): one line per metric, [name, how it is worked out]. Shown
 *  in the About popover under a collapsed "Metric definitions" toggle. */
export type About = { question: string; built: string[]; sources: string; defs?: Array<[string, string]> };

export function Topbar({ title, tabs, tab, onTab, alerts, onRead, search, onSearch, about }: {
  title: string; tabs: readonly string[]; tab: string; onTab: (t: string) => void;
  alerts: Alert[]; onRead: (id: string) => void;
  search?: string; onSearch?: (q: string) => void;
  about?: About;
}) {
  const [open, setOpen] = useState<"bell" | "search" | "about" | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (open === "search") searchRef.current?.focus(); }, [open]);
  // Popovers (alerts, about) close on Escape, returning focus to their button,
  // and on any press outside the toolbar.
  const toolsRef = useRef<HTMLDivElement>(null);
  // Phones: the tabs are a swipeable row; keep the active one in view (the row
  // only, never the page).
  const tabsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const row = tabsRef.current;
    const on = row?.querySelector<HTMLElement>("[aria-selected='true']");
    if (!row || !on || row.scrollWidth <= row.clientWidth) return;
    const l = on.offsetLeft - row.offsetLeft, r = l + on.offsetWidth;
    if (l < row.scrollLeft) row.scrollTo({ left: l - 8, behavior: "smooth" });
    else if (r > row.scrollLeft + row.clientWidth) row.scrollTo({ left: r - row.clientWidth + 8, behavior: "smooth" });
  }, [tab]);
  useEffect(() => {
    if (open !== "bell" && open !== "about") return;
    const trigger = toolsRef.current?.querySelector<HTMLButtonElement>(open === "bell" ? ".db-bell" : ".db-info");
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(null); trigger?.focus(); } };
    const onDown = (e: PointerEvent) => { if (!toolsRef.current?.contains(e.target as Node)) setOpen(null); };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("pointerdown", onDown); };
  }, [open]);
  return (
    <div className="db-top">
      <div className="db-hello"><span className="db-avatar" aria-hidden="true">B</span><b>{title}</b></div>
      <div className="db-tabs" role="tablist" aria-label={`${title} pages`} ref={tabsRef}>
        {tabs.map((t) => (
          <button key={t} type="button" role="tab" aria-selected={t === tab} className={t === tab ? "is-on" : undefined} onClick={() => onTab(t)}>{t}</button>
        ))}
      </div>
      <div className="db-tools" ref={toolsRef}>
        {onSearch && (open === "search" ? (
          <label className="db-search">
            <MagnifyingGlass size={13} aria-hidden="true" />
            <span className="sr-only">Search accounts</span>
            <input ref={searchRef} type="search" placeholder="Search accounts" value={search} onChange={(e) => onSearch(e.target.value)} onKeyDown={(e) => { if (e.key === "Escape") { onSearch(""); setOpen(null); } }} />
            <button type="button" aria-label="Close search" onClick={() => { onSearch(""); setOpen(null); }}><X size={12} /></button>
          </label>
        ) : (
          <button type="button" className="db-round" aria-label="Search accounts" onClick={() => setOpen("search")}><MagnifyingGlass size={14} /></button>
        ))}
        {about && (
          <div className="db-pop-anchor">
            <button type="button" className="db-round db-info" aria-label="About this report" aria-haspopup="dialog" aria-expanded={open === "about"} onClick={() => setOpen(open === "about" ? null : "about")}><Info size={15} /></button>
            {open === "about" && (
              <div className="db-pop db-about" role="dialog" aria-label="About this report">
                <header><b>About this report</b><button type="button" onClick={() => setOpen(null)} aria-label="Close"><X size={12} /></button></header>
                <p className="db-about-q">{about.question}</p>
                <span className="db-about-label">What our team built behind it</span>
                <ul>{about.built.map((b) => <li key={b}><Check size={12} weight="bold" />{b}</li>)}</ul>
                {about.defs && about.defs.length > 0 && (
                  <details className="db-about-defs dd-disclosure" style={{ marginBottom: 10 }}>
                    <summary className="db-about-label" style={{ marginBottom: 6 }}>Metric definitions ({about.defs.length})</summary>
                    <dl style={{ display: "grid", gap: 7, maxHeight: 220, overflowY: "auto", margin: 0, paddingRight: 4, fontSize: ".7rem", lineHeight: 1.35 }}>
                      {about.defs.map(([term, def]) => (
                        <div key={term}><dt style={{ fontWeight: 600 }}>{term}</dt><dd style={{ margin: 0, color: "var(--db-mute)" }}>{def}</dd></div>
                      ))}
                    </dl>
                  </details>
                )}
                <p className="db-about-src">{about.sources}</p>
              </div>
            )}
          </div>
        )}
        <div className="db-pop-anchor">
          <button type="button" className="db-round db-bell" aria-label={`Alerts, ${alerts.length} unread`} aria-haspopup="dialog" aria-expanded={open === "bell"} onClick={() => setOpen(open === "bell" ? null : "bell")}>
            <Bell size={14} />{alerts.length > 0 && <i>{alerts.length}</i>}
          </button>
          {open === "bell" && (
            <div className="db-pop" role="dialog" aria-label="Alerts">
              <header><b>Alerts</b><button type="button" onClick={() => setOpen(null)} aria-label="Close alerts"><X size={12} /></button></header>
              {alerts.length ? (
                <ul>
                  {alerts.map((a) => (
                    <li key={a.id}><span><b>{a.title}</b><small>{a.when}</small></span><button type="button" onClick={() => onRead(a.id)}>Mark read</button></li>
                  ))}
                </ul>
              ) : <p className="db-pop-empty"><Check size={13} weight="bold" /> All caught up</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function useAlerts(initial: Alert[]) {
  const [alerts, setAlerts] = useState(initial);
  return [alerts, (id: string) => setAlerts((a) => a.filter((x) => x.id !== id))] as const;
}

export function useToast() {
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => {
    if (!msg) return;
    const t = window.setTimeout(() => setMsg(null), 2400);
    return () => window.clearTimeout(t);
  }, [msg]);
  const node = msg ? <p className="db-toast" role="status"><Check size={13} weight="bold" />{msg}</p> : null;
  return [node, setMsg] as const;
}

export type BarDatum = { key: string; label: string; h: number; tip: string; tipLabel: string };

/** Column chart with hover tooltip and click-to-filter. */
export function Bars({ data, selected, onSelect, on, weeks = false, label, highlight }: { data: BarDatum[]; selected: number | null; onSelect: (i: number | null) => void; on: boolean; weeks?: boolean; label: string; highlight?: (i: number) => boolean }) {
  const [hover, setHover] = useState<number | null>(null);
  const tipAt = hover ?? selected ?? data.length - 1;
  return (
    <div className={`db-bars${weeks ? " is-weeks" : ""}${selected !== null ? " has-sel" : ""}${highlight ? " has-range" : ""}`} role="group" aria-label={label} onMouseLeave={() => setHover(null)}>
      {data.map((d, i) => (
        <button
          key={d.key}
          type="button"
          className={`db-bar${i === tipAt ? " is-peak" : ""}${selected === i ? " is-sel" : ""}${highlight && !highlight(i) ? " is-out" : ""}`}
          style={{ "--h": d.h, "--i": i } as React.CSSProperties}
          aria-pressed={selected === i}
          aria-label={`${d.tipLabel}: ${d.tip}`}
          onMouseEnter={() => setHover(i)}
          onFocus={() => setHover(i)}
          onBlur={() => setHover(null)}
          onClick={() => onSelect(selected === i ? null : i)}
        >
          {on && i === tipAt && <span className={`db-tip${i >= data.length - 2 ? " is-end" : i <= 1 ? " is-start" : ""}`}><small>{d.tipLabel}</small>{d.tip}</span>}
          <i />
          <em>{d.label}</em>
        </button>
      ))}
    </div>
  );
}

export function FilterChip({ label, onClear }: { label: string; onClear: () => void }) {
  return <button type="button" className="db-filter" onClick={onClear}>Filtered: {label} <X size={11} weight="bold" aria-hidden="true" /><span className="sr-only">Clear filter</span></button>;
}
(FilterChip as { dbKind?: string }).dbKind = "chip";

/* ───────────────────────── SaaS Growth ───────────────────────── */

// 24 months of synthetic history in USD, Oct 2024 to Sep 2026 (the last closed month).
const MN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MN_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const N = 24;
const mon = (i: number) => (9 + i) % 12;
const yr = (i: number) => 2024 + Math.floor((9 + i) / 12);
const mShort = (i: number) => `${MN[mon(i)]} ${yr(i)}`;
const mLong = (i: number) => `${MN_LONG[mon(i)]} ${yr(i)}`;
const range = (a: number, b: number) => a === b ? mShort(a) : yr(a) === yr(b) ? `${MN[mon(a)]}-${MN[mon(b)]} ${yr(b)}` : `${mShort(a)} - ${mShort(b)}`;

/** % change, or null when the base is zero or negative (a % of that base would mislead). */
const change = (a: number, b: number) => (b > 0 ? (a / b - 1) * 100 : null);
const pctAbs = (a: number, b: number) => { const c = change(a, b); return c === null ? "n/a" : `${Math.abs(c).toFixed(1)}%`; };
const arrow = (up: boolean) => (up ? "up" : "down") as "up" | "down";

const START_MRR = 141000, START_ARPA = 410;
const GROSS_MARGIN = 0.78; // subscription gross margin, used for CAC payback

type Month = {
  mrr: number; newM: number; exp: number; react: number; contr: number; churn: number;
  customers: number; startCust: number; newLogos: number; lostLogos: number;
  act: number; trials: number; activated: number; sm: number;
};
// One monthly table drives every tile: MRR movements, customer counts, the
// trial funnel and sales and marketing spend are all generated together, so
// the five MRR movements always sum to the change in MRR and paid
// conversions always equal the new customers.
const SERIES: Month[] = (() => {
  const out: Month[] = [];
  let prev = START_MRR, prevCust = Math.round(START_MRR / START_ARPA);
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1);
    const g = 0.036 + 0.01 * t + 0.004 * Math.sin(i * 1.3);
    const mrr = Math.round(prev * (1 + g));
    const churn = Math.round(prev * 0.015 * (1 - 0.25 * t));
    const contr = Math.round(prev * 0.005);
    const exp = Math.round(prev * 0.02 * (1 + 0.3 * t));
    const react = Math.round(prev * 0.002);
    const newM = mrr - prev - exp - react + contr + churn; // the balancing movement
    const arpa = 410 + 110 * t;
    const customers = Math.round(mrr / arpa);
    const lostLogos = Math.round(prevCust * (2.6 - 0.9 * t + 0.15 * Math.sin(i)) / 100); // on customers at the start of the month
    const reactLogos = Math.round(react / arpa);
    const newLogos = Math.max(0, customers - prevCust + lostLogos - reactLogos);
    const act = +(34.2 + 8.5 * t + 0.4 * Math.sin(i * 0.9)).toFixed(1);
    const trials = Math.round(newLogos / (act * 0.66 / 100)); // about two in three activated trials pay
    const activated = Math.min(trials, Math.max(newLogos, Math.round(trials * act / 100)));
    const sm = Math.round((16.4 - 4.6 * t) * newM * GROSS_MARGIN); // spend sized to a payback falling from about 16 to 12 months
    out.push({ mrr, newM, exp, react, contr, churn, customers, startCust: prevCust, newLogos, lostLogos, act, trials, activated, sm });
    prev = mrr;
    prevCust = customers;
  }
  return out;
})();
const prevMrr = (i: number) => (i === 0 ? START_MRR : SERIES[i - 1].mrr);
/** Trailing 12-month revenue retention on a starting-cohort basis: each
 *  month's expansion, contraction and churn rates applied to the MRR of the
 *  customers who were paying 12 months earlier. New customers and
 *  reactivations are left out. GRR also leaves out expansion, so it cannot
 *  pass 100%. */
const retention = (i: number, net: boolean) => {
  let r = 1;
  for (let j = Math.max(0, i - 11); j <= i; j++) {
    const m = SERIES[j];
    r *= 1 + ((net ? m.exp : 0) - m.contr - m.churn) / prevMrr(j);
  }
  return (net ? r : Math.min(1, r)) * 100;
};
const sum = (a: number, b: number, f: (m: Month) => number) => { let t = 0; for (let i = a; i <= b; i++) t += f(SERIES[i]); return t; };
/** Logo churn over a window: customers lost ÷ customers at the start of each
 *  month, both summed. A weighted rate, not an average of monthly rates. */
const logoChurn = (a: number, b: number) => { const base = sum(a, b, (m) => m.startCust); return base ? (sum(a, b, (m) => m.lostLogos) / base) * 100 : 0; };
/** Months of gross profit on new MRR needed to earn back sales and marketing spend. */
const paybackOf = (a: number, b: number) => { const g = sum(a, b, (m) => m.newM) * GROSS_MARGIN; return g > 0 ? sum(a, b, (m) => m.sm) / g : null; };
const cacOf = (a: number, b: number) => { const n = sum(a, b, (m) => m.newLogos); return n ? sum(a, b, (m) => m.sm) / n : null; };
const netMove = (m: Month) => m.newM + m.exp + m.react - m.contr - m.churn;

const PERIODS = ["Month", "Quarter", "Year"] as const;
type Period = typeof PERIODS[number];
const SPAN: Record<Period, number> = { Month: 1, Quarter: 3, Year: 12 };
const CHART_FROM = N - 12; // the chart shows the last 12 months

const COHORTS: Array<[string, number[]]> = [
  ["Apr", [100, 95, 92, 90, 89, 88]],
  ["May", [100, 95, 93, 91, 90]],
  ["Jun", [100, 96, 93, 92]],
  ["Jul", [100, 96, 94]],
  ["Aug", [100, 97]],
  ["Sep", [100]],
];

type Account = { name: string; plan: string; mrr: number; health: number; signal: string };
const ACCOUNTS: Account[] = [
  { name: "Northwind Labs", plan: "Scale", mrr: 18400, health: 92, signal: "Seats at 96%: expansion" },
  { name: "Horizon Labs", plan: "Growth", mrr: 6200, health: 41, signal: "Usage down 38% in 30 days" },
  { name: "Velocity HQ", plan: "Growth", mrr: 7900, health: 58, signal: "Champion left the company" },
  { name: "Monument Co.", plan: "Starter", mrr: 1900, health: 63, signal: "Renewal in 21 days" },
  { name: "Atlas Freight", plan: "Scale", mrr: 22600, health: 88, signal: "Asked about SSO: upsell" },
  { name: "Juniper Health", plan: "Growth", mrr: 9800, health: 76, signal: "Steady" },
];

const k = (n: number) => `$${(n / 1000).toFixed(1)}K`;
const m2 = (n: number) => `$${(n / 1e6).toFixed(2)}M`;
const pct = (n: number) => `${n.toFixed(1)}%`;
const signed = (n: number, f: (x: number) => string) => `${n >= 0 ? "+" : "-"}${f(Math.abs(n))}`;

const LOWEST_CHURN = SERIES.reduce((lo, _, i) => (logoChurn(i, i) < logoChurn(lo, lo) ? i : lo), 0);

const SAAS_ABOUT: About = {
  question: "Is growth coming from new customers or from the ones we already have, and where are we losing it?",
  built: [
    "One MRR definition, reconciled to billing every night",
    "Product events joined to accounts, so activation is measurable",
    "Churn, contraction and expansion split per account and month",
    "Tests on every metric before the dashboard refreshes",
  ],
  defs: [
    ["MRR", "Recurring subscription revenue at month end, normalised to one month. Excludes one-off fees and usage overage. ARR = MRR x 12."],
    ["MRR movements", "New (first-time customers), expansion (upgrades and seats), reactivation (returning churned customers), contraction (downgrades) and churn (cancellations). They sum exactly to the change in MRR."],
    ["Net new MRR", "Sum of all five movements over the window, compared with the window of the same length before it."],
    ["NRR", "Trailing 12 months, starting-cohort basis: MRR today from customers paying 12 months ago, divided by their MRR then. Includes expansion, contraction and churn; excludes new customers and reactivations."],
    ["GRR", "As NRR but without expansion, so it is capped at 100%. Shows how much revenue is kept before any upsell."],
    ["Logo churn", "Customers lost in a month divided by customers at the start of that month. Over a quarter or year: total lost over total start-of-month customers (average monthly rate, weighted)."],
    ["Quick ratio", "(New + expansion + reactivation MRR) divided by (contraction + churned MRR) for the window. Above 4 is strong; below 1 means shrinking."],
    ["Trial to paid", "Trials started in the window and how many activated and paid. A trial is credited to the month it started; activation means reaching the key product event within 7 days."],
    ["CAC and CAC payback", "CAC = sales and marketing spend / new customers. Payback = spend / (new-customer MRR x 78% gross margin), in months. Measured on gross profit, not revenue."],
    ["ARPA", "MRR / paying customers at month end."],
    ["Health score", "0 to 100 from usage trend, seat use, support tickets and renewal date. Under 50 at risk, 50 to 69 watch."],
  ],
  sources: "Sources: billing, product events and CRM. Synthetic data in USD, as of 1 Oct 2026 (September closed), refreshed daily.",
};

export function SaaSGrowthBoard() {
  const [ref, on] = useInView<HTMLDivElement>();
  const [tab, setTab] = useState("Overview");
  const [period, setPeriod] = useState<Period>("Quarter");
  const [sel, setSel] = useState<number | null>(null); // a month picked on the chart (0-11 of the chart)
  const [stage, setStage] = useState(1);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: "mrr" | "health"; dir: 1 | -1 }>({ key: "health", dir: 1 });
  const [cohort, setCohort] = useState(2);
  const [alerts, read] = useAlerts([
    { id: "a1", title: "Horizon Labs health dropped below 45", when: "Today, 09:12" },
    { id: "a2", title: LOWEST_CHURN === N - 1 ? "Logo churn fell to its lowest in 24 months" : `Logo churn at ${pct(logoChurn(N - 1, N - 1))} in ${mShort(N - 1)}`, when: "Yesterday" },
    { id: "a3", title: "September close: MRR reconciled to billing", when: "1 Oct" },
  ]);

  // The window the report describes, and the equal window before it.
  const span = sel === null ? SPAN[period] : 1;
  const end = sel === null ? N - 1 : CHART_FROM + sel;
  const start = end - span + 1;
  const pEnd = start - 1, pStart = pEnd - span + 1;
  const now = range(start, end), before = range(pStart, pEnd);

  const mrr = SERIES[end].mrr, mrrPrev = SERIES[pEnd].mrr;
  const netNew = sum(start, end, netMove);
  const netNewPrev = sum(pStart, pEnd, netMove);
  const churnNow = logoChurn(start, end), churnPrev = logoChurn(pStart, pEnd);
  const nrrNow = retention(end, true), nrrPrev = retention(pEnd, true), grrNow = retention(end, false);
  const yrs = end >= 11 ? "12 mo" : `${end + 1} mo`;

  const kpis: Array<{ label: string; sub: string; icon: Icon; to: number; f: (n: number) => string; d: string; down: boolean; dir: "up" | "down"; vs: string }> = [
    { label: "MRR", sub: `end of ${mShort(end)}, ARR ${m2(mrr * 12)}`, icon: CurrencyDollar, to: mrr, f: k, d: pctAbs(mrr, mrrPrev), down: mrr < mrrPrev, dir: arrow(mrr >= mrrPrev), vs: `vs end of ${mShort(pEnd)}` },
    { label: "Net new MRR", sub: now, icon: TrendUp, to: netNew, f: (n) => signed(n, k), d: pctAbs(netNew, netNewPrev), down: netNew < netNewPrev, dir: arrow(netNew >= netNewPrev), vs: `vs ${before}` },
    { label: "Net revenue retention", sub: `${yrs} to ${mShort(end)}, GRR ${pct(grrNow)}`, icon: UsersThree, to: nrrNow, f: pct, d: `${Math.abs(nrrNow - nrrPrev).toFixed(1)} pts`, down: nrrNow < nrrPrev, dir: arrow(nrrNow >= nrrPrev), vs: `vs ${mShort(pEnd)}` },
    { label: "Logo churn", sub: `${span > 1 ? "avg monthly" : "monthly"}, ${now}`, icon: Lightning, to: churnNow, f: (n) => `${n.toFixed(2)}%`, d: `${Math.abs(churnNow - churnPrev).toFixed(2)} pts`, down: churnNow > churnPrev, dir: arrow(churnNow > churnPrev), vs: churnNow <= churnPrev ? `lower vs ${before}` : `higher vs ${before}` },
  ];

  const bars: BarDatum[] = SERIES.slice(CHART_FROM).map((m, i) => ({ key: mShort(CHART_FROM + i), label: MN[mon(CHART_FROM + i)], h: m.mrr / SERIES[N - 1].mrr, tip: k(m.mrr), tipLabel: `MRR, ${mLong(CHART_FROM + i)}` }));
  const inPeriod = (i: number) => CHART_FROM + i >= start && CHART_FROM + i <= end;

  // MRR movement for the window: where the change came from.
  const newSum = sum(start, end, (m) => m.newM), expSum = sum(start, end, (m) => m.exp), reactSum = sum(start, end, (m) => m.react);
  const contrSum = sum(start, end, (m) => m.contr), churnSum = sum(start, end, (m) => m.churn);
  const moves: Array<[string, number]> = [
    ["New customers", newSum],
    ["Expansion", expSum],
    ["Reactivation", reactSum],
    ["Contraction", -contrSum],
    ["Churn", -churnSum],
  ];
  const maxMove = Math.max(1, ...moves.map(([, v]) => Math.abs(v)));
  const quick = contrSum + churnSum > 0 ? (newSum + expSum + reactSum) / (contrSum + churnSum) : null;

  // Trial funnel for the window, from counts (so the rates and the counts always agree).
  const trials = sum(start, end, (m) => m.trials);
  const activated = sum(start, end, (m) => m.activated);
  const paidN = sum(start, end, (m) => m.newLogos);
  const share = (n: number) => (trials ? (n / trials) * 100 : 0);
  const FUNNEL: Array<[string, number, number, string]> = trials ? [
    ["Trials started", 100, trials, `${trials.toLocaleString("en-US")} trials started in ${now}.`],
    ["Activated", share(activated), activated, `${pct(share(activated))} of trials activated. This is the biggest drop, so that is where the next test goes.`],
    ["Converted to paid", share(paidN), paidN, `${pct(activated ? (paidN / activated) * 100 : 0)} of activated trials went on to pay: ${paidN} new customers in ${now}.`],
  ] : [["Trials started", 0, 0, `No trials started in ${now}.`], ["Activated", 0, 0, "No trials to activate."], ["Converted to paid", 0, 0, "No trials to convert."]];

  const pb = paybackOf(start, end), pbPrev = paybackOf(pStart, pEnd), cac = cacOf(start, end);
  const pbDiff = pb !== null && pbPrev !== null ? pbPrev - pb : null;
  const cust = SERIES[end].customers, custDiff = cust - SERIES[pEnd].customers;

  const accounts = useMemo(() => ACCOUNTS
    .filter((a) => `${a.name} ${a.signal}`.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => (a[sort.key] - b[sort.key]) * sort.dir), [query, sort]);
  const sortBy = (key: "mrr" | "health") => setSort((s) => ({ key, dir: s.key === key ? (s.dir === 1 ? -1 : 1) : key === "health" ? 1 : -1 }));
  const pickPeriod = (p: Period) => { setPeriod(p); setSel(null); };
  const searching = (q: string) => { setQuery(q); if (q) setTab("Accounts"); };

  const context = (
    <FilterBar>
      <Slicer label="Period" options={PERIODS} value={period} onChange={pickPeriod} />
      {sel !== null && <FilterChip label={mLong(end)} onClear={() => setSel(null)} />}
      <p className="db-context"><b>{now}</b> compared with <b>{before}</b> · USD</p>
    </FilterBar>
  );

  const cohortSel = COHORTS[cohort][1];
  const m1Gap = cohort > 0 && cohortSel.length > 1 ? cohortSel[1] - COHORTS[0][1][1] : null;

  return (
    <div ref={ref} className={`db${on ? " is-on" : ""}`}>
      <Topbar title="Growth overview" tabs={["Overview", "Funnel", "Cohorts", "Accounts"]} tab={tab} onTab={setTab} alerts={alerts} onRead={read} search={query} onSearch={searching} about={SAAS_ABOUT} />

      {tab === "Overview" && (
        <div className="db-page" key="overview">
          {context}
          <div className="db-kpis">
            {kpis.map((c, i) => (
              <article key={c.label} className="db-card db-kpi" style={{ "--i": i } as React.CSSProperties}>
                <header><span>{c.label}<small>{c.sub}</small></span><Chip icon={c.icon} /></header>
                <strong><Count to={c.to} on={on} format={c.f} /></strong>
                <Delta value={c.d} down={c.down} note={c.vs} dir={c.dir} />
              </article>
            ))}
          </div>

          <div className="db-row db-row-2">
            <article className="db-card db-chart">
              <header>
                <div><span className="db-label">MRR by month, {range(CHART_FROM, N - 1)}</span><strong className="db-big db-big-sm">{sel === null ? `Highlighted: ${now}` : `Filtered to ${mLong(end)}`}</strong></div>
                <span className="db-pill"><CalendarBlank size={13} /> Click a month</span>
              </header>
              <Bars data={bars} selected={sel} onSelect={setSel} on={on} highlight={sel === null ? inPeriod : undefined} label="MRR by month. Click a month to filter the report to it." />
            </article>

            <article className="db-card db-moves">
              <header><div><span className="db-label">MRR movement, {now}</span><strong className="db-big">{signed(netNew, k)} net</strong></div></header>
              <ul>
                {moves.map(([l, v], i) => (
                  <li key={l} className={v < 0 ? "is-neg" : undefined} style={{ "--v": Math.abs(v) / maxMove, "--i": i } as React.CSSProperties}>
                    <span className="db-move-top"><span>{l}</span><b>{signed(v, k)}</b></span><span className="db-move-bar"><i /></span>
                  </li>
                ))}
              </ul>
              <p className="db-hint"><Lightning size={13} weight="fill" /> {expSum > churnSum ? "Expansion outweighs churn: existing customers grow revenue on their own." : "Churn still outweighs expansion: retention is the lever."} Quick ratio {quick === null ? "n/a (nothing lost)" : quick.toFixed(1)}.</p>
            </article>
          </div>
        </div>
      )}

      {tab === "Funnel" && (
        <div className="db-page" key="funnel">
          {context}
          <div className="db-row db-row-2">
            <article className="db-card db-funnel">
              <header><div><span className="db-label">Trial to paid, trials started {now}</span><strong className="db-big">{pct(share(paidN))} of trials pay</strong></div></header>
              {FUNNEL.map(([l, v, n], i) => (
                <button key={l} type="button" className={`db-stage${stage === i ? " is-sel" : ""}`} style={{ "--v": v / 100, "--i": i } as React.CSSProperties} aria-pressed={stage === i} onClick={() => setStage(i)}>
                  <span className="db-stage-top"><span>{l}</span><b>{n.toLocaleString("en-US")} · <Count to={v} on={on} format={pct} /></b></span>
                  <span className="db-track"><i /></span>
                </button>
              ))}
              <p className="db-hint"><Lightning size={13} weight="fill" /> {FUNNEL[stage][3]}</p>
            </article>
            <div className="db-stack">
              <article className="db-card db-kpi">
                <header><span>CAC payback<small>{now}, CAC {cac === null ? "n/a" : k(cac)}</small></span><Chip icon={Clock} /></header>
                <strong><Count to={pb ?? 0} on={on} format={(n) => (pb === null ? "n/a" : `${n.toFixed(1)} mo`)} /></strong>
                {pbDiff === null
                  ? <span className="db-note">No new MRR to compare</span>
                  : <Delta value={`${Math.abs(pbDiff).toFixed(1)} mo`} down={pbDiff < 0} dir={arrow(pbDiff < 0)} note={`${pbDiff >= 0 ? "faster" : "slower"} vs ${before}`} />}
              </article>
              <article className="db-card db-kpi">
                <header><span>Paying customers<small>end of {mShort(end)}, ARPA {cust ? `$${Math.round(mrr / cust)}` : "n/a"}</small></span><Chip icon={UsersThree} /></header>
                <strong><Count to={cust} on={on} format={(n) => Math.round(n).toLocaleString("en-US")} /></strong>
                <Delta value={`${Math.abs(custDiff)}`} down={custDiff < 0} dir={arrow(custDiff >= 0)} note={`vs end of ${mShort(pEnd)}`} />
              </article>
            </div>
          </div>
        </div>
      )}

      {tab === "Cohorts" && (
        <div className="db-page" key="cohorts">
          <article className="db-card">
            <header><div><span className="db-label">Customers still paying, by first paid month (2026). Not filtered by period.</span><strong className="db-big">Logo retention by cohort</strong></div><span className="db-pill">M0 = first paid month</span></header>
            <div className="db-cohorts" aria-label="Cohort retention. Pick a cohort to compare.">
              <div className="db-cohort-row is-head" aria-hidden="true"><span>Cohort</span>{["M0", "M1", "M2", "M3", "M4", "M5"].map((m) => <span key={m}>{m}</span>)}</div>
              {COHORTS.map(([name, vals], r) => (
                <button key={name} type="button" className={`db-cohort-row${cohort === r ? " is-sel" : ""}`} aria-pressed={cohort === r} onClick={() => setCohort(r)}>
                  <span>{name}</span>
                  {Array.from({ length: 6 }, (_, c) => vals[c] === undefined
                    ? <i key={c} className="is-empty" />
                    : <i key={c} style={{ "--a": (vals[c] - 84) / 16 } as React.CSSProperties}>{vals[c]}%</i>)}
                </button>
              ))}
            </div>
            <p className="db-hint"><Lightning size={13} weight="fill" /> {COHORTS[cohort][0]} 2026 cohort: {cohortSel.length > 1
              ? `${cohortSel.at(-1)}% still paying after ${cohortSel.length - 1} ${cohortSel.length - 1 === 1 ? "month" : "months"}${m1Gap === null ? "" : m1Gap > 0 ? `, ${m1Gap} pts better in month one than April` : m1Gap < 0 ? `, ${-m1Gap} pts worse in month one than April` : ", level with April in month one"}.`
              : "first month still in progress, so there is no retention to read yet."}</p>
          </article>
        </div>
      )}

      {tab === "Accounts" && (
        <div className="db-page" key="accounts">
          <article className="db-card">
            <header><div><span className="db-label">Accounts to act on this week</span><strong className="db-big">{accounts.length} of {ACCOUNTS.length}{query && <span className="db-note"> matching “{query}”</span>}</strong></div>
              <div className="db-sorts">
                <button type="button" className={sort.key === "health" ? "is-on" : undefined} onClick={() => sortBy("health")}>Health {sort.key === "health" ? (sort.dir === 1 ? "↑" : "↓") : ""}</button>
                <button type="button" className={sort.key === "mrr" ? "is-on" : undefined} onClick={() => sortBy("mrr")}>MRR {sort.key === "mrr" ? (sort.dir === -1 ? "↓" : "↑") : ""}</button>
              </div>
            </header>
            <div className="db-table" role="table">
              {accounts.map((a) => (
                <div key={a.name} className="db-tr" role="row">
                  <span className="db-mono" aria-hidden="true">{a.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}</span>
                  <span className="db-who" role="cell"><b>{a.name}</b><small>{a.signal}</small></span>
                  <span className="db-amt" role="cell">{k(a.mrr)}<small>MRR</small></span>
                  <span className="db-health" role="cell" style={{ "--v": a.health / 100 } as React.CSSProperties}><i /><b>{a.health}</b></span>
                  <span className={`db-status ${a.health < 50 ? "is-high" : a.health < 70 ? "is-mid" : "is-ok"}`} role="cell">{a.health < 50 ? "At risk" : a.health < 70 ? "Watch" : "Healthy"}</span>
                </div>
              ))}
              {!accounts.length && <p className="db-pop-empty">No account matches “{query}”.</p>}
            </div>
          </article>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── CFO ───────────────────────── */

const CURRENCIES = ["GBP", "USD", "EUR", "NGN"] as const;
type Currency = typeof CURRENCIES[number];
// Illustrative conversion rates for the synthetic demo, not live FX. The books are kept in GBP.
const RATE: Record<Currency, number> = { GBP: 1, USD: 1.27, EUR: 1.17, NGN: 2000 };
const SYM: Record<Currency, string> = { GBP: "£", USD: "$", EUR: "€", NGN: "₦" };
/** Amount already in the chosen currency, scaled to k, m or bn. */
const scaled = (v: number, sym: string, d = 2) => { const a = Math.abs(v), sign = v < 0 ? "-" : ""; return a >= 1e9 ? `${sign}${sym}${(a / 1e9).toFixed(d)}bn` : a >= 1e6 ? `${sign}${sym}${(a / 1e6).toFixed(d)}m` : `${sign}${sym}${(a / 1e3).toFixed(1)}k`; };
const daysIn = (i: number) => new Date(Date.UTC(yr(i), mon(i) + 1, 0)).getUTCDate();

// 24 months of synthetic finance history in GBP, same calendar as the growth board.
// Cash only moves by net burn, and net burn is rebuilt from the P&L:
//   net burn = -EBITDA + capex + rise in receivables - rise in payables
// so closing cash, burn, the P&L, DSO and DPO all reconcile.
type FinMonth = { cash: number; burn: number; gross: number; rev: number; revB: number; cogs: number; gm: number; gmB: number; opex: number; opexB: number; capex: number; ar: number; ap: number };
const FIN: FinMonth[] = (() => {
  const base = Array.from({ length: N }, (_, i) => {
    const t = i / (N - 1);
    const burn = Math.round(158000 - 64000 * t + 6000 * Math.sin(i * 1.7));
    const rev = Math.round(182000 + 148000 * t + 5000 * Math.sin(i * 1.1));
    const gm = Math.round(rev * (0.69 + 0.05 * t));
    return { t, burn, rev, gm, cogs: rev - gm };
  });
  // Per-day amount over the 3 months to i, for DSO and DPO.
  const perDay = (i: number, f: (m: typeof base[number]) => number) => { let s = 0, d = 0; for (let j = Math.max(0, i - 2); j <= i; j++) { s += f(base[j]); d += daysIn(j); } return s / d; };
  const ar = base.map((m, i) => Math.round((53 - 11 * m.t) * perDay(i, (x) => x.rev)));
  const ap = base.map((m, i) => Math.round((34 - 4 * m.t) * perDay(i, (x) => x.cogs + 0.4 * (x.gm + x.burn))));
  const cash: number[] = new Array(N);
  cash[N - 1] = 1_420_000;
  for (let i = N - 1; i > 0; i--) cash[i - 1] = cash[i] + base[i].burn;
  return base.map((m, i) => {
    const capex = Math.round(4000 + 1500 * Math.sin(i * 0.7));
    const dAr = i ? ar[i] - ar[i - 1] : 0, dAp = i ? ap[i] - ap[i - 1] : 0;
    const opex = m.gm + m.burn - capex - dAr + dAp;
    return {
      cash: cash[i], burn: m.burn, rev: m.rev, cogs: m.cogs, gm: m.gm, opex, capex, ar: ar[i], ap: ap[i],
      gross: m.cogs + opex + capex - dAp, // all cash paid out; net burn = this minus cash collected (revenue - rise in receivables)
      revB: Math.round(m.rev * (1 + 0.035 * Math.sin(i * 0.8 + 1))),
      gmB: Math.round(m.gm * (1 + 0.03 * Math.sin(i * 0.8 + 1.4))),
      opexB: Math.round(opex * (1 - 0.025 * Math.cos(i * 0.9))),
    };
  });
})();
const finSum = (a: number, b: number, f: (m: FinMonth) => number) => { let t = 0; for (let i = Math.max(0, a); i <= b; i++) t += f(FIN[i]); return t; };
const days3 = (i: number) => { let d = 0; for (let j = Math.max(0, i - 2); j <= i; j++) d += daysIn(j); return d; };
/** Receivables at month end ÷ revenue over the 3 months to then × days in those months. */
const dsoAt = (i: number) => { const r = finSum(i - 2, i, (m) => m.rev); return r > 0 ? (FIN[i].ar / r) * days3(i) : 0; };
/** Payables at month end ÷ supplier spend (COGS and the 40% of operating costs that is not payroll) over 3 months × days. */
const dpoAt = (i: number) => { const c = finSum(i - 2, i, (m) => m.cogs + 0.4 * m.opex); return c > 0 ? (FIN[i].ap / c) * days3(i) : 0; };
/** Average monthly net burn over the 3 months to i. */
const avgBurn = (i: number) => finSum(i - 2, i, (m) => m.burn) / Math.min(3, i + 1);

const FIN_PERIODS = ["Month", "Quarter", "YTD"] as const;
type FinPeriod = typeof FIN_PERIODS[number];

const SCENARIOS = ["Base", "Upside", "Downside"] as const;
type Scenario = typeof SCENARIOS[number];
const SCEN: Record<Scenario, { burn: number; timing: number; note: string; collections: string; renewals: string }> = {
  Base: { burn: 1, timing: 1, note: "Current plan", collections: "94% on time", renewals: "On schedule" },
  Upside: { burn: 0.85, timing: 1, note: "Collections improve", collections: "97% on time", renewals: "On schedule" },
  Downside: { burn: 1.3, timing: 0.7, note: "Two renewals slip", collections: "88% on time", renewals: "Two slip a quarter" },
};
// Weekly cash timing around the average burn: collections land early in the
// month, payroll in the last week. Sums to zero over the 13 weeks.
const FC_TIMING = [0.6, -0.2, 0.9, -1.4, 0.5, -0.1, 0.8, -1.5, 0.6, -0.2, 0.9, -1.4, 0.5];
const CASH_NOW = FIN[N - 1].cash;
const WEEKLY_BURN = (avgBurn(N - 1) * 12) / 52;
const FORECAST: Record<Scenario, number[]> = Object.fromEntries(SCENARIOS.map((s) => {
  let c = CASH_NOW;
  return [s, FC_TIMING.map((t) => (c = c - WEEKLY_BURN * SCEN[s].burn + WEEKLY_BURN * t * SCEN[s].timing))];
})) as Record<Scenario, number[]>;
const CASH_FLOOR = 1_100_000; // GBP, the minimum balance the board has agreed
const FC_MAX = 1_600_000;
const DOWN_BREACH = FORECAST.Downside.findIndex((v) => v < CASH_FLOOR);

// Share of receivables by days past due, 30 Sep 2026.
const AGING: Array<[string, number, string]> = [["Current", 60, "#2f6b3a"], ["1-30 days", 21, "#90d26f"], ["31-60 days", 11, "#e8c53a"], ["61+ days", 8, "#e0623a"]];
const AR_TOTAL = FIN[N - 1].ar; // GBP, 30 Sep 2026

type Invoice = { id: string; customer: string; amount: number; days: number };
// The largest open invoices (a subset of receivables). Days = days past due.
const INVOICES: Invoice[] = [
  { id: "INV-2041", customer: "Atlas Freight", amount: 24800, days: 64 },
  { id: "INV-2056", customer: "Juniper Health", amount: 18200, days: 41 },
  { id: "INV-2063", customer: "Velocity HQ", amount: 12600, days: 33 },
  { id: "INV-2071", customer: "Monument Co.", amount: 9400, days: 18 },
  { id: "INV-2078", customer: "Horizon Labs", amount: 15900, days: 9 },
  { id: "INV-2084", customer: "Northwind Labs", amount: 5300, days: 0 },
];
const bucketOf = (days: number) => (days > 60 ? 3 : days > 30 ? 2 : days > 0 ? 1 : 0);

const CLOSE_TASKS = ["Bank reconciliations", "Revenue recognition", "Accruals posted", "Intercompany cleared", "Variance review", "Board pack signed off"];

const SEP = FIN[N - 1];
const SEP_OPEX_VAR = SEP.opexB ? ((SEP.opexB - SEP.opex) / SEP.opexB) * 100 : 0;

const CFO_ABOUT: About = {
  question: "How much cash do we have, how long does it last, are we on budget, and who owes us money?",
  built: [
    "Bank feeds, billing and the ledger reconciled every morning",
    "Actuals against budget, line by line, with no spreadsheet copy",
    "Aging worked out from invoice dates, not exported reports",
    "A 13-week cash forecast with scenarios finance can switch",
  ],
  defs: [
    ["Closing cash", "Bank balances at the last day of the month, after reconciliation."],
    ["Net burn", "Fall in cash over the period: cash paid out minus cash collected. Equals -EBITDA + capex + rise in receivables - rise in payables."],
    ["Gross burn", "All cash paid out in the period (suppliers, payroll, capex), before any cash collected."],
    ["Runway", "Closing cash / average monthly net burn over the last 3 months. Shown as n/a when the business is cash generative."],
    ["Gross profit and margin", "Revenue minus cost of sales (hosting, support, payment fees). Margin = gross profit / revenue."],
    ["EBITDA", "Gross profit minus operating costs, before interest, tax, depreciation and amortisation."],
    ["Variance to budget", "Signed so + is favourable: revenue and profit above budget, costs below. % of the budget figure."],
    ["DSO", "Receivables at month end / revenue for the 3 months to then x days in those months."],
    ["DPO", "Payables at month end / supplier spend (cost of sales and non-payroll costs) for 3 months x days."],
    ["Aging", "Receivables by days past the invoice due date: current (not yet due), 1-30, 31-60, 61+."],
    ["Currency", "Books are kept in GBP. Other currencies translate every figure at one fixed illustrative rate (USD 1.27, EUR 1.17, NGN 2,000 per GBP), so trends are not FX effects."],
    ["Periods", "Quarter = the 3 months to the selected month. YTD compares with the same months of the year before."],
  ],
  sources: "Sources: bank feeds, billing and accounting. Synthetic data in GBP, as of 1 Oct 2026 (September closed), refreshed daily.",
};

export function CFOBoard() {
  const [ref, on] = useInView<HTMLDivElement>();
  const [tab, setTab] = useState("Overview");
  const [cur, setCur] = useState<Currency>("GBP");
  const [period, setPeriod] = useState<FinPeriod>("Quarter");
  const [sel, setSel] = useState<number | null>(null); // month picked on the cash chart
  const [scen, setScen] = useState<Scenario>("Base");
  const [week, setWeek] = useState<number | null>(null);
  const [bucket, setBucket] = useState<number | null>(null);
  const [hidden, setHidden] = useState(false);
  const [chased, setChased] = useState<Record<string, boolean>>({});
  const [done, setDone] = useState<boolean[]>([true, true, true, false, false, false]);
  const [toast, say] = useToast();
  const [alerts, read] = useAlerts([
    { id: "c1", title: "Atlas Freight invoice is 64 days overdue", when: "Today, 08:40" },
    { id: "c2", title: DOWN_BREACH >= 0 ? `Week ${DOWN_BREACH + 1} dips below the cash floor in Downside` : "Downside stays above the cash floor", when: "Yesterday" },
    { id: "c3", title: `September opex ${Math.abs(SEP_OPEX_VAR).toFixed(1)}% ${SEP_OPEX_VAR >= 0 ? "under" : "over"} budget`, when: "2 Oct" },
  ]);

  const rate = RATE[cur], sym = SYM[cur];
  const money = (n: number) => scaled(n * rate, sym);

  // The window the report describes, and the window it is compared with.
  const end = sel === null ? N - 1 : CHART_FROM + sel;
  const ytdStart = end - mon(end); // January of the same year
  const start = sel !== null ? end : period === "Month" ? end : period === "Quarter" ? end - 2 : ytdStart;
  const isYtd = sel === null && period === "YTD";
  const pEnd = isYtd ? end - 12 : start - 1;
  const pStart = isYtd ? start - 12 : pEnd - (end - start);
  const now = range(start, end), before = range(pStart, pEnd);

  const cashNow = FIN[end].cash, cashPrev = FIN[pEnd].cash;
  const burnNow = finSum(start, end, (m) => m.burn), burnPrev = finSum(pStart, pEnd, (m) => m.burn);
  const grossNow = finSum(start, end, (m) => m.gross);
  const runwayOf = (i: number) => { const b = avgBurn(i); return b > 0 ? FIN[i].cash / b : null; };
  const runway = runwayOf(end), runwayPrev = runwayOf(pEnd);
  const dso = Math.round(dsoAt(end)), dsoPrev = Math.round(dsoAt(pEnd));

  const kpis = [
    { label: "Closing cash", sub: `at end of ${mShort(end)}`, icon: CurrencyDollar, to: cashNow * rate, f: (n: number) => hidden ? `${sym}••••` : scaled(n, sym), d: pctAbs(cashNow, cashPrev), down: cashNow < cashPrev, dir: (cashNow < cashPrev ? "down" : "up") as "up" | "down", vs: `vs end of ${mShort(pEnd)}` },
    { label: "Runway", sub: `cash / avg net burn, 3 mo to ${mShort(end)}`, icon: Clock, to: runway ?? 0, f: (n: number) => (runway === null ? "Cash generative" : `${n.toFixed(1)} mo`), d: runway !== null && runwayPrev !== null ? `${Math.abs(runway - runwayPrev).toFixed(1)} mo` : "n/a", down: runway !== null && runwayPrev !== null && runway < runwayPrev, dir: (runway !== null && runwayPrev !== null && runway < runwayPrev ? "down" : "up") as "up" | "down", vs: `vs ${mShort(pEnd)}` },
    { label: "Net burn", sub: `${now}, gross ${money(grossNow)}`, icon: TrendUp, to: burnNow * rate, f: (n: number) => scaled(n, sym, 1), d: pctAbs(burnNow, burnPrev), down: burnNow > burnPrev, dir: (burnNow < burnPrev ? "down" : "up") as "up" | "down", vs: burnNow <= burnPrev ? `lower vs ${before}` : `higher vs ${before}` },
    { label: "Days to get paid", sub: `DSO, 3 mo to ${mShort(end)}`, icon: Receipt, to: dso, f: (n: number) => `${Math.round(n)} days`, d: `${Math.abs(dso - dsoPrev)} ${Math.abs(dso - dsoPrev) === 1 ? "day" : "days"}`, down: dso > dsoPrev, dir: (dso < dsoPrev ? "down" : "up") as "up" | "down", vs: dso <= dsoPrev ? `faster vs ${mShort(pEnd)}` : `slower vs ${mShort(pEnd)}` },
  ];

  // P&L against budget for the window. Favourable: revenue and profit above, costs below.
  const gmPct = (a: number, b: number) => { const r = finSum(a, b, (m) => m.rev); return r ? (finSum(a, b, (m) => m.gm) / r) * 100 : 0; };
  const pl: Array<[string, number, number, boolean]> = [
    ["Revenue", finSum(start, end, (m) => m.rev), finSum(start, end, (m) => m.revB), true],
    [`Gross profit (${gmPct(start, end).toFixed(0)}% margin)`, finSum(start, end, (m) => m.gm), finSum(start, end, (m) => m.gmB), true],
    ["Operating costs", finSum(start, end, (m) => m.opex), finSum(start, end, (m) => m.opexB), false],
    ["EBITDA", finSum(start, end, (m) => m.gm - m.opex), finSum(start, end, (m) => m.gmB - m.opexB), true],
  ];

  const cashBars: BarDatum[] = FIN.slice(CHART_FROM).map((m, i) => ({ key: mShort(CHART_FROM + i), label: MN[mon(CHART_FROM + i)], h: m.cash / FIN[CHART_FROM].cash, tip: money(m.cash), tipLabel: `Cash, end of ${mLong(CHART_FROM + i)}` }));
  const inWindow = (i: number) => CHART_FROM + i >= start && CHART_FROM + i <= end;

  const s = SCEN[scen];
  const fc = FORECAST[scen];
  const weeks: BarDatum[] = fc.map((v, i) => ({ key: `W${i + 1}`, label: `W${i + 1}`, h: Math.max(0, v) / FC_MAX, tip: money(v), tipLabel: `Week ${i + 1}${v < CASH_FLOOR ? " · below floor" : ""}` }));
  const lowest = fc.reduce((lo, v, i) => (v < fc[lo] ? i : lo), 0);
  const belowFloor = fc.filter((v) => v < CASH_FLOOR).length;
  const scenBurn = avgBurn(N - 1) * s.burn;
  const scenRunway = scenBurn > 0 ? CASH_NOW / scenBurn : null;

  const overdueBuckets = AGING.slice(1).reduce((t, [, p]) => t + p, 0);
  const overdue = (AR_TOTAL * overdueBuckets) / 100;
  const invoices = INVOICES.filter((iv) => bucket === null ? iv.days > 0 : bucketOf(iv.days) === bucket);
  const progress = done.filter(Boolean).length;

  const fxNote = cur === "GBP" ? null : <> · GBP books at a fixed illustrative rate</>;
  const context = (
    <FilterBar>
      <Slicer label="Period" options={FIN_PERIODS} value={period} onChange={(p) => { setPeriod(p); setSel(null); }} />
      {sel !== null && <FilterChip label={mLong(end)} onClear={() => setSel(null)} />}
      <Slicer label="Currency" options={CURRENCIES} value={cur} onChange={setCur} className="is-small" />
      <p className="db-context"><b>{now}</b> compared with <b>{before}</b>{fxNote}</p>
    </FilterBar>
  );

  return (
    <div ref={ref} className={`db${on ? " is-on" : ""}`}>
      <Topbar title="Cash & control" tabs={["Overview", "Cash forecast", "Receivables", "Close"]} tab={tab} onTab={setTab} alerts={alerts} onRead={read} about={CFO_ABOUT} />

      {tab === "Overview" && (
        <div className="db-page" key="overview">
          {context}
          <div className="db-kpis">
            {kpis.map((c, i) => (
              <article key={c.label} className={`db-card db-kpi${i === 0 ? " db-kpi-cash" : ""}`} style={{ "--i": i } as React.CSSProperties}>
                <header>
                  <span>{c.label}<small>{c.sub}</small></span>
                  {i === 0
                    ? <button type="button" className="db-eye" aria-pressed={hidden} aria-label={hidden ? "Show balance" : "Hide balance"} onClick={() => setHidden((h) => !h)}>{hidden ? <EyeSlash size={15} /> : <Eye size={15} />}</button>
                    : <Chip icon={c.icon} />}
                </header>
                <strong><Count to={c.to} on={on} format={c.f} /></strong>
                {/* Arrow shows which way the number moved; colour shows whether that is good. */}
                <Delta value={c.d} down={c.down} note={c.vs} dir={c.dir} />
              </article>
            ))}
          </div>

          <div className="db-row db-row-2">
            <article className="db-card db-chart">
              <header>
                <div><span className="db-label">Cash at month end, {range(CHART_FROM, N - 1)}</span><strong className="db-big db-big-sm">{sel === null ? `Highlighted: ${now}` : `Filtered to ${mLong(end)}`}</strong></div>
                <button type="button" className="db-pill db-pill-btn" onClick={() => say(`Board pack exported in ${cur} (synthetic data)`)}><ArrowUpRight size={13} /> Export</button>
              </header>
              <Bars data={cashBars} selected={sel} onSelect={setSel} on={on} highlight={sel === null ? inWindow : undefined} label="Cash at the end of each month. Click a month to filter the report to it." />
            </article>

            <article className="db-card db-pl">
              <header><div><span className="db-label">Actual vs budget, {now}</span><strong className="db-big db-big-sm">Profit and loss</strong></div><span className="db-pl-key"><i /> Budget · + favourable</span></header>
              <ul>
                {pl.map(([label, actual, budget, upGood]) => {
                  // Variance against budget, signed so that + is always better.
                  const diff = upGood ? actual - budget : budget - actual;
                  const v = budget ? diff / Math.abs(budget) : null;
                  const good = diff >= 0;
                  const big = Math.max(1, Math.abs(actual), Math.abs(budget));
                  return (
                    <li key={label} className={good ? "is-good" : "is-bad"} title={`Budget ${money(budget)}, ${good ? "favourable" : "adverse"} by ${money(Math.abs(diff))}`}>
                      <span className="db-pl-top"><span>{label}</span><b>{money(actual)}</b><span className="db-pl-var">{v === null ? "n/a" : `${good ? "+" : "-"}${Math.abs(v * 100).toFixed(1)}%`}</span></span>
                      <span className="db-pl-bar" style={{ "--a": Math.abs(actual) / big, "--b": Math.abs(budget) / big } as React.CSSProperties}><i /><em /></span>
                    </li>
                  );
                })}
              </ul>
            </article>
          </div>
        </div>
      )}

      {tab === "Cash forecast" && (
        <div className="db-page" key="forecast">
          <FilterBar>
            <Slicer label="Scenario" options={SCENARIOS} value={scen} onChange={setScen} />
            <Slicer label="Currency" options={CURRENCIES} value={cur} onChange={setCur} className="is-small" />
            <p className="db-context"><b>13 weeks from 1 Oct 2026</b>, opening cash {money(CASH_NOW)} · {s.note}</p>
          </FilterBar>
          <article className="db-card db-chart db-forecast">
            <header>
              <div><span className="db-label">Weekly closing cash, {scen.toLowerCase()} case</span><strong className="db-big">{week === null ? `Lowest: ${weeks[lowest].tip} in week ${lowest + 1}` : `Week ${week + 1}: ${weeks[week].tip}`}</strong></div>
              <span className={`db-status ${belowFloor ? "is-high" : "is-ok"}`}>{belowFloor ? `${belowFloor} ${belowFloor === 1 ? "week" : "weeks"} below the ${money(CASH_FLOOR)} floor` : `Above the ${money(CASH_FLOOR)} floor`}</span>
            </header>
            <div className="db-floor-wrap" style={{ "--floor": CASH_FLOOR / FC_MAX } as React.CSSProperties}>
              <Bars data={weeks} selected={week} onSelect={setWeek} on={on} weeks label="Weekly cash forecast. Click a week to select it." />
              <span className="db-floor" aria-hidden="true"><em>Cash floor</em></span>
            </div>
            <ul className="db-assume">
              <li><span>Collections</span><b>{s.collections}</b></li>
              <li><span>Monthly net burn</span><b>{money(scenBurn)}</b></li>
              <li><span>Runway</span><b>{scenRunway === null ? "Cash generative" : `${scenRunway.toFixed(1)} months`}</b></li>
            </ul>
          </article>
        </div>
      )}

      {tab === "Receivables" && (
        <div className="db-page" key="receivables">
          <div className="db-aging-tiles" role="group" aria-label="Receivables by days past due. Pick one to filter the invoices.">
            {AGING.map(([l, p, c], i) => (
              <button key={l} type="button" aria-pressed={bucket === i} className={bucket !== null && bucket !== i ? "is-dim" : undefined} style={{ "--c": c, "--p": p / 100 } as React.CSSProperties} onClick={() => setBucket(bucket === i ? null : i)}>
                <span>{l}</span><b>{money(AR_TOTAL * p / 100)}</b><i /><small>{p}% of {money(AR_TOTAL)}</small>
              </button>
            ))}
          </div>
          <article className="db-card">
            <header>
              <div><span className="db-label">Largest open invoices, 30 Sep 2026 · DSO {Math.round(dsoAt(N - 1))} days, DPO {Math.round(dpoAt(N - 1))} days</span><strong className="db-big db-big-sm">{bucket === null ? `${money(overdue)} overdue in total` : `${AGING[bucket][0]}: ${invoices.length} of the largest ${invoices.length === 1 ? "invoice" : "invoices"}`}</strong></div>
              {bucket !== null && <FilterChip label={AGING[bucket][0]} onClear={() => setBucket(null)} />}
            </header>
            <div className="db-table" role="table">
              {invoices.map((iv) => (
                <div key={iv.id} className="db-tr is-inv" role="row">
                  <span className="db-who" role="cell"><b>{iv.customer}</b><small>{iv.id}</small></span>
                  <span className="db-amt" role="cell">{money(iv.amount)}<small>{iv.days ? `${iv.days} days overdue` : "Not due yet"}</small></span>
                  <span className={`db-status ${iv.days > 60 ? "is-high" : iv.days > 30 ? "is-mid" : "is-ok"}`} role="cell">{AGING[bucketOf(iv.days)][0]}</span>
                  {iv.days > 0 ? (
                    <button type="button" className={`db-btn${chased[iv.id] ? " is-done" : " db-btn-dark"}`} disabled={chased[iv.id]} onClick={() => { setChased((c) => ({ ...c, [iv.id]: true })); say(`Reminder queued for ${iv.customer}`); }}>
                      {chased[iv.id] ? <><Check size={13} weight="bold" /> Chased</> : "Chase"}
                    </button>
                  ) : <span className="db-note" role="cell">Nothing to do</span>}
                </div>
              ))}
              {!invoices.length && <p className="db-pop-empty"><Check size={13} weight="bold" /> None of the largest invoices sit in this bucket.</p>}
            </div>
          </article>
        </div>
      )}

      {tab === "Close" && (
        <div className="db-page" key="close">
          <article className="db-card">
            <header><div><span className="db-label">Month-end close, September 2026</span><strong className="db-big">{progress} of {CLOSE_TASKS.length} done</strong></div><span className="db-pill">{progress === CLOSE_TASKS.length ? "Ready to sign" : `${CLOSE_TASKS.length - progress} to go`}</span></header>
            <div className="db-progress" style={{ "--v": progress / CLOSE_TASKS.length } as React.CSSProperties}><i /></div>
            <ul className="db-checks">
              {CLOSE_TASKS.map((t, i) => (
                <li key={t}>
                  <button type="button" role="checkbox" aria-checked={done[i]} className={done[i] ? "is-done" : undefined} onClick={() => setDone((d) => d.map((x, j) => (j === i ? !x : x)))}>
                    <span className="db-box" aria-hidden="true">{done[i] && <Check size={12} weight="bold" />}</span>{t}
                  </button>
                </li>
              ))}
            </ul>
          </article>
        </div>
      )}

      {toast}
    </div>
  );
}
