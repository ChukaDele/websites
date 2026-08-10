# The Bredge — expert media packs (Qwoted / Featured / SourceBottle)

Profile and answer material for expert-quote platforms. The aim is genuine,
practitioner-first commentary that a journalist can quote as-is — not generic
quote spam, and never a vendor pitch. Answer only requests where The Bredge has
real, relevant experience.

`[OWNER]` placeholders mark the founder's real name, title and personal links.
Fill them in before creating any profile. The owner claims and verifies these
accounts personally, using real credentials — profiles are not created on the
owner's behalf.

Canonical name everywhere: **The Bredge**. British spelling throughout.

---

## 1. Profile fields (use across Qwoted, Featured and SourceBottle)

- **Display name:** `[OWNER — full name]`
- **Title / role:** Founder & Principal Consultant, The Bredge
  - (Alternatives, if the platform prefers a discipline label: "Data Engineering
    & Analytics Consultant" or "Principal, Data Engineering".)
- **Company:** The Bredge
- **Website:** https://thebredge.com
- **LinkedIn (personal):** `[OWNER LinkedIn URL]`
- **Company LinkedIn:** `[The Bredge company page URL]`
- **Location:** `[OWNER city, UK]`
- **Contact for bookings:** the email the owner uses for these platforms
  (a monitored inbox, not a shared alias).

### 50-word bio

> `[OWNER]` is founder of The Bredge, a data engineering, analytics and business
> intelligence consultancy for growing and mid-market companies. The firm helps
> teams connect fragmented systems, build reliable data foundations, automate
> reporting and turn complex data into answers they can act on. It works
> vendor-neutral, across finance, sales, billing and product data.

### 100-word bio

> `[OWNER]` is founder and principal consultant at The Bredge, a data
> engineering, analytics and business intelligence consultancy for growing and
> mid-market companies. The Bredge helps teams connect fragmented systems, build
> reliable data foundations, automate reporting, and turn complex data into
> answers people can act on — the work that sits upstream of the dashboard, in
> the sources, models and definitions. `[OWNER]` writes and speaks on data
> reliability, reconciling numbers that disagree, single customer views, and
> when a growing company should hire, build or buy its way to better data. The
> Bredge works vendor-neutral and publishes its data-reliability checks as
> open source.

### Expertise areas (tags / topics)

Data engineering · Analytics engineering · Business intelligence · Power BI ·
Data reliability and data quality · Data warehousing and the modern data stack ·
Reporting and reconciliation · Reporting automation · Data modelling and
semantic layers · Identity resolution / single customer view · Data governance
and metric definitions · First data hires and data team structure · SQL and dbt ·
Data strategy for growing and mid-market companies

### Headshot requirements

- **Format:** high-resolution JPEG or PNG, at least 1000 × 1000 px, square crop.
  Most platforms display a circle, so keep the head centred with margin.
- **Framing:** head-and-shoulders, eyes to camera, plain or softly blurred
  background. Neutral professional dress consistent with the firm's calm tone.
- **Lighting:** even, natural where possible; no heavy filters, no busy
  backgrounds, no group crops.
- **Consistency:** use the same headshot across Qwoted, Featured, SourceBottle
  and the LinkedIn personal profile, so journalists recognise the source.
- **Provide two crops:** a tight square for avatars and a slightly wider version
  for article by-lines if requested.

---

## 2. Approved claims (defensible only)

Everything below is safe to state publicly. Nothing here invents a statistic, a
client, a headcount, a revenue figure or an outcome percentage. If a journalist
asks for a number The Bredge has not measured, say so and offer a qualitative
observation instead.

**Approved:**

- The Bredge is a data engineering, analytics and business intelligence
  consultancy for growing and mid-market companies.
- It works upstream of the dashboard — on sources, pipelines, models,
  definitions and identity resolution — not only on visualisation.
- It works **vendor-neutral**: recommendations are not tied to reselling any
  platform.
- It publishes an open-source set of **data-reliability checks** (SQL and dbt
  tests) under the MIT licence, using entirely synthetic data.
- Its practitioners work with common tools of the trade: PostgreSQL, SQL, dbt
  and Power BI, among others.
- It has published practitioner writing on reconciling numbers that disagree,
  resolving customer identity across systems, and defining data reliability.
- Typical engagements are either a **defined data project** or an **embedded
  data team**; the stated aim is to leave clients with foundations they can
  maintain themselves.
- Common problems it addresses: numbers that disagree across systems, fragile
  monthly reporting, no single customer view, slow Power BI, and deciding
  whether the next move is a hire, a project or a platform.

**Not approved (never state or imply without evidence the owner has in hand):**

- Any client name, logo, testimonial or case study not explicitly cleared by
  that client.
- Any performance statistic ("cut reporting time by X%", "saved £Y", "improved
  accuracy by Z%") unless it is a measured, documented result the owner can
  substantiate.
- Team size, revenue, years-in-business, or "number of clients / projects
  delivered" figures, unless the owner confirms the exact number.
- Named comparisons that disparage a specific competitor or vendor.
- Predictions dressed as fact. Frame opinion as opinion.

---

## 3. Sample expert answers (short, quote-ready)

Two or three sentences each — the length most journalists actually publish. Use
these when a request wants a crisp quote rather than a full explainer.

**On why dashboards disagree:**
> "When two dashboards show different numbers, the instinct is to blame the
> dashboard. It is almost always the wrong place to look. A chart only shows what
> its query returns; the disagreement lives upstream, in timing, grain, identity
> and definition — and each of those has a different owner and a different fix."

**On data reliability:**
> "Reliable data does not mean data that is never wrong. It means data whose
> state you can prove at any time, and whose problems you catch before your
> stakeholders do. That is a handful of checks that run close to the data and
> fail loudly — not a platform you buy."

**On the first data hire:**
> "Most companies hire their first data person slightly too late, and often hire
> the wrong one first. Before you hire for machine learning, ask what decision
> your data is currently costing you. Nine times out of ten the honest answer
> points at reliability and definitions, not algorithms."

**On data warehouses:**
> "A warehouse solves specific problems. Build it before you have them and you
> inherit cost and complexity you did not need. The useful question is not 'is a
> warehouse good?' but 'what breaks today that a warehouse would fix, and could
> better SQL fix it instead?'"

---

## 4. Reusable answer modules (150–250 words each)

Fuller responses for detailed journalist questions. Practitioner-first,
vendor-neutral, no product placement. Adapt the opening line to the specific
question asked; keep the substance.

### Module 1 — Data quality

Data quality gets talked about as a virtue and measured as a vibe. The more
useful framing is that quality is a set of explicit checks that either pass or
fail, run against the few datasets your decisions actually depend on — not
everything you hold. Six checks cover most of it: completeness (are required
fields and expected rows present?), uniqueness (are there unintended duplicate
business keys?), validity (do values conform to the expected type, range and
allowed set?), referential integrity (does every child row point to a real
parent?), freshness (is the data recent enough for the decision it feeds?), and
reconciliation (do independent sources agree at record level, not just on the
total?). The discipline that makes this stick is writing each check as an
assertion that returns rows only when something is wrong — an empty result is a
pass — so the same query drops into a scheduler, a build step or a test without
rewriting. The part teams underestimate is ownership: a check without a named
owner quietly rots, and the failure everyone assumed someone was watching turns
out to have been watched by no one. Quality is not a tool you install; it is a
small number of checks, owned by named people, that fail loudly and early.

### Module 2 — Data warehouses

The most common mistake with data warehouses is building one too early because
it feels like the grown-up thing to do. A warehouse earns its cost when several
specific conditions hold together: you need to combine multiple sources to
answer core questions; that combined view has to refresh often enough that a
manual monthly rebuild cannot keep up; several people or tools need the same,
governed definitions; and — easy to forget — there is a named owner to run the
platform once it exists. If most of those are not yet true, better SQL, a
managed connector, or a semantic model over your existing systems will often
carry a growing company much further than expected, at a fraction of the effort.
The honest test I use is: what actually breaks today that a warehouse would fix,
and is a warehouse the cheapest thing that fixes it? Sometimes the answer is
genuinely yes, and then the build is worth doing properly, in the right order —
integration and modelling before polish. But "we have a lot of data" is not a
reason to build one. Volume is not the trigger; the need to combine, govern and
refresh reliably is. Build for the problem you have, not the one you imagine
you might.

### Module 3 — Power BI

When a Power BI report is slow, people reach for the visuals — fewer tiles, a
faster machine, a rebuilt page. The time is rarely there. A slow report is
usually a data-model problem wearing a dashboard costume. The engine underneath
Power BI compresses and scans a star schema — narrow dimension tables around a
fact table — far more efficiently than one wide, flattened sheet. Two things
tend to cost the most: high-cardinality columns, such as free-text identifiers
or timestamps to the second, which resist compression and bloat the model; and
DAX that recomputes at query time what a well-built model should have resolved
once, upstream. The choice between import and DirectQuery matters too — import
is usually faster, DirectQuery trades speed for freshness, and picking the wrong
one for the use case shows up as lag on every interaction. The pattern I see
repeatedly is a team polishing the canvas when the fix is in the model, or even
further upstream in how the data is shaped before it ever reaches Power BI. Get
the model right and the same report that took thirty seconds often renders in
two, with nothing changed on the page. Power BI is a good tool asked, too often,
to compensate for a model that was never built for it.

### Module 4 — The first data hire

The first data hire is one of the most consequential decisions a growing company
makes, and one of the most commonly mis-sequenced. The instinct is to hire for
the future — a data scientist, because the future sounds like machine learning.
But models are only as good as the data underneath them, and if the numbers do
not yet agree, you have hired a Formula 1 driver before building a road. The
better starting point is the bottleneck. If the pain is answering business
questions and building reports, that points to an analyst. If it is
untrustworthy, unmodelled data and undefined metrics, that points to an analytics
engineer. If it is moving and integrating data reliably between systems, that
points to a data engineer. And sometimes the need is a defined one-off outcome,
which is a project rather than a permanent hire, or there is no one senior to
direct a new hire, in which case an embedded or fractional team de-risks the
start. The trap is hiring one generalist to do all three jobs and quietly
setting them up to fail. The right first question is not "when do we hire a data
scientist?" but "what is the first data problem that is costing us decisions?" —
and the answer usually points at reliability and definitions long before it
points at algorithms.

### Module 5 — AI readiness

Most "are we ready for AI?" conversations are really "is our data in a state
that anything downstream can trust?" — and that question is answerable without
mentioning models at all. An AI initiative inherits every weakness in the data
beneath it, amplified. If a customer is represented three different ways across
systems, a model trained or prompted on that data will learn the confusion. If
"revenue" means four different things and none is governed, an assistant asked
about revenue will confidently pick one and nobody will know which. So readiness
is less about GPUs and more about foundations: reliable pipelines, resolved
identity, defined metrics, and data whose lineage you can trace. The practical
sequence is unglamorous — get the numbers to agree, resolve who the customer is,
write down what your metrics mean, and put checks in place that fail loudly —
before layering anything probabilistic on top. This is not an argument against
AI; it is an argument for spending the first pound where it compounds. A team
that fixes its foundations gets a double return: the reporting they have today
becomes trustworthy, and the AI they want tomorrow has something solid to stand
on. Readiness is mostly the work you should have done anyway, brought forward.

### Module 6 — Reporting automation

The wrong way to automate a monthly report is to record the manual process
faithfully, fragile steps and all, and hand it to a machine. That does not remove
the fragility; it hides it somewhere you can no longer see it. The move that
works is to separate the mechanical from the judgement. Mechanical steps — the
same joins, lookups and clean-up you repeat every month — should move upstream
into tested logic that runs the same way each time and fails loudly when a source
changes. Judgement — the commentary, the one-off adjustment, the final
presentation — can stay in Excel, where a human reviews before anything is
distributed. Excel is not the enemy here; asking it to be a data pipeline is. The
tell that a report is ready to automate is when you can point at each step and
say whether it is a repeatable rule or a human decision. The repeatable rules are
transformations you have simply never written down; automating them once removes
real effort and makes the result testable instead of hand-checked. And crucially,
you keep the audit trail: automation done well makes a report more transparent,
not less. The prize is not a report that runs itself; it is a monthly close that
no longer depends on one person and one workbook that only they understand.

### Module 7 — Data governance

Data governance has a reputation for committees and documents nobody reads, which
is a shame, because the useful core of it is small and practical. At its heart,
governance answers three questions for the data that matters: what does this
metric mean, who owns it, and where is that written down? Most of the expensive
disagreements I see are not technical failures — they are governance gaps. Four
teams quietly maintain four definitions of "revenue", each defensible, and the
software is asked to reconcile what the business never decided. No amount of
cleaning fixes that, because there is no bug; there is an unmade decision.
Lightweight governance fixes it: agree the canonical definition of each key
metric, record it in one governed place — a semantic layer, ideally — in plain
language, and name a person accountable for it. The same applies to identity
(when are two records the same customer?) and to quality checks (who is alerted
when one fails?). Governance done heavily becomes theatre; done lightly it is
just the small set of decisions that stop your metrics drifting apart within
weeks. For a growing company, the goal is not a governance framework. It is a
short, owned list of definitions and owners that everyone can point to when the
numbers are questioned.

### Module 8 — Metric disagreement

When Finance and Sales bring different revenue numbers to the same meeting, the
temptation is to declare one of them wrong. Usually none of them is. They
disagree because they measure different things, and the disagreement decomposes
along four axes. Time: are the two figures measured over the same window and
pulled at the same moment? A source that refreshes nightly and one that refreshes
hourly will differ every morning, and both are correct. Grain: what does one row
represent — an order, a line, a customer? Sum the wrong grain, or let a join fan
out, and you count the same money twice. Identity: when are two records the same
customer? One company living as three accounts inflates every per-customer
figure. Definition: booked versus recognised versus reported revenue are
genuinely different quantities that share a word. The way to end the argument is
to reconcile on records rather than totals — join the sources, compare row by
row, and sort every difference into one of those four buckets. You are finished
not when the gap is zero, but when every unit of it has a reason. At that point a
disagreement stops being a crisis and becomes information: it tells you exactly
which two definitions diverged, and where. The number was never wrong; the
organisation simply had more than one of it.

### Module 9 — Analytics ROI

Return on analytics is hard to quote as a single number, and I am wary of anyone
who offers one too confidently, because the honest answer depends on what a
decision is worth to you. But you can reason about it well. The clearest returns
come not from more dashboards but from removing recurring waste and recurring
risk. The waste is visible: the days each month spent rebuilding the same report
by hand, the meetings spent arguing about which figure is right, the analyst time
lost to cleaning the same spreadsheet. Automate and reconcile those, and the time
comes back every single month — a compounding return, not a one-off. The risk is
quieter but larger: decisions made on numbers that were subtly wrong, a figure
that went to the board incorrect for weeks, a churn rate distorted by unresolved
identity. You rarely see the cost of a bad decision on an invoice, which is
exactly why it is underweighted. So the strongest ROI case for analytics work is
usually reliability and automation before sophistication: make the existing
numbers trustworthy and the existing reports cheap to produce, and the return is
concrete and recurring. The advanced modelling can come next — but its ROI
depends entirely on the foundations being sound, because a confident answer built
on unreliable data is worse than no answer at all.

### Module 10 — Technical debt (in data)

Technical debt in a data stack is different from technical debt in application
code, and more insidious, because it hides inside numbers that still look
plausible. It accumulates as undocumented transformations in a spreadsheet only
one person understands, metrics redefined slightly differently in forty separate
queries, a soft text link standing in for a proper key between two systems, and
pipelines that fail silently rather than loudly. None of it throws an error. It
simply makes every future change riskier and every number a little harder to
trust, until a routine request — "can we add this one breakdown?" — turns into a
week of archaeology. The way out is the same as with any debt: stop adding to it,
then pay down the highest-interest parts first. Practically, that means writing
down metric definitions in one governed place, resolving identity once upstream
so it is not re-solved per report, replacing the fragile single-owner workbook
with tested logic, and adding checks that fail loudly so problems surface early
rather than in a board meeting. You do not fix it all at once; you inventory it,
score each item by impact and effort, and fix the foundational things first
because they make everything after them cheaper. The cost of ignoring data debt
is not a crash. It is a slow erosion of trust in the numbers, which is far harder
to win back than it was to lose.

---

## 5. Working notes for responding to requests

- **Relevance first.** Only respond where The Bredge has genuine, specific
  experience. A thoughtful decline is better than a stretched answer.
- **Lead with the insight, not the firm.** Journalists cut self-promotion. The
  quote earns the attribution.
- **Adapt, do not paste.** Reshape the opening of each module to the exact
  question; keep the substance. Identical text across outlets reads as canned.
- **Stay vendor-neutral.** Name a category (a semantic layer, a managed
  connector) rather than a product, unless the question is specifically about a
  named tool.
- **Attribute consistently:** "`[OWNER]`, founder of The Bredge" plus
  https://thebredge.com. Consistency helps the byline and the backlink.
- **Never fabricate.** If asked for a statistic The Bredge has not measured, say
  so and offer a qualitative observation. The approved-claims list in section 2
  is the boundary.
