import type { Metadata } from "next";
import { PageShell } from "../../components/site/PageShell";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { DeliverableRail, type Deliverable } from "../../components/services/DeliverableRail";
import { DiagnosticTrack } from "../../components/services/DiagnosticTrack";
import { pageMetadata, serviceJsonLd } from "../../lib/seo";
import { AREA_SERVED, Faq, SvHead, ToolStrip, type FaqItem, type Segment } from "../services/_components/ServiceSections";
import { PortalHero } from "../../components/services/PortalHero";
import { HireUs, type Plan } from "../../components/landing/HireUs";
import "../services.css";
import "../hire-us.css";

/* OWNER CONFIRM: "two weeks" appears in the description below and in several headings on this page (hero lede and fact chip, track heading "Ten working days", the day track in components/services/DiagnosticTrack.tsx, needs list). Change them together. */
export const metadata: Metadata = pageMetadata({
  title: "Data Diagnostic: Fixed-Fee Data & Analytics Audit | The Bredge",
  description: "A fixed-fee data audit for UK and US companies. In two weeks you get a written findings report, a ranked fix list, a reconciliation of the numbers that disagree and a roadmap.",
  path: "/data-diagnostic",
});

const segments: Segment[] = [
  { seg: "small", who: "Small businesses", line: "The numbers feel off and you can’t tell if you need a hire, a tool or a clean-up. Find out before you spend on any of them.", fit: true },
  { seg: "growing", who: "Startups and growing teams", line: "You’re about to hire a data person or buy a BI tool. Get a map and a plan your first hire can start from.", fit: true },
  { seg: "large", who: "Large companies", line: "Reports disagree across teams and nobody can say which is right. Get an outside view and a ranked list to act on.", fit: true },
];

// Who it's for, in the homepage engagement-tabs layout: one tab per segment,
// its line on the card, the signs as the card's list. The "price" slot and
// note carry the hero's facts (two weeks; fixed fee, agreed first; no
// obligation after).
const TAB: Record<Segment["seg"], [string, Plan["icon"]]> = { small: ["Small business", "plant"], growing: ["Growing team", "cycle"], large: ["Large company", "buildings"] };

const triggers = [
  "Teams report different numbers",
  "Recurring reports are still manual",
  "Dashboards exist but aren’t trusted",
  "Analysts spend their time producing reports",
  "Metrics have no agreed definitions",
  "Source systems have drifted apart",
  "Considering a warehouse or BI rebuild",
  "About to hire a data team",
];

const plans: Plan[] = segments.map((sg) => ({
  id: sg.seg, tab: TAB[sg.seg][0], icon: TAB[sg.seg][1],
  title: sg.who, description: sg.line,
  price: "Two", unit: " weeks",
  cta: "Book a 30-minute call", href: "/schedule",
  noteLead: "Fixed fee, agreed first.", note: "No obligation after.",
  included: triggers,
}));

/* OWNER CONFIRM: two-week diagnostic, the day-by-day split below, and "NDA signed" at kick-off */
const timeline: Array<[string, string, string]> = [
  ["Before day 1", "Kick-off", "Agree questions, people and access. NDA signed."],
  ["Days 1 to 3", "Listen and map", "Short interviews. Trace each source to each report."],
  ["Days 4 to 8", "Test and reconcile", "Check definitions and quality. Explain the numbers that disagree."],
  ["Days 9 to 10", "Write up and walk through", "Rank the fixes and walk your team through them."],
];

const deliverables: Deliverable[] = [
  { mark: "burst", title: "Findings report", text: "What’s working, what’s breaking and why, with evidence." },
  { mark: "bars", title: "Ranked fix list", text: "Every issue by impact and effort, with an owner." },
  { mark: "rings", title: "Reconciliation", text: "Why two reports disagree, and which definition to keep." },
  { mark: "web", title: "Data flow map", text: "Sources, movements, reports and owners on one diagram." },
  { mark: "steps", title: "Sequenced roadmap", text: "First, next, later, with build, buy or keep for each." },
  { mark: "orbit", title: "Walkthrough session", text: "A working session with your team on the findings." },
];

const faq: FaqItem[] = [
  ["How much does a Data Diagnostic cost?",
    "It’s a fixed fee, quoted in writing after a 30-minute call. The fee depends on how many systems and teams are in scope. You know the full cost before we start."],
  ["How long does it take?",
    "Two weeks from kick-off to the walkthrough session."], /* OWNER CONFIRM: two-week duration */
  ["How fast can you start?",
    "Usually within one to two weeks of you agreeing the proposal."], /* OWNER CONFIRM: start within one to two weeks */
  ["Do we have to hire you afterwards?",
    "No. The report and roadmap are yours. You can implement them with us, with your own team or with someone else."],
  ["How much of our team’s time does it need?",
    "About an hour each from 3 to 5 people, plus one contact who can sort out access. We do the rest."], /* OWNER CONFIRM: 3 to 5 people, about an hour each */
  ["How do you handle our data and confidentiality?",
    "We sign your NDA before we see any data, and we work with read-only access wherever possible."], /* OWNER CONFIRM: sign client NDA before seeing data; read-only access */
  ["What time zones do you work in?",
    "We work UK and US hours and schedule interviews to suit your team."], /* OWNER CONFIRM: cover UK and US working hours */
];

export default function DiagnosticPage() {
  return (
    <PageShell dark>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ ...serviceJsonLd("Data Diagnostic", "A fixed-fee data audit: a mapped assessment of the current data environment, a reconciliation of conflicting numbers and a ranked, sequenced plan of the changes most likely to improve decision-making.", "/data-diagnostic"), areaServed: AREA_SERVED }) }} />
      {/* OWNER CONFIRM: "In two weeks" and the "Two weeks" fact chip */}
      <PortalHero
        title="Know something’s wrong?"
        accent="Find out what to fix first."
        italic="fix first."
        lede="In two weeks, a fixed-fee review shows what’s working, where it breaks down and what to fix first. The findings are yours to keep."
        primary={{ label: "Book a 30-minute call", href: "/schedule" }}
        secondary={{ label: "Ask a question first", href: "/contact" }}
        footer={<ToolStrip line="The diagnostic covers whatever you run today, including" className="is-dark" />}
      />

      <div className="dd-foot">
      <HireUs
        label="Who it’s for"
        title={<>Is this for you?<br />If you’re unsure where to start, yes.</>}
        aside=""
        tabsLabel="Your company"
        plans={plans}
        includedLabel="You may need a diagnostic if"
        pricing={[
          ["Tell us what’s in scope", "Which systems and which teams. One finance system and a BI tool is smaller than six sources and four departments."],
          ["We quote a fixed fee", "In a written proposal, agreed before we start. No hourly billing."],
          ["The findings are yours", "Implement them with us, with your own team, or take them elsewhere."],
        ]}
        pricingNote={<>One fixed fee, quoted before we start. <a href="/schedule">Get your fixed price: book a call <ArrowUpRight size={12} weight="bold" aria-hidden="true" /></a></>}
      />

      <section className="section sv-sec sv-tint" aria-labelledby="sv-when-title">
        <div className="section-wrap">
          <SvHead label="How the two weeks run" title="Ten working days, start to finish." id="sv-when-title" intro="Your team’s part is a kick-off, a few short interviews and the walkthrough. We do the rest." />
          {/* OWNER CONFIRM: ten working days / two weeks, and this day split */}
          <DiagnosticTrack phases={timeline} />
          <p className="sv-track-foot">More systems or teams in scope can extend this. If so, the proposal says by how much before you agree to it.</p>
        </div>
      </section>

      <DeliverableRail label="What you get" title="You leave with a map, not another meeting." items={deliverables} />
      </div>

      <Faq items={faq} name="diagnostic" />

    </PageShell>
  );
}
