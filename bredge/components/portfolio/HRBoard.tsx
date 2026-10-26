"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, CurrencyDollar, Lightning, SignOut, UserCheck, UsersThree, type Icon } from "@phosphor-icons/react";
import { useInView, Count, Delta, Chip, Slicer, Topbar, useAlerts, Bars, type BarDatum, FilterChip, type About } from "../landing/Dashboards";
import { hrMeta } from "./meta";
import { AllColumns, FilterBar } from "../landing/PhoneFilters";

/**
 * HR Analytics, rebuilt from a three-page Power BI report (Overview, Employee
 * details, Attrition) on a public HR sample dataset of 311 records.
 *
 * Names are removed: every person is an anonymous ID. So that the slicers can
 * filter for real, the board holds one row per person, rebuilt so that every
 * total the original prints matches exactly (headcount, status, department,
 * age band, race, marital status, gender, citizenship, leavers by gender,
 * reasons for leaving, average salary). How those attributes combine, and the
 * hire-year split, are a consistent reconstruction, not the source rows.
 */

// Defined in ./meta so the Work page can list this board without loading it.
export { hrMeta };

const ABOUT: About = {
  question: "How many people do we employ, how diverse is the workforce, and why do people leave?",
  built: [
    "One clean employee table: department, role, status and pay",
    "Breakdowns by gender, age, race, marital status and citizenship",
    "Attrition by hire year, with the reason each person left",
    "Names replaced with anonymous IDs before anything is shown",
    "Any group under 5 people shows as <5, and its rows and rates are hidden",
  ],
  sources: "Built on a public HR sample dataset; names removed. Headcount means active people at the data extract. Attrition here is leavers divided by everyone hired (cumulative); annualised attrition (leavers in a year divided by average headcount) needs leave dates the sample does not have. Voluntary vs involuntary is inferred from the reason: attendance, performance and conduct count as involuntary. Pay figures are descriptive and not adjusted for role, level or tenure, so they are not a pay-gap finding.",
};

/* ───────── printed totals ───────── */

const DEPTS = ["Production", "IT/IS", "Sales", "Software Engineering", "Admin Offices", "Executive Office"] as const;
type Dept = typeof DEPTS[number];
const DEPT_N: Record<Dept, number> = { Production: 209, "IT/IS": 50, Sales: 31, "Software Engineering": 11, "Admin Offices": 9, "Executive Office": 1 };
const BANDS = ["Under 30", "30-39", "40-49", "50-59", "60-74"] as const;
const BAND_N: Record<string, number> = { "40-49": 140, "50-59": 78, "30-39": 62, "60-74": 26, "Under 30": 5 };
const RACE_N: Record<string, number> = { White: 187, "Black or African American": 80, Asian: 29, "Two or more races": 11, "American Indian or Alaska Native": 3, Hispanic: 1 };
const MARITAL_N: Record<string, number> = { Single: 137, Married: 124, Divorced: 30, Separated: 12, Widowed: 8 };
const CITIZEN_N: Record<string, number> = { "US citizen": 295, "Eligible non-citizen": 12, "Non-citizen": 4 };
const REASON_N: Record<string, number> = {
  "Career move": 29, Dissatisfaction: 14, Attendance: 11, Compensation: 11, Availability: 8, Education: 5, Relocation: 5,
  Military: 4, Performance: 4, Retirement: 4, Family: 3, Medical: 3, Conduct: 2, Other: 1,
};
// Hire year: [hired, since left]. Fitted to the original's attrition curve (read by eye).
const YEARS: Record<number, [number, number]> = {
  2006: [4, 2], 2007: [6, 3], 2008: [20, 7], 2009: [11, 5], 2010: [20, 7],
  2011: [48, 34], 2012: [58, 23], 2013: [50, 9], 2014: [69, 9], 2015: [25, 5],
};
const YEAR_LIST = Object.keys(YEARS).map(Number);
const AVG_SALARY = 69000;

/* ───────── one row per person, anonymised ───────── */

type Emp = { id: string; role: string; dept: Dept; gender: "Women" | "Men"; age: number; band: string; race: string; marital: string; citizen: string; year: number; active: boolean; reason: string | null; salary: number };

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffle<T>(a: T[], r: () => number) {
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
const pool = (counts: Record<string, number>) => Object.entries(counts).flatMap(([k, n]) => Array<string>(n).fill(k));

// The ten highest-paid records as printed (role, department, gender, age, active, salary), names removed.
const TOP: Array<[string, Dept, "Women" | "Men", number, boolean, number]> = [
  ["President & CEO", "Executive Office", "Women", 72, true, 250000],
  ["CIO", "IT/IS", "Women", 47, true, 220450],
  ["Director of Sales", "Sales", "Women", 60, true, 180000],
  ["IT Director", "IT/IS", "Men", 46, true, 178000],
  ["Director of Operations", "Production", "Men", 43, true, 170500],
  ["IT Manager, Infrastructure", "IT/IS", "Men", 40, true, 157000],
  ["Data Architect", "IT/IS", "Women", 54, true, 150290],
  ["IT Manager, Databases", "IT/IS", "Men", 62, false, 148999],
  ["IT Manager, Databases", "IT/IS", "Men", 53, true, 140920],
  ["IT Manager, Support", "IT/IS", "Men", 56, true, 138888],
];
const ROLES: Record<Dept, Array<[string, number, number]>> = { // [role, base salary, weight]
  Production: [["Production Technician I", 56000, 0.55], ["Production Technician II", 64000, 0.37], ["Production Manager", 74000, 0.08]],
  "IT/IS": [["IT Support", 66000, 0.25], ["Network Engineer", 70000, 0.25], ["Data Analyst", 89000, 0.2], ["BI Developer", 96000, 0.15], ["Database Administrator", 108000, 0.15]],
  Sales: [["Area Sales Manager", 63000, 0.85], ["Sales Manager", 70000, 0.15]],
  "Software Engineering": [["Software Engineer", 98000, 0.8], ["Software Engineering Manager", 112000, 0.2]],
  "Admin Offices": [["Administrative Assistant", 52000, 0.45], ["Accountant", 66000, 0.35], ["Shared Services Manager", 90000, 0.2]],
  "Executive Office": [["President & CEO", 250000, 1]],
};
const bandOf = (age: number) => (age < 30 ? "Under 30" : age < 40 ? "30-39" : age < 50 ? "40-49" : age < 60 ? "50-59" : "60-74");
const AGE_FROM: Record<string, [number, number]> = { "Under 30": [26, 4], "30-39": [30, 10], "40-49": [40, 10], "50-59": [50, 10], "60-74": [60, 15] };

const EMPLOYEES: Emp[] = (() => {
  const r = rng(311);
  const take = <T,>(counts: Record<string, number>, used: string[]) => { const c = { ...counts }; used.forEach((u) => { c[u] -= 1; }); return shuffle(pool(c), r) as T[]; };
  const depts = take<Dept>(DEPT_N, TOP.map((x) => x[1]));
  const bands = take<string>(BAND_N, TOP.map((x) => bandOf(x[3])));
  const races = shuffle(pool(RACE_N), r), marital = shuffle(pool(MARITAL_N), r), citizen = shuffle(pool(CITIZEN_N), r);
  const reasons = shuffle(pool(REASON_N), r);
  // Leavers are 60 women and 44 men (58% / 42%); everyone else is active.
  const leftG = take<"Women" | "Men">({ Women: 60, Men: 44 }, TOP.filter((x) => !x[4]).map((x) => x[2]));
  const activeG = take<"Women" | "Men">({ Women: 116, Men: 91 }, TOP.filter((x) => x[4]).map((x) => x[2]));
  const leftY = shuffle(YEAR_LIST.flatMap((y) => Array<number>(YEARS[y][1]).fill(y)), r);
  const activeY = shuffle(YEAR_LIST.flatMap((y) => Array<number>(YEARS[y][0] - YEARS[y][1]).fill(y)), r);
  const status = shuffle([...Array<boolean>(207 - TOP.filter((x) => x[4]).length).fill(true), ...Array<boolean>(104 - TOP.filter((x) => !x[4]).length).fill(false)], r);
  const ids = shuffle(Array.from({ length: 311 }, (_, i) => 1001 + i), r);

  const out: Emp[] = [];
  for (let i = 0; i < 311; i++) {
    const fixed = TOP[i];
    const active = fixed ? fixed[4] : status[i - TOP.length];
    const dept = fixed ? fixed[1] : depts.pop()!;
    const band = fixed ? bandOf(fixed[3]) : bands.pop()!;
    const [a0, span] = AGE_FROM[band];
    let role = fixed?.[0] ?? "", salary = fixed?.[5] ?? 0;
    if (!fixed) {
      let pick = r(), k = 0;
      const roles = ROLES[dept];
      while (k < roles.length - 1 && pick > roles[k][2]) { pick -= roles[k][2]; k++; }
      role = roles[k][0];
      salary = roles[k][1] * (0.88 + 0.24 * r());
    }
    out.push({
      id: `EMP-${ids[i]}`, role, dept, band, salary, active,
      gender: fixed ? fixed[2] : (active ? activeG : leftG).pop()!,
      age: fixed ? fixed[3] : a0 + Math.floor(r() * span),
      race: races[i], marital: marital[i], citizen: citizen[i],
      year: (active ? activeY : leftY).pop()!,
      reason: active ? null : reasons.pop()!,
    });
  }
  // Scale everyone but the printed ten so the average lands on the printed $69K.
  const fixedSum = TOP.reduce((s, x) => s + x[5], 0);
  const restSum = out.slice(TOP.length).reduce((s, e) => s + e.salary, 0);
  const f = (AVG_SALARY * 311 - fixedSum) / restSum;
  out.slice(TOP.length).forEach((e) => { e.salary = Math.min(132000, Math.round(e.salary * f / 10) * 10); });
  return out;
})();

/* ───────── helpers ───────── */

type FacetKey = "gender" | "band" | "race" | "marital" | "citizen" | "reason";
type Facet = { k: FacetKey; v: string } | null;
const STATUS = ["All", "Active", "Left"] as const;
type Status = typeof STATUS[number];
const VIEWS = ["Gender", "Age", "Race", "Marital", "Citizenship"] as const;
type View = typeof VIEWS[number];
const VIEW_KEY: Record<View, FacetKey> = { Gender: "gender", Age: "band", Race: "race", Marital: "marital", Citizenship: "citizen" };
const VIEW_ORDER: Record<View, string[]> = {
  Gender: ["Women", "Men"], Age: [...BANDS], Race: Object.keys(RACE_N), Marital: Object.keys(MARITAL_N), Citizenship: Object.keys(CITIZEN_N),
};
const DONUT = ["#1f3a2c", "#90d26f", "#c6f0a8", "#e8c53a", "#6b1f28"];
const FACET_NAME: Record<FacetKey, string> = { gender: "Gender", band: "Age", race: "Race", marital: "Marital status", citizen: "Citizenship", reason: "Reason for leaving" };

const k0 = (n: number) => `$${Math.round(n / 1000)}K`;
const pct1 = (n: number) => `${n.toFixed(1)}%`;
const countBy = (list: Emp[], key: FacetKey | "dept", order: string[]) => order.map((v) => [v, list.filter((e) => e[key] === v).length] as const);
const median = (xs: number[]) => {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b), m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const ALL_N = EMPLOYEES.length;
const ALL_LEFT = EMPLOYEES.filter((e) => !e.active).length;
const COMPANY_RATE = ALL_LEFT / ALL_N * 100;
// Company figures come from the same rows the board filters, so filtered views always compare like for like.
const COMPANY_AVG = EMPLOYEES.reduce((s, e) => s + e.salary, 0) / ALL_N;
const COMPANY_MEDIAN = median(EMPLOYEES.map((e) => e.salary));
const PER_PAGE = 8;
// Privacy threshold: any group smaller than this shows as "<5" and its rows, rates and pay are hidden.
const MIN_N = 5;
const isSmall = (c: number) => c > 0 && c < MIN_N;
const cnt = (c: number) => (isSmall(c) ? "<5" : String(c));
// Reasons treated as the employer's decision; everything else counts as voluntary.
const INVOLUNTARY = new Set(["Attendance", "Performance", "Conduct"]);

export function HRBoard() {
  const [ref, on] = useInView<HTMLDivElement>();
  const [tab, setTab] = useState<string>("Overview");
  const [dept, setDept] = useState<Dept | "All">("All");
  const [status, setStatus] = useState<Status>("All");
  const [year, setYear] = useState<number | null>(null);
  const [facet, setFacet] = useState<Facet>(null);
  const [view, setView] = useState<View>("Gender");
  const [sort, setSort] = useState<{ key: "salary" | "age"; dir: 1 | -1 }>({ key: "salary", dir: -1 });
  const [page, setPage] = useState(0);
  const [alerts, read] = useAlerts([
    { id: "h1", title: "About 7 in 10 people hired in 2011 have left", when: "Today, 09:05" },
    { id: "h2", title: "Career moves top the reasons for leaving: 29 of 104", when: "Yesterday" },
    { id: "h3", title: "Production holds 209 of 311 records (67%)", when: "This week" },
  ]);

  // Each visual filters by every slicer except its own dimension (it highlights that instead).
  const pass = (e: Emp, skip?: "dept" | "year" | "facet") =>
    (skip === "dept" || dept === "All" || e.dept === dept) &&
    (status === "All" || (status === "Active") === e.active) &&
    (skip === "year" || year === null || e.year === year) &&
    (skip === "facet" || facet === null || e[facet.k] === facet.v);
  const set = EMPLOYEES.filter((e) => pass(e));
  const noDept = EMPLOYEES.filter((e) => pass(e, "dept"));
  const noYear = EMPLOYEES.filter((e) => pass(e, "year"));
  const noFacet = EMPLOYEES.filter((e) => pass(e, "facet"));
  // A breakdown only ignores the facet when the facet is its own dimension; any other facet still filters it.
  const facetFree = (k: FacetKey) => (facet?.k === k ? noFacet : set);
  const filtered = dept !== "All" || status !== "All" || year !== null || facet !== null;

  const n = set.length;
  const left = set.filter((e) => !e.active).length;
  const hidden = filtered && n < MIN_N; // too few people to show rates, pay or rows
  const rate = n ? left / n * 100 : 0;
  const avg = n ? set.reduce((s, e) => s + e.salary, 0) / n : 0;
  const med = median(set.map((e) => e.salary));
  const scope = [dept === "All" ? null : dept, status === "All" ? null : status === "Active" ? "active" : "leavers", year === null ? null : `hired ${year}`, facet ? facet.v : null].filter(Boolean).join(", ");
  const int0 = (v: number) => Math.round(v).toLocaleString("en-US");
  const HIDE = "Fewer than 5 people: hidden for privacy";

  const kpis: Array<{ label: string; sub: string; icon: Icon; to: number; f: (n: number) => string; text?: string; note?: string; delta?: { v: string; down: boolean; note: string } }> = [
    { label: "People on record", sub: filtered ? scope : "active and former, hired 2006-2015", icon: UsersThree, to: n, f: int0, text: hidden ? cnt(n) : undefined, note: n === 0 ? "No one matches these filters" : filtered ? `${pct1(n / ALL_N * 100)} of all ${ALL_N}` : `${ALL_N - ALL_LEFT} active, ${ALL_LEFT} former` },
    { label: "Active headcount", sub: "employed at the data extract", icon: UserCheck, to: n - left, f: int0, text: hidden ? cnt(n) : undefined, note: hidden ? (n ? HIDE : "No one in this group") : n ? `${pct1((n - left) / n * 100)} of this group` : "No one in this group" },
    {
      label: "Cumulative attrition", sub: hidden ? "leavers / everyone hired" : `${left} of ${n} hired have left`, icon: SignOut, to: rate, f: pct1,
      ...(hidden ? { text: "n/a", note: HIDE }
        : status !== "All" ? { text: "n/a", note: "Not meaningful with a status filter" }
          : filtered ? { delta: { v: `${Math.abs(rate - COMPANY_RATE).toFixed(1)} pts`, down: rate > COMPANY_RATE, note: `${rate <= COMPANY_RATE ? "lower" : "higher"} than company ${pct1(COMPANY_RATE)}` } }
            : { note: "Not annualised: no leave dates in the sample" }),
    },
    {
      label: "Average salary", sub: hidden ? "USD, active and former" : `USD, median ${k0(med)}`, icon: CurrencyDollar, to: avg, f: k0,
      ...(hidden ? { text: "n/a", note: HIDE }
        : filtered ? { delta: { v: k0(Math.abs(avg - COMPANY_AVG)), down: avg < COMPANY_AVG, note: `${avg >= COMPANY_AVG ? "above" : "below"} company ${k0(COMPANY_AVG)}, not adjusted for role` } }
          : { note: `Mean of all ${ALL_N}; median ${k0(COMPANY_MEDIAN)}, as a few senior salaries pull the mean up` }),
    },
  ];

  const kpiRow = (
    <div className="db-kpis">
      {kpis.map((c, i) => (
        <article key={c.label} className="db-card db-kpi" style={{ "--i": i } as React.CSSProperties}>
          <header><span>{c.label}<small>{c.sub}</small></span><Chip icon={c.icon} /></header>
          <strong>{c.text ?? <Count to={c.to} on={on} format={c.f} />}</strong>
          {c.delta ? <Delta value={c.delta.v} down={c.delta.down} note={c.delta.note} /> : <span className="db-note">{c.note}</span>}
        </article>
      ))}
    </div>
  );

  const pickFacet = (k: FacetKey, v: string) => { setFacet(facet?.k === k && facet.v === v ? null : { k, v }); setPage(0); };
  const filters = (
    <FilterBar className="pc-hr-filters">
      <label className="dd-pill"><span>Department</span>
        <select value={dept} onChange={(e) => { setDept(e.target.value as Dept | "All"); setPage(0); }}>
          <option value="All">All</option>
          {DEPTS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </label>
      <Slicer label="Employment status" options={STATUS} value={status} onChange={(v) => { setStatus(v); setPage(0); }} className="is-small" />
      <label className="dd-pill"><span>Hire year</span>
        <select value={year ?? ""} onChange={(e) => { setYear(e.target.value ? Number(e.target.value) : null); setPage(0); }}>
          <option value="">All</option>
          {YEAR_LIST.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </label>
      {facet && <FilterChip label={`${FACET_NAME[facet.k]}: ${facet.v}`} onClear={() => setFacet(null)} />}
      <p className="db-context">{filtered ? <><b>{scope}</b> compared with <b>all 311</b></> : <><b>All 311 records</b>, hired 2006-2015</>}</p>
    </FilterBar>
  );

  /* Overview: departments and the diversity breakdowns */
  const deptCounts = countBy(noDept, "dept", [...DEPTS]);
  const deptMax = Math.max(1, ...deptCounts.map(([, c]) => c));
  const vKey = VIEW_KEY[view];
  const vCounts = countBy(facetFree(vKey), vKey, VIEW_ORDER[view]);
  const vTotal = vCounts.reduce((s, [, c]) => s + c, 0);
  const vMax = Math.max(1, ...vCounts.map(([, c]) => c));
  const asDonut = view === "Gender" || view === "Marital" || view === "Citizenship";
  const C = 2 * Math.PI * 46;
  const arcs = vCounts.reduce<Array<{ v: string; c: number; len: number; off: number }>>((acc, [v, c]) => {
    const off = acc.length ? acc[acc.length - 1].off + acc[acc.length - 1].len : 0;
    return [...acc, { v, c, len: vTotal ? c / vTotal * C : 0, off }];
  }, []);
  const share = (c: number) => (isSmall(c) ? "<5" : vTotal ? `${Math.round(c / vTotal * 100)}%` : "0%");
  // Bars for groups under 5 get a fixed stub, so their length does not give the count away.
  const barV = (c: number, max: number) => (isSmall(c) ? 0.5 * MIN_N / Math.max(max, MIN_N) : c / max);
  const topV = [...vCounts].sort((x, y) => y[1] - x[1])[0];

  /* Employees table */
  const rows = hidden ? [] : [...set].sort((x, y) => (x[sort.key] - y[sort.key]) * sort.dir);
  const pages = Math.max(1, Math.ceil(rows.length / PER_PAGE));
  const pg = Math.min(page, pages - 1);
  const shown = rows.slice(pg * PER_PAGE, pg * PER_PAGE + PER_PAGE);
  const sortBy = (key: "salary" | "age") => { setSort((s) => ({ key, dir: s.key === key ? (s.dir === 1 ? -1 : 1) : -1 })); setPage(0); };

  /* Attrition */
  // Hire-year cohorts under 5 people are not charted: a rate on 2 or 3 people is noise and identifies them.
  const yearStats = YEAR_LIST.map((y) => { const g = noYear.filter((e) => e.year === y); const l = g.filter((e) => !e.active).length; return { y, n: g.length, l, r: g.length >= MIN_N ? l / g.length * 100 : 0 }; });
  const rMax = Math.max(1, ...yearStats.map((s) => s.r));
  const yearBars: BarDatum[] = yearStats.map((s) => ({ key: String(s.y), label: `'${String(s.y).slice(2)}`, h: s.r / rMax, tip: !s.n ? "No hires in this group" : s.n < MIN_N ? "Fewer than 5 hires: not shown" : `${pct1(s.r)} left (${s.l} of ${s.n})`, tipLabel: `Hired in ${s.y}` }));
  const yearSel = year === null ? null : YEAR_LIST.indexOf(year);
  const leavers = facetFree("reason").filter((e) => !e.active);
  const invol = leavers.filter((e) => e.reason !== null && INVOLUNTARY.has(e.reason)).length;
  const volShare = leavers.length >= MIN_N ? (leavers.length - invol) / leavers.length * 100 : 0;
  const reasons = countBy(leavers, "reason", Object.keys(REASON_N)).filter(([, c]) => c > 0).sort((x, y) => y[1] - x[1]);
  const rsMax = Math.max(1, ...reasons.map(([, c]) => c));
  const leftSet = set.filter((e) => !e.active);
  const leftW = leftSet.filter((e) => e.gender === "Women").length;
  const wShare = leftSet.length >= MIN_N ? leftW / leftSet.length * 100 : 0;
  const peak = [...yearStats].sort((x, y) => y.r - x.r)[0];

  return (
    <div ref={ref} className={`db pc-hr${on ? " is-on" : ""}`}>
      <Topbar title="HR analytics" tabs={["Overview", "Employees", "Attrition"]} tab={tab} onTab={setTab} alerts={alerts} onRead={read} about={ABOUT} />

      {tab === "Overview" && (
        <div className="db-page" key="overview">
          {filters}
          {kpiRow}
          <div className="db-row pc-hr-row">
            <article className="db-card">
              <header><div><span className="db-label">Employees by department</span><strong className="db-big db-big-sm">{dept === "All" ? "Click a department to filter" : `${dept}: ${cnt(deptCounts.find(([d]) => d === dept)?.[1] ?? 0)} people`}</strong></div></header>
              <ul className="pc-hr-bars" aria-label="Employees by department. Pick one to filter.">
                {deptCounts.map(([d, c], i) => (
                  <li key={d}>
                    <button type="button" aria-pressed={dept === d} className={dept !== "All" && dept !== d ? "is-dim" : undefined} style={{ "--v": barV(c, deptMax), "--i": i } as React.CSSProperties} onClick={() => { setDept(dept === d ? "All" : (d as Dept)); setPage(0); }}>
                      <span>{d}</span><span className="pc-hr-track"><i /></span><b>{cnt(c)}</b>
                    </button>
                  </li>
                ))}
              </ul>
              <p className="db-hint"><Lightning size={13} weight="fill" /> {noDept.length ? `Production is ${Math.round((deptCounts[0][1] / noDept.length) * 100)}% of this group, so plant conditions shape the whole workforce picture.` : "No one matches these filters."}</p>
            </article>

            <article className="db-card pc-hr-div">
              <header>
                <div><span className="db-label">Who works here</span><strong className="db-big db-big-sm">{topV && vTotal ? `${topV[0]}: ${share(topV[1])}` : "No one matches"}</strong></div>
                <Slicer label="Breakdown" options={VIEWS} value={view} onChange={setView} className="is-small" />
              </header>
              {asDonut ? (
                <div className="pc-hr-donut-row">
                  <div className="db-donut-wrap pc-hr-donut-wrap">
                    <svg className="db-donut pc-hr-donut" viewBox="0 0 120 120" aria-hidden="true">
                      <circle className="db-donut-bg" cx="60" cy="60" r="46" />
                      {arcs.map((s, i) => (
                        <circle key={s.v} cx="60" cy="60" r="46" stroke={DONUT[i % DONUT.length]} strokeDasharray={`${on ? Math.max(0, s.len - (s.len > 3 ? 1.5 : 0)) : 0} ${C}`} strokeDashoffset={-s.off} className={facet?.k === vKey && facet.v !== s.v ? "is-dim" : undefined} />
                      ))}
                    </svg>
                    <span className="db-donut-mid"><b>{cnt(vTotal)}</b><small>people</small></span>
                  </div>
                  <div className="db-legend pc-hr-legend" role="group" aria-label={`${view} breakdown. Pick one to filter.`}>
                    {arcs.map((s, i) => (
                      <button key={s.v} type="button" aria-pressed={facet?.k === vKey && facet.v === s.v} className={facet?.k === vKey && facet.v !== s.v ? "is-dim" : undefined} onClick={() => pickFacet(vKey, s.v)}>
                        <i style={{ background: DONUT[i % DONUT.length] }} />{s.v}<b>{share(s.c)}</b>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <ul className="pc-hr-bars is-tight" aria-label={`${view} breakdown. Pick one to filter.`}>
                  {vCounts.map(([v, c], i) => (
                    <li key={v}>
                      <button type="button" aria-pressed={facet?.k === vKey && facet.v === v} className={facet?.k === vKey && facet.v !== v ? "is-dim" : undefined} style={{ "--v": barV(c, vMax), "--i": i } as React.CSSProperties} onClick={() => pickFacet(vKey, v)}>
                        <span title={v}>{v}</span><span className="pc-hr-track"><i /></span><b>{cnt(c)}</b>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <p className="db-hint"><Lightning size={13} weight="fill" /> {facet && facet.k === vKey ? `Filtered to ${facet.v}. Every page now shows this group only.` : "Click any group to filter the whole report to it. Groups under 5 people show as <5."}</p>
            </article>
          </div>
        </div>
      )}

      {tab === "Employees" && (
        <div className="db-page" key="employees">
          {filters}
          <article className="db-card">
            <header>
              <div><span className="db-label">Employee records, names replaced with IDs. Row-level view: HR role only in production</span><strong className="db-big db-big-sm">{rows.length ? `${pg * PER_PAGE + 1}-${pg * PER_PAGE + shown.length} of ${rows.length}, by ${sort.key} ${sort.dir === -1 ? "high to low" : "low to high"}` : hidden && n ? "Rows hidden for privacy" : "No records"}</strong></div>
              <div className="db-sorts">
                <button type="button" className={sort.key === "salary" ? "is-on" : undefined} onClick={() => sortBy("salary")}>Salary {sort.key === "salary" ? (sort.dir === -1 ? "↓" : "↑") : ""}</button>
                <button type="button" className={sort.key === "age" ? "is-on" : undefined} onClick={() => sortBy("age")}>Age {sort.key === "age" ? (sort.dir === -1 ? "↓" : "↑") : ""}</button>
              </div>
            </header>
            <AllColumns />
            <div className="pc-hr-table" role="table" aria-label="Employee records">
              <div className="pc-hr-tr is-head" role="row"><span role="columnheader">ID</span><span role="columnheader">Role</span><span role="columnheader">Gender</span><span role="columnheader">Age</span><span role="columnheader">Status</span><span role="columnheader">Salary</span></div>
              {shown.map((e) => (
                <div key={e.id} className="pc-hr-tr" role="row">
                  <span role="cell" className="pc-hr-id">{e.id}</span>
                  <span role="cell" className="db-who"><b>{e.role}</b><small>{e.dept}</small></span>
                  <span role="cell">{e.gender === "Women" ? "F" : "M"}</span>
                  <span role="cell">{e.age}</span>
                  <span role="cell"><span className={`db-status ${e.active ? "is-ok" : "is-high"}`}>{e.active ? "Active" : "Left"}</span></span>
                  <span role="cell" className="pc-hr-num">${e.salary.toLocaleString("en-US")}</span>
                </div>
              ))}
              {!rows.length && <p className="db-pop-empty">{hidden && n ? "Fewer than 5 people match, so rows are hidden: no one can be singled out." : "No one matches these filters."}</p>}
            </div>
            <footer className="pc-hr-pager">
              <span>Page {pg + 1} of {pages}</span>
              <button type="button" className="db-round" aria-label="Previous page" disabled={pg === 0} onClick={() => setPage(pg - 1)}><ArrowLeft size={13} /></button>
              <button type="button" className="db-round" aria-label="Next page" disabled={pg >= pages - 1} onClick={() => setPage(pg + 1)}><ArrowRight size={13} /></button>
            </footer>
          </article>
        </div>
      )}

      {tab === "Attrition" && (
        <div className="db-page" key="attrition">
          {filters}
          {kpiRow}
          <div className="db-row pc-hr-row">
            <article className="db-card db-chart">
              <header>
                <div><span className="db-label">Share of each year&apos;s hires who have left, to date</span><strong className="db-big db-big-sm">{year === null ? (peak.r > 0 ? `Peak: ${peak.y} hires, ${pct1(peak.r)} left` : "No one matches") : `Filtered to ${year} hires`}</strong></div>
                {year !== null && <FilterChip label={`Hired ${year}`} onClear={() => setYear(null)} />}
              </header>
              <Bars data={yearBars} selected={yearSel} onSelect={(i) => { setYear(i === null ? null : YEAR_LIST[i]); setPage(0); }} on={on} label="Attrition by hire year. Click a year to filter the report to it." />
              <div className="pc-hr-split" style={{ "--w": wShare / 100 } as React.CSSProperties}>
                <span className="pc-hr-split-top"><span>Leavers by gender</span><b>{leftSet.length >= MIN_N ? `Women ${Math.round(wShare)}% · Men ${100 - Math.round(wShare)}%` : leftSet.length ? "Fewer than 5 leavers: hidden" : "No leavers"}</b></span>
                <span className="pc-hr-split-bar"><i /><em /></span>
              </div>
              <p className="db-hint"><Lightning size={13} weight="fill" /> Older hire years have had longer to leave, so read this as share left to date, not a yearly rate. Years with fewer than 5 hires are not charted.</p>
            </article>

            <article className="db-card">
              <header><div><span className="db-label">Why people left, click a reason to filter</span><strong className="db-big db-big-sm">{leavers.length >= MIN_N && reasons.length ? `Top reason: ${reasons[0][0]} (${cnt(reasons[0][1])} of ${leavers.length})` : leavers.length ? "Fewer than 5 leavers: hidden" : "No leavers here"}</strong></div></header>
              <ul className="pc-hr-bars is-tight is-reasons" aria-label="Reasons for leaving. Pick one to filter.">
                {reasons.map(([v, c], i) => (
                  <li key={v}>
                    <button type="button" aria-pressed={facet?.k === "reason" && facet.v === v} className={facet?.k === "reason" && facet.v !== v ? "is-dim" : undefined} style={{ "--v": barV(c, rsMax), "--i": i } as React.CSSProperties} onClick={() => pickFacet("reason", v)}>
                      <span>{v}</span><span className="pc-hr-track"><i /></span><b>{cnt(c)}</b>
                    </button>
                  </li>
                ))}
              </ul>
              <div className="pc-hr-split" style={{ "--w": volShare / 100 } as React.CSSProperties}>
                <span className="pc-hr-split-top"><span>Voluntary vs involuntary</span><b>{leavers.length >= MIN_N ? `Voluntary ${cnt(leavers.length - invol)} · Involuntary ${cnt(invol)}` : leavers.length ? "Fewer than 5 leavers: hidden" : "No leavers"}</b></span>
                <span className="pc-hr-split-bar"><i /><em /></span>
              </div>
              <p className="db-hint"><Lightning size={13} weight="fill" /> {leavers.length >= MIN_N && reasons.length && reasons[0][0] === "Career move" ? "Most leavers chose to go, and career moves lead: worth testing whether clearer growth paths keep more people." : "Click a reason to see who left for it."}</p>
            </article>
          </div>
        </div>
      )}
    </div>
  );
}
