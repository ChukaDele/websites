"use client";
/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import type { Icp, Topic } from "../../lib/resources";

export type ResourceCard = { slug: string; title: string; blurb: string; kind: string; minutes: string; icps: Icp[]; topic: Topic };

/* Filterable card grid, the same tiles as the Insights index (in-* classes in
 * app/insights.css): chips, three columns of picture, label, title, summary
 * and meta, nine at a time with "Load more". One row of topic chips, no
 * heading or count. Every card is in the server HTML (crawlable); the topic
 * and the limit only hide cards. */
const PAGE = 9;
// Placeholder pictures (black-and-white landscapes), one per tile in turn
// until each tool has its own.
const TILE_PICS = Array.from({ length: 9 }, (_, i) => `/media/resources/tile-${i + 1}.webp`);
export function ResourceIndex({ items, icpLabels, topics }: { items: ResourceCard[]; icpLabels: Record<Icp, string>; topics: Topic[] }) {
  const [topic, setTopic] = useState<Topic | "">("");
  const match = (r: ResourceCard) => !topic || r.topic === topic;
  const shown = items.filter(match).length;
  const usedTopics = topics.filter((t) => items.some((r) => r.topic === t));
  const [limit, setLimit] = useState(PAGE);
  const visible = new Set(items.filter(match).slice(0, limit).map((r) => r.slug));
  const pickTopic = (t: Topic | "") => { setTopic(t); setLimit(PAGE); };

  return (
    <section className="section-wrap in-ix rs-index" aria-label="Every tool, by topic">
      <div className="in-filters rs-topics" role="group" aria-label="Filter by topic">
        <button type="button" className="in-chip" aria-pressed={!topic} onClick={() => pickTopic("")}>All</button>
        {usedTopics.map((t) => (
          <button key={t} type="button" className="in-chip" aria-pressed={topic === t} onClick={() => pickTopic(topic === t ? "" : t)}>{t}</button>
        ))}
      </div>
      <ul className="in-grid">
        {items.map((r, i) => (
          <li key={r.slug} hidden={!visible.has(r.slug)}>
            <a className="in-card" href={`/resources/${r.slug}`}>
              <span className="in-media" aria-hidden="true">
                <img src={TILE_PICS[i % TILE_PICS.length]} alt="" width={960} height={660} loading={i < 3 ? "eager" : "lazy"} decoding="async" />
              </span>
              <small>{r.topic} · {r.kind}</small>
              <h3>{r.title}</h3>
              <p>{r.blurb}</p>
              <footer>
                <span className="in-tags">{r.icps.slice(0, 2).map((i) => icpLabels[i]).join(" · ")} · {r.minutes}</span>
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
