import type { Metadata } from "next";
import { PageShell } from "../../components/site/PageShell";
import { GlobeHero } from "../../components/work/GlobeHero";
import { HowWeWork } from "../../components/work/HowWeWork";
import { DeliverableRail, type Deliverable } from "../../components/services/DeliverableRail";
import "../services.css";
import { pageMetadata } from "../../lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "How We Work & About Us | The Bredge",
  description: "How The Bredge delivers data work: start with the decision, show the logic, resolve disagreement, validate before trust and build systems your team can operate.",
  path: "/how-we-work",
});

// What we believe, as the rail's panels (from Who we are).
const beliefs: Deliverable[] = [
  { mark: "burst", title: "The dashboard isn’t the work.", text: "It’s usually the visible end of a much larger system." },
  { mark: "web", title: "Business context is technical context.", text: "Understanding revenue, customers and operations changes how the data should be modelled." },
  { mark: "steps", title: "Complexity should earn its place.", text: "A more sophisticated architecture is not automatically a better one." },
  { mark: "bars", title: "Reliability beats theatre.", text: "A simple answer your team can defend beats an impressive system nobody understands." },
  { mark: "rings", title: "Good partners reduce dependency.", text: "We should leave your data clearer than we found it." },
];

export default function HowWeWorkPage() {
  return (
    <PageShell overlay>
      <GlobeHero
        chip={{ tag: "How we work", text: "Six principles that shape the work", href: "#hw-title" }}
        title={["Close to the problem.", "Clear about the work."]}
        lede="Good data work depends as much on understanding the business as understanding the stack. We work closely with the people who use the data, keep the technical logic visible, and avoid adding process unless it improves the result."
        primary={{ label: "Schedule a call", href: "/schedule" }}
        secondary={{ label: "See the five steps", href: "#hw-title" }}
      />

      <HowWeWork />

      <DeliverableRail
        id="about"
        label="Who we are"
        title="Technical enough to build it. Close enough to the business to know why it matters."
        intro="The Bredge brings data engineering, analytics and business intelligence together around one idea: data is only valuable when somebody can use it to make a better decision. No account-manager layer and no hand-offs: whoever you talk to designs the models, reconciles the numbers and keeps the systems running."
        items={beliefs}
      />
    </PageShell>
  );
}
