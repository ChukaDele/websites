import type { Metadata } from "next";
import { ResourcePage } from "../../../components/insights/ResourcePage";
import { HireTree } from "../../../components/resources/HireTree";
import { pageMetadata } from "../../../lib/seo";
import { getResource } from "../../../lib/resources";

const SLUG = "first-data-hire-decision-tree";
const R = getResource(SLUG)!;
export const metadata: Metadata = pageMetadata({ title: R.seoTitle, description: R.seoDescription, path: `/resources/${SLUG}` });

export default function Page() {
  return <ResourcePage slug={SLUG}><HireTree /></ResourcePage>;
}
