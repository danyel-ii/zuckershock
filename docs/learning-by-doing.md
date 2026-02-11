# Learning By Doing

Short notes that explain key implementation choices in plain language.

## DOM Playfields for Accessibility
- A Canvas playfield can look great, but keyboard + focus + ARIA are harder.
- Rendering each hole as a real `<button>` makes:
  - focus management straightforward
  - Enter/Space activation default
  - visible focus styles easy

## Deterministic-ish Game Logic
- Put spawn logic and scoring in a UI-free `GameCore`.
- Inject a seedable PRNG so tests can reproduce spawn sequences.

## Offline With ES Modules
- If your entry script (`app.js`) imports modules, make sure the service worker
pre-caches those module URLs too.
- Otherwise, offline reload can fail even if `index.html` and `app.js` are cached.

## Theme Cohesion For Kids
- A single clear visual metaphor (kawaii food + snack pals + soft green backdrop)
  reads faster for young players than mixed-theme styling.
- Keep decoration whimsical but secondary: gameplay targets and buttons should still
  dominate attention on small screens.

## Similar Decoys Stay Fair
- To keep the decoy as a true counterpart, keep the same base silhouette and palette
  as normal critters, then add a clear state marker (sleepy eyes + `PAL` badge + bubble).
- This supports the game rule ("similar-looking counterpart") without making penalties feel random.

## Telegraph Before Punish
- For kid-facing rules, show the dangerous state before scoring starts.
- In this game, forbidden sprites become visible in the ribbon first, then become active after a short delay.
- The same idea applies to level changes: brief countdown overlays reduce confusion when rules shift.

## Skin Layers Independent From Sprites
- Keeping UI skins (buttons, panels, banners) separate from gameplay sprites makes visual restyles low-risk.
- We can swap control chrome from a new asset pack without touching hit logic, spawn logic, or sprite fairness.

## Visual Lives Work Better Than Extra Text
- Using floating fairies as strike indicators made forbidden-hit state understandable at a glance.
- Making the fairy budget configurable (`3..7`) worked well when the overlay API exposed both
  attempt-capacity and visible-count controls.

## Speed Should Be A Profile, Not A Magic Number
- We implemented speed as named profiles (`normal`, `schwierig`, `sehr_schwierig`) and applied them in one place.
- Centralized multipliers made it easy to tune spawn, visibility, and forbidden-runner pace consistently.

## Milestones Can Restore Agency
- Giving players +1 attempt at each level transition softened failure spikes without removing challenge.
- Modeling it as “forgive one forbidden hit” kept existing strike logic intact and easy to test.

## Fonts Need Explicit Offline Wiring
- Custom typography should always ship as local assets plus `@font-face` and SW pre-cache entries.
- That avoids network dependency and keeps style consistent offline.

## Theme Coherence Needs Shared Tokens
- When the background changes, introducing named palette tokens first (`--avocado-*`) keeps the rest of the CSS manageable.
- It also prevents mixed old/new color islands during iterative restyles.

## Assumption Notes
- Assumed "kawaii potato" direction from publicly visible screenshots and metadata because
  direct page scraping from the referenced itch page was blocked.
- Kept implementation original by matching high-level shape language only (rounded forms,
  simple faces, blush accents) rather than copying any exact sprite details.

## Remote Features Need Local Fallbacks
- A persistent leaderboard can coexist with offline gameplay if write/read paths degrade cleanly.
- Pattern used here:
  - try same-origin API first (`/api/leaderboard`)
  - on failure, fall back to local cache (`wam_leaderboard_v1`)
  - keep API responses out of SW cache to avoid stale rankings
