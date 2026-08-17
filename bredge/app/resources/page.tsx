import type { Metadata } from "next";
import { PageShell } from "../../components/site/PageShell";
import { pageMetadata } from "../../lib/seo";
import { resources } from "../../lib/resources";

export const metadata: Metadata = pageMetadata({
  title: "Free data checklists & decision guides | The Bredge",
  description: "Free, ungated checklists and decision guides for data reliability, reporting, warehouses, hiring and data quality. Each links to the deeper explanation.",
  path: "/resources",
});

const resourcesSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": "https://thebredge.com/resources",
      name: "The Bredge resources",
      url: "https://thebredge.com/resources",
      description: "Free, practical data checklists and decision guides.",
      mainEntity: { "@id": "https://thebredge.com/resources#items" },
    },
    {
      "@type": "ItemList",
      "@id": "https://thebredge.com/resources#items",
      itemListElement: resources.map((resource, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: resource.title,
        url: `https://thebredge.com/resources/${resource.slug}`,
      })),
    },
  ],
};

export default function ResourcesIndex() {
  return (
    <PageShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(resourcesSchema) }} />
      <section className="section-wrap insights-hero">
        <p className="eyebrow">RESOURCES</p>
        <h1>Checklists you can use today.</h1>
        <p className="lede">Practical, ungated tools taken from our Insights. No email required. Print any of them, or open the full explanation behind each.</p>
      </section>
      <section className="section-wrap insights-all">
        <ul className="insights-list">
          {resources.map((r) => (
            <li key={r.slug}>
              <a href={`/resources/${r.slug}`}>
                <span className="insight-cat">{r.kind}</span>
                <span className="insights-list-title">{r.title}</span>
                <span className="insight-meta">Open <span className="arrow" aria-hidden="true">↗</span></span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </PageShell>
  );
}
