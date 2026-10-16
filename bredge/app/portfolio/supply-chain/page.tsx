import type {Metadata} from "next";
import {PortfolioExperience} from "../../../components/portfolio/PortfolioExperience";
import {portfolioBySlug} from "../../../lib/portfolio-editorial";
import {pageMetadata} from "../../../lib/seo";
const study=portfolioBySlug["supply"];
export const metadata:Metadata=pageMetadata({
 title:"Supply Chain Operating Model | The Bredge",
 description:study.lede.slice(0,155),
 path:"/portfolio/supply-chain",
});
export default function Page(){return <PortfolioExperience slug="supply"/>;}
