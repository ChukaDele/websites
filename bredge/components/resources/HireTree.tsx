"use client";
import { useStoredState } from "./useStoredState";
import { ToolActions } from "./ToolActions";
import { DataPersonNote } from "./Explainers";

/* First data hire: a real branching tree. Each answer leads to another
 * question or to a result; the path is saved so the reader can come back. */

type Q = { id: string; q: string; help?: string; options: { label: string; next: string }[] };
type R = { id: string; title: string; summary: string; first90: string[]; warning: string; link: { href: string; label: string } };

const QUESTIONS: Record<string, Q> = {
  start: { id: "start", q: "What do you need in the next six months?", options: [
    { label: "A defined outcome: a warehouse, a reconciled revenue model, an automated board pack", next: "own" },
    { label: "Ongoing answers, analysis and reporting, every week", next: "blocker" },
  ] },
  own: { id: "own", q: "After it is delivered, will someone in-house run and change it?", help: "Think about who fixes it when a source system changes or a new metric is needed.", options: [
    { label: "Yes, we have or will hire someone to own it", next: "r-project-then-hire" },
    { label: "No, nobody has the time or the skills", next: "r-project-retainer" },
  ] },
  blocker: { id: "blocker", q: "When someone asks a data question today, what goes wrong first?", options: [
    { label: "Nobody has time to pull the data and analyse it", next: "trusted" },
    { label: "We get answers, but the numbers disagree or live in spreadsheets", next: "landed" },
    { label: "The data does not arrive: manual exports, broken syncs, missing sources", next: "sources" },
  ] },
  trusted: { id: "trusted", q: "Do the core numbers already reconcile, with agreed definitions?", help: "For example: Finance and Sales agree on revenue for last month without a meeting.", options: [
    { label: "Yes, the data is trusted", next: "m-analyst" },
    { label: "Not really", next: "landed" },
  ] },
  landed: { id: "landed", q: "Does the data already land in one place, such as a warehouse or a reporting database?", options: [
    { label: "Yes, it is in one place but messy", next: "m-ae" },
    { label: "No, it is spread across accounting, CRM, billing and spreadsheets", next: "sources" },
  ] },
  sources: { id: "sources", q: "How hard is it to bring the sources together?", help: "Managed connectors (for example Fivetran or Airbyte) cover common tools such as Stripe, HubSpot, Salesforce, Xero and QuickBooks.", options: [
    { label: "A handful of common tools, daily refresh or slower: connectors would cover it", next: "m-ae" },
    { label: "Many sources, custom APIs, intra-day needs, or an on-premise ERP", next: "m-de" },
  ] },
  "m-analyst": { id: "m-analyst", q: "Is there someone senior who can direct and review a data hire?", help: "Someone who can set priorities, check the work and grow the role.", options: [
    { label: "Yes", next: "r-analyst" }, { label: "No", next: "r-embedded-analyst" },
  ] },
  "m-ae": { id: "m-ae", q: "Is there someone senior who can direct and review a data hire?", help: "Someone who can set priorities, check the work and grow the role.", options: [
    { label: "Yes", next: "r-ae" }, { label: "No", next: "r-embedded-ae" },
  ] },
  "m-de": { id: "m-de", q: "Is there someone senior who can direct and review a data hire?", help: "Someone who can set priorities, check the work and grow the role.", options: [
    { label: "Yes", next: "r-de" }, { label: "No", next: "r-embedded-de" },
  ] },
};

const embedded = { href: "/services/embedded-data-team", label: "How embedded data teams work" };
const projects = { href: "/services/data-projects", label: "How data projects work" };

const RESULTS: Record<string, R> = {
  "r-analyst": { id: "r-analyst", title: "Hire a data analyst", summary: "Your data is trusted and the gap is capacity to use it. An analyst turns questions into answers and reports.", first90: ["List the ten recurring questions leadership asks and answer them from the trusted data.", "Retire duplicate reports and agree one owner per report.", "Write down the definitions they rely on, so they stay agreed."], warning: "If the analyst spends most of their week fixing data rather than analysing it, the data was not as trusted as it looked: you need analytics engineering first.", link: { href: "/insights/when-to-hire-a-data-team", label: "When to hire a data team" } },
  "r-ae": { id: "r-ae", title: "Hire an analytics engineer", summary: "The data exists but the numbers disagree. An analytics engineer models it into tested tables with agreed definitions that every report uses.", first90: ["Agree the definitions of the five metrics that matter most.", "Build tested models for them, reconciled to the ledger or billing system.", "Point the main reports at those models and retire spreadsheet logic."], warning: "If most of their time goes on getting data out of systems, the bottleneck is integration: you need data engineering or managed connectors first.", link: projects },
  "r-de": { id: "r-de", title: "Hire a data engineer", summary: "Data does not move reliably between systems. A data engineer builds and runs the pipelines that land it in one place, on time.", first90: ["Inventory sources and agree refresh needs for each.", "Land the most important two or three sources reliably, with monitoring.", "Hand modelled tables to whoever builds reports, with a freshness guarantee."], warning: "A data engineer alone will not settle metric definitions. Plan who owns modelling and definitions once the pipelines run.", link: projects },
  "r-embedded-analyst": { id: "r-embedded-analyst", title: "Start with an embedded team, then hire an analyst", summary: "The need is real, but a first hire without a senior person to direct them tends to drift. An embedded team delivers now and sets up the role.", first90: ["Answer the recurring questions and build the core reports.", "Document definitions and the reporting process.", "Write the analyst job description from real work, and help interview."], warning: "If the embedded team becomes permanent by default, revisit: the goal is a capability you own.", link: embedded },
  "r-embedded-ae": { id: "r-embedded-ae", title: "Start with an embedded team, then hire an analytics engineer", summary: "The numbers need modelling and agreed definitions, and nobody in-house can direct that work yet. An embedded team builds the foundations and hands them over.", first90: ["Agree and document core metric definitions.", "Build tested, reconciled models and repoint the key reports.", "Hire into a working stack, with documentation, rather than a blank page."], warning: "Do not hire one generalist to do analysis, modelling and pipelines at once. Sequence the capability.", link: embedded },
  "r-embedded-de": { id: "r-embedded-de", title: "Start with an embedded team, then hire", summary: "Integration is the bottleneck and nobody can direct a data engineer yet. An embedded team builds and runs the pipelines, then helps you hire to maintain them.", first90: ["Land the critical sources reliably with monitoring.", "Model the first trusted tables on top.", "Decide which role to hire first once the platform runs: engineer, analytics engineer or analyst."], warning: "Beware a platform only the outside team understands. Insist on documentation and handover from the start.", link: embedded },
  "r-project-then-hire": { id: "r-project-then-hire", title: "Run a project, then hire to own it", summary: "A defined outcome is a project, not a job. Deliver it with a team that has done it before, then hire the person who will run it.", first90: ["Scope the outcome, sources and acceptance tests.", "Deliver in stages, each one usable on its own.", "Hand over with documentation and train the person who will own it."], warning: "If the scope keeps growing into ongoing work, you need a team, not a project.", link: projects },
  "r-project-retainer": { id: "r-project-retainer", title: "Run a project with light ongoing support", summary: "You need the outcome but nobody to run it afterwards. Deliver it as a project and keep a small monthly support arrangement until you are ready to hire.", first90: ["Scope the outcome and agree what support looks like after delivery.", "Deliver in usable stages.", "Review after three months whether the support should become a hire."], warning: "Support without an internal owner can hide decisions. Name a business owner even if the technical work is external.", link: embedded },
};

type State = { path: string[] };
const INITIAL: State = { path: ["start"] };

export function HireTree() {
  const [s, set, reset] = useStoredState<State>("bredge:rs:first-data-hire:v1", INITIAL);
  const path = s.path?.length ? s.path.filter((id) => QUESTIONS[id] || RESULTS[id]) : INITIAL.path;
  const current = path[path.length - 1];
  const question = QUESTIONS[current];
  const result = RESULTS[current];

  const choose = (next: string) => set((p) => ({ path: [...(p.path?.length ? p.path : INITIAL.path), next] }));
  const goTo = (i: number) => set((p) => ({ path: (p.path ?? INITIAL.path).slice(0, i + 1) }));

  const answers = path.slice(0, -1).map((id, i) => ({ q: QUESTIONS[id], a: QUESTIONS[id]?.options.find((o) => o.next === path[i + 1]) }));

  const text = () => [
    "First data hire decision tree",
    ...answers.map(({ q, a }) => `- ${q?.q} ${a?.label ?? ""}`),
    "",
    result ? [`Recommendation: ${result.title}`, result.summary, "First 90 days:", ...result.first90.map((x) => `- ${x}`), `Warning sign: ${result.warning}`].join("\n") : "Not finished yet.",
  ].join("\n");

  const outline = (id: string, depth = 0, seen = new Set<string>()): React.ReactNode => {
    const q = QUESTIONS[id];
    if (!q || seen.has(id) || depth > 6) return null;
    const nextSeen = new Set(seen).add(id);
    return (
      <ul>
        {q.options.map((o) => (
          <li key={o.label}>
            <span className="rs-tree-a">{o.label}</span>
            {RESULTS[o.next] ? <b className="rs-tree-r">→ {RESULTS[o.next].title}</b> : <><span className="rs-tree-q">{QUESTIONS[o.next].q}</span>{outline(o.next, depth + 1, nextSeen)}</>}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="rs-toolwrap">
      <section id="tree" className="rs-card">
        <header className="rs-card-head">
          <p className="rs-label">{result ? "Result" : `Question ${path.length}`}</p>
          {answers.length > 0 && (
            <ol className="rs-trail" aria-label="Your answers">
              {answers.map(({ q, a }, i) => (
                <li key={i}><button type="button" onClick={() => goTo(i)} title="Change this answer"><small>{q?.q}</small>{a?.label}</button></li>
              ))}
            </ol>
          )}
        </header>

        {question && (
          <div className="rs-ask" aria-live="polite">
            <h2>{question.q}</h2>
            {question.help && <p className="rs-muted">{question.help}</p>}
            <div className="rs-options">
              {question.options.map((o) => <button key={o.label} type="button" className="rs-option" onClick={() => choose(o.next)}>{o.label}<span aria-hidden="true">→</span></button>)}
            </div>
          </div>
        )}

        {result && (
          <div className="rs-result" aria-live="polite">
            <p className="rs-label">Recommended first move</p>
            <h2>{result.title}</h2>
            <p>{result.summary}</p>
            <h3>First 90 days</h3>
            <ol>{result.first90.map((x) => <li key={x}>{x}</li>)}</ol>
            <p className="rs-verdict is-warn"><b>Warning sign you chose wrong: </b>{result.warning}</p>
            <div className="rs-result-actions">
              <a className="text-link" href={result.link.href}>{result.link.label} <span className="arrow" aria-hidden="true">↗</span></a>
              <a className="text-link" href="/resources/hire-vs-fractional-data-team-cost">Compare the cost of each route <span className="arrow" aria-hidden="true">↗</span></a>
              <button type="button" className="rs-btn" onClick={() => goTo(path.length - 2)}>Change last answer</button>
              <button type="button" className="rs-btn rs-btn-quiet" onClick={reset}>Start again</button>
            </div>
          </div>
        )}
      </section>

      <section id="outline" className="rs-card rs-outline">
        <header className="rs-card-head">
          <p className="rs-label">The whole tree</p>
          <h2>Every path at a glance</h2>
          <p className="rs-muted">The same logic as a list, for printing or sharing.</p>
        </header>
        <div className="rs-tree"><span className="rs-tree-q">{QUESTIONS.start.q}</span>{outline("start")}</div>
      </section>
      <DataPersonNote>
        <p className="rs-muted">What each role owns in a typical modern stack, so the job description and the first 90 days match the work.</p>
        <div className="rs-table-scroll">
          <table className="rs-cost-table rs-cost-table-left">
            <thead><tr><th scope="col">Role</th><th scope="col">Owns</th><th scope="col">Typical tools</th><th scope="col">Signs the work is done</th></tr></thead>
            <tbody>
              <tr><th scope="row">Data engineer</th><td>Getting data out of systems into the warehouse, on time, with monitoring</td><td>Managed connectors (<a href="https://fivetran.com/docs/connectors">Fivetran</a>, <a href="https://docs.airbyte.com/integrations/">Airbyte</a>), APIs, an orchestrator, the warehouse</td><td>Each source lands on schedule; freshness alerts fire before users notice</td></tr>
              <tr><th scope="row">Analytics engineer</th><td>Turning raw tables into tested, documented models with agreed definitions</td><td>SQL, <a href="https://www.getdbt.com/what-is-analytics-engineering">dbt</a>, version control, <a href="https://docs.getdbt.com/docs/build/data-tests">data tests</a></td><td>Core metrics reconcile to the ledger or billing system; every model has tests and an owner</td></tr>
              <tr><th scope="row">Data analyst</th><td>Answering business questions and building reports on trusted models</td><td>BI tool (Power BI, Looker, Tableau), SQL, spreadsheets</td><td>Recurring questions answered from one source; duplicate reports retired</td></tr>
            </tbody>
          </table>
        </div>
        <ul className="rs-plainlist">
          <li><b>Interview for the bottleneck:</b> give candidates a task from your real data, such as reconciling one month of revenue between two exports.</li>
          <li><b>Check the stack exists first:</b> an analyst without a warehouse or tested models spends their first months doing engineering.</li>
          <li><b>Related tools:</b> <a href="/resources/hire-vs-fractional-data-team-cost">compare the cost of each route</a> and <a href="/resources/data-diagnostic-checklist">rate your current setup</a>.</li>
        </ul>
      </DataPersonNote>

      <ToolActions getText={text} />
    </div>
  );
}
