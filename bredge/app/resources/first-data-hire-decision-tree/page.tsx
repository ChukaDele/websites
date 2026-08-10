import type { Metadata } from "next";
import { ResourcePage } from "../../../components/insights/ResourcePage";
import { pageMetadata } from "../../../lib/seo";
import { getResource } from "../../../lib/resources";

const R = getResource("first-data-hire-decision-tree")!;
export const metadata: Metadata = pageMetadata({ title: R.seoTitle, description: R.seoDescription, path: "/resources/first-data-hire-decision-tree" });

export default function Page() {
  return <ResourcePage slug="first-data-hire-decision-tree" />;
}
