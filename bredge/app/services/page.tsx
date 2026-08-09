import type { Metadata } from "next";
import { PageShell } from "../../components/site/PageShell";
import { MicroIllustration } from "../../components/site/MicroIllustration";
import { DecisionTree } from "../../components/interactions/DecisionTree";
import { pageMetadata } from "../../lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Data Engineering, Analytics & BI Services | The Bredge",
  description: "The Bredge helps growing companies connect fragmented data, build reliable data foundations, automate reporting and make better decisions through data engineering, analytics and business intelligence.",
  path: "/services",
});

const capabilities: Array<{ n: string; kind: "engineering" | "analytics" | "bi" | "quality" | "automation"; h: string; body: string; tags: string[]; out: string }> = [
  { n: "01", kind: "engineering", h: "Build the foundation first.", body: "Connect the systems your business already depends on and turn fragmented data into something reliable enough to build on.", tags: ["Data ingestion", "API integrations", "Pipelines", "SQL & Python", "Warehousing", "Transformation", "Data modelling", "Source reconciliation"], out: "Less manual manipulation, fewer conflicting numbers and a foundation that can support reporting as the company grows." },
  { n: "02", kind: "analytics", h: "Understand what is happening — and where to look next.", body: "Move beyond static reporting into analysis designed around the decisions your teams actually make.", tags: ["KPI design", "Funnel analysis", "Cohorts", "Segmentation", "Retention & churn", "Revenue analysis", "Operational analysis", "Forecasting where the data supports it"], out: "Teams spend less time assembling information and more time acting on it." },
  { n: "03", kind: "bi", h: "Reporting people will actually use.", body: "We build reporting around the questions a team needs answered — not around how many charts fit on a page.", tags: ["Power BI", "Executive dashboards", "Management reporting", "Operational reporting", "Financial reporting", "Self-service analytics", "Semantic models"], out: "A clearer operating rhythm and fewer recurring requests for someone to “pull the numbers.”" },
  { n: "04", kind: "quality", h: "Make important numbers defensible.", body: "A dashboard isn’t useful if finance, sales and operations define the same metric differently. We make critical data defined, traceable and testable.", tags: ["Metric definitions", "Source reconciliation", "Quality testing", "Referential integrity", "Data lineage", "Documentation", "Known-limitations registers"], out: "Your team knows what a number means, where it came from and whether it can be relied on." },
  { n: "05", kind: "automation", h: "Stop rebuilding the same answer every week.", body: "Recurring reporting should not depend on somebody copying rows between spreadsheets every Monday morning.", tags: ["Scheduled reporting", "Automated transformations", "Refresh workflows", "Exception monitoring", "Workflow automation", "Operational alerts"], out: "Less repetitive work and more predictable access to information." },
];

export default function ServicesPage() {
  return (
    <PageShell>
      <section className="section-wrap page-hero">
        <p className="eyebrow">SERVICES</p>
        <h1>From messy source systems to decisions your team can trust.</h1>
        <p className="lede">Your data problems rarely fit neatly into one discipline. A reporting problem may actually be a modelling problem. A dashboard nobody trusts may be a reconciliation problem. A forecasting problem may start with unreliable source data.</p>
        <p className="lede">The Bredge works across the data stack — from engineering and modelling to analytics, reporting and ongoing data operations — so the solution follows the problem rather than the other way around.</p>
        <div className="hero-cta-row"><a className="button" href="/schedule">Schedule a call <span className="arrow" aria-hidden="true">↗</span></a></div>
      </section>

      <section className="section surface">
        <div className="section-wrap">
          <div className="section-lead">
            <h2>Start with the business question.</h2>
            <p>We don’t begin with a tool. We begin with what your team cannot currently see, trust, automate or decide — then work backwards through the data needed to answer it reliably.</p>
          </div>
          <DecisionTree />
        </div>
      </section>

      <section className="section">
        <div className="section-wrap">
          <div className="section-lead"><h2>One partner, across the disciplines the problem touches.</h2></div>
          {capabilities.map((c) => (
            <div className="cap-row" key={c.n}>
              <span>{c.n}</span>
              <div className="cap-head">
                <h3>{c.h}</h3>
                <p>{c.body}</p>
              </div>
              <div className="cap-body">
                <MicroIllustration kind={c.kind} className="cap-illus" />
                <div className="cap-tags">{c.tags.map((t) => <span key={t}>{t}</span>)}</div>
                <p className="cap-out"><b>Outcome.</b> {c.out}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section surface">
        <div className="section-wrap">
          <div className="section-lead"><h2>Different problems need different relationships.</h2></div>
          <div className="bridge">
            <article className="bridge-card">
              <p className="k">ONGOING CAPABILITY</p>
              <h3>Embedded Data Team</h3>
              <p>Ongoing data capability for organisations that need a team without building every role internally.</p>
              <a className="text-link" href="/services/embedded-data-team">Explore Embedded Data Teams <span className="arrow" aria-hidden="true">↗</span></a>
            </article>
            <article className="bridge-card">
              <p className="k">DEFINED SCOPE</p>
              <h3>Data Projects</h3>
              <p>Focused delivery when there is a specific problem, system or outcome to solve.</p>
              <a className="text-link" href="/services/data-projects">Explore Data Projects <span className="arrow" aria-hidden="true">↗</span></a>
            </article>
          </div>
        </div>
      </section>

      <section className="section ink">
        <div className="section-wrap callout-inner">
          <div>
            <h2>Not sure which one you need?</h2>
            <p>That’s usually a sign the problem needs diagnosing before it needs scoping.</p>
          </div>
          <div><a className="button footer-button" href="/data-diagnostic">Start with a Data Diagnostic <span aria-hidden="true">→</span></a></div>
        </div>
      </section>
    </PageShell>
  );
}
