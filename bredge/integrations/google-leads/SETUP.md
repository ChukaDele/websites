# Bredge operating workbook — setup

**One workbook is the source of truth:**
`https://docs.google.com/spreadsheets/d/1FtGA32FXrJ2TK-AOXUJC62hfVj8jpxEsJoWK0M4nAlw/edit`
(ID `1FtGA32FXrJ2TK-AOXUJC62hfVj8jpxEsJoWK0M4nAlw`, already hard-coded in `Code.gs`).

Pipeline: **Browser → Cloudflare `/api/contact` → Apps Script Web App → workbook + email.** The Worker is the security boundary; no secret is in client code; no PII goes to analytics.

## 1. Apps Script (leads + bookings)
1. Open the workbook → **Extensions → Apps Script**.
2. Paste [`Code.gs`](./Code.gs). It uses `SpreadsheetApp.openById(SPREADSHEET_ID)` then `getSheetByName("Leads")` / `"Bookings"` — never "whatever is open".
3. **Project Settings → Script Properties:**
   - `WEBHOOK_SECRET` = long random string (shared with the Worker).
   - `CAL_WEBHOOK_SECRET` = long random string (for the Cal webhook `?key=`).
4. **Deploy → New deployment → Web app**, execute as **Me**, access **Anyone**. Copy the `/exec` URL.
5. The `Leads` tab auto-creates with these columns (frozen header):
   `Submission ID · Received At · Name · Email · Company · Country · Phone · Phone E.164 · Needs · Current Data Capability · Urgent Area · Timeline · Message · Landing Page · Referrer · UTM Source · UTM Medium · UTM Campaign · UTM Content · Traffic Group · Status` (default Status = **New**). Formula-injection is neutralised on every cell. Every verified lead also emails **mcdavies001@gmail.com**.

## 2. Cloudflare Worker secrets and protected release

Do **not** run `wrangler secret put` on the live Worker during a code rollout. It activates changed bindings against existing production code before the release is verified.

Configure the following **GitHub Cloudflare environment secrets**, never repository files: `GOOGLE_LEADS_WEBHOOK_URL`, `GOOGLE_LEADS_WEBHOOK_SECRET`, and `TURNSTILE_SECRET_KEY`. The existing protected `API` token is the deployment credential. Its scope must be audited.

The approved manual workflow verifies Google workbook identity, Apps Script revision, a working webhook health check, and a real Turnstile Siteverify rejection of a dummy token. Then a single `wrangler deploy --secrets-file /dev/stdin` uploads the reviewed Worker bundle and all three secrets atomically. Cloudflare preserves previously configured secrets omitted from that file. See [Cloudflare's secret deployment documentation](https://developers.cloudflare.com/workers/configuration/secrets/).

Until the webhook and Turnstile bindings are configured, the contact form and production release remain blocked. An actual saved lead and notification email must be verified separately.

## 3. Bookings — real Cal.com bookings only (not page views)
In **Cal.com → Settings → Developer → Webhooks**, add a webhook:
- URL: `<your /exec URL>?source=cal&key=<CAL_WEBHOOK_SECRET>`
- Trigger: **Booking created** (and Booking confirmed if used).
`Code.gs` validates `key`, ignores non-creation events, and appends to `Bookings`
(`Booking ID · Received At · Name · Company · Event · Start Time · Source Lead · Status · Notes`).
A schedule-page view is **never** written as a booking.

## 4. Dashboard + tab formatting (manual, ~10 min — needs the owner in the Sheet)
This must be done in the Sheet UI (the API/Apps Script can format, but the design is a human call). Make the **Dashboard tab look different from the raw tabs** — it is a retrieval view, not a database:
- Sections stacked with whitespace: **CURRENT WEEK** (sessions, leads, bookings, lead→booking %, organic, AI referral), **LEAD PIPELINE** (counts by Status), **CONTENT & SEARCH** (top landing page, top service, top Insight), **CURRENT EXPERIMENT**, **NOTES / ACTIONS**. Readable in under 30 seconds. No 25-column table on the Dashboard.
- **Leads** working view: freeze header; add a filter; `Status` as a dropdown (New · Contacted · Qualified · Discovery booked · Proposal · Won · Lost · Not a fit); add `Owner`, `Next Action`, `Next Action Date`; hide the UTM/attribution columns by default (right-click → Hide columns); wrap Message/Notes.
- **Bookings**: confirmed calls only. **Visitor Insights**: weekly aggregates only (no per-visitor rows). **Content & Search**: one row per URL/period. **Experiments**: log each change + result.
- Distinct tab colours; conditional formatting on `Status` only; do not colour every cell.

## 5. Weekly aggregate sync (boundary prepared, not yet live)
`syncWeekly()` in `Code.gs` is the integration point for GA4 + Search Console + lead/booking totals → `Visitor Insights` / `Content & Search`. It will **not** write anything until configured (it must never fabricate rows). To enable:
- Add the **Google Analytics Data API** and **Search Console API** (Apps Script Advanced Services / OAuth).
- Script Properties: `GA4_PROPERTY_ID`, `GSC_SITE_URL`.
- Implement `fetchGa4Weekly_()` and `fetchGscWeekly_()`, then add a weekly time-driven trigger.
Do **not** browser-scrape dashboards. Raw visitor telemetry stays in GA4/Clarity/Search Console — never in the Sheet.

## Missing inputs the owner must provide
- Deploy the Apps Script + set `WEBHOOK_SECRET` / `CAL_WEBHOOK_SECRET`, then the two Worker secrets.
- Add the Cal webhook URL (with `?key=`).
- Do the Dashboard/Leads formatting pass in the Sheet.
- (Later) GA4 + Search Console API access + property IDs to switch on `syncWeekly()`.

## 2026-10-15: integrity and deployment acceptance

The owner-account Google Apps Script project has been created and **bound to the existing workbook**, with the reviewed source uploaded and the existing deployment moved from private (`MYSELF`) v3 to authenticated-shared-secret (`ANYONE_ANONYMOUS`) v4. A separately authorized `bredge-leads` clasp OAuth profile can list deployments; this does not itself grant Apps Script function access, Sheets/MailApp execution consent, or permission to open the endpoint to anonymous traffic. The existing default clasp credentials remain unchanged. The existing v4 deployment has authenticated anonymous service access. The correct shared secret returned the pinned Bredge workbook and revision, while wrong and missing secrets were rejected.

**Production must remain blocked** until all steps below are verified:

1. Both generated `WEBHOOK_SECRET` and `CAL_WEBHOOK_SECRET` values were saved in Apps Script **Project settings > Script properties**. Google authorized Sheets/Mail/Trigger permissions and one 15-minute `retryPendingLeadNotifications` trigger was verified. Retain secret-management controls when rotating. Never commit, log, email or paste the secrets into GitHub/Notion/ChatGPT.
2. Existing deployment v4 is now `ANYONE_ANONYMOUS`, executing as `USER_DEPLOYING`. Unauthenticated requests with missing or incorrect shared secrets were verified to return `ok:false`. Keep its deployment ID pinned in the GitHub environment.
3. **Do not run `wrangler secret put` separately against production.** The owner-approved protected GitHub workflow deploys the exact browser-tested Worker and all three Worker secrets together through `wrangler deploy --secrets-file /dev/stdin`. Its protected environment already stores webhook URL, webhook shared secret and Turnstile secret.
4. The managed Cloudflare Turnstile widget has been created for thebredge.com, www.thebredge.com, bredge.thebredge.workers.dev and the isolated bredge-release-qa.thebredge.workers.dev; its non-test public site key is in `lib/config.ts` and the private secret is in GitHub's protected `Cloudflare` environment. **Live pairing/browser challenge remains unverified until deployment.**
5. The browser keeps a stable UUID across retries. The Worker forwards it, and the Apps Script uses a script lock and Sheet lookup to avoid duplicate rows. Notification failures set the 26th column `Notification Status` to `PENDING`, preserve the saved lead and are retriable. The owner installed `installNotificationRetryTrigger`; the recurring 15-minute retry trigger is confirmed in Google.
6. Submit one explicitly identified real QA lead from the actual public website. Confirm exactly one `BR-UUID` in `Leads`, notification status `SENT`, and a received owner-email notification. Retry the same submission identifier to prove no second row or notification. Test missing webhook, wrong secret and rate-limit/rejection outcomes without false HTTP 200 acknowledgments.
7. Audit the connected Cal.com booking webhook separately. It uses `CAL_WEBHOOK_SECRET` and must write one actual confirmed booking to the `Bookings` tab. A page view is not evidence of booking completion.

Never use a green unit-test or manifest-check status as proof of Google/Cloudflare integration. Release ownership and SHA-bound live smoke remain mandatory.

### Protected GitHub production configuration

The `Cloudflare` GitHub **environment** (not repository variables or source code) must also hold three protected secrets: `GOOGLE_LEADS_WEBHOOK_URL` (the public Apps Script `/exec` URL), `GOOGLE_LEADS_WEBHOOK_SECRET` (the same high-entropy value as the Apps Script `WEBHOOK_SECRET` Script Property), and `TURNSTILE_SECRET_KEY` (from a Cloudflare Turnstile widget approved for the site). The Bredge Worker deploy token `API` remains in that environment. The public `TURNSTILE_SITE_KEY` belongs in `lib/config.ts` and must match the widget.

The manual release workflow refuses to mutate the Worker unless an authenticated `POST <Apps Script /exec URL>?health=1` with the shared secret confirms that the intended workbook and `Leads`/`Bookings` tabs are reachable. Wrong, missing or expired credentials fail closed. The readiness endpoint never writes a lead or exposes the secret. After this check and GitHub environment approval, the workflow deploys reviewed Worker code and three matching secrets **in one version**, then validates their presence and the exact public SHA.

This is a preflight, not a substitute for an actual submitted lead, confirmed Google Sheet row, owner notification, Turnstile verification, protected main-branch approval and live SHA smoke.

### Verified Google webhook delivery (15 October 2026)

The existing public v4 Apps Script endpoint accepted one labeled synthetic QA enquiry, created exactly one row in the original owner workbook with Notification Status `SENT`, and sent the corresponding Gmail notification. Retrying the **same** UUID returned `duplicate:true` without a second row or notification. The associated confidential identity and credential details are intentionally omitted from this repository. This proves the Apps Script-to-Sheets-and-email subsystem, **not yet** the full browser-to-Cloudflare-Worker integration. The current production Worker still runs the old site release and returns HTTP 503 for real valid contact submissions.
