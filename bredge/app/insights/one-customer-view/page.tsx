import type { Metadata } from "next";
import { PageShell } from "../../../components/site/PageShell";
import { ArticleLayout, TryThisFirst, SystemBoundary, Diagram } from "../../../components/insights/Article";
import { pageMetadata } from "../../../lib/seo";

const SLUG = "one-customer-view";
const TOC = [
  { id: "short-answer", label: "The short answer" },
  { id: "usual", label: "What this usually looks like" },
  { id: "try-first", label: "You can test this yourself" },
  { id: "what-it-tells-you", label: "What the result tells you" },
  { id: "underneath", label: "What is happening underneath" },
  { id: "good", label: "What good looks like" },
  { id: "wrong", label: "Common ways this goes wrong" },
  { id: "boundary", label: "When this becomes a system" },
  { id: "decision", label: "A decision guide" },
];

export const metadata: Metadata = pageMetadata({
  title: "How to Build One Customer View Across CRM, Billing and Product Data | The Bredge",
  description: "Build a single customer view across CRM, billing and product data with identity resolution, canonical customer IDs, source precedence and exception handling.",
  path: "/insights/one-customer-view",
});

export default function Page() {
  return (
    <PageShell>
      <ArticleLayout
        slug={SLUG}
        toc={TOC}
        heroDiagram={
          <Diagram
            title="Five source identities resolved to one canonical customer, with an exception queue"
            caption="A single customer view is identity resolution first: five source IDs map to one canonical customer, and unresolved matches go to an exception queue rather than being forced."
          >
            <svg viewBox="0 0 720 320" xmlns="http://www.w3.org/2000/svg" role="img">
              <defs>
                <marker id="ocv-arw" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                  <path d="M0 0 L10 5 L0 10 z" fill="rgba(20,35,33,.45)" />
                </marker>
              </defs>

              {/* fan-in: five source keys into the identity map */}
              <line x1="176" y1="39" x2="300" y2="126" stroke="rgba(20,35,33,.35)" strokeWidth="1.4" markerEnd="url(#ocv-arw)" />
              <line x1="176" y1="91" x2="300" y2="141" stroke="rgba(20,35,33,.35)" strokeWidth="1.4" markerEnd="url(#ocv-arw)" />
              <line x1="176" y1="143" x2="300" y2="155" stroke="rgba(20,35,33,.35)" strokeWidth="1.4" markerEnd="url(#ocv-arw)" />
              <line x1="176" y1="195" x2="300" y2="169" stroke="rgba(20,35,33,.35)" strokeWidth="1.4" markerEnd="url(#ocv-arw)" />
              <line x1="176" y1="247" x2="300" y2="184" stroke="rgba(20,35,33,.35)" strokeWidth="1.4" markerEnd="url(#ocv-arw)" />

              {/* fan-out: canonical customer (green) and exception queue (amber) */}
              <line x1="416" y1="138" x2="544" y2="125" stroke="#90d26f" strokeWidth="1.8" markerEnd="url(#ocv-arw)" />
              <line x1="416" y1="176" x2="544" y2="219" stroke="#f0bf6c" strokeWidth="1.8" markerEnd="url(#ocv-arw)" />

              {/* source boxes */}
              <g>
                <rect x="24" y="18" width="152" height="42" rx="5" fill="#ffffff" stroke="rgba(20,35,33,.35)" />
                <text x="38" y="44" fill="#2c3a36" fontSize="12" fontFamily="monospace" fontWeight="700">CRM</text>
                <text x="162" y="44" fill="#2c3a36" fontSize="12" fontFamily="monospace" textAnchor="end">acct_10482</text>

                <rect x="24" y="70" width="152" height="42" rx="5" fill="#ffffff" stroke="rgba(20,35,33,.35)" />
                <text x="38" y="96" fill="#2c3a36" fontSize="12" fontFamily="monospace" fontWeight="700">Billing</text>
                <text x="162" y="96" fill="#2c3a36" fontSize="12" fontFamily="monospace" textAnchor="end">cust-8830</text>

                <rect x="24" y="122" width="152" height="42" rx="5" fill="#ffffff" stroke="rgba(20,35,33,.35)" />
                <text x="38" y="148" fill="#2c3a36" fontSize="12" fontFamily="monospace" fontWeight="700">Product</text>
                <text x="162" y="148" fill="#2c3a36" fontSize="12" fontFamily="monospace" textAnchor="end">user_5521</text>

                <rect x="24" y="174" width="152" height="42" rx="5" fill="#ffffff" stroke="rgba(20,35,33,.35)" />
                <text x="38" y="200" fill="#2c3a36" fontSize="12" fontFamily="monospace" fontWeight="700">Finance</text>
                <text x="162" y="200" fill="#2c3a36" fontSize="12" fontFamily="monospace" textAnchor="end">DEB00291</text>

                <rect x="24" y="226" width="152" height="42" rx="5" fill="#ffffff" stroke="rgba(20,35,33,.35)" />
                <text x="38" y="252" fill="#2c3a36" fontSize="12" fontFamily="monospace" fontWeight="700">Support</text>
                <text x="162" y="252" fill="#2c3a36" fontSize="12" fontFamily="monospace" textAnchor="end">org-4471</text>
              </g>

              {/* identity map node */}
              <rect x="300" y="112" width="116" height="86" rx="7" fill="#ffffff" stroke="rgba(20,35,33,.55)" strokeWidth="1.4" />
              <text x="358" y="150" fill="#2c3a36" fontSize="12" fontFamily="monospace" fontWeight="700" textAnchor="middle">identity map</text>
              <text x="358" y="168" fill="#2c3a36" fontSize="11" fontFamily="monospace" textAnchor="middle">match +</text>
              <text x="358" y="182" fill="#2c3a36" fontSize="11" fontFamily="monospace" textAnchor="middle">precedence</text>

              {/* canonical customer (green) */}
              <rect x="544" y="98" width="152" height="54" rx="6" fill="#90d26f" stroke="rgba(20,35,33,.35)" />
              <text x="560" y="122" fill="#2c3a36" fontSize="13" fontFamily="monospace" fontWeight="700">Customer</text>
              <text x="560" y="140" fill="#2c3a36" fontSize="11" fontFamily="monospace">canonical_id 001</text>

              {/* exception queue (amber) */}
              <rect x="544" y="196" width="152" height="48" rx="6" fill="#f0bf6c" stroke="rgba(20,35,33,.35)" />
              <text x="560" y="217" fill="#2c3a36" fontSize="12" fontFamily="monospace" fontWeight="700">exception queue</text>
              <text x="560" y="233" fill="#2c3a36" fontSize="11" fontFamily="monospace">unresolved</text>
            </svg>
          </Diagram>
        }
      >
        <section id="short-answer">
          <h2>The short answer</h2>
          <p>A single customer view is one reliable record of each customer, assembled from every system that holds part of the picture. Most teams treat it as a reporting task. Build a customer 360 dashboard, the thinking goes, and the problem is solved. It is not. A single customer view is an identity problem first, and a reporting problem last.</p>
          <p>Each system mints its own customer identifier. Your CRM (the sales system) knows a customer one way. Your billing platform knows the same customer another way. Your product database, your finance ledger and your support desk each hold a third, fourth and fifth identifier. None of them agree, because none of them were built to.</p>
          <p>Before any dashboard can be trusted, you have to decide which records across these systems describe the same real customer. Then you map them to one <strong>canonical customer ID</strong>: the single identifier that everything else points to. This work is called <strong>identity resolution</strong>. Do it well and the dashboard is straightforward. Skip it and the dashboard is confidently wrong. A 360 view rendered on top of unresolved identities does not fix the identities; it hides them behind a clean chart.</p>
        </section>

        <section id="usual">
          <h2>What this usually looks like</h2>
          <p>On paper you have five systems. In practice you have five different customers who happen to be the same company.</p>
          <p>Suppose a company, Northwind Ltd, buys from you. Sales created the account as &ldquo;Northwind Limited&rdquo;. Billing set it up as &ldquo;Northwind Ltd&rdquo; under a different registered address. The product system knows them only by the email domain of the first user who signed up. Finance carries them under a debtor code inherited from the old accounting system. Support has two tickets filed under two slightly different names. Every one of these is locally correct. Together they are a mess.</p>
          <p>When someone asks a reasonable question — how much is Northwind worth, are they growing, are they at risk of leaving — the answer depends on which system you start from. So you try to join the systems together. The obvious keys are email address and company name, so those are what people reach for. The result is worse, not better.</p>
          <p>Names are not unique, and they change. Two real companies can share a name. One company can be written five ways. Email addresses belong to people, not companies, and people move on. Joining on either key produces two failures at once. It merges customers who are not the same, and it splits customers who are. This is the same root cause behind <a href="/insights/why-dashboards-disagree">why finance and sales numbers disagree</a>: identity, grain and definitions, not the chart itself.</p>
        </section>

        <section id="try-first">
          <TryThisFirst title="You can test this yourself">
            <p>You do not need a warehouse to find out how bad the identity problem is. You need a spreadsheet and an hour. Work through this Customer Identity Mapping Worksheet in order.</p>
            <ol>
              <li>List each source system in a row: CRM, billing, product, finance, support. Beside each, write the name of its customer key, the field it uses to identify a customer.</li>
              <li>Pick one system as the <strong>source of record for identity</strong>: the system you trust most to say a customer exists. This is your starting point, not the winner for every attribute.</li>
              <li>Define your <strong>deterministic match rules</strong>: exact, rule-based matches on a shared key. For example: &ldquo;billing customer matches CRM account when the company registration numbers are identical.&rdquo; Write the rules down. If two systems share no reliable key, record that; it is a finding.</li>
              <li>Take a sample of customers from your source of record — a hundred is enough. For each one, apply your rules and try to find the matching record in every other system.</li>
              <li>Count how many match cleanly on a shared key in every system. These are your resolved customers.</li>
              <li>Put every customer that did not match cleanly into an exception list: no match, an ambiguous match, or more than one candidate match.</li>
              <li>Divide the exception count by the sample size. That is your <strong>exception rate</strong>. Write it at the top of the sheet.</li>
            </ol>
          </TryThisFirst>
        </section>

        <section id="what-it-tells-you">
          <h2>What the result tells you</h2>
          <p>The exception rate is the headline number. It is the share of customers that did not resolve cleanly to a single identity across your systems.</p>
          <p>A low rate means your systems already share enough reliable identifiers. Most records line up on a shared key, and only a handful need a human to look at them. In that case a single customer view is mostly a modelling exercise, and it is well worth doing.</p>
          <p>A high rate means the problem is upstream, in the systems themselves. They were never designed to reference each other. No amount of dashboard work will close that gap, because the gap is in the data, not the display.</p>
          <p>Match quality matters as much as the count. A clean match on a shared, stable key (a company registration number, or an account ID that one system passes to another) is trustworthy. A match on a name, or on a similarity score, is a guess with a probability attached. Two teams can report a 90% match rate and still be standing on almost entirely guesses. So count the matches, but grade them too. A worksheet that separates &ldquo;matched on a shared key&rdquo; from &ldquo;matched on a name&rdquo; tells you far more than a single percentage.</p>
        </section>

        <section id="underneath">
          <h2>What is happening underneath</h2>
          <p>The worksheet is a manual version of what a real system does continuously. Here are the parts, in plain English first and then precisely.</p>
          <p><strong>Deterministic matching</strong> is exact, rule-based matching on a shared key. If the CRM account and the billing customer carry the same company registration number, they are the same customer. There is no judgement involved. Deterministic matching is fast, explainable and safe. Its only limit is that it needs a shared key to exist.</p>
          <p><strong>Probabilistic matching</strong>, also called fuzzy matching, is what you use when no shared key exists. It scores how similar two records are (on name, address, domain and other fields) and treats a high enough score as a match. It is useful, and it is dangerous. A high score is a probability, not a fact. The characteristic failure is the <strong>false merge</strong>: two genuinely different customers scored as one, silently collapsed into a single record. A false merge is hard to spot and expensive to unpick, because once two customers share a canonical ID, every downstream figure blends them. Probabilistic matching should raise candidates for review, not decide silently.</p>
          <p>The <strong>canonical customer ID</strong> is the one identifier that every source record maps to. It does not belong to any source system. It is issued and owned by the model that resolves identity, so that no single operational tool can redefine who a customer is.</p>
          <p><strong>Source precedence</strong> is the rule for which system wins for which attribute. It is decided attribute by attribute, not once for the whole record. Finance may be the authority for legal entity name and billing address. The CRM may be the authority for account owner and industry. The product system may be the authority for last active date. Precedence is a business decision written down as configuration, not a default left to whichever system loaded last.</p>
          <p><strong>Duplicate handling</strong> is what you do when one system holds two records for the same customer. You keep both source records (you never delete operational data) and you point both at the same canonical ID, marking one as the survivor for display.</p>
          <p>The <strong>exception queue</strong> is a monitored list of records that did not resolve: no match, an ambiguous match, or a probabilistic match below your confidence threshold. It is not a dumping ground. It is a work list that a named person triages on a schedule, and its size is a health metric in its own right.</p>
          <p><strong>History and grain</strong> decide what a row means over time. Grain is the level of detail one row represents: one row per customer, or one row per customer per day. If you need to answer &ldquo;who was this customer merged with last quarter&rdquo;, the identity map needs history, so that a resolution decision can be reconstructed for a past date rather than only shown as it stands today.</p>
          <p><strong>Quality checks</strong> run on every refresh: no canonical ID with conflicting legal names, no source key mapped to two canonical IDs, an exception rate within an agreed band. <strong>Lineage</strong> is the recorded path from a resolved customer back to the exact source rows that formed it, so any figure can be traced and defended. <strong>Ongoing ownership</strong> is the person accountable for the rules, the thresholds and the queue after launch, because identity resolution is a system to run, not a project to finish.</p>
          <p>In practice, the core of the model is a single mapping table: one row per source key, each pointing at a canonical customer ID with a recorded method and confidence. The query below keeps one best row per source key, then routes the rest to review.</p>
          <pre>{`-- 1. Pick one row per source key, keeping the highest-confidence match.
WITH ranked AS (
  SELECT
    source_system,
    source_customer_id,
    canonical_customer_id,
    match_method,       -- 'deterministic' or 'probabilistic'
    match_confidence,   -- 0.00 to 1.00
    ROW_NUMBER() OVER (
      PARTITION BY source_system, source_customer_id
      ORDER BY match_confidence DESC
    ) AS rn
  FROM staging.customer_match_candidates
)
SELECT
  source_system,
  source_customer_id,
  canonical_customer_id,
  match_method,
  match_confidence
FROM ranked
WHERE rn = 1
  AND match_confidence >= 0.90;   -- the resolved identity map

-- 2. Everything that did not clear the bar goes to an exception queue.
SELECT
  source_system,
  source_customer_id,
  match_method,
  match_confidence,
  'review' AS status
FROM ranked
WHERE rn = 1
  AND (canonical_customer_id IS NULL OR match_confidence < 0.90);`}</pre>
          <p>The first query does one job. A source key (say a CRM account) can throw up several candidate matches: one deterministic, one or two fuzzy. <code>ROW_NUMBER() OVER (PARTITION BY source_system, source_customer_id ORDER BY match_confidence DESC)</code> numbers those candidates per source key, best confidence first. Keeping only <code>rn = 1</code> leaves exactly one row per source key. The confidence threshold then admits only matches you actually trust. The result is a clean identity map: every source key that cleared the bar, mapped to one canonical customer.</p>
          <p>The second query is the honest half. It takes the same best-per-key rows and selects the ones that did not clear the bar (no canonical ID at all, or a confidence below the threshold) and marks them for review. This is the exception queue. It is a deliberate, visible destination for uncertainty. The threshold of 0.90 is illustrative; you set it against your own tolerance for a false merge, and you monitor how many records fall each side of it.</p>
        </section>

        <section id="good">
          <h2>What good looks like</h2>
          <ul>
            <li>Every source record maps to one canonical customer ID, and that ID is owned by the identity model, not by any operational system.</li>
            <li>Source precedence is written down, attribute by attribute, so anyone can say why a given name or address won.</li>
            <li>Deterministic rules do the confident work. Probabilistic matches raise candidates for review rather than merging on their own.</li>
            <li>Exceptions go to a queue that a named person triages on a schedule, and the queue size is tracked as a health metric.</li>
            <li>Quality checks run on every refresh, lineage lets any figure be traced back to its source rows, and the customer view is only ever built on top of resolved identities.</li>
          </ul>
        </section>

        <section id="wrong">
          <h2>Common ways this goes wrong</h2>
          <ul>
            <li>Merging on email address or company name. Both are unstable and non-unique, and they split and merge customers at the same time.</li>
            <li>Forcing a 100% match. Real data never resolves completely. Chasing the last few per cent produces false merges that are worse than the honest gap they replace.</li>
            <li>Treating a customer 360 dashboard as the solution. The dashboard is the last mile. It renders whatever identities you feed it, right or wrong.</li>
            <li>Having no exception process. Unmatched records either vanish from the numbers or get forced into a wrong match. Both are silent, and both erode trust.</li>
            <li>Having no owner. Rules, thresholds and the queue drift the moment nobody is accountable for them, and the view quietly rots.</li>
          </ul>
        </section>

        <section id="boundary">
          <h2>When this becomes a system</h2>
          <p>A one-off worksheet is the right first step, and for a small company with two systems and a low exception rate it may be enough for a while. It stops being enough when the same identities have to be resolved again and again, correctly, without a person redoing the matching each time. At that point the manual sheet becomes a liability, because every refresh reopens the same questions. This is the shape of our <a href="/services/data-projects">data reconciliation and identity projects</a>: a maintained identity map, documented precedence, and a monitored exception queue, rather than a spreadsheet rebuilt each month.</p>
          <SystemBoundary
            conditions={[
              "The same customer identity has to be resolved consistently across several systems, not reconciled once.",
              "The definition of a customer differs by function: an account in sales, a paying entity in billing, a login in product.",
              "Matching has to run reliably on every refresh, without a person redoing it by hand.",
              "Unresolved records need a monitored queue and a triage routine, not a silent gap in the numbers.",
              "Ownership of the rules, thresholds and canonical IDs is unclear or shared by everyone, which means no one.",
            ]}
          />
        </section>

        <section id="decision">
          <h2>A decision guide</h2>
          <p>Match the approach to the keys you actually have. Most working systems use more than one, in order: deterministic first, probabilistic only for what is left, and human review for the residue.</p>
          <table className="article-table">
            <thead>
              <tr>
                <th>Matching approach</th>
                <th>When to use</th>
                <th>Risk</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Deterministic (exact key)</td>
                <td>A shared, stable key exists across systems: a registration number, or an ID one system passes to another.</td>
                <td>Low. Misses customers who have no shared key, so it under-matches rather than mis-matching.</td>
              </tr>
              <tr>
                <td>Probabilistic (fuzzy)</td>
                <td>No shared key exists and you must match on similarity of name, address or domain.</td>
                <td>High. False merges collapse two real customers into one, silently, and are expensive to unpick.</td>
              </tr>
              <tr>
                <td>Hybrid (deterministic, then probabilistic)</td>
                <td>Most real cases. Resolve confidently on keys first, then score only the records that are left over.</td>
                <td>Medium. Manageable if fuzzy matches raise candidates for review rather than merging on their own.</td>
              </tr>
              <tr>
                <td>Manual review (exception queue)</td>
                <td>Ambiguous or low-confidence matches, and any case a rule cannot settle safely.</td>
                <td>Low per record, but it does not scale. A growing queue is a signal to fix the keys upstream.</td>
              </tr>
            </tbody>
          </table>
        </section>
      </ArticleLayout>
    </PageShell>
  );
}
