import type { Metadata } from "next";
import { ResourcePage } from "../../../components/insights/ResourcePage";
import { KpiDictionary } from "../../../components/resources/KpiDictionary";
import { pageMetadata } from "../../../lib/seo";
import { getResource } from "../../../lib/resources";

const SLUG = "kpi-dictionary-template";
const R = getResource(SLUG)!;
export const metadata: Metadata = pageMetadata({ title: R.seoTitle, description: R.seoDescription, path: `/resources/${SLUG}` });

export default function Page() {
  return <ResourcePage slug={SLUG}><KpiDictionary /></ResourcePage>;
}
