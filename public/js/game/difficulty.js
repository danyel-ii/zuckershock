import { clamp, clamp01, easeInQuad, lerp } from "./utils.js";

const SPEED_PROFILES = {
  langsam: {
    spawnScale: 1.2,
    visibleScale: 1.2,
    forbiddenTraverseScale: 1.2,
  },
  normal: {
    spawnScale: 1,
    visibleScale: 1,
    forbiddenTraverseScale: 1,
  },
  schnell: {
    spawnScale: 0.84,
    visibleScale: 0.84,
    forbiddenTraverseScale: 0.84,
  },
};

export function cleanSpeed(speed) {
  return speed === "langsam" || speed === "schnell" ? speed : "normal";
}

export function getSpeedProfile(speed) {
  const key = cleanSpeed(speed);
  return { key, ...SPEED_PROFILES[key] };
}

export function getDifficultyParams({ elapsedSec, mode, profile, speed = "normal" }) {
  const rampSeconds = mode === "classic" ? 60 : 180;
  const d = clamp01(elapsedSec / rampSeconds);
  const c = easeInQuad(d);
  const speedProfile = getSpeedProfile(speed);

  const spawnFrom = mode === "classic" ? 1200 : 1400;
  const spawnTo = mode === "classic" ? 450 : 750;

  const visibleFrom = mode === "classic" ? 1100 : 1250;
  const visibleTo = mode === "classic" ? 500 : 800;

  const spawnIntervalMs = clamp(
    320,
    2200,
    Math.round(lerp(spawnFrom, spawnTo, c) * speedProfile.spawnScale)
  );
  const visibleMs = clamp(360, 2200, Math.round(lerp(visibleFrom, visibleTo, c) * speedProfile.visibleScale));

  const unlockedHoles = clamp(
    profile.startHoles,
    profile.maxHoles,
    Math.round(lerp(profile.startHoles, profile.maxHoles, c))
  );

  const maxSimultaneous = clamp(1, profile.simCap, Math.floor(lerp(1, profile.simCap + 0.001, c)));

  const decoyRate = mode === "classic" ? lerp(0, 0.12, d) : 0;
  const bonusRate = mode === "classic" ? 0.06 : 0.05;

  return {
    d,
    speed: speedProfile.key,
    spawnIntervalMs,
    visibleMs,
    unlockedHoles,
    maxSimultaneous,
    decoyRate,
    bonusRate,
  };
}
