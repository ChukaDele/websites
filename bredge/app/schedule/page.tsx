import type { Metadata } from "next";
import { PageShell } from "../../components/site/PageShell";
import { CalEmbed } from "../../components/site/CalEmbed";
import { pageMetadata } from "../../lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Schedule a call | The Bredge",
  description: "Book a 30-minute call with The Bredge. Bring the messy version — we’ll use the conversation to understand the problem and whether there’s a useful next step.",
  path: "/schedule",
});

export default function SchedulePage() {
  return (
    <PageShell>
      <section className="section-wrap schedule-hero">
        <p className="eyebrow">SCHEDULE A CALL</p>
        <h1>Let’s talk about what’s not working.</h1>
        <p className="lede">Bring the messy version. You don’t need a finished brief — we’ll use the conversation to understand the problem, what your team has today and whether there’s a useful next step.</p>
        <p className="schedule-reassure">30 minutes · No prepared brief required</p>
      </section>

      <section className="section-wrap schedule-embed">
        <CalEmbed />
        <p className="schedule-alt">Prefer to send the context first? <a className="text-link" href="/contact">Contact us <span className="arrow" aria-hidden="true">↗</span></a></p>
      </section>
    </PageShell>
  );
}
