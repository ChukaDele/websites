import { PageShell } from "../../../components/site/PageShell";
import { ArticleLayout, TryThisFirst, SystemBoundary, Diagram, Example, Pull, PlainEnglish, ForTheBusiness, ForYourDataPerson } from "../../../components/insights/Article";
import { insightMetadata } from "../../../lib/insights";

const SLUG = "power-bi-refresh-failed";
const TOC = [
  { id: "why", label: "Why Power BI refreshes fail" },
  { id: "try-first", label: "Read the error first" },
  { id: "memory", label: "Out-of-memory errors" },
  { id: "folding", label: "Incremental refresh that doesn't fold" },
  { id: "gateway", label: "Gateway and credential failures" },
  { id: "limits", label: "Timeouts and refresh limits" },
  { id: "example", label: "Worked example: a 3 a.m. failure" },
  { id: "wrong", label: "Common refresh mistakes" },
  { id: "boundary", label: "When refresh needs a project" },
  { id: "decision", label: "Error to first fix" },
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
            title="Five causes behind most failed Power BI refreshes"
            caption="Read the error in the refresh history, match it to a cause, fix the cause, then re-enable the schedule. Power BI disables a schedule after four consecutive failures."
          >
            <svg viewBox="0 0 720 240" xmlns="http://www.w3.org/2000/svg" style={F} fontSize="11" fill="#2c3a36" textAnchor="middle">
              <defs><marker id="rf-a" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9 z" fill="rgba(20,35,33,.55)" /></marker></defs>
              <rect x="10" y="96" width="130" height="48" rx="4" fill="rgba(240,191,108,.18)" stroke="#f0bf6c" />
              <text x="75" y="118">refresh failed</text><text x="75" y="134" fill="#a9741f">read the error</text>
              {["memory", "query folding", "gateway", "credentials", "timeout"].map((t, i) => (
                <g key={t}>
                  <line x1="140" y1="120" x2="246" y2={30 + i * 45} stroke="rgba(20,35,33,.35)" markerEnd="url(#rf-a)" />
                  <rect x="250" y={12 + i * 45} width="150" height="36" rx="4" fill="#fff" stroke="rgba(20,35,33,.35)" />
                  <text x="325" y={34 + i * 45}>{t}</text>
                  <line x1="400" y1={30 + i * 45} x2="496" y2="120" stroke="rgba(20,35,33,.25)" />
                </g>
              ))}
              <rect x="500" y="96" width="200" height="48" rx="4" fill="rgba(144,210,111,.14)" stroke="#90d26f" strokeWidth="1.6" />
              <text x="600" y="118">fix the cause</text><text x="600" y="134" fill="#3c6b43">then re-enable schedule</text>
            </svg>
          </Diagram>
        }
      >
        <section id="why">
          <h2>Why do Power BI refreshes fail?</h2>
          <p>A refresh is Power BI reloading data from your sources into a semantic model, the dataset reports read. It fails when the service cannot reach a source, cannot authenticate, runs out of memory or runs out of time. The refresh history in the semantic model&rsquo;s settings shows the error for each attempt.</p>
          <PlainEnglish>
            <p>When a refresh fails, reports keep showing the last data that loaded, often without any warning on the page. After four failures in a row, Power BI switches the schedule off and emails the owner. Most failures have one of five causes, and each has a specific fix. Re-running the refresh without fixing the cause rarely helps.</p>
            <ul>
              <li><strong>Ask your team</strong>: which models failed a refresh in the last 30 days, and who receives the failure emails?</li>
              <li><strong>Expect back</strong>: a cause and fix for each recurring failure, and an alert that reaches someone who will act.</li>
            </ul>
          </PlainEnglish>
          <Pull>A failed refresh does not break the report. It freezes it, which is worse, because nobody notices.</Pull>
        </section>

        <section id="try-first">
          <h2>How to find out why a Power BI refresh failed</h2>
          <ForTheBusiness>Five minutes with the refresh history usually names the cause, before anyone changes the model.</ForTheBusiness>
          <TryThisFirst title="Read the error before you change anything">
            <ol>
              <li>Open the workspace, select the semantic model, open Settings, and view Refresh history.</li>
              <li>Open the details of the latest failure and copy the full error text.</li>
              <li>Note whether failures happen every time or only sometimes. Intermittent failures point at memory, capacity load or a busy source.</li>
              <li>Note when the failures started, and what changed then: a new column, a larger source, a password change, a gateway update.</li>
              <li>Match the error to the table at the end of this guide.</li>
            </ol>
          </TryThisFirst>
        </section>

        <section id="memory">
          <h2>How to fix Power BI refresh out-of-memory errors</h2>
          <ForTheBusiness>A model that loads fine can still fail to refresh, because a full refresh needs extra memory while it rebuilds.</ForTheBusiness>
          <p>Microsoft&rsquo;s troubleshooting guide lists the signs of memory pressure: a message that the operation was cancelled because there wasn&rsquo;t enough memory to finish, or error code <code>0xC13E0003</code>. The cause is usually size. A full refresh needs about twice the memory the model uses, because the old copy stays available while the new one builds. On shared capacity (Pro), an imported model is also limited to 1 GB.</p>
          <p>Fixes, in the order to try them:</p>
          <ul>
            <li><strong>Remove what reports do not use</strong>: unused tables, columns and rows. Every column removed saves memory on every refresh.</li>
            <li><strong>Reduce cardinality</strong>: split timestamps into date and time, round decimals, drop free text. See <a href="/insights/power-bi-slow">why Power BI is slow</a> for how column sizes work.</li>
            <li><strong>Move calculated columns and tables upstream</strong>, into the source or a warehouse, so the refresh does not compute them.</li>
            <li><strong>Refresh less at once</strong>: incremental refresh, or refreshing tables separately on capacity.</li>
            <li><strong>Use a larger capacity</strong> once the model is lean. Premium Per User allows models up to 100 GB.</li>
          </ul>
        </section>

        <section id="folding">
          <h2>Why incremental refresh is not working: query folding</h2>
          <ForTheBusiness>Incremental refresh only saves time when the date filter runs in the source; otherwise it can be slower than a full refresh.</ForTheBusiness>
          <p>Incremental refresh splits a table into date partitions and reloads only the recent ones. It needs two Date/Time parameters with the exact, case-sensitive names <code>RangeStart</code> and <code>RangeEnd</code>, used to filter the table. It is available on Pro as well as Premium.</p>
          <p>The catch is <strong>query folding</strong>: Power Query turning your steps into a query the source runs. If the date filter folds, the source returns only the rows for each partition. If it does not, Microsoft notes the engine may apply the filter locally, which means retrieving all rows for every partition. A table with 36 monthly partitions can then read the whole source 36 times.</p>
          <ForYourDataPerson title="A filter step that folds, and how to check it">
            <p>Apply the filter as early as possible, directly on the source table, comparing the date column with the parameters. Use <code>&gt;=</code> on one side and <code>&lt;</code> on the other so no row lands in two partitions:</p>
            <pre>{`let
    Source   = Sql.Database("your_server_name", "your_database_name"),
    Invoices = Source{[Schema = "dbo", Item = "Invoices"]}[Data],
    Filtered = Table.SelectRows(
        Invoices,
        each [InvoiceDate] >= RangeStart and [InvoiceDate] < RangeEnd
    )
in
    Filtered`}</pre>
            <p>Right-click the <code>Filtered</code> step in Power Query and choose View Native Query. If it is available and shows a <code>WHERE</code> clause on <code>InvoiceDate</code>, the filter folds. If it is greyed out, a step before it has broken folding: common culprits are custom columns, merges with other sources, and changing types after the filter. Files such as CSV and Excel do not fold at all, so incremental refresh on them still reads every file. See Microsoft&rsquo;s <a href="https://learn.microsoft.com/en-us/power-query/query-folding-basics" target="_blank" rel="noopener noreferrer">query folding basics</a>.</p>
          </ForYourDataPerson>
        </section>

        <section id="gateway">
          <h2>How to fix Power BI gateway and credential errors</h2>
          <ForTheBusiness>These failures stop a refresh completely, and they often start after an unrelated change, such as a password reset.</ForTheBusiness>
          <p>Any source Power BI cannot reach over the internet, such as an on-premises SQL Server, needs an on-premises data gateway. Typical failures and fixes:</p>
          <ul>
            <li><strong>Gateway offline</strong>: the machine running it is off, asleep or lost its network. Run the gateway on an always-on server, not a laptop, and consider a cluster of two.</li>
            <li><strong>Gateway out of date</strong>: Microsoft supports the last six monthly gateway releases. Schedule updates.</li>
            <li><strong>Credentials expired or changed</strong>: a password reset or expired token on the data source. Update the credentials in the semantic model or gateway connection, and use a service account rather than a person&rsquo;s login.</li>
            <li><strong>Source moved or renamed</strong>: a server, database or file path changed. The gateway data source must match the path used in Power BI Desktop exactly.</li>
          </ul>
        </section>

        <section id="limits">
          <h2>Power BI refresh limits: timeouts, schedules and disabled refresh</h2>
          <ForTheBusiness>These limits decide how fresh reports can be on each licence, and when Power BI stops trying.</ForTheBusiness>
          <div className="in-table-wrap"><table>
            <thead><tr><th>Limit</th><th>Shared capacity (Pro)</th><th>Premium Per User, Premium or Fabric</th></tr></thead>
            <tbody>
              <tr><td>Scheduled refreshes a day</td><td>8</td><td>48</td></tr>
              <tr><td>Maximum refresh duration</td><td>Under 2 hours</td><td>5 hours (longer through the XMLA endpoint)</td></tr>
              <tr><td>Imported model size</td><td>1 GB</td><td>100 GB on PPU; set by capacity size on Premium and Fabric</td></tr>
              <tr><td>Schedule disabled after</td><td>4 consecutive failures</td><td>4 consecutive failures</td></tr>
              <tr><td>Schedule paused after</td><td>2 months without use</td><td>2 months without use</td></tr>
            </tbody>
          </table></div>
          <p>Licence choices are covered in <a href="/insights/power-bi-licensing-small-business">Power BI licensing for small businesses</a>. On Fabric capacity, refreshes can also be delayed or rejected by throttling; see <a href="/insights/fabric-capacity-throttling">Fabric capacity throttling explained</a>.</p>
        </section>

        <section id="example">
          <h2>Worked example: a refresh that fails at 3 a.m.</h2>
          <Example setting="UK distributor · SQL Server on premises, gateway, Power BI Pro" title="Intermittent memory failures after a new column">
            <p>The nightly sales refresh fails two nights out of three with a memory error and succeeds when re-run in the afternoon. It started after a line-comments column was added to the invoice table.</p>
            <ol>
              <li>VertiPaq Analyzer shows the new comments column is the largest in the model: almost every value is unique.</li>
              <li>Nobody filters or reports on it, so it is removed from the query.</li>
              <li>The invoice table gets incremental refresh on the last 60 days, with the date filter checked for folding.</li>
              <li>The schedule is re-enabled and an owner is named for the failure emails.</li>
            </ol>
            <p>The model is smaller than before the column was added, and the refresh reads two months of rows instead of three years.</p>
          </Example>
        </section>

        <section id="wrong">
          <h2>Common Power BI refresh mistakes</h2>
          <ul>
            <li>Re-running a failed refresh repeatedly without reading the error.</li>
            <li>Turning on incremental refresh without checking that the date filter folds.</li>
            <li>Running the gateway on a laptop, or under a person&rsquo;s login.</li>
            <li>Leaving failure emails going to someone who has left.</li>
            <li>Loading every column &ldquo;in case&rdquo;, until the model no longer fits in memory.</li>
            <li>Scheduling every model at the same time, so they compete for the gateway and the source.</li>
          </ul>
        </section>

        <section id="boundary">
          <h2>When Power BI refresh failures need a project</h2>
          <SystemBoundary
            conditions={[
              "Several models fail every week, and fixes do not last.",
              "Models are close to the size limit of your licence or capacity.",
              "Heavy transformation runs in Power Query against slow or file-based sources.",
              "Nobody owns the gateway, credentials or failure alerts.",
              "Reports must be fresh by a fixed time, and the refresh chain keeps missing it.",
            ]}
          />
        </section>

        <section id="decision">
          <h2>Power BI refresh errors and the first fix for each</h2>
          <div className="in-table-wrap"><table>
            <thead><tr><th>Error or symptom</th><th>Likely cause</th><th>First fix</th></tr></thead>
            <tbody>
              <tr><td>&ldquo;wasn&rsquo;t enough memory&rdquo;, 0xC13E0003</td><td>Model too large to rebuild</td><td>Remove columns, reduce cardinality, use incremental refresh</td></tr>
              <tr><td>Incremental refresh slower than full</td><td>Date filter does not fold</td><td>Filter on the source table; check View Native Query</td></tr>
              <tr><td>Gateway unreachable or offline</td><td>Gateway machine or service down</td><td>Always-on server, cluster, monthly updates</td></tr>
              <tr><td>Credentials invalid or expired</td><td>Password or token changed</td><td>Update credentials; use a service account</td></tr>
              <tr><td>Refresh cancelled after two or five hours</td><td>Timeout</td><td>Push transformation upstream; incremental refresh</td></tr>
              <tr><td>Schedule switched off</td><td>Four consecutive failures</td><td>Fix the cause, refresh manually, re-enable</td></tr>
            </tbody>
          </table></div>
          <p>When transformation is the bottleneck, moving it into a database is usually the lasting fix; <a href="/insights/power-bi-warehouse-or-both">Power BI or a data warehouse</a> explains when. Agree how fresh each report must be with the <a href="/resources/data-freshness-sla-calculator">data freshness SLA calculator</a>. If refresh failures are a weekly fire, a <a href="/services/data-projects">BI reliability project</a> removes the causes, and <a href="/work">models we have built</a> show the end result.</p>
          <p>Paste your error into the <a href="/resources/power-bi-refresh-error-lookup">Power BI refresh error lookup</a> to get the likely cause and first fix.</p>
        </section>
      </ArticleLayout>
    </PageShell>
  );
}
