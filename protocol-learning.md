# protocol-learning.md — Agent Workflow (Source of Truth)

This repo uses a simple loop designed for incremental progress and clear handoffs.

## Build Loop (repeat per milestone)
1. **Plan the slice**
   - restate acceptance criteria
   - list files you expect to touch
2. **Implement the smallest coherent increment**
   - keep diffs reviewable
   - avoid speculative refactors
3. **Validate**
   - run repo commands (`npm test`, build, etc.)
   - fix failures immediately; do not bypass
4. **Document**
   - update `to-do.md` checkboxes completed
   - append to `docs/progress.md`:
     - what changed
     - why
     - how to test
     - what you learned (2–5 bullets)
5. **Reflect**
   - capture reusable patterns in `docs/learning-by-doing.md`
   - explicitly note assumptions and follow-ups

## Review Cadence
- Prefer completing a milestone end-to-end (code + docs + tests) before starting the next.
- If a decision affects gameplay feel or accessibility, record it in `docs/decision-log.md`.

## Safety / Privacy Checks
- No external runtime calls (no CDNs, no remote fonts, no telemetry).
- Only local persistence for settings + best score.

