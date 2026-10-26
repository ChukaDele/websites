import type { Metadata } from "next";
import { ResourcePage } from "../../../components/insights/ResourcePage";
import { ProjectBrief } from "../../../components/resources/ProjectBrief";
import { pageMetadata } from "../../../lib/seo";
import { getResource } from "../../../lib/resources";

const SLUG = "data-project-brief-template";
const R = getResource(SLUG)!;
export const metadata: Metadata = pageMetadata({ title: R.seoTitle, description: R.seoDescription, path: `/resources/${SLUG}` });

export default function Page() {
  return <ResourcePage slug={SLUG}><ProjectBrief /></ResourcePage>;
}
