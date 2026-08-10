import type { Metadata } from "next";
import { ResourcePage } from "../../../components/insights/ResourcePage";
import { pageMetadata } from "../../../lib/seo";
import { getResource } from "../../../lib/resources";

const R = getResource("revenue-reconciliation-checklist")!;
export const metadata: Metadata = pageMetadata({ title: R.seoTitle, description: R.seoDescription, path: "/resources/revenue-reconciliation-checklist" });

export default function Page() {
  return <ResourcePage slug="revenue-reconciliation-checklist" />;
}
