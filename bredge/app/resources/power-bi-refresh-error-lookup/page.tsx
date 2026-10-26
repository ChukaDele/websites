import type { Metadata } from "next";
import { ResourcePage } from "../../../components/insights/ResourcePage";
import { PowerBiErrors } from "../../../components/resources/PowerBiErrors";
import { pageMetadata } from "../../../lib/seo";
import { getResource } from "../../../lib/resources";

const SLUG = "power-bi-refresh-error-lookup";
const R = getResource(SLUG)!;
export const metadata: Metadata = pageMetadata({ title: R.seoTitle, description: R.seoDescription, path: `/resources/${SLUG}` });

export default function Page() {
  return <ResourcePage slug={SLUG}><PowerBiErrors /></ResourcePage>;
}
