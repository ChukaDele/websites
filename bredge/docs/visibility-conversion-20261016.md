# Bredge visibility, conversion and analytics decision record

Scope: source branch stacked on Bredge PR #15, which itself depends on protected contact/release PR #10. Date: 16 October 2026. **Production has not been changed by this work.**

## Strategic objective

Convert the right visitors into confirmed, contactable qualified enquiries while making Bredge's published knowledge accurately discoverable by human search and AI-assisted retrieval. The real measure is **successful verified leads and meetings** rather than crawler hits, button hovers or pageviews.

## Existing capabilities checked

- Published pages use an indexable production canonical host, 27 routed pages (including content), Next/vinext SSR, structured Organization/WebSite/Article/Service metadata, canonical URLs, OG artwork, robots.txt, sitemaps, and ten client-question-driven Insights plus six ungated resources.
- `llms.txt` and an informative agent capabilities JSON already existed. These have no guarantee of inclusion in Google AI results. This branch adds `llms-full.txt`, generated from the same published content records and verified for source agreement in CI.
- The codebase already contains consent-gated GA4, Clarity and GTM adapters plus contact, schedule, reading progress and AI-referral event types. **Neither production nor the reviewed motion preview currently has configured public measurement IDs**, according to their HTML config; vendor collection was not verified as active.
- The contact form's delivery confirmation is backed by the Google Apps Script receipt protocol under unmerged PR #10; the rate limiter/honeypot/validation remain security controls. The preview is intentionally uncredentialed, and a preview contact form cannot prove lead delivery.
- No live PostHog project, dashboard, domain verification, Clarity project, or Google Search Console connection has been established by this audit.

## Implemented in this source branch

| Priority | Change | Evidence and scope |
| --- | --- | --- |
| P1 | Site-wide, accessible CTA color transition and directional-arrow micro interaction | CSS only, no animation SDK; hover/focus/active/reduced motion and touch variants |
| P1 | Refined existing Instrument Sans Variable headings | Retains established typeface and font files, improves weight, spacing, line height and readability; avoids adding another downloadable font |
| P1 | Clearer, answer-first Services page | Four visible SSR Q&As on scope, engagement fit, diagnostic, and existing tools; standard links to relevant services and insights; no misleading FAQ rich-results markup |
| P1 | Source-backed retrieval index | `/llms-full.txt` built directly from 10 published Insights and six resource records; publication metadata/canonical links and provenance; stale checks in CI |
| P1 | GA4 recommended `generate_lead` event | Fired only after already-existing successful Worker receipt, after explicit consent; no message/phone/email/client-company field shared |
| P1 | CTA source attribution | Data attributes for hero, header, footer, services and diagnostic; privacy-safe `contact_cta_click` and `schedule_click` |
| P1 | Correct consent-milestone behavior | Once-only page milestones no longer burn before consent; per-page scope prevents suppressing legitimate later page events |
| P1 | Measurement ID quality gate | GitHub repository **public variables** wired into the CI-produced, tested artifact. Invalid/mixed GA4/GTM config fails quality checks. No IDs or tokens invented and no production credentials touched |
| P1 | Structured entity accuracy | Removed unverified `legalName: The Bredge, LLC` pending verified legal documentation; brand Organization identity preserved |

## Activation required from the owner / authorised analytics administrator

1. Confirm the authoritative Google Analytics 4 property, its **public Measurement ID** (format `G-...`), and who has administrative permission. Set repo Actions variable `BREDGE_GA4_MEASUREMENT_ID`. If GTM owns GA4 already, instead set `BREDGE_GTM_ID` and complete GTM consent/event configuration. **Do not configure both pathways without reviewing duplicate page views.**
2. If Clarity is desired, confirm its actual project and set the public `BREDGE_CLARITY_PROJECT_ID`. The lead form explicitly includes `data-clarity-mask`. Check Clarity's project masking policy and consent implementation after activation.
3. PR/CI must rebuild the exact production artifact with the public IDs, run consent acceptance/rejection tests, and confirm a real GA4 DebugView event sequence before approved deploy. Production output must contain the configured public ID **only after the owner confirms it**. Never substitute a made-up measurement ID.
4. Mark GA4 `generate_lead` as a key event; distinguish **successful saved enquiries** from merely clicking Send. In GTM-only deployments, map `contact_success` to one `generate_lead` tag, do not double-fire it. `schedule_booking_complete` should only fire on a real Cal.com success callback; independently validate the original Bookings workbook workflow (existing P1 issue #14).
5. Link domain-level Google Search Console and Bing Webmaster Tools, submit canonical `/sitemap.xml`, inspect live URLs, check indexing/coverage, and compare baseline queries after deployment. Access is not verified yet.
6. Confirm the legal company name, jurisdiction, and legitimate `sameAs` profiles before adding `legalName` or founders to structured data. Do not use invented client logos, performance figures or case studies.

## Analytics product decision

**Now:** GA4 + Microsoft Clarity are sufficient for Bredge's marketing website **when properly activated and consented**. GA4 measures acquisition and conversion; Clarity gives qualitative replay/scroll/heatmap insight without buying a second analytics stack. The site's current consent layer blocks vendor load until permission. Retain the single typed event adapter to prevent double measurements. Do **not** install PostHog just to repeat GA4 pageviews or Clarity replay.

**Consider PostHog later if** Bredge adds self-service product journeys, multi-step lead qualification, measurable experiments/flags, cross-device user journeys, or repeatedly needs cohort/funnel analysis GA4 cannot answer. Check [PostHog's official published pricing](https://posthog.com/pricing) for current free-tier allowances and retention/consent/privacy implications rather than assuming the quotas stay constant. Without a new use case, another SDK adds operational overhead and potential duplicate data.

## Measurement table

| Funnel stage | Event/source | Decision it should answer |
| --- | --- | --- |
| Organic/AI/referral entry | GA4 page view, UTM/referral, Search Console | Which search questions bring relevant visitors? |
| Service and diagnosis interest | `service_cta_click`, path and placement | Which needs/copy make visitors explore? |
| Meeting intent | `schedule_click` vs verified `schedule_booking_complete` | Where are meetings lost between click and booking? |
| Enquiry intent | `contact_cta_click`, `contact_form_start`, `contact_submit` | How many readers begin vs abandon? |
| Confirmed conversion | `contact_success`, GA4 `generate_lead`, original Google Sheets row | What actually arrived? Never equate a click with a saved lead |
| Journey quality | Clarity recordings and consensual scroll data | Where does mobile UX create avoidable friction? |

Use only aggregate or coarse event attributes. No names, phone numbers, customer messages, private submission IDs or employer identifiers should be forwarded to third-party analytics.

## Search + RAG content principles

[Google's official AI Search documentation](https://developers.google.com/search/docs/appearance/ai-features) emphasises the established Search fundamentals and helpful, original content rather than special AI metadata. Bredge should keep focused answer sections, properly linked real resources and transparent technical examples. The generated text index links to canonical sources so retrieval tools can identify exactly where a statement came from. Google does not promise improved ranking from `llms.txt`, extra generic FAQs or a bespoke agent JSON.

Next meaningful authority lift: **publish one verifiable technical write-up each month** documenting a real problem, decision constraints, the original/synthetic nature of the data, method, failure modes, validation and results. For actual client outcomes, obtain permission before naming them. Avoid fabricating metrics, endorsements, publication updates or rich snippets.

## Accepted release safeguards

- PR #16 will be based on unmerged PR #15; PR #10 remains the protected production gate. Do not deploy on the old production SHA, retarget directly to main, or bypass human reviews.
- Font changes are CSS-only; no unlicensed external font files are imported. Maintain the Astro pilot's shared design tokens; it is still a one-route noindex experiment.
- Native iPhone and Safari interaction, keyboard accessibility, motion preference, contrast, original form receipt, responsive layouts, and hosted asset availability must be tested on the exact built artifact before closeout.
- The only outstanding deployment configuration request is genuine Bredge analytics property IDs. No PostHog installation is required now.

## 16 October 2026: source-grounded Research and typography rag

The owner clarified that typography needs to be consistent across ALL headings, and “rag” specifically means the irregular shape of line endings in typeset text. Implemented the typography-rag.css contract sitewide, not only the header: Instrument Sans Variable for H1-H6, controlled weights and leading, balanced line wrapping, responsive heading measures in characters, readable paragraphs, and sensible mobile word breaks. A browser audit across 44 route/viewport combinations found the existing global footer H2 had 0.87 leading; adjusted it to 1.025 desktop and 1.055 phone. The extended permanent browser suite checks every sitemap route on mobile and desktop, with representative 320px and 768px layouts.

The separate retrieval-augmented-generation improvements remain: source-linked llms-full.txt, machine-readable route guidance, canonical SSR content, primary-source links and explicit limitations. These are retrieval aids, not substitutes for natural-language HTML or proof of ranking.

Original-source input is the owner's Drive collection containing seven website-ready reports, five editable Power BI files and seven broader dashboard examples. Source provenance review and publication restrictions are recorded in docs/original-research-source-audit.md. The new /research route and homepage teaser feature three historically dated public-data briefs, each with a named original NBS dataset, an exact period, an observable number and readable limitations. The source PDFs and PBIX assets remain in Drive and are NOT redistributed here. CoHD draft percentage differences from the original NBS report are expressly excluded, and no public-data example is presented as client success.

SEO/agent quality follows an evidence ladder: report source document → Bredge analysis → NBS primary dataset → claim with unit and reporting period → limitation → related service. New research references are included in the public text index and canonical sitemap. No fake up-to-date statistics, invented clients, performance promises, bot credential bypasses, or new analytics vendors are added.

Human follow-up: confirm whether the reports may be re-exported as accessible, public PDFs and whether the original BI dashboards use sample or client data. Do not publish raw assets before that approval. Protected PR #10 and stacked PR #15 remain independent production prerequisites.
