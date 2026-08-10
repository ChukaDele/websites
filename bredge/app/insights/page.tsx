import type { Metadata } from "next";
import { PageShell } from "../../components/site/PageShell";
import { pageMetadata } from "../../lib/seo";
import { articles } from "../../lib/insights";

export const metadata: Metadata = pageMetadata({
  title: "Insights | Data engineering, analytics & BI thinking | The Bredge",
  description: "Practical, senior writing on data engineering, analytics, BI and the organisational problems that make otherwise good data work fail.",
  path: "/insights",
});

export default function InsightsPage() {
  const [featured, ...rest] = articles;
  return (
    <PageShell>
      <section className="section-wrap insights-hero">
        <p className="eyebrow">BREDGE INSIGHTS</p>
        <h1>The problems behind the dashboard.</h1>
        <p className="lede">Practical writing on data engineering, analytics and the organisational reasons good data work still fails — and what to do about it.</p>
      </section>

      <section className="section-wrap insights-index">
        <a className="insight-featured" href={`/insights/${featured.slug}`}>
          <span className="insight-cat">{featured.category}</span>
          <h2>{featured.title}</h2>
          <p>{featured.blurb}</p>
          <span className="insight-meta">{featured.read} <span className="arrow" aria-hidden="true">↗</span></span>
        </a>

        <div className="insight-secondary">
          {rest.map((a) => (
            <a className="insight-card" key={a.slug} href={`/insights/${a.slug}`}>
              <span className="insight-cat">{a.category}</span>
              <h3>{a.title}</h3>
              <p>{a.blurb}</p>
              <span className="insight-meta">{a.read} <span className="arrow" aria-hidden="true">↗</span></span>
            </a>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
