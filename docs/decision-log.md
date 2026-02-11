# Decision Log

This file records decisions that affect architecture, gameplay feel, and repo conventions.

## 2026-02-10 — Rendering Approach
- **Decision:** Use **DOM** for the playfield (focusable hole buttons) and DOM overlays for UI.
- **Why:**
  - keyboard + screen reader support is significantly easier than a Canvas-only board
  - large tap targets and responsive layout are straightforward with CSS
  - SVG-in-DOM supports cute, original vector art without external tooling

Screen-size guardrails:
- Use **2 columns** on very narrow screens to keep holes big.
- Target minimum hole button size: **~96px** square or larger.

## 2026-02-10 — State Management
- **Decision:** Split **GameCore** (pure-ish logic + deterministic PRNG) from **UI** (DOM rendering).
- **Why:**
  - enables unit tests for difficulty and core interactions
  - keeps DOM manipulation localized and reduces bugs from shared mutable state

## 2026-02-10 — Difficulty Scaling
Let:
- `t = elapsedSeconds`
- `rampSeconds = 60` (classic) or `180` (relax)
- `d = clamp01(t / rampSeconds)`
- `c = d*d` (ease-in curve: gentle early, faster later)

Classic mode parameter ranges:
- spawn interval (ms): `lerp(1200, 450, c)`
- visible time (ms): `lerp(1100, 500, c)`
- unlocked holes: `lerp(startHoles, maxHoles, c)` rounded + clamped
- max simultaneous targets: `lerp(1, simCap, c)` floored + clamped
  - `simCap = 2` on small screens, `3` otherwise
- decoy rate: `lerp(0.00, 0.12, d)`
- bonus critter rate: `~0.06` (constant, small)

Hard constraints:
- never spawn more targets than unlocked holes
- never decrease tap target size; unlock holes by enabling existing slots

Relax mode notes:
- round length: **120 seconds**
- decoys disabled (`decoyRate = 0`)
- slower endpoints so play stays calm even late-round

## 2026-02-11 — Kawaii Art Direction Source
- **Decision:** Use OpenGameArt sprites from megupets (`Poola`, `Maru`, `Murlaw`) as primary critter visuals.
- **Why:**
  - stronger kawaii/chibi style than previous placeholder pack
  - consistent silhouette language from a single creator
  - license is compatible with shipping when attribution is included (CC-BY 3.0)

## 2026-02-11 — Original Kawaii Character Set (Supersedes External Sprites)
- **Decision:** Replace runtime critter PNGs with original, in-repo SVG characters in `public/js/game/art.js`.
- **Why:**
  - keeps the game fully original while still matching the requested kawaii style direction
  - enables a clearly similar decoy counterpart by reusing the same body silhouette and palette
  - removes runtime dependency on third-party sprite files and simplifies offline cache handling
- **Gameplay clarity rule:**
  - decoy uses the same base character body as critters but has sleepy eyes, sleep bubble, and `PAL` badge
  - bonus uses the same base body with a star marker and `PRIZE` badge

## 2026-02-11 — User-Pack Integration (Sweets + GUI)
- **Decision:** Use user-provided kawaii sweets PNGs as active critter sprites and apply user GUI-pack slices to core UI surfaces.
- **Files chosen:**
  - `public/assets/original/kawaii-sweets/`
  - `public/assets/original/kawaii-gui/`
- **Why:**
  - directly matches requested kawaii style and asset preference
  - keeps decoy fairness by using similar sprites from the same sweets set
  - preserves browser-only offline runtime (all local assets)

## 2026-02-11 — Kawaii Food Theme Context Update
- **Decision:** Retire active carnival framing and use a kawaii food context across copy, visuals, and UI accents.
- **Files chosen:**
  - `public/assets/original/backgrounds/kawaii-avocado-bg.png` (derived from user PDF)
  - `public/assets/original/kawaii-sweets/`
  - `public/assets/original/kawaii-gui/`
- **Why:**
  - aligns active experience with the new requested theme direction
  - keeps kid-safe readability while matching provided assets
  - reduces mixed-theme signals (carnival wording vs food visuals)

## 2026-02-11 — Forbidden Runner Gameplay
- **Decision:** Replace decoy spawn behavior with a rotating forbidden-variant rule.
- **Behavior:**
  - one sprite variant is marked forbidden for 20s
  - a 2x-size runner of that sprite moves across a bottom lane (left-to-right or right-to-left)
  - matching sprite bonks during that window apply `-150`
  - after the runner exits, a new forbidden sprite is selected
- **Why:**
  - clearer, teachable rule for young players
  - keeps penalties predictable and visually signposted

## 2026-02-11 — Level Separation + Visibility Lead-In
- **Decision:** Add explicit level breaks and delayed forbidden activation.
- **Behavior:**
  - on each level jump, pause gameplay with `Stufe X` and `3, 2, 1, Start!`
  - a newly rotated forbidden sprite is first shown as **visible-only**
  - forbidden penalty activates after a short lead-in (`1200ms`)
- **Why:**
  - makes level progression easier to read for children
  - satisfies "erst sichtbar, dann funktion" so players can adapt before penalties apply

## 2026-02-11 — Post UI Pack For Controls
- **Decision:** Keep existing gameplay sprites; use the user-provided `Post` pack for UI controls and banners.
- **Files chosen:**
  - `public/assets/original/post-ui/big-bar.png`
  - `public/assets/original/post-ui/press-big-bar.png`
  - `public/assets/original/post-ui/small-bar.png`
  - `public/assets/original/post-ui/press-small-bar.png`
  - `public/assets/original/post-ui/pieces-bar-1.png`
  - `public/assets/original/post-ui/pieces-bar-2.png`
  - `public/assets/original/post-ui/background-green.png`
- **Why:**
  - updates button/banner style to your new pack without disrupting gameplay readability or sprite identity.

## 2026-02-11 — Fairy Overlay As Strike Indicator
- **Decision:** Render floating tooth fairies in a fixed top overlay and map them to forbidden-hit strikes.
- **Behavior:**
  - fairies render above all game surfaces
  - each forbidden whack removes one fairy (`3 -> 2 -> 1 -> 0`)
  - fairies reset at the start of each new round
- **Why:**
  - makes strike state immediately visible with kid-friendly visual feedback instead of only numeric counters.

## 2026-02-11 — Speed Setting With 3 Profiles
- **Decision:** Add a user-selectable speed setting with three profiles: `normal`, `schwierig`, `sehr_schwierig`.
- **Behavior:**
  - setting lives in persisted app settings and is selectable in the settings overlay
  - modifies `spawnIntervalMs`, `visibleMs`, and forbidden-runner traverse duration
  - default remains `normal`
- **Why:**
  - provides direct pacing control without changing core rules or score logic.

## 2026-02-11 — Fixed Level Length + Attempt Reward
- **Decision:** Use fixed level length of 45 seconds and grant +1 attempt on every level transition.
- **Behavior:**
  - 4 levels with 45s each (180s round)
  - on level-up, one forbidden strike is forgiven (equivalent to +1 attempt), capped at the active attempt limit
- **Why:**
  - makes progression cadence predictable and gives a kid-friendly recovery mechanic at each milestone.

## 2026-02-11 — Custom Local Font
- **Decision:** Use user-provided `MGF-PinlockPersonalUse.otf` as the primary UI font.
- **Behavior:**
  - font is loaded via local `@font-face`
  - all app text resolves through `--font` with rounded-system fallback chain
- **Why:**
  - aligns typography with requested stylized look while keeping runtime fully offline.

## 2026-02-11 — Background-Derived Color Tokens
- **Decision:** Align app chrome colors with the active avocado background instead of the prior blue/water palette.
- **Behavior:**
  - define `--avocado-*` tokens in `:root`
  - map panel, board, lane, overlay, and focus colors to those tokens
- **Why:**
  - keeps visual language coherent with the currently active background art.

## 2026-02-11 — Karneval Theme Restyle (Historical)
- **Decision:** Use original, in-repo carnival SVG assets for backdrop + board + hole texture.
- **Files chosen:**
  - `public/assets/original/carnival/backdrop.svg`
  - `public/assets/original/carnival/booth-panel.svg`
  - `public/assets/original/carnival/hole-pattern.svg`
- **Why:**
  - stronger kid-facing carnival identity than generic nature backdrops
  - keeps art direction cohesive and editable without external dependencies
  - lightweight vectors scale cleanly across phones/tablets/desktops
- **Status:** superseded by the kawaii food context update above.

## 2026-02-11 — Configurable Attempt Budget (3-7)
- **Decision:** Make forbidden-hit attempt budget configurable in settings from `3` to `7`.
- **Behavior:**
  - persisted setting key: `maxAttempts`
  - each round starts with `maxAttempts` and ends on that forbidden-hit limit
  - level-up forgiveness (`+1 Versuch`) remains and is now capped by the selected attempt budget
  - floating tooth-fairy count mirrors remaining attempts (`maxAttempts - forbiddenWhacks`)
- **Why:**
  - supports different difficulty needs without changing core scoring rules
  - keeps the life/attempt state visually legible for children via matching fairy count.

## 2026-02-11 — Active Sprite Packs: A + B
- **Decision:** Use only `Set A` and `Set B` as runtime-selectable gameplay packs.
- **Behavior:**
  - settings toggle exposes `Set A` and `Set B`
  - previous `Set C` setting value is migrated to `Set B`
  - service worker pre-cache includes only runtime-active sprite packs
- **Why:**
  - aligns with latest art selection while keeping pack switching simple for players.

## 2026-02-11 — Persistent Leaderboard via Vercel + Neon
- **Decision:** Move leaderboard persistence to a first-party API (`/api/leaderboard`) running on Vercel Functions with Neon Postgres.
- **Behavior:**
  - browser reads/writes leaderboard through same-origin requests only
  - API stores entries in Neon and returns top 10 by `score DESC, created_at ASC`
  - frontend keeps local leaderboard as fallback cache when API/DB is unavailable
  - service worker bypasses caching for `/api/*` to avoid stale leaderboard responses
- **Why:**
  - enables cross-device persistence while preserving offline play
  - keeps networking first-party and avoids third-party browser calls
  - protects gameplay UX by degrading gracefully to local storage when offline

## 2026-02-11 — Score Handling On Forbidden Strike-Out
- **Decision:** Track both net score and collected positive score in game core.
- **Behavior:**
  - `score`: live gameplay score with forbidden penalties
  - `collectedScore`: sum of positive bonk points only
  - on `forbidden_limit` game-over, end-screen/leaderboard use `max(score, collectedScore)`
- **Why:**
  - keeps penalty feedback during gameplay
  - ensures earned points are still credited even when a round ends early from forbidden hits

## 2026-02-11 — Speed Tier Remap
- **Decision:** Remap speed tiers to shift difficulty up one notch.
- **Behavior:**
  - `normal` is now slower than before
  - `schwierig` now matches previous `normal`
  - `sehr_schwierig` now matches previous `schwierig`
- **Why:**
  - aligns pacing with user feedback that the easiest tier should be gentler
