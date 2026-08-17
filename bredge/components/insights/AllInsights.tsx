"use client";

import { useState } from "react";
import { articles, CATEGORIES, type Category } from "../../lib/insights";

/* Lightweight topic filters over a ruled editorial list. All rows are rendered
 * server-side (crawlable); the filter only changes the client-side view. */
export function AllInsights() {
  const [cat, setCat] = useState<Category | "All">("All");
  const visibleArticles = cat === "All" ? articles : articles.filter((article) => article.category === cat);
  return (
    <section className="section-wrap insights-all" aria-label="All insights">
      <div className="insights-all-head">
        <p className="eyebrow">ALL INSIGHTS</p>
        <div className="insights-tabs" role="group" aria-label="Filter insights by topic">
          <button type="button" aria-pressed={cat === "All"} className={cat === "All" ? "on" : ""} onClick={() => setCat("All")}>All</button>
          {CATEGORIES.map((c) => (
            <button type="button" key={c} aria-pressed={cat === c} className={cat === c ? "on" : ""} onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>
      </div>
      <p className="insights-filter-status" role="status" aria-live="polite">
        Showing {visibleArticles.length} {visibleArticles.length === 1 ? "insight" : "insights"}{cat === "All" ? "" : ` about ${cat}`}.
      </p>
      <ul className="insights-list">
        {visibleArticles.map((a) => (
          <li key={a.slug}>
            <a href={`/insights/${a.slug}`}>
              <span className="insight-cat">{a.category}</span>
              <span className="insights-list-title">{a.title}</span>
              <span className="insight-meta">{a.read} <span className="arrow" aria-hidden="true">↗</span></span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
