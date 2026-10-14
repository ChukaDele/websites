import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync, mkdtempSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { missingLeadSecretNames } from "../scripts/assert-lead-secrets.mjs";

const cli = fileURLToPath(new URL("../scripts/assert-lead-secrets-cli.mjs", import.meta.url));

function invokeCli(input, path = cli) {
  return spawnSync(process.execPath, [path], { input, encoding: "utf8", timeout: 10000 });
}

test("missing webhook bindings prevent release", () => {
  assert.deepEqual(missingLeadSecretNames([]), ["GOOGLE_LEADS_WEBHOOK_URL", "GOOGLE_LEADS_WEBHOOK_SECRET"]);
  assert.deepEqual(missingLeadSecretNames([{ name: "GOOGLE_LEADS_WEBHOOK_URL" }]), ["GOOGLE_LEADS_WEBHOOK_SECRET"]);
});

test("presence of both names passes presence check only", () => {
  assert.deepEqual(missingLeadSecretNames([
    { name: "GOOGLE_LEADS_WEBHOOK_URL" },
    { name: "GOOGLE_LEADS_WEBHOOK_SECRET" },
  ]), []);
});

test("malformed inventories fail closed", () => {
  assert.throws(() => missingLeadSecretNames({ names: [] }), /Expected an array/);
  assert.deepEqual(missingLeadSecretNames([null, { name: 17 }]), ["GOOGLE_LEADS_WEBHOOK_URL", "GOOGLE_LEADS_WEBHOOK_SECRET"]);
});

test("actual CLI rejects empty, non-JSON, invalid and missing inventories", () => {
  for (const input of ["", "Cloudflare CLI output\n[]", "{\"names\":[]}", "[]", "[{\"name\":\"GOOGLE_LEADS_WEBHOOK_URL\"}]"]) {
    const result = invokeCli(input);
    assert.notEqual(result.status, 0, "unexpected CLI PASS for " + JSON.stringify(input));
    assert.match(result.stderr, /RELEASE_BLOCKED/);
  }
});

test("actual CLI confirms both names without proving delivery", () => {
  const result = invokeCli(JSON.stringify([
    { name: "GOOGLE_LEADS_WEBHOOK_URL" },
    { name: "GOOGLE_LEADS_WEBHOOK_SECRET" },
  ]));
  assert.equal(result.status, 0);
  assert.match(result.stdout, /WORKER_LEAD_SECRET_NAMES_PRESENT/);
});

test("symlinked CLI cannot bypass validation", () => {
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
