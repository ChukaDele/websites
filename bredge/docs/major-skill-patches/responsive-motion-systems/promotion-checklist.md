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
- [ ] **Independent grader** — a reviewer who is neither the builder of the fix nor the author of
      this skill has re-run the acceptance tests (including native-zoom headed confirmation at
      80%) and confirmed the doctrine matches the incident.

  Grader: ______________________   Date: __________   Result (pass/fail): __________

Until the independent grader box is ticked, this skill is **BUILT + VALIDATED** but not **READY**.
Do not treat auto-load registration as promotion; registration only makes the skill discoverable.
