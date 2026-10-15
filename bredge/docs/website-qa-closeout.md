# The Bredge website QA and closeout gate

Authoritative policy: [Website Launch QA v2.0](https://app.notion.com/p/3c5ab0bfbea581de9b47c90d59774099). The reusable contract is under `../../tooling/website-release-gate/`. The profile is in `../.website-qa/profile.json`.

## Observed evidence, 14 October 2026

- Live production at `https://thebredge.com/__build` reports SHA `0e09a43b558714f99ca2738ed96137f84a1ab549`. This is the old live build, not the proposed QA revision.
- The site verifier checks redirects, HTTPS, canonical tags, indexability, 26 sitemap URLs, 10 insights, 6 resources, structured data, real favicon, and 404. Its old crawler challenge check falsely counted Cloudflare's ordinary JavaScript Detection bootstrap on HTTP 200 pages. The revised check requires real challenge markers plus expected canonical content.
- The previous preview `https://bredge.thebredge.workers.dev` is a production alias, not an independent staging candidate. A **distinct Cloudflare Worker** now serves `https://bredge-release-qa.thebredge.workers.dev` with an independently observed candidate SHA `3e3e112300c6aee614632b7fe0f7e17dd6681190`. The live production SHA is still `0e09a43b558714f99ca2738ed96137f84a1ab549`. Every preview page has `X-Robots-Tag: noindex, nofollow`; no production route was modified. A real Chromium run passed the route/scroll/responsive/browser QA after the SQL state assertion was changed from a fixed 700ms snapshot to a real `iq-done` wait. Four actual stage POST rejections (fast, honeypot, missing CAPTCHA, invalid CAPTCHA) returned the expected non-200 statuses.
- The website uses `npm test`, `npm run lint`, and Chromium browser QA against its Worker build. All must actually run in GitHub, with a real secret scan.
- GitHub's Cloudflare environment has protected-branch policy, an approval requirement, and an existing API environment secret. The scope of that existing secret and direct Cloudflare OAuth rights are **unverified**.

## Enforced release design

The workflow runs `bredge-quality` and `bredge-secret-scan` for pull requests and pushes. A push or PR cannot publish. Deployment requires a manual workflow dispatch on protected `main`, the exact reviewed SHA, passing checks, an approving human in the GitHub Cloudflare environment, the exact Chromium-tested artifact, verified public SHA and a live route smoke test. A failed smoke leaves the release blocked and automatically attempts a verified rollback to the recorded previous Worker version. This is a planned control until the final GitHub Actions run and first approved release prove it.

## Blockers to actual closeout

- Obtain independent GitHub PR review and owner approval.
- Verify a complete successful browser contact submission on the isolated preview using a real Turnstile-issued token, then recheck the resulting row and Gmail notification.
- Independently verify contact-form delivery, consent/privacy, accessibility, runtime performance, security and monitoring. Unknown controls remain `NOT_TESTED`.
- Restrict direct production OAuth and audit the existing Cloudflare API token only after proving the new protected path, without affecting unrelated Workers.
- Verify the live deployment SHA, handover, rollback and accountable owner acceptance.

**Current status: ENFORCEMENT_PARTIAL / CLOSEOUT_BLOCKED.** A green build or launch checklist is insufficient evidence of completion.

## P0: production contact enquiry pipeline unavailable

On 14 October 2026, a labeled synthetic, otherwise-valid submission to https://thebredge.com/api/contact returned HTTP 503. The response explicitly said form delivery was not configured. Cloudflare reported no configured secrets for Worker bredge. The intended owner Google workbook has only headers in Leads and Bookings. This is tracked in https://github.com/ChukaDele/websites/issues/13.

The Google Apps Script project is bound to the original Bredge workbook. A separate authorized `bredge-leads` clasp profile has pushed the reviewed source and deployed **v4 using the existing deployment ID** using the existing deployment ID. Google service access is now `ANYONE_ANONYMOUS` with a high-entropy shared-secret gate. Missing/wrong-secret health probes reject, and a correct-secret health probe matches the pinned workbook and revision. The app's `WEBHOOK_SECRET` and `CAL_WEBHOOK_SECRET` are saved in owner Project Settings; Sheets/Mail/Trigger consent was granted and the 15-minute retry trigger was observed. One synthetic direct-to-Google lead reached exactly one Sheet row and owner notification email; replay was deduplicated. No webhook secret values have been committed or shared in chat.

The manual production job first requires a successful authenticated Google workbook health probe and a production Turnstile Siteverify probe. It then publishes the exact Chromium-tested artifact with `GOOGLE_LEADS_WEBHOOK_URL`, `GOOGLE_LEADS_WEBHOOK_SECRET`, and `TURNSTILE_SECRET_KEY` in a single Worker version, using Wrangler's atomic `--secrets-file /dev/stdin` route. Its post-deploy inventory check requires all three secret names. Passing these checks still cannot prove a submitted lead was saved or that the notification arrived. The prior Worker version and observed SHA are captured, with a conditional rollback step on release failure. This production route remains **untested** until authorized deployment.

To close: complete one human-verified Turnstile challenge and contact submission through the isolated preview, verify a separate Sheet row and notification email, obtain Claude's final independent technical review and **an actual different GitHub account's approval**, then execute the protected exact-SHA production release, verify the live source/form, confirm rollback/monitoring and record accountable owner handover. The P0 remains CLOSEOUT_BLOCKED for the public website.


### Google readiness handshake and Turnstile gate (pending human configuration)

The protected GitHub environment performs authenticated, non-mutating Apps Script `?health=1` and real Turnstile Siteverify checks before publishing a single, atomic Worker version with its required secrets. V4 Google service health, Sheet writing, duplicate replay and owner email have been confirmed. The isolated preview's source and secret bindings have passed checks; **no reviewed production Worker deployment has occurred**. Current production release remains blocked.

### Isolated Cloudflare preview candidate

The actual `bredge-release-qa` Worker is live on Cloudflare at `https://bredge-release-qa.thebredge.workers.dev`, separate from production, serving immutable GitHub-tested candidate artifact SHA `3e3e112300c6aee614632b7fe0f7e17dd6681190` (Actions pull-request merge ref for head `95eef26`). Worker script and assets came from hosted run `38691026210`; Cloudflare CLI 4.92 was used with no production routes or database bindings. HTTP 200, all three secret bindings, noindex headers, real Chromium QA and four negative form rejections passed. A **real CAPTCHA-completed browser submission remains unverified**, so stage acceptance is pending.


## 15 October 2026: remove blocking browser verification in candidate release

The owner refreshed the isolated real-key staging page and could not proceed through its human-verification control. A fresh Chromium network trace from the same Mac showed the Turnstile JavaScript loaded but a Cloudflare challenge-host request failed DNS resolution (`ERR_NAME_NOT_RESOLVED`), with no usable client-side token. This is evidence of a failure path, not proof the owner's interactive browser had the identical network problem.

**Decision:** Bredge is a low-volume contact/lead website. Mandatory Cloudflare Turnstile has been removed from the *candidate* form. It is replaced with a native Cloudflare Worker `CONTACT_RATE_LIMITER` binding (10 POST requests per 60 seconds per Cloudflare location, keyed by Cloudflare-provided connecting IP and hostname), before any webhook call. The binding fails closed on absence or runtime error. Existing origin allowlist, honeypot, min-dwell validation, bounded inputs/links, strict Google row receipts, deduplication and notification checks remain in place. These controls are layered but do not guarantee zero distributed spam.

**Verified locally before review:** generated Wrangler deployment JSON contains the expected rate-limit binding, limits and namespace; 53 code/workflow tests passed; lint passed; browser QA passed on 27 routes and 24 internal links with responsive/motion checks; a local Worker rejected malformed/fast/honeypot requests. Rate-limit rehearsal progressed from HTTP 400 (validation) to HTTP 429 once the quota was exhausted. A simulated 429 is not evidence of a new live production deployment.

**Production remains unchanged and P0 CLOSEOUT_BLOCKED.** A new exact-SHA GitHub artifact, isolated Cloudflare staging deployment, positive browser-to-Google Sheet/email test, independent review and approved protected production release are still required. Staging and production must not claim positive lead delivery based only on an HTTP 200 frontend response. Cal.com booking lifecycle remains [P1 issue #14](https://github.com/ChukaDele/websites/issues/14).

**Secret lifecycle:** the old `TURNSTILE_SECRET_KEY` may remain in the protected environment/previous Worker as a dormant legacy secret; the new code does not read it and the reviewed release does not require it. Any later cleanup must be separately authorized and must not accidentally roll back the active Worker or alter shared accounts.
