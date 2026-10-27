import { ArrowUpRight, EnvelopeSimple } from "@phosphor-icons/react/dist/ssr";
import { DietScenario, InflationScenario, PetrolScenario } from "../work/ResearchBriefs";
import { ReaderTabs } from "./ReaderTabs";
import type { Article, Exhibit } from "./types";

/**
 * A research article page: report structure (summary first, numbered
 * exhibits, implications, method), editorial reading layout (sticky contents,
 * one comfortable measure), and the brief's live scenario so the reader can
 * try the numbers on their own business.
 */

const SCENARIOS = { inflation: InflationScenario, diet: DietScenario, pms: PetrolScenario } as const;
const fmt = (v: number, unit: string) => {
  const n = Number.isInteger(v) ? v.toLocaleString("en-US") : v.toLocaleString("en-US", { maximumFractionDigits: 2 });
  return unit.startsWith("₦") ? `₦${n}${unit.slice(1)}` : `${n}${unit}`;
};

function Chart({ ex, n }: { ex: Exhibit; n: number }) {
  const max = Math.max(...ex.points.map(([, v]) => Math.abs(v)));
  const min = Math.min(...ex.points.map(([, v]) => v));
  if (ex.kind === "line") {
    const lo = Math.min(min, 0) === 0 && min > 0 ? min * 0.9 : min;
    const span = Math.max(1e-9, max - lo);
    const W = 600, H = 200, pad = 18;
    const pts = ex.points.map(([, v], i) => [pad + (i * (W - pad * 2)) / Math.max(1, ex.points.length - 1), H - pad - ((v - lo) / span) * (H - pad * 2)]);
    const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
    return (
      <figure className="ra-ex">
        <figcaption><span>Exhibit {n}</span>{ex.title}</figcaption>
        <svg viewBox={`0 0 ${W} ${H}`} className="ra-line" role="img" aria-label={`${ex.title}: ${ex.points.map(([l, v]) => `${l} ${fmt(v, ex.unit)}`).join(", ")}`}>
          <path d={`${d} L${pts.at(-1)![0]} ${H - pad} L${pts[0][0]} ${H - pad} Z`} className="ra-line-area" />
          <path d={d} className="ra-line-path" />
          {pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={ex.points[i][0] === ex.highlight || i === pts.length - 1 ? 5 : 3} className={ex.points[i][0] === ex.highlight || i === pts.length - 1 ? "is-hi" : undefined} />)}
        </svg>
        <div className="ra-line-labels">{ex.points.map(([l, v], i) => (i === 0 || i === ex.points.length - 1 || l === ex.highlight) ? <span key={l} style={{ left: `${(i / Math.max(1, ex.points.length - 1)) * 100}%` }}><b>{fmt(v, ex.unit)}</b>{l}</span> : null)}</div>
        {ex.note && <p className="ra-ex-note">{ex.note}</p>}
      </figure>
    );
  }
  if (ex.kind === "hbars") {
    return (
      <figure className="ra-ex">
        <figcaption><span>Exhibit {n}</span>{ex.title}</figcaption>
        <ul className="ra-hbars">
          {ex.points.map(([l, v]) => (
            <li key={l} className={l === ex.highlight ? "is-hi" : v < 0 ? "is-neg" : undefined} style={{ "--w": Math.abs(v) / max } as React.CSSProperties}>
              <span>{l}</span><span className="ra-track"><i /></span><b>{fmt(v, ex.unit)}</b>
            </li>
          ))}
        </ul>
        {ex.note && <p className="ra-ex-note">{ex.note}</p>}
      </figure>
    );
  }
  return (
    <figure className="ra-ex">
      <figcaption><span>Exhibit {n}</span>{ex.title}</figcaption>
      <div className="ra-bars" role="img" aria-label={`${ex.title}: ${ex.points.map(([l, v]) => `${l} ${fmt(v, ex.unit)}`).join(", ")}`}>
        {ex.points.map(([l, v], i) => (
          <div key={l} className={l === ex.highlight || (!ex.highlight && i === ex.points.length - 1) ? "is-hi" : undefined} style={{ "--h": Math.abs(v) / max } as React.CSSProperties}>
            <b>{fmt(v, ex.unit)}</b><i /><em>{l}</em>
          </div>
        ))}
      </div>
      {ex.note && <p className="ra-ex-note">{ex.note}</p>}
    </figure>
  );
}

export function ArticleView({ a }: { a: Article }) {
  const Scenario = SCENARIOS[a.scenario];
  let exhibit = 0;
  const date = new Date(`${a.published}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const url = `https://thebredge.com/research/${a.slug}`;
  const jsonLd = [
    {
      "@context": "https://schema.org", "@type": "Article", headline: a.title, description: a.seoDescription,
      datePublished: a.published, dateModified: a.published, mainEntityOfPage: url,
      author: { "@type": "Organization", name: "The Bredge", url: "https://thebredge.com" },
      publisher: { "@type": "Organization", name: "The Bredge", url: "https://thebredge.com" },
      about: `${a.series}, ${a.period}`, isBasedOn: a.sources.map((s) => s.href || s.label),
    },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: a.faq.map(([q, ans]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: ans } })) },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Research", item: "https://thebredge.com/research" },
      { "@type": "ListItem", position: 2, name: a.title, item: url },
    ] },
  ];

  return (
    <article className="ra">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="ra-head section-wrap">
        <p className="ra-crumb"><a href="/research">Research</a> / {a.series}</p>
        <p className="ra-meta">{a.issue} · {date} · {a.readingMinutes} min read</p>
        <h1>{a.title}</h1>
        <p className="ra-dek">{a.dek}</p>
        <div className="ra-hero"><strong>{a.hero.value}</strong><span>{a.hero.label}</span></div>
      </header>

      <div className="ra-body section-wrap">
        <aside className="ra-toc" aria-label="In this article">
          <p>In this article</p>
          <ol>
            <li><a href="#at-a-glance">At a glance</a></li>
            {a.sections.map((s) => <li key={s.id}><a href={`#${s.id}`}>{s.heading}</a></li>)}
            <li><a href="#what-it-means">What it means for you</a></li>
            <li><a href="#try-it">Try it on your numbers</a></li>
            <li><a href="#method">How we made this</a></li>
            <li><a href="#faq">Questions</a></li>
          </ol>
          <a className="ra-pdf" href={a.pdf} target="_blank" rel="noopener noreferrer">Full brief (PDF) <ArrowUpRight size={13} weight="bold" aria-hidden="true" /></a>
          <a className="ra-sub" href="#contact-footer"><EnvelopeSimple size={15} aria-hidden="true" />Get the monthly brief</a>
        </aside>

        <div className="ra-main">
          <section id="at-a-glance" className="ra-glance">
            <h2>At a glance</h2>
            <ul>{a.takeaways.map((t) => <li key={t}>{t}</li>)}</ul>
          </section>

          {a.sections.map((s) => {
            const n = s.exhibit ? ++exhibit : 0;
            return (
              <section key={s.id} id={s.id} className="ra-sec">
                <h2>{s.heading}</h2>
                {s.body.map((p, i) => (
                  <div key={i}>
                    <p>{p}</p>
                    {i === 0 && s.pull && <blockquote className="ra-pull">{s.pull}</blockquote>}
                  </div>
                ))}
                {s.exhibit && <Chart ex={s.exhibit} n={n} />}
              </section>
            );
          })}

          <section id="what-it-means" className="ra-sec ra-panel">
            <h2>What it means for you</h2>
            <ReaderTabs readers={a.readers} />
          </section>

          <section id="try-it" className="ra-sec ra-panel">
            <h2>Try it on your numbers</h2>
            <p className="ra-small">Move the sliders to your own business. These are simple, stated calculations to frame a decision, not forecasts.</p>
            <Scenario />
          </section>

          <section id="method" className="ra-sec">
            <h2>How we made this</h2>
            {a.method.map((m, i) => <p key={i}>{m}</p>)}
            <p className="ra-sources"><b>Sources</b>{a.sources.map((s, i) => <span key={i}>{s.href ? <a href={s.href} target="_blank" rel="noopener noreferrer">{s.label}</a> : s.label}</span>)}</p>
          </section>

          <section id="faq" className="ra-sec">
            <h2>Questions</h2>
            {a.faq.map(([q, ans]) => (
              <details key={q} name="ra-faq" className="ra-faq"><summary>{q}</summary><p>{ans}</p></details>
            ))}
          </section>

          <section className="ra-cta">
            <h2>Numbers like these, for your own business.</h2>
            <p>We build the same kind of checked, monthly reporting on your data: costs, prices, margins and cash, in one place your team trusts.</p>
            <div><a className="button" href="/schedule">Book a 30-minute call <span aria-hidden="true" className="arrow">↗</span></a><a className="text-link" href="/data-diagnostic">Or start with a Data Diagnostic</a></div>
          </section>
        </div>
      </div>
    </article>
  );
}
