import test from "node:test";
import assert from "node:assert/strict";
import { missingLeadSecretNames } from "../scripts/assert-lead-secrets.mjs";

test("missing webhook secrets must block release", () => {
  assert.deepEqual(missingLeadSecretNames([]), ["GOOGLE_LEADS_WEBHOOK_URL", "GOOGLE_LEADS_WEBHOOK_SECRET"]);
  assert.deepEqual(missingLeadSecretNames([{ name: "GOOGLE_LEADS_WEBHOOK_URL" }]), ["GOOGLE_LEADS_WEBHOOK_SECRET"]);
});

test("both configured secret names satisfy presence preflight only", () => {
  assert.deepEqual(missingLeadSecretNames([
    { name: "GOOGLE_LEADS_WEBHOOK_URL", type: "secret_text" },
    { name: "GOOGLE_LEADS_WEBHOOK_SECRET", type: "secret_text" },
  ]), []);
});

test("invalid Cloudflare inventory cannot pass", () => {
  assert.throws(() => missingLeadSecretNames({ names: [] }), /Expected an array/);
  assert.deepEqual(missingLeadSecretNames([null, { name: 123 }]), ["GOOGLE_LEADS_WEBHOOK_URL", "GOOGLE_LEADS_WEBHOOK_SECRET"]);
});
