import { PageShell } from "../../../components/site/PageShell";
import { ArticleLayout, TryThisFirst, SystemBoundary, Diagram, Example, Pull, PlainEnglish, ForTheBusiness, ForYourDataPerson } from "../../../components/insights/Article";
import { insightMetadata } from "../../../lib/insights";

const SLUG = "crm-closed-won-vs-stripe";
const TOC = [
  { id: "why", label: "Why closed-won and billing differ" },
  { id: "try-first", label: "Match one quarter by hand" },
  { id: "causes", label: "The five usual causes" },
  { id: "link", label: "Link deals to subscriptions" },
  { id: "bridge", label: "The deal-to-billing bridge" },
  { id: "example", label: "Worked example: one quarter" },
  { id: "wrong", label: "Common mistakes" },
  { id: "boundary", label: "When to automate it" },
  { id: "decision", label: "Which number for which question" },
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
            title="From deals closed to new billing: a bridge, not a debate"
            caption="Illustrative. Each step between closed-won value and new billing in Stripe is a list of deals with a reason."
          >
            <svg viewBox="0 0 720 210" xmlns="http://www.w3.org/2000/svg" style={F} fontSize="11" fill="#2c3a36" textAnchor="middle">
              <line x1="20" y1="180" x2="700" y2="180" stroke="rgba(20,35,33,.3)" />
              {[["closed won", 30, 40, 140, "#fff"], ["not yet billed", 150, 40, 30, "rgba(240,191,108,.45)"], ["value differences", 270, 70, 14, "rgba(240,191,108,.45)"], ["never billed", 390, 84, 10, "rgba(240,191,108,.45)"], ["billed outside Stripe", 510, 94, 8, "rgba(240,191,108,.45)"], ["new billing", 620, 102, 78, "rgba(144,210,111,.3)"]].map(([n, x, y, h, f]) => (
                <g key={n as string}>
                  <rect x={x as number} y={y as number} width="80" height={h as number} fill={f as string} stroke="rgba(20,35,33,.35)" />
                  <text x={(x as number) + 40} y="198" fontSize="10">{n}</text>
                </g>
              ))}
            </svg>
          </Diagram>
        }
      >
        <section id="why">
          <h2>Why doesn&rsquo;t HubSpot closed-won revenue match Stripe billing?</h2>
          <p>A closed-won deal in HubSpot records an amount someone agreed, on the date the deal closed. Stripe bills subscription prices on billing dates, after start delays, discounts and changes. The two systems measure different events, so their totals differ even when every record is correct. The useful question is not which is right, but whether every difference has a reason.</p>
          <PlainEnglish>
            <p>Sales celebrates deals when they are signed. Finance counts money when it is billed. Between the two there are delays, discounts and deals that fall through. Link each deal to the subscription it became, and you can explain the gap every month, measure how long deals take to start billing, and stop arguments about whose number is right.</p>
            <ul>
              <li><strong>Ask your team</strong>: what share of last quarter&rsquo;s closed-won deals have a matching Stripe subscription, and how many days after closing did billing start?</li>
              <li><strong>Expect back</strong>: a monthly bridge from closed-won value to new billing, with a list of deals behind each line.</li>
            </ul>
          </PlainEnglish>
        </section>

        <section id="try-first">
          <h2>How to compare closed-won deals with Stripe for one quarter</h2>
          <ForTheBusiness>Matching one quarter by hand shows how big the gap is and which cause dominates.</ForTheBusiness>
          <TryThisFirst title="A one-quarter match">
            <ol>
              <li>Export closed-won deals for the quarter from HubSpot with deal ID, company, amount and close date.</li>
              <li>Export Stripe subscriptions created from the start of the quarter to a month after its end, with customer, price and start date.</li>
              <li>Match each deal to a subscription, by a shared ID if you have one, otherwise by company.</li>
              <li>For each deal, record: matched or not, days from close to first invoice, and the difference between deal amount and annualised subscription value.</li>
              <li>Classify each unmatched or different deal using the causes below.</li>
            </ol>
          </TryThisFirst>
        </section>

        <section id="causes">
          <h2>Why closed-won is higher than billed revenue: five causes</h2>
          <ForTheBusiness>Each cause has a different owner, so naming it tells you who fixes it.</ForTheBusiness>
          <ul>
            <li><strong>Timing</strong>: the deal closed this quarter, billing starts next quarter. Owner: nobody; report it as a lag.</li>
            <li><strong>What the amount means</strong>: reps enter total contract value, first-year value or a monthly price interchangeably. Owner: sales operations; define the field.</li>
            <li><strong>Price changes after close</strong>: discounts agreed or seats reduced before the subscription is created. Owner: sales and finance.</li>
            <li><strong>Deals that never bill</strong>: cancelled before start, or closed-won by mistake. Owner: sales operations.</li>
            <li><strong>Billing outside Stripe</strong>: enterprise contracts invoiced from the accounting system. Owner: finance; add them from a contracts table.</li>
          </ul>
          <p>HubSpot&rsquo;s default sales pipeline treats Closed won as a 100% probability stage, so it drives forecast and weighted pipeline. A wrong amount there distorts the forecast as well as the comparison.</p>
        </section>

        <section id="link">
          <h2>How to link HubSpot deals to Stripe subscriptions</h2>
          <ForTheBusiness>A shared ID makes the match automatic for every new deal, so the bridge stops needing manual work.</ForTheBusiness>
          <p>When a subscription is created for a won deal, write the HubSpot deal ID into the Stripe subscription&rsquo;s <a href="https://docs.stripe.com/metadata" target="_blank" rel="noopener noreferrer">metadata</a>, and store the Stripe subscription ID in a property on the deal. Customers should also carry each other&rsquo;s IDs; see <a href="/insights/one-customer-view">how to match customers across HubSpot, Stripe and Xero</a>. To get Stripe data into a warehouse, Stripe offers <a href="https://docs.stripe.com/data/data-pipeline" target="_blank" rel="noopener noreferrer">Data Pipeline</a> to Snowflake, BigQuery, Redshift and others, and <a href="https://docs.stripe.com/data/how-sigma-works" target="_blank" rel="noopener noreferrer">Sigma</a> for SQL inside the Stripe Dashboard; ELT connectors are the other option.</p>
        </section>

        <section id="bridge">
          <h2>How to build a deal-to-billing bridge</h2>
          <ForTheBusiness>The bridge turns two competing numbers into one explained story the board can follow.</ForTheBusiness>
          <p>Each month: closed-won value, minus deals not yet billed, plus or minus value differences on billed deals, minus deals that will never bill, plus contracts billed outside Stripe, equals new annualised billing. Track the median days from close to first invoice alongside it.</p>
          <ForYourDataPerson title="The deal-to-billing match in SQL (Snowflake)">
            <p>This assumes three staging models built from your HubSpot and Stripe data: <code>stg_hubspot__deals</code> (deal_id, amount, close_date, is_closed_won), <code>stg_stripe__subscriptions</code> (subscription_id, hubspot_deal_id from metadata, annual_value) and <code>stg_stripe__invoices</code> (subscription_id, invoice_date). Amounts are annualised recurring values in one currency.</p>
            <pre>{`with deals as (
    select deal_id, amount, close_date
    from stg_hubspot__deals
    where is_closed_won
      and close_date >= '2026-07-01' and close_date < '2026-10-01'
),
first_invoice as (
    select subscription_id, min(invoice_date) as first_invoice_date
    from stg_stripe__invoices
    group by subscription_id
),
matched as (
    select
        d.deal_id,
        d.amount                        as deal_amount,
        d.close_date,
        s.subscription_id,
        s.annual_value                  as billed_annual_value,
        fi.first_invoice_date
    from deals as d
    left join stg_stripe__subscriptions as s on s.hubspot_deal_id = d.deal_id
    left join first_invoice as fi on fi.subscription_id = s.subscription_id
)
select
    case
        when subscription_id is null    then 'no subscription'
        when first_invoice_date is null then 'not yet billed'
        when billed_annual_value <> deal_amount then 'value differs'
        else 'matched'
    end                                            as bridge_line,
    count(*)                                       as deals,
    sum(deal_amount)                               as deal_amount,
    sum(billed_annual_value)                       as billed_annual_value,
    median(datediff('day', close_date, first_invoice_date)) as median_days_to_bill
from matched
group by bridge_line
order by bridge_line;`}</pre>
            <p>If one deal maps to several subscriptions, aggregate subscriptions per deal before the join, or the deal amount is counted twice. Deals in the &ldquo;no subscription&rdquo; line need a reason: not started, cancelled, or billed outside Stripe.</p>
          </ForYourDataPerson>
          <Pull>Closed-won is a sales event. Billing is a finance event. The bridge is the time and the decisions between them.</Pull>
        </section>

        <section id="example">
          <h2>Worked example: one quarter of closed-won vs billed</h2>
          <Example setting="UK SaaS · HubSpot, Stripe, Xero" title="£480,000 closed, £396,000 billing">
            <div className="in-table-wrap"><table>
              <thead><tr><th>Line</th><th>Annual value</th></tr></thead>
              <tbody>
                <tr><td>Closed won in the quarter</td><td>£480,000</td></tr>
                <tr><td>Less deals not yet billed (start dates next quarter)</td><td>−£62,000</td></tr>
                <tr><td>Less amounts entered as two-year contract value</td><td>−£40,000</td></tr>
                <tr><td>Less discounts agreed after close</td><td>−£12,000</td></tr>
                <tr><td>Less one deal cancelled before start</td><td>−£18,000</td></tr>
                <tr><td>Plus an enterprise contract invoiced from Xero</td><td>£48,000</td></tr>
                <tr><td>New annualised billing</td><td>£396,000</td></tr>
              </tbody>
            </table></div>
            <p>Two fixes follow: the deal amount is redefined as first-year recurring value, and the enterprise contract is added to a contracts table so it counts in ARR.</p>
          </Example>
        </section>

        <section id="wrong">
          <h2>Common closed-won vs billing mistakes</h2>
          <ul>
            <li>Reporting closed-won as revenue in the board pack.</li>
            <li>Leaving the deal amount undefined, so each rep enters something different.</li>
            <li>Matching deals to Stripe on company name.</li>
            <li>Ignoring contracts billed outside Stripe.</li>
            <li>Measuring sales performance on bookings that never bill.</li>
          </ul>
        </section>

        <section id="boundary">
          <h2>When to automate the deal-to-billing bridge</h2>
          <SystemBoundary
            conditions={[
              "Commission is paid on closed-won and finance disputes the amounts.",
              "The board sees bookings and billing that do not reconcile.",
              "Deals and subscriptions share no ID, so matching is manual.",
              "Some contracts are billed outside Stripe.",
              "A fundraise needs pipeline-to-revenue evidence.",
            ]}
          />
        </section>

        <section id="decision">
          <h2>Which number answers which question?</h2>
          <div className="in-table-wrap"><table>
            <thead><tr><th>Question</th><th>Use</th></tr></thead>
            <tbody>
              <tr><td>How much did sales sign?</td><td>Closed-won value, with a written definition</td></tr>
              <tr><td>How much recurring revenue did we add?</td><td>New ARR from subscriptions and contracts</td></tr>
              <tr><td>How quickly do deals start paying?</td><td>Days from close to first invoice</td></tr>
              <tr><td>What did we earn?</td><td>Recognised revenue in the ledger</td></tr>
            </tbody>
          </table></div>
          <p>For the ARR side, see <a href="/insights/investor-ready-arr">how to calculate ARR for investors</a> and <a href="/insights/saas-metrics-from-stripe">how to calculate MRR from Stripe</a>. Record each difference with the <a href="/resources/revenue-reconciliation-checklist">revenue reconciliation workbench</a>. To have the bridge built and run every month without a full-time hire, see <a href="/services/embedded-data-team">how an embedded data team works</a>.</p>
          <p>The <a href="/resources/arr-bridge-cohort-builder">ARR bridge and cohort table builder</a> covers the billing side of the bridge.</p>
        </section>
      </ArticleLayout>
    </PageShell>
  );
}
