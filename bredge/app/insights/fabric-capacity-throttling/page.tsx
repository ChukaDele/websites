import { PageShell } from "../../../components/site/PageShell";
import { ArticleLayout, TryThisFirst, SystemBoundary, Diagram, Example, Pull, PlainEnglish, ForTheBusiness } from "../../../components/insights/Article";
import { insightMetadata } from "../../../lib/insights";

const SLUG = "fabric-capacity-throttling";
const TOC = [
  { id: "why", label: "Why reports stop loading" },
  { id: "smoothing", label: "How smoothing works" },
  { id: "stages", label: "The four throttling stages" },
  { id: "try-first", label: "Find what is using the capacity" },
  { id: "fixes", label: "How to stop throttling" },
  { id: "p-sku", label: "P SKU retirement and F SKU sizing" },
  { id: "example", label: "Worked example: month-end throttling" },
  { id: "wrong", label: "Common capacity mistakes" },
  { id: "boundary", label: "When capacity needs a project" },
  { id: "decision", label: "Symptom to first fix" },
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
            title="Fabric throttling stages by how much future capacity has been used"
            caption="Fabric smooths usage over time, so a capacity can borrow future compute. The more it has borrowed, the more Fabric delays and then rejects work. Thresholds from Microsoft Learn."
          >
            <svg viewBox="0 0 720 200" xmlns="http://www.w3.org/2000/svg" style={F} fontSize="11" fill="#2c3a36" textAnchor="middle">
              {[["≤ 10 min", "overage protection", "no throttling", "rgba(144,210,111,.3)", "#90d26f"], ["10–60 min", "interactive delay", "interactive jobs delayed", "rgba(240,191,108,.2)", "#f0bf6c"], ["60 min–24 h", "interactive rejection", "interactive jobs rejected", "rgba(240,191,108,.4)", "#f0bf6c"], ["> 24 h", "background rejection", "all requests rejected", "rgba(214,120,90,.35)", "#c9694f"]].map(([t, n, e, f, st], i) => (
                <g key={t}>
                  <rect x={10 + i * 177} y="40" width="170" height="110" rx="4" fill={f} stroke={st} />
                  <text x={95 + i * 177} y="68" fontSize="13">{t}</text>
                  <text x={95 + i * 177} y="98">{n}</text>
                  <text x={95 + i * 177} y="124" fill="#46534f">{e}</text>
                </g>
              ))}
              <text x="360" y="182" fill="#7a847f">future capacity already used (smoothed) →</text>
            </svg>
          </Diagram>
        }
      >
        <section id="why">
          <h2>Why do Power BI reports stop loading on Fabric capacity?</h2>
          <p>A Fabric capacity is a fixed amount of compute, measured in capacity units (CUs), shared by every workspace assigned to it. When reports, refreshes and other jobs use more than the capacity owns for long enough, Fabric throttles: it delays new interactive work, then rejects it, and finally rejects background jobs too. Executives see reports that hang or fail with a capacity error.</p>
          <PlainEnglish>
            <p>Your Power BI and Fabric workloads share one pool of computing power. Fabric lets that pool borrow from the future to absorb spikes, but if it borrows too much, Fabric starts slowing down and then refusing work until the debt is paid back. The fix is to find the few jobs using the most, make them cheaper or move them, and only then decide whether you need a bigger capacity.</p>
            <ul>
              <li><strong>Ask your team</strong>: which items used the most capacity last week, and how often did we reach interactive delay?</li>
              <li><strong>Expect back</strong>: a list of heavy workloads with a fix for each, and a capacity size based on measured usage.</li>
            </ul>
          </PlainEnglish>
        </section>

        <section id="smoothing">
          <h2>How Fabric capacity smoothing works</h2>
          <ForTheBusiness>Smoothing is why a heavy job can make reports slow hours later, long after it finished.</ForTheBusiness>
          <p>Fabric does not charge each operation against the moment it runs. It spreads the cost over time. Microsoft documents that interactive operations, such as report queries, are smoothed over a minimum of five minutes and up to 64 minutes, and background operations, such as refreshes, over 24 hours. A large refresh therefore keeps consuming a slice of capacity for a day after it ends.</p>
          <p>Smoothing lets a capacity absorb short spikes without throttling. The cost is that sustained overuse builds up as future usage, which is what the throttling stages measure.</p>
        </section>

        <section id="stages">
          <h2>Fabric throttling stages: overage protection, delay and rejection</h2>
          <ForTheBusiness>Each stage has a different symptom, so knowing the stage tells you how urgent the problem is.</ForTheBusiness>
          <div className="in-table-wrap"><table>
            <thead><tr><th>Future capacity used</th><th>Stage</th><th>What users see</th></tr></thead>
            <tbody>
              <tr><td>Up to 10 minutes</td><td>Overage protection</td><td>Nothing; no throttling</td></tr>
              <tr><td>10 to 60 minutes</td><td>Interactive delay</td><td>Interactive jobs are delayed at submission, so reports feel slow</td></tr>
              <tr><td>60 minutes to 24 hours</td><td>Interactive rejection</td><td>Interactive jobs are rejected; background jobs still run</td></tr>
              <tr><td>Over 24 hours</td><td>Background rejection</td><td>All requests are rejected, including refreshes</td></tr>
            </tbody>
          </table></div>
          <p><strong>Surge protection</strong> is an admin setting that rejects new background operations when 24-hour background usage reaches a threshold you set, and lifts the block at a recovery threshold. It protects interactive users from refresh storms at the cost of delaying some refreshes. A workspace-level version, in preview, can cap how much one workspace uses.</p>
        </section>

        <section id="try-first">
          <h2>How to find what is using your Fabric capacity</h2>
          <ForTheBusiness>A few items usually use most of the capacity, so the first hour of analysis points at the fix.</ForTheBusiness>
          <TryThisFirst title="Read the Capacity Metrics app">
            <ol>
              <li>Install the Microsoft Fabric Capacity Metrics app and connect it to the capacity.</li>
              <li>On the compute page, find the periods where utilisation, throttling or overages peaked.</li>
              <li>Drill into those periods and list the items (semantic models, notebooks, pipelines) and operations that used the most CUs.</li>
              <li>Separate interactive use (report queries) from background use (refreshes, jobs).</li>
              <li>For the top five items, note when they run and who owns them.</li>
            </ol>
          </TryThisFirst>
        </section>

        <section id="fixes">
          <h2>How to stop Fabric capacity throttling</h2>
          <ForTheBusiness>Fixing the heaviest workloads is usually cheaper than buying the next capacity size.</ForTheBusiness>
          <ul>
            <li><strong>Heavy refreshes</strong>: use incremental refresh, remove unused columns, and move transformation upstream. See <a href="/insights/power-bi-refresh-failed">how to fix a failed Power BI refresh</a>.</li>
            <li><strong>Expensive report queries</strong>: fix the model behind them: star schema, fewer bidirectional relationships, measures instead of calculated columns. See <a href="/insights/power-bi-slow">why Power BI is slow</a>.</li>
            <li><strong>Clashing schedules</strong>: spread refreshes across the day, away from the hours executives use reports.</li>
            <li><strong>Noisy workspaces</strong>: move development and data science workloads to a separate capacity, or cap them with workspace-level surge protection.</li>
            <li><strong>Refresh storms</strong>: set capacity-level surge protection so background work cannot push interactive users into rejection.</li>
            <li><strong>Genuine growth</strong>: once the workloads are efficient, size up based on the measured peak, not on the last bad day.</li>
          </ul>
          <Pull>A bigger capacity raises the ceiling. One badly built model can still reach it.</Pull>
        </section>

        <section id="p-sku">
          <h2>Power BI Premium P SKU retirement and F SKU sizing</h2>
          <ForTheBusiness>If you still run a P SKU, the end of your agreement sets a hard deadline to move.</ForTheBusiness>
          <p>Microsoft no longer sells new Premium per-capacity P SKUs. Customers on an active Enterprise Agreement can renew until the agreement ends. When the subscription ends, Microsoft&rsquo;s migration guide describes a 30-day grace period, throttled access from day 31, and rejection of all operations from day 91; data is kept but cannot be used. The recommended path is a like-for-like move to the equivalent Fabric F SKU in the same region, where P1 corresponds to F64.</p>
          <p>F64 matters for another reason: it is the smallest F SKU on which users with a free licence can view Power BI content. Smaller F SKUs need every viewer to have Pro or Premium Per User; see <a href="/insights/power-bi-licensing-small-business">Power BI licensing</a>.</p>
        </section>

        <section id="example">
          <h2>Worked example: throttling every month-end</h2>
          <Example setting="UK group · Fabric F64, 40 semantic models" title="Reports fail on the first working day of each month">
            <p>Executives report capacity errors on the first working day of each month. The Capacity Metrics app shows background rejection starting mid-morning.</p>
            <ol>
              <li>Three finance models run full refreshes of five years of history at 7am on the first working day, and again hourly while numbers are adjusted.</li>
              <li>Because background work is smoothed over 24 hours, those refreshes accumulate enough future use to tip the capacity into rejection.</li>
              <li>The models move to incremental refresh on the current and previous month, and the hourly refresh becomes on-demand.</li>
              <li>Surge protection is set so background work cannot push interactive users into rejection.</li>
            </ol>
            <p>The next month-end stays in overage protection. The capacity size does not change.</p>
          </Example>
        </section>

        <section id="wrong">
          <h2>Common Fabric capacity mistakes</h2>
          <ul>
            <li>Buying a bigger SKU before finding the heaviest workloads.</li>
            <li>Running development and production on the same capacity.</li>
            <li>Scheduling every refresh for the start of the working day.</li>
            <li>Ignoring that background usage keeps counting for 24 hours.</li>
            <li>Letting a P SKU agreement expire without a migration plan.</li>
          </ul>
        </section>

        <section id="boundary">
          <h2>When Fabric capacity needs a project</h2>
          <SystemBoundary
            conditions={[
              "Throttling reaches interactive rejection more than occasionally.",
              "A P SKU agreement ends within the next six months.",
              "Dozens of semantic models share one capacity with no owner for each.",
              "Refresh schedules have grown by accretion and nobody knows what depends on what.",
              "Leadership wants to know the right capacity size with evidence.",
            ]}
          />
        </section>

        <section id="decision">
          <h2>Fabric capacity symptoms and the first fix for each</h2>
          <div className="in-table-wrap"><table>
            <thead><tr><th>Symptom</th><th>Likely stage or cause</th><th>First fix</th></tr></thead>
            <tbody>
              <tr><td>Reports slow, but load</td><td>Interactive delay</td><td>Find and fix the heaviest items in the Metrics app</td></tr>
              <tr><td>Reports fail with capacity errors</td><td>Interactive rejection</td><td>Reduce background load; set surge protection</td></tr>
              <tr><td>Refreshes rejected too</td><td>Background rejection</td><td>Pause non-essential jobs; fix the heaviest refreshes</td></tr>
              <tr><td>Problems every month-end</td><td>Refresh storm</td><td>Incremental refresh; spread schedules</td></tr>
              <tr><td>P SKU agreement ending</td><td>Retirement timeline</td><td>Plan the move to the equivalent F SKU</td></tr>
            </tbody>
          </table></div>
          <p>To have the heavy workloads found and the capacity sized from evidence, see <a href="/services/data-projects">our capacity and performance projects</a> or start with <a href="/data-diagnostic">a Data Diagnostic</a>. Consolidating overlapping models also cuts load; <a href="/insights/why-dashboards-disagree">why dashboards disagree</a> explains the definitions side, and the <a href="/resources/kpi-dictionary-template">KPI dictionary template</a> helps agree one model per metric.</p>
          <p>Compare per-user licences with capacity for your audience in the <a href="/resources/power-bi-licensing-cost-calculator">Power BI licensing cost calculator</a>.</p>
        </section>
      </ArticleLayout>
    </PageShell>
  );
}
