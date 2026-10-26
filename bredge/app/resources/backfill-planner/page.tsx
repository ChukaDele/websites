import type { Metadata } from "next";
import { ResourcePage } from "../../../components/insights/ResourcePage";
import { BackfillPlanner } from "../../../components/resources/BackfillPlanner";
import { pageMetadata } from "../../../lib/seo";
import { getResource } from "../../../lib/resources";

const SLUG = "backfill-planner";
const R = getResource(SLUG)!;
export const metadata: Metadata = pageMetadata({ title: R.seoTitle, description: R.seoDescription, path: `/resources/${SLUG}` });

export default function Page() {
  return <ResourcePage slug={SLUG}><BackfillPlanner /></ResourcePage>;
}
