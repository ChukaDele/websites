import type { Metadata } from "next";
import { ResourcePage } from "../../../components/insights/ResourcePage";
import { pageMetadata } from "../../../lib/seo";
import { getResource } from "../../../lib/resources";

const R = getResource("data-quality-checklist")!;
export const metadata: Metadata = pageMetadata({ title: R.seoTitle, description: R.seoDescription, path: "/resources/data-quality-checklist" });

export default function Page() {
  return <ResourcePage slug="data-quality-checklist" />;
}
