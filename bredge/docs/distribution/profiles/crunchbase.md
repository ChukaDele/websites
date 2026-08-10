# Profile pack — Crunchbase

> **Brief §8.** Owner action = sign in → paste → upload → submit. All copy is
> canonical from `docs/seo-entity.md` — paste verbatim, do not reword.
> **The name is `The Bredge`.** If any field auto-corrects to "The Bridge", fix it.
> Fields marked **OWNER TO CONFIRM** stay blank until the owner supplies a verified value.

## At a glance
| Field | Value |
|---|---|
| Signup / listing URL | https://www.crunchbase.com/register → then "Add a Company" / claim organisation |
| Is it free? | **Yes** — creating/editing an organisation profile is free (Crunchbase Pro is paid and **not** needed) |
| Required account type | Personal Crunchbase account, then create/claim the **Organization** profile |
| Type of platform | Company/entity database (feeds knowledge graphs, data brokers, AI) |
| Backlink | **nofollow** (org website links are nofollow) — value is entity/knowledge-graph, not link equity |
| Reviews required? | No (not a review platform) |
| Editorial review? | Light — new orgs may be queued for moderation; keep claims factual |
| Priority | **1** (highest entity value; strong `sameAs` and knowledge-graph signal) |

## Exact fields to paste
- **Company name:** The Bredge
- **Legal name:** The Bredge, LLC
- **Website:** https://thebredge.com
- **Contact email:** hello@thebredge.com
- **Tagline / short description (paste the canonical SHORT, 191 chars):**
  > The Bredge is a data engineering, analytics and business intelligence partner for growing and mid-market companies — reliable data foundations, automated reporting, decisions teams can trust.
- **Full description (paste the canonical LONG, 829 chars):** use the LONG block from `seo-entity.md` verbatim.
- **Industries / categories (Crunchbase tags — pick from their taxonomy):**
  recommended: **Analytics · Business Intelligence · Data Integration · Consulting · Information Services · Big Data · Information Technology**
- **Founded:** OWNER TO CONFIRM
- **Company size / headcount range:** OWNER TO CONFIRM
- **Headquarters location:** OWNER TO CONFIRM
- **Operating status:** Active

## Assets
- **Logo:** https://thebredge.com/brand/bredge-logo.svg (Crunchbase may require PNG — export a square PNG ≥400×400 from the SVG if the uploader rejects SVG). Cover: not required.
- **Social links to add:** LinkedIn company page (once live), GitHub org (once live), thebredge.com.

## Portfolio / funding strategy
- Crunchbase surfaces funding. The Bredge is presumably bootstrapped — **leave
  funding blank** unless the owner wants to state it. Do not invent rounds/investors.
- Add named team members only with their consent (OWNER TO CONFIRM).

## Step-by-step (owner)
1. Sign in / register at https://www.crunchbase.com/register.
2. Search "The Bredge" — if an auto-generated stub exists, **claim** it; else "Add a Company".
3. Paste name `The Bredge`, legal name `The Bredge, LLC`, website `https://thebredge.com`, email `hello@thebredge.com`.
4. Paste the SHORT tagline and LONG description (from `seo-entity.md`).
5. Add industries (list above); set Operating status = Active.
6. Upload the logo (PNG if SVG rejected).
7. Fill Founded / HQ / size **only** with confirmed values; otherwise leave blank.
8. Save/submit. Once the profile is **live**, add its URL to the `sameAs` register in `seo-entity.md` and to `seo-backlinks-distribution.md` (status=live).
