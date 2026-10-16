/* eslint-disable @next/next/no-img-element */
import type {Metadata} from "next";
import {PageShell,Breadcrumbs} from "../../components/site/PageShell";
import {portfolioStudies} from "../../lib/portfolio-editorial";
import {editorialAssets} from "../../lib/editorial-assets";
import {pageMetadata} from "../../lib/seo";

export const metadata:Metadata=pageMetadata({
 title:"Interactive Business Intelligence Portfolio | The Bredge",
 description:"Use Bredge's interactive finance, SaaS retention and supply-chain operating dashboards. Filter data, challenge assumptions and see the business reasoning behind each model.",
 path:"/portfolio",
});
export default function PortfolioPage(){
 return <PageShell>
  <Breadcrumbs trail={[["Home","/"],["Portfolio","/portfolio"]]}/>
  <section className="section-wrap pl-index-hero">
    <p className="eyebrow">BREDGE / INTERACTIVE PORTFOLIO</p>
    <h1>Don’t admire a dashboard. Use it.</h1>
    <p className="lede">These are operating-room demonstrations, not decorative screenshots. Change the view. Choose a segment. Move the assumption. See the numbers respond—and exactly where the underlying evidence stops.</p>
    <div className="pl-index-meta"><span>03 INTERACTIVE DASHBOARDS</span><span>NO LOGIN REQUIRED</span><span>DEMONSTRATION DATA CLEARLY LABELLED</span></div>
  </section>
  <section className="section-wrap pl-index" aria-labelledby="portfolio-heading">
    <p className="eyebrow">PICK AN OPERATING PROBLEM</p><h2 id="portfolio-heading">Put yourself in the operator’s chair.</h2>
    <div className="pl-index-grid">
    {portfolioStudies.map((s)=><a className={"pl-gallery-card pl-gallery-"+s.slug} key={s.slug} href={"/portfolio/"+(s.slug==="supply"?"supply-chain":s.slug)+"#operating-room"}>
      <div className="pl-gallery-top"><span>{s.index} / {s.sector}</span><span aria-hidden="true">↗</span></div>
      <div className="pl-gallery-graphic">
        <img className="pl-gallery-cover" src={editorialAssets[s.lab].src} alt="" width="1536" height="860" loading="lazy" decoding="async" />
        <strong>{s.metric}</strong><span>{editorialAssets[s.lab].subject}</span>
      </div>
      <div className="pl-gallery-text"><h3>{s.title}</h3><p>{s.lede}</p>
        <span>ENTER THE DASHBOARD <b aria-hidden="true">↗</b></span>
      </div>
    </a>)}
    </div>
  </section>
  <section className="pl-index-trust section-wrap">
    <div><p className="eyebrow">WHY THIS FORMAT</p><h2>The chart is the conversation. The source is the evidence.</h2></div>
    <div><p>A management team needs to challenge a number, not just see it. These self-contained demos reproduce the logic of Bredge’s Power BI presentation work in a web-native operating interface. The publicly shown figures are historical aggregates or explicitly scoped sample slices—not a complete client’s live ledger.</p>
    <a className="text-link" href="/research">Explore source-backed research <span aria-hidden="true">↗</span></a></div>
  </section>
 </PageShell>;
}
