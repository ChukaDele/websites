import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

const workflow = readFileSync(
  new URL("../../.github/workflows/deploy-bredge.yml", import.meta.url),
  "utf8"
);

test("push and manual releases share a non-cancelling concurrency group for each ref", () => {
  const concurrency = workflow.split("\nconcurrency:\n")[1]?.split("\njobs:\n")[0];
  assert.ok(concurrency);
  assert.match(concurrency, /^  group: bredge-\$\{\{ github\.ref \}\}$/m);
  assert.match(concurrency, /^  cancel-in-progress: false$/m);
  assert.doesNotMatch(concurrency, /github\.event_name|github\.run_id|github\.sha/);
});

test("production depends on the same-run validator-tests required check", () => {
  const validator = workflow.split("  validator-tests:")[1]?.split("  bredge-secret-scan:")[0];
  assert.ok(validator);
  assert.match(validator, /name: validator-tests/);
  assert.match(validator, /python -m unittest discover -s tooling\/website-release-gate\/tests -v/);
  assert.match(workflow, /needs: \[bredge-quality, bredge-secret-scan, validator-tests, bredge-release-preflight\]/);
  assert.equal(existsSync(new URL("../../.github/workflows/website-release-gate-tests.yml", import.meta.url)), false);
});

test("publishing rechecks main after rollback capture and before any deployment attempt", () => {
  const publish = workflow.split("- name: Publish validated code and secret bindings atomically")[1]
    .split("- name: Prove live production build")[0];
  assert.match(publish, /GH_TOKEN: \$\{\{ github.token \}\}/);
  const guard = publish.indexOf('current_main="$(gh api');
  assert.ok(guard > publish.indexOf('echo "previous_sha=$previous_sha"'));
  const guarded = publish.slice(guard);
  assert.match(guarded, /if \[\[ "\$current_main" != "\$GITHUB_SHA" \]\]; then[\s\S]*?exit 1\s+fi/);
  assert.ok(guard < publish.indexOf('echo "attempted=true"'));
  assert.ok(guard < publish.indexOf('npx --no-install wrangler deploy -c'));
});

test("production accepts validated main pushes or exact-SHA manual retries, never a PR", () => {
  assert.match(workflow, /if: github\.event_name == 'workflow_dispatch' \|\| \(github\.event_name == 'push' && github\.ref == 'refs\/heads\/main'\)/);
  assert.match(workflow, /REQUESTED_SHA: \$\{\{ github\.event_name == 'workflow_dispatch' && inputs\.release_sha \|\| github\.sha \}\}/);
  assert.doesNotMatch(workflow.slice(workflow.indexOf("  bredge-production:")), /if:\s*github\.event_name == 'pull_request'/);
  assert.match(workflow, /environment:\s*\n\s*name: Cloudflare/);
  assert.match(workflow, /current_main=.*gh api/);
  assert.match(workflow, /REQUESTED_SHA.*GITHUB_SHA/);
});

test("live fingerprint uses the validated SHA for automatic pushes and manual retries", () => {
  const live = workflow.split("- name: Prove live production build and critical public routes")[1]
    .split("- name: Restore previous Worker version")[0];
  assert.match(live, /EXPECTED_SHA: \$\{\{ github\.event_name == 'workflow_dispatch' && inputs\.release_sha \|\| github\.sha \}\}/);
  assert.match(live, /--arg sha "\$EXPECTED_SHA" '\.sha == \$sha and \.worker == "bredge"'/);
});

test("Google workbook and native rate-limit binding are verified before release", () => {
  const preflight = workflow.indexOf("Verify Google webhook readiness and native rate limit");
  const deploy = workflow.indexOf("Publish validated code and secret bindings atomically");
  assert.ok(preflight >= 0 && deploy > preflight);
  assert.match(workflow.slice(preflight, deploy), /verify-contact-rate-limit-config-cli/);
  assert.match(workflow.slice(preflight, deploy), /workbookId == \$wb and \.revision == \$rev/);
  assert.doesNotMatch(workflow.slice(preflight, deploy), /verify-turnstile-prod-cli/);
});

test("production code and new secrets publish in one Worker version", () => {
  const deploy = workflow.slice(workflow.indexOf("Publish validated code and secret bindings atomically"));
  assert.match(deploy, /wrangler deploy -c dist\/server\/wrangler\.json --secrets-file \/dev\/stdin/);
  assert.doesNotMatch(workflow, /\bwrangler (?:secret (?:put|bulk)|versions secret (?:put|bulk))\b/);
  assert.match(deploy, /Previous Worker version for rollback/);
  assert.match(deploy, /npx --no-install wrangler/);
});

test("CI validates a real Wrangler build with the atomic delivery interface", () => {
  assert.match(workflow, /Verify atomic Worker deployment packaging without publishing/);
  assert.match(workflow, /wrangler deploy -c dist\/server\/wrangler\.json --dry-run --secrets-file \/dev\/stdin/);
});

test("live negative-contact smoke is required after production route checks", () => {
  assert.match(workflow, /bash scripts\/verify-contact-negatives\.sh http:\/\/127\.0\.0\.1:8787 local/);
  assert.match(workflow, /bash scripts\/verify-contact-negatives\.sh https:\/\/thebredge\.com production/);
});
