import { PageShell } from "../../../components/site/PageShell";
import { ArticleLayout, TryThisFirst, SystemBoundary, Diagram, Example, Pull, ForYourDataPerson } from "../../../components/insights/Article";
import { insightMetadata } from "../../../lib/insights";

const SLUG = "automate-monthly-reporting";
const TOC = [
  { id: "how", label: "The safe way to automate" },
  { id: "usual", label: "Why monthly reports become fragile" },
  { id: "try-first", label: "Map it before you automate it" },
  { id: "what-it-tells-you", label: "What the map tells you" },
  { id: "underneath", label: "What to move, and what to keep in Excel" },
  { id: "example", label: "Worked example: a multi-branch pack" },
  { id: "good", label: "What a controlled report looks like" },
  { id: "wrong", label: "Common ways this goes wrong" },
  { id: "boundary", label: "When this becomes a system" },
  { id: "decision", label: "Where each step belongs" },
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
            title="From a manual monthly workflow to a controlled, auditable one"
            caption="Automation done well moves calculation and joins upstream into tested logic, and leaves Excel for the last mile of judgement and presentation."
          >
            <svg viewBox="0 0 720 320" xmlns="http://www.w3.org/2000/svg" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" fontSize="10" fill="#2c3a36">
              <defs>
                <marker id="amr-arw" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="rgba(20,35,33,.55)" />
                </marker>
              </defs>

              {/* ── TOP BAND: manual, fragile ───────────────────────── */}
              <rect x="16" y="16" width="9" height="9" fill="#f0bf6c" />
              <text x="31" y="24" fontSize="9">BEFORE: MANUAL, REBUILT BY HAND</text>

              {/* source stack */}
              <rect x="16" y="44" width="70" height="20" fill="#f3f0e8" stroke="rgba(20,35,33,.35)" />
              <rect x="16" y="70" width="70" height="20" fill="#f3f0e8" stroke="rgba(20,35,33,.35)" />
              <rect x="16" y="96" width="70" height="20" fill="#f3f0e8" stroke="rgba(20,35,33,.35)" />
              <text x="51" y="57" textAnchor="middle" fontSize="9">CRM</text>
              <text x="51" y="83" textAnchor="middle" fontSize="9">BILLING</text>
              <text x="51" y="109" textAnchor="middle" fontSize="9">LEDGER</text>

              {/* joins by hand */}
              <line x1="86" y1="54" x2="148" y2="72" stroke="rgba(20,35,33,.35)" strokeWidth="1.4" markerEnd="url(#amr-arw)" />
              <line x1="86" y1="80" x2="148" y2="80" stroke="rgba(20,35,33,.35)" strokeWidth="1.4" markerEnd="url(#amr-arw)" />
              <line x1="86" y1="106" x2="148" y2="88" stroke="rgba(20,35,33,.35)" strokeWidth="1.4" markerEnd="url(#amr-arw)" />

              <rect x="150" y="54" width="92" height="52" fill="#f0bf6c" stroke="rgba(20,35,33,.35)" />
              <text x="196" y="76" textAnchor="middle">MANUAL</text>
              <text x="196" y="90" textAnchor="middle">JOIN</text>

              <line x1="242" y1="80" x2="298" y2="80" stroke="rgba(20,35,33,.35)" strokeWidth="1.4" markerEnd="url(#amr-arw)" />

              {/* fragile workbook */}
              <rect x="300" y="52" width="118" height="56" fill="#f0bf6c" stroke="#2c3a36" strokeWidth="1.1" strokeDasharray="4 3" />
              <text x="359" y="78" textAnchor="middle">MASTER.xlsx</text>
              <text x="359" y="94" textAnchor="middle" fontSize="7.5">ONE OWNER · NO TESTS</text>

              <line x1="418" y1="80" x2="474" y2="80" stroke="rgba(20,35,33,.35)" strokeWidth="1.4" markerEnd="url(#amr-arw)" />

              <rect x="476" y="54" width="110" height="52" fill="#f3f0e8" stroke="rgba(20,35,33,.35)" />
              <text x="531" y="76" textAnchor="middle">MONTHLY</text>
              <text x="531" y="90" textAnchor="middle">REPORT</text>

              {/* divider */}
              <line x1="16" y1="145" x2="704" y2="145" stroke="rgba(20,35,33,.16)" strokeWidth="1" strokeDasharray="2 4" />

              {/* ── BOTTOM BAND: controlled, tested ─────────────────── */}
              <rect x="16" y="162" width="9" height="9" fill="#90d26f" />
              <text x="31" y="170" fontSize="9">AFTER: CONTROLLED, TESTED, AUDITABLE</text>

              {/* source stack */}
              <rect x="16" y="196" width="70" height="20" fill="#f3f0e8" stroke="rgba(20,35,33,.35)" />
              <rect x="16" y="222" width="70" height="20" fill="#f3f0e8" stroke="rgba(20,35,33,.35)" />
              <rect x="16" y="248" width="70" height="20" fill="#f3f0e8" stroke="rgba(20,35,33,.35)" />
              <text x="51" y="209" textAnchor="middle" fontSize="9">CRM</text>
              <text x="51" y="235" textAnchor="middle" fontSize="9">BILLING</text>
              <text x="51" y="261" textAnchor="middle" fontSize="9">LEDGER</text>

              <line x1="86" y1="206" x2="148" y2="216" stroke="rgba(20,35,33,.35)" strokeWidth="1.4" markerEnd="url(#amr-arw)" />
              <line x1="86" y1="232" x2="148" y2="224" stroke="rgba(20,35,33,.35)" strokeWidth="1.4" markerEnd="url(#amr-arw)" />
              <line x1="86" y1="258" x2="148" y2="232" stroke="rgba(20,35,33,.35)" strokeWidth="1.4" markerEnd="url(#amr-arw)" />

              {/* tested model */}
              <rect x="150" y="200" width="96" height="48" fill="#90d26f" stroke="rgba(20,35,33,.35)" />
              <text x="198" y="220" textAnchor="middle">TESTED</text>
              <text x="198" y="234" textAnchor="middle">MODEL</text>
              <text x="198" y="262" textAnchor="middle" fontSize="7" fill="#4a5a54">joined on keys</text>

              <line x1="246" y1="224" x2="284" y2="224" stroke="rgba(20,35,33,.35)" strokeWidth="1.4" markerEnd="url(#amr-arw)" />

              {/* checks */}
              <rect x="286" y="204" width="74" height="40" fill="none" stroke="#90d26f" strokeWidth="1.5" />
              <text x="323" y="220" textAnchor="middle" fontSize="9">DATA</text>
              <text x="323" y="234" textAnchor="middle" fontSize="9">TESTS</text>
              <text x="323" y="258" textAnchor="middle" fontSize="7" fill="#4a5a54">rows · nulls · totals</text>

              <line x1="360" y1="224" x2="398" y2="224" stroke="rgba(20,35,33,.35)" strokeWidth="1.4" markerEnd="url(#amr-arw)" />

              {/* excel last mile */}
              <rect x="400" y="200" width="104" height="48" fill="#f3f0e8" stroke="rgba(20,35,33,.35)" />
              <text x="452" y="220" textAnchor="middle" fontSize="9">EXCEL:</text>
              <text x="452" y="234" textAnchor="middle" fontSize="9">LAST MILE</text>
              <text x="452" y="262" textAnchor="middle" fontSize="7" fill="#4a5a54">judgement · layout</text>

              <line x1="504" y1="224" x2="542" y2="224" stroke="rgba(20,35,33,.35)" strokeWidth="1.4" markerEnd="url(#amr-arw)" />

              {/* distribution */}
              <rect x="544" y="204" width="96" height="40" fill="none" stroke="rgba(20,35,33,.35)" />
              <text x="592" y="227" textAnchor="middle" fontSize="9">DISTRIBUTE</text>
              <text x="592" y="258" textAnchor="middle" fontSize="7" fill="#4a5a54">after sign-off</text>
            </svg>
          </Diagram>
        }
      >
        <section id="how">
          <h2>How do you automate monthly management reporting safely?</h2>
          <p>Separate the mechanical work from the judgement, and add checks so that automation cannot fail silently. Automate the parts that are mechanical and repeatable: collecting the data, joining it, calculating the figures, and checking them. Move that work upstream, into tested logic that runs the same way every month, rather than leaving it inside a workbook that one person rebuilds by hand. Keep the spreadsheet for the last mile: the judgement, the commentary, and the presentation that a person still has to do.</p>
          <p>Excel is not the problem. A spreadsheet is an excellent place to shape a final view and add human judgement. It is a poor place to store the definitive calculation for a report that several people depend on every month. The fix is to give each part of the work the right home, not to ban the tool.</p>
          <p>Above all, add review controls.</p>
          <Pull>Automation without checks does not remove fragility; it hides it. A pipeline that breaks quietly is worse than a manual step that breaks loudly.</Pull>
          <p>This is the pillar guide for management and board reporting. If your immediate pain is cleaning the same Excel files every month, the <a href="/insights/excel-cleaning-automation">Power Query clean-up guide</a> is the tactical companion. If you would rather have it built, this is what our <a href="/services/data-projects">reporting automation projects</a> do.</p>
        </section>

        <section id="usual">
          <h2>Why monthly management reports become fragile</h2>
          <p>Most monthly reporting starts as a sensible spreadsheet and grows into something no one meant to build.</p>
          <p>The routine is familiar. Someone exports data from several systems: the CRM, the billing platform, the general ledger, perhaps a payroll or operations tool. They paste each export into a master workbook. They line the exports up by hand, matching a customer here and an account code there. Formulas then turn the raw rows into the figures the board sees. Finally, the numbers are copied into a formatted pack and sent out.</p>
          <p>This works, until it does not. The joins are manual, so a renamed column or an extra header row breaks them without warning. The calculations live in cells that only one person fully understands. The workbook has become load-bearing: a single tab, formula, or paste can change a reported number, and nothing flags it. When that person is on leave, the report stops. When a figure looks wrong, no one can quickly say why, because there is no record of where each number came from.</p>
          <p>None of this is a failure of care. It is what happens when a quick spreadsheet quietly becomes critical infrastructure without ever being designed as such. It is also, incidentally, closely related to <a href="/insights/why-dashboards-disagree">why the numbers disagree in the first place</a>: the same manual joins and private definitions that make one report fragile are what make two reports contradict each other.</p>
        </section>

        <section id="try-first">
          <h2>How to map a monthly report before you automate it</h2>
          <TryThisFirst title="Map it before you automate it">
            <p>Before you automate anything, map what you actually do. Automating a process you have not mapped usually just automates the mess. Spend an hour building a <strong>Monthly Reporting Automation Map</strong>: a plain list of every step in the current report, from raw source to final pack. For each report, write down:</p>
            <ol>
              <li><strong>Every input source, and who owns it.</strong> Name the system, the export, and the person to ask when it breaks.</li>
              <li><strong>Each step, marked as mechanical or judgement.</strong> Mechanical steps follow fixed rules. Judgement steps need a person to decide something.</li>
              <li><strong>The refresh timing, and the close cut-off.</strong> Note when each source becomes final, and the date the numbers must be fixed for the month.</li>
              <li><strong>Every manual join or lookup.</strong> Note where you match records by hand, or paste one export against another.</li>
              <li><strong>The single points of failure.</strong> Mark any step that only one person can do, or that breaks without warning.</li>
              <li><strong>What must be auditable.</strong> Mark any figure that has to be traced back to its source, or defended to auditors or the board.</li>
            </ol>
            <p>The <a href="/resources/reporting-automation-map">monthly reporting automation map</a> is a printable template for this exercise.</p>
          </TryThisFirst>
        </section>

        <section id="what-it-tells-you">
          <h2>What the map tells you</h2>
          <p>The map sorts the work for you, before you write a line of code.</p>
          <p><strong>The mechanical steps are your automation targets.</strong> Anything that follows fixed rules (an export, a join on a known key, a recurring calculation, a standard check) can move upstream into tested logic and run without you. These are the steps that are the same every month, and that a machine repeats more reliably than a person.</p>
          <p><strong>The judgement steps stay with a person.</strong> Deciding why a variance happened, what to say about it, and how to present it is not mechanical. Automating it would only produce confident nonsense. These steps belong in the last mile, in the spreadsheet, where a person can apply context.</p>
          <p><strong>The timing drives the schedule.</strong> A report cannot be correct before its slowest source is final. The map shows the true earliest moment the report can run, and where the close cut-off really sits. Automating the calculation does not help if the pipeline runs before the ledger is closed; it just produces a fast, wrong answer.</p>
          <p><strong>The single points of failure are your priority list.</strong> Each one is a place where today&rsquo;s process can stop, or go wrong, with no warning. These are the steps that most need a reliable, owned replacement, and the ones where automation, done properly, removes the most risk.</p>
        </section>

        <section id="underneath">
          <h2>What to move upstream, and what to keep in Excel</h2>
          <p>Underneath the tidy version of this workflow are a few well-understood engineering ideas. None is exotic; together they are what separate a controlled report from a fragile one.</p>
          <p><strong>Upstream transformation</strong> means doing the joining and calculating before the spreadsheet, in a place built for it, usually SQL over a database or data warehouse, rather than in workbook formulas. To transform data is to turn raw source rows into the shaped figures a report needs. The output is a <strong>tested data model</strong>: a defined table, with a clearly stated grain (what one row represents, for example one account per month), that the report reads from. The logic lives in version-controlled code, not in cells, so it can be reviewed, tested, and reused.</p>
          <p><strong>Data quality tests</strong> are automated assertions about that model. An assertion is a rule that must always hold; if it does not, the run fails and stops. Typical assertions check row counts (did every source arrive?), nulls (is any key or amount missing?), and totals (does the model tie back to a trusted control figure, such as the ledger balance?). These tests are what stop a broken join from ever reaching the board pack.</p>
          <ForYourDataPerson title="The P&amp;L model and two tests, in SQL">
          <p>A small, concrete example. The model below builds one profit-and-loss line per account per month, joined on a resolved account key rather than on the account name. Two tests follow it. Each test is written so that it returns rows only when something is wrong. A healthy run returns nothing.</p>
            <pre>{`-- model: mart_monthly_pnl
-- Grain: one row per account per month.
select
    date_trunc('month', gl.posted_at) as period,
    coa.report_line                   as line,
    sum(gl.amount)                    as amount
from raw_ledger.entries as gl
join ref.chart_of_accounts as coa
    on coa.account_id = gl.account_id          -- resolved key, not the name
where gl.posted_at < date_trunc('month', current_date)  -- closed periods
group by 1, 2;

-- test 1: every entry must map to a report line (a broken join)
select gl.entry_id
from raw_ledger.entries as gl
left join ref.chart_of_accounts as coa
    on coa.account_id = gl.account_id
where coa.report_line is null;

-- test 2: a cost line must never post a positive amount
select period, line, amount
from mart_monthly_pnl
where line = 'cost_of_sales' and amount > 0;`}</pre>
            <p>The first test lists any ledger entry that did not match a report line: a broken join, the classic silent failure of a manual workbook. The second lists any cost line that has posted a positive amount, which usually signals a sign or mapping error. Because each query returns rows only on failure, the orchestrator can treat any returned row as a reason to stop and raise an alert, before anyone sees the number.</p>
          </ForYourDataPerson>
          <p><strong>Refresh and orchestration timing</strong> decide when this runs. Orchestration is the scheduling and ordering of the steps (extract, transform, test, publish) so that each waits for the one before it. The schedule must fit the <strong>close process</strong>: the monthly routine by which each source is finalised and the period is locked. Running before the close produces numbers that are correct only for unfinished data.</p>
          <p><strong>Exception handling</strong> is the plan for when a test fails. A controlled workflow does not carry on regardless; it stops, tells a named person, and records what happened. <strong>Source ownership</strong> makes that possible: each input has an owner who is responsible for it and who is contacted when it breaks. <strong>Distribution</strong> (sending the finished pack to its readers) happens only after the checks pass and a person signs off, not automatically the moment the pipeline finishes.</p>
          <p>Finally, <strong>auditability</strong>, or lineage. Lineage is the traceable path from a figure in the final pack, back through the model, to the exact source rows that produced it. With lineage, any number can be explained and defended. Without it, a disputed figure becomes an argument no one can settle.</p>
        </section>

        <section id="example">
          <h2>Worked example: automating a multi-branch management pack</h2>
          <Example setting="UK distributor with a US branch · SAP Business One, Sage payroll, Excel" title="From five branch workbooks to one checked pack">
            <p>Today, each of five branches exports a sales and stock report from SAP Business One, payroll comes from Sage, and the finance lead spends the first week of the month aligning branch codes and cost centres in Excel before writing commentary.</p>
            <ol>
              <li><strong>Mechanical, moved upstream:</strong> a scheduled extract from a read-only copy of the SAP Business One database; one mapping table for branches, cost centres and report lines; the P&amp;L model above.</li>
              <li><strong>Checks:</strong> every journal maps to a report line; branch totals tie to the trial balance; payroll cost ties to the Sage payroll summary.</li>
              <li><strong>Judgement, kept in Excel:</strong> accruals, one-off adjustments, variance commentary and the board narrative.</li>
            </ol>
            <p>One branch trades in US dollars, so the pack shows growth two ways, with the rates stored once in a table and applied by the model, not typed into cells:</p>
            <div className="in-table-wrap"><table>
              <thead><tr><th>View</th><th>Q3 last year</th><th>Q3 this year</th><th>Growth</th></tr></thead>
              <tbody>
                <tr><td>US branch revenue in dollars</td><td>$1.50m</td><td>$1.65m</td><td>+10.0%</td></tr>
                <tr><td>Reported in sterling (1.25 then 1.35 $ per £)</td><td>£1.20m</td><td>£1.22m</td><td>+1.9%</td></tr>
                <tr><td>Constant currency (both at 1.25 $ per £)</td><td>£1.20m</td><td>£1.32m</td><td>+10.0%</td></tr>
              </tbody>
            </table></div>
            <p>The branch grew 10%; the stronger pound hid most of it in the reported figure. The rates are placeholders. Use the rate source your auditors accept, and see <a href="/insights/multi-entity-consolidation">multi-entity consolidation and FX</a> when separate legal entities are involved.</p>
          </Example>
          <p>The same shape works for a SaaS board pack: Stripe and Xero or QuickBooks upstream, MRR and cash tied to the ledger by tests, and commentary kept with the finance lead.</p>
        </section>

        <section id="good">
          <h2>What a controlled monthly report looks like</h2>
          <p>A controlled monthly report looks calm, because the fragile parts have been designed out.</p>
          <ul>
            <li><strong>The sources are owned.</strong> Each input has a named owner and a known refresh time, so there is no mystery about when data is ready or who to ask.</li>
            <li><strong>The logic is tested.</strong> Joins and calculations live in version-controlled code with data quality tests, not in workbook cells. A broken join fails a test instead of quietly changing a number.</li>
            <li><strong>The refresh is timed to the close.</strong> The pipeline runs after the last source is final, never before, so the figures are built on complete data.</li>
            <li><strong>Excel does the last mile.</strong> The spreadsheet is where a person adds judgement, commentary, and presentation: the work that genuinely needs a human. It reads from the tested model; it does not re-derive the numbers.</li>
            <li><strong>There is an audit trail.</strong> Every figure can be traced back to its source, and every run records what it did and whether the checks passed.</li>
          </ul>
        </section>

        <section id="wrong">
          <h2>Common reporting automation mistakes</h2>
          <p>The same few mistakes turn automation into a new kind of fragility.</p>
          <ul>
            <li><strong>Automating the mess unchanged.</strong> Wrapping a script around a broken manual process just makes the same errors faster and harder to see. Map and fix the process first.</li>
            <li><strong>Hiding manual fixes inside macros.</strong> A recorded macro that quietly patches known problems moves the fragility out of sight. When it breaks, it breaks silently.</li>
            <li><strong>No tests, so breakage is silent.</strong> Without data quality checks, a failed join or a missing source produces a plausible but wrong number that no one questions.</li>
            <li><strong>No owner.</strong> If no one is responsible for the pipeline and its sources, a failure has no one to catch it, and the report simply stops or misleads.</li>
            <li><strong>No audit trail.</strong> If a figure cannot be traced to its source, a dispute cannot be settled, and trust in the report erodes.</li>
            <li><strong>Automating before the definition is agreed.</strong> If the business has not agreed what a figure means, automation only entrenches one team&rsquo;s version of it. Settle the definition first, then automate.</li>
          </ul>
        </section>

        <section id="boundary">
          <h2>When monthly reporting needs a system</h2>
          <p>A single, well-owned spreadsheet, updated calmly once a month, may not need any of this. Do not build a pipeline to solve a problem you do not have. But a monthly report tends to cross a line (from a personal spreadsheet into a small system that the business runs on), and past that line the manual approach costs more than it saves.</p>
          <SystemBoundary
            intro="You have moved from a helpful spreadsheet to a reporting system when several of these are true at once:"
            conditions={[
              "Several sources feed the report, and they have to be joined the same way every month.",
              "The calculation must be trusted and repeatable: the same inputs must always give the same figure.",
              "It must run to a deadline every month, tied to the close, not when someone finds the time.",
              "Failures need to be caught before distribution, not discovered by a reader of the board pack.",
              "More than one person depends on it, yet no one clearly owns it end to end.",
            ]}
          />
        </section>

        <section id="decision">
          <h2>Where each reporting step belongs</h2>
          <p>Once the map is done, most steps sort cleanly into one of three homes: an upstream model, a review control, or the Excel last mile. Use this as a starting point.</p>
          <table className="article-table">
            <thead>
              <tr>
                <th>Report step</th>
                <th>What it involves</th>
                <th>Where it belongs</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Collecting source data</td>
                <td>Extracting or exporting from each system</td>
                <td>Upstream (automated pipeline)</td>
              </tr>
              <tr>
                <td>Joining systems</td>
                <td>Matching records on a shared, resolved key</td>
                <td>Upstream model</td>
              </tr>
              <tr>
                <td>Recurring calculation</td>
                <td>Margins, variances and totals by fixed rules</td>
                <td>Upstream model</td>
              </tr>
              <tr>
                <td>Quality check</td>
                <td>Row counts, nulls, tie-out to a control total</td>
                <td>Review control (data tests)</td>
              </tr>
              <tr>
                <td>Reconciliation</td>
                <td>Tying the model back to a trusted figure</td>
                <td>Review control</td>
              </tr>
              <tr>
                <td>Judgement and commentary</td>
                <td>Explaining why a figure moved</td>
                <td>Excel (last mile)</td>
              </tr>
              <tr>
                <td>Presentation</td>
                <td>Formatting the board pack</td>
                <td>Excel (last mile)</td>
              </tr>
              <tr>
                <td>Sign-off</td>
                <td>A person approves the pack before it is shared</td>
                <td>Review control</td>
              </tr>
              <tr>
                <td>Distribution</td>
                <td>Sending the finished pack to its readers</td>
                <td>Automated, only after sign-off</td>
              </tr>
            </tbody>
          </table>
          <p>The pattern holds across almost every monthly report: move the mechanical middle upstream into tested logic, wrap it in checks, and keep Excel for the judgement and presentation it is genuinely good at. That is the shape of most well-scoped <a href="/services/data-projects">reporting automation projects</a>: less dramatic than a rebuild, and far harder to break.</p>
          <p>Estimate the hours you would get back with the <a href="/resources/reporting-automation-map">reporting automation map</a>, and record each figure&rsquo;s definition in the <a href="/resources/kpi-dictionary-template">KPI dictionary template</a>. Groups with entities in several currencies should read <a href="/insights/multi-entity-consolidation">how to model multi-entity consolidation and FX</a>. When the monthly close depends on one person, <a href="/services/data-projects">a reporting automation project</a> moves the mechanical steps into tested logic.</p>
          <p>If your accounting system is QuickBooks Online or Xero, read <a href="/insights/connect-quickbooks-xero-to-power-bi">how to connect QuickBooks Online and Xero to Power BI</a> first, because the connection options changed in 2025 and 2026. For finished packs, see <a href="/work">work we have delivered</a>.</p>
        </section>
      </ArticleLayout>
    </PageShell>
  );
}
