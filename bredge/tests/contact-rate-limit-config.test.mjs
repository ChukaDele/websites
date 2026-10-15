import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { verifyContactRateLimitConfig, CONTACT_RATE_LIMIT_SPEC } from "../scripts/verify-contact-rate-limit-config.mjs";

const configPath = new URL("../dist/server/wrangler.json", import.meta.url);
const config = JSON.parse(readFileSync(configPath, "utf8"));
test("generated, deployable Worker has native contact limit binding with pinned quota", () => {
  assert.equal(verifyContactRateLimitConfig(config), true);
  assert.deepEqual(config.ratelimits.filter((x) => x.name === CONTACT_RATE_LIMIT_SPEC.name), [{
    name: CONTACT_RATE_LIMIT_SPEC.name, namespace_id: CONTACT_RATE_LIMIT_SPEC.namespace_id,
    simple: { limit: CONTACT_RATE_LIMIT_SPEC.limit, period: CONTACT_RATE_LIMIT_SPEC.period },
  }]);
});
test("missing binding or weaker quota is rejected by the actual config checker", () => {
  for (const bad of [
    { ...config, ratelimits: [] },
    { ...config, ratelimits: [{ ...config.ratelimits[0], simple: { limit: 100000, period: 60 } }] },
    { ...config, ratelimits: [...config.ratelimits, config.ratelimits[0]] },
    { ...config, name: "surfacetalent" },
  ]) assert.throws(() => verifyContactRateLimitConfig(bad));
});
test("release CLI fails closed with a missing config file", () => {
  const r = spawnSync(process.execPath, ["scripts/verify-contact-rate-limit-config-cli.mjs", "/no/config/here.json"], { encoding: "utf8" });
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /RELEASE_BLOCKED/);
});
