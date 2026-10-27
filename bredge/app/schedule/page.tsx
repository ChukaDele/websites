import type { Metadata } from "next";
import { PageShell } from "../../components/site/PageShell";
import { CalEmbed } from "../../components/site/CalEmbed";
import { pageMetadata } from "../../lib/seo";
import "../contact.css";

export const metadata: Metadata = pageMetadata({
  title: "Schedule a call | The Bredge",
  description: "Book a 30-minute call with The Bredge. Bring the messy version. We’ll use the conversation to understand the problem and whether there’s a useful next step.",
  path: "/schedule",
});

export default function SchedulePage() {
  return (
    <PageShell>
      <section className="section-wrap schedule-hero">
        <p className="eyebrow">SCHEDULE A CALL</p>
        <h1>Let’s talk about what’s not working.</h1>
        <p className="lede">Bring the messy version. You don’t need a finished brief. We’ll use the conversation to understand the problem, what your team has today and whether there’s a useful next step.</p>
        <p className="schedule-reassure">30 minutes · No prepared brief required</p>
      </section>

      <section className="section-wrap ct-call" aria-labelledby="ct-call-title">
        <div className="ct-call-steps">
          <h2 id="ct-call-title" className="eyebrow">WHAT HAPPENS ON THE CALL</h2>
          <ol className="ct-steps">
            <li><span aria-hidden="true">01</span><p>You describe the problem, in your own words.</p></li>
            <li><span aria-hidden="true">02</span><p>We ask about your systems, your data and the numbers you rely on.</p></li>
            {/* OWNER CONFIRM: written proposal with a fixed price. */}
            <li><span aria-hidden="true">03</span><p>You leave with a clear next step. If it’s a fit, we follow up with a written proposal and a fixed price.</p></li>
          </ol>
        </div>
        <div className="ct-call-side">
          <h2 className="eyebrow">WHO YOU’LL SPEAK TO</h2>
          {/* OWNER CONFIRM: calls are taken by a senior member of the data team, not a salesperson. */}
          <p>A senior member of the data team, not a salesperson.</p>
          {/* OWNER CONFIRM: working hours across UK and US time zones. */}
          <p className="ct-hours">We work across UK and US time zones. Times below show in your local time zone.</p>
          <p className="ct-alt">Prefer to write first? <a className="text-link" href="/contact">Send us a message <span className="arrow" aria-hidden="true">↗</span></a></p>
        </div>
      </section>

      <section className="section-wrap schedule-embed" aria-label="Book a time with The Bredge">
        <CalEmbed />
      </section>
    </PageShell>
  );
}
