"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { getArticle } from "../../lib/insights";
import { trackEvent, trackOnce, deviceGroup, trafficGroup } from "../../lib/analytics";

export type TocItem = { id: string; label: string };

const HEADER_OFFSET = 84;

function fmtDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return `${d} ${months[m - 1]} ${y}`;
}

export function ArticleLayout({ slug, toc, heroDiagram, children }: { slug: string; toc: TocItem[]; heroDiagram?: ReactNode; children: ReactNode }) {
  const meta = getArticle(slug);
  const articleRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState<string>(toc[0]?.id ?? "");
  const [progress, setProgress] = useState(0);
  const [tocOpen, setTocOpen] = useState(false);

  const ctx = () => ({ article_slug: slug, article_category: meta?.category ?? "", device_group: deviceGroup(), traffic_group: trafficGroup() });

  useEffect(() => {
    trackOnce("insight_view", ctx());
    const article = articleRef.current;
    if (!article) return;

    // Scrollspy — highlight the section nearest the top; update hash without navigation.
    const ids = toc.map((t) => t.id);
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const onScroll = () => {
      // reading progress across the article body only
      const rect = article.getBoundingClientRect();
      const total = article.offsetHeight - window.innerHeight;
      const scrolled = Math.min(Math.max(-rect.top, 0), Math.max(total, 1));
      const pct = total > 0 ? Math.round((scrolled / total) * 100) : 0;
      setProgress(pct);
      if (pct >= 25) trackOnce("insight_25", ctx());
      if (pct >= 50) trackOnce("insight_50", ctx());
      if (pct >= 75) trackOnce("insight_75", ctx());
      if (pct >= 92) trackOnce("insight_complete", ctx());

      // active section
      let current = els[0]?.id ?? "";
      for (const el of els) { if (el.getBoundingClientRect().top - HEADER_OFFSET - 8 <= 0) current = el.id; }
      if (current) setActive((prev) => {
        if (prev !== current) { try { history.replaceState(null, "", `#${current}`); } catch { /* noop */ } }
        return current;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  function goTo(e: React.MouseEvent, id: string) {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
    window.scrollTo({ top: y, behavior: "smooth" });
    try { history.replaceState(null, "", `#${id}`); } catch { /* noop */ }
    trackEvent("insight_toc_click", { ...ctx() });
    setTocOpen(false);
  }

  if (!meta) return <article className="section-wrap">{children}</article>;

  const related = meta.related.map(getArticle).filter(Boolean);
  const jsonLd = {
    "@context": "https://schema.org", "@type": "Article",
    headline: meta.title, description: meta.seoDescription,
    author: { "@type": "Organization", name: "The Bredge" },
    publisher: { "@type": "Organization", name: "The Bredge" },
    datePublished: meta.date, dateModified: meta.updated || meta.date,
    mainEntityOfPage: `https://thebredge.com/insights/${slug}`, articleSection: meta.category,
  };

  return (
    <div className="ax">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="ax-progress" aria-hidden="true"><span style={{ transform: `scaleX(${progress / 100})` }} /></div>

      <header className="ax-hero section-wrap">
        <p className="eyebrow">INSIGHTS · {meta.category.toUpperCase()}</p>
        <h1>{meta.title}</h1>
        <p className="ax-standfirst">{meta.standfirst}</p>
        <p className="ax-meta"><span>The Bredge</span><span>·</span><time dateTime={meta.date}>{fmtDate(meta.date)}</time><span>·</span><span>{meta.read}</span></p>
        {heroDiagram && <div className="ax-hero-diagram">{heroDiagram}</div>}
      </header>

      <div className="ax-grid section-wrap">
        <aside className="ax-rail" aria-label="On this page">
          <nav>
            <p className="ax-rail-title">ON THIS PAGE</p>
            <ul>
              {toc.map((t) => (
                <li key={t.id}><a href={`#${t.id}`} className={active === t.id ? "active" : ""} onClick={(e) => goTo(e, t.id)}>{t.label}</a></li>
              ))}
            </ul>
          </nav>
        </aside>

        <article ref={articleRef} className="ax-body">
          <details className="ax-toc-mobile" open={tocOpen} onToggle={(e) => setTocOpen((e.target as HTMLDetailsElement).open)}>
            <summary>On this page</summary>
            <ul>{toc.map((t) => <li key={t.id}><a href={`#${t.id}`} onClick={(e) => goTo(e, t.id)}>{t.label}</a></li>)}</ul>
          </details>
          {children}

          <section className="ax-next" aria-label="Where this goes next">
            <p className="ax-next-note">{meta.service.note.split(meta.service.label)[0]}<a href={meta.service.href} onClick={() => trackEvent("insight_service_click", { ...ctx(), service: meta.service.href })}>{meta.service.label}</a>{meta.service.note.split(meta.service.label)[1] || "."}</p>
          </section>
        </article>
      </div>

      {related.length > 0 && (
        <section className="ax-related section-wrap" aria-label="Related insights">
          <p className="eyebrow">RELATED INSIGHTS</p>
          <div className="ax-related-grid">
            {related.map((r) => r && (
              <a key={r.slug} href={`/insights/${r.slug}`} className="ax-related-card" onClick={() => trackEvent("insight_related_click", { ...ctx(), article_slug: r.slug })}>
                <span className="insight-cat">{r.category}</span>
                <h3>{r.title}</h3>
                <span className="insight-meta">{r.read} <span className="arrow" aria-hidden="true">↗</span></span>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/* DIY primitive — genuinely useful, never gated. */
export function TryThisFirst({ title = "Try this first", children }: { title?: string; children: ReactNode }) {
  return (
    <aside className="ax-diy" aria-label={title}>
      <p className="ax-diy-title">{title}</p>
      {children}
    </aside>
  );
}

/* Honest DIY → system boundary. */
export function SystemBoundary({ conditions, intro }: { conditions: string[]; intro?: string }) {
  return (
    <aside className="ax-boundary" aria-label="When this has become a system problem">
      <p className="ax-boundary-title">This has become a system problem when…</p>
      {intro && <p>{intro}</p>}
      <ul>{conditions.map((c, i) => <li key={i}>{c}</li>)}</ul>
    </aside>
  );
}

/* Diagram wrapper — reserves space, captions, allows wide break-out. */
export function Diagram({ title, caption, wide, children }: { title: string; caption?: string; wide?: boolean; children: ReactNode }) {
  return (
    <figure className={`ax-figure${wide ? " ax-figure-wide" : ""}`}>
      <div className="ax-figure-frame" role="img" aria-label={title}>{children}</div>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}
