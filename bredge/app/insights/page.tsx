import type { Metadata } from "next";
import { PageShell } from "../../components/site/PageShell";
import { pageMetadata } from "../../lib/seo";

// Route kept for internal development only. Not linked from nav or footer, and
// noindexed — we don't publicly expose an unfinished publication. Real editorial
// design ships once at least three substantive pieces are written
// (see integrations/insights/README when content is ready).
export const metadata: Metadata = {
  ...pageMetadata({
    title: "Insights | The Bredge",
    description: "Practical writing about data engineering, analytics, BI and the organisational problems that make otherwise good data work fail.",
    path: "/insights",
  }),
  robots: { index: false, follow: false },
};

export default function InsightsPage() {
  return (
    <PageShell>
      <section className="section-wrap page-hero">
        <p className="eyebrow">BREDGE INSIGHTS</p>
        <h1 style={{ maxWidth: "18ch" }}>The problems behind the dashboard.</h1>
        <p className="lede">Practical writing on data engineering, analytics and the organisational problems that make otherwise good data work fail — publishing soon.</p>
        <div className="hero-cta-row"><a className="button" href="/contact">Talk to a data lead <span className="arrow" aria-hidden="true">↗</span></a></div>
      </section>
    </PageShell>
  );
}
