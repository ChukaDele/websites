import type { ReactNode } from "react";
import { getArticle, insightJsonLd } from "../../lib/insights";
import { ArticleShell, type RelatedCard } from "./ArticleShell";
import "../../app/insights.css";

/**
 * Insight article template, in the research reading language: crumb and meta,
 * client-voiced H1 and standfirst, then a sticky contents rail beside one 720px
 * measure: direct answer, At a glance, the hero exhibit, then the body. The template owns the direct answer, "At a glance", the FAQ
 * (visible and as FAQPage JSON-LD) and the closing CTA, all from lib/insights.ts,
 * so every article opens by answering its own question.
 *
 * This is a server component: it looks the article up here and hands only that
 * article (and its two related cards) to the client shell.
 */

export type TocItem = { id: string; label: string };

export function ArticleLayout({ slug, toc, heroDiagram, children }: { slug: string; toc: TocItem[]; heroDiagram?: ReactNode; children: ReactNode }) {
  const meta = getArticle(slug);
  const related: RelatedCard[] = (meta?.related ?? [])
    .map(getArticle)
    .filter((a): a is NonNullable<typeof a> => !!a)
    .map(({ slug: s, category, title, blurb, read }) => ({ slug: s, category, title, blurb, read }));
  const jsonLd = meta ? JSON.stringify(insightJsonLd(meta)) : undefined;
  return <ArticleShell slug={slug} meta={meta} related={related} jsonLd={jsonLd} toc={toc} heroDiagram={heroDiagram}>{children}</ArticleShell>;
}

/* DIY primitive: genuinely useful, never gated. */
export function TryThisFirst({ title = "Try this first", children }: { title?: string; children: ReactNode }) {
  return (
    <aside className="in-diy" aria-label={title}>
      <p className="in-label">{title}</p>
      {children}
    </aside>
  );
}

/* Honest DIY to system boundary. */
export function SystemBoundary({ conditions, intro }: { conditions: string[]; intro?: string }) {
  return (
    <aside className="in-boundary" aria-label="When this has become a system problem">
      <p className="in-label">This has become a system problem when</p>
      {intro && <p>{intro}</p>}
      <ul>{conditions.map((c, i) => <li key={i}>{c}</li>)}</ul>
    </aside>
  );
}

/* A worked example. Always labelled: illustrative figures, never a client or a statistic. */
export function Example({ setting, title, children }: { setting: string; title: string; children: ReactNode }) {
  return (
    <aside className="in-example" aria-label={`Illustrative example: ${title}`}>
      <p className="in-example-tag"><b>Illustrative example</b><span>{setting}</span></p>
      <h3>{title}</h3>
      {children}
      <p className="in-example-note">Figures are invented to show the method. They are not from a client or a survey.</p>
    </aside>
  );
}

/* Pull quote: one key line from the surrounding section. */
export function Pull({ children }: { children: ReactNode }) {
  return <blockquote className="in-pull">{children}</blockquote>;
}

/* Numbered exhibit: reserves space, titles and captions the figure. Numbering is a CSS counter. */
export function Diagram({ title, caption, wide, children }: { title: string; caption?: string; wide?: boolean; children: ReactNode }) {
  return (
    <figure className={`in-fig${wide ? " in-fig-wide" : ""}`}>
      <figcaption><span className="in-fig-n" /><b>{title}</b></figcaption>
      <div className="in-fig-frame" role="img" aria-label={title}>{children}</div>
      {caption && <p className="in-fig-note">{caption}</p>}
    </figure>
  );
}

/* Plain-English summary for the non-technical reader of a technical article
 * (the CFO or founder it gets forwarded to). Sits near the top. */
export function PlainEnglish({ children }: { children: ReactNode }) {
  return (
    <aside className="in-plain" aria-label="In plain English">
      <p className="in-label">In plain English</p>
      {children}
    </aside>
  );
}

/* One line opening a technical section: what it means for the business. */
export function ForTheBusiness({ children }: { children: ReactNode }) {
  return <p className="in-biz"><b>For the business:</b> {children}</p>;
}

/* Collapsible technical detail inside a non-technical article, so a technical
 * reader can check the exact settings, code and limits. */
export function ForYourDataPerson({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="in-dp">
      <summary><span className="in-dp-tag">For your data person</span><span className="in-dp-title">{title}</span></summary>
      <div className="in-dp-body">{children}</div>
    </details>
  );
}
