import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const script = readFileSync(new URL("../integrations/google-leads/Code.gs", import.meta.url), "utf8");
const uuid = "11111111-1111-4111-8111-111111111111";
const baseLead = {
  secret: "test-webhook-secret",
  submissionId: uuid,
  name: "Quality Test",
  email: "qa@example.test",
  company: "Internal QA",
  message: "Controlled integration test",
  needs: "Data engineering",
  receivedAt: "2026-10-15T00:00:00Z",
};

function harness({ mailFails = false, sheetFails = false, lockFails = false } = {}) {
  // The real workbook already has 25 headers: col. 26 is free for notification status.
  const headers = [
    "Submission ID", "Received At", "Name", "Email", "Company", "Country",
    "Phone", "Phone E.164", "Needs", "Current Data Capability", "Urgent Area",
    "Timeline", "Message", "Landing Page", "Referrer", "UTM Source", "UTM Medium",
    "UTM Campaign", "UTM Content", "Traffic Group", "Status",
    "Owner", "Next Action", "Next Action Date", "Notes",
  ];
  const rows = [headers.slice()];
  const emails = [];
  let shouldFailMail = mailFails;
  let lockReleases = 0;
  let triggerInstalled = false;
  const sheet = {
    getLastRow: () => rows.length,
    appendRow: (row) => {
      if (sheetFails) throw new Error("Simulated sheet failure");
      rows.push([...row]);
    },
    getRange: (row, col, n = 1, width = 1) => ({
      getValue: () => rows[row - 1]?.[col - 1] ?? "",
      getValues: () => rows.slice(row - 1, row - 1 + n).map((r) => r.slice(col - 1, col - 1 + width)),
      setValue: (value) => {
        while (rows.length < row) rows.push([]);
        rows[row - 1][col - 1] = value;
      },
      createTextFinder: (needle) => ({
        matchEntireCell() { return this; },
        findNext() {
          const offset = rows.slice(row - 1, row - 1 + n).findIndex((r) => r[col - 1] === needle);
          return offset >= 0 ? { getRow: () => row + offset } : null;
        },
      }),
    }),
  };
  const context = {
    PropertiesService: { getScriptProperties: () => ({
      getProperty: (key) => key === "WEBHOOK_SECRET" ? "test-webhook-secret" : null,
    }) },
    SpreadsheetApp: { openById: () => ({ getSheetByName: () => sheet, getId: () => "1FtGA32FXrJ2TK-AOXUJC62hfVj8jpxEsJoWK0M4nAlw" }), flush: () => {} },
    LockService: { getScriptLock: () => ({
      waitLock: () => { if (lockFails) throw new Error("Simulated busy lock"); },
      releaseLock: () => { lockReleases += 1; },
    }) },
    MailApp: { sendEmail: (...args) => {
      if (shouldFailMail) throw new Error("Simulated mail quota failure");
      emails.push(args);
    } },
    Utilities: { formatDate: () => "20261015-010000" },
    ScriptApp: {
      getProjectTriggers: () => triggerInstalled ? [{ getHandlerFunction: () => "retryPendingLeadNotifications" }] : [],
      newTrigger: () => ({
        timeBased() { return this; },
        everyMinutes() { return this; },
        create() { triggerInstalled = true; },
      }),
    },
    Logger: { log: () => {} },
    ContentService: {
      MimeType: { JSON: "JSON" },
      createTextOutput: (body) => ({ body, setMimeType() { return this; } }),
    },
  };
  vm.runInNewContext(script, context, { filename: "Code.gs" });
  function submit(overrides = {}) {
    const lead = { ...baseLead, ...overrides };
    const text = context.doPost({ postData: { contents: JSON.stringify(lead) }, parameter: {} });
    return JSON.parse(text.body);
  }
  return {
    submit, rows, emails, sheet, context,
    setMailFailure: (state) => { shouldFailMail = state; },
    getLockReleases: () => lockReleases,
  };
}

test("a saved lead produces one Sheet row, one notification and a truthful receipt", () => {
  const h = harness();
  const first = h.submit();
  assert.equal(first.ok, true);
  assert.equal(first.id, "BR-" + uuid);
  assert.equal(first.notificationSent, true);
  assert.equal(h.rows.length, 2);
  assert.equal(h.rows[0][25], "Notification Status");
  assert.equal(h.rows[1][25], "SENT");
  assert.equal(h.emails.length, 1);
  assert.equal(h.getLockReleases(), 1);
  assert.equal(h.rows[0][21], "Owner", "existing CRM headers must not be overwritten");
});

test("network replay with the same UUID cannot duplicate the Sheet row or notification", () => {
  const h = harness();
  assert.equal(h.submit().ok, true);
  const retry = h.submit();
  assert.equal(retry.ok, true);
  assert.equal(retry.duplicate, true);
  assert.equal(h.rows.length, 2);
  assert.equal(h.emails.length, 1);
  assert.equal(h.getLockReleases(), 2);
});

test("email failure after a durable write does not falsely report a failed save", () => {
  const h = harness({ mailFails: true });
  const result = h.submit();
  assert.equal(result.ok, true);
  assert.equal(result.notificationSent, false);
  assert.equal(h.rows.length, 2);
  assert.equal(h.rows[1][25], "PENDING");
  assert.equal(h.submit().duplicate, true);
  assert.equal(h.rows.length, 2);
});

test("a failed Sheet write never acknowledges receipt or attempts an email", () => {
  const h = harness({ sheetFails: true });
  assert.equal(h.submit().ok, false);
  assert.equal(h.rows.length, 1);
  assert.equal(h.emails.length, 0);
  assert.equal(h.getLockReleases(), 1);
});

test("invalid shared secret, UUID and busy lock reject without a write", () => {
  const h = harness();
  assert.equal(h.submit({ secret: "wrong" }).ok, false);
  assert.equal(h.submit({ submissionId: "not-a-uuid" }).ok, false);
  assert.equal(h.rows.length, 1);
  const busy = harness({ lockFails: true });
  assert.equal(busy.submit().ok, false);
  assert.equal(busy.rows.length, 1);
});


test("pending notifications can retry without resaving or duplicating a lead", () => {
  const h = harness({ mailFails: true });
  const first = h.submit();
  assert.equal(first.notificationSent, false);
  assert.equal(h.rows[1][25], "PENDING");
  h.setMailFailure(false);
  const result = h.context.retryPendingLeadNotifications();
  assert.equal(result.attempted, 1);
  assert.equal(result.sent, 1);
  assert.equal(result.pending, 0);
  assert.equal(h.rows[1][25], "SENT");
  assert.equal(h.rows.length, 2);
  assert.equal(h.emails.length, 1);
  assert.equal(h.context.retryPendingLeadNotifications().attempted, 0);
});

test("installation of the notification retry trigger is idempotent", () => {
  const h = harness();
  const first = h.context.installNotificationRetryTrigger();
  const second = h.context.installNotificationRetryTrigger();
  assert.equal(first.installed, true);
  assert.equal(first.existed, false);
  assert.equal(second.existed, true);
});

test("public webhook errors do not disclose backend exception details", () => {
  const h = harness();
  const result = JSON.parse(h.context.doPost({ postData: { contents: "invalid JSON" }, parameter: {} }).body);
  assert.equal(result.ok, false);
  assert.equal(result.error, "request failed");
});


test("unexpected 26th CRM column blocks a save without overwriting owner data", () => {
  const h = harness();
  h.rows[0][25] = "Existing third-party CRM field";
  const result = h.submit();
  assert.equal(result.ok, false);
  assert.equal(h.rows.length, 1);
  assert.equal(h.rows[0][25], "Existing third-party CRM field");
  assert.equal(h.emails.length, 0);
});

test("uppercase UUID replay maps to the same lower-case saved row", () => {
  const h = harness();
  assert.equal(h.submit({ submissionId: uuid.toUpperCase() }).ok, true);
  assert.equal(h.submit({ submissionId: uuid }).duplicate, true);
  assert.equal(h.rows.length, 2);
});


test("readiness endpoint verifies authenticated storage without writing", () => {
  const h = harness();
  function call(value) {
    return JSON.parse(h.context.doPost({
      postData: { contents: JSON.stringify({ secret: value }) },
      parameter: { health: "1" },
    }).body);
  }
  assert.equal(call("invalid").ok, false);
  const healthy = call(baseLead.secret);
  assert.equal(healthy.ok, true);
  assert.equal(healthy.service, "bredge-workbook");
  assert.equal(healthy.workbookId, "1FtGA32FXrJ2TK-AOXUJC62hfVj8jpxEsJoWK0M4nAlw");
  assert.equal(healthy.revision, "bredge-leads-v3-20261015");
  assert.equal(h.rows.length, 1);
  assert.equal(h.emails.length, 0);
});
