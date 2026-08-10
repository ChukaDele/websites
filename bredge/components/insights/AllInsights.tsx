"use client";

import { useState } from "react";
import { articles, CATEGORIES, type Category } from "../../lib/insights";

/* Lightweight category tabs over a ruled editorial list. All rows are rendered
 * server-side (crawlable); the filter only hides non-matching rows client-side. */
export function AllInsights() {
  const [cat, setCat] = useState<Category | "All">("All");
  return (
    <section className="section-wrap insights-all" aria-label="All insights">
      <div className="insights-all-head">
        <p className="eyebrow">ALL INSIGHTS</p>
        <div className="insights-tabs" role="tablist" aria-label="Filter by topic">
          <button role="tab" aria-selected={cat === "All"} className={cat === "All" ? "on" : ""} onClick={() => setCat("All")}>All</button>
          {CATEGORIES.map((c) => (
            <button key={c} role="tab" aria-selected={cat === c} className={cat === c ? "on" : ""} onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>
      </div>
      <ul className="insights-list">
        {articles.map((a) => (
          <li key={a.slug} hidden={cat !== "All" && a.category !== cat}>
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
