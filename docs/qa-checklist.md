# QA + Accessibility Checklist

Date: 2026-02-10

## Kid-Safety
- [x] No ads, chat, tracking, accounts, or runtime external calls
- [x] Kid-safe language ("boop/bonk/bonus/oops"), no violent terms
- [x] Penalties are gentle (points-only; score clamped at 0)

## Core Playability
- [x] Start -> play in 1 click
- [x] Classic mode round ends after 60s with Game Over screen
- [x] Best score persists after refresh

## Input
- [x] Pointer/touch: clicking holes bonks
- [x] Keyboard: holes are focusable buttons
- [x] Keyboard: arrow keys move within the grid
- [x] Keyboard: Enter/Space activates bonk

## Accessibility
- [x] Visible focus states for interactive elements
- [x] Large tap targets (hole buttons are > 52px minimum)
- [x] Reduced motion toggle disables key animations/particles
- [ ] Screen reader smoke test (recommended manual check)

## Audio
- [x] SFX respects Sound toggle
- [x] Music respects Music toggle
- [x] Audio initializes only after user interaction (Start/Settings click)

## Offline
- [x] Service worker registered and pre-caches app shell
- [ ] Manual offline reload test in a real browser (recommended)

