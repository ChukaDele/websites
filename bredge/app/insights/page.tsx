import type { Metadata } from "next";
import { PageShell } from "../../components/site/PageShell";
import { pageMetadata } from "../../lib/seo";
import { articles, FEATURED_SLUG, getArticle } from "../../lib/insights";
import { AllInsights } from "../../components/insights/AllInsights";
import { HalftoneRing } from "../../components/insights/HalftoneRing";

export const metadata: Metadata = pageMetadata({
  title: "Data, Analytics and BI Guides | The Bredge Insights",
  description: "Practical data guides for small businesses, startups and large data teams: revenue reconciliation, MRR, warehouse costs, CDC, SCD2 and Power BI.",
  path: "/insights",
});

const insightsCollectionLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "The Bredge Insights",
  url: "https://thebredge.com/insights",
  inLanguage: "en-GB",
  description: "Practical guides on data engineering, analytics, business intelligence, data reliability and reporting systems.",
  isPartOf: { "@id": "https://thebredge.com/#website" },
  mainEntity: {
    "@type": "ItemList",
    itemListElement: articles.map((article, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `https://thebredge.com/insights/${article.slug}`,
      name: article.title,
    })),
  },
};

export default function InsightsPage() {
  const featured = getArticle(FEATURED_SLUG)!;
  return (
    <PageShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(insightsCollectionLd) }} />
      {/* Hero (after the Selecta reference): framed white page, chip, a
          two-tone headline, intro, two buttons, and a halftone ring rising
          from the bottom edge. */}
      <section className="ixs" aria-labelledby="ixs-title">
        <span className="ixs-tick is-l" aria-hidden="true" /><span className="ixs-tick is-r" aria-hidden="true" />
        <div className="ixs-frame">
          <p className="ixs-chip"><b>New</b>Insights</p>
          <h1 id="ixs-title" className="ixs-h1"><span>The problems behind</span> <span className="is-soft">the dashboard.</span></h1>
          <p className="ixs-lede">Practical writing on data engineering, analytics and the organisational reasons good data work still fails — with checks you can run yourself before anyone rebuilds anything.</p>
          <div className="ixs-actions">
            <a className="ixs-btn is-dark" href={`/insights/${featured.slug}`}>Read the featured guide</a>
            <a className="ixs-btn" href="#in-all">Browse every guide</a>
          </div>
          <HalftoneRing className="ixs-ring" />
        </div>
        <div className="ixs-band" aria-hidden="true" />
      </section>

      <AllInsights />
    </PageShell>
  );
}
