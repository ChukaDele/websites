import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync, mkdtempSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { missingLeadSecretNames, REQUIRED_LEAD_SECRET_NAMES } from "../scripts/assert-lead-secrets.mjs";

const cli = fileURLToPath(new URL("../scripts/assert-lead-secrets-cli.mjs", import.meta.url));
const all = ["GOOGLE_LEADS_WEBHOOK_URL", "GOOGLE_LEADS_WEBHOOK_SECRET"];
const items = all.map((name) => ({ name, type: "secret_text" }));

function invokeCli(input, path = cli) {
  return spawnSync(process.execPath, [path], { input, encoding: "utf8", timeout: 10000 });
}

test("both Google webhook secrets are required; CAPTCHA is not a browser dependency", () => {
  assert.deepEqual(REQUIRED_LEAD_SECRET_NAMES, all);
  assert.deepEqual(missingLeadSecretNames([]), all);
  assert.deepEqual(missingLeadSecretNames([items[0]]), all.slice(1));
  assert.deepEqual(missingLeadSecretNames(items), []);
});

test("actual CLI fails closed for malformed, empty or partial inventory", () => {
  for (const input of [
    "", "Cloudflare CLI output\n[]", '{"names":[]}', "[]",
    JSON.stringify(items.slice(0, 1)),
  ]) {
    const result = invokeCli(input);
    assert.notEqual(result.status, 0, "unexpected CLI pass: " + input);
    assert.match(result.stderr, /RELEASE_BLOCKED/);
  }
});

test("actual CLI reports presence of both Google without claiming real delivery", () => {
  const result = invokeCli(JSON.stringify(items));
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /WORKER_LEAD_SECRET_NAMES_PRESENT/);
});

test("invalid inventory cannot pass with fabricated names or wrong types", () => {
  assert.throws(() => missingLeadSecretNames({ names: all }), /Expected an array/);
  assert.deepEqual(missingLeadSecretNames([null, { name: 17 }]), all);
});

test("symlinked CLI never bypasses the production secret check", () => {
  const dir = mkdtempSync(join(tmpdir(), "bredge-lead-symlink-"));
  try {
    const linked = join(dir, "preflight.mjs");
    symlinkSync(cli, linked);
    const result = invokeCli("[]", linked);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /RELEASE_BLOCKED/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("built Worker name must match approved production Worker", () => {
  const worker = JSON.parse(readFileSync(new URL("../dist/server/wrangler.json", import.meta.url), "utf8"));
  assert.equal(worker.name, "bredge");
});
