/**
 * The Bredge — lead webhook (Google Apps Script, bound to the "Bredge Website Leads" Sheet).
 *
 * Flow:  Cloudflare Worker (/api/contact)  →  this Web App  →  Leads sheet + email.
 *
 * Deploy: Extensions → Apps Script, paste this file, set Script Properties
 * (see SETUP.md), then Deploy → New deployment → Web app → Execute as "Me",
 * Access "Anyone". Copy the /exec URL into the Worker secret GOOGLE_LEADS_WEBHOOK_URL.
 */

var SHEET_NAME = "Leads";
var NOTIFY_EMAIL = "mcdavies001@gmail.com";

var HEADERS = [
  "Submission ID", "Received At", "Form Type", "Name", "Email", "Company",
  "Country", "Phone", "Phone E.164", "Phone Country",
  "Needs", "Project Type / Current Setup", "Timeline", "Message",
  "Landing Page", "Referrer", "UTM Source", "UTM Medium", "UTM Campaign", "UTM Content", "Status",
];

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) return json({ ok: false, error: "empty" });
    var body = JSON.parse(e.postData.contents);

    var secret = PropertiesService.getScriptProperties().getProperty("WEBHOOK_SECRET");
    if (!secret || body.secret !== secret) return json({ ok: false, error: "unauthorized" });

    var name = str(body.name), email = str(body.email), company = str(body.company), message = str(body.message);
    if (!name || !email || !company || !message) return json({ ok: false, error: "missing fields" });
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json({ ok: false, error: "bad email" });

    var sheet = getSheet_();
    var id = "BR-" + Utilities.formatDate(new Date(), "UTC", "yyyyMMdd-HHmmss") + "-" + Math.floor(Math.random() * 1000);
    var receivedAt = str(body.receivedAt) || new Date().toISOString();
    var utm = body.utm || {};

    var row = [
      id, receivedAt, str(body.formType) || "contact", name, email, company,
      str(body.country), str(body.phone), str(body.phoneE164), str(body.phoneCountry),
      str(body.needs), str(body.projectType), str(body.timeline), message,
      str(body.page), str(body.referrer),
      str(utm.source), str(utm.medium), str(utm.campaign), str(utm.content), "New",
    ].map(safeCell_); // formula-injection protection on every cell

    sheet.appendRow(row);

    notify_(id, body, name, email, company, message);
    return json({ ok: true, id: id });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function doGet() { return json({ ok: true, service: "bredge-leads" }); }

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) { sheet = ss.insertSheet(SHEET_NAME); }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/** Prevent CSV/formula injection: neutralise leading = + - @ (and control chars). */
function safeCell_(v) {
  var s = v == null ? "" : String(v);
  if (s.length && /^[=+\-@\t\r]/.test(s)) return "'" + s;
  return s;
}

function str(v) { return v == null ? "" : String(v).trim(); }

function notify_(id, body, name, email, company, message) {
  var needsStr = str(body.needs), timeline = str(body.timeline), formType = str(body.formType) || "contact";
  var needsList = needsStr ? needsStr.split(";").map(function (s) { return s.trim(); }).filter(String) : [];
  var firstNeed = needsList.length ? needsList[0] : formType;
  var subject = "[Bredge lead] " + (company || "Unknown") + " — " + firstNeed;
  var utm = body.utm || {};
  var needsBlock = needsList.length ? needsList.map(function (n) { return "  - " + n; }).join("\n") : "  —";
  var lines = [
    "New lead from the Bredge site.", "",
    "Name:      " + name,
    "Email:     " + email,
    "Company:   " + company,
    "Form:      " + formType,
    "Needs:", needsBlock,
    "Setup:     " + (str(body.projectType) || "—"),
    "Timeline:  " + (timeline || "—"),
    "", "Message:", message, "",
    "Page:      " + str(body.page),
    "Referrer:  " + str(body.referrer),
    "UTM:       " + [str(utm.source), str(utm.medium), str(utm.campaign), str(utm.content)].filter(String).join(" / "),
    "Received:  " + (str(body.receivedAt) || new Date().toISOString()),
    "ID:        " + id,
  ];
  var options = {};
  if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) options.replyTo = email;
  MailApp.sendEmail(NOTIFY_EMAIL, subject, lines.join("\n"), options);
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
