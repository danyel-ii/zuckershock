# Game Spec — Whack-a-Mole (Kid-Safe)

## Core Rules
- The player "bonks/boops" cute critters as they pop up from holes.
- One sprite is always the **forbidden snack** for a short phase.
  - A 2x-sized forbidden runner floats across the bottom lane for **20 seconds**.
  - While it is on-screen, matching sprites on the board are a penalty.
  - After it exits, a new forbidden sprite is chosen.
- **Classic mode:** 60-second round.
- **Relax mode:** same forbidden-runner mechanic, slower difficulty ramp, **120-second** round.

## Scoring
- Critter bonk: **+100**
- Bonus critter bonk (rare): **+250**
- Forbidden match bonk: **-150** (points-only; no hearts in kid mode)

Optional streak (v1 implementation may omit):
- consecutive critter hits increase score slightly (capped)
  - implementation note: +10% per 5-hit tier, capped at +30%

## Difficulty (Smooth Ramp)
See `docs/decision-log.md` for exact formulas and parameter ranges.

Fairness rules:
- targets must remain large and easy to hit on phones
- minimum tap target: **>= 96px** square for hole buttons (use fewer columns on narrow screens)
- avoid "unfair" spawns:
  - no double-occupancy
  - forbidden sprite is clearly shown in the bottom lane while active
  - cap simultaneous targets based on screen size

## Screen Flow
1. Title: Start + Settings + Mode select
2. In-game: HUD (Score + Time), Pause
3. Pause/Settings overlay: Resume, Restart, Sound, Music, Reduced Motion
4. Game Over: Score + Best score + Play again

## Inputs
- Pointer/touch: tap/click hole to bonk.
- Keyboard:
  - Tab focuses holes and buttons.
  - Arrow keys move within the hole grid.
  - Enter/Space bonk the focused hole.

## Accessibility Requirements
- Visible focus styles.
- Large tap targets.
- Reduced motion toggle removes shakes and reduces particles/bounce.
- Avoid rapid flashing or aggressive screen shake.

## Kid-Safety Language Checklist
- Use: "bonk", "boop", "oops", "yay", "sparkles".
- Avoid: "kill", "die", "blood", "weapon", "bomb".
