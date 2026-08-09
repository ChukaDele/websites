import type { Metadata } from "next";
import { PageShell } from "../../components/site/PageShell";
import { DiagnosticScan } from "../../components/interactions/DiagnosticScan";
import { pageMetadata } from "../../lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Data Diagnostic & Analytics Audit | The Bredge",
  description: "A focused review of your data systems, reporting, metrics and workflows to identify reliability gaps, bottlenecks and the highest-value next steps.",
  path: "/data-diagnostic",
});

const triggers = [
  "Different teams report different numbers.",
  "Recurring reports still require manual work.",
  "Dashboards exist but aren’t trusted.",
  "Analysts spend most of their time producing reports.",
  "Metrics have no agreed definitions.",
  "Source systems have accumulated inconsistencies.",
  "You’re considering a warehouse or BI rebuild and don’t yet know whether it’s necessary.",
  "You’re about to hire a data team and want to understand what they’ll inherit.",
];

const review: Array<[string, string]> = [
  ["Business questions", "What does leadership actually need to know repeatedly?"],
  ["Source systems", "Where does the relevant information originate?"],
  ["Data movement", "How does it travel between systems today?"],
  ["Definitions", "Do important metrics mean the same thing to different teams?"],
  ["Reporting", "Which outputs are useful, duplicated, manual or unreliable?"],
  ["Quality", "Where are there missing records, inconsistent identities or unexplained differences?"],
  ["Ownership", "Who maintains the process when something breaks?"],
];

const deliverables = ["Current-state architecture", "Key reliability risks", "Reporting & workflow bottlenecks", "Metric-definition gaps", "Data-quality findings", "Priority opportunities", "Recommended target state", "Sequenced roadmap", "Build / buy / keep recommendations"];

export default function DiagnosticPage() {
  return (
    <PageShell>
      <section className="section-wrap page-hero">
        <p className="eyebrow">DATA DIAGNOSTIC</p>
        <h1>Know something is wrong. Not sure what to fix first?</h1>
        <p className="lede">You don’t need to commission a six-month data programme to find out. A Bredge Data Diagnostic gives you a clear view of what’s working, where reliability or efficiency is breaking down, and what deserves attention first.</p>
        <div className="hero-cta-row"><a className="button" href="/contact">Start a diagnostic <span className="arrow" aria-hidden="true">↗</span></a></div>
      </section>

      <section className="section surface">
        <div className="section-wrap">
          <div className="section-lead">
            <h2>We inspect the current state, then prioritise.</h2>
            <p>We map how data actually moves today, mark where it breaks down, and turn that into a sequenced list of the changes most likely to improve decision-making.</p>
          </div>
          <DiagnosticScan />
        </div>
      </section>

      <section className="section">
        <div className="section-wrap">
          <div className="section-lead"><h2>You may need a diagnostic if…</h2></div>
          <div className="grid-2">
            {triggers.map((t) => <article className="tile" key={t}><p style={{ color: "var(--ink)", fontSize: "1rem" }}>{t}</p></article>)}
          </div>
        </div>
      </section>

      <section className="section surface">
        <div className="section-wrap">
          <div className="section-lead"><h2>What we review.</h2></div>
          <div className="grid-3">
            {review.map(([h, p]) => <article className="tile" key={h}><h3>{h}</h3><p>{p}</p></article>)}
          </div>
        </div>
      </section>

      <section className="section ink">
        <div className="section-wrap">
          <div className="section-lead"><h2>You leave with a map, not another diagnosis meeting.</h2></div>
          <div className="cap-tags" style={{ marginBottom: 40 }}>
            {deliverables.map((d) => <span key={d} style={{ borderColor: "rgba(244,241,233,.22)", color: "#c3d0c9" }}>{d}</span>)}
          </div>
          <p className="pull" style={{ color: "var(--paper)", maxWidth: "30ch" }}>You can implement it with us, use your internal team, or take it elsewhere.</p>
        </div>
      </section>

      <section className="section-wrap callout">
        <div className="callout-inner">
          <div>
            <h2>Find the highest-leverage place to start.</h2>
            <p>If the diagnostic points to a defined piece of work, a <a className="text-link" href="/services/data-projects">Data Project</a> is often the next step.</p>
          </div>
          <div><a className="button" href="/contact">Talk to us about a Data Diagnostic <span className="arrow" aria-hidden="true">↗</span></a></div>
        </div>
      </section>
    </PageShell>
  );
}
