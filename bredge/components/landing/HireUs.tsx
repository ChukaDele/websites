"use client";
/* eslint-disable @next/next/no-img-element */

import { useRef, useState, type KeyboardEvent } from "react";
import { ArrowsClockwise, ArrowUpRight, Buildings, Plant, Plus, RocketLaunch } from "@phosphor-icons/react";
import { TOOL_LOGOS } from "./WorkStudio";

/**
 * "Three ways teams hire us": one tab per buyer (small business, growing
 * team, large company), each mapped to the offer that fits it. No prices.
 *
 * A close replica of the pricing reference: bracketed label and a two-line
 * headline on the left with a statement and a proof row at the bottom; on the
 * right, two separate option buttons and one bordered card (title, description,
 * a large "price" line, a lime call to action with a note, "What's included" in
 * two columns).
 *
 * Content stays truthful: the price slot carries real terms ("<1 hire" a month,
 * "Fixed quote"), the availability slot carries the "Best when" note, and the
 * reference's avatars, star rating and testimonial are replaced by the tools the
 * team works in and the site's own line. Nothing invented.
 *
 * Motion: option buttons change colour (150ms); the card content swaps with a
 * short rise and a blur that clears. Keyboard: a real tablist; arrow keys switch.
 */

const ICONS = { plant: Plant, cycle: ArrowsClockwise, buildings: Buildings, rocket: RocketLaunch };

export type Plan = {
  id: string;
  tab: string;
  /** Icon name (plain string so a server page can pass plans). */
  icon: keyof typeof ICONS;
  title: string;
  description: string;
  price: string;
  unit: string;
  cta: string;
  href: string;
  noteLead: string;
  note: string;
  included: string[];
};

const DEFAULT_PLANS: Plan[] = [
  {
    id: "small",
    tab: "Small business",
    icon: "plant",
    title: "A data team, part-time",
    description: "You need reporting you can trust but not a full-time data hire. We take the work on for the days a month it actually needs, designed to cost less than one full-time hire.",
    price: "Part-time",
    unit: " team",
    cta: "Explore embedded teams",
    href: "/services/embedded-data-team",
    noteLead: "Best when",
    note: "you need a data person but can’t justify hiring one.",
    included: [
      "Reporting set up and kept running",
      "Engineering, analytics and BI",
      "Days per month, agreed up front",
      "No recruiting or employer costs",
      "Senior people only",
      "Documented as we build",
      "Your tools, your accounts",
      "Direct line to the builders",
    ],
  },
  {
    id: "growing",
    tab: "Growing team",
    icon: "cycle",
    title: "Embedded Data Team",
    description: "A senior engineer and analyst working your backlog every week. Consistent service and the range of a whole team, designed to cost less than one full-time hire and without recruiting anyone.",
    price: "Monthly",
    unit: " retainer",
    cta: "Explore embedded teams",
    href: "/services/embedded-data-team",
    noteLead: "Best when",
    note: "data is a standing part of how you run the business.",
    included: [
      "Weekly delivery",
      "Engineering, analytics and BI",
      "Shared backlog",
      "Scale days up or down monthly",
      "Senior engineer and analyst",
      "No recruiting or employer costs",
      "Documented as we build",
      "Direct line to the builders",
    ],
  },
  {
    id: "projects",
    tab: "Large company",
    icon: "buildings",
    title: "Data Project",
    description: "Your team is stretched and one project keeps slipping. Tell us the problem: we scope it, quote it, build it alongside your people and hand it over documented.",
    price: "Fixed",
    unit: " quote",
    cta: "Explore data projects",
    href: "/services/data-projects",
    noteLead: "Best when",
    note: "you know what needs doing and need hands to do it.",
    included: [
      "Pipelines",
      "Warehouses and models",
      "BI and reporting",
      "Reconciliation",
      "Quoted up front",
      "Clear acceptance criteria",
      "Handed over documented",
      "Works with your IT and security",
    ],
  },
];

const TOOLS = ["Power BI", "Looker", "dbt", "Snowflake", "BigQuery"] as const;

/** How the price is set, as three lines under "What's included" (/services). */
const PRICING: Array<[string, string]> = [
  ["Tell us the problem", "A 30-minute call. No prepared brief needed."],
  ["We size the work", "By scope for a Diagnostic or Project, by days and skills for an Embedded Team."],
  ["You get a fixed price in writing", "Before any work starts. No hourly billing, no surprise invoices."],
];

type HireUsProps = {
  /** Show how the price is set under "What's included": true for the default steps, or a page's own. */
  pricing?: boolean | Array<[string, string]>;
  /** Line under the pricing steps (defaults to the honest-answer link). */
  pricingNote?: React.ReactNode;
  plans?: Plan[];
  label?: string;
  title?: React.ReactNode;
  aside?: string;
  tabsLabel?: string;
  /** Heading over the card's list. */
  includedLabel?: string;
};

export function HireUs({
  pricing = false,
  pricingNote,
  plans: PLANS = DEFAULT_PLANS,
  label = "[Our engagements]",
  title = <>Three ways<br />teams hire us</>,
  aside = "Pick the one that sounds like you. Every engagement starts with a written proposal and a fixed price, so you know the cost before any work begins. You work with the people who build it.",
  tabsLabel = "Engagement type",
  includedLabel = "What’s included",
}: HireUsProps = {}) {
  const steps = pricing === true ? PRICING : pricing || null;
  const [active, setActive] = useState(0);
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);
  const plan = PLANS[active];

  const onKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const next = (active + (e.key === "ArrowRight" ? 1 : -1) + PLANS.length) % PLANS.length;
    setActive(next);
    tabs.current[next]?.focus();
  };

  return (
    <section className="hu" aria-labelledby="hu-title">
      <div className="hu-wrap">
        <div className="hu-left">
          <p className="hu-label">{label}</p>
          <h2 id="hu-title">{title}</h2>
          <div className="hu-aside">
            {aside && <p>{aside}</p>}
            <div className="hu-proof">
              <span className="hu-stack" aria-hidden="true">
                {TOOLS.map((name) => <i key={name} title={name}><img src={TOOL_LOGOS[name].src} alt="" width={17} height={17} /></i>)}
              </span>
              <span className="hu-proof-text"><b>Power BI, Tableau, dbt, Snowflake, BigQuery</b>We work in the stack you already have</span>
            </div>
          </div>
        </div>

        <div className="hu-right">
          <div className="hu-tabs" role="tablist" aria-label={tabsLabel}>
            {PLANS.map((p, i) => {
              const I = ICONS[p.icon];
              return (
                <button
                  key={p.id}
                  ref={(el) => { tabs.current[i] = el; }}
                  type="button"
                  role="tab"
                  id={`hu-tab-${p.id}`}
                  aria-selected={i === active}
                  aria-controls="hu-card"
                  tabIndex={i === active ? 0 : -1}
                  className={i === active ? "is-on" : undefined}
                  onClick={() => setActive(i)}
                  onKeyDown={onKey}
                >
                  <I size={17} weight={i === active ? "fill" : "bold"} aria-hidden="true" />{p.tab}
                </button>
              );
            })}
          </div>

          <article className="hu-card" id="hu-card" role="tabpanel" aria-labelledby={`hu-tab-${plan.id}`}>
            <div className="hu-swap" key={plan.id}>
              <h3>{plan.title}</h3>
              <p className="hu-desc">{plan.description}</p>
              <p className="hu-price">{plan.price}<span>{plan.unit}</span></p>
              <div className="hu-action">
                <a className="hu-cta" href={plan.href}>{plan.cta} <ArrowUpRight size={13} weight="bold" aria-hidden="true" /></a>
                <span className="hu-note"><b>{plan.noteLead}</b> {plan.note}</span>
              </div>
              <div className="hu-included">
                <span>{includedLabel}</span>
                <ul>
                  {plan.included.map((item) => <li key={item}><Plus size={12} aria-hidden="true" />{item}</li>)}
                </ul>
              </div>
              {steps && (
                <div className="hu-pricing">
                  <span>How the price is set</span>
                  <ol>
                    {steps.map(([h, p], i) => <li key={h}><i aria-hidden="true">{i + 1}</i><p><b>{h}.</b> {p}</p></li>)}
                  </ol>
                  <p className="hu-pricing-note">{pricingNote ?? <>Or an honest answer that you don’t need us yet. <a href="/schedule">Get your fixed price <ArrowUpRight size={12} weight="bold" aria-hidden="true" /></a></>}</p>
                </div>
              )}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
