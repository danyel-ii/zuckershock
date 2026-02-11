const MIN_ATTEMPTS = 3;
const MAX_ATTEMPTS = 7;

function makeFairies() {
  const sizeScale = 1.95;
  const baseSizes = [92, 104, 88, 96, 90, 100, 86];
  const out = [];

  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const t = i / (MAX_ATTEMPTS - 1);
    const sideSign = i % 2 === 0 ? -1 : 1;
    out.push({
      fallbackY: 0.14 + t * 0.72,
      boardY: 0.1 + t * 0.8,
      sideNudge: sideSign * (6 + (i % 3) * 4),
      baseSize: Math.round(baseSizes[i] * sizeScale),
      amp: 12 + (i % 3) * 4,
      speed: 0.58 + i * 0.05,
      drift: 7 + (i % 4) * 2,
      phase: 0.45 + i * 0.9,
    });
  }

  return out;
}

function clampAttemptCapacity(value) {
  const n = Math.floor(Number(value));
  if (!Number.isFinite(n)) return MIN_ATTEMPTS;
  return Math.max(MIN_ATTEMPTS, Math.min(MAX_ATTEMPTS, n));
}

function clampVisibleCount(value, max) {
  const n = Number.isFinite(value) ? Math.floor(value) : max;
  return Math.max(0, Math.min(max, n));
}

function getCountScale(maxCount) {
  if (maxCount >= 7) return 0.68;
  if (maxCount === 6) return 0.74;
  if (maxCount === 5) return 0.82;
  if (maxCount === 4) return 0.9;
  return 1;
}

export function initToothFairyFloats() {
  const layer = document.querySelector("#toothFairyLayer");
  if (!(layer instanceof HTMLElement)) {
    return {
      setVisibleCount() {},
      reset() {},
      getVisibleCount() {
        return 0;
      },
    };
  }

  if (typeof window.p5 !== "function") {
    console.warn("p5.js was not found. Floating tooth fairies are disabled.");
    return {
      setVisibleCount() {},
      reset() {},
      getVisibleCount() {
        return 0;
      },
    };
  }

  const appEl = document.querySelector(".app");
  const boardWrapEl = document.querySelector(".board-wrap");
  const readReducedMotion = () => appEl?.getAttribute("data-reduced-motion") === "true";
  const fairies = makeFairies();
  const state = { maxCount: MIN_ATTEMPTS, visibleCount: MIN_ATTEMPTS };

  let fairyImg = null;

  const sketch = (p) => {
    const resizeToLayer = () => {
      const w = Math.max(320, layer.clientWidth || window.innerWidth);
      const h = Math.max(320, layer.clientHeight || window.innerHeight);
      p.resizeCanvas(w, h);
    };

    p.preload = () => {
      fairyImg = p.loadImage("./assets/original/tooth-fairy/tooth_fairy.png");
    };

    p.setup = () => {
      const c = p.createCanvas(10, 10);
      c.parent(layer);
      c.elt.setAttribute("aria-hidden", "true");
      resizeToLayer();
      p.imageMode(p.CENTER);
      p.noStroke();
      p.clear();
    };

    p.windowResized = () => {
      resizeToLayer();
    };

    p.draw = () => {
      p.clear();
      if (!fairyImg) return;

      const t = p.millis() / 1000;
      const reduced = readReducedMotion();
      const boardRect =
        boardWrapEl instanceof HTMLElement && boardWrapEl.getBoundingClientRect().width > 0
          ? boardWrapEl.getBoundingClientRect()
          : null;
      const sizeScale = getCountScale(state.maxCount);

      for (let i = 0; i < state.visibleCount; i++) {
        const f = fairies[i];
        const size = Math.max(52, Math.round(f.baseSize * sizeScale));
        const drift = reduced ? 0 : Math.sin(t * 0.33 + f.phase) * f.drift;
        const bob = reduced ? 0 : Math.sin(t * f.speed + f.phase) * f.amp;
        const roll = reduced ? 0 : Math.sin(t * (0.8 + i * 0.1) + f.phase) * 0.08;

        const minX = size * 0.5 + 8;
        const maxX = p.width - size * 0.5 - 8;
        const minY = size * 0.5 + 8;
        const maxY = p.height - size * 0.5 - 8;
        const rightGap = Math.max(12, Math.min(52, Math.round(p.width * 0.03)));
        const anchorX = boardRect ? boardRect.right + rightGap + size * 0.5 + f.sideNudge : p.width * 0.88 + f.sideNudge;
        const anchorY = boardRect ? boardRect.top + boardRect.height * f.boardY : p.height * f.fallbackY;
        const x = p.constrain(anchorX + drift, minX, maxX);
        const y = p.constrain(anchorY + bob, minY, maxY);

        p.push();
        p.translate(x, y);
        p.rotate(roll);
        // Keep original PNG alpha; do not fade the sprite globally.
        p.noTint();
        p.image(fairyImg, 0, 0, size, size);
        p.pop();
      }
    };
  };

  // eslint-disable-next-line no-new
  new window.p5(sketch);

  return {
    setAttemptCapacity(attempts) {
      state.maxCount = clampAttemptCapacity(attempts);
      state.visibleCount = Math.min(state.visibleCount, state.maxCount);
    },
    setVisibleCount(count) {
      state.visibleCount = clampVisibleCount(count, state.maxCount);
    },
    reset() {
      state.visibleCount = state.maxCount;
    },
    getVisibleCount() {
      return state.visibleCount;
    },
  };
}
