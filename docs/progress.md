# Progress Log

## 2026-02-10
- What changed:
  - Added repo workflow + conventions docs (`looking-glass.md`, `protocol-learning.md`)
  - Added initial design/spec docs and decision log under `docs/`
- Why:
  - The repo started without the required "source of truth" docs; added minimal versions so future work is consistent.
- How to test:
  - N/A (docs-only change)
- What I learned:
  - Starting from an empty repo needs explicit conventions early to avoid rework.
  - Accessibility constraints strongly influence rendering approach.

## 2026-02-10 (Game MVP + Difficulty)
- What changed:
  - Added static site + dev/build tooling (`public/`, `scripts/`, `package.json`)
  - Implemented playable Whack-a-Boop game loop with DOM board, original SVG critters, scoring, and 60s timer
  - Added smooth difficulty ramp (spawn/visible times, unlocked holes, simultaneous targets) + decoy "sleepy friend" + relax mode
  - Added WebAudio SFX + optional music, plus settings persistence + best score persistence
  - Added unit tests for difficulty bounds and core spawn/bonk/score interaction
- Why:
  - Deliver a complete, offline-capable, accessible MVP early, then polish.
- How to test:
  - `npm run dev` then play a full round (Classic), and confirm Game Over + best score save
  - Toggle Reduced motion and confirm sparkles/bonk motion are reduced
  - Toggle Music and confirm it starts/stops immediately
  - Keyboard: Tab to a hole, use arrow keys, press Enter/Space to bonk
  - `npm test`
- What I learned:
  - DOM buttons are a huge win for keyboard gameplay in grid-based games.
  - Pre-caching module scripts in the service worker prevents "offline boot" failures.
  - Unlocking holes by enabling pre-rendered slots avoids layout shifts mid-round.

## 2026-02-11 (Kenney Sprite Integration)
- What changed:
  - Replaced generated critter SVGs with local Kenney Animal Pack Redux sprites (`rabbit`, `pig`, `frog`)
  - Updated decoy to be a similar-looking counterpart ("FRIEND" badge + sleepy marker) using the same sprite set
  - Added Kenney license file to repo and updated credits
  - Added Kenney sprite files to service-worker pre-cache list for offline play
- Why:
  - Use vetted CC0 assets while preserving kid-safe, offline-only runtime behavior
- How to test:
  - Start a round and confirm critters/decoys are sprite-based (not vector-generated)
  - Confirm decoy is visually similar to critters and still applies score penalty
  - Reload offline and verify sprites still render
- What I learned:
  - Asset source changes should be paired with cache + credits updates in the same slice.
  - "Similar-but-marked" decoys can stay fair when the marker is clear and consistent.

## 2026-02-11 (OpenGameArt Kawaii Pass)
- What changed:
  - Searched OpenGameArt for kawaii-themed options and selected a coherent set from megupets (`Poola`, `Maru`, `Murlaw`)
  - Updated the game to use these kawaii sprites for active gameplay
  - Added CC-BY attribution metadata and updated credits/docs
  - Updated service-worker pre-cache to include the new sprites for offline support
- Why:
  - The target aesthetic shifted to a stronger kawaii look while keeping kid-safe readability.
- How to test:
  - Start a game and verify kawaii character sprites are used for critters/bonus/decoys
  - Confirm decoys are still similar-looking but marked as FRIEND with a penalty on bonk
  - Reload offline and verify sprites still render
- What I learned:
  - A single artist set gives a more coherent visual identity than mixed packs.
  - CC-BY assets require explicit attribution breadcrumbs in-repo.

## 2026-02-11 (Background + Board Restyle Assets)
- What changed:
  - Searched OpenGameArt for kawaii-friendly background/board assets with permissive licensing
  - Added CC0 assets for backdrop and board textures:
    - `simple-happy-backdrop.svg`
    - `forest-scene1.png`
    - `forest-icons2.png`
  - Updated CSS to apply the new backdrop and board-wrap theming
  - Updated service worker pre-cache + credits/source notes
- Why:
  - Push visual style further into a playful kawaii atmosphere while keeping the board readable.
- How to test:
  - Load title screen and confirm scenic backdrop appears behind UI
  - Start game and confirm board panel has themed texture while holes remain clear/tappable
  - Reload offline and verify backdrop/textures still load
- What I learned:
  - Using low-weight CC0 assets can improve atmosphere with minimal performance cost.
  - Board texture needs a low-opacity overlay to avoid reducing critter readability.

## 2026-02-11 (Karneval Theme Overhaul)
- What changed:
  - Searched for carnival/circus assets and then replaced background/board with original in-repo carnival SVG art for stronger cohesion
  - Added three original visual assets:
    - `public/assets/original/carnival/backdrop.svg`
    - `public/assets/original/carnival/booth-panel.svg`
    - `public/assets/original/carnival/hole-pattern.svg`
  - Updated UI copy + badge language to carnival-friendly wording (`PRIZE`, `PAL`)
  - Updated service-worker pre-cache and docs/credits to match the new source of truth
- Why:
  - The previous look still felt too generic; the new theme is intentionally bright, festive, and easier for young children to read as "carnival".
- How to test:
  - Load title screen: verify carnival sky/tents/lights backdrop
  - Start game: verify board looks like a carnival booth and holes use ticket-like textures
  - Bonk bonus and decoy: verify `PRIZE` and `PAL` badges render clearly
  - Reload offline and verify carnival assets still load
- What I learned:
  - Theme-specific original SVGs can deliver stronger identity than mixing unrelated third-party packs.
  - Kid-facing themes benefit from simple iconography and high-contrast festive colors over realistic textures.

## 2026-02-11 (Original Kawaii Character Rework)
- What changed:
  - Rebuilt `public/js/game/art.js` using original, inline SVG kawaii veggie characters (potato/tomato/mint variants).
  - Implemented a similar-looking decoy counterpart using the same base silhouette and palette, with sleepy eyes + sleep bubble + `PAL` badge.
  - Kept bonus character readable by adding a star marker and `PRIZE` badge on the same silhouette.
  - Updated CSS to support SVG sprite rendering and updated service-worker cache list to remove runtime dependency on third-party critter PNGs.
  - Updated docs/credits to reflect original runtime character assets.
- Why:
  - Match the requested kawaii style while keeping art original and kid-friendly.
  - Preserve fairness by making decoys similar to critters but clearly marked.
- How to test:
  - Start a round and verify each pop-up character is vector-rendered (not PNG).
  - Confirm decoy looks like the same character family but shows sleepy marker + `PAL` and applies `-150` on bonk.
  - Confirm bonus still reads clearly with star marker + `PRIZE`.
  - Reload offline and verify game still boots with character art present.
- What I learned:
  - Inline SVG is a fast way to iterate kawaii art while staying fully offline and source-controlled.
  - Decoy fairness improves when distinction relies on expression/marker layers instead of changing silhouette.

## 2026-02-11 (Additional Kawaii Food Asset Intake)
- What changed:
  - Fetched and stored extra kawaii food/vegetable assets from OpenGameArt into `public/assets/opengameart/kawaii-food/`.
  - Added both archives and extracted folders for quick manual inspection and slicing.
  - Added attribution metadata in `public/assets/opengameart/kawaii-food/ATTRIBUTION.md`.
  - Updated `CREDITS.md` to include the new asset bundle location.
- Why:
  - Build a larger kid-friendly art pool for future character/background restyles without runtime network usage.
- How to test:
  - Open `public/assets/opengameart/kawaii-food/` and verify the new files exist.
  - Review `public/assets/opengameart/kawaii-food/ATTRIBUTION.md` for license/source details.
  - Run build and confirm assets are copied into `dist/`.
- What I learned:
  - Keeping both raw archives and extracted folders speeds up future curation workflows.
  - A mixed license pool (CC0 + CC-BY) is manageable if attribution is centralized at intake time.

## 2026-02-11 (User-Supplied Summer Background Applied)
- What changed:
  - Copied user-provided AVIF background into `public/assets/original/backgrounds/kawaii-summer.avif`.
  - Updated `public/styles.css` to use the AVIF as the primary page background image.
  - Kept carnival SVG backdrop as a secondary fallback layer.
  - Updated service-worker pre-cache list and credits notes.
- Why:
  - Align the visual style with your requested kawaii summer backdrop.
- How to test:
  - Run dev server and load title/game screens.
  - Confirm the AVIF summer scene appears behind UI and board.
  - Toggle offline and reload; background should still appear from cache.
- What I learned:
  - Layering AVIF + SVG fallback keeps style updates flexible while preserving offline safety.

## 2026-02-11 (Same-Source Food Assets As Potato)
- What changed:
  - Re-fetched the exact `thesoftmachine` pack used for `potato.png`:
    - `public/assets/opengameart/kawaii-food/food_sprite_pack_thesoftmachine.zip`
  - Fetched the same source preview image:
    - `public/assets/opengameart/kawaii-food/food_sprite_pack_cover_thesoftmachine.png`
  - Refreshed extraction folder and added a dedicated inventory list:
    - `public/assets/opengameart/kawaii-food/THESOFTMACHINE-FOOD-INVENTORY.md`
  - Updated attribution and credits pointers.
- Why:
  - Keep all kawaii food options from the exact same source as the existing potato asset.
- How to test:
  - Open `THESOFTMACHINE-FOOD-INVENTORY.md` and verify vegetables/fruit/misc are listed.
  - Verify files exist under `food_sprite_pack_thesoftmachine/food_sprite_pack/`.
- What I learned:
  - A per-source inventory file makes art curation much faster than browsing raw folders.

## 2026-02-11 (Background Swapped To User JPG)
- What changed:
  - Copied user-provided JPG into `public/assets/original/backgrounds/kawaii-summer.jpg`.
  - Updated `public/styles.css` to use the JPG as primary background.
  - Updated service worker pre-cache and bumped cache version for clean offline refresh.
  - Updated docs/credits paths from AVIF to JPG.
- Why:
  - Use the latest background image you provided.
- How to test:
  - Reload app and verify new JPG appears in title + gameplay background.
  - In devtools, go offline and reload to confirm background still loads.
- What I learned:
  - Bumping cache name on asset path swaps avoids stale background files in existing service worker caches.

## 2026-02-11 (Integrated User Kawaii Sweets + GUI Packs)
- What changed:
  - Integrated `Kawaii Sweets Discord Emojis` as active gameplay sprites via `public/js/game/art.js`.
  - Added decoy and bonus treatments on the same sweets set (`PAL`/`PRIZE`) to preserve game clarity.
  - Imported `FREE KAWAII GUI PACK` sheets and derived runtime slices for buttons/panels.
  - Updated `public/styles.css` to skin cards, HUD, overlay panel, toggles, and buttons with GUI assets.
  - Updated service-worker pre-cache and source-notes docs.
- Why:
  - You requested these exact local packs to be integrated into the game’s active look.
- How to test:
  - Start a round and confirm sweets emojis are used for critters/bonus/decoy.
  - Confirm `PAL` decoy penalty still applies.
  - Check title/game/settings screens for orange button + blue panel skinning.
  - Reload offline and verify sprites/UI assets still load.
- What I learned:
  - Using a single sweets set for critter/decoy keeps counterpart recognition strong.
  - Lightly sliced UI sheets can improve theme fit quickly without large structural changes.

## 2026-02-11 (Kawaii Food Theme Consolidation + PDF Background)
- What changed:
  - Extracted background image from user-provided PDF:
    - `/Users/danyel-ii/Downloads/Green Kawaii Avocado Illustration Project Presentation .pdf`
    - Runtime file: `public/assets/original/backgrounds/kawaii-avocado-bg.png`
  - Switched active background to the avocado image with summer JPG fallback.
  - Recolored and rethemed active UI surfaces to food-friendly green tones.
  - Added whimsical decor elements from existing sweets assets in board/overlay surfaces.
  - Updated text context from carnival wording to kawaii food wording.
  - Updated docs/credits/decision log to reflect the new active theme context.
- Why:
  - You requested a clear kawaii food theme and to stop using carnival context.
- How to test:
  - Open title screen and confirm avocado background appears.
  - Confirm subtitle/tagline mention kawaii food context.
  - Start game and verify sweets critters + themed UI controls are present.
  - Go offline and reload to confirm background and themed assets still load.
- What I learned:
  - Theme consistency comes mostly from copy + color system + 2-3 repeated motifs, not just one background swap.

## 2026-02-11 (Whimsical Controls Pass)
- What changed:
  - Added whimsical control decorations using provided sweets assets:
    - cupcake/macaroon/sandwich motifs in brand, board edge, and primary buttons.
  - Updated service-worker cache to only active kawaii-food assets and bumped cache version.
  - Added background source extraction notes file.
- Why:
  - Reinforce kawaii food identity through controls and micro-decor, not only background art.
- How to test:
  - Confirm brand row shows snack icon accent.
  - Confirm primary buttons show sandwich icon and regular buttons show small sweet icon.
  - Confirm board shows tiny sweet decorations at top corners.
  - Hard reload and verify no missing assets offline.
- What I learned:
  - Small, repeated decorations across controls create a stronger theme signal than large one-off changes.

## 2026-02-11 (Board Size Increase)
- What changed:
  - Increased active game screen width to about 85% of viewport (`85vw`) so the HUD + board area is visibly larger.
  - Kept the game screen centered with a transform-based centering rule.
- Why:
  - You requested a larger board footprint.
- How to test:
  - Load a round on desktop and confirm board/hud occupy roughly 85% of screen width.
  - Check mobile still fits and remains tappable.
- What I learned:
  - Applying width at the game-screen container level scales both HUD and board consistently.

## 2026-02-11 (Forbidden Runner Gameplay Update)
- What changed:
  - Replaced decoy-style penalties with a rotating forbidden-variant system in `GameCore`.
  - Added a bottom forbidden runner lane showing a 2x sprite moving across for 20s.
  - During each 20s pass, matching board sprites apply `-150`.
  - After each pass, a new forbidden sprite and direction are chosen.
  - Updated tests for forbidden scoring and 20s rotation behavior.
- Why:
  - You requested a clear, always-active forbidden sprite mechanic tied to visible movement.
- How to test:
  - Start a round and watch the forbidden lane; the large runner should traverse in ~20s.
  - Bonk matching sprites during that window and confirm negative score popup.
  - Wait for next pass and confirm forbidden variant changes.
  - Run `npm test`.
- What I learned:
  - A continuously visible rule indicator makes penalty mechanics easier to understand than occasional decoys.

## 2026-02-11 (Square Board Fields + Larger Sprites)
- What changed:
  - Updated hole tiles to enforce square fields using `aspect-ratio: 1 / 1`.
  - Increased in-hole critter size to about 3x previous values.
  - Adjusted pop-up offset so larger sprites still emerge from holes.
- Why:
  - You requested square board cells and much larger moles/sprites.
- How to test:
  - Start a round and confirm every board field is square.
  - Confirm critters appear significantly larger (about 3x) in each hole.
- What I learned:
  - `aspect-ratio` is the cleanest way to keep a responsive grid square without JS layout logic.

## 2026-02-11 (Board/Sprite Downscale Pass)
- What changed:
  - Reduced game screen width from `85vw` to `75vw`.
  - Reduced in-hole critter sizing to ~75% of the prior enlarged pass.
  - Reduced forbidden runner size to about `2/3` of prior size.
- Why:
  - You requested a tighter board footprint and less oversized characters.
- How to test:
  - Start a round and verify board occupies around 75% of viewport width.
  - Confirm hole sprites are visibly smaller than previous pass.
  - Confirm forbidden runner is noticeably smaller during lane traversal.
- What I learned:
  - Size adjustments are easiest to tune when board, hole sprite, and runner scale are controlled independently.

## 2026-02-11 (No-Scroll Board Fit)
- What changed:
  - Added a viewport-fit sizing function in `public/js/app.js` that computes board width from available viewport height and width.
  - Hooked fit logic on round start and window resize.
  - Board now auto-shrinks on short screens to avoid page scroll while keeping square cells.
- Why:
  - You requested the board to fit on-screen without scrolling.
- How to test:
  - Start a round on desktop and mobile-sized viewport.
  - Confirm no vertical page scroll is needed to see HUD, forbidden lane, and board.
  - Resize the window and confirm board re-fits automatically.
- What I learned:
  - A runtime fit pass is more reliable than fixed viewport percentages when UI chrome and lane height vary.

## 2026-02-11 (Viewport Lock + Compact Game Layout)
- What changed:
  - Added in-game viewport mode toggles in `public/js/app.js`:
    - `.app--in-game` on the app shell
    - `.body--in-game` on `body`
  - Updated board-fit math to use the board wrapper's real viewport position (`getBoundingClientRect`) plus `visualViewport` updates.
  - Added compact in-game CSS in `public/styles.css`:
    - lock app height to `100dvh` and hide page overflow during gameplay
    - reduce topbar, lane, and board-wrap vertical chrome in-game
    - shrink forbidden lane track height on short screens
- Why:
  - The previous fit pass still allowed scroll on tighter viewports because non-board UI consumed too much vertical space.
- How to test:
  - Start a round and confirm no page scroll in game on desktop and mobile-sized viewports.
  - Rotate to landscape and confirm HUD + forbidden lane + board remain visible without scrolling.
  - Resize browser window and verify board re-fits immediately.
- What I learned:
  - Measuring from live element positions is more reliable than static reserved-height estimates.
  - Locking only the gameplay shell (not all screens) avoids side effects on title/settings flow.

## 2026-02-11 (Background Source Swap To PDF Variant)
- What changed:
  - Replaced `public/assets/original/backgrounds/kawaii-avocado-bg.png` with a fresh extract from:
    - `/Users/danyel-ii/Downloads/Green Kawaii Avocado Illustration Project Presentation  (1).pdf`
  - Kept the same runtime filename so existing theme wiring remained unchanged.
  - Bumped service-worker cache version to `wam-cache-v8` so cached clients fetch the new background.
  - Updated source attribution notes in `public/assets/original/backgrounds/SOURCES.md` and `CREDITS.md`.
- Why:
  - You requested this specific PDF variant as the active background source.
- How to test:
  - Start the app and verify the updated avocado background is visible.
  - Hard reload once (or close/reopen tab) to ensure the new cache version is active.
  - Go offline and reload; background should still render from cache.
- What I learned:
  - Keeping the same runtime asset path plus cache-version bump is the safest way to swap binary art without CSS churn.

## 2026-02-11 (Hit Celebration + Forbidden Board Shudder)
- What changed:
  - Upgraded positive-hit feedback to a large multi-wave star burst centered on the bonked sprite.
  - Added a bright burst flash ring to make successful bonks read as a stronger celebration.
  - Added a full-board shudder animation for forbidden bonks.
  - Wired forbidden-result flow to trigger `boardShudder` while keeping existing score popup and bonk animation.
  - Kept Reduced Motion behavior: both sparkle/shudder animations are disabled when the toggle is on.
- Why:
  - You requested stronger visual celebration on correct whacks and clear board-level feedback on forbidden whacks.
- How to test:
  - Start a round and whack any valid sprite: verify a large star burst appears around that hole.
  - Whack a currently forbidden variant: verify the entire board shudders briefly.
  - Enable Reduced Motion in Settings and repeat: verify these effects are suppressed.
- What I learned:
  - Multi-wave particles read as “celebration” much better than single tiny sparkles.
  - Board-level reaction gives immediate clarity on global rule mistakes like forbidden hits.

## 2026-02-11 (Effect Intensity Increase)
- What changed:
  - Increased celebration burst scale so stars and flash ring read at sprite-sized impact scale.
  - Expanded burst travel distance and particle count for a wider, more obvious positive feedback.
  - Increased board shudder intensity (larger horizontal displacement + slight rotation) and duration.
- Why:
  - You requested a much larger celebration and stronger forbidden-hit shudder.
- How to test:
  - Correct hit: verify burst extends roughly to sprite footprint and is visibly stronger.
  - Forbidden hit: verify board shake is more forceful and lasts slightly longer.
  - Reduced Motion on: verify both effects remain suppressed.
- What I learned:
  - Strong feedback needs both scale and duration changes; only increasing one often feels underpowered.

## 2026-02-11 (Leaderboard + Three-Strike Forbidden Loss)
- What changed:
  - Added local leaderboard persistence (`top 10`) in `public/js/game/storage.js`.
  - Added game-over name entry flow and save button to submit score records.
  - Added leaderboard display on title screen and game-over screen.
  - Added forbidden-hit HUD counter (`Nope Hits`) and surfaced `x / 3` progress.
  - Updated game rules in `GameCore`: round now ends immediately after 3 forbidden whacks.
  - Added tests for:
    - timer-based game-over reason (`time_up`)
    - forbidden strike count in results
    - immediate game-over on third forbidden whack
- Why:
  - You requested a leaderboard with player names and a hard loss condition tied to forbidden whacks.
- How to test:
  - Play a round, then enter a name on game over and click Save score.
  - Confirm the new entry appears in both title and game-over leaderboards.
  - Trigger three forbidden whacks and confirm the round ends instantly.
  - Run `npm test`.
- What I learned:
  - Keeping leaderboard storage sanitized at the data layer makes UI rendering simpler and safer.
  - Exposing forbidden-hit progress in HUD makes the three-strike rule much easier for players to track.

## 2026-02-11 (Four-Level Turn Rules)
- What changed:
  - Added a 4-level gameplay rule set in `GameCore`, driven by round progress:
    - Level 1: 1 sprite per turn
    - Level 2: 2 sprites per turn
    - Level 3: 3 sprites per turn with forced composition (2 forbidden + 1 allowed)
    - Level 4: 2 sprites per turn with pair-forbidden rule if either matches forbidden variant
  - Added level state to game view and surfaced it in HUD.
  - Updated forbidden lane guidance text to explain Level 3/4 special rules in real time.
  - Added tests covering level 1/2/3 turn counts and level 4 pair-forbidden behavior.
- Why:
  - You requested explicit four-level spawn behavior replacing a single uniform turn pattern.
- How to test:
  - Start a classic round and watch HUD level advance from 1 to 4 over the round.
  - Verify turn patterns per level as listed above.
  - In level 4, verify a two-sprite turn can become fully forbidden when one matches forbidden variant.
  - Run `npm test`.
- What I learned:
  - Encoding per-turn composition in core spawn generation keeps advanced rules testable and deterministic.

## 2026-02-11 (German Localization + Zucker-Schock Rebrand + Water Board)
- What changed:
  - Translated all visible runtime UI/gameplay text to German across title, HUD, settings, game-over, leaderboard, and announcer messages.
  - Rebranded the game title/subtitle in-app to:
    - `Zucker-Schock`
    - `Es war einmal die Zahnfee...`
  - Updated web app manifest name/description to match the new title.
  - Restyled start-screen CTA buttons with brighter, more playful gradients and stronger depth.
  - Restyled board and holes with a liquid-water visual language (blue gradients, ripple highlights, bubble accents).
  - Bumped service-worker cache to `wam-cache-v11` so clients receive updated text/styles immediately.
- Why:
  - You requested full German text, a new game name/subtitle, prettier start buttons, and a liquid water board aesthetic.
- How to test:
  - Load title screen and verify `Zucker-Schock` + German subtitle text.
  - Verify all buttons/labels/messages are German during a full round.
  - Confirm start buttons look more decorative and prominent.
  - Start a round and verify board/holes/lane use the new water-style visuals.
  - Hard reload once to ensure the new service-worker cache is active.
- What I learned:
  - A cache-version bump is essential when a cache-first SW serves shell files.
  - Localized dynamic strings in JS are easy to miss unless announcer and edge-case messages are included in the pass.

## 2026-02-11 (p5.js Floating Tooth Fairies)
- What changed:
  - Added local p5.js runtime files in-repo (`public/vendor/p5/`) for offline-safe animation rendering.
  - Added user-provided fairy image asset:
    - `public/assets/original/tooth-fairy/tooth_fairy.png`
  - Implemented a p5 sketch with exactly three floating fairy sprites on the title screen:
    - `public/js/tooth-fairy-float.js`
  - Integrated the sketch into app startup and title layout layering.
  - Updated service-worker pre-cache to include new sketch/library/image files and bumped cache to `wam-cache-v12`.
- Why:
  - You requested three floating p5.js objects using the supplied tooth-fairy image.
- How to test:
  - Open the start screen and verify three tooth-fairy images float independently.
  - Enter game screen and verify the floating layer is no longer visible there.
  - Hard reload once, switch offline, and reload to verify the effect still renders.
- What I learned:
  - A dedicated non-interactive layer keeps decorative animation from interfering with gameplay focus and inputs.

## 2026-02-11 (Zuckerstreussel Text + Treffer-Effekt)
- What changed:
  - Replaced title-tagline wording from `Glitzerpunkte` to `Zuckerstreussel`.
  - Reworked positive-hit particles:
    - removed star-shaped sparkles
    - added colorful flying sugar-sprinkle particles (sticks + dots) around the hit sprite
  - Kept reduced-motion behavior intact (particles still suppressed when enabled).
- Why:
  - You requested the wording `Zuckerstreussel` and a sprinkle-style effect instead of star twinkles.
- How to test:
  - Open the start page and verify the tagline ends with `Zuckerstreussel`.
  - Hit a valid sprite and verify colorful sprinkle pieces fly outward (no star shapes).
  - Enable reduced motion and verify sprinkle particles are disabled.
- What I learned:
  - Keeping class names stable while swapping particle visuals is the safest way to preserve effect hooks.

## 2026-02-11 (Klare Level-Trennung + Sichtbar-vor-aktiv Verboten-Regel)
- What changed:
  - Added clear level transitions with a short in-game pause overlay and countdown:
    - `Stufe X`
    - `3, 2, 1, Start!`
  - Inserted this transition after each level jump so progression feels segmented, not continuous.
  - Added a visibility lead-in for forbidden sprites:
    - forbidden sprite appears first in the ribbon
    - penalty becomes active only after a short delay
  - Updated forbidden ribbon copy to show `sichtbar` vs `aktiv` state.
  - Added tests to verify:
    - forbidden is initially visible-only
    - penalty applies only after activation delay
  - Bumped service-worker cache to `wam-cache-v13`.
- Why:
  - You requested explicit level separation and the rule “erst sichtbarkeit, dann funktion” for forbidden sprites.
- How to test:
  - Play a round and observe level changes: each new level should pause with `3, 2, 1, Start!`.
  - Watch a new forbidden sprite appear in ribbon; immediately matching board sprites should still be safe.
  - After short delay, matching sprites should switch to forbidden penalty behavior.
  - Run `npm test`.
- What I learned:
  - A lightweight transition overlay improves readability of rule changes without restructuring core timers.

## 2026-02-11 (Post-Pack UI Skinning: Buttons + Banner)
- What changed:
  - Imported selected UI assets from `/Users/danyel-ii/Downloads/Post` into:
    - `public/assets/original/post-ui/`
  - Restyled UI surfaces to use Post pack art while keeping gameplay sprites unchanged:
    - buttons (`.btn`, `.btn--small`, title CTAs)
    - card/panel banners (`.card`, `.leaderboard-panel`, `.hud`, `.forbidden-lane`)
    - settings overlay/toggles
  - Updated offline pre-cache list and bumped cache version to `wam-cache-v14`.
  - Updated credits with source notes for the new UI pack.
- Why:
  - You requested keeping current sprites but using the new Post assets for buttons/banners and related UI chrome.
- How to test:
  - Open title/settings/game screens and verify button/panel surfaces now use the new green Post style.
  - Confirm critter sprites on the board are unchanged.
  - Hard reload once to pick up the new service-worker cache.
- What I learned:
  - Separating sprite art and UI skin assets keeps theme swaps fast without touching gameplay logic.

## 2026-02-11 (Floating Tooth Fairy Image Swap + Alpha Verification)
- What changed:
  - Replaced floating fairy asset with user-provided image:
    - source: `/Users/danyel-ii/Downloads/Tooth-fairy-cartoon-on-transparent-background-PNG.png`
    - runtime: `public/assets/original/tooth-fairy/tooth_fairy.png`
  - Downscaled runtime PNG to `1024x1024` for better mobile performance.
  - Verified transparency is preserved (`hasAlpha: yes`).
  - Added source notes file: `public/assets/original/tooth-fairy/SOURCES.md`.
  - Bumped service worker cache to `wam-cache-v15`.
- Why:
  - You requested this exact image for floating objects and explicitly asked to keep transparency.
- How to test:
  - Open title screen and verify the three floating fairies use the new artwork with transparent edges.
  - Hard reload once to ensure the new SW cache is active.
  - Optional verification command: `sips -g hasAlpha public/assets/original/tooth-fairy/tooth_fairy.png`
- What I learned:
  - Replacing art on an existing runtime path is safe, but a cache bump is still required for immediate client updates.

## 2026-02-11 (Fairies To Front + Forbidden-Hit Removal)
- What changed:
  - Moved floating fairy layer to a global fixed overlay (`#toothFairyLayer`) so it renders above all game surfaces.
  - Added controller API in `public/js/tooth-fairy-float.js` to set/reset visible fairy count.
  - Wired gameplay to fairy count:
    - start round: reset to 3 fairies
    - each forbidden whack: remove one fairy
    - round state keeps fairy count synced with `forbiddenWhacks`
  - Bumped service worker cache to `wam-cache-v16`.
- Why:
  - You requested the floating objects to be fully in front and to lose one on every forbidden whack.
- How to test:
  - Start a round and confirm fairies appear in front of HUD/board/UI.
  - Trigger forbidden whacks and verify fairies go `3 -> 2 -> 1 -> 0`.
  - Start a new round and verify fairies reset to `3`.
- What I learned:
  - Treating decorative overlays as stateful UI indicators works well for life/strike feedback.

## 2026-02-11 (3-Stufen-Geschwindigkeit)
- What changed:
  - Added a persisted speed setting with 3 levels in settings overlay:
    - `Normal`, `Schwierig`, `Sehr schwierig`
  - Wired speed into game pacing:
    - spawn interval and visible time scale by selected speed profile
    - forbidden runner traverse time also scales with speed
  - Added tests for speed behavior in difficulty + game core.
  - Bumped service worker cache to `wam-cache-v17`.
- Why:
  - You requested that game speed should be configurable with 3 choices.
- How to test:
  - Open settings and switch speed between `Normal`, `Schwierig`, `Sehr schwierig`.
  - Start rounds and verify pacing difference is clearly noticeable.
  - Verify chosen speed persists after reload.
  - Run `npm test`.
- What I learned:
  - A profile-based speed layer is safer than scattering one-off multipliers across core logic.

## 2026-02-11 (45s Pro Stufe + Versuch Beim Levelwechsel)
- What changed:
  - Changed level timing to fixed 45 seconds per level.
  - Round timing now runs 4 levels x 45s (180s total).
  - Added level-up reward: each level transition grants `+1 Versuch` (attempt), capped at 3.
  - Added `GameCore.grantLevelAttempt()` and wired it into level-break flow.
  - Updated level-break overlay to show whether attempt gain was applied.
  - Updated tests for new level timings and attempt grant behavior.
  - Bumped service worker cache to `wam-cache-v18`.
- Why:
  - You requested fixed 45-second levels and an extra attempt on each level transition.
- How to test:
  - Start a round and verify level changes at ~45s, ~90s, ~135s.
  - Accumulate forbidden hits, then reach next level and confirm one attempt is restored (max 3).
  - Verify overlay message indicates attempt gain.
  - Run `npm test`.
- What I learned:
  - Explicit time-per-level rules are clearer to tune than percentage-based thresholds.

## 2026-02-11 (MGF Pinlock Font Integration)
- What changed:
  - Imported user-provided font into repo:
    - `public/assets/original/fonts/MGF-PinlockPersonalUse.otf`
  - Added `@font-face` and set it as primary app font in `public/styles.css`.
  - Added source and license note files under `public/assets/original/fonts/`.
  - Added font to service-worker pre-cache and bumped cache to `wam-cache-v19`.
- Why:
  - You requested this specific local font for the app.
- How to test:
  - Reload app and confirm headings/buttons/body text use the new style.
  - Hard reload once to ensure new service-worker cache is active.
  - Optional check: inspect computed `font-family` on `.app`.
- What I learned:
  - Local `@font-face` + cache preloading keeps custom typography fully offline-capable.

## 2026-02-11 (App Palette Mapped To Avocado Background)
- What changed:
  - Reworked UI color styling in `public/styles.css` to align with the active avocado background palette.
  - Shifted major surfaces from blue tones to avocado greens/leaf tones/pit-browns:
    - brand accent
    - HUD + forbidden lane + board shell
    - level-break overlay
    - hole/pit/lip styling
    - focus rings and friend-badge accent
  - Added palette tokens at `:root` (`--avocado-*`) for consistent tuning.
  - Bumped service-worker cache to `wam-cache-v20`.
- Why:
  - You requested that the app use the color palette of the background image.
- How to test:
  - Reload title/game screens and verify the UI reads as green/avocado-toned instead of blue.
  - Trigger focus states (keyboard tabbing) and confirm focus ring also matches the new palette.
  - Hard reload once to activate the latest service-worker cache.
- What I learned:
  - Central palette variables make wide theme shifts faster and safer than one-off color edits.

## 2026-02-11 (Ribbon Sichtbarkeit Auf Kleinen Screens)
- What changed:
  - Made forbidden ribbon sizing more screen-adaptive:
    - reduced/controlled runner size range
    - tuned track min-height for in-game compact mode
  - Updated runner motion so forbidden sprite starts **directly visible** inside the ribbon (instead of off-screen).
  - Added runtime runner-size fit to track height in `renderForbiddenRunner`.
  - Bumped service worker cache to `wam-cache-v21`.
- Why:
  - You reported the ribbon being partially obscured and the forbidden sprite not immediately visible.
- How to test:
  - Start game on narrow/short viewport (mobile size).
  - Verify forbidden sprite is visible immediately when ribbon updates.
  - Verify sprite remains fully readable (not clipped) while moving across ribbon.
  - Hard reload once so latest SW cache is active.
- What I learned:
  - Tying moving sprite size to container height is more robust than static viewport clamps.

## 2026-02-11 (Dimensional Panels + Card Texture Pass)
- What changed:
  - Applied stronger dimensional surface styling to cards/panels:
    - added shared grain/fiber texture layers via CSS variables
    - added sheen/highlight layers and inner edge lighting
    - added deeper outer + inner shadows for tactile depth
  - Updated these surfaces in `public/styles.css`:
    - `.card`
    - `.leaderboard-panel`
    - `.leaderboard__item`
    - `.segmented`
    - `.hud`
    - `.forbidden-lane`
    - `.board-wrap`
    - `.overlay__panel`
    - `.toggle`
    - `.level-break__card`
  - Bumped service-worker cache to `wam-cache-v22`.
- Why:
  - You requested all panels/cards to feel more dimensional with noticeably richer texture.
- How to test:
  - Open title/game/settings/gameover screens and compare panel depth and grain detail.
  - Verify text remains readable over the new textures.
  - Hard reload once so newest SW cache is active.
- What I learned:
  - Layering subtle grain + sheen + inner shadow creates depth without requiring new texture image assets.

## 2026-02-11 (Floating-Objekt Transparenz Beibehalten)
- What changed:
  - Removed global alpha fade from floating tooth-fairy rendering in `public/js/tooth-fairy-float.js`.
  - Sprite now renders with original PNG alpha channel (`noTint()` instead of reduced tint alpha).
  - Bumped service-worker cache to `wam-cache-v23`.
- Why:
  - You requested that transparency of the floating objects remains preserved.
- How to test:
  - Open title/game screens and verify fairies keep transparent edges/background.
  - Hard reload once so latest SW cache is active.
- What I learned:
  - A single `tint` alpha on canvas sprites can unintentionally change the intended transparency look.

## 2026-02-11 (Speed-Stufen Umbenannt Auf Normal/Schwierig/Sehr Schwierig)
- What changed:
  - Replaced speed tier keys and UI labels:
    - from `Langsam/Normal/Schnell`
    - to `Normal/Schwierig/Sehr schwierig`
  - Updated speed profile tuning in `public/js/game/difficulty.js`.
  - Added backward-compatible setting migration:
    - old `langsam` -> `normal`
    - old `schnell` -> `schwierig`
  - Updated settings UI values in `public/index.html` and validation in `public/js/app.js`.
  - Updated tests and docs references to the new names.
  - Bumped service-worker cache to `wam-cache-v24`.
- Why:
  - You requested exactly three speed levels named `normal`, `schwierig`, and `sehr schwierig` across the 4-level game.
- How to test:
  - Open settings and verify exactly these three options appear.
  - Start rounds on each option and verify pacing increases from normal -> schwierig -> sehr schwierig.
  - Reload page and verify selected speed persists.

## 2026-02-11 (Landing-Buttons Als Sprite-Buttons)
- What changed:
  - Replaced title-screen CTA visuals with sprite-based buttons using kawaii sweets assets.
  - Start and settings buttons now render as large sprite cards with text labels.
  - Removed title-only default button decorators/icons so sprites remain the primary visual.
  - Added mobile overrides so sprite-buttons keep intended sizing instead of stretching full-width.
  - Bumped service-worker cache to `wam-cache-v25`.
- Why:
  - You requested that landing-page buttons should be replaced by sprites.
- How to test:
  - Open title screen and verify both CTA buttons are sprite-first visuals.
  - Check desktop + mobile width: buttons should stay sprite-like, not full-width bars.
  - Verify click/tap still starts the game and opens settings.

## 2026-02-11 (Landing-Panels Auf Grau-Verlauf Umgestellt)
- What changed:
  - Updated title-screen panel styling in `public/styles.css` from green accents to neutral gray transitions.
  - Restyled landing-only surfaces:
    - `#screen-title .card`
    - `#screen-title .leaderboard-panel`
    - `#screen-title .leaderboard__item`
    - `#screen-title .segmented`
    - `#screen-title .cta .btn`
  - Kept sprite-based button icons unchanged while switching only panel/background tones to gray.
  - Bumped service-worker cache to `wam-cache-v26`.
- Why:
  - You requested that landing-page panels should no longer appear green and should use gray transition coloring.
- How to test:
  - Open the start screen and verify panel/cards and segmented control are gray-toned.
  - Confirm sprite icons still appear on the two CTA cards.
  - Hard reload once so latest service-worker cache is active.

## 2026-02-11 (Landing-Titel Vergrößert + Rainbow-Buttons)
- What changed:
  - Increased landing-page title size and added a visible sprite icon directly next to `Zucker-Schock`.
  - Replaced empty logo look by rendering a kawaii sprite inside `.brand__logo`.
  - Restyled landing-page interactive controls with rainbow gradients:
    - mode segmented buttons (`#screen-title .segmented__btn`)
    - CTA card buttons (`#screen-title .cta .btn`)
  - Kept existing sprite icons on CTA buttons.
  - Bumped service-worker cache to `wam-cache-v27`.
- Why:
  - You requested a larger title with a sprite and rainbow-colored panel buttons on the landing page.
- How to test:
  - Open title screen and verify header title is larger and includes a sprite icon.
  - Confirm top-left logo is no longer an empty square.
  - Verify both landing CTA cards and mode buttons show rainbow color transitions.
  - Hard reload once so the updated service-worker cache is active.

## 2026-02-11 (Transparenter Regenbogen-Overlay Über Hintergrund)
- What changed:
  - Added a transparent rainbow overlay layer via `body::before` in `public/styles.css`.
  - Kept overlay non-interactive (`pointer-events: none`) and behind the app UI (`z-index: 0`).
  - Raised `.app` above the overlay (`position: relative; z-index: 1`) so gameplay/content remains clear.
  - Bumped service-worker cache to `wam-cache-v28`.
- Why:
  - You requested a transparent rainbow overlay on the background.
- How to test:
  - Open app and verify a soft rainbow tint is visible over the page background.
  - Confirm buttons/board remain fully usable and readable.
  - Hard reload once so latest SW cache is active.

## 2026-02-11 (Top-Zeile Komplett Entfernt)
- What changed:
  - Removed the entire top header row from `public/index.html`:
    - title line (`Zucker-Schock`)
    - subtitle line (`Es war einmal die Zahnfee...`)
    - top-row icon/logo elements
  - Bumped service-worker cache to `wam-cache-v29`.
- Why:
  - You requested that the top line should disappear completely, including its icons.
- How to test:
  - Open app and verify no top row appears above the landing screen content.
  - Confirm gameplay/start/settings still work as before.
  - Hard reload once so latest SW cache is active.

## 2026-02-11 (Neues Kawaii-Food Hintergrundbild)
- What changed:
  - Added the provided wallpaper as a local asset:
    - `public/assets/original/backgrounds/kawaii-food-wallpaper.jpg`
  - Updated `body` background in `public/styles.css` to use the new image as the base background.
  - Bumped service-worker cache to `wam-cache-v30` and pre-cached the new background file.
- Why:
  - You requested this exact image as the app background.
- How to test:
  - Open app and verify the new kawaii-food wallpaper is visible behind the UI.
  - Hard reload once so latest SW cache is active.

## 2026-02-11 (Regenbogen-Overlay Entfernt)
- What changed:
  - Removed the transparent rainbow overlay layer (`body::before`) from `public/styles.css`.
  - Removed now-unneeded layering helpers that were only required for that overlay.
  - Bumped service-worker cache to `wam-cache-v31`.
- Why:
  - You requested to remove the rainbow overlay from the background image.
- How to test:
  - Open app and verify the background image is shown without rainbow tint overlay.
  - Hard reload once so latest SW cache is active.

## 2026-02-11 (Restliche Hintergrund-Overlay-Layer Entfernt)
- What changed:
  - Removed remaining gradient layers from the `body` background stack in `public/styles.css`.
  - Background now uses only the image file:
    - `url("./assets/original/backgrounds/kawaii-food-wallpaper.jpg")`
  - Bumped service-worker cache to `wam-cache-v32`.
- Why:
  - You reported that an overlay was still visible after the previous change.
- How to test:
  - Open app and verify no tint/gradient overlay remains over the wallpaper.
  - Hard reload once so latest SW cache is active.

## 2026-02-11 (Hintergrundbild Auf 1344879.png Gewechselt)
- What changed:
  - Added provided image as local asset:
    - `public/assets/original/backgrounds/kawaii-food-bg-1344879.png`
  - Updated `body` background in `public/styles.css` to use this new PNG.
  - Added new image to service-worker pre-cache and bumped cache to `wam-cache-v33`.
- Why:
  - You requested this exact file as the app background.
- How to test:
  - Open app and verify the new image is shown as the only page background.
  - Hard reload once so latest SW cache is active.

## 2026-02-11 (Panels Und Buttons Auf Pink Umgestellt)
- What changed:
  - Applied a global pink UI pass in `public/styles.css` for panels and controls.
  - Updated pink styling for key panel surfaces:
    - `.card`, `.leaderboard-panel`, `.hud`, `.forbidden-lane`, `.board-wrap`, `.overlay__panel`, `.toggle`, `.level-break__card`
    - leaderboard row/badge variants and board decorative pseudo-elements
  - Updated buttons and segmented controls to pink gradients:
    - `.btn`, `.btn--small`, `.btn--primary`, `#screen-title .cta .btn`
    - `.segmented`, `.segmented__btn`, pressed states
  - Updated base theme variables (`--ink`, `--muted`, `--card`, `--stroke`, `--primary`, `--focus-ring`) to pink-friendly values.
  - Bumped service-worker cache to `wam-cache-v34`.
- Why:
  - You requested that panels and buttons should be pink.
- How to test:
  - Open landing/game/settings/game-over screens and verify panel/button surfaces are pink.
  - Verify CTA sprite buttons remain functional and readable.
  - Hard reload once so latest SW cache is active.

## 2026-02-11 (Landing-Title Und Tagline Als Neon Mit Schwarzer Kontur)
- What changed:
  - Restyled `#screen-title .title` to neon green with a black outline/stroke.
  - Restyled `#screen-title .tagline` to neon cyan with a black outline/stroke.
  - Added glow shadows for both texts while keeping only the landing page affected.
  - Bumped service-worker cache to `wam-cache-v35`.
- Why:
  - You requested that these two texts should be neon with black border.
- How to test:
  - Open landing screen and verify `Zucker-Schock` and the subtitle sentence appear neon with black contour.
  - Hard reload once so latest SW cache is active.

## 2026-02-11 (Panels/Buttons Auf Hintergrund-Palette Gemappt)
- What changed:
  - Replaced the pink panel/button theme with tones sampled from the active background image (`kawaii-food-bg-1344879.png`).
  - Updated base theme variables in `:root` (`--ink`, `--muted`, `--card`, `--card2`, `--stroke`, `--shadow`, `--primary`, `--primary2`, `--focus-ring`).
  - Reworked the panel/button override block in `public/styles.css` to use warm neutral palette colors across:
    - panel surfaces (`.card`, `.leaderboard-panel`, `.hud`, `.forbidden-lane`, `.board-wrap`, `.overlay__panel`, `.toggle`, `.level-break__card`)
    - segmented controls and pressed states
    - all buttons including landing CTA buttons
  - Palette sample anchors used from extraction: `#282726`, `#333130`, `#514741`, `#947d6f`, `#be9485`, `#d9b19e`, `#efccb7`, `#f8dfc8`, `#fbf0dc`, `#fdfbf3`.
  - Bumped service-worker cache to `wam-cache-v36`.
- Why:
  - You requested that all panels and buttons should draw colors from the background image palette.
- How to test:
  - Open landing/game/settings/game-over and verify panel/button colors now match the background’s warm palette.
  - Hard reload once so latest SW cache is active.

## 2026-02-11 (Landing-Texte Auf Neon-Tuerkis Umgestellt)
- What changed:
  - Updated landing title text (`#screen-title .title`) to neon turquoise.
  - Updated landing subtitle line (`#screen-title .tagline`) to the same neon turquoise tone.
  - Kept black contour/stroke and adjusted glow shadows to turquoise for both lines.
  - Bumped service-worker cache to `wam-cache-v37`.
- Why:
  - You requested both lines to be neon turquoise.
- How to test:
  - Open landing screen and verify both lines render in matching neon turquoise.
  - Hard reload once so latest SW cache is active.

## 2026-02-11 (Board-Felder Pink + Floating-Objekte 1.3x Groesser)
- What changed:
  - Restyled game board squares from green to pink tones in `public/styles.css`:
    - `.hole`
    - `.hole::before`
    - `.hole__pit`
    - `.hole__lip`
  - Increased floating tooth-fairy sprite size by 1.3x relative to previous size:
    - `sizeScale` from `1.5` to `1.95` in `public/js/tooth-fairy-float.js`.
  - Kept transparency behavior unchanged (`p.noTint()` remains in place).
  - Added horizontal clamp for floating sprites so larger fairies stay fully visible on-screen.
  - Bumped service-worker cache to `wam-cache-v38`.
- Why:
  - You requested pink board squares and 1.3x larger floating objects without losing transparency.
- How to test:
  - Start game and verify all board squares/lips are pink (no green fields).
  - Verify floating tooth fairies are visibly larger and still alpha-transparent.
  - Hard reload once so latest SW cache is active.

## 2026-02-11 (Forbidden-Ribbon Sprite Vollstaendig Sichtbar)
- What changed:
  - Improved forbidden runner placement in `public/js/app.js`:
    - added larger horizontal safety inset
    - added vertical inset + centered Y placement inside track
    - transform now uses `translate3d(x, y, 0)` instead of `y=0`
  - Updated ribbon CSS in `public/styles.css`:
    - `forbidden-runner` badge moved fully inside sprite bounds (`left/top: 4px`)
    - track gets explicit `box-sizing: border-box` and tiny vertical padding for safe rendering
  - Bumped service-worker cache to `wam-cache-v39`.
- Why:
  - You reported that parts of the forbidden sprite ribbon were still cut off.
- How to test:
  - Start a game and watch the forbidden runner across full left-to-right/right-to-left travel.
  - Verify sprite + badge remain fully visible at both edges and during movement.
  - Hard reload once so latest SW cache is active.

## 2026-02-11 (Board-Felder Auf Dezentes Rosé Aus Hintergrundpalette)
- What changed:
  - Replaced bold pink board-hole tones with subtler red/pink shades sampled from the active background palette.
  - Updated these selectors in `public/styles.css`:
    - `.hole`
    - `.hole::before`
    - `.hole__pit`
    - `.hole__lip`
  - Applied palette-based tones such as `#f3d2bd`, `#ebc6b2`, `#e6aa9a`, `#cf8c81` for a softer look.
  - Bumped service-worker cache to `wam-cache-v40`.
- Why:
  - You requested that board squares should not be bold pink but a subtle red/pink from the background.
- How to test:
  - Start a round and verify hole tiles read as soft rosé (not saturated pink).
  - Hard reload once so latest SW cache is active.

## 2026-02-11 (Alle Drei Floating-Objekte Rechts Vom Board)
- What changed:
  - Updated floating tooth-fairy positioning logic in `public/js/tooth-fairy-float.js`:
    - switched from fixed screen `xRatio` to board-relative anchoring
    - each fairy now anchors to the right side of `.board-wrap` with a safe horizontal gap
    - three fairies are distributed vertically along the board side (top/middle/bottom)
    - fallback behavior keeps them on the right side even if board is not visible
  - Kept transparency behavior unchanged (`p.noTint()` still used).
  - Bumped service-worker cache to `wam-cache-v41`.
- Why:
  - You requested all three floating objects to float on the right side of the game board.
- How to test:
  - Start a game and verify all three fairies stay on the board’s right side while bobbing.
  - Verify no fairy is rendered on the left side anymore.
  - Hard reload once so latest SW cache is active.

## 2026-02-11 (Drei Neue Sprite-Sets + Settings-Toggle)
- What changed:
  - Created new gameplay sprite sheets by slicing user-provided source PNGs into individual sprites:
    - `public/assets/original/sprite-sets/set_a/` (3 sprites)
    - `public/assets/original/sprite-sets/set_b/` (6 sprites)
    - `public/assets/original/sprite-sets/set_c/` (5 sprites)
  - Replaced fixed gameplay sweets sprite source with switchable sprite packs in `public/js/game/art.js`.
  - Added settings persistence for selected sprite pack in `public/js/game/storage.js` (`spritePack`).
  - Added a new settings toggle group (`Figuren-Set`) in `public/index.html` with:
    - `Set A`, `Set B`, `Set C`
  - Wired toggle behavior in `public/js/app.js`:
    - updates active sprite pack immediately
    - saves selection to local storage
    - re-renders board + forbidden runner using selected set
    - updates active variant count for ongoing rounds
  - Added style support for the new segmented control (`.segmented--packs`) in `public/styles.css`.
  - Added all new sprite files to service-worker pre-cache and bumped cache to `wam-cache-v42`.
- Why:
  - You requested creating sprites from all three provided images and making the three sets selectable via settings.
- How to test:
  - Open settings and switch `Figuren-Set` between `Set A`, `Set B`, and `Set C`.
  - Verify board sprites and forbidden-runner sprite switch to the selected set.
  - Reload page and confirm selected set persists.
  - Hard reload once so latest SW cache is active.

## 2026-02-11 (Nur Noch Set A + Set C, Landing-Icons = Set A)
- What changed:
  - Removed `Set B` from active gameplay sprite packs and settings toggle.
  - Updated sprite-pack logic and defaults:
    - `public/js/game/art.js`: packs now only `set_a` and `set_c` (default `set_a`)
    - `public/js/game/storage.js`: migrated old `set_b` setting to `set_a`
    - `public/js/app.js`: sprite-pack validation now only accepts `set_a`/`set_c`
    - `public/index.html`: settings toggle now shows only `Set A` and `Set C`
  - Removed `set_b` sprite files from `public/assets/original/sprite-sets/`.
  - Updated landing-page icons to use `Set A` sprites in `public/styles.css`:
    - title icon
    - start button icon
    - settings button icon
  - Updated service-worker pre-cache list and bumped cache to `wam-cache-v43`.
- Why:
  - You requested to keep only sets A and C and to use set A sprites as landing-page icons.
- How to test:
  - Open settings and confirm only `Set A` / `Set C` are available.
  - Toggle between both sets and verify board + forbidden runner sprites update.
  - Confirm landing title/button icons now come from `Set A`.
  - Hard reload once so latest SW cache is active.

## 2026-02-11 (Versuche Einstellbar 3-7 + Fairies = Verbleibende Versuche)
- What changed:
  - Added new settings control `Versuche` (`3`, `4`, `5`, `6`, `7`) in `public/index.html`.
  - Persisted new setting `maxAttempts` in `public/js/game/storage.js` with range-cleaning (`3..7`).
  - Updated `GameCore` in `public/js/game/game-core.js`:
    - constructor now accepts `maxForbiddenWhacks`
    - strike-out limit uses selected attempts instead of fixed `3`
  - Updated app wiring in `public/js/app.js`:
    - passes selected attempts into each new round
    - level-break copy now uses dynamic max attempts
    - forbidden strike-out/game-over messages now use dynamic limits
  - Updated floating-tooth-fairy controller in `public/js/tooth-fairy-float.js`:
    - supports up to `7` visible fairies
    - scales fairy size by configured attempt capacity
    - fairy count always matches remaining attempts
  - Added/updated tests in `tests/game-core.test.js` for configurable attempt caps (`5` + `7` cases).
- Why:
  - You requested selecting attempt count from `3` to `7` and making floating objects represent remaining attempts.
- How to test:
  - Open settings and choose `Versuche = 7`.
  - Start a round and verify `Verboten-Treffer` displays `0 / 7` and seven fairies are visible.
  - Trigger forbidden hits and verify both HUD and fairy count decrement together.
  - Repeat with `Versuche = 3` and verify strike-out at the third forbidden hit.

## 2026-02-11 (Sprite-Sets Zurueck Auf A + B)
- What changed:
  - Reintroduced `set_b` sprite assets from the original 6-character source image:
    - `public/assets/original/sprite-sets/set_b/1.png` ... `6.png`
  - Switched runtime sprite packs from `A + C` to `A + B`:
    - `public/js/game/art.js` now exposes `set_a` and `set_b`
    - `public/index.html` settings toggle now shows `Set A` + `Set B`
    - `public/js/app.js` sprite-pack validation now accepts `set_a` / `set_b`
    - `public/js/game/storage.js` migrates old `set_c` selections to `set_b`
  - Updated offline cache list and bumped SW cache to `wam-cache-v45` in `public/sw.js`.
- Why:
  - You requested to undo `A + C` and keep `A + B` instead.
- How to test:
  - Open settings and confirm only `Set A` and `Set B` are shown.
  - Toggle between both sets and verify board + forbidden runner switch sprites.
  - Hard reload once so latest SW cache is active.

## 2026-02-11 (Repo Cleanup + Dokumente Synchronisiert)
- What changed:
  - Updated core documentation to match current runtime state:
    - `CREDITS.md`
    - `docs/game-spec.md`
    - `docs/assets-plan.md`
    - `public/assets/original/backgrounds/SOURCES.md`
  - Added sprite provenance doc:
    - `public/assets/original/sprite-sets/SOURCES.md`
  - Added decision-log note for active sprite-pack policy (`A + B`).
  - Removed obsolete runtime sprite folder `set_c` from `public/assets/original/sprite-sets/`.
  - Trimmed service-worker pre-cache to runtime-active visual assets and bumped cache to `wam-cache-v46`.
- Why:
  - You requested repo cleanup and document updates before commit/push.
- How to test:
  - Verify settings still list only `Set A` and `Set B`.
  - Verify game still runs and sprite switching works.
  - Run `npm test` and `npm run build`.

## 2026-02-11 (Floating-Objekte Immer Außerhalb Des Boards)
- What changed:
  - Updated floating tooth-fairy placement logic in `public/js/tooth-fairy-float.js`.
  - Fairies now choose an anchor that is always outside the `.board-wrap` rectangle:
    - preferred: right side
    - fallback: left side, top, or bottom
  - If viewport is very tight, fairies stay outside board even when they must be partially off-screen.
  - Motion now uses side-aware drift so animations no longer push sprites back into the board.
- Why:
  - You reported board occlusion on mobile and requested floating objects to stay outside the gameboard.
- How to test:
  - Open on a narrow/mobile viewport and start a round.
  - Verify floating objects never overlap any board square.
  - Trigger forbidden hits and confirm the remaining-attempt fairy count still updates correctly.

## 2026-02-11 (Set A Ersetzt + Landing-Random-Icons + Neue Navigation-Buttons)
- What changed:
  - Replaced `Set A` with new kitty sprites generated from the provided attached PNGs:
    - `public/assets/original/sprite-sets/set_a/1.png` ... `6.png`
  - Extended active `Set A` variant list in `public/js/game/art.js` from 3 to 6 sprites.
  - Added landing-page sprite randomization on refresh in `public/js/app.js`:
    - random Set-A icons for brand logo, title icon, start/settings/leaderboard buttons
  - Added new buttons:
    - landing view: `Bestenliste` (`#leaderboardBtn`)
    - game view HUD: `Zur Startseite` (`#gameBackToStartBtn`)
  - Wired button behavior in `public/js/app.js`:
    - `Bestenliste` opens leaderboard view
    - `Zur Startseite` ends round and returns to title
  - Added new Set-A files to service-worker pre-cache and bumped cache to `wam-cache-v47`.
- Why:
  - You requested replacing Set A with the newly attached sprites, randomized landing icons, and explicit navigation buttons.
- How to test:
  - Reload page several times and verify landing icons change across refreshes.
  - Start a round and use `Zur Startseite` in HUD to return immediately to title.
  - On landing page click `Bestenliste` and verify leaderboard screen opens.

## 2026-02-11 (Mobile Sichtbarkeit: Board + Floating-Objekte)
- What changed:
  - Fixed mobile board layering so popping sprites stay above neighboring tiles:
    - raised active-hole stacking (`.hole--up`, `.hole--bonked`)
    - added board isolation for cleaner z-order behavior in tight layouts
  - Tightened floating-object placement:
    - mobile-specific anchor strategy now prefers lanes above/below board
    - stronger safety gap + hard overlap guard keeps fairies outside `.board-wrap`
  - Reduced mobile fairy size to about `0.72x` of the previous mobile size (additional shrink factor).
  - Bumped service-worker cache to `wam-cache-v48` for reliable update rollout.
- Why:
  - You reported that on mobile moles were partly hidden behind board layers and floating objects still occluded the board.
- How to test:
  - Open on mobile viewport and start a round.
  - Confirm popping sprites render fully above board squares.
  - Confirm floating objects stay outside the board area and do not block holes.
  - Hard reload once so latest SW cache is active.
