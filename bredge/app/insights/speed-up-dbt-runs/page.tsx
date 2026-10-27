import { PageShell } from "../../../components/site/PageShell";
import { ArticleLayout, TryThisFirst, SystemBoundary, Diagram, Example, Pull, PlainEnglish, ForTheBusiness } from "../../../components/insights/Article";
import { insightMetadata } from "../../../lib/insights";

const SLUG = "speed-up-dbt-runs";
const TOC = [
  { id: "why", label: "Why dbt runs get slow" },
  { id: "try-first", label: "Read run_results.json" },
  { id: "critical-path", label: "Find the critical path" },
  { id: "threads", label: "Threads and parallelism" },
  { id: "fixes", label: "Fixing the slow models" },
  { id: "example", label: "Worked example: two hours to forty minutes" },
  { id: "wrong", label: "Common mistakes" },
  { id: "boundary", label: "When this needs a project" },
  { id: "decision", label: "Symptom to fix" },
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
            title="The critical path sets the finish time, not the sum of model times"
            caption="Models on parallel branches overlap. The run cannot finish before the longest chain of dependent models, so speeding up a model off that chain changes nothing. Illustrative."
          >
            <svg viewBox="0 0 720 220" xmlns="http://www.w3.org/2000/svg" style={F} fontSize="11" fill="#2c3a36">
              {[["stg_orders", 10, 20, 120, false], ["int_orders", 140, 20, 260, true], ["fct_orders", 410, 20, 200, true], ["stg_customers", 10, 70, 90, false], ["dim_customers", 110, 70, 120, false], ["stg_events", 10, 120, 130, true], ["fct_sessions", 150, 120, 180, false], ["report_board", 620, 20, 90, true]].map(([n, x, y, w, crit]) => (
                <g key={n as string}>
                  <rect x={x as number} y={y as number} width={w as number} height="34" rx="3" fill={crit ? "rgba(240,191,108,.35)" : "rgba(144,210,111,.2)"} stroke={crit ? "#f0bf6c" : "#90d26f"} />
                  <text x={(x as number) + 8} y={(y as number) + 21}>{n}</text>
                </g>
              ))}
              <text x="10" y="200" fill="#7a847f">time →   amber: critical path (illustrative)</text>
            </svg>
          </Diagram>
        }
      >
        <section id="why">
          <h2>Why do dbt runs get slow?</h2>
          <p>A dbt run builds models in dependency order, running independent models in parallel up to the number of threads. Runs slow down when a few models grow past the point where rebuilding them is cheap, or when a slow model ends up on the chain every other model waits for. The rest of the project is rarely the problem.</p>
          <PlainEnglish>
            <p>Your nightly data build is a set of steps, many of which run at the same time. The finish time is set by the longest chain of steps that must run one after another. Finding that chain, and speeding up the slowest steps on it, is what gets the numbers ready before the morning meeting. Speeding up anything else does not change the finish time.</p>
            <ul>
              <li><strong>Ask your team</strong>: which models are on the critical path of last night&rsquo;s run, and how long did each take?</li>
              <li><strong>Expect back</strong>: the critical path, a fix for its slowest models, and before-and-after run times.</li>
            </ul>
          </PlainEnglish>
        </section>

        <section id="try-first">
          <h2>How to find the slowest dbt models with run_results.json</h2>
          <ForTheBusiness>Dbt already records how long every model took, so the diagnosis needs no new tools.</ForTheBusiness>
          <p>After every run, dbt writes <code>target/run_results.json</code>. Each entry in <code>results</code> has the node&rsquo;s <code>unique_id</code>, <code>status</code>, <code>thread_id</code>, <code>execution_time</code> in seconds, and <code>timing</code> entries for the compile and execute steps with start and end times. <code>target/manifest.json</code> holds each node&rsquo;s dependencies.</p>
          <TryThisFirst title="Before you change any model">
            <ol>
              <li>Save <code>run_results.json</code> and <code>manifest.json</code> from a slow production run.</li>
              <li>List the ten slowest nodes.</li>
              <li>Find the critical path (script below).</li>
              <li>Compare with an older, faster run if you have one, to see what changed.</li>
            </ol>
          </TryThisFirst>
        </section>

        <section id="critical-path">
          <h2>How to find the critical path of a dbt run</h2>
          <ForTheBusiness>The critical path tells you which few models to fix to bring the finish time forward.</ForTheBusiness>
          <p>This Python script reads both files from the same run, prints the ten slowest nodes, then walks the dependency graph to find the chain of models with the largest total execution time:</p>
          <pre>{`import json
from functools import lru_cache

with open("target/run_results.json") as f:
    results = {r["unique_id"]: r for r in json.load(f)["results"]}
with open("target/manifest.json") as f:
    nodes = json.load(f)["nodes"]


def parents(uid):
    deps = nodes.get(uid, {}).get("depends_on", {}).get("nodes", [])
    return [p for p in deps if p in results]


@lru_cache(maxsize=None)
def longest_path(uid):
    best = max(
        (longest_path(p) for p in parents(uid)),
        key=lambda x: x[0],
        default=(0.0, ()),
    )
    return best[0] + results[uid]["execution_time"], best[1] + (uid,)


print("Slowest nodes:")
ranked = sorted(results.values(), key=lambda r: r["execution_time"], reverse=True)
for r in ranked[:10]:
    print(f'{r["execution_time"]:8.1f}s  {r["unique_id"]}')

total, chain = max((longest_path(u) for u in results), key=lambda x: x[0])
print(f"\\nCritical path: {total:.1f}s")
for uid in chain:
    print(f'{results[uid]["execution_time"]:8.1f}s  {uid}')`}</pre>
          <p>Run it from the project root with Python 3. The path uses execution time only, so it ignores time spent queued for a thread; if the run takes much longer than the critical path, threads or warehouse capacity are the constraint instead.</p>
        </section>

        <section id="threads">
          <h2>How many threads should dbt use?</h2>
          <ForTheBusiness>More parallel work helps only when models are independent and the warehouse has capacity to spare.</ForTheBusiness>
          <p>Threads are set in <code>profiles.yml</code> and can be overridden with <code>--threads</code>. They control how many models dbt builds at once. Raising them shortens a run when many independent models wait for a free thread, and does nothing for a chain of dependent models. Compare the run&rsquo;s wall-clock time with the critical path from the script: a large gap means models were waiting, so more threads, or a larger warehouse, may help.</p>
          <p>With the dbt v2 engine, dbt documents that <code>--threads 0</code> lets the engine choose parallelism on BigQuery and Redshift, and that on Snowflake and Databricks it works best with threads left unset. Check the <a href="https://docs.getdbt.com/docs/running-a-dbt-project/using-threads" target="_blank" rel="noopener noreferrer">threads documentation</a> for your version; upgrading is covered in <a href="/insights/dbt-fusion-upgrade">how to upgrade to dbt v2</a>.</p>
        </section>

        <section id="fixes">
          <h2>How to speed up the slowest dbt models</h2>
          <ForTheBusiness>A handful of model changes usually recover most of the time, without new tools or a bigger warehouse.</ForTheBusiness>
          <ul>
            <li><strong>Full rebuilds of large tables</strong>: make them incremental, replacing only recent partitions. See <a href="/insights/incremental-models-at-scale">incremental models at scale</a>.</li>
            <li><strong>Heavy window functions</strong>: dbt&rsquo;s own write-up of shaving 90 minutes off a model traced the time to window functions spilling to remote storage. Pre-aggregate, filter earlier, or split the model.</li>
            <li><strong>Views read many times</strong>: a complex view referenced by several models is recomputed by each. Materialise it as a table.</li>
            <li><strong>Joins that fan out</strong>: a join that multiplies rows before an aggregation does far more work than needed. Aggregate first.</li>
            <li><strong>Unpruned scans</strong>: filters that wrap the partition or clustering column in a function read the whole table.</li>
            <li><strong>Tests on huge tables</strong>: limit them with a <code>where</code> config to recent data.</li>
          </ul>
          <Pull>The fastest model to optimise is the one on the critical path. Everything else can wait.</Pull>
        </section>

        <section id="example">
          <h2>Worked example: from two hours to forty minutes</h2>
          <Example setting="Scale-up · Snowflake, dbt, 400 models" title="Three models on the critical path">
            <p>The nightly run takes two hours and finishes after the 8am board call. The script shows a critical path of 95 minutes through three models; everything else runs in parallel alongside it.</p>
            <ol>
              <li>An events model rebuilt three years of history each night. It becomes incremental with a three-day lookback.</li>
              <li>A sessionisation model ran window functions over all events. It now reads the incremental events model and processes new days only.</li>
              <li>A complex view used by five marts becomes a table, built once.</li>
            </ol>
            <p>The critical path falls to about 30 minutes and the run to about 40. Timings are illustrative; yours depend on your data and warehouse.</p>
          </Example>
        </section>

        <section id="wrong">
          <h2>Common dbt performance mistakes</h2>
          <ul>
            <li>Raising threads or warehouse size before finding the critical path.</li>
            <li>Optimising models that are not on the critical path.</li>
            <li>Making small models incremental, adding complexity for no saving.</li>
            <li>Comparing run times across days with different data volumes or warehouse load.</li>
            <li>Not keeping run_results.json, so there is no baseline when runs slow down.</li>
          </ul>
        </section>

        <section id="boundary">
          <h2>When slow dbt runs need a project</h2>
          <SystemBoundary
            conditions={[
              "The run regularly misses the time reports must be ready.",
              "The critical path runs through large models that rebuild history.",
              "Warehouse cost rises with every run time increase.",
              "Nobody owns run performance or keeps artifacts from past runs.",
              "Several teams add models to one project with no review of their cost.",
            ]}
          />
        </section>

        <section id="decision">
          <h2>Slow dbt run symptoms and the first fix</h2>
          <div className="in-table-wrap"><table>
            <thead><tr><th>Symptom</th><th>First fix</th></tr></thead>
            <tbody>
              <tr><td>Run time close to the critical path</td><td>Speed up the slowest models on that path</td></tr>
              <tr><td>Run time far longer than the critical path</td><td>More threads or warehouse capacity</td></tr>
              <tr><td>One model dominates</td><td>Make it incremental or split it</td></tr>
              <tr><td>Many models read the same view</td><td>Materialise the view as a table</td></tr>
              <tr><td>Run slowed suddenly</td><td>Compare run_results.json with a past run</td></tr>
            </tbody>
          </table></div>
          <p>Pick a strategy for the slow models with the <a href="/resources/dbt-incremental-strategy-picker">dbt incremental strategy picker</a>, and check platform settings in <a href="/insights/warehouse-platform-costs">how to reduce Snowflake, BigQuery and Databricks costs</a>. If reports must be ready by a fixed time, the <a href="/resources/data-freshness-sla-calculator">data freshness SLA calculator</a> shows how much slack you have. To have the critical path shortened, see <a href="/services/data-projects">our pipeline performance projects</a>.</p>
          <p>If you would rather not run a script, the <a href="/resources/dbt-run-results-analyser">dbt run_results.json analyser</a> shows the slowest models and thread use in the browser.</p>
        </section>
      </ArticleLayout>
    </PageShell>
  );
}
