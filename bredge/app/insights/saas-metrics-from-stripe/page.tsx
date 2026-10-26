import { PageShell } from "../../../components/site/PageShell";
import { ArticleLayout, TryThisFirst, SystemBoundary, Diagram, Example, Pull, PlainEnglish, ForTheBusiness } from "../../../components/insights/Article";
import { insightMetadata } from "../../../lib/insights";

const SLUG = "saas-metrics-from-stripe";
const TOC = [
  { id: "why", label: "Why your MRR doesn't match Stripe" },
  { id: "try-first", label: "How to reconcile MRR to Stripe" },
  { id: "definition", label: "How Stripe defines MRR" },
  { id: "edges", label: "Proration, coupons, refunds and FX" },
  { id: "movements", label: "How to calculate MRR movements" },
  { id: "board", label: "NRR, GRR and ARR for the board" },
  { id: "example", label: "Worked example: one customer, one quarter" },
  { id: "wrong", label: "Common MRR mistakes" },
  { id: "boundary", label: "When MRR needs a project" },
  { id: "decision", label: "MRR policy decisions to write down" },
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
            title="An annual plan: invoices in one month, MRR in every month"
            caption="Summing invoices puts a £12,000 annual plan into the month it was billed. MRR spreads it as £1,000 for each month the subscription is active. Illustrative."
          >
            <svg viewBox="0 0 720 230" xmlns="http://www.w3.org/2000/svg" style={F} fontSize="11" fill="#2c3a36">
              <text x="20" y="24">INVOICES SUMMED BY MONTH</text>
              <rect x="40" y="40" width="40" height="70" rx="2" fill="rgba(240,191,108,.35)" stroke="#f0bf6c" />
              <text x="60" y="34" textAnchor="middle" fill="#a9741f">£12k</text>
              {Array.from({ length: 11 }).map((_, i) => <rect key={`i${i}`} x={94 + i * 54} y="108" width="40" height="2" fill="rgba(20,35,33,.25)" />)}
              <text x="20" y="140">MRR AT EACH MONTH END</text>
              {Array.from({ length: 12 }).map((_, i) => (
                <g key={`m${i}`}>
                  <rect x={40 + i * 54} y="156" width="40" height="34" rx="2" fill="rgba(144,210,111,.3)" stroke="#90d26f" />
                  <text x={60 + i * 54} y="206" textAnchor="middle" fill="#7a847f" fontSize="10">{["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"][i]}</text>
                </g>
              ))}
              <text x="700" y="178" textAnchor="end" fill="#3c6b43">£1k each</text>
            </svg>
          </Diagram>
        }
      >
        <section id="why">
          <h2>Why doesn&rsquo;t our MRR match Stripe?</h2>
          <p>Monthly recurring revenue (MRR) is the monthly value of the subscriptions you hold at a point in time. Most in-house versions instead add up invoices or payments in a month. Those figures move with billing dates, prorations, refunds and failed payments, so they never match Stripe&rsquo;s MRR, and they jump every time an annual customer renews.</p>
          <PlainEnglish>
            <p>Monthly recurring revenue (MRR) is the monthly value of the subscriptions you hold on a given day. Adding up invoices gives a different number that jumps whenever an annual customer renews. Calculate MRR from subscriptions, write down how you treat discounts, failed payments and currencies, and explain each month&rsquo;s change as new, expansion, contraction and churn.</p>
            <ul>
              <li><strong>Ask your team</strong>: is our board MRR built from subscriptions or from invoices, and where is the policy written down?</li>
              <li><strong>Expect back</strong>: a monthly bridge from opening to closing MRR that adds up exactly.</li>
            </ul>
          </PlainEnglish>
          <p>The other gaps come from policy. Stripe makes specific choices about failed payments, trials, discounts, taxes and usage, and lets you configure some of them. Your board deck makes its own choices, often without writing them down. The fix is to calculate MRR from subscription state, decide each policy once, and reconcile to Stripe&rsquo;s reports with every difference explained.</p>
          <Pull>MRR is a snapshot of subscriptions, not a sum of invoices. Get that one decision right and most of the other differences become small and explainable.</Pull>
        </section>

        <section id="try-first">
          <h2>How to reconcile your MRR to Stripe</h2>
          <p>Stripe&rsquo;s Billing overview offers a prebuilt report, MRR per subscriber per month, that lists each subscriber&rsquo;s MRR at each month end. Compare it with your own figure customer by customer:</p>
          <TryThisFirst title="A one-month MRR reconciliation">
            <ol>
              <li>Download the MRR per subscriber per month report for one month.</li>
              <li>Export your own MRR for the same month, one row per customer.</li>
              <li>Join on the Stripe customer ID and list every customer whose figures differ.</li>
              <li>Classify each difference: billing interval, discount, trial, failed payment, cancellation timing, currency, usage, or a contract billed outside Stripe.</li>
              <li>Check time zones last. Stripe&rsquo;s prebuilt reports use UTC, while dashboard charts use your account time zone.</li>
            </ol>
          </TryThisFirst>
          <p>Each class maps to a policy decision in the sections below. A difference you can classify is a choice; a difference you can&rsquo;t is a bug.</p>
        </section>

        <section id="definition">
          <h2>How does Stripe calculate MRR?</h2>
          <ForTheBusiness>Matching Stripe&rsquo;s definition, or departing from it on purpose, is what lets investors compare your figures with Stripe&rsquo;s own.</ForTheBusiness>
          <p>Stripe&rsquo;s Billing analytics documentation defines MRR as the sum of the monthly-normalised value of all subscriptions with status <code>active</code> or <code>past_due</code>. The definition has five parts worth copying or deliberately changing:</p>
          <ul>
            <li><strong>Normalised intervals</strong>: an annual price counts as one twelfth per month, a quarterly price as one third. Stripe&rsquo;s own example: 50 subscribers on a $600 annual plan contribute $2,500 of MRR.</li>
            <li><strong>Exclusions</strong>: taxes, subscribers on free plans and metered (usage-based) products are left out.</li>
            <li><strong>Failed payments</strong>: <code>past_due</code> subscriptions still count. A subscription that becomes <code>unpaid</code> or <code>canceled</code> counts as churn.</li>
            <li><strong>Trials</strong>: items in a trial are excluded until the trial ends. With legacy subscription-level trials, the whole subscription is excluded.</li>
            <li><strong>Discounts</strong>: you choose whether recurring and one-time discounts reduce MRR. Permanent (forever) discounts are always subtracted.</li>
          </ul>
          <p>You don&rsquo;t have to adopt Stripe&rsquo;s choices. Counting <code>past_due</code> customers as live is generous if your dunning runs for weeks, for example. What matters is that the policy is written down, applied in one model, and visible to whoever reads the board pack.</p>
        </section>

        <section id="edges">
          <h2>How to handle proration, coupons, refunds, cancellations and FX in MRR</h2>
          <ForTheBusiness>These billing events are where board MRR and Stripe&rsquo;s figure usually part company.</ForTheBusiness>
          <p>Most disputes come from a handful of billing events. Each one has a clear treatment:</p>
          <div className="in-table-wrap"><table>
            <thead><tr><th>Event</th><th>Effect on MRR</th><th>Why</th></tr></thead>
            <tbody>
              <tr><td>Mid-cycle upgrade with proration</td><td>Increases by the new monthly price minus the old, from the change date</td><td>The proration invoice line is a one-off charge for the partial period, not recurring value</td></tr>
              <tr><td>Refund</td><td>None by itself</td><td>A refund is a cash and revenue event. If it accompanies a cancellation, the cancellation reduces MRR</td></tr>
              <tr><td>Credit note</td><td>None, unless it reflects a lasting price change</td><td>Credits correct invoices; MRR follows the subscription</td></tr>
              <tr><td>Coupon for 3 months at 20% off</td><td>Policy choice: reduced for 3 months, or full price throughout</td><td>Stripe lets you configure this; pick one and apply it everywhere</td></tr>
              <tr><td>Cancel at period end</td><td>Still counts until the period ends</td><td>The customer is paid up. Track it separately as scheduled churn</td></tr>
              <tr><td>Paused collection</td><td>Policy choice; excluding paused subscriptions is the cautious option</td><td>No recurring value is being billed while paused</td></tr>
              <tr><td>Customer billed in USD, reported in GBP</td><td>Changes with the exchange rate even if nothing else does</td><td>Report the FX effect as its own movement, as Stripe does</td></tr>
              <tr><td>Enterprise contract invoiced from Xero, not Stripe</td><td>Missing from Stripe&rsquo;s MRR entirely</td><td>Add it from a contracts table with start, end and monthly value</td></tr>
            </tbody>
          </table></div>
          <p>For currencies, convert each month&rsquo;s MRR at one stated rate (for example the month-end rate) and calculate an FX movement separately. Otherwise currency moves look like expansion or contraction, and a strong pound reads as customers downgrading.</p>
        </section>

        <section id="movements">
          <h2>How to calculate MRR movements: new, expansion, contraction and churn</h2>
          <ForTheBusiness>This bridge shows the board whether growth comes from new customers or from existing ones.</ForTheBusiness>
          <p>A board wants to see why MRR changed, not only that it did. Build a table with one row per customer per month, including months with zero MRR, then compare each month with the previous one. The query below assumes that zero-filled table, <code>customer_mrr_monthly</code>, already exists.</p>
          <pre>{`with d as (
    select
        customer_id,
        month,
        mrr,
        lag(mrr, 1, 0) over (partition by customer_id order by month) as prev_mrr,
        max(case when mrr > 0 then 1 else 0 end) over (
            partition by customer_id order by month
            rows between unbounded preceding and 1 preceding
        ) as paid_before
    from customer_mrr_monthly            -- one row per customer per month, zeros included
)
select
    month,
    sum(case when prev_mrr = 0 and mrr > 0 and coalesce(paid_before, 0) = 0 then mrr end) as new_mrr,
    sum(case when prev_mrr = 0 and mrr > 0 and paid_before = 1 then mrr end)            as reactivation_mrr,
    sum(case when prev_mrr > 0 and mrr > prev_mrr then mrr - prev_mrr end)              as expansion_mrr,
    sum(case when prev_mrr > 0 and mrr > 0 and mrr < prev_mrr then mrr - prev_mrr end) as contraction_mrr,
    sum(case when prev_mrr > 0 and mrr = 0 then -prev_mrr end)                          as churned_mrr
from d
group by month
order by month;`}</pre>
          <p>The zero rows matter. Without them, a customer who churns in March has no March row, <code>lag</code> skips to their next active month, and the churn disappears. The <code>paid_before</code> flag separates a returning customer (reactivation) from a new one. Run this on MRR at a constant exchange rate if you want FX kept out of expansion and contraction, and report the FX difference as its own line.</p>
          <p>Each month&rsquo;s movements should add up exactly: opening MRR plus new, reactivation and expansion, minus contraction and churn, plus FX, equals closing MRR. Make that a test. If it fails, a customer is missing from the spine or appears twice.</p>
        </section>

        <section id="board">
          <h2>How to calculate NRR, GRR and ARR for a board pack</h2>
          <ForTheBusiness>These are the retention figures investors ask for first.</ForTheBusiness>
          <p>Retention metrics start from the customers you had at the start of the period and ignore new ones:</p>
          <ul>
            <li><strong>Net revenue retention (NRR)</strong>: that cohort&rsquo;s MRR now, including expansion, divided by its MRR at the start. It can exceed 100%.</li>
            <li><strong>Gross revenue retention (GRR)</strong>: the same, but expansion is excluded, so it can&rsquo;t exceed 100%. It shows how much revenue leaks.</li>
            <li><strong>Annual recurring revenue (ARR)</strong>: MRR multiplied by 12. State whether it includes contracted but not yet live customers, because investors will ask.</li>
          </ul>
          <p>MRR is not recognised revenue. Finance recognises revenue in the ledger under accounting rules, and the two differ for prorations, usage, discounts and timing. Reconcile the movement in MRR to subscription revenue in the ledger each quarter, with the differences explained, so the board sees two consistent numbers rather than two competing ones. The method is the same as <a href="/insights/why-dashboards-disagree">reconciling Finance and Sales revenue</a>.</p>
        </section>

        <section id="example">
          <h2>Worked example: one customer&rsquo;s MRR over a quarter</h2>
          <Example setting="UK SaaS · Stripe, HubSpot, Xero" title="Upgrade, refund and a failed payment">
            <p>A customer pays £300 a month. On 15 February they upgrade to £500 a month, and Stripe raises a proration of about £100 for the rest of February. In March a card payment fails and the subscription is <code>past_due</code> for 10 days before it is paid. In April the customer receives a £50 refund for a service outage.</p>
            <div className="in-table-wrap"><table>
              <thead><tr><th>Month end</th><th>Invoices summed</th><th>MRR</th><th>Movement</th></tr></thead>
              <tbody>
                <tr><td>January</td><td>£300</td><td>£300</td><td>none</td></tr>
                <tr><td>February</td><td>£400 (£300 + £100 proration)</td><td>£500</td><td>+£200 expansion</td></tr>
                <tr><td>March</td><td>£500 (paid late)</td><td>£500</td><td>none (past_due still counts)</td></tr>
                <tr><td>April</td><td>£450 (£500 less £50 refund)</td><td>£500</td><td>none (refund is not a price change)</td></tr>
              </tbody>
            </table></div>
            <p>The invoice view shows a customer whose value moves every month. The MRR view shows one upgrade, which is what happened.</p>
          </Example>
        </section>

        <section id="wrong">
          <h2>Common MRR mistakes</h2>
          <ul>
            <li>Summing invoices or payments and calling the result MRR.</li>
            <li>Counting an annual plan&rsquo;s full value in the month it renews.</li>
            <li>Treating proration lines as expansion and refunds as contraction.</li>
            <li>Leaving out contracts billed outside Stripe.</li>
            <li>Mixing currencies at different rates each month, so FX shows up as expansion or churn.</li>
            <li>Calculating movements without a zero-filled customer-month table, so churn goes missing.</li>
            <li>Changing the policy (for example on discounts) without restating prior months, which breaks the trend.</li>
          </ul>
        </section>

        <section id="boundary">
          <h2>When SaaS metrics need a project</h2>
          <p>A single-currency business on Stripe alone can use Stripe&rsquo;s Billing analytics directly. Building your own model pays off when you add sources and edge cases:</p>
          <SystemBoundary
            conditions={[
              "Some revenue is billed outside Stripe, through invoices from the accounting system or another billing tool.",
              "You bill in more than one currency and the board asks for growth at constant currency.",
              "MRR, NRR and churn must be cut by segment, channel or plan using CRM data.",
              "Investors or acquirers will diligence the metrics, so each figure needs a traceable definition.",
              "Nobody can explain last quarter's difference between MRR and recognised revenue.",
            ]}
          />
          <p>Joining Stripe customers to CRM accounts is an identity problem first; see <a href="/insights/one-customer-view">how to build a single customer view</a>. If you need the model built and run without a full-time hire, that is what <a href="/services/embedded-data-team">an embedded data team</a> does.</p>
        </section>

        <section id="decision">
          <h2>MRR policy decisions to write down</h2>
          <p>Agree these once, in writing, and apply them in one model:</p>
          <div className="in-table-wrap"><table>
            <thead><tr><th>Decision</th><th>Stripe&rsquo;s default</th><th>Common alternative</th></tr></thead>
            <tbody>
              <tr><td>Failed payments</td><td>past_due counts; unpaid and canceled are churn</td><td>Exclude past_due after a set number of days</td></tr>
              <tr><td>Discounts</td><td>Configurable; forever discounts always subtracted</td><td>Subtract all discounts while they apply</td></tr>
              <tr><td>Trials</td><td>Excluded until paid</td><td>Same</td></tr>
              <tr><td>Usage-based charges</td><td>Excluded from MRR</td><td>Report usage revenue alongside MRR</td></tr>
              <tr><td>Currency</td><td>FX impact shown as its own movement</td><td>Same, at a stated month-end rate</td></tr>
              <tr><td>Contracts outside Stripe</td><td>Not included</td><td>Added from a contracts table</td></tr>
            </tbody>
          </table></div>
          <p>Check your definitions against the <a href="/resources/saas-metrics-definitions">SaaS metrics definitions and calculator</a>, and use the <a href="/resources/revenue-reconciliation-checklist">revenue reconciliation workbench</a> to tie MRR to the ledger. If Finance and Sales also disagree on revenue, read <a href="/insights/why-dashboards-disagree">why Finance and Sales numbers don&rsquo;t match</a>. To have these metrics built and maintained without a full-time hire, see <a href="/services/embedded-data-team">how an embedded data team works</a>.</p>
          <p>If you are preparing for a raise, <a href="/insights/investor-ready-arr">How to calculate ARR for investors</a> covers the bridge, cohort tables and definitions diligence asks for, and <a href="/insights/crm-closed-won-vs-stripe">HubSpot closed-won vs Stripe billing</a> covers the pipeline side.</p>
          <p>Turn a Stripe export into an ARR bridge and cohort tables with the <a href="/resources/arr-bridge-cohort-builder">ARR bridge and cohort table builder</a>.</p>
        </section>
      </ArticleLayout>
    </PageShell>
  );
}
