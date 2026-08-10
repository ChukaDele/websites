# The Bredge — Keyword System (operational)

> **Brief §3.** The operating keyword system. One **owner URL per cluster** — no
> cannibalisation, no thin duplicate exact-match pages. Short-tail commercial
> intent lives on the four commercial pages; long-tail problem intent lives on the
> ten Insights articles. This file supersedes the summary in
> `seo-keyword-map.md` as the operational record (that file remains the quick
> one-page map).
>
> Canonical entity + descriptions: see `seo-entity.md` (single source of truth).
> Titles / H1 / meta below are recorded **as currently deployed** (best-effort,
> read from the codebase on 2026-08-10). Treat them as the live baseline to audit
> against, not as targets to rewrite blindly.

## Legend

- **Intent:** `INF` informational · `COM` commercial investigation · `TXN` transactional (contact/schedule).
- **Funnel:** `TOFU` problem-aware · `MOFU` solution-aware / consideration · `BOFU` vendor-aware / decision.
- **Status:** `live-tune` (page live, editorial tune only) · `gap` (intent under-served on-page) · `monitor` (no dedicated page; watch demand) · `watch-cannib` (intra-site overlap to police).
- **Link value note:** directory/back-link work is tracked in `seo-backlinks-distribution.md`; this file tracks **internal** links only.

## Baseline internal linking (applies to every cluster)

- **Sitewide nav (every page):** `/services` (+ dropdown to `/services/embedded-data-team`, `/services/data-projects`, `/data-diagnostic`), `/how-we-work`, `/insights`, `/about`, `/schedule` (header CTA), footer `/contact` `/privacy` `/cookies` `/terms`. So every commercial page carries a sitewide inbound link; the four commercial pages are one nav-click from anywhere.
- **Insights index (`/insights`):** card grid links to all ten articles → every article gets one inbound index link plus the sitewide "Insights" nav link.
- **Article → commercial:** each article carries exactly one contextual "service" link (the money link) plus a two-item "related" widget to sibling articles. These are the deliberate equity flows recorded per cluster below.

---

# Section A — Short-tail commercial clusters

Four owner pages carry twelve commercial clusters. The **anti-cannibalisation
rule**: `/services` owns the broad *advisory/partner* head terms; `/services/data-projects`
owns *defined-build/delivery* terms; `/services/embedded-data-team` owns *team-model*
terms; `/data-diagnostic` owns *assessment/quality* terms. A term appears as a
title/H1 target on **one** page only; elsewhere it may appear as a body mention.

---

## A1 · data engineering consulting
- **Primary keyword:** data engineering consulting
- **Secondary variants:** data engineering partner, data engineering services, data engineering company, data pipeline consulting
- **Buyer-language variants:** "help connecting our data", "someone to fix our data setup", "data engineer for hire", "sort out our data plumbing"
- **AI / conversational variants:** "what does a data engineering consultancy actually do", "should we hire a data engineering firm or build in-house", "best data engineering partner for a mid-market company"
- **Intent / funnel:** COM · MOFU
- **Owner URL:** https://thebredge.com/services
- **Current title:** `Data Engineering, Analytics & BI Services | The Bredge`
- **Current H1:** `From messy source systems to decisions your team can trust.`
- **Current meta:** `Connect fragmented data, build reliable foundations and automate reporting — data engineering, analytics and BI for growing and mid-market companies.`
- **Internal links in:** sitewide nav ("Services overview"); homepage hero/section links.
- **Internal links out:** `/services/embedded-data-team`, `/services/data-projects`, `/data-diagnostic`, `/schedule`.
- **Content gap:** hub does **not** link down to any Insights article — no supporting-content flow from the head page. First paragraph should name "data engineering, analytics and business intelligence" once, naturally.
- **SERP feature opportunity:** Organization knowledge panel (entity consistency), People Also Ask, local pack *only if* a location is confirmed (see `seo-entity.md`).
- **Status:** `live-tune`

## A2 · data analytics consulting
- **Primary keyword:** data analytics consulting
- **Secondary variants:** analytics consulting, analytics consultancy, data analytics services, analytics partner
- **Buyer-language variants:** "help making sense of our data", "turn our data into insight", "we have data but no answers"
- **AI / conversational variants:** "difference between data analytics consulting and BI consulting", "do we need an analytics consultant or a BI tool"
- **Intent / funnel:** COM · MOFU
- **Owner URL:** https://thebredge.com/services (shared hub with A1/A3 — consolidated, not duplicated)
- **Current title / H1 / meta:** as A1 (same page).
- **Internal links in:** sitewide nav; homepage.
- **Internal links out:** as A1.
- **Content gap:** "analytics" appears in title but the hub must carry an "analytics" body section distinct from "BI" so all three head terms are supported on one page without a thin split-out.
- **SERP feature opportunity:** PAA, featured snippet (definition of analytics consulting).
- **Status:** `live-tune`

## A3 · business intelligence consulting
- **Primary keyword:** business intelligence consulting
- **Secondary variants:** BI consulting, BI consultancy, business intelligence services, reporting layer / dashboard consulting
- **Buyer-language variants:** "we need better dashboards", "our reporting is a mess", "help with our BI"
- **AI / conversational variants:** "what should a BI consultant deliver", "BI consulting vs buying Power BI licences"
- **Intent / funnel:** COM · MOFU
- **Owner URL:** https://thebredge.com/services (shared hub)
- **Current title / H1 / meta:** as A1.
- **Internal links in:** sitewide nav; homepage.
- **Internal links out:** as A1.
- **Content gap:** BI intent leans on the Power BI articles for depth, but the hub does not link to them — add contextual links to `/insights/power-bi-slow` and `/insights/power-bi-warehouse-or-both`.
- **SERP feature opportunity:** PAA, featured snippet, image results from article diagrams.
- **Status:** `live-tune`

## A4 · Power BI consulting
- **Primary keyword:** Power BI consulting
- **Secondary variants:** Power BI consultant, Power BI experts, Power BI performance tuning, Power BI report development, Power BI + data warehouse
- **Buyer-language variants:** "our Power BI is slow", "fix our Power BI model", "someone who knows Power BI properly"
- **AI / conversational variants:** "why is our Power BI slow and who fixes it", "do we need a Power BI consultant or a data engineer"
- **Intent / funnel:** COM · MOFU
- **Owner URL:** https://thebredge.com/services (commercial owner) — **supporting** long-tail: `/insights/power-bi-slow`, `/insights/power-bi-warehouse-or-both`
- **Current title / H1 / meta:** as A1 (Power BI intent currently rides the hub).
- **Internal links in:** sitewide nav; the two Power BI articles' body/service links point to `/services/data-projects`, not to a Power BI page.
- **Internal links out:** as A1.
- **Content gap (notable):** there is **no dedicated Power BI commercial page**; Power BI consulting shares the general services hub. The two Power BI articles are the depth. If Power BI commercial demand grows, the fix is a Power BI section/anchor on `/services` (or a future `/services/power-bi`) — **not** a thin exact-match page. Monitor GSC for "power bi consultant/expert" impressions on `/services`.
- **SERP feature opportunity:** PAA, featured snippet (Power BI questions), strong AEO/AI-answer potential via the two articles.
- **Status:** `monitor`

## A5 · fractional data team
- **Primary keyword:** fractional data team
- **Secondary variants:** fractional data engineer, fractional analytics team, part-time data team, fractional head of data
- **Buyer-language variants:** "we can't afford a full data team", "we need data help but not a full-time hire", "data team on demand"
- **AI / conversational variants:** "what is a fractional data team", "fractional vs full-time data hire for a growing company"
- **Intent / funnel:** COM · MOFU→BOFU
- **Owner URL:** https://thebredge.com/services/embedded-data-team (consolidated with A6 — one page owns both sibling terms; **embedded** is the H1 term, **fractional** the folded variant)
- **Current title:** `Embedded & Fractional Data Teams | The Bredge`
- **Current H1:** `Your data team, without building one from scratch.`
- **Current meta:** `Plug an experienced data team into your business without hiring every role internally. Data engineering, analytics, BI and ongoing data operations from The Bredge.`
- **Internal links in:** sitewide nav; article `/insights/when-to-hire-a-data-team` (service link).
- **Internal links out:** `/how-we-work`, `/schedule` (×2).
- **Content gap:** only **one** inbound article link and no outbound link to a supporting article — add a reciprocal contextual link to `/insights/when-to-hire-a-data-team`.
- **SERP feature opportunity:** featured snippet (definition "what is a fractional data team"), PAA.
- **Status:** `gap` (thin inbound/outbound linking) + `live-tune`

## A6 · embedded data team
- **Primary keyword:** embedded data team
- **Secondary variants:** outsourced data team, dedicated data team, data team as a service, ongoing data operations
- **Buyer-language variants:** "a data team that works like ours", "consistent data progress without hiring", "an expert data team we can plug in"
- **AI / conversational variants:** "embedded vs fractional vs outsourced data team", "how does an embedded data team work"
- **Intent / funnel:** COM · MOFU→BOFU
- **Owner URL:** https://thebredge.com/services/embedded-data-team (primary term for this page)
- **Current title / H1 / meta:** as A5 (same page).
- **Internal links in:** as A5.
- **Internal links out:** as A5.
- **Content gap:** ensure "embedded data team", "outsourced" and "fractional" all appear naturally so the single page can rank the sibling cluster without a duplicate page.
- **SERP feature opportunity:** PAA, comparison featured snippet (embedded vs in-house).
- **Status:** `live-tune`

## A7 · data quality consulting
- **Primary keyword:** data quality consulting
- **Secondary variants:** data quality assessment, data reliability consulting, data quality services, data health check
- **Buyer-language variants:** "can we trust our data", "our numbers keep being wrong", "check whether our data is any good"
- **AI / conversational variants:** "how do I get my company's data quality assessed", "what does a data quality audit involve"
- **Intent / funnel:** COM · MOFU (entry offer)
- **Owner URL:** https://thebredge.com/data-diagnostic
- **Current title:** `Data Diagnostic & Analytics Audit | The Bredge`
- **Current H1:** `Know something is wrong. Not sure what to fix first?`
- **Current meta:** `A focused review of your data systems, reporting, metrics and workflows to identify reliability gaps, bottlenecks and the highest-value next steps.`
- **Internal links in:** sitewide nav; `/services` and `/services/data-projects` (body links); homepage; articles `/insights/what-to-fix-first` and `/insights/is-our-data-reliable` (service links).
- **Internal links out:** `/services/data-projects`, `/contact?intent=diagnostic` (×2).
- **Content gap:** "data quality" as a phrase is thin in title/meta (leads with "diagnostic/audit"); add a "data quality / reliability" line so the quality query has an on-page anchor. Supported well by `/insights/is-our-data-reliable`.
- **SERP feature opportunity:** featured snippet (data-quality checklist), PAA; the resource `/resources/data-quality-checklist` is a snippet asset.
- **Status:** `live-tune`

## A8 · data reconciliation services
- **Primary keyword:** data reconciliation services
- **Secondary variants:** revenue reconciliation, CRM/billing reconciliation, identity resolution, single customer view build
- **Buyer-language variants:** "our systems don't agree", "finance and CRM numbers don't match", "reconcile our billing and CRM"
- **AI / conversational variants:** "how do you reconcile data across CRM and billing", "who fixes mismatched revenue numbers between systems"
- **Intent / funnel:** COM · MOFU
- **Owner URL:** https://thebredge.com/services/data-projects
- **Current title:** `Data Engineering & Analytics Projects | The Bredge`
- **Current H1:** `One problem. The right team. Delivered, not just advised.`
- **Current meta:** `Bring The Bredge a defined data problem. We deliver data engineering, analytics, BI, automation and reporting projects from problem to working solution.`
- **Internal links in:** sitewide nav; seven articles' service links (see A9/A10); `/services`, `/data-diagnostic`, homepage.
- **Internal links out:** `/data-diagnostic`, `/schedule` (×2).
- **Content gap:** "reconciliation" is **not** in the title/meta though it is a core specialty; reconciliation intent currently relies on articles `why-dashboards-disagree` + `one-customer-view`. Surface "reconciliation / single customer view" as a named project type on the page.
- **SERP feature opportunity:** PAA, featured snippet; article-driven AEO answers.
- **Status:** `gap` (specialty not surfaced on owner page)

## A9 · data warehouse consulting
- **Primary keyword:** data warehouse consulting
- **Secondary variants:** data warehouse build, warehouse implementation, modern data stack setup, data warehouse migration
- **Buyer-language variants:** "do we need a data warehouse", "build us a data warehouse", "our data is too spread out"
- **AI / conversational variants:** "should a mid-market company build a data warehouse", "how much does a data warehouse build cost"
- **Intent / funnel:** COM · MOFU
- **Owner URL:** https://thebredge.com/services/data-projects
- **Current title / H1 / meta:** as A8 (same page).
- **Internal links in:** sitewide nav; articles `before-you-build-a-data-warehouse` + `power-bi-warehouse-or-both` (service links) support this intent.
- **Internal links out:** as A8.
- **Content gap:** "data warehouse" is absent from title/H1/meta; the two warehouse articles carry the informational demand. Add "data warehouse builds" as a named project type on `/services/data-projects`.
- **SERP feature opportunity:** PAA, featured snippet (readiness checklist), comparison snippets.
- **Status:** `gap`

## A10 · reporting automation
- **Primary keyword:** reporting automation
- **Secondary variants:** automate management reporting, automated board reporting, month-end reporting automation, report automation services
- **Buyer-language variants:** "stop rebuilding the same report", "automate our monthly reporting", "the month-end pack takes days"
- **AI / conversational variants:** "how do we automate monthly management reporting", "automate reporting without breaking it"
- **Intent / funnel:** COM · MOFU
- **Owner URL:** https://thebredge.com/services/data-projects
- **Current title / H1 / meta:** as A8.
- **Internal links in:** sitewide nav; articles `automate-monthly-reporting` + `excel-cleaning-automation` (service links).
- **Internal links out:** as A8.
- **Content gap:** meta mentions "automation and reporting" generically; name "reporting automation / month-end automation" as an explicit project type. Strong supporting article set already in place.
- **SERP feature opportunity:** featured snippet (steps), PAA; resource `/resources/reporting-automation-map` is a snippet asset.
- **Status:** `live-tune`

## A11 · data audit
- **Primary keyword:** data audit
- **Secondary variants:** data stack audit, data assessment, data environment review, analytics audit
- **Buyer-language variants:** "review our data setup", "tell us what's wrong with our data", "audit our reporting"
- **AI / conversational variants:** "what is a data audit and what does it cover", "how do I get our data stack reviewed"
- **Intent / funnel:** COM · MOFU (entry offer)
- **Owner URL:** https://thebredge.com/data-diagnostic
- **Current title / H1 / meta:** as A7 (title contains "Analytics Audit").
- **Internal links in:** as A7 (incl. articles `what-to-fix-first`, `is-our-data-reliable`).
- **Internal links out:** as A7.
- **Content gap:** minimal — title already carries "audit". Watch overlap with the article below.
- **SERP feature opportunity:** PAA, featured snippet.
- **Status:** `watch-cannib` — commercial "data audit" (`/data-diagnostic`) vs informational "how to do a data audit / what to fix first" (`/insights/what-to-fix-first`). Keep the diagnostic page **service-framed** and the article **DIY/how-to-framed** so they target different intents rather than compete.

## A12 · analytics engineering consulting
- **Primary keyword:** analytics engineering consulting
- **Secondary variants:** analytics engineer for hire, dbt consulting, semantic-model / metrics-layer build, data modelling services
- **Buyer-language variants:** "someone to build our data models", "make our metrics consistent", "single source of truth for metrics"
- **AI / conversational variants:** "what is analytics engineering", "analytics engineer vs data engineer vs analyst"
- **Intent / funnel:** COM · MOFU
- **Owner URL:** https://thebredge.com/services/data-projects (delivery-shaped work) — **not** targeted as a title term on `/services`, to avoid overlap with A1
- **Current title / H1 / meta:** as A8.
- **Internal links in:** sitewide nav; supported by `when-to-hire-a-data-team` (defines the role) and `before-you-build-a-data-warehouse` (modelling context).
- **Internal links out:** as A8.
- **Content gap:** "analytics engineering" / "data modelling" not surfaced by name on the owner page; add as a named capability. Cannibalisation risk with A1 ("data engineering consulting") — keep the differentiator explicit: A1 = advisory/partner hub, A12 = defined build/modelling delivery.
- **SERP feature opportunity:** featured snippet (definition), PAA.
- **Status:** `gap` + `watch-cannib` (vs A1)

---

# Section B — Long-tail problem clusters (the ten Insights articles)

Each article is the **sole owner** of its problem query. Articles are written
Q&A-style (the H1 is the buyer's actual question) — strong featured-snippet and
AI-answer (AEO/GEO) candidates. `INF` intent, `TOFU`→`MOFU`. "Links out" lists the
two sibling articles plus the one commercial service link; every article also
receives the sitewide nav + `/insights` index inbound links (not repeated below).

---

## B1 · why-dashboards-disagree
- **Primary keyword:** why do finance and sales have different revenue numbers
- **Secondary variants:** dashboards show different numbers, revenue numbers don't match, data reconciliation guide
- **Buyer-language variants:** "which revenue number is right", "our board pack and CRM disagree", "why don't our reports match"
- **AI / conversational variants:** "why do two dashboards show different revenue", "how do I reconcile finance and sales figures"
- **Owner URL:** https://thebredge.com/insights/why-dashboards-disagree
- **Current title:** `Why Finance and Sales Numbers Disagree — Data Reconciliation Guide | The Bredge`
- **Current H1:** `Why do Finance and Sales have different revenue numbers?`
- **Current meta:** `Finance and Sales revenue numbers disagree because of grain, timing, identity and definitions — not the chart. A practical reconciliation guide and checklist.`
- **Internal links in (3):** `one-customer-view`, `automate-monthly-reporting`, `is-our-data-reliable`.
- **Internal links out:** `one-customer-view`, `what-to-fix-first`, service → `/services/data-projects`.
- **Content gap:** none material; strongest-linked article — good hub. Could also link to `/insights/is-our-data-reliable` reciprocally.
- **SERP feature opportunity:** featured snippet (reasons list), PAA, AI answer.
- **Status:** `live-tune`

## B2 · when-to-hire-a-data-team
- **Primary keyword:** when to hire a data team
- **Secondary variants:** first data hire, analyst vs data engineer, who to hire first data, fractional vs full-time data
- **Buyer-language variants:** "do we need a data person yet", "who's our first data hire", "should we hire or outsource data"
- **AI / conversational variants:** "when should a startup hire its first data engineer", "analyst vs analytics engineer vs data engineer — who first"
- **Owner URL:** https://thebredge.com/insights/when-to-hire-a-data-team
- **Current title:** `When to Hire a Data Team — Analyst vs Data Engineer vs Fractional Team | The Bredge`
- **Current H1:** `When do we actually need a data team — and who should we hire first?`
- **Current meta:** `When to hire a data team, who to hire first, and the difference between an analyst, analytics engineer and data engineer — plus fractional and embedded options.`
- **Internal links in (1):** `what-to-fix-first`.
- **Internal links out:** `what-to-fix-first`, `before-you-build-a-data-warehouse`, service → `/services/embedded-data-team`.
- **Content gap:** only one inbound article link — thin equity. Recommend an inbound link from `/services/embedded-data-team` and/or another article.
- **SERP feature opportunity:** comparison table/snippet (roles), PAA, AI answer.
- **Status:** `gap` (thin inbound)

## B3 · before-you-build-a-data-warehouse
- **Primary keyword:** do we need a data warehouse
- **Secondary variants:** data warehouse readiness, when to build a data warehouse, is a data warehouse worth it, modern data stack decision
- **Buyer-language variants:** "do we need a warehouse yet", "is it too early for a data warehouse", "can we avoid building a warehouse"
- **AI / conversational variants:** "does a mid-market company need a data warehouse", "signs you're ready for a data warehouse"
- **Owner URL:** https://thebredge.com/insights/before-you-build-a-data-warehouse
- **Current title:** `Do You Need a Data Warehouse? A Practical Decision Guide | The Bredge`
- **Current H1:** `Do we actually need a data warehouse yet?`
- **Current meta:** `Do you need a data warehouse yet? A practical readiness checklist covering requirements, the modern data stack, and cases where a warehouse is premature.`
- **Internal links in (4):** `when-to-hire-a-data-team`, `one-customer-view`, `what-to-fix-first`, `power-bi-warehouse-or-both`.
- **Internal links out:** `one-customer-view`, `what-to-fix-first`, service → `/services/data-projects`.
- **Content gap:** none material; well-linked. Best commercial support for A9 (data warehouse consulting).
- **SERP feature opportunity:** featured snippet (readiness checklist), PAA, AI answer.
- **Status:** `live-tune`

## B4 · one-customer-view
- **Primary keyword:** how to build a single customer view
- **Secondary variants:** single customer view, 360 customer view, identity resolution, canonical customer ID, one version of the truth
- **Buyer-language variants:** "customer data in five systems", "one reliable view of the customer", "join our CRM, billing and product data"
- **AI / conversational variants:** "how do you build a single customer view across systems", "what is identity resolution in data"
- **Owner URL:** https://thebredge.com/insights/one-customer-view
- **Current title:** `How to Build One Customer View Across CRM, Billing and Product Data | The Bredge`
- **Current H1:** `Our customer data lives in five systems. How do we get one reliable customer view?`
- **Current meta:** `Build a single customer view across CRM, billing and product data with identity resolution, canonical customer IDs, source precedence and exception handling.`
- **Internal links in (2):** `why-dashboards-disagree`, `before-you-build-a-data-warehouse`.
- **Internal links out:** `why-dashboards-disagree`, `before-you-build-a-data-warehouse`, service → `/services/data-projects`.
- **Content gap:** none material. Prime support for A8 (data reconciliation). Consider targeting "single source of truth" as a secondary heading.
- **SERP feature opportunity:** featured snippet (steps), PAA, AI answer.
- **Status:** `live-tune`

## B5 · automate-monthly-reporting
- **Primary keyword:** how to automate monthly management reporting
- **Secondary variants:** automate board reporting, month-end automation, management reporting automation, automate the monthly pack
- **Buyer-language variants:** "we rebuild the same report every month", "automate the board pack", "month-end takes too long"
- **AI / conversational variants:** "how to automate monthly management reports safely", "what to automate in month-end reporting"
- **Owner URL:** https://thebredge.com/insights/automate-monthly-reporting
- **Current title:** `How to Automate Monthly Management Reporting Safely | The Bredge`
- **Current H1:** `We rebuild the same management report every month. How do we automate it without making it more fragile?`
- **Current meta:** `Automate monthly management and board reporting without adding fragility — what to move upstream, what Excel should still do, and how to keep it auditable.`
- **Internal links in (1):** `excel-cleaning-automation`.
- **Internal links out:** `why-dashboards-disagree`, `what-to-fix-first`, service → `/services/data-projects`.
- **Content gap:** only one inbound article link. Should also receive one from `what-to-fix-first`. Main support for A10 (reporting automation).
- **SERP feature opportunity:** featured snippet (steps), PAA, AI answer.
- **Status:** `gap` (thin inbound)

## B6 · what-to-fix-first
- **Primary keyword:** what to fix first in a messy data stack
- **Secondary variants:** data audit how-to, data stack cleanup, prioritise data problems, data stack triage
- **Buyer-language variants:** "our data is a mess, where do we start", "what should we fix first", "too many data problems"
- **AI / conversational variants:** "how do I prioritise fixing a messy data stack", "how to run a data audit yourself"
- **Owner URL:** https://thebredge.com/insights/what-to-fix-first
- **Current title:** `Data Audit and Diagnostic — What to Fix First in a Messy Data Stack | The Bredge`
- **Current H1:** `We know our data setup is messy. What should we fix first?`
- **Current meta:** `A practical data audit: inventory sources, definitions, identity, quality and ownership, then prioritise by impact and effort to decide what to fix first.`
- **Internal links in (4):** `why-dashboards-disagree`, `before-you-build-a-data-warehouse`, `automate-monthly-reporting`, `is-our-data-reliable`.
- **Internal links out:** `when-to-hire-a-data-team`, `before-you-build-a-data-warehouse`, service → `/data-diagnostic`.
- **Content gap:** none material (best-linked article). **Cannibalisation watch:** its title uses "Data Audit and Diagnostic", the same language as commercial `/data-diagnostic` (A11). Keep this article framed as **DIY/how-to** and the service page as **do-it-for-you** so they don't compete for the same SERP.
- **SERP feature opportunity:** featured snippet (prioritisation steps), PAA, AI answer.
- **Status:** `watch-cannib` (vs A11)

## B7 · power-bi-slow
- **Primary keyword:** why is Power BI slow
- **Secondary variants:** Power BI performance, speed up Power BI, Power BI data model performance, import vs DirectQuery
- **Buyer-language variants:** "our Power BI report is really slow", "dashboard takes forever to load", "why is our Power BI so slow"
- **AI / conversational variants:** "why is my Power BI report slow and how do I fix it", "how to speed up a slow Power BI dashboard"
- **Owner URL:** https://thebredge.com/insights/power-bi-slow
- **Current title:** `Why Is Power BI So Slow? A Data-Model Performance Guide | The Bredge`
- **Current H1:** `Why is our Power BI dashboard so slow?`
- **Current meta:** `Power BI is slow usually because of the data model, not the report: star schema, high-cardinality columns, DAX, and import vs DirectQuery. A performance checklist.`
- **Internal links in (1):** `power-bi-warehouse-or-both`.
- **Internal links out:** `power-bi-warehouse-or-both`, `is-our-data-reliable`, service → `/services/data-projects`.
- **Content gap:** only one inbound; a hub link from `/services` (Power BI intent, A4) would both help this article and give A4 supporting depth.
- **SERP feature opportunity:** featured snippet (causes checklist), PAA, AI answer — high AEO value.
- **Status:** `gap` (thin inbound; ties to A4 monitor)

## B8 · excel-cleaning-automation
- **Primary keyword:** automate Excel data cleaning
- **Secondary variants:** stop cleaning Excel every month, Power Query vs SQL for cleanup, automate spreadsheet clean-up, replace manual Excel work
- **Buyer-language variants:** "we spend days cleaning spreadsheets", "automate our Excel clean-up", "stop the monthly copy-paste"
- **AI / conversational variants:** "how do I automate cleaning Excel files each month", "should data cleaning live in Power Query or SQL"
- **Owner URL:** https://thebredge.com/insights/excel-cleaning-automation
- **Current title:** `Stop Cleaning Excel Files Every Month — What to Automate First | The Bredge`
- **Current H1:** `We spend days cleaning Excel files before every report. What should we automate first?`
- **Current meta:** `Automate repeated Excel clean-up safely: what belongs in Power Query or SQL, what to fix at source, quality tests and human review — and what Excel should still do.`
- **Internal links in (0):** **none from other articles** — only the `/insights` index + nav. This is the site's one near-orphan article.
- **Internal links out:** `automate-monthly-reporting`, `is-our-data-reliable`, service → `/services/data-projects`.
- **Content gap (priority):** zero inbound article links. Add it to the `related` set of `automate-monthly-reporting` and/or `what-to-fix-first` so it gains internal equity (requires editing `lib/insights.ts` — owner/dev task, not this doc).
- **SERP feature opportunity:** featured snippet (what-to-automate list), PAA, AI answer.
- **Status:** `gap` (near-orphan — highest internal-linking priority)

## B9 · is-our-data-reliable
- **Primary keyword:** how to know if your data is reliable
- **Secondary variants:** data quality checks, data reliability tests, is our data trustworthy, data quality framework
- **Buyer-language variants:** "can we trust our data", "how do we know the data is right", "prove our numbers are reliable"
- **AI / conversational variants:** "how do I check if my company's data is reliable", "what data quality tests should we run"
- **Owner URL:** https://thebredge.com/insights/is-our-data-reliable
- **Current title:** `How to Know If Your Data Is Reliable — Data Quality Checks | The Bredge`
- **Current H1:** `How do we know whether our data is actually reliable?`
- **Current meta:** `A practical data-quality framework: completeness, uniqueness, validity, referential integrity, freshness, reconciliation, drift and business-rule tests — with a checklist.`
- **Internal links in (2):** `power-bi-slow`, `excel-cleaning-automation`.
- **Internal links out:** `why-dashboards-disagree`, `what-to-fix-first`, service → `/data-diagnostic`.
- **Content gap:** none material; primary support for A7 (data quality consulting). Natural anchor for the planned OSS "Data Reliability Checks" asset (see backlinks doc §K).
- **SERP feature opportunity:** featured snippet (six-checks list), PAA, AI answer — high AEO value.
- **Status:** `live-tune`

## B10 · power-bi-warehouse-or-both
- **Primary keyword:** Power BI vs data warehouse
- **Secondary variants:** do I need Power BI or a warehouse, reporting architecture, warehouse plus Power BI, what to build first for reporting
- **Buyer-language variants:** "do we need Power BI, a warehouse, or both", "what should we build for better reporting", "in what order do we build reporting"
- **AI / conversational variants:** "Power BI or data warehouse — which do we need", "do we need a warehouse behind Power BI"
- **Owner URL:** https://thebredge.com/insights/power-bi-warehouse-or-both
- **Current title:** `Power BI, a Data Warehouse, or Both? A Reporting Architecture Guide | The Bredge`
- **Current H1:** `We need better reporting. Do we need Power BI, a warehouse, or both?`
- **Current meta:** `Do you need Power BI, a data warehouse, or both? Separate the reporting-layer, model and integration problems to decide what to build, and in what order.`
- **Internal links in (1):** `power-bi-slow`.
- **Internal links out:** `before-you-build-a-data-warehouse`, `power-bi-slow`, service → `/services/data-projects`.
- **Content gap:** only one inbound; supports both A4 (Power BI) and A9 (warehouse). Strong bridge article between the Power BI and warehouse clusters.
- **SERP feature opportunity:** comparison featured snippet, PAA, AI answer.
- **Status:** `live-tune`

---

# Section C — Cannibalisation guard (summary)

1. **Head consulting terms (A1/A2/A3) all own `/services`.** Deliberate: one hub
   ranks the three umbrella terms; **do not** build `/data-engineering-consulting`,
   `/analytics-consulting` or `/bi-consulting` thin pages.
2. **`/services` (advisory hub) vs `/services/data-projects` (delivery).** The
   differentiator is *advice/partner* vs *defined build*. Keep delivery-shaped
   terms (warehouse, reconciliation, reporting automation, analytics engineering)
   off the hub's title/H1; keep them on data-projects.
3. **A11 `data audit` (`/data-diagnostic`) vs B6 `what-to-fix-first`.** Service vs
   DIY how-to. Police titles so they stay service-framed vs informational.
4. **A4 Power BI consulting has no dedicated page** — shares `/services`; the two
   Power BI articles carry depth. Monitor; only build a Power BI section if demand
   proves out. Never a thin exact-match page.
5. **A5/A6 fractional + embedded** consolidated on one page — one page, two sibling
   terms, no duplicate.

# Section D — Priority internal-linking + on-page gaps (consolidated)

Ordered by impact. Items marked *(dev)* require editing site code (`lib/insights.ts`
or page bodies) — out of scope for this doc, logged for the owner/dev.

1. **B8 `excel-cleaning-automation` is a near-orphan** (0 inbound article links).
   Add it to a `related` array of `automate-monthly-reporting` and/or
   `what-to-fix-first`. *(dev)* — highest priority.
2. **Commercial hubs don't link down to articles.** `/services`, `/services/data-projects`
   and `/data-diagnostic` carry no contextual links to supporting Insights articles;
   equity only flows article→service, never service→article. Add a few contextual
   links (e.g. `/services` → the two Power BI articles; `/data-diagnostic` →
   `is-our-data-reliable`). *(dev)*
3. **Surface named specialties on `/services/data-projects`:** "data warehouse
   builds", "reconciliation / single customer view", "analytics engineering /
   modelling" — currently absent from title/meta though owned here (A8/A9/A12). *(dev/editorial)*
4. **Thin-inbound articles** (B2, B5, B7, B10 — one inbound each): add one more
   contextual/related link each to spread equity. *(dev)*
5. **Reciprocal service→article links** for A5 (`/services/embedded-data-team` →
   `when-to-hire-a-data-team`). *(dev)*
6. **`/services` first paragraph** should name "data engineering, analytics and
   business intelligence" once, naturally (A1/A2/A3 support). *(editorial)*

**Ongoing measurement:** primary instrument is GSC → Performance (queries,
impressions, clicks, CTR, avg position). Audit each owner page quarterly for:
unique title/description, one H1, correct canonical, and the cluster's language
appearing naturally in title · H1 · first 150–250 words · one H2 · internal links ·
alt text. Do not keyword-stuff — human copy stays premium editorial.
