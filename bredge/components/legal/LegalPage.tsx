import type { ReactNode } from "react";
import "../../app/legal.css";

/**
 * Shared reading layout for the legal pages (privacy, cookies, terms).
 * Mirrors the research article: breadcrumb and meta line, calm H1, sticky
 * contents rail on desktop, one 720px measure, a summary box that is clearly
 * labelled as a summary, and a dark green contact panel.
 */

export type LegalSection = { id: string; heading: string; body: ReactNode };

export function LegalPage({
  label,
  path,
  title,
  dek,
  updated,
  summary,
  sections,
  footnote,
}: {
  label: string;
  path: string;
  title: string;
  dek: ReactNode;
  updated?: string;
  summary: string[];
  sections: LegalSection[];
  footnote?: ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://thebredge.com/" },
      { "@type": "ListItem", position: 2, name: label, item: `https://thebredge.com${path}` },
    ],
  };

  return (
    <article className="lg">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="lg-head section-wrap">
        <p className="lg-crumb"><a href="/">Home</a> / Legal / {label}</p>
        <p className="lg-meta">{updated ? `Last updated ${updated} · ` : ""}{sections.length} sections · Short read</p>
        <h1>{title}</h1>
        <p className="lg-dek">{dek}</p>
      </header>

      <div className="lg-body section-wrap">
        <aside className="lg-toc" aria-label="On this page">
          <p>On this page</p>
          <ol>
            <li><a href="#summary">In plain English</a></li>
            {sections.map((s) => <li key={s.id}><a href={`#${s.id}`}>{s.heading}</a></li>)}
            <li><a href="#contact">Contact</a></li>
          </ol>
          <nav className="lg-legal-links" aria-label="Legal pages">
            <a href="/privacy" aria-current={path === "/privacy" ? "page" : undefined}>Privacy</a>
            <a href="/cookies" aria-current={path === "/cookies" ? "page" : undefined}>Cookies</a>
            <a href="/terms" aria-current={path === "/terms" ? "page" : undefined}>Terms</a>
          </nav>
        </aside>

        <div className="lg-main">
          <section id="summary" className="lg-summary" aria-labelledby="summary-h">
            <h2 id="summary-h">In plain English</h2>
            <ul>{summary.map((t) => <li key={t}>{t}</li>)}</ul>
            <p className="lg-summary-note">This is a short summary to help you read the page. It does not replace or change the text below.</p>
          </section>

          {sections.map((s) => (
            <section key={s.id} id={s.id} className="lg-sec">
              <h2>{s.heading}</h2>
              {s.body}
            </section>
          ))}

          {footnote && <div className="lg-foot">{footnote}</div>}

          <section id="contact" className="lg-cta">
            <h2>Questions about this page?</h2>
            <p>Email us and a person from the team will reply.</p>
            <div><a className="button" href="mailto:hello@thebredge.com">hello@thebredge.com <span aria-hidden="true" className="arrow">↗</span></a></div>
          </section>
        </div>
      </div>
    </article>
  );
}
