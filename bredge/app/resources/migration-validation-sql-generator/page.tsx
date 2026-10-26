import type { Metadata } from "next";
import { ResourcePage } from "../../../components/insights/ResourcePage";
import { MigrationParity } from "../../../components/resources/MigrationParity";
import { pageMetadata } from "../../../lib/seo";
import { getResource } from "../../../lib/resources";

const SLUG = "migration-validation-sql-generator";
const R = getResource(SLUG)!;
export const metadata: Metadata = pageMetadata({ title: R.seoTitle, description: R.seoDescription, path: `/resources/${SLUG}` });

export default function Page() {
  return <ResourcePage slug={SLUG}><MigrationParity /></ResourcePage>;
}
