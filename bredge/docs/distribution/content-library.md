# The Bredge — content library

Derived, ready-to-use assets for each of the ten Insights, so nothing has to be
rewritten at distribution time. For every article you get: a search snippet
(meta-description length, ≤155 characters), a LinkedIn short post, a LinkedIn
long post, a technical excerpt, a newsletter excerpt, an expert-answer angle,
and a diagram caption.

Voice: calm, precise, practitioner-first, British spelling, no hype. Canonical
name **The Bredge**. Article links use `https://thebredge.com/insights/<slug>`.
These are self-contained assets; where they overlap with `linkedin-bank.md`,
vary the wording rather than posting identical text.

---

## 1. why-dashboards-disagree
*Why do Finance and Sales have different revenue numbers?*
`https://thebredge.com/insights/why-dashboards-disagree`

**Search snippet (149):**
Finance and Sales show different revenue numbers because of timing, grain, identity and definition — not the chart. A practical reconciliation guide.

**LinkedIn short post:**
The board pack says £4.2m. The CRM says £4.5m. Finance has £4.3m. None of them is
wrong — and that is the hard part. Numbers disagree because each system measures
revenue over a different window, at a different grain, for a different idea of
the customer, with a different definition of the word. Rebuilding the dashboard
never fixes it, because the cause is upstream. Name the axis — time, grain,
identity, definition — and you have named the cause.
Full guide: https://thebredge.com/insights/why-dashboards-disagree

**LinkedIn long post:**
There is a particular silence in the monthly meeting when two screens show two
different numbers for the same thing. The instinct is to blame the dashboard and
ask for a rebuild. It is the wrong instinct.

A dashboard is a renderer. It draws whatever the query returns and has no opinion
about what revenue means or when it should be counted. So when numbers disagree,
the disagreement is upstream — and it almost always decomposes along four axes.
Time: different windows, different refresh moments. Grain: orders versus lines,
where a fan-out join double-counts. Identity: one company living as three
accounts. Definition: booked versus recognised versus reported, three genuinely
different quantities sharing a word.

Reconcile on records, not totals. Join the sources, compare row by row, and sort
every difference into one of those four buckets. You are finished not when the
gap is zero, but when every pound of it has a reason. At that point a
disagreement stops being a crisis and becomes information: it tells you exactly
which two definitions diverged, and where.
https://thebredge.com/insights/why-dashboards-disagree

**Technical excerpt:**
Matching totals is not reconciliation — two errors can cancel out, and differing
totals can be entirely correct for a definitional reason. Work at record level:
join the two sources on a shared key and classify every difference as time,
grain, identity or definition. The largest item is usually not a bug but an
unmade decision — which definition of revenue is canonical for the board — and
its home is a governed semantic layer, defined once and owned, not forty copies
scattered across forty queries.

**Newsletter excerpt:**
When Finance and Sales disagree on revenue, none of the numbers is usually wrong.
They measure different things. This piece shows how to reconcile on records
rather than totals, and how to sort every difference into time, grain, identity
or definition — so the monthly argument becomes a five-minute answer.

**Expert-answer angle:**
Frame metric disagreement as an organisational problem wearing a technical
costume — most gaps are unmade definition decisions, not dirty data, and you
cannot clean your way out of an ambiguity nobody has resolved.

**Diagram caption:**
The four axes of reconciliation — time, grain, identity and definition — with the
disagreement resolving to a fully explained gap rather than a forced match.

---

## 2. one-customer-view
*Our customer data lives in five systems. How do we get one reliable customer view?*
`https://thebredge.com/insights/one-customer-view`

**Search snippet (147):**
CRM, billing and product each define a customer differently. Build one reliable customer view with identity resolution and a canonical customer ID.

**LinkedIn short post:**
Ask three teams how many customers you have and you will get three answers. Sales
counts accounts, finance counts billing entities, product counts logins. Every
per-customer number — churn, lifetime value, "top customer" — inherits that
ambiguity. A single customer view is not a dashboard. It is deciding,
deliberately, when two records are the same real-world customer, then resolving
them to one canonical id the whole business joins to.
https://thebredge.com/insights/one-customer-view

**LinkedIn long post:**
The moment it clicks for most teams is unglamorous: your "biggest customer" turns
out to be three accounts for the same company, opened by three reps over two
years. Your second-biggest is a duplicate of the first. Every dashboard
downstream has quietly absorbed the error — concentration risk, churn, expansion
revenue, all confidently reported and all subtly wrong.

A single customer view is an identity problem first and a dashboard problem last.
The pattern is steady: normalise names and emails before you compare them; match
on more than one signal, never a single field; connect transitive matches into
one cluster; pick a canonical id deterministically; and route the uncertain cases
to a human rather than merging them automatically. It rarely solves itself,
because the systems were never designed to share a key — but it is very solvable,
and it is usually the highest-leverage fix a data team can make.
https://thebredge.com/insights/one-customer-view

**Technical excerpt:**
Identity resolution runs on stock SQL — no MDM platform required. Normalise (case,
whitespace, legal suffixes) so cosmetic differences do not defeat the match.
Propose candidate pairs from more than one signal: an exact normalised email, or
a shared domain plus a fuzzy name similarity. Because identity is transitive
(1 matches 2, 2 matches 3, so 1–2–3 are one customer), resolve clusters with a
recursive closure, then choose one survivor with ROW_NUMBER(). Quarantine the
ambiguous matches for review — a process that silently merges its uncertain cases
will eventually join two real companies into one.

**Newsletter excerpt:**
CRM, billing, product and finance each mint their own customer key, so one
company becomes several records — and every per-customer metric inherits the
ambiguity. This piece walks the identity-resolution pattern (normalise, match on
multiple signals, cluster, choose a canonical id, quarantine exceptions) that
gives you one customer view you can actually trust.

**Expert-answer angle:**
A "customer 360" is an identity-resolution problem, not a dashboard — deterministic
and probabilistic matching, a canonical id, and a human review queue for the
uncertain cases matter more than the visualisation.

**Diagram caption:**
Identity resolution in four steps — normalise, match on multiple signals, cluster
transitive matches, choose one canonical id — with exceptions routed to review.

---

## 3. is-our-data-reliable
*How do we know whether our data is actually reliable?*
`https://thebredge.com/insights/is-our-data-reliable`

**Search snippet (151):**
Reliable data isn't a feeling. Six checks — completeness, uniqueness, validity, integrity, freshness, reconciliation — with a named owner. A checklist.

**LinkedIn short post:**
"Can we trust this number?" deserves better than "I think so". Reliable does not
mean never wrong — it means you can prove the state of your data at any time, and
you catch problems before your stakeholders do. That is six checks that run close
to the data and fail loudly: completeness, uniqueness, validity, referential
integrity, freshness, reconciliation. You can get a real answer this afternoon,
on the few tables your decisions actually depend on.
https://thebredge.com/insights/is-our-data-reliable

**LinkedIn long post:**
For a long time the honest answer to "is our data reliable?" is a shrug and a
hopeful "should be". Then a number goes to the board that was quietly wrong for
three weeks, and the shrug stops being acceptable.

What fixes it is not a platform. It is a handful of checks, written as queries
that return rows only when something is broken, running on a schedule next to the
data. Empty result means fine; any rows means someone looks. Completeness:
required fields present, row counts as expected. Uniqueness: no duplicate
business keys. Validity: values in the allowed type, range and set. Referential
integrity: every child row has a real parent. Freshness: recent enough for the
decision it feeds. Reconciliation: independent sources agree at record level.

The first pass takes an afternoon. The hard part is deciding who owns each table
when a check fails — because checks without an owner quietly rot.
https://thebredge.com/insights/is-our-data-reliable

**Technical excerpt:**
Write reliability checks as assertion queries: each returns rows only when
something is wrong, so an empty result is a pass. That single convention lets the
same query run in a scheduler, a CI step or a dbt test without a rewrite. Test
uniqueness against the business key, not the surrogate — a system-generated id is
unique by construction and proves nothing. Judge freshness against the decision
the data feeds, not the clock. And reconcile at record level: matching totals can
hide two errors that cancel out.

**Newsletter excerpt:**
"Reliable" is one of the most overused words in data and one of the least defined.
This piece pins it down: six checks — completeness, uniqueness, validity,
referential integrity, freshness, reconciliation — written as assertions that
fail loudly, each with a named owner. Runnable this afternoon, no new tooling.

**Expert-answer angle:**
Reliability is a small set of owned checks that fail loudly, not a platform
purchase — and the underrated failure mode is a check with no named owner, which
quietly rots until the problem surfaces in a board meeting.

**Diagram caption:**
The six reliability checks — completeness, uniqueness, validity, referential
integrity, freshness, reconciliation — each with an owner and an alert.

---

## 4. when-to-hire-a-data-team
*When do we actually need a data team — and who should we hire first?*
`https://thebredge.com/insights/when-to-hire-a-data-team`

**Search snippet (141):**
When to hire your first data person, and whether it's an analyst, analytics engineer or data engineer — plus fractional and embedded options.

**LinkedIn short post:**
Most founders hire their first data person a little too late, and often hire the
wrong one first. The instinct is a data scientist, because the future sounds like
machine learning. But if the numbers do not yet agree, no model will save you —
you have hired a Formula 1 driver before building a road. The real question is
not "when do we hire a data scientist?" but "what is the first data problem
costing us decisions?"
https://thebredge.com/insights/when-to-hire-a-data-team

**LinkedIn long post:**
The best data hiring advice I ever got was a question: "What decision is your data
currently costing you?" We were about to post a job for a data scientist. That
question stopped us.

The honest answer was that our numbers did not agree and nobody trusted the
dashboard — a plumbing-and-definitions problem, not a modelling one. A data
scientist would have spent their first year fixing pipes they never signed up to
fix, and left. So start from the bottleneck. Answering questions and building
reports points to an analyst. Untrustworthy, unmodelled data points to an
analytics engineer. Moving and integrating data reliably points to a data
engineer. And sometimes the need is a defined outcome (a project, not a hire), or
there is no one senior to direct a new hire (an embedded team de-risks the start).

The trap is hiring one generalist to do all three jobs, and quietly setting them
up to fail. Sequence the capability instead.
https://thebredge.com/insights/when-to-hire-a-data-team

**Technical excerpt:**
The roles are not interchangeable. An analyst answers business questions and
builds reports on top of trustworthy data. An analytics engineer models and
tests that data and defines the metrics — the dbt-and-definitions layer. A data
engineer moves and integrates data reliably between systems. Clean, well-defined,
trustworthy data is the prerequisite for everything downstream, including the
models a data scientist would build, which is why reliability and definitions
almost always sequence before advanced modelling.

**Newsletter excerpt:**
More data work does not always mean more headcount. This guide explains the roles
in plain English — analyst, analytics engineer, data engineer — and how to tell
whether your first move is a hire, a defined project, or an embedded team, without
hiring for machine learning before the numbers agree.

**Expert-answer angle:**
Start the first-hire decision from the bottleneck, not the org chart; the honest
answer usually points at reliability and definitions long before it points at
data science, and sometimes a project or fractional team beats a permanent hire.

**Diagram caption:**
A first-data-hire decision guide — mapping the actual bottleneck to analyst,
analytics engineer, data engineer, or a project / embedded team.

---

## 5. before-you-build-a-data-warehouse
*Do we actually need a data warehouse yet?*
`https://thebredge.com/insights/before-you-build-a-data-warehouse`

**Search snippet (131):**
Do you need a data warehouse yet? A readiness guide on sources, refresh, definitions and ownership — and when better SQL is enough.

**LinkedIn short post:**
A data warehouse solves specific problems. Build it before you have them and you
inherit cost and complexity you did not need. "We need a warehouse" is often
shorthand for "our reporting hurts" — and sometimes better SQL, a managed
connector or a semantic model fixes the pain for a fraction of the effort. The
honest test: what actually breaks today that a warehouse would fix, and could
something simpler fix it instead?
https://thebredge.com/insights/before-you-build-a-data-warehouse

**LinkedIn long post:**
Building a data warehouse too early is one of the most expensive "grown-up"
decisions a growing company makes. Volume is not the trigger. A warehouse earns
its cost when several conditions hold together, and not before.

How many separate sources must be combined to answer your core questions? How
often must that combined view refresh — monthly, daily, intra-day? How many
people or tools need the same, governed definitions? Does a metric need to be
defined once, centrally, rather than per report? And — the one teams forget — is
there a named owner who will run and maintain the platform once it exists?

If most of those are still "no", a warehouse is likely to be cost and complexity
ahead of need. Better SQL over your existing systems, a managed connector, or a
semantic model will often carry you much further than expected. And if the
answers are genuinely "yes", the build is worth doing properly — integration and
modelling before polish, in that order.
https://thebredge.com/insights/before-you-build-a-data-warehouse

**Technical excerpt:**
A warehouse is one answer, not the answer. The readiness signals that actually
justify a build: multiple sources that must be combined for core questions; a
refresh cadence a manual rebuild cannot sustain; several consumers needing
governed, consistent definitions; and a named platform owner. Absent those, a
well-indexed operational database, a managed ELT connector, or a semantic model
over existing sources usually delivers the same outcome with far less operational
overhead. Match the architecture to the problem you have, not the one you imagine.

**Newsletter excerpt:**
A warehouse solves specific problems; build it before you have them and you
inherit cost and complexity you did not need. This readiness guide gives the
questions to answer first — sources, refresh, consumers, governed definitions,
ownership — and the cases where better SQL or a managed connector is genuinely
enough.

**Expert-answer angle:**
"Do you need a warehouse?" is the wrong question; the useful one is "what breaks
today that a warehouse would fix, and is a warehouse the cheapest fix?" — volume
alone is never the trigger.

**Diagram caption:**
A data-warehouse readiness check — sources to combine, refresh cadence, consumers,
governed definitions and a named owner — with the simpler alternatives beside it.

---

## 6. automate-monthly-reporting
*We rebuild the same management report every month. How do we automate it without making it more fragile?*
`https://thebredge.com/insights/automate-monthly-reporting`

**Search snippet (137):**
Automate monthly management reporting without adding fragility: what to move upstream, what Excel should keep, and how to stay auditable.

**LinkedIn short post:**
If you rebuild the same management report by hand every month, you are not
reporting — you are re-deriving. Automating it the wrong way just moves the
fragility somewhere you can no longer see it. The move that works: separate the
mechanical steps from the judgement calls. Push the repeated joins, lookups and
clean-up upstream into tested logic; keep Excel for the last-mile judgement and
presentation. Effort removed, fragility exposed rather than buried.
https://thebredge.com/insights/automate-monthly-reporting

**LinkedIn long post:**
The wrong way to automate a monthly report is to record the manual process
faithfully — fragile steps and all — and hand it to a machine. That does not
remove the fragility; it hides it where nobody can see it, until a source changes
quietly and the number is wrong for weeks.

The way that works starts with an honest audit of the report. Point at each step
and say whether it is mechanical and repeatable, or a genuine judgement call. The
mechanical steps — the same joins, lookups and clean-up every month — are
transformations you have simply never written down. Move them upstream into
tested logic that runs the same way each time and fails loudly when a source
breaks. The judgement — the commentary, the one-off adjustment, the presentation
— stays in Excel, where a human reviews before anything is distributed.

Excel is not the enemy. Asking it to be a data pipeline is. Automate the
repeatable, keep the audit trail, and the monthly close stops depending on one
person and one workbook only they understand.
https://thebredge.com/insights/automate-monthly-reporting

**Technical excerpt:**
Map the report before automating it. For each step, classify it as mechanical
(repeatable rule) or judgement (human decision). Mechanical steps move upstream —
into SQL or a tested transformation — where they are defined once, version-
controlled and monitored; a source change then fails loudly rather than silently
corrupting a total. Judgement and last-mile presentation stay in the spreadsheet
with a human review gate before distribution. The single points of failure to
hunt for are steps only one person understands and manual joins repeated every
month.

**Newsletter excerpt:**
Automating a monthly report the wrong way just moves the fragility somewhere you
can no longer see it. This piece shows how to separate mechanical steps from
judgement calls, move the repeatable logic upstream into tested transformations,
and keep Excel for the last mile — without losing the audit trail.

**Expert-answer angle:**
Reporting automation done well makes a report more transparent, not less — the
test of readiness is being able to say, of each step, whether it is a repeatable
rule or a human judgement call.

**Diagram caption:**
A monthly report split into mechanical steps (moved upstream into tested logic)
and judgement calls (kept in Excel behind a human review gate).

---

## 7. what-to-fix-first
*We know our data setup is messy. What should we fix first?*
`https://thebredge.com/insights/what-to-fix-first`

**Search snippet (133):**
Data setup a mess? Inventory sources, definitions, identity and quality, then score by impact and effort to decide what to fix first.

**LinkedIn short post:**
When everything about your data feels broken, the temptation is to fix
everything — which is exactly why nothing gets fixed. Sequence matters more than
ambition. Inventory the mess: sources, definitions, identity, quality, ownership.
Score each issue by impact and effort. Fix the foundational things (definitions,
identity) before the surface things (dashboards), because the foundations make
the later work cheaper. Pick the one change that makes the next three easier.
https://thebredge.com/insights/what-to-fix-first

**LinkedIn long post:**
"We know our data setup is messy" is where a lot of teams are stuck. Everything
feels broken, so nothing gets prioritised, so nothing gets fixed. The way out is
not more ambition; it is sequence.

Start with an inventory, not a rebuild. Which business questions must be
answerable, and can they be answered today? What systems hold the data, and who
owns each? Where do current reports come from, and how much manual work goes into
each? Do key metrics have agreed, documented definitions? Is a customer
represented consistently across systems? Is the data trustworthy, traceable and
fresh enough?

Then score each finding by impact — does it block or distort decisions — and
effort — time, risk, dependencies. And sequence deliberately: foundational fixes
like definitions and identity come before surface fixes like dashboards, because
they make everything after them cheaper. The goal is not a perfect stack. It is
the single change that unlocks the next three.
https://thebredge.com/insights/what-to-fix-first

**Technical excerpt:**
Treat a messy stack as an inventory-and-prioritisation problem, not a rebuild.
Inventory across seven dimensions: business questions, sources, reporting,
definitions, identity, quality/lineage/freshness, and ownership/skills/cost/
security. Score each finding on impact (does it block or distort decisions) and
effort (time, risk, dependencies), then sequence foundations before surface: fix
definitions and identity before polishing dashboards, because unresolved identity
or an undefined metric silently re-breaks every downstream fix built on top of it.

**Newsletter excerpt:**
When everything is messy, sequence beats ambition. This piece is a practical data
audit: inventory sources, definitions, identity, quality and ownership, then score
each issue by impact and effort — and fix the foundational things first, because
they make the next three fixes cheaper.

**Expert-answer angle:**
In a messy stack, the win is choosing the fix that unlocks the others — foundations
like definitions and identity before surface polish — scored by impact and effort
rather than by whichever thing is loudest this week.

**Diagram caption:**
An impact-versus-effort grid for a messy data stack, with foundational fixes
(definitions, identity) sequenced ahead of surface fixes (dashboards).

---

## 8. power-bi-slow
*Why is our Power BI dashboard so slow?*
`https://thebredge.com/insights/power-bi-slow`

**Search snippet (129):**
Power BI slow? It's usually the data model, not the report: star schema, high-cardinality columns, DAX and import vs DirectQuery.

**LinkedIn short post:**
A slow Power BI report is usually a data-model problem wearing a dashboard
costume. Teams reach for fewer tiles or a faster laptop; the time is rarely
there. It is in the model — a flat table instead of a star schema, a
high-cardinality column bloating the file, DAX doing work that belonged upstream,
or DirectQuery where import would do. Fix the model and the report that took
thirty seconds renders in two, with nothing changed on the canvas.
https://thebredge.com/insights/power-bi-slow

**LinkedIn long post:**
When a Power BI report crawls, the fixes people try first are almost always on the
canvas: remove a visual, simplify a page, buy a better machine. The time is rarely
on the canvas. It is in the model underneath.

The engine behind Power BI compresses and scans a star schema — narrow dimension
tables around a fact table — far more efficiently than one wide, flattened sheet.
Two things quietly cost the most. High-cardinality columns — free-text
identifiers, timestamps to the second — resist compression and bloat the model.
And DAX that recomputes at query time what a proper model should have resolved
once, upstream, makes every interaction pay the bill again.

The import-versus-DirectQuery choice matters too: import is usually faster,
DirectQuery trades speed for freshness, and the wrong choice for the use case
shows up as lag on every click. Shape the model first. The visuals rarely need
touching.
https://thebredge.com/insights/power-bi-slow

**Technical excerpt:**
Power BI performance is mostly a modelling question. VertiPaq compresses a star
schema (narrow dimensions around a fact table) far better than a wide flat table,
so the shape of the model sets the ceiling on speed. High-cardinality columns
resist compression and inflate the file; push free-text ids and second-level
timestamps out of the model or reduce their precision. Move heavy DAX upstream so
it is computed once, not per query. Choose import for speed, DirectQuery only when
freshness genuinely requires it.

**Newsletter excerpt:**
A slow Power BI report is usually a data-model problem, not a visual one. This
piece walks where the time actually goes — star schema versus flat table,
high-cardinality columns, query-time DAX, import versus DirectQuery — and the
model choices that get the speed back without touching the canvas.

**Expert-answer angle:**
Slow BI is nearly always upstream of the visuals — model shape, column
cardinality and DAX placement decide performance, so polishing the report is
usually treating the symptom.

**Diagram caption:**
Before and after — a wide flat table versus a star schema — showing where Power
BI's performance actually comes from.

---

## 9. excel-cleaning-automation
*We spend days cleaning Excel files before every report. What should we automate first?*
`https://thebredge.com/insights/excel-cleaning-automation`

**Search snippet (136):**
Spending days cleaning Excel before every report? What to automate first in Power Query or SQL, what to fix at source, what Excel keeps.

**LinkedIn short post:**
If you do the same Excel clean-up every month, it is not admin — it is a
transformation you have not written down yet. The same find-and-replace, the same
column split, the same lookup: that is logic that can be written once and run
every time. Some belongs in Power Query, some in SQL, and some should be fixed at
source so the mess never arrives. The point is not to abolish Excel; it is to stop
paying for the same work every month.
https://thebredge.com/insights/excel-cleaning-automation

**LinkedIn long post:**
Days lost to cleaning spreadsheets before every report is one of the most common,
least-discussed costs in a growing company's data work. It rarely shows up on a
budget, which is exactly why it never gets fixed.

Here is the reframe: repeated manual clean-up is a transformation you have simply
never written down. The same steps, in the same order, every month. Once you see
it that way, the question becomes where the logic should live. If the mess is
presentational and local to one workbook, Power Query is fine and stays close to
the analyst. If the same transformation feeds several reports, it belongs in SQL
upstream, where it is defined once, tested and shared. And if the mess is created
at source — a free-text field that should have been a dropdown — the cheapest fix
is to stop producing it.

Automate the transformation; do not enshrine the mess. And keep a quality test on
the output, so a change in the source fails loudly instead of quietly.
https://thebredge.com/insights/excel-cleaning-automation

**Technical excerpt:**
Repeated Excel clean-up is an unwritten transformation. Decide where it belongs by
scope and source. Presentational, single-workbook fixes suit Power Query, close to
the analyst. Logic that feeds multiple reports belongs upstream in SQL, defined
once, tested and shared, so it does not drift across copies. Mess created at
source — free text that should be constrained values — is cheapest to fix at
source. Whatever you automate, add a quality assertion on the output so an
upstream change fails loudly rather than silently corrupting the report.

**Newsletter excerpt:**
If you repeat the same Excel clean-up every month, it is a transformation you have
not written down yet. This piece covers what to automate first — Power Query
versus SQL — what to fix at source instead, and how to keep a quality check on the
output so changes fail loudly rather than silently.

**Expert-answer angle:**
Repeated manual clean-up is unwritten logic; the practitioner's job is to decide
where it should live (source, Power Query or SQL) and to test the output — not to
automate the mess in place.

**Diagram caption:**
A decision path for repeated Excel clean-up — fix at source, transform in Power
Query, or move upstream to SQL — with a quality check on the output.

---

## 10. power-bi-warehouse-or-both
*We need better reporting. Do we need Power BI, a warehouse, or both?*
`https://thebredge.com/insights/power-bi-warehouse-or-both`

**Search snippet (140):**
Power BI, a data warehouse, or both? Separate the reporting layer, the model and the integration to decide what to build, and in what order.

**LinkedIn short post:**
"We need better reporting" hides three different problems, and buying the wrong
one first does not move the pain. It can mean the reporting layer is weak (Power
BI), the model is missing or wrong (a semantic model), or the data is never
brought together reliably (integration, often a warehouse). Separate the three
and the Power-BI-versus-warehouse question answers itself — and, more useful
still, tells you the order to build in.
https://thebredge.com/insights/power-bi-warehouse-or-both

**LinkedIn long post:**
"We need better reporting" is one of those sentences that sounds like a
requirement but is really three requirements wearing a trench coat. Until you
separate them, any tool you buy is a guess.

Problem one: the reporting layer itself is weak — the charts are hard to read,
self-service is missing, distribution is manual. That is Power BI work. Problem
two: the model is missing or wrong — metrics are undefined, the same number means
different things in different reports. That is a semantic model, and no reporting
tool fixes it. Problem three: the data is never reliably combined — several
sources, no single place they meet, definitions re-implemented per report. That
is integration, and often where a warehouse earns its place.

Most teams have some of all three, but in a clear order of leverage. Fixing the
model and integration usually has to come before polishing the reporting layer,
because a beautiful dashboard on an undefined metric is just a faster way to
disagree. Separate the problems and you buy the right thing, in the right order.
https://thebredge.com/insights/power-bi-warehouse-or-both

**Technical excerpt:**
"Better reporting" resolves into three distinct layers, each with its own fix.
The reporting layer (Power BI) handles presentation, self-service and
distribution. The modelling layer (a semantic model / metrics layer) defines what
each number means, once, and governs it. The integration layer (often a
warehouse) reliably combines sources into one place. Diagnosing which layer is
actually failing prevents the classic error of buying a BI tool to solve a
modelling problem — a polished dashboard over an undefined metric is just a faster
way to disagree. Sequence integration and modelling before reporting polish.

**Newsletter excerpt:**
"We need better reporting" hides three different problems: a weak reporting layer,
a missing model, or unreliable integration. This piece separates the reporting
layer, the model and the integration so the Power-BI-or-warehouse question answers
itself — and tells you the order to build in.

**Expert-answer angle:**
"Do we need Power BI or a warehouse?" is under-specified; the useful move is to
separate the reporting layer, the semantic model and the integration, because a
dashboard on an undefined metric is just a faster way to disagree.

**Diagram caption:**
Three stacked layers — integration, model, reporting — showing which problem each
solves and the order in which they usually need to be built.
