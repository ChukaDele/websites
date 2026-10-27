import { articles, AUDIENCES, CATEGORIES, coverFor, FEATURED_SLUG } from "../../lib/insights";
import { AllInsightsFilter, type InsightCard } from "./AllInsightsFilter";
import "../../app/insights.css";

/* Filterable card grid. Every card is rendered server-side (crawlable); the two
 * filters (topic, reader) only hide non-matching cards on the client. Only the
 * card fields are sent to the browser, not the full lib/insights.ts catalogue. */
export function AllInsights({ heading }: { heading?: React.ReactNode }) {
  const list: InsightCard[] = articles
    .filter((a) => a.slug !== FEATURED_SLUG)
    .map(({ slug, category, audiences, title, blurb, read }) => ({ slug, category, audiences, title, blurb, read, cover: coverFor(slug) }));
  return <AllInsightsFilter list={list} categories={CATEGORIES} audiences={AUDIENCES} heading={heading} />;
}
