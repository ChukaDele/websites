import type { Metadata } from "next";
import { PageShell } from "../../components/site/PageShell";
import { InsightsGrid, type Article } from "../../components/interactions/InsightsGrid";
import { pageMetadata } from "../../lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Data Engineering & Analytics Insights | The Bredge",
  description: "Practical writing about data engineering, analytics, BI and the organisational problems that make otherwise good data work fail.",
  path: "/insights",
});

const categories: Array<[string, string]> = [
  ["Data systems", "Pipelines, modelling, architecture, integration and infrastructure."],
  ["Analytics & BI", "Metrics, reporting, analysis and decision design."],
  ["Data reliability", "Quality, reconciliation, governance and confidence."],
  ["Running a data function", "Teams, operating models, priorities and embedded capability."],
];

const articles: Article[] = [
  { title: "Why your dashboards disagree — and why rebuilding the dashboard usually won’t fix it", category: "Data reliability" },
  { title: "The dashboard is the last 10% of a data project", category: "Data systems" },
  { title: "When should a growing company hire a data team?", category: "Running a data function" },
  { title: "Finance says £4.2M. Sales says £4.5M. Which one is revenue?", category: "Data reliability" },
  { title: "Five signs your reporting process has become infrastructure", category: "Analytics & BI" },
  { title: "Before you build a data warehouse, answer these questions", category: "Data systems" },
  { title: "What actually breaks data projects", category: "Data reliability" },
  { title: "Do you need a better dashboard — or better data?", category: "Analytics & BI" },
];

export default function InsightsPage() {
  return (
    <PageShell>
      <section className="section-wrap insights-hero">
        <p className="eyebrow">BREDGE INSIGHTS</p>
        <h1 style={{ maxWidth: "18ch" }}>The problems behind the dashboard.</h1>
        <p className="lede">Practical writing about data engineering, analytics, BI and the organisational problems that make otherwise good data work fail. No trend commentary for the sake of publishing — we write about things we’d want a client to understand before making an important data decision.</p>
      </section>

      <section className="section-wrap section-tight">
        <div className="grid-2" style={{ marginBottom: 56 }}>
          {categories.map(([h, p]) => <article className="tile" key={h}><h3>{h}</h3><p>{p}</p></article>)}
        </div>
        <InsightsGrid articles={articles} />
      </section>

      <section className="section-wrap callout">
        <div className="callout-inner">
          <div><h2>Have the problem now, not next quarter?</h2><p>You don’t have to wait for the write-up. Tell us what’s breaking and we’ll talk it through.</p></div>
          <div><a className="button" href="/contact">Talk to a data lead <span className="arrow" aria-hidden="true">↗</span></a></div>
        </div>
      </section>
    </PageShell>
  );
}
