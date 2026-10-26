import type { Metadata } from "next";
import { PageShell } from "../../components/site/PageShell";
import { ResourceIndex } from "../../components/resources/ResourceIndex";
import { PixelMass } from "../../components/resources/PixelMass";
import "../insights.css";
import { pageMetadata } from "../../lib/seo";
import { resources, ICP_LABEL, TOPICS } from "../../lib/resources";

export const metadata: Metadata = pageMetadata({
  title: "Free Data Tools: Warehouse Cost, dbt, SaaS Metrics, Hiring",
  description: "Free tools for UK and US data teams: BigQuery and Snowflake cost estimator, dbt incremental strategy picker, backfill planner, SaaS metrics, hiring costs.",
  path: "/resources",
});

export default function ResourcesIndex() {
  const featured = resources.find((r) => r.featured) ?? resources[0];
  const rest = resources.filter((r) => r.slug !== featured.slug);
  const jsonLd = [
    {
      "@context": "https://schema.org", "@type": "CollectionPage", name: "Resources", url: "https://thebredge.com/resources",
      description: "Free working tools for warehouse cost, dbt incremental strategy, freshness SLAs, backfills, data hiring costs, project briefs, SaaS metrics, KPI definitions and reconciliation.",
      mainEntity: { "@type": "ItemList", itemListElement: resources.map((r, i) => ({ "@type": "ListItem", position: i + 1, name: r.title, url: `https://thebredge.com/resources/${r.slug}` })) },
    },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://thebredge.com/" },
      { "@type": "ListItem", position: 2, name: "Resources", item: "https://thebredge.com/resources" },
    ] },
  ];

  return (
    <PageShell overlay>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* Hero after the pixel-landscape reference (PixelMass). */}
      <section className="pxh" aria-labelledby="pxh-title">
        <PixelMass className="pxh-field" />
        <div className="pxh-top">
          <p className="pxh-label" data-pixel-clear>Resources</p>
          <h1 id="pxh-title" className="pxh-h1" data-pixel-clear>Free tools for the data decisions in front of you.</h1>
        </div>
        {/* The featured tool, as the hero's note. */}
        <a className="pxh-note pxh-feature" href={`/resources/${featured.slug}`} data-pixel-clear>
          <small>Featured · {featured.kind}</small>
          <b>{featured.title}</b>
          <span>{featured.dek}</span>
          <em>Open the {featured.kind.toLowerCase()} <span aria-hidden="true">↗</span></em>
        </a>
      </section>

      <ResourceIndex
        items={rest.map(({ slug, title, blurb, kind, minutes, icps, topic }) => ({ slug, title, blurb, kind, minutes, icps, topic }))}
        icpLabels={ICP_LABEL}
        topics={TOPICS}
      />

    </PageShell>
  );
}
