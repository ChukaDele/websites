import test from "node:test";
import assert from "node:assert/strict";
import { requiresTurnstileSecret, verifiedTurnstileForHost } from "../lib/turnstile-policy.ts";

test("remote production and workers.dev require a configured CAPTCHA secret", () => {
  for (const hostname of ["thebredge.com", "www.thebredge.com", "bredge.thebredge.workers.dev"]) {
    assert.equal(requiresTurnstileSecret(hostname, undefined), true);
    assert.equal(requiresTurnstileSecret(hostname, ""), true);
    assert.equal(requiresTurnstileSecret(hostname, "real-secret-placeholder"), false);
  }
});

test("local development does not require a remote Turnstile account", () => {
  for (const hostname of ["localhost", "127.0.0.1", "::1"]) {
    assert.equal(requiresTurnstileSecret(hostname, undefined), false);
  }
});

test("Turnstile success must belong to the actual request host", () => {
  assert.equal(verifiedTurnstileForHost({ success: true, hostname: "thebredge.com" }, "thebredge.com"), true);
  assert.equal(verifiedTurnstileForHost({ success: true, hostname: "THEBREDGE.COM" }, "thebredge.com"), true);
  assert.equal(verifiedTurnstileForHost({ success: true, hostname: "foreign.test" }, "thebredge.com"), false);
  assert.equal(verifiedTurnstileForHost({ success: false, hostname: "thebredge.com" }, "thebredge.com"), false);
  assert.equal(verifiedTurnstileForHost({ success: true }, "thebredge.com"), false);
  assert.equal(verifiedTurnstileForHost(null, "thebredge.com"), false);
});
