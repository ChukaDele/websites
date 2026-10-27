import { PageShell } from "../../../components/site/PageShell";
import { ArticleLayout, TryThisFirst, SystemBoundary, Diagram, Example, Pull, ForYourDataPerson } from "../../../components/insights/Article";
import { insightMetadata } from "../../../lib/insights";

const SLUG = "connect-quickbooks-xero-to-power-bi";
const TOC = [
  { id: "changed", label: "What changed in 2025 and 2026" },
  { id: "try-first", label: "Questions before you choose" },
  { id: "routes", label: "Four routes into Power BI" },
  { id: "exports", label: "Route 1: scheduled exports" },
  { id: "pipeline", label: "Route 4: a pipeline into a database" },
  { id: "example", label: "Worked example: a broken Monday report" },
  { id: "wrong", label: "Common mistakes" },
  { id: "boundary", label: "When to move to a pipeline" },
  { id: "decision", label: "Which route fits" },
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
            title="Four routes from QuickBooks Online or Xero into Power BI"
            caption="There is no current Microsoft connector for either system. Each route trades setup effort against running cost and how fragile it is."
          >
            <svg viewBox="0 0 720 230" xmlns="http://www.w3.org/2000/svg" style={F} fontSize="11" fill="#2c3a36" textAnchor="middle">
              <defs><marker id="qx-a" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9 z" fill="rgba(20,35,33,.55)" /></marker></defs>
              <rect x="10" y="90" width="140" height="50" rx="4" fill="#fff" stroke="rgba(20,35,33,.35)" />
              <text x="80" y="112">QuickBooks Online</text><text x="80" y="128">or Xero</text>
              {["scheduled exports + Power Query", "third-party connector app", "own integration via the API", "pipeline into a database"].map((t, i) => (
                <g key={t}>
                  <line x1="150" y1="115" x2="226" y2={32 + i * 52} stroke="rgba(20,35,33,.35)" markerEnd="url(#qx-a)" />
                  <rect x="230" y={14 + i * 52} width="250" height="36" rx="4" fill={i === 3 ? "rgba(144,210,111,.14)" : "#fff"} stroke={i === 3 ? "#90d26f" : "rgba(20,35,33,.35)"} />
                  <text x="355" y={36 + i * 52}>{t}</text>
                  <line x1="480" y1={32 + i * 52} x2="556" y2="115" stroke="rgba(20,35,33,.25)" markerEnd="url(#qx-a)" />
                </g>
              ))}
              <rect x="560" y="90" width="150" height="50" rx="4" fill="#fff" stroke="rgba(20,35,33,.35)" />
              <text x="635" y="119">Power BI</text>
            </svg>
          </Diagram>
        }
      >
        <section id="changed">
          <h2>What changed for QuickBooks Online and Xero in Power BI?</h2>
          <p>Two changes broke or repriced many small-business reports:</p>
          <ul>
            <li><strong>QuickBooks Online</strong>: Microsoft lists its QuickBooks Online (Beta) connector as retired in its <a href="https://learn.microsoft.com/en-us/power-query/connectors/connector-end-of-support" target="_blank" rel="noopener noreferrer">connector end-of-support table</a>, and the Power BI Desktop release notes for March 2026 say it is no longer supported. Reports built on it stop refreshing.</li>
            <li><strong>Xero</strong>: Microsoft has never had a Xero connector, so Xero data always arrives through Xero&rsquo;s API. Since 2 March 2026, Xero <a href="https://developer.xero.com/pricing" target="_blank" rel="noopener noreferrer">prices that API</a> in tiers by number of connections and data egress, replacing the old revenue-share model. Apps that pull your Xero data may pass that cost on.</li>
          </ul>
          <p>The accounting data is the same; only the route into Power BI has changed. Choose the route on how often you need the numbers, how much detail, and who will keep it running.</p>
          <Pull>The extract was never the hard part. The route you pick decides how often it breaks.</Pull>
        </section>

        <section id="try-first">
          <h2>What to decide before you choose a route</h2>
          <TryThisFirst title="Four questions">
            <ol>
              <li><strong>Refresh</strong>: is a monthly pack enough, or do you need daily numbers?</li>
              <li><strong>Detail</strong>: do reports use summary reports (profit and loss, balance sheet) or transactions?</li>
              <li><strong>Other sources</strong>: will the report combine accounting data with Shopify, HubSpot or Stripe?</li>
              <li><strong>Owner</strong>: who fixes it when the refresh fails, and how much of their time can it take?</li>
            </ol>
          </TryThisFirst>
        </section>

        <section id="routes">
          <h2>Four ways to connect QuickBooks Online or Xero to Power BI</h2>
          <div className="in-table-wrap"><table>
            <thead><tr><th>Route</th><th>Good for</th><th>Running cost</th><th>Risk</th></tr></thead>
            <tbody>
              <tr><td>1. Scheduled exports combined with Power Query</td><td>Monthly packs, one entity</td><td>Staff time each month</td><td>Someone must export; layouts can change</td></tr>
              <tr><td>2. Third-party connector app</td><td>Daily refresh, little setup</td><td>Subscription; may rise with Xero&rsquo;s API pricing</td><td>Depends on the vendor; limited history and joins</td></tr>
              <tr><td>3. Your own integration through the API</td><td>One organisation, specific needs</td><td>Developer time; a Xero Custom Connection for one organisation</td><td>You maintain the code and authentication</td></tr>
              <tr><td>4. Pipeline into a database</td><td>Several sources, history, daily refresh</td><td>Pipeline tool plus a small database</td><td>Most robust; needs an owner</td></tr>
            </tbody>
          </table></div>
          <p>For route 3, Xero&rsquo;s <a href="https://developer.xero.com/documentation/guides/oauth2/custom-connections/" target="_blank" rel="noopener noreferrer">Custom Connections</a> link a single Xero organisation to your own integration, and Xero&rsquo;s pricing FAQ says they stay on their existing commercial terms. QuickBooks Online data is available through Intuit&rsquo;s Accounting API, including its <a href="https://developer.intuit.com/app/developer/qbo/docs/workflows/run-reports" target="_blank" rel="noopener noreferrer">report endpoints</a>.</p>
        </section>

        <section id="exports">
          <h2>Route 1: combine scheduled exports with Power Query</h2>
          <p>For a monthly pack from one organisation, exports are often enough. Save each month&rsquo;s export (for example a general ledger or account transactions report as CSV) into one folder, and let Power Query combine the folder on refresh. Then reconcile the combined total to the trial balance before anyone reads the pack.</p>
          <ForYourDataPerson title="Power Query (M) to combine a folder of CSV exports">
            <p>Accounting exports usually start with a few title rows (report name, organisation, date range) above the column headers. Set <code>TitleRowsToSkip</code> to the number of rows above the headers in your export:</p>
            <pre>{`let
    FolderPath      = "C:\\Finance\\Accounting exports",
    TitleRowsToSkip = 4,
    Source   = Folder.Files(FolderPath),
    CsvOnly  = Table.SelectRows(Source, each Text.Lower([Extension]) = ".csv"),
    Parsed   = Table.AddColumn(
        CsvOnly,
        "Data",
        each Table.AddColumn(
            Table.PromoteHeaders(
                Table.Skip(
                    Csv.Document([Content], [Delimiter = ",", Encoding = 65001]),
                    TitleRowsToSkip
                ),
                [PromoteAllScalars = true]
            ),
            "SourceFile",
            (row) => [Name]
        )
    ),
    Combined = Table.Combine(Parsed[Data])
in
    Combined`}</pre>
            <p>Each row keeps the file it came from in <code>SourceFile</code>, so a bad month can be traced. Set the column types after combining, using a locale that matches the export (English (United Kingdom) for day-first dates). The <a href="/insights/excel-cleaning-automation">Power Query clean-up guide</a> covers types, locales and checks.</p>
          </ForYourDataPerson>
        </section>

        <section id="pipeline">
          <h2>Route 4: load QuickBooks Online or Xero into a database</h2>
          <p>Once reports combine accounting data with other systems, or need history and daily refresh, load the data into a small database and point Power BI at that. A managed pipeline tool syncs the accounting system on a schedule; your SQL views define revenue, margin and debtors once; Power BI reads the views. <a href="/insights/first-reporting-stack">How to automate reporting without a data team</a> describes this setup and its running costs.</p>
          <ForYourDataPerson title="What to check before you pick a pipeline tool">
            <ul>
              <li><strong>Connector coverage</strong>: confirm the tool supports your edition and region of Xero or QuickBooks Online, and the objects you need (journals, invoices, contacts, tracking categories).</li>
              <li><strong>Pricing basis</strong>: usage-priced tools bill on rows changed per month; estimate from your invoice and journal volumes.</li>
              <li><strong>Xero API costs</strong>: check whether the tool passes Xero&rsquo;s connection or egress charges on to you.</li>
              <li><strong>Refresh</strong>: one sync a day, finishing before the Power BI refresh, is enough for most reporting.</li>
              <li><strong>Tie-out</strong>: test that monthly totals in the database match the trial balance from the accounting system.</li>
            </ul>
          </ForYourDataPerson>
        </section>

        <section id="example">
          <h2>Worked example: the Monday report that stopped refreshing</h2>
          <Example setting="UK retailer · QuickBooks Online, Shopify, Power BI Pro" title="Replacing a retired connector">
            <p>A weekly sales and margin report used the QuickBooks Online connector. It stopped refreshing, and the finance manager noticed only when the numbers did not move for a fortnight.</p>
            <ol>
              <li>The report also needed Shopify data, which was being pasted in by hand.</li>
              <li>A managed pipeline now loads QuickBooks Online and Shopify into a small database each night.</li>
              <li>Three SQL views define net sales, gross margin and debtors; Power BI reads them.</li>
              <li>A check compares monthly sales with the QuickBooks profit and loss report and shows red on the report if they differ.</li>
            </ol>
            <p>The report refreshes daily and no longer depends on one connector or on manual pasting.</p>
          </Example>
        </section>

        <section id="wrong">
          <h2>Common mistakes when connecting accounting data to Power BI</h2>
          <ul>
            <li>Building on a connector without checking its support status.</li>
            <li>Choosing a connector app without asking how Xero&rsquo;s API pricing affects its price.</li>
            <li>Reporting from summary exports when the business needs transaction detail.</li>
            <li>Skipping the monthly tie-out to the trial balance.</li>
            <li>Letting one person&rsquo;s login own the connection.</li>
          </ul>
        </section>

        <section id="boundary">
          <h2>When to move from exports to a pipeline</h2>
          <SystemBoundary
            conditions={[
              "The report needs to refresh daily or more often.",
              "Accounting data must be combined with Shopify, HubSpot, Stripe or another system.",
              "You need history the accounting system's reports do not keep in the shape you need.",
              "Several entities or currencies must be consolidated.",
              "Exports take more than an hour or two a month, or only one person can do them.",
            ]}
          />
        </section>

        <section id="decision">
          <h2>Which route should you use for QuickBooks Online or Xero?</h2>
          <div className="in-table-wrap"><table>
            <thead><tr><th>Situation</th><th>Route</th></tr></thead>
            <tbody>
              <tr><td>Monthly pack, one entity, accounting data only</td><td>Scheduled exports with Power Query</td></tr>
              <tr><td>Daily numbers fast, accounting data only</td><td>A third-party connector app, after checking its pricing</td></tr>
              <tr><td>One organisation, a developer available, specific needs</td><td>Your own integration through the API</td></tr>
              <tr><td>Several sources, history or several entities</td><td>A pipeline into a small database</td></tr>
            </tbody>
          </table></div>
          <p>Groups with several entities should read <a href="/insights/multi-entity-consolidation">multi-entity consolidation and FX</a>. Check licences in <a href="/insights/power-bi-licensing-small-business">Power BI licensing for small businesses</a>, and estimate the hours you would save with the <a href="/resources/reporting-automation-map">reporting automation map</a>. To have it rebuilt on a route that will last, see <a href="/services/data-projects">our reporting set-up projects</a>.</p>
        </section>
      </ArticleLayout>
    </PageShell>
  );
}
