# Assets Plan (Kawaii Food + In-Repo)

## Visual Style
- Soft, rounded shapes with pastel colors.
- "Toy-like" shadows, gentle gradients, friendly faces.
- Prefer SVG for crisp scaling across devices.

## Asset List (v1)
- Background: user-provided kawaii image `kawaii-food-bg-1344879.png` (active runtime), with archived alternatives in `public/assets/original/backgrounds/`.
- Board texture: GUI-pack panel slice (`panel-blue-tight.png`) with soft overlays and palette-matched tinting.
- Hole texture: subtle rose/pink palette treatment based on active background tones.
- Critters: runtime sprite packs `Set A` (3) and `Set B` (6) in `public/assets/original/sprite-sets/`.
- Bonus critter: same active sprite + in-game bonus scoring treatment.
- Forbidden mechanic: one sprite from the active set is highlighted in a runner lane for 20s; matching board sprites are negative while active.
- UI skin slices: user-provided GUI pack slices in `public/assets/original/kawaii-gui/` for buttons/panels plus whimsical decor.
- Effects:
  - sugar sprinkles burst on correct bonks
  - score popup text bubble
- UI:
  - buttons (Start, Settings, Pause, Resume)
  - toggles (Sound/Music/Reduced Motion)
  - icons (speaker, music note) as SVG (optional)

## Audio Plan (No External Files Required)
- Generate SFX and simple music loop via **Web Audio API**:
  - bonk, pop, oops, button click
  - optional calm music (simple synth loop)
- Respect autoplay: initialize audio only after user interaction.

## Licensing Notes
- Character sprite packs and GUI skins are user-provided local assets copied into `public/assets/original/`.
- Active background image is user-provided and stored locally in repo.
- Background source notes: `public/assets/original/backgrounds/SOURCES.md`.
- Sprite source notes: `public/assets/original/sprite-sets/SOURCES.md`.
- Runtime uses only local files; no external asset calls.
- Audio is generated in-repo using Web Audio API.
- Archived exploration assets (if retained) stay outside runtime paths and keep attribution notes.
- Current archived food/veggie intake bundle:
  - `public/assets/opengameart/kawaii-food/ATTRIBUTION.md`
