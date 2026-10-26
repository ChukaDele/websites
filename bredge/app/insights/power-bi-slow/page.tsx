import { PageShell } from "../../../components/site/PageShell";
import { ArticleLayout, TryThisFirst, SystemBoundary, Diagram, Example, Pull, PlainEnglish, ForTheBusiness, ForYourDataPerson } from "../../../components/insights/Article";
import { insightMetadata } from "../../../lib/insights";

const SLUG = "power-bi-slow";
const TOC = [
  { id: "why-slow", label: "Why the model, not the visuals" },
  { id: "usual", label: "What this usually looks like" },
  { id: "try-first", label: "Measure where the time goes" },
  { id: "what-it-tells-you", label: "Reading the results" },
  { id: "underneath", label: "Star schema, cardinality, DAX, storage" },
  { id: "expert", label: "Eight checks Power BI experts run" },
  { id: "example", label: "Worked example: SAP B1 sales model" },
  { id: "good", label: "What a fast model looks like" },
  { id: "wrong", label: "Common ways this goes wrong" },
  { id: "boundary", label: "When it is the model, not the report" },
  { id: "decision", label: "A performance decision guide" },
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
            title="A slow flat table re-modelled into a fast star schema"
            caption="A single wide table repeats everything on every row and compresses badly. Splitting it into a fact table with dimensions around it gives the engine the shape it wants."
          >
            <svg viewBox="0 0 720 300" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <marker id="pbs-ar" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="rgba(20,35,33,.55)" />
                </marker>
              </defs>

              {/* flat wide table: amber, slow */}
              <text x="40" y="56" fill="#2c3a36" fontSize="13" fontFamily="monospace">orders_wide</text>
              <rect x="40" y="66" width="196" height="128" fill="none" stroke="#f0bf6c" strokeWidth="1.5" />
              <line x1="79" y1="66" x2="79" y2="194" stroke="#f0bf6c" strokeWidth=".8" />
              <line x1="118" y1="66" x2="118" y2="194" stroke="#f0bf6c" strokeWidth=".8" />
              <line x1="157" y1="66" x2="157" y2="194" stroke="#f0bf6c" strokeWidth=".8" />
              <line x1="196" y1="66" x2="196" y2="194" stroke="#f0bf6c" strokeWidth=".8" />
              <text x="52" y="214" fill="#2c3a36" fontSize="11" fontFamily="monospace">~40 columns, all repeated</text>

              {/* transform arrow: neutral */}
              <text x="252" y="122" fill="#2c3a36" fontSize="11" fontFamily="monospace">re-model</text>
              <line x1="240" y1="132" x2="318" y2="150" stroke="rgba(20,35,33,.35)" strokeWidth="1.5" markerEnd="url(#pbs-ar)" />

              {/* star schema: green, fast */}
              {/* relationship lines */}
              <line x1="512" y1="126" x2="516" y2="82" stroke="#90d26f" strokeWidth="1.4" />
              <line x1="512" y1="174" x2="516" y2="208" stroke="#90d26f" strokeWidth="1.4" />
              <line x1="460" y1="150" x2="424" y2="144" stroke="#90d26f" strokeWidth="1.4" />
              <line x1="564" y1="150" x2="600" y2="144" stroke="#90d26f" strokeWidth="1.4" />

              {/* fact */}
              <rect x="460" y="126" width="104" height="48" fill="none" stroke="#90d26f" strokeWidth="1.5" />
              <text x="512" y="147" fill="#2c3a36" fontSize="13" fontFamily="monospace" textAnchor="middle">orders</text>
              <text x="512" y="163" fill="#2c3a36" fontSize="11" fontFamily="monospace" textAnchor="middle">fact · keys + numbers</text>

              {/* dimensions */}
              <rect x="470" y="44" width="94" height="38" fill="none" stroke="#90d26f" strokeWidth="1.5" />
              <text x="517" y="67" fill="#2c3a36" fontSize="11" fontFamily="monospace" textAnchor="middle">dim_date</text>

              <rect x="470" y="208" width="94" height="38" fill="none" stroke="#90d26f" strokeWidth="1.5" />
              <text x="517" y="231" fill="#2c3a36" fontSize="11" fontFamily="monospace" textAnchor="middle">dim_customer</text>

              <rect x="326" y="122" width="94" height="44" fill="none" stroke="#90d26f" strokeWidth="1.5" />
              <text x="373" y="148" fill="#2c3a36" fontSize="11" fontFamily="monospace" textAnchor="middle">dim_region</text>

              <rect x="604" y="122" width="94" height="44" fill="none" stroke="#90d26f" strokeWidth="1.5" />
              <text x="651" y="148" fill="#2c3a36" fontSize="11" fontFamily="monospace" textAnchor="middle">dim_product</text>

              {/* legend */}
              <rect x="40" y="276" width="18" height="8" fill="#f0bf6c" />
              <text x="66" y="284" fill="#2c3a36" fontSize="11" fontFamily="monospace">flat table · slow</text>
              <rect x="300" y="276" width="18" height="8" fill="#90d26f" />
              <text x="326" y="284" fill="#2c3a36" fontSize="11" fontFamily="monospace">star schema · fast</text>
            </svg>
          </Diagram>
        }
      >
        <section id="why-slow">
          <h2>Why is Power BI slow when the visuals look simple?</h2>
          <p>You open the report. You click a slicer. Then you wait. People quietly stop opening it, and someone starts asking whether Power BI was the wrong choice. It rarely was. Power BI is rarely slow because of the visuals. It is slow because of the data model underneath them. A visual is only a request. It asks the engine a question, and the engine has to answer that question every time you click. If the model is shaped badly, every one of those questions is expensive, and no amount of tidying the report page will make them cheap.</p>
          <PlainEnglish>
            <p>A slow Power BI report is usually caused by how the data underneath is organised, not by the charts on the page. Fixing that structure makes reports fast and keeps them fast as data grows, without buying more capacity.</p>
            <ul>
              <li><strong>Ask your team</strong>: which visual is slowest in Performance Analyzer, and which columns take the most memory?</li>
              <li><strong>Expect back</strong>: a rebuilt data model with fewer, narrower tables, not a redesigned report.</li>
            </ul>
          </PlainEnglish>
          <p>The engine that answers those questions is called VertiPaq. It is a columnar store, which means it keeps each column of data together rather than each row. That design is very fast when the model is shaped for it, and surprisingly slow when it is not. So the real question is not why Power BI is slow. It is what your model is asking the engine to do.</p>
          <Pull>A visual is only a request. If the model is shaped badly, every click asks an expensive question.</Pull>
          <p>The checks below are the ones a Power BI consultant would run first, and you can run them yourself. If the fix turns out to be the model, the refresh or the source, that is a well-scoped <a href="/services/data-projects">BI performance project</a>; you can see the kind of models we build on <a href="/work">our work page</a>.</p>
        </section>

        <section id="usual">
          <h2>Signs your Power BI data model is the problem</h2>
          <p>It usually shows up once the report has been live for a while. It felt quick in the demo. Now there is a year of data in it, three new pages, and a wall of slicers, and it drags.</p>
          <p>The pattern is familiar. One giant table holds everything: every order, with the customer name, the product description, the sales rep, the region and the full address repeated on every row. Slicers sit on high-detail fields such as email address or transaction reference. A single page carries fifteen or twenty visuals, several of them cross-filtering each other. The refresh takes a little longer each week, and one morning it fails.</p>
          <p>People reach for the visible things first. They swap chart types, cut the number of colours, or move visuals around the page. It helps a little, briefly. Then the report is slow again, because the cause was never on the page. It was in the table feeding it.</p>
        </section>

        <section id="try-first">
          <h2>How to find what is slowing your Power BI report</h2>
          <ForTheBusiness>Measuring first stops you paying for a redesign or a bigger licence that does not fix the cause.</ForTheBusiness>
          <p>You can find most of the cost yourself in an afternoon, without rebuilding anything. The goal is not to guess. It is to measure where the time actually goes, and to size the model honestly. Two free tools do almost all of the work. Performance Analyzer is built into Power BI Desktop and times every visual on a page. DAX Studio is a free companion tool that shows query timings and how much memory each column uses.</p>
          <TryThisFirst title="Before you touch a single visual">
            <ol>
              <li>Turn on Performance Analyzer, then interact with the slow page. Read which visuals take longest, and whether the time is in the DAX query or in the drawing of the visual.</li>
              <li>Note the split. If most of the time is DAX, the model or a measure is the cause. If most of it is rendering, you have too many visuals on the page.</li>
              <li>Open the model in DAX Studio and list the columns by size. The largest columns are almost always the highest-cardinality ones, and they are the first place compression is lost.</li>
              <li>Count the tables. Is this one wide table, or is it facts and dimensions? A single flat table is a warning sign on its own.</li>
              <li>Look at your slicers. Are any of them filtering on a unique or near-unique field, such as an ID, an email or a timestamp recorded to the second?</li>
              <li>Check the storage mode of each table. Is the model Import, DirectQuery, or a mixture, and which tables are which?</li>
              <li>Check the refresh. How long does a full refresh take, and does it reload all history every time?</li>
            </ol>
          </TryThisFirst>
          <p>Seven readings, and you will usually know the cause before you have touched a single visual.</p>
        </section>

        <section id="what-it-tells-you">
          <h2>What Performance Analyzer and DAX Studio tell you</h2>
          <p>Each reading points at a different cause, and each cause has a different fix. Read yours like this.</p>
          <ul>
            <li><strong>DAX-heavy visuals.</strong> The time is spent answering the question, not drawing it. Likely cause: a costly measure, a calculated column doing work at query time, or a model that forces the engine to scan too much.</li>
            <li><strong>Render-heavy pages.</strong> The engine answers quickly, but too many visuals fire at once. Likely cause: fifteen or more visuals on one page, each a separate query.</li>
            <li><strong>One very large column.</strong> A single column dominates the model size. Likely cause: high cardinality, meaning the column holds a very large number of distinct values, which the columnar engine cannot compress well.</li>
            <li><strong>One flat table.</strong> There are no dimensions, only a wide table with everything repeated. Likely cause: the source was loaded as it came, without modelling.</li>
            <li><strong>Slicers on unique fields.</strong> A slicer is built on a near-unique column. Likely cause: the field has thousands or millions of distinct values, so the slicer is expensive to build and to filter.</li>
            <li><strong>A slow or failing refresh.</strong> This is a separate problem from slow visuals, with its own causes: memory limits, query folding and gateways. See <a href="/insights/power-bi-refresh-failed">how to fix a failed Power BI refresh</a>.</li>
          </ul>
          <p>The most common finding by far is the flat table with one or two enormous columns. Fix that, and most of the other symptoms ease at the same time.</p>
        </section>

        <section id="underneath">
          <h2>Star schema, cardinality, DAX and storage mode explained</h2>
          <ForTheBusiness>These model choices decide how fast every report on the model will be, today and as data grows.</ForTheBusiness>
          <p>Underneath the report, a handful of technical ideas explain almost all of it.</p>
          <p><strong>Compression</strong> is where the speed comes from. Power BI stores imported data in VertiPaq, the columnar engine named earlier. Because it keeps each column together, it can compress a column hard when that column repeats itself. A country column with a dozen distinct values compresses to almost nothing: the engine stores each distinct value once and points to it. This is why the shape of your columns matters more than the number of rows.</p>
          <p><strong>Cardinality</strong> is the number of distinct values in a column. A column with few distinct values is low cardinality, and it compresses well. A column with almost as many distinct values as rows, such as an order ID, an email address, or a timestamp recorded to the second, is high cardinality, and it barely compresses at all. High-cardinality columns are usually the single largest thing in a slow model. The fix is often to remove what you do not need, or to reduce precision. Split a datetime into a date and a separate time if you do not need per-second detail. Drop the free-text field nobody filters on.</p>
          <p><strong>A star schema</strong> is the shape the engine wants. Instead of one wide table with everything repeated, you split the data into facts and dimensions. A fact table holds the events you measure, such as one row per order line, with keys and numbers only. Dimension tables hold the descriptive detail, such as one row per customer or per product, joined back to the facts by a key. The name comes from the shape: a central fact table with dimensions around it like the points of a star. This removes the repetition, shrinks the model, and gives the engine simple joins to follow.</p>
          <p><strong>Relationships</strong> connect those tables, and each relationship has a cardinality that describes how many rows on one side match rows on the other. The healthy default is one-to-many: one customer row to many order rows. Many-to-many relationships are slower and easier to get wrong, and a relationship built on a high-cardinality key costs more to resolve. Keep the keys you join on small and clean.</p>
          <p><strong>DAX</strong> is the formula language you write calculations in, and there are two places to put them. A calculated column is worked out row by row when the data refreshes, and then stored, taking space in the model, often at high cardinality. A measure is worked out at query time, only for the cells currently on screen, and stores nothing. As a rule, a value you aggregate, such as a total or a ratio, should be a measure rather than a calculated column.</p>
          <p>The costly version is a calculated column, added to the Sales table with New column. It is stored on every row:</p>
          <pre>{`Margin % = DIVIDE ( Sales[Profit], Sales[Sales] )`}</pre>
          <p>The better version is a measure, added with New measure. It is computed only for the cells on screen:</p>
          <pre>{`Margin % = DIVIDE ( SUM ( Sales[Profit] ), SUM ( Sales[Sales] ) )`}</pre>
          <p>The first version creates a stored value on every row, adds a high-cardinality column to the model, and gives the wrong answer once a visual averages it (the average of many ratios is not the ratio of the totals). The second computes nothing until you look at it, stores nothing, and returns the correct figure at whatever level the visual asks for. The same result on paper, at a very different cost.</p>
          <p><strong>Storage mode</strong> decides where the data lives when a visual asks a question. Import mode loads a copy of the data into VertiPaq, in memory, and is the fastest option for most reports. DirectQuery leaves the data in the source and sends a query to it on every interaction, so the report is only ever as fast as the source and the connection. It is the right choice when the data is too large to import or must be live to the second, and the wrong choice when it is picked out of habit. A composite model mixes the two, importing small dimensions while querying a large fact table live. If your report is slow and set to DirectQuery, ask first whether it truly needs to be.</p>
          <div className="in-table-wrap"><table>
            <thead><tr><th>Storage mode</th><th>Where data lives</th><th>Speed</th><th>Use when</th></tr></thead>
            <tbody>
              <tr><td>Import</td><td>Compressed copy in memory</td><td>Fastest for most reports</td><td>The default; data fits and hourly or daily freshness is enough</td></tr>
              <tr><td>DirectQuery</td><td>Stays in the source</td><td>As fast as the source, on every click</td><td>Data too large to import, or must be live</td></tr>
              <tr><td>Composite</td><td>Small tables imported, large ones live</td><td>In between</td><td>A huge fact table with small dimensions</td></tr>
            </tbody>
          </table></div>
          <p><strong>Incremental refresh</strong> reloads only recent data and leaves settled history in place. It is a refresh fix, not a visual-speed fix, and it only works when the source query folds; <a href="/insights/power-bi-refresh-failed">the refresh troubleshooting guide</a> covers both.</p>
          <p>Finally, some slowness is not inside Power BI at all. If the model reads from a database view that is itself slow, the report inherits that cost on every refresh, and under DirectQuery on every click. It is worth pushing heavy shaping upstream into the source or a warehouse, so Power BI receives data that is already modelled. Deciding whether that upstream layer should be <a href="/insights/power-bi-warehouse-or-both">Power BI, a warehouse, or both</a> is a separate question, and worth answering deliberately.</p>
        </section>

        <section id="expert">
          <h2>Eight Power BI model checks experts run first</h2>
          <ForTheBusiness>These checks find the model settings that slow every report built on it, and most cost nothing to fix.</ForTheBusiness>
          <p>Practitioners run the same short list on any slow model before they redesign anything:</p>
          <ul>
            <li><strong>Auto date/time</strong>: when this option is on, Power BI creates a hidden date table for every date column, and Microsoft notes each one <a href="https://learn.microsoft.com/en-us/power-bi/guidance/auto-date-time" target="_blank" rel="noopener noreferrer">increases the model size</a>. Turn it off and use one marked date table.</li>
            <li><strong>Bidirectional relationships</strong>: Microsoft&rsquo;s guidance is to <a href="https://learn.microsoft.com/en-us/power-bi/guidance/relationships-bidirectional-filtering" target="_blank" rel="noopener noreferrer">minimise them</a> because they can slow queries. Keep relationships single-direction and use <code>CROSSFILTER</code> inside the one measure that needs both directions.</li>
            <li><strong>Many-to-many relationships</strong>: replace them with a bridge table where you can. They cost more to resolve and are easy to get wrong.</li>
            <li><strong>Iterators over whole tables</strong>: <code>FILTER ( Sales, &hellip; )</code> inside <code>CALCULATE</code> scans every row and column of the table. Filter the column instead (example below).</li>
            <li><strong>Column sizes</strong>: run <a href="https://www.sqlbi.com/tools/vertipaq-analyzer/" target="_blank" rel="noopener noreferrer">VertiPaq Analyzer</a> (built into DAX Studio) to list tables and columns by memory. One or two columns usually dominate.</li>
            <li><strong>Model rules</strong>: run the <a href="https://docs.tabulareditor.com/en/features/Best-Practice-Analyzer.html" target="_blank" rel="noopener noreferrer">Best Practice Analyzer</a> in Tabular Editor. It flags bidirectional relationships, floating-point types, unused columns and more in one pass.</li>
            <li><strong>Aggregations</strong>: for very large DirectQuery fact tables, <a href="https://learn.microsoft.com/en-us/power-bi/transform-model/aggregations-advanced" target="_blank" rel="noopener noreferrer">user-defined aggregations</a> keep a summarised table in memory, so most visuals never query the detail.</li>
            <li><strong>Direct Lake on Fabric</strong>: if your data already sits in a Fabric lakehouse or warehouse, <a href="https://learn.microsoft.com/en-us/fabric/fundamentals/direct-lake-overview" target="_blank" rel="noopener noreferrer">Direct Lake</a> loads Delta tables into memory without an import refresh. Check its fallback rules: Direct Lake on SQL can fall back to DirectQuery, which is slower.</li>
          </ul>
          <ForYourDataPerson title="Filtering a column instead of a table in DAX">
            <p>Both measures return sales over 1,000. The first iterates the whole Sales table; the second filters one column, which the engine resolves far more cheaply:</p>
            <pre>{`Total Sales = SUM ( Sales[Amount] )`}</pre>
            <pre>{`High Value Sales (slow) =
CALCULATE ( [Total Sales], FILTER ( Sales, Sales[Amount] > 1000 ) )`}</pre>
            <pre>{`High Value Sales =
CALCULATE ( [Total Sales], KEEPFILTERS ( Sales[Amount] > 1000 ) )`}</pre>
            <p><code>KEEPFILTERS</code> keeps any filter a slicer already places on <code>Sales[Amount]</code>, which matches the behaviour of the first version. Without it, the column filter replaces the slicer&rsquo;s filter on that column.</p>
          </ForYourDataPerson>
        </section>

        <section id="example">
          <h2>Worked example: a slow sales report on SAP Business One</h2>
          <Example setting="UK wholesaler · SAP Business One, Power BI" title="One flat sales table, slow slicers">
            <p>A finance team imported invoice lines from SAP Business One into Power BI as one wide table: every line carries the customer name and address, item description, sales employee, branch and a document timestamp to the second. Clicking a branch slicer takes several seconds, and the nightly refresh reloads three years of history.</p>
            <p>DAX Studio lists the largest columns. In a model like this the top of the list usually looks something like:</p>
            <div className="in-table-wrap"><table>
              <thead><tr><th>Column</th><th>Distinct values</th><th>Why it is expensive</th><th>Fix</th></tr></thead>
              <tbody>
                <tr><td>DocTime (to the second)</td><td>Close to one per row</td><td>Barely compresses</td><td>Split into date and hour, or drop</td></tr>
                <tr><td>Customer address</td><td>Thousands</td><td>Free text repeated on every line</td><td>Move to a customer dimension</td></tr>
                <tr><td>Line comments</td><td>Mostly unique</td><td>Nobody filters on it</td><td>Remove</td></tr>
                <tr><td>Margin % (calculated column)</td><td>Many</td><td>Stored per row, wrong when averaged</td><td>Replace with a measure</td></tr>
              </tbody>
            </table></div>
            <p>The rebuild: a fact table of invoice lines with keys and amounts only; customer, item, branch and date dimensions; margin as a measure; incremental refresh on the last 60 days. The same approach applies to Sage or QuickBooks data, or to a SaaS team&rsquo;s Stripe and HubSpot model.</p>
          </Example>
        </section>

        <section id="good">
          <h2>What a fast Power BI model looks like</h2>
          <p>Good does not mean the report has fewer features. It means the model is shaped so the engine barely has to work.</p>
          <ul>
            <li>A star schema, not a flat table. Facts hold the numbers, dimensions hold the descriptions, and nothing important is repeated on every row.</li>
            <li>Low-cardinality columns wherever possible. Unused columns removed, precision reduced where the detail is not needed, and no free text loaded just because it happened to be in the source.</li>
            <li>Aggregations written as measures, not stored as calculated columns, so nothing is computed until a visual asks for it.</li>
            <li>Import mode by default, with DirectQuery used only where it earns its place, and incremental refresh switched on for the large fact tables.</li>
            <li>Pages that ask fewer questions. A handful of focused visuals rather than twenty, and slicers built on small, tidy fields.</li>
          </ul>
          <p>When the model is right, the report feels instant, and it stays fast as the data grows. Speed stops being something you chase and becomes a property of the design. One caveat is worth stating plainly. Fast and correct are different goals, and a quick report built on figures nobody trusts is not a win. It is worth confirming <a href="/insights/is-our-data-reliable">whether the underlying data is reliable</a> alongside making it fast.</p>
        </section>

        <section id="wrong">
          <h2>Common Power BI performance mistakes</h2>
          <ul>
            <li>Optimising the visuals first. Changing chart types and colours treats a symptom. The cost is almost always in the model, not on the page.</li>
            <li>Loading the source table as it comes. Importing one wide table with everything repeated is the most common cause of a slow model, and the easiest to avoid.</li>
            <li>Keeping columns you never use. Every column costs memory, and the high-cardinality ones cost the most. If nothing filters or displays it, drop it.</li>
            <li>Using calculated columns for things that should be measures. It inflates the model and can give the wrong answer when aggregated.</li>
            <li>Reaching for DirectQuery by default. It is the right tool for specific cases, and a common cause of slowness when chosen by habit.</li>
            <li>Piling visuals onto one page. Each visual is a separate query, so twenty visuals is twenty questions on every click.</li>
            <li>Never setting up incremental refresh. Reloading all history on every run makes the refresh slow and fragile as the data grows.</li>
          </ul>
        </section>

        <section id="boundary">
          <h2>When it is the model, not the report</h2>
          <p>The afternoon of measuring and tidying is worth doing, and often it is enough. It stops being enough when the problem is structural rather than cosmetic. At that point you are no longer speeding up a report. You are re-modelling the data underneath it, and possibly moving work upstream, and that is a build.</p>
          <SystemBoundary
            conditions={[
              "The report is one flat table that has to be re-modelled into facts and dimensions, and other reports already depend on it.",
              "Heavy shaping needs to move upstream into a database or warehouse, so Power BI receives data that is already modelled.",
              "A full refresh takes hours or fails, and the fix is incremental refresh plus a redesigned fact table, not a single setting.",
              "DirectQuery is genuinely required because the data is too large to import, so source performance now has to be engineered.",
              "Several reports repeat the same measures and definitions, and they need to be defined once and shared rather than rewritten per report.",
            ]}
          />
        </section>

        <section id="decision">
          <h2>How to fix a slow Power BI report: a decision guide</h2>
          <p>Once you know where the time goes, the first move is usually clear. Use this as a quick lookup.</p>
          <table className="article-table">
            <thead>
              <tr>
                <th>Symptom</th>
                <th>Likely cause</th>
                <th>First move</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Slow on every click</td>
                <td>DAX-heavy visuals or a costly model</td>
                <td>Time the visuals in Performance Analyzer, then fix the model or the measure</td>
              </tr>
              <tr>
                <td>The model file is huge</td>
                <td>High-cardinality columns</td>
                <td>List columns by size in DAX Studio; drop or reduce the largest</td>
              </tr>
              <tr>
                <td>One wide table</td>
                <td>No star schema</td>
                <td>Split it into a fact table with dimensions</td>
              </tr>
              <tr>
                <td>Slicers feel heavy</td>
                <td>Slicers on unique fields</td>
                <td>Move slicers to low-cardinality fields</td>
              </tr>
              <tr>
                <td>The whole page lags</td>
                <td>Too many visuals</td>
                <td>Reduce visuals per page; split into focused pages</td>
              </tr>
              <tr>
                <td>Refresh slow or failing</td>
                <td>No incremental refresh</td>
                <td>Turn on incremental refresh for the large fact tables</td>
              </tr>
              <tr>
                <td>Only slow when live</td>
                <td>DirectQuery on a slow source</td>
                <td>Import if you can, otherwise optimise the source</td>
              </tr>
            </tbody>
          </table>
          <p>If most of your gap is the model rather than the page, that is good news. A model problem has a known set of fixes, and it stays fixed once the shape is right.</p>
          <p>If refresh, not rendering, is the bottleneck, the <a href="/resources/data-freshness-sla-calculator">data freshness SLA calculator</a> shows how refresh schedules chain together, and <a href="/insights/incremental-models-at-scale">how to reduce warehouse costs on large tables</a> covers the upstream incremental models. If the model rebuild needs outside help, that is a scoped <a href="/services/data-projects">BI performance project</a>.</p>
          <p>If the issue is licences or capacity rather than the model, see <a href="/insights/power-bi-licensing-small-business">Power BI licensing</a> and <a href="/insights/fabric-capacity-throttling">Fabric capacity throttling</a>.</p>
        </section>
      </ArticleLayout>
    </PageShell>
  );
}
