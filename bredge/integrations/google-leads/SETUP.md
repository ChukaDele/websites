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

## 2. Cloudflare Worker secrets
```bash
# Run only after the Apps Script web app is securely configured and verified.
# Point at the actual production Worker, not an unrelated Wrangler default.
npx wrangler secret put GOOGLE_LEADS_WEBHOOK_URL --name bredge
npx wrangler secret put GOOGLE_LEADS_WEBHOOK_SECRET --name bredge
```
Until both are set, the form fails cleanly to the mailto fallback (never a false success).

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

The owner-account Google Apps Script project has been created and **bound to the existing workbook**, with the source initially uploaded and a private (\`MYSELF\`) v1 web-app deployment. A separately authorized \`bredge-leads\` clasp OAuth profile can list deployments; this does not itself grant Apps Script function access, Sheets/MailApp execution consent, or permission to open the endpoint to anonymous traffic. The existing default clasp credentials remain unchanged. The currently deployed private baseline may lag the reviewed GitHub source until a new version is published.

**Production must remain blocked** until all steps below are verified:

1. Approve the Apps Script function permissions in the owner's script editor. Set \`WEBHOOK_SECRET\` and \`CAL_WEBHOOK_SECRET\` in **Project settings > Script properties** with independently generated, high-entropy values. Never commit, log, email or paste the secrets into GitHub/Notion/ChatGPT.
2. Push the reviewed \`Code.gs\` to this bound project, deploy an immutable new version, and only then change web-app access to \`ANYONE_ANONYMOUS\` with execution as \`USER_DEPLOYING\`. Validate that an anonymous request with an incorrect or absent shared secret cannot write anything.
3. Configure matching Cloudflare Worker secrets using \`wrangler secret put ... --name bredge\`. The fail-closed GitHub production-release preflight checks the secret **names**, but not their values.
4. Configure a real Cloudflare Turnstile widget for \`thebredge.com\` and the Worker secret \`TURNSTILE_SECRET_KEY\`; update the public site key in \`lib/config.ts\`. The current blank public key means Turnstile is disabled, so owner approval of abuse protection remains outstanding.
5. The browser keeps a stable UUID across retries. The Worker forwards it, and the Apps Script uses a script lock and Sheet lookup to avoid duplicate rows. Notification failures set the 26th column \`Notification Status\` to \`PENDING\`, preserve the saved lead and are retriable. Run \`installNotificationRetryTrigger\` once in the authorized editor to install a 15-minute retry job.
6. Submit one explicitly identified real QA lead from the actual public website. Confirm exactly one \`BR-UUID\` in \`Leads\`, notification status \`SENT\`, and a received owner-email notification. Retry the same submission identifier to prove no second row or notification. Test missing webhook, wrong secret and rate-limit/rejection outcomes without false HTTP 200 acknowledgments.
7. Audit the connected Cal.com booking webhook separately. It uses \`CAL_WEBHOOK_SECRET\` and must write one actual confirmed booking to the \`Bookings\` tab. A page view is not evidence of booking completion.

Never use a green unit-test or manifest-check status as proof of Google/Cloudflare integration. Release ownership and SHA-bound live smoke remain mandatory.
