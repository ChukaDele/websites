import { PageShell,Breadcrumbs } from "../site/PageShell";
import Workbench from "../workbench/Workbench";
import { researchBySlug,researchStories } from "../../lib/research-editorial";
import { getWorkbench,views } from "../../lib/workbench-data";

export function ResearchArticle({slug}:{slug:string}){
 const story=researchBySlug[slug];
 if(!story)throw Error("Unknown research story.");
 const initial=getWorkbench(story.lab,views[story.lab][0].id);
 const structured={
  "@context":"https://schema.org",
  "@type":"Article",
  "@id":"https://thebredge.com/research/"+slug+"#article",
  headline:story.headline,
  description:story.deck,
  inLanguage:"en",
  url:"https://thebredge.com/research/"+slug,
  author:{"@type":"Organization",name:"The Bredge",url:"https://thebredge.com"},
  publisher:{"@id":"https://thebredge.com/#organization"},
  about:story.sectors,
  isAccessibleForFree:true,
  citation:initial.sourceURL,
  // Research period is not a fabricated Bredge publishing timestamp.
  temporalCoverage:story.period,
 };
 return <PageShell>
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(structured)}}/>
  <Breadcrumbs trail={[["Home","/"],["Research","/research"],[story.headline,"/research/"+slug]]}/>
  <article className="rl-story" itemScope itemType="https://schema.org/Article">
   <header className="section-wrap rl-hero">
    <div className="rl-prelude"><span>{story.eyebrow}</span><span>{story.period}</span><span>{story.readTime}</span></div>
    <h1 itemProp="headline">{story.headline}</h1>
    <p className="rl-deck" itemProp="description">{story.deck}</p>
    <div className="rl-byline"><span>ANALYSIS BY THE BREDGE</span><span>{story.audience}</span></div>
    <div className="rl-thesis"><span>THE ARGUMENT</span><p>{story.thesis}</p></div>
   </header>
   <div className="rl-statstripe section-wrap">
    <div><span>THE OBSERVATION</span><strong>{story.fact}</strong><small>{story.factLabel}</small></div>
    <div><span>WHO SHOULD READ THIS</span><p>{story.sectors.join(" · ")}</p></div>
    <a className="rl-jump" href="#interactive-model">Work with the data <span aria-hidden="true">↓</span></a>
   </div>
   <div className="rl-article section-wrap">
    <div className="rl-article-main">
     {story.sections.slice(0,2).map((section,index)=><section className="rl-section" key={section.heading}>
      <p className="eyebrow">{section.eyebrow}</p>
      <h2>{section.heading}</h2>
      {section.paragraphs.map((p,i)=><p key={i}>{p}</p>)}
      {index===0?<aside className="rl-inline-note">A useful market-entry model distinguishes reported facts from assumptions you control. Change the assumptions in the live tool below and see how the answer moves.</aside>:null}
     </section>)}
    </div>
    <aside className="rl-sidebar">
      <span>INSIDE THIS ANALYSIS</span>
      <ol><li>Decision worth asking</li><li>Evidence and context</li><li>Interactive working model</li><li>Commercial implications</li><li>Method and caveats</li></ol>
      <a href="#methodology">Inspect the sources <span aria-hidden="true">↗</span></a>
    </aside>
   </div>
   <section className="section-wrap rl-interactive" id="interactive-model" aria-label="Interactive analysis">
    <div className="rl-lab-intro">
      <p className="eyebrow">THE DATA, WITH THE ASSUMPTIONS EXPOSED</p>
      <h2>Don’t just read the finding. Test the question.</h2>
      <p>Change the data lens, select an observation and adjust the scenario. The historical figures are source-attributed; the scenario controls are yours. None of the outputs are a promise of commercial performance.</p>
    </div>
    <Workbench dataset={story.lab} initial={initial} options={views[story.lab]}/>
   </section>
   <div className="rl-after section-wrap">
     {story.sections.slice(2).map(section=><section className="rl-section" key={section.heading}>
       <p className="eyebrow">{section.eyebrow}</p><h2>{section.heading}</h2>
       {section.paragraphs.map((p,i)=><p key={i}>{p}</p>)}
     </section>)}
   </div>
   <section className="rl-decisions section-wrap" aria-labelledby="rl-decisions-heading">
    <p className="eyebrow">FROM INFORMATION TO OPERATING DECISIONS</p>
    <h2 id="rl-decisions-heading">Three people will ask three different questions.</h2>
    <div className="rl-decision-grid">{story.decisionPaths.map((entry,i)=><article key={entry.role}>
      <span>0{i+1} / {entry.role.toUpperCase()}</span>
      <h3>{entry.question}</h3><p>{entry.action}</p>
    </article>)}</div>
   </section>
   <section className="rl-method section-wrap" id="methodology" aria-labelledby="method-head">
    <div className="rl-method-head"><p className="eyebrow">SHOW YOUR WORK</p>
    <h2 id="method-head">Method. Sources. What we don’t know.</h2>
    <p>Charts without provenance are illustrations. This is the evidence chain and the boundary of each conclusion.</p></div>
    <div className="rl-method-grid">
     <section><h3>How the numbers were assembled</h3><ol>{story.method.map((t,i)=><li key={i}>{t}</li>)}</ol></section>
     <section><h3>What the chart cannot prove</h3><ol>{story.caveats.map((t,i)=><li key={i}>{t}</li>)}</ol></section>
    </div>
    <p className="rl-source-cite"><b>Primary source:</b> {initial.source}. <a href={initial.sourceURL} target="_blank" rel="noopener noreferrer">Inspect the original publisher <span aria-hidden="true">↗</span></a></p>
   </section>
   <footer className="rl-final section-wrap">
    <p className="eyebrow">OUR VIEW</p>
    <h2>{story.conclusion}</h2>
    <div className="rl-final-actions">
      <a className="button cta-accent" data-cta="research_project" href="/contact?intent=research">Put your data to work <span className="arrow" aria-hidden="true">↗</span></a>
      <a className="text-link" href="/portfolio">Try the interactive portfolio <span aria-hidden="true">↗</span></a>
    </div>
    <div className="rl-related"><span>KEEP EXPLORING</span>
      {researchStories.filter(s=>s.slug!==slug).map(s=><a key={s.slug} href={"/research/"+s.slug}>{s.headline} <span aria-hidden="true">↗</span></a>)}
    </div>
   </footer>
  </article>
 </PageShell>;
}
