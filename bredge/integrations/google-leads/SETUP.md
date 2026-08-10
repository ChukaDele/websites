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
npx wrangler secret put GOOGLE_LEADS_WEBHOOK_URL     # the /exec URL from step 1.4
npx wrangler secret put GOOGLE_LEADS_WEBHOOK_SECRET  # SAME value as WEBHOOK_SECRET
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
