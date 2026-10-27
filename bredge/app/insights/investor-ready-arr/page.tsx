import { PageShell } from "../../../components/site/PageShell";
import { ArticleLayout, TryThisFirst, SystemBoundary, Diagram, Example, Pull, PlainEnglish, ForTheBusiness, ForYourDataPerson } from "../../../components/insights/Article";
import { insightMetadata } from "../../../lib/insights";

const SLUG = "investor-ready-arr";
const TOC = [
  { id: "why", label: "Why ARR fails diligence" },
  { id: "try-first", label: "The evidence pack" },
  { id: "definitions", label: "Definitions to write down" },
  { id: "table", label: "The customer-by-month ARR table" },
  { id: "bridge", label: "The ARR bridge" },
  { id: "cohorts", label: "Cohort retention tables" },
  { id: "revenue", label: "Reconciling ARR to revenue" },
  { id: "example", label: "Worked example: one quarter" },
  { id: "wrong", label: "Common ARR mistakes" },
  { id: "boundary", label: "When to get help" },
  { id: "decision", label: "What investors ask for" },
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
            title="An ARR bridge: opening to closing ARR, every line tied to customers"
            caption="Illustrative. Each movement is the sum of customer-level changes from the customer-by-month table, so every figure can be traced to named customers."
          >
            <svg viewBox="0 0 720 230" xmlns="http://www.w3.org/2000/svg" style={F} fontSize="11" fill="#2c3a36" textAnchor="middle">
              <line x1="20" y1="190" x2="700" y2="190" stroke="rgba(20,35,33,.3)" />
              {[["opening", 20, 90, 100, "#fff"], ["new", 120, 70, 20, "rgba(144,210,111,.4)"], ["expansion", 220, 58, 12, "rgba(144,210,111,.4)"], ["reactivation", 320, 54, 4, "rgba(144,210,111,.4)"], ["contraction", 420, 54, 8, "rgba(240,191,108,.45)"], ["churn", 520, 62, 14, "rgba(240,191,108,.45)"], ["closing", 620, 76, 114, "#fff"]].map(([n, x, y, h, f]) => (
                <g key={n as string}>
                  <rect x={(x as number) + 10} y={n === "opening" || n === "closing" ? 190 - (h as number) : (y as number)} width="70" height={h as number} fill={f as string} stroke="rgba(20,35,33,.35)" />
                  <text x={(x as number) + 45} y="208">{n}</text>
                </g>
              ))}
            </svg>
          </Diagram>
        }
      >
        <section id="why">
          <h2>Why does ARR fall apart in due diligence?</h2>
          <p>Annual recurring revenue (ARR) is not defined by IFRS or US GAAP. It is an operating metric each company defines for itself, so in a raise or a sale, investors rebuild it from your contracts, billing and recognised revenue. If their number and yours differ, or nobody can say why ARR moved, the conversation moves from growth to trust.</p>
          <PlainEnglish>
            <p>ARR is the yearly value of the recurring contracts you have on a given day. Investors will recalculate it themselves. To make that quick and painless, have four things ready: written definitions, a table of every customer&rsquo;s ARR for every month, a bridge explaining each month&rsquo;s change, and retention by customer cohort. Then show how ARR relates to the revenue in your accounts.</p>
            <ul>
              <li><strong>Ask your team</strong>: if an investor asked for ARR by customer by month for the last 24 months, how long would it take, and would it tie to our board pack?</li>
              <li><strong>Expect back</strong>: the four items above, rebuilt from source data, with differences to past board figures explained.</li>
            </ul>
          </PlainEnglish>
          <Pull>Investors will rebuild your ARR. The only question is whether their number matches yours.</Pull>
          <p>A common error, noted by Baker Tilly among others, is deriving ARR from monthly recognised revenue. Revenue recognition spreads, defers and adjusts amounts for accounting purposes, which distorts a measure of contracted recurring value.</p>
        </section>

        <section id="try-first">
          <h2>What evidence do investors ask for on ARR?</h2>
          <ForTheBusiness>Preparing this before diligence shortens it, and stops figures being rebuilt under time pressure.</ForTheBusiness>
          <TryThisFirst title="The ARR evidence pack">
            <ol>
              <li>A one-page definitions document: ARR, MRR, new, expansion, contraction, churn, reactivation, logo churn and revenue churn.</li>
              <li>A customer-by-month ARR table for at least 24 months, with zero rows for months without ARR.</li>
              <li>A monthly ARR bridge built from that table.</li>
              <li>Cohort tables for revenue retention and logo retention.</li>
              <li>A quarterly reconciliation of ARR to recognised subscription revenue.</li>
              <li>A sample of contracts traced through to invoices and cash.</li>
            </ol>
          </TryThisFirst>
        </section>

        <section id="definitions">
          <h2>ARR definitions to write down before diligence</h2>
          <ForTheBusiness>Written definitions are what make your numbers comparable with an investor&rsquo;s rebuild.</ForTheBusiness>
          <ul>
            <li><strong>ARR</strong>: the annualised value of active recurring subscriptions or contracts at the end of a month, after recurring discounts, excluding one-off fees, usage, taxes and services.</li>
            <li><strong>Active</strong>: from the contract or subscription start date, not the signature date, until it ends.</li>
            <li><strong>Churn date</strong>: the date recurring value ends, not the date the customer gives notice. Track notices separately as scheduled churn.</li>
            <li><strong>Logo churn and revenue churn</strong>: logo churn counts customers that reach zero ARR; revenue churn sums the ARR lost from churn and contraction.</li>
            <li><strong>Currency</strong>: the rate used, and whether growth is reported at constant currency.</li>
            <li><strong>Usage and hybrid pricing</strong>: whether committed minimums count as ARR and usage above them does not.</li>
          </ul>
          <p>In public filings, the SEC&rsquo;s 2020 guidance on key performance indicators expects a clear definition of each metric, how it is calculated and why it is useful. Private companies are not bound by it, but it is a sound standard to write to.</p>
        </section>

        <section id="table">
          <h2>The customer-by-month ARR table</h2>
          <ForTheBusiness>This one table is what every other investor metric is calculated from, so its accuracy decides theirs.</ForTheBusiness>
          <p>One row per customer per month, with the customer&rsquo;s ARR at month end, including months where ARR is zero. Build it from subscription or contract data, as described in <a href="/insights/saas-metrics-from-stripe">how to calculate MRR from Stripe</a>; for subscriptions, ARR is month-end MRR multiplied by 12. Add contracts billed outside Stripe from a contracts table. Customers must be resolved to one ID across billing and CRM; see <a href="/insights/one-customer-view">how to match customers across HubSpot, Stripe and Xero</a>.</p>
        </section>

        <section id="bridge">
          <h2>How to build an ARR bridge</h2>
          <ForTheBusiness>The bridge shows whether growth comes from new customers or existing ones, which drives valuation.</ForTheBusiness>
          <p>The bridge starts with opening ARR, adds new, expansion and reactivation, subtracts contraction and churn, and ends at closing ARR. Each line is a sum of customer-level changes, and the bridge must add up exactly. The movement logic is the same as the MRR movements query in <a href="/insights/saas-metrics-from-stripe">the Stripe MRR guide</a>, run on ARR.</p>
        </section>

        <section id="cohorts">
          <h2>How to build cohort retention tables for investors</h2>
          <ForTheBusiness>Cohort tables show whether customers stay and grow, which is the strongest evidence of product value.</ForTheBusiness>
          <p>A cohort is the group of customers whose ARR started in the same month. For each later month, show the share of the cohort&rsquo;s starting ARR still active (revenue retention, which includes expansion and can exceed 100%) and the share of customers still active (logo retention).</p>
          <ForYourDataPerson title="Cohort retention in SQL (Snowflake)">
            <p>This reads a zero-filled table, <code>customer_arr_monthly</code>, with one row per customer per month and columns <code>customer_id</code>, <code>month</code> and <code>arr</code>:</p>
            <pre>{`with firsts as (
    select customer_id, min(month) as cohort_month
    from customer_arr_monthly
    where arr > 0
    group by customer_id
),
base as (
    select
        f.cohort_month,
        datediff('month', f.cohort_month, c.month) as months_since_start,
        c.customer_id,
        c.arr
    from customer_arr_monthly as c
    join firsts as f on f.customer_id = c.customer_id
    where c.month >= f.cohort_month
),
starts as (
    select cohort_month,
           sum(arr) as starting_arr,
           count(*) as starting_customers
    from base
    where months_since_start = 0
    group by cohort_month
)
select
    b.cohort_month,
    b.months_since_start,
    sum(b.arr) / s.starting_arr                  as revenue_retention,
    count_if(b.arr > 0) / s.starting_customers   as logo_retention
from base as b
join starts as s on s.cohort_month = b.cohort_month
group by b.cohort_month, b.months_since_start, s.starting_arr, s.starting_customers
order by b.cohort_month, b.months_since_start;`}</pre>
            <p>Pivot the result with cohorts as rows and months since start as columns. Net revenue retention for a year is the value at <code>months_since_start = 12</code>; state whether you report it per cohort or as a weighted average across cohorts.</p>
          </ForYourDataPerson>
        </section>

        <section id="revenue">
          <h2>How to reconcile ARR to recognised revenue</h2>
          <ForTheBusiness>This reconciliation is how investors check that ARR is real, so having it ready removes the biggest doubt.</ForTheBusiness>
          <p>Revenue is recognised under IFRS 15 or ASC 606 as you deliver the service. For a quarter, ARR divided by 12 and summed over the months should be close to recognised subscription revenue. The usual reconciling items:</p>
          <ul>
            <li><strong>Timing</strong>: subscriptions starting or ending mid-month.</li>
            <li><strong>One-off fees and services</strong>: revenue, but not ARR.</li>
            <li><strong>Usage</strong>: revenue, but usually outside ARR.</li>
            <li><strong>Discounts and credit notes</strong>: treated differently in each.</li>
            <li><strong>Currency</strong>: different rates for ARR and the ledger.</li>
          </ul>
          <p>Each item should be a calculated figure with a list of customers behind it, as in <a href="/insights/why-dashboards-disagree">why Finance and Sales numbers don&rsquo;t match</a>.</p>
        </section>

        <section id="example">
          <h2>Worked example: one quarter&rsquo;s ARR and revenue</h2>
          <Example setting="UK SaaS · Stripe, HubSpot, Xero" title="Why ARR rose more than revenue">
            <p>ARR rose from £2.40m to £2.70m over the quarter. Recognised subscription revenue was £630,000, against £637,500 if ARR had been flat at its average (£2.55m ÷ 12 × 3).</p>
            <ul>
              <li><strong>Timing, −£15,000</strong>: most of the £300,000 increase came from contracts that started in the last fortnight, so an estimate based on average ARR overstates what could be recognised in the quarter.</li>
              <li><strong>One-off fees, +£12,000</strong>: implementation fees are revenue but not ARR.</li>
              <li><strong>Credit notes, −£4,500</strong>: credits for an outage reduced revenue without changing ARR.</li>
            </ul>
            <p>The three items explain the full £7,500 difference. Each has a customer list behind it, so an investor can tick it off rather than question it.</p>
          </Example>
        </section>

        <section id="wrong">
          <h2>Common ARR mistakes in fundraising</h2>
          <ul>
            <li>Deriving ARR from recognised revenue or invoices.</li>
            <li>Counting signed but not yet started contracts as ARR without saying so.</li>
            <li>Including one-off fees, services or usage.</li>
            <li>Changing definitions between board packs without restating history.</li>
            <li>Calculating cohort retention without zero-filled months, which hides churn.</li>
          </ul>
        </section>

        <section id="boundary">
          <h2>When ARR preparation needs help</h2>
          <SystemBoundary
            conditions={[
              "A raise, sale or debt facility is planned in the next six months.",
              "Some revenue is billed outside Stripe or across several billing systems.",
              "Board-reported ARR has never been rebuilt from source data.",
              "Customers are not matched across CRM and billing.",
              "Nobody can explain last quarter's gap between ARR and recognised revenue.",
            ]}
          />
        </section>

        <section id="decision">
          <h2>What investors ask for, and where it comes from</h2>
          <div className="in-table-wrap"><table>
            <thead><tr><th>Request</th><th>Built from</th></tr></thead>
            <tbody>
              <tr><td>ARR by customer by month</td><td>Subscriptions and contracts, zero-filled</td></tr>
              <tr><td>ARR bridge</td><td>Month-on-month changes in that table</td></tr>
              <tr><td>Net and gross revenue retention</td><td>Cohort tables</td></tr>
              <tr><td>Logo churn</td><td>Customers reaching zero ARR</td></tr>
              <tr><td>ARR to revenue reconciliation</td><td>The ARR table and the ledger</td></tr>
              <tr><td>Contract to cash samples</td><td>Contracts, invoices and payments</td></tr>
            </tbody>
          </table></div>
          <p>Check definitions with the <a href="/resources/saas-metrics-definitions">SaaS metrics definitions and calculator</a> and record them in the <a href="/resources/kpi-dictionary-template">KPI dictionary template</a>. Pipeline-to-billing gaps are covered in <a href="/insights/crm-closed-won-vs-stripe">HubSpot closed-won vs Stripe billing</a>. To have the evidence pack built and kept current without a full-time hire, see <a href="/services/embedded-data-team">how an embedded data team works</a>.</p>
          <p>Build the bridge and cohort tables from a subscription export with the <a href="/resources/arr-bridge-cohort-builder">ARR bridge and cohort table builder</a>.</p>
        </section>
      </ArticleLayout>
    </PageShell>
  );
}
