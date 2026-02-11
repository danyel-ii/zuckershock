const SETTINGS_KEY = "wam_settings_v1";
const BEST_SCORE_KEY = "wam_bestScore_v1";
const LEADERBOARD_KEY = "wam_leaderboard_v1";
const MAX_LEADERBOARD_ENTRIES = 10;

const DEFAULT_SETTINGS = {
  soundOn: true,
  musicOn: false,
  reducedMotion: false,
  speed: "normal",
};

function cleanSpeed(speed) {
  return speed === "langsam" || speed === "schnell" ? speed : "normal";
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS, __isDefault: true };
    const parsed = JSON.parse(raw);
    return {
      soundOn: !!parsed.soundOn,
      musicOn: !!parsed.musicOn,
      reducedMotion: !!parsed.reducedMotion,
      speed: cleanSpeed(parsed.speed),
      __isDefault: false,
    };
  } catch {
    return { ...DEFAULT_SETTINGS, __isDefault: true };
  }
}

export function saveSettings(settings) {
  const clean = {
    soundOn: !!settings.soundOn,
    musicOn: !!settings.musicOn,
    reducedMotion: !!settings.reducedMotion,
    speed: cleanSpeed(settings.speed),
  };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(clean));
}

export function loadBestScore() {
  try {
    const raw = localStorage.getItem(BEST_SCORE_KEY);
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
  } catch {
    return 0;
  }
}

export function saveBestScore(score) {
  const n = Number(score);
  if (!Number.isFinite(n)) return;
  localStorage.setItem(BEST_SCORE_KEY, String(Math.floor(n)));
}

function cleanName(name) {
  const text = String(name ?? "")
    .replace(/\s+/g, " ")
    .trim();
  return text.slice(0, 18);
}

function cleanMode(mode) {
  return mode === "relax" ? "relax" : "classic";
}

function cleanReason(reason) {
  return reason === "forbidden_limit" ? "forbidden_limit" : "time_up";
}

function normalizeLeaderboardEntries(raw) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  for (const entry of raw) {
    const score = Math.floor(Number(entry?.score));
    if (!Number.isFinite(score) || score < 0) continue;

    const name = cleanName(entry?.name) || "Player";
    const mode = cleanMode(entry?.mode);
    const reason = cleanReason(entry?.reason);
    const createdAtMs = Math.floor(Number(entry?.createdAtMs));
    const safeCreatedAtMs = Number.isFinite(createdAtMs) && createdAtMs > 0 ? createdAtMs : Date.now();

    out.push({ name, score, mode, reason, createdAtMs: safeCreatedAtMs });
  }

  out.sort((a, b) => b.score - a.score || a.createdAtMs - b.createdAtMs);
  return out.slice(0, MAX_LEADERBOARD_ENTRIES);
}

export function loadLeaderboard() {
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    if (!raw) return [];
    return normalizeLeaderboardEntries(JSON.parse(raw));
  } catch {
    return [];
  }
}

export function saveLeaderboard(entries) {
  const clean = normalizeLeaderboardEntries(entries);
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(clean));
}

export function addLeaderboardEntry({ name, score, mode, reason }) {
  const cleanScore = Math.floor(Number(score));
  if (!Number.isFinite(cleanScore) || cleanScore < 0) return loadLeaderboard();

  const entry = {
    name: cleanName(name) || "Player",
    score: cleanScore,
    mode: cleanMode(mode),
    reason: cleanReason(reason),
    createdAtMs: Date.now(),
  };

  const next = normalizeLeaderboardEntries([...loadLeaderboard(), entry]);
  saveLeaderboard(next);
  return next;
}
