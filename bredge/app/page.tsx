import { HeroMorph } from "../components/landing/HeroMorph";
import { PageMotion } from "../components/landing/PageMotion";
import { ReferenceDashboards } from "../components/landing/Visuals";
import { SiteHeader } from "../components/site/SiteHeader";
import { SiteFooter } from "../components/site/SiteFooter";
import { HeroVideo } from "../components/site/HeroVideo";
import { InvisibleQuery } from "../components/landing/InvisibleQuery";
import { ExperienceRows } from "../components/site/ExperienceRows";

const problems = [
  ["01", "Your numbers disagree.", "Finance, sales and ops report different versions of the same metric. Every meeting starts by deciding which one is right. (“What’s our actual MRR?” “Which customers are we counting?”)"],
  ["02", "Your reporting is a person, not a system.", "Someone rebuilds the same spreadsheet every Monday. When they’re on leave, the report doesn’t happen."],
  ["03", "You have dashboards. You still need a meeting.", "The chart tells you revenue dropped. It doesn’t tell you which segment, when it started, or who to call."],
  ["04", "The data backlog never moves.", "Your team is at capacity, or there isn’t a team yet. The important work keeps getting pushed behind the urgent work."],
];

const outcomes = [
  ["Finance", "Where is our cash? Who owes us? What moved against plan?", "Cash flow · Receivables · Profitability · Forecasting · Budget control"],
  ["Product", "What drives activation? Who might churn? Where can we expand?", "Funnels · Cohorts · Retention · Feature adoption · Customer health"],
  ["Revenue", "Where is pipeline leaking? Which accounts are growing? What actually converts?", "Funnel performance · Segmentation · Attribution · Forecasting · Customer economics"],
  ["Operations", "Where are the bottlenecks? What is off-SLA? What should we fix first?", "Process performance · Capacity · SLA monitoring · Exception management"],
];

const capabilities = [
  ["Data foundations", "Get your data into one place, on a schedule, without anyone babysitting it.", "Pipelines · Warehouses · APIs · SQL · Python · Transformation · Data modelling"],
  ["Analytics", "Work out why a number moved, not just that it moved.", "KPI frameworks · Funnel analysis · Cohorts · Segmentation · Root-cause analysis"],
  ["BI & reporting", "Dashboards people open more than once.", "Power BI · Executive reporting · Operational dashboards · Self-service analytics"],
  ["Data quality & governance", "Make the important numbers defined, traceable and testable.", "Reconciliation · Metric definitions · Quality tests · Data lineage · Documentation"],
  ["Automation & data ops", "Something is watching the pipeline at 6am so you don’t find out at 10.", "Scheduled reporting · Refresh monitoring · Automated workflows · Runbooks · Ongoing improvements"],
];

// Four, not six. 05 (Direct access) now lives in the "Who you'll work with"
// block above, where it has context; 06 (Built to transfer) folded into 04 —
// honesty about limits and honesty about lock-in are the same promise.
const principles = [
  ["01", "Traceable metrics", "Every number traces back to a source row and a written definition. If you ask where it came from, you get an answer, not a shrug."],
  ["02", "Reconciled systems", "When two systems disagree, the gap becomes a ticket. It doesn’t get quietly averaged away."],
  ["03", "Tests before presentation", "Beautiful reporting is worthless if the logic underneath is wrong."],
  ["04", "Documented, and yours", "We write down where the data stops being reliable instead of pretending every answer has equal confidence. And we document the build well enough that you could replace us."],
];

function Arrow() {
  return <span aria-hidden="true" className="arrow">↗</span>;
}

const artCounts = [6, 18, 3, 4];
function OutcomeArt({ index }: { index: number }) {
  return <div className={`outcome-art art-${index + 1}`} aria-hidden="true">{Array.from({ length: artCounts[index] }, (_, i) => <i key={i} />)}</div>;
}

export default function Home() {
  return (
    <main>
      <PageMotion />
      <SiteHeader variant="overlay" />

      <section className="hero section-wrap" id="top">
        <div className="hero-copy">
          <p className="eyebrow">DATA ENGINEERING <i /> ANALYTICS <i /> BUSINESS INTELLIGENCE</p>
          <h1>When your numbers disagree, we find out why.</h1>
          <p className="hero-summary">The Bredge is the experienced data team you hire by the project or by the month. We connect the systems you already have, reconcile the numbers, and build reporting your team stops arguing with.</p>
          <div className="hero-actions"><a className="button" href="/schedule">Book a 30-minute call <Arrow /></a><a className="text-link" href="#story">See how the work looks <span>↓</span></a></div>
          <p className="microcopy">Most engagements ship something usable inside the first month.</p>
        </div>
        <HeroVideo />
      </section>

      <HeroMorph />

      <ExperienceRows />

      <section className="reassurance section-wrap">
        <p className="eyebrow">WHO YOU’LL WORK WITH</p>
        <div><h2>You work with the person who builds it.</h2><p>There’s no account manager between you and the person writing the SQL. When you ask why a number looks wrong, the answer comes from whoever built it. We bring in specialists when a project needs them, and you’ll know who they are and what they’re doing.</p></div>
      </section>

      <section className="problem-section section-wrap">
        <div className="section-heading"><h2>Four versions of this show up in almost every call.</h2></div>
        <div className="problem-grid">{problems.map(([number, title, description]) => <article key={number} className="problem-card"><span>{number}</span><h3>{title}</h3><p>{description}</p></article>)}</div>
      </section>

      <section className="outcomes section-wrap"><div className="section-heading"><h2>The questions each team actually asks.</h2></div><div className="outcome-grid">{outcomes.map(([name, question, details], index) => <article className={`outcome-card outcome-${index + 1}`} key={name}><span>0{index + 1}</span><h3>{name}</h3><p>{question}</p><small>{details}</small><OutcomeArt index={index} /></article>)}</div></section>

      <section id="services" className="capabilities section-wrap"><div className="capability-intro"><h2>What we actually do.</h2></div><div className="capability-list">{capabilities.map(([title, description, items], index) => <article key={title}><span>0{index + 1}</span><div><h3>{title}</h3><p>{description}</p></div><small>{items}</small></article>)}</div></section>

      <section id="work" className="work-section section-wrap"><div className="section-heading work-intro"><p className="eyebrow">SYNTHETIC DATA</p><h2>We can’t show you a client’s dashboard. So we built our own.</h2><p>Client work is under NDA. These are the same patterns on synthetic data, with the SQL and the tests left visible, so you can judge the thinking instead of the screenshot.</p></div><ReferenceDashboards /></section>

      <InvisibleQuery />

      <section className="trust section-wrap"><div className="section-heading"><p className="eyebrow">OUR PRINCIPLES</p><h2>Don’t take the dashboard on trust.</h2></div><div className="principles">{principles.map(([number, title, description]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{description}</p></article>)}</div><p className="trust-statement">Stay because we’re useful, not because only we understand what we built.</p></section>

      <section className="engagements section-wrap"><div className="section-heading"><h2>Two ways to hire us.</h2></div><div className="engagement-stack"><article className="engagement-card ongoing"><p>ONGOING</p><h3>Your data team, without building one from scratch.</h3><div><span>Embedded data team</span><p>A senior engineer and analyst working your backlog every week, for less than one full-time hire. You get the range of a whole team without recruiting four people who each do one thing.</p><ul><li>Ongoing delivery</li><li>Engineering, analytics and BI</li><li>Shared backlog</li><li>Scale hours up or down monthly</li></ul><small>Best when data is a standing part of how you run the business.</small><a className="engagement-link" href="/services/embedded-data-team">Explore embedded teams <Arrow /></a></div></article><article className="engagement-card projects"><p>DEFINED SCOPE</p><h3>One problem. The right team. Delivered.</h3><div><span>Data projects</span><p>Tell us the problem. We scope it, quote it, build it, and hand it over documented. No six-month consulting programme.</p><ul><li>Pipelines</li><li>Warehouses and models</li><li>BI and reporting</li><li>Reconciliation and automation</li></ul><small>Best when you know what’s broken.</small><a className="engagement-link" href="/services/data-projects">Explore data projects <Arrow /></a></div></article></div></section>

      <section className="diagnostic section-wrap"><p className="eyebrow">DATA DIAGNOSTIC</p><div><h2>Not sure what needs fixing first?</h2><p>Start with a Data Diagnostic. We map what you’ve got, test the numbers you already rely on, and give you a written list of what’s broken, ranked by what it’s costing you.</p><small>You keep the document either way. If you want us to fix any of it, we’ll quote it. If you’d rather hand it to your own team, that works too.</small><a className="text-link" href="/data-diagnostic">Start with a diagnostic <Arrow /></a></div></section>

      <section id="practice" className="technology"><div className="section-wrap"><h2>We work with whatever you already have.</h2><p>We won’t sell you Snowflake if Postgres is fine.</p><div className="tech-line"><span>PYTHON</span><i /> <span>SQL</span><i /> <span>POSTGRESQL</span><i /> <span>POWER BI</span><i /> <span>GITHUB</span></div></div></section>
      <SiteFooter />
    </main>
  );
}
