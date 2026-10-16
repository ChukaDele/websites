import type {Metadata} from "next";
import {PortfolioExperience} from "../../../components/portfolio/PortfolioExperience";
import {portfolioBySlug} from "../../../lib/portfolio-editorial";
import {pageMetadata} from "../../../lib/seo";
const study=portfolioBySlug["saas"];
export const metadata:Metadata=pageMetadata({
 title:"SaaS Retention Operating Model | The Bredge",
 description:study.lede.slice(0,155),
 path:"/portfolio/saas",
});
export default function Page(){return <PortfolioExperience slug="saas"/>;}
