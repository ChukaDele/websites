import { SystemsStory } from "../components/landing/SystemsStory";
import { WhatWeDo } from "../components/landing/WhatWeDo";
import { TeamSuite } from "../components/landing/TeamSuite";
import { PageMotion } from "../components/landing/PageMotion";
import { WorkStudio } from "../components/landing/WorkStudio";
import { HireUs } from "../components/landing/HireUs";
import { SiteHeader } from "../components/site/SiteHeader";
import { SiteFooter } from "../components/site/SiteFooter";
import { ParticleField } from "../components/landing/ParticleField";
import { ExperienceRows } from "../components/site/ExperienceRows";
// Area styles load with the route that uses them (see app/layout.tsx).
import "./studio.css";
import "./hire-us.css";
import "./home.css";
import "./what-we-do.css";
import "./pipeline.css";

// This describes the content already rendered below. It gives crawlers a clear
// page-level subject without altering the approved visitor-facing copy.
const homepageStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": "https://thebredge.com/#webpage",
  url: "https://thebredge.com/",
  name: "When your numbers disagree, we find out why. | The Bredge",
  description: "The Bredge is the experienced data team you hire by the project or by the month. We connect the systems you already have, reconcile the numbers, and build reporting your team stops arguing with.",
  inLanguage: "en",
  isPartOf: { "@id": "https://thebredge.com/#website" },
  mainEntity: { "@id": "https://thebredge.com/#organization" },
  primaryImageOfPage: "https://thebredge.com/og.png",
  about: [
    { "@type": "Thing", name: "Data engineering" },
    { "@type": "Thing", name: "Data analytics" },
    { "@type": "Thing", name: "Business intelligence" },
    { "@type": "Thing", name: "Data reconciliation" },
    { "@type": "Thing", name: "Reporting automation" },
  ],
};

function Arrow() {
  return <span aria-hidden="true" className="arrow">↗</span>;
}

export default function Home() {
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageStructuredData) }} />
      <PageMotion />
      <SiteHeader variant="overlay" tone="dark" />

      <section className="hero-sd" id="top">
        <div className="hero-sd-field"><ParticleField className="hero-sd-canvas" /></div>

        <div className="hero-sd-screen">
          <div className="hero-sd-title">
            <a className="hero-sd-cue" href="#intro">{"/// Scroll to explore"}</a>
            <h1>When your numbers disagree, <span className="hero-sd-accent">we find out&nbsp;why.</span></h1>
          </div>
        </div>

        <div className="hero-sd-intro section-wrap" id="intro">
          <p className="hero-sd-statement">The Bredge is the experienced data team you hire by the project or by the month. We connect the systems you already have, reconcile the numbers, and build reporting your team stops arguing with.</p>
          <div className="hero-actions"><a className="button" href="/schedule">Book a 30-minute call <Arrow /></a><a className="text-link" href="#story">See how the work looks <span>↓</span></a></div>
          <p className="microcopy">Most engagements ship something usable inside the first month.</p>
        </div>
      </section>

      <ExperienceRows heading={false} tone="dark" />

      <SystemsStory />


      <TeamSuite />

      <WhatWeDo />

      <WorkStudio />


      <HireUs />


      <SiteFooter />
    </main>
  );
}
