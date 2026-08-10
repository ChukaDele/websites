# Acceptance tests — responsive-motion-systems

The concrete checks that gate promotion of this skill (see `promotion-checklist.md`). Each is
tagged **automated** (runs unattended) or **headed-Chrome-authoritative** (a human/agent must
confirm in a real headed browser at native zoom — no automated substitute is accepted as proof).

## 1. rw-regression.sh invariants — automated

`scripts/rw-regression.sh [host]` (default `https://thebredge.com`) must PASS:

- No `.reference-case` rule uses `position: sticky` (the collapsed-to-one-sticky-scene
  invariant; the three-independent-sticky architecture must not return).
- All three WORK cards render (`WORK 01`, `WORK 02`, `WORK 03`).
- `/__build` returns HTTP 200.

## 2. Zoom-matrix states — headed-Chrome-authoritative

Native browser zoom at **67 / 75 / 80 / 90 / 100 / 110 / 125%**. At every level:

- No horizontal overflow on `<body>` / document.
- The Invisible-Query headline stays inside its own grid column (no overlap onto the SQL
  terminal panel).
- The active Reference Work card is fully visible within the viewport height, or the scene has
  correctly fallen back to natural flow (short-desktop / mobile modes).

CSS `zoom`, `transform: scale()` and resized screenshots are **not** acceptable substitutes;
the method used must be stated and native zoom is authoritative. 80% is the known-desync level
and is mandatory.

## 3. Overlap + single-owner invariants — automated (Playwright) + headed confirmation

Implemented at `tests/e2e/responsive-motion.spec.ts`, run by `playwright.config.ts` across a
zoom-equivalent viewport matrix (`z67 z80 z90 z100 z110 z125`, plus `short-desktop`, `tablet`,
`mobile`). `z80` is the owner's exact reported condition. The spec asserts, per project:

- No horizontal overflow (`document.scrollWidth − clientWidth ≤ 2px`).
- Exactly three `.reference-case` cards and **none** is `position: sticky` (single-owner contract).
- Reference Work carries `rw-enhanced` **iff** `width ≥ 1001 && height ≥ 720`, and the region holds
  **at most one** sticky owner (exactly one when enhanced) — the anti-collision guard.
- The IQ headline (`.iq-side h2`) right edge clears the SQL terminal (`.iq-editor`) left edge when
  they share a row (auto-skipped on tablet/mobile, where `.iq-mobile` replaces the terminal).

Run: `npm run test:e2e` (defaults to `https://thebredge.com`; override with `BREDGE_URL`).

Method note: zoom is emulated by setting the *equivalent CSS layout viewport* a given (window,
zoom) produces — the faithful layout consequence, **not** CSS `zoom`/`transform:scale`. This is the
deterministic layout gate; native-zoom rasterisation is still confirmed once by headed Chrome at 80%.

## 4. /__build parity — automated

- `GET /__build` returns `{ sha, builtAt, worker }` with `Cache-Control: no-store` and
  `X-Robots-Tag: noindex`.
- The `sha` reported by production matches the SHA under test before any prod-vs-staging
  diagnosis begins.
- Content-hashed asset filenames are identical across staging and production for the same SHA.

## Status of automation

- Automated today: §1 (`rw-regression.sh`), §3 (`tests/e2e/responsive-motion.spec.ts` — overlap,
  single-owner, mode-gating, IQ non-overlap across the zoom-equivalent matrix), §4 (`/__build`
  reachability, asserted in both `rw-regression.sh` and the Playwright spec).
- Screenshot artefacts: the spec attaches per-project top + IQ screenshots for human review (not
  pixel baselines, since the target is a live URL).
- Always headed-authoritative: the visual confirmation in §2 at true native zoom (Chrome DevTools
  MCP / headed Chrome) — a passing automated run does not close the gate without it. 80% mandatory.
