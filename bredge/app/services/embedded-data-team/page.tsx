import type { Metadata } from "next";
import { PageShell, Breadcrumbs } from "../../../components/site/PageShell";
import { ElasticTeam } from "../../../components/interactions/ElasticTeam";
import { pageMetadata } from "../../../lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Embedded & Fractional Data Teams | The Bredge",
  description: "Plug an experienced data team into your business without hiring every role internally. Data engineering, analytics, BI and ongoing data operations from The Bredge.",
  path: "/services/embedded-data-team",
});

const forWho: Array<[string, string]> = [
  ["There is no internal data team yet.", "You’ve outgrown spreadsheets and ad-hoc reporting but aren’t ready to hire a complete data organisation."],
  ["The existing team is overloaded.", "Important engineering, reporting or analytics work keeps losing priority to urgent requests."],
  ["Capability is missing.", "You may have analysts but no engineering capacity — or strong engineers without enough BI and commercial analytics."],
  ["The backlog never gets smaller.", "Every department has requests, but nobody has capacity to turn them into a coherent roadmap."],
];

const coverage: Array<[string, string]> = [
  ["Engineering", "Pipelines, integrations, warehouses, SQL, Python and data models."],
  ["Analytics", "KPIs, investigations, segmentation, funnels, cohorts and decision support."],
  ["BI", "Dashboards, reporting, semantic models and self-service environments."],
  ["Data operations", "Quality monitoring, refreshes, documentation, recurring reporting and improvement."],
];

const steps: Array<[string, string, string]> = [
  ["01", "Understand", "We learn your business, systems, recurring decisions and current data problems."],
  ["02", "Prioritise", "Together we build a living backlog based on business impact, dependencies and effort."],
  ["03", "Deliver", "The right mix of engineering, analytics and BI works through the highest-value priorities."],
  ["04", "Operate", "We monitor, document, improve and support what has already been built."],
  ["05", "Transfer", "Systems are documented so knowledge stays with the organisation — not one consultant’s head."],
];

export default function EmbeddedPage() {
  return (
    <PageShell>
      <section className="section-wrap page-hero">
        <Breadcrumbs trail={[["Services", "/services"], ["Embedded Data Team", "/services/embedded-data-team"]]} />
        <p className="eyebrow">EMBEDDED DATA TEAM</p>
        <h1>Your data team, without building one from scratch.</h1>
        <p className="lede">Get ongoing engineering, analytics and BI capability working inside the rhythm of your business. We take ownership of an agreed data backlog, work closely with your teams and keep improving the systems behind your decisions.</p>
        <div className="hero-cta-row">
          <a className="button" href="/schedule">Discuss an embedded team <span className="arrow" aria-hidden="true">↗</span></a>
        </div>
        <p className="microcopy" style={{ marginTop: 28 }}>A practical alternative to hiring an entire data function or managing multiple freelancers.</p>
      </section>

      <section className="section surface">
        <div className="section-wrap">
          <div className="section-lead">
            <h2>One relationship. Capability that flexes.</h2>
            <p>The backlog changes. Some months lean on engineering, some on reporting, some on steady operation. It’s the same team and the same agreed priorities — not four freelancers to manage.</p>
          </div>
          <ElasticTeam />
        </div>
      </section>

      <section className="section">
        <div className="section-wrap">
          <div className="section-lead"><h2>You probably don’t need another pair of hands. You need somebody to own the work.</h2></div>
          <div className="ruled">
            {forWho.map(([h, p], i) => (
              <div className="ruled-row" key={h}><span>{String(i + 1).padStart(2, "0")}</span><h3>{h}</h3><p>{p}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="section surface">
        <div className="section-wrap">
          <div className="section-lead">
            <h2>More than people on a timesheet.</h2>
            <p>Staff augmentation gives you extra capacity to manage. Our embedded model is built around shared ownership of outcomes — we agree what matters most, what to build next, what “reliable” means, who owns each decision and how progress is measured, then deliver against that rhythm. One team covers the whole stack:</p>
          </div>
          <div className="ruled">
            {coverage.map(([h, p]) => (
              <div className="ruled-row" key={h}><span>—</span><h3>{h}</h3><p>{p}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-wrap">
          <div className="section-lead"><h2>One backlog. The right capability at the right time.</h2></div>
          <div className="steps">
            {steps.map(([n, h, p]) => <div className="step" key={n}><span>{n}</span><h3>{h}</h3><p>{p}</p></div>)}
          </div>
        </div>
      </section>

      <section className="section ink">
        <div className="section-wrap callout-inner">
          <div>
            <h2>Stay because we’re useful. Not because you’re trapped.</h2>
            <p>We deliberately build systems other capable people can understand. Documentation, metric definitions, source logic and operating runbooks are part of the work. If you eventually build an internal team, they should inherit a better data environment — not a dependency on us.</p>
          </div>
          <div>
            <p className="pull" style={{ color: "var(--paper)" }}>Good partners reduce dependency.</p>
            <a className="text-link" style={{ marginTop: 24, color: "var(--paper)", borderColor: "var(--paper)" }} href="/how-we-work">See how we work <span className="arrow" aria-hidden="true">↗</span></a>
          </div>
        </div>
      </section>

      <section className="section-wrap callout">
        <div className="callout-inner">
          <div>
            <h2>Need a data function before you’re ready to hire one?</h2>
            <p>Tell us where the backlog is winning. We’ll work out the right shape of team from there.</p>
          </div>
          <div><a className="button" href="/schedule">Discuss an embedded team <span className="arrow" aria-hidden="true">↗</span></a></div>
        </div>
      </section>
    </PageShell>
  );
}
