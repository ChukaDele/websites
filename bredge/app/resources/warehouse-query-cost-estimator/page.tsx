import type { Metadata } from "next";
import { ResourcePage } from "../../../components/insights/ResourcePage";
import { WarehouseCost } from "../../../components/resources/WarehouseCost";
import { pageMetadata } from "../../../lib/seo";
import { getResource } from "../../../lib/resources";

const SLUG = "warehouse-query-cost-estimator";
const R = getResource(SLUG)!;
export const metadata: Metadata = pageMetadata({ title: R.seoTitle, description: R.seoDescription, path: `/resources/${SLUG}` });

export default function Page() {
  return <ResourcePage slug={SLUG}><WarehouseCost /></ResourcePage>;
}
