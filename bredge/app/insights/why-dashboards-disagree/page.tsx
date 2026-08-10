import type { Metadata } from "next";
import { PageShell } from "../../../components/site/PageShell";
import { pageMetadata } from "../../../lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Why Your Dashboards Disagree — and How to Fix It | The Bredge",
  description: "When finance and sales numbers disagree, the fix is upstream — in source-system identity, definitions and reconciliation, not in the BI tool.",
  path: "/insights/why-dashboards-disagree",
});

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Why your dashboards disagree — and why rebuilding the dashboard won't fix it",
  description: "When finance and sales numbers disagree, the fix is upstream — in source-system identity, definitions and reconciliation, not in the BI tool.",
  author: { "@type": "Organization", name: "The Bredge" },
  publisher: { "@type": "Organization", name: "The Bredge" },
  mainEntityOfPage: "https://thebredge.com/insights/why-dashboards-disagree",
  articleSection: "Data engineering",
};

export default function Article() {
  return (
    <PageShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <article className="article section-wrap">
        <p className="eyebrow">INSIGHTS · RELIABILITY</p>
        <h1>Why your dashboards disagree — and why rebuilding the dashboard won&rsquo;t fix it.</h1>
        <p className="article-lede">When two dashboards show different numbers for what looks like the same thing, the instinct is to rebuild the dashboard. That almost never works, because the disagreement rarely lives in the BI tool. It lives upstream — in different source systems, different definitions of the same word, and different rules for who counts as a customer. Fix the dashboard and you have moved the argument, not settled it.</p>
        <div className="article-body">
          <h2>Why your numbers disagree in the first place</h2>
          <p>Two teams rarely disagree because one of them is careless. They disagree because they are answering slightly different questions with the same word. Finance counts revenue when it can be recognised; sales counts it when the deal is signed. One system treats a refund as a negative order, another removes the original order entirely. A &ldquo;customer&rdquo; in the CRM is an account; in the billing system it is a paying entity; in the product database it is a login. Each definition is locally correct. The dashboard simply surfaces the collision.</p>
          <p>The BI layer is where you notice the problem, not where it is created. Power BI, Looker, Tableau and the rest are faithful renderers: they show you whatever the query returns. If two tiles disagree, at least one of the queries is asking a different question, joining on a different key, or reading from a source that was refreshed at a different time. Rebuilding the visual changes none of that.</p>

          <h2>How to diagnose a disagreement</h2>
          <p>Reconciliation is unglamorous, and it is the whole job. Before touching a chart, get both numbers into the same place and take the difference apart line by line.</p>
          <ul>
            <li><strong>Agree the exact question.</strong> &ldquo;Revenue&rdquo; is not a question. &ldquo;Recognised revenue, UK entity, calendar June, excluding intercompany&rdquo; is.</li>
            <li><strong>Trace each figure to its source.</strong> Which system, which table, which timestamp, which filters. If you cannot name the source, you cannot reconcile it.</li>
            <li><strong>Reconcile at the row level, not the total.</strong> Two totals that match can still be built from compensating errors. Match the underlying records.</li>
            <li><strong>Explain every difference.</strong> A reconciliation is finished when the gap is broken into named, understood components — timing, scope, deduplication, currency — not when it happens to be small.</li>
          </ul>
          <p>Most disagreements resolve into three buckets: timing (the systems refreshed at different points), grain (one number counts orders, the other counts order lines), and identity (the same real-world thing appears as two records, or two different things share an ID).</p>

          <h2>The technical picture</h2>
          <p>Identity is usually the deepest cause. Source systems mint their own keys, and the same organisation can be three account IDs in the CRM, two in billing and one in the warehouse. Until those are resolved to a single entity — through deterministic keys where they exist and careful matching where they do not — every downstream count is quietly wrong. Identity resolution is not a BI feature; it belongs in the modelling layer, upstream of anything a stakeholder sees.</p>
          <p>Grain is the next trap. A model that mixes order-level and line-level rows will double-count the moment someone sums it. Every table should have one clearly stated grain, and joins across grains should fan out deliberately, not by accident.</p>
          <p>Definitions need a home, and that home is a semantic layer — a single place where &ldquo;active customer&rdquo;, &ldquo;gross margin&rdquo; and &ldquo;churn&rdquo; are defined once and reused everywhere. Without it, each analyst re-implements the metric in their own query and the definitions drift apart within weeks. The semantic layer is what makes &ldquo;single source of truth&rdquo; more than a slogan: it is the difference between one definition and forty copies of it.</p>
          <p>Underneath all of this, incremental models and refresh schedules decide whether two dashboards even saw the same data. If one dataset refreshes hourly and another nightly, they will disagree every morning for entirely correct reasons.</p>

          <h2>What it costs the business</h2>
          <p>The direct cost is meetings — the recurring hour where two teams argue about whose figure is right instead of deciding what to do. The larger cost is trust. Once a leadership team has been burned by a number, they discount all of them, including the correct ones, and drift back to a private spreadsheet. That is the moment a data function starts losing its mandate: not when it is wrong, but when nobody can tell whether it is right.</p>

          <h2>What good looks like</h2>
          <ul>
            <li>One definition per metric, written down, owned by a person, and reused by every report.</li>
            <li>Every figure traceable from the dashboard back through the model to the source row.</li>
            <li>Reconciliation between critical systems — finance and the warehouse, especially — run as a routine check, not a fire drill.</li>
            <li>Disagreements treated as information — a signal that two definitions have diverged — rather than as embarrassments to paper over.</li>
          </ul>

          <h2>Common mistakes</h2>
          <ul>
            <li>Rebuilding the dashboard. It moves the argument; it does not end it.</li>
            <li>&ldquo;Correcting&rdquo; the number that looks wrong until the totals match, without understanding why.</li>
            <li>Defining metrics inside individual reports instead of in a shared layer.</li>
            <li>Joining across systems on names or email addresses instead of resolved identities.</li>
            <li>Comparing two numbers pulled at different times and assuming the logic differs.</li>
          </ul>

          <h2>A short way to decide</h2>
          <ul>
            <li>If the totals differ but the definitions are identical — suspect timing and grain first.</li>
            <li>If the definitions differ — this is a business decision about which definition is correct, not a technical bug.</li>
            <li>If the same entity appears twice — you have an identity problem, and it lives upstream.</li>
            <li>If you cannot trace a number to its source — stop and fix lineage before trusting either figure.</li>
          </ul>

          <h2>When The Bredge is relevant</h2>
          <p>If two systems have been disagreeing for long enough that people have stopped trusting the dashboard, the fix is usually reconciliation and modelling upstream, not another rebuild. That is the kind of work we do — quietly, with the finance and commercial teams in the room. And if it turns out your numbers already reconcile, we will say so.</p>

          <p>For deeper work, see our <a href="/services/data-projects">data reconciliation projects</a>, or start with <a href="/data-diagnostic">a Data Diagnostic</a> to find where your numbers diverge.</p>
        </div>
      </article>
    </PageShell>
  );
}
