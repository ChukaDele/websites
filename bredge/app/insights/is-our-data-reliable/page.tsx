import { PageShell } from "../../../components/site/PageShell";
import { ArticleLayout, TryThisFirst, SystemBoundary, Diagram, Example, Pull, PlainEnglish, ForTheBusiness, ForYourDataPerson } from "../../../components/insights/Article";
import { insightMetadata } from "../../../lib/insights";

const SLUG = "is-our-data-reliable";
const TOC = [
  { id: "what-reliable-means", label: "What reliable data means" },
  { id: "usual", label: "What this usually looks like" },
  { id: "try-first", label: "Six checks to run this afternoon" },
  { id: "dbt-first", label: "The first dbt tests to add" },
  { id: "fatigue", label: "How to avoid alert fatigue" },
  { id: "what-it-tells-you", label: "What a failed check tells you" },
  { id: "underneath", label: "The data quality dimensions, defined" },
  { id: "example", label: "Worked example: a portfolio KPI pack" },
  { id: "good", label: "What good looks like" },
  { id: "wrong", label: "Common ways this goes wrong" },
  { id: "boundary", label: "When reliability needs to be a system" },
  { id: "decision", label: "A decision guide" },
];

export const metadata = insightMetadata(SLUG);

export default function Page() {
  return (
    <PageShell>
      <ArticleLayout
        slug={SLUG}
        toc={TOC}
        heroDiagram={
          <Diagram
            title="A data asset checked against six quality tests before it is trusted"
            caption="Most checks pass (green). One fails (amber) and routes the affected records to an exception queue, so a known-good asset reaches decisions and the failures get fixed."
          >
            <svg viewBox="0 0 720 320" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <marker id="idr-ok" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="#90d26f" />
                </marker>
                <marker id="idr-warn" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="#f0bf6c" />
                </marker>
              </defs>

              {/* data asset */}
              <rect x="16" y="112" width="92" height="52" fill="none" stroke="rgba(20,35,33,.35)" />
              <text x="62" y="136" fill="#2c3a36" fontSize="12" fontFamily="monospace" textAnchor="middle">orders</text>
              <text x="62" y="152" fill="#2c3a36" fontSize="10" fontFamily="monospace" textAnchor="middle">data asset</text>

              {/* flow: asset into the checks */}
              <line x1="108" y1="138" x2="122" y2="138" stroke="#90d26f" strokeWidth="1.8" markerEnd="url(#idr-ok)" />

              {/* check 1: completeness (pass) */}
              <rect x="124" y="112" width="76" height="52" fill="none" stroke="rgba(20,35,33,.35)" />
              <text x="162" y="131" fill="#2c3a36" fontSize="8.5" fontFamily="monospace" textAnchor="middle">completeness</text>
              <text x="162" y="153" fill="#90d26f" fontSize="13" fontFamily="monospace" textAnchor="middle">{"✓"}</text>
              <line x1="200" y1="138" x2="210" y2="138" stroke="#90d26f" strokeWidth="1.8" markerEnd="url(#idr-ok)" />

              {/* check 2: uniqueness (pass) */}
              <rect x="212" y="112" width="76" height="52" fill="none" stroke="rgba(20,35,33,.35)" />
              <text x="250" y="131" fill="#2c3a36" fontSize="8.5" fontFamily="monospace" textAnchor="middle">uniqueness</text>
              <text x="250" y="153" fill="#90d26f" fontSize="13" fontFamily="monospace" textAnchor="middle">{"✓"}</text>
              <line x1="288" y1="138" x2="298" y2="138" stroke="#90d26f" strokeWidth="1.8" markerEnd="url(#idr-ok)" />

              {/* check 3: validity (FAILS) */}
              <rect x="300" y="112" width="76" height="52" fill="none" stroke="#f0bf6c" strokeWidth="1.5" />
              <text x="338" y="131" fill="#2c3a36" fontSize="8.5" fontFamily="monospace" textAnchor="middle">validity</text>
              <text x="338" y="153" fill="#f0bf6c" fontSize="13" fontFamily="monospace" textAnchor="middle">{"✗"}</text>
              <line x1="376" y1="138" x2="386" y2="138" stroke="#90d26f" strokeWidth="1.8" markerEnd="url(#idr-ok)" />

              {/* failure branch down to exception */}
              <line x1="338" y1="164" x2="338" y2="230" stroke="#f0bf6c" strokeWidth="1.5" markerEnd="url(#idr-warn)" />

              {/* check 4: referential integrity (pass) */}
              <rect x="388" y="112" width="76" height="52" fill="none" stroke="rgba(20,35,33,.35)" />
              <text x="426" y="131" fill="#2c3a36" fontSize="8.5" fontFamily="monospace" textAnchor="middle">integrity</text>
              <text x="426" y="153" fill="#90d26f" fontSize="13" fontFamily="monospace" textAnchor="middle">{"✓"}</text>
              <line x1="464" y1="138" x2="474" y2="138" stroke="#90d26f" strokeWidth="1.8" markerEnd="url(#idr-ok)" />

              {/* check 5: freshness (pass) */}
              <rect x="476" y="112" width="76" height="52" fill="none" stroke="rgba(20,35,33,.35)" />
              <text x="514" y="131" fill="#2c3a36" fontSize="8.5" fontFamily="monospace" textAnchor="middle">freshness</text>
              <text x="514" y="153" fill="#90d26f" fontSize="13" fontFamily="monospace" textAnchor="middle">{"✓"}</text>
              <line x1="552" y1="138" x2="562" y2="138" stroke="#90d26f" strokeWidth="1.8" markerEnd="url(#idr-ok)" />

              {/* check 6: reconciliation (pass) */}
              <rect x="564" y="112" width="76" height="52" fill="none" stroke="rgba(20,35,33,.35)" />
              <text x="602" y="131" fill="#2c3a36" fontSize="8.5" fontFamily="monospace" textAnchor="middle">reconciliation</text>
              <text x="602" y="153" fill="#90d26f" fontSize="13" fontFamily="monospace" textAnchor="middle">{"✓"}</text>
              <line x1="640" y1="138" x2="650" y2="138" stroke="#90d26f" strokeWidth="1.8" markerEnd="url(#idr-ok)" />

              {/* reliable output */}
              <rect x="652" y="112" width="64" height="52" fill="none" stroke="#90d26f" strokeWidth="1.5" />
              <text x="684" y="136" fill="#2c3a36" fontSize="11" fontFamily="monospace" textAnchor="middle">reliable</text>
              <text x="684" y="152" fill="#2c3a36" fontSize="10" fontFamily="monospace" textAnchor="middle">asset</text>

              {/* exception queue */}
              <rect x="278" y="230" width="120" height="46" fill="none" stroke="#f0bf6c" strokeWidth="1.5" />
              <text x="338" y="251" fill="#2c3a36" fontSize="11" fontFamily="monospace" textAnchor="middle">exception</text>
              <text x="338" y="267" fill="#2c3a36" fontSize="10" fontFamily="monospace" textAnchor="middle">review &amp; fix</text>

              {/* legend */}
              <rect x="16" y="298" width="18" height="8" fill="#90d26f" />
              <text x="40" y="306" fill="#2c3a36" fontSize="11" fontFamily="monospace">passed check</text>
              <rect x="188" y="298" width="18" height="8" fill="#f0bf6c" />
              <text x="212" y="306" fill="#2c3a36" fontSize="11" fontFamily="monospace">failed, routed to exception</text>
            </svg>
          </Diagram>
        }
      >
        <section id="what-reliable-means">
          <h2>What does reliable data mean in practice?</h2>
          <p>&ldquo;Is our data reliable?&rdquo; is a fair question with an unhelpful usual answer, because reliable tends to get treated as a feeling. The report looks right, so it must be right. That is not a test. It is a hope.</p>
          <PlainEnglish>
            <p>Reliable data is data that passes written checks every time it loads, with a named person who acts when a check fails. If nobody can say which checks run and when they last passed, you do not yet know whether your numbers are reliable.</p>
          </PlainEnglish>
          <p>Data is reliable when it passes a defined set of checks that someone owns. Not &ldquo;looks fine in the chart&rdquo;, but passes explicit, repeatable tests: is anything missing, is anything duplicated, are the values legal, do the links between tables hold, is the figure recent enough, and do independent sources agree at the level of individual records. Reliability is the score on those checks, written down, rather than an impression.</p>
          <p>So the way to know is to make the checks explicit. Pick the handful of data assets your decisions actually depend on, decide what each check should prove, run them, and give every asset an owner. Once the checks exist, &ldquo;reliable&rdquo; stops being a debate and becomes a number you can point at.</p>
          <Pull>The report looks right, so it must be right. That is not a test. It is a hope.</Pull>
          <p>The checks below need no new tooling, and the <a href="/resources/data-diagnostic-checklist">data audit checklist</a> puts them in context with the rest of your setup. If you want them defined and running against your own data, that is where a <a href="/data-diagnostic">Data Diagnostic</a> starts.</p>
        </section>

        <section id="usual">
          <h2>Signs your data is not reliable</h2>
          <p>It usually surfaces after a decision has already been made on a number that turned out to be wrong. A total was too high because a load ran twice. A customer count was too low because half the rows arrived a day late. A margin looked healthy because one amount column held two currencies and nobody noticed.</p>
          <p>The uncomfortable part is that nobody could have answered the reliability question beforehand, because no one had written down what reliable meant for that data. The dashboard rendered faithfully. The query was valid SQL. The pipeline reported success. Every green light was honest, and the number was still wrong, because none of those lights was actually checking the data itself.</p>
          <p>So the organisation runs on trust and the occasional scare. When a figure is challenged, someone spends a day proving it by hand, the fire goes out, and nothing changes until the next surprise. There is no standing definition of &ldquo;good&rdquo;, so there is no way to be confident in the quiet stretches between the scares.</p>
        </section>

        <section id="try-first">
          <h2>Six data quality checks you can run this afternoon</h2>
          <p>You can get a real answer in an afternoon, without new tooling. The goal is not to test everything. It is to test the few assets that decisions depend on, against a small, fixed set of checks. A <strong>data asset</strong> here means one specific table or dataset, such as your orders table or your customer master.</p>
          <TryThisFirst title="Six checks and an owner">
            <ol>
              <li>List the data assets your decisions actually depend on, and keep the list short. Board numbers, the customer list, the revenue table. Ignore everything nobody decides anything from.</li>
              <li><strong>Completeness</strong>: count the rows and the empty values in the fields that matter. Are required fields ever blank, and does the row count match what you expect for the period?</li>
              <li><strong>Uniqueness</strong>: check for unintended duplicates. Group by the business key, such as order reference or customer ID, and look for any key that appears more than once.</li>
              <li><strong>Validity</strong>: confirm the values are legal. Dates that are real dates, amounts that are not negative where they cannot be, currencies and statuses drawn only from the allowed set.</li>
              <li><strong>Referential integrity</strong>: confirm every child row has a valid parent. Every order points at a customer that exists; no order is stranded with a customer ID that matches nothing.</li>
              <li><strong>Freshness</strong>: check when the asset was last updated, and decide whether that is recent enough for the decision it feeds. A daily board number from a source that refreshed three days ago is stale even when every value is correct.</li>
              <li><strong>Reconciliation</strong>: line the asset up against an independent source at the record level, not just the total, and account for every difference.</li>
              <li>Write down who owns each asset. One named person who is responsible when a check fails.</li>
            </ol>
          </TryThisFirst>
          <p>Six checks and an owner. That is enough to turn &ldquo;we think it is fine&rdquo; into &ldquo;it passed, and here is who watches it&rdquo;.</p>
        </section>

        <section id="dbt-first">
          <h2>Which dbt tests should you add first?</h2>
          <p>A dbt test is a query that returns the rows that break a rule; the test passes when it returns nothing. Add them in this order, because each protects more decisions than the next:</p>
          <ol>
            <li><strong>Primary keys</strong>: <code>unique</code> and <code>not_null</code> on the key of every model a report reads. A duplicated key inflates every total built on the table.</li>
            <li><strong>Joins</strong>: <code>relationships</code> on each foreign key your reports join on, so an order without a customer fails instead of dropping out of a join.</li>
            <li><strong>Source freshness</strong>: a freshness check on every source, so a stopped connector fails the run before anyone reads yesterday&rsquo;s numbers as today&rsquo;s.</li>
            <li><strong>One reconciliation test</strong>: a custom test that ties a headline total, such as last month&rsquo;s revenue, to the ledger within a stated tolerance.</li>
            <li><strong>Status and category columns</strong>: <code>accepted_values</code> on the few columns that drive filters or definitions, such as order status.</li>
          </ol>
          <p>Stop there until those run cleanly. Descriptive columns (names, addresses, free text) rarely need tests at all.</p>
          <ForYourDataPerson title="The starter tests in dbt YAML and SQL">
            <p>Model tests, using the <code>arguments</code> key that dbt introduced in v1.10.5; on older versions, put <code>to</code>, <code>field</code> and <code>values</code> directly under the test name:</p>
            <pre>{`# models/marts/_marts.yml
version: 2

models:
  - name: fct_orders
    columns:
      - name: order_id
        data_tests:
          - unique
          - not_null
      - name: customer_id
        data_tests:
          - not_null
          - relationships:
              arguments:
                to: ref('dim_customers')
                field: customer_id
      - name: status
        data_tests:
          - accepted_values:
              arguments:
                values: ['placed', 'shipped', 'completed', 'returned']
              config:
                severity: warn`}</pre>
            <p>Source freshness. From dbt v1.10, <code>freshness</code> sits under <code>config</code>; the old top-level placement raises a deprecation warning:</p>
            <pre>{`# models/staging/_sources.yml
version: 2

sources:
  - name: billing
    schema: raw_billing
    loaded_at_field: _loaded_at
    config:
      freshness:
        warn_after: {count: 12, period: hour}
        error_after: {count: 24, period: hour}
    tables:
      - name: invoices`}</pre>
            <p>Run it with <code>dbt source freshness</code> before <code>dbt build</code>. The reconciliation test is a singular test: a SQL file in <code>tests/</code> that fails when it returns rows.</p>
            <pre>{`-- tests/assert_revenue_ties_to_ledger.sql
-- Fails when last month's modelled revenue differs from the ledger by more than 100.
select
    m.revenue_month,
    m.revenue_gbp,
    l.revenue_gbp as ledger_revenue_gbp
from {{ ref('fct_revenue_monthly') }} as m
join {{ ref('stg_ledger_revenue_monthly') }} as l
    on l.revenue_month = m.revenue_month
where m.revenue_month = date_trunc('month', current_date - interval '1 month')
  and abs(m.revenue_gbp - l.revenue_gbp) > 100`}</pre>
          </ForYourDataPerson>
        </section>

        <section id="fatigue">
          <h2>How to avoid alert fatigue in dbt tests</h2>
          <p>Alert fatigue starts when tests fail so often that people stop reading the results. A failing test nobody acts on is worse than no test, because it teaches the team to ignore failures. Five rules keep the signal clear:</p>
          <ul>
            <li><strong>Error only where a decision depends on it</strong>: keys, joins, freshness and reconciliation fail the run; everything else warns.</li>
            <li><strong>Use thresholds for known-dirty data</strong>: <code>warn_if</code> and <code>error_if</code> let a test warn on a few bad rows and fail only past a limit you agree with the owner.</li>
            <li><strong>Limit old data</strong>: a <code>where</code> config tests recent rows only, so a historic problem you have accepted does not fail every run.</li>
            <li><strong>Store failures for triage</strong>: <code>store_failures</code> writes the failing rows to a table, so the owner can see which records broke the rule.</li>
            <li><strong>Name an owner for every error</strong>: if nobody would act on a failure, lower it to a warning or delete the test.</li>
          </ul>
          <ForYourDataPerson title="Thresholds and severity on a single test">
            <p>This test warns when any email is missing and fails the run only when more than 50 are:</p>
            <pre>{`# models/marts/_customers.yml
version: 2

models:
  - name: dim_customers
    columns:
      - name: email
        data_tests:
          - not_null:
              config:
                severity: error
                warn_if: ">0"
                error_if: ">50"
                where: "created_at >= current_date - interval '30 days'"
                store_failures: true`}</pre>
            <p>See dbt&rsquo;s <a href="https://docs.getdbt.com/reference/data-test-configs" target="_blank" rel="noopener noreferrer">data test configurations</a> for every option. The freshness thresholds in your sources should match what the business has been promised; the <a href="/resources/data-freshness-sla-calculator">data freshness SLA calculator</a> works that out from your schedules.</p>
          </ForYourDataPerson>
        </section>

        <section id="what-it-tells-you">
          <h2>What a failed check tells you</h2>
          <p>Each check answers a different question, so a failure tells you where to look and, just as usefully, who should look.</p>
          <ul>
            <li>A <strong>completeness</strong> failure points at collection or loading: rows dropped, a late feed, a required field the source never sends.</li>
            <li>A <strong>uniqueness</strong> failure points at a double load, or a join that multiplied rows.</li>
            <li>A <strong>validity</strong> failure points at the source or the entry rules: a free-text field where a fixed list was assumed, or a date parsed the wrong way.</li>
            <li>A <strong>referential integrity</strong> failure points at ordering or identity: a child row loaded before its parent, or two systems that disagree on keys.</li>
            <li>A <strong>freshness</strong> failure points at the pipeline schedule, not the values.</li>
            <li>A <strong>reconciliation</strong> failure points at a difference of definition, scope or timing between two systems, which is a business decision as much as a technical one.</li>
          </ul>
          <p>A suite that passes is not a guarantee that the data is true. It is a guarantee that the specific ways you know data goes wrong have been ruled out. That is a far stronger position than a chart that merely looks plausible, and it is the honest meaning of the word reliable.</p>
        </section>

        <section id="underneath">
          <h2>The dimensions of data quality, defined</h2>
          <ForTheBusiness>Each dimension is a question a board member could ask about a number, answered by a check that runs automatically.</ForTheBusiness>
          <p>Each check has a precise meaning worth stating, because loose definitions produce checks that never catch anything.</p>
          <p><strong>Completeness</strong> is whether the data you should have is present. It has two halves: no missing values in fields that must be filled, and no missing rows against an expected count. A table can be full of valid values and still be badly incomplete when a third of the day&rsquo;s transactions never arrived.</p>
          <p><strong>Uniqueness</strong> is the absence of unintended duplicates, so that each real-world thing appears once. You enforce it against a <strong>business key</strong>, the field that identifies the thing in the real world, such as an order reference or a customer ID, rather than a system-generated row number, which is unique by construction and proves nothing.</p>
          <p><strong>Validity</strong> is whether values conform to their type, range and domain. Type: a date column holds real dates. Range: an age sits between 0 and 120. Domain: a status is one of an allowed set, not free text. Validity is cheap to check and catches a surprising share of problems at the door.</p>
          <p><strong>Referential integrity</strong> is whether every child row has a valid parent key. A child row, such as an order line, references a parent, such as an order; referential integrity holds when no child points at a parent that does not exist. Break it and you get orphaned rows that silently drop out of any query that joins the two tables, quietly understating a total.</p>
          <p><strong>Freshness</strong> is whether the data is recent enough for the decision it supports. It is measured against the decision, not the clock: monthly board data refreshed weekly is fresh, while a live operational figure that is a day old may be stale. The check is the age of the newest record against an agreed limit.</p>
          <p><strong>Reconciliation</strong> is whether two independent sources agree at the record level, not just on the total. Matching totals can hide two errors that cancel out, and differing totals can be completely correct for a definitional reason. Only lining up the underlying rows tells you which. This is the same discipline behind <a href="/insights/why-dashboards-disagree">why numbers disagree across systems</a>: match records, classify every difference, and stop only when each difference has a reason.</p>
          <p>Three further ideas separate a basic check suite from a reliable one.</p>
          <p><strong>Distribution drift</strong> is when the shape of a metric changes unexpectedly, even though every value is individually valid. Average order value halves overnight, or the split of orders across regions shifts hard, with no business reason. Nothing is illegal, so type and range checks stay green; only watching the distribution over time catches it. Drift is the check that finds the problems you did not think to write a rule for.</p>
          <p><strong>Business-rule tests</strong> encode logic that is true for your organisation specifically: an invoice total equals the sum of its lines, a subscription cannot be active with no plan, a refund never exceeds the original charge. These catch errors that are perfectly valid in the abstract but impossible in your business.</p>
          <p><strong>Observability</strong>, sometimes called monitoring, is running all of the above continuously and recording the results, so you can see the health of an asset over time and be alerted the moment a check fails, rather than finding out in a meeting. A single pass tells you the data is fine now. Observability tells you it has stayed fine, and raises the alarm when it stops.</p>
          <p>The checks themselves are often simpler than they sound. A good pattern is the assertion query: a check written so that it returns rows only when something is wrong. No rows means the check passed. This makes the suite easy to automate, because any output at all is a failure to investigate.</p>
          <pre>{`-- Each query returns rows ONLY when the check fails.
-- Empty result = passed.

-- 1. Completeness / validity: a required key must never be null
select order_id
from   orders
where  customer_id is null;

-- 2. Uniqueness: a business key must not repeat
select order_ref, count(*) as rows_found
from   orders
group  by order_ref
having count(*) > 1;

-- 3. Referential integrity: every order must have a real customer
select o.order_id
from   orders o
left join customers c on c.customer_id = o.customer_id
where  c.customer_id is null;`}</pre>
          <p>The first query lists any order missing a customer, a completeness and validity failure in one. The second groups orders by their business reference and keeps only references that appear more than once, so every returned row is a duplicate. The third joins orders to customers and keeps the orders where no customer matched, which are the orphaned rows that break referential integrity. Run against clean data, all three return nothing. The day one of them returns rows, you have found a real problem before it reaches a decision.</p>
          <p>Finally, <strong>ownership</strong>. Every asset needs one named person who is accountable for its checks: for defining what good means, for the response when a check fails, and for the fix. Checks without an owner rot. They break, everyone assumes someone else is watching, and the suite quietly becomes decoration.</p>
        </section>

        <section id="example">
          <h2>Worked example: checking a portfolio company&rsquo;s monthly KPI pack</h2>
          <Example setting="Private equity · portfolio company monthly submissions" title="Six checks before the numbers reach the investment committee">
            <p>An investor receives a monthly KPI pack from each portfolio company as a spreadsheet: revenue, gross margin, cash, headcount, customer count and churn. Before consolidating, the portfolio team runs the same six checks on every submission:</p>
            <div className="in-table-wrap"><table>
              <thead><tr><th>Check</th><th>Applied to the pack</th><th>This month</th></tr></thead>
              <tbody>
                <tr><td>Completeness</td><td>Every KPI present for every month in the period</td><td>Pass</td></tr>
                <tr><td>Uniqueness</td><td>One row per company, KPI and month</td><td>Pass</td></tr>
                <tr><td>Validity</td><td>Churn between 0% and 100%; currency stated (£, $ or €)</td><td>Fail: one company reported churn as a count</td></tr>
                <tr><td>Referential integrity</td><td>Every company code exists in the portfolio list</td><td>Pass</td></tr>
                <tr><td>Freshness</td><td>Pack received within ten working days of month end</td><td>Fail: two companies late</td></tr>
                <tr><td>Reconciliation</td><td>Revenue ties to the management accounts within a stated tolerance</td><td>Fail: one company, explained by a reclassified credit note</td></tr>
              </tbody>
            </table></div>
            <p>Each failure goes back to a named contact at the company with the check that failed. Over a few months the KPI definitions harden into a shared dictionary, and the pack stops being argued about.</p>
          </Example>
        </section>

        <section id="good">
          <h2>What reliable data looks like in practice</h2>
          <p>Good does not mean the data is perfect. It means you can prove its state at any time, and you learn about problems before your stakeholders do. In practice that is five things.</p>
          <ul>
            <li>The checks run automatically on a schedule, next to the data, rather than by hand when someone gets nervous.</li>
            <li>They fail loudly. A failure raises an alert and, where the risk is high, holds the data back rather than publishing it.</li>
            <li>The tests live with the model and are versioned like code, so a change to a definition changes its test in the same place.</li>
            <li>Failures land in an exception process: a queue of records to review and fix, with someone responsible for clearing it.</li>
            <li>Every critical asset has one owner, and the health of each asset is visible over time.</li>
          </ul>
          <p>When these hold, the reliability question answers itself. You no longer defend a number in a meeting. You point at its checks.</p>
        </section>

        <section id="wrong">
          <h2>Common data quality mistakes</h2>
          <ul>
            <li>Judging reliability by eye. A dashboard that looks right is the single most common reason a wrong number survives.</li>
            <li>Reconciling on totals alone. Totals can match by accident and differ for good reasons; only records settle it.</li>
            <li>Writing checks so loose they never fail. A check that has never once failed is usually not proving anything.</li>
            <li>Ignoring freshness. Every value can be correct and the figure still wrong because it is a day old.</li>
            <li>Treating all drift as an error, or none of it. Some distribution shifts are real business change and some are broken pipelines. The check flags the shift; a person decides which it is.</li>
            <li>Running checks with no owner. Unowned checks break silently and the suite becomes theatre.</li>
          </ul>
        </section>

        <section id="boundary">
          <h2>When reliability needs to be a system</h2>
          <p>The afternoon of checks is worth doing, and for a small, stable setup it can be enough on its own. It stops being enough when reliability has to be continuous, automated and owned across many assets rather than proven by hand now and then. At that point you are not answering a question. You are running data quality as a system, and it needs to be built like one.</p>
          <SystemBoundary
            conditions={[
              "Decisions depend on the data every day, so the checks have to run on a schedule and alert on failure, not wait for someone to feel uneasy.",
              "There are more critical assets than one person can check by hand, and each has its own definition of good.",
              "Failures need an exception process, with records queued, triaged and fixed, rather than patched by hand each time.",
              "Distribution drift and business-rule breaches have to be caught automatically, because no one is watching every metric by eye.",
              "Ownership has to be explicit and durable, so a check still has a responsible person after the person who wrote it has moved on.",
            ]}
          />
          <p>If several checks are failing at once and it is hard to know where to start, that is a sequencing problem in its own right, and is what a <a href="/data-diagnostic">Data Diagnostic</a> is for: an outside read that ends in an ordered list of what to fix first.</p>
        </section>

        <section id="decision">
          <h2>Data quality checks: a decision guide</h2>
          <p>Each dimension maps to one check and one clear meaning when it fails. Use this as a quick lookup while you build the suite.</p>
          <table className="article-table">
            <thead>
              <tr>
                <th>Dimension</th>
                <th>The check</th>
                <th>What a failure means</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Completeness</td>
                <td>Count rows and nulls in required fields against expectation</td>
                <td>Data is missing: dropped rows, a late feed, or a field the source never sent</td>
              </tr>
              <tr>
                <td>Uniqueness</td>
                <td>Group by the business key; flag any key appearing more than once</td>
                <td>Unintended duplicates: a double load or a join that fanned out</td>
              </tr>
              <tr>
                <td>Validity</td>
                <td>Test values against type, range and allowed domain</td>
                <td>Illegal values got in: bad parsing or an unconstrained source</td>
              </tr>
              <tr>
                <td>Referential integrity</td>
                <td>Left join child to parent; flag children with no parent</td>
                <td>Orphaned rows that silently drop out of joined totals</td>
              </tr>
              <tr>
                <td>Freshness</td>
                <td>Compare the newest record&rsquo;s age to an agreed limit</td>
                <td>The figure is stale for the decision, even when every value is correct</td>
              </tr>
              <tr>
                <td>Reconciliation</td>
                <td>Match records against an independent source; account for each difference</td>
                <td>Two systems disagree on scope, timing or definition</td>
              </tr>
              <tr>
                <td>Distribution drift</td>
                <td>Watch a metric&rsquo;s shape over time; flag unexpected shifts</td>
                <td>Something changed: a broken pipeline, or real business change to explain</td>
              </tr>
              <tr>
                <td>Business-rule</td>
                <td>Assert logic that must always hold in your business</td>
                <td>An impossible state exists: the data or the logic is broken</td>
              </tr>
            </tbody>
          </table>
          <p>Work down the guide once and you will know, with evidence rather than hope, whether your data is reliable and exactly which check to trust it against.</p>
          <p>Freshness is the check teams most often get wrong; the <a href="/resources/data-freshness-sla-calculator">data freshness SLA calculator</a> works out what you can promise from your pipeline&rsquo;s schedules. Replicated application data needs its own checks, covered in <a href="/insights/change-data-capture">how to make CDC reliable</a>. If you want the checks defined and running for you, start with <a href="/data-diagnostic">a Data Diagnostic</a>.</p>
          <p>For a structured first pass across all your data, use the <a href="/resources/data-diagnostic-checklist">data audit checklist and priority matrix</a>.</p>
        </section>
      </ArticleLayout>
    </PageShell>
  );
}
