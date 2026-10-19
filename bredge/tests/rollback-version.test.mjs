import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { selectCurrentWorkerVersion } from "../scripts/select-rollback-version.mjs";

const a = "11111111-1111-4111-8111-111111111111";
const b = "22222222-2222-4222-8222-222222222222";
const record = (iso, versions) => ({ created_on: iso, versions });
const full = (id) => [{ version_id: id, percentage: 100 }];
const latest = record("2026-10-15T12:00:00Z", full(b));
const older = record("2026-10-14T12:00:00Z", full(a));
const cli = fileURLToPath(new URL("../scripts/select-rollback-version-cli.mjs", import.meta.url));

test("identifies the newest unambiguously active 100% Worker version", () => {
  assert.equal(selectCurrentWorkerVersion([older, latest]), b);
  assert.equal(selectCurrentWorkerVersion([latest, older]), b);
});

test("a newer split deployment cannot silently fall back to an older deployment", () => {
  const split = record("2026-10-16T12:00:00Z", [
    { version_id: a, percentage: 50 }, { version_id: b, percentage: 50 },
  ]);
  assert.throws(() => selectCurrentWorkerVersion([older, split]), /not a single 100%/);
});

test("a newer malformed or empty deployment fails closed", () => {
  assert.throws(() => selectCurrentWorkerVersion([]), /No Worker deployment/);
  assert.throws(() => selectCurrentWorkerVersion([record("bad", full(a))]), /timestamp/);
  assert.throws(() => selectCurrentWorkerVersion([record("2026-10-16T12:00:00Z", [])]), /not a single/);
  assert.throws(() => selectCurrentWorkerVersion([record("2026-10-16T12:00:00Z", full("invalid"))]), /identifier/);
});

test("production CLI rejects split deployment and writes no misleading SHA", () => {
  const split = record("2026-10-16T12:00:00Z", [
    { version_id: a, percentage: 50 }, { version_id: b, percentage: 50 },
  ]);
  const failed = spawnSync(process.execPath, [cli], {
    input: JSON.stringify([older, split]), encoding: "utf8", timeout: 10_000,
  });
  assert.notEqual(failed.status, 0);
  assert.match(failed.stderr, /RELEASE_BLOCKED/);
  assert.equal(failed.stdout, "");
  const succeeded = spawnSync(process.execPath, [cli], {
    input: JSON.stringify([older, latest]), encoding: "utf8", timeout: 10_000,
  });
  assert.equal(succeeded.status, 0);
  assert.equal(succeeded.stdout.trim(), b);
});
