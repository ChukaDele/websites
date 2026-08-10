import type { Metadata } from "next";
import { PageShell } from "../../../components/site/PageShell";
import { ArticleLayout, TryThisFirst, SystemBoundary, Diagram } from "../../../components/insights/Article";
import { pageMetadata } from "../../../lib/seo";

const SLUG = "what-to-fix-first";
const TOC = [
  { id: "short-answer", label: "The short answer" },
  { id: "usual", label: "What this usually looks like" },
  { id: "try-first", label: "Start with these checks" },
  { id: "what-it-tells-you", label: "What the inventory tells you" },
  { id: "underneath", label: "How to prioritise: impact x effort" },
  { id: "good", label: "What good looks like" },
  { id: "wrong", label: "Common ways this goes wrong" },
  { id: "boundary", label: "When to bring in help" },
  { id: "decision", label: "A decision guide" },
];

export const metadata: Metadata = pageMetadata({
  title: "Data Audit and Diagnostic — What to Fix First in a Messy Data Stack | The Bredge",
  description: "A practical data audit: inventory sources, definitions, identity, quality and ownership, then prioritise by impact and effort to decide what to fix first.",
  path: "/insights/what-to-fix-first",
});

export default function Page() {
  return (
    <PageShell>
      <ArticleLayout
        slug={SLUG}
        toc={TOC}
        heroDiagram={
          <Diagram
            title="From current state to findings to an impact x effort roadmap"
            caption="A diagnostic turns a vague sense that everything is broken into scored findings and a sequenced roadmap, starting with the fix that makes the next ones easier."
          >
            <svg viewBox="0 0 720 320" xmlns="http://www.w3.org/2000/svg" style={{ fontFamily: "var(--font-mono, ui-monospace, monospace)" }}>
              <defs>
                <marker id="wf-arrow" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto" markerUnits="strokeWidth">
                  <path d="M0,0 L6,3 L0,6 Z" fill="#2c3a36" />
                </marker>
              </defs>

              {/* 1 — Current state: a cloud of mixed, partly unresolved sources */}
              <text x="12" y="40" fontSize="11" fill="#2c3a36" letterSpacing="1">CURRENT STATE</text>
              <g fill="none" strokeWidth="1.5">
                <rect x="12" y="64" width="62" height="28" stroke="rgba(20,35,33,.35)" />
                <rect x="90" y="58" width="62" height="28" stroke="#f0bf6c" />
                <rect x="22" y="108" width="62" height="28" stroke="#f0bf6c" />
                <rect x="96" y="116" width="62" height="28" stroke="rgba(20,35,33,.35)" />
                <rect x="48" y="164" width="62" height="28" stroke="rgba(20,35,33,.35)" />
              </g>
              <g fontSize="9" fill="#2c3a36" textAnchor="middle">
                <text x="43" y="82">CRM</text>
                <text x="121" y="76">BILLING</text>
                <text x="53" y="126">SHEETS</text>
                <text x="127" y="134">PRODUCT</text>
                <text x="79" y="182">FINANCE</text>
              </g>

              <line x1="166" y1="120" x2="200" y2="120" stroke="#2c3a36" strokeWidth="1.5" markerEnd="url(#wf-arrow)" />

              {/* 2 — Findings: a shortlist, some unresolved */}
              <text x="210" y="40" fontSize="11" fill="#2c3a36" letterSpacing="1">FINDINGS</text>
              <g strokeWidth="1.5">
                <rect x="210" y="66" width="12" height="12" fill="none" stroke="rgba(20,35,33,.35)" />
                <rect x="210" y="100" width="12" height="12" fill="#f0bf6c" stroke="#f0bf6c" />
                <rect x="210" y="134" width="12" height="12" fill="none" stroke="rgba(20,35,33,.35)" />
                <rect x="210" y="168" width="12" height="12" fill="#f0bf6c" stroke="#f0bf6c" />
              </g>
              <g fontSize="10" fill="#2c3a36">
                <text x="230" y="76">definitions</text>
                <text x="230" y="110">identity</text>
                <text x="230" y="144">freshness</text>
                <text x="230" y="178">no owner</text>
              </g>

              <line x1="340" y1="120" x2="390" y2="120" stroke="#2c3a36" strokeWidth="1.5" markerEnd="url(#wf-arrow)" />

              {/* 3 — Impact x effort matrix: the quick-win quadrant is the first fix */}
              <text x="404" y="40" fontSize="11" fill="#2c3a36" letterSpacing="1">IMPACT &times; EFFORT</text>
              <rect x="404" y="64" width="150" height="150" fill="none" stroke="rgba(20,35,33,.35)" strokeWidth="1.5" />
              <rect x="404" y="64" width="75" height="75" fill="#90d26f" />
              <line x1="479" y1="64" x2="479" y2="214" stroke="rgba(20,35,33,.35)" strokeWidth="1" />
              <line x1="404" y1="139" x2="554" y2="139" stroke="rgba(20,35,33,.35)" strokeWidth="1" />
              <text x="441" y="105" fontSize="9" fill="#1e2b27" textAnchor="middle">quick win</text>
              <text x="394" y="139" fontSize="9" fill="#2c3a36" textAnchor="middle" transform="rotate(-90 394 139)">IMPACT</text>
              <text x="479" y="230" fontSize="9" fill="#2c3a36" textAnchor="middle">EFFORT</text>

              <line x1="560" y1="139" x2="592" y2="139" stroke="#2c3a36" strokeWidth="1.5" markerEnd="url(#wf-arrow)" />

              {/* 4 — Roadmap: foundational fixes first, surface fixes after */}
              <text x="598" y="40" fontSize="11" fill="#2c3a36" letterSpacing="1">ROADMAP</text>
              <rect x="598" y="64" width="116" height="34" fill="#90d26f" stroke="#90d26f" strokeWidth="1.5" />
              <rect x="598" y="120" width="116" height="34" fill="none" stroke="rgba(20,35,33,.35)" strokeWidth="1.5" />
              <rect x="598" y="176" width="116" height="34" fill="none" stroke="rgba(20,35,33,.35)" strokeWidth="1.5" />
              <line x1="656" y1="98" x2="656" y2="118" stroke="#2c3a36" strokeWidth="1.5" markerEnd="url(#wf-arrow)" />
              <line x1="656" y1="154" x2="656" y2="174" stroke="#2c3a36" strokeWidth="1.5" markerEnd="url(#wf-arrow)" />
              <g fontSize="10">
                <text x="610" y="85" fill="#1e2b27">1  definitions</text>
                <text x="610" y="141" fill="#2c3a36">2  identity</text>
                <text x="610" y="197" fill="#2c3a36">3  dashboards</text>
              </g>
            </svg>
          </Diagram>
        }
      >
        <section id="short-answer">
          <h2>The short answer</h2>
          <p>Do not try to fix everything at once. That is the most common mistake, and it is why messy data setups stay messy: the effort spreads thin across ten problems, and none of them ever finishes.</p>
          <p>A better approach has three steps. First, take an inventory: a plain, written list of what you have and where it hurts. Second, score each issue two ways: by impact (how much it blocks or distorts a real decision) and by effort (how much time, risk and dependency the fix carries). Third, start with the one change that makes the next three easier.</p>
          <p>That change is almost never a new tool. It is usually something structural and unglamorous: agreeing what your key numbers mean, or fixing how the same customer is recognised across systems. Get one of those right and several other problems shrink on their own. Buy a dashboard tool first and you have simply built a faster way to display numbers no one trusts.</p>
        </section>

        <section id="usual">
          <h2>What this usually looks like</h2>
          <p>The symptoms are familiar long before anyone calls them a data problem.</p>
          <p>Every team has its own numbers. Sales quotes one revenue figure, Finance another, and the board pack a third. Each is defensible; none agreed. Month-end involves a lot of manual work: someone exports files, pastes them into a spreadsheet, fixes the same errors by hand, and rebuilds the report they rebuilt last month. Ask where a number comes from and the honest answer is often &ldquo;from someone&rsquo;s file&rdquo;, not &ldquo;from the billing system&rdquo;.</p>
          <p>No one is sure what is authoritative: which source is the one to trust when two disagree. Reports get copied and edited until there are five versions and no original. The person who understands the master spreadsheet becomes a single point of failure; when they are away, reporting stops.</p>
          <p>None of this means anyone did a bad job. It is what happens when a company grows faster than its data setup. Tools were added one at a time, each to solve one problem, and no one stepped back to make them work together. The mess is an accumulation, not a single mistake. That is also why it will not clear itself up without a deliberate decision about sequence.</p>
        </section>

        <section id="try-first">
          <h2>Start with these checks</h2>
          <p>Before you change anything, write down what you actually have. This is a <strong>data audit</strong> (a structured review of your sources, definitions and processes), and you can do the first pass yourself in a day or two. Work through the list below and keep the answers in one document. The point is not to fix as you go; it is to see the whole picture before you decide.</p>
          <TryThisFirst title="Data Diagnostic checklist">
            <ol>
              <li><strong>Business questions.</strong> List the decisions the business must be able to make, and the questions behind them: &ldquo;which customers are about to leave?&rdquo;, &ldquo;what is our recognised revenue this quarter?&rdquo;. If a question ties to no decision, park it.</li>
              <li><strong>Source inventory.</strong> List every system that holds data that matters: CRM (the sales system), billing, the product database, the finance tool, and any load-bearing spreadsheets. Note what each one is genuinely the true source for.</li>
              <li><strong>Where reports come from.</strong> For each report leadership relies on, trace where its numbers actually originate. Name the system, the table or the file, not the person who sends it.</li>
              <li><strong>Manual work.</strong> Estimate the hours spent each month copying, cleaning and rebuilding by hand. This is where fragility and cost quietly hide.</li>
              <li><strong>Metric definitions.</strong> Check whether your key measures (&ldquo;active customer&rdquo;, &ldquo;gross margin&rdquo;, &ldquo;churn&rdquo;) have a single agreed definition, or whether each team quietly uses its own.</li>
              <li><strong>Entity identity.</strong> Check whether the same customer, product or account can be matched reliably across systems. Identity resolution (linking the records that describe the same real-world thing) is the hardest part and the one most often skipped.</li>
              <li><strong>Data quality.</strong> Note where data is missing, duplicated, out of date or plainly wrong, and how often it happens.</li>
              <li><strong>Lineage.</strong> For your most important numbers, can you trace them from the report back to the source row? Lineage (the documented path a number takes from source to screen) is what lets you trust a figure rather than hope it is right.</li>
              <li><strong>Refresh timing.</strong> Note how fresh each dataset needs to be, and how fresh it actually is. Daily is cheap and simple; near-real-time is a different and dearer system.</li>
              <li><strong>Ownership.</strong> For each source, definition and report, name the person responsible. &ldquo;No one&rdquo; is a finding in itself.</li>
              <li><strong>Skills and capacity.</strong> Be honest about the skills and time available in-house. A fix no one can build or maintain is not a fix.</li>
              <li><strong>Cost.</strong> Note what each tool and pipeline costs to run, and whether that cost matches the value it returns.</li>
              <li><strong>Security and access.</strong> Note any constraints: personal data, regulated data, who is allowed to see what. These shape what is permitted, not just what is possible.</li>
              <li><strong>Build / buy / keep.</strong> Against each area, write one word: <em>build</em> (make something new), <em>buy</em> (use a managed tool), or <em>keep</em> (leave it; it works). Most areas should end up &ldquo;keep&rdquo;. The audit exists to find the few that should not.</li>
            </ol>
          </TryThisFirst>
        </section>

        <section id="what-it-tells-you">
          <h2>What the inventory tells you</h2>
          <p>The inventory will be long. A shortlist is what you act on.</p>
          <p>Read back through your notes and pull out the distinct problems: the causes, not the symptoms. &ldquo;Sales and Finance disagree on revenue&rdquo; is a symptom; &ldquo;revenue has no agreed definition&rdquo; is a finding. &ldquo;The monthly report takes three days&rdquo; is a symptom; &ldquo;the report is rebuilt by hand from five separate exports&rdquo; is a finding. Aim for a single page: five to ten findings, each written as a plain statement of what is wrong.</p>
          <p>Group them as you go. Most findings fall into a few buckets: definitions (the same word means different things), identity (the same entity appears as several records), quality (data is wrong or missing), process (too much is done by hand), and ownership (no one is responsible). The shape of the buckets tells you something on its own. If half your findings are identity problems, that is your foundation, and no amount of dashboard work will paper over it.</p>
          <p>Some findings point at larger questions. A recurring &ldquo;we cannot join across systems&rdquo; is really a question about <a href="/insights/before-you-build-a-data-warehouse">whether you need a data warehouse</a>; a run of &ldquo;no one owns this&rdquo; is a question about <a href="/insights/when-to-hire-a-data-team">whether you need a data team</a>. Note those and move on. They are decisions for later. Do not let them stall the shortlist.</p>
        </section>

        <section id="underneath">
          <h2>How to prioritise: impact &times; effort</h2>
          <p>With a shortlist in hand, prioritisation becomes a scoring exercise rather than an argument.</p>
          <p>Score each finding two ways. <strong>Impact</strong> is how much the problem blocks or distorts a real decision. A wrong revenue definition that misleads the board scores high; a cosmetic label on an internal chart scores low. <strong>Effort</strong> is what the fix will cost you: time, technical risk, and dependencies on other work or other teams. A fix that needs three systems changed at once is high-effort even when each change is small.</p>
          <p>Plot the findings on an impact &times; effort grid: impact up the side, effort along the bottom. Four regions appear. High impact and low effort are <strong>quick wins</strong>; do them first. High impact and high effort are <strong>major projects</strong>: worth doing, but plan and sequence them. Low impact and low effort are <strong>fill-ins</strong>, to do when you have a spare hour. Low impact and high effort are <strong>thankless</strong>; leave them.</p>
          <p>Then adjust for sequence, because some fixes make later fixes cheaper. This is where foundational work earns its place. Agreeing definitions and resolving identity are often only medium-impact on their own, but they act as multipliers: once a metric is defined once, and once a customer is one entity everywhere, half of your quality and reconciliation findings become easy. Fixing the dashboard is a surface fix. It belongs after the definitions it displays are trustworthy, not before. Lineage and ownership are multipliers too: a fix with clear lineage is safe to make, and a fix with a named owner is the only kind that stays fixed.</p>
          <p>One cheap check often earns a place near the top of the list: how fresh is each source, really? You can answer it in a single query that reads the newest record each source holds:</p>
          <pre><code><span className="c">-- illustrative: how fresh is each source, really?</span>
<span className="k">SELECT</span> &#39;crm&#39;     <span className="k">AS</span> source, <span className="k">MAX</span>(updated_at) <span className="k">AS</span> last_updated <span className="k">FROM</span> crm.accounts
<span className="k">UNION ALL</span>
<span className="k">SELECT</span> &#39;billing&#39; <span className="k">AS</span> source, <span className="k">MAX</span>(updated_at)                 <span className="k">FROM</span> billing.invoices
<span className="k">UNION ALL</span>
<span className="k">SELECT</span> &#39;product&#39; <span className="k">AS</span> source, <span className="k">MAX</span>(event_time)                 <span className="k">FROM</span> product.events
<span className="k">ORDER BY</span> last_updated;   <span className="c">-- oldest source first</span></code></pre>
          <p>Read oldest-first, this lists each source next to the last time it changed. A table that should refresh nightly but last moved a week ago is a finding you can act on straight away &mdash; and a cheap one.</p>
        </section>

        <section id="good">
          <h2>What good looks like</h2>
          <p>You do not need a finished data platform to be in good shape. You need a clear head about what to do next. After a diagnostic, that comes down to four things.</p>
          <ul>
            <li><strong>A scored shortlist.</strong> Five to ten findings, each with an impact score, an effort score and a one-line note on why it matters. Anyone can read it and follow the reasoning.</li>
            <li><strong>An agreed sequence.</strong> The findings are ordered, and the order is deliberate: foundational fixes first, surface fixes after the foundations they depend on. Everyone has seen the sequence, so no one is quietly working on item seven.</li>
            <li><strong>A named owner for each item.</strong> Not a team &mdash; a person, accountable for the fix landing and staying landed.</li>
            <li><strong>A first fix that unlocks the rest.</strong> The top of the list is not the loudest complaint; it is the change that makes the next few cheaper. Often that is a single agreed definition, or one reliable customer identifier.</li>
          </ul>
          <p>When the first fix is done, the next problems should look smaller than they did &mdash; which is exactly the sign you sequenced it right.</p>
        </section>

        <section id="wrong">
          <h2>Common ways this goes wrong</h2>
          <p>The failure modes are predictable, and each one feels productive at the time.</p>
          <ul>
            <li><strong>Buying a tool first.</strong> A new dashboard, warehouse or catalogue does not decide what your numbers mean. Bought before the diagnostic, it becomes an expensive way to display the same distrusted figures.</li>
            <li><strong>Fixing the loudest complaint.</strong> The problem someone shouts about is rarely the root cause. Fix the symptom and it returns, because the cause upstream is untouched.</li>
            <li><strong>Trying to fix everything at once.</strong> Effort spreads across ten fronts, nothing finishes, and the team burns out with little to show. Sequence beats ambition.</li>
            <li><strong>Leaving no owner.</strong> A fix with no named owner drifts back to broken within weeks. &ldquo;The data team&rdquo; is not an owner; a person is.</li>
            <li><strong>Rebuilding dashboards on weak foundations.</strong> Polishing the reporting layer while the definitions and identity beneath it are still wrong only produces prettier disagreements.</li>
          </ul>
        </section>

        <section id="boundary">
          <h2>When to bring in help</h2>
          <p>Much of a diagnostic is work you can and should do yourself. You know your business better than any outsider. Running the inventory in-house is valuable even if you never bring anyone in, because it forces the questions into the open. But there is a point where the honest answer is that this has outgrown a spare-time effort. It is usually less about any single problem and more about scope, recurrence and ownership: the issues cross too many systems to hold in one head, the same faults keep returning, and no one has the time or the specific skills to fix them and keep them fixed.</p>
          <SystemBoundary
            conditions={[
              "The issues span many systems, and no single person can see the whole picture.",
              "The same word means different things to different teams, and no one can arbitrate.",
              "The same problems keep recurring after they were supposedly fixed.",
              "The fixes need to run on a schedule and be monitored, not done once and forgotten.",
              "No one owns the outcome, so improvements do not stick.",
              "Internal skills or time are the real constraint, not knowing what to do.",
            ]}
          />
        </section>

        <section id="decision">
          <h2>A decision guide</h2>
          <p>When you are unsure what to do with a finding, place it on the grid and read across the row.</p>
          <table className="article-table">
            <thead>
              <tr>
                <th>Quadrant</th>
                <th>Impact</th>
                <th>Effort</th>
                <th>Typical example</th>
                <th>What to do</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Quick wins</td>
                <td>High</td>
                <td>Low</td>
                <td>One agreed definition; a single reliable customer identifier</td>
                <td>Start here: this is your first fix</td>
              </tr>
              <tr>
                <td>Major projects</td>
                <td>High</td>
                <td>High</td>
                <td>A warehouse; a full identity-resolution system</td>
                <td>Plan and sequence; do after the quick wins</td>
              </tr>
              <tr>
                <td>Fill-ins</td>
                <td>Low</td>
                <td>Low</td>
                <td>A relabelled chart; a small tidy-up</td>
                <td>Do when you have spare capacity</td>
              </tr>
              <tr>
                <td>Thankless</td>
                <td>Low</td>
                <td>High</td>
                <td>Perfecting a report almost no one reads</td>
                <td>Leave it: the cost outweighs the value</td>
              </tr>
            </tbody>
          </table>
          <p>The order that falls out of this is nearly always the same: fix the foundations that others depend on, take the quick wins that build confidence, and only then decide whether the major projects (a warehouse, a permanent team) are genuinely warranted. Start with the change that makes the next three easier, and the messy setup stops feeling like one impossible problem and starts behaving like a short, ordered list.</p>
        </section>
      </ArticleLayout>
    </PageShell>
  );
}
