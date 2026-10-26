import type { Metadata } from "next";
import { PageShell } from "../../components/site/PageShell";
import { PortfolioStudio } from "../../components/work/PortfolioStudio";
import { pageMetadata } from "../../lib/seo";
// Area styles load with the route that uses them (see app/layout.tsx).
import "../studio.css";
import "../pipeline.css";
import "../portfolio/supply-chain.css";
import "../portfolio/hospital.css";
import "../portfolio/financial-performance.css";
import "../portfolio/major-companies.css";
import "../portfolio/saas-analytics.css";
import "../portfolio/marketing.css";
import "../portfolio/hr.css";

export const metadata: Metadata = pageMetadata({
  title: "Our Work | The Bredge",
  description: "Interactive dashboards you can click through and monthly data briefs built on official statistics: the work The Bredge does, on public and synthetic data.",
  path: "/work",
});

export default function WorkPage() {
  return (
    <PageShell>
      <PortfolioStudio />

      <section className="section-wrap work-cta">
        <h2>Want this for your own numbers?</h2>
        <p>Most engagements ship something usable inside the first month.</p>
        <a className="button" href="/schedule">Book a 30-minute call <span aria-hidden="true" className="arrow">↗</span></a>
      </section>
    </PageShell>
  );
}
