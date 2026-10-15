import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { checkLiveTurnstile, validateProductionTurnstile, requireRealSecretRejectDummy, TEST_SITE_KEYS, TEST_SECRET_KEYS } from "../scripts/turnstile-release-contract.mjs";

const source = (site) => "export const TURNSTILE_SITE_KEY = \"" + site + "\";";
const exampleSite = "0x4-production-live-site-identifier";
const exampleSecret = "0x4-production-long-token-placeholder-never-deploy";

test("real-like production keys satisfy structural validation", () => {
  assert.equal(validateProductionTurnstile(source(exampleSite), exampleSecret), exampleSite);
});

test("all Cloudflare published dummy widget/secret keys are forbidden", () => {
  for (const key of TEST_SITE_KEYS) assert.throws(() => validateProductionTurnstile(source(key), exampleSecret), /test key/);
  for (const key of TEST_SECRET_KEYS) assert.throws(() => validateProductionTurnstile(source(exampleSite), key), /test key/);
  assert.throws(() => validateProductionTurnstile(source(""), exampleSecret));
  assert.throws(() => validateProductionTurnstile(source(exampleSite), ""));
});

test("a real secret must reject the deliberately invalid token", () => {
  assert.equal(requireRealSecretRejectDummy({ success: false, "error-codes": ["invalid-input-response"] }), true);
  assert.throws(() => requireRealSecretRejectDummy({ success: true, "error-codes": [] }));
  assert.throws(() => requireRealSecretRejectDummy({ success: false, "error-codes": ["invalid-input-secret"] }));
  assert.throws(() => requireRealSecretRejectDummy({ success: false, "error-codes": ["internal-error"] }));
});

test("Siteverify probe uses static HTTPS endpoint and invalid response token", async () => {
  let request;
  const fakeFetch = async (url, options) => {
    request = { url, method: options.method, token: options.body.get("response"), key: options.body.get("secret") };
    return { ok: true, json: async () => ({ success: false, "error-codes": ["invalid-input-response"] }) };
  };
  assert.equal(await checkLiveTurnstile(exampleSecret, source(exampleSite), fakeFetch), true);
  assert.equal(request.url, "https://challenges.cloudflare.com/turnstile/v0/siteverify");
  assert.equal(request.method, "POST");
  assert.equal(request.token, "qa-intentionally-invalid-token");
  assert.equal(request.key, exampleSecret);
});

test("the production CLI fails closed without a real widget secret", () => {
  const cli = fileURLToPath(new URL("../scripts/verify-turnstile-prod-cli.mjs", import.meta.url));
  const result = spawnSync(process.execPath, [cli], {
    cwd: fileURLToPath(new URL("../", import.meta.url)),
    env: { ...process.env, TURNSTILE_SECRET: "" },
    encoding: "utf8", timeout: 10000,
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /RELEASE_BLOCKED/);
});
