/* eslint-disable @next/next/no-img-element */
import {PageShell,Breadcrumbs} from "../site/PageShell";
import Workbench from "../workbench/Workbench";
import {portfolioBySlug,portfolioStudies} from "../../lib/portfolio-editorial";
import {editorialAssets} from "../../lib/editorial-assets";
import {getWorkbench,views} from "../../lib/workbench-data";

export function PortfolioExperience({slug}:{slug:string}){
 const study=portfolioBySlug[slug];
 if(!study)throw Error("Unknown portfolio demonstration.");
 const data=getWorkbench(study.lab,views[study.lab][0].id);
 const path="/portfolio/"+(slug==="supply"?"supply-chain":slug);
 const art=editorialAssets[study.lab];
 return <PageShell>
  <Breadcrumbs trail={[["Home","/"],["Portfolio","/portfolio"],[study.title,path]]}/>
  <section className="section-wrap pl-hero pl-hero-v2">
    <div className="pl-hero-copy">
      <div className="pl-hero-top"><span>{study.sector}</span><span>OPERATING MODEL / {study.index}</span></div>
      <h1>{study.title}</h1>
      <p className="lede">{study.lede}</p>
      <p className="pl-hero-audience">{study.who}</p>
      <a className="pl-model-jump" href="#operating-room">Open the interactive dashboard <span aria-hidden="true">↓</span></a>
      {slug==="finance"&&<a className="pl-bi-studio-link" href="/portfolio/finance/studio">Try the full Finance BI Studio <span aria-hidden="true">↗</span></a>}
    </div>
    <figure className="pl-cover">
      <img src={art.src} alt={art.alt} width="1536" height="860" fetchPriority="high" decoding="async"/>
      <figcaption>{art.subject} · Editorial illustration</figcaption>
    </figure>
  </section>
  <section className="section-wrap pl-operating-room" id="operating-room" aria-labelledby="pl-operating-heading">
    <div className="pl-room-intro">
      <div><p className="eyebrow">{study.sector} / INTERACTIVE ANALYSIS</p><h2 id="pl-operating-heading">{study.decision}</h2></div>
      <div className="pl-room-context"><span>ORIGINAL REPORT REFERENCE</span><strong>{study.metric}</strong><small>{study.metricDescription}</small></div>
    </div>
    <Workbench dataset={study.lab} initial={data} options={views[study.lab]}/>
  </section>
  <div className="section-wrap pl-story">
    {study.narrative.map((section,i)=><section key={section.label} className="pl-story-section">
      <div className="pl-story-index">{String(i+1).padStart(2,"0")} / {section.label}</div>
      <div><h2>{section.heading}</h2>{section.paragraphs.map((p,j)=><p key={j}>{p}</p>)}</div>
    </section>)}
  </div>
  <section className="section-wrap pl-method">
    <details className="pl-source-details"><summary>Source data, methodology and limitations</summary>
      <p><strong>Data reference:</strong> {study.source}. The original report’s headline may describe a larger dataset than the interactive sample slice. This website does not distribute the original Power BI models or claim these are real client outcomes.</p>
      <ul>{study.limitations.map(l=><li key={l}>{l}</li>)}</ul>
    </details>
  </section>
  <section className="pl-conclusion section-wrap">
    <p className="eyebrow">APPLY THIS TO YOUR BUSINESS</p>
    <h2>Your team deserves answers this easy to challenge.</h2>
    <p>Bring us a business decision your current reporting cannot support. We’ll help identify the data, assumptions and workflow needed to answer it.</p>
    <div className="pl-cta-actions">
      <a className="button cta-accent" data-cta="portfolio_contact" href="/contact?intent=portfolio">Discuss a reporting problem <span className="arrow" aria-hidden="true">↗</span></a>
      <a className="text-link" href="/portfolio">Explore another operating model <span aria-hidden="true">↗</span></a>
    </div>
    <div className="pl-related">{portfolioStudies.filter(s=>s.slug!==slug).map(s=>
      <a href={"/portfolio/"+(s.slug==="supply"?"supply-chain":s.slug)+"#operating-room"} key={s.slug}>{s.title}<span aria-hidden="true">↗</span></a>)}</div>
  </section>
 </PageShell>;
}
