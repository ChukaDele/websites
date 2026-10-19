import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const workflow = readFileSync(new URL("../../.github/workflows/deploy-bredge.yml", import.meta.url), "utf8");

test("the approved release restores precisely the browser-tested artifact", () => {
  assert.match(workflow, /Preserve browser-tested Worker bundle for controlled release/);
  assert.match(workflow, /Restore the browser-tested Worker artifact in this same CI run/);
  assert.match(workflow, /diff -qr dist qa-bundle-roundtrip/);
  assert.match(workflow, /include-hidden-files: true/);
  assert.match(workflow, /Remove Wrangler development state without altering tested deployment files/);
  assert.match(workflow, /rm -rf -- dist\/server\/\.wrangler/);
  assert.ok(workflow.indexOf("Remove Wrangler development state without altering tested deployment files") <
            workflow.indexOf("Preserve browser-tested Worker bundle for controlled release"));
  assert.match(workflow, /Restore Worker bundle verified by the Chromium QA job/);
  assert.match(workflow, /download-artifact@d3f86a106a0bac45b974a628896c90dbdf5c8093/);
});

test("a failed production deployment is recoverable without a guessed version", () => {
  assert.match(workflow, /Previous Worker version for rollback/);
  assert.match(workflow, /previous_sha=/);
  assert.match(workflow, /attempted=true/);
  assert.match(workflow, /failure\(\) && steps\.publish\.outputs\.attempted/);
  assert.match(workflow, /wrangler rollback/);
  assert.match(workflow, /Rollback attempted, but public SHA does not match/);
});
