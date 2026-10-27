import type { Metadata } from "next";
import { ResourcePage } from "../../../components/insights/ResourcePage";
import { SaasMetrics } from "../../../components/resources/SaasMetrics";
import { pageMetadata } from "../../../lib/seo";
import { getResource } from "../../../lib/resources";

const SLUG = "saas-metrics-definitions";
const R = getResource(SLUG)!;
export const metadata: Metadata = pageMetadata({ title: R.seoTitle, description: R.seoDescription, path: `/resources/${SLUG}` });

export default function Page() {
  return <ResourcePage slug={SLUG}><SaasMetrics /></ResourcePage>;
}
