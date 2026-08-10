import type { Metadata } from "next";
import { ResourcePage } from "../../../components/insights/ResourcePage";
import { pageMetadata } from "../../../lib/seo";
import { getResource } from "../../../lib/resources";

const R = getResource("data-warehouse-readiness")!;
export const metadata: Metadata = pageMetadata({ title: R.seoTitle, description: R.seoDescription, path: "/resources/data-warehouse-readiness" });

export default function Page() {
  return <ResourcePage slug="data-warehouse-readiness" />;
}
