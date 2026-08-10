import type { Metadata } from "next";
import { PageShell } from "../../../components/site/PageShell";
import { ArticleLayout, TryThisFirst, SystemBoundary, Diagram } from "../../../components/insights/Article";
import { pageMetadata } from "../../../lib/seo";

const SLUG = "power-bi-warehouse-or-both";
const TOC = [
  { id: "short-answer", label: "The short answer" },
  { id: "usual", label: "What this usually looks like" },
  { id: "try-first", label: "Separate the three problems first" },
  { id: "what-it-tells-you", label: "What the answer tells you" },
  { id: "underneath", label: "Reporting layer, model, and integration" },
  { id: "good", label: "What good looks like" },
  { id: "wrong", label: "Common ways this goes wrong" },
  { id: "boundary", label: "When you genuinely need the warehouse too" },
  { id: "decision", label: "A decision guide" },
];

export const metadata: Metadata = pageMetadata({
  title: "Power BI, a Data Warehouse, or Both? A Reporting Architecture Guide | The Bredge",
  description: "Do you need Power BI, a data warehouse, or both? Separate the reporting-layer, model and integration problems to decide what to build, and in what order.",
  path: "/insights/power-bi-warehouse-or-both",
});

export default function Page() {
  return (
    <PageShell>
      <ArticleLayout
        slug={SLUG}
        toc={TOC}
        heroDiagram={
          <Diagram
            title="One request, three separable layers: integration, model, and reporting"
            caption="&ldquo;Better reporting&rdquo; can be a problem in any layer. The reporting tool renders faithfully; the fix is usually the model or the integration beneath it."
          >
            <svg viewBox="0 0 720 320" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <marker id="pbw-ar" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="rgba(20,35,33,.55)" />
                </marker>
              </defs>

              {/* source systems */}
              <rect x="28" y="52" width="104" height="38" fill="none" stroke="rgba(20,35,33,.35)" />
              <text x="44" y="76" fill="#2c3a36" fontSize="12" fontFamily="monospace">CRM</text>
              <rect x="28" y="138" width="104" height="38" fill="none" stroke="rgba(20,35,33,.35)" />
              <text x="44" y="162" fill="#2c3a36" fontSize="12" fontFamily="monospace">Billing</text>
              <rect x="28" y="224" width="104" height="38" fill="none" stroke="rgba(20,35,33,.35)" />
              <text x="44" y="248" fill="#2c3a36" fontSize="12" fontFamily="monospace">Product</text>

              {/* sources → integration (unresolved flow, amber) */}
              <line x1="132" y1="71" x2="182" y2="140" stroke="#f0bf6c" strokeWidth="1.5" markerEnd="url(#pbw-ar)" />
              <line x1="132" y1="157" x2="182" y2="158" stroke="#f0bf6c" strokeWidth="1.5" markerEnd="url(#pbw-ar)" />
              <line x1="132" y1="243" x2="182" y2="176" stroke="#f0bf6c" strokeWidth="1.5" markerEnd="url(#pbw-ar)" />

              {/* integration layer — amber (unresolved) */}
              <rect x="182" y="108" width="132" height="100" fill="none" stroke="#f0bf6c" strokeWidth="1.5" />
              <text x="248" y="150" fill="#2c3a36" fontSize="13" fontFamily="monospace" textAnchor="middle">Integration</text>
              <text x="248" y="172" fill="#2c3a36" fontSize="11" fontFamily="monospace" textAnchor="middle">sources &#8594; combined</text>

              {/* integration → model */}
              <line x1="314" y1="158" x2="372" y2="158" stroke="rgba(20,35,33,.55)" strokeWidth="1.5" markerEnd="url(#pbw-ar)" />

              {/* model layer — green (resolves the metric) */}
              <rect x="372" y="120" width="130" height="76" fill="none" stroke="#90d26f" strokeWidth="1.5" />
              <text x="437" y="152" fill="#2c3a36" fontSize="13" fontFamily="monospace" textAnchor="middle">Model</text>
              <text x="437" y="172" fill="#2c3a36" fontSize="11" fontFamily="monospace" textAnchor="middle">defined once</text>

              {/* model → reporting */}
              <line x1="502" y1="158" x2="560" y2="158" stroke="rgba(20,35,33,.55)" strokeWidth="1.5" markerEnd="url(#pbw-ar)" />

              {/* reporting layer — neutral (renders faithfully) */}
              <rect x="560" y="120" width="132" height="76" fill="none" stroke="rgba(20,35,33,.35)" />
              <text x="626" y="152" fill="#2c3a36" fontSize="13" fontFamily="monospace" textAnchor="middle">Reporting</text>
              <text x="626" y="172" fill="#2c3a36" fontSize="11" fontFamily="monospace" textAnchor="middle">Power BI</text>

              {/* legend */}
              <rect x="28" y="290" width="16" height="8" fill="#f0bf6c" />
              <text x="52" y="298" fill="#2c3a36" fontSize="11" fontFamily="monospace">unresolved layer</text>
              <rect x="212" y="290" width="16" height="8" fill="#90d26f" />
              <text x="236" y="298" fill="#2c3a36" fontSize="11" fontFamily="monospace">resolves the metric</text>
              <rect x="420" y="290" width="16" height="8" fill="#2c3a36" />
              <text x="444" y="298" fill="#2c3a36" fontSize="11" fontFamily="monospace">reporting layer, renders faithfully</text>
            </svg>
          </Diagram>
        }
      >
        <section id="short-answer">
          <h2>The short answer</h2>
          <p>&ldquo;We need better reporting&rdquo; sounds like one problem. It is usually three, wearing the same words. Until you separate them, any tool you buy is a guess.</p>
          <p>The three problems are these. First, a <strong>reporting-layer problem</strong>: the report itself is slow, confusing, or wrong, even though the data behind it is fine. The <strong>reporting layer</strong> is the software where charts and dashboards are built and read; a <strong>BI tool</strong> (business intelligence tool) such as Power BI is one. Second, a <strong>model problem</strong>: the same metric is calculated differently in different places because nothing defines it once. Third, an <strong>integration problem</strong>: the data you need lives in several systems that are never combined reliably, so someone stitches it together by hand.</p>
          <p>These map onto different fixes. A reporting-layer problem is fixed inside the BI tool. A model problem is fixed by defining each metric once. An integration problem is what a <strong>data warehouse</strong> addresses. So the honest answer to &ldquo;Power BI, a warehouse, or both?&rdquo; is that it depends which of the three problems you actually have, and in what proportion. Work out that first, and the tool question answers itself.</p>
        </section>

        <section id="usual">
          <h2>What this usually looks like</h2>
          <p>The request nearly always arrives as a tool question. &ldquo;Should we move to a warehouse?&rdquo; Or &ldquo;should we switch BI tool?&rdquo; The framing has already skipped the diagnosis and jumped to a purchase.</p>
          <p>It is easy to see why. One vendor demonstration makes a warehouse look like the answer to everything. Another makes a shinier dashboard tool look like the answer to everything. Both demonstrations are honest about their own layer and silent about the other two. Meanwhile the real symptoms are mixed together: reports that take thirty seconds to load, a revenue figure that differs between two dashboards, and a finance analyst who spends the first three days of every month exporting and pasting spreadsheets.</p>
          <p>Those three symptoms live in three different layers. Buying one product to cure all of them is how organisations end up with an expensive warehouse feeding reports that are still slow, or a new BI tool that renders the same untrustworthy number in a nicer font.</p>
        </section>

        <section id="try-first">
          <h2>Separate the three problems first</h2>
          <p>You can sort the symptoms yourself in an afternoon, before you talk to any vendor. The goal is not to pick a product. It is to label each complaint by the layer it belongs to, so you can see which layer carries most of the pain.</p>
          <TryThisFirst title="Separate the three problems first">
            <ol>
              <li>List the actual complaints, one line each. &ldquo;The board report is slow.&rdquo; &ldquo;Revenue differs between two dashboards.&rdquo; &ldquo;We export from four systems by hand.&rdquo;</li>
              <li>For each complaint, ask the questions in order. Is the data even in one place? If no, it is an <strong>integration</strong> problem.</li>
              <li>If the data is in one place: is the metric defined once and reused, or does each report re-calculate it? If each report re-calculates it, it is a <strong>model</strong> problem.</li>
              <li>If the data is present and the metric is defined once, but the report is still slow, cluttered, or hard to read, it is a <strong>reporting-layer</strong> problem.</li>
              <li>Tally the complaints by layer. The layer with the most is where you start.</li>
            </ol>
          </TryThisFirst>
          <p>Symptoms cluster by layer in recognisable ways. A reporting-layer problem looks like a slow visual over a small dataset, or a single measure that is wrong in one report only. A model problem looks like the same metric showing two values, or every analyst re-writing the same definition in their own query. An integration problem looks like manual exports, and questions you cannot answer because two systems will not join.</p>
        </section>

        <section id="what-it-tells-you">
          <h2>What the answer tells you</h2>
          <p>Once the complaints are sorted, the shape of the answer appears. Read your tally like this.</p>
          <ul>
            <li><strong>Mostly reporting-layer.</strong> You do not need a warehouse, and you probably do not need a new BI tool. Fix the report and the model inside the tool you already own. If the complaint is speed, the cause is usually the data model rather than the visuals, which is the subject of <a href="/insights/power-bi-slow">why Power BI is slow</a>.</li>
            <li><strong>Mostly model.</strong> You need each metric defined once, in agreed terms, and reused everywhere. This is a modelling job, not a purchase, and for a while it can live inside the BI tool&rsquo;s own model.</li>
            <li><strong>Mostly integration.</strong> This is the case a warehouse is built for. Confirm you genuinely have the integration problem before you buy one, because a warehouse you do not need is pure cost. That test is set out in <a href="/insights/before-you-build-a-data-warehouse">whether you need a warehouse at all</a>.</li>
          </ul>
          <p>Most organisations have some of all three. That is normal. The value of the tally is not a single verdict; it is knowing the proportion, and therefore the order in which to fix things.</p>
        </section>

        <section id="underneath">
          <h2>Reporting layer, model, and integration</h2>
          <p>Underneath the tool names are three layers that stack on top of one another. Each has a distinct job, and each can be the one that is broken.</p>
          <p>The <strong>reporting layer</strong> is where reports and dashboards are built and read. Power BI is one such tool; the same reasoning applies to any BI tool. Its job is to render whatever the layer below returns. A faithful renderer cannot invent a correct number from a wrong input, which is why a reporting-only fix so often fails to settle an argument about figures.</p>
          <p>The <strong>model</strong> is where data is shaped and metrics are defined. The important idea here is the <strong>semantic model</strong>: one governed place where a metric such as revenue or active customer is defined once, in plain terms, owned by a named person, and reused by every report. Power BI has its own model built in, which the tool now calls a semantic model, so for a handful of sources you can define metrics once inside Power BI without any warehouse at all.</p>
          <p>The <strong>integration</strong> layer is where separate source systems are combined into one query-ready shape. This is what a <strong>data warehouse</strong> is: a central database that pulls data from many systems and holds it modelled and joined, ready to query. Modern warehouses are usually loaded by <strong>ELT</strong> (extract, load, transform): raw data is copied into the warehouse first, then transformed inside it. The copying is done by <strong>managed connectors</strong>, pre-built links that pull from a source such as a CRM on a schedule, without you writing or maintaining the extraction code.</p>
          <p>So when is the BI tool&rsquo;s own model enough, and when do you need a warehouse? Power BI can import, model, and define metrics for a few sources feeding one team perfectly well. It outgrows that point when sources multiply, when data volumes grow past what the tool can refresh reliably, when the same modelled data is needed by more than one tool or team, or when you need history that the source systems overwrite. At that point the modelling and integration belong in a warehouse, and the BI tool reads from it rather than doing the heavy lifting itself.</p>
          <p>The model layer is worth making concrete. Below, one canonical revenue metric is defined once as a view over a small <strong>star schema</strong>, a common warehouse shape with one central fact table of measured events surrounded by descriptive dimension tables.</p>
          <pre>{`-- One canonical revenue metric, defined once in the model layer.
-- fact_invoice_line has one row per invoice line (its grain);
-- the dimensions add date and customer context.
create view reporting.revenue_monthly as
select
  d.month_start,
  c.customer_id,
  sum(f.amount_gbp) as revenue_gbp
from   fact_invoice_line f
join   dim_date     d on d.date_key     = f.invoice_date_key
join   dim_customer c on c.customer_key = f.customer_key
where  f.is_intercompany = false
group  by d.month_start, c.customer_id;`}</pre>
          <p>The point of the view is not the SQL. It is that revenue is defined in exactly one place, with the intercompany exclusion written down once. Every report then reads <code>reporting.revenue_monthly</code> instead of re-implementing the rule, so two dashboards cannot quietly disagree. That is a model fix. Whether it lives in a warehouse view like this, or in the BI tool&rsquo;s own semantic model, depends entirely on your integration answer above.</p>
        </section>

        <section id="good">
          <h2>What good looks like</h2>
          <p>Good is not a particular product. It is three layers that are separable, each doing only its own job, each with an owner. In practice that looks like four things.</p>
          <ul>
            <li>Each metric is defined once in the model and reused by every report, rather than re-written per dashboard.</li>
            <li>Integration is only as heavy as it needs to be. Managed connectors and scheduled loads exist where several sources genuinely must be combined, and nowhere that a single source would do.</li>
            <li>The reporting layer reads a governed model. It shapes and presents; it does not quietly re-derive the numbers.</li>
            <li>Anyone can name the layer a given problem lives in, so the next fix goes to the right place instead of the newest tool.</li>
          </ul>
          <p>When the layers are separate, a problem is diagnosable. A slow report is a reporting or model question. A number that differs between two reports is a model question. A source that will not join is an integration question. The tool argument stops, because the layer tells you where to look.</p>
        </section>

        <section id="wrong">
          <h2>Common ways this goes wrong</h2>
          <ul>
            <li>Buying a warehouse to fix a slow report. Speed and clarity are reporting or model problems. Integrating more sources does not make a single report render faster; it adds cost the report never asked for.</li>
            <li>Rebuilding reports on an unmodelled source. New visuals over an undefined metric produce fresh disagreement within weeks, because nothing has been defined once.</li>
            <li>Switching BI tool to fix a model problem. A new reporting layer renders the same undefined metric just as faithfully as the old one did.</li>
            <li>Building integration before you have the integration problem. A warehouse for two sources feeding one team is complexity and cost you inherit for no gain.</li>
            <li>Defining metrics inside individual reports. The definition drifts the moment a second analyst writes a second query, whichever tool you use.</li>
            <li>Doing all three at once, with no order. Layers depend on the ones beneath them, so an unordered rebuild fixes the visible symptom and leaves the cause in place.</li>
          </ul>
        </section>

        <section id="boundary">
          <h2>When you genuinely need the warehouse too</h2>
          <p>Plenty of reporting problems never need a warehouse. The reporting layer and a well-defined model inside the BI tool carry a small organisation a long way. The warehouse earns its cost only when the integration problem is real and recurring, not occasional. These are the conditions that make it genuinely time.</p>
          <SystemBoundary
            conditions={[
              "Data lives in several source systems that must be combined reliably and repeatedly, not exported and pasted together by hand each month.",
              "More than one tool or team needs the same combined, modelled data, so defining it inside a single BI report is no longer enough.",
              "Data volumes or the weight of the transformations exceed what the BI tool can refresh reliably on its own.",
              "You need history that the source systems overwrite, such as the state of a record as it was at each month end.",
              "The same customer or metric has to be resolved across systems on a schedule, rather than reconciled by hand when someone asks.",
            ]}
          />
        </section>

        <section id="decision">
          <h2>A decision guide</h2>
          <p>Once each complaint is labelled by layer, the first move is usually clear. Use this as a quick lookup from the symptom you actually have.</p>
          <table className="article-table">
            <thead>
              <tr>
                <th>Symptom</th>
                <th>Underlying problem</th>
                <th>First move</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Report is slow or cluttered, though the data is small and already in one place</td>
                <td>Reporting layer</td>
                <td>Fix the report and its model inside Power BI; no new tool needed</td>
              </tr>
              <tr>
                <td>The same metric shows different values in different reports</td>
                <td>Model</td>
                <td>Define the metric once in a governed semantic model</td>
              </tr>
              <tr>
                <td>Every analyst re-writes the same definition in their own query</td>
                <td>Model</td>
                <td>Govern one semantic model and point every report at it</td>
              </tr>
              <tr>
                <td>You export and paste from several systems by hand each month</td>
                <td>Integration</td>
                <td>A warehouse loaded by managed connectors and ELT</td>
              </tr>
              <tr>
                <td>Two systems will not join, so a question cannot be answered</td>
                <td>Integration</td>
                <td>Combine the sources into a warehouse, then model on top</td>
              </tr>
              <tr>
                <td>All of the above, at scale, across teams</td>
                <td>All three</td>
                <td>Build bottom-up: integration, then the model, then the reporting</td>
              </tr>
            </tbody>
          </table>
          <p>The order in the last row is the rule for every case. Fix the lowest layer that is genuinely broken first, because the layers above it can only ever be as reliable as the one beneath. A warehouse under an undefined metric still produces disagreement; a polished report over a warehouse you did not need is expensive decoration. Diagnose the layer, fix it in order, and buy only what the diagnosis actually calls for.</p>
        </section>
      </ArticleLayout>
    </PageShell>
  );
}
