import { PageShell } from "../../../components/site/PageShell";
import { ArticleLayout, TryThisFirst, SystemBoundary, Diagram, Example, Pull, PlainEnglish, ForTheBusiness } from "../../../components/insights/Article";
import { insightMetadata } from "../../../lib/insights";

const SLUG = "warehouse-platform-costs";
const TOC = [
  { id: "why", label: "Why platform settings matter" },
  { id: "try-first", label: "Find the waste first" },
  { id: "snowflake", label: "Snowflake: idle time and monitors" },
  { id: "bigquery", label: "BigQuery: on-demand vs editions" },
  { id: "databricks", label: "Databricks: jobs vs all-purpose" },
  { id: "example", label: "Worked example: an idle warehouse" },
  { id: "wrong", label: "Common platform cost mistakes" },
  { id: "boundary", label: "When cost needs a project" },
  { id: "decision", label: "Platform lever by symptom" },
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
            title="Where platform spend leaks: idle compute, uncapped scans, the wrong compute type"
            caption="Each platform bills differently, so each leaks differently. The fixes are settings and policies, applied once and measured in the platform's own usage views."
          >
            <svg viewBox="0 0 720 210" xmlns="http://www.w3.org/2000/svg" style={F} fontSize="11" fill="#2c3a36" textAnchor="middle">
              {[["Snowflake", "billed: warehouse running time", "leak: idle until auto-suspend", "fix: auto-suspend, monitors"], ["BigQuery", "billed: bytes or slot-hours", "leak: unbounded scans", "fix: quotas, editions"], ["Databricks", "billed: DBUs by compute type", "leak: batch on all-purpose", "fix: jobs compute, policies"]].map(([n, a, b, c], i) => (
                <g key={n}>
                  <rect x={15 + i * 235} y="20" width="220" height="170" rx="6" fill="#fff" stroke="rgba(20,35,33,.35)" />
                  <text x={125 + i * 235} y="52" fontSize="13">{n}</text>
                  <text x={125 + i * 235} y="88" fill="#7a847f">{a}</text>
                  <text x={125 + i * 235} y="120" fill="#a9741f">{b}</text>
                  <text x={125 + i * 235} y="152" fill="#3c6b43">{c}</text>
                </g>
              ))}
            </svg>
          </Diagram>
        }
      >
        <section id="why">
          <h2>Why do warehouse platform settings drive so much cost?</h2>
          <p>Query and model tuning, covered in <a href="/insights/incremental-models-at-scale">incremental models at scale</a>, cuts the cost of each piece of work. Platform settings decide what you pay around that work: warehouses left running between queries, scans with no ceiling, and batch jobs on compute priced for interactive use. They are set once, often by default, and rarely revisited.</p>
          <PlainEnglish>
            <p>Cloud data platforms charge for computing time or data scanned. A lot of spend goes on compute that is switched on but idle, on queries nobody capped, or on the expensive type of compute running routine jobs. Fixing those settings is quick, low-risk, and shows up on the next bill.</p>
            <ul>
              <li><strong>Ask your team</strong>: how much of last month&rsquo;s compute was idle, and is there a spending limit that would stop a runaway query?</li>
              <li><strong>Expect back</strong>: idle cost per warehouse or cluster, the settings changed, and the before and after.</li>
            </ul>
          </PlainEnglish>
        </section>

        <section id="try-first">
          <h2>How to find wasted spend on your data platform</h2>
          <ForTheBusiness>A few queries against the platform&rsquo;s own usage views show where the money goes before anyone changes a setting.</ForTheBusiness>
          <TryThisFirst title="Three questions for each platform">
            <ol>
              <li>Which warehouses, projects or clusters used the most compute in the last 30 days?</li>
              <li>How much of that was idle, or spent on work nobody uses?</li>
              <li>Is there any ceiling that would stop a runaway query or job?</li>
            </ol>
          </TryThisFirst>
        </section>

        <section id="snowflake">
          <h2>How to reduce Snowflake costs: auto-suspend and resource monitors</h2>
          <ForTheBusiness>A warehouse bills while it runs, including the idle minutes before it suspends, so the suspend setting is a direct cost lever.</ForTheBusiness>
          <p>Snowflake bills warehouses per second while they run, with a 60-second minimum each time a warehouse starts or resumes. New warehouses default to <code>AUTO_SUSPEND = 600</code>: ten minutes of idle running after the last query. Snowflake&rsquo;s guidance is a low value, for example five or ten minutes or less, matched to the gaps between your queries; too low and frequent resumes each cost the 60-second minimum and lose the warehouse cache.</p>
          <p>Idle credits per warehouse over the last 30 days, using the compute credits attributed to queries:</p>
          <pre>{`select
    warehouse_name,
    sum(credits_used_compute)                as compute_credits,
    sum(credits_attributed_compute_queries)  as query_credits,
    sum(credits_used_compute)
      - sum(credits_attributed_compute_queries) as idle_credits
from snowflake.account_usage.warehouse_metering_history
where start_time >= dateadd(day, -30, current_timestamp())
group by warehouse_name
order by idle_credits desc;`}</pre>
          <p>For a warehouse used by scheduled jobs, which run back to back and then stop, a short suspend is usually safe:</p>
          <pre>{`alter warehouse transform_wh set auto_suspend = 60;`}</pre>
          <p>Resource monitors add a ceiling. They track credits against a quota per interval and can notify, suspend after running queries finish, or suspend immediately:</p>
          <pre>{`create or replace resource monitor transform_monthly
  with credit_quota = 500
       frequency = monthly
       start_timestamp = immediately
  triggers on 80 percent do notify
           on 100 percent do suspend
           on 110 percent do suspend_immediate;

alter warehouse transform_wh set resource_monitor = transform_monthly;`}</pre>
          <Pull>Idle compute is still compute. On Snowflake you pay for every minute a warehouse waits for the next query.</Pull>
          <p>Set the quota from your own usage; 500 is a placeholder. Resource monitors do not cover serverless features and AI services, which need budgets instead. Note that <code>WAREHOUSE_METERING_HISTORY</code> does not apply the cloud services adjustment, so use <code>METERING_DAILY_HISTORY</code> for billed credits.</p>
        </section>

        <section id="bigquery">
          <h2>BigQuery on-demand vs editions, and how to cap spend</h2>
          <ForTheBusiness>The pricing model you choose decides whether one bad query or steady heavy use is the bigger risk.</ForTheBusiness>
          <p><strong>On-demand</strong> bills for the bytes each query processes. Google&rsquo;s cost guidance notes that on non-clustered tables, a <code>LIMIT</code> clause does not reduce the bytes billed. <strong>Editions</strong> (Standard, Enterprise, Enterprise Plus) bill slot-hours instead: compute capacity over time, with autoscaling in increments of 50 slots, billed per second with a one-minute minimum unless you opt into fluid scaling. Enterprise editions add baseline slots and one- or three-year commitments.</p>
          <p>Two caps stop runaway on-demand spend: <code>maximum_bytes_billed</code> on queries, and custom quotas on query usage per day, per project and per user. Queries that would exceed a quota fail with a <code>usageQuotaExceeded</code> error instead of billing.</p>
          <p>To compare the two models on your own workload, take 30 days of usage from the jobs view:</p>
          <pre>{`select
    date(creation_time)                    as day,
    sum(total_bytes_billed) / pow(1024, 4) as tib_billed,
    sum(total_slot_ms) / 1000 / 3600       as slot_hours
from \`region-eu\`.INFORMATION_SCHEMA.JOBS_BY_PROJECT
where creation_time >= timestamp_sub(current_timestamp(), interval 30 day)
  and job_type = 'QUERY'
group by day
order by day;`}</pre>
          <p>Multiply TiB billed by your on-demand rate and slot-hours by your edition&rsquo;s slot-hour rate. Treat the slot-hours as a lower bound for editions, because autoscaling bills in 50-slot steps with a minimum duration.</p>
        </section>

        <section id="databricks">
          <h2>Databricks jobs compute vs all-purpose compute</h2>
          <ForTheBusiness>Running scheduled pipelines on the interactive compute type is one of the most common avoidable costs on Databricks.</ForTheBusiness>
          <p>Databricks&rsquo; cost guidance says non-interactive workloads cost significantly less on jobs compute than on all-purpose compute. All-purpose clusters are for notebooks and exploration; scheduled pipelines should run as jobs, on job clusters or serverless jobs compute. Compute policies enforce limits such as auto-termination and cluster size:</p>
          <pre>{`{
  "autotermination_minutes": {
    "type": "range",
    "maxValue": 60,
    "defaultValue": 30
  },
  "num_workers": {
    "type": "range",
    "maxValue": 8
  }
}`}</pre>
          <p>Find which compute types use the most DBUs from the billing system table:</p>
          <pre>{`select sku_name, sum(usage_quantity) as dbus
from system.billing.usage
where usage_date >= date_sub(current_date(), 30)
  and usage_unit = 'DBU'
group by sku_name
order by dbus desc;`}</pre>
        </section>

        <section id="example">
          <h2>Worked example: the warehouse that was mostly idle</h2>
          <Example setting="Scale-up · Snowflake, dbt, Looker" title="Idle credits on a BI warehouse">
            <p>The idle-credits query shows the BI warehouse using more idle credits than query credits. Dashboards send a few queries every few minutes during the day, and each burst keeps the warehouse running for ten more minutes.</p>
            <ol>
              <li>Auto-suspend drops from 600 to 120 seconds, a value that still covers most gaps between dashboard queries.</li>
              <li>The dbt jobs move to their own warehouse with a 60-second suspend.</li>
              <li>A resource monitor notifies at 80% of the monthly quota and suspends the transform warehouse at 110%.</li>
            </ol>
            <p>The next month&rsquo;s metering history shows the change per warehouse. Figures and settings are illustrative; tune them to your own query gaps.</p>
          </Example>
        </section>

        <section id="wrong">
          <h2>Common platform cost mistakes</h2>
          <ul>
            <li>Leaving default suspend times on every warehouse.</li>
            <li>Sharing one warehouse between BI and transformation, so neither can be tuned.</li>
            <li>Running scheduled pipelines on all-purpose clusters.</li>
            <li>No quota or monitor anywhere, so the first sign of a runaway query is the invoice.</li>
            <li>Switching BigQuery pricing models without modelling a month of real usage.</li>
            <li>Sizing up compute before fixing the heaviest models.</li>
          </ul>
        </section>

        <section id="boundary">
          <h2>When warehouse cost needs a project</h2>
          <SystemBoundary
            conditions={[
              "The platform bill grows faster than data or users.",
              "Nobody can say which team or workload drives the cost.",
              "BI, transformation and data science share the same compute.",
              "A pricing model change (editions, commitments) is being considered without data.",
              "Finance has asked for a cost forecast and nobody can produce one.",
            ]}
          />
        </section>

        <section id="decision">
          <h2>Which platform cost lever fits your symptom?</h2>
          <div className="in-table-wrap"><table>
            <thead><tr><th>Symptom</th><th>Lever</th></tr></thead>
            <tbody>
              <tr><td>High idle credits on Snowflake</td><td>Lower auto-suspend; separate BI and transform warehouses</td></tr>
              <tr><td>Fear of a runaway Snowflake bill</td><td>Resource monitors with notify and suspend</td></tr>
              <tr><td>Occasional huge BigQuery queries</td><td>maximum_bytes_billed and custom quotas</td></tr>
              <tr><td>Steady heavy BigQuery use</td><td>Model editions against on-demand from INFORMATION_SCHEMA</td></tr>
              <tr><td>High Databricks all-purpose spend</td><td>Move scheduled work to jobs compute; compute policies</td></tr>
              <tr><td>Every model slow and expensive</td><td>Fix the models first: incremental builds and pruning</td></tr>
            </tbody>
          </table></div>
          <p>Estimate query cost with the <a href="/resources/warehouse-query-cost-estimator">warehouse query cost estimator</a>, and shorten long pipelines with <a href="/insights/speed-up-dbt-runs">how to speed up slow dbt runs</a>. Ingestion is often the other large line; see <a href="/insights/reduce-fivetran-costs">how to reduce Fivetran costs</a>. To have the settings and the heaviest models fixed with a before and after, see <a href="/services/data-projects">our warehouse cost projects</a>.</p>
        </section>
      </ArticleLayout>
    </PageShell>
  );
}
