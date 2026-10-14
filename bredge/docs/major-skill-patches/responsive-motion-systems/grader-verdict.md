# Independent Grader Verdict — responsive-motion-systems

## TOP LINE: **PASS**

All hard gates are met: every file is present and the installed SKILL.md is byte-identical to
the docs copy; the postmortem's facts are real (commit, regression script, worker endpoint and
every specific code change verified in the tree, not invented); **both** test suites actually
pass when re-run by the grader; and the doctrine covers every listed point. Two minor
weaknesses are documented below — neither is blocking, but both should be tightened.

The independent-grader box in `promotion-checklist.md` may be signed **pass**.

---

## Section 1 — Skill pack exists + is auto-loaded — PASS

| Check | Evidence (observed) | Result |
|---|---|---|
| All 5 docs present | `ls` → `POSTMORTEM.md, SKILL.md, acceptance-tests.md, promotion-checklist.md, registry-patch.md` all present in `docs/major-skill-patches/responsive-motion-systems/` | PASS |
| Installed skill exists | `~/.claude/skills/responsive-motion-systems/SKILL.md` present (8816 bytes) | PASS |
| Byte-identical to docs copy | `diff` → `IDENTICAL`; `shasum -a 256` on both = `e5d0b4bd4f70bc797a6f6c2075d90de0f78fc93293d3047dff7ea2aba833c15c` | PASS |
| Trigger-rich frontmatter | `description` + `triggers[]` cover scrollytelling, GSAP, ScrollTrigger, sticky, pin/pinning, hero video, viewport animation, card stacking, scroll scrub, parallax, Three.js, matchMedia, ResizeObserver, scroll runway | PASS |
| Surfaced in skill list | `responsive-motion-systems` appears in this session's available-skills list with the full trigger description | PASS |

## Section 2 — Postmortem facts are real, not invented — PASS (with attribution note)

| Check | Evidence (observed) | Result |
|---|---|---|
| Commit 2e65994 exists | `git log ... grep 2e65994` → `2e65994 Rebuild Reference Work as ONE sticky scene + fix Invisible-90% zoom overlap` (full SHA `2e65994a918a72bee1d1bec384c870051bc68930`) | PASS |
| Commit message matches postmortem | Message body describes ONE `.reference-sticky` sticky scene, absolute stacked cards, viewport-relative stage, width≥1001 & height≥720 & motion gate, and the IQ headline clamp cap + `minmax` column — matches POSTMORTEM §Fix | PASS |
| Reference Work code is real | `globals.css:132` `.rw-enhanced .reference-sticky { position:sticky; top:0; height:100vh }`; `:133` `.reference-case { position:absolute; inset:0 }`; `Visuals.tsx` rAF scroll-progress state machine gated by `matchMedia("(min-width:1001px) and (min-height:720px) and (prefers-reduced-motion:no-preference)")`; `visualViewport` resize listener wired | PASS |
| IQ headline fix is real | `pages.css:441` `.iq-side h2 { font-size:clamp(2.5rem,4.6vw,4.2rem) }`; `:435` `.iq-grid { grid-template-columns:minmax(320px,400px) minmax(0,1fr) }`; `:440` `.iq-side { min-width:0 }` | PASS |
| IQ runway relational fix is real | `InvisibleQuery.tsx:171` `end: () => "+=" + Math.round(window.innerHeight * 2.6)`; `:172` `invalidateOnRefresh: true`; `:167-169` comment `was a hard-coded +=2800px` | PASS (real) |
| rw-regression.sh encodes 3 invariants | Script asserts (1) no `.reference-case` rule is `position:sticky`, (2) `WORK 01/02/03` all render, (3) `/__build` returns 200 | PASS |
| Worker serves /__build | `worker/index.ts:34-42` returns `JSON.stringify(buildInfo)` (`{sha,builtAt,worker}` from `build-info.json`) with `cache-control: no-store, must-revalidate` and `x-robots-tag: noindex, nofollow` | PASS |

**Attribution note (weakness, not a failure):** POSTMORTEM.md lists the *"Invisible 90% runway
made relational: end +=2800 → innerHeight\*2.6, invalidateOnRefresh"* bullet **under the heading
"Fix (commit 2e65994)"**. That is imprecise: commit 2e65994 touched only `globals.css`,
`pages.css`, `Visuals.tsx` (verified via `git show --name-only`). The IQ-runway change actually
landed in the earlier commit `3d6f29d "P0: kill Reference Work / Invisible-90% scroll-scene
collision under zoom"` (confirmed via `git log -S "2.6" -- components/`). The code and the fact
are **real and present in the tree** — only the commit credit is wrong. The full saga is
`d0ec24d → 3d6f29d (first attempt, removed the interaction) → 4ecd531 (regression guard) →
2e65994 (rebuild as one sticky scene)`, which matches the postmortem narrative apart from that
one bullet's placement.

## Section 3 — Acceptance tests actually pass — PASS

| Suite | Command | Observed result |
|---|---|---|
| Invariant guard | `bash scripts/rw-regression.sh` | `✓ no .reference-case is position:sticky` / `✓ WORK 01 renders` / `✓ WORK 02 renders` / `✓ WORK 03 renders` / `✓ /__build 200` / `PASS` — **exit 0** |
| Playwright e2e | `BREDGE_URL="https://thebredge.com" npx playwright test --reporter=line` | **52 passed, 2 skipped** (0 failed) across 9 projects `z67 z80 z90 z100 z110 z125 short-desktop tablet mobile` in 25.2s — **exit 0** |
| /__build live | `curl -D - https://thebredge.com/__build` | `HTTP/2 200`; `content-type: application/json`; `cache-control: no-store, must-revalidate`; `x-robots-tag: noindex, nofollow`; body `{"sha":"2e65994a918a72bee1d1bec384c870051bc68930","builtAt":"2026-08-10T10:24:37.005Z","worker":"bredge"}` |

Notes:
- The **2 skips** are the `IQ headline never overlaps the SQL terminal` test on `tablet` and
  `mobile`, where `.iq-mobile` replaces the terminal — documented as acceptable in
  `acceptance-tests.md §3`. Acceptable per the grading brief.
- **No launch failures.** All 5 workers / chromium projects launched and executed; every skip is
  a deliberate `test.skip`, not a missing-browser launch failure. No assertion failed.
- Live production is serving the fix SHA (`2e65994…`), so the Playwright run graded the fixed
  build, not a stale deploy.

## Section 4 — Doctrine quality — PASS (one elevation gap)

Every doctrine point in the brief is present and actionable in SKILL.md:

| Required doctrine point | Where | Covered? |
|---|---|---|
| Relational geometry (not fixed-viewport) | §1 (fr/minmax/clamp/svh/container/ResizeObserver/getBoundingClientRect) | YES |
| One sticky owner + explicit release contract | §4 (one owner per region, releases completely before next pins, runtime dev assertion) | YES |
| No fixed scroll distance | §2 + §3 (bans `end:"+=2800"`, fixed `top/left/height`) | YES |
| Width AND height AND motion capability gating | §5 (gates on width + height + `prefers-reduced-motion` + container; distinct design modes) | YES (exceeds — adds container) |
| Browser-zoom-as-QA | §9 (67/75/80/90/100/110/125%; zoom-out grows layout viewport; native zoom only) | YES |
| visualViewport / ResizeObserver | §7 + §1 (single debounced coordinator; visualViewport as first-class; ResizeObserver) | YES |
| ScrollTrigger dynamic end / invalidateOnRefresh / matchMedia / cleanup | §6 (dynamic start/end as functions, `invalidateOnRefresh:true`, `gsap.matchMedia()` lifecycle, kill old triggers, no stale pin-spacer) | YES |
| Modular scene ownership | §8 (each scene owns layout/motion/cleanup/fallback; PageMotion coordinates, does not own internals) | YES |
| Playwright + Chrome DevTools workflow | §10 (DevTools MCP full-mode for diagnosis, Playwright for repeatable verification; 15-step protocol) | YES |
| /__build parity | §11 (`{sha,builtAt,worker}`, no-store, noindex; confirm SHA before diagnosing prod-vs-staging) | YES |

Additional strengths: §10 states "never respond 'could not reproduce → no change' when the user
supplied screenshot evidence — treat the screenshot as ground truth"; §12 prefers invariant
guards over pixel snapshots; §13 lists observable failure conditions.

**"Fix the interaction, never remove it" — captured, but under-elevated (weakness):**
- POSTMORTEM.md §"Second failure mode" states it **explicitly and correctly** (line 44: *"The
  rule is: fix the interaction, never remove it. A broken motion system is repaired to work
  across modes, not deleted to make the symptom disappear."*).
- In the **auto-loading SKILL.md** the lesson is only **implicit**: §5 says "never squeeze the
  same interaction until it breaks … switch design mode to a natural-flow / reduced fallback"
  and "Do not 'build desktop and shrink it'." There is **no standalone numbered directive** in
  SKILL.md saying *fix, never remove*. Because SKILL.md is the file that auto-loads (the
  postmortem does not), the single most important human-level lesson of this incident — the
  owner explicitly rejected the removal — is weaker in the doctrine than it should be.

---

## Gaps / weaknesses (none blocking)

1. **SKILL.md should elevate "fix the interaction, never remove it" to an explicit numbered
   rule.** Right now it lives explicitly only in POSTMORTEM.md and is merely implied in the
   auto-loading doctrine. Recommend adding it as a first-class directive (e.g. a new §0 or
   folding an explicit sentence into §5).
2. **POSTMORTEM.md mis-attributes the IQ-runway bullet to commit 2e65994.** The
   `+=2800 → innerHeight*2.6 / invalidateOnRefresh` change landed in commit `3d6f29d`, not
   `2e65994`. The fact is real and in the tree; only the commit credit is wrong. Recommend
   splitting the §Fix list so each bullet is credited to the commit that actually shipped it.

Neither weakness affects the hard PASS criteria: files match, facts are real, both suites pass,
doctrine is complete. They are documentation-precision improvements.

---

*Independent grader — claude-opus-4-8, 2026-08-10*
