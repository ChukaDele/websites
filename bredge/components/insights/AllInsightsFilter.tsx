"use client";
/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import type { Article, Audience, Category } from "../../lib/insights";

export type InsightCard = Pick<Article, "slug" | "category" | "audiences" | "title" | "blurb" | "read"> & { cover?: string };

/* Filterable card grid. Every card is rendered server-side (crawlable); the two
 * filters (topic, reader) only hide non-matching cards on the client. */
const PAGE = 9;
// Placeholder pictures (black-and-white landscapes, shared with Resources),
// one per tile in turn until each guide has its own.
const TILE_PICS = Array.from({ length: 9 }, (_, i) => `/media/resources/tile-${i + 1}.webp`);

export function AllInsightsFilter({ list, categories, heading }: { list: InsightCard[]; categories: Category[]; audiences?: Audience[]; heading?: React.ReactNode }) {
  const [cat, setCat] = useState<Category | "All">("All");
  const match = (a: InsightCard) => cat === "All" || a.category === cat;
  const shown = list.filter(match).length;
  // Nine at a time; "Load more" shows the next nine (all cards stay in the
  // HTML for crawlers, later ones just start hidden).
  const [limit, setLimit] = useState(PAGE);
  const visible = new Set(list.filter(match).slice(0, limit).map((a) => a.slug));

  return (
    <section className="section-wrap in-ix is-plain" id="in-all" aria-label="Every guide, by topic">
      {heading}
      <div className="in-filters is-row" role="group" aria-label="Filter by topic">
        {(["All", ...categories] as const).map((c) => (
          <button key={c} type="button" className="in-chip" aria-pressed={cat === c} onClick={() => { setCat(c); setLimit(PAGE); }}>{c}</button>
        ))}
      </div>
      <ul className="in-grid">
        {list.map((a, i) => (
          <li key={a.slug} hidden={!visible.has(a.slug)}>
            <a className="in-card" href={`/insights/${a.slug}`}>
              <span className="in-media" aria-hidden="true">
                <img src={TILE_PICS[i % TILE_PICS.length]} alt="" width={960} height={660} loading={i < 3 ? "eager" : "lazy"} decoding="async" />
              </span>
              <small>{a.category}</small>
              <h3>{a.title}</h3>
              <p>{a.blurb}</p>
              <footer>
                <span className="in-tags">{a.audiences.slice(0, 2).join(" · ")} · {a.read}</span>
                <span className="in-go" aria-hidden="true">↗</span>
              </footer>
            </a>
          </li>
        ))}
      </ul>
      {shown > limit && (
        <div className="in-more"><button type="button" onClick={() => setLimit((n) => n + PAGE)}>Load more</button></div>
      )}
    </section>
  );
}
