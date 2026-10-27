import type { Metadata } from "next";
import { PageShell, Breadcrumbs } from "../../../components/site/PageShell";
import { pageMetadata, serviceJsonLd } from "../../../lib/seo";
import { BlurHero } from "../../../components/services/BlurHero";
import { WhatWeDo, type WwdItem } from "../../../components/landing/WhatWeDo";
import { ProblemRail, type RailItem } from "../../../components/services/ProblemRail";
import { AREA_SERVED } from "../_components/ServiceSections";
import "../../what-we-do.css";

/* Content: the Data Projects page as written (original site), word for word.
   Design: the Embedded Data Team page's sections. */

export const metadata: Metadata = pageMetadata({
  title: "Fixed-Price Data Projects: Engineering, BI & Analytics | The Bredge",
  description: "Outsourced data projects for UK and US companies at a fixed price: reconciliation, pipelines, warehouses, dashboards and reporting automation. Scoped and quoted before work starts.",
  path: "/services/data-projects",
});

// The six problems; every third pair of panels carries an image (the
// site's own illustrations, shown in black and white).
const problems: RailItem[] = [
  { title: "“Our systems don’t agree.”", text: "Reconcile finance, CRM, billing and operational data into a reliable view of the business.", image: { src: "/insights/why-dashboards-disagree-640.webp", alt: "Two bars of different heights, joined by a measuring tape" } },
  { title: "“We’re still reporting manually.”", text: "Replace recurring spreadsheets and hand-built management packs with automated reporting." },
  { title: "“Nobody trusts the dashboard.”", text: "Audit the underlying logic, definitions, model and source data before rebuilding the reporting layer.", image: { src: "/how/understand-640.webp", alt: "A magnifying glass over a tangle of thread" } },
  { title: "“We need a proper data foundation.”", text: "Build the ingestion, warehouse, transformations and models required for reliable analytics.", image: { src: "/how/build-640.webp", alt: "Blocks stacked into rising columns" } },
  { title: "“We have the data but can’t answer the question.”", text: "Design an analysis around a commercial, financial, product or operational decision." },
  { title: "“Our BI estate has become a mess.”", text: "Simplify reporting, standardise metrics and reduce duplicated or contradictory dashboards.", image: { src: "/how/validate-640.webp", alt: "A balance scale, level" } },
];

// The five delivery steps, in the homepage "What we actually do" layout (the
// wave only shapes the dot terrain).
const delivery: WwdItem[] = [
  { name: "Diagnose", text: "Understand the question, current environment and constraints.", wave: [1.6, 0.9, 0.7, 0.5] },
  { name: "Define", text: "Agree the outcome, acceptance criteria and important dependencies.", wave: [2.4, 0.6, 1.1, 0.8] },
  { name: "Build", text: "Design and implement the engineering, analysis and reporting required.", wave: [1.1, 1.2, 0.5, 0.35] },
  { name: "Validate", text: "Reconcile outputs, test logic and validate results against source systems.", wave: [3.0, 0.45, 1.4, 0.6] },
  { name: "Transfer", text: "Document how the system works and what your team needs to operate it.", wave: [1.9, 0.75, 0.9, 0.9] },
];

export default function ProjectsPage() {
  return (
    <PageShell dark>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ ...serviceJsonLd("Data Projects", "Fixed-scope, fixed-price data projects for UK and US companies: pipelines, warehouses and models, BI and reporting, reconciliation and automation.", "/services/data-projects"), areaServed: AREA_SERVED }) }} />
      <Breadcrumbs trail={[["Services", "/services"], ["Data Projects", "/services/data-projects"]]} />

      <BlurHero
        eyebrow="Data Projects"
        title="One problem. The right team."
        text="We size the solution to the problem — not the other way around."
        cta={{ label: "Discuss a project", href: "/schedule" }}
        image={{ src: "/media/services/dp-hero-1600.webp", srcSet: "/media/services/dp-hero-900.webp 900w, /media/services/dp-hero-1600.webp 1600w" }}
      />

      <ProblemRail title="Problems we can own." items={problems} link={{ label: "Discuss a project", href: "/schedule" }} />

      <WhatWeDo
        sectionId="dp-delivery"
        mono
        items={delivery}
        heading={["Defined enough to manage.", "Flexible enough to solve the real problem."]}
        mc=""
        lead={null}
        rows={null}
      />

    </PageShell>
  );
}
