# The Bredge — Data Engineering Weekly submission package

A submission package for [Data Engineering Weekly](https://www.dataengineeringweekly.com),
Ananth Packkildurai's curated newsletter for data engineers. DEW is strictly
vendor-neutral and curates a small number of genuinely useful technical pieces
each week, so the asset must earn its place on technical merit, not marketing.

Canonical name **The Bredge**. British spelling. `[OWNER]` marks the founder's
details to fill in.

---

## Chosen asset

**A PostgreSQL Pattern for Reconciling Customer Identity Across Source Systems**

This is the strongest vendor-neutral technical asset in the current set. It is a
self-contained, runnable walk-through of identity resolution in stock
PostgreSQL — CTEs, a recursive transitive closure, `ROW_NUMBER()` for survivor
selection, and an exception-quarantine step — on entirely synthetic data. There
is no product, no platform and nothing to buy: exactly the shape DEW curates.

The draft lives at
`docs/distribution/dzone-postgres-identity-reconciliation.md` in this repo and
maps to the client-voiced Insight at
`https://thebredge.com/insights/one-customer-view`.

### Why this asset over the alternatives

- **vs. "Why dashboards disagree"** — that piece is excellent but more
  conceptual (the four axes of reconciliation). DEW's core audience rewards a
  concrete, runnable pattern over a framing essay.
- **vs. the reliability-checks concept** — strong, but the identity piece is the
  sharper single technical idea with a complete, copyable implementation.
- The identity article is unambiguously **vendor-neutral** (stock Postgres,
  `pg_trgm`, no managed service), which is DEW's hard requirement, and it solves
  a problem nearly every data engineer has hit: one company living as several
  records across systems.

### Supporting linkable asset

Pair the submission with the open-source repo it belongs to — **Bredge Data
Reliability Checks** (MIT, synthetic data, SQL + dbt tests), built under
`oss/data-reliability-checks/` and destined for the Bredge GitHub org. The
identity pattern is one of the checks (`sql/duplicate_identity.sql`), so the
article and the repo reinforce each other. If DEW prefers to feature a tool over
an article, the repo is a legitimate standalone submission in its own right.

---

## Submission title

> A PostgreSQL Pattern for Reconciling Customer Identity Across Source Systems

Alternative, if a shorter headline is wanted:

> Resolving Customer Identity Across Systems in Plain PostgreSQL

## URL

The submission link must be a **live, public page** at the moment the pull
request is opened. Options, in order of preference:

1. **The Bredge-owned public page** — publish the technical article on
   thebredge.com (as a technical companion to `/insights/one-customer-view`) so
   The Bredge owns the canonical URL. Preferred, because it does not depend on a
   third party accepting the piece first.
2. **DZone** — the same draft is queued for DZone
   (`docs/distribution/dzone-postgres-identity-reconciliation.md`); once live,
   its DZone URL is a valid submission link. If both go live, set the canonical
   link on the DZone copy to the Bredge-owned page.

`[LIVE URL — fill in once the article is published]`

## One-sentence value

> A dependency-light pattern for resolving customer identity across source
> systems in stock PostgreSQL — normalise, match on multiple signals, cluster
> with a recursive closure, choose a canonical id, and quarantine the uncertain
> cases — with no MDM platform required.

## Technical summary (for the DEW entry / PR body)

Most reporting disagreements that look like a maths problem are really an
identity problem: one company exists as several accounts across CRM and billing
because the systems were never designed to share a key. This article resolves
that in plain PostgreSQL. It normalises names and emails so cosmetic differences
do not defeat matching; proposes candidate pairs from more than one signal (exact
email, or shared domain plus trigram name similarity via `pg_trgm`); computes
the transitive closure with a recursive CTE so indirectly-linked records land in
one cluster; selects a deterministic canonical survivor with `ROW_NUMBER()` and
`FIRST_VALUE()`; and — the part that keeps it honest — routes ambiguous matches
to an exceptions table for human review rather than merging them automatically.
Two assertion queries verify referential integrity of the resulting crosswalk.
All data is synthetic; the code runs on stock Postgres with `pg_trgm`.

## Why readers care

Identity resolution is usually discussed as an enterprise MDM purchase, which
puts it out of reach for the growing-company data engineer who has exactly this
problem and no budget for a platform. This piece shows the whole pattern in SQL
they already know, with the trade-offs made explicit — why to match on more than
one signal, why the closure must be transitive, why the uncertain cases must be
quarantined rather than merged. It is copy-adaptable, it names its assumptions
(the similarity threshold is a tunable starting point, not a law), and it ends
with the integrity checks most tutorials skip. It respects the reader's time and
leaves them with something they can run on Monday.

---

## Current public submission route (verified August 2026)

DEW takes contributions primarily through **GitHub pull requests**, with an
email route for op-ed proposals.

- **Primary — GitHub PR.** Open a pull request against
  `https://github.com/ananthdurai/dataengineeringweekly`, adding the article
  under the current **weekly folder**. Per the repo's contributing guidance, the
  entry is YAML metadata: author name, LinkedIn, Twitter/X, the article link,
  tags, and optional review/reviewer notes. The maintainer's stated rule is
  simple: *"open a pull request with the article title under the weekly folder."*
- **Op-ed proposals — email.** For an opinion/analysis piece rather than a
  curated link, email **ananth@dataengineeringweekly.com** with a short
  proposal.
- **Informal nudge.** The maintainer also invites tagging **@data_weekly** on
  X/Twitter for suggestions.

### Hard constraints DEW enforces

- **No vendor-promotional articles.** Contributions must be "directly related to
  data engineering and adjacent fields" and free of product promotion. The
  chosen asset complies: attribution to The Bredge in a footer is fine;
  promotion is not, and there is none.
- **Quality over quantity, at the editor's discretion.** Submissions may be
  accepted or rejected without explanation, and contributions are voluntary and
  unpaid. Submit the one strongest piece; do not batch.

### Owner action checklist

1. Publish the technical article at a live, public, Bredge-owned URL (preferred)
   and/or confirm the DZone URL is live.
2. Fork `ananthdurai/dataengineeringweekly`, add the entry under the current
   weekly folder with the YAML metadata above, using `[OWNER]`'s real name,
   LinkedIn (`[OWNER LinkedIn URL]`) and X handle.
3. Keep the PR to this single asset; write the description in the newsletter's
   plain, review-with-empathy register.
4. Open the PR; optionally tag @data_weekly. Do not chase — acceptance is at the
   editor's discretion.
