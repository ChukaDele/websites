import test from "node:test";
import assert from "node:assert/strict";
import { isSavedLeadReceipt } from "../lib/lead-receipt.ts";

const uuid = "11111111-1111-4111-8111-111111111111";
const savedId = "BR-" + uuid;

test("Apps Script success requires the exact Google Sheets BR-UUID", () => {
  assert.equal(isSavedLeadReceipt({ ok: true, id: savedId, notificationSent: true }, uuid), true);
  assert.equal(isSavedLeadReceipt({ ok: true, id: savedId, notificationSent: false }, uuid), true);
});

test("duplicate retry remains a valid receipt without a second write", () => {
  assert.equal(isSavedLeadReceipt({ ok: true, id: savedId, duplicate: true }, uuid), true);
});

test("HTTP 200 JSON {ok:false} is never a successful lead receipt", () => {
  for (const error of ["lead sheet write failed", "lead pipeline temporarily busy", "unauthorized"]) {
    assert.equal(isSavedLeadReceipt({ ok: false, id: savedId, error }, uuid), false);
  }
});

test("missing, wrong, malformed or non-JSON webhook receipts always fail closed", () => {
  for (const value of [
    null, undefined, {}, "not JSON", "<html>Google sign-in</html>", [],
    { ok: true }, { ok: true, id: "BR-different" },
    { ok: true, id: "BR-22222222-2222-4222-8222-222222222222" },
    { ok: "true", id: savedId }, { ok: true, id: null },
  ]) {
    assert.equal(isSavedLeadReceipt(value, uuid), false);
  }
  assert.equal(isSavedLeadReceipt({ ok: true, id: savedId }, "not-a-uuid"), false);
});
