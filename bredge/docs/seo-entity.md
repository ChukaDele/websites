# The Bredge — Canonical Entity (SEO source of truth)

> **Brief §7.** This is the single canonical external identity file. Every
> directory profile, review site, social bio, press mention and structured-data
> block copies from here **verbatim**. Zero wording drift.
>
> **Name rule (hard):** the canonical name is **exactly `The Bredge`** — never
> "The Bridge", "Bredge Data", "Bredge Analytics" or "Bredge, LLC" used as the
> display name. If a form auto-corrects "Bredge" → "Bridge", fix it before
> submitting.
>
> Any field marked **OWNER TO CONFIRM** must not be invented. Leave it blank on a
> profile until the owner supplies the verified value, then update it here first.

---

## Core identity

| Field | Canonical value |
|---|---|
| **NAME** (display) | The Bredge |
| **LEGAL NAME** | The Bredge, LLC |
| **Alternate name** (only where a field demands one) | Bredge |
| **URL** (canonical) | https://thebredge.com |
| **CATEGORY** | Data Engineering · Analytics · Business Intelligence |
| **CONTACT URL** | https://thebredge.com/contact |
| **SCHEDULE URL** | https://thebredge.com/schedule |
| **CONTACT EMAIL** | hello@thebredge.com |
| **LOGO URL** | https://thebredge.com/brand/bredge-logo.svg |
| **SOCIAL SHARE IMAGE** (OG) | https://thebredge.com/og.png (1200×630) |

The name, legal name, URL, logo, OG image and email above match the deployed
`Organization` JSON-LD in the site `<head>` — keep them identical. Contact email
`hello@thebredge.com` is the address published in that structured data.

---

## Descriptions (copy verbatim — exact character counts)

Use the smallest description that fits the field. Do not paraphrase, reorder or
"improve" — profile-to-profile consistency is the entire point.

### SHORT — 191 characters

> The Bredge is a data engineering, analytics and business intelligence partner for growing and mid-market companies — reliable data foundations, automated reporting, decisions teams can trust.

**Note on length:** this canonical SHORT is 191 characters. Most directory
"short description / tagline" fields (200–300 chars) accept it as-is. For an HTML
`<meta name="description">` (SERP truncation ~155–160 chars) do **not** trim this
string ad-hoc — the site already ships purpose-written, unique page-level meta
descriptions per URL (see `seo-keyword-system.md`). Keep those two jobs separate:
this SHORT is the **identity/tagline** string; page metas are the **on-page SEO**
strings.

### MEDIUM — 328 characters

> The Bredge is a data engineering, analytics and business intelligence partner. We help growing and mid-market companies connect fragmented systems, build reliable data foundations, automate reporting and turn complex data into answers teams can act on — through an embedded data team, a defined project, or a focused diagnostic.

### LONG — 829 characters

> The Bredge is a data engineering, analytics and business intelligence partner. We help growing and mid-market companies connect fragmented systems, build reliable data foundations, automate reporting and turn complex data into answers teams can act on. Mid-market teams often run on data spread across CRMs, billing, spreadsheets and product systems, where numbers disagree and reporting eats days each month. The Bredge fixes the layer underneath: dependable pipelines, a clean model, tested data quality and reporting that reconciles. Companies work with us as an embedded, fractional data team; as a defined data project with a clear scope and outcome; or through a Data Diagnostic that maps the current environment and prioritises the highest-value next steps. The result is a data foundation leaders can trust for decisions.

---

## Specialties (canonical order — copy as needed)

Use these exact terms. Where a profile caps the count, take from the top.

1. Data engineering
2. Analytics engineering
3. Business intelligence
4. Power BI
5. Data quality
6. Data reconciliation
7. Reporting automation
8. Data warehousing
9. Embedded / fractional data teams
10. Data diagnostics

Extended `knowsAbout` terms (already in the site JSON-LD, use only where a
platform wants many keywords): data governance, PostgreSQL, Python, SQL,
data reliability, single customer view.

---

## Services (canonical names + one-line each + owner URL)

The site offers **three engagement models**, plus the diagnostic entry point.

| Service (canonical name) | One-liner | Owner URL |
|---|---|---|
| Embedded Data Team | An ongoing senior data capability across engineering, analytics and BI for companies that need consistent progress without hiring every role internally. | https://thebredge.com/services/embedded-data-team |
| Data Projects | Defined-scope delivery of data pipelines, warehouses, models, BI, reporting, reconciliation and automation. | https://thebredge.com/services/data-projects |
| Data Diagnostic | A mapped assessment of the current data environment that prioritises the changes most likely to improve decision-making. | https://thebredge.com/data-diagnostic |
| Services overview (hub) | Everything we do, from source to decision. | https://thebredge.com/services |

---

## Industries served

Sector-agnostic; positioned for **growing and mid-market companies**. Do not
claim named-client sectors on public profiles until the owner confirms
references. Safe general framing: SaaS / technology, financial services and
fintech, professional services, e-commerce and retail, healthcare-adjacent
operations. **OWNER TO CONFIRM** which sectors to feature publicly.

---

## Facts requiring verification — do NOT invent

These are demanded by most directory profiles. Leave blank until confirmed.

| Field | Value |
|---|---|
| Founded / year established | **OWNER TO CONFIRM** |
| Company size / headcount | **OWNER TO CONFIRM** |
| Headquarters / location(s) | **OWNER TO CONFIRM** |
| Service areas / countries | **OWNER TO CONFIRM** |
| Hourly rate / min project size | **OWNER TO CONFIRM** (many B2B directories require a band) |
| Phone number | **OWNER TO CONFIRM** (email `hello@thebredge.com` is public) |
| Registered address (LLC) | **OWNER TO CONFIRM** |

---

## Social / profile links (`sameAs`)

`sameAs` in the Organization JSON-LD is added **only after** a profile is verified
live (see `seo-backlinks-distribution.md`). Maintain the live list here as the
canonical register:

| Platform | Status | Live URL |
|---|---|---|
| LinkedIn (company) | OWNER TO CONFIRM / claim | — |
| Crunchbase | planned | — |
| GitHub (org) | planned | — |
| _(others as they go live)_ | — | — |

---

## Voice + do-not list (protects the entity from drift)

- British spelling everywhere (organise, optimise, prioritise, centre).
- Never: "The Bridge", "Bredge Data", "Bredge Analytics", "Bredge Consulting Ltd".
- Never claim awards, certifications, partner tiers, client names, revenue,
  headcount or founding year that the owner has not confirmed.
- Sector claims stay general until references are confirmed.
- When a platform forces a single primary category, choose the data
  engineering / analytics / BI option closest to the platform's taxonomy — see
  each profile pack in `distribution/profiles/`.
