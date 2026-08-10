import type { Metadata } from "next";
import { PageShell } from "../../components/site/PageShell";
import { pageMetadata } from "../../lib/seo";
import { articles } from "../../lib/insights";
import { AllInsights } from "../../components/insights/AllInsights";

export const metadata: Metadata = pageMetadata({
  title: "Insights | Data engineering, analytics & BI thinking | The Bredge",
  description: "Practical, senior writing on data engineering, analytics, BI and the organisational problems that make otherwise good data work fail — with DIY checks you can run yourself.",
  path: "/insights",
});

export default function InsightsPage() {
  const [featured, secondaryA, secondaryB] = articles;
  const secondary = [secondaryA, secondaryB];
  return (
    <PageShell>
      <section className="section-wrap insights-hero">
        <p className="eyebrow">BREDGE INSIGHTS</p>
        <h1>The problems behind the dashboard.</h1>
        <p className="lede">Practical writing on data engineering, analytics and the organisational reasons good data work still fails — with checks you can run yourself before anyone rebuilds anything.</p>
      </section>

      <section className="section-wrap insights-index">
        <a className="insight-featured" href={`/insights/${featured.slug}`}>
          <div className="insight-featured-copy">
            <span className="insight-cat">{featured.category}</span>
            <h2>{featured.title}</h2>
            <p>{featured.standfirst}</p>
            <span className="insight-meta">{featured.read} <span className="arrow" aria-hidden="true">↗</span></span>
          </div>
          <div className="insight-featured-viz" aria-hidden="true">
            <svg viewBox="0 0 320 326" xmlns="http://www.w3.org/2000/svg" style={{ fontFamily: "var(--font-mono, monospace)" }}>
              <defs><marker id="fa" markerWidth="8" markerHeight="8" refX="5" refY="3" orient="auto"><path d="M0,0 L5,3 L0,6 Z" fill="#2c3a36" /></marker></defs>
              <g fontSize="11">
                <rect x="0" y="0" width="320" height="36" fill="none" stroke="#f0bf6c" strokeWidth="1.5" />
                <text x="14" y="23" fill="#2c3a36">CRM</text><text x="306" y="23" textAnchor="end" fill="#a9741f">£4.5m</text>
                <rect x="0" y="52" width="320" height="36" fill="none" stroke="#f0bf6c" strokeWidth="1.5" />
                <text x="14" y="75" fill="#2c3a36">FINANCE</text><text x="306" y="75" textAnchor="end" fill="#a9741f">£4.3m</text>
                <rect x="0" y="104" width="320" height="36" fill="none" stroke="#f0bf6c" strokeWidth="1.5" />
                <text x="14" y="127" fill="#2c3a36">BOARD PACK</text><text x="306" y="127" textAnchor="end" fill="#a9741f">£4.2m</text>
              </g>
              <line x1="160" y1="140" x2="160" y2="176" stroke="rgba(20,35,33,.4)" strokeWidth="1.5" markerEnd="url(#fa)" />
              <rect x="40" y="176" width="240" height="64" fill="var(--surface, #e7e4db)" stroke="rgba(20,35,33,.25)" />
              <text x="160" y="202" textAnchor="middle" fontSize="9" fill="#5a6964" letterSpacing="1">MATCH ON</text>
              <text x="160" y="223" textAnchor="middle" fontSize="10" fill="#2c3a36">time · grain · identity · definition</text>
              <line x1="160" y1="240" x2="160" y2="276" stroke="rgba(20,35,33,.4)" strokeWidth="1.5" markerEnd="url(#fa)" />
              <rect x="0" y="276" width="320" height="48" fill="none" stroke="#90d26f" strokeWidth="2" />
              <text x="14" y="305" fontSize="11" fill="#2c3a36">CANONICAL REVENUE</text><text x="306" y="305" textAnchor="end" fontSize="12" fill="#3c6b43">one figure</text>
            </svg>
          </div>
        </a>

        <div className="insight-secondary">
          {secondary.map((a) => (
            <a className="insight-card" key={a.slug} href={`/insights/${a.slug}`}>
              <span className="insight-cat">{a.category}</span>
              <h3>{a.title}</h3>
              <p>{a.blurb}</p>
              <span className="insight-meta">{a.read} <span className="arrow" aria-hidden="true">↗</span></span>
            </a>
          ))}
        </div>
      </section>

      <AllInsights />
    </PageShell>
  );
}
