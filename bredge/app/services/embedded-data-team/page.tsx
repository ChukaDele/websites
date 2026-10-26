import type { Metadata } from "next";
import { PageShell, Breadcrumbs } from "../../../components/site/PageShell";
import { pageMetadata, serviceJsonLd } from "../../../lib/seo";
import { GridHero } from "../../../components/services/GridHero";
import { WhatWeDo, type WwdItem } from "../../../components/landing/WhatWeDo";
import { EmCards, EmHead } from "../../../components/services/EmbeddedSections";
import { AREA_SERVED } from "../_components/ServiceSections";
import "../../what-we-do.css";

/* Content: the Embedded Data Team page as written (original site), word for
   word. Design: the homepage and Services overview grammar. */

export const metadata: Metadata = pageMetadata({
  title: "Fractional Data Team for UK & US Businesses | The Bredge",
  description: "An outsourced, fractional data team for a fixed monthly fee. Data engineering, analytics and BI in the tools you already use, without the cost of a full-time hire.",
  path: "/services/embedded-data-team",
});

const forWho: Array<[string, string]> = [
  ["There is no internal data team yet.", "You’ve outgrown spreadsheets and ad-hoc reporting but aren’t ready to hire a complete data organisation."],
  ["The existing team is overloaded.", "Important engineering, reporting or analytics work keeps losing priority to urgent requests."],
  ["Capability is missing.", "You may have analysts but no engineering capacity — or strong engineers without enough BI and commercial analytics."],
  ["The backlog never gets smaller.", "Every department has requests, but nobody has capacity to turn them into a coherent roadmap."],
];

const coverage: Array<[string, string]> = [
  ["Engineering", "Pipelines, integrations, warehouses, SQL, Python and data models."],
  ["Analytics", "KPIs, investigations, segmentation, funnels, cohorts and decision support."],
  ["BI", "Dashboards, reporting, semantic models and self-service environments."],
  ["Data operations", "Quality monitoring, refreshes, documentation, recurring reporting and improvement."],
];

// The five steps, in the homepage "What we actually do" layout (the wave
// only shapes the dot terrain).
const steps: WwdItem[] = [
  { name: "Understand", text: "We learn your business, systems, recurring decisions and current data problems.", wave: [1.6, 0.9, 0.7, 0.5] },
  { name: "Prioritise", text: "Together we build a living backlog based on business impact, dependencies and effort.", wave: [2.4, 0.6, 1.1, 0.8] },
  { name: "Deliver", text: "The right mix of engineering, analytics and BI works through the highest-value priorities.", wave: [1.1, 1.2, 0.5, 0.35] },
  { name: "Operate", text: "We monitor, document, improve and support what has already been built.", wave: [3.0, 0.45, 1.4, 0.6] },
  { name: "Transfer", text: "Systems are documented so knowledge stays with the organisation — not one consultant’s head.", wave: [1.9, 0.75, 0.9, 0.9] },
];

export default function EmbeddedPage() {
  return (
    <PageShell dark>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ ...serviceJsonLd("Embedded Data Team", "An embedded, fractional data team for UK and US businesses: ongoing data engineering, analytics and BI capacity for a fixed monthly fee, without hiring every specialist role internally.", "/services/embedded-data-team"), areaServed: AREA_SERVED }) }} />
      <Breadcrumbs trail={[["Services", "/services"], ["Embedded Data Team", "/services/embedded-data-team"]]} />

      <GridHero
        eyebrow="Embedded Data Team"
        title="Your data team,"
        accent="without building one from scratch."
        cta={{ label: "Discuss an embedded team", href: "/schedule" }}
        columns={[
          "One relationship. Capability that flexes.",
          "The backlog changes. Some months lean on engineering, some on reporting, some on steady operation.",
          "It’s the same team and the same agreed priorities — not four freelancers to manage.",
        ]}
      />

      <section className="em-sec" aria-labelledby="em-who-title">
        <div className="em-wrap">
          <EmHead id="em-who-title" lines={["You probably don’t need another pair of hands.", "You need somebody to own the work."]} />
          <EmCards items={forWho} />
        </div>
      </section>

      <section className="em-sec" aria-labelledby="em-stack-title">
        <div className="em-wrap">
          <div className="em-frame">
            <EmHead id="em-stack-title" rule={false} lines={["More than people", "on a timesheet."]} text="Staff augmentation gives you extra capacity to manage. Our embedded model is built around shared ownership of outcomes — we agree what matters most, what to build next, what “reliable” means, who owns each decision and how progress is measured, then deliver against that rhythm. One team covers the whole stack:" />
            <EmCards items={coverage} variant="ruled" />
          </div>
        </div>
      </section>

      <WhatWeDo
        sectionId="em-steps"
        items={steps}
        heading={["One backlog.", "The right capability at the right time."]}
        mc=""
        lead={null}
        rows={null}
      />

    </PageShell>
  );
}
