"use client";

import { useState } from "react";

export type Article = { title: string; category: string; status?: string };

const categories = ["All", "Data systems", "Analytics & BI", "Data reliability", "Running a data function"];

export function InsightsGrid({ articles }: { articles: Article[] }) {
  const [active, setActive] = useState("All");
  const shown = active === "All" ? articles : articles.filter((a) => a.category === active);

  return (
    <>
      <div className="cat-row" role="group" aria-label="Filter insights by category">
        {categories.map((c) => (
          <button key={c} className="cat-chip" aria-pressed={active === c} onClick={() => setActive(c)} type="button">{c}</button>
        ))}
      </div>
      <div className="article-grid">
        {shown.map((a) => (
          <article className="article-card forthcoming" key={a.title}>
            <span className="k">{a.category.toUpperCase()}</span>
            <h3>{a.title}</h3>
            <span className="status">Writing in progress</span>
          </article>
        ))}
      </div>
    </>
  );
}
