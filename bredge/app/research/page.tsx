import type { Metadata } from "next";
import { PageShell, Breadcrumbs } from "../../components/site/PageShell";
import { pageMetadata } from "../../lib/seo";
import { dataBriefs } from "../../lib/data-briefs";

export const metadata: Metadata = pageMetadata({
  title: "Original Public-Data Briefs & Analysis | The Bredge",
  description: "Bredge's original analysis of public Nigerian datasets: telecoms, petrol prices and healthy-diet affordability. Read the source, methodology and decision implications.",
  path: "/research",
});

const researchLd = {
  "@context":"https://schema.org", "@type":"CollectionPage",
  "@id":"https://thebredge.com/research#collection",
  url:"https://thebredge.com/research",
  name:"The Bredge Data Briefs",
  description:"Bredge-authored analysis of publicly published Nigerian statistical data, with source attribution and limitations.",
  isPartOf:{"@id":"https://thebredge.com/#website"},
  about: ["Data analysis","Business intelligence","Public statistics"],
  mainEntity:{
    "@type":"ItemList",
    itemListElement:dataBriefs.map((brief,index)=>({
      "@type":"ListItem", position:index+1,
      name:brief.title, url:`https://thebredge.com/research#${brief.slug}`,
    })),
  },
};

export default function ResearchPage() {
  return (
    <PageShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(researchLd)}} />
      <Breadcrumbs trail={[["Home","/"],["Research","/research"]]} />
      <section className="section-wrap page-hero research-hero">
        <p className="eyebrow">BREDGE DATA BRIEFS</p>
        <h1>What the numbers reveal.</h1>
        <p className="lede">Original Bredge analysis of publicly available statistics. We show the source, the period and the limits of what each figure tells you, so the work can be assessed on its methods.</p>
        <p className="research-method">Public-data research. No client records, confidential work or claimed customer outcomes are used in these examples.</p>
      </section>
      <section className="section-wrap research-grid" aria-label="Selected original research">
        {dataBriefs.map((brief,index)=>(
          <article key={brief.slug} id={brief.slug} className="research-brief">
            <div className="research-brief-head">
              <span>{String(index+1).padStart(2,"0")} / {brief.category.toUpperCase()}</span>
              <small>{brief.period}</small>
            </div>
            <div className="research-brief-body">
              <div className="research-stat">
                <strong>{brief.number}</strong>
                <span>{brief.unit}</span>
                <small>{brief.comparison}</small>
              </div>
              <div>
                <h2>{brief.title}</h2>
                <p>{brief.summary}</p>
                <p className="research-decision"><b>Decision context.</b> {brief.decision}</p>
                <details className="research-evidence">
                  <summary>Source, method and limitations</summary>
                  <div>
                    <p><b>Provenance.</b> {brief.provenance}.</p>
                    <p><b>Limitations.</b> {brief.limitations}</p>
                    <p><b>Underlying publisher.</b> {brief.source}.</p>
                    <a href={brief.sourceUrl} target="_blank" rel="noopener noreferrer">See the official NBS source <span aria-hidden="true">↗</span></a>
                  </div>
                </details>
              </div>
            </div>
          </article>
        ))}
      </section>
      <section className="research-close section-wrap">
        <p className="eyebrow">HOW WE WORK</p>
        <h2>Interesting data is useful when it changes a decision.</h2>
        <p>We apply the same source-first discipline when reconciling business systems, designing data models or deciding what to automate. A diagnostic starts with the questions your team needs answered and the evidence already available.</p>
        <a className="button cta-accent" data-cta="research_diagnostic" href="/data-diagnostic">Explore a Data Diagnostic <span className="arrow" aria-hidden="true">↗</span></a>
      </section>
    </PageShell>
  );
}
