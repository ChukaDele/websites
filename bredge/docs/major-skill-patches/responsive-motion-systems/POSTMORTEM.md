# Postmortem — Reference Work / Invisible-90% scroll-scene collision

Source incident for the `responsive-motion-systems` skill. thebredge.com, August 2026.

## Symptom

At roughly 80% native browser zoom, the Reference Work scene's three cards and the
Invisible-90% SQL scene overlapped on screen: "the green pipeline appears with the SQL scene".
The two narratives rendered on top of each other instead of one handing off to the next. The
defect only surfaced at zoom-out; at 100% it looked fine.

## Root cause

Two independent viewport-owning scroll systems shared the same region with **no release
contract** between them:

- **Reference Work** was three independent `position: sticky` cards pinned at fixed offsets
  `top: 92px / 114px / 136px`.
- **Invisible 90%** was a GSAP ScrollTrigger pin with a hard-coded `end: "+=2800"`.

Both encoded position and runway as fixed pixels. Zoom-out increases the CSS layout viewport
(`innerWidth` / `innerHeight` scale by `1/zoom`), so the fixed offsets and the fixed scroll
distance desynced from the actual viewport — the sticky cards were still on screen when the
pinned SQL scene began, and the two overlapped.

Separately, the Invisible-Query **headline** inherited the global `h2` size
`clamp(…, …, 5.9rem)` but sat inside a fixed `340px` grid column. Under zoom the headline
outgrew its column and overflowed onto the SQL terminal panel — a second, independent
manifestation of the same fixed-pixel mistake.

## Bad pattern vs correct pattern

- **Bad:** multiple independent sticky/pinned systems owning one viewport region; fixed-pixel
  `top`, `left`, `height` and `end` values; a headline sized by a global clamp inside a
  fixed-width column.
- **Correct (per doctrine):** one viewport owner per overlapping region with an explicit
  release contract (§4); relational geometry rather than fixed pixels (§1–§2); scene-local
  headline sizing that respects its own column (§8); a dev assertion that no two pinned scenes
  co-occupy the viewport (§4).

## Second failure mode (recorded explicitly)

The **first** fix attempt **removed** the interaction — it collapsed Reference Work to natural
flow. The owner rejected this. The rule is: **fix the interaction, never remove it.** A broken
motion system is repaired to work across modes, not deleted to make the symptom disappear.

## Fix (commit 2e65994 — "Rebuild Reference Work as ONE sticky scene + fix Invisible-90% zoom overlap")

- **Reference Work rebuilt as ONE sticky scene:** a single `.reference-sticky` element,
  `position: sticky; top: 0; height: 100vh`, with the three cards positioned `absolute` inside
  it. The scroll runway is a viewport-relative `300vh` stage. A scroll-progress state machine
  drives `active` / `prev` / `next` card states. Enhanced motion is gated on height + width +
  motion capability, with a natural-flow fallback below the gate.
- **Invisible 90% runway made relational:** `end` changed from `"+=2800"` to a
  viewport-relative function `innerHeight * 2.6`, with `invalidateOnRefresh: true`.
- **Invisible-Query headline capped:** `clamp(2.5rem, 4.6vw, 4.2rem)`, its grid changed to
  `minmax(320px, 400px) minmax(0, 1fr)` with `min-width: 0` so it can no longer overflow its
  column.
- **Coordinator:** `visualViewport` changes now drive `ScrollTrigger.refresh()`.
- **Parity endpoint:** `/__build` added to the Worker entry (`worker/index.ts`) returning
  `{ sha, builtAt, worker }` with `Cache-Control: no-store` and `X-Robots-Tag: noindex`, so the
  deployed SHA can be confirmed before diagnosing prod-vs-staging reports.

## Tests

- `scripts/rw-regression.sh` — asserts no `.reference-case` is `position: sticky`, all three
  WORK cards render, and `/__build` returns 200.
- Planned Playwright zoom-matrix test across 67 / 75 / 80 / 90 / 100 / 110 / 125% asserting the
  Reference→Invisible-Query non-overlap invariant.

## Links

- Doctrine: `SKILL.md` (this directory) and `~/.claude/skills/responsive-motion-systems/SKILL.md`.
- Acceptance gate: `acceptance-tests.md`.
- Promotion gate: `promotion-checklist.md`.
