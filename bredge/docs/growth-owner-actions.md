# The Bredge — Owner Action Queue & External-Wait Queue

Everything code/prep is DONE or OWNER-READY. This is the single control plane.
Each owner action is scoped to sign-in → paste → submit.

## A. OWNER ONE-CLICK QUEUE (§35)
| # | ACTION | WHY | URL | EXACT INPUT | ~TIME | UNLOCKS |
|---|---|---|---|---|---|---|
| 1 | Create GA4 property + web data stream | analytics/attribution | analytics.google.com | site `https://thebredge.com`; copy `G-XXXX` Measurement ID → send me | 3 min | GA4 events, GSC↔GA4 |
| 2 | Create Clarity project | heatmaps/session replay | clarity.microsoft.com | site `thebredge.com`; copy project ID → send me | 2 min | Clarity |
| 3 | LinkedIn company entity reset | entity consistency | your LinkedIn company page | paste from `docs/seo-entity.md` + `docs/distribution/linkedin-bank.md` (About/tagline/specialties/banner) | 10 min | brand entity signal |
| 4–9 | Claim directories | citations/entity | see each `docs/distribution/profiles/<platform>.md` | sign in → paste pack → upload logo → submit | 5 min ea | external entity + (some) backlinks |
| 10 | Deploy Apps Script + set Worker secrets | lead pipeline | script.google.com + Cloudflare Worker vars | steps in §C below | 15 min | contact form end-to-end |
| 11 | Publish DZone / HackerNoon | authority backlinks | those sites | paste `docs/distribution/dzone-*.md`, `hackernoon-*.md` | 10 min ea | referral + authority |
| 12 | Create Qwoted/Featured/SourceBottle | digital PR | those sites | paste `docs/distribution/expert-media-packs.md` | 5 min ea | media mentions |
| 13 | Push OSS repo to Bredge GitHub org | linkable asset | github.com | `oss/data-reliability-checks/` (ready) → new public repo | 5 min | OSS backlink magnet |
| 14 | Request-index priority URLs | faster crawl | GSC (real Chrome) | 10 URLs in `docs/seo-keyword-system.md` | 5 min | indexing nudge (C) |
| 15 | Run PageSpeed | field CWV | pagespeed.web.dev | `/`, `/services`, `/insights`, one article | 5 min | CWV baseline |
| 16 | Security headers | hardening (P1) | I can apply via Cloudflare — say the word | values in `docs/seo-crawl-report.md` §25 | — | security posture |

## B. EXTERNAL-WAIT QUEUE (§36) — outcomes in progress, NOT incomplete work
- Google recrawl/index of the corrected entity + 26 sitemap URLs (sitemap already read Success).
- Branded-query spelling-correction ("The Bridge" → "The Bredge") self-correcting as entity signals recrawl.
- Directory listing approvals · guest-post editorial acceptance · journalist responses · backlink publication.
- Field Core Web Vitals accumulation (needs real traffic).

## C. GA4 / Clarity wiring (§31) — ready the moment IDs arrive
Code already reads env → `window.__BREDGE_CFG`: `NEXT_PUBLIC_GA4_MEASUREMENT_ID`, `NEXT_PUBLIC_CLARITY_PROJECT_ID` (see `app/layout.tsx`). On receiving IDs I: set the two Worker vars (or repo env), redeploy, verify beacons fire post-consent.
**Event-debug checklist (run after wiring):** consent banner gates load ✓ · GA4 DebugView shows `page_view` · key events fire: `schedule_click`, `contact_submit`, `insight_view/_25/_50/_75/_complete`, `insight_service_click`, `resource_print`, `cal_booking_success` · Clarity records a session · no PII in params (form fields masked).

## D. GSC → reporting boundary (§30)
Aggregate query/page/country/device/date (NOT raw high-volume rows) into the workbook's **Content & Search** tab weekly. Connect GSC↔GA4 once GA4 exists (GA4 Admin → Search Console links).

## E. Operating workbook (§33) — tab spec (owner Sheet `1FtGA32FXrJ2TK-AOXUJC62hfVj8jpxEsJoWK0M4nAlw`)
Operational tabs: Dashboard · Leads · Bookings · Visitor Insights · Content & Search · Experiments · Backlinks & Distribution · Launch Checklist · **+ Keyword Map · Entity Signals · Media/PR**. Dashboard surfaces (not raw tables): search (impressions/clicks/CTR/pos), entity (spelling-correction state, profiles live, sameAs count), distribution (submitted/live), pipeline (leads/bookings), content (top insight), experiments. Source docs: `docs/seo-keyword-system.md`, `docs/seo-entity.md`, `docs/seo-backlinks-distribution.md`, `docs/seo-brand-monitor.md`.
