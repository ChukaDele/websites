import type { Metadata } from "next";
import { ResearchArticle } from "../../../components/research/ResearchArticle";
import { pageMetadata } from "../../../lib/seo";
import { researchBySlug } from "../../../lib/research-editorial";
const story=researchBySlug["nigeria-telecoms-q4-2025"];
export const metadata:Metadata=pageMetadata({
 title: "Nigeria telecom market size | The Bredge",
 description:story.deck.slice(0,157),
 path:"/research/nigeria-telecoms-q4-2025",
});
export default function Page(){return <ResearchArticle slug="nigeria-telecoms-q4-2025"/>;}
