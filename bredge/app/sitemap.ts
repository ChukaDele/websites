import type { MetadataRoute } from "next";
import { articles } from "../lib/insights";
import { resources } from "../lib/resources";

const base = "https://thebredge.com";

// Canonical, indexable public pages only. /schedule and /contact are conversion
// utilities (excluded/low intent); API, 404 and previews are never listed. No
// per-request lastModified — we don't fake freshness.
const routes: Array<[string, number, MetadataRoute.Sitemap[number]["changeFrequency"]]> = [
  ["/", 1, "weekly"],
  ["/services", 0.9, "monthly"],
  ["/services/embedded-data-team", 0.8, "monthly"],
  ["/services/data-projects", 0.8, "monthly"],
  ["/data-diagnostic", 0.8, "monthly"],
  ["/how-we-work", 0.6, "monthly"],
  ["/about", 0.6, "monthly"],
  ["/insights", 0.7, "weekly"],
  ["/resources", 0.6, "monthly"],
  ["/contact", 0.5, "monthly"],
];

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = routes.map(([path, priority, changeFrequency]) => ({ url: `${base}${path}`, changeFrequency, priority }));
  const posts = articles.map((a) => ({ url: `${base}/insights/${a.slug}`, changeFrequency: "yearly" as const, priority: 0.6 }));
  const res = resources.map((r) => ({ url: `${base}/resources/${r.slug}`, changeFrequency: "yearly" as const, priority: 0.5 }));
  return [...pages, ...posts, ...res];
}
