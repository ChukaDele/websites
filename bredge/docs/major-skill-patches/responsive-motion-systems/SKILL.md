---
name: responsive-motion-systems
version: 1.0.0
description: "Governs scrollytelling / GSAP / ScrollTrigger / sticky / pinning / hero video / viewport animation / card stacking / scroll scrub / parallax / Three.js work; MUST auto-load whenever a frontend task mentions any of: scrollytelling, GSAP, ScrollTrigger, sticky, pin/pinning, hero video, viewport animation, card stack(ing), scroll scrub/scrub, parallax, Three.js, matchMedia, ResizeObserver, sticky scene, pinned scene, scroll runway."
triggers:
  - scrollytelling
  - GSAP
  - ScrollTrigger
  - sticky
  - pin
  - pinning
  - pinned scene
  - hero video
  - viewport animation
  - card stacking
  - card stack
  - scroll scrub
  - scrub
  - parallax
  - Three.js
  - matchMedia
  - ResizeObserver
  - scroll runway
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
  - Edit
  - Write
---

# Responsive Motion Systems

Doctrine for building scroll-driven and viewport animation that survives real devices, real
zoom levels and real content. Distilled from a production failure on thebredge.com where two
independent viewport-owning scroll systems collided at ~80% browser zoom (see POSTMORTEM.md).
Every rule below is a directive, not a suggestion.

**Load this before touching any scrollytelling, GSAP/ScrollTrigger, sticky/pinned, hero-video,
card-stack, scroll-scrub, parallax or Three.js code.**

## 0. Prime directive — fix the interaction, never remove it

When an approved scroll/motion interaction breaks under some viewport, zoom or device, **repair it
to work across modes** (or fall back to a deliberate, designed reduced mode). Deleting the
interaction to make the symptom disappear is a regression, not a fix — and it will be rejected.
This is rule zero; every rule below exists to serve it. If a fix makes an interaction disappear,
you have not fixed it.

## 1. Relational geometry, not fixed-viewport assumptions

Express layout and motion as relationships that resolve against live geometry — never as
constants tuned on one screen. "Relational" does **not** mean "everything is a percentage".
Choose the primitive that matches the relationship:

- CSS Grid `fr` / `minmax()` / `auto-fit` for column and track relationships.
- `flex-basis` / `flex-grow` / `flex-shrink` for distribution along an axis.
- `%`, `clamp()`, `min()`, `max()` for bounded fluid sizing.
- `svh` / `dvh` / `dvw` **only** where the viewport is genuinely the reference.
- Container queries when a component must respond to its own box, not the window.
- `aspect-ratio` to lock proportion without hard pixels.
- GSAP `xPercent` / `yPercent` and normalised progress `0→1` for transforms.
- `ResizeObserver` + `getBoundingClientRect()` + `scrollWidth` / `clientWidth` for measured,
  content-derived behaviour.

## 2. Pixels only for genuinely-fixed things

Pixels are allowed for: 1px borders, icon strokes, focus rings, minimum touch targets and
small optical nudges. Pixels are **banned** as the primary architecture for viewport
storytelling, card positions, scroll runway length, pinned-scene distance, major column widths,
large section heights and responsive transforms. If a pixel value decides where a narrative
element sits at a given scroll point, it is wrong.

## 3. Banned patterns (with the real examples)

- Three independent viewport-owning sticky cards at fixed `top: 92px / 114px / 136px`.
- `end: "+=2800"` (or any hard pixel distance) as a universal scroll-narrative length.
- `left: 620px` because it looked right on one screen.
- `height: 900px` to manufacture pacing.
- Multiple independent sticky/pinned systems owning the same viewport region with no explicit
  handoff between them.

## 4. One viewport owner per overlapping region + explicit release contract

For any region where narratives could overlap, exactly **one** pinned/sticky scene owns the
viewport at a time. That scene owns the viewport until it ends, then **releases completely**
before the next scene may pin. Encode the handoff explicitly; do not rely on scroll maths
happening to line up. Add a runtime dev assertion that no two authored pinned scenes'
bounding boxes co-occupy the viewport.

## 5. Capability breakpoints on width AND height AND motion AND container

Gate enhanced motion on all four axes, not width alone. Enable the enhanced narrative **only
when** the component can show it cleanly **and** the viewport height can show the full active
card **and** `prefers-reduced-motion` is false **and** the container geometry allows it.
Otherwise switch **design mode** to a natural-flow / reduced fallback — never squeeze the same
interaction until it breaks. Author these modes as distinct designs:

- **MOBILE BASE** — natural flow, no pinning.
- **TABLET** — its own layout and pacing.
- **DESKTOP ENHANCED** — full pinned/scrubbed narrative.
- **SHORT-DESKTOP** — wide but not tall enough for the full card; fall back deliberately.
- **REDUCED-MOTION** — static or minimal, complete content still readable.

Do not "build desktop and shrink it".

## 6. GSAP / ScrollTrigger rules

- Dynamic `start` / `end` as **functions** derived from live viewport and content, never
  literals.
- `invalidateOnRefresh: true` on triggers whose values depend on measured geometry.
- Use `gsap.matchMedia()` for setup/teardown across breakpoints and reduced-motion; put the
  create-and-clean lifecycle inside its callbacks.
- Kill old triggers before creating new ones; never leave duplicate triggers bound.
- Leave no stale `pin-spacer`, no orphaned inline `transform`, no leftover `position: fixed`
  after teardown.

## 7. One debounced geometry coordinator per app

Have a single debounced coordinator that responds to: `visualViewport` resize, `window`
resize, `orientationchange`, `document.fonts.ready` and the relevant `ResizeObserver`
callbacks. On fire it: recomputes layout, reverts invalid animation contexts, recreates them
if the design mode changed, then calls `ScrollTrigger.refresh()`. Browser zoom does **not**
reliably fire the window `resize` event — treat `visualViewport` as a first-class signal.

## 8. Modular scene ownership

Each authored scene owns its own layout, motion lifecycle, cleanup, responsive modes and
reduced-motion fallback: e.g. `ReferenceWorkScene`, `InvisibleQueryScene`, `FiveSystemsScene`,
`ExperienceRows`, `HeroVideo`, `AdaptiveHeader`. A global `PageMotion` must **not** be an
unbounded controller that reaches into every section; it coordinates, it does not own scene
internals.

## 9. Browser zoom is first-class QA

Test native browser zoom at 67 / 75 / 80 / 90 / 100 / 110 / 125%. Note that zoom-**out**
(e.g. 80%) **increases** the CSS layout viewport — `innerWidth` / `innerHeight` scale by
`1/zoom` — and fixed-pixel scenes desync exactly there. Never substitute CSS `zoom`,
`transform: scale()` or resized screenshots for native browser zoom; always state which method
was used and never claim the methods are equivalent.

## 10. Tooling workflow + 15-step live-debug protocol

Use **Chrome DevTools MCP (full mode, not `--slim`)** for exploratory live diagnosis: DOM,
computed styles, network, console, source-mapped errors, performance traces, layout shifts,
screenshots. Use **Playwright CLI / `@playwright/test`** for repeatable verification and visual
regression. Do not substitute one for the other.

Live-debug protocol:
1. Confirm the deployed SHA via `/__build`.
2. Open production in a clean headed Chrome.
3. Reproduce the user's exact viewport and zoom.
4. Screenshot the defect.
5. Read computed styles of the involved elements.
6. Enumerate active ScrollTriggers.
7. Capture bounding boxes of the competing scenes.
8. Read the console.
9. Read the network.
10. Determine root cause.
11. Apply the fix.
12. QA on the remote preview.
13. Deploy to production.
14. Repeat the exact reproduction against production.
15. Add a regression test that locks the invariant.

**Never** respond "could not reproduce → no change" when the user has supplied screenshot
evidence. Treat the screenshot as ground truth and build the repro from it.

## 11. Staging↔production parity via /__build

Serve a build fingerprint from the Worker entry at `/__build` returning
`{ sha, builtAt, worker }` with `Cache-Control: no-store` and `X-Robots-Tag: noindex`.
Confirm the SHA before diagnosing any "prod differs from staging" report. Verify parity by
confirming identical content-hashed asset filenames across the two environments.

## 12. Regression

Pair Playwright visual snapshots (golden states) with bounding-box / invariant assertions at
desktop, short-desktop, tablet and mobile. Add a zoom-matrix test across the levels in §9. Add
a per-bug invariant guard for each fixed defect — e.g. "no `.reference-case` is
`position: sticky`". An invariant guard is cheaper and more durable than a pixel snapshot;
prefer it for architecture rules.

## 13. Failure conditions (doctrine was violated if you see these)

- Two pinned scenes visibly co-occupy the viewport.
- Horizontal overflow appears under zoom.
- A scene stays stuck/pinned after its section has ended.
- A headline overlaps an adjacent panel under zoom.
- An agent reports "geometry looks fine" while a user screenshot shows a defect.

Any one of these means a rule above was broken — go find which.
