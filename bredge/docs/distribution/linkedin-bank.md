# The Bredge — LinkedIn content bank

A distribution-ready bank of 30 posts plus the company-page assets needed to run
The Bredge presence on LinkedIn. Written to be published on an **intelligent
cadence**, not as one-a-day filler. Voice is calm, precise, practitioner-first
and buyer-facing: no hype, no "excited to announce", no manufactured urgency.

Canonical name everywhere: **The Bredge**. Article links use
`https://thebredge.com/insights/<slug>`; resources use
`https://thebredge.com/resources/<slug>`; the two conversion links are
`https://thebredge.com/contact` and `https://thebredge.com/schedule`.

`[OWNER]` marks where the founder's real name goes; `[OWNER LinkedIn URL]` marks
the founder's personal profile link. Fill these in before publishing.

## Relationship to the other LinkedIn file

`linkedin-assets.md` holds deep multi-asset sets (buyer post, carousel,
checklist, founder post, company post) for four articles. This file is the
**broader bank**: 30 shorter, self-contained posts across all ten Insights and
the six resources, plus the company-page copy, banner brief, launch post and
featured-content plan. Use both together; do not publish the same text twice.

## How to run the cadence (not one-per-day)

- **Two to three posts a week is plenty.** A consistent, considered cadence
  reads as a firm that knows its subject; daily posting reads as a content mill.
- **Rotate the register:** one buyer-problem post, then a technical breakdown,
  then a diagram or resource. Never post two carousels back to back.
- **Personal account leads, company page amplifies.** Practitioner posts earn
  more reach from a named person; the company page reshares with a one-line
  framing. Recommendations per post below.
- **Let a post breathe.** Reply to comments for 24–48 hours before the next post.
  Engagement on one good post beats reach across three rushed ones.
- **Reuse, don't repeat.** A buyer post and its matching carousel can run two
  weeks apart; the same sentence should not appear in both.

---

# Part A — The 30-post bank

## A1. Buyer-problem posts (10)

Framed around the question a client actually asks, in their language. These are
the top of the funnel: they name a pain precisely and offer a way to think about
it, not a pitch.

### Post 1 — Finance and Sales disagree on revenue

- **Hook:** Three systems, three revenue numbers, and nobody in the room is
  wrong. That is the uncomfortable part.
- **Body:** The board pack says one figure, the CRM says another, finance has a
  third in a spreadsheet. The reflex is to rebuild the dashboard. It never
  works, because the chart only shows what the query returns — the disagreement
  lives upstream, in timing, grain, identity and definition. Most "reporting
  bugs" are one of those four things, and each has a different owner and a
  different fix. Name the axis and you have named the cause.
- **CTA:** The four causes to check before anyone rebuilds a report:
  https://thebredge.com/insights/why-dashboards-disagree
- **Asset needed:** None (text post), or a single still of the four-axis diagram.
- **Source:** Insight — why-dashboards-disagree.
- **Account:** Company page. Broad, non-personal framing; reshare from `[OWNER]`
  with a one-line "I have sat in this meeting more times than I can count."

### Post 2 — How many customers do you actually have?

- **Hook:** Ask three teams how many customers you have and you will get three
  answers. None of them is wrong, and that is exactly the problem.
- **Body:** Sales counts accounts, finance counts billing entities, product
  counts logins. Every per-customer number — churn, lifetime value, "top
  customer" — inherits that ambiguity. A single customer view is not a
  dashboard; it is deciding, deliberately, when two records are the same
  real-world customer, then resolving them to one canonical id the whole
  business joins to. It rarely solves itself, because the systems were never
  designed to share a key.
- **CTA:** Where to start, and when it needs to become a system:
  https://thebredge.com/insights/one-customer-view
- **Asset needed:** None, or the identity-resolution pipeline still.
- **Source:** Insight — one-customer-view.
- **Account:** Personal (`[OWNER]`). Reads as practitioner judgement; company
  page reshares.

### Post 3 — "Can we trust this number?"

- **Hook:** "Can we trust this number?" is a fair question. "I think so" is not
  an answer a board should accept.
- **Body:** Reliable does not mean never wrong. It means you can prove the state
  of your data at any time, and you find problems before your stakeholders do.
  That comes from a small set of checks — completeness, uniqueness, validity,
  referential integrity, freshness, reconciliation — that run close to the data
  and fail loudly. You can get a real answer in an afternoon, without new
  tooling, on the few tables your decisions actually depend on.
- **CTA:** The six checks, and when reliability needs to become a system:
  https://thebredge.com/insights/is-our-data-reliable
- **Asset needed:** None, or the six-checks diagram still.
- **Source:** Insight — is-our-data-reliable.
- **Account:** Company page; `[OWNER]` reshare.

### Post 4 — Who is your first data hire?

- **Hook:** Most founders hire their first data person a little too late, and
  often hire the wrong one first.
- **Body:** The instinct is to hire a data scientist because the future sounds
  like machine learning. But if the numbers do not yet agree, no model will save
  you — you have hired a Formula 1 driver before you have built a road. The
  honest first move is usually the duller one: someone who can make the plumbing
  reliable and the definitions consistent. The real question is not "when do we
  hire a data scientist?" but "what is the first data problem costing us
  decisions?"
- **CTA:** The roles in plain English, and how the work sequences:
  https://thebredge.com/insights/when-to-hire-a-data-team
- **Asset needed:** None, or the first-hire decision-tree still.
- **Source:** Insight — when-to-hire-a-data-team.
- **Account:** Personal (`[OWNER]`). Hiring advice lands best from a person.

### Post 5 — Do you actually need a warehouse yet?

- **Hook:** A data warehouse solves specific problems. Build it before you have
  them and you inherit cost and complexity you did not need.
- **Body:** "We need a warehouse" is often shorthand for "our reporting hurts".
  Sometimes better SQL, a managed connector or a semantic model fixes the pain
  for a fraction of the effort. The questions that decide it are dull and
  useful: how many sources must be combined, how often the combined view must
  refresh, how many people rely on consistent definitions, and whether there is
  a named owner to run the platform once it exists.
- **CTA:** The readiness questions to answer first:
  https://thebredge.com/insights/before-you-build-a-data-warehouse
- **Asset needed:** None, or the readiness-checklist resource card.
- **Source:** Insight — before-you-build-a-data-warehouse.
- **Account:** Company page; `[OWNER]` reshare.

### Post 6 — Rebuilding the same report every month

- **Hook:** If you rebuild the same management report by hand every month, you
  are not reporting. You are re-deriving.
- **Body:** Automating it the wrong way just moves the fragility somewhere you
  can no longer see it. The move that works is to separate the mechanical steps
  from the judgement calls: push the repeated joins, lookups and clean-up
  upstream into tested logic, and keep Excel for the last-mile judgement and
  presentation. Done well, automation removes effort without hiding risk — and
  the monthly close stops depending on one person and one fragile workbook.
- **CTA:** What to move upstream, what to keep in Excel, and how to keep it
  auditable: https://thebredge.com/insights/automate-monthly-reporting
- **Asset needed:** None, or the reporting-automation map card.
- **Source:** Insight — automate-monthly-reporting.
- **Account:** Company page; `[OWNER]` reshare.

### Post 7 — Everything is messy. What do we fix first?

- **Hook:** When everything about your data feels broken, the temptation is to
  fix everything. That is exactly why nothing gets fixed.
- **Body:** Sequence matters more than ambition. Inventory the mess — sources,
  definitions, identity, quality, ownership — then score each issue by impact
  and effort. Fix the foundational things (definitions, identity) before the
  surface things (dashboards), because the foundations make the later work
  cheaper. The goal is not a perfect stack; it is the one change that makes the
  next three easier.
- **CTA:** How to inventory and prioritise the mess:
  https://thebredge.com/insights/what-to-fix-first
- **Asset needed:** None, or the impact/effort grid still.
- **Source:** Insight — what-to-fix-first.
- **Account:** Personal (`[OWNER]`); company page reshares.

### Post 8 — Why is Power BI so slow?

- **Hook:** A slow Power BI report is usually a data-model problem wearing a
  dashboard costume.
- **Body:** Teams reach for faster visuals, fewer tiles, a better laptop. The
  time is rarely there. It is in the model: a flat table instead of a star
  schema, a high-cardinality column bloating the file, DAX doing work that
  belonged upstream, or DirectQuery where import would do. Fix the model and the
  same report that took thirty seconds renders in two — with nothing changed on
  the canvas.
- **CTA:** Where the time actually goes, and the model choices that fix it:
  https://thebredge.com/insights/power-bi-slow
- **Asset needed:** None, or a before/after model diagram still.
- **Source:** Insight — power-bi-slow.
- **Account:** Personal (`[OWNER]`) for practitioner credibility; company page
  reshares.

### Post 9 — Days lost cleaning Excel before every report

- **Hook:** If you do the same Excel clean-up every month, it is not admin. It
  is a transformation you have not written down yet.
- **Body:** Repeated manual clean-up — the same find-and-replace, the same
  column split, the same lookup — is logic that can be written once and run
  every time. Some of it belongs in Power Query, some in SQL, and some should be
  fixed at source so the mess never arrives. The point is not to abolish Excel;
  it is to stop paying for the same work every month, and to make the result
  testable instead of hand-checked.
- **CTA:** What to automate first, and what Excel should keep:
  https://thebredge.com/insights/excel-cleaning-automation
- **Asset needed:** None.
- **Source:** Insight — excel-cleaning-automation.
- **Account:** Company page; `[OWNER]` reshare.

### Post 10 — Power BI, a warehouse, or both?

- **Hook:** "We need better reporting" hides three different problems. Buy the
  wrong one first and the pain does not move.
- **Body:** Better reporting can mean the reporting layer is weak (Power BI), the
  model is missing or wrong (a semantic model), or the data is never brought
  together reliably (integration, often a warehouse). Separate the three and the
  Power-BI-versus-warehouse question usually answers itself — and, more useful
  still, tells you the order to build in. Most teams need them in sequence, not
  all at once.
- **CTA:** How to separate the three problems and sequence the build:
  https://thebredge.com/insights/power-bi-warehouse-or-both
- **Asset needed:** None, or the three-layers diagram still.
- **Source:** Insight — power-bi-warehouse-or-both.
- **Account:** Company page; `[OWNER]` reshare.

## A2. Technical breakdowns (8)

For a practitioner audience — data engineers, analytics engineers, BI leads.
These build credibility with the people who influence the buyer. All examples
are illustrative and synthetic; no client data, no vendor pitch.

### Post 11 — Reconcile on records, not totals

- **Hook:** Two totals matching is not reconciliation. It is a coincidence you
  have not investigated yet.
- **Body:** Matching totals can hide two errors that cancel out; differing
  totals can be entirely correct for a definitional reason. Real reconciliation
  works at record level: join the two sources on a shared key, compare row by
  row, and classify every difference as timing, grain, identity or definition.
  You are finished not when the gap is small, but when every unit of it has a
  reason. That is a checkable, ownable state — and it turns a forty-minute
  argument into a five-minute answer.
- **CTA:** The full method, with a worked example:
  https://thebredge.com/insights/why-dashboards-disagree
- **Asset needed:** Optional code/table still (records-level comparison).
- **Source:** Insight — why-dashboards-disagree.
- **Account:** Personal (`[OWNER]`). Technical posts read as expertise from a
  person; company page can reshare to the firm's audience.

### Post 12 — Identity resolution in plain SQL

- **Hook:** You do not need an MDM platform to resolve customer identity. You
  need normalisation, more than one matching signal, and a recursive closure.
- **Body:** The pattern: normalise names and emails before comparing (case,
  whitespace, legal suffixes); propose candidate pairs from more than one signal
  (exact email, or shared domain plus a fuzzy name match); connect transitive
  matches into clusters with a recursive CTE; pick one canonical survivor
  deterministically with ROW_NUMBER(); and — the part that keeps it honest —
  quarantine the uncertain cases for human review rather than merging them. It
  runs on stock PostgreSQL.
- **CTA:** The full pattern with runnable, synthetic SQL:
  https://thebredge.com/insights/one-customer-view
- **Asset needed:** Code carousel or a single SQL still.
- **Source:** Insight — one-customer-view (and the DZone identity article).
- **Account:** Personal (`[OWNER]`); company page reshares.

### Post 13 — Data-quality checks as assertion queries

- **Hook:** The most useful data test is one that returns rows only when
  something is wrong. Empty result, you are fine. Any rows, someone looks.
- **Body:** Write reliability checks as assertions: completeness, uniqueness on
  the *business* key (not the surrogate), validity, referential integrity,
  freshness judged against the decision it feeds, and reconciliation at record
  level. Because the convention is "any output is a failure", the same query
  drops straight into a scheduler, a CI step or a dbt test without a rewrite. No
  framework to adopt; nothing to install beyond the database you already have.
- **CTA:** The six checks and how to run them this afternoon:
  https://thebredge.com/insights/is-our-data-reliable
- **Asset needed:** Code carousel (one slide per check) or a single SQL still.
- **Source:** Insight — is-our-data-reliable (and the open-source checks repo).
- **Account:** Personal (`[OWNER]`); company page reshares.

### Post 14 — Star schema beats a wide table

- **Hook:** A single wide table feels simpler. It is usually why your Power BI
  file is slow.
- **Body:** The VertiPaq engine compresses and scans a star schema — narrow
  dimension tables around a fact table — far better than one flattened sheet.
  Two things quietly cost the most: high-cardinality columns (free-text IDs,
  timestamps to the second) that resist compression and bloat the model, and DAX
  that recomputes at query time what a proper model would have resolved once.
  Shape the model first; the visuals rarely need touching.
- **CTA:** The full model-performance checklist:
  https://thebredge.com/insights/power-bi-slow
- **Asset needed:** Before/after model diagram (flat table vs star schema).
- **Source:** Insight — power-bi-slow.
- **Account:** Personal (`[OWNER]`); company page reshares.

### Post 15 — Power Query or SQL for the clean-up?

- **Hook:** "Automate the Excel clean-up" is the easy sentence. Where the logic
  should live is the real decision.
- **Body:** A rough rule: if the mess is presentational and local to one
  workbook, Power Query is fine and stays close to the analyst. If the same
  transformation feeds several reports, it belongs in SQL upstream, where it is
  defined once, tested, and shared. And if the mess is created at source — a
  free-text field that should be a dropdown — the cheapest fix is to stop
  producing it. Automate the transformation; do not enshrine the mess.
- **CTA:** What to automate first, and what to fix at source:
  https://thebredge.com/insights/excel-cleaning-automation
- **Asset needed:** Optional decision diagram (source vs Power Query vs SQL).
- **Source:** Insight — excel-cleaning-automation.
- **Account:** Personal (`[OWNER]`); company page reshares.

### Post 16 — The semantic layer is where a definition lives

- **Hook:** If "revenue" is defined in forty different queries, you do not have
  a metric. You have forty opinions that happen to share a name.
- **Body:** The largest reconciliation gaps are rarely bugs; they are unmade
  decisions. Which definition of revenue is *the* definition for the board? That
  decision needs a home — a governed semantic layer where a metric is defined
  once, in plain language, owned by a named person, and reused by every report.
  Without it, each analyst re-implements the metric and the definitions drift
  apart within weeks. You cannot clean your way out of an ambiguity nobody has
  resolved.
- **CTA:** Why definition problems get misdiagnosed as data-quality problems:
  https://thebredge.com/insights/power-bi-warehouse-or-both
- **Asset needed:** None, or a simple "one definition, many reports" diagram.
- **Source:** Insight — power-bi-warehouse-or-both (and why-dashboards-disagree).
- **Account:** Personal (`[OWNER]`); company page reshares.

### Post 17 — The signals that actually mean "warehouse"

- **Hook:** You do not need a warehouse because you have a lot of data. You need
  one when specific conditions all hold at once.
- **Body:** The honest triggers: several sources must be combined to answer your
  core questions; that combined view must refresh often enough that a manual
  monthly rebuild cannot keep up; multiple people or tools need the same,
  governed definitions; and there is a named owner to run the platform. Miss any
  of those and a warehouse is likely to be cost and complexity ahead of need —
  better SQL or a managed connector will carry you further than expected.
- **CTA:** The full readiness checklist:
  https://thebredge.com/insights/before-you-build-a-data-warehouse
- **Asset needed:** None, or the readiness-checklist resource card.
- **Source:** Insight — before-you-build-a-data-warehouse.
- **Account:** Personal (`[OWNER]`); company page reshares.

### Post 18 — Move the logic upstream, keep the judgement in Excel

- **Hook:** The safest way to automate a monthly report is to be honest about
  which steps are mechanical and which are judgement.
- **Body:** Mechanical steps — the same joins, lookups and clean-up every month
  — should move upstream into tested logic, where they run the same way each
  time and fail loudly when a source changes. Judgement — the commentary, the
  one-off adjustment, the last-mile presentation — can stay in Excel, where a
  human still reviews before anything is distributed. Automation should remove
  effort and expose fragility, not bury it where nobody can see it.
- **CTA:** How to map a report before you automate it:
  https://thebredge.com/insights/automate-monthly-reporting
- **Asset needed:** None, or the reporting-automation map card.
- **Source:** Insight — automate-monthly-reporting.
- **Account:** Personal (`[OWNER]`); company page reshares.

## A3. Diagram / carousel posts (6)

Carousels perform well on LinkedIn and are worth the design time. Each needs a
designed asset (PDF carousel or a single strong still). Keep type large, one
idea per slide, and a quiet Bredge wordmark on the cover and final slide only.

### Post 19 — The four axes of reconciliation (carousel)

- **Hook (cover slide):** Three systems. Three revenue numbers. Nobody is lying.
- **Body / slide outline:**
  1. Cover — the meeting everyone recognises.
  2. The reflex that fails — rebuilding the dashboard. The chart is a renderer;
     the cause is upstream.
  3. Axis 1 — Time: different windows, different refresh moments. Two clocks.
  4. Axis 2 — Grain: orders vs lines; where a fan-out join double-counts.
  5. Axis 3 — Identity: one company living as three accounts.
  6. Axis 4 — Definition: booked vs recognised vs reported. The biggest gap is a
     decision nobody made.
  7. What good looks like — one owned definition per metric; reconcile on
     records; disagreements become information.
- **CTA (final slide):** Full guide: thebredge.com/insights/why-dashboards-disagree
- **Asset needed:** 7-slide PDF carousel.
- **Source:** Insight — why-dashboards-disagree.
- **Account:** Company page (carousels suit the brand feed); `[OWNER]` reshares
  with a personal line.

### Post 20 — Identity resolution, four steps (carousel)

- **Hook (cover):** How one customer becomes three records — and how to put them
  back together.
- **Body / slide outline:**
  1. Cover — the problem: CRM, billing and product each mint their own key.
  2. Step 1 — Normalise: case, whitespace, legal suffixes, before you compare.
  3. Step 2 — Match on more than one signal: email, domain, fuzzy name. Never a
     single field.
  4. Step 3 — Cluster transitive matches into one group.
  5. Step 4 — Pick one canonical id, deterministically.
  6. The safety net — quarantine uncertain matches for human review.
  7. The payoff — join everything to the canonical id; identity stops being the
     cause of disagreement.
- **CTA (final slide):** thebredge.com/insights/one-customer-view
- **Asset needed:** 7-slide PDF carousel (can reuse the SQL pattern visuals).
- **Source:** Insight — one-customer-view.
- **Account:** Company page; `[OWNER]` reshares.

### Post 21 — The six reliability checks (carousel)

- **Hook (cover):** "Is our data reliable?" is answerable in six checks.
- **Body / slide outline:**
  1. Cover — reliable is not a feeling; it is a set of checks that pass.
  2. Completeness — required fields present, row counts as expected.
  3. Uniqueness — no unintended duplicate business keys.
  4. Validity + referential integrity — sane values; every child has a parent.
  5. Freshness — recent enough for the decision it feeds.
  6. Reconciliation — independent sources agree at record level.
  7. Ownership — every check has a named owner and an alert.
- **CTA (final slide):** thebredge.com/insights/is-our-data-reliable
- **Asset needed:** 7-slide PDF carousel.
- **Source:** Insight — is-our-data-reliable / resource: data-quality-checklist.
- **Account:** Company page; `[OWNER]` reshares.

### Post 22 — First data hire: a decision guide (carousel)

- **Hook (cover):** Analyst, analytics engineer, or data engineer? Start with the
  bottleneck, not the org chart.
- **Body / slide outline:**
  1. Cover — the wrong first hire is a common, expensive mistake.
  2. Bottleneck: answering questions and building reports → analyst.
  3. Bottleneck: untrustworthy, unmodelled data, undefined metrics → analytics
     engineer.
  4. Bottleneck: moving and integrating data reliably → data engineer.
  5. One-off outcome vs continuous need → maybe a project, not a hire.
  6. No one senior to manage the hire → embedded or fractional team.
  7. The rule — do not hire one person to do all three jobs; sequence it.
- **CTA (final slide):** thebredge.com/insights/when-to-hire-a-data-team
- **Asset needed:** 7-slide PDF carousel; pairs with the decision-tree resource.
- **Source:** Insight — when-to-hire-a-data-team / resource:
  first-data-hire-decision-tree.
- **Account:** Company page; `[OWNER]` reshares.

### Post 23 — Reporting layer vs model vs integration (carousel)

- **Hook (cover):** "We need better reporting" is three different problems.
- **Body / slide outline:**
  1. Cover — one sentence, three possible meanings.
  2. Problem 1 — the reporting layer is weak → Power BI work.
  3. Problem 2 — the model is missing or wrong → a semantic model.
  4. Problem 3 — data is never reliably combined → integration, often a
     warehouse.
  5. How to tell which you have.
  6. The order matters — model and integration usually come before polish.
  7. The payoff — you buy the right thing, in the right order.
- **CTA (final slide):** thebredge.com/insights/power-bi-warehouse-or-both
- **Asset needed:** 7-slide PDF carousel (three-layers diagram at its heart).
- **Source:** Insight — power-bi-warehouse-or-both.
- **Account:** Company page; `[OWNER]` reshares.

### Post 24 — What to fix first: impact × effort (carousel)

- **Hook (cover):** Everything is messy. Here is how to choose the one thing to
  fix first.
- **Body / slide outline:**
  1. Cover — when everything is broken, sequence beats ambition.
  2. Inventory — sources, definitions, identity, quality, ownership.
  3. Score each issue by impact (does it block or distort decisions).
  4. Score each issue by effort (time, risk, dependencies).
  5. The grid — quick wins, foundational bets, and what to defer.
  6. Foundations first — definitions and identity make later work cheaper.
  7. The payoff — one change that unlocks the next three.
- **CTA (final slide):** thebredge.com/insights/what-to-fix-first
- **Asset needed:** 7-slide PDF carousel with a 2×2 impact/effort grid.
- **Source:** Insight — what-to-fix-first / resource: data-diagnostic-checklist.
- **Account:** Company page; `[OWNER]` reshares.

## A4. Resource posts (3)

These promote the ungated, linkable resources. The value is the tool itself;
the CTA is a download/use, not a sales call.

### Post 25 — Revenue reconciliation checklist

- **Hook:** Before anyone rebuilds a report, run this. It reconciles two revenue
  figures at record level and classifies every difference.
- **Body:** The checklist walks the same discipline a good analyst uses: write
  the metric definition in one sentence, pull both sources for the exact same
  window, compare refresh timestamps, state the grain, match records rather than
  totals, and sort every difference into timing, identity, scope, duplication,
  currency, grain or definition — then assign each class one owner and one place
  to fix it. It is free, printable, and vendor-neutral.
- **CTA:** https://thebredge.com/resources/revenue-reconciliation-checklist
- **Asset needed:** Resource preview card (screenshot of the checklist).
- **Source:** Resource — revenue-reconciliation-checklist.
- **Account:** Company page. Resources are firm assets; `[OWNER]` can reshare.

### Post 26 — Data-quality checklist

- **Hook:** A free checklist that turns "we think the data's fine" into "it
  passed six checks, and here is who owns them".
- **Body:** Pick the few datasets your decisions actually depend on — not
  everything — and run six checks on each: completeness, uniqueness, validity,
  referential integrity, freshness and reconciliation. Record an owner for each
  dataset and where failures are alerted. That is the whole discipline, on one
  page, ready to run this afternoon.
- **CTA:** https://thebredge.com/resources/data-quality-checklist
- **Asset needed:** Resource preview card.
- **Source:** Resource — data-quality-checklist.
- **Account:** Company page; `[OWNER]` reshare.

### Post 27 — Data warehouse readiness checklist

- **Hook:** Six questions to answer before you spend a penny on a data warehouse.
- **Body:** How many sources must combine to answer your core questions? How
  often must that view refresh? How many people need consistent definitions?
  Does a metric need governing once, centrally? Is there a named owner to run the
  platform? And — the honest one — what actually breaks today that a warehouse
  would fix, and could better SQL or a managed connector fix it instead? If most
  answers are "no", a simpler option is usually cheaper and faster.
- **CTA:** https://thebredge.com/resources/data-warehouse-readiness
- **Asset needed:** Resource preview card.
- **Source:** Resource — data-warehouse-readiness.
- **Account:** Company page; `[OWNER]` reshare.

## A5. Company / point-of-view posts (3)

The firm's stance, in the founder's voice where it helps. These build a
recognisable perspective over time.

### Post 28 — You cannot clean your way out of a definition problem

- **Hook:** Half the "data quality problems" I am called in for are not quality
  problems at all. They are unmade decisions.
- **Body:** When sales, finance, the board and product each mean something
  different by "revenue", no amount of cleaning makes two different quantities
  equal. A team can spend a quarter tidying data and end up in the same meeting
  the following year. The valuable move is not a better model; it is
  facilitating the decision the business has been avoiding — which definition is
  canonical, for which audience — and then encoding it once, in the open. Clean
  data cannot resolve an ambiguity nobody has resolved.
- **CTA:** No hard CTA — invite a reply: "What is the word your teams quietly
  define three different ways?" Optionally link why-dashboards-disagree.
- **Asset needed:** None.
- **Source:** POV drawn from why-dashboards-disagree / Locally Optimistic pitch.
- **Account:** Personal (`[OWNER]`). A stance reads best from a person; company
  page reshares.

### Post 29 — "Reliable" is the most overused word in data

- **Hook:** "Reliable" is one of the most overused words in data, and one of the
  least defined.
- **Body:** We take it to mean something specific and testable: you can prove the
  state of your data at any time, and you learn about problems before your
  stakeholders do. That is not a platform purchase. It is a handful of checks
  that run close to the data, fail loudly, and are owned by a named person. The
  hard part is rarely the queries; it is deciding who owns each dataset when a
  check fails — because checks without an owner quietly rot.
- **CTA:** Optionally link is-our-data-reliable, or invite discussion.
- **Asset needed:** None.
- **Source:** POV drawn from is-our-data-reliable.
- **Account:** Personal (`[OWNER]`); company page reshares.

### Post 30 — What The Bredge is for

- **Hook:** Growing companies rarely have a data problem. They have five systems
  that were never designed to agree.
- **Body:** The Bredge is a data engineering, analytics and business
  intelligence partner. We help growing and mid-market companies connect
  fragmented systems, build reliable data foundations, automate reporting and
  turn complex data into answers teams can act on. Not a platform to buy, not a
  dashboard refresh — the plumbing and the definitions underneath, done once and
  owned. If your numbers do not agree, or your monthly report depends on one
  person and a fragile workbook, that is the work we do.
- **CTA:** If that is the shape of your problem, start here:
  https://thebredge.com/contact
- **Asset needed:** None, or a simple brand still.
- **Source:** Company POV / canonical description.
- **Account:** Company page. This is the firm speaking; `[OWNER]` reshares with
  "Why I started The Bredge" framing.

---

# Part B — Company-page assets

## B1. Tagline

Primary (under the logo / as the strapline):

> **Reliable data foundations for growing companies.**

Alternatives, same register:

- Data engineering, analytics and BI for growing and mid-market companies.
- We make your numbers agree — and keep them that way.
- The plumbing and definitions underneath your reporting.

## B2. About copy (company page "About" / Overview)

Short version (for the tagline/summary field, ~250 characters):

> The Bredge is a data engineering, analytics and business intelligence partner.
> We help growing and mid-market companies connect fragmented systems, build
> reliable data foundations, automate reporting and turn complex data into
> answers teams can act on.

Full version (for the About section):

> The Bredge is a data engineering, analytics and business intelligence partner.
> We help growing and mid-market companies connect fragmented systems, build
> reliable data foundations, automate reporting and turn complex data into
> answers teams can act on.
>
> Most of the companies we work with do not have a data problem so much as
> several systems that were never designed to agree. Finance, sales, billing,
> product and support each hold part of the picture, and the numbers drift
> apart. We work upstream of the dashboard — on the sources, the models, the
> definitions and the identity resolution — so that reporting becomes reliable,
> repeatable and owned, rather than a monthly argument about which figure is
> right.
>
> We work as data projects with a defined outcome, or as an embedded team when
> you need consistent progress without hiring a full internal function yet.
> Either way the aim is the same: leave you with foundations you understand and
> can maintain, not a dependency on us.
>
> If your numbers do not reconcile, your reporting is fragile, or you are trying
> to decide whether your next move is a hire, a project or a platform, that is
> exactly the conversation we are built for.
>
> Learn more at thebredge.com.

## B3. Specialties (LinkedIn "Specialties" field — comma-separated)

Data engineering, Analytics engineering, Business intelligence, Power BI,
Data reliability, Data quality, Data warehousing, Reporting automation,
Data modelling, Identity resolution, Revenue reconciliation, Data strategy,
Embedded data teams, Data diagnostics, dbt, SQL, Semantic layers

## B4. Banner / cover image brief

- **Dimensions:** 1128 × 191 px (LinkedIn company page cover). Keep all text and
  the wordmark clear of the lower-left area, where the profile logo overlaps, and
  clear of the outer 24 px on every edge for safe cropping across devices.
- **Message (pick one line, do not crowd):** "Reliable data foundations for
  growing companies." Or the four verbs: "Connect. Reconcile. Automate. Decide."
- **Visual idea:** a calm, restrained motif of fragmented sources resolving into
  one line — e.g. several faint, offset data lines on the left converging into a
  single clean line on the right. It should read as clarity emerging from
  fragmentation, not as a generic tech abstraction. No stock imagery of people
  at laptops, no glowing circuit boards.
- **Type:** the site's display typeface; large enough to read on mobile (one
  short line only). High contrast, works in both light and dark LinkedIn themes.
- **Palette:** the Bredge brand palette from the site. One accent colour maximum;
  the rest neutral.
- **Do not:** include a phone number, a full sentence of body copy, or more than
  one accent colour. The banner sets tone; the About copy does the explaining.

## B5. Launch announcement post

- **Where:** Company page, then reshared by `[OWNER]` from the personal profile.
- **Tone:** matter-of-fact. No "excited to announce". State what the firm is,
  who it is for, and where to find the useful material.

> The Bredge is now on LinkedIn.
>
> We are a data engineering, analytics and business intelligence partner for
> growing and mid-market companies — the firm you call when your systems were
> never designed to agree and your reporting has started to show it.
>
> We work on the parts most tools skip: connecting fragmented systems, building
> reliable data foundations, automating reporting without hiding its fragility,
> and turning complex data into answers teams can actually act on.
>
> We will use this page for the practical, vendor-neutral material we would want
> ourselves — how to reconcile numbers that disagree, when a warehouse is
> genuinely worth it, how to know whether your data is reliable, and who to hire
> first. No product pitches; just the thinking, and the checklists to go with it.
>
> A good place to start, if any of that sounds familiar:
> https://thebredge.com/insights

- **Personal reshare line for `[OWNER]`:** "I started The Bredge because the same
  problem kept turning up in different companies: not bad data, but systems that
  were never designed to agree. This is where we will share how we think about
  fixing that."

## B6. Pinned / featured-content recommendation

LinkedIn lets a company page feature up to a few items at the top of the page.
Choose for a first-time visitor deciding whether the firm is credible and
relevant — lead with proof of thinking, not a sales page.

Recommended featured set, in order:

1. **Why do Finance and Sales have different revenue numbers?** —
   `https://thebredge.com/insights/why-dashboards-disagree`. The single best
   "this firm understands my exact problem" entry point. Feature first.
2. **How do we know whether our data is actually reliable?** —
   `https://thebredge.com/insights/is-our-data-reliable`. Demonstrates rigour and
   pairs with a genuinely useful free checklist.
3. **A free resource** — the Revenue reconciliation checklist,
   `https://thebredge.com/resources/revenue-reconciliation-checklist`. Gives a
   visitor something to take away, which builds trust faster than any claim.

Refresh the featured set when a new flagship Insight ships. Do not feature the
contact or schedule page directly — let the thinking earn the click, and keep
the conversion links inside the posts and articles.

## B7. Publishing checklist (per post)

- British spelling; canonical name "The Bredge"; no hype phrasing.
- Correct link (`/insights/` vs `/resources/`), tested once before posting.
- Only one link per post, placed where a click is the natural next step.
- Asset attached where the post calls for one; carousels exported as PDF.
- Company vs personal account matches the recommendation above.
- First comment reserved for any secondary link, to keep the post body clean.
