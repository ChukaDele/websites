import type { Metadata } from "next";
import { PageShell } from "../../../components/site/PageShell";
import { ArticleLayout, TryThisFirst, SystemBoundary, Diagram } from "../../../components/insights/Article";
import { pageMetadata } from "../../../lib/seo";

const SLUG = "excel-cleaning-automation";
const TOC = [
  { id: "short-answer", label: "The short answer" },
  { id: "usual", label: "What this usually looks like" },
  { id: "try-first", label: "Map the clean-up first" },
  { id: "what-it-tells-you", label: "What the map tells you" },
  { id: "underneath", label: "What is actually happening" },
  { id: "good", label: "What good looks like" },
  { id: "wrong", label: "Common ways this goes wrong" },
  { id: "boundary", label: "Source problem or spreadsheet problem" },
  { id: "decision", label: "A decision guide" },
];

export const metadata: Metadata = pageMetadata({
  title: "Stop Cleaning Excel Files Every Month — What to Automate First | The Bredge",
  description: "Automate repeated Excel clean-up safely: what belongs in Power Query or SQL, what to fix at source, quality tests and human review — and what Excel should still do.",
  path: "/insights/excel-cleaning-automation",
});

export default function Page() {
  return (
    <PageShell>
      <ArticleLayout
        slug={SLUG}
        toc={TOC}
        heroDiagram={
          <Diagram
            title="Repeated manual clean-up above, the same clean-up recorded once and tested below"
            caption="The top path is redone by hand every month. The bottom path records the clean-up once, fixes the mess at source, and stops a bad file with a test before it reaches the report."
          >
            <svg viewBox="0 0 720 320" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <marker id="eca-am" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="#f0bf6c" />
                </marker>
                <marker id="eca-gr" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="#90d26f" />
                </marker>
              </defs>

              {/* top band: repeated manual clean-up, amber */}
              <text x="40" y="22" fill="#2c3a36" fontSize="11" fontFamily="monospace">repeated by hand</text>

              <rect x="40" y="32" width="112" height="26" fill="none" stroke="rgba(20,35,33,.35)" />
              <text x="52" y="49" fill="#2c3a36" fontSize="11" fontFamily="monospace">sales.xlsx</text>
              <rect x="40" y="64" width="112" height="26" fill="none" stroke="rgba(20,35,33,.35)" />
              <text x="52" y="81" fill="#2c3a36" fontSize="11" fontFamily="monospace">ledger.xlsx</text>
              <rect x="40" y="96" width="112" height="26" fill="none" stroke="rgba(20,35,33,.35)" />
              <text x="52" y="113" fill="#2c3a36" fontSize="11" fontFamily="monospace">crm.csv</text>

              <rect x="250" y="52" width="150" height="52" fill="none" stroke="rgba(20,35,33,.35)" />
              <text x="258" y="80" fill="#2c3a36" fontSize="13" fontFamily="monospace">manual steps</text>
              <text x="258" y="96" fill="#2c3a36" fontSize="10" fontFamily="monospace">rename · trim · retype</text>

              <rect x="486" y="58" width="150" height="40" fill="none" stroke="#f0bf6c" strokeWidth="1.5" />
              <text x="498" y="80" fill="#2c3a36" fontSize="12" fontFamily="monospace">monthly report</text>
              <text x="498" y="93" fill="#2c3a36" fontSize="10" fontFamily="monospace">re-done next month</text>

              <line x1="152" y1="45" x2="250" y2="66" stroke="#f0bf6c" strokeWidth="1.5" markerEnd="url(#eca-am)" />
              <line x1="152" y1="77" x2="250" y2="78" stroke="#f0bf6c" strokeWidth="1.5" markerEnd="url(#eca-am)" />
              <line x1="152" y1="109" x2="250" y2="90" stroke="#f0bf6c" strokeWidth="1.5" markerEnd="url(#eca-am)" />
              <line x1="400" y1="78" x2="486" y2="78" stroke="#f0bf6c" strokeWidth="1.5" markerEnd="url(#eca-am)" />

              {/* the loop that repeats every month */}
              <path d="M 560 58 C 560 22, 200 16, 96 32" fill="none" stroke="#f0bf6c" strokeWidth="1.2" strokeDasharray="4 4" markerEnd="url(#eca-am)" />
              <text x="300" y="14" fill="#f0bf6c" fontSize="11" fontFamily="monospace" textAnchor="middle">every month</text>

              {/* divider */}
              <line x1="40" y1="150" x2="680" y2="150" stroke="rgba(20,35,33,.35)" strokeWidth="1" strokeDasharray="2 5" />

              {/* bottom band: recorded once and tested, green */}
              <text x="40" y="172" fill="#2c3a36" fontSize="11" fontFamily="monospace">recorded once</text>

              <rect x="40" y="190" width="132" height="50" fill="none" stroke="rgba(20,35,33,.35)" />
              <text x="52" y="214" fill="#2c3a36" fontSize="12" fontFamily="monospace">fix at source</text>
              <text x="52" y="230" fill="#2c3a36" fontSize="10" fontFamily="monospace">where mess starts</text>

              <rect x="250" y="190" width="150" height="50" fill="none" stroke="rgba(20,35,33,.35)" />
              <text x="258" y="214" fill="#2c3a36" fontSize="12" fontFamily="monospace">Power Query / SQL</text>
              <text x="258" y="230" fill="#2c3a36" fontSize="10" fontFamily="monospace">one recorded step</text>

              <rect x="486" y="190" width="150" height="50" fill="none" stroke="#90d26f" strokeWidth="1.5" />
              <text x="498" y="214" fill="#2c3a36" fontSize="12" fontFamily="monospace">tested output</text>
              <text x="498" y="230" fill="#2c3a36" fontSize="10" fontFamily="monospace">assert · refresh</text>

              <line x1="172" y1="215" x2="250" y2="215" stroke="#90d26f" strokeWidth="1.8" markerEnd="url(#eca-gr)" />
              <line x1="400" y1="215" x2="486" y2="215" stroke="#90d26f" strokeWidth="1.8" markerEnd="url(#eca-gr)" />

              {/* legend */}
              <rect x="40" y="294" width="18" height="8" fill="#f0bf6c" />
              <text x="64" y="302" fill="#2c3a36" fontSize="11" fontFamily="monospace">repeated manual clean-up</text>
              <rect x="330" y="294" width="18" height="8" fill="#90d26f" />
              <text x="354" y="302" fill="#2c3a36" fontSize="11" fontFamily="monospace">recorded, tested transformation</text>
            </svg>
          </Diagram>
        }
      >
        <section id="short-answer">
          <h2>The short answer</h2>
          <p>If you clean the same Excel files the same way every month, that clean-up is a <strong>repeated transformation</strong> you have not written down yet. A transformation is any repeatable change from raw data to tidy data: renaming columns, trimming stray spaces, correcting data types, removing duplicates, reshaping a table. When the change is the same every month, a person should not have to redo it by hand.</p>
          <p>So automate the parts that are mechanical and identical each month. Fix the worst of the mess at its source, so it stops arriving at all. Keep human judgement and final presentation in Excel, where they belong. Do all three in that order.</p>
          <p>Do not try to automate everything at once. Start with the one step you repeat most and trust least. That is where recording the clean-up once saves the most time and removes the most risk.</p>
        </section>

        <section id="usual">
          <h2>What this usually looks like</h2>
          <p>It usually runs like a monthly ritual. Someone exports three or four files: a sales extract, a ledger, a CRM report. Each file is slightly different from the one before. A column header has moved. A new column has appeared. Dates have arrived as text rather than real dates. Amounts carry a stray currency symbol.</p>
          <p>The same fixes then get applied by hand. Delete the top two rows. Rename &ldquo;Cust Name&rdquo; to Customer. Split one column into two. Look up a product code and paste in its label. It takes the best part of a day, sometimes two. Nobody has written the steps down, so only one person can do them, and the report is late whenever that person is away.</p>
          <p>Underneath this is <strong>schema variation</strong>. The schema is the shape of a dataset: which columns it has, what they are called, and what type each one holds. Schema variation is that shape changing from file to file. It is the single most common reason a monthly export needs cleaning by hand, and the reason naive automation breaks the first time a column moves.</p>
        </section>

        <section id="try-first">
          <h2>Map the clean-up first</h2>
          <p>Before you automate anything, map what you already do. The goal is not a flowchart for its own sake. It is to separate the steps a machine should record from the steps a person must keep, and to find where the mess actually starts. You can do this in an afternoon with the same workbook you clean every month open in front of you.</p>
          <TryThisFirst title="Map the clean-up before you automate it">
            <ol>
              <li>List every file and source you open. Name each one and say where it comes from: which system, which export, which person.</li>
              <li>For each file, write every cleaning step you perform, in order. For each step, note what it does and why you do it.</li>
              <li>Mark each step as <strong>mechanical</strong> (identical every month, no decision needed) or <strong>judgement</strong> (you look at the data and decide something).</li>
              <li>Note where the mess starts for each step. Is it the export setting, the source system, or a person typing values in by hand?</li>
              <li>Mark which fixes really belong at source, in the system that produced the file, rather than in your spreadsheet.</li>
            </ol>
          </TryThisFirst>
          <p>When the map is done, one thing is usually clear. Most of the day is a small handful of mechanical steps, repeated across several files. Those steps are the first things to record, and the map tells you exactly which ones they are.</p>
        </section>

        <section id="what-it-tells-you">
          <h2>What the map tells you</h2>
          <p>Read the map in three passes, because each mark points somewhere different.</p>
          <ul>
            <li>The <strong>mechanical</strong> steps are your automation candidates. A step that is identical every month and needs no decision is a transformation you can record once and re-run for good.</li>
            <li>The <strong>judgement</strong> steps stay with a person. When you look at a figure and decide whether it is right, or choose which adjustment to apply, that is not clean-up. It is analysis, and it should stay visible rather than being buried in a script.</li>
            <li>The <strong>source</strong> notes point upstream. If several cleaning steps all trace back to one bad export, fixing that export removes all of them at once. That is the cheapest win on the whole map.</li>
          </ul>
          <p>The order of value follows from this. Fixing at source removes work entirely. Recording a mechanical step removes the repetition. Keeping judgement in Excel protects the part that actually needs a human. Automate in that order and you never automate something you should have fixed or should have kept.</p>
        </section>

        <section id="underneath">
          <h2>What is actually happening</h2>
          <p>Under the surface, a few plain ideas explain how a day of clean-up becomes a refresh you press once.</p>
          <p><strong>Power Query</strong> is the first tool most teams already own. It is a repeatable transformation recorded once and re-run on refresh. In Excel and in Power BI, you perform each clean-up step once in a visual editor. Power Query records the step as code in a language called M. Next month you point the same query at the new file and press refresh. Every step runs again, in the same order, in seconds. The manual afternoon becomes a button.</p>
          <p><strong>Moving logic to SQL or a model</strong> is the next step when one query is no longer enough. A model is a defined, reusable dataset that lives in a database or warehouse and is built with SQL. You move the clean-up there when more than one report needs the same cleaned data, or when the files are too large to handle comfortably in Excel. Then every report reads one governed copy of the truth, instead of each analyst cleaning a private copy in a slightly different way. This is the same discipline as <a href="/insights/automate-monthly-reporting">automating the monthly report safely</a>: move shared logic upstream, and leave the spreadsheet to do only what a spreadsheet should.</p>
          <p><strong>Fixing the problem at the source system</strong> is the cheapest clean-up of all, because it is the one you never have to do again. If dates arrive as text because an export option is wrong, change the export. If a product code has no readable label, add the label in the system that owns it. A fix at source removes the step from every downstream report at once, and it removes it permanently.</p>
          <p>Two failure modes deserve naming, because they are where automation quietly goes wrong.</p>
          <p><strong>Schema variation</strong> breaks brittle automation. If your steps assume a column sits in a fixed position, a moved column silently shifts every value beneath it and the totals still look plausible. The guard is simple: match columns by name, not by position, and make the refresh fail loudly when an expected column is missing rather than carry on with the wrong data.</p>
          <p><strong>Manual overrides</strong> are the other trap. A manual override is a value you type over the data by hand: a hard-coded number, a cell you quietly &ldquo;correct&rdquo; because it looked wrong. It fixes today and hides tomorrow. The underlying fault returns next month, the override may now be wrong, and nothing warns you, because a typed value carries no rule and raises no alarm. Prefer a rule you can see over a value you typed.</p>
          <p>The safeguard against both is a <strong>data-quality test</strong>, also called an assertion. An assertion is a rule that must be true, checked automatically on every refresh: an amount is never negative, every row has a customer, the total matches the ledger. If the rule fails, the refresh stops or raises an alert. An assertion turns a silent bad file into a visible, named failure that someone can act on. Assertions are the heart of <a href="/insights/is-our-data-reliable">testing that the data is reliable</a>, and they are what separates automation you can trust from automation that fails quietly.</p>
          <p>Here is one recorded transformation in Power Query (M) that replaces a morning of manual steps, with an assertion built in.</p>
          <pre>{`// Power Query (M): the monthly clean-up, recorded once and re-run on refresh
let
    // read the sheet from this month's workbook
    Source   = Excel.Workbook(File.Contents(SourcePath)){[Item="Sales", Kind="Sheet"]}[Data],
    Headers  = Table.PromoteHeaders(Source, [PromoteAllScalars=true]),

    // match columns by NAME, so a moved column does not shift the data
    Renamed  = Table.RenameColumns(Headers, {
        {"Cust Name", "customer_name"},
        {"Amt (GBP)", "amount_gbp"}
    }),
    Trimmed  = Table.TransformColumns(Renamed, {{"customer_name", Text.Trim, type text}}),
    Typed    = Table.TransformColumnTypes(Trimmed, {
        {"amount_gbp",   Currency.Type},
        {"invoice_date", type date}
    }),

    // assertion: a missing or negative amount must NOT pass silently
    BadRows  = Table.SelectRows(Typed, each [amount_gbp] = null or [amount_gbp] < 0),
    Checked  = if Table.RowCount(BadRows) = 0
               then Typed
               else error "amount_gbp: " & Text.From(Table.RowCount(BadRows)) & " invalid rows"
in
    Checked`}</pre>
          <p>Read it top to bottom. The first steps do what you used to do by hand: read the sheet, promote the header row, rename the inconsistent headers to stable names, trim stray spaces, and set proper types. Because the rename step matches on the old name, a column that moves position is still picked up correctly. The last two steps are the assertion. They collect any row where the amount is missing or negative, and if any exist the query raises an error instead of returning data. A malformed file now stops at the door with a clear message, rather than flowing into the board pack unnoticed.</p>
        </section>

        <section id="good">
          <h2>What good looks like</h2>
          <p>Good is not a spreadsheet with no manual work in it. It is a clear line between the mechanical work a machine does and the judgement a person keeps. In practice it looks like this.</p>
          <ul>
            <li>The clean-up is recorded once as a transformation, in Power Query or in SQL, not repeated by hand each month.</li>
            <li>Columns are matched by name, and the refresh fails loudly when a file does not match the shape it expects.</li>
            <li>The worst of the mess is fixed at source, so fewer cleaning steps are needed downstream at all.</li>
            <li>Assertions run on every refresh and stop a bad file before it reaches the report.</li>
            <li>A named person still reviews the final numbers, approves the commentary, and signs off before anything goes out.</li>
            <li>Anyone competent on the team can run the refresh, so the report is not hostage to one person and one laptop.</li>
          </ul>
          <p>This last point is worth holding onto. Excel keeps a real job even when the clean-up is automated. It is where the last mile happens: the board-pack layout, the choice of which chart tells the story, the ordering and formatting, the human sense-check. That is presentation and judgement, and it is exactly what a spreadsheet is good at.</p>
        </section>

        <section id="wrong">
          <h2>Common ways this goes wrong</h2>
          <ul>
            <li>Automating everything at once, including the judgement steps, so the output is a black box that nobody quite trusts.</li>
            <li>Matching columns by position instead of name, so one moved column silently shifts every value and the totals still look believable.</li>
            <li>Burying hard-coded overrides inside the transformation, which hides a recurring error rather than fixing it.</li>
            <li>Recording no assertions, so a malformed file flows straight through to the board pack with nothing to catch it.</li>
            <li>Saving the whole thing as one private macro on one laptop, which simply moves the single point of failure rather than removing it.</li>
            <li>Cleaning in the spreadsheet when the fault is really in the export, so the same fix is rebuilt from scratch every month.</li>
          </ul>
        </section>

        <section id="boundary">
          <h2>Source problem or spreadsheet problem</h2>
          <p>Recording the clean-up in Power Query is often the right stopping point, and for a single monthly report it may be all you ever need. It stops being enough when the same fault keeps arriving at source, when several reports need the same cleaned data, or when no spreadsheet fix can stop the problem recurring. At that point you are no longer cleaning a file. You are running a small data pipeline, and it needs to be owned and built like one.</p>
          <SystemBoundary
            intro="The clean-up has moved beyond the spreadsheet when it is really a source or pipeline problem in disguise."
            conditions={[
              "The same fault appears in every monthly export, and no spreadsheet step can stop it coming back.",
              "More than one report needs the same cleaned data, and each one is cleaning its own copy in a slightly different way.",
              "The files are too large or too many to clean reliably in Excel within the time the close allows.",
              "A malformed file has reached the board pack at least once, and nothing was in place to catch it.",
              "Only one person can run the clean-up, so the report is late whenever they are unavailable.",
            ]}
          />
        </section>

        <section id="decision">
          <h2>A decision guide</h2>
          <p>Once the map is done, most steps sort themselves into one of five homes. Use this as a quick lookup for where each kind of clean-up belongs.</p>
          <table className="article-table">
            <thead>
              <tr>
                <th>Clean-up type</th>
                <th>Example</th>
                <th>Where it belongs</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Wrong at origin</td>
                <td>Dates exported as text; product codes with no readable label</td>
                <td>Fix at source</td>
              </tr>
              <tr>
                <td>Repeated, mechanical reshaping</td>
                <td>Rename headers, trim spaces, set types, remove duplicates, unpivot</td>
                <td>Power Query</td>
              </tr>
              <tr>
                <td>Shared cleaned data</td>
                <td>One customers table that several reports all read</td>
                <td>SQL model</td>
              </tr>
              <tr>
                <td>Last-mile presentation</td>
                <td>Board-pack layout, chart choice, ordering, formatting</td>
                <td>Keep in Excel</td>
              </tr>
              <tr>
                <td>Judgement and sign-off</td>
                <td>Does this figure look right; approve the commentary before it goes out</td>
                <td>Human review</td>
              </tr>
            </tbody>
          </table>
          <p>The pattern behind the table is simple. Push each fix as far upstream as it will sensibly go. Fix it at source if you can, record it once if you cannot, and keep only judgement and presentation in the spreadsheet. Automate in that order and the monthly clean-up stops being a day you dread and becomes a refresh you trust.</p>
        </section>
      </ArticleLayout>
    </PageShell>
  );
}
