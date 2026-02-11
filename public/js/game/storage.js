const SETTINGS_KEY = "wam_settings_v1";
const BEST_SCORE_KEY = "wam_bestScore_v1";
const LEADERBOARD_KEY = "wam_leaderboard_v1";
const REMOTE_LEADERBOARD_ENDPOINT = "/api/leaderboard";
const MAX_LEADERBOARD_ENTRIES = 10;
const REMOTE_TIMEOUT_MS = 4_500;

const DEFAULT_SETTINGS = {
  soundOn: true,
  musicOn: false,
  reducedMotion: false,
  speed: "normal",
  maxAttempts: 3,
  spritePack: "set_a",
};

function cleanSpeed(speed) {
  // Backward-compat for previous setting keys.
  if (speed === "langsam") return "normal";
  if (speed === "schnell") return "schwierig";
  return speed === "schwierig" || speed === "sehr_schwierig" ? speed : "normal";
}

function cleanSpritePack(spritePack) {
  if (spritePack === "set_c") return "set_b";
  return spritePack === "set_a" || spritePack === "set_b" ? spritePack : "set_a";
}

function cleanMaxAttempts(maxAttempts) {
  const n = Math.floor(Number(maxAttempts));
  if (!Number.isFinite(n)) return 3;
  return Math.max(3, Math.min(7, n));
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
      maxAttempts: cleanMaxAttempts(parsed.maxAttempts),
      spritePack: cleanSpritePack(parsed.spritePack),
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
    maxAttempts: cleanMaxAttempts(settings.maxAttempts),
    spritePack: cleanSpritePack(settings.spritePack),
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

function cleanLimit(limit) {
  const n = Math.floor(Number(limit));
  if (!Number.isFinite(n)) return MAX_LEADERBOARD_ENTRIES;
  return Math.max(1, Math.min(MAX_LEADERBOARD_ENTRIES, n));
}

async function parseJsonSafe(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function requestRemoteLeaderboard(path, init = {}) {
  if (typeof fetch !== "function") {
    throw new Error("fetch_unavailable");
  }

  const controller = typeof AbortController === "function" ? new AbortController() : null;
  const timeoutId =
    controller && typeof window !== "undefined"
      ? window.setTimeout(() => controller.abort(), REMOTE_TIMEOUT_MS)
      : null;

  try {
    const response = await fetch(path, {
      cache: "no-store",
      ...init,
      headers: {
        Accept: "application/json",
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...(init.headers || {}),
      },
      signal: controller?.signal,
    });

    if (!response.ok) {
      const payload = await parseJsonSafe(response);
      const code = payload?.error ? String(payload.error) : `http_${response.status}`;
      throw new Error(code);
    }

    const payload = await parseJsonSafe(response);
    if (!payload || !Array.isArray(payload.entries)) {
      throw new Error("invalid_payload");
    }
    return normalizeLeaderboardEntries(payload.entries);
  } finally {
    if (timeoutId) window.clearTimeout(timeoutId);
  }
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

export async function loadLeaderboardRemote(limit = MAX_LEADERBOARD_ENTRIES) {
  const clean = cleanLimit(limit);
  const query = `?limit=${clean}`;
  const entries = await requestRemoteLeaderboard(`${REMOTE_LEADERBOARD_ENDPOINT}${query}`, {
    method: "GET",
  });
  return entries.slice(0, clean);
}

export async function addLeaderboardEntryRemote({ name, score, mode, reason }) {
  const payload = {
    name: cleanName(name) || "Player",
    score: Math.max(0, Math.floor(Number(score) || 0)),
    mode: cleanMode(mode),
    reason: cleanReason(reason),
  };
  return requestRemoteLeaderboard(REMOTE_LEADERBOARD_ENDPOINT, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
