import { PageShell } from "../../../components/site/PageShell";
import { ArticleLayout, TryThisFirst, SystemBoundary, Diagram, Example, Pull, ForYourDataPerson } from "../../../components/insights/Article";
import { insightMetadata } from "../../../lib/insights";

const SLUG = "power-bi-licensing-small-business";
const TOC = [
  { id: "answer", label: "Which licence most small businesses need" },
  { id: "try-first", label: "Count before you buy" },
  { id: "options", label: "Pro vs Premium Per User vs Fabric" },
  { id: "viewers", label: "Who needs a licence" },
  { id: "limits", label: "Size and refresh limits" },
  { id: "example", label: "Worked example: a team of twelve" },
  { id: "wrong", label: "Common licensing mistakes" },
  { id: "boundary", label: "When to revisit the choice" },
  { id: "decision", label: "Which licence fits" },
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
            title="Three ways to license Power BI, and who each one suits"
            caption="Pro and Premium Per User are licensed per person. A Fabric capacity is licensed per capacity, and only F64 or larger lets free users view content."
          >
            <svg viewBox="0 0 720 220" xmlns="http://www.w3.org/2000/svg" style={F} fontSize="11" fill="#2c3a36" textAnchor="middle">
              {[["Pro", "per user", "1 GB · 8 refreshes/day", "most small teams", 20], ["Premium Per User", "per user", "100 GB · 48 refreshes/day", "large models, frequent refresh", 255], ["Fabric capacity", "per capacity", "free viewers from F64", "large audiences", 490]].map(([n, a, b, c, x]) => (
                <g key={n as string}>
                  <rect x={x as number} y="30" width="210" height="150" rx="6" fill={n === "Pro" ? "rgba(144,210,111,.14)" : "#fff"} stroke={n === "Pro" ? "#90d26f" : "rgba(20,35,33,.35)"} strokeWidth={n === "Pro" ? 1.8 : 1} />
                  <text x={(x as number) + 105} y="62" fontSize="13">{n}</text>
                  <text x={(x as number) + 105} y="92" fill="#7a847f">{a}</text>
                  <text x={(x as number) + 105} y="118">{b}</text>
                  <text x={(x as number) + 105} y="150" fill="#3c6b43">{c}</text>
                </g>
              ))}
            </svg>
          </Diagram>
        }
      >
        <section id="answer">
          <h2>Which Power BI licence does a small business need?</h2>
          <p>Most small businesses need Power BI Pro for each person who builds or views shared reports. Microsoft&rsquo;s US pricing page lists Pro at $14.00 per user per month and Premium Per User (PPU) at $24.00, paid yearly; prices differ by currency and agreement. Pro is also included in Microsoft 365 E5 and Office 365 E5, so check what you already own.</p>
          <p>The other two options solve specific problems. PPU lifts the model size and refresh limits for each licensed user. A Fabric capacity is bought for an organisation and only lets people view reports with a free licence at F64 or above, which is sized for hundreds of viewers rather than a team of ten.</p>
          <Pull>For a small team, the question is rarely which licence. It is how many people need one.</Pull>
        </section>

        <section id="try-first">
          <h2>How to work out your Power BI licence cost</h2>
          <p>Count four things before you buy anything:</p>
          <TryThisFirst title="Four numbers that decide the licence">
            <ol>
              <li><strong>Creators</strong>: people who build or edit reports and models.</li>
              <li><strong>Viewers</strong>: people who only read shared reports and dashboards.</li>
              <li><strong>Model size</strong>: the size of your largest semantic model once published.</li>
              <li><strong>Refreshes</strong>: how many times a day the data must update.</li>
            </ol>
          </TryThisFirst>
          <p>Multiply creators and viewers by the per-user price for Pro, then check whether the model size or refresh count pushes you to PPU. Compare that total with the cost of the people time spent rebuilding reports today; the <a href="/resources/reporting-automation-map">reporting automation map</a> estimates those hours.</p>
        </section>

        <section id="options">
          <h2>Power BI Pro vs Premium Per User vs Fabric capacity</h2>
          <div className="in-table-wrap"><table>
            <thead><tr><th></th><th>Pro</th><th>Premium Per User</th><th>Fabric capacity (F SKU)</th></tr></thead>
            <tbody>
              <tr><td>Licensed</td><td>Per user</td><td>Per user</td><td>Per capacity, through Azure</td></tr>
              <tr><td>US list price</td><td>$14.00 per user per month, paid yearly</td><td>$24.00 per user per month, paid yearly</td><td>Varies by size and region; see Azure pricing</td></tr>
              <tr><td>Imported model size</td><td>1 GB</td><td>100 GB</td><td>Set by capacity size</td></tr>
              <tr><td>Scheduled refreshes a day</td><td>8</td><td>48</td><td>48</td></tr>
              <tr><td>Free users can view</td><td>No</td><td>No</td><td>Only on F64 or larger</td></tr>
            </tbody>
          </table></div>
          <p>Microsoft&rsquo;s PPU FAQ says a PPU licence is required to access content in a PPU workspace, so a mixed team of Pro and PPU users cannot share PPU workspaces with the Pro users. Plan PPU for whole teams, not individuals.</p>
        </section>

        <section id="viewers">
          <h2>Can people view Power BI reports without a licence?</h2>
          <p>Only on a large capacity. Microsoft&rsquo;s licensing page says that on F64 or larger, users with only a free licence and a viewer role can view Power BI content. Below F64, viewers of shared content need Pro or PPU. Legacy Premium P SKUs also allowed free viewers, but Microsoft no longer sells them.</p>
          <p>Options for sharing with people who should not need a licence:</p>
          <ul>
            <li><strong>Export</strong>: a licensed user exports the monthly pack to PDF or PowerPoint and shares the file.</li>
            <li><strong>Excel</strong>: if the audience lives in Excel, publish a governed dataset and let a licensed person maintain the workbook.</li>
            <li><strong>Publish to web</strong>: makes a report public to anyone with the link. Never use it for business data.</li>
          </ul>
        </section>

        <section id="limits">
          <h2>Power BI Pro limits that push small teams to upgrade</h2>
          <p>Two limits cause most upgrades. A model imported on shared capacity cannot exceed 1 GB, and a full refresh needs about twice the model&rsquo;s memory, so a model near the limit can fail to refresh. Pro also allows eight scheduled refreshes a day. Before paying for PPU, check whether the model can be made smaller; <a href="/insights/power-bi-refresh-failed">how to fix a failed Power BI refresh</a> covers memory errors.</p>
          <ForYourDataPerson title="Exact limits and where Microsoft documents them">
            <ul>
              <li><strong>Pro model size</strong>: 1 GB for semantic models imported into the service on shared capacity; refresh processes up to 10 GB of uncompressed data. See <a href="https://learn.microsoft.com/en-us/power-bi/connect-data/refresh-troubleshooting-refresh-scenarios" target="_blank" rel="noopener noreferrer">refresh troubleshooting</a>.</li>
              <li><strong>PPU model size</strong>: 100 GB. See the <a href="https://learn.microsoft.com/en-us/fabric/enterprise/powerbi/service-premium-per-user-faq" target="_blank" rel="noopener noreferrer">Premium Per User FAQ</a>.</li>
              <li><strong>Refreshes</strong>: 8 a day on shared capacity, 48 on PPU, Premium and Fabric; refresh duration under 2 hours on shared, 5 hours on capacity. See <a href="https://learn.microsoft.com/en-us/power-bi/connect-data/refresh-data" target="_blank" rel="noopener noreferrer">data refresh in Power BI</a>.</li>
              <li><strong>Free viewers</strong>: F64 or larger. See <a href="https://learn.microsoft.com/en-us/fabric/enterprise/licenses" target="_blank" rel="noopener noreferrer">Microsoft Fabric licenses</a>.</li>
              <li><strong>Prices</strong>: Microsoft&rsquo;s <a href="https://www.microsoft.com/en-us/power-platform/products/power-bi/pricing" target="_blank" rel="noopener noreferrer">Power BI pricing page</a> (US list prices, paid yearly).</li>
            </ul>
          </ForYourDataPerson>
        </section>

        <section id="example">
          <h2>Worked example: licensing a team of twelve</h2>
          <Example setting="UK services firm · Xero, HubSpot, Power BI" title="Two creators, ten viewers, one model">
            <p>Two people in finance build reports. Ten managers read them weekly. The largest model is 300 MB and refreshes twice a day.</p>
            <ul>
              <li>Model size and refreshes fit within Pro limits, so PPU adds nothing.</li>
              <li>Twelve people need Pro to view shared content: twelve Pro licences.</li>
              <li>Three of the managers only read the month-end pack; a finance user exports it to PDF and sends it, so they do not need a licence.</li>
            </ul>
            <p>The firm buys nine Pro licences and revisits the choice if the model approaches 1 GB or the board wants hourly updates.</p>
          </Example>
        </section>

        <section id="wrong">
          <h2>Common Power BI licensing mistakes</h2>
          <ul>
            <li>Buying PPU for a few people when the rest of the team is on Pro.</li>
            <li>Assuming a small Fabric capacity lets free users view reports. Only F64 and above do.</li>
            <li>Upgrading to fix a slow or failing refresh that a smaller model would fix.</li>
            <li>Using Publish to web to avoid licences.</li>
            <li>Forgetting that E5 plans already include Pro.</li>
          </ul>
        </section>

        <section id="boundary">
          <h2>When to revisit your Power BI licensing</h2>
          <SystemBoundary
            conditions={[
              "A model is approaching 1 GB, or refreshes fail with memory errors.",
              "Reports must refresh more than eight times a day.",
              "The number of viewers grows into the hundreds.",
              "You are moving to a Fabric data platform for other reasons.",
              "Your Microsoft agreement is up for renewal.",
            ]}
          />
        </section>

        <section id="decision">
          <h2>Which Power BI licence fits your business?</h2>
          <div className="in-table-wrap"><table>
            <thead><tr><th>Situation</th><th>Licence</th></tr></thead>
            <tbody>
              <tr><td>A few creators and viewers, models under 1 GB</td><td>Pro for everyone who views shared reports</td></tr>
              <tr><td>Already on Microsoft 365 E5</td><td>Pro is included</td></tr>
              <tr><td>Models over 1 GB or more than 8 refreshes a day, whole team</td><td>Premium Per User</td></tr>
              <tr><td>Hundreds of viewers, or a Fabric platform</td><td>Fabric capacity, F64 or above for free viewers</td></tr>
              <tr><td>Readers only need a monthly pack</td><td>PDF or PowerPoint exports shared by a licensed user</td></tr>
            </tbody>
          </table></div>
          <p>Licences are one part of the setup; <a href="/insights/first-reporting-stack">how to automate reporting without a data team</a> covers the rest, and <a href="/insights/connect-quickbooks-xero-to-power-bi">connecting QuickBooks Online and Xero to Power BI</a> covers accounting data. Larger organisations on capacity should read <a href="/insights/fabric-capacity-throttling">Fabric capacity throttling explained</a>. To have reporting set up on the right licences, see <a href="/services/data-projects">our reporting set-up projects</a>.</p>
          <p>Put your own numbers of creators, viewers, model size and refreshes into the <a href="/resources/power-bi-licensing-cost-calculator">Power BI licensing cost calculator</a>.</p>
        </section>
      </ArticleLayout>
    </PageShell>
  );
}
