import type { MetadataRoute } from "next";

const base = "https://thebredge.com";

const routes: Array<[string, number, MetadataRoute.Sitemap[number]["changeFrequency"]]> = [
  ["/", 1, "weekly"],
  ["/services", 0.9, "monthly"],
  ["/services/embedded-data-team", 0.8, "monthly"],
  ["/services/data-projects", 0.8, "monthly"],
  ["/data-diagnostic", 0.8, "monthly"],
  ["/how-we-work", 0.6, "monthly"],
  ["/about", 0.6, "monthly"],
  ["/contact", 0.7, "monthly"],
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return routes.map(([path, priority, changeFrequency]) => ({
    url: `${base}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
