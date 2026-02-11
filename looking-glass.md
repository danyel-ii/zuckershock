# looking-glass.md — Repo Conventions (Source of Truth)

This repo builds a **kid-safe, browser-only, offline-capable** Whack-a-Mole style game.

## Non-Negotiables
- **No third-party browser runtime calls** (no analytics, ads, accounts, chat, tracking, or external assets).
- Same-origin API calls are allowed for first-party features (e.g. persistent leaderboard).
- **Kid-safe** language and feedback ("boop/bonk", sparkles; nothing scary).
- **Accessible by default**: keyboard playable, visible focus, large tap targets, reduced motion toggle.
- **Privacy preserving**: local storage keeps `settings` and `bestScore`; leaderboard may persist to first-party DB.

## Stack / Tooling
- Plain **HTML/CSS/JS** using **ES modules**.
- No framework required.
- Local dev server + build scripts use Node.js (dev-time only).

## Folder Structure
- `public/`: static site root (what gets deployed)
  - `index.html`, `styles.css`
  - `js/`: game code (ES modules)
  - `assets/`: icons, SVGs (all local)
  - `sw.js`: service worker for offline cache
  - `manifest.webmanifest`: PWA metadata
- `docs/`: specs, decision log, QA checklist, progress + learning logs
- `scripts/`: dev/build helpers (Node)
- `tests/`: unit tests (Node built-in runner)

## Code Conventions
- Keep the game **deterministic-ish**: use a seedable PRNG for spawns.
- Separate **core game logic** from **DOM/UI** so logic is unit-testable.
- Prefer small modules:
  - `difficulty.js` is pure and easy to test.
  - `storage.js` is the only place touching `localStorage`.
  - `audio.js` owns WebAudio and respects settings.

## Quality Gates
- `npm test` must pass.
- Manual smoke test (desktop + mobile/touch):
  - start, play a full round, pause/resume, settings persist after refresh
  - keyboard: Tab/arrow navigate holes, Enter/Space bonk
  - reduced motion: no shakes / fewer particles
  - offline: load once, then "offline" still plays (service worker)

## Local Storage Keys
- `wam_settings_v1`
- `wam_bestScore_v1`
- `wam_leaderboard_v1` (local cache/fallback)
