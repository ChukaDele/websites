import type { Metadata } from "next";
import { PageShell } from "../../components/site/PageShell";
import { ServicesHero } from "../../components/services/ServicesHero";
import { CapabilityRow, type Capability } from "../../components/services/CapabilityRow";
import { HireUs } from "../../components/landing/HireUs";
import "../hire-us.css";
import { pageMetadata, serviceJsonLd } from "../../lib/seo";
import { AREA_SERVED, Faq, SvHead, type FaqItem } from "./_components/ServiceSections";

export const metadata: Metadata = pageMetadata({
  title: "Outsourced Data Team & Analytics Consultancy, UK & US | The Bredge",
  description: "Data engineering, analytics and BI consulting for growing and mid-market companies. A fractional data team for a fixed monthly fee, fixed-price data projects, or a Data Diagnostic to find where to start.",
  path: "/services",
});

const capabilities: Capability[] = [
  { kind: "engineering", h: "Data engineering", line: "Connect the systems you depend on into one reliable foundation.", tags: ["Pipelines", "API integrations", "Warehousing", "Data modelling"] },
  { kind: "analytics", h: "Analytics", line: "Analysis built around the decisions your teams make.", tags: ["KPI design", "Cohorts", "Retention & churn", "Forecasting"] },
  { kind: "bi", h: "BI and reporting", line: "Reporting built around questions, not around how many charts fit.", tags: ["Power BI", "Tableau", "Looker", "Semantic models"] },
  { kind: "quality", h: "Data quality", line: "Important numbers defined, traceable and testable.", tags: ["Metric definitions", "Reconciliation", "Lineage", "Documentation"] },
  { kind: "automation", h: "Automation", line: "Stop rebuilding the same answer every Monday morning.", tags: ["Scheduled reporting", "Refresh workflows", "Alerts"] },
];

/* OWNER CONFIRM: Diagnostic "Two weeks"; Embedded "Month to month" */

const faq: FaqItem[] = [
  ["How does pricing work?",
    "We don’t publish a rate card. The Diagnostic and Data Projects have a fixed price for an agreed scope. The Embedded Data Team has a fixed monthly fee based on how many days and which skills you need. Either way, you get a written proposal with a fixed price after the first call, before any work starts."],
  ["Which service should we start with?",
    "If you know the problem, a Data Project. If you need help every month, an Embedded Data Team. If you’re not sure, start with a Data Diagnostic, or book a call and we’ll tell you honestly."],
  ["How fast can you start?",
    "Usually within two weeks of agreeing the proposal."], /* OWNER CONFIRM: start within two weeks of proposal sign-off */
  ["Who does the work?",
    "Named people from The Bredge, not a rotating pool. You can meet them before you sign."], /* OWNER CONFIRM: named team, meet before signing */
  ["How do you handle our data and confidentiality?",
    "We sign your NDA before we see any data, and we work with read-only access wherever possible."], /* OWNER CONFIRM: sign client NDA before seeing data; read-only access */
  ["Do you work with UK and US companies?",
    "Yes. We work UK and US hours and agree check-in times that suit your team."], /* OWNER CONFIRM: cover UK and US working hours */
  ["Do we have to switch tools?",
    "No. We work in the stack you already have, including Power BI, Tableau, Looker, Excel, Python, SQL, PostgreSQL, Snowflake, BigQuery, dbt and Xero."],
];

export default function ServicesPage() {
  return (
    <PageShell dark>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ ...serviceJsonLd("Data engineering, analytics & BI consulting", "Data engineering, analytics and business intelligence consulting for UK and US companies: embedded data teams, fixed-scope data projects and data diagnostics.", "/services"), areaServed: AREA_SERVED }) }} />
      {/* OWNER CONFIRM: "two-week diagnostic" in the lede */}
      <ServicesHero />

      {/* Same section as the homepage: the three ways to hire, by buyer. */}
      <HireUs pricing />

      <section className="section sv-sec" aria-labelledby="sv-cap-title">
        <div className="section-wrap">
          <SvHead label="What we cover" title="One partner, across the whole stack." id="sv-cap-title" intro="The solution follows the problem. A reporting problem may really be a modelling problem." />
          <CapabilityRow items={capabilities} />
        </div>
      </section>


      <Faq items={faq} name="services" />

    </PageShell>
  );
}
