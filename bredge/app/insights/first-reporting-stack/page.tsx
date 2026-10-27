import { PageShell } from "../../../components/site/PageShell";
import { ArticleLayout, TryThisFirst, SystemBoundary, Diagram, Example, Pull, ForYourDataPerson } from "../../../components/insights/Article";
import { insightMetadata } from "../../../lib/insights";

const SLUG = "first-reporting-stack";
const TOC = [
  { id: "why", label: "Why small-business reporting stays manual" },
  { id: "try-first", label: "What to automate first" },
  { id: "stage-1", label: "Stage 1: native connectors" },
  { id: "stage-2", label: "Stage 2: a connector and a small warehouse" },
  { id: "checks", label: "Three checks that keep it trusted" },
  { id: "not-yet", label: "What not to buy yet" },
  { id: "example", label: "Worked example: an online retailer" },
  { id: "wrong", label: "Common mistakes" },
  { id: "boundary", label: "When you need more than this" },
  { id: "decision", label: "Which setup fits your business" },
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
            title="Two small setups: native connectors first, a small warehouse when sources multiply"
            caption="Stage 1 connects the report tool straight to one or two systems. Stage 2 adds a managed connector and a small warehouse, where definitions live once. Both end in one report and an owner."
          >
            <svg viewBox="0 0 720 240" xmlns="http://www.w3.org/2000/svg" style={F} fontSize="11" fill="#2c3a36" textAnchor="middle">
              <defs><marker id="fr-a" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9 z" fill="rgba(20,35,33,.55)" /></marker></defs>
              <text x="20" y="22" textAnchor="start">STAGE 1 · one or two sources</text>
              <rect x="20" y="36" width="120" height="40" rx="4" fill="#fff" stroke="rgba(20,35,33,.35)" /><text x="80" y="60">Xero / QuickBooks</text>
              <line x1="140" y1="56" x2="236" y2="56" stroke="rgba(20,35,33,.4)" markerEnd="url(#fr-a)" />
              <rect x="240" y="36" width="160" height="40" rx="4" fill="rgba(144,210,111,.12)" stroke="#90d26f" /><text x="320" y="60">Power BI or Excel</text>
              <text x="420" y="60" textAnchor="start" fill="#7a847f">one report · scheduled refresh</text>
              <text x="20" y="118" textAnchor="start">STAGE 2 · three or more sources, or history needed</text>
              {["Xero", "Shopify", "HubSpot"].map((n, i) => (
                <g key={n}>
                  <rect x="20" y={132 + i * 34} width="100" height="26" rx="4" fill="#fff" stroke="rgba(20,35,33,.35)" /><text x="70" y={149 + i * 34}>{n}</text>
                  <line x1="120" y1={145 + i * 34} x2="196" y2="179" stroke="rgba(20,35,33,.4)" markerEnd="url(#fr-a)" />
                </g>
              ))}
              <rect x="200" y="160" width="130" height="40" rx="4" fill="#fff" stroke="rgba(20,35,33,.35)" /><text x="265" y="184">managed connector</text>
              <line x1="330" y1="180" x2="376" y2="180" stroke="rgba(20,35,33,.4)" markerEnd="url(#fr-a)" />
              <rect x="380" y="160" width="140" height="40" rx="4" fill="#fff" stroke="rgba(20,35,33,.35)" /><text x="450" y="184">small warehouse</text>
              <line x1="520" y1="180" x2="566" y2="180" stroke="#90d26f" strokeWidth="1.8" markerEnd="url(#fr-a)" />
              <rect x="570" y="160" width="130" height="40" rx="4" fill="rgba(144,210,111,.12)" stroke="#90d26f" /><text x="635" y="184">one report</text>
            </svg>
          </Diagram>
        }
      >
        <section id="why">
          <h2>Why does small-business reporting stay manual?</h2>
          <p>Because the work arrives in small pieces. Someone exports sales from Shopify, invoices from Xero and deals from HubSpot, pastes them into a workbook and rebuilds the same five numbers every Monday. Each step takes minutes, so nobody budgets time to replace it. Added up over a year, those minutes become weeks, and the report depends on one person being in the office.</p>
          <p>You don&rsquo;t need a data platform to fix this. You need the numbers you already rebuild to refresh on a schedule, with each one defined once and checked automatically. That takes two or three tools, most of which you may already pay for, and an owner who spends a few hours a month keeping it trusted.</p>
          <Pull>The goal is not a modern data stack. It is Monday&rsquo;s numbers, correct, without anyone rebuilding them.</Pull>
        </section>

        <section id="try-first">
          <h2>What reporting should a small business automate first?</h2>
          <p>Start with the report you rebuild most often, not the one that would impress most. List what you rebuild by hand and score each item:</p>
          <TryThisFirst title="A one-hour reporting inventory">
            <ol>
              <li>List every report or number someone rebuilds by hand each week or month.</li>
              <li>For each, write how long it takes, which systems it uses, and who does it.</li>
              <li>Mark the ones a decision depends on: cash, sales by channel, gross margin, debtors, stock.</li>
              <li>Pick the one with the most hours per year that uses the fewest systems. Automate that first.</li>
              <li>Write one sentence defining each number it shows, such as &ldquo;net sales: order value after discounts and refunds, excluding VAT and shipping&rdquo;.</li>
            </ol>
          </TryThisFirst>
          <p>Five to ten numbers cover the questions most owners ask weekly: cash position, sales by channel, gross margin, overdue invoices, and the pipeline or stock figure that drives next month. The <a href="/insights/automate-monthly-reporting">monthly reporting guide</a> covers how to keep judgement and review in the loop once the mechanical steps run themselves.</p>
        </section>

        <section id="stage-1">
          <h2>Stage 1: connect your reporting tool directly to one or two systems</h2>
          <p>If the report uses one or two systems, connect your reporting tool straight to them. Power BI, Excel (through Power Query) and Looker Studio can each read from many accounting, e-commerce and CRM systems, natively or through a connector app from the vendor&rsquo;s marketplace. Check the exact system and plan you use before you commit, because connector coverage changes. Two recent changes matter for accounting data:</p>
          <ul>
            <li><strong>QuickBooks Online</strong>: Microsoft has retired its QuickBooks Online (Beta) connector for Power BI; it appears in Microsoft&rsquo;s <a href="https://learn.microsoft.com/en-us/power-query/connectors/connector-end-of-support" target="_blank" rel="noopener noreferrer">connector end-of-support list</a>. Reports built on it need a new route.</li>
            <li><strong>Xero</strong>: there is no Microsoft connector for Xero. Since 2 March 2026, Xero <a href="https://developer.xero.com/pricing" target="_blank" rel="noopener noreferrer">prices API access</a> by number of connections and data egress, so third-party apps that pull your Xero data may pass that cost on.</li>
          </ul>
          <p>The options for both are compared in <a href="/insights/connect-quickbooks-xero-to-power-bi">how to connect QuickBooks Online and Xero to Power BI</a>.</p>
          <p>Set a scheduled refresh and stop exporting files. In Power BI, a semantic model on shared capacity (Pro licences) can refresh up to eight times a day on a schedule; Premium, Premium Per User and Fabric capacities allow up to 48. A daily refresh before the working day starts is enough for most small-business reporting.</p>
          <p>Keep definitions in one place even at this stage: a measures table in Power BI, or one calculation sheet in Excel that every report reads. When spreadsheet files are the only source, the <a href="/insights/excel-cleaning-automation">Power Query clean-up guide</a> shows how to combine and clean them on refresh.</p>
        </section>

        <section id="stage-2">
          <h2>Stage 2: add a managed connector and a small warehouse</h2>
          <p>Move to a small warehouse when one of three things happens: an important answer needs three or more systems joined, you need history a source overwrites (last quarter&rsquo;s price list, a customer&rsquo;s previous segment), or several reports must share one definition. The setup has three parts:</p>
          <ul>
            <li><strong>A managed connector</strong>, such as Fivetran or Airbyte, copies data from each system into the warehouse on a schedule. Fivetran prices on monthly active rows (MAR), counted per connection since March 2025, and from January 2026 applies a minimum monthly charge to small connections; initial historical syncs are free. Airbyte sells volume-based credits on its Standard plan and capacity-based plans above it, and publishes an open-source edition you can host yourself. Trial the exact connectors you need, and read <a href="/insights/reduce-fivetran-costs">how to cut Fivetran MAR costs</a> before your data grows.</li>
            <li><strong>A small warehouse</strong>, such as BigQuery or a managed Postgres database. BigQuery has a monthly free tier for storage and queries, which can cover a small business&rsquo;s reporting data; check the current limits before you rely on it.</li>
            <li><strong>A handful of SQL views or models</strong> that join the sources and define each metric once. Your report reads these, not the raw tables.</li>
          </ul>
          <ForYourDataPerson title="Connector, warehouse and refresh settings to start with">
            <ul>
              <li><strong>Power BI refresh</strong>: up to 8 scheduled refreshes a day on shared capacity (Pro), up to 48 on Premium, Premium Per User and Fabric capacity. See <a href="https://learn.microsoft.com/en-us/power-bi/connect-data/refresh-data" target="_blank" rel="noopener noreferrer">data refresh in Power BI</a>.</li>
              <li><strong>On-premises sources</strong>: a database on a local server (for example a Sage 200 SQL Server) needs an <a href="https://learn.microsoft.com/en-us/data-integration/gateway/service-gateway-onprem" target="_blank" rel="noopener noreferrer">on-premises data gateway</a> for scheduled refresh.</li>
              <li><strong>BigQuery cost guard</strong>: partition large tables by date and set a maximum bytes billed on scheduled queries, so a single query fails instead of exceeding the limit. See <a href="https://cloud.google.com/bigquery/docs/best-practices-costs" target="_blank" rel="noopener noreferrer">BigQuery cost controls</a>.</li>
              <li><strong>Connector schedule</strong>: start with one sync a day, timed to finish before the report refreshes. Check how your connector counts initial and full re-syncs before you trigger one.</li>
              <li><strong>Definitions</strong>: keep each metric as a SQL view in one reporting schema, and point the report only at that schema.</li>
            </ul>
          </ForYourDataPerson>
          <p>Before you build, the <a href="/insights/before-you-build-a-data-warehouse">warehouse readiness questions</a> confirm whether you need this stage yet. If the question is which tool to buy first, read <a href="/insights/power-bi-warehouse-or-both">Power BI, a warehouse or both</a>.</p>
        </section>

        <section id="checks">
          <h2>Three checks that keep automated reports trusted</h2>
          <p>An automated report that is wrong does more damage than a manual one, because nobody is looking at it closely. Add three checks and show their status on the report itself:</p>
          <ul>
            <li><strong>Freshness</strong>: the latest record from each source is from today or yesterday. A connector that stopped three days ago fails this first.</li>
            <li><strong>Row counts</strong>: this week&rsquo;s orders or invoices are within a sensible range of last week&rsquo;s. A count of zero or double means a broken sync or a duplicate load.</li>
            <li><strong>Tie to the accounts</strong>: monthly sales in the report match the sales figure in Xero or QuickBooks for closed months, within a stated tolerance.</li>
          </ul>
          <ForYourDataPerson title="The tie-out check in SQL">
          <pre>{`-- Postgres syntax. Returns a row only when the report and ledger disagree.
select r.month, r.net_sales as report_sales, a.net_sales as ledger_sales
from report_monthly_sales as r
join ledger_monthly_sales as a on a.month = r.month
where r.month = date_trunc('month', current_date - interval '1 month')
  and abs(r.net_sales - a.net_sales) > 100;   -- tolerance in pounds`}</pre>
            <p>The query compares last month&rsquo;s figure in the report with the ledger and returns a row only when they differ by more than £100. Schedule it after each refresh. The six checks in <a href="/insights/is-our-data-reliable">how to know your data is reliable</a> extend this once the setup grows.</p>
          </ForYourDataPerson>
        </section>

        <section id="not-yet">
          <h2>What reporting tools should a small business not buy yet?</h2>
          <p>Each of these solves a real problem that small businesses rarely have yet:</p>
          <ul>
            <li><strong>A customer data platform</strong>: built for marketing teams activating audiences across channels, not for weekly reporting.</li>
            <li><strong>Real-time streaming</strong>: a daily refresh answers the questions a small team acts on.</li>
            <li><strong>An orchestration tool</strong>: connector schedules and a scheduled refresh are enough until you have chains of dependent jobs.</li>
            <li><strong>A data catalogue</strong>: a one-page definitions document does the same job for ten metrics.</li>
            <li><strong>An AI analytics layer</strong>: it answers questions from your data, so it inherits every undefined metric and duplicate customer underneath.</li>
          </ul>
          <p>Each tool adds a licence, a login and something to maintain. Add one when a named problem needs it.</p>
        </section>

        <section id="example">
          <h2>Worked example: automating weekly reporting for an online retailer</h2>
          <Example setting="UK online retailer · Shopify, Xero, Google Ads, Meta Ads" title="From a Monday morning rebuild to a report that refreshes at 6am">
            <p>The operations manager spends about three hours every Monday exporting Shopify orders, Xero invoices and ad spend from two platforms, then building a sales, margin and return-on-ad-spend summary in Excel.</p>
            <ol>
              <li>Inventory: four sources, one report, about 150 hours a year. Because the report joins four systems, it goes straight to stage 2.</li>
              <li>A managed connector syncs Shopify, Xero and both ad platforms into BigQuery nightly.</li>
              <li>Four SQL views define net sales, gross margin, ad spend and return on ad spend once.</li>
              <li>A Power BI report reads the views and refreshes at 6am. The three checks show green or red at the top of the page.</li>
              <li>The manager spends about an hour a week reviewing exceptions and adding commentary.</li>
            </ol>
            <p>The rebuild drops from three hours a week to one hour of review, and the report no longer depends on the manager being in on Monday.</p>
          </Example>
        </section>

        <section id="wrong">
          <h2>Common mistakes when automating small-business reporting</h2>
          <ul>
            <li>Starting with the most impressive dashboard instead of the most-rebuilt report.</li>
            <li>Buying a warehouse for one source that a native connector can read.</li>
            <li>Letting each report define sales or margin its own way.</li>
            <li>Automating without checks, so a stopped connector goes unnoticed for weeks.</li>
            <li>Having no named owner, so nobody fixes the first failure and trust drains away.</li>
            <li>Comparing licence costs only, and ignoring the hours spent rebuilding by hand.</li>
          </ul>
        </section>

        <section id="boundary">
          <h2>When you need more than a small reporting setup</h2>
          <p>This setup covers most small businesses for a long time. You need more when reporting becomes a system that several teams depend on daily:</p>
          <SystemBoundary
            conditions={[
              "More than one team relies on the numbers every day, and they disagree on definitions.",
              "The owner of the setup spends more than a day a week keeping it running.",
              "You need customer-level history or identity matching across systems.",
              "Investors or lenders want monthly packs that tie to the accounts and can be audited.",
              "Nobody inside the business can fix it when a connector or model breaks.",
            ]}
          />
          <p>At that point the question is who should run it. <a href="/insights/when-to-hire-a-data-team">When to hire a data team</a> covers the options, from a first hire to an embedded team.</p>
        </section>

        <section id="decision">
          <h2>Which reporting setup fits your business?</h2>
          <div className="in-table-wrap"><table>
            <thead><tr><th>Your situation</th><th>Setup</th><th>Owner time</th></tr></thead>
            <tbody>
              <tr><td>One or two systems, weekly or monthly questions</td><td>Native connectors into Power BI, Excel or Looker Studio</td><td>About an hour a month</td></tr>
              <tr><td>Data arrives as files from branches or partners</td><td>Power Query combining a folder of files</td><td>An hour after each delivery</td></tr>
              <tr><td>Three or more systems joined, or history needed</td><td>Managed connector, small warehouse, SQL views, one report</td><td>A few hours a month</td></tr>
              <tr><td>Several teams, daily decisions, disputed definitions</td><td>A modelled warehouse with tests and an owner</td><td>A part-time role or embedded support</td></tr>
            </tbody>
          </table></div>
          <p>Owner times are estimates for a setup that is already built and stable, not measured figures.</p>
          <p>Work out the hours your manual reporting costs with the <a href="/resources/reporting-automation-map">reporting automation map</a>, and write each metric down once in the <a href="/resources/kpi-dictionary-template">KPI dictionary template</a>. Compare a hire, a fractional team and a one-off project with the <a href="/resources/hire-vs-fractional-data-team-cost">cost calculator</a>. To have the setup built and handed over, see <a href="/services/data-projects">our reporting set-up projects</a>, or browse <a href="/work">dashboards we have built</a>.</p>
          <p>Online retailers should also read <a href="/insights/shopify-payouts-xero-ga4-revenue">why Shopify, payouts, Xero and GA4 don&rsquo;t match</a>, and anyone buying Power BI should check <a href="/insights/power-bi-licensing-small-business">which licence you need</a>.</p>
        </section>
      </ArticleLayout>
    </PageShell>
  );
}
