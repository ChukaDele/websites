# Three-agent Bredge release workflow

**PR and commit ownership:** ChukaDele. Do not add AI names in `Co-authored-by` trailers, PR coauthor credits or public bylines. The use of Claude or another model to inspect changes is internal process data.

## Distinct roles

| Role | Duty | Required evidence |
| --- | --- | --- |
| Implementation agent | Make changes under the authorized GitHub owner, verify the diff scope, build and test the candidate. | Exact SHA, changed paths, build/test references |
| Independent QA agent | Use a separate context to challenge the candidate. Verify accessibility, mobile/zoom, failure cases, source accuracy and security; run tests rather than merely evaluating code by description. Claude may be used when useful. | Dated findings, reproduction steps, test run links |
| Release verification agent | No code edits to the candidate. Check that all CI status checks passed for the exact SHA, verify production settings, deploy the test-validated artifact, check the actual live domain, contact-delivery receipt, and rollback. | Deployed SHA, HTTP smoke, provider confirmations and rollback proof |

These agents are separate execution contexts, not distinct GitHub accounts. **Never represent them as human reviewers, forge GitHub approvals, or invent test and provider evidence.** A release with missing evidence remains BLOCKED.

## Release path

1. The builder opens a PR with an honest description and only the requested scope. No `Co-authored-by` AI trailers.
2. An independent QA agent reviews the exact commit, finds defects and reruns the critical journeys. Fixes restart the review on the new SHA.
3. Required Actions checks (build, TypeScript, contract, real browser QA, secrets, negative lead tests and artefact byte-parity) must pass. The release verifier checks provider statuses, not just a claimed green summary.
4. Once a repo admin has configured owner-only merging, the owner or explicitly authorized agent can merge the green PR. All required CI checks remain mandatory.
5. A successful protected `main` push automatically enters the existing Cloudflare release job. It still requires exact main SHA, signed-in provider access, webhook health, secret bindings, release fingerprint, smoke test and rollback. A failed condition blocks release.
6. The release verifier checks `https://thebredge.com/__build` against the expected SHA, critical public pages, and a verified real lead receipt. Only then report LIVE.

## One-time GitHub settings changes needed

**Ruleset:** Settings → Rules → Rulesets → **Website SOP | PR and validated contract** → Edit. Keep **Require a pull request before merging**, required checks (`bredge-quality`, `bredge-secret-scan`, `validator-tests`), no deletion, no non-fast-forward pushes. Change **Required approving reviews** from **1 to 0**.

**Environment:** Settings → Environments → **Cloudflare**. Remove mandatory reviewers if configured; keep deploy-branch rules and protected secrets.

Neither code changes nor agent role names can edit these administrative settings through the currently connected GitHub integration. Until they are updated, self-merge and fully automatic deployment remain blocked.

## Safety and attribution

Do not bypass CI, manufacture evidence, disable secrets or silently publish preview/dashboard features. A three-agent label inside JSON is a bookkeeping identity, not proof that the agent actually ran. Legal or contractual requirements for qualified human approval still apply where required. The repo is owner-authored and tools receive no public co-author credit.
