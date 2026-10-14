import test from "node:test";
import assert from "node:assert/strict";
import { validateLeadSubmissionGuard } from "../lib/contact-guard.ts";

test("normal elapsed forms proceed to webhook validation", () => {
  assert.equal(validateLeadSubmissionGuard({ company_website: "", elapsedMs: 1200 }), null);
  assert.equal(validateLeadSubmissionGuard({ elapsedMs: 7800 }), null);
});

test("autofill or suspiciously fast form cannot receive fabricated 200", () => {
  const rejected = validateLeadSubmissionGuard({ company_website: "", elapsedMs: 200 });
  assert.equal(rejected?.status, 422);
  assert.match(rejected?.error || "", /wait a moment/i);
});

test("hidden field false positive is a visible, honest error", () => {
  const rejected = validateLeadSubmissionGuard({ company_website: "https://example.com", elapsedMs: 10000 });
  assert.equal(rejected?.status, 422);
  assert.match(rejected?.error || "", /email hello@thebredge.com/);
});

test("missing, malformed or non-finite elapsedMs fails closed", () => {
  for (const candidate of [null, [], {}, { elapsedMs: "2000" }, { elapsedMs: -4 }, { elapsedMs: Infinity }, { elapsedMs: NaN }]) {
    const denied = validateLeadSubmissionGuard(candidate);
    assert.ok(denied && denied.status >= 400, "invalid input got success: " + String(candidate));
  }
});
