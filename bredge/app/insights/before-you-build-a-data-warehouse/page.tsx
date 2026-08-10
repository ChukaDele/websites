import type { Metadata } from "next";
import { PageShell } from "../../../components/site/PageShell";
import { ArticleLayout, TryThisFirst, SystemBoundary, Diagram } from "../../../components/insights/Article";
import { pageMetadata } from "../../../lib/seo";

const SLUG = "before-you-build-a-data-warehouse";
const TOC = [
  { id: "short-answer", label: "The short answer" },
  { id: "usual", label: "What this usually looks like" },
  { id: "try-first", label: "Before you build anything" },
  { id: "what-it-tells-you", label: "What your answers tell you" },
  { id: "underneath", label: "What a warehouse actually does" },
  { id: "good", label: "What good looks like" },
  { id: "wrong", label: "Common ways this goes wrong" },
  { id: "boundary", label: "When you genuinely need one" },
  { id: "decision", label: "A readiness decision guide" },
];

export const metadata: Metadata = pageMetadata({
  title: "Do You Need a Data Warehouse? A Practical Decision Guide | The Bredge",
  description: "Do you need a data warehouse yet? A practical readiness checklist covering requirements, the modern data stack, and cases where a warehouse is premature.",
  path: "/insights/before-you-build-a-data-warehouse",
});

export default function Page() {
  return (
    <PageShell>
      <ArticleLayout
        slug={SLUG}
        toc={TOC}
        heroDiagram={
          <Diagram
            title="Sources to consumers: where a warehouse fits — and where it does not yet"
            caption="A warehouse is the transformation and modelling layer between raw sources and the tools people use. It is worth building only once specific conditions hold."
          >
            <svg
              viewBox="0 0 720 300"
              xmlns="http://www.w3.org/2000/svg"
              role="img"
              style={{ fontFamily: '"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace' }}
            >
              <defs>
                <marker id="dwArw" markerWidth="8" markerHeight="8" refX="5.5" refY="3" orient="auto" markerUnits="strokeWidth">
                  <path d="M0,0 L6,3 L0,6 Z" fill="rgba(20,35,33,.5)" />
                </marker>
              </defs>

              {/* group headers */}
              <text x="90" y="40" textAnchor="middle" fontSize="11" fill="#5a6964" letterSpacing="1">SOURCES</text>
              <text x="272" y="40" textAnchor="middle" fontSize="11" fill="#2f5a37" letterSpacing="1">TRANSFORM · MODEL</text>
              <text x="453" y="40" textAnchor="middle" fontSize="11" fill="#5a6964" letterSpacing="1">SERVE</text>
              <text x="630" y="40" textAnchor="middle" fontSize="11" fill="#5a6964" letterSpacing="1">CONSUMERS</text>

              {/* source boxes */}
              <g fontSize="12" fill="#2c3a36">
                <rect x="24" y="64" width="132" height="32" fill="#f4f1e9" stroke="rgba(20,35,33,.35)" />
                <text x="90" y="84" textAnchor="middle">CRM</text>
                <rect x="24" y="108" width="132" height="32" fill="#f4f1e9" stroke="rgba(20,35,33,.35)" />
                <text x="90" y="128" textAnchor="middle">Billing</text>
                <rect x="24" y="152" width="132" height="32" fill="#f4f1e9" stroke="rgba(20,35,33,.35)" />
                <text x="90" y="172" textAnchor="middle">Product DB</text>
              </g>

              {/* sources -> transform */}
              <g fill="none" stroke="rgba(20,35,33,.35)" strokeWidth="1.4">
                <line x1="156" y1="80" x2="196" y2="90" markerEnd="url(#dwArw)" />
                <line x1="156" y1="124" x2="196" y2="124" markerEnd="url(#dwArw)" />
                <line x1="156" y1="168" x2="196" y2="158" markerEnd="url(#dwArw)" />
              </g>

              {/* transform box (emphasised) */}
              <rect x="196" y="64" width="152" height="120" fill="rgba(144,210,111,.16)" stroke="#90d26f" strokeWidth="1.6" />
              <g textAnchor="middle" fill="#25402c">
                <text x="272" y="112" fontSize="12">combine · clean</text>
                <text x="272" y="132" fontSize="12">tested models</text>
                <text x="272" y="156" fontSize="9" fill="#4a7050">defined once</text>
              </g>

              {/* transform -> serve */}
              <line x1="348" y1="124" x2="388" y2="124" fill="none" stroke="rgba(20,35,33,.35)" strokeWidth="1.4" markerEnd="url(#dwArw)" />

              {/* serve box */}
              <rect x="388" y="88" width="130" height="72" fill="#f4f1e9" stroke="rgba(20,35,33,.35)" />
              <g textAnchor="middle" fill="#2c3a36">
                <text x="453" y="118" fontSize="12">tables +</text>
                <text x="453" y="136" fontSize="12">semantic layer</text>
              </g>

              {/* serve -> consumers */}
              <g fill="none" stroke="rgba(20,35,33,.35)" strokeWidth="1.4">
                <line x1="518" y1="124" x2="564" y2="80" markerEnd="url(#dwArw)" />
                <line x1="518" y1="124" x2="564" y2="124" markerEnd="url(#dwArw)" />
                <line x1="518" y1="124" x2="564" y2="168" markerEnd="url(#dwArw)" />
              </g>

              {/* consumer boxes */}
              <g fontSize="12" fill="#2c3a36">
                <rect x="564" y="64" width="132" height="32" fill="#f4f1e9" stroke="rgba(20,35,33,.35)" />
                <text x="630" y="84" textAnchor="middle">Dashboards</text>
                <rect x="564" y="108" width="132" height="32" fill="#f4f1e9" stroke="rgba(20,35,33,.35)" />
                <text x="630" y="128" textAnchor="middle">Finance model</text>
                <rect x="564" y="152" width="132" height="32" fill="#f4f1e9" stroke="rgba(20,35,33,.35)" />
                <text x="630" y="172" textAnchor="middle">Ops reports</text>
              </g>

              {/* warehouse marker: bracket under transform + serve */}
              <path d="M190,202 L190,210 L524,210 L524,202" fill="none" stroke="#90d26f" strokeWidth="1.4" strokeDasharray="4 4" />
              <text x="357" y="232" textAnchor="middle" fontSize="11" fill="#2f5a37" letterSpacing="1.5">A WAREHOUSE FITS HERE</text>
              <text x="357" y="250" textAnchor="middle" fontSize="9" fill="#5a6964">only once the readiness conditions hold</text>
            </svg>
          </Diagram>
        }
      >
        <section id="short-answer">
          <h2>The short answer</h2>
          <p>
            A data warehouse is a central database that pulls data out of several systems, cleans and reshapes it, and holds the
            result so it can be analysed together. Throughout this article a <em>consumer</em> means anyone or anything that reads
            that data: a dashboard, a finance model, a board pack, an operations report.
          </p>
          <p>
            You need one when three things are true at once. You must combine several sources. You must model them into
            definitions you can trust. And many consumers must use those definitions, repeatedly, without re-deriving them each
            time.
          </p>
          <p>
            Until all three hold, simpler options usually win on both cost and speed: better SQL against the source you already
            have; a single managed connector (a hosted integration that syncs a source into a database for you); a controlled,
            well-governed spreadsheet; a semantic model (one place where each metric is defined once and reused everywhere); or a
            smaller database that consolidates only what you need. This article is about telling the two situations apart honestly,
            because building early is expensive and quietly hard to undo.
          </p>
        </section>

        <section id="usual">
          <h2>What this usually looks like</h2>
          <p>
            The question rarely arrives as a technical decision. It arrives as friction. Dashboards have multiplied, and two of
            them disagree about the same number. Someone keeps a private spreadsheet because they trust it more than the reporting
            tool. Every month, several people export CSV files from the CRM, the billing system and the finance tool, then stitch
            them together by hand. A new question takes days, because answering it means chasing the same exports again.
          </p>
          <p>
            At some point somebody says: &ldquo;we should get a data warehouse.&rdquo; It sounds like the obvious next step, and
            sometimes it is. But &ldquo;get a warehouse&rdquo; is a solution looking for its problem. The friction above has several
            possible causes, and only some of them are cured by a warehouse. The rest are cured by tidying one query, governing one
            definition, or connecting one tool properly.
          </p>
          <p>
            So the useful first move is not to price up a warehouse. It is to name the problem precisely enough to know whether a
            warehouse is even the right shape of answer.
          </p>
        </section>

        <section id="try-first">
          <h2>Before you build anything</h2>
          <p>
            Run this readiness checklist before you provision anything. Answer each question with a number or a name, not a
            feeling. If most answers come back small, you are looking at a task, not a system.
          </p>
          <TryThisFirst title="Data Warehouse Readiness Checklist">
            <ol>
              <li>
                <strong>How many sources must be combined?</strong> Count the systems a single important answer has to cross — not
                the systems you happen to own.
              </li>
              <li>
                <strong>How often must the answer refresh?</strong> Once a month, once a day, or continuously? Freshness drives cost
                far more than data volume does.
              </li>
              <li>
                <strong>How many consumers depend on it?</strong> One analyst, one team, or the whole company? Count the people and
                the tools that would read the result.
              </li>
              <li>
                <strong>Do the definitions need to be governed once?</strong> Is there a metric — &ldquo;active customer&rdquo;,
                &ldquo;gross margin&rdquo;, &ldquo;churn&rdquo; — that must mean the same thing everywhere, arbitrated by a named
                owner?
              </li>
              <li>
                <strong>Is anyone going to own it after launch?</strong> Name the person or role responsible for it running
                tomorrow morning. A warehouse is a system to operate, not a project to finish.
              </li>
              <li>
                <strong>What actually breaks today?</strong> Write the specific failure: the meeting that argues about numbers, the
                report that takes two days, the query that times out. If you cannot name it, you are not ready to build — you are
                ready to do discovery.
              </li>
            </ol>
          </TryThisFirst>
        </section>

        <section id="what-it-tells-you">
          <h2>What your answers tell you</h2>
          <p>Read your answers together, not one at a time. The pattern matters more than any single number.</p>
          <p>
            <strong>One or two sources, a handful of consumers, monthly refresh, no shared definition in dispute.</strong> A
            warehouse is almost certainly premature. The friction is more likely a single slow or wrong query, or a tool connected
            to the wrong source. Better SQL, or a managed connector into the tool you already report from, will move faster and cost
            a fraction as much.
          </p>
          <p>
            <strong>Several sources, but only one contested definition.</strong> You may not have a warehouse problem at all. You
            have a definitions problem. A semantic model can settle it without moving any data: define the metric once, and point
            every report at that definition instead of forty private copies of it.
          </p>
          <p>
            <strong>Several sources, many consumers, a daily rhythm, and definitions that must be governed centrally.</strong> Now
            the answers line up behind a warehouse. The cost of stitching exports by hand, and of everyone re-deriving the same
            numbers, has overtaken the cost of building and running the thing.
          </p>
          <p>
            And if nobody will own it, the honest answer is &ldquo;not yet&rdquo;, whatever the other answers say. An unowned
            warehouse decays into exactly the mess it was meant to replace — only now it is a mess with a monthly bill.
          </p>
        </section>

        <section id="underneath">
          <h2>What a warehouse actually does</h2>
          <p>Strip away the branding and a warehouse is four stages in a line: sources, ingestion, transformation and modelling, then serving.</p>
          <p>
            <em>Ingestion</em> is moving raw data from each source into the warehouse. <em>Transformation and modelling</em> is
            turning those raw tables into clean, tested datasets with a clear, agreed meaning. <em>Serving</em> is exposing the
            result to the tools people use. The value lives almost entirely in the middle stage; the two ends are largely
            commodity.
          </p>
          <p>
            There are two orders for the first two stages. ETL — extract, transform, load — reshapes the data before it lands. ELT
            — extract, load, transform — lands the raw data first, then transforms it inside the warehouse using SQL. Modern cloud
            warehouses are cheap and fast enough that ELT has become the default: you keep the raw data, and your transformations
            are version-controlled SQL you can test, review and rerun.
          </p>
          <p>
            The assembled toolkit for this has a name — the <em>modern data stack</em>: managed connectors for ingestion, a cloud
            warehouse to hold the data, a transformation tool to model it, and a BI (business intelligence) tool to serve it. None
            of it is exotic, and most of it you rent rather than build.
          </p>
          <p>
            The one idea worth understanding in depth is the <em>incremental model</em> — processing only new or changed rows on
            each run, instead of rebuilding every table from scratch. It is what keeps cost roughly flat as data grows. A simple
            incremental pattern uses a high-water mark: find the newest row you have already loaded, then load only the rows newer
            than that.
          </p>
          <pre>
            <span className="c">-- Append only the rows that changed since the last run</span>{"\n"}
            <span className="k">INSERT INTO</span>{" analytics.orders                    "}<span className="c">-- the modelled table</span>{"\n"}
            <span className="k">SELECT</span>{" order_id, customer_id, amount, updated_at"}{"\n"}
            <span className="k">FROM</span>{"   raw.orders                              "}<span className="c">-- raw, freshly ingested source</span>{"\n"}
            <span className="k">WHERE</span>{"  updated_at > ("}<span className="k">SELECT</span>{" max(updated_at) "}<span className="k">FROM</span>{" analytics.orders);"}
          </pre>
          <p>
            On the first run the modelled table is empty, so every row loads. On every run afterwards, the subquery finds the latest
            <code> updated_at</code> already stored, and the <code>WHERE</code> clause lets through only rows newer than that. You
            process a day of changes, not the whole of history. In production you would usually <em>merge</em> rather than append,
            so an update to an existing order replaces the old row instead of duplicating it — but the high-water-mark idea is the
            same. This is the difference between a warehouse that costs about the same each month and one whose bill climbs with
            every row you have ever collected.
          </p>
        </section>

        <section id="good">
          <h2>What good looks like</h2>
          <p>
            Right-sizing matters more than any tool choice. The correct architecture is the smallest one that answers your
            recurring questions reliably. Here is what that looks like at three scales.
          </p>
          <h3>Early: one or two systems</h3>
          <p>
            Connect your BI tool directly to the source, or sync it with a single managed connector into a small database. Keep
            your definitions in a short, written, shared document. No warehouse. This is not a compromise; it is the right size for
            the problem.
          </p>
          <h3>Growing: several systems, daily decisions</h3>
          <p>
            A boring, sound shape. Managed connectors land raw data in a cloud warehouse. A transformation layer turns raw tables
            into staging models close to the source, then business-level models with a clearly stated <em>grain</em> — the one
            thing each row represents, such as one order or one order line. A semantic layer defines each metric once, and a BI tool
            sits on top. Incremental models keep the cost flat. This is the sweet spot the modern data stack was built for.
          </p>
          <h3>Larger: many teams, strict governance</h3>
          <p>
            The same shape, hardened: tests that run on every change, documented lineage so any figure traces back to its source
            row, access controls, and a named team that operates it. Nothing exotic — the growing-company stack, owned and
            defended.
          </p>
          <p>
            At every scale the rule holds: resist designing for a load you do not have. An over-built platform costs money, but its
            real cost is the ongoing burden of running something more complicated than the problem it serves.
          </p>
        </section>

        <section id="wrong">
          <h2>Common ways this goes wrong</h2>
          <p>A few failures show up again and again. All are expensive, and all are avoidable.</p>
          <ul>
            <li>
              <strong>Building a warehouse to fix one report.</strong> If a single dashboard is wrong, fix that query or that
              definition. A warehouse is a large answer to a small, local problem, and it will not make a bad definition correct.
            </li>
            <li>
              <strong>No owner.</strong> A warehouse launched without someone responsible for running it does not stay reliable.
              Connectors break, sources change shape, tests go stale. Within months it is just another source people quietly stop
              trusting.
            </li>
            <li>
              <strong>Premature complexity.</strong> Real-time streaming, a lakehouse, orchestration for pipelines you do not have
              yet. Each piece is defensible alone and indefensible together when the business only needs yesterday&rsquo;s numbers,
              reliably.
            </li>
            <li>
              <strong>Moving the mess in unchanged.</strong> Loading messy source data into a warehouse and pointing dashboards at
              it just relocates the mess and adds a bill. The value is in the modelling — resolving identity, fixing grain, agreeing
              definitions. Skip that and you have paid for storage, not clarity.
            </li>
          </ul>
        </section>

        <section id="boundary">
          <h2>When you genuinely need one</h2>
          <p>
            There is a real line, and it is worth stating plainly. A warehouse becomes the right answer — not a premature one — when
            the work has genuinely become a system rather than a task. The clearest example is when you must combine several systems
            and resolve them into one trustworthy result, repeatedly. Building <a href="/insights/one-customer-view">a single
            customer view</a> across CRM, billing and product data is exactly this kind of problem: it does not stay solved without
            a modelled system underneath it. When the conditions below all hold, building is the cheaper choice, and delaying only
            prolongs the manual stitching.
          </p>
          <SystemBoundary
            conditions={[
              "Several sources must be joined and modelled together to answer your most important questions — not simply stored side by side.",
              "Many consumers rely on the result, repeatedly, and re-deriving it by hand no longer scales.",
              "Definitions must be governed centrally, so one metric means one thing across every report.",
              "The result must refresh reliably on a schedule — typically daily — without someone running it by hand.",
              "Someone owns it: a named person or team keeps it running, tested and trusted after launch.",
            ]}
          />
        </section>

        <section id="decision">
          <h2>A readiness decision guide</h2>
          <p>
            Match your situation to the closest row. The recommended move is deliberately the smallest thing that resolves the real
            problem, not the most impressive.
          </p>
          <table className="article-table">
            <thead>
              <tr>
                <th>Your situation</th>
                <th>What it usually is</th>
                <th>Start with</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>One slow or wrong report, from a single source</td>
                <td>A query or logic problem</td>
                <td>Better SQL — fix the query and pin down its definition</td>
              </tr>
              <tr>
                <td>The data exists in one tool, but not in the tool that reports on it</td>
                <td>An ingestion gap</td>
                <td>A managed connector into your existing BI tool or database</td>
              </tr>
              <tr>
                <td>Numbers reconcile in the data, but one metric is defined differently everywhere</td>
                <td>A definitions problem</td>
                <td>A semantic model — define it once, reuse it everywhere</td>
              </tr>
              <tr>
                <td>A few sources, modest volume, growing cross-system questions</td>
                <td>Early consolidation</td>
                <td>A small database with a light managed pipeline</td>
              </tr>
              <tr>
                <td>Several sources, many consumers, daily governed decisions, a clear owner</td>
                <td>A system problem</td>
                <td>A data warehouse, scoped tightly to the decisions it must support</td>
              </tr>
            </tbody>
          </table>
          <p>
            If you can place yourself in one row with confidence, act on that row. If you cannot — if the honest answer to
            &ldquo;what breaks today?&rdquo; is still vague — that uncertainty is itself the finding. Pinning the requirements down
            before you provision anything is exactly what <a href="/data-diagnostic">a Data Diagnostic</a> is for. The cheapest
            warehouse is the one you did not need to build; the second cheapest is the one you scoped precisely before you started.
          </p>
        </section>
      </ArticleLayout>
    </PageShell>
  );
}
