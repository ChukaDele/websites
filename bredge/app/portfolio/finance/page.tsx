import type {Metadata} from "next";
import {PortfolioExperience} from "../../../components/portfolio/PortfolioExperience";
import {portfolioBySlug} from "../../../lib/portfolio-editorial";
import {pageMetadata} from "../../../lib/seo";
const study=portfolioBySlug["finance"];
export const metadata:Metadata=pageMetadata({
 title:"Finance Operating Model | The Bredge",
 description:study.lede.slice(0,155),
 path:"/portfolio/finance",
});
export default function Page(){return <PortfolioExperience slug="finance"/>;}
