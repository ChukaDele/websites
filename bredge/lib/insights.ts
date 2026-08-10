/* Published Insights articles. Only real, substantive pieces live here — the
 * index, nav and sitemap are all driven from this list. */
export type Article = { slug: string; category: string; title: string; blurb: string; read: string };

export const articles: Article[] = [
  {
    slug: "why-dashboards-disagree",
    category: "Reliability",
    title: "Why your dashboards disagree — and why rebuilding the dashboard won’t fix it",
    blurb: "When finance and sales quote different numbers, the problem is almost never the chart. It’s upstream — in identity, reconciliation and definitions.",
    read: "6 min read",
  },
  {
    slug: "when-to-hire-a-data-team",
    category: "Capability",
    title: "When should a growing company hire a data team?",
    blurb: "The signs you’ve outgrown spreadsheets and one analyst — and how to choose between hiring, a fractional team, and an embedded model.",
    read: "5 min read",
  },
  {
    slug: "before-you-build-a-data-warehouse",
    category: "Architecture",
    title: "Before you build a data warehouse, answer these questions",
    blurb: "A warehouse solves specific problems. Build it before you have them and you inherit cost and complexity you didn’t need. The questions that decide scope.",
    read: "5 min read",
  },
];
