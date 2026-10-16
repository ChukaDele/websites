import { PageShell,Breadcrumbs } from "../site/PageShell";
import Workbench from "../workbench/Workbench";
import { portfolioBySlug,portfolioStudies } from "../../lib/portfolio-editorial";
import {getWorkbench,views} from "../../lib/workbench-data";

export function PortfolioExperience({slug}:{slug:string}){
 const study=portfolioBySlug[slug];
 if(!study)throw Error("Unknown portfolio demonstration.");
 const data=getWorkbench(study.lab,views[study.lab][0].id);
 const path="/portfolio/"+(slug==="supply"?"supply-chain":slug);
 return <PageShell>
  <Breadcrumbs trail={[["Home","/"],["Portfolio","/portfolio"],[study.title,path]]}/>
  <section className="section-wrap pl-hero">
    <div className="pl-hero-top"><span>{study.sector}</span><span>INTERACTIVE PORTFOLIO / {study.index}</span></div>
    <h1>{study.title}</h1>
    <p className="lede">{study.lede}</p>
    <div className="pl-hero-meta"><span>{study.who}</span><span>SOURCE: HISTORICAL DEMONSTRATION</span></div>
  </section>
  <section className="pl-feature-bar section-wrap">
    <div><span>SOURCE-DASHBOARD REFERENCE</span><strong>{study.metric}</strong><small>{study.metricDescription}</small></div>
    <div><span>DECISION BRIEF</span><p>{study.decision}</p></div>
  </section>
  <section className="section-wrap pl-operating-room" id="operating-room">
    <p className="eyebrow">THE OPERATING ROOM</p>
    <h2>Take the controls.</h2>
    <p>Choose a view, compare a segment and change an assumption. The calculations update. Source values and demonstration limits stay visible, so the dashboard cannot quietly turn a scenario into an asserted fact.</p>
    <Workbench dataset={study.lab} initial={data} options={views[study.lab]}/>
  </section>
  <div className="section-wrap pl-story">
    {study.narrative.map((section,i)=><section key={section.label} className="pl-story-section">
      <div className="pl-story-index">{String(i+1).padStart(2,"0")} / {section.label}</div>
      <div><h2>{section.heading}</h2>{section.paragraphs.map((p,j)=><p key={j}>{p}</p>)}</div>
    </section>)}
  </div>
  <section className="pl-implementation section-wrap">
    <p className="eyebrow">WHAT THIS DEMONSTRATES</p>
    <h2>Engineering, analysis and judgement in one place.</h2>
    <div className="pl-capabilities">{study.capabilities.map((c,i)=><span key={c}>{String(i+1).padStart(2,"0")} — {c}</span>)}</div>
    <details className="pl-source-details"><summary>Source data, scope and limitations</summary>
      <p>Source artifact: {study.source}. This site neither distributes the original PDF, PBIX or report model nor claims that its full underlying historical dataset is present.</p>
      <ul>{study.limitations.map(l=><li key={l}>{l}</li>)}</ul>
    </details>
  </section>
  <section className="pl-conclusion section-wrap">
    <p className="eyebrow">TAKE THE NEXT STEP</p>
    <h2>Your real data should be this easy to challenge.</h2>
    <p>We build reporting around the decisions someone owns, with evidence and assumptions visible. If you’re planning a new analytics system, let’s start with the problem you need it to solve.</p>
    <div className="pl-cta-actions">
      <a className="button cta-accent" data-cta="portfolio_contact" href="/contact?intent=portfolio">Talk about your data <span className="arrow" aria-hidden="true">↗</span></a>
      <a className="text-link" href="/portfolio">Explore another operating model <span aria-hidden="true">↗</span></a>
    </div>
    <div className="pl-related">{portfolioStudies.filter(s=>s.slug!==slug).map(s=>
      <a href={"/portfolio/"+(s.slug==="supply"?"supply-chain":s.slug)} key={s.slug}>{s.title}<span aria-hidden="true">↗</span></a>)}</div>
  </section>
 </PageShell>;
}
