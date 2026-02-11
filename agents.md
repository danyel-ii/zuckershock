# agents.md — Whack-a-Mole (Kid-Safe, Browser-Only)

## Prime Directive (MUST READ FIRST)
1) **`looking-glass.md` is the source of truth** for repo conventions, architecture, naming, and “how we work.”
2) **`protocol-learning.md` is the source of truth** for agent behaviors, handoffs, and review loops.
3) Any other “house docs” (e.g., contributing, testing, release, design) override this file if they conflict.
4) This project must remain **100% browser-based**, **kid-safe**, **offline-capable**, and **privacy-preserving**.

> If anything here conflicts with your setup docs, follow the setup docs and update this file only if your protocol allows it.

---

## Product Summary
Create a **cute, kid-friendly Whack-a-Mole** inspired by the playful, rounded, “soft toy” style of the reference game, with **difficulty that increases smoothly over time**.

### Non-negotiables
- **No ads, no chat, no tracking, no accounts, no external calls** at runtime.
- **No violence** (use “bonk/boop” language, stars/sparkles feedback; no gore).
- **Accessible by default**: keyboard support, clear contrast, large tap targets, reduced motion option.
- **Works on touch + mouse**, responsive from phones to desktops.
- **Original art + sounds** (or properly licensed assets). Do **not** copy the reference game’s sprites.

---

## Experience Goals (Kid-Friendly)
- Immediate fun: press “Start” and play within 1 click.
- Clear feedback: happy sounds, squishy animations, big score popups.
- Gentle failure: mistakes feel playful (oops sound, small shake), never scary.
- Parents happy: settings menu with sound/music toggles + reduced motion toggle.

---

## Game Design (Target Spec)
### Core loop
- Moles/critters pop up from holes; player taps/clicks to “bonk” them.
- A harmless “decoy” occasionally appears (e.g., a rock/toy/bubble) — bonking it causes a small penalty.
- Game session ends after a set duration (default: 60s) **or** optional “Relax mode” endless play.

### Difficulty scaling (must be incremental)
Difficulty increases as a function of time (and optionally score). Use **smooth scaling** (curves) rather than only discrete levels.

Recommended approach:
- Let `t = elapsedSeconds`.
- Define a `difficulty = clamp01(t / 60)` (or longer if endless).
- Then adjust:
  - **spawn interval** decreases over time (e.g., 1200ms → 450ms)
  - **mole visible time** decreases (e.g., 1100ms → 500ms)
  - **max simultaneous moles** increases (e.g., 1 → 3)
  - **board size** increases carefully (e.g., 3 holes → 5 → 9, depending on screen size)
  - **decoy rate** increases slightly (e.g., 0% → 12%)

Hard constraints:
- Never exceed what small screens can hit (keep holes large; prefer fewer, bigger targets over many tiny ones).
- Avoid “unfair” spawns (don’t spawn decoys disguised too similarly; keep silhouettes distinct).

### Scoring (simple & readable)
- +100 per bonk
- Bonus critter (rare): +250
- Decoy bonk: -150 or -1 heart (choose one; prefer points-only in kid mode)
- Streak bonus (optional): +10% per streak tier, cap it.

### UI screens
- Title screen: big “Start”, small “Settings”
- In-game HUD: Score, Time left, optional Hearts
- Pause/settings overlay: Resume, Sound, Music, Reduced Motion, Restart
- Game over: Score + Best score (local), Play again

### Privacy & local storage
- Store only: `bestScore`, `settings`.
- No personal data, no identifiers.

---

## Agents & Responsibilities

### 1) Product / Game Designer Agent
**Owns:** rules, difficulty curve, scoring, session length, fairness.  
**Delivers:**
- `docs/game-spec.md` (or your repo’s equivalent)
- A difficulty table + formulas (time → parameters)
- Edge cases (small screens, low dexterity, accessibility)

### 2) Visual/UI Designer Agent
**Owns:** “cuteness”, layout, animation language, UI components.  
**Delivers:**
- Simple style tile: colors, typography, corner radius, shadows
- Asset list + production plan
- UI mock notes (even if lightweight)

### 3) Frontend/Game Engineer Agent
**Owns:** implementation, game loop, input, rendering, performance, offline.  
**Delivers:**
- Working game in browser
- Clean separation: state, rendering, audio, persistence
- Deterministic-ish spawn logic (testable)

### 4) Audio Agent (can be merged with UI)
**Owns:** sound effects + music loops + toggles.  
**Delivers:**
- Subtle SFX (bonk, pop, oops, button)
- Music loop (optional)
- Ensures sounds respect “mute” and autoplay restrictions

### 5) QA + Accessibility Agent
**Owns:** kid-safety, usability, a11y, bugs, regression checks.  
**Delivers:**
- Test checklist + results
- Keyboard navigation verified
- Reduced motion verified
- Mobile touch verified

### 6) Build/Release Agent (optional)
**Owns:** build scripts, CI, deploy instructions, versioning.  
**Delivers:**
- `README` run instructions
- Production build output works offline (where applicable)

---

## Engineering Guidelines (high level)
- Prefer **no runtime dependencies** unless your repo setup requires them.
- Keep everything **static-host friendly** (Netlify/Vercel/GitHub Pages style).
- Maintain 60fps on mid-tier phones: avoid heavy particle spam; cap effects.
- Provide a “Reduced Motion” setting that:
  - removes shakes
  - reduces bounce distance
  - disables flashy particles

---

## Definition of Done (DoD)
- ✅ Runs fully in-browser (desktop + mobile), no external runtime calls
- ✅ Incremental difficulty increase is clearly observable and fair
- ✅ Kid-safe language/visuals; no scary penalties
- ✅ Settings: sound, music, reduced motion
- ✅ Best score saved locally; no personal data
- ✅ Accessibility: keyboard playable, focus states visible, large targets
- ✅ Documented: how to run, how to build, how to tweak difficulty

---

## Handoff Protocol (align with your setup docs)
- Every agent produces:
  - a short “What changed / Why / How to test”
  - screenshots or gifs for UI changes
  - a checklist of acceptance criteria met
- Use the review and reflection loops defined in `protocol-learning.md`.