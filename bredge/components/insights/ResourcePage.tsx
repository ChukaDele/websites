import { PageShell } from "../site/PageShell";
import { getResource } from "../../lib/resources";
import { getArticle } from "../../lib/insights";
import { PrintButton } from "./PrintButton";

export function ResourcePage({ slug }: { slug: string }) {
  const r = getResource(slug);
  if (!r) return <PageShell><div className="section-wrap" style={{ padding: "96px 0" }}>Not found.</div></PageShell>;
  const article = getArticle(r.article);
  const breadcrumbLd = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://thebredge.com/" },
      { "@type": "ListItem", position: 2, name: "Resources", item: "https://thebredge.com/resources" },
      { "@type": "ListItem", position: 3, name: r.title, item: `https://thebredge.com/resources/${slug}` },
    ],
  };
  return (
    <PageShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <article className="resource section-wrap">
        <p className="eyebrow">RESOURCE · {r.kind.toUpperCase()}</p>
        <h1>{r.title}</h1>
        <p className="resource-intro">{r.intro}</p>
        <div className="resource-actions">
          <PrintButton />
          <span className="resource-free">Free. No email required.</span>
        </div>

        <div className="resource-body">
          {r.sections.map((s, i) => (
            <section key={i} className="resource-section">
              {s.heading && <h2>{s.heading}</h2>}
              <ol>{s.steps.map((step, j) => <li key={j}>{step}</li>)}</ol>
            </section>
          ))}
        </div>

        {article && (
          <p className="resource-back">Why this works, in depth: <a href={`/insights/${r.article}`}>{article.title}</a></p>
        )}
      </article>
    </PageShell>
  );
}
