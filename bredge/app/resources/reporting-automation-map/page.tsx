import type { Metadata } from "next";
import { ResourcePage } from "../../../components/insights/ResourcePage";
import { AutomationMap } from "../../../components/resources/AutomationMap";
import { pageMetadata } from "../../../lib/seo";
import { getResource } from "../../../lib/resources";

const SLUG = "reporting-automation-map";
const R = getResource(SLUG)!;
export const metadata: Metadata = pageMetadata({ title: R.seoTitle, description: R.seoDescription, path: `/resources/${SLUG}` });

export default function Page() {
  return <ResourcePage slug={SLUG}><AutomationMap /></ResourcePage>;
}
