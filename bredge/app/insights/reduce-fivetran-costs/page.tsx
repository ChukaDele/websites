import { PageShell } from "../../../components/site/PageShell";
import { ArticleLayout, TryThisFirst, SystemBoundary, Diagram, Example, Pull, PlainEnglish, ForTheBusiness, ForYourDataPerson } from "../../../components/insights/Article";
import { insightMetadata } from "../../../lib/insights";

const SLUG = "reduce-fivetran-costs";
const TOC = [
  { id: "why", label: "Why the Fivetran bill grows" },
  { id: "mar", label: "How MAR is counted" },
  { id: "try-first", label: "Find the expensive tables" },
  { id: "levers", label: "Six ways to cut MAR" },
  { id: "move", label: "When to move a table off Fivetran" },
  { id: "example", label: "Worked example: a noisy column" },
  { id: "wrong", label: "Common cost-cutting mistakes" },
  { id: "boundary", label: "When this needs a project" },
  { id: "decision", label: "Which lever for which table" },
];

export const metadata = insightMetadata(SLUG);

const F = { fontFamily: "var(--font-mono), ui-monospace, monospace" };

export default function Page() {
  return (
    <PageShell>
      <ArticleLayout
        slug={SLUG}
        toc={TOC}
        heroDiagram={
          <Diagram
            title="Monthly active rows by table: a few tables drive the bill"
            caption="Illustrative. In most connections a small number of high-churn tables, such as events, logs or status histories, account for most monthly active rows."
          >
            <svg viewBox="0 0 720 230" xmlns="http://www.w3.org/2000/svg" style={F} fontSize="11" fill="#2c3a36">
              {[["events", 560], ["order_status_history", 300], ["sessions", 170], ["orders", 60], ["customers", 30], ["products", 12], ["other 40 tables", 40]].map(([n, w], i) => (
                <g key={n as string}>
                  <text x="170" y={30 + i * 28} textAnchor="end">{n}</text>
                  <rect x="180" y={18 + i * 28} width={(w as number) * 0.9} height="16" rx="2" fill={i < 2 ? "rgba(240,191,108,.45)" : "rgba(144,210,111,.35)"} stroke={i < 2 ? "#f0bf6c" : "#90d26f"} />
                </g>
              ))}
              <text x="180" y="222" fill="#7a847f">monthly active rows (illustrative scale)</text>
            </svg>
          </Diagram>
        }
      >
        <section id="why">
          <h2>Why does the Fivetran bill keep going up?</h2>
          <p>Fivetran charges on monthly active rows (MAR): the distinct rows it syncs to your warehouse in a calendar month. The bill grows when tables change more rows, not only when you add sources. Two pricing changes made it more visible: MAR has been counted per connection since 1 March 2025, and from 1 January 2026 deletes and history-mode changes count as changed rows, with a minimum monthly charge on small connections.</p>
          <PlainEnglish>
            <p>Your Fivetran bill depends on how many rows change in each source every month. Usually a few busy tables, such as event logs or status histories, cause most of it. Cutting the bill means finding those tables and deciding, one by one, whether you need them, need them less often, or should load them a cheaper way.</p>
            <ul>
              <li><strong>Ask your team</strong>: which ten tables generated the most monthly active rows last month, and who uses each?</li>
              <li><strong>Expect back</strong>: a table-by-table plan with the expected MAR saving, and no loss of data anyone relies on.</li>
            </ul>
          </PlainEnglish>
          <p>This guide uses Fivetran&rsquo;s own documentation for how MAR is counted and makes no claims about price per row, which depends on your plan and contract.</p>
        </section>

        <section id="mar">
          <h2>How Fivetran monthly active rows are calculated</h2>
          <ForTheBusiness>Knowing what counts as an active row tells you which tables to look at first.</ForTheBusiness>
          <ul>
            <li><strong>Definition</strong>: Fivetran defines MAR as the number of distinct rows synced from the source to the destination in a calendar month. Each primary key counts once a month, however often it changes.</li>
            <li><strong>Per connection</strong>: since 1 March 2025, MAR is counted and priced per connection, so volume tiers no longer pool across your connections.</li>
            <li><strong>Deletes and history mode</strong>: from 1 January 2026 on pay-as-you-go (annual contracts at renewal), deleted rows and history-mode changes count like any other changed row.</li>
            <li><strong>Minimum charge</strong>: from the same date, a minimum charge applies to standard connections generating between 1 and 1 million MAR a month.</li>
            <li><strong>Initial syncs</strong>: historical data loaded in an initial sync is free. Re-syncs bill changed rows, with some exceptions documented by Fivetran.</li>
          </ul>
          <p>A table of 10 million rows where 50,000 change each month costs far less than a table of 1 million rows that is rewritten every night. Volume is not the driver; churn is.</p>
        </section>

        <section id="try-first">
          <h2>How to find the tables driving your Fivetran MAR</h2>
          <ForTheBusiness>A short list of tables usually explains most of the bill, so the first hour of analysis gives most of the savings.</ForTheBusiness>
          <TryThisFirst title="A one-hour MAR review">
            <ol>
              <li>Open the usage page in the Fivetran dashboard and sort connections by MAR for the last full month.</li>
              <li>For the top connections, drill into MAR by table.</li>
              <li>List the top ten tables with their MAR, sync frequency and whether history mode is on.</li>
              <li>For each, find out who uses it: search your dbt project and BI tool for the table name.</li>
              <li>Mark each table: keep, reduce (fewer columns or less often), or move.</li>
            </ol>
          </TryThisFirst>
          <ForYourDataPerson title="Which synced tables do your models actually read?">
            <p>If you use dbt, the manifest lists every source your models depend on. This shell command prints the source tables referenced by at least one model, so any synced table missing from the list is a candidate to stop syncing:</p>
            <pre>{`dbt parse
jq -r '.nodes[] | select(.resource_type == "model") | .depends_on.nodes[]' \\
  target/manifest.json | grep '^source\\.' | sort -u`}</pre>
            <p>It needs <a href="https://jqlang.org/" target="_blank" rel="noopener noreferrer">jq</a> installed. Check BI tools and ad hoc queries too before you turn a table off: a table no model reads may still feed a dashboard directly.</p>
          </ForYourDataPerson>
        </section>

        <section id="levers">
          <h2>Six ways to reduce Fivetran MAR</h2>
          <ForTheBusiness>Each of these cuts rows you pay for without removing data anyone uses.</ForTheBusiness>
          <ol>
            <li><strong>Stop syncing unused tables</strong>: deselect them in the connection schema. Unused tables in SaaS connectors are common, because connectors offer everything by default.</li>
            <li><strong>Deal with noisy columns</strong>: a column such as a last-seen timestamp that changes on every login makes the whole row change, so the row counts as active every month. Whether blocking that column in Fivetran reduces MAR depends on how the connector detects changes, so test it and check the usage page. The reliable fix is at source: keep fast-changing fields in their own table.</li>
            <li><strong>Turn off history mode where nobody uses history</strong>: since 2026 its changes count toward MAR. Keep it only on tables where you report past states.</li>
            <li><strong>Avoid unnecessary re-syncs</strong>: a full re-sync of a large table bills changed rows. Fix the cause of the drift first and re-sync only the affected table.</li>
            <li><strong>Consolidate small connections</strong>: with a minimum charge per small connection, several near-empty connections cost more than they used to. Remove the ones nobody uses.</li>
            <li><strong>Move high-churn, simple tables</strong>: large append-heavy tables from your own databases are often cheaper to load with log-based replication or an open-source loader you run.</li>
          </ol>
          <Pull>Volume is not the driver of the bill. Churn is: how many rows change each month.</Pull>
        </section>

        <section id="move">
          <h2>When should you move a table off Fivetran?</h2>
          <ForTheBusiness>Moving a table saves licence cost but adds engineering work, so it only pays for the few largest tables.</ForTheBusiness>
          <p>Fivetran merged with dbt Labs in a deal that completed on 1 June 2026, which raised questions about lock-in. The decision to move should still be made table by table, on cost and effort:</p>
          <ul>
            <li><strong>Good candidates</strong>: very high-MAR tables from databases you control, where <a href="/insights/change-data-capture">log-based change data capture</a> or a simple loader is straightforward.</li>
            <li><strong>Poor candidates</strong>: SaaS APIs with pagination, rate limits and schema changes. Here a managed connector saves the most engineering time.</li>
            <li><strong>Alternatives</strong>: Airbyte sells volume-based credits on its Standard plan, capacity-based plans above it and an open-source edition; <a href="https://dlthub.com/docs/intro" target="_blank" rel="noopener noreferrer">dlt</a> is an open-source Python library for writing loaders. Any self-run option needs monitoring and an owner.</li>
          </ul>
        </section>

        <section id="example">
          <h2>Worked example: one noisy column driving the MAR</h2>
          <Example setting="Scale-up · Fivetran, Postgres, HubSpot, Snowflake" title="A last_seen_at column rewriting every user row">
            <p>The product database connection is the largest line on the usage page. Drilling in, the users table generates most of its MAR, although only a few hundred users sign up each month.</p>
            <ol>
              <li>The application updates <code>users.last_seen_at</code> on every login, so every active user&rsquo;s row changes every day and counts as active each month.</li>
              <li>No dbt model or dashboard reads <code>last_seen_at</code>; activity is measured from the events table.</li>
              <li>The application team moves <code>last_seen_at</code> into its own small table, which is not synced. The users table now changes only when a user&rsquo;s details change.</li>
              <li>Two HubSpot tables nobody reads and a duplicate connection to a test database are removed.</li>
            </ol>
            <p>The next month&rsquo;s usage page confirms the drop. Figures are illustrative; your result depends on your tables.</p>
          </Example>
        </section>

        <section id="wrong">
          <h2>Common Fivetran cost-cutting mistakes</h2>
          <ul>
            <li>Lowering sync frequency on every connection. Rows that change several times a day still count once a month, so less frequent syncs often save little MAR.</li>
            <li>Turning off tables without checking BI tools and ad hoc users.</li>
            <li>Migrating everything at once, and taking on dozens of self-run loaders.</li>
            <li>Triggering full re-syncs to fix one bad table.</li>
            <li>Comparing vendors on headline price without modelling your own row churn.</li>
          </ul>
        </section>

        <section id="boundary">
          <h2>When ingestion cost needs a project</h2>
          <SystemBoundary
            conditions={[
              "Ingestion is one of the largest lines in your data budget and growing faster than usage.",
              "A few database tables generate most of the MAR and could be replicated another way.",
              "Nobody knows which synced tables are used.",
              "Re-syncs happen regularly because of drift or schema changes.",
              "A contract renewal is coming and you need evidence to negotiate.",
            ]}
          />
        </section>

        <section id="decision">
          <h2>Which Fivetran cost lever fits which table?</h2>
          <div className="in-table-wrap"><table>
            <thead><tr><th>Table pattern</th><th>Lever</th></tr></thead>
            <tbody>
              <tr><td>Synced but never read</td><td>Deselect it</td></tr>
              <tr><td>One column changes constantly</td><td>Move it to its own table at source, or test blocking it</td></tr>
              <tr><td>History mode on, history never reported</td><td>Turn history mode off</td></tr>
              <tr><td>Very high MAR, from your own database</td><td>Consider log-based CDC or a self-run loader</td></tr>
              <tr><td>SaaS source with a complex API</td><td>Keep the managed connector</td></tr>
              <tr><td>Several near-empty connections</td><td>Consolidate or remove them</td></tr>
            </tbody>
          </table></div>
          <p>Once data lands, warehouse compute is the next cost to check; see <a href="/insights/warehouse-platform-costs">how to reduce Snowflake, BigQuery and Databricks costs</a> and <a href="/insights/incremental-models-at-scale">incremental models at scale</a>. Estimate what downstream queries cost with the <a href="/resources/warehouse-query-cost-estimator">warehouse query cost estimator</a>. To have the expensive tables found and moved, see <a href="/services/data-projects">our ingestion cost projects</a>.</p>
          <p>Estimate MAR per table from your own row counts and change rates with the <a href="/resources/fivetran-mar-cost-estimator">Fivetran MAR cost estimator</a>.</p>
        </section>
      </ArticleLayout>
    </PageShell>
  );
}
