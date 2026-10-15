import test from "node:test";
import assert from "node:assert/strict";
import { enforceContactRateLimit } from "../lib/contact-rate-limit.ts";

const target = "https://thebredge.com/api/contact";
const withIp = (url = target, method = "POST", ip = "203.0.113.31") =>
  new Request(url, { method, headers: { "CF-Connecting-IP": ip } });

test("GETs never consume quota; every POST does, including alternative contact URLs", async () => {
  const keys = [];
  const limiter = { limit: async ({key}) => { keys.push(key); return { success: true }; } };
  assert.equal(await enforceContactRateLimit(withIp("https://thebredge.com/contact", "GET"), limiter), null);
  assert.equal(await enforceContactRateLimit(withIp(target, "GET"), limiter), null);
  for (const path of ["/api/contact", "/api/contact/", "//api/contact", "/api/%63ontact", "/api/contact;x", "/contact"]) {
    assert.equal(await enforceContactRateLimit(withIp("https://thebredge.com" + path), limiter), null);
  }
  assert.equal(keys.length, 6);
  assert.equal(new Set(keys).size, 1, "Alternative path spellings must share one quota");
});

test("valid contact consumes a Cloudflare-native, host-scoped IP quota", async () => {
  const keys = [];
  const limiter = { limit: async ({ key }) => { keys.push(key); return { success: true }; } };
  assert.equal(await enforceContactRateLimit(withIp(), limiter), null);
  assert.equal(await enforceContactRateLimit(withIp("https://bredge-release-qa.thebredge.workers.dev/api/contact"), limiter), null);
  assert.deepEqual(keys, [
    "thebredge.com:contact:203.0.113.31",
    "bredge-release-qa.thebredge.workers.dev:contact:203.0.113.31",
  ]);
});

test("missing or failed limiter fails closed instead of forwarding a lead", async () => {
  assert.equal((await enforceContactRateLimit(withIp()))?.status, 503);
  assert.equal((await enforceContactRateLimit(withIp(), { limit: async () => { throw new Error("down"); } }))?.status, 503);
  assert.equal((await enforceContactRateLimit(withIp(), { limit: async () => ({ success: false }) }))?.status, 429);
});

test("rate limited users receive an actionable error, no fabricated success", async () => {
  const response = await enforceContactRateLimit(withIp(), { limit: async () => ({ success: false }) });
  assert.equal(response?.status, 429);
  assert.equal(response?.headers.get("retry-after"), "60");
  const body = await response?.json();
  assert.match(body?.error, /try again in a minute/i);
  assert.notEqual(body?.ok, true);
});

test("missing Cloudflare IP uses one conservative non-bypass bucket", async () => {
  let key;
  const limiter = { limit: async (i) => { key = i.key; return { success: true }; } };
  assert.equal(await enforceContactRateLimit(new Request(target, { method: "POST", headers: { "X-Forwarded-For": "8.8.8.8" } }), limiter), null);
  assert.equal(key, "thebredge.com:contact:unknown");
});
