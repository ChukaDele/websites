/* eslint-disable @next/next/no-img-element */
import { HeroMorph } from "../components/landing/HeroMorph";
import { PageMotion } from "../components/landing/PageMotion";
import { FooterExperience, ReferenceDashboards } from "../components/landing/Visuals";

const problems = [
  ["01", "Your numbers disagree.", "Finance, sales and operations report different versions of the same metric. Every meeting starts by deciding which one is right."],
  ["02", "Reporting runs on people.", "Analysts spend hours rebuilding recurring spreadsheets instead of answering new questions."],
  ["03", "Dashboards exist. Decisions still take too long.", "Reporting tells you what happened, but teams still need another meeting to understand why and what to do."],
  ["04", "The backlog keeps growing.", "Your internal team is overloaded, or there is no data team yet. Important work keeps waiting."],
];

const outcomes = [
  ["Finance", "Where is our cash? Who owes us? What moved against plan?", "Cash flow · Receivables · Profitability · Forecasting · Budget control"],
  ["Product", "What drives activation? Who might churn? Where can we expand?", "Funnels · Cohorts · Retention · Feature adoption · Customer health"],
  ["Revenue", "Where is pipeline leaking? Which accounts are growing? What actually converts?", "Funnel performance · Segmentation · Attribution · Forecasting · Customer economics"],
  ["Operations", "Where are the bottlenecks? What is off-SLA? What should we fix first?", "Process performance · Capacity · SLA monitoring · Exception management"],
];

const capabilities = [
  ["Data foundations", "Build a foundation your reporting can actually stand on.", "Pipelines · Warehouses · APIs · SQL · Python · Transformation · Data modelling"],
  ["Analytics & decision support", "Move from describing the business to understanding what needs attention.", "KPI frameworks · Funnel analysis · Cohorts · Segmentation · Root-cause analysis"],
  ["BI & reporting", "Give each team the information they need without creating another reporting burden.", "Power BI · Executive reporting · Operational dashboards · Self-service analytics"],
  ["Data quality & governance", "Make important numbers defined, traceable and testable.", "Reconciliation · Metric definitions · Quality tests · Data lineage · Documentation"],
  ["Automation & data operations", "Keep the system useful after launch.", "Scheduled reporting · Refresh monitoring · Automated workflows · Runbooks · Ongoing improvements"],
];

const principles = [
  ["01", "Traceable metrics", "Important numbers should have a source and definition."],
  ["02", "Reconciled systems", "When sources disagree, the discrepancy becomes work, not something hidden."],
  ["03", "Tests before presentation", "Beautiful reporting is worthless if the underlying logic is wrong."],
  ["04", "Known limitations", "We document where data stops being reliable instead of pretending every answer has equal confidence."],
  ["05", "Direct access", "No account-manager buffer. Questions go to the person who built the system."],
  ["06", "Built to transfer", "Documentation and structure should make the system understandable beyond the original builder."],
];

function Arrow() {
  return <span aria-hidden="true" className="arrow">↗</span>;
}

export default function Home() {
  return (
    <main>
      <PageMotion />
      <header className="site-header">
        <a className="brand" href="#top" aria-label="The Bredge home"><img src="/brand/bredge-logo.svg" alt="The Bredge" /></a>
        <nav aria-label="Primary navigation"><a href="#work">Work</a><a href="#services">Services</a><a href="#practice">Practice</a></nav>
        <a className="button button-small" href="#contact">Start a conversation <Arrow /></a>
      </header>

      <section className="hero section-wrap" id="top">
        <div className="hero-copy">
          <p className="eyebrow">DATA ENGINEERING <i /> ANALYTICS <i /> BUSINESS INTELLIGENCE</p>
          <h1>We build the data systems behind better business decisions.</h1>
          <p className="hero-summary">The Bredge is the data team that growing companies plug into. We connect fragmented systems, build reliable data foundations, automate reporting and turn complex data into answers people can act on.</p>
          <div className="hero-actions"><a className="button" href="#contact">Talk to a data lead <Arrow /></a><a className="text-link" href="#story">See how we work <span>↓</span></a></div>
          <p className="microcopy">Embedded data teams · Defined projects · Global engagements</p>
        </div>
        <div className="hero-system" aria-label="An illustrative data system becoming reliable">
          <div className="system-topline"><span className="signal" /> SYSTEM OBSERVATION <strong>LIVE</strong></div>
          <div className="system-grid" />
          <div className="system-globe"><div className="data-shard one"><small>PRODUCT</small><b>1,842</b><span>active accounts</span></div><div className="data-shard two"><small>BILLING</small><b>1,731</b><span>paid accounts</span></div><div className="data-shard three"><small>CRM</small><b>1,809</b><span>account records</span></div><div className="trusted-metric"><span>TRUSTED METRIC</span><b>1,772</b><small>reconciled customer entities</small><em>✓ verified</em></div><div className="orbit orbit-one" /><div className="orbit orbit-two" /></div>
        </div>
      </section>

      <HeroMorph />

      <section className="reassurance section-wrap">
        <p className="eyebrow">THE OPERATING MODEL</p>
        <div><h2>Senior capability.<br />Lean delivery.</h2><p>Whether you are a growing SME building your first data foundation or an established company adding project capacity, you work directly with the people solving your problem — and expand only when the value is clear.</p></div>
      </section>

      <section className="problem-section section-wrap">
        <div className="section-heading"><p className="eyebrow">THE PROBLEM</p><h2>Your data should answer questions. Not create more of them.</h2></div>
        <div className="problem-grid">{problems.map(([number, title, description]) => <article key={number} className="problem-card"><span>{number}</span><h3>{title}</h3><p>{description}</p></article>)}</div>
      </section>

      <section className="outcomes section-wrap"><div className="section-heading"><p className="eyebrow">BUSINESS OUTCOMES</p><h2>Start with the decision. Work backwards to the data.</h2></div><div className="outcome-grid">{outcomes.map(([name, question, details], index) => <article className={`outcome-card outcome-${index + 1}`} key={name}><span>0{index + 1}</span><h3>{name}</h3><p>{question}</p><small>{details}</small><div className="outcome-line" /></article>)}</div></section>

      <section id="services" className="capabilities section-wrap"><div className="capability-intro"><p className="eyebrow">SERVICES</p><h2>One data partner. From source to decision.</h2></div><div className="capability-list">{capabilities.map(([title, description, items], index) => <article key={title}><span>0{index + 1}</span><div><h3>{title}</h3><p>{description}</p></div><small>{items}</small></article>)}</div></section>

      <section id="work" className="work-section section-wrap"><div className="section-heading work-intro"><p className="eyebrow">REFERENCE WORK</p><h2>See the work behind the answer.</h2><p>Reference builds show how we connect sources, define metrics and deliver a trusted view.</p></div><ReferenceDashboards /></section>

      <section className="invisible"><div className="section-wrap"><div className="invisible-intro"><p className="eyebrow light">THE INVISIBLE 90%</p><h2>The dashboard is the last 10%.</h2><p>Before a number reaches a chart, we make sure it deserves to.</p></div><div className="quality-layout"><div className="quality-steps">{["Profile", "Resolve", "Reconcile", "Define", "Test", "Operate"].map((step, index) => <div key={step}><span>0{index + 1}</span><b>{step}</b></div>)}</div><div className="terminal"><div><span /> <span /> <span /></div><p>$ bredge checks run --environment reference</p>{["no_negative_durations", "source_reconciliation", "referential_integrity", "unique_customer_keys", "bounded_rates", "controlled_vocabulary"].map((check) => <p key={check} className="pass">✓ {check}</p>)}<strong>6 / 6 checks passed</strong><small>Reference environment · Synthetic data</small></div></div></div></section>

      <section className="trust section-wrap"><div className="section-heading"><p className="eyebrow">OUR PRINCIPLES</p><h2>Don’t take the dashboard on trust.</h2><p>We make the logic behind it visible.</p></div><div className="principles">{principles.map(([number, title, description]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{description}</p></article>)}</div><p className="trust-statement">Stay because we’re useful, not because only we understand what we built.</p></section>

      <section className="engagements section-wrap"><div className="section-heading"><p className="eyebrow">WAYS TO WORK WITH BREDGE</p><h2>Bring us a problem. Or plug in a team.</h2></div><div className="engagement-stack"><article className="engagement-card ongoing"><p>ONGOING</p><h3>Your data team, without building one from scratch.</h3><div><span>Embedded Data Team</span><p>An embedded, fractional senior data capability for companies that need consistent progress across engineering, analytics and reporting without hiring every role internally.</p><ul><li>Ongoing delivery</li><li>Engineering + analytics + BI</li><li>Shared backlog and priorities</li><li>Capacity that flexes with the business</li></ul><small>Best when data is an ongoing business capability rather than a one-off deliverable.</small><a className="engagement-link" href="mailto:hello@thebredge.com?subject=Embedded%20data%20team">Talk about an embedded team <Arrow /></a></div></article><article className="engagement-card projects"><p>DEFINED SCOPE</p><h3>One problem. The right team. End-to-end delivery.</h3><div><span>Data Projects</span><p>Bring us a defined data challenge. We scope the outcome, assemble the capability required and deliver the solution without turning it into a six-month consulting programme.</p><ul><li>Data pipelines</li><li>Warehouses and models</li><li>BI and reporting</li><li>Reconciliation and automation</li></ul><small>Best when the problem is clear and the outcome can be defined.</small><a className="engagement-link" href="mailto:hello@thebredge.com?subject=Data%20project">Talk about a data project <Arrow /></a></div></article></div></section>

      <section className="diagnostic section-wrap"><p className="eyebrow">DATA DIAGNOSTIC</p><div><h2>Not sure what needs fixing first?</h2><p>Start with a Data Diagnostic. We map the current environment, identify reliability and workflow gaps, and prioritise the changes most likely to improve decision-making.</p><small>Useful on its own. A clear starting point if more work follows.</small><a className="text-link" href="mailto:hello@thebredge.com?subject=Data%20diagnostic">Start with a diagnostic <Arrow /></a></div></section>

      <section id="practice" className="technology"><div className="section-wrap"><p className="eyebrow light">THE PRACTICE</p><h2>Tools change. Sound data practice doesn’t.</h2><p>We work with the environment you have, recommend complexity only when it earns its place, and build foundations that are AI-ready when you are.</p><div className="tech-line"><span>PYTHON</span><i /> <span>SQL</span><i /> <span>POSTGRESQL</span><i /> <span>POWER BI</span><i /> <span>GITHUB</span></div></div></section>
      <FooterExperience />
    </main>
  );
}
