# The Bredge — Unlinked-Mention Reclamation Runbook (brief §11)

Goal: find places on the web that already mention **The Bredge** (our data
engineering / analytics / BI consultancy) **without linking** to `thebredge.com`, and
politely ask for a link. This is one of the cleanest white-hat backlink plays: the
mention already exists and is editorially genuine — we are only requesting attribution.

**Critical caveat: "Bredge" is a shared name.** Several unrelated organisations use
"Bredge". We reclaim mentions of **our company only**. Claiming someone else's mention
is both dishonest and useless (it will not convert). The disambiguation section below is
mandatory before any outreach.

---

## 1. Who we are (the only entity we reclaim)

| Attribute | The Bredge (us) |
|---|---|
| Canonical name | **The Bredge** (with the definite article) |
| Domain | `thebredge.com` |
| What we do | Data engineering · analytics · business intelligence **consultancy** for growing / mid-market companies |
| Signals | mentions of our insight articles, reconciliation / data-quality / warehouse-readiness resources, our people, or the phrase "The Bredge" alongside data/BI/analytics consulting |
| LinkedIn | `linkedin.com/company/thebredge` |

## 2. Unrelated "Bredge" entities — DO NOT claim these

Verified via public company registries and their own sites (Aug 2026). If a mention
matches any of these, **skip it**.

| Entity | Domain / registry | Sector | Why it's not us |
|---|---|---|---|
| Bredge LLC | `bredgellc.com` | IT consulting / services (US) | Different legal entity, no "The", generic IT services |
| Bredge PLC | `bredgeplc.com` | Mobile banking, credit cards, mortgages, auto loans | Financial-services brand, unrelated |
| Bredge Info Systems Private Limited | thecompanycheck.com (Bangalore, India) | IT services (now struck off) | Indian entity, defunct |
| Bredge (web applications) | `linkedin.com/company/bredge` (Bangalore) | Software development (est. 2007) | No "The"; app-dev shop in India |
| BREDGE LIMITED | Companies House `14479135` (UK) | UK registered company | Unrelated legal entity |
| BREDGE LTD | Companies House `07507715` (UK) | UK registered company | Unrelated legal entity |
| BREDGE LIMITED | OpenCorporates `cy/HE213818` (Cyprus) | Cyprus registered company | Unrelated legal entity |

Also filter out near-miss brands: **Breedon Group** (building materials), **John
Bredenkamp**, and any "The Bridge" (design/consulting/charities) results the engine
"corrects" to.

## 3. Is this mention ours? — triage decision tree

For each hit, confirm **at least two** "yes" signals before treating it as ours:

1. Does the surrounding text mention **data engineering / analytics / BI / dashboards /
   data warehouse / reporting / data quality**? → likely us.
2. Does it link to, quote, or name one of **our** articles/resources (e.g.
   "why-dashboards-disagree", "revenue reconciliation checklist")? → almost certainly us.
3. Is the exact string **"The Bredge"** (with the article) used as the company name? →
   supports us (but bredgellc / bredgeplc sometimes drop/keep articles — check sector).
4. Is the sector **banking, generic IT services in India/US, building materials**? →
   NOT us; skip.
5. Is there a URL to `bredgellc.com`, `bredgeplc.com`, a Bangalore address, or a
   Companies House / OpenCorporates number matching §2? → NOT us; skip.

If still ambiguous after these, mark `status=unsure` and do **not** send outreach.

## 4. Exact search queries (run in incognito; log results)

Run weekly. These are read-only discovery queries — no scraping automation, no ToS
breach. Copy/paste as-is.

**Core brand (must co-occur with our topic to avoid the namesakes):**
```
"The Bredge" data
"The Bredge" analytics
"The Bredge" "business intelligence"
"The Bredge" (dashboards OR "data warehouse" OR reporting OR "data quality")
"The Bredge" consultancy
"The Bredge" -bredgellc -bredgeplc -banking -"building materials"
```

**Bare "Bredge" (higher noise — apply §3 triage hard):**
```
Bredge "data engineering"
Bredge "analytics engineering"
Bredge (dbt OR "Power BI" OR "data warehouse") -bredgellc -bredgeplc
```

**Find mentions that omit the link (site-scoped, per source that mentioned us):**
```
"The Bredge" -site:thebredge.com
"The Bredge" -site:thebredge.com -site:linkedin.com
```
The `-site:thebredge.com` exclusion surfaces third-party pages; scan each for whether an
actual `href` to thebredge.com exists (view source / Ctrl-F "thebredge.com").

**Content-asset mentions (people quote our resources without linking):**
```
"revenue reconciliation checklist" -site:thebredge.com
"data warehouse readiness" checklist -site:thebredge.com
"why dashboards disagree"
"one customer view" reconciliation
```

**Author / spokesperson mentions (if a Bredge person is named in a talk, podcast, panel):**
```
"[spokesperson name]" "The Bredge"
"[spokesperson name]" data engineering
```

**Platforms to also check manually (their own search):**
- Podcast show notes (the shows in `podcast-newsletter-prospects.md`) — many name the
  guest's company in text but forget the hyperlink.
- Slido / event agendas, meetup pages, conference speaker lists.
- Reddit / Hacker News / Lobsters threads (`site:news.ycombinator.com "The Bredge"`).
- Substack / Medium posts that reference our articles.
- Slide decks (`"The Bredge" filetype:pdf`).

## 5. Logging schema
Track in the operating sheet (mirror of `seo-backlinks-distribution.md`):

`date found | source URL | mention context (quote ≤15 words) | is-it-us? (yes/no/unsure) | link present? (none/nofollow/dofollow) | page owner + contact | status | outreach date | result | live link URL`

`status ∈ {found, ours-confirmed, not-ours, unsure, contacted, linked, declined}`.
Only rows `is-it-us?=yes` **and** `link present?=none` become outreach candidates.

## 6. Outreach template (genuine unlinked mentions of OUR company only)

Send only after §3 triage confirms it is us. One friendly, low-pressure ask. British
spelling. No pressure, no PBN language, no payment offer.

**Subject:** Thank you for mentioning The Bredge

> Hi [name],
>
> I came across your piece "[title]" ([URL]) — thank you for mentioning **The Bredge**
> in the section on [topic]. It's genuinely appreciated, and you captured [the point]
> well.
>
> One small thing: the mention isn't currently linked. If it's easy and you think it
> helps your readers, would you be open to linking "The Bredge" to
> **https://thebredge.com** (or directly to the article you referenced,
> https://thebredge.com/insights/[slug])? No worries at all if not — either way, thanks
> for the kind reference.
>
> Happy to answer anything on [topic] if it's ever useful for a future piece.
>
> Best,
> [Name] — The Bredge

**Rules for outreach:**
- One follow-up maximum, after ~7–10 days, only if no reply. Then stop.
- Never imply payment, link exchange, or obligation.
- If they decline or don't reply, mark `declined` and leave it — the mention still has
  brand value.
- If the mention is inaccurate or negative, do **not** demand a link; consider a polite
  correction only if factually wrong.
- Never contact the namesake companies in §2, even to "clarify" — not our place.

## 7. Quick disambiguation cheat-sheet (paste at top of the working sheet)
- ✅ Ours: "The Bredge" + data/analytics/BI/dashboards/warehouse/reporting → reclaim.
- ❌ Not ours: banking, mortgages, credit cards → **Bredge PLC**.
- ❌ Not ours: generic "IT consulting/services", Bangalore/India address → **Bredge LLC / Bredge Info Systems / Bredge web apps**.
- ❌ Not ours: bare Companies House / OpenCorporates entity with no data-consulting context → UK/Cyprus **BREDGE LIMITED/LTD**.
- ❌ Not ours: building materials → **Breedon Group**.
- ⚠️ "The Bridge" spelling-correction hits → almost never us; ignore unless the page clearly means our company.
