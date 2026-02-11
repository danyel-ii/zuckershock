import test from "node:test";
import assert from "node:assert/strict";

import { GameCore } from "../public/js/game/game-core.js";

test("spawn -> bonk -> score changes and clears occupant", () => {
  const profile = { cols: 3, startHoles: 4, maxHoles: 6, simCap: 2, variantCount: 4 };
  const core = new GameCore({ mode: "classic", profile, seed: 1234, durationMs: 10_000 });

  core.start(0);
  core.tick(400); // nextSpawnAtMs starts at 350ms

  const view1 = core.getView();
  const idx = view1.holes.findIndex(Boolean);
  assert.ok(idx >= 0, "expected a spawned occupant");

  const res = core.bonk(idx, 410);
  assert.ok(res.delta !== 0, "expected a score delta");
  if (res.result === "forbidden") {
    assert.ok(res.delta < 0, "forbidden bonk should be negative");
    assert.equal(core.getView().score, 0, "score stays clamped at zero");
  } else {
    assert.ok(res.delta > 0, "normal/bonus bonk should be positive");
    assert.ok(core.getView().score > 0, "expected positive score after bonk");
  }
  assert.equal(core.getView().holes[idx], null, "bonked occupant should be removed");
});

test("level 1 spawns one sprite per turn", () => {
  const profile = { cols: 3, startHoles: 5, maxHoles: 9, simCap: 3, variantCount: 4 };
  const core = new GameCore({ mode: "classic", profile, seed: 111, durationMs: 60_000 });
  core.start(0);
  core.nextSpawnAtMs = 500;
  core.tick(500);

  const view = core.getView();
  const active = view.holes.filter(Boolean);
  assert.equal(view.level, 1);
  assert.equal(active.length, 1);
});

test("level 2 spawns two sprites per turn", () => {
  const profile = { cols: 3, startHoles: 5, maxHoles: 9, simCap: 3, variantCount: 4 };
  const core = new GameCore({ mode: "classic", profile, seed: 112, durationMs: 180_000 });
  core.start(0);
  core.nextSpawnAtMs = 45_000;
  core.tick(45_000);

  const view = core.getView();
  const active = view.holes.filter(Boolean);
  assert.equal(view.level, 2);
  assert.equal(active.length, 2);
});

test("level 3 spawns three sprites with two forbidden and one allowed", () => {
  const profile = { cols: 3, startHoles: 5, maxHoles: 9, simCap: 3, variantCount: 4 };
  const core = new GameCore({ mode: "classic", profile, seed: 113, durationMs: 180_000 });
  core.start(0);
  core.nextSpawnAtMs = 90_000;
  core.tick(90_000);

  const view = core.getView();
  const active = view.holes.filter(Boolean);
  assert.equal(view.level, 3);
  assert.equal(active.length, 3);

  const forbiddenCount = active.filter((h) => h.variant === view.forbidden.variant).length;
  assert.equal(forbiddenCount, 2);
});

test("level change grants one attempt back, capped at max 3", () => {
  const profile = { cols: 3, startHoles: 5, maxHoles: 9, simCap: 3, variantCount: 4 };
  const core = new GameCore({ mode: "classic", profile, seed: 119, durationMs: 180_000 });
  core.start(0);

  core.forbiddenWhacks = 2;
  const gained = core.grantLevelAttempt();
  assert.equal(gained.gained, true);
  assert.equal(gained.forbiddenWhacks, 1);
  assert.equal(gained.attemptsLeft, 2);

  core.forbiddenWhacks = 0;
  const capped = core.grantLevelAttempt();
  assert.equal(capped.gained, false);
  assert.equal(capped.forbiddenWhacks, 0);
  assert.equal(capped.attemptsLeft, 3);
});

test("level 4 pair rule marks both sprites forbidden when one matches", () => {
  const profile = { cols: 3, startHoles: 5, maxHoles: 9, simCap: 3, variantCount: 4 };
  const core = new GameCore({ mode: "classic", profile, seed: 114, durationMs: 60_000 });
  core.start(0);
  core.level = 4;
  core.forbidden = {
    variant: 1,
    direction: "ltr",
    startedAtMs: 0,
    endsAtMs: 20_000,
    progress: 0,
    remainingMs: 20_000,
  };

  const seq = [0.9, 0.3, 0.2, 0.55]; // kind, variant(1), kind, variant(2)
  let n = 0;
  core.rnd = () => {
    const v = seq[n];
    n += 1;
    return v ?? 0.1;
  };

  const occupants = core.buildTurnOccupants({
    nowMs: 1000,
    params: { bonusRate: 0, visibleMs: 900 },
    count: 2,
  });

  assert.equal(occupants.length, 2);
  assert.ok(occupants.some((o) => o.variant === 1));
  assert.ok(occupants.every((o) => o.forbiddenOverride === true));
});

test("round ends when timer hits zero", () => {
  const profile = { cols: 2, startHoles: 4, maxHoles: 6, simCap: 2, variantCount: 4 };
  const core = new GameCore({ mode: "classic", profile, seed: 1, durationMs: 1000 });
  core.start(0);

  core.tick(2000);
  const view = core.getView();
  assert.equal(view.phase, "over");
  assert.equal(view.timeLeftMs, 0);
  assert.equal(view.gameOverReason, "time_up");
  assert.ok(view.holes.every((h) => h === null), "holes should be cleared on game over");
});

test("forbidden variant rotates every 20 seconds", () => {
  const profile = { cols: 3, startHoles: 5, maxHoles: 9, simCap: 3, variantCount: 4 };
  const core = new GameCore({ mode: "classic", profile, seed: 42, durationMs: 60_000 });
  core.start(0);

  const v1 = core.getView().forbidden?.variant;
  assert.ok(Number.isInteger(v1), "forbidden variant should exist at start");

  core.tick(20_050);
  const v2 = core.getView().forbidden?.variant;
  assert.ok(Number.isInteger(v2), "forbidden variant should exist after rotation");
  assert.notEqual(v2, v1, "forbidden variant should rotate to a new sprite");
});

test("speed 'sehr_schwierig' rotates forbidden runner sooner than normal", () => {
  const profile = { cols: 3, startHoles: 5, maxHoles: 9, simCap: 3, variantCount: 4 };
  const fast = new GameCore({ mode: "classic", profile, seed: 222, durationMs: 60_000, speed: "sehr_schwierig" });
  fast.start(0);
  const firstVariant = fast.getView().forbidden?.variant;
  assert.ok(Number.isInteger(firstVariant), "forbidden variant should exist at start");

  fast.tick(17_000);
  const secondVariant = fast.getView().forbidden?.variant;
  assert.ok(Number.isInteger(secondVariant), "forbidden variant should exist after fast traversal");
  assert.notEqual(secondVariant, firstVariant, "fast speed should rotate before 20 seconds");
});

test("matching forbidden variant applies negative score", () => {
  const profile = { cols: 3, startHoles: 4, maxHoles: 6, simCap: 2, variantCount: 4 };
  const core = new GameCore({ mode: "classic", profile, seed: 7, durationMs: 30_000 });
  core.start(0);
  core.tick(1_500);

  const forbidden = core.getView().forbidden;
  assert.ok(forbidden, "forbidden state should exist");
  assert.equal(forbidden.isActive, true, "forbidden state should be active after visibility lead-in");

  core.holes[0] = {
    kind: "critter",
    variant: forbidden.variant,
    spawnedAtMs: 0,
    hideAtMs: 10_000,
  };

  const res = core.bonk(0, 100);
  assert.equal(res.result, "forbidden");
  assert.equal(res.delta, -150);
  assert.equal(res.forbiddenWhacks, 1);
  assert.equal(res.strikeOut, false);
  assert.equal(core.getView().score, 0, "score should clamp at zero after penalty");
});

test("three forbidden whacks ends the round immediately", () => {
  const profile = { cols: 3, startHoles: 4, maxHoles: 6, simCap: 2, variantCount: 4 };
  const core = new GameCore({ mode: "classic", profile, seed: 9, durationMs: 30_000 });
  core.start(0);
  core.tick(1_500);

  const forbidden = core.getView().forbidden;
  assert.ok(forbidden, "forbidden state should exist");

  for (let attempt = 1; attempt <= 3; attempt++) {
    core.holes[0] = {
      kind: "critter",
      variant: forbidden.variant,
      spawnedAtMs: 0,
      hideAtMs: 10_000,
    };
    const res = core.bonk(0, 100 + attempt);
    assert.equal(res.result, "forbidden");
    assert.equal(res.forbiddenWhacks, attempt);

    if (attempt < 3) {
      assert.equal(res.strikeOut, false);
      assert.equal(core.getView().phase, "running");
    } else {
      assert.equal(res.strikeOut, true);
      const view = core.getView();
      assert.equal(view.phase, "over");
      assert.equal(view.gameOverReason, "forbidden_limit");
      assert.equal(view.forbiddenWhacks, 3);
      assert.ok(view.holes.every((h) => h === null), "holes should clear on strike-out");
    }
  }
});

test("forbidden sprite is visible before forbidden penalty becomes active", () => {
  const profile = { cols: 3, startHoles: 4, maxHoles: 6, simCap: 2, variantCount: 4 };
  const core = new GameCore({ mode: "classic", profile, seed: 10, durationMs: 30_000 });
  core.start(0);

  const beforeActive = core.getView().forbidden;
  assert.ok(beforeActive, "forbidden state should exist");
  assert.equal(beforeActive.isActive, false, "forbidden should start in visibility-only phase");

  core.holes[0] = {
    kind: "critter",
    variant: beforeActive.variant,
    spawnedAtMs: 0,
    hideAtMs: 10_000,
  };
  const earlyRes = core.bonk(0, 100);
  assert.notEqual(earlyRes.result, "forbidden", "matching before activation should not penalize");

  core.tick(1_500);
  const activeForbidden = core.getView().forbidden;
  assert.equal(activeForbidden.isActive, true, "forbidden should become active after delay");

  core.holes[0] = {
    kind: "critter",
    variant: activeForbidden.variant,
    spawnedAtMs: 0,
    hideAtMs: 10_000,
  };
  const lateRes = core.bonk(0, 1_600);
  assert.equal(lateRes.result, "forbidden", "matching after activation should penalize");
});
