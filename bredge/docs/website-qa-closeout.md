# The Bredge website QA and closeout gate

Authoritative policy: [Website Launch QA v2.0](https://app.notion.com/p/3c5ab0bfbea581de9b47c90d59774099). The reusable contract is under `../../tooling/website-release-gate/`. The profile is in `../.website-qa/profile.json`.

## Observed evidence, 14 October 2026

- Live production at `https://thebredge.com/__build` reports SHA `0e09a43b558714f99ca2738ed96137f84a1ab549`. This is the old live build, not the proposed QA revision.
- The site verifier checks redirects, HTTPS, canonical tags, indexability, 26 sitemap URLs, 10 insights, 6 resources, structured data, real favicon, and 404. Its old crawler challenge check falsely counted Cloudflare's ordinary JavaScript Detection bootstrap on HTTP 200 pages. The revised check requires real challenge markers plus expected canonical content.
- The current preview `https://bredge.thebredge.workers.dev/__build` reports the same SHA as production. **Staging isolation is unverified.** This preview cannot independently prove a new candidate has been deployed.
- The website uses `npm test`, `npm run lint`, and Chromium browser QA against its Worker build. All must actually run in GitHub, with a real secret scan.
- GitHub's Cloudflare environment has protected-branch policy, an approval requirement, and an existing API environment secret. The scope of that existing secret and direct Cloudflare OAuth rights are **unverified**.

## Enforced release design

The workflow runs `bredge-quality` and `bredge-secret-scan` for pull requests and pushes. A push or PR cannot publish. Deployment requires a manual workflow dispatch on protected `main`, the exact reviewed SHA, passing checks, an approving human in the GitHub Cloudflare environment, the exact Chromium-tested artifact, verified public SHA and a live route smoke test. A failed smoke leaves the release blocked and automatically attempts a verified rollback to the recorded previous Worker version. This is a planned control until the final GitHub Actions run and first approved release prove it.

## Blockers to actual closeout

- Obtain independent GitHub PR review and owner approval.
- Prove a truly isolated remote preview of the proposed source SHA.
- Independently verify contact-form delivery, consent/privacy, accessibility, runtime performance, security and monitoring. Unknown controls remain `NOT_TESTED`.
- Restrict direct production OAuth and audit the existing Cloudflare API token only after proving the new protected path, without affecting unrelated Workers.
- Verify the live deployment SHA, handover, rollback and accountable owner acceptance.

**Current status: ENFORCEMENT_PARTIAL / CLOSEOUT_BLOCKED.** A green build or launch checklist is insufficient evidence of completion.

## P0: production contact enquiry pipeline unavailable

On 14 October 2026, a labeled synthetic, otherwise-valid submission to https://thebredge.com/api/contact returned HTTP 503. The response explicitly said form delivery was not configured. Cloudflare reported no configured secrets for Worker bredge. The intended owner Google workbook has only headers in Leads and Bookings. This is tracked in https://github.com/ChukaDele/websites/issues/13.

The Google Apps Script project is bound to the original Bredge workbook. A separate authorized `bredge-leads` clasp profile has pushed the reviewed source and deployed **v4 using the existing deployment ID** using the existing deployment ID. Google service access is now `ANYONE_ANONYMOUS` with a high-entropy shared-secret gate. Missing/wrong-secret health probes reject, and a correct-secret health probe matches the pinned workbook and revision. The app's `WEBHOOK_SECRET` and `CAL_WEBHOOK_SECRET` are saved in owner Project Settings; Sheets/Mail/Trigger consent was granted and the 15-minute retry trigger was observed. One synthetic direct-to-Google lead reached exactly one Sheet row and owner notification email; replay was deduplicated. No webhook secret values have been committed or shared in chat.

The manual production job first requires a successful authenticated Google workbook health probe and a production Turnstile Siteverify probe. It then publishes the exact Chromium-tested artifact with `GOOGLE_LEADS_WEBHOOK_URL`, `GOOGLE_LEADS_WEBHOOK_SECRET`, and `TURNSTILE_SECRET_KEY` in a single Worker version, using Wrangler's atomic `--secrets-file /dev/stdin` route. Its post-deploy inventory check requires all three secret names. Passing these checks still cannot prove a submitted lead was saved or that the notification arrived. The prior Worker version and observed SHA are captured, with a conditional rollback step on release failure. This production route remains **untested** until authorized deployment.

To close: approve Sheets and Mail permissions for the already-authorized private Apps Script, set the appropriate Script Properties, deploy the web app with authenticated shared-secret handling, configure the Worker secrets securely, confirm one actual QA contact enquiry in the correct workbook and a received notification, review Turnstile/anti-abuse, then repeat browser/production and handover tests. Status remains CLOSEOUT_BLOCKED.


### Google readiness handshake and Turnstile gate (pending human configuration)

A protected GitHub environment step now performs an authenticated, non-mutating Apps Script `?health=1` request before accessing the Cloudflare deploy credential. Missing/invalid webhook URL, secret or Turnstile inputs cause an immediate failure. Only after readiness and owner approval does it provision Worker secrets and permit a deploy. The v4 Apps Script `/exec` service has passed authenticated read-only health and synthetic delivery tests, but no reviewed production Worker deployment has been performed. Current release remains blocked.

### Isolated Cloudflare preview candidate

Candidate preview origin `https://bredge-release-qa.thebredge.workers.dev` has been configured in the form origin allowlist and authorized Turnstile widget hostnames. The Worker sets `X-Robots-Tag: noindex, nofollow` on all nonproduction host responses. **Do not assert isolated preview deployment or browser QA has passed until an actual Cloudflare deploy and remote browser test provide SHA-bound proof.**
