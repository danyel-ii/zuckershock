# Assets Plan (Kawaii Food + In-Repo)

## Visual Style
- Soft, rounded shapes with pastel colors.
- "Toy-like" shadows, gentle gradients, friendly faces.
- Prefer SVG for crisp scaling across devices.

## Asset List (v1)
- Background: avocado-themed PNG extracted from user PDF (`kawaii-avocado-bg.png`) + summer JPG fallback (`kawaii-summer.jpg`) + soft green overlays.
- Board texture: GUI-pack blue panel slice (`panel-blue-tight.png`) with light overlays.
- Hole texture: softened green panel treatment using GUI slice + gradients for large, readable targets.
- Critters (4 variants): user-provided kawaii sweets PNGs in `public/assets/original/kawaii-sweets/`.
- Bonus critter: same sweets sprite + in-game "PRIZE" badge + saturation/glow treatment.
- Forbidden mechanic: one sprite from the same sweets set is highlighted in a bottom runner lane for 20s; matching board sprites are negative while active.
- UI skin slices: user-provided GUI pack slices in `public/assets/original/kawaii-gui/` for buttons/panels plus whimsical decor.
- Effects:
  - sparkles/stars (CSS/SVG)
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
- Character sprites and GUI skins are user-provided local assets copied into `public/assets/original/`.
- Avocado background is derived from user-provided local PDF via local thumbnail extraction.
- Background source notes: `public/assets/original/backgrounds/SOURCES.md`.
- Runtime uses only local files; no external asset calls.
- Audio is generated in-repo using Web Audio API.
- Archived exploration assets (if retained) stay outside runtime paths and keep attribution notes.
- Current archived food/veggie intake bundle:
  - `public/assets/opengameart/kawaii-food/ATTRIBUTION.md`
