/**
 * The Bredge — operating workbook backend (Google Apps Script).
 *
 * ONE workbook is the source of truth:
 *   https://docs.google.com/spreadsheets/d/1FtGA32FXrJ2TK-AOXUJC62hfVj8jpxEsJoWK0M4nAlw/edit
 *
 * Endpoints (single Web App):
 *   • Website lead     → POST { secret, ...lead }            → "Leads"
 *   • Cal.com booking  → POST (Cal webhook, ?key=SECRET)      → "Bookings"
 *
 * We never write raw visitor telemetry here (no page views, IPs, cookie/session
 * IDs). GA4 / Clarity / Search Console own that; this workbook holds business
 * rows and aggregates only.
 *
 * Script Properties required: WEBHOOK_SECRET (shared with the Cloudflare Worker),
 * CAL_WEBHOOK_SECRET (shared with the Cal.com webhook URL query ?key=).
 */

var SPREADSHEET_ID = "1FtGA32FXrJ2TK-AOXUJC62hfVj8jpxEsJoWK0M4nAlw";
var NOTIFY_EMAIL = "mcdavies001@gmail.com";

var LEADS_HEADERS = [
  "Submission ID", "Received At", "Name", "Email", "Company", "Country",
  "Phone", "Phone E.164", "Needs", "Current Data Capability", "Urgent Area",
  "Timeline", "Message", "Landing Page", "Referrer",
  "UTM Source", "UTM Medium", "UTM Campaign", "UTM Content", "Traffic Group", "Status",
];
var BOOKINGS_HEADERS = [
  "Booking ID", "Received At", "Name", "Company", "Event", "Start Time", "Source Lead", "Status", "Notes",
];

function ss_() { return SpreadsheetApp.openById(SPREADSHEET_ID); }

function sheet_(name, headers) {
  var ss = ss_();
  var sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) return json({ ok: false, error: "empty" });
    var body = JSON.parse(e.postData.contents);
    var params = (e.parameter) || {};

    // Cal.com webhook: authenticated by ?key= and identified by triggerEvent.
    if (body.triggerEvent || params.source === "cal") return handleBooking_(body, params);

    return handleLead_(body);
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function doGet() { return json({ ok: true, service: "bredge-workbook" }); }

/* ---------- Website lead → Leads ---------- */
function handleLead_(body) {
  var secret = PropertiesService.getScriptProperties().getProperty("WEBHOOK_SECRET");
  if (!secret || body.secret !== secret) return json({ ok: false, error: "unauthorized" });

  var name = str(body.name), email = str(body.email), company = str(body.company), message = str(body.message);
  if (!name || !email || !company || !message) return json({ ok: false, error: "missing fields" });
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json({ ok: false, error: "bad email" });

  var sheet = sheet_("Leads", LEADS_HEADERS);
  var id = "BR-" + Utilities.formatDate(new Date(), "UTC", "yyyyMMdd-HHmmss") + "-" + Math.floor(Math.random() * 1000);
  var utm = body.utm || {};
  var row = [
    id, str(body.receivedAt) || new Date().toISOString(), name, email, company, str(body.country),
    str(body.phone), str(body.phoneE164), str(body.needs), str(body.capability), str(body.urgentArea),
    str(body.timeline), message, str(body.page), str(body.referrer),
    str(utm.source), str(utm.medium), str(utm.campaign), str(utm.content), str(body.trafficGroup), "New",
  ].map(safeCell_);
  sheet.appendRow(row);

  notifyLead_(id, body, name, email, company, message);
  return json({ ok: true, id: id });
}

/* ---------- Cal.com booking → Bookings ---------- */
function handleBooking_(body, params) {
  var secret = PropertiesService.getScriptProperties().getProperty("CAL_WEBHOOK_SECRET");
  if (!secret || params.key !== secret) return json({ ok: false, error: "unauthorized" });

  // Only record real, created/confirmed bookings — never a page view.
  var trigger = str(body.triggerEvent);
  if (trigger && trigger.indexOf("BOOKING_CREATED") === -1 && trigger.indexOf("BOOKING_CONFIRMED") === -1) {
    return json({ ok: true, ignored: trigger });
  }
  var p = body.payload || {};
  var attendee = (p.attendees && p.attendees[0]) || {};
  var sheet = sheet_("Bookings", BOOKINGS_HEADERS);
  var id = "BK-" + Utilities.formatDate(new Date(), "UTC", "yyyyMMdd-HHmmss") + "-" + Math.floor(Math.random() * 1000);
  var row = [
    id, new Date().toISOString(), str(attendee.name), "", str(p.title || p.eventTitle),
    str(p.startTime), str(attendee.email), "Confirmed", "",
  ].map(safeCell_);
  sheet.appendRow(row);
  return json({ ok: true, id: id });
}

/* ---------- Weekly aggregate sync (boundary only) ----------
 * Prepares the shape for a weekly GA4 + Search Console + totals sync into
 * "Visitor Insights" and "Content & Search". It does NOT run until API access
 * is configured — it must never write fabricated rows.
 *
 * To enable: add the Google Analytics Data API + Search Console API (Advanced
 * Services / OAuth), set property IDs in Script Properties (GA4_PROPERTY_ID,
 * GSC_SITE_URL), implement fetchGa4Weekly_() and fetchGscWeekly_(), then run
 * syncWeekly() on a weekly time-driven trigger.
 */
function syncWeekly() {
  var props = PropertiesService.getScriptProperties();
  if (!props.getProperty("GA4_PROPERTY_ID") || !props.getProperty("GSC_SITE_URL")) {
    Logger.log("syncWeekly: GA4_PROPERTY_ID / GSC_SITE_URL not set — no data written (by design).");
    return;
  }
  // Intentionally not implemented until credentials exist. See SETUP.md.
  throw new Error("syncWeekly: implement fetchGa4Weekly_() and fetchGscWeekly_() before enabling the trigger.");
}

/* ---------- helpers ---------- */
function safeCell_(v) { var s = v == null ? "" : String(v); return (s.length && /^[=+\-@\t\r]/.test(s)) ? "'" + s : s; }
function str(v) { return v == null ? "" : String(v).trim(); }

function notifyLead_(id, body, name, email, company, message) {
  var needsStr = str(body.needs), formType = str(body.formType) || "contact";
  var needsList = needsStr ? needsStr.split(";").map(function (s) { return s.trim(); }).filter(String) : [];
  var subject = "[Bredge lead] " + (company || "Unknown") + " — " + (needsList[0] || formType);
  var utm = body.utm || {};
  var lines = [
    "New lead from the Bredge site.", "",
    "Name:      " + name, "Email:     " + email, "Company:   " + company,
    "Country:   " + str(body.country), "Phone:     " + str(body.phone),
    "Needs:", (needsList.length ? needsList.map(function (n) { return "  - " + n; }).join("\n") : "  —"),
    "Capability:" + str(body.capability), "Urgent:    " + str(body.urgentArea),
    "Timeline:  " + str(body.timeline), "", "Message:", message, "",
    "Page:      " + str(body.page), "Referrer:  " + str(body.referrer),
    "Traffic:   " + str(body.trafficGroup),
    "UTM:       " + [str(utm.source), str(utm.medium), str(utm.campaign), str(utm.content)].filter(String).join(" / "),
    "ID:        " + id,
  ];
  var options = {};
  if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) options.replyTo = email;
  MailApp.sendEmail(NOTIFY_EMAIL, subject, lines.join("\n"), options);
}

function json(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }
