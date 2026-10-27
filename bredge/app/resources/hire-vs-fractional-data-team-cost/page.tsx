import type { Metadata } from "next";
import { ResourcePage } from "../../../components/insights/ResourcePage";
import { CostCalculator } from "../../../components/resources/CostCalculator";
import { pageMetadata } from "../../../lib/seo";
import { getResource } from "../../../lib/resources";

const SLUG = "hire-vs-fractional-data-team-cost";
const R = getResource(SLUG)!;
export const metadata: Metadata = pageMetadata({ title: R.seoTitle, description: R.seoDescription, path: `/resources/${SLUG}` });

export default function Page() {
  return <ResourcePage slug={SLUG}><CostCalculator /></ResourcePage>;
}
