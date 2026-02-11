import {
  addLeaderboardEntry,
  loadBestScore,
  loadLeaderboard,
  loadSettings,
  saveBestScore,
  saveSettings,
} from "./game/storage.js";
import { AudioManager } from "./game/audio.js";
import { createBoard } from "./game/board.js";
import { GameCore } from "./game/game-core.js";
import { seedFromNow } from "./game/prng.js";
import { formatSecondsCeil } from "./game/utils.js";
import { critterSvg, getSpriteVariantCount, setSpritePackId } from "./game/art.js";
import { initToothFairyFloats } from "./tooth-fairy-float.js";

const $ = (sel) => document.querySelector(sel);

const screens = {
  title: $("#screen-title"),
  game: $("#screen-game"),
  gameover: $("#screen-gameover"),
};

const bestScoreValue = $("#bestScoreValue");
const bestScoreValue2 = $("#bestScoreValue2");
const startBtn = $("#startBtn");
const settingsBtn = $("#settingsBtn");
const pauseBtn = $("#pauseBtn");
const playAgainBtn = $("#playAgainBtn");
const backToTitleBtn = $("#backToTitleBtn");
const scoreValue = $("#scoreValue");
const timeValue = $("#timeValue");
const levelValue = $("#levelValue");
const boardRoot = $("#board");
const announcer = $("#announcer");
const finalScoreValue = $("#finalScoreValue");
const gameoverHeading = $("#gameover-heading");
const gameoverReason = $("#gameoverReason");
const forbiddenLabel = $("#forbiddenLabel");
const forbiddenTrack = $("#forbiddenTrack");
const forbiddenRunner = $("#forbiddenRunner");
const levelBreak = $("#levelBreak");
const levelBreakTitle = $("#levelBreakTitle");
const levelBreakCount = $("#levelBreakCount");
const levelBreakInfo = $("#levelBreakInfo");
const forbiddenHitsValue = $("#forbiddenHitsValue");
const titleLeaderboard = $("#titleLeaderboard");
const gameoverLeaderboard = $("#gameoverLeaderboard");
const leaderboardForm = $("#leaderboardForm");
const leaderboardName = $("#leaderboardName");
const saveScoreBtn = $("#saveScoreBtn");
const saveScoreFeedback = $("#saveScoreFeedback");

const overlay = $("#overlay");
const overlayTitle = $("#overlayTitle");
const soundToggle = $("#soundToggle");
const musicToggle = $("#musicToggle");
const reducedMotionToggle = $("#reducedMotionToggle");
const restartBtn = $("#restartBtn");
const resumeBtn = $("#resumeBtn");

const modeButtons = Array.from(document.querySelectorAll("[data-mode]"));
const speedButtons = Array.from(document.querySelectorAll("[data-speed]"));
const attemptButtons = Array.from(document.querySelectorAll("[data-max-attempts]"));
const spritePackButtons = Array.from(document.querySelectorAll("[data-sprite-pack]"));
const ROUND_LEVELS = 4;
const LEVEL_DURATION_MS = 45_000;

function cleanMaxAttempts(value) {
  const n = Math.floor(Number(value));
  if (!Number.isFinite(n)) return 3;
  return Math.max(3, Math.min(7, n));
}

function showScreen(key) {
  for (const [k, el] of Object.entries(screens)) {
    const active = k === key;
    el.hidden = !active;
    el.classList.toggle("screen--active", active);
  }
  const appEl = document.querySelector(".app");
  appEl?.classList.toggle("app--in-game", key === "game");
  document.body.classList.toggle("body--in-game", key === "game");
  if (key !== "game") hideLevelBreak();
  if (key === "game") {
    window.requestAnimationFrame(() => fitBoardToViewport());
  }
}

function setOverlayOpen(open) {
  const panel = overlay.querySelector(".overlay__panel");
  overlay.hidden = !open;
  if (open) {
    const first =
      overlay.querySelector("input, button, [href], select, textarea, [tabindex]:not([tabindex='-1'])") ||
      panel;
    (first instanceof HTMLElement ? first : panel)?.focus?.();
  }
}

let settings = loadSettings();
let bestScore = loadBestScore();
let leaderboard = loadLeaderboard();
let mode = "classic";
let lastFocus = null;
let overlayMode = "settings"; // settings | pause
let lastEnteredName = "";
let roundSaved = false;
let pendingRoundResult = null;

settings.spritePack = setSpritePackId(settings.spritePack);
settings.maxAttempts = cleanMaxAttempts(settings.maxAttempts);

const audio = new AudioManager({ soundOn: settings.soundOn, musicOn: settings.musicOn });
const fairyController = initToothFairyFloats();

let core = null;
let board = null;
let rafId = 0;
let currentProfileKey = "";
let lastForbiddenKey = "";
let lastForbiddenWasActive = false;
let activeProfile = null;
let levelBreakTimerId = 0;
let levelBreakInProgress = false;
let seenLevel = 1;

function computeBoardProfile() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const minDim = Math.min(w, h);

  const cols = w < 380 ? 2 : 3;
  const small = minDim < 420 || cols === 2;

  const maxHoles = small ? 6 : 9;
  const startHoles = small ? 4 : 5;
  const simCap = small ? 2 : 3;
  const variantCount = Math.max(1, getSpriteVariantCount());

  return { cols, maxHoles, startHoles, simCap, variantCount };
}

function formatModeName(modeName) {
  return modeName === "relax" ? "Entspannt" : "Klassik";
}

function updateFairyAttempts(stateLike = null) {
  const maxAttempts = cleanMaxAttempts(stateLike?.maxForbiddenWhacks ?? settings.maxAttempts);
  const forbiddenWhacksRaw = Number(stateLike?.forbiddenWhacks ?? 0);
  const forbiddenWhacks = Number.isFinite(forbiddenWhacksRaw) ? Math.max(0, Math.floor(forbiddenWhacksRaw)) : 0;
  const attemptsLeft = Math.max(0, maxAttempts - forbiddenWhacks);
  fairyController?.setAttemptCapacity?.(maxAttempts);
  fairyController?.setVisibleCount?.(attemptsLeft);
}

function renderLeaderboardList(root, entries, limit) {
  if (!(root instanceof HTMLElement)) return;
  root.innerHTML = "";
  const top = entries.slice(0, limit);
  if (top.length === 0) {
    const empty = document.createElement("li");
    empty.className = "leaderboard__empty";
    empty.textContent = "Noch keine Einträge. Sei die erste Person!";
    root.append(empty);
    return;
  }

  for (let i = 0; i < top.length; i++) {
    const item = top[i];
    const li = document.createElement("li");
    li.className = "leaderboard__item";

    const rank = document.createElement("span");
    rank.className = "leaderboard__rank";
    rank.textContent = `#${i + 1}`;

    const name = document.createElement("span");
    name.className = "leaderboard__name";
    name.textContent = item.name;

    const modeBadge = document.createElement("span");
    modeBadge.className = "leaderboard__mode";
    modeBadge.textContent = formatModeName(item.mode);

    const score = document.createElement("span");
    score.className = "leaderboard__score";
    score.textContent = String(item.score);

    li.append(rank, name, modeBadge, score);
    root.append(li);
  }
}

function renderLeaderboards() {
  renderLeaderboardList(titleLeaderboard, leaderboard, 5);
  renderLeaderboardList(gameoverLeaderboard, leaderboard, 10);
}

function setSaveScoreFeedback(text, tone = "info") {
  if (!(saveScoreFeedback instanceof HTMLElement)) return;
  saveScoreFeedback.textContent = text;
  saveScoreFeedback.setAttribute("data-tone", tone);
}

function saveScoreToLeaderboard() {
  if (!pendingRoundResult) {
    setSaveScoreFeedback("Kein Rundenergebnis zum Speichern vorhanden.", "bad");
    return;
  }
  if (roundSaved) {
    setSaveScoreFeedback("Dieses Ergebnis wurde schon gespeichert.", "good");
    return;
  }

  const entered = String(leaderboardName?.value ?? "")
    .replace(/\s+/g, " ")
    .trim();
  if (!entered) {
    setSaveScoreFeedback("Bitte zuerst einen Namen eingeben.", "bad");
    leaderboardName?.focus();
    return;
  }

  lastEnteredName = entered.slice(0, 18);
  leaderboard = addLeaderboardEntry({
    name: lastEnteredName,
    score: pendingRoundResult.score,
    mode: pendingRoundResult.mode,
    reason: pendingRoundResult.reason,
  });
  roundSaved = true;
  if (saveScoreBtn instanceof HTMLButtonElement) saveScoreBtn.disabled = true;
  setSaveScoreFeedback("Gespeichert! Du bist in der Bestenliste.", "good");
  renderLeaderboards();
}

function syncUI() {
  bestScoreValue.textContent = String(bestScore);
  bestScoreValue2.textContent = String(bestScore);

  soundToggle.checked = !!settings.soundOn;
  musicToggle.checked = !!settings.musicOn;
  reducedMotionToggle.checked = !!settings.reducedMotion;

  document.querySelector(".app")?.setAttribute("data-reduced-motion", String(!!settings.reducedMotion));

  audio.setSoundOn(!!settings.soundOn);
  audio.setMusicOn(!!settings.musicOn);

  for (const btn of modeButtons) {
    const is = btn.getAttribute("data-mode") === mode;
    btn.setAttribute("aria-pressed", is ? "true" : "false");
  }

  for (const btn of speedButtons) {
    const is = btn.getAttribute("data-speed") === settings.speed;
    btn.setAttribute("aria-pressed", is ? "true" : "false");
  }

  for (const btn of attemptButtons) {
    const is = Number(btn.getAttribute("data-max-attempts")) === cleanMaxAttempts(settings.maxAttempts);
    btn.setAttribute("aria-pressed", is ? "true" : "false");
  }

  for (const btn of spritePackButtons) {
    const is = btn.getAttribute("data-sprite-pack") === settings.spritePack;
    btn.setAttribute("aria-pressed", is ? "true" : "false");
  }

  if (!core && forbiddenHitsValue) {
    forbiddenHitsValue.textContent = `0 / ${cleanMaxAttempts(settings.maxAttempts)}`;
  }
  updateFairyAttempts(core?.getView?.() ?? null);
  renderLeaderboards();
}

for (const btn of modeButtons) {
  btn.addEventListener("click", () => {
    mode = btn.getAttribute("data-mode") || "classic";
    syncUI();
  });
}

for (const btn of speedButtons) {
  btn.addEventListener("click", () => {
    const speed = btn.getAttribute("data-speed");
    if (speed !== "normal" && speed !== "schwierig" && speed !== "sehr_schwierig") return;
    settings.speed = speed;
    saveSettings(settings);
    syncUI();
  });
}

for (const btn of attemptButtons) {
  btn.addEventListener("click", () => {
    const maxAttempts = Number(btn.getAttribute("data-max-attempts"));
    if (!Number.isInteger(maxAttempts) || maxAttempts < 3 || maxAttempts > 7) return;
    settings.maxAttempts = maxAttempts;
    saveSettings(settings);
    syncUI();
    if (core) render();
  });
}

for (const btn of spritePackButtons) {
  btn.addEventListener("click", () => {
    const spritePack = btn.getAttribute("data-sprite-pack");
    if (spritePack !== "set_a" && spritePack !== "set_b") return;
    settings.spritePack = setSpritePackId(spritePack);
    saveSettings(settings);
    syncUI();
    if (core && board) {
      core.variantCount = Math.max(1, getSpriteVariantCount());
      const view = core.getView();
      board.renderHoles(view.holes);
      renderForbiddenRunner(view);
    }
  });
}

settingsBtn.addEventListener("click", () => {
  audio.play("button");
  lastFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  overlayMode = "settings";
  overlayTitle.textContent = "Einstellungen";
  restartBtn.hidden = true;
  resumeBtn.hidden = true;
  setOverlayOpen(true);
});

overlay.addEventListener("click", (e) => {
  const t = e.target;
  if (!(t instanceof HTMLElement)) return;
  if (t.dataset.closeOverlay === "true") closeOverlay();
});

document.addEventListener("keydown", (e) => {
  if (overlay.hidden) return;
  if (e.key === "Escape") {
    e.preventDefault();
    closeOverlay();
  }
  if (e.key === "Tab") {
    const focusables = Array.from(
      overlay.querySelectorAll(
        "button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [href], [tabindex]:not([tabindex='-1'])"
      )
    ).filter((n) => n instanceof HTMLElement);
    if (focusables.length === 0) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;

    if (e.shiftKey && active === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  }
});

function closeOverlay({ resumeGame } = {}) {
  const shouldResume = resumeGame ?? overlayMode === "pause";
  setOverlayOpen(false);

  if (shouldResume && !levelBreakInProgress) {
    const now = performance.now();
    core?.resume(now);
    startLoop();
  }

  if (lastFocus) lastFocus.focus();
  lastFocus = null;
  overlayMode = "settings";
}

soundToggle.addEventListener("change", () => {
  settings.soundOn = soundToggle.checked;
  saveSettings(settings);
  syncUI();
});
musicToggle.addEventListener("change", () => {
  settings.musicOn = musicToggle.checked;
  saveSettings(settings);
  syncUI();
  if (core?.getView().phase === "running" || core?.getView().phase === "paused") {
    if (settings.musicOn) audio.startMusic();
    else audio.stopMusic();
  }
});
reducedMotionToggle.addEventListener("change", () => {
  settings.reducedMotion = reducedMotionToggle.checked;
  saveSettings(settings);
  syncUI();
});

startBtn.addEventListener("click", () => {
  audio.ensure();
  audio.play("button");
  startRound();
});

pauseBtn.addEventListener("click", () => {
  if (levelBreakInProgress) return;
  audio.play("button");
  lastFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  overlayMode = "pause";
  overlayTitle.textContent = "Pausiert";
  restartBtn.hidden = false;
  resumeBtn.hidden = false;
  setOverlayOpen(true);

  const now = performance.now();
  core?.pause(now);
  stopLoop();
});

resumeBtn.addEventListener("click", () => {
  audio.play("button");
  closeOverlay({ resumeGame: true });
});
restartBtn.addEventListener("click", () => {
  audio.play("button");
  closeOverlay({ resumeGame: false });
  startRound();
});

playAgainBtn.addEventListener("click", () => {
  audio.play("button");
  startRound();
});
backToTitleBtn.addEventListener("click", () => {
  audio.play("button");
  endRoundToTitle();
});

leaderboardForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  audio.play("button");
  saveScoreToLeaderboard();
});

// Defaults: respect OS reduced motion on first run; music off by default.
if (settings.__isDefault) {
  settings.reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches || false;
  settings.musicOn = false;
  saveSettings(settings);
}

// Service worker (offline cache). Safe if unsupported.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}

syncUI();
showScreen("title");

function clearLevelBreakTimer() {
  if (!levelBreakTimerId) return;
  window.clearTimeout(levelBreakTimerId);
  levelBreakTimerId = 0;
}

function hideLevelBreak() {
  clearLevelBreakTimer();
  levelBreakInProgress = false;
  if (levelBreak) levelBreak.hidden = true;
  if (levelBreakInfo) levelBreakInfo.textContent = "";
}

function startLevelBreak(nextLevel) {
  if (!core || levelBreakInProgress) return;

  levelBreakInProgress = true;
  clearLevelBreakTimer();
  const attemptGrant = core.grantLevelAttempt?.();
  render();
  core.pause(performance.now());
  stopLoop();

  if (levelBreakTitle) levelBreakTitle.textContent = `Stufe ${nextLevel}`;
  if (levelBreakCount) levelBreakCount.textContent = "3";
  if (levelBreakInfo) {
    const maxAttempts = core.getView().maxForbiddenWhacks ?? cleanMaxAttempts(settings.maxAttempts);
    levelBreakInfo.textContent = attemptGrant?.gained
      ? "Super! +1 Versuch"
      : `Versuche bleiben bei ${maxAttempts}`;
  }
  if (levelBreak) levelBreak.hidden = false;

  let count = 3;
  const step = () => {
    if (!core || core.getView().phase === "over") {
      hideLevelBreak();
      return;
    }

    if (count > 0) {
      if (levelBreakCount) levelBreakCount.textContent = String(count);
      count -= 1;
      levelBreakTimerId = window.setTimeout(step, 680);
      return;
    }

    if (levelBreakCount) levelBreakCount.textContent = "Start!";
    levelBreakTimerId = window.setTimeout(() => {
      hideLevelBreak();
      if (!core || core.getView().phase === "over") return;
      core.resume(performance.now());
      startLoop();
      announce(`Stufe ${nextLevel} startet jetzt!`);
    }, 560);
  };

  step();
}

function stopLoop() {
  if (rafId) cancelAnimationFrame(rafId);
  rafId = 0;
}

function startLoop() {
  stopLoop();
  const frame = (nowMs) => {
    if (!core) return;
    try {
      core.tick(nowMs);
      render();
      const view = core.getView();

      if (!levelBreakInProgress && view.phase === "running" && (view.level ?? 1) > seenLevel) {
        const nextLevel = Math.min(ROUND_LEVELS, seenLevel + 1);
        seenLevel = nextLevel;
        startLevelBreak(nextLevel);
        return;
      }

      if (view.phase === "over") {
        stopLoop();
        onGameOver();
        return;
      }
      rafId = requestAnimationFrame(frame);
    } catch (err) {
      console.error("Game loop error:", err);
      stopLoop();
      audio.stopMusic();
      announce("Ups! Ein kleiner Hänger. Zurück zur Startseite.");
      endRoundToTitle();
    }
  };
  rafId = requestAnimationFrame(frame);
}

function ensureBoard(profile) {
  const key = `${profile.cols}:${profile.maxHoles}`;
  activeProfile = profile;
  if (board && key === currentProfileKey) return;
  currentProfileKey = key;
  board?.destroy();
  board = createBoard({
    root: boardRoot,
    maxHoles: profile.maxHoles,
    cols: profile.cols,
    onBonk: (i) => handleBonk(i),
  });
}

function fitBoardToViewport() {
  if (!boardRoot || screens.game.hidden || !activeProfile) return;

  const boardWrap = boardRoot.closest(".board-wrap");
  if (!(boardWrap instanceof HTMLElement)) return;

  const wrapStyles = getComputedStyle(boardWrap);
  const boardStyles = getComputedStyle(boardRoot);

  const wrapPadTop = parseFloat(wrapStyles.paddingTop) || 0;
  const wrapPadBottom = parseFloat(wrapStyles.paddingBottom) || 0;
  const wrapPadLeft = parseFloat(wrapStyles.paddingLeft) || 0;
  const wrapPadRight = parseFloat(wrapStyles.paddingRight) || 0;
  const wrapBorderTop = parseFloat(wrapStyles.borderTopWidth) || 0;
  const wrapBorderBottom = parseFloat(wrapStyles.borderBottomWidth) || 0;
  const viewportHeight = window.visualViewport?.height || window.innerHeight;
  const viewportWidth = window.visualViewport?.width || window.innerWidth;
  const wrapRect = boardWrap.getBoundingClientRect();

  const cols = Math.max(1, activeProfile.cols || 3);
  const rows = Math.max(1, Math.ceil(activeProfile.maxHoles / cols));
  const gap = parseFloat(boardStyles.gap) || 12;
  const viewportBottomPadding = 10;
  const availableHeight = Math.max(
    48,
    viewportHeight -
      wrapRect.top -
      viewportBottomPadding -
      wrapPadTop -
      wrapPadBottom -
      wrapBorderTop -
      wrapBorderBottom
  );
  const availableWidth = Math.max(
    48,
    Math.min(boardWrap.clientWidth, viewportWidth - 20) - wrapPadLeft - wrapPadRight
  );

  const squareByHeight = (availableHeight - gap * (rows - 1)) / rows;
  const squareByWidth = (availableWidth - gap * (cols - 1)) / cols;
  const square = Math.max(30, Math.floor(Math.min(squareByHeight, squareByWidth)));

  const boardWidth = square * cols + gap * (cols - 1);
  boardRoot.style.width = `${boardWidth}px`;
  boardRoot.style.maxWidth = "100%";
  boardRoot.style.margin = "0 auto";
}

function startRound() {
  const profile = computeBoardProfile();
  ensureBoard(profile);

  const durationMs = LEVEL_DURATION_MS * ROUND_LEVELS;
  const seed = seedFromNow();
  core = new GameCore({
    mode,
    profile,
    seed,
    durationMs,
    speed: settings.speed,
    maxForbiddenWhacks: cleanMaxAttempts(settings.maxAttempts),
  });
  lastForbiddenKey = "";
  lastForbiddenWasActive = false;
  seenLevel = 1;
  pendingRoundResult = null;
  roundSaved = false;
  hideLevelBreak();
  if (saveScoreBtn instanceof HTMLButtonElement) saveScoreBtn.disabled = false;
  setSaveScoreFeedback("", "info");

  showScreen("game");
  closeOverlay();

  const now = performance.now();
  core.start(now);
  updateFairyAttempts(core.getView());

  if (settings.musicOn) audio.startMusic();
  else audio.stopMusic();

  board.setUnlocked(core.getView().unlockedHoles);
  board.renderHoles(core.getView().holes);
  renderForbiddenRunner(core.getView());
  fitBoardToViewport();
  board.focusFirst();
  startLoop();
}

function render() {
  if (!core || !board) return;
  const view = core.getView();
  updateFairyAttempts(view);

  scoreValue.textContent = String(view.score);
  timeValue.textContent = formatSecondsCeil(view.timeLeftMs);
  if (levelValue) levelValue.textContent = String(view.level ?? 1);
  if (forbiddenHitsValue) {
    forbiddenHitsValue.textContent = `${view.forbiddenWhacks} / ${view.maxForbiddenWhacks}`;
  }

  board.setUnlocked(view.unlockedHoles);
  board.renderHoles(view.holes);
  renderForbiddenRunner(view);
}

function setForbiddenMarkup(forbidden) {
  if (!forbiddenRunner) return;
  forbiddenRunner.innerHTML = [
    critterSvg({ variant: forbidden.variant, kind: "critter" }),
    `<span class="forbidden-runner__badge" aria-hidden="true">NEIN</span>`,
  ].join("");
}

function renderForbiddenRunner(view) {
  if (!forbiddenTrack || !forbiddenRunner || !forbiddenLabel) return;
  if (!view || view.phase !== "running" || !view.forbidden) {
    forbiddenRunner.innerHTML = "";
    forbiddenRunner.style.transform = "";
    forbiddenLabel.textContent = "Verbotene Leckerei: Unten siehst du den Läufer.";
    lastForbiddenKey = "";
    lastForbiddenWasActive = false;
    return;
  }

  const forbidden = view.forbidden;
  const key = `${forbidden.variant}:${forbidden.direction}:${forbidden.startedAtMs}`;
  if (key !== lastForbiddenKey) {
    setForbiddenMarkup(forbidden);
    announce("Neue verbotene Leckerei sichtbar. Gleich wird sie aktiv.");
    lastForbiddenKey = key;
    lastForbiddenWasActive = false;
  }

  const trackW = forbiddenTrack.clientWidth;
  const trackH = forbiddenTrack.clientHeight || 92;
  const dynamicRunner = Math.max(48, Math.min(94, Math.floor(trackH * 0.86)));
  forbiddenRunner.style.width = `${dynamicRunner}px`;
  forbiddenRunner.style.height = `${dynamicRunner}px`;
  const runnerW = forbiddenRunner.offsetWidth || dynamicRunner;
  const runnerH = forbiddenRunner.offsetHeight || dynamicRunner;
  const p = Math.max(0, Math.min(1, forbidden.progress ?? 0));
  const sideInset = Math.max(10, Math.round(trackW * 0.03));
  const verticalInset = Math.max(2, Math.round(trackH * 0.04));
  const maxX = Math.max(sideInset, trackW - runnerW - sideInset);
  const maxY = Math.max(verticalInset, trackH - runnerH - verticalInset);
  const startX = forbidden.direction === "ltr" ? sideInset : maxX;
  const endX = forbidden.direction === "ltr" ? maxX : sideInset;
  const x = startX + (endX - startX) * p;
  const y = Math.min(maxY, Math.max(verticalInset, Math.round((trackH - runnerH) / 2)));
  forbiddenRunner.style.transform = `translate3d(${x}px, ${y}px, 0)`;

  const secsLeft = Math.max(0, Math.ceil((forbidden.remainingMs ?? 0) / 1000));
  const readyIn = Math.max(0, Math.ceil((forbidden.activationRemainingMs ?? 0) / 1000));
  const level = view.level ?? 1;
  if (forbidden.isActive && !lastForbiddenWasActive) {
    announce("Jetzt aktiv: gleiche Leckereien zählen negativ.");
    lastForbiddenWasActive = true;
  }

  if (!forbidden.isActive) {
    forbiddenLabel.textContent = `Verbotene Leckerei sichtbar. Aktiv in ${readyIn}s`;
    return;
  }

  if (level === 3) {
    forbiddenLabel.textContent = `Stufe 3 aktiv: 2 verbotene + 1 erlaubte Leckerei. Gleiche Leckereien: -150 für ${secsLeft}s`;
  } else if (level === 4) {
    forbiddenLabel.textContent = `Stufe 4 aktiv: Bei Treffer-Mix werden beide Leckereien verboten. -150 für ${secsLeft}s`;
  } else {
    forbiddenLabel.textContent = `Stufe ${level} aktiv: Gleiche Leckereien sind für ${secsLeft}s jeweils -150`;
  }
}

function handleBonk(i) {
  if (!core || !board) return;
  let res;
  try {
    const now = performance.now();
    res = core.bonk(i, now);
  } catch (err) {
    console.error("Bonk error:", err);
    announce("Ups! Dieser Klick hat sich verheddert.");
    return;
  }

  if (res.result === "ignored") return;
  if (res.result === "miss") {
    audio.play("oops");
    board.effects.popScore(i, "ups!", "bad");
    announce("Knapp daneben. Versuch's nochmal.");
    return;
  }

  if (res.result === "forbidden") {
    audio.play("oops");
    board.effects.popScore(i, String(res.delta), "bad");
    board.effects.bonkAnim(i, settings.reducedMotion);
    board.effects.boardShudder(settings.reducedMotion);
    updateFairyAttempts(res);
    const maxAttempts = cleanMaxAttempts(res.maxForbiddenWhacks ?? settings.maxAttempts);
    const strikesLeft = Math.max(0, maxAttempts - (res.forbiddenWhacks ?? 0));
    if (res.strikeOut) announce(`${maxAttempts} verbotene Treffer. Runde beendet!`);
    else announce(`Verbotene Leckerei! Noch ${strikesLeft} Versuche.`);
    return;
  }

  // hit
  const sfx = res.kind === "bonus" ? "bonus" : "bonk";
  audio.play(sfx);
  audio.play("pop");
  board.effects.popScore(i, `+${res.delta}`, "good");
  board.effects.sparkles(i, settings.reducedMotion);
  board.effects.bonkAnim(i, settings.reducedMotion);
  announce(res.kind === "bonus" ? `Bonus! +${res.delta}` : `Treffer! +${res.delta}`);
}

function announce(text) {
  if (!announcer) return;
  announcer.textContent = "";
  // Force DOM update so screen readers re-announce.
  window.setTimeout(() => {
    announcer.textContent = text;
  }, 10);
}

function onGameOver() {
  if (!core) return;
  audio.play("button");
  audio.stopMusic();
  hideLevelBreak();

  const view = core.getView();
  const score = view.score;
  const reason = view.gameOverReason || "time_up";
  const maxAttempts = cleanMaxAttempts(view.maxForbiddenWhacks ?? settings.maxAttempts);
  finalScoreValue.textContent = String(score);
  pendingRoundResult = { score, mode: view.mode, reason };
  roundSaved = false;
  if (saveScoreBtn instanceof HTMLButtonElement) saveScoreBtn.disabled = false;
  if (leaderboardName instanceof HTMLInputElement) {
    leaderboardName.value = lastEnteredName;
  }
  setSaveScoreFeedback("Namen eingeben und Ergebnis speichern.", "info");

  if (reason === "forbidden_limit") {
    gameoverHeading.textContent = "Zu viele verbotene Treffer!";
    gameoverReason.textContent = `Du hast ${maxAttempts} verbotene Treffer erreicht. Die Runde endete vorzeitig.`;
  } else {
    gameoverHeading.textContent = "Runde vorbei!";
    gameoverReason.textContent = "Die Zeit ist um. Trag deinen Namen in die Bestenliste ein.";
  }

  if (score > bestScore) {
    bestScore = score;
    saveBestScore(bestScore);
  }
  syncUI();
  renderForbiddenRunner(core.getView());

  showScreen("gameover");
  leaderboardName?.focus();
}

function endRoundToTitle() {
  audio.stopMusic();
  stopLoop();
  hideLevelBreak();
  renderForbiddenRunner(null);
  pendingRoundResult = null;
  core = null;
  updateFairyAttempts(null);
  showScreen("title");
}

window.addEventListener("resize", () => {
  fitBoardToViewport();
});

window.visualViewport?.addEventListener("resize", () => {
  fitBoardToViewport();
});

window.visualViewport?.addEventListener("scroll", () => {
  fitBoardToViewport();
});
