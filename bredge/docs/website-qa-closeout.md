# The Bredge website QA and closeout gate

Authoritative policy: [Website Launch QA v2.0](https://app.notion.com/p/3c5ab0bfbea581de9b47c90d59774099). The reusable contract is under `../../tooling/website-release-gate/`. The profile is in `../.website-qa/profile.json`.

## Observed evidence, 14 October 2026

- Live production at `https://thebredge.com/__build` reports SHA `0e09a43b558714f99ca2738ed96137f84a1ab549`. This is the old live build, not the proposed QA revision.
- The site verifier checks redirects, HTTPS, canonical tags, indexability, 26 sitemap URLs, 10 insights, 6 resources, structured data, real favicon, and 404. Its old crawler challenge check falsely counted Cloudflare's ordinary JavaScript Detection bootstrap on HTTP 200 pages. The revised check requires real challenge markers plus expected canonical content.
- The current preview `https://bredge.thebredge.workers.dev/__build` reports the same SHA as production. **Staging isolation is unverified.** This preview cannot independently prove a new candidate has been deployed.
- The website uses `npm test`, `npm run lint`, and Chromium browser QA against its Worker build. All must actually run in GitHub, with a real secret scan.
- GitHub's Cloudflare environment has protected-branch policy, an approval requirement, and an existing API environment secret. The scope of that existing secret and direct Cloudflare OAuth rights are **unverified**.

## Enforced release design

The workflow runs `bredge-quality` and `bredge-secret-scan` for pull requests and pushes. A push or PR cannot publish. Deployment requires a manual workflow dispatch on protected `main`, the exact reviewed SHA, passing checks, an approving human in the GitHub Cloudflare environment, a fresh build, verified public SHA and a live route smoke test. A failed smoke leaves the release blocked and requires an operator-led rollback to a known healthy Cloudflare version. This is a planned control until the final GitHub Actions run and first approved release prove it.

## Blockers to actual closeout

- Obtain independent GitHub PR review and owner approval.
- Prove a truly isolated remote preview of the proposed source SHA.
- Independently verify contact-form delivery, consent/privacy, accessibility, runtime performance, security and monitoring. Unknown controls remain `NOT_TESTED`.
- Restrict direct production OAuth and audit the existing Cloudflare API token only after proving the new protected path, without affecting unrelated Workers.
- Verify the live deployment SHA, handover, rollback and accountable owner acceptance.

**Current status: ENFORCEMENT_PARTIAL / CLOSEOUT_BLOCKED.** A green build or launch checklist is insufficient evidence of completion.
