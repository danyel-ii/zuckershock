import test from "node:test";
import assert from "node:assert/strict";

import { getDifficultyParams } from "../public/js/game/difficulty.js";

const profileSmall = { startHoles: 4, maxHoles: 6, simCap: 2 };
const profileBig = { startHoles: 5, maxHoles: 9, simCap: 3 };

test("classic difficulty clamps and reaches expected endpoints", () => {
  const p0 = getDifficultyParams({ elapsedSec: 0, mode: "classic", profile: profileSmall });
  assert.equal(p0.spawnIntervalMs, 1200);
  assert.equal(p0.visibleMs, 1100);
  assert.equal(p0.unlockedHoles, 4);
  assert.equal(p0.maxSimultaneous, 1);
  assert.equal(p0.decoyRate, 0);

  const pEnd = getDifficultyParams({ elapsedSec: 999, mode: "classic", profile: profileSmall });
  assert.equal(pEnd.spawnIntervalMs, 450);
  assert.equal(pEnd.visibleMs, 500);
  assert.equal(pEnd.unlockedHoles, 6);
  assert.equal(pEnd.maxSimultaneous, 2);
  assert.ok(Math.abs(pEnd.decoyRate - 0.12) < 1e-9);
});

test("classic spawn interval decreases monotonically across sampled times", () => {
  let last = Infinity;
  for (const t of [0, 5, 15, 30, 45, 60, 120]) {
    const p = getDifficultyParams({ elapsedSec: t, mode: "classic", profile: profileBig });
    assert.ok(p.spawnIntervalMs <= last, `expected non-increasing at t=${t}`);
    last = p.spawnIntervalMs;
  }
});

test("relax mode has no decoys", () => {
  for (const t of [0, 30, 120, 999]) {
    const p = getDifficultyParams({ elapsedSec: t, mode: "relax", profile: profileSmall });
    assert.equal(p.decoyRate, 0);
  }
});

test("speed profile 'langsam' makes spawn and visibility slower than normal", () => {
  const normal = getDifficultyParams({ elapsedSec: 25, mode: "classic", profile: profileBig, speed: "normal" });
  const slow = getDifficultyParams({ elapsedSec: 25, mode: "classic", profile: profileBig, speed: "langsam" });
  assert.ok(slow.spawnIntervalMs > normal.spawnIntervalMs);
  assert.ok(slow.visibleMs > normal.visibleMs);
});

test("speed profile 'schnell' makes spawn and visibility faster than normal", () => {
  const normal = getDifficultyParams({ elapsedSec: 25, mode: "classic", profile: profileBig, speed: "normal" });
  const fast = getDifficultyParams({ elapsedSec: 25, mode: "classic", profile: profileBig, speed: "schnell" });
  assert.ok(fast.spawnIntervalMs < normal.spawnIntervalMs);
  assert.ok(fast.visibleMs < normal.visibleMs);
});
