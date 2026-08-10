# Locally Optimistic — guest post pitch

**Proposed title:** "Your metric isn't wrong. Your organisation has four definitions of revenue."

**Format:** Guest post, ~1,400 words, practitioner narrative with one worked
example. Vendor-neutral, no product references, synthetic data throughout.

---

## The pitch email

**Subject:** Pitch — "Your metric isn't wrong. Your org has four definitions of revenue."

Hi Locally Optimistic team,

I'd like to pitch a guest post for the community. It's the piece I wish someone
had handed me the first time I got pulled into a "why don't these numbers
match?" meeting.

The premise: most metric disagreements that land on a data team's desk are
diagnosed as data quality problems, when they're actually *definition*
problems. Sales counts revenue at signature, finance recognises it over the
term, the board reports a figure that excludes intercompany trade, and product
counts anything that touched a paid plan. Four honest definitions, one word,
and a data team asked to reconcile what the business never did. You can't clean
your way out of that — no amount of dbt tests will make two different
quantities equal — and I think our discipline under-talks the organisational
half of the problem because the technical half is more fun to solve.

The post argues that a data practitioner's most valuable move in these moments
isn't a better model; it's facilitating the definitional decision and then
encoding it once, in the open, where everyone can see it. It's practical and
opinionated, but it's not a tool pitch — there's no product in it, and the code
is illustrative Postgres, not a framework to adopt.

I write from the consulting side (I'm with a small data engineering practice
called The Bredge), so I've watched this pattern across a lot of teams, which I
think gives the examples some range. Happy to write to your house style, and of
course everything would be original to Locally Optimistic rather than
cross-posted.

Rough outline below. Would this land for your readers?

Thanks for considering it,
[Name]

---

## The five-point outline

**1. The meeting nobody wins.**
Open in the room: three screens, three revenue numbers, a slow silence. Frame
the reflex to blame the dashboard or the data team, and name the real question
early — not "which number is right?" but "how many different things are we
calling revenue?" Set the thesis: this is usually an organisational problem
wearing a technical costume.

**2. Four definitions, all defensible.**
Walk through how revenue legitimately means four different quantities across
sales, finance, the board, and product — booked vs recognised vs reported vs
usage-based. The point is that none of them is an error; they answer different
questions. A data team that treats this as "dirty data" will spend a quarter
cleaning and end up back in the same meeting.

**3. Reconciliation is a decomposition, not a fix.**
Introduce the working discipline: reconcile on time, grain, identity, and
definition; work from records, not totals; and consider it finished when every
pound of the gap has a reason, not when the gap is small. One short worked
example with synthetic figures, showing a gap fully explained rather than
forced to zero.

**4. The practitioner's real job here.**
The most valuable thing the data person does in this situation is not modelling
— it's facilitating a decision the business has been avoiding: which definition
is canonical for which audience, and who owns it. Then encoding that decision
once, in a governed semantic layer, in plain language, so it stops drifting.
Separate cleanly what's an engineering bug (a duplicate customer, a fan-out
join) from what's a governance gap (an unmade decision).

**5. What "solved" actually looks like.**
Not one number everywhere — systems built for different jobs *should* differ.
Solved means every figure is explainable, traceable, and owned; disagreements
become information ("these two definitions diverged, here's where") instead of
crises. Close on the mindset shift: the metric was never wrong; the
organisation simply had more than one of it, and the data team's job was to make
that visible and decidable.
