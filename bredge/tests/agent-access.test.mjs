import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const manifest = JSON.parse(read("../public/.well-known/bredge-agent.json"));
const llms = read("../public/llms.txt");
const contact = read("../components/interactions/ContactForm.tsx");
const backend = read("../app/api/contact/route.ts");
const robots = read("../app/robots.ts");

test("agent-visible contact requirements match actual validated fields", () => {
  assert.deepEqual(manifest.user_authorised_actions.contact.required_fields,
    ["name", "email", "message"]);
  for (const condition of ["!payload.name", "!payload.message"]) {
    assert.ok(contact.includes(condition), "missing required field contract: " + condition);
  }
  assert.match(contact, /test\(payload\.email\)/);
  assert.match(backend, /if \(!name \|\| !email \|\| !company \|\| !message\)/);
  assert.equal(manifest.user_authorised_actions.contact.page, "/contact");
});

test("public agent discovery never authorizes a write bypass", () => {
  assert.equal(manifest.agent_authentication.public_write_credentials_available, false);
  assert.match(manifest.automation_policy, /same anti-abuse checks/i);
  assert.match(llms, /user-authorised/i);
  assert.match(llms, /do not invent details/i);
  assert.doesNotMatch(llms, /GOOGLE_LEADS_WEBHOOK_SECRET|TURNSTILE_SECRET_KEY/);
  assert.match(robots, /ChatGPT-User/);
  assert.match(robots, /OAI-SearchBot/);
});
