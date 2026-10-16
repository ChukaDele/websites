/* eslint-disable @next/next/no-img-element */
import type {Metadata} from "next";
import {PageShell,Breadcrumbs} from "../../components/site/PageShell";
import {researchStories} from "../../lib/research-editorial";
import {editorialAssets} from "../../lib/editorial-assets";
import {dataBriefs} from "../../lib/data-briefs";
import {pageMetadata} from "../../lib/seo";

export const metadata:Metadata=pageMetadata({
 title:"Decision Intelligence Research | The Bredge",
 description:"Research built for global operators and investors. Explore what Nigeria's telecoms, fuel and food-affordability data mean for business decisions, with interactive evidence.",
 path:"/research",
});
const ld={
 "@context":"https://schema.org","@type":"CollectionPage",
 "@id":"https://thebredge.com/research#collection",
 url:"https://thebredge.com/research",
 name:"Bredge Decision Intelligence Research",
 description:"Evidence-led research for business decisions, with interactive public-data models and transparent source limitations.",
 mainEntity:{"@type":"ItemList",itemListElement:researchStories.map((s,i)=>({
  "@type":"ListItem",position:i+1,name:s.headline,url:"https://thebredge.com/research/"+s.slug
 }))},
 isPartOf:{"@id":"https://thebredge.com/#website"},
};
export default function ResearchPage(){
 return <PageShell>
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(ld)}}/>
  <Breadcrumbs trail={[["Home","/"],["Research","/research"]]}/>
  <>
   <section className="section-wrap rs-hero">
    <p className="eyebrow">THE BREDGE / DECISION INTELLIGENCE</p>
    <div className="rs-hero-layout">
      <div><h1>Data matters when it changes a decision.</h1></div>
      <div><p>Entering a new market? Repricing a supply chain? Evaluating a sector? We unpack public data the way an operator or investment team would: what changed, why it matters, what the numbers don’t prove, and which assumption to test next.</p>
        <a className="text-link" href="/portfolio">Or try our operating dashboards <span className="arrow" aria-hidden="true">↗</span></a>
      </div>
    </div>
    <div className="rs-hero-facts">
      <span>03 EVIDENCE-LED ANALYSES</span><span>03 INTERACTIVE MODELS</span><span>PUBLIC SOURCES / CLEAR ASSUMPTIONS</span>
    </div>
   </section>
   <section className="rs-index section-wrap" aria-labelledby="rs-index-heading">
    <div className="rs-heading"><p className="eyebrow">FROM REPORT TO OPERATING QUESTION</p><h2 id="rs-index-heading">Choose the decision you’re making.</h2></div>
    {researchStories.map((s,i)=><article key={s.slug} className="rs-entry">
      <div className="rs-entry-side"><span>{String(i+1).padStart(2,"0")} / RESEARCH BRIEF</span>
        <span>{s.period}</span><span>{s.audience}</span></div>
      <div className="rs-entry-main"><p className="eyebrow">{s.eyebrow}</p>
        <h3><a href={"/research/"+s.slug}>{s.headline}<span aria-hidden="true">↗</span></a></h3>
        <p>{s.deck}</p>
        <div className="rs-entry-tags">{s.sectors.slice(0,3).map(tag=><span key={tag}>{tag}</span>)}</div>
        <a className="rs-entry-link" href={"/research/"+s.slug}>Read the analysis and use the model <span aria-hidden="true">↗</span></a></div>
      <div className="rs-entry-stat">
        <img className="rs-entry-cover" src={editorialAssets[s.lab].src} alt="" width="1536" height="860" loading="lazy" decoding="async" />
        <span>OBSERVED REFERENCE / {s.period}</span><strong>{s.fact}</strong><small>{s.factLabel}</small>
      </div>
    </article>)}
   </section>
   <section className="rs-method-preview section-wrap">
    <div><p className="eyebrow">THE STANDARD</p><h2>A good chart doesn’t hide its assumptions.</h2></div>
    <div><p>We treat every published statistic as a claim with a unit, period, source and limitation. Then we separate it from the inputs a business controls. The interactive models demonstrate that thinking, not investment forecasts or invented client outcomes.</p>
      <a className="text-link" href="/how-we-work">How our analytical process works <span aria-hidden="true">↗</span></a></div>
   </section>
   <section className="section-wrap rs-archive" aria-label="Source transparency">
    <p className="eyebrow">SOURCE TRANSPARENCY</p>
    <p>The research here is based on published NBS and NCC statistical material and Bredge’s original analysis. Its source records and limitations appear inside each article. Historical observations are not live prices, unique customer counts, income measures or forecasts. Public data briefs are distinct from the interactive sample portfolio.</p>
    <div className="rs-archive-refs">{dataBriefs.map(x=><a href={x.sourceUrl} target="_blank" rel="noopener noreferrer" key={x.slug}>{x.source} <span aria-hidden="true">↗</span></a>)}</div>
   </section>
  </>
 </PageShell>;
}
