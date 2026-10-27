"use client";

import { useId, useState, type KeyboardEvent } from "react";
import { ArrowUpRight, Check, CookingPot, EnvelopeSimple, GasPump, TrendDown } from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";

/**
 * Research: The Bredge's monthly data briefs, built on National Bureau of
 * Statistics releases. Each brief is a small tool, not just a headline:
 *  - the published figures (quoted exactly from the brief),
 *  - "What it means for you", written for three readers (running a business
 *    in Nigeria, investing from abroad, selling to Nigerian businesses),
 *  - "Try a scenario": sliders for the reader's own numbers, so they can see
 *    what, say, 12% inflation or ₦1,800 petrol does to them.
 * Scenario outputs are simple, stated arithmetic on the reader's inputs; they
 * are illustrations, not forecasts.
 */

const ng = (n: number) => `₦${Math.round(n).toLocaleString("en-US")}`;
const ngM = (n: number) => (n >= 1e9 ? `₦${(n / 1e9).toFixed(2)}bn` : `₦${(n / 1e6).toFixed(1)}m`);
const pct = (n: number, d = 1) => `${n.toFixed(d)}%`;

type Reader = "operator" | "investor" | "seller";
const READERS: Array<[Reader, string]> = [["operator", "Running a business here"], ["investor", "Investing from abroad"], ["seller", "Selling to businesses here"]];

function Slider({ label, value, min, max, step, onChange, show }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; show: string }) {
  const id = useId();
  return (
    <div className="rb-slider">
      <span><label htmlFor={id}>{label}</label><output htmlFor={id}>{show}</output></span>
      <input id={id} type="range" min={min} max={max} step={step} value={value} aria-valuetext={show} onChange={(e) => onChange(Number(e.target.value))} style={{ "--f": (value - min) / (max - min) } as React.CSSProperties} />
    </div>
  );
}

function Result({ label, value, note, strong }: { label: string; value: string; note?: string; strong?: boolean }) {
  return <div className={`rb-result${strong ? " is-strong" : ""}`}><span>{label}</span><b>{value}</b>{note && <small>{note}</small>}</div>;
}

/* ───────── Inflation scenario ───────── */
export function InflationScenario() {
  const [rate, setRate] = useState(15.43);
  const [costs, setCosts] = useState(500); // ₦m a year
  const [costShare, setCostShare] = useState(80); // costs as % of revenue
  const [ret, setRet] = useState(18); // a naira return, % a year
  const rise = costs * 1e6 * (rate / 100);
  const priceRise = rate * (costShare / 100);
  const real = ((1 + ret / 100) / (1 + rate / 100) - 1) * 100;
  return (
    <div className="rb-scn">
      <div className="rb-inputs">
        <Slider label="Inflation over the next 12 months" value={rate} min={5} max={30} step={0.25} onChange={setRate} show={pct(rate, 2)} />
        <Slider label="Your yearly costs" value={costs} min={50} max={5000} step={50} onChange={setCosts} show={ngM(costs * 1e6)} />
        <Slider label="Costs as a share of revenue" value={costShare} min={40} max={95} step={1} onChange={setCostShare} show={pct(costShare, 0)} />
        <Slider label="A naira return you are offered" value={ret} min={5} max={35} step={0.5} onChange={setRet} show={pct(ret)} />
      </div>
      <div className="rb-results">
        <Result strong label="Your costs rise by" value={ngM(rise)} note={`a year, if your costs move with inflation at ${pct(rate, 2)}`} />
        <Result label="Prices must rise by" value={pct(priceRise)} note="to keep the same margin" />
        <Result label="That return in real terms" value={`${real >= 0 ? "+" : ""}${pct(real)}`} note={real >= 0 ? "ahead of inflation" : "behind inflation: you lose buying power"} />
      </div>
    </div>
  );
}

/* ───────── Healthy diet scenario ───────── */
const MIN_WAGE = 70000; // national minimum wage, ₦ a month (2024 Act)
export function DietScenario() {
  const [change, setChange] = useState(0); // % change from April's ₦1,589
  const [staff, setStaff] = useState(200);
  const [cover, setCover] = useState(25); // % of the cost an allowance covers
  const day = 1589 * (1 + change / 100);
  const month = day * 30;
  const share = (month / MIN_WAGE) * 100;
  const allowance = month * (cover / 100) * staff;
  return (
    <div className="rb-scn">
      <div className="rb-inputs">
        <Slider label="Change in the cost of a healthy diet" value={change} min={-10} max={40} step={1} onChange={setChange} show={`${change >= 0 ? "+" : ""}${change}% (${ng(day)} a day)`} />
        <Slider label="Your staff" value={staff} min={10} max={2000} step={10} onChange={setStaff} show={staff.toLocaleString("en-US")} />
        <Slider label="Share a food allowance would cover" value={cover} min={0} max={100} step={5} onChange={setCover} show={pct(cover, 0)} />
      </div>
      <div className="rb-results">
        <Result strong label="A healthy diet costs" value={`${ng(month)} a month`} note="per person, over 30 days" />
        <Result label="Share of the minimum wage" value={pct(share, 0)} note={`of ₦70,000 a month, for one person's food`} />
        <Result label="Your allowance would cost" value={`${ngM(allowance)} a month`} note={`${staff.toLocaleString("en-US")} staff, ${cover}% of the diet cost`} />
      </div>
    </div>
  );
}

/* ───────── Petrol scenario ───────── */
export function PetrolScenario() {
  const [price, setPrice] = useState(1596.25);
  const [litres, setLitres] = useState(20000);
  const [fx, setFx] = useState(1550); // the reader's own ₦ per $ assumption
  const bill = price * litres;
  const lastYear = 1027.76 * litres;
  return (
    <div className="rb-scn">
      <div className="rb-inputs">
        <Slider label="Petrol price per litre" value={price} min={1000} max={2500} step={5} onChange={setPrice} show={ng(price)} />
        <Slider label="Litres your fleet uses a month" value={litres} min={1000} max={200000} step={1000} onChange={setLitres} show={litres.toLocaleString("en-US")} />
        <Slider label="Your ₦ per $ assumption" value={fx} min={800} max={2500} step={10} onChange={setFx} show={`₦${fx.toLocaleString("en-US")}`} />
      </div>
      <div className="rb-results">
        <Result strong label="Monthly fuel bill" value={ngM(bill)} note={`about $${Math.round(bill / fx).toLocaleString("en-US")} at your rate`} />
        <Result label="Than at May 2025 prices" value={`+${ngM(bill - lastYear)}`} note="when petrol was ₦1,027.76 a litre" />
        <Result label="Each ₦100 on the litre adds" value={ngM(100 * litres)} note="to the monthly bill" />
      </div>
    </div>
  );
}

type Brief = {
  id: string;
  icon: Icon;
  series: string;
  title: string;
  issue: string;
  headline: { value: string; label: string };
  facts: Array<[label: string, value: string]>;
  note?: string;
  meaning: Record<Reader, string[]>;
  Scenario: () => React.ReactElement;
  checked: string;
  href: string;
  article: string;
};

const BRIEFS: Brief[] = [
  {
    id: "inflation",
    icon: TrendDown,
    series: "Inflation",
    title: "Headline inflation, July 2026",
    issue: "Data Brief No. 014 · published 18 Aug 2026",
    headline: { value: "15.43%", label: "headline inflation, July 2026" },
    facts: [
      ["vs June 2026", "-0.48 pp (from 15.91%)"],
      ["vs July 2025", "-9.51 pp (from 24.94%)"],
      ["Food inflation", "20.31%"],
      ["Food's contribution to the headline", "6.18 of the 15.43 points"],
    ],
    note: "Compare year on year with care: the National Bureau of Statistics rebased the price index in 2025.",
    meaning: {
      operator: ["Prices are still rising, just more slowly. Budgets built on last year's 24.94% are now too high for most costs.", "Food is rising fastest, at 20.31%, so food-linked costs and staff pressure for pay rises will move faster than the headline.", "Use the scenario to see what the rate does to your own cost base and the price rise you need."],
      investor: ["Slowing inflation helps real returns on naira assets, but only if your naira return beats the rate.", "Food at 20.31% is a consumer-spending risk: households have less to spend on everything else.", "Test a return against an inflation scenario below to see what you keep in real terms."],
      seller: ["Your customers' costs are still rising about 15% a year, so expect harder price negotiations and longer payment terms.", "Sectors close to food will feel the squeeze first.", "Price reviews tied to the published rate are easier to agree than ad hoc increases."],
    },
    Scenario: InflationScenario,
    checked: "18 automated checks passed before publishing",
    href: "https://drive.google.com/file/d/15nrO9_YHVHCMQsBr_2UDJw-zocAnJh9w/view",
    article: "/research/inflation-july-2026",
  },
  {
    id: "diet",
    icon: CookingPot,
    series: "Cost of a Healthy Diet",
    title: "Cost of a healthy diet, April 2026",
    issue: "Healthy Diet Cost Report · monthly",
    headline: { value: "₦1,589", label: "per person, per day, April 2026" },
    facts: [
      ["Per person, per month", "₦47,670"],
      ["vs March 2026", "+3.11%"],
      ["Animal-source foods", "₦643 a day (about 40%)"],
      ["Dearest and cheapest state", "Ekiti ₦2,036 · Adamawa ₦1,143"],
    ],
    meaning: {
      operator: ["A healthy diet for one person now costs about two thirds of the ₦70,000 minimum wage. Expect it in pay talks and staff turnover.", "Costs differ by almost ₦900 a day between states, so one national wage policy hits sites very differently.", "Use the scenario to cost a food allowance for your own head count."],
      investor: ["Food costs are eating into disposable income, which matters for any consumer-facing business you back.", "State-level spreads point to where consumer demand is under most pressure.", "Watch the monthly series: it moved +3.11% in a single month."],
      seller: ["Customers selling to consumers are absorbing higher food costs; expect pressure on their margins and budgets.", "Regional pricing can make sense: costs in Ekiti and Adamawa are nearly ₦900 a day apart.", "Staff welfare and food benefits are a live budget line for employers."],
    },
    Scenario: DietScenario,
    checked: "Read directly from the release, recomputed and cross-checked",
    href: "https://drive.google.com/file/d/1zJ1KfCJl-Ha7w9KhpzENE0LTWyUbq8Zs/view",
    article: "/research/healthy-diet-cost-april-2026",
  },
  {
    id: "pms",
    icon: GasPump,
    series: "PMS Price Watch",
    title: "Petrol prices, May 2026",
    issue: "PMS Price Watch No. 031 · published 29 Aug 2026",
    headline: { value: "₦1,596.25", label: "national average per litre, May 2026" },
    facts: [
      ["vs May 2025", "+55.31% (from ₦1,027.76)"],
      ["vs April 2026", "+4.13% (from ₦1,532.93)"],
      ["Dearest state", "Edo ₦1,722.91"],
      ["Cheapest state", "Adamawa ₦1,469.83"],
    ],
    meaning: {
      operator: ["Fuel is up 55.31% in a year. Any delivery, logistics or generator cost set last year is now badly out of date.", "The gap is between states (₦253 a litre), not regions, so cost-to-serve depends on exactly where you operate.", "Use the scenario to put your own litres against a price you expect."],
      investor: ["Fuel feeds into almost every operating cost, from logistics to power, so margins in fuel-heavy businesses are under pressure.", "Price your downside: the scenario shows a fleet's bill in dollars at your own exchange-rate assumption.", "State spreads mean two similar companies can face very different costs."],
      seller: ["Customers with fleets or generators are seeing a sharp jump in running costs; budgets elsewhere may be cut.", "Delivery charges and service fees tied to fuel need regular review.", "Clients in Edo face the highest prices; Adamawa the lowest."],
    },
    Scenario: PetrolScenario,
    checked: "Read directly from the release, recomputed and cross-checked",
    href: "https://drive.google.com/file/d/1s_kuW37_u_kcyM3ykuxRcB4o9Aoa27SE/view",
    article: "/research/petrol-prices-may-2026",
  },
];

export function ResearchBriefs() {
  const [active, setActive] = useState(0);
  const [reader, setReader] = useState<Reader>("operator");
  const [view, setView] = useState<"meaning" | "scenario">("meaning");
  const b = BRIEFS[active];
  const Scenario = b.Scenario;
  const onKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    setActive((a) => (a + (e.key === "ArrowDown" ? 1 : -1) + BRIEFS.length) % BRIEFS.length);
  };

  return (
    <section className="rb section-wrap" aria-labelledby="rb-title">
      <header className="rb-intro">
        <p className="rb-label">Research</p>
        <h2 id="rb-title">Explore the briefs.</h2>
        <p>Every month we turn Nigeria&rsquo;s official statistics into briefs you can act on: costs, prices and markets, read straight from the National Bureau of Statistics, recomputed and checked. Then try them on your own numbers.</p>
      </header>

      <div className="rb-window">
        <div className="rb-list" role="tablist" aria-label="Data briefs" aria-orientation="vertical">
          {BRIEFS.map((x, i) => {
            const I = x.icon;
            return (
              <button key={x.id} type="button" role="tab" aria-selected={i === active} tabIndex={i === active ? 0 : -1} className={i === active ? "is-on" : undefined} onClick={() => setActive(i)} onKeyDown={onKey}>
                <span className="rb-ico" aria-hidden="true"><I size={18} weight={i === active ? "fill" : "regular"} /></span>
                <span><b>{x.series}</b><small>{x.headline.value} · {x.title.split(", ").pop()}</small></span>
              </button>
            );
          })}
          <a className="rb-subscribe" href="#contact-footer"><EnvelopeSimple size={16} aria-hidden="true" />Get the monthly brief</a>
        </div>

        <article className="rb-brief" role="tabpanel" key={b.id} aria-label={b.title}>
          <header>
            <span className="rb-issue">{b.issue}</span>
            <h3>{b.title}</h3>
          </header>
          <div className="rb-head">
            <strong>{b.headline.value}</strong>
            <span>{b.headline.label}</span>
          </div>
          <dl className="rb-facts">
            {b.facts.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
          </dl>
          {b.note && <p className="rb-note">{b.note}</p>}

          <div className="rb-views" role="tablist" aria-label="Show">
            <button type="button" role="tab" aria-selected={view === "meaning"} className={view === "meaning" ? "is-on" : undefined} onClick={() => setView("meaning")}>What it means for you</button>
            <button type="button" role="tab" aria-selected={view === "scenario"} className={view === "scenario" ? "is-on" : undefined} onClick={() => setView("scenario")}>Try a scenario</button>
          </div>

          {view === "meaning" ? (
            <div className="rb-meaning-box">
              <div className="rb-readers" role="radiogroup" aria-label="I am">
                {READERS.map(([id, label]) => (
                  <button key={id} type="button" role="radio" aria-checked={reader === id} className={reader === id ? "is-on" : undefined} onClick={() => setReader(id)}>{label}</button>
                ))}
              </div>
              <ul className="rb-points" key={reader}>
                {b.meaning[reader].map((m) => <li key={m}><Check size={13} weight="bold" aria-hidden="true" />{m}</li>)}
              </ul>
            </div>
          ) : (
            <Scenario />
          )}

          <footer>
            <span className="rb-checked"><Check size={13} weight="bold" aria-hidden="true" />{b.checked}</span>
            <a className="rb-read" href={b.article}>Read the analysis <ArrowUpRight size={14} weight="bold" aria-hidden="true" /></a>
          </footer>
        </article>
      </div>
    </section>
  );
}
