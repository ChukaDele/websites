import type {Metadata} from "next";
import {PageShell,Breadcrumbs} from "../../components/site/PageShell";
import {pageMetadata} from "../../lib/seo";

export const metadata:Metadata=pageMetadata({
 title:"Our Work: Research, Portfolio and Insights | The Bredge",
 description:"See how Bredge combines data engineering, analysis, visualization and business judgement: explore source-backed research, interactive dashboards and practical guides.",
 path:"/work",
});
export default function Work(){
 return <PageShell>
  <Breadcrumbs trail={[["Home","/"],["Our Work","/work"]]}/>
  <section className="section-wrap work-hero">
    <p className="eyebrow">THE BREDGE / WORK</p>
    <h1>Evidence you can challenge. Tools you can use.</h1>
    <p className="lede">We are an engineering and analytics team. Our work should demonstrate both: original analysis grounded in source data, interactive dashboards that support operating decisions, and practical guides you can use independently.</p>
  </section>
  <section className="section-wrap work-paths">
    <a className="work-path research" href="/research"><span>01 / RESEARCH</span><h2>Understand what the data means.</h2><p>Original public-data analysis for decisions on market entry, regional pricing and investment diligence—with documented methods and live evidence panels.</p><small>READ THE ANALYSIS <b aria-hidden="true">↗</b></small></a>
    <a className="work-path portfolio" href="/portfolio"><span>02 / INTERACTIVE PORTFOLIO</span><h2>Run the business view yourself.</h2><p>Filter finance, supply-chain and SaaS models. Change operating assumptions, inspect the figures and see how dashboards support real conversations.</p><small>EXPLORE THE MODELS <b aria-hidden="true">↗</b></small></a>
    <a className="work-path insights" href="/insights"><span>03 / PRACTICAL INSIGHTS</span><h2>Build a data system that holds up.</h2><p>Useful decisions on architecture, reporting reliability, warehouse readiness and hiring an effective data team.</p><small>READ THE GUIDES <b aria-hidden="true">↗</b></small></a>
  </section>
 </PageShell>;
}
