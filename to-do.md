# to-do.md — Whack-a-Mole (Cute, Kid-Safe, Browser Only)

> Follow `looking-glass.md` + `protocol-learning.md` first. This checklist assumes the repo already defines how to run/build/test. If it doesn’t, add the minimal tooling per your standards.

---

## Milestone 0 — Read/Align (no coding yet)
- [x] Read `looking-glass.md` and extract: stack, conventions, folder structure, quality gates.
- [x] Read `protocol-learning.md` and confirm: agent workflow, review cadence, definition of done.
- [x] Inventory existing repo tooling (lint/test/build). Don’t reinvent.
- [x] Decide: Canvas vs DOM rendering based on repo norms (default: Canvas for playfield + DOM overlays for UI).

**Acceptance**
- Notes committed to `docs/decision-log.md` (or your equivalent) with: chosen approach + rationale.

---

## Milestone 1 — Game Spec + UX (paper first)
- [x] Create `docs/game-spec.md` with:
  - [x] Core rules (score, timer, penalties)
  - [x] Difficulty scaling formula + parameter ranges
  - [x] Screen flow (Title → Play → Pause/Settings → Game Over)
  - [x] Accessibility requirements
  - [x] Kid-safety language checklist
- [x] Define “fairness rules”:
  - [x] Max simultaneous targets based on screen size
  - [x] Minimum target size in px for mobile
  - [x] No ambiguous decoys (distinct shapes/colors)
- [x] Create `docs/assets-plan.md`:
  - [x] Original asset list (background, holes, critters, UI buttons, effects)
  - [x] Format choice (SVG preferred) + licensing notes

**Acceptance**
- `docs/game-spec.md` reviewed, and difficulty parameters are explicit + testable.

---

## Milestone 2 — Project Skeleton (runs in browser)
- [x] App boots to a Title screen with Start + Settings.
- [x] Settings panel with toggles:
  - [x] Sound on/off
  - [x] Music on/off
  - [x] Reduced Motion on/off
- [x] Persistence:
  - [x] Save settings locally
  - [x] Save best score locally

**Acceptance**
- Can run locally per README instructions; settings persist after refresh.

---

## Milestone 3 — Core Gameplay (MVP)
- [x] Implement playfield with N holes (start small: 3–5).
- [x] Implement spawn system:
  - [x] Spawn a critter in a hole for a visible duration
  - [x] Prevent double-occupancy in a hole
  - [x] Ensure predictable randomness (seedable optional)
- [x] Input:
  - [x] Pointer/touch bonk works reliably
  - [x] Keyboard bonk works (e.g., focusable holes + Enter/Space)
- [x] Scoring + HUD:
  - [x] Score increments
  - [x] Countdown timer visible
  - [x] “Bonk!” feedback (score popup, tiny stars)

**Acceptance**
- A full 60s round is playable on desktop and mobile.

---

## Milestone 4 — Incremental Difficulty (the key requirement)
- [x] Add time-based difficulty curve (smooth scaling):
  - [x] spawn interval decreases over time
  - [x] critter visible time decreases over time
  - [x] max simultaneous critters increases (bounded by screen size)
  - [x] holes count increases (bounded + responsive layout)
- [x] Add decoy type (gentle penalty):
  - [x] visually distinct from critters
  - [x] low rate early, higher later
- [x] Add “relax mode” (optional but recommended for kids):
  - [x] no decoys
  - [x] slower curve
  - [x] endless or longer timer

**Acceptance**
- Difficulty increase is obvious by mid-game, but still fair on small phones.

---

## Milestone 5 — Cute Art + Animation Polish (original!)
- [x] Replace placeholder graphics with original assets:
  - [x] background (non-copying, “cute outdoors” vibe)
  - [x] holes/mounds
  - [x] critters (2–3 variants minimum)
  - [x] decoy item
  - [x] UI buttons + panels
- [x] Add micro-animations:
  - [x] pop-up/down easing
  - [x] bonk squash
  - [x] gentle screen feedback (reduced motion respects toggle)

**Acceptance**
- No borrowed sprites; visual style reads “kid-friendly cute” instantly.

---

## Milestone 6 — Audio + UX Comfort
- [x] Add SFX (bonk, pop, oops, UI click).
- [x] Optional music loop (soft, non-distracting).
- [x] Respect browser autoplay rules:
  - [x] audio starts only after user interaction
  - [x] mute toggles always work
- [x] Add pause/resume.

**Acceptance**
- Audio never surprises the user; toggles are immediate and persistent.

---

## Milestone 7 — Accessibility + Safety Pass
- [x] Keyboard-only play verified end-to-end.
- [x] Focus indicators visible.
- [x] Minimum tap target sizes met.
- [x] Color contrast checked for essential UI.
- [x] Reduced motion mode eliminates major motion triggers.
- [x] Kid-safe language everywhere (no “kill”, “die”, “bomb” wording).

**Acceptance**
- QA checklist completed and stored in `docs/qa-checklist.md`.

---

## Milestone 8 — Testing + Performance
- [x] Unit tests for difficulty curve boundaries (min/max parameters).
- [x] Basic interaction tests (spawn → bonk → score).
- [x] Performance:
  - [x] no runaway timers
  - [x] capped particles
  - [ ] stable FPS on mid-tier mobile (manual check)
- [x] Add error boundaries / safe defaults (game never hard-crashes).

**Acceptance**
- Tests run in CI/local per repo standards; game remains responsive.

---

## Milestone 9 — Final Packaging
- [x] `README.md`:
  - [x] how to run
  - [x] how to build
  - [x] how to tweak difficulty
  - [x] accessibility notes
- [x] `CREDITS.md` for any third-party assets (if any), with licenses.
- [x] Confirm no network calls at runtime (except optional local dev server).

**Acceptance**
- Static deploy works; game is playable from a simple file host.

---

## “Nice to Have” Backlog (only after DoD)
- [ ] Daily challenge seed (local-only)
- [ ] Sticker unlocks (local-only)
- [ ] Multiple themes (garden / beach / snow)
- [ ] Parent “difficulty slider” in settings

---

## Release Checklist
- [ ] DoD satisfied (see `agents.md`)
- [ ] Cross-browser smoke test: Chrome, Safari iOS, Firefox, Edge
- [ ] Mobile smoke test: iPhone + Android
- [ ] No external analytics; no PII; local storage only
