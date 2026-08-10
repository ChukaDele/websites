import type { Metadata } from "next";
import { PageShell } from "../../../components/site/PageShell";
import { ArticleLayout, TryThisFirst, SystemBoundary, Diagram } from "../../../components/insights/Article";
import { pageMetadata } from "../../../lib/seo";

const SLUG = "why-dashboards-disagree";
const TOC = [
  { id: "short-answer", label: "The short answer" },
  { id: "usual", label: "What this usually looks like" },
  { id: "try-first", label: "Before you rebuild anything" },
  { id: "what-it-tells-you", label: "What the result tells you" },
  { id: "underneath", label: "What is happening underneath" },
  { id: "good", label: "What good looks like" },
  { id: "wrong", label: "Common ways this goes wrong" },
  { id: "boundary", label: "When DIY stops being sensible" },
  { id: "decision", label: "A decision guide" },
];

export const metadata: Metadata = pageMetadata({
  title: "Why Finance and Sales Numbers Disagree — Data Reconciliation Guide | The Bredge",
  description: "Finance and Sales revenue numbers disagree because of grain, timing, identity and definitions — not the chart. A practical reconciliation guide and checklist.",
  path: "/insights/why-dashboards-disagree",
});

export default function Page() {
  return (
    <PageShell>
      <ArticleLayout
        slug={SLUG}
        toc={TOC}
        heroDiagram={
          <Diagram
            title="Three systems, three revenue numbers, reconciled to one canonical metric"
            caption="Different sources measure revenue at a different grain and with different definitions; reconciliation resolves them into one canonical figure."
          >
            <svg viewBox="0 0 720 300" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <marker id="wdd-ar" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="rgba(20,35,33,.55)" />
                </marker>
              </defs>

              {/* source boxes — different sizes stand for different grain */}
              <rect x="36" y="34" width="150" height="50" fill="none" stroke="rgba(20,35,33,.35)" />
              <text x="52" y="58" fill="#2c3a36" fontSize="13" fontFamily="monospace">Finance</text>
              <text x="52" y="74" fill="#2c3a36" fontSize="11" fontFamily="monospace">£4.3m</text>

              <rect x="36" y="110" width="178" height="58" fill="none" stroke="rgba(20,35,33,.35)" />
              <text x="52" y="136" fill="#2c3a36" fontSize="13" fontFamily="monospace">CRM</text>
              <text x="52" y="154" fill="#2c3a36" fontSize="11" fontFamily="monospace">£4.5m</text>

              <rect x="44" y="196" width="132" height="44" fill="none" stroke="rgba(20,35,33,.35)" />
              <text x="60" y="218" fill="#2c3a36" fontSize="13" fontFamily="monospace">Billing</text>
              <text x="60" y="233" fill="#2c3a36" fontSize="11" fontFamily="monospace">£4.2m</text>

              {/* unresolved inputs — amber */}
              <line x1="186" y1="59" x2="298" y2="116" stroke="#f0bf6c" strokeWidth="1.5" markerEnd="url(#wdd-ar)" />
              <line x1="214" y1="139" x2="298" y2="130" stroke="#f0bf6c" strokeWidth="1.5" markerEnd="url(#wdd-ar)" />
              <line x1="176" y1="218" x2="298" y2="146" stroke="#f0bf6c" strokeWidth="1.5" markerEnd="url(#wdd-ar)" />
              <text x="238" y="96" fill="#f0bf6c" fontSize="15" fontFamily="monospace">≠</text>

              {/* reconciliation node */}
              <rect x="300" y="98" width="132" height="66" fill="none" stroke="rgba(20,35,33,.35)" />
              <text x="366" y="126" fill="#2c3a36" fontSize="13" fontFamily="monospace" textAnchor="middle">reconcile</text>
              <text x="366" y="146" fill="#2c3a36" fontSize="11" fontFamily="monospace" textAnchor="middle">match records</text>

              {/* resolved output — green */}
              <text x="486" y="126" fill="#90d26f" fontSize="15" fontFamily="monospace">=</text>
              <line x1="432" y1="131" x2="534" y2="150" stroke="#90d26f" strokeWidth="1.8" markerEnd="url(#wdd-ar)" />

              {/* canonical figure — green */}
              <rect x="536" y="118" width="152" height="64" fill="none" stroke="#90d26f" strokeWidth="1.5" />
              <text x="556" y="146" fill="#2c3a36" fontSize="13" fontFamily="monospace">Revenue</text>
              <text x="556" y="166" fill="#2c3a36" fontSize="11" fontFamily="monospace">£4.3m · one figure</text>

              {/* legend */}
              <rect x="36" y="276" width="18" height="8" fill="#f0bf6c" />
              <text x="62" y="284" fill="#2c3a36" fontSize="11" fontFamily="monospace">unresolved mismatch</text>
              <rect x="260" y="276" width="18" height="8" fill="#90d26f" />
              <text x="286" y="284" fill="#2c3a36" fontSize="11" fontFamily="monospace">reconciled figure</text>
            </svg>
          </Diagram>
        }
      >
        <section id="short-answer">
          <h2>The short answer</h2>
          <p>The board pack says one number. The CRM says another. Finance&rsquo;s spreadsheet says a third. Every one of those figures has an honest explanation, and nobody wants another meeting about which one is right.</p>
          <p>Here is the short answer. Finance and Sales disagree because each source measures revenue differently. They count at a different <strong>grain</strong> (the level of detail that one row represents), over a different time window, using a different definition of the word, and with a different idea of who the customer is. None of the systems is broken. They are answering slightly different questions with the same word.</p>
          <p>That is why rebuilding the dashboard does not help. The chart is a faithful renderer: it shows whatever the query returns. The disagreement lives upstream, in the sources and the definitions, not in the visualisation. So the fix is upstream too.</p>
        </section>

        <section id="usual">
          <h2>What this usually looks like</h2>
          <p>It usually starts in a monthly meeting. The revenue on the board pack does not match the number the sales director quotes from the CRM. Someone opens Finance&rsquo;s workbook and finds a third figure. Each person is certain their number is correct, because within their own system it is.</p>
          <p>The commercial team counts a deal when it is signed. Finance counts revenue when it can be recognised, spread across the months in which the service is actually delivered. Billing counts money when it raises an invoice. A refund is a negative order in one system and a deleted order in another. A single customer is one account in the CRM, two billing entities, and three logins in the product.</p>
          <p>So the meeting turns into archaeology. People screenshot tiles, export spreadsheets, and argue from totals. An hour later everyone agrees to &ldquo;look into it&rdquo;, and the same gap reappears next month. The pattern is familiar: the numbers are close enough to feel like they should match, and far enough apart to matter.</p>
        </section>

        <section id="try-first">
          <h2>Before you rebuild anything</h2>
          <p>You can usually locate the cause yourself in an afternoon, without touching the BI tool. The goal is not to force the numbers to match. It is to explain the gap: to break it into named, understood parts. A reconciliation is finished when every pound of difference has a reason, not when the difference happens to be small.</p>
          <p>Work from records, not totals. Two totals can match by accident, built from errors that cancel out. Two totals can differ for a reason that is entirely correct. Only the underlying rows tell you which.</p>
          <TryThisFirst title="Before you rebuild anything">
            <ol>
              <li>Write the metric definition in one sentence. &ldquo;Revenue&rdquo; is not a question; &ldquo;recognised revenue, UK entity, June, excluding intercompany&rdquo; is.</li>
              <li>Pull both source totals for the exact same time range. Same start date, same end date, same time zone.</li>
              <li>Compare the refresh timestamps of each source. Two systems updated at different moments will disagree for entirely correct reasons.</li>
              <li>State the grain of each dataset. Is one row an order, an order line, an invoice, an invoice line, or a customer?</li>
              <li>Match records instead of comparing only totals. Line up the underlying rows and find which appear in one source but not the other.</li>
              <li>Classify every difference. Put each part of the gap into one class: timing, identity, scope, duplication, currency, grain, or definition.</li>
            </ol>
          </TryThisFirst>
          <p>Those seven classes are the whole vocabulary of a reconciliation. Name the class and you have named the cause.</p>
        </section>

        <section id="what-it-tells-you">
          <h2>What the result tells you</h2>
          <p>Each class points at a different cause, and each cause has a different owner. Read your gap like this.</p>
          <ul>
            <li><strong>Timing</strong>: the sources were measured at different moments, or over slightly different windows. Likely cause: different refresh schedules, or one number includes late-arriving transactions the other has not seen yet.</li>
            <li><strong>Identity</strong>: the same real-world customer appears as more than one record, or two different customers share an identifier. Likely cause: no shared customer key across systems.</li>
            <li><strong>Scope</strong>: the sources include different populations. Likely cause: one figure excludes a region, a legal entity, intercompany trade (sales between parts of the same group), or test accounts that the other keeps.</li>
            <li><strong>Duplication</strong>: a single transaction is counted more than once. Likely cause: a re-import, or a join that fans out (see grain and cardinality below).</li>
            <li><strong>Currency</strong>: figures are held in different currencies, or converted on different dates at different rates.</li>
            <li><strong>Grain</strong>: the sources count different units, such as orders versus order lines. Likely cause: summing a table without checking what one row represents.</li>
            <li><strong>Definition</strong>: the systems mean different things by the word. Likely cause: Finance recognises revenue over time; Sales books it at signature.</li>
          </ul>
          <p>The last one matters most. A definition difference is not something engineering can fix on its own. Someone has to decide which definition is canonical for the board pack, and then everyone has to use it.</p>
        </section>

        <section id="underneath">
          <h2>What is happening underneath</h2>
          <p>Underneath the reconciliation, four technical ideas explain almost every gap.</p>
          <p><strong>Grain</strong> is the level of detail that one row represents. An orders table has one row per order; an order-lines table has one row per line within an order. Sum the wrong one and you double-count. Every table should have one clearly stated grain, and any join that crosses grains should fan out on purpose, not by accident.</p>
          <p><strong>Source freshness</strong> is how recently a source was last updated. If one dataset refreshes hourly and another nightly, the two will disagree every morning, and both will be correct. Always check the refresh timestamp before you suspect the logic.</p>
          <p><strong>Entity identity</strong> is deciding when two records describe the same real-world customer. Source systems mint their own keys, so one company can be three account IDs in the CRM, two in billing, and one in the warehouse. Identity resolution (matching those records to a single canonical customer) is the deepest and most common cause of disagreement, and it belongs upstream of anything a stakeholder sees. It is the same problem as <a href="/insights/one-customer-view">building one reliable customer view</a>, and it rarely solves itself.</p>
          <p><strong>Join cardinality</strong> is how many rows on one side of a join match rows on the other. A one-to-many join (one customer to many invoices) will multiply a figure the moment you sum across it. Duplicated revenue almost always traces back to a join that fanned out, or a source imported twice.</p>
          <p>Two short queries take most of the guesswork out. The first sums each source over an identical window, so any remaining gap cannot be blamed on the date range. It uses a half-open range (on or after the first of June, and strictly before the first of July), which counts every day of the month exactly once and never spills into the next.</p>
          <pre>{`-- 1. Sum each source over exactly the same window
select 'finance' as source, sum(amount_gbp) as revenue
from   finance.recognised_revenue
where  recognised_date >= date '2026-06-01'
  and  recognised_date <  date '2026-07-01'
union all
select 'billing' as source, sum(amount_gbp) as revenue
from   billing.invoice_lines
where  invoice_date >= date '2026-06-01'
  and  invoice_date <  date '2026-07-01';`}</pre>
          <p>If the totals still differ, the second query looks for duplication. It groups the billing lines by invoice and keeps only the invoices that appear more than once. Any row it returns is a duplicate inflating the total: the signature of a fan-out join or a double import.</p>
          <pre>{`-- 2. Find duplicated invoices inflating the billing total
select invoice_id, count(*) as line_rows
from   billing.invoice_lines
where  invoice_date >= date '2026-06-01'
  and  invoice_date <  date '2026-07-01'
group  by invoice_id
having count(*) > 1;`}</pre>
          <p>Between them, these two checks separate a timing gap from a grain or duplication gap in minutes. What they cannot resolve is a definition difference, because that is a decision about the business. That decision needs a home, and the home is a <strong>semantic layer</strong>: one governed place where a metric such as revenue or active customer is defined once and reused by every report. Without it, each analyst re-implements the metric in their own query, and the definitions drift apart within weeks.</p>
        </section>

        <section id="good">
          <h2>What good looks like</h2>
          <p>Good does not mean every system holds the same number. It means every number is explainable and traceable. In practice that looks like four things.</p>
          <ul>
            <li>One governed definition per metric, written in plain English, owned by a named person, and used by every report &mdash; the semantic layer, not forty copies scattered across forty queries.</li>
            <li>Sources reconciled on a routine, especially finance against the warehouse, so the gap is a monitored check rather than a monthly fire drill.</li>
            <li>Automated tests that fail loudly when a source double-counts, a join fans out, or a total moves more than expected.</li>
            <li>Lineage you can follow: the ability to trace any figure on a dashboard back through the model to the source row it came from.</li>
          </ul>
          <p>When these are in place, a disagreement becomes information. It tells you two definitions have diverged, and you can say exactly where and why &mdash; in minutes, not in another meeting.</p>
        </section>

        <section id="wrong">
          <h2>Common ways this goes wrong</h2>
          <ul>
            <li>Rebuilding the dashboard. It moves the argument to a new chart; it does not settle it. The cause is upstream.</li>
            <li>Comparing totals instead of records. Matching totals can hide compensating errors, and differing totals can be entirely correct. Only the rows tell the truth.</li>
            <li>Ignoring timing. Two numbers pulled at different moments will differ, and no amount of logic-checking will explain a gap that is really about refresh schedules.</li>
            <li>Letting joins fan out. A one-to-many join silently multiplies revenue. If a total jumps after a &ldquo;small&rdquo; model change, suspect cardinality first.</li>
            <li>&ldquo;Correcting&rdquo; the number that looks wrong until the totals match, without understanding why. This buries the problem instead of fixing it, and it returns next month.</li>
            <li>Defining metrics inside individual reports. The definition drifts the moment a second analyst writes a second query.</li>
          </ul>
        </section>

        <section id="boundary">
          <h2>When DIY stops being sensible</h2>
          <p>The afternoon reconciliation is worth doing, and often it is enough. It stops being enough when the same reconciliation has to run reliably every day, across systems that each define a customer differently, with nobody clearly responsible for the result. At that point you are no longer explaining a one-off gap. You are running a system (at every monthly close, when the accounts are finalised), and it needs to be built like one.</p>
          <SystemBoundary
            conditions={[
              "The same customer has to be resolved across CRM, billing, product, finance and support, rather than matched by hand each time.",
              "Finance, Sales and Product each define revenue or active customer differently, and no single definition is agreed as canonical.",
              "The reconciliation has to run reliably every day, or at every monthly close, not as an occasional investigation.",
              "A source that starts double-counting or arriving late needs to raise an alert, rather than being noticed weeks later in a meeting.",
              "Ownership is unclear: no one person is responsible for the definition, the reconciliation, or the fix when it breaks.",
            ]}
          />
        </section>

        <section id="decision">
          <h2>A decision guide</h2>
          <p>Once you have classified the gap, the first move is usually obvious. Use this as a quick lookup.</p>
          <table className="article-table">
            <thead>
              <tr>
                <th>Difference class</th>
                <th>What it means</th>
                <th>First fix</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Timing</td>
                <td>Sources measured at different moments or windows</td>
                <td>Compare refresh timestamps; re-pull both for an identical window</td>
              </tr>
              <tr>
                <td>Grain</td>
                <td>Sources count different units (orders versus lines)</td>
                <td>State each table&rsquo;s grain; sum at the right level</td>
              </tr>
              <tr>
                <td>Identity</td>
                <td>One customer as many records, or a shared ID</td>
                <td>Resolve to one canonical customer key upstream</td>
              </tr>
              <tr>
                <td>Duplication</td>
                <td>A transaction counted more than once</td>
                <td>Run the group-by / having check; find the fan-out join or re-import</td>
              </tr>
              <tr>
                <td>Scope</td>
                <td>Different populations included</td>
                <td>Agree the filters: region, entity, intercompany, test accounts</td>
              </tr>
              <tr>
                <td>Currency</td>
                <td>Different currencies or conversion dates</td>
                <td>Fix one reporting currency and one conversion rule</td>
              </tr>
              <tr>
                <td>Definition</td>
                <td>Systems mean different things by the word</td>
                <td>Agree the canonical definition, then encode it once</td>
              </tr>
            </tbody>
          </table>
          <p>If you are not sure which class is causing most of your gap, <a href="/data-diagnostic">a Data Diagnostic</a> is a fast way to find out &mdash; and to tell whether this is a one-afternoon reconciliation or a system that now needs building.</p>
        </section>
      </ArticleLayout>
    </PageShell>
  );
}
