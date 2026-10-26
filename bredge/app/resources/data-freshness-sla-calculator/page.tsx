import type { Metadata } from "next";
import { ResourcePage } from "../../../components/insights/ResourcePage";
import { FreshnessPlanner } from "../../../components/resources/FreshnessPlanner";
import { pageMetadata } from "../../../lib/seo";
import { getResource } from "../../../lib/resources";

const SLUG = "data-freshness-sla-calculator";
const R = getResource(SLUG)!;
export const metadata: Metadata = pageMetadata({ title: R.seoTitle, description: R.seoDescription, path: `/resources/${SLUG}` });

export default function Page() {
  return <ResourcePage slug={SLUG}><FreshnessPlanner /></ResourcePage>;
}
