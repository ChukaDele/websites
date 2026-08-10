# Promotion checklist — responsive-motion-systems (§19 gate)

A learning may only be promoted to a durable, auto-loading skill when every box below is ticked.
The builder ticks their own boxes; the **independent grader box must be signed by a reviewer who
did not build the fix or write this skill** — the builder must not grade their own lesson.

- [x] **Postmortem** — root cause captured, not just the symptom. → `POSTMORTEM.md`
- [x] **Reproduction** — the defect was reproduced from ground-truth evidence (user screenshot
      at ~80% zoom), not dismissed as "could not reproduce". → `POSTMORTEM.md` §Symptom/§Root cause
- [x] **Fix** — the interaction was repaired, not removed; shipped as commit 2e65994. →
      `POSTMORTEM.md` §Fix
- [x] **Acceptance test** — invariant and zoom-matrix checks exist and pass. →
      `acceptance-tests.md`, `scripts/rw-regression.sh`
- [x] **Independent grader** — a reviewer who is neither the builder of the fix nor the author of
      this skill re-ran the acceptance tests and confirmed the doctrine matches the incident. →
      `grader-verdict.md`

  Grader: independent grader agent (fresh context, no build history)   Date: 2026-08-10   Result: **PASS**

  Grader-observed evidence: `rw-regression.sh` exit 0 (5/5); Playwright `52 passed, 2 skipped, 0 failed`
  across 9 projects, no launch failures; live `/__build` → 200 with `no-store` + `noindex` at the fix
  SHA; both SKILL.md copies byte-identical (sha256 match); commit `2e65994` and all cited code facts
  confirmed real. Two non-blocking flags were fixed after grading: rule-zero elevated into SKILL.md,
  and the IQ-runway commit re-attributed to `3d6f29d` in POSTMORTEM.md.

Independent grader signed **PASS** on 2026-08-10 → this skill is **READY** and promoted for auto-load.
One always-authoritative confirmation remains open (per `acceptance-tests.md` §2): a headed
**native-zoom** pass at 80% via Chrome DevTools MCP, blocked only on the one-time MCP approval in an
interactive session (tracked in `docs/OWNER-QUEUE.md`). The automated zoom-equivalent matrix plus
independent grading carry the promotion until then.
