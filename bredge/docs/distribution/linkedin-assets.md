# LinkedIn distribution assets

Distribution assets for four Bredge Insights. Each asset stands alone — none is
a verbatim abstract of the article. Voice is calm, precise, practitioner-first,
buyer-facing, and free of sales pitch. Article links use
`https://thebredge.com/insights/<slug>` and appear only where a click is the
natural next step.

Insights covered:

1. Why dashboards disagree — `/insights/why-dashboards-disagree`
2. One customer view — `/insights/one-customer-view`
3. Is our data reliable? — `/insights/is-our-data-reliable`
4. When to hire a data team — `/insights/when-to-hire-a-data-team`

---

## 1. Why dashboards disagree

### Buyer-language LinkedIn post

Every month, the same meeting. Sales says revenue was one number. Finance says
another. The board pack says a third. An hour later, everyone agrees to "look
into it", and the gap reappears next month.

Here is the uncomfortable truth: none of those numbers is wrong. They disagree
because each system measures revenue differently — a different time window, a
different level of detail, a different idea of who the customer is, and a
different definition of the word itself.

That is why rebuilding the dashboard never fixes it. The chart just shows what
the query returns; the disagreement lives upstream.

The fix is not a better chart. It is one agreed definition per metric, owned by
a named person, plus a routine that reconciles your sources on records, not
totals — so a gap becomes a five-minute answer instead of a forty-minute
argument.

Full breakdown, with the four causes to check first: https://thebredge.com/insights/why-dashboards-disagree

### Carousel outline (6 slides)

1. **Cover** — "Three systems. Three revenue numbers. Nobody's lying." The
   meeting everyone recognises.
2. **The reflex that fails** — Why "rebuild the dashboard" wastes a quarter.
   The chart is a renderer; the cause is upstream.
3. **Cause 1 — Time** — Different windows, different refresh moments. Two clocks
   look like a bug.
4. **Cause 2 — Grain & identity** — Counting orders vs lines; one customer
   living as three accounts. Where double-counting hides.
5. **Cause 3 — Definition** — Booked vs recognised vs reported. The biggest gap
   is a decision nobody made, not a bug.
6. **What good looks like** — One owned definition per metric; reconcile on
   records; disagreements become information. (CTA: full guide on the site.)

### Diagnostic checklist — is this a definition problem or a data problem?

- Have you written the metric definition in one sentence, including entity,
  scope, and time window?
- Are both numbers pulled for the exact same window, in the same time zone?
- Have you compared the refresh timestamp of each source before suspecting the
  logic?
- Do you know the grain of each table — is one row an order, a line, or a
  customer?
- Are you comparing the underlying records, or just two totals?
- Can every pound of the gap be sorted into time, grain, identity, or
  definition?
- Does one named person own the canonical definition of this metric?

### Founder / team-member perspective post

I used to dread the monthly numbers meeting. Not because the data was bad —
because three systems each gave a slightly different answer and I couldn't say,
on the spot, which one to trust.

What changed things wasn't a new BI tool. It was learning to reconcile on
records instead of totals, and to sort every difference into one of four
buckets: time, grain, identity, definition. Once you can name the cause, the
argument ends.

The one that surprised me most was definition. Half our "data problems" were
actually the business quietly using four meanings of the word revenue and
asking software to reconcile what we'd never decided ourselves.

### Company-page post

When two dashboards disagree, the instinct is to blame the dashboard. It is
almost always the wrong place to look.

A chart only shows what its query returns. When numbers conflict, the cause sits
upstream — in the sources, the joins, and the definitions — and it resolves
along four axes: time, grain, identity, and definition.

We wrote a practical guide to finding the cause yourself, including the checks
to run before rebuilding anything: https://thebredge.com/insights/why-dashboards-disagree

---

## 2. One customer view

### Buyer-language LinkedIn post

Ask three teams how many customers you have and you will get three answers.
Sales counts accounts. Finance counts billing entities. Product counts logins.
None of them is wrong, and that is exactly the problem.

Without one agreed view of who the customer is, every number that depends on it
inherits the confusion. Churn looks worse or better than it is. Lifetime value
is guesswork. A "top customer" in one report is two mid-sized ones in another.

Building a single customer view is not a data-cleaning chore. It is deciding —
deliberately — when two records are the same real-world customer, then resolving
them to one canonical id that the whole business joins to.

It rarely solves itself, because the systems were never designed to share a key.
But it is very solvable, and it is usually the highest-leverage fix a data team
can make.

Where to start, and how to know when it needs to be a system: https://thebredge.com/insights/one-customer-view

### Carousel outline (7 slides)

1. **Cover** — "How many customers do you have?" Three teams, three answers.
2. **Why it matters** — Every per-customer metric (churn, LTV, concentration)
   inherits the ambiguity.
3. **The root cause** — Source systems mint their own keys; humans type names
   inconsistently. One company becomes many records.
4. **Step 1 — Normalise** — Case, whitespace, legal suffixes. Compare like with
   like before matching.
5. **Step 2 — Match on more than one signal** — Email, domain, fuzzy name.
   Never merge on a single field.
6. **Step 3 — One canonical id** — Pick a survivor deterministically; map every
   record to it; join everything to that.
7. **When it becomes a system** — Daily resolution, exception review, ownership.
   (CTA: full guide on the site.)

### Diagnostic checklist — do you have one customer view?

- Can you produce a single, agreed count of customers that every team accepts?
- Is there one canonical customer id that CRM, billing, and product all map to?
- When the same company appears twice, is there a rule that decides they are one?
- Do you match on more than one signal (email, domain, name), not just a single
  field?
- Are uncertain matches routed to a human review queue rather than merged
  automatically?
- Does any per-customer metric (churn, LTV, concentration) rely on an unresolved
  identity?
- Is one named person accountable for the resolution logic when it breaks?

### Founder / team-member perspective post

The moment it clicked for me: our "biggest customer" was actually three
accounts for the same company, opened by three different reps over two years.
Our second-biggest was a duplicate of the first.

Every dashboard downstream had quietly absorbed that error. Concentration risk,
churn, expansion revenue — all subtly wrong, and all confidently reported.

Resolving identity wasn't glamorous work. Normalise the fields, match on a few
signals, pick one canonical id, send the ambiguous cases to a human. But it
fixed more broken metrics in a week than any amount of dashboard polish had in a
year.

### Company-page post

A single customer view is one of the highest-leverage things a data team can
build — and one of the most commonly skipped.

When the same customer exists as several records across CRM, billing, and
product, every metric that counts customers inherits the ambiguity. The fix is
deliberate identity resolution: decide when two records are the same, then
resolve them to one canonical id the whole business shares.

Our practical guide, from normalisation to knowing when it needs to be a system:
https://thebredge.com/insights/one-customer-view

---

## 3. Is our data reliable?

### Buyer-language LinkedIn post

"Can we trust this number?" is a fair question, and "I think so" is not an
answer a board should accept.

Reliable data does not mean data that is never wrong. It means data whose state
you can prove at any time, and whose problems you find before your stakeholders
do. The difference between the two is a small set of checks that run close to
the data and fail loudly.

You can get a real answer in an afternoon, without new tooling. Pick the few
tables your decisions actually depend on, and test each one: are required
fields ever blank, do business keys repeat, do the values make sense, does every
child row have a parent, is it fresh enough for the decision it feeds, and does
it reconcile against an independent source?

Six checks and a named owner turn "we think it's fine" into "it passed, and
here is who watches it".

The full checklist, and when reliability needs to become a system: https://thebredge.com/insights/is-our-data-reliable

### Carousel outline (6 slides)

1. **Cover** — "Can we trust this number?" Why "I think so" isn't good enough.
2. **What reliable actually means** — Not never-wrong. Provable state, problems
   caught before stakeholders see them.
3. **The six checks** — Completeness, uniqueness, validity, referential
   integrity, freshness, reconciliation.
4. **Read the failure** — Each failing check points at a different cause and a
   different owner.
5. **Beyond a one-off pass** — Drift, business-rule tests, and observability:
   staying reliable, not just being reliable today.
6. **What good looks like** — Checks run automatically, fail loudly, live with
   the model, and have an owner. (CTA: full checklist on the site.)

### Diagnostic checklist — the six-check reliability test

- **Completeness** — Are required fields ever blank, and does the row count
  match what you expect for the period?
- **Uniqueness** — Group by the business key; does any key appear more than once?
- **Validity** — Are dates real, amounts sane, and statuses drawn only from the
  allowed set?
- **Referential integrity** — Does every child row (e.g. an order) point at a
  parent that exists?
- **Freshness** — Is the newest record recent enough for the decision it feeds?
- **Reconciliation** — Does it agree with an independent source at the record
  level, not just the total?
- **Ownership** — Is there one named person accountable when a check fails?

### Founder / team-member perspective post

For a long time our answer to "is the data reliable?" was a shrug and a hopeful
"should be". Then a number went out to the board that was quietly wrong for
three weeks, and the shrug stopped being acceptable.

What fixed it wasn't a platform. It was six checks, written as queries that
return rows only when something is broken, running on a schedule next to the
data. Empty result means we're fine. Any rows means someone looks.

The reassuring part: the first pass took an afternoon. The hard part was
deciding who owns each table when a check fails — because checks without an
owner quietly rot.

### Company-page post

"Reliable" is one of the most overused words in data, and one of the least
defined.

We take it to mean something specific: you can prove the state of your data at
any time, and you learn about problems before your stakeholders do. That comes
from a handful of checks — completeness, uniqueness, validity, referential
integrity, freshness, reconciliation — that run automatically and fail loudly.

Our practical guide to running them, starting this afternoon: https://thebredge.com/insights/is-our-data-reliable

---

## 4. When to hire a data team

### Buyer-language LinkedIn post

Most founders hire their first data person a little too late, and often hire the
wrong one first.

The usual instinct is to hire a senior data scientist because the future sounds
like machine learning. But if the numbers don't yet agree, no model will save
you — you will have hired a Formula 1 driver before you have built a road.

The honest sequence is duller and more valuable. First you need someone who can
make the plumbing reliable and the definitions consistent: the analytics
engineering and data engineering work. Clean, trustworthy, well-defined data is
the thing that makes everything after it — dashboards, forecasts, eventually
models — actually work.

So the real question is not "when do we hire a data scientist?" It is "what is
the first data problem that is costing us decisions?" — and that answer usually
points at reliability and definitions long before it points at algorithms.

The roles in plain English, and how the work sequences: https://thebredge.com/insights/when-to-hire-a-data-team

### Carousel outline (6 slides)

1. **Cover** — "Who is your first data hire?" (And why it's probably not who you
   think.)
2. **The common mistake** — Hiring for ML before the numbers agree. A driver
   before a road.
3. **The roles, plainly** — Analyst, analytics engineer, data engineer, data
   scientist — what each actually does.
4. **How the work sequences** — Reliable plumbing and agreed definitions come
   before models. Every time.
5. **When a hire isn't the answer** — Sometimes it's a definition decision or a
   fractional team, not a full-time head.
6. **The right first question** — Not "when do we hire?" but "what decision is
   our data currently costing us?" (CTA: full guide on the site.)

### Diagnostic checklist — are you ready to hire, and for what?

- Do your core numbers currently agree across systems, or is reconciliation a
  monthly fire drill?
- Is anyone spending a day a week manually preparing the same report?
- Do you have agreed, written definitions for your key metrics?
- Is the immediate pain about trust and plumbing, or genuinely about advanced
  modelling?
- Would a fractional or embedded team solve the next six months better than a
  full-time hire?
- Is there enough clean, well-defined data for the role you're tempted to hire
  to even do their job?
- Do you know which single data problem is currently costing you the most
  decisions?

### Founder / team-member perspective post

The best data hiring advice I ever got was a question: "What decision is your
data currently costing you?"

We were about to post a job for a data scientist. That question stopped us. The
honest answer was that our numbers didn't agree and nobody trusted the
dashboard — a plumbing-and-definitions problem, not a modelling one. A data
scientist would have spent their first year fixing pipes they didn't sign up to
fix, and left.

We hired for the reliability problem first. It was less glamorous on paper and
far more valuable in practice. The modelling ambitions are still there — they
just have a road to drive on now.

### Company-page post

The first data hire is one of the most consequential — and most commonly
mis-sequenced — decisions a growing company makes.

The instinct is to hire for the future: machine learning, forecasting, data
science. But models are only as good as the data underneath them, and if the
numbers don't yet agree, reliability and definitions have to come first.

Our guide to the roles in plain English, and the order the work actually needs
to happen in: https://thebredge.com/insights/when-to-hire-a-data-team
