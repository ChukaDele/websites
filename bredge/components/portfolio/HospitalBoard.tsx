"use client";

import { useMemo, useState } from "react";
import { Bed, ChartLineUp, Clock, CurrencyDollar, Flask, HandCoins, Heartbeat, Lightning, Receipt, ShieldCheck, Siren, UsersThree, Virus, Warning } from "@phosphor-icons/react";
import { Bars, Chip, Count, Delta, FilterChip, Slicer, Topbar, useAlerts, useInView, type About, type BarDatum } from "../landing/Dashboards";
import { hospitalMeta } from "./meta";
import { FilterBar } from "../landing/PhoneFilters";

/**
 * MedCore HMIS Performance, rebuilt from the original Power BI report.
 * Five report pages (overview, clinical, billing, beds, staffing and
 * pharmacy). A department picked on the overview or billing page filters the
 * KPIs on both pages. Hover tooltips, sortable tables, clickable donuts and
 * slicers throughout. Synthetic data.
 *
 * Exact figures are the ones printed on the original. Monthly trends were
 * read off its charts by eye, so they only shape the charts and appear as
 * "about" in tooltips. Insurer and supplier names are anonymised.
 */

// Defined in ./meta so the Work page can list this board without loading it.
export { hospitalMeta };

const ABOUT: About = {
  question: "How many patients do we admit and bill, are we getting paid, are beds used well, and do we have the staff and drugs to match?",
  built: [
    "Admissions, diagnoses, tests and billing joined on one patient stay",
    "Bed-days and occupancy worked out ward by ward",
    "Insurance and patient shares split on every bill",
    "Rosters, prescriptions and supplier contracts in the same model",
    "One admissions total used as the base for every share on every page",
  ],
  sources: "Synthetic data, modelled on a hospital information system (HMIS): no real patients and no PHI. Insurer and supplier names anonymised. Full year, USD. Length of stay is the mean of discharge date minus admission date; stays are right-skewed, so a live build would show the median beside it. In this synthetic source, admissions, beds and rosters do not tie out with each other (admissions times stay exceeds the available bed-days), so each figure is shown as its own table reports it and no cross-table ratio is derived. 30-day readmissions, ED door-to-provider time, claim denials and AR ageing are not in this source, so they are not shown or estimated.",
};

/* ───────────── data (printed on the original unless marked "about") ───────────── */

type Dept = { name: string; adm: number; rev: number; los: number };
const DEPTS: Dept[] = [
  { name: "Surgery", adm: 10.1, rev: 377.22, los: 4.7 },
  { name: "Emergency", adm: 8.8, rev: 329.74, los: 4.7 },
  { name: "Pediatrics", adm: 8.4, rev: 315.71, los: 4.7 },
  { name: "Internal Medicine", adm: 7.7, rev: 289.57, los: 4.7 },
  { name: "Orthopedics", adm: 5.9, rev: 222.59, los: 4.7 },
  { name: "ICU", adm: 4.0, rev: 149.43, los: 10.0 },
];
// One admissions base (thousands): the disease-category total, the most precise printed split.
// Department and age bars are printed to 0.1K, so they add to 44.9K; shares always use this base.
const ALL_ADM = 45.01, ALL_REV = 1684.26; // $M billed
const INS_COVERED = 976.88, PATIENT_PAYABLE = 707.37, PENDING = 851.21; // $M, printed
const PAID = ALL_REV - PENDING;
const PENDING_PCT = (PENDING / ALL_REV) * 100;
// Simple days in AR: what is still owed, divided by average billing per day.
const DAYS_AR = PENDING / (ALL_REV / 365);

const MN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MN_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
// About: read off the original charts, then scaled so the months add up to the printed full-year totals.
const fit = (xs: number[], total: number) => xs.map((v) => v * total / xs.reduce((t, x) => t + x, 0));
const REV_M = fit([142, 131, 144, 139, 143, 137.5, 143.5, 143.5, 143, 142.5, 136, 141], ALL_REV);
const ADM_M = fit([3700, 3480, 3790, 3640, 3770, 3630, 3750, 3650, 3680, 3740, 3620, 3720], ALL_ADM * 1000);
const TESTS_M = [5300, 4850, 5470, 5250, 5410, 5190, 5510, 5320, 5310, 5380, 5050, 5280];
const ALL_TESTS = TESTS_M.reduce((t, x) => t + x, 0);

const AGES: Array<[string, number]> = [["0-17", 8.7], ["18-34", 8.4], ["35-50", 7.9], ["51-65", 7.2], ["66-79", 7.0], ["80+", 5.7]];

const CATEGORIES: Array<[string, number]> = [
  ["Infectious", 11.25], ["Surgical", 6.71], ["Respiratory", 4.56], ["Cardiac", 4.53], ["Pediatric", 4.44], ["Neurological", 2.30],
  ["Orthopedic", 2.29], ["Trauma", 2.25], ["Renal", 2.25], ["Hematological", 2.24], ["Endocrine", 2.19],
];

type Disease = { name: string; adm: number; los: number; bill: number };
const DISEASES: Disease[] = [
  { name: "Sepsis", adm: 2297, los: 5.2, bill: 87288027 },
  { name: "Fracture Femur", adm: 2288, los: 5.2, bill: 86777176 },
  { name: "Stroke", adm: 2300, los: 5.1, bill: 86402857 },
  { name: "Acute Myocardial Infarction", adm: 2282, los: 5.2, bill: 85805029 },
  { name: "Gallstones", adm: 2271, los: 5.1, bill: 85327245 },
  { name: "Urinary Tract Infection", adm: 2259, los: 5.2, bill: 85290589 },
  { name: "Acute Respiratory Distress", adm: 2275, los: 5.1, bill: 84782758 },
  { name: "Chronic Obstructive Pulmonary Disease", adm: 2289, los: 5.1, bill: 84411416 },
  { name: "Road Traffic Accident", adm: 2253, los: 5.3, bill: 84384780 },
  { name: "Tuberculosis", adm: 2256, los: 5.1, bill: 84337845 },
];

type Test = { name: string; runs: number; abn: number };
const TESTS: Test[] = [
  { name: "X-Ray Chest", runs: 3478, abn: 50 },
  { name: "Ultrasound Abdomen", runs: 3492, abn: 52 },
  { name: "MRI Spine", runs: 3473, abn: 50 },
  { name: "Liver Function Test", runs: 3508, abn: 50 },
  { name: "Lipid Profile", runs: 3506, abn: 50 },
  { name: "Kidney Function Test", runs: 3563, abn: 49 },
  { name: "CT Scan Brain", runs: 3557, abn: 50 },
  { name: "Complete Blood Count", runs: 3600, abn: 51 },
  { name: "Blood Sugar", runs: 3457, abn: 50 },
];

const CHARGES: Array<[string, number]> = [["Room", 1163], ["Procedure", 205], ["Test", 62], ["Drug", 50]];
const CHARGE_TOTAL = CHARGES.reduce((t, [, v]) => t + v, 0);

// Insurers, anonymised, in the original's order (total covered, highest first).
type Insurer = { name: string; policies: number; cov: number; covered: number };
const INSURERS: Insurer[] = ([
  [445, 70, 8684036], [460, 69, 8590904], [456, 70, 7924689], [448, 70, 7879842], [459, 70, 7850698], [431, 70, 7822659],
  [435, 70, 7765716], [407, 70, 7746192], [425, 70, 7742339], [469, 70, 7669669], [458, 70, 7652345], [431, 71, 7632594],
  [408, 70, 7618571], [446, 70, 7616578], [454, 69, 7526509], [456, 71, 7514501], [444, 70, 7505656],
] as const).map(([policies, cov, covered], i) => ({ name: `Insurer ${String.fromCharCode(65 + i)}`, policies, cov, covered }));

const WARD_TYPES = [
  { name: "General", turn: 61, los: 4.7 },
  { name: "Private", turn: 22, los: 4.7 },
  { name: "Semi-Private", turn: 16, los: 4.7 },
  { name: "ICU", turn: 10, los: 10.0 },
];

type Ward = { name: string; beds: number; occ: number };
const WARDS: Ward[] = [
  { name: "Surgery Ward 2", beds: 20, occ: 23 }, { name: "Surgery Ward 1", beds: 20, occ: 23 }, { name: "Internal Medicine Ward 5", beds: 20, occ: 23 },
  { name: "Surgery Ward 3", beds: 20, occ: 23 }, { name: "Pediatrics Ward 2", beds: 20, occ: 23 }, { name: "Emergency Ward 4", beds: 20, occ: 24 },
  { name: "Emergency Ward 5", beds: 20, occ: 24 }, { name: "Orthopedics Ward 3", beds: 20, occ: 24 }, { name: "Emergency Ward 3", beds: 10, occ: 25 },
  { name: "Surgery Ward 5", beds: 15, occ: 25 }, { name: "Internal Medicine Ward 1", beds: 10, occ: 26 }, { name: "Orthopedics Ward 2", beds: 15, occ: 26 },
];

const DOCTORS: Array<[string, number]> = [
  ["Neurology", 709], ["Cardiology", 683], ["ICU", 631], ["General Medicine", 589], ["Pediatrics", 574],
  ["Nephrology", 528], ["Orthopedics", 444], ["Pulmonology", 436], ["Surgery", 257],
];
const SHIFTS = [
  { key: "Night", v: 19629, color: "#1f3a2c" },
  { key: "Evening", v: 16879, color: "#3fbf96" },
  { key: "Morning", v: 15344, color: "#c6f0a8" },
];
const RX: Array<[string, number]> = [
  ["Analgesic", 11903], ["Antacid", 10273], ["Antibiotic", 9226], ["Steroid", 8931],
  ["Vitamin", 8481], ["Antidiabetic", 8203], ["Antihypertensive", 8185], ["Antipyretic", 7907],
];
// Drug suppliers, anonymised, in the original's order.
const SUPPLIERS = ([
  ["UK", "Active"], ["India", "Expired"], ["Switzerland", "Active"], ["India", "Expired"], ["UK", "Active"], ["Switzerland", "Active"],
  ["USA", "Expired"], ["Germany", "Expired"], ["UK", "Expired"], ["Germany", "Expired"], ["India", "Active"], ["UK", "Expired"],
  ["USA", "Expired"], ["UK", "Expired"], ["Switzerland", "Expired"], ["Germany", "Expired"],
] as const).map(([country, contract], i) => ({ name: `Supplier ${String.fromCharCode(65 + i)}`, country, contract }));

/* ───────────── formatting ───────────── */

const int = (n: number) => Math.round(n).toLocaleString("en-US");
const pct1 = (n: number) => `${n.toFixed(1)}%`;
const usdMil = (n: number) => (n >= 1000 ? `$${(n / 1000).toFixed(2)}bn` : `$${n.toFixed(2)}M`);

/* ───────────── visuals ───────────── */

type HBar = { key: string; label: string; value: number; shown: string; tip?: string };

/** Horizontal bars with a hover tooltip and click-to-filter. */
function HBars({ items, max, selected, onSelect, on, label, dense = false }: { items: HBar[]; max: number; selected: string | null; onSelect: (k: string | null) => void; on: boolean; label: string; dense?: boolean }) {
  const [hover, setHover] = useState<string | null>(null);
  return (
    <div className={`pc-hm-hbars${selected ? " has-sel" : ""}${dense ? " is-dense" : ""}`} role="group" aria-label={label} onMouseLeave={() => setHover(null)}>
      {items.map((d, i) => (
        <button
          key={d.key}
          type="button"
          className={`pc-hm-hbar${selected === d.key ? " is-sel" : ""}`}
          style={{ "--v": on ? d.value / max : 0, "--i": i } as React.CSSProperties}
          aria-pressed={selected === d.key}
          aria-label={`${d.label}: ${d.shown}${d.tip ? `. ${d.tip}` : ""}`}
          onMouseEnter={() => setHover(d.key)}
          onFocus={() => setHover(d.key)}
          onBlur={() => setHover(null)}
          onClick={() => onSelect(selected === d.key ? null : d.key)}
        >
          <span className="pc-hm-hbar-l">{d.label}</span>
          <span className="pc-hm-hbar-t"><i /></span>
          <b>{d.shown}</b>
          {hover === d.key && d.tip && <span className="pc-hm-tip" aria-hidden="true">{d.tip}</span>}
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
  const focus = hover ?? selected;
  return (
    <div className="pc-hm-donut">
      <div className="db-donut-wrap">
        <svg className="db-donut" viewBox="0 0 140 140" aria-hidden="true">
          <circle className="db-donut-bg" cx="70" cy="70" r="56" pathLength={100} />
          {slices.map((s, i) => {
            const p = (s.value / total) * 100;
            const len = on ? Math.max(p - 0.8, 0.2) : 0;
            return (
              <circle
                key={s.key}
                cx="70" cy="70" r="56" pathLength={100}
                stroke={s.color}
                strokeDasharray={`${len} ${100 - len}`}
                strokeDashoffset={-starts[i]}
                className={focus && focus !== s.key ? "is-dim" : undefined}
                onMouseEnter={() => setHover(s.key)}
                onMouseLeave={() => setHover(null)}
                onClick={() => onSelect(selected === s.key ? null : s.key)}
              />
            );
          })}
        </svg>
        <div className="db-donut-mid">{center(focus)}</div>
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

type Series = { name: string; values: number[]; min: number; max: number; cls: string; area?: boolean };

const smooth = (pts: Array<[number, number]>) => pts.reduce((d, p, i, a) => {
  if (i === 0) return `M${p[0]},${p[1]}`;
  const p0 = a[i - 2] ?? a[i - 1], p1 = a[i - 1], p3 = a[i + 1] ?? p;
  const c1 = [p1[0] + (p[0] - p0[0]) / 6, p1[1] + (p[1] - p0[1]) / 6];
  const c2 = [p[0] - (p3[0] - p1[0]) / 6, p[1] - (p3[1] - p1[1]) / 6];
  return `${d} C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${p[0]},${p[1]}`;
}, "");

/** Monthly trend, each series on its own scale, with a hover guide and tooltip. */
function Trend({ series, ticks, tip, on, label, small = false }: { series: Series[]; ticks: Array<[number, string]>; tip: (i: number) => string[]; on: boolean; label: string; small?: boolean }) {
  const [hover, setHover] = useState<number | null>(null);
  const n = MN.length;
  const x = (i: number) => (i / (n - 1)) * 100;
  const y = (v: number, s: Series) => 100 - ((v - s.min) / (s.max - s.min)) * 100;
  return (
    <div className={`pc-hm-trend${on ? " is-on" : ""}${small ? " is-small" : ""}`} role="group" aria-label={label} onMouseLeave={() => setHover(null)}>
      <div className="pc-hm-plot">
        {ticks.map(([v, l]) => <span key={l} className="pc-hm-grid" style={{ top: `${y(v, series[0])}%` }}><em>{l}</em></span>)}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {series.map((s) => {
            const line = smooth(s.values.map((v, i) => [x(i), y(v, s)]));
            return <g key={s.name} className={s.cls}>{s.area && <path className="pc-hm-area" d={`${line} L100,100 L0,100 Z`} />}<path className="pc-hm-line" d={line} /></g>;
          })}
        </svg>
        {hover !== null && (
          <>
            <span className="pc-hm-guide" style={{ left: `${x(hover)}%` }} />
            {series.map((s) => <span key={s.name} className={`pc-hm-dot ${s.cls}`} style={{ left: `${x(hover)}%`, top: `${y(s.values[hover], s)}%` }} />)}
            <span className={`pc-hm-tip pc-hm-tip-trend${hover > n - 4 ? " is-end" : hover < 3 ? " is-start" : ""}`} style={{ left: `${x(hover)}%` }}>
              <small>{tip(hover)[0]}</small>{tip(hover).slice(1).map((t) => <span key={t}>{t}</span>)}
            </span>
          </>
        )}
        {MN.map((m, i) => (
          <button key={m} type="button" className="pc-hm-hit" style={{ left: `${x(i)}%`, width: `${100 / (n - 1)}%` }} aria-label={tip(i).join(", ")} onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} onBlur={() => setHover(null)} onClick={() => setHover(i)} />
        ))}
      </div>
      <div className="pc-hm-x" aria-hidden="true">{MN.map((m, i) => <span key={m} style={{ left: `${x(i)}%` }}>{m}</span>)}</div>
    </div>
  );
}

/** Sort buttons for a card header. */
function Sorts<K extends string>({ keys, labels, sort, onSort, label }: { keys: readonly K[]; labels: Record<K, string>; sort: { key: K; dir: 1 | -1 }; onSort: (k: K) => void; label: string }) {
  return (
    <div className="db-sorts" role="group" aria-label={label}>
      {keys.map((k) => (
        <button key={k} type="button" className={sort.key === k ? "is-on" : undefined} aria-pressed={sort.key === k} onClick={() => onSort(k)}>
          {labels[k]}{sort.key === k ? (sort.dir === -1 ? " ↓" : " ↑") : ""}
        </button>
      ))}
    </div>
  );
}

function useSort<K extends string>(initial: K) {
  const [sort, setSort] = useState<{ key: K; dir: 1 | -1 }>({ key: initial, dir: -1 });
  const by = (key: K) => setSort((s) => ({ key, dir: s.key === key ? (s.dir === 1 ? -1 : 1) : -1 }));
  return [sort, by] as const;
}

/* ───────────── board ───────────── */

const TABS = ["Overview", "Clinical", "Billing", "Beds", "Staff & pharmacy"] as const;
const MEASURES = ["Admissions", "Revenue", "Avg stay"] as const;
type Measure = typeof MEASURES[number];

export function HospitalBoard() {
  const [ref, on] = useInView<HTMLDivElement>();
  const [tab, setTab] = useState<string>("Overview");
  const [dept, setDept] = useState<string | null>(null); // shared by Overview and Billing
  const [measure, setMeasure] = useState<Measure>("Admissions");
  const [age, setAge] = useState<number | null>(null);
  const [clin, setClin] = useState<"Categories" | "Top diseases">("Categories");
  const [category, setCategory] = useState<string | null>(null);
  const [dSort, dSortBy] = useSort<"adm" | "los" | "bill">("bill");
  const [tSort, tSortBy] = useSort<"runs" | "abn">("runs");
  const [test, setTest] = useState<string | null>(null);
  const [billBy, setBillBy] = useState<"Department" | "Charge type">("Department");
  const [charge, setCharge] = useState<string | null>(null);
  const [pay, setPay] = useState<string | null>(null);
  const [iSort, iSortBy] = useSort<"covered" | "policies" | "cov">("covered");
  const [allIns, setAllIns] = useState(false);
  const [wardBy, setWardBy] = useState<"Bed turnover" | "Length of stay">("Bed turnover");
  const [wtype, setWtype] = useState<string | null>(null);
  const [wSort, wSortBy] = useSort<"occ" | "beds">("occ");
  const [doc, setDoc] = useState<string | null>(null);
  const [shift, setShift] = useState<string | null>(null);
  const [rx, setRx] = useState<string | null>(null);
  const [contract, setContract] = useState<"All" | "Active" | "Expired">("Active");
  const [alerts, read] = useAlerts([
    { id: "h1", title: "February admissions were the lowest of the year", when: "Today, 08:05" },
    { id: "h2", title: `Pending payments stand at $${PENDING.toFixed(2)}M`, when: "Yesterday" },
    { id: "h3", title: "11 of 16 drug supplier contracts have expired", when: "Mon" },
  ]);

  const d = DEPTS.find((x) => x.name === dept) ?? null;
  const deptChip = d && <FilterChip label={d.name} onClear={() => setDept(null)} />;

  /* Overview */
  const kpis = [
    { label: "Admissions", sub: d ? `${d.name}, full year` : "full year, all departments", icon: UsersThree, to: d ? d.adm : ALL_ADM, f: (n: number) => `${n.toFixed(1)}K`, delta: d ? null : { v: "18.3%", down: false, vs: "vs prior year" }, note: d ? `${pct1((d.adm / ALL_ADM) * 100)} of all admissions` : "" },
    { label: "Revenue billed", sub: d ? `${d.name}, full year` : "full year, all departments", icon: CurrencyDollar, to: d ? d.rev : ALL_REV, f: usdMil, delta: d ? null : { v: "18.1%", down: false, vs: "vs prior year" }, note: d ? `${pct1((d.rev / ALL_REV) * 100)} of all billing` : "" },
    { label: "Avg length of stay", sub: d ? `${d.name}, full year` : "full year, all departments", icon: Clock, to: d ? d.los : 5.2, f: (n: number) => `${n.toFixed(1)} days`, delta: null, note: d ? "Mean; vs 5.2 days hospital-wide" : "Mean, admission to discharge. Flat vs prior year" },
    { label: "Bed occupancy", sub: d ? "all wards, not split by department" : "full year, all wards, as reported", icon: Bed, to: 25.37, f: (n: number) => `${n.toFixed(2)}%`, delta: { v: "0.1 pts", down: false, vs: "vs prior year" }, note: "" },
  ];
  const deptBars: HBar[] = [...DEPTS]
    .sort((a, b) => (measure === "Avg stay" ? b.los - a.los : 0))
    .map((x) => {
      const v = measure === "Admissions" ? x.adm : measure === "Revenue" ? x.rev : x.los;
      return {
        key: x.name, label: x.name, value: v,
        shown: measure === "Admissions" ? `${x.adm}K` : measure === "Revenue" ? `$${Math.round(x.rev)}M` : `${x.los.toFixed(1)}d`,
        tip: measure === "Admissions" ? `${pct1((x.adm / ALL_ADM) * 100)} of admissions` : measure === "Revenue" ? `${usdMil(x.rev)} · ${pct1((x.rev / ALL_REV) * 100)} of billing` : `${x.los.toFixed(1)} days on average`,
      };
    });
  const deptMax = Math.max(...deptBars.map((b) => b.value));
  const ageBars: BarDatum[] = AGES.map(([l, v]) => ({ key: l, label: l, h: v / 9, tip: `${v}K admissions, ${pct1((v / ALL_ADM) * 100)}`, tipLabel: `Ages ${l}` }));

  /* Clinical */
  const diseases = useMemo(() => [...DISEASES].sort((a, b) => (a[dSort.key] - b[dSort.key]) * dSort.dir), [dSort]);
  const tests = useMemo(() => [...TESTS].sort((a, b) => (a[tSort.key] - b[tSort.key]) * tSort.dir), [tSort]);
  const testSel = TESTS.find((t) => t.name === test);
  const catSel = CATEGORIES.find(([c]) => c === category);

  /* Billing */
  const INS_REGISTER = INSURERS.reduce((t, x) => t + x.covered, 0);
  const insurers = useMemo(() => [...INSURERS].sort((a, b) => (a[iSort.key] - b[iSort.key]) * iSort.dir), [iSort]);
  const billBars: HBar[] = billBy === "Department"
    ? DEPTS.map((x) => ({ key: x.name, label: x.name, value: x.rev, shown: `$${Math.round(x.rev)}M`, tip: `${usdMil(x.rev)} · ${pct1((x.rev / ALL_REV) * 100)} of billing` }))
    : CHARGES.map(([l, v]) => ({ key: l, label: l, value: v, shown: `$${v}M`, tip: `${pct1((v / CHARGE_TOTAL) * 100)} of itemised charges` }));
  const chargeSel = CHARGES.find(([c]) => c === charge);

  /* Beds */
  const wards = useMemo(() => [...WARDS].sort((a, b) => (a[wSort.key] - b[wSort.key]) * wSort.dir), [wSort]);
  const wtSel = WARD_TYPES.find((w) => w.name === wtype);

  /* Staff & pharmacy */
  const docTotal = DOCTORS.reduce((t, [, v]) => t + v, 0);
  const rxTotal = RX.reduce((t, [, v]) => t + v, 0);
  const shiftTotal = SHIFTS.reduce((t, s) => t + s.v, 0);
  const suppliers = SUPPLIERS.filter((s) => contract === "All" || s.contract === contract);
  const expired = SUPPLIERS.filter((s) => s.contract === "Expired").length;

  const context = (
    <p className="db-context"><b>Full year</b> compared with <b>prior year</b></p>
  );

  return (
    <div ref={ref} className={`db pc-hm${on ? " is-on" : ""}`}>
      <Topbar title="MedCore HMIS" tabs={TABS} tab={tab} onTab={setTab} alerts={alerts} onRead={read} about={ABOUT} />

      {tab === "Overview" && (
        <div className="db-page" key="overview">
          <FilterBar>
            <Slicer label="Department measure" options={MEASURES} value={measure} onChange={setMeasure} />
            {deptChip}
            {context}
          </FilterBar>
          <div className="db-kpis">
            {kpis.map((c, i) => (
              <article key={c.label} className="db-card db-kpi" style={{ "--i": i } as React.CSSProperties}>
                <header><span>{c.label}<small>{c.sub}</small></span><Chip icon={c.icon} /></header>
                <strong><Count to={c.to} on={on} format={c.f} /></strong>
                {c.delta ? <Delta value={c.delta.v} down={c.delta.down} note={c.delta.vs} /> : <span className="db-note">{c.note}</span>}
              </article>
            ))}
          </div>
          <div className="db-row db-row-2">
            <article className="db-card">
              <header>
                <div><span className="db-label">Revenue and admissions by month, all departments</span><strong className="db-big db-big-sm">February is the one clear dip</strong></div>
                <span className="pc-hm-key"><i className="is-rev" />Revenue<i className="is-adm" />Admissions</span>
              </header>
              <Trend
                on={on}
                label="Revenue and admissions by month. Hover a month to read it."
                ticks={[[130, "$130M"], [140, "$140M"], [150, "$150M"]]}
                series={[
                  { name: "Revenue", values: REV_M, min: 125, max: 150, cls: "is-rev", area: true },
                  { name: "Admissions", values: ADM_M, min: 3400, max: 3950, cls: "is-adm" },
                ]}
                tip={(i) => [MN_LONG[i], `Revenue about $${Math.round(REV_M[i])}M`, `About ${(ADM_M[i] / 1000).toFixed(1)}K admissions`]}
              />
              <p className="db-hint"><Lightning size={13} weight="fill" /> Revenue tracks admissions month by month: billing per stay is steady, so volume drives income.</p>
            </article>
            <div className="db-stack">
              <article className="db-card">
                <header><div><span className="db-label">{measure === "Avg stay" ? "Average length of stay" : measure} by department</span><strong className="db-big db-big-sm">{d ? `Filtered to ${d.name}` : measure === "Avg stay" ? "ICU stays run twice as long" : "Surgery leads"}</strong></div></header>
                <HBars items={deptBars} max={deptMax} selected={dept} onSelect={setDept} on={on} label="Departments. Click one to filter the KPIs to it." />
              </article>
              <article className="db-card pc-hm-ages">
                <header><div><span className="db-label">Admissions by age group</span><strong className="db-big db-big-sm">{age === null ? "Children are the largest group" : `Ages ${AGES[age][0]}: ${pct1((AGES[age][1] / ALL_ADM) * 100)} of admissions`}</strong></div></header>
                <Bars data={ageBars} selected={age} onSelect={setAge} on={on} label="Admissions by age group. Click a group to select it." />
              </article>
            </div>
          </div>
        </div>
      )}

      {tab === "Clinical" && (
        <div className="db-page" key="clinical">
          <FilterBar>
            <Slicer label="Left panel" options={["Categories", "Top diseases"] as const} value={clin} onChange={setClin} />
            {category && <FilterChip label={category} onClear={() => setCategory(null)} />}
            {test && <FilterChip label={test} onClear={() => setTest(null)} />}
            <p className="db-context"><b>Full year</b>, all departments</p>
          </FilterBar>
          <div className="db-kpis">
            {[
              { label: "Diseases treated", sub: "distinct diagnoses, full year", icon: Virus, to: 20, f: (n: number) => `${Math.round(n)}`, note: "Across 11 disease categories" },
              { label: "Tests per admission", sub: "tests run / admissions, full year", icon: Flask, to: ALL_TESTS / (ALL_ADM * 1000), f: (n: number) => n.toFixed(2), note: `${(ALL_TESTS / 1000).toFixed(1)}K tests over ${ALL_ADM.toFixed(1)}K stays` },
              { label: "Abnormal results", sub: "share of tests, full year", icon: Heartbeat, to: 50.3, f: (n: number) => `${n.toFixed(2)}%`, note: "About one test in two" },
              { label: "Emergency admissions", sub: "admission type, all departments", icon: Siren, to: 40.17, f: (n: number) => `${n.toFixed(2)}%`, note: "Unplanned arrivals; the Emergency department is a separate cut" },
            ].map((c, i) => (
              <article key={c.label} className="db-card db-kpi" style={{ "--i": i } as React.CSSProperties}>
                <header><span>{c.label}<small>{c.sub}</small></span><Chip icon={c.icon} /></header>
                <strong><Count to={c.to} on={on} format={c.f} /></strong>
                <span className="db-note">{c.note}</span>
              </article>
            ))}
          </div>
          <div className="db-row pc-hm-row-even">
            {clin === "Categories" ? (
              <article className="db-card">
                <header><div><span className="db-label">Admissions by disease category</span><strong className="db-big db-big-sm">{catSel ? `${catSel[0]}: ${pct1((catSel[1] / ALL_ADM) * 100)} of admissions` : "Infectious disease is a quarter of admissions"}</strong></div></header>
                <HBars items={CATEGORIES.map(([l, v]) => ({ key: l, label: l, value: v, shown: `${v.toFixed(2)}K`, tip: `${pct1((v / ALL_ADM) * 100)} of admissions` }))} max={11.25} selected={category} onSelect={setCategory} on={on} dense label="Admissions by disease category. Click a category to select it." />
              </article>
            ) : (
              <article className="db-card">
                <header>
                  <div><span className="db-label">{`Top 10 of 20 diseases, ${(DISEASES.reduce((t, x) => t + x.adm, 0) / 1000).toFixed(1)}K of ${ALL_ADM.toFixed(1)}K admissions`}</span><strong className="db-big db-big-sm">Stays run 5.1 to 5.3 days for all ten</strong></div>
                  <Sorts keys={["bill", "adm", "los"] as const} labels={{ bill: "Billing", adm: "Admits", los: "Stay" }} sort={dSort} onSort={dSortBy} label="Sort diseases" />
                </header>
                <div className="pc-hm-table" role="group" aria-label="Top diseases">
                  <div className="pc-hm-tr is-dis is-head"><span>Disease</span><span>Admits</span><span>Stay</span><span>Billing</span></div>
                  {diseases.map((x) => (
                    <div key={x.name} className="pc-hm-tr is-dis">
                      <span className="pc-hm-name" title={x.name}>{x.name}</span>
                      <span>{int(x.adm)}</span>
                      <span>{x.los.toFixed(1)}d</span>
                      <span>${(x.bill / 1e6).toFixed(2)}M</span>
                    </div>
                  ))}
                </div>
              </article>
            )}
            <article className="db-card">
              <header>
                <div><span className="db-label">{`Diagnostic tests, ${TESTS.length} types shown (${(TESTS.reduce((t, x) => t + x.runs, 0) / 1000).toFixed(1)}K of ${(ALL_TESTS / 1000).toFixed(1)}K runs)`}</span><strong className="db-big db-big-sm">{testSel ? `${testSel.name}: ${testSel.abn}% abnormal of ${int(testSel.runs)}` : "No test stands out"}</strong></div>
                <Sorts keys={["runs", "abn"] as const} labels={{ runs: "Runs", abn: "Abnormal" }} sort={tSort} onSort={tSortBy} label="Sort tests" />
              </header>
              <div className="pc-hm-table" role="group" aria-label="Diagnostic tests. Click a test to select it.">
                {tests.map((t) => (
                  <button key={t.name} type="button" aria-pressed={test === t.name} className={`pc-hm-tr is-test${test === t.name ? " is-sel" : ""}${test && test !== t.name ? " is-dim" : ""}`} onClick={() => setTest(test === t.name ? null : t.name)}>
                    <span className="pc-hm-name">{t.name}</span>
                    <span>{int(t.runs)}</span>
                    <span className="pc-hm-split" style={{ "--v": t.abn / 100 } as React.CSSProperties}><i /><b>{t.abn}%</b></span>
                  </button>
                ))}
              </div>
              <span className="db-label pc-hm-sublabel">Tests run per month</span>
              <Trend
                small
                on={on}
                label="Diagnostic tests run per month. Hover a month to read it."
                ticks={[]}
                series={[{ name: "Tests", values: TESTS_M, min: 4700, max: 5600, cls: "is-rev", area: true }]}
                tip={(i) => [MN_LONG[i], `About ${(TESTS_M[i] / 1000).toFixed(1)}K tests`]}
              />
            </article>
          </div>
        </div>
      )}

      {tab === "Billing" && (
        <div className="db-page" key="billing">
          <FilterBar>
            <Slicer label="Billing breakdown" options={["Department", "Charge type"] as const} value={billBy} onChange={(v) => { setBillBy(v); setCharge(null); }} />
            {deptChip}
            {context}
          </FilterBar>
          <div className="db-kpis">
            {[
              { label: "Total billed", sub: d ? `${d.name}, full year` : "full year, all departments", icon: Receipt, to: d ? d.rev : ALL_REV, delta: d ? null : "18.1%", bad: false, note: d ? `${pct1((d.rev / ALL_REV) * 100)} of all billing` : "" },
              { label: "Insurance covered", sub: `all departments, ${pct1((INS_COVERED / ALL_REV) * 100)} of billed`, icon: ShieldCheck, to: INS_COVERED, delta: "18.2%", bad: false, note: "" },
              { label: "Patient payable", sub: `all departments, ${pct1((PATIENT_PAYABLE / ALL_REV) * 100)} of billed`, icon: HandCoins, to: PATIENT_PAYABLE, delta: "18.1%", bad: false, note: "" },
              { label: "Pending payment", sub: `unpaid at year end, about ${Math.round(DAYS_AR)} days of billing`, icon: Warning, to: PENDING, delta: "18.1%", bad: true, note: "" },
            ].map((c, i) => (
              <article key={c.label} className="db-card db-kpi" style={{ "--i": i } as React.CSSProperties}>
                <header><span>{c.label}<small>{c.sub}</small></span><Chip icon={c.icon} /></header>
                <strong><Count to={c.to} on={on} format={usdMil} /></strong>
                {c.delta ? <Delta value={c.delta} down={c.bad} note={c.bad ? "higher vs prior year" : "vs prior year"} /> : <span className="db-note">{c.note}</span>}
              </article>
            ))}
          </div>
          <div className="db-row db-row-2">
            <article className="db-card">
              <header><div><span className="db-label">{billBy === "Department" ? "Billing by department" : "Billing by charge type"}</span>
                <strong className="db-big db-big-sm">{billBy === "Department" ? (d ? `Filtered to ${d.name}` : "Surgery bills the most") : chargeSel ? `${chargeSel[0]}: $${chargeSel[1]}M` : "Room charges dominate the bill"}</strong></div></header>
              {billBy === "Department"
                ? <HBars items={billBars} max={Math.max(...DEPTS.map((x) => x.rev))} selected={dept} onSelect={setDept} on={on} label="Billing by department. Click one to filter the KPIs to it." />
                : <HBars items={billBars} max={Math.max(...CHARGES.map(([, v]) => v))} selected={charge} onSelect={setCharge} on={on} label="Billing by charge type. Click one to select it." />}
              {billBy === "Charge type" && <p className="db-hint"><Lightning size={13} weight="fill" /> {`Itemised charges add to $${CHARGE_TOTAL.toLocaleString("en-US")}M of $${Math.round(ALL_REV).toLocaleString("en-US")}M billed; the rest is not itemised by type in the source.`}</p>}
            </article>
            <article className="db-card">
              <header><div><span className="db-label">Payment status, share of amount billed</span><strong className="db-big db-big-sm">Half of billing is still unpaid</strong></div></header>
              <Donut
                on={on}
                label="Payment status. Pick a status to read it."
                slices={[{ key: "Pending", label: "Pending", value: PENDING_PCT, shown: `${PENDING_PCT.toFixed(2)}%`, color: "#c9cfc6" }, { key: "Paid", label: "Paid", value: 100 - PENDING_PCT, shown: `${(100 - PENDING_PCT).toFixed(2)}%`, color: "#3fbf96" }]}
                selected={pay}
                onSelect={setPay}
                center={(k) => k === "Paid" ? <><b>{usdMil(PAID)}</b><small>paid</small></> : <><b>{usdMil(PENDING)}</b><small>pending</small></>}
              />
              <p className="db-hint"><Lightning size={13} weight="fill" /> {`About ${Math.round(DAYS_AR)} days of billing is outstanding (simple days in AR). The source has no bill dates for ageing, so a live build adds 0-30, 31-60, 61-90 and 90+ day buckets.`}</p>
            </article>
          </div>
          <article className="db-card">
            <header>
              <div><span className="db-label">Insurers by amount covered, full year, register policies</span><strong className="db-big db-big-sm">Every insurer covers 69% to 71% of the bill</strong></div>
              <div className="pc-hm-head-tools">
                <Sorts keys={["covered", "policies", "cov"] as const} labels={{ covered: "Covered", policies: "Policies", cov: "Coverage" }} sort={iSort} onSort={iSortBy} label="Sort insurers" />
                <button type="button" className="db-pill db-pill-btn" aria-expanded={allIns} onClick={() => setAllIns((v) => !v)}>{allIns ? "Top 4" : `All ${INSURERS.length}`}</button>
              </div>
            </header>
            <div className={`pc-hm-table${allIns ? " is-all" : ""}`} role="group" aria-label="Insurers">
              <div className="pc-hm-tr is-ins is-head"><span>Insurer</span><span>Policies</span><span>Avg coverage</span><span>Total covered</span></div>
              {(allIns ? insurers : insurers.slice(0, 4)).map((x) => (
                <div key={x.name} className="pc-hm-tr is-ins">
                  <span className="pc-hm-name">{x.name}</span>
                  <span>{x.policies}</span>
                  <span>{x.cov}%</span>
                  <span>${int(x.covered)}</span>
                </div>
              ))}
            </div>
            <p className="db-hint"><Lightning size={13} weight="fill" /> {`These ${INSURERS.length} insurers' register policies cover $${(INS_REGISTER / 1e6).toFixed(1)}M. That is a narrower base than the $${INS_COVERED.toFixed(2)}M insurance share on all bills, and the source does not link the two.`}</p>
          </article>
        </div>
      )}

      {tab === "Beds" && (
        <div className="db-page" key="beds">
          <FilterBar>
            <Slicer label="Ward type measure" options={["Bed turnover", "Length of stay"] as const} value={wardBy} onChange={setWardBy} />
            {wtype && <FilterChip label={wtype} onClear={() => setWtype(null)} />}
            {context}
          </FilterBar>
          <div className="db-kpis">
            <article className="db-card db-kpi" style={{ "--i": 0 } as React.CSSProperties}>
              <header><span>Total beds<small>all wards, at year end</small></span><Chip icon={Bed} /></header>
              <strong><Count to={415} on={on} format={int} /></strong>
              <span className="db-note">Across surgery, medicine, emergency, ICU and more</span>
            </article>
            <article className="db-card db-kpi" style={{ "--i": 1 } as React.CSSProperties}>
              <header><span>Occupancy rate<small>full year, all wards, as reported</small></span><Chip icon={ChartLineUp} /></header>
              <strong><Count to={25.37} on={on} format={(n) => `${n.toFixed(2)}%`} /></strong>
              <Delta value="0.1 pts" note="vs prior year" />
            </article>
            <article className="db-card db-kpi" style={{ "--i": 2 } as React.CSSProperties}>
              <header><span>Highest-strain ward<small>full year, as flagged in the source</small></span><Chip icon={Warning} /></header>
              <strong>ICU Ward 3</strong>
              <span className="db-note">Not in the 12-ward table, which lists general wards</span>
            </article>
            <article className="db-card db-kpi" style={{ "--i": 3 } as React.CSSProperties}>
              <header><span>Avg stay, general wards<small>mean days, full year</small></span><Chip icon={Clock} /></header>
              <strong><Count to={4.66} on={on} format={(n) => `${n.toFixed(2)} days`} /></strong>
              <span className="db-note">vs 10.0 days in ICU</span>
            </article>
          </div>
          <div className="db-row pc-hm-row-even">
            <article className="db-card">
              <header><div><span className="db-label">{wardBy === "Bed turnover" ? "Admissions per bed, by ward type" : "Average length of stay, by ward type"}</span>
                <strong className="db-big db-big-sm">{wtSel ? `${wtSel.name}: ${wtSel.turn} admissions per bed, ${wtSel.los.toFixed(1)}-day stays` : wardBy === "Bed turnover" ? "General beds turn over fastest" : "ICU stays run twice as long"}</strong></div></header>
              <HBars
                items={[...WARD_TYPES].sort((a, b) => (wardBy === "Bed turnover" ? b.turn - a.turn : b.los - a.los)).map((w) => ({ key: w.name, label: w.name, value: wardBy === "Bed turnover" ? w.turn : w.los, shown: wardBy === "Bed turnover" ? `${w.turn}x` : `${w.los.toFixed(1)}d`, tip: `${w.turn} admissions per bed · ${w.los.toFixed(1)}-day stays` }))}
                max={Math.max(...WARD_TYPES.map((w) => (wardBy === "Bed turnover" ? w.turn : w.los)))}
                selected={wtype} onSelect={setWtype} on={on}
                label="Ward types. Click one to select it."
              />
              <p className="db-hint"><Lightning size={13} weight="fill" /> General beds take about six times as many admissions per bed as ICU beds. ICU stays running twice as long explains about 2x of that; the rest is ICU beds standing empty more often.</p>
            </article>
            <article className="db-card">
              <header>
                <div><span className="db-label">{`Ward capacity and occupancy, full year: ${WARDS.length} wards, ${WARDS.reduce((t, w) => t + w.beds, 0)} of 415 beds`}</span><strong className="db-big db-big-sm">Most wards sit at 23% to 26%</strong></div>
                <Sorts keys={["occ", "beds"] as const} labels={{ occ: "Occupancy", beds: "Beds" }} sort={wSort} onSort={wSortBy} label="Sort wards" />
              </header>
              <div className="pc-hm-table" role="group" aria-label="Ward capacity">
                <div className="pc-hm-tr is-ward is-head"><span>Ward</span><span>Beds</span><span>Occupancy</span></div>
                {wards.map((w) => (
                  <div key={w.name} className="pc-hm-tr is-ward">
                    <span className="pc-hm-name">{w.name}</span>
                    <span>{w.beds}</span>
                    <span className="pc-hm-occ" style={{ "--v": on ? w.occ / 30 : 0 } as React.CSSProperties}><i /><b>{w.occ}%</b></span>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </div>
      )}

      {tab === "Staff & pharmacy" && (
        <div className="db-page" key="staff">
          <FilterBar>
            <Slicer label="Supplier contracts" options={["Active", "Expired", "All"] as const} value={contract} onChange={setContract} />
            <p className="db-context"><b>Current roster</b> and <b>full-year prescriptions</b></p>
          </FilterBar>
          <div className="db-row db-row-2">
            <article className="db-card">
              <header><div><span className="db-label">Doctor records by specialisation, synthetic roster</span><strong className="db-big db-big-sm">{doc ? `${doc}: ${pct1(((DOCTORS.find(([x]) => x === doc)?.[1] ?? 0) / docTotal) * 100)} of ${int(docTotal)} doctors` : "Surgery has the fewest doctors"}</strong></div></header>
              <HBars items={DOCTORS.map(([l, v]) => ({ key: l, label: l, value: v, shown: int(v), tip: `${pct1((v / docTotal) * 100)} of doctors` }))} max={Math.max(...DOCTORS.map(([, v]) => v))} selected={doc} onSelect={setDoc} on={on} dense label="Doctors by specialisation. Click one to select it." />
            </article>
            <article className="db-card">
              <header><div><span className="db-label">Staff by shift, all wards</span><strong className="db-big db-big-sm">Nights carry the most staff</strong></div></header>
              <Donut
                on={on}
                label="Staff by shift. Pick a shift to read it."
                slices={SHIFTS.map((s) => ({ key: s.key, label: s.key, value: s.v, shown: int(s.v), color: s.color }))}
                selected={shift}
                onSelect={setShift}
                center={(k) => { const s = SHIFTS.find((x) => x.key === k); return s ? <><b>{pct1((s.v / shiftTotal) * 100)}</b><small>{s.key.toLowerCase()}</small></> : <><b>{int(shiftTotal)}</b><small>staff shifts</small></>; }}
              />
            </article>
          </div>
          <div className="db-row db-row-2">
            <article className="db-card">
              <header><div><span className="db-label">Prescriptions by drug category, full year</span><strong className="db-big db-big-sm">{rx ? `${rx}: ${pct1(((RX.find(([x]) => x === rx)?.[1] ?? 0) / rxTotal) * 100)} of prescriptions` : "Painkillers lead prescriptions"}</strong></div></header>
              <HBars items={RX.map(([l, v]) => ({ key: l, label: l, value: v, shown: int(v), tip: `${pct1((v / rxTotal) * 100)} of prescriptions` }))} max={Math.max(...RX.map(([, v]) => v))} selected={rx} onSelect={setRx} on={on} dense label="Prescriptions by drug category. Click one to select it." />
            </article>
            <article className="db-card">
              <header><div><span className="db-label">Drug suppliers, {contract === "All" ? "all contracts" : `${contract.toLowerCase()} contracts`}</span><strong className="db-big db-big-sm">{expired} of {SUPPLIERS.length} contracts have expired</strong></div></header>
              <div className="pc-hm-table" role="group" aria-label="Drug suppliers">
                {suppliers.map((s) => (
                  <div key={s.name} className="pc-hm-tr is-sup">
                    <span className="pc-hm-name">{s.name}</span>
                    <span>{s.country}</span>
                    <span className={`db-status ${s.contract === "Active" ? "is-ok" : "is-high"}`}>{s.contract}</span>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </div>
      )}
    </div>
  );
}
