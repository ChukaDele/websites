"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Article } from "../../lib/insights";
import { trackEvent, trackOnce, deviceGroup, trafficGroup } from "../../lib/analytics";
import type { TocItem } from "./Article";
import { NewsletterField } from "../site/NewsletterField";

/**
 * The interactive half of the insight article template (contents rail, reading
 * progress, copy buttons, analytics). The article data is resolved on the server
 * by ArticleLayout in ./Article and passed in, so the full insights catalogue in
 * lib/insights.ts never ships to the browser.
 */

export type RelatedCard = Pick<Article, "slug" | "category" | "title" | "blurb" | "read">;

const HEADER_OFFSET = 96;

function fmtDate(iso: string) {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

export function ArticleShell({ slug, meta, related, jsonLd, toc, heroDiagram, children }: { slug: string; meta?: Article; related: RelatedCard[]; jsonLd?: string; toc: TocItem[]; heroDiagram?: ReactNode; children: ReactNode }) {
  const articleRef = useRef<HTMLDivElement>(null);

  // Every code block in the body gets a copy button. Added after hydration
  // so article pages can keep writing plain <pre> blocks.
  useEffect(() => {
    const root = articleRef.current;
    if (!root) return;
    const added: HTMLButtonElement[] = [];
    root.querySelectorAll("pre").forEach((pre) => {
      if (pre.parentElement?.classList.contains("in-code")) return;
      const wrap = document.createElement("div");
      wrap.className = "in-code";
      pre.replaceWith(wrap);
      wrap.appendChild(pre);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "in-copy";
      btn.textContent = "Copy";
      btn.setAttribute("aria-label", "Copy code");
      btn.addEventListener("click", async () => {
        const text = pre.innerText;
        let ok = false;
        try { await navigator.clipboard.writeText(text); ok = true; } catch { ok = false; }
        btn.textContent = ok ? "Copied" : "Copy failed";
        window.setTimeout(() => { btn.textContent = "Copy"; }, 1800);
        trackEvent("code_copy", { slug });
      });
      wrap.appendChild(btn);
      added.push(btn);
    });
    return () => added.forEach((b) => b.remove());
  }, [slug]);
  const items: TocItem[] = [
    { id: "short-answer", label: "The short answer" },
    { id: "at-a-glance", label: "At a glance" },
    ...toc,
    { id: "faq", label: "Questions people ask" },
    ...(meta?.sources?.length ? [{ id: "sources", label: "Sources" }] : []),
  ];
  const [active, setActive] = useState<string>(items[0].id);
  const [progress, setProgress] = useState(0);
  const [tocOpen, setTocOpen] = useState(false);

  const ctx = () => ({ article_slug: slug, article_category: meta?.category ?? "", device_group: deviceGroup(), traffic_group: trafficGroup() });

  useEffect(() => {
    trackOnce("insight_view", ctx());
    const article = articleRef.current;
    if (!article) return;

    const els = items.map((t) => document.getElementById(t.id)).filter(Boolean) as HTMLElement[];
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

      // active section: the last heading that has passed under the header
      let current = els[0]?.id ?? "";
      for (const el of els) { if (el.getBoundingClientRect().top - HEADER_OFFSET - 8 <= 0) current = el.id; }
      if (current) setActive(current);
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
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET, behavior: reduce ? "auto" : "smooth" });
    try { history.replaceState(null, "", `#${id}`); } catch { /* noop */ }
    trackEvent("insight_toc_click", { ...ctx(), section: id });
    setTocOpen(false);
  }

  if (!meta) return <article className="section-wrap">{children}</article>;

  const [noteBefore, noteAfter] = meta.service.note.split(meta.service.label);
  const serviceClick = (where: string) => () => trackEvent("insight_service_click", { ...ctx(), service: meta.service.href, cta_location: where });

  return (
    <div className="in-a">
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />}
      <div className="in-progress" aria-hidden="true"><span style={{ transform: `scaleX(${progress / 100})` }} /></div>

      <header className="in-head section-wrap">
        <p className="in-crumb"><a href="/insights">Insights</a> / {meta.category}</p>
        {/* AUTHOR: when a verified named author exists, show their name and role here and in insightJsonLd. */}
        <p className="in-meta">
          <span>The Bredge</span>
          <span aria-hidden="true">·</span>
          <span>Updated <time dateTime={meta.updated || meta.date}>{fmtDate(meta.updated || meta.date)}</time></span>
          <span aria-hidden="true">·</span>
          <span>{meta.read}</span>
        </p>
        <h1>{meta.title}</h1>
        <p className="in-dek">{meta.standfirst}</p>
        <p className="in-for"><span>Written for</span>{meta.audiences.map((a) => <b key={a}>{a}</b>)}</p>
      </header>

      <div className="in-body section-wrap">
        <aside className="in-toc" aria-label="In this article">
          <p>In this article</p>
          <ol>
            {items.map((t) => (
              <li key={t.id}><a href={`#${t.id}`} className={active === t.id ? "is-on" : undefined} aria-current={active === t.id ? "location" : undefined} onClick={(e) => goTo(e, t.id)}>{t.label}</a></li>
            ))}
          </ol>
          <a className="in-toc-cta" href="/data-diagnostic" onClick={() => trackEvent("insight_service_click", { ...ctx(), service: "/data-diagnostic", cta_location: "rail" })}>Get a Data Diagnostic <span aria-hidden="true">↗</span></a>
        </aside>

        <div ref={articleRef} className="in-main">
          <details className="in-toc-mobile" open={tocOpen} onToggle={(e) => setTocOpen((e.target as HTMLDetailsElement).open)}>
            <summary>In this article</summary>
            <ol>{items.map((t) => <li key={t.id}><a href={`#${t.id}`} onClick={(e) => goTo(e, t.id)}>{t.label}</a></li>)}</ol>
          </details>

          <section id="short-answer" className="in-answer" aria-label="The short answer">
            <p className="in-label">The short answer</p>
            <p>{meta.answer}</p>
          </section>

          <section id="at-a-glance" className="in-glance">
            <h2>At a glance</h2>
            <ul>{meta.glance.map((t) => <li key={t}>{t}</li>)}</ul>
          </section>

          {heroDiagram && <div className="in-hero-fig">{heroDiagram}</div>}

          {children}

          <section id="faq" className="in-sec">
            <h2>Questions people ask</h2>
            {meta.faq.map(([q, ans]) => (
              <details key={q} name="in-faq" className="in-faq"><summary>{q}</summary><p>{ans}</p></details>
            ))}
          </section>

          {meta.sources && meta.sources.length > 0 && (
            <section id="sources" className="in-sec in-sources" aria-label="Sources">
              <h2>Sources</h2>
              <p>The mechanics described above follow the vendor and standards documentation below. Check it for changes before relying on a specific setting or limit.</p>
              <ol>
                {meta.sources.map(([label, url]) => (
                  <li key={url}><a href={url} target="_blank" rel="noopener noreferrer">{label}</a> <span>{new URL(url).hostname.replace(/^www\./, "")}</span></li>
                ))}
              </ol>
            </section>
          )}

<section className="nl-inline " aria-label="The monthly brief">
            <div><h2>Get the next guide like this</h2><p>One email a month: new guides and free tools for the people who run the numbers.</p></div>
            <NewsletterField source="article" />
          </section>

          <section className="in-cta" aria-label="Work with The Bredge">
            <h2>Want this fixed on your own data?</h2>
            <p>{noteBefore}<a href={meta.service.href} onClick={serviceClick("cta_note")}>{meta.service.label}</a>{noteAfter || "."}</p>
            <div>
              <a className="button" href="/schedule" onClick={() => trackEvent("schedule_click", { ...ctx(), cta_location: "insight_cta" })}>Book a 30-minute call <span aria-hidden="true" className="arrow">↗</span></a>
              <a className="text-link" href="/data-diagnostic" onClick={serviceClick("cta_diagnostic")}>Or start with a Data Diagnostic</a>
            </div>
          </section>
        </div>
      </div>

      {related.length > 0 && (
        <section className="in-related section-wrap" aria-label="Related insights">
          <p className="in-label">Keep reading</p>
          <div className="in-related-grid">
            {related.map((r) => (
              <a key={r.slug} href={`/insights/${r.slug}`} className="in-card" onClick={() => trackEvent("insight_related_click", { ...ctx(), article_slug: r.slug })}>
                <small>{r.category}</small>
                <h3>{r.title}</h3>
                <p>{r.blurb}</p>
                <footer><span>{r.read}</span><span className="in-go" aria-hidden="true">↗</span></footer>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

