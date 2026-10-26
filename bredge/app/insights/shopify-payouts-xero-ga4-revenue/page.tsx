import { PageShell } from "../../../components/site/PageShell";
import { ArticleLayout, TryThisFirst, SystemBoundary, Diagram, Example, Pull, ForYourDataPerson } from "../../../components/insights/Article";
import { insightMetadata } from "../../../lib/insights";

const SLUG = "shopify-payouts-xero-ga4-revenue";
const TOC = [
  { id: "why", label: "Why the four numbers differ" },
  { id: "shopify", label: "Gross, net and total sales" },
  { id: "payouts", label: "Why payouts are lower" },
  { id: "xero", label: "What Xero shows" },
  { id: "ga4", label: "Why GA4 is lower" },
  { id: "bridge", label: "Build one monthly bridge" },
  { id: "example", label: "Worked example: one month" },
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
            title="Four systems, four revenue numbers, one bridge"
            caption="Shopify counts orders, payouts are cash after deductions and timing, Xero holds what your integration posts, and GA4 counts tracked purchases. Each answers a different question."
          >
            <svg viewBox="0 0 720 220" xmlns="http://www.w3.org/2000/svg" style={F} fontSize="11" fill="#2c3a36" textAnchor="middle">
              <defs><marker id="sp-a" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9 z" fill="rgba(20,35,33,.55)" /></marker></defs>
              {[["Shopify", "orders: net sales"], ["Payouts", "cash after fees, refunds"], ["Xero", "what the app posts"], ["GA4", "tracked purchases"]].map(([n, d], i) => (
                <g key={n}>
                  <rect x="20" y={14 + i * 50} width="210" height="38" rx="4" fill="#fff" stroke="rgba(20,35,33,.35)" />
                  <text x="125" y={30 + i * 50}>{n}</text><text x="125" y={45 + i * 50} fill="#7a847f" fontSize="10">{d}</text>
                  <line x1="230" y1={33 + i * 50} x2="406" y2="110" stroke="#f0bf6c" strokeWidth="1.4" markerEnd="url(#sp-a)" />
                </g>
              ))}
              <rect x="410" y="80" width="290" height="60" rx="4" fill="rgba(144,210,111,.14)" stroke="#90d26f" strokeWidth="1.6" />
              <text x="555" y="106">one reported revenue figure</text><text x="555" y="124" fill="#3c6b43">plus a bridge to each system</text>
            </svg>
          </Diagram>
        }
      >
        <section id="why">
          <h2>Why don&rsquo;t Shopify sales, payouts, Xero and GA4 match?</h2>
          <p>Because each measures something different. Shopify reports the orders you took. Shopify Payments payouts are the cash that reaches your bank after fees, refunds, chargebacks and holds, on a delay. Xero shows whatever your Shopify integration posts to it. GA4 counts purchases its tracking tag recorded. None of them is wrong; they answer four different questions.</p>
          <p>The fix is to choose one figure as reported revenue, usually Shopify net sales tied to the sales in Xero, and build a monthly bridge that explains the gap to payouts and to GA4.</p>
          <Pull>Payouts reconcile your cash. Shopify and Xero report your sales. GA4 explains your channels.</Pull>
        </section>

        <section id="shopify">
          <h2>Shopify gross sales vs net sales vs total sales</h2>
          <p>Shopify&rsquo;s sales report uses three headline figures, defined in its help centre:</p>
          <ul>
            <li><strong>Gross sales</strong>: product price multiplied by quantity, before taxes, shipping, discounts and sales reversals such as returns.</li>
            <li><strong>Net sales</strong>: gross sales minus discounts and sales reversals.</li>
            <li><strong>Total sales</strong>: net sales plus taxes, duties, shipping and fees.</li>
          </ul>
          <p>Most businesses report net sales, sometimes adding shipping income. Write down which one you use.</p>
        </section>

        <section id="payouts">
          <h2>Why is my Shopify payout less than my sales?</h2>
          <p>Shopify&rsquo;s help centre lists the reasons a payout is lower than expected:</p>
          <ul>
            <li><strong>Fees</strong>: payment processing fees are deducted before payout.</li>
            <li><strong>Refunds</strong>: deducted from your next available payout.</li>
            <li><strong>Chargebacks</strong>: the disputed amount plus a dispute fee.</li>
            <li><strong>Reserves and holds</strong>: part of your balance can be held back.</li>
            <li><strong>Adjustments</strong>: negative balances, currency conversion and taxes on fees.</li>
            <li><strong>Timing</strong>: payouts arrive after a settlement period, and weekends and holidays do not count toward it, so the last days of a month&rsquo;s sales are paid out in the next month.</li>
          </ul>
          <p>Orders paid through other gateways, such as PayPal, are not in Shopify Payments payouts at all.</p>
        </section>

        <section id="xero">
          <h2>What does Xero show for Shopify sales?</h2>
          <p>Xero shows what your integration posts. Xero&rsquo;s own Shopify integration, listed in the Xero App Store, can post a daily summary or individual sales and match Shopify Payments payouts to bank transactions. Other apps work differently. Check three settings: whether sales are posted as summaries or orders, whether amounts include tax and shipping, and whether fees are posted as expenses or netted off.</p>
        </section>

        <section id="ga4">
          <h2>Why is GA4 revenue lower than Shopify?</h2>
          <p>GA4 only records a purchase if its tag fired and the visitor&rsquo;s choices allowed it. Shopify records every order. Two points from Google&rsquo;s own documentation:</p>
          <ul>
            <li><strong>Consent</strong>: GA4&rsquo;s behavioural modelling estimates users and sessions for visitors who decline analytics cookies, but Google states modelling is not applied to event counts, so declined purchases are not filled in.</li>
            <li><strong>Thresholds</strong>: GA4 can withhold data in reports when thresholds apply, and you cannot change them.</li>
          </ul>
          <p>The value GA4 records also depends on how your purchase tag is set up, for example whether it sends values including tax and shipping. Use GA4 for channel mix and conversion rates, and track whether its gap to Shopify is stable rather than trying to close it.</p>
        </section>

        <section id="bridge">
          <h2>How to reconcile Shopify, payouts, Xero and GA4 each month</h2>
          <p>Start from your reported figure and explain every other number from it:</p>
          <TryThisFirst title="A monthly revenue bridge">
            <ol>
              <li>Export Shopify net sales for the month from the sales report.</li>
              <li>Compare with sales posted in Xero for the same month. The difference should be zero or a known timing item.</li>
              <li>From Shopify net sales, subtract orders paid through other gateways, add tax and shipping if your payouts include them, subtract fees, refunds paid out and chargebacks, and adjust for sales settled next month. The result should equal the month&rsquo;s payouts.</li>
              <li>Record GA4 purchase revenue and its percentage of Shopify net sales. Investigate only if the percentage moves.</li>
            </ol>
          </TryThisFirst>
          <ForYourDataPerson title="Sources for each bridge line">
            <ul>
              <li><strong>Sales definitions</strong>: Shopify&rsquo;s <a href="https://help.shopify.com/en/manual/reports-and-analytics/shopify-reports/report-types/default-reports/sales-report" target="_blank" rel="noopener noreferrer">sales report</a> documentation.</li>
              <li><strong>Payout deductions</strong>: <a href="https://help.shopify.com/en/manual/payments/shopify-payments/payouts/lower-or-missing-payouts" target="_blank" rel="noopener noreferrer">lower or missing payouts</a>; settlement periods in <a href="https://help.shopify.com/en/manual/payments/shopify-payments/payouts/payout-timing" target="_blank" rel="noopener noreferrer">payout timing</a>.</li>
              <li><strong>Payout detail</strong>: each payout&rsquo;s transactions (charges, refunds, adjustments, fees) are listed in Shopify Payments; export them for the month and sum by type to fill each bridge line.</li>
              <li><strong>GA4</strong>: Google&rsquo;s definitions of <a href="https://support.google.com/analytics/answer/9143382" target="_blank" rel="noopener noreferrer">purchase revenue</a>, <a href="https://support.google.com/analytics/answer/11161109" target="_blank" rel="noopener noreferrer">consent modelling</a> and <a href="https://support.google.com/analytics/answer/9383630" target="_blank" rel="noopener noreferrer">data thresholds</a>.</li>
              <li><strong>Automation</strong>: once the bridge works by hand, load Shopify orders, payout transactions and Xero journals into a small database and calculate each line in SQL; see <a href="/insights/first-reporting-stack">how to automate reporting without a data team</a>.</li>
            </ul>
          </ForYourDataPerson>
        </section>

        <section id="example">
          <h2>Worked example: one month of Shopify, payouts, Xero and GA4</h2>
          <Example setting="UK online retailer · Shopify, Shopify Payments, Xero, GA4" title="£100,000 of net sales, explained four ways">
            <div className="in-table-wrap"><table>
              <thead><tr><th>Line</th><th>Amount</th></tr></thead>
              <tbody>
                <tr><td>Shopify net sales</td><td>£100,000</td></tr>
                <tr><td>Plus VAT and shipping collected</td><td>£22,000</td></tr>
                <tr><td>Less orders paid through PayPal</td><td>−£9,000</td></tr>
                <tr><td>Less processing fees</td><td>−£2,400</td></tr>
                <tr><td>Less refunds paid out</td><td>−£3,100</td></tr>
                <tr><td>Less chargebacks and dispute fees</td><td>−£300</td></tr>
                <tr><td>Less sales settled next month</td><td>−£4,200</td></tr>
                <tr><td>Plus last month&rsquo;s sales settled this month</td><td>£3,800</td></tr>
                <tr><td>Shopify Payments payouts received</td><td>£106,800</td></tr>
              </tbody>
            </table></div>
            <p>Xero shows £100,000 of sales, matching Shopify. GA4 shows purchase revenue equal to 88% of Shopify net sales, in line with previous months, so nothing needs investigating.</p>
          </Example>
        </section>

        <section id="wrong">
          <h2>Common Shopify reconciliation mistakes</h2>
          <ul>
            <li>Reporting payouts as revenue.</li>
            <li>Using GA4 revenue in the management accounts.</li>
            <li>Comparing a calendar month of sales with a calendar month of payouts without the timing lines.</li>
            <li>Forgetting orders paid through other gateways.</li>
            <li>Not knowing whether Xero entries include VAT and shipping.</li>
          </ul>
        </section>

        <section id="boundary">
          <h2>When to automate the Shopify revenue bridge</h2>
          <SystemBoundary
            conditions={[
              "The bridge takes more than a few hours each month.",
              "You sell through several channels or payment gateways.",
              "Month-end or VAT returns are delayed while differences are chased.",
              "Marketing decisions rely on GA4 numbers nobody has compared with Shopify.",
              "You need the bridge weekly, not monthly.",
            ]}
          />
        </section>

        <section id="decision">
          <h2>Which revenue number answers which question?</h2>
          <div className="in-table-wrap"><table>
            <thead><tr><th>Question</th><th>Use</th></tr></thead>
            <tbody>
              <tr><td>How much did we sell?</td><td>Shopify net sales, tied to Xero</td></tr>
              <tr><td>How much cash came in?</td><td>Payouts, reconciled to the bank</td></tr>
              <tr><td>What does the P&amp;L show?</td><td>Xero</td></tr>
              <tr><td>Which channels drive sales?</td><td>GA4, as a share of Shopify</td></tr>
            </tbody>
          </table></div>
          <p>The same method for any set of systems is in <a href="/insights/why-dashboards-disagree">why Finance and Sales numbers don&rsquo;t match</a>, and the <a href="/resources/revenue-reconciliation-checklist">revenue reconciliation workbench</a> records each line. Write your definitions down in the <a href="/resources/kpi-dictionary-template">KPI dictionary template</a>. To have the bridge built and run every month, see <a href="/services/data-projects">our reporting set-up projects</a>.</p>
        </section>
      </ArticleLayout>
    </PageShell>
  );
}
