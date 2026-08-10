import type { Metadata } from "next";
import { PageShell, Breadcrumbs } from "../../../components/site/PageShell";
import { RightSizedSolution } from "../../../components/interactions/RightSizedSolution";
import { pageMetadata, serviceJsonLd } from "../../../lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Data Engineering & Analytics Projects | The Bredge",
  description: "Bring The Bredge a defined data problem. We deliver data engineering, analytics, BI, automation and reporting projects from problem to working solution.",
  path: "/services/data-projects",
});

const problems: Array<[string, string]> = [
  ["“Our systems don’t agree.”", "Reconcile finance, CRM, billing and operational data into a reliable view of the business."],
  ["“We’re still reporting manually.”", "Replace recurring spreadsheets and hand-built management packs with automated reporting."],
  ["“Nobody trusts the dashboard.”", "Audit the underlying logic, definitions, model and source data before rebuilding the reporting layer."],
  ["“We need a proper data foundation.”", "Build the ingestion, warehouse, transformations and models required for reliable analytics."],
  ["“We have the data but can’t answer the question.”", "Design an analysis around a commercial, financial, product or operational decision."],
  ["“Our BI estate has become a mess.”", "Simplify reporting, standardise metrics and reduce duplicated or contradictory dashboards."],
];

const delivery: Array<[string, string, string]> = [
  ["01", "Diagnose", "Understand the question, current environment and constraints."],
  ["02", "Define", "Agree the outcome, acceptance criteria and important dependencies."],
  ["03", "Build", "Design and implement the engineering, analysis and reporting required."],
  ["04", "Validate", "Reconcile outputs, test logic and validate results against source systems."],
  ["05", "Transfer", "Document how the system works and what your team needs to operate it."],
];

export default function ProjectsPage() {
  return (
    <PageShell>
      <section className="section-wrap page-hero">
        <Breadcrumbs trail={[["Services", "/services"], ["Data Projects", "/services/data-projects"]]} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd("Data Projects", "Defined-scope data projects: pipelines, warehouses and models, BI and reporting, reconciliation and automation — delivered without turning into a transformation programme.", "/services/data-projects")) }} />
        <p className="eyebrow">DATA PROJECTS</p>
        <h1>One problem. The right team. Delivered, not just advised.</h1>
        <p className="lede">Bring us a defined data challenge. We’ll understand what is broken, determine what needs to change and deliver the working system — without turning every problem into a transformation programme.</p>
        <div className="hero-cta-row"><a className="button" href="/schedule">Discuss a project <span className="arrow" aria-hidden="true">↗</span></a></div>
      </section>

      <section className="section surface">
        <div className="section-wrap">
          <div className="section-lead">
            <h2>We size the solution to the problem — not the other way around.</h2>
            <p>A messy business problem rarely maps to a single service. We work out which disciplines it actually touches, then build only what the outcome needs.</p>
          </div>
          <RightSizedSolution />
        </div>
      </section>

      <section className="section">
        <div className="section-wrap">
          <div className="section-lead"><h2>Problems we can own.</h2></div>
          <div className="ruled">
            {problems.map(([q, a]) => (
              <div className="ruled-row" key={q}><span>—</span><p className="q">{q}</p><p>{a}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="section surface">
        <div className="section-wrap">
          <div className="section-lead"><h2>Defined enough to manage. Flexible enough to solve the real problem.</h2></div>
          <div className="ruled">
            {delivery.map(([n, h, p]) => (
              <div className="ruled-row" key={n}><span>{n}</span><h3>{h}</h3><p>{p}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="section ink">
        <div className="section-wrap callout-inner">
          <div>
            <h2>We don’t sell complexity for its own sake.</h2>
            <p>Sometimes the right answer is a new data platform. Sometimes it is three SQL models, a reliable metric definition and one excellent dashboard. Our job is to solve the problem at the level it actually exists.</p>
          </div>
          <div><p className="pull" style={{ color: "var(--paper)" }}>Solve it at the level the problem lives.</p></div>
        </div>
      </section>

      <section className="section-wrap callout">
        <div className="callout-inner">
          <div>
            <h2>Have a defined data problem?</h2>
            <p>Tell us what isn’t working yet. If it’s still fuzzy, a <a className="text-link" href="/data-diagnostic">Data Diagnostic</a> is the right first step.</p>
          </div>
          <div><a className="button" href="/schedule">Discuss a project <span className="arrow" aria-hidden="true">↗</span></a></div>
        </div>
      </section>
    </PageShell>
  );
}
