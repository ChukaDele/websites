import { PageShell } from "../../../components/site/PageShell";
import { ArticleLayout, TryThisFirst, SystemBoundary, Diagram, Example, Pull, PlainEnglish, ForTheBusiness } from "../../../components/insights/Article";
import { insightMetadata } from "../../../lib/insights";

const SLUG = "incremental-models-at-scale";
const TOC = [
  { id: "why", label: "Why costs grow faster than data" },
  { id: "try-first", label: "How to find your most expensive models" },
  { id: "strategies", label: "dbt incremental strategies compared" },
  { id: "pruning", label: "How partition pruning works" },
  { id: "late", label: "How to handle late-arriving data in dbt" },
  { id: "estimate", label: "How to estimate query cost" },
  { id: "example", label: "Worked example: three years of events" },
  { id: "wrong", label: "Common ways this goes wrong" },
  { id: "boundary", label: "When cost work needs a project" },
  { id: "decision", label: "Which strategy to use" },
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
            title="A full rebuild reads all history; an incremental run reads only the recent partitions"
            caption="Each block is one daily partition. The full rebuild scans every one, every run. The incremental run reads the new day plus a short lookback window, and replaces only those partitions in the target. Illustrative."
          >
            <svg viewBox="0 0 720 250" xmlns="http://www.w3.org/2000/svg" style={F} fontSize="11" fill="#2c3a36">
              <text x="20" y="28">FULL REBUILD · every run scans all partitions</text>
              {Array.from({ length: 30 }).map((_, i) => (
                <rect key={`a${i}`} x={20 + i * 22} y="40" width="18" height="34" rx="2" fill="rgba(240,191,108,.35)" stroke="#f0bf6c" />
              ))}
              <text x="20" y="96" fill="#7a847f">bytes read grow with history: day 1,000 costs about 1,000 times day 1</text>

              <text x="20" y="146">INCREMENTAL · new day + 3-day lookback, replace those partitions only</text>
              {Array.from({ length: 30 }).map((_, i) => (
                <rect key={`b${i}`} x={20 + i * 22} y="158" width="18" height="34" rx="2" fill={i >= 26 ? "rgba(144,210,111,.3)" : "#fff"} stroke={i >= 26 ? "#90d26f" : "rgba(20,35,33,.2)"} strokeWidth={i >= 26 ? 1.8 : 1} />
              ))}
              <path d="M592 206 h86" stroke="#90d26f" strokeWidth="1.5" />
              <text x="592" y="224" fill="#3c6b43">lookback + new day</text>
              <text x="20" y="224" fill="#7a847f">untouched history: never read, never rewritten</text>
            </svg>
          </Diagram>
        }
      >
        <section id="why">
          <h2>Why do warehouse costs grow faster than the data?</h2>
          <p>Because most models are rebuilt from scratch. A model materialised as a table recomputes its whole history on every run, so a table that gains one day of data a day costs a little more every single day, forever. Multiply that by every downstream model that also rebuilds, and by every schedule that runs it more than once a day, and the bill grows with history times frequency, not with the data you actually added.</p>
          <PlainEnglish>
            <p>Your warehouse bill depends on how much data each scheduled job reads and writes, not on how much data you hold. Many jobs re-read years of history every night to add one day. Rewriting the largest of them to process only recent days cuts what those jobs cost, without changing any report.</p>
            <ul>
              <li><strong>Ask your team</strong>: which ten jobs read the most data last week, and do they rebuild history on every run?</li>
              <li><strong>Expect back</strong>: a short list of models to change, a before-and-after figure for each, and a rule for late-arriving data.</li>
            </ul>
          </PlainEnglish>
          <p>How that turns into money depends on the platform. On BigQuery on-demand pricing you pay for bytes processed, and pruned partitions are not counted. On Snowflake you pay for the time a virtual warehouse is running, in credits that double with each size step, billed per second with a 60-second minimum each time it resumes. On Databricks you pay for compute time. In every case the lever is the same: read less, and write only what changed.</p>
          <Pull>At scale the expensive query is rarely the clever one. It is the innocent nightly model that reads three years of history to add one day.</Pull>
          <p>Three mechanisms do almost all of the work: an incremental materialisation with the right strategy, a physical layout (partitioning and clustering) the engine can skip through, and a filter written so the engine can actually use that layout. This guide covers each, with dbt as the example because it is the common transformation layer, but the mechanics are the warehouse&rsquo;s, not dbt&rsquo;s.</p>
        </section>

        <section id="try-first">
          <h2>How to find the most expensive queries in BigQuery and Snowflake</h2>
          <ForTheBusiness>Measuring first shows which few jobs drive the bill, so engineering time goes where the savings are.</ForTheBusiness>
          <p>Rank models by what they read before you change any of them. A handful of models usually account for most of the spend, and they are not always the ones people suspect.</p>
          <TryThisFirst title="One query on each platform">
            <ol>
              <li>On BigQuery, list last week&rsquo;s most expensive queries from the jobs view in your region. dbt adds a comment with the model name to each query, which makes the result readable.</li>
              <li>On Snowflake, list the queries that scanned the most, with partitions scanned against partitions total. A ratio near 1 on a large table means no pruning.</li>
              <li>For the top ten, write down: materialisation, run frequency, rows added per run, and whether the filter on the source prunes.</li>
            </ol>
          </TryThisFirst>
          <pre>{`-- BigQuery: last 7 days, most bytes billed first
select
  user_email,
  left(query, 120)                          as query_start,
  total_bytes_billed / pow(1024, 4)         as tib_billed,
  total_slot_ms / 1000 / 3600               as slot_hours
from \`region-eu\`.INFORMATION_SCHEMA.JOBS_BY_PROJECT
where creation_time >= timestamp_sub(current_timestamp(), interval 7 day)
  and job_type = 'QUERY'
order by total_bytes_billed desc
limit 20;

-- Snowflake: last 7 days, most bytes scanned first
select
  query_id, warehouse_name, warehouse_size,
  total_elapsed_time / 1000                 as seconds,
  partitions_scanned, partitions_total,
  bytes_scanned
from snowflake.account_usage.query_history
where start_time >= dateadd(day, -7, current_timestamp())
order by bytes_scanned desc
limit 20;`}</pre>
          <p>Swap <code>region-eu</code> for the region your datasets live in. Snowflake&rsquo;s <code>account_usage</code> views lag behind real time, so run this the next morning rather than straight after a deploy.</p>
        </section>

        <section id="strategies">
          <h2>dbt incremental strategies: merge vs insert_overwrite vs delete+insert vs microbatch</h2>
          <ForTheBusiness>The strategy decides whether each run rewrites years of data or only the last few days, which is most of the cost difference.</ForTheBusiness>
          <p>An incremental model builds the table once. Each later run processes a filtered slice of the source and writes it into the existing table. The strategy decides how dbt writes that slice, and it drives most of the cost difference:</p>
          <div className="in-table-wrap"><table>
            <thead><tr><th>Strategy</th><th>What it does</th><th>What it reads</th><th>Watch out for</th></tr></thead>
            <tbody>
              <tr><td>append</td><td>Inserts the new rows, nothing else</td><td>The source slice only</td><td>No de-duplication: a re-delivered row is inserted twice</td></tr>
              <tr><td>merge</td><td>Updates rows whose unique key exists, inserts the rest</td><td>The source slice and the destination, to find matches</td><td>Destination scan grows with the table unless limited; on Snowflake a non-unique key fails as a nondeterministic merge</td></tr>
              <tr><td>delete+insert</td><td>Deletes target rows matching the incoming keys, then inserts</td><td>Source slice; destination by key</td><td>Useful where merge is unsupported or keys repeat; no history kept</td></tr>
              <tr><td>insert_overwrite (BigQuery, Spark)</td><td>Replaces whole partitions with the new result</td><td>The source slice; only the affected target partitions</td><td>Every row in a replaced partition must be in the new result, or it disappears</td></tr>
              <tr><td>microbatch</td><td>Splits the run into time batches by an event_time column, each replaced atomically</td><td>One batch of source per query, filtered automatically</td><td>Needs a reliable event time; parents without event_time are read in full for every batch</td></tr>
            </tbody>
          </table></div>
          <p>Two adapter details catch people out. On BigQuery, dbt&rsquo;s default is <code>merge</code>, and dbt&rsquo;s own documentation warns that merge has to scan the source tables in the model and the destination table, which is slow and expensive at volume. On Snowflake, dbt&rsquo;s <code>insert_overwrite</code> is not a partition operation at all: it replaces the entire table, much like a truncate and reinsert. So the BigQuery advice &ldquo;use insert_overwrite for big date-partitioned facts&rdquo; does not transfer.</p>
          <h3>How to use insert_overwrite on BigQuery with static partitions</h3>
          <p>For an append-mostly fact table, such as events or ledger lines, replacing the last few daily partitions is usually the cheapest correct option. Listing the partitions explicitly (static partitions) is the fastest and cheapest form, because dbt does not need extra queries to work out which partitions to replace.</p>
          <pre>{`{% set partitions_to_replace = [] %}
{% for i in range(3) %}
  {% do partitions_to_replace.append('date_sub(current_date, interval ' ~ i ~ ' day)') %}
{% endfor %}

{{ config(
    materialized         = 'incremental',
    incremental_strategy = 'insert_overwrite',
    partition_by         = {'field': 'event_date', 'data_type': 'date'},
    cluster_by           = ['account_id', 'event_type'],
    partitions           = partitions_to_replace,
    require_partition_filter = true
) }}

select event_id, account_id, event_type, event_ts, date(event_ts) as event_date, payload_size
from {{ source('app', 'events') }}
{% if is_incremental() %}
  -- constant expression on the source's own partition column: prunes
  where event_date >= date_sub(current_date, interval 2 day)
{% endif %}`}</pre>
          <p>The model replaces today and the two previous days. The source filter covers exactly the same three days, which matters: any row in a replaced partition that is not in the new result is deleted. A source filter narrower than the partitions you replace silently loses data.</p>
          <h3>How to limit the merge scan on Snowflake with incremental_predicates</h3>
          <p>When rows genuinely update (orders that change status, subscriptions that change plan), merge is the natural fit. The cost to control is the destination side. <code>incremental_predicates</code> adds a condition to the merge so Snowflake only considers recent destination rows, and clustering the table on the same date lets it prune micro-partitions.</p>
          <pre>{`{{ config(
    materialized         = 'incremental',
    incremental_strategy = 'merge',
    unique_key           = 'order_id',
    cluster_by           = ['to_date(updated_at)'],
    incremental_predicates = [
      "DBT_INTERNAL_DEST.updated_at >= dateadd(day, -7, current_date)"
    ]
) }}

select order_id, customer_id, status, amount, updated_at
from {{ ref('stg_orders') }}
{% if is_incremental() %}
  where updated_at >= dateadd(day, -3, current_date)
{% endif %}`}</pre>
          <p>The edge case to understand: the predicate hides older destination rows from the merge. If an order last updated ten days ago changes today, its existing row is outside the seven-day window, is not matched, and the new version is inserted as a duplicate. The predicate window therefore has to be wider than the oldest row that can realistically change, and anything older needs a deliberate backfill. Pair it with a uniqueness test on <code>order_id</code>, so a breach fails loudly instead of inflating totals.</p>
          <h3>How dbt microbatch works</h3>
          <p>Microbatch (dbt 1.9 and later) formalises the pattern above. You declare <code>event_time</code>, a <code>batch_size</code> (hour, day, month or year), a <code>begin</code> date and an optional <code>lookback</code> (default 1). dbt runs one independent query per batch and writes each with the adapter&rsquo;s atomic replacement: <code>insert_overwrite</code> on BigQuery, <code>delete+insert</code> on Snowflake and Redshift, <code>replace_where</code> on Databricks, <code>merge</code> on Postgres.</p>
          <pre>{`{{ config(
    materialized         = 'incremental',
    incremental_strategy = 'microbatch',
    event_time           = 'event_ts',
    batch_size           = 'day',
    begin                = '2023-01-01',
    lookback             = 3,
    full_refresh         = false,
    partition_by         = {'field': 'event_ts', 'data_type': 'timestamp', 'granularity': 'day'}
) }}

select event_id, account_id, event_type, event_ts
from {{ ref('stg_events') }}   -- filtered to each batch automatically if stg_events sets event_time`}</pre>
          <p>Upstream models and sources that declare <code>event_time</code> are filtered to the batch automatically. Ones that do not are read in full for every batch, so a microbatch model over an unconfigured parent can cost more than the table it replaced. <code>full_refresh = false</code> stops an accidental <code>--full-refresh</code> rebuilding years of history.</p>
        </section>

        <section id="pruning">
          <h2>Partitioning vs clustering, and how partition pruning works</h2>
          <ForTheBusiness>Pruning is how the warehouse skips data a query does not need. Write the filter wrongly and you pay to read the whole table.</ForTheBusiness>
          <p><strong>Partitioning</strong> splits a table into segments, usually by day, so a query can skip whole segments. <strong>Clustering</strong> sorts data within the table (within each partition, on BigQuery) by a few columns, so the engine can skip blocks whose value ranges cannot match. <strong>Pruning</strong> is the skipping itself, and it only happens when the engine can prove, before reading, which segments are irrelevant.</p>
          <h3>Partition pruning rules in BigQuery</h3>
          <ul>
            <li>Filter the partition column with a constant expression. Google&rsquo;s documentation is explicit that comparing the partition column with a subquery result is dynamic and prevents pruning.</li>
            <li>Keep the column bare on one side of the comparison. Wrapping it in an unsupported function forces a full scan; write <code>ts &gt;= &apos;2026-10-01&apos; and ts &lt; &apos;2026-10-02&apos;</code> rather than formatting <code>ts</code> into a string.</li>
            <li>Do not join the partition filter with <code>OR</code> to other conditions; the documentation notes that pruning will not work.</li>
            <li>Turn on <code>require_partition_filter</code> for large tables, so an unpruned query fails instead of billing. It applies to every reader, including other dbt models and tests, so add filters there too.</li>
            <li>Up to four clustering columns, and order matters: filters on the first clustered column benefit most.</li>
          </ul>
          <p>In dbt on BigQuery, the common <code>where event_date &gt; (select max(event_date) from {"{{ this }}"})</code> pattern is exactly the dynamic comparison that blocks pruning on the source. With dynamic insert_overwrite, dbt provides <code>_dbt_max_partition</code>, a BigQuery scripting variable holding the destination&rsquo;s latest partition, which can be used in the filter instead.</p>
          <h3>Micro-partitions and clustering keys in Snowflake</h3>
          <ul>
            <li>Tables are stored in micro-partitions (each roughly 50 to 500 MB of uncompressed data), with min and max values recorded per column. Pruning uses that metadata, so it works best when rows arriving together share dates.</li>
            <li>Large tables that are filtered on something other than arrival order benefit from a clustering key, and Snowflake maintains it automatically, which itself consumes credits. Cluster on the column your incremental filter and your heaviest queries use.</li>
            <li>The query profile shows partitions scanned against partitions total. That ratio is your pruning score for a query.</li>
          </ul>
          <p>Databricks follows the same logic with Delta tables: partition or use liquid clustering on the filter column, and the <code>replace_where</code> pattern microbatch uses to overwrite a time range.</p>
        </section>

        <section id="late">
          <h2>How to handle late-arriving data and backfills in dbt</h2>
          <ForTheBusiness>Late data is how dashboards end up quietly short. A lookback window keeps figures complete without rebuilding history.</ForTheBusiness>
          <p>Events do not arrive in order. Mobile clients sync hours later, partner files are re-sent, and finance restates last month. An incremental model that only ever reads &ldquo;newer than the last row I loaded&rdquo; loses every row that arrives after its window has passed.</p>
          <ul>
            <li><strong>Choose the time column deliberately.</strong> Filtering on when a row was loaded (an ingestion timestamp) never misses late arrivals, but places them in today&rsquo;s partition. Filtering on when the event happened puts rows where they belong, but needs a lookback to catch stragglers. Many teams filter on load time and partition on event time, replacing the event-date partitions touched by the new load.</li>
            <li><strong>Size the lookback from data, not hope.</strong> Measure the gap between event time and load time for a month: if 99.9% of rows arrive within two days, a three-day lookback is defensible. Rows later than that need a scheduled wider sweep, such as a weekly 30-day rebuild.</li>
            <li><strong>Make every run idempotent.</strong> Running the same window twice must produce the same table. Partition replacement and microbatch are idempotent by design; append is not.</li>
          </ul>
          <p>To rebuild a known window, for example after a source restates a week, rerun only those batches:</p>
          <pre>{`# microbatch: rebuild one week, one independent query per day
dbt run --select fct_events --event-time-start "2026-09-01" --event-time-end "2026-09-08"

# rerun only the batches that failed in the last invocation
dbt retry`}</pre>
          <p>For a non-microbatch model, the equivalent is a variable that widens the source filter and the replaced partitions for one run. Either way, a backfill is a normal, scoped operation, not a full refresh of three years.</p>
        </section>

        <section id="estimate">
          <h2>How to estimate BigQuery and Snowflake cost before you run a query</h2>
          <ForTheBusiness>You can know what a change will cost before it runs, and set a ceiling so one bad query cannot run up the bill.</ForTheBusiness>
          <p>No guide can give you a price, because rates differ by edition, region and contract. What you can estimate precisely is the quantity you are billed on.</p>
          <ul>
            <li><strong>BigQuery:</strong> a dry run returns the bytes a query will process without running it. Compile the model with <code>dbt compile</code>, then dry run the compiled SQL. For clustered tables, Google notes the pre-run estimate is not accurate, because the blocks skipped are only known at run time, so treat it as the unclustered figure. Set <code>maximum_bytes_billed</code> on jobs or in the dbt profile so a query that would exceed a ceiling fails instead. On capacity (slot-based) pricing, bytes are a proxy and slot time is the real cost.</li>
            <li><strong>Snowflake:</strong> credits are the warehouse size&rsquo;s hourly rate multiplied by running time. An X-Small uses 1 credit an hour and each size up doubles it, billed per second with a 60-second minimum per resume. Run the new model on a representative slice, read its elapsed time and partitions scanned, and scale. A larger warehouse that finishes in a quarter of the time can cost the same, or less.</li>
          </ul>
          <pre>{`# BigQuery: bytes the compiled model would process, without running it
bq query --use_legacy_sql=false --dry_run "$(cat target/compiled/your_dbt_project_name/models/marts/fct_events.sql)"`}</pre>
        </section>

        <section id="example">
          <h2>Worked example: cutting a daily rebuild of three years of events</h2>
          <Example setting="Scale-up · BigQuery, dbt, product events" title="From rebuilding 1,095 days to replacing 3">
            <p>A product events table holds three years of data, partitioned by day: 1,095 partitions. The daily model that feeds the usage dashboards is materialised as a table, so each run reads all 1,095 partitions of the source and rewrites all of them in the target. It runs four times a day.</p>
            <div className="in-table-wrap"><table>
              <thead><tr><th>Design</th><th>Source partitions read per run</th><th>Target partitions written</th><th>Relative bytes per day</th></tr></thead>
              <tbody>
                <tr><td>Table, 4 runs a day</td><td>1,095</td><td>1,095</td><td>4 × 1,095 = 4,380</td></tr>
                <tr><td>Incremental, 3-day overwrite, 4 runs</td><td>3</td><td>3</td><td>4 × 3 = 12</td></tr>
                <tr><td>Same, plus weekly 30-day sweep</td><td>3 (30 once a week)</td><td>3 (30 once a week)</td><td>about 16 on average</td></tr>
              </tbody>
            </table></div>
            <p>Assuming partitions of similar size, the reads fall to well under 1% of the original. The dry run before and after confirmed the source filter pruned; the first attempt had compared <code>event_date</code> with a subquery on the target and still scanned every partition, which the dry run caught before it shipped.</p>
          </Example>
        </section>

        <section id="wrong">
          <h2>Common ways this goes wrong</h2>
          <ul>
            <li><strong>A filter that looks selective but prunes nothing.</strong> A subquery, a cast or a function on the partition column. Always confirm with a dry run or the query profile.</li>
            <li><strong>Overwrite windows wider than the source filter.</strong> Partitions are replaced with only part of their rows, and data silently disappears.</li>
            <li><strong>Merge without a destination limit on a large table.</strong> Every run scans the full target to find a handful of matches.</li>
            <li><strong>A unique key that is not unique.</strong> On Snowflake the merge fails; elsewhere duplicates multiply downstream. Test the key.</li>
            <li><strong>Lookback of zero with late data.</strong> The model is fast and wrong, and the gap only shows when someone reconciles.</li>
            <li><strong>Accidental full refreshes.</strong> One <code>--full-refresh</code> on a multi-billion-row model costs more than a month of incremental runs. Set <code>full_refresh = false</code> on the big ones.</li>
            <li><strong>Optimising the model nobody reads.</strong> Rank by bytes or elapsed time first; the expensive model is usually not the one being discussed.</li>
          </ul>
        </section>

        <section id="boundary">
          <h2>When warehouse cost work needs a project</h2>
          <p>Converting one model is an afternoon. It becomes a project when the expensive models depend on each other, the layout of the big tables has to change, or nobody can say which time column is safe to filter on. If replicated production data is involved, the correctness questions in <a href="/insights/change-data-capture">making CDC trustworthy</a> come first, because an incremental model built on a drifting copy is fast and wrong.</p>
          <SystemBoundary
            conditions={[
              "A few models account for most of the spend, and they feed each other, so changing one changes the cost of the rest.",
              "Large tables need repartitioning or new clustering, which means a rebuild and a migration plan.",
              "Late and restated data is common, and nobody has measured how late, so lookbacks are guesses.",
              "Backfills are done by full refresh because there is no scoped way to rebuild a window.",
              "No one owns cost per model, so regressions are found on the invoice.",
            ]}
          />
        </section>

        <section id="decision">
          <h2>Which dbt incremental strategy should you use?</h2>
          <div className="in-table-wrap"><table>
            <thead><tr><th>Your table</th><th>Platform</th><th>Start with</th></tr></thead>
            <tbody>
              <tr><td>Append-mostly events or ledger lines, partitioned by date</td><td>BigQuery</td><td>insert_overwrite with static partitions, or microbatch</td></tr>
              <tr><td>Append-mostly events, many days to backfill regularly</td><td>Any supported</td><td>microbatch with a measured lookback</td></tr>
              <tr><td>Rows that update in place (orders, subscriptions)</td><td>Snowflake</td><td>merge with incremental_predicates and a clustering key on the date</td></tr>
              <tr><td>Rows that update, keys not reliably unique</td><td>Snowflake, Redshift</td><td>delete+insert, after fixing the key if you can</td></tr>
              <tr><td>Truly immutable, de-duplicated upstream</td><td>Any</td><td>append, with a uniqueness test</td></tr>
              <tr><td>Small table, under a few million rows</td><td>Any</td><td>A plain table. Incremental logic has a maintenance cost too.</td></tr>
            </tbody>
          </table></div>
          <p>Keeping history of attributes that change, rather than only the latest row, is a separate design problem covered in <a href="/insights/customer-history-scd2">which region last year&rsquo;s revenue belongs to</a>.</p>
          <p>Put numbers on your own tables with the <a href="/resources/warehouse-query-cost-estimator">warehouse query cost estimator</a>, choose a strategy with the <a href="/resources/dbt-incremental-strategy-picker">dbt incremental strategy picker</a>, and plan large reloads with the <a href="/resources/backfill-planner">backfill planner for billions of rows</a>. If replicated application tables feed these models, read <a href="/insights/change-data-capture">how to make CDC reliable</a> first. When the work spans many dependent models, <a href="/services/data-projects">a warehouse performance project</a> handles the redesign and backfill.</p>
          <p>Model-level fixes pair with platform settings; see <a href="/insights/warehouse-platform-costs">how to reduce Snowflake, BigQuery and Databricks costs</a>, and <a href="/insights/speed-up-dbt-runs">how to speed up slow dbt runs</a> to find which models to change first.</p>
        </section>
      </ArticleLayout>
    </PageShell>
  );
}
