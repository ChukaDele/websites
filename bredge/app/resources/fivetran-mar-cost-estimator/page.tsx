import type { Metadata } from "next";
import { ResourcePage } from "../../../components/insights/ResourcePage";
import { FivetranMar } from "../../../components/resources/FivetranMar";
import { pageMetadata } from "../../../lib/seo";
import { getResource } from "../../../lib/resources";

const SLUG = "fivetran-mar-cost-estimator";
const R = getResource(SLUG)!;
export const metadata: Metadata = pageMetadata({ title: R.seoTitle, description: R.seoDescription, path: `/resources/${SLUG}` });

export default function Page() {
  return <ResourcePage slug={SLUG}><FivetranMar /></ResourcePage>;
}
