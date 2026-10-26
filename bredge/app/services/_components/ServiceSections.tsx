/* eslint-disable @next/next/no-img-element */
/* Shared sections for the service pages (/services, /services/*, /data-diagnostic).
   Server components only. Styles live in app/services.css under the `sv-` prefix.
   Client pieces (segment switcher, comparison toggle, sample pages) live in
   components/services/. */
import { FaqList } from "../../../components/services/FaqList";
import type { ReactNode } from "react";
import { ArrowUpRight, Buildings, Plant, RocketLaunch } from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";
import { DocThumb } from "../../../components/services/DocThumb";

/* ---------- CTAs ---------- */

/** Primary: book a call. Secondary: ask a question first. */
export function CtaPair({ dark = false }: { dark?: boolean }) {
  return (
    <div className={dark ? "sv-cta is-dark" : "sv-cta"}>
      <a className="sv-btn" href="/schedule">Book a 30-minute call <ArrowUpRight size={14} weight="bold" aria-hidden="true" /></a>
      <a className="sv-link" href="/contact">Ask a question first <ArrowUpRight size={13} weight="bold" aria-hidden="true" /></a>
    </div>
  );
}

/* ---------- Hero ---------- */

/** Compact hero: one message, fact chips, both CTAs, optional visual on the right. */
export function SvHero({ eyebrow, title, lede, facts, visual }: {
  eyebrow: string;
  title: ReactNode;
  lede: ReactNode;
  facts?: ReactNode[];
  visual?: ReactNode;
}) {
  return (
    <section className={visual ? "section-wrap sv-hero has-visual" : "section-wrap sv-hero"}>
      <div className="sv-hero-copy">
        <p className="sv-label">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="sv-lede">{lede}</p>
        {facts && <ul className="sv-facts">{facts.map((f, i) => <li key={i}>{f}</li>)}</ul>}
        <CtaPair />
      </div>
      {visual && <div className="sv-hero-visual">{visual}</div>}
    </section>
  );
}

/* ---------- Section heading ---------- */

export function SvHead({ label, title, intro, id }: { label?: string; title: ReactNode; intro?: ReactNode; id?: string }) {
  return (
    <div className="sv-head">
      {label && <p className="sv-label">{label}</p>}
      <h2 id={id}>{title}</h2>
      {intro && <p>{intro}</p>}
    </div>
  );
}

/* ---------- Is this for you? ---------- */

export type SegmentKey = "small" | "large" | "growing";

export type Segment = {
  seg: SegmentKey;
  who: string;
  line: string;
  fit: boolean;
  href?: string;
  linkLabel?: string;
};

export const SEGMENT_ICONS: Record<SegmentKey, Icon> = { small: Plant, large: Buildings, growing: RocketLaunch };

export function ForYou({ title = "Is this for you?", segments, signs, signsLabel = "Sounds familiar?" }: {
  title?: string;
  segments: Segment[];
  signs?: string[];
  signsLabel?: string;
}) {
  return (
    <section className="section sv-sec" aria-labelledby="sv-for-title">
      <div className="section-wrap">
        <SvHead label="Who it’s for" title={title} id="sv-for-title" />
        <ul className="sv-for">
          {segments.map((s) => {
            const I = SEGMENT_ICONS[s.seg];
            return (
              <li key={s.who} className={s.fit ? "sv-for-card is-fit" : "sv-for-card"}>
                <span className="sv-for-ico" aria-hidden="true"><I size={20} weight="duotone" /></span>
                <p className="sv-k">{s.fit ? "Good fit" : "Better fit elsewhere"}</p>
                <h3>{s.who}</h3>
                <p>{s.line}</p>
                {s.href && <a className="sv-link" href={s.href}>{s.linkLabel} <ArrowUpRight size={12} weight="bold" aria-hidden="true" /></a>}
              </li>
            );
          })}
        </ul>
        {signs && (
          <div className="sv-signs">
            <p className="sv-k">{signsLabel}</p>
            <ul>{signs.map((s) => <li key={s}>{s}</li>)}</ul>
          </div>
        )}
      </div>
    </section>
  );
}

/* ---------- How the price is set (3-step strip) ---------- */

export function PriceSteps({ title, steps, note, compare }: {
  title: string;
  steps: Array<[string, ReactNode]>;
  note?: ReactNode;
  /** Optional block rendered above the strip, e.g. the comparison toggle. */
  compare?: ReactNode;
}) {
  return (
    <section className="section sv-sec sv-tint" aria-labelledby="sv-price-title">
      <div className="section-wrap">
        <SvHead label="How pricing works" title={title} id="sv-price-title" intro="No rate card on the site, and no mystery either." />
        {compare}
        <ol className="sv-psteps">
          {steps.map(([h, p], i) => (
            <li key={h}>
              <span className="sv-pstep-n" aria-hidden="true">{i + 1}</span>
              <h3>{h}</h3>
              <p>{p}</p>
            </li>
          ))}
        </ol>
        <div className="sv-price-foot">
          {note && <p>{note}</p>}
          <a className="sv-btn" href="/schedule">Get your fixed price: book a call <ArrowUpRight size={14} weight="bold" aria-hidden="true" /></a>
        </div>
      </div>
    </section>
  );
}

/* ---------- Step track (horizontal on desktop) ---------- */

export function StepTrack({ steps, marker, foot }: {
  steps: Array<[string, string, string]>;
  /** A pinned label after step `after` (0-based), e.g. "Price fixed here". */
  marker?: { after: number; label: string };
  foot?: ReactNode;
}) {
  return (
    <>
      <ol className="sv-track" style={{ ["--n" as string]: steps.length }}>
        {steps.map(([n, h, p], i) => (
          <li key={n} className={marker && i <= marker.after ? "is-before" : undefined}>
            <span className="sv-track-n">{n}</span>
            <h3>{h}</h3>
            <p>{p}</p>
            {marker && i === marker.after && <span className="sv-track-mark">{marker.label}</span>}
          </li>
        ))}
      </ol>
      {foot && <p className="sv-track-foot">{foot}</p>}
    </>
  );
}

/* ---------- Stack fit + proof, one section ---------- */

const TOOLS: Array<{ name: string; src?: string; wordmark?: boolean }> = [
  { name: "Power BI", src: "/logos/tools/powerbi.svg" },
  { name: "Tableau", src: "/logos/tools/tableau.png", wordmark: true },
  { name: "Looker", src: "/logos/tools/looker.svg" },
  { name: "Excel", src: "/logos/tools/excel.svg" },
  { name: "Python", src: "/logos/tools/python.svg" },
  { name: "SQL" },
  { name: "PostgreSQL", src: "/logos/tools/postgresql.svg" },
  { name: "Snowflake", src: "/logos/tools/snowflake.svg" },
  { name: "BigQuery", src: "/logos/tools/bigquery.svg" },
  { name: "dbt", src: "/logos/tools/dbt.svg", wordmark: true },
  { name: "Xero", src: "/logos/tools/xero.svg" },
];

/** Tools strip plus the two proof links (no client names, no testimonials). */
/** The tools we work in, as chips, with the "something else?" line. */
export function ToolStrip({ line, className }: { line?: string; className?: string }) {
  return (
    <div className={`sv-tools-wrap${className ? ` ${className}` : ""}`}>
      <p className="sv-k">{line ?? "We work in the stack you already have"}</p>
      <ul className="sv-tools" aria-label="Tools we work in">
        {TOOLS.map((t) => (
          <li key={t.name} className={t.wordmark ? "is-wordmark" : undefined}>
            {t.src
              ? <img src={t.src} alt="" width={t.wordmark ? 56 : 20} height={20} loading="lazy" />
              : <span className="sv-tool-mark" aria-hidden="true">{"{ }"}</span>}
            <span>{t.name}</span>
          </li>
        ))}
      </ul>
      <p className="sv-tools-foot">Using something else? Ask us on the call. If it isn’t a good fit, we’ll say so.</p>
    </div>
  );
}

export function ProofStack({ toolsLine, tools = true }: { toolsLine?: string; /** Show the tool strip (off where the hero carries it). */ tools?: boolean }) {
  return (
    <section className="section sv-sec" aria-labelledby="sv-proof-title">
      <div className="section-wrap">
        <SvHead label="Proof" title="Judge the work before you talk to us." id="sv-proof-title" intro="Client work stays under NDA. Open the same kind of work instead, and meet who would do it." />
        <div className="sv-proof">
          <a className="sv-proof-card is-work" href="/work">
            <span className="sv-proof-art" aria-hidden="true">
              <DocThumb kind="report" className="is-a" />
              <DocThumb kind="list" className="is-b" />
            </span>
            <p className="sv-k">The work</p>
            <h3>Click through dashboards we’ve built.</h3>
            <p>Reference builds on synthetic data, with the SQL and the tests left visible.</p>
            <span className="sv-go" aria-hidden="true"><ArrowUpRight size={14} weight="bold" /></span>
          </a>
          <a className="sv-proof-card" href="/how-we-work#about">
            <span className="sv-proof-art is-people" aria-hidden="true"><i /><i /><i /></span>
            <p className="sv-k">The people</p>
            <h3>Meet the people who do the work.</h3>
            <p>Who we are, how we run an engagement and what we expect from you.</p>
            <span className="sv-go" aria-hidden="true"><ArrowUpRight size={14} weight="bold" /></span>
          </a>
        </div>
        {tools && <ToolStrip line={toolsLine} />}
      </div>
    </section>
  );
}

/* ---------- FAQ + FAQPage JSON-LD ---------- */

export type FaqItem = [question: string, answer: string];

/** Exclusive accordion: native <details name>, so opening one closes the rest. */
export function Faq({ items, name, title = "Questions buyers ask us." }: { items: FaqItem[]; name: string; title?: string }) {
  const json = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
  };
  return (
    <section className="section sv-sec fq" aria-labelledby="sv-faq-title">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} />
      <div className="section-wrap">
        <header className="fq-head">
          <p className="fq-label">FAQ</p>
          <h2 id="sv-faq-title">{title}</h2>
          <p>The questions we hear most before a first call. Can’t find yours? <a href="/contact">Ask us directly</a>.</p>
        </header>
        <FaqList items={items} name={name} />
      </div>
    </section>
  );
}

/* ---------- Closing CTA ---------- */

export function ClosingCta({ title, body }: { title: string; body: ReactNode }) {
  return (
    <section className="section-wrap sv-close" aria-label="Book a call">
      <div className="sv-close-card">
        <div>
          <h2>{title}</h2>
          <p>{body}</p>
        </div>
        <CtaPair dark />
      </div>
    </section>
  );
}

/** Mark the UK and US as the served areas on Service JSON-LD. */
export const AREA_SERVED = [
  { "@type": "Country", name: "United Kingdom" },
  { "@type": "Country", name: "United States" },
];
