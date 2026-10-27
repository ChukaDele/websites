import { PageShell } from "../../../components/site/PageShell";
import { ArticleLayout, TryThisFirst, SystemBoundary, Diagram, Example, Pull, ForYourDataPerson } from "../../../components/insights/Article";
import { insightMetadata } from "../../../lib/insights";

const SLUG = "when-to-hire-a-data-team";
const TOC = [
  { id: "signals", label: "Signs you need a data team" },
  { id: "try-first", label: "Five questions before you hire" },
  { id: "roles", label: "Analyst vs analytics engineer vs data engineer" },
  { id: "example", label: "Worked example: two first moves" },
  { id: "underneath", label: "How the work actually sequences" },
  { id: "good", label: "Right-sized at each stage" },
  { id: "wrong", label: "Common hiring mistakes" },
  { id: "boundary", label: "When a hire is not the answer" },
  { id: "decision", label: "Who to hire first: a decision guide" },
];

export const metadata = insightMetadata(SLUG);

export default function Page() {
  return (
    <PageShell>
      <ArticleLayout
        slug={SLUG}
        toc={TOC}
        heroDiagram={
          <Diagram
            title="From business constraints to the right first data role"
            caption="The first data role should follow the constraint that is actually blocking decisions, not a generic org chart. The green path is one example: disputed numbers point to an analytics engineer, not more dashboards."
          >
            <svg viewBox="0 0 720 300" xmlns="http://www.w3.org/2000/svg" style={{ fontFamily: "var(--font-mono), ui-monospace, monospace", fontSize: "12px" }} fill="#2c3a36" textAnchor="middle">
              <defs>
                <marker id="an" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
                  <path d="M0,0 L9,4.5 L0,9 z" fill="rgba(20,35,33,.55)" />
                </marker>
                <marker id="ag" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
                  <path d="M0,0 L9,4.5 L0,9 z" fill="#90d26f" />
                </marker>
              </defs>

              {/* Left: the business constraint */}
              <rect x="20" y="116" width="150" height="68" rx="4" fill="#ffffff" stroke="rgba(20,35,33,.35)" />
              <text x="95" y="146">BUSINESS</text>
              <text x="95" y="164">CONSTRAINT</text>

              {/* Constraint -> decision (part of the highlighted example path) */}
              <line x1="170" y1="150" x2="244" y2="150" stroke="#90d26f" strokeWidth="2" markerEnd="url(#ag)" />

              {/* Middle: the decision node */}
              <rect x="250" y="112" width="170" height="76" rx="4" fill="#ffffff" stroke="rgba(20,35,33,.35)" />
              <text x="335" y="146">WHAT IS</text>
              <text x="335" y="164">ACTUALLY BLOCKED?</text>

              {/* Decision -> four role options */}
              <line x1="420" y1="150" x2="514" y2="48" stroke="rgba(20,35,33,.35)" strokeWidth="1.4" markerEnd="url(#an)" />
              <line x1="420" y1="150" x2="514" y2="110" stroke="#90d26f" strokeWidth="2" markerEnd="url(#ag)" />
              <line x1="420" y1="150" x2="514" y2="172" stroke="rgba(20,35,33,.35)" strokeWidth="1.4" markerEnd="url(#an)" />
              <line x1="420" y1="150" x2="514" y2="234" stroke="rgba(20,35,33,.35)" strokeWidth="1.4" markerEnd="url(#an)" />

              {/* Right: role options */}
              <rect x="520" y="26" width="180" height="44" rx="4" fill="#ffffff" stroke="rgba(20,35,33,.35)" />
              <text x="610" y="52">Analyst</text>

              <rect x="520" y="88" width="180" height="44" rx="4" fill="rgba(144,210,111,.14)" stroke="#90d26f" strokeWidth="2" />
              <text x="610" y="114">Analytics engineer</text>

              <rect x="520" y="150" width="180" height="44" rx="4" fill="#ffffff" stroke="rgba(20,35,33,.35)" />
              <text x="610" y="176">Data engineer</text>

              <rect x="520" y="212" width="180" height="44" rx="4" fill="#ffffff" stroke="rgba(20,35,33,.35)" />
              <text x="610" y="238">Embedded team</text>
            </svg>
          </Diagram>
        }
      >
        <section id="signals">
          <h2>What are the signs you need a data team?</h2>
          <p>A data capability is the reliable ability to turn raw data into answers people act on. The first move towards one is not always a hire. A permanent hire is a large, slow, fixed commitment. If the work is still lumpy, or its shape is not yet clear, a scoped project or <a href="/services/embedded-data-team">a fractional, embedded data team</a> often gives you the same capability sooner and with less risk. Hire when the work is continuous, specific to your business, and you can attract and keep the right person.</p>
          <p>The shift rarely arrives as a single event. It shows up as symptoms, and they tend to appear together.</p>
          <ul>
            <li>One analyst is overloaded, and questions now wait in a queue.</li>
            <li>Spreadsheets keep multiplying, and each rebuild takes a little longer than the last.</li>
            <li>Reports arrive late, and the decision has often moved on by the time they land.</li>
            <li>Different teams quote different figures for the same thing, and no one owns the definition.</li>
            <li>Workbooks have become load-bearing. A renamed tab or a broken formula can take out a board report.</li>
          </ul>
          <p>One or two of these is normal for a growing company. All of them together mean the setup has been outgrown.</p>
          <Pull>Continuing to muddle through costs more than fixing it. You pay in delayed decisions rather than in an invoice.</Pull>
        </section>

        <section id="try-first">
          <h2>Five questions to answer before you hire</h2>
          <p>Before you write a job advert, work through a short decision tree. Each answer points to a role or a delivery model, not straight to a hire.</p>
          <TryThisFirst title="Start with these questions">
            <ol>
              <li><strong>What is actually blocked?</strong> If people cannot get answers at all, the gap is analysis. If answers exist but the numbers are disputed and undefined, the gap is modelling (the work of making data trustworthy). If data arrives late, breaks, or never joins up across systems, the gap is engineering.</li>
              <li><strong>Which gap blocks you most often?</strong> Fix the binding constraint first. Building the other layers will not clear a queue they are not causing.</li>
              <li><strong>Is the need continuous, or a defined project?</strong> A one-off build with a clear end is a project. Work that recurs every week is a standing capability, and those are different commitments.</li>
              <li><strong>Is the shape of the work clear yet?</strong> If you cannot yet say which permanent roles you need, an embedded or fractional team lets you find out before you commit to a salary.</li>
              <li><strong>Who will manage the hire?</strong> A specialist with no one to set priorities, level their work, or unblock them will stall. No manager for the role is an argument for a project or an embedded team, not a permanent seat.</li>
            </ol>
          </TryThisFirst>
        </section>

        <section id="roles">
          <h2>Analyst vs analytics engineer vs data engineer</h2>
          <p>Three roles do most of the work, and they are often confused. Here is each one in plain English first, then precisely.</p>
          <p><strong>A data analyst answers questions.</strong> In plain terms, they take a business question and come back with a defensible number, a chart, or a report. Precisely, they explore data, build and maintain reports and dashboards, and work directly with stakeholders. They sit closest to the decision.</p>
          <p><strong>An analytics engineer makes the data trustworthy.</strong> In plain terms, they turn messy source tables into clean datasets everyone can rely on. Precisely, they do modelling: the work of shaping raw source tables into clean, tested datasets with a clear, agreed meaning. They own the semantic layer, which is the single place where each metric is defined once, so every report uses the same definition of &ldquo;revenue&rdquo; or &ldquo;active customer&rdquo;. They also write tests that fail loudly when the data is wrong. This is the role most growing companies are missing.</p>
          <p><strong>A data engineer moves data reliably.</strong> In plain terms, they build the plumbing. Precisely, they build and run pipelines, which are the automated paths that move data from source systems into where it is used, and they handle integration and orchestration. Orchestration is the scheduling and sequencing of those jobs, so each step runs in the right order and a failure is caught rather than passed silently downstream. This role earns its keep once volume and reliability demands are genuinely high.</p>
          <div className="in-table-wrap"><table>
            <thead><tr><th>Role</th><th>Owns</th><th>Typical tools</th><th>Hire first when</th></tr></thead>
            <tbody>
              <tr><td>Data analyst</td><td>Questions, reports, dashboards</td><td>Excel, Power BI, SQL</td><td>Nobody turns data into answers</td></tr>
              <tr><td>Analytics engineer</td><td>Clean, tested models and metric definitions</td><td>SQL, dbt, a warehouse</td><td>Reports exist but numbers are disputed</td></tr>
              <tr><td>Data engineer</td><td>Pipelines, integration, orchestration</td><td>Python, connectors, cloud platforms</td><td>Data arrives late or will not join up</td></tr>
            </tbody>
          </table></div>
          <p>Alongside these sits <strong>BI capability</strong>. BI stands for business intelligence, which is the tools and practice of building and reading reports. Sometimes this is a dedicated role. More often, at an early stage, the analyst covers it.</p>
          <p>You do not have to add any of these through a permanent hire. A <strong>scoped project</strong> delivers a defined build with a clear end, such as a first warehouse or a reporting rebuild. An <strong>embedded or fractional team</strong> is a small external group that works inside your business, giving you senior capability now without a full internal team yet. That is what <a href="/services/embedded-data-team">an embedded data team</a> is for: consistent progress while the shape of the work is still settling.</p>
        </section>

        <section id="example">
          <h2>Worked example: two companies, two different first moves</h2>
          <Example setting="Series B SaaS · Stripe, HubSpot, Amplitude, BigQuery" title="Two analysts, and a board that does not trust MRR">
            <p>A growth team has two analysts building dashboards in Looker Studio. MRR in the board deck differs from Stripe by a few percent every month, and churn is defined three ways. The binding constraint is modelling, not analysis or pipelines: the data already lands in BigQuery through managed connectors.</p>
            <p>First move: an analytics engineer (hired, or embedded while the role is defined) to build one tested MRR and churn model in dbt that every report reads. A third analyst would have produced a fourth definition.</p>
          </Example>
          <Example setting="UK wholesale distributor · Sage 200, Excel, emailed orders" title="A finance team that rebuilds the sales report every Monday">
            <p>The finance manager and one assistant spend Monday mornings exporting from Sage 200, merging branch spreadsheets with orders that arrive by email, and fixing customer codes by hand. Nobody is asking for new analysis. They want last week&rsquo;s numbers on time and agreed.</p>
            <p>First move: a scoped project to automate the extract, map branches and customers once, and publish one reconciled weekly report. A permanent senior hire would have little to do once that build is done; a part-time analyst or an embedded team can run it afterwards. The setup itself is described in <a href="/insights/first-reporting-stack">how to automate reporting without a data team</a>.</p>
          </Example>
        </section>

        <section id="underneath">
          <h2>In what order should you build a data team?</h2>
          <p>The work has a natural order, and ignoring it is expensive. More dashboards do not help if the data beneath them is wrong. So trustworthy, modelled data usually has to come before more reporting, not after it.</p>
          <p>For most companies the sensible sequence is: get answers with an analyst, then make those answers trustworthy and repeatable with analytics engineering, then harden the pipelines with a data engineer once managed tools can no longer keep up. Each layer stands on the one before it.</p>
          <p>The common mismatch is hiring against the title rather than the constraint. A senior data engineer hired to &ldquo;build reports&rdquo; will build excellent infrastructure that answers no one&rsquo;s question. A junior analyst asked to fix pipelines will be out of their depth and unsupported. Both outcomes are avoidable. Match the hire to the layer that is actually blocking you, not to the role that sounds most foundational.</p>
          <p>The piece a growing company most often skips is the analytics engineer. Their job is small, owned and testable: define a metric such as &ldquo;active customer&rdquo; once, attach a test, and make every report read that one definition. The value is not the code. It is that no team can quietly invent its own version of &ldquo;active&rdquo; in a private spreadsheet, which is why the role usually comes before more dashboards.</p>
          <ForYourDataPerson title="What an analytics engineer's first model and test look like in dbt">
            <p>A dbt model is a SQL file that builds one table or view. This one defines an active customer as anyone with an order in the last 90 days. It reads a staging model, <code>stg_orders</code>, which holds one row per order:</p>
            <pre>{`-- models/marts/active_customers.sql
select
    customer_id,
    max(order_date) as last_order_date
from {{ ref('stg_orders') }}
group by customer_id
having max(order_date) >= current_date - interval '90 days'`}</pre>
            <p>The tests live in a YAML file beside the model. dbt runs them with <code>dbt build</code> or <code>dbt test</code>, and the run fails if any customer appears twice or has no ID:</p>
            <pre>{`# models/marts/active_customers.yml
version: 2

models:
  - name: active_customers
    description: "Customers with at least one order in the last 90 days."
    columns:
      - name: customer_id
        data_tests:
          - unique
          - not_null`}</pre>
            <p>The interval syntax shown works on Snowflake and Postgres; on BigQuery use <code>date_sub(current_date(), interval 90 day)</code>. The <code>data_tests</code> key is the current name in dbt; older projects use <code>tests</code>. See the <a href="https://docs.getdbt.com/docs/build/data-tests" target="_blank" rel="noopener noreferrer">dbt data tests documentation</a>.</p>
          </ForYourDataPerson>
        </section>

        <section id="good">
          <h2>What a right-sized data team looks like at each stage</h2>
          <p>What &ldquo;right-sized&rdquo; looks like changes with stage. As a hypothetical progression:</p>
          <ul>
            <li><strong>Early.</strong> One capable analyst, or a fractional analyst, answering questions against a tidy source or two. No warehouse and no pipelines. This is enough for a while, and stretching past it early wastes money.</li>
            <li><strong>Growing.</strong> An analyst plus analytics engineering, so definitions are owned and reporting is trustworthy. Managed connectors move the data; your effort goes into modelling and definitions, not custom plumbing.</li>
            <li><strong>Scaling.</strong> A small team where analysis, modelling and engineering are distinct roles, with clear ownership of definitions and reliability, and a manager who sets priorities.</li>
          </ul>
          <p>The signal that a stage fits is quiet. Numbers are trusted. Answers arrive before the decision does. No single person&rsquo;s holiday stops reporting. Right-sized is not the largest team you can justify; it is the smallest team that keeps decisions moving.</p>
        </section>

        <section id="wrong">
          <h2>Common first-hire mistakes</h2>
          <ul>
            <li><strong>Hiring too early.</strong> A senior specialist with too little well-defined work spends a year underused, and may leave out of boredom before the real work arrives.</li>
            <li><strong>Hiring the wrong first role.</strong> Building infrastructure before there is a question that needs it is the classic version: impressive plumbing, no answers.</li>
            <li><strong>Hiring one person to do three jobs.</strong> Analyst, analytics engineer and data engineer are different disciplines. One generalist expected to be all three will do all three thinly.</li>
            <li><strong>Leaving no one to manage them.</strong> A first hire with no manager, no clear priorities, and no one to unblock them will stall, however capable they are.</li>
            <li><strong>Under-levelling the role.</strong> A junior with no senior to learn from plateaus, and the definitions that no one owns stay disputed.</li>
          </ul>
          <p>Too late is usually the costlier mistake, because you pay in decisions made on bad numbers rather than only in salary. But both mistakes are real, and both are avoidable by matching the move to the constraint.</p>
        </section>

        <section id="boundary">
          <h2>When a hire is not the answer</h2>
          <p>Not every data problem is solved by adding a person. Some are solved by a better tool, a tidier definition, or a direct connection from a BI tool to the source. A hire, or a team, becomes the right answer only when the work has become a system to run rather than a task to finish: when it recurs, spans systems, and needs a clear owner. If you want an outside read on whether you are at that point, <a href="/how-we-work">how we work</a> sets out how we scope it before anyone commits to headcount.</p>
          <SystemBoundary
            conditions={[
              "The same cross-system work recurs every week, rather than arriving once and finishing.",
              "Reliability now needs monitoring: someone has to know when a pipeline fails, not discover it in a board meeting.",
              "Several stakeholders depend on the numbers, and they disagree on the definitions.",
              "One person has become a single point of failure, and their absence stops reporting.",
              "The work has outgrown a single generalist, and no one owns the layer beneath the reports.",
            ]}
          />
        </section>

        <section id="decision">
          <h2>Who should we hire first? A decision guide</h2>
          <p>Read from the constraint you actually have, not from the org chart you imagine. The first move follows the gap.</p>
          <table className="article-table">
            <thead>
              <tr>
                <th>The situation</th>
                <th>First move</th>
                <th>Why</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Decisions wait because no one turns data into answers.</td>
                <td>A data analyst</td>
                <td>Closest to the decision, and usually the first capability you need.</td>
              </tr>
              <tr>
                <td>Reports exist, but numbers are disputed and definitions live in people&rsquo;s heads.</td>
                <td>An analytics engineer</td>
                <td>Model and define the data first; more dashboards will not fix mistrust.</td>
              </tr>
              <tr>
                <td>Data arrives late, breaks, or will not join across systems.</td>
                <td>A data engineer</td>
                <td>Harden pipelines and orchestration; premature before volume is real.</td>
              </tr>
              <tr>
                <td>The need is a defined build with a clear end.</td>
                <td>A scoped project</td>
                <td>A first warehouse or a reporting rebuild, not a permanent seat.</td>
              </tr>
              <tr>
                <td>Real work now, unclear roles, and no senior to hire under.</td>
                <td>An embedded team</td>
                <td>Make progress and learn the shape before committing to headcount.</td>
              </tr>
            </tbody>
          </table>
          <p>If you want a printable version, use the <a href="/resources/first-data-hire-decision-tree">first data hire decision tree</a>. If the answer is &ldquo;an embedded team&rdquo;, see <a href="/services/embedded-data-team">how our embedded data team works</a>.</p>
          <p>To compare the cost of each option for your workload, use the <a href="/resources/hire-vs-fractional-data-team-cost">hire vs fractional vs project cost calculator</a>. If the backlog is the problem, a <a href="/data-diagnostic">Data Diagnostic</a> helps you pick the first piece of work, and <a href="/insights/saas-metrics-from-stripe">how to calculate MRR from Stripe</a> shows the kind of modelling an analytics engineer owns.</p>
          <p>If the first move is a scoped project, the <a href="/resources/data-project-brief-template">data project brief template</a> helps you brief it, and <a href="/services/data-projects">how our data projects work</a> shows what a delivery looks like.</p>
        </section>
      </ArticleLayout>
    </PageShell>
  );
}
