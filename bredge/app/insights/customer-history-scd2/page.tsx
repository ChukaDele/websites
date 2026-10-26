import { PageShell } from "../../../components/site/PageShell";
import { ArticleLayout, TryThisFirst, SystemBoundary, Diagram, Example, Pull, PlainEnglish, ForTheBusiness } from "../../../components/insights/Article";
import { insightMetadata } from "../../../lib/insights";

const SLUG = "customer-history-scd2";
const TOC = [
  { id: "why", label: "Why past reports change" },
  { id: "try-first", label: "How to test if history is rewritten" },
  { id: "types", label: "SCD types 0, 1, 2 and 3" },
  { id: "snapshots", label: "How dbt snapshots work" },
  { id: "join", label: "How to join facts to an SCD2 table" },
  { id: "backdated", label: "How to handle backdated changes" },
  { id: "example", label: "Worked example: a customer moves region" },
  { id: "wrong", label: "Common ways this goes wrong" },
  { id: "boundary", label: "When history needs a project" },
  { id: "decision", label: "Which history model to use" },
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
            title="One customer, two versions, and the invoices that belong to each"
            caption="A type 2 dimension keeps one row per version with a half-open validity interval. Each invoice joins to the version valid at its date, so revenue stays with the region it was earned in. Illustrative."
          >
            <svg viewBox="0 0 720 220" xmlns="http://www.w3.org/2000/svg" style={F} fontSize="11" fill="#2c3a36">
              <line x1="40" y1="120" x2="690" y2="120" stroke="rgba(20,35,33,.35)" />
              {["Jan", "Apr", "Jul", "Oct", "Dec"].map((m, i) => (
                <g key={m}><line x1={40 + i * 162} y1="114" x2={40 + i * 162} y2="126" stroke="rgba(20,35,33,.35)" /><text x={40 + i * 162} y="144" textAnchor="middle" fill="#7a847f">{m}</text></g>
              ))}
              <rect x="40" y="58" width="324" height="36" rx="4" fill="rgba(240,191,108,.18)" stroke="#f0bf6c" />
              <text x="52" y="81">v1 · region = North · valid_from Jan · valid_to Jul</text>
              <rect x="364" y="58" width="326" height="36" rx="4" fill="rgba(144,210,111,.16)" stroke="#90d26f" />
              <text x="376" y="81">v2 · region = London · valid_to null (current)</text>
              {[90, 170, 250, 330, 420, 500, 580, 660].map((x) => (
                <circle key={x} cx={x} cy="120" r="5" fill={x < 364 ? "#f0bf6c" : "#90d26f"} />
              ))}
              <text x="40" y="186" fill="#7a847f">● invoices: each joins to the version whose interval contains its date</text>
              <text x="40" y="206" fill="#7a847f">as was: Jan to Jun revenue stays North · as is: all revenue shows London</text>
            </svg>
          </Diagram>
        }
      >
        <section id="why">
          <h2>Why do past reports change when someone edits a customer?</h2>
          <p>Because the customer table holds only the current state. When sales operations moves a customer from the North region to London, the row is updated in place. Every report that groups revenue by region joins invoices to that row, so every past invoice now reports under London. Last year&rsquo;s North revenue drops, London&rsquo;s rises, and nobody restated anything on purpose.</p>
          <PlainEnglish>
            <p>When someone moves a customer to a new region in the CRM, most reporting setups quietly move all of that customer&rsquo;s past revenue too. Last year&rsquo;s regional figures change and nobody approved it. Keeping a dated history of each customer record fixes this: past revenue stays where it was earned, and today&rsquo;s structure is still there for planning.</p>
            <ul>
              <li><strong>Ask your team</strong>: if we reran last quarter&rsquo;s board pack today, would the regional numbers match?</li>
              <li><strong>Decide</strong>: which reports use the region at the time of sale, and which use the current region.</li>
            </ul>
          </PlainEnglish>
          <p>The same thing happens with segment, account owner, industry, price list, product category and cost centre. It is one of the quieter reasons <a href="/insights/why-dashboards-disagree">numbers disagree between reports</a>: the board pack was produced in March from one version of the truth, and the dashboard in October shows another.</p>
          <Pull>If a dimension is overwritten in place, every past report that uses it is restated the moment someone saves an edit.</Pull>
        </section>

        <section id="try-first">
          <h2>How to test whether your reports rewrite history</h2>
          <TryThisFirst title="A two-snapshot test">
            <ol>
              <li>Pick a closed period, such as last quarter, and a report grouped by a customer attribute (revenue by region or by segment).</li>
              <li>Export it today, with the totals per group.</li>
              <li>Export it again in a month, after normal account changes have happened.</li>
              <li>If totals per group differ while the overall total is unchanged, attributes are being overwritten and history is moving.</li>
              <li>For faster evidence, compare the closed-quarter figures in the last board pack with the same report today.</li>
            </ol>
          </TryThisFirst>
        </section>

        <section id="types">
          <h2>Slowly changing dimension types explained: as was vs as is</h2>
          <ForTheBusiness>The type you choose decides whether past reports can change after they are published.</ForTheBusiness>
          <p>Reports ask two legitimate questions, and they need different data:</p>
          <ul>
            <li><strong>As was</strong>: the region the revenue belonged to when it was earned. Commission, historical performance and past board packs need this.</li>
            <li><strong>As is</strong>: history regrouped under today&rsquo;s structure. Territory planning and like-for-like comparison after a reorganisation need this.</li>
          </ul>
          <p>Neither is wrong. The mistake is answering one when the reader assumes the other.</p>
          <p>A dimension is a descriptive table such as customers or products; one that changes occasionally is a <strong>slowly changing dimension</strong> (SCD). The SCD types, in Kimball&rsquo;s numbering, describe how to handle the change:</p>
          <div className="in-table-wrap"><table>
            <thead><tr><th>Type</th><th>What happens on change</th><th>Answers</th></tr></thead>
            <tbody>
              <tr><td>Type 0</td><td>Never changes (the original value is kept)</td><td>Attribute at creation, such as original acquisition channel</td></tr>
              <tr><td>Type 1</td><td>Overwrite in place</td><td>As is only. History is restated.</td></tr>
              <tr><td>Type 2</td><td>Close the current row, insert a new row with validity dates</td><td>As was, and as is via the current row</td></tr>
              <tr><td>Type 3</td><td>Keep the previous value in an extra column</td><td>Current and one prior value, for a single planned change</td></tr>
            </tbody>
          </table></div>
          <p>Type 2 is the workhorse. Each version of a customer is a row with <code>valid_from</code> and <code>valid_to</code>; the current version has an open <code>valid_to</code>. Any fact can then be joined to the version that was valid on its date.</p>
        </section>

        <section id="snapshots">
          <h2>How dbt snapshots work: configuration and caveats</h2>
          <ForTheBusiness>Snapshots are the history record. Anything they do not capture cannot be recovered later.</ForTheBusiness>
          <p>If the source system keeps no history, something has to record each version as it changes. In a dbt project that is usually a <strong>snapshot</strong>. On each run, dbt compares the current source rows with the stored history; changed rows are closed by setting <code>dbt_valid_to</code>, and a new version is inserted with <code>dbt_valid_from</code>. From dbt 1.9, snapshots are configured in YAML:</p>
          <pre>{`snapshots:
  - name: customers_snapshot
    relation: ref('stg_crm__customers')
    config:
      schema: snapshots
      unique_key: customer_id
      strategy: timestamp
      updated_at: updated_at
      hard_deletes: new_record
      dbt_valid_to_current: "to_date('9999-12-31')"`}</pre>
          <ul>
            <li><strong>Strategy.</strong> <code>timestamp</code> uses the source&rsquo;s <code>updated_at</code> and is the recommended option when that column is trustworthy. <code>check</code> compares a list of columns and suits sources without a reliable timestamp; list the columns rather than using <code>all</code>.</li>
            <li><strong>Hard deletes.</strong> <code>ignore</code> (the default) leaves deleted customers looking current forever. <code>invalidate</code> closes them, leaving a gap. <code>new_record</code> inserts a row flagged <code>dbt_is_deleted</code>, so history has no gaps.</li>
            <li><strong>Open-ended rows.</strong> <code>dbt_valid_to_current</code> stores a far-future date instead of null, which simplifies joins and clustering.</li>
          </ul>
          <p>Two properties matter more than the syntax. First, a snapshot records the state <em>when it runs</em>. If a customer changes twice between runs, only the second change is kept, and the recorded dates are capture dates rather than the moment of the change. dbt recommends running snapshots frequently, typically hourly to daily. Second, a snapshot cannot be rebuilt: history not captured is gone, and <code>--full-refresh</code> does not touch it. Keep snapshots in their own schema with restricted permissions.</p>
          <p>Alternatives exist. Fivetran&rsquo;s history mode records versions at the connector with <code>_fivetran_start</code>, <code>_fivetran_end</code> and <code>_fivetran_active</code>. Log-based <a href="/insights/change-data-capture">change data capture</a> records every change with its commit position, which is the most complete source of all.</p>
        </section>

        <section id="join">
          <h2>How to join facts to a type 2 dimension (point-in-time join)</h2>
          <ForTheBusiness>This join assigns each sale to the right region. A wrong join loses revenue without any error.</ForTheBusiness>
          <p>Joining a fact to a type 2 dimension uses the natural key plus the date. Use half-open intervals (from inclusive, to exclusive), so a transaction at the exact moment of a change belongs to exactly one version.</p>
          <pre>{`-- Snowflake SQL
with first_version as (                      -- earliest known version per customer
    select *
    from customers_snapshot
    qualify row_number() over (partition by customer_id order by dbt_valid_from) = 1
)
select
    f.invoice_id,
    f.invoice_ts,
    f.amount_gbp,
    coalesce(c.region, first_c.region)  as region_at_sale,   -- as was
    cur.region                          as region_current    -- as is
from fct_invoices as f
left join customers_snapshot as c
    on  c.customer_id = f.customer_id
    and f.invoice_ts >= c.dbt_valid_from
    and f.invoice_ts <  c.dbt_valid_to                       -- far-future date for current rows
left join first_version as first_c
    on  first_c.customer_id = f.customer_id
left join customers_snapshot as cur
    on  cur.customer_id = f.customer_id
    and cur.dbt_valid_to = to_date('9999-12-31');`}</pre>
          <p>The <code>left join</code> and the fallback to the first version are deliberate. Invoices dated before the snapshot began have no version whose interval contains them. With an inner join they vanish, and revenue quietly falls. Decide the rule (earliest known version, or an explicit &ldquo;unknown&rdquo;) and test that the total before and after the join is identical.</p>
          <p>Three tests keep the dimension honest. Each returns rows only when something is wrong:</p>
          <pre>{`-- 1. Exactly one current row per customer
select customer_id from customers_snapshot
where dbt_valid_to = to_date('9999-12-31')
group by customer_id having count(*) > 1;

-- 2. No overlapping versions: each version starts where the previous one ended
select customer_id, dbt_valid_from, prev_valid_to
from (
    select customer_id, dbt_valid_from,
           lag(dbt_valid_to) over (partition by customer_id order by dbt_valid_from) as prev_valid_to
    from customers_snapshot
)
where prev_valid_to is not null and prev_valid_to > dbt_valid_from;

-- 3. Revenue is not lost or duplicated by the join
-- fct_invoices_with_region is the model built by the join above
select (select sum(amount_gbp) from fct_invoices)
     - (select sum(amount_gbp) from fct_invoices_with_region) as difference;  -- must be 0`}</pre>
          <p>Test 2 checks for overlaps, which would double-count. Gaps are expected after an invalidated hard delete, which is one reason to prefer <code>new_record</code>. In Power BI, expose both <code>region_at_sale</code> and <code>region_current</code> on the fact or through two clearly named dimensions, and say in the report which one each page uses.</p>
        </section>

        <section id="backdated">
          <h2>How to handle backdated changes: effective dates, not snapshots</h2>
          <ForTheBusiness>Backdated territory or commission changes need an approved record, or they restate history without sign-off.</ForTheBusiness>
          <p>The hardest case is a business change that is effective from a date in the past. Sales operations agrees on 20 April that a customer moves to London with effect from 1 April, and updates the CRM on 20 April. The snapshot records the change on 20 April. Invoices from 1 to 19 April still join to North, which is what the system saw but not what the business decided.</p>
          <p>A snapshot cannot fix this, because it only knows when it saw the change. When the effective date matters (territories, commission plans, cost-centre reorganisations), keep an <strong>effective-dated mapping table</strong> owned by the business: customer, region, <code>effective_from</code>, <code>effective_to</code>, who approved it. The point-in-time join is the same; only the source of truth for the intervals changes. Changes to a closed period then become a visible, approved restatement rather than a silent one.</p>
        </section>

        <section id="example">
          <h2>Worked example: which region owns revenue after a customer moves</h2>
          <Example setting="UK B2B services · HubSpot, Xero, dbt, Power BI" title="£120,000 of revenue, two honest answers">
            <p>A customer billed £10,000 a month moves from North to London on 1 July. Over the year they generate £120,000.</p>
            <div className="in-table-wrap"><table>
              <thead><tr><th>View</th><th>North</th><th>London</th><th>Use for</th></tr></thead>
              <tbody>
                <tr><td>Type 1 (overwritten)</td><td>£0</td><td>£120,000</td><td>Nothing historical: H1 board pack no longer reproduces</td></tr>
                <tr><td>Type 2, as was</td><td>£60,000</td><td>£60,000</td><td>Commission, regional performance, past packs</td></tr>
                <tr><td>Type 2, as is</td><td>£0</td><td>£120,000</td><td>Planning next year&rsquo;s London territory</td></tr>
              </tbody>
            </table></div>
            <p>The North manager&rsquo;s first-half number in the board pack was £60,000. Under type 1 it later shows as zero, which is how the problem was found.</p>
          </Example>
        </section>

        <section id="wrong">
          <h2>Common ways this goes wrong</h2>
          <ul>
            <li>Snapshotting a source whose <code>updated_at</code> is not maintained, with the timestamp strategy. Changes are never detected.</li>
            <li>Running snapshots weekly on attributes that change daily, so intermediate states are lost.</li>
            <li>Inner-joining facts to the snapshot and losing everything before the first captured version.</li>
            <li>Using closed intervals (<code>between</code>) so a transaction on the boundary matches two versions.</li>
            <li>Treating capture dates as effective dates for backdated business changes.</li>
            <li>Rebuilding the snapshot schema during a migration and discovering it cannot be recreated.</li>
          </ul>
        </section>

        <section id="boundary">
          <h2>When dimension history needs a project</h2>
          <p>One snapshot for one attribute is a day&rsquo;s work. It becomes a project when several dimensions need history, effective dating is contested between teams, and past board packs must be reproducible. It is often paired with <a href="/insights/one-customer-view">resolving customer identity</a>, because a version history is only meaningful if the customer key is stable.</p>
          <SystemBoundary
            conditions={[
              "Closed-period figures by region, segment or owner change between board packs.",
              "Commission or bonuses depend on the attribute at the time of sale.",
              "Reorganisations are backdated and need an approved, auditable restatement.",
              "Several source systems each hold part of the customer's attributes.",
              "History exists only in people's memories or old exports.",
            ]}
          />
        </section>

        <section id="decision">
          <h2>SCD type 1 vs type 2: which should you use?</h2>
          <div className="in-table-wrap"><table>
            <thead><tr><th>Need</th><th>Model</th><th>Source of the intervals</th></tr></thead>
            <tbody>
              <tr><td>Current structure only, history may restate</td><td>Type 1</td><td>None needed</td></tr>
              <tr><td>As was reporting, changes effective when entered</td><td>Type 2</td><td>dbt snapshot, connector history mode or CDC</td></tr>
              <tr><td>As was reporting with backdated business decisions</td><td>Type 2</td><td>Effective-dated table owned by the business</td></tr>
              <tr><td>One planned reorganisation, compare old and new</td><td>Type 3</td><td>A previous-value column</td></tr>
              <tr><td>Group entities and reporting lines that change</td><td>Type 2 on the entity hierarchy</td><td>Finance-owned mapping with versions</td></tr>
            </tbody>
          </table></div>
          <p>The last row is the consolidation case: <a href="/insights/multi-entity-consolidation">entities, currencies and intercompany</a> need the same discipline for mappings and rates.</p>
          <p>Rebuilding past facts against a new history table is a backfill; the <a href="/resources/backfill-planner">backfill planner</a> helps you do it in checked chunks. Agree which attributes need history, and who owns them, in the <a href="/resources/kpi-dictionary-template">KPI dictionary template</a>. History only works on a stable key, so pair this with <a href="/insights/one-customer-view">how to build a single customer view</a>. A history model across several dimensions is a scoped <a href="/services/data-projects">data modelling project</a>.</p>
        </section>
      </ArticleLayout>
    </PageShell>
  );
}
