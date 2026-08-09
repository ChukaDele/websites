import type { Metadata } from "next";
import { PageShell } from "../../components/site/PageShell";
import { TraceDecision } from "../../components/interactions/TraceDecision";
import { pageMetadata } from "../../lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "How We Work | The Bredge",
  description: "How The Bredge delivers data work: start with the decision, show the logic, resolve disagreement, validate before trust and build systems your team can operate.",
  path: "/how-we-work",
});

const principles: Array<[string, string, string]> = [
  ["01", "Start with the decision.", "Technology comes after understanding what somebody needs to know, do or change."],
  ["02", "Show the logic.", "Important metrics, transformations and assumptions should be explainable — not buried behind a dashboard."],
  ["03", "Resolve disagreement.", "When two systems disagree, we investigate the difference instead of picking whichever number looks more plausible."],
  ["04", "Test before trust.", "We validate relationships, ranges, totals and business logic before presenting outputs as reliable."],
  ["05", "Build for operation.", "A successful project should still work three months after the project team leaves."],
  ["06", "Document the edges.", "We state known limitations instead of pretending every dataset or model has equal confidence."],
];

const rhythm: Array<[string, string, string]> = [
  ["01", "Context", "Business questions, stakeholders, systems and constraints."],
  ["02", "Evidence", "Profile the data before assuming what is possible."],
  ["03", "Design", "Agree the model, definitions, outputs and operating approach."],
  ["04", "Build", "Deliver in visible increments rather than disappearing into a long implementation phase."],
  ["05", "Validate", "Test and reconcile before sign-off."],
  ["06", "Operate or hand over", "Keep improving the system — or leave your team with what it needs to own it."],
];

const handover = ["Architecture", "Source definitions", "Metric dictionary", "Data model", "Quality checks", "Refresh ownership", "Runbook", "Known limitations"];

export default function HowWeWorkPage() {
  return (
    <PageShell>
      <section className="section-wrap page-hero">
        <p className="eyebrow">HOW WE WORK</p>
        <h1>Close to the problem. Clear about the work.</h1>
        <p className="lede">Good data work depends as much on understanding the business as understanding the stack. We work closely with the people who use the data, keep the technical logic visible, and avoid adding process unless it improves the result.</p>
      </section>

      <section className="section surface">
        <div className="section-wrap">
          <div className="section-lead">
            <h2>Every number should trace back to a source.</h2>
            <p>Follow a decision backwards — through the metric, its definition, the model, the transformation and the source it came from. Nothing hidden.</p>
          </div>
          <TraceDecision />
        </div>
      </section>

      <section className="section">
        <div className="section-wrap">
          <div className="section-lead"><h2>Six principles that shape the work.</h2></div>
          <div className="ruled">
            {principles.map(([n, h, p]) => (
              <div className="ruled-row" key={n}><span>{n}</span><h3>{h}</h3><p>{p}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="section surface">
        <div className="section-wrap">
          <div className="section-lead"><h2>A working rhythm, not a black box.</h2></div>
          <div className="ruled">
            {rhythm.map(([n, h, p]) => (
              <div className="ruled-row" key={n}><span>{n}</span><h3>{h}</h3><p>{p}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-wrap callout-inner" style={{ background: "var(--surface)" }}>
          <div>
            <h2>No account-management telephone game.</h2>
            <p>Where practical, clients work directly with the people solving the problem. We keep communication concise, surface blockers early and make decisions visible.</p>
          </div>
          <div>
            <p className="k" style={{ margin: "0 0 14px", color: "#5a6964", font: "10px ui-monospace,monospace", letterSpacing: ".1em" }}>DOCUMENTATION MAY INCLUDE</p>
            <div className="cap-tags">{handover.map((h) => <span key={h}>{h}</span>)}</div>
          </div>
        </div>
      </section>

      <section className="section-wrap callout">
        <div className="callout-inner">
          <div><h2>See how we could approach your data problem.</h2><p>Tell us where it hurts. We’ll show you how we’d think about it.</p></div>
          <div><a className="button" href="/contact">Start a conversation <span className="arrow" aria-hidden="true">↗</span></a></div>
        </div>
      </section>
    </PageShell>
  );
}
