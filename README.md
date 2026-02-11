# Whack-a-Boop (Whack-a-Mole, Kid-Safe)

Fully browser-based, offline-capable, privacy-preserving Whack-a-Mole style game with kawaii sweets characters, a kawaii food visual theme, and WebAudio sounds.

## Run (Dev)
Requirements: Node.js 20+

```bash
npm run dev
```

Open the printed `http://127.0.0.1:5173/` URL.

## Build + Preview
```bash
npm run build
npm run preview
```

## Tests
```bash
npm test
```

## Offline Test
1. Run `npm run dev`
2. Load the page once (online)
3. In browser devtools: Application -> Service Workers (or Storage) -> verify `sw.js` is registered
4. Toggle "Offline" in the Network tab
5. Reload: the game should still boot and play

## Difficulty Curve (Where To Edit)
- Difficulty formulas: `public/js/game/difficulty.js`
- Screen-size caps (max holes, simultaneous targets): `public/js/app.js` (`computeBoardProfile()`)
- Character variants look: `public/js/game/art.js`
- Forbidden-runner rules/timing/scoring: `public/js/game/game-core.js`
- Speed profiles (`Langsam`, `Normal`, `Schnell`): `public/js/game/difficulty.js` (`SPEED_PROFILES`)

## Extra Kawaii Food Asset Pool
- Added exploration assets (vegetables + foods) at:
  - `public/assets/opengameart/kawaii-food/`
- Source + license details:
  - `public/assets/opengameart/kawaii-food/ATTRIBUTION.md`
  - Same-source potato pack inventory: `public/assets/opengameart/kawaii-food/THESOFTMACHINE-FOOD-INVENTORY.md`

## User-Provided Kawaii Packs (Integrated)
- Gameplay sweets sprites:
  - `public/assets/original/kawaii-sweets/`
- UI skin sheets + derived slices:
  - `public/assets/original/kawaii-gui/`

Classic mode (4 Stufen, je 45s = 180s) ramps:
- spawn interval: 1200ms -> 450ms
- visible time: 1100ms -> 500ms
- unlocked holes: start 4/5 -> 6/9 (depends on screen size)
- max simultaneous targets: 1 -> 2/3 (depends on screen size)
- forbidden runner: 1 active sprite variant at a time, rotates every 20s
- forbidden bonk penalty: -150 for matching sprites while active
- forbidden strike-out: round ends immediately after 3 forbidden whacks
- on each level transition: +1 attempt is granted back (capped at 3 total)
- local leaderboard: save your score with a name on game-over (top 10, local-only)
- level turn rules:
  - Level 1: 1 sprite per turn, random forbidden matches
  - Level 2: 2 sprites per turn, random forbidden matches
  - Level 3: 3 sprites per turn, always 2 forbidden + 1 allowed
  - Level 4: 2 sprites per turn; if one matches forbidden, both become forbidden

## Accessibility
- Tab to focus holes and buttons
- Arrow keys move across the hole grid
- Enter/Space bonks the focused hole
- Settings has **Reduced motion** toggle
- Settings has 3 speed levels: **Langsam / Normal / Schnell**

## Privacy
Local-only storage:
- `wam_settings_v1`
- `wam_bestScore_v1`
- `wam_leaderboard_v1`

No accounts, tracking, analytics, ads, chat, or runtime external requests.
