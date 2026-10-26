import { PageShell } from "../../../components/site/PageShell";
import { ArticleLayout, TryThisFirst, SystemBoundary, Diagram, Example, Pull, PlainEnglish, ForTheBusiness } from "../../../components/insights/Article";
import { insightMetadata } from "../../../lib/insights";

const SLUG = "multi-entity-consolidation";
const TOC = [
  { id: "why", label: "Why group reporting is hard to automate" },
  { id: "try-first", label: "Five checks before you build" },
  { id: "model", label: "Data model for consolidation" },
  { id: "translation", label: "Closing vs average rate translation" },
  { id: "intercompany", label: "How to match and eliminate intercompany" },
  { id: "versions", label: "Versioned rates and constant currency" },
  { id: "example", label: "Worked example: UK, US and Ireland" },
  { id: "wrong", label: "Common ways this goes wrong" },
  { id: "boundary", label: "When consolidation needs a project" },
  { id: "decision", label: "Where consolidation should live" },
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
            title="From local ledgers to a consolidated group view"
            caption="Each entity's trial balance is mapped to the group chart of accounts, translated at the rate type each account requires, then combined with eliminations held in their own entity so the before and after are both visible."
          >
            <svg viewBox="0 0 720 240" xmlns="http://www.w3.org/2000/svg" style={F} fontSize="11" fill="#2c3a36" textAnchor="middle">
              <defs><marker id="mc-a" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9 z" fill="rgba(20,35,33,.55)" /></marker></defs>
              {[["UK Ltd", "GBP", 30], ["US Inc", "USD", 96], ["IE Ltd", "EUR", 162]].map(([n, c, y]) => (
                <g key={n as string}>
                  <rect x="10" y={y as number} width="110" height="44" rx="4" fill="#fff" stroke="rgba(20,35,33,.35)" />
                  <text x="65" y={(y as number) + 20}>{n}</text><text x="65" y={(y as number) + 36} fill="#7a847f">{c} ledger</text>
                  <line x1="120" y1={(y as number) + 22} x2="168" y2="120" stroke="rgba(20,35,33,.4)" markerEnd="url(#mc-a)" />
                </g>
              ))}
              <rect x="172" y="92" width="130" height="56" rx="4" fill="#fff" stroke="rgba(20,35,33,.35)" />
              <text x="237" y="116">map to group</text><text x="237" y="134" fill="#7a847f">chart of accounts</text>
              <line x1="302" y1="120" x2="340" y2="120" stroke="rgba(20,35,33,.4)" markerEnd="url(#mc-a)" />
              <rect x="344" y="78" width="150" height="84" rx="4" fill="#fff" stroke="rgba(20,35,33,.35)" />
              <text x="419" y="102">translate</text>
              <text x="419" y="120" fill="#7a847f">B/S · closing</text>
              <text x="419" y="136" fill="#7a847f">P&amp;L · average</text>
              <text x="419" y="152" fill="#7a847f">equity · historical</text>
              <line x1="494" y1="120" x2="532" y2="120" stroke="#90d26f" strokeWidth="1.8" markerEnd="url(#mc-a)" />
              <rect x="536" y="70" width="174" height="100" rx="4" fill="rgba(144,210,111,.12)" stroke="#90d26f" strokeWidth="1.6" />
              <text x="623" y="98">group view (GBP)</text>
              <text x="623" y="118" fill="#3c6b43">+ eliminations entity</text>
              <text x="623" y="136" fill="#3c6b43">+ CTA (calculated)</text>
              <text x="623" y="154" fill="#3c6b43">rates and maps versioned</text>
              <text x="360" y="222" fill="#7a847f">reconciled to the statutory consolidation, not a replacement for it</text>
            </svg>
          </Diagram>
        }
      >
        <section id="why">
          <h2>Why is multi-entity consolidation hard to automate?</h2>
          <p>Because consolidation is not a sum. Each entity keeps its books in its own functional currency and often its own chart of accounts. Before the numbers can be added, every account has to be mapped to the group chart, translated at the right rate for its type, and stripped of trading between group companies, which would otherwise double-count revenue and leave receivables owed by the group to itself. Most finance teams do this in a workbook that one person understands.</p>
          <PlainEnglish>
            <p>A group with companies in several countries cannot add their accounts together directly. Each company&rsquo;s figures have to be mapped to one chart of accounts, converted to pounds at the right exchange rates, and cleaned of trading between group companies. A warehouse can do that the same way every day, so the group view stops depending on one person&rsquo;s workbook. The audited consolidation stays in the finance system.</p>
            <ul>
              <li><strong>Ask your team</strong>: do intercompany balances net to zero each month, and can we reproduce last quarter&rsquo;s pack exactly?</li>
              <li><strong>Expect back</strong>: group figures with growth shown both as reported and at constant currency.</li>
            </ul>
          </PlainEnglish>
          <p>A warehouse can carry the mechanical part reliably, every day, drillable to the transaction. It cannot replace the judgements, and it should not try to replace the statutory consolidation. The goal is a management view built with the same rules, which ties to the statutory numbers at each close.</p>
          <Pull>Model consolidation the way finance does it, as mapped, translated and eliminated balances, and it becomes repeatable. Model it as a currency conversion on a dashboard and it never ties.</Pull>
          <p>This is general guidance on data modelling, not accounting advice. The accounting policy (rate sources, averaging method, elimination rules) is your finance team&rsquo;s and your auditors&rsquo; to set; the model&rsquo;s job is to apply it the same way every time.</p>
        </section>

        <section id="try-first">
          <h2>Five data checks before you automate consolidation</h2>
          <TryThisFirst title="Five input checks">
            <ol>
              <li><strong>Mapping coverage.</strong> Does every local account, in every entity, map to exactly one group account? Unmapped accounts are where money disappears.</li>
              <li><strong>Trading partner.</strong> Do intercompany lines carry the counterparty entity, or is intercompany only identifiable by account name?</li>
              <li><strong>Rates.</strong> Is there one agreed source for closing and average rates per month, stored somewhere other than a cell in the pack?</li>
              <li><strong>Rate type per account.</strong> Is it written down which group accounts use closing, average and historical rates?</li>
              <li><strong>Intercompany agreement.</strong> For last month, do each pair of entities&rsquo; intercompany balances agree, and if not, can anyone say why?</li>
            </ol>
          </TryThisFirst>
        </section>

        <section id="model">
          <h2>The data model for multi-entity consolidation</h2>
          <ForTheBusiness>These five tables make the group figures repeatable and traceable to a single transaction.</ForTheBusiness>
          <p>Five small tables hold almost everything a consolidation needs. The discipline is keeping them complete and versioned:</p>
          <div className="in-table-wrap"><table>
            <thead><tr><th>Table</th><th>Grain</th><th>Key columns</th></tr></thead>
            <tbody>
              <tr><td>gl_balances</td><td>Entity, local account, period (monthly movement)</td><td>amount_local, currency, trading_partner_id</td></tr>
              <tr><td>entities</td><td>One row per legal entity</td><td>functional_ccy, parent, ownership_pct, acquired_on</td></tr>
              <tr><td>account_map</td><td>Entity and local account</td><td>group_account, statement (BS or PL), rate_type, is_intercompany</td></tr>
              <tr><td>fx_rates</td><td>Currency pair, period, rate type, version</td><td>rate, source, published_at</td></tr>
              <tr><td>eliminations</td><td>Period, entity pair, group account</td><td>amount_gbp, rule, approved_by</td></tr>
            </tbody>
          </table></div>
          <p>Hold monthly <strong>movements</strong>, not year-to-date balances, in <code>gl_balances</code>. Balance sheet positions are cumulative sums of movements; profit and loss for any range is the sum of the months in it. That choice is what makes the translation below correct.</p>
        </section>

        <section id="translation">
          <h2>Closing rate vs average rate: how to translate foreign entities</h2>
          <ForTheBusiness>The wrong rate or method changes reported profit, and can change last month&rsquo;s figures every month.</ForTheBusiness>
          <p>Under IAS 21, the results and financial position of a foreign operation are translated into the presentation currency like this: assets and liabilities at the <strong>closing rate</strong> at the reporting date; income and expenses at the rates on the <strong>dates of the transactions</strong>, with an average rate for the period allowed as a practical approximation unless rates fluctuate significantly; and equity items at <strong>historical rates</strong>. The resulting exchange differences go to other comprehensive income (OCI) and accumulate in equity. For US readers, the US GAAP rules land in the same place:</p>
          <ul>
            <li><strong>ASC 830 (foreign currency)</strong>: assets and liabilities translate at the exchange rate at the balance sheet date; income and expenses at the rates on the dates they are recognised, where a weighted-average rate is generally appropriate. Translation adjustments stay out of net income and accumulate in a separate component of equity, the CTA.</li>
            <li><strong>ASC 810 (consolidation)</strong>: intra-entity balances and transactions are eliminated, the same requirement as IFRS 10.</li>
          </ul>
          <p>The data model below works under either framework. What changes between frameworks and groups is the policy (rate sources, averaging method, which accounts use historical rates), which belongs in the configuration tables, not in code.</p>
          <pre>{`-- Translate each entity's monthly P&L movements and month-end balance sheet into GBP.
with movements as (
    select b.entity_id, b.period, m.group_account, m.statement, m.rate_type,
           sum(b.amount_local) as amount_local
    from gl_balances as b
    join account_map as m
      on m.entity_id = b.entity_id and m.local_account = b.local_account
    group by 1, 2, 3, 4, 5
),
balances as (                                   -- balance sheet: cumulative position at month end
    select entity_id, period, group_account, statement, rate_type,
           sum(amount_local) over (
               partition by entity_id, group_account
               order by period rows between unbounded preceding and current row
           ) as amount_local
    from movements
    where statement = 'BS'
)
select x.entity_id, x.period, x.group_account, x.statement,
       x.amount_local,
       x.amount_local * r.rate as amount_gbp
from (
    select * from movements where statement = 'PL'   -- P&L: each month's movement
    union all
    select * from balances                           -- BS: month-end position
) as x
join entities as e on e.entity_id = x.entity_id
join fx_rates as r
  on  r.from_ccy  = e.functional_ccy
  and r.to_ccy    = 'GBP'
  and r.period    = x.period
  and r.rate_type = x.rate_type                      -- 'closing' | 'average' | 'historical'
  and r.version   = 'current';                       -- see versioning below`}</pre>
          <p>Three details decide whether the result ties:</p>
          <ul>
            <li><strong>Translate months, then add them up.</strong> Year-to-date profit is the sum of each month translated at that month&rsquo;s average. Translating the year-to-date balance at the current month&rsquo;s rate gives a different number, and it changes retrospectively every month as the rate moves.</li>
            <li><strong>The GBP entity needs rate rows too.</strong> A rate of 1 for GBP to GBP, or the inner join silently drops the parent. Test that every entity, period and rate type in use has a rate.</li>
            <li><strong>Historical rates for equity are not monthly rates.</strong> Share capital and pre-acquisition reserves are translated at the rate when they arose. Store them as their own rate type keyed to the event, not to the reporting month.</li>
          </ul>
          <p>Once everything is translated, the balance sheet does not balance, by design. The difference is the <strong>cumulative translation adjustment</strong> (CTA): the effect of translating net assets at the closing rate while profit and equity used other rates. Calculate it as the balancing figure per entity, post it to its own group account, and check its movement is explainable (opening net assets times the change in closing rate, plus profit times the difference between closing and average). If the CTA is suspiciously large, a mapping or rate type is usually wrong.</p>
        </section>

        <section id="intercompany">
          <h2>How to match and eliminate intercompany balances</h2>
          <ForTheBusiness>Unmatched intercompany balances overstate group revenue and assets until someone finds them.</ForTheBusiness>
          <p>IFRS 10 and, in the US, ASC 810 require intragroup balances and transactions to be eliminated in full. The data problem is finding them reliably, and that depends on one field: the <strong>trading partner</strong> on every intercompany line. With it, matching is a query; without it, it is a monthly negotiation.</p>
          <pre>{`-- Each intercompany pair should net to zero in GBP, by statement.
with ic as (
    select period, entity_id, trading_partner_id, statement,
           sum(amount_gbp) as amount_gbp
    from fct_gl_translated
    where is_intercompany
    group by 1, 2, 3, 4
)
select a.period, a.entity_id, a.trading_partner_id, a.statement,
       a.amount_gbp                             as entity_side,
       coalesce(b.amount_gbp, 0)                as partner_side,
       a.amount_gbp + coalesce(b.amount_gbp, 0) as unmatched
from ic as a
left join ic as b
  on  b.period             = a.period
  and b.entity_id          = a.trading_partner_id
  and b.trading_partner_id = a.entity_id
  and b.statement          = a.statement
where abs(a.amount_gbp + coalesce(b.amount_gbp, 0)) > 1     -- tolerance in GBP
order by abs(unmatched) desc;`}</pre>
          <p>Debits are positive and credits negative, so a receivable in one entity and the matching payable in the other sum to zero, as do intercompany sales and the matching cost. Each mismatched pair appears once from each side. Typical causes:</p>
          <ul>
            <li><strong>Timing.</strong> One side has booked the invoice, the other has it in transit. Agree a cut-off rule.</li>
            <li><strong>Currency.</strong> The two sides recorded or revalued the balance at different rates or dates. Small, persistent differences that move with the rate are usually this.</li>
            <li><strong>Mapping.</strong> One side posted to a third-party account, so the line is not flagged as intercompany at all.</li>
          </ul>
          <p>Post eliminations to a separate <strong>eliminations entity</strong> rather than deleting lines. The group view is then entities plus eliminations, and anyone can see what was removed and why. Some eliminations are calculations rather than matches, such as unrealised profit on stock one group company sold to another and still holds; those need a rule from finance, with the inputs (stock held, intragroup margin) as data.</p>
        </section>

        <section id="versions">
          <h2>How to handle restatements and constant-currency reporting</h2>
          <ForTheBusiness>Versioning means any pack the board has seen can be reproduced, and every restatement has an approver.</ForTheBusiness>
          <p>Rates get corrected, mappings change and entities are acquired. If any of those updates a table in place, the March pack can no longer be reproduced in October. Version the inputs instead: rates and mappings carry a version or an effective date range, each published pack records which versions it used, and a restatement is a new version with an approver, not an edit. This is the same discipline as <a href="/insights/customer-history-scd2">keeping dimension history</a>, applied to finance reference data.</p>
          <p>For management reporting, add <strong>constant-currency</strong> figures: both periods translated at the same rates, commonly the prior period&rsquo;s averages. Shown beside reported figures, they separate trading performance from currency movement, which is the question a board usually asks when a dollar-earning subsidiary&rsquo;s sterling numbers jump.</p>
        </section>

        <section id="example">
          <h2>Worked example: reported vs constant-currency growth for a UK group</h2>
          <Example setting="UK group · Xero (UK), QuickBooks (US), Business Central (IE)" title="Revenue growth, reported and at constant currency">
            <p>The US subsidiary&rsquo;s revenue is flat in dollars year on year; the Irish subsidiary grows 10% in euros. Sterling strengthened against the dollar over the year.</p>
            <div className="in-table-wrap"><table>
              <thead><tr><th>Entity</th><th>Last year (local)</th><th>This year (local)</th><th>Reported growth in GBP</th><th>Constant-currency growth</th></tr></thead>
              <tbody>
                <tr><td>UK Ltd</td><td>£4.0m</td><td>£4.4m</td><td>+10.0%</td><td>+10.0%</td></tr>
                <tr><td>US Inc</td><td>$5.0m</td><td>$5.0m</td><td>-6.0% (at 1.25 then 1.33 $ per £)</td><td>0.0%</td></tr>
                <tr><td>IE Ltd</td><td>€2.0m</td><td>€2.2m</td><td>+8.1% (at 1.15 then 1.17 € per £)</td><td>+10.0%</td></tr>
              </tbody>
            </table></div>
            <p>Before eliminating £0.3m of intercompany management charges from the UK to the US, group revenue is overstated by exactly that amount. The matching query flagged a further £12,000 difference on the pair, traced to the US side booking December&rsquo;s charge in January. Rates are placeholders, not market data.</p>
          </Example>
        </section>

        <section id="wrong">
          <h2>Common ways this goes wrong</h2>
          <ul>
            <li>Translating year-to-date balances at the current rate, so last month&rsquo;s profit changes every month.</li>
            <li>Typing the CTA in as a plug, which hides mapping and rate errors instead of exposing them.</li>
            <li>Identifying intercompany by account name or customer name instead of a trading partner field.</li>
            <li>Deleting intercompany lines instead of posting eliminations to their own entity.</li>
            <li>Updating rates and mappings in place, so past packs cannot be reproduced.</li>
            <li>Using a dashboard currency conversion (one rate for everything) and calling it consolidation.</li>
          </ul>
        </section>

        <section id="boundary">
          <h2>When consolidation needs a project</h2>
          <p>A two-entity group with one currency can live in a well-built workbook. The modelling pays off when entities, currencies or acquisitions multiply, and when the board wants the group view more often than the close produces it. The monthly mechanics around it are covered in <a href="/insights/automate-monthly-reporting">automating monthly management reporting</a>.</p>
          <SystemBoundary
            conditions={[
              "Three or more entities, or more than one functional currency.",
              "Intercompany balances do not net to zero and the difference is investigated by hand each month.",
              "The group pack takes days after the last entity closes, and only one person can build it.",
              "Leadership wants a group view weekly or daily, not only at month end.",
              "Past packs cannot be reproduced because rates or mappings were changed in place.",
            ]}
          />
        </section>

        <section id="decision">
          <h2>Where should consolidation live: ERP, consolidation tool or warehouse?</h2>
          <div className="in-table-wrap"><table>
            <thead><tr><th>Need</th><th>Best home</th><th>Why</th></tr></thead>
            <tbody>
              <tr><td>Statutory group accounts</td><td>ERP consolidation module or a dedicated consolidation tool</td><td>Audit trail, journals and judgements belong in the finance system</td></tr>
              <tr><td>Monthly management pack, drillable</td><td>Warehouse model with the rules above</td><td>Repeatable, testable, traceable to transactions</td></tr>
              <tr><td>Daily or weekly group view</td><td>Warehouse model, flagged as unclosed</td><td>Same logic, clearly marked as provisional</td></tr>
              <tr><td>Two entities, one currency, monthly</td><td>A controlled workbook with checks</td><td>A model would cost more than it saves, for now</td></tr>
            </tbody>
          </table></div>
          <p>Map each step of today&rsquo;s group close with the <a href="/resources/reporting-automation-map">reporting automation map</a>, and define group metrics once in the <a href="/resources/kpi-dictionary-template">KPI dictionary template</a>. Entity hierarchies change over time, which is the same problem as <a href="/insights/customer-history-scd2">keeping dimension history</a>. When the pack needs building, see <a href="/services/data-projects">how our group reporting projects work</a>.</p>
          <p>For examples of group reporting we have built, see <a href="/work">our work</a>. Accounting data from Xero or QuickBooks Online reaches the model as described in <a href="/insights/connect-quickbooks-xero-to-power-bi">connecting QuickBooks Online and Xero to Power BI</a>.</p>
        </section>
      </ArticleLayout>
    </PageShell>
  );
}
