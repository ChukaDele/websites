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
    // Public anonymous callers must never see backend internals or secret values.
    Logger.log("Bredge lead webhook failed: " + String(err));
    return json({ ok: false, error: "request failed" });
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

  // The browser keeps one UUID for retries of the same enquiry. A duplicate
  // HTTP request must not create a second row or send a second notification.
  // Legacy requests without this field remain accepted during migration.
  var clientId = str(body.submissionId);
  if (clientId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(clientId)) {
    return json({ ok: false, error: "invalid submission id" });
  }
  var id = clientId
    ? "BR-" + clientId.toLowerCase()
    : "BR-" + Utilities.formatDate(new Date(), "UTC", "yyyyMMdd-HHmmss") + "-" + Math.floor(Math.random() * 1000);

  var sheet, rowNumber;
  var lock = LockService.getScriptLock();
  try { lock.waitLock(20000); }
  catch (err) { return json({ ok: false, error: "lead pipeline temporarily busy" }); }
  try {
    sheet = sheet_("Leads", LEADS_HEADERS);
    // The real CRM already owns columns 22-25; fail before writing any lead if
    // the required notification status column cannot be used safely.
    var notificationHeader = sheet.getRange(1, 26);
    var existingNotificationHeader = str(notificationHeader.getValue());
    if (existingNotificationHeader && existingNotificationHeader !== "Notification Status") {
      throw new Error("notification status header conflict");
    }
    if (!existingNotificationHeader) notificationHeader.setValue("Notification Status");
    if (clientId && sheet.getLastRow() > 1) {
      var match = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1)
        .createTextFinder(id).matchEntireCell(true).findNext();
      if (match) return json({ ok: true, id: id, duplicate: true });
    }
    var utm = body.utm || {};
    var row = [
      id, str(body.receivedAt) || new Date().toISOString(), name, email, company, str(body.country),
      str(body.phone), str(body.phoneE164), str(body.needs), str(body.capability), str(body.urgentArea),
      str(body.timeline), message, str(body.page), str(body.referrer),
      str(utm.source), str(utm.medium), str(utm.campaign), str(utm.content), str(body.trafficGroup), "New",
    ].map(safeCell_);
    sheet.appendRow(row);
    SpreadsheetApp.flush();
    rowNumber = sheet.getLastRow();
  } catch (err) {
    Logger.log("Bredge lead sheet write failed; no successful receipt: " + String(err));
    return json({ ok: false, error: "lead sheet write failed" });
  } finally {
    lock.releaseLock();
  }

  // A notification failure occurs AFTER a durable Sheet write. Do not return
  // false failure, or a visitor's retry could create duplicate enquiries.
  var notificationSent = false;
  try { notifyLead_(id, body, name, email, company, message); notificationSent = true; }
  catch (err) { Logger.log("Bredge notification pending for " + id); }

  try { sheet.getRange(rowNumber, 26).setValue(notificationSent ? "SENT" : "PENDING"); }
  catch (err) { Logger.log("Bredge notification status could not be recorded for " + id); }

  return json({ ok: true, id: id, notificationSent: notificationSent });
}

/* ---------- Notification recovery after a successful Sheet write ---------- */
// Owner-only operations function. A lead is stored even if MailApp is temporarily
// unavailable; re-send pending notification without inserting another lead row.
function retryPendingLeadNotifications() {
  var sheet = ss_().getSheetByName("Leads");
  if (!sheet || sheet.getLastRow() < 2) return { attempted: 0, sent: 0, pending: 0 };
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 26).getValues();
    var attempted = 0, sent = 0, pending = 0;
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      if (str(row[25]) !== "PENDING") continue;
      if (attempted >= 3) { pending++; continue; }
      attempted++;
      var body = {
        formType: "contact", country: row[5], phone: row[6], needs: row[8],
        capability: row[9], urgentArea: row[10], timeline: row[11],
        page: row[13], referrer: row[14],
        utm: { source: row[15], medium: row[16], campaign: row[17], content: row[18] },
        trafficGroup: row[19],
      };
      try {
        notifyLead_(str(row[0]), body, str(row[2]), str(row[3]), str(row[4]), str(row[12]));
        // An operator may sort the Sheet while MailApp runs; look up the exact
        // ID again before marking any row as sent.
        var currentRow = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1)
          .createTextFinder(str(row[0])).matchEntireCell(true).findNext();
        if (!currentRow) throw new Error("lead row moved or missing");
        sheet.getRange(currentRow.getRow(), 26).setValue("SENT");
        sent++;
      } catch (err) {
        pending++;
        Logger.log("Bredge pending lead notification could not be delivered: " + str(row[0]));
      }
    }
    return { attempted: attempted, sent: sent, pending: pending };
  } finally {
    lock.releaseLock();
  }
}

// Run once from the authenticated Apps Script editor AFTER authorizing MailApp.
// Creates at most one clock trigger; no anonymous web request can call it.
function installNotificationRetryTrigger() {
  var handler = "retryPendingLeadNotifications";
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === handler) return { installed: true, existed: true };
  }
  ScriptApp.newTrigger(handler).timeBased().everyMinutes(15).create();
  return { installed: true, existed: false };
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
