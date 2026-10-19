# Website Release and Closeout Gate v1

Reusable evidence-contract validator for the canonical [Website Launch QA SOP](https://app.notion.com/p/3c5ab0bfbea581de9b47c90d59774099) in GBrain. Covers 47 controls, including 19 visible in the Instagram reel. Python 3.11+, standard library only. Fail-closed by default.

**Two controls are different:**
1. The validator detects missing, stale, wrong-commit, unreviewed, waived or non-applicable release evidence and exits 1 on blockers.
2. CI and hosting workflows must actually run build, browser, security and integration tests. A valid JSON manifest does not prove these tests passed. GitHub required status checks and protected deployments enforce the result. Without protection the standard is only advisory.

## Files
- catalog.json: 47 QA contracts and their phases.
- validate.py: intake/build/prelaunch/live/closeout validator.
- scaffold.py: creates a NOT_TESTED evidence template for a specific release SHA; refuses overwrite.
- tests/test_validator.py: unit and adversarial contract tests.
- .github/workflows/website-release-gate.yml: reusable GitHub Actions workflow hosted in ChukaDele/websites.

## New project intake
In each website repository, create a versioned .website-qa/profile.json with real project values:

~~~json
{
  "schema_version": 1,
  "project": "Client website",
  "repository": "org/site-repository",
  "site_type": "leadgen",
  "production_url": "https://www.example.com",
  "staging_url": "https://preview.example.com",
  "markets": ["GB"],
  "critical_journeys": ["Enquiry CTA -> validation -> confirmed lead inbox/CRM"],
  "owners": {
    "builder": "Implementation agent (execution role)",
    "reviewer": "Independent QA agent (separate context)",
    "approver": "Release verification agent (separate context)"
  }
}
~~~

Use the real domain, journeys, market and identities. Never promote this example as real configuration. URLs must use HTTPS.

~~~sh
python3 tooling/website-release-gate/validate.py --catalog tooling/website-release-gate/catalog.json --profile .website-qa/profile.json --phase intake
~~~

The intake gate may become a required PR status check. Also require app build, tests, axe/keyboard/browser tests, link checking, secret/dependency scan, privacy integration tests and performance budgets appropriate to the site.

## Prelaunch and closeout
Evidence must bind to the actual deployed candidate source commit and be generated/reviewed separately from the source tree being released. Never commit an evidence file referencing the HEAD SHA to the same branch and expect it to remain valid: the new commit changes the SHA.

~~~sh
SHA="$(git rev-parse HEAD)"
python3 tooling/website-release-gate/scaffold.py --catalog tooling/website-release-gate/catalog.json --sha "$SHA" --output /tmp/website-evidence.json
# Attach actual CI results, independent QA-agent evidence, and release-verifier acceptance.
python3 tooling/website-release-gate/validate.py --catalog tooling/website-release-gate/catalog.json --profile .website-qa/profile.json --evidence /tmp/website-evidence.json --sha "$SHA" --phase closeout --report /tmp/website-closeout-report.json
~~~

For each PASS: status, HTTPS evidence_url, release_sha, observed_at ISO 8601 timezone, tested_by and reviewed_by. P0/P1 reviewer must be separate from the builder agent; PASS tester and QA reviewer must be independent executions. For NOT_APPLICABLE: only conditional controls, with reason and independent reviewer. P1 owner-approved WAIVED controls need risk reason, mitigation, ticket, approver and unexpired deadline; P0 and non-waivable legal/privacy/security checks cannot be waived. P2 may be DEFERRED with issue, owner and due date. All other open controls fail. Prelaunch/live/closeout approvals must bind to the same SHA.

The scaffold sets all 47 controls to NOT_TESTED. It never manufactures evidence. Legal, privacy, consent, accessibility, uptime and delivery evidence remain mandatory. An agent report counts only when backed by actual test artefacts and provider confirmations. Obtain qualified human review where law or contract requires it.

## GitHub Actions adoption
A public reusable workflow lives at .github/workflows/website-release-gate.yml in ChukaDele/websites. Each website calls it from its own workflow using an immutable full commit SHA of the audited standard and the same SHA as standard_ref input:

~~~yaml
name: Website QA
on:
  pull_request:
jobs:
  intake-contract:
    uses: ChukaDele/websites/.github/workflows/website-release-gate.yml@<PINNED_40_CHAR_COMMIT_SHA>
    with:
      standard_ref: <SAME_PINNED_40_CHAR_COMMIT_SHA>
      phase: intake
      profile_path: .website-qa/profile.json
~~~

Replace placeholders after merging and auditing the standards repository. Set the status check as required in the site's branch ruleset. Require build/test/browser/security checks and independent QA-agent evaluation. Human GitHub PR review is optional for an owner-operated project.

To run prelaunch/live/closeout automatically, prepare evidence JSON as a CI artifact for the deployed candidate SHA, base64 encode it, and pass its string to the reusable workflow evidence_base64 input. The workflow decodes to a temporary file and fails closed on missing/invalid input. Never include personal data, tokens or secrets in evidence files or logs.

The reusable workflow validates the contract. It does NOT run Lighthouse, Playwright, axe, inspect evidence URLs, configure protections, or prevent someone with direct deployment rights from bypassing it.

## Enforcing across projects
1. A new repo includes .website-qa/profile.json with real values and reusable gate on every PR.
2. Required checks include intake-contract, build/test, browser/accessibility, secrets/dependencies, and critical end-to-end journeys.
3. Protect production branch with required status checks and PR creation, but zero mandatory human approvals for an owner-operated project. Do not bypass tests. Protect deployments in Vercel/Cloudflare/other host and control direct CLI deploy rights.
4. Prelaunch and live tests generate evidence. Block project DONE/handover without passing closeout report and accountable owner approval.
5. Postlaunch monitoring and support ownership is documented. Track exceptions with deadlines.

Status vocabulary: BUILD_GREEN, PRELAUNCH_APPROVED, LIVE_VERIFIED, CLOSEOUT_EVIDENCE_PASS, CLOSEOUT_BLOCKED, ENFORCEMENT_PARTIAL. CLOSEOUT_EVIDENCE_PASS is evidence completeness, not proof of production enforcement.

## Reference standards
W3C WCAG 2.2 AA, web.dev Core Web Vitals, OWASP Secure Headers, ICO cookies guidance, Google Search Central. See the canonical Notion SOP for applicability.

## Security model and non-bypass requirements

WARNING: The JSON approvals are untrusted assertions, even when the validator reports PASS. Names and evidence URLs are editable strings. The validator checks data shape, freshness, commit consistency and separation of identity labels. It does not authenticate reviewers, open evidence links, or prove real tests were run.

Mandatory external controls for each website repository:
- Use an organisation or repository ruleset requiring a centrally managed workflow, or independently administered equivalent. Otherwise a PR can replace its caller workflow with a fake success under the same job name.
- Keep CODEOWNERS for traceability. For a single-owner repository, do not require a second GitHub user as code-owner; enforce required checks and SHA-bound evidence from separate build, QA and release-agent roles.
- For owner-only releases, remove required-human-review gates in the Cloudflare GitHub Environment. Keep exact-SHA deployment, secret checks and authentic CI evidence. Agent role strings do not count as GitHub review approvals.
- Protect production against bypass by direct Cloudflare/Vercel/CLI actions. Match live deployment commit to the exact CI-tested release commit.
- Make both contract checks and real build, browser, accessibility, performance, security and application-specific integration tests required on the protected branch.
- The reusable caller must use a validated pinned commit SHA and match the latest main standard. Update pinned refs on new standard releases.
- Evidence base64 is only for small, non-sensitive metadata. Do not include customer details, credentials, secrets or contact-form payloads in Actions inputs or logs. Prefer secure artifact retrieval for large test evidence.
- Keep the final SHA-bound evidence pack and issue register outside untrusted PR content. Confirm LIVE_VERIFIED only after independently checked provider responses, site smoke tests and real delivery evidence.

Until the actual host permissions and test runs are verified on the target repository, release enforcement is ENFORCEMENT_PARTIAL. This source repository PR installs the mechanism, but does not change or protect production websites on its own.