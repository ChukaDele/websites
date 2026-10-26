import { PageShell } from "../../../components/site/PageShell";
import { ArticleLayout, TryThisFirst, SystemBoundary, Diagram, Example, Pull, PlainEnglish, ForTheBusiness } from "../../../components/insights/Article";
import { insightMetadata } from "../../../lib/insights";

const SLUG = "warehouse-migration-parity";
const TOC = [
  { id: "why", label: "Why migrations stall at sign-off" },
  { id: "try-first", label: "Set up the comparison" },
  { id: "levels", label: "Four levels of parity" },
  { id: "sql", label: "Parity checks in SQL" },
  { id: "normalise", label: "Normalise before you hash" },
  { id: "parallel", label: "Parallel runs and sign-off" },
  { id: "example", label: "Worked example: a 0.3% gap" },
  { id: "wrong", label: "Common parity mistakes" },
  { id: "boundary", label: "When parity needs a project" },
  { id: "decision", label: "Difference to first check" },
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
            title="Four levels of parity, from cheapest to most precise"
            caption="Start with counts by day; go deeper only where a level shows a difference. Each level narrows down where the difference is."
          >
            <svg viewBox="0 0 720 220" xmlns="http://www.w3.org/2000/svg" style={F} fontSize="11" fill="#2c3a36" textAnchor="middle">
              {[["1. row counts by day", "which days differ"], ["2. key sets", "which rows are missing"], ["3. row hashes", "which rows changed"], ["4. measure totals", "how much it matters"]].map(([a, b], i) => (
                <g key={a}>
                  <rect x={30 + i * 40} y={20 + i * 46} width={660 - i * 80} height="38" rx="4" fill={i === 3 ? "rgba(144,210,111,.16)" : "#fff"} stroke={i === 3 ? "#90d26f" : "rgba(20,35,33,.35)"} />
                  <text x="360" y={44 + i * 46}>{a} · <tspan fill="#7a847f">{b}</tspan></text>
                </g>
              ))}
            </svg>
          </Diagram>
        }
      >
        <section id="why">
          <h2>Why do warehouse migrations stall at sign-off?</h2>
          <p>Because nobody can show the new numbers equal the old ones. A migration to Snowflake, BigQuery, Databricks or Fabric, or from Looker logic into dbt, changes engines, functions, types and sometimes business logic. Finance will not switch off the old reports until the new ones match, and &ldquo;the totals look about the same&rdquo; is not evidence.</p>
          <PlainEnglish>
            <p>When you move data to a new platform, you need proof that every important number is the same, or that each difference is understood and accepted. That proof comes from comparing the old and new systems table by table, from simple counts down to individual records, and running both side by side through at least one month-end.</p>
            <ul>
              <li><strong>Ask your team</strong>: for each migrated table, what has been compared, at what level, and what differences remain?</li>
              <li><strong>Expect back</strong>: a sign-off list where every difference is zero or explained, approved by the person who owns the number.</li>
            </ul>
          </PlainEnglish>
          <Pull>Parity is not &ldquo;the totals match&rdquo;. It is every difference either zero or written down.</Pull>
        </section>

        <section id="try-first">
          <h2>How to set up a migration parity comparison</h2>
          <ForTheBusiness>Agreeing what to compare up front stops the sign-off turning into a debate at the end.</ForTheBusiness>
          <TryThisFirst title="Before you compare anything">
            <ol>
              <li>List the tables and reports in scope, ranked by how much decisions depend on them.</li>
              <li>For each table, write its grain (what one row is) and its primary key.</li>
              <li>Choose the measures that matter: revenue, quantity, cost, counts.</li>
              <li>Agree tolerances in writing with the owner, for example zero difference on counts and keys, and no more than a penny per row on amounts after rounding.</li>
              <li>Make both copies reachable from one place: copy the old output into a <code>legacy</code> schema on the new platform, so checks run in one engine.</li>
            </ol>
          </TryThisFirst>
        </section>

        <section id="levels">
          <h2>The four levels of migration parity testing</h2>
          <ForTheBusiness>The cheap checks find most problems; the expensive ones explain the rest.</ForTheBusiness>
          <ol>
            <li><strong>Row counts and totals by day</strong>: cheapest, and shows which days differ. Run it on every table.</li>
            <li><strong>Key sets</strong>: lists primary keys present in one side and not the other. Shows missing or extra rows.</li>
            <li><strong>Row hashes</strong>: a hash (a short fingerprint) of each row&rsquo;s columns, compared key by key. Shows rows whose values changed.</li>
            <li><strong>Measure totals by dimension</strong>: sums by month, region or product, the way the reports present them. Shows how much each difference matters.</li>
          </ol>
          <p>Go to the next level only where the previous one shows a difference. Counts by day are fast enough to run daily for the whole migration.</p>
        </section>

        <section id="sql">
          <h2>Migration parity checks in SQL</h2>
          <ForTheBusiness>These queries turn &ldquo;it looks right&rdquo; into a list of specific rows that differ.</ForTheBusiness>
          <p>The examples use Snowflake, with the old output copied into a <code>legacy</code> schema. Counts and totals by day, side by side, returning only days that differ:</p>
          <pre>{`with old_side as (
    select order_date, count(*) as row_count, sum(amount) as amount
    from legacy.fct_orders
    group by order_date
),
new_side as (
    select order_date, count(*) as row_count, sum(amount) as amount
    from analytics.fct_orders
    group by order_date
)
select
    coalesce(o.order_date, n.order_date) as order_date,
    o.row_count as old_rows,  n.row_count as new_rows,
    o.amount    as old_amount, n.amount   as new_amount
from old_side as o
full outer join new_side as n on n.order_date = o.order_date
where o.row_count is distinct from n.row_count
   or o.amount    is distinct from n.amount
order by 1;`}</pre>
          <p>Keys present on only one side:</p>
          <pre>{`select
    coalesce(o.order_id, n.order_id) as order_id,
    iff(o.order_id is null, 'only_in_new', 'only_in_old') as side
from legacy.fct_orders as o
full outer join analytics.fct_orders as n on n.order_id = o.order_id
where o.order_id is null or n.order_id is null;`}</pre>
          <p>Rows whose values changed, comparing a hash of normalised columns for each key:</p>
          <pre>{`with old_rows as (
    select order_id,
           hash(customer_id, upper(trim(status)), round(amount, 2),
                to_varchar(order_ts, 'YYYY-MM-DD HH24:MI:SS')) as row_hash
    from legacy.fct_orders
),
new_rows as (
    select order_id,
           hash(customer_id, upper(trim(status)), round(amount, 2),
                to_varchar(order_ts, 'YYYY-MM-DD HH24:MI:SS')) as row_hash
    from analytics.fct_orders
)
select o.order_id
from old_rows as o
join new_rows as n on n.order_id = o.order_id
where o.row_hash <> n.row_hash;`}</pre>
          <p>For a single fingerprint of a whole table, Snowflake&rsquo;s <code>HASH_AGG</code> is order-independent, so the same rows in a different order give the same value. On BigQuery, hash each row with <code>FARM_FINGERPRINT</code> and add the results as <code>BIGNUMERIC</code>, which avoids integer overflow; avoid <code>BIT_XOR</code> for this, because two identical rows cancel each other out and duplicates become invisible.</p>
          <pre>{`-- Snowflake: one fingerprint per table
select hash_agg(order_id, customer_id, upper(trim(status)), round(amount, 2))
from analytics.fct_orders;`}</pre>
          <pre>{`-- BigQuery: one fingerprint per table
select sum(cast(farm_fingerprint(to_json_string(struct(
           order_id, customer_id, upper(trim(status)), round(amount, 2)
       ))) as bignumeric)) as table_fingerprint
from analytics.fct_orders;`}</pre>
          <p>Never compare hash values across platforms; each engine hashes differently. Across platforms, compare counts, keys and totals.</p>
        </section>

        <section id="normalise">
          <h2>Why hashes differ when the data looks the same</h2>
          <ForTheBusiness>Most &ldquo;differences&rdquo; in the first run are formatting, not wrong numbers, and normalising removes them.</ForTheBusiness>
          <p>Normalise every column the same way on both sides before hashing:</p>
          <ul>
            <li><strong>Time zones</strong>: convert timestamps to UTC before formatting them.</li>
            <li><strong>Decimals</strong>: round to the precision the business uses; engines store and sum floating-point values differently.</li>
            <li><strong>Text</strong>: trim spaces and pick one case for codes and statuses.</li>
            <li><strong>NULLs and blanks</strong>: decide whether an empty string equals NULL, and apply it to both sides.</li>
            <li><strong>Booleans and dates</strong>: format them as text in one fixed format.</li>
          </ul>
        </section>

        <section id="parallel">
          <h2>How long to run old and new in parallel</h2>
          <ForTheBusiness>A parallel run through month-end is what gives finance the confidence to switch off the old reports.</ForTheBusiness>
          <p>Run both pipelines on the same source data and compare daily for at least one full month-end close, because adjustments, late postings and period locks only happen then. Sign-off is a document, not a meeting: each table, each level checked, each remaining difference with its cause and the owner who accepted it.</p>
        </section>

        <section id="example">
          <h2>Worked example: a 0.3% revenue gap after migration</h2>
          <Example setting="Group · SQL Server to Snowflake, dbt" title="Counts match, revenue does not">
            <p>Row counts match every day, but monthly revenue on the new platform is 0.3% lower.</p>
            <ol>
              <li>The row-hash check flags 4% of orders, all with amounts that differ by fractions of a penny: a rounding difference in currency conversion, accepted by finance after rounding to two decimals.</li>
              <li>Totals by region show the remaining gap sits in one region.</li>
              <li>The key check shows nothing missing; the hash check shows changed statuses. The legacy SQL treated &ldquo;cancelled&rdquo; and &ldquo;Cancelled&rdquo; differently, so some cancelled orders counted as revenue in the old system.</li>
            </ol>
            <p>The new figure is the correct one. The difference is documented, approved by the finance director, and the old reports are retired.</p>
          </Example>
        </section>

        <section id="wrong">
          <h2>Common migration parity mistakes</h2>
          <ul>
            <li>Comparing grand totals only, where errors can cancel out.</li>
            <li>Hashing without normalising types, time zones and text.</li>
            <li>Comparing hashes across different platforms.</li>
            <li>Switching off the old system before a month-end parallel run.</li>
            <li>Treating every difference as a bug: some are the old system&rsquo;s errors, fixed.</li>
          </ul>
        </section>

        <section id="boundary">
          <h2>When migration parity needs a project</h2>
          <SystemBoundary
            conditions={[
              "Dozens of tables and reports must be signed off, with different owners.",
              "Business logic is being rewritten, for example from Looker or stored procedures into dbt.",
              "The old and new platforms cannot query each other, so data must be copied for comparison.",
              "A hard deadline, such as a licence or hardware end date, limits the parallel run.",
              "Finance needs an auditable sign-off record.",
            ]}
          />
        </section>

        <section id="decision">
          <h2>Parity differences and what to check first</h2>
          <div className="in-table-wrap"><table>
            <thead><tr><th>Difference</th><th>Check first</th></tr></thead>
            <tbody>
              <tr><td>Counts differ on some days</td><td>Time zone of the date column; late-arriving rows; filters</td></tr>
              <tr><td>Keys only in old</td><td>Filters or joins that drop rows in the new logic</td></tr>
              <tr><td>Keys only in new</td><td>Duplicates from a join that fans out; deleted rows not excluded</td></tr>
              <tr><td>Hashes differ, totals match</td><td>Formatting: rounding, case, spaces, NULL handling</td></tr>
              <tr><td>Totals differ by a small percentage</td><td>Rounding and currency conversion order</td></tr>
            </tbody>
          </table></div>
          <p>The classification of differences is the same one used in <a href="/insights/why-dashboards-disagree">why Finance and Sales numbers don&rsquo;t match</a>, and the <a href="/resources/revenue-reconciliation-checklist">revenue reconciliation workbench</a> helps record each one. If replicated sources feed the new platform, check <a href="/insights/change-data-capture">CDC reliability</a> too. To have the checks built and the sign-off run, see <a href="/services/data-projects">our migration projects</a> and <a href="/work">projects we have delivered</a>.</p>
          <p>Generate these checks for your own tables and platform with the <a href="/resources/migration-validation-sql-generator">migration validation SQL generator</a>.</p>
        </section>
      </ArticleLayout>
    </PageShell>
  );
}
