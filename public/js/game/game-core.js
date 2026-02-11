import { cleanSpeed, getDifficultyParams, getSpeedProfile } from "./difficulty.js";
import { mulberry32 } from "./prng.js";

const FORBIDDEN_TRAVERSE_MS = 20_000;
const FORBIDDEN_ACTIVATION_DELAY_MS = 1_200;
const DEFAULT_VARIANT_COUNT = 4;
const MAX_FORBIDDEN_WHACKS = 3;
const LEVEL_DURATION_MS = 45_000;
const MAX_LEVEL = 4;

function countActive(holes) {
  let n = 0;
  for (const h of holes) if (h) n++;
  return n;
}

function pickRandom(arr, rnd) {
  if (arr.length === 0) return null;
  return arr[Math.floor(rnd() * arr.length)];
}

function shuffleInPlace(arr, rnd) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
}

export class GameCore {
  constructor({ mode, profile, seed, durationMs, speed = "normal" }) {
    this.mode = mode;
    this.profile = profile;
    this.speed = cleanSpeed(speed);
    this.speedProfile = getSpeedProfile(this.speed);
    this.forbiddenTraverseMs = Math.round(FORBIDDEN_TRAVERSE_MS * this.speedProfile.forbiddenTraverseScale);
    this.variantCount = Math.max(1, profile.variantCount || DEFAULT_VARIANT_COUNT);
    this.durationMs = durationMs;
    this.seed = seed >>> 0;
    this.rnd = mulberry32(this.seed);

    this.phase = "idle"; // idle | running | paused | over
    this.score = 0;
    this.streak = 0;
    this.forbiddenWhacks = 0;
    this.maxForbiddenWhacks = MAX_FORBIDDEN_WHACKS;
    this.gameOverReason = null;
    this.level = 1;

    this.startMs = 0;
    this.pausedAtMs = null;
    this.pausedTotalMs = 0;

    this.elapsedMs = 0;
    this.timeLeftMs = durationMs;

    this.holes = Array.from({ length: profile.maxHoles }, () => null);
    this.unlockedHoles = profile.startHoles;

    this.nextSpawnAtMs = 0;
    this.forbidden = null;
  }

  start(nowMs) {
    this.phase = "running";
    this.score = 0;
    this.streak = 0;
    this.forbiddenWhacks = 0;
    this.gameOverReason = null;
    this.level = 1;
    this.startMs = nowMs;
    this.pausedAtMs = null;
    this.pausedTotalMs = 0;
    this.elapsedMs = 0;
    this.timeLeftMs = this.durationMs;
    for (let i = 0; i < this.holes.length; i++) this.holes[i] = null;
    this.unlockedHoles = this.profile.startHoles;
    this.nextSpawnAtMs = nowMs + 350;
    this.rotateForbidden(nowMs);
  }

  pause(nowMs) {
    if (this.phase !== "running") return;
    this.phase = "paused";
    this.pausedAtMs = nowMs;
  }

  resume(nowMs) {
    if (this.phase !== "paused") return;
    this.phase = "running";
    if (this.pausedAtMs != null) {
      this.pausedTotalMs += nowMs - this.pausedAtMs;
      this.pausedAtMs = null;
    }
    // Give the player a moment after resuming.
    this.nextSpawnAtMs = nowMs + 250;
  }

  rotateForbidden(nowMs) {
    const prevVariant = this.forbidden?.variant ?? -1;
    let variant = Math.floor(this.rnd() * this.variantCount);
    if (this.variantCount > 1 && variant === prevVariant) {
      variant = (variant + 1 + Math.floor(this.rnd() * (this.variantCount - 1))) % this.variantCount;
    }
    const direction = this.rnd() < 0.5 ? "ltr" : "rtl";
    this.forbidden = {
      variant,
      direction,
      startedAtMs: nowMs,
      endsAtMs: nowMs + this.forbiddenTraverseMs,
      activeAtMs: nowMs + FORBIDDEN_ACTIVATION_DELAY_MS,
      isActive: false,
      activationRemainingMs: FORBIDDEN_ACTIVATION_DELAY_MS,
      progress: 0,
      remainingMs: this.forbiddenTraverseMs,
    };
  }

  computeLevel() {
    const passed = Math.max(0, Math.floor(this.elapsedMs / LEVEL_DURATION_MS));
    return Math.min(MAX_LEVEL, 1 + passed);
  }

  grantLevelAttempt() {
    const before = this.forbiddenWhacks;
    this.forbiddenWhacks = Math.max(0, this.forbiddenWhacks - 1);
    const after = this.forbiddenWhacks;
    return {
      gained: after < before,
      forbiddenWhacks: after,
      maxForbiddenWhacks: this.maxForbiddenWhacks,
      attemptsLeft: Math.max(0, this.maxForbiddenWhacks - after),
    };
  }

  getTurnSpriteCount() {
    if (this.level === 2) return 2;
    if (this.level === 3) return 3;
    if (this.level === 4) return 2;
    return 1;
  }

  randomVariant() {
    return Math.floor(this.rnd() * this.variantCount);
  }

  randomAllowedVariant() {
    const forbiddenVariant = this.forbidden?.variant ?? 0;
    if (this.variantCount <= 1) return forbiddenVariant;
    let variant = this.randomVariant();
    if (variant === forbiddenVariant) {
      variant = (variant + 1 + Math.floor(this.rnd() * (this.variantCount - 1))) % this.variantCount;
    }
    return variant;
  }

  randomKind(params) {
    return this.rnd() < params.bonusRate ? "bonus" : "critter";
  }

  makeOccupant({ nowMs, params, kind, variant, forbiddenOverride = false }) {
    return {
      kind,
      variant,
      forbiddenOverride: !!forbiddenOverride,
      spawnedAtMs: nowMs,
      hideAtMs: nowMs + params.visibleMs,
    };
  }

  buildTurnOccupants({ nowMs, params, count }) {
    const amount = Math.max(0, Math.floor(count));
    if (amount === 0) return [];

    const forbiddenVariant = this.forbidden?.variant ?? 0;

    // Level 3: three per turn, with two forbidden and one allowed when capacity allows.
    if (this.level === 3) {
      const template = [];
      if (amount >= 3) {
        template.push(
          this.makeOccupant({
            nowMs,
            params,
            kind: "critter",
            variant: forbiddenVariant,
          }),
          this.makeOccupant({
            nowMs,
            params,
            kind: "critter",
            variant: forbiddenVariant,
          }),
          this.makeOccupant({
            nowMs,
            params,
            kind: this.randomKind(params),
            variant: this.randomAllowedVariant(),
          })
        );
      } else if (amount === 2) {
        template.push(
          this.makeOccupant({
            nowMs,
            params,
            kind: "critter",
            variant: forbiddenVariant,
          }),
          this.makeOccupant({
            nowMs,
            params,
            kind: this.randomKind(params),
            variant: this.randomAllowedVariant(),
          })
        );
      } else {
        template.push(
          this.makeOccupant({
            nowMs,
            params,
            kind: this.randomKind(params),
            variant: this.randomAllowedVariant(),
          })
        );
      }
      shuffleInPlace(template, this.rnd);
      return template;
    }

    // Levels 1/2/4 baseline random set.
    const out = [];
    for (let i = 0; i < amount; i++) {
      out.push(
        this.makeOccupant({
          nowMs,
          params,
          kind: this.randomKind(params),
          variant: this.randomVariant(),
        })
      );
    }

    // Level 4 rule: two per turn; if either matches forbidden variant, both become forbidden.
    if (this.level === 4 && out.length >= 2) {
      const matchesForbidden = out[0].variant === forbiddenVariant || out[1].variant === forbiddenVariant;
      if (matchesForbidden) {
        out[0].forbiddenOverride = true;
        out[1].forbiddenOverride = true;
      }
    }

    return out;
  }

  tick(nowMs) {
    if (this.phase !== "running") return;

    this.elapsedMs = Math.max(0, nowMs - this.startMs - this.pausedTotalMs);
    if (this.durationMs != null) {
      this.timeLeftMs = Math.max(0, this.durationMs - this.elapsedMs);
      if (this.timeLeftMs <= 0) {
        this.phase = "over";
        this.gameOverReason = "time_up";
        for (let i = 0; i < this.holes.length; i++) this.holes[i] = null;
        return;
      }
    }

    if (!this.forbidden || nowMs >= this.forbidden.endsAtMs) {
      this.rotateForbidden(nowMs);
    }
    if (this.forbidden) {
      const total = this.forbidden.endsAtMs - this.forbidden.startedAtMs || 1;
      const elapsed = Math.max(0, nowMs - this.forbidden.startedAtMs);
      this.forbidden.progress = Math.min(1, elapsed / total);
      this.forbidden.remainingMs = Math.max(0, this.forbidden.endsAtMs - nowMs);
      this.forbidden.activationRemainingMs = Math.max(0, this.forbidden.activeAtMs - nowMs);
      this.forbidden.isActive = nowMs >= this.forbidden.activeAtMs;
    }

    const params = getDifficultyParams({
      elapsedSec: this.elapsedMs / 1000,
      mode: this.mode,
      profile: this.profile,
      speed: this.speed,
    });
    this.level = this.computeLevel();
    this.unlockedHoles = params.unlockedHoles;

    // Expire old occupants.
    for (let i = 0; i < this.holes.length; i++) {
      const occ = this.holes[i];
      if (!occ) continue;
      if (nowMs >= occ.hideAtMs) {
        this.holes[i] = null;
        // Missing a critter breaks the streak (gentle: no score penalty).
        if (occ.kind === "critter" || occ.kind === "bonus") this.streak = 0;
      }
    }

    const active = countActive(this.holes);
    if (nowMs < this.nextSpawnAtMs) return;

    // Catch-up loop (e.g., tab was backgrounded) with a small cap.
    let loops = 0;
    while (nowMs >= this.nextSpawnAtMs && loops < 5) {
      loops++;
      const p = getDifficultyParams({
        elapsedSec: this.elapsedMs / 1000,
        mode: this.mode,
        profile: this.profile,
        speed: this.speed,
      });

      const activeNow = countActive(this.holes);
      const turnCount = this.getTurnSpriteCount();
      const turnCap = Math.max(turnCount, p.maxSimultaneous);
      if (activeNow < turnCap) {
        const candidates = [];
        for (let i = 0; i < p.unlockedHoles; i++) {
          if (!this.holes[i]) candidates.push(i);
        }

        const slotsAvailable = Math.max(0, turnCap - activeNow);
        const spawnCount = Math.min(turnCount, candidates.length, slotsAvailable);
        if (spawnCount > 0) {
          const pickedHoles = [];
          for (let n = 0; n < spawnCount; n++) {
            const chosen = pickRandom(candidates, this.rnd);
            if (chosen == null) break;
            pickedHoles.push(chosen);
            const idx = candidates.indexOf(chosen);
            if (idx >= 0) candidates.splice(idx, 1);
          }

          const occupants = this.buildTurnOccupants({ nowMs, params: p, count: pickedHoles.length });
          for (let n = 0; n < pickedHoles.length && n < occupants.length; n++) {
            this.holes[pickedHoles[n]] = occupants[n];
          }
        }
      }

      this.nextSpawnAtMs += p.spawnIntervalMs;
      if (this.nextSpawnAtMs < nowMs - 2000) this.nextSpawnAtMs = nowMs + p.spawnIntervalMs;
    }
  }

  bonk(holeIndex, nowMs) {
    if (this.phase !== "running") return { result: "ignored", delta: 0 };
    if (holeIndex < 0 || holeIndex >= this.holes.length) return { result: "ignored", delta: 0 };

    const occ = this.holes[holeIndex];
    if (!occ) {
      this.streak = 0;
      return { result: "miss", delta: 0 };
    }

    this.holes[holeIndex] = null;

    const forbiddenActive = !!this.forbidden?.isActive;
    const isForbidden =
      forbiddenActive && (!!occ.forbiddenOverride || (this.forbidden && occ.variant === this.forbidden.variant));
    if (isForbidden) {
      this.streak = 0;
      this.forbiddenWhacks = Math.min(this.maxForbiddenWhacks, this.forbiddenWhacks + 1);
      const delta = -150;
      this.score = Math.max(0, this.score + delta);
      const strikeOut = this.forbiddenWhacks >= this.maxForbiddenWhacks;
      if (strikeOut) {
        this.phase = "over";
        this.gameOverReason = "forbidden_limit";
        for (let i = 0; i < this.holes.length; i++) this.holes[i] = null;
      }
      return {
        result: "forbidden",
        delta,
        kind: occ.kind,
        variant: occ.variant,
        forcedForbidden: !!occ.forbiddenOverride,
        forbiddenWhacks: this.forbiddenWhacks,
        maxForbiddenWhacks: this.maxForbiddenWhacks,
        strikeOut,
      };
    }

    const base = occ.kind === "bonus" ? 250 : 100;
    this.streak += 1;
    const tier = Math.min(3, Math.floor(this.streak / 5)); // every 5 hits = +10%, cap 30%
    const mult = 1 + tier * 0.1;
    const delta = Math.round(base * mult);
    this.score = Math.max(0, this.score + delta);
    return { result: "hit", delta, kind: occ.kind };
  }

  getView() {
    return {
      phase: this.phase,
      mode: this.mode,
      speed: this.speed,
      level: this.level,
      score: this.score,
      streak: this.streak,
      forbiddenWhacks: this.forbiddenWhacks,
      maxForbiddenWhacks: this.maxForbiddenWhacks,
      gameOverReason: this.gameOverReason,
      durationMs: this.durationMs,
      timeLeftMs: this.timeLeftMs,
      unlockedHoles: this.unlockedHoles,
      holes: this.holes,
      forbidden: this.forbidden,
    };
  }
}
