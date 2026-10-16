import type { Metadata } from "next";
import { ResearchArticle } from "../../../components/research/ResearchArticle";
import { pageMetadata } from "../../../lib/seo";
import { researchBySlug } from "../../../lib/research-editorial";
const story=researchBySlug["nigeria-pms-may-2026"];
export const metadata:Metadata=pageMetadata({
 title: "Fuel prices and international distribution | The Bredge",
 description:story.deck.slice(0,157),
 path:"/research/nigeria-pms-may-2026",
});
export default function Page(){return <ResearchArticle slug="nigeria-pms-may-2026"/>;}
