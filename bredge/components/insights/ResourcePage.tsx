import type { ReactNode } from "react";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { PageShell } from "../site/PageShell";
import { getResource, resources, ICP_LABEL } from "../../lib/resources";
import { getArticle } from "../../lib/insights";
import { PrintButton } from "./PrintButton";
import { NewsletterField } from "../site/NewsletterField";

/**
 * A resource page in the research layout: answer first, who it is for and what
 * you leave with, then the working tool, the method behind it, questions and
 * the next step. The tool itself is passed in as children.
 */
export function ResourcePage({ slug, children }: { slug: string; children?: ReactNode }) {
  const r = getResource(slug);
  if (!r) return <PageShell><div className="section-wrap" style={{ padding: "96px 0" }}>Not found.</div></PageShell>;
  const article = getArticle(r.article);
  const url = `https://thebredge.com/resources/${slug}`;
  const updated = new Date(`${r.updated}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const picked = (r.tools ?? []).map((t) => resources.find((x) => x.slug === t)).filter((x): x is NonNullable<typeof x> => !!x);
  const readNext = [r.article, ...(r.insights ?? [])].filter((v, i, a) => a.indexOf(v) === i).map((sl) => ({ sl, a: getArticle(sl) })).filter((x) => x.a);
  const related = picked.length ? picked.slice(0, 2) : resources
    .filter((x) => x.slug !== slug)
    .map((x) => ({ x, score: x.icps.filter((i) => r.icps.includes(i)).length + (x.topic === r.topic ? 2 : 0) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map(({ x }) => x);

  const jsonLd = [
    {
      "@context": "https://schema.org", "@type": "WebPage", name: r.seoTitle, headline: r.h1, description: r.seoDescription, url,
      dateModified: r.updated, inLanguage: "en-GB", isAccessibleForFree: true,
      author: { "@type": "Organization", name: "The Bredge", url: "https://thebredge.com" },
      publisher: { "@type": "Organization", name: "The Bredge", url: "https://thebredge.com" },
    },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://thebredge.com/" },
      { "@type": "ListItem", position: 2, name: "Resources", item: "https://thebredge.com/resources" },
      { "@type": "ListItem", position: 3, name: r.title, item: url },
    ] },
    {
      "@context": "https://schema.org", "@type": "HowTo", name: r.h1, description: r.dek,
      step: r.howTo.map((text, i) => ({ "@type": "HowToStep", position: i + 1, text })),
    },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: r.faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
  ];

  return (
    <PageShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article className="rs">
        <header className="rs-head section-wrap">
          <p className="rs-crumb"><a href="/resources">Resources</a> / {r.topic}</p>
          <p className="rs-meta">{r.kind} · {r.minutes} · Updated {updated}</p>
          <h1>{r.h1}</h1>
          <p className="rs-dek">{r.dek}</p>
          <dl className="rs-facts">
            <div><dt>Who it is for</dt><dd>{r.forWho}</dd></div>
            <div><dt>You leave with</dt><dd>{r.outcome}</dd></div>
          </dl>
          <div className="rs-head-actions">
            <a className="rs-btn rs-btn-dark" href="#tool">Open the tool <span className="arrow" aria-hidden="true">↓</span></a>
            <PrintButton />
            <span className="rs-free">Free. No email required.</span>
          </div>
        </header>

        <div className="rs-body section-wrap">
          <aside className="rs-toc" aria-label="On this page">
            <p>On this page</p>
            <ol>
              <li><a href="#how">How to use it</a></li>
              {(r.toolToc ?? [{ id: "tool", label: "The tool" }]).map((t) => <li key={t.id}><a href={`#${t.id}`}>{t.label}</a></li>)}
              <li><a href="#why">Why this works</a></li>
              <li><a href="#rs-readnext">Read next</a></li>
              <li><a href="#faq">Questions</a></li>
            </ol>
            <p className="rs-toc-for">For {r.icps.map((i) => ICP_LABEL[i]).join(", ").toLowerCase()}</p>
          </aside>

          <div className="rs-main">
            <section id="how" className="rs-glance">
              <h2>How to use it</h2>
              <ol>{r.howTo.map((s) => <li key={s}>{s}</li>)}</ol>
            </section>

            <section id="tool" className="rs-tool" aria-label={r.title}>
              {children}
            </section>

            <section id="why" className="rs-sec">
              <h2>Why this works</h2>
              {r.context.map((p) => <p key={p}>{p}</p>)}
              {r.sources && r.sources.length > 0 && (
                <div className="rs-sources">
                  <h3>Sources</h3>
                  <p>Official documentation and standards this tool relies on, checked {updated}:</p>
                  <ul>{r.sources.map((x) => <li key={x.href}><a href={x.href} rel="noopener noreferrer" target="_blank">{x.label}</a></li>)}</ul>
                </div>
              )}
              {article && (
                <p className="rs-related-line">
                  The full reasoning, with examples, is in our insight <a href={`/insights/${r.article}`}>{article.title}</a>.
                </p>
              )}
            </section>

            <nav className="rs-sec rs-readnext" aria-labelledby="rs-readnext">
              <h2 id="rs-readnext">Read next</h2>
              <ul>
                {readNext.map(({ sl, a }) => <li key={sl}><small>Insight</small><a href={`/insights/${sl}`}>{a!.title}</a></li>)}
                {related.map((x) => <li key={x.slug}><small>Tool</small><a href={`/resources/${x.slug}`}>{x.h1}</a></li>)}
                {r.service && <li><small>Service</small><a href={r.service.href}>{r.service.label}</a><span>{r.service.why}</span></li>}
                <li><small>Examples</small><a href="/work">See data projects we have delivered</a></li>
              </ul>
            </nav>

            <section id="faq" className="rs-sec">
              <h2>Questions</h2>
              {r.faq.map(([q, a]) => (
                <details key={q} name="rs-faq" className="rs-faq"><summary>{q}</summary><p>{a}</p></details>
              ))}
            </section>

<section className="nl-inline " aria-label="The monthly brief">
              <div><h2>Get the next guide like this</h2><p>One email a month: new guides and free tools for the people who run the numbers.</p></div>
              <NewsletterField source="tool" />
            </section>

            <section className="rs-cta">
              <h2>{r.cta.title}</h2>
              <p>{r.cta.body}</p>
              <div>
                <a className="button" href="/schedule">Book a 30-minute call <span aria-hidden="true" className="arrow">↗</span></a>
                <a className="text-link" href={r.cta.secondary?.href ?? "/data-diagnostic"}>{r.cta.secondary?.label ?? "Or start with a Data Diagnostic"}</a>
              </div>
            </section>

            <nav className="rs-more" aria-label="More resources">
              <p>More working tools</p>
              <ul>
                {related.map((x) => (
                  <li key={x.slug}>
                    <a href={`/resources/${x.slug}`}>
                      <small>{x.kind}</small>
                      <span>{x.title}</span>
                      <i className="rs-go" aria-hidden="true"><ArrowUpRight size={14} weight="bold" /></i>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </article>
    </PageShell>
  );
}
