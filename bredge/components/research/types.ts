/**
 * A research article: a long-form think piece built on one of The Bredge's
 * data briefs. Structured like a consulting report (summary first, numbered
 * exhibits, implications, method), written to be read like good journalism.
 * Every number must come from the published brief.
 */

export type Reader = "operator" | "investor" | "seller";

/** A numbered exhibit (chart) inside a section. */
export type Exhibit = {
  title: string;                       // e.g. "Headline inflation has fallen for two months"
  kind: "bars" | "line" | "hbars";     // column bars, line, or ranked horizontal bars
  unit: string;                        // shown after values, e.g. "%", "₦/day"
  points: Array<[label: string, value: number]>;
  highlight?: string;                  // label of the point to emphasise
  note?: string;                       // source line under the exhibit
};

export type Section = {
  id: string;                          // anchor, kebab-case
  heading: string;
  body: string[];                      // paragraphs (plain text, no markdown)
  exhibit?: Exhibit;
  pull?: string;                       // optional pull quote / key line from the body
};

export type Article = {
  slug: string;                        // url: /research/<slug>
  series: string;                      // e.g. "Inflation"
  issue: string;                       // e.g. "Data Brief No. 014"
  published: string;                   // ISO date, e.g. "2026-08-18"
  period: string;                      // e.g. "July 2026"
  title: string;                       // the headline (engaging, specific, under ~80 chars)
  dek: string;                         // the standfirst: 1-2 sentences
  readingMinutes: number;
  hero: { value: string; label: string };
  takeaways: string[];                 // 3-5 bullet "at a glance" findings, each with a number
  sections: Section[];                 // 4-6 sections
  readers: Record<Reader, { title: string; points: string[] }>; // what it means for each reader
  scenario: "inflation" | "diet" | "pms";
  method: string[];                    // how the numbers were produced and checked
  faq: Array<[question: string, answer: string]>; // 3-5, search-friendly
  sources: Array<{ label: string; href?: string }>;
  pdf: string;                         // link to the full brief
  seoDescription: string;              // <= 160 chars
};
