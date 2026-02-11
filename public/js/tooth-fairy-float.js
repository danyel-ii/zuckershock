const MIN_ATTEMPTS = 3;
const MAX_ATTEMPTS = 7;
const MOBILE_BREAKPOINT = 860;
const MOBILE_BASE_SCALE = 0.72;
const MOBILE_EXTRA_SHRINK = 0.72;

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

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function intersectsBoard({ x, y, size, boardRect }) {
  const half = size * 0.5;
  const left = x - half;
  const right = x + half;
  const top = y - half;
  const bottom = y + half;
  return left < boardRect.right && right > boardRect.left && top < boardRect.bottom && bottom > boardRect.top;
}

function pickOutsideAnchor({ boardRect, size, index, total, width, height }) {
  const pad = 8;
  const gap = Math.max(10, Math.min(22, Math.round(width * 0.03)));
  const t = total <= 1 ? 0.5 : index / (total - 1);
  const trackY = boardRect.top + boardRect.height * (0.12 + 0.76 * t);
  const trackX = boardRect.left + boardRect.width * (0.14 + 0.72 * t);

  const canRight = boardRect.right + gap + size <= width - pad;
  const canLeft = boardRect.left - gap - size >= pad;
  const canTop = boardRect.top - gap - size >= pad;
  const canBottom = boardRect.bottom + gap + size <= height - pad;

  if (canRight) {
    return { side: "right", x: boardRect.right + gap + size * 0.5, y: trackY };
  }
  if (canLeft) {
    return { side: "left", x: boardRect.left - gap - size * 0.5, y: trackY };
  }
  if (canTop) {
    return { side: "top", x: trackX, y: boardRect.top - gap - size * 0.5 };
  }
  if (canBottom) {
    return { side: "bottom", x: trackX, y: boardRect.bottom + gap + size * 0.5 };
  }

  // No side has full room. Keep sprite outside board anyway, even if partially off-screen.
  const clearRight = width - boardRect.right;
  const clearLeft = boardRect.left;
  const clearTop = boardRect.top;
  const clearBottom = height - boardRect.bottom;
  const bestSide =
    clearRight >= clearLeft && clearRight >= clearTop && clearRight >= clearBottom
      ? "right"
      : clearLeft >= clearTop && clearLeft >= clearBottom
        ? "left"
        : clearTop >= clearBottom
          ? "top"
          : "bottom";

  if (bestSide === "right") {
    return { side: "right", x: boardRect.right + gap + size * 0.5, y: trackY };
  }
  if (bestSide === "left") {
    return { side: "left", x: boardRect.left - gap - size * 0.5, y: trackY };
  }
  if (bestSide === "top") {
    return { side: "top", x: trackX, y: boardRect.top - gap - size * 0.5 };
  }
  return { side: "bottom", x: trackX, y: boardRect.bottom + gap + size * 0.5 };
}

function pickMobileAnchor({ boardRect, size, index, total, width, height }) {
  const pad = 8;
  const gap = Math.max(14, Math.min(30, Math.round(size * 0.22)));
  const t = total <= 1 ? 0.5 : index / (total - 1);
  const spread = total <= 1 ? 0.5 : (index + 0.5) / total;
  const minX = pad + size * 0.5;
  const maxX = width - pad - size * 0.5;
  const laneX = clamp(minX + (maxX - minX) * spread, minX, maxX);

  const topMinY = pad + size * 0.5;
  const topMaxY = boardRect.top - gap - size * 0.5;
  if (topMaxY >= topMinY) {
    return {
      side: "mobile-top",
      x: laneX,
      y: clamp(topMinY + (topMaxY - topMinY) * (0.15 + 0.7 * t), topMinY, topMaxY),
    };
  }

  const bottomMinY = boardRect.bottom + gap + size * 0.5;
  const bottomMaxY = height - pad - size * 0.5;
  if (bottomMaxY >= bottomMinY) {
    return {
      side: "mobile-bottom",
      x: laneX,
      y: clamp(bottomMinY + (bottomMaxY - bottomMinY) * (0.15 + 0.7 * t), bottomMinY, bottomMaxY),
    };
  }

  const sideTrackY = clamp(
    boardRect.top + boardRect.height * (0.12 + 0.76 * t),
    pad + size * 0.5,
    height - pad - size * 0.5
  );
  return {
    side: "right",
    x: Math.max(boardRect.right + gap + size * 0.5, width - size * 0.32),
    y: sideTrackY,
  };
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
      const isMobile = p.width <= MOBILE_BREAKPOINT;
      const mobileScale = isMobile ? MOBILE_BASE_SCALE * MOBILE_EXTRA_SHRINK : 1;
      const motionScale = isMobile ? 0.58 : 1;

      for (let i = 0; i < state.visibleCount; i++) {
        const f = fairies[i];
        const size = Math.max(38, Math.round(f.baseSize * sizeScale * mobileScale));
        const drift = reduced ? 0 : Math.sin(t * 0.33 + f.phase) * f.drift * motionScale;
        const bob = reduced ? 0 : Math.sin(t * f.speed + f.phase) * f.amp * motionScale;
        const roll = reduced ? 0 : Math.sin(t * (0.8 + i * 0.1) + f.phase) * 0.08;

        const minX = size * 0.5 + 8;
        const maxX = p.width - size * 0.5 - 8;
        const minY = size * 0.5 + 8;
        const maxY = p.height - size * 0.5 - 8;
        const anchor = boardRect
          ? isMobile
            ? pickMobileAnchor({
                boardRect,
                size,
                index: i,
                total: Math.max(1, state.maxCount),
                width: p.width,
                height: p.height,
              })
            : pickOutsideAnchor({
                boardRect,
                size,
                index: i,
                total: Math.max(1, state.maxCount),
                width: p.width,
                height: p.height,
              })
          : null;

        let x;
        let y;
        if (anchor) {
          const outsideGap = Math.max(12, Math.round(size * (isMobile ? 0.2 : 0.1)));
          if (anchor.side === "right") {
            x = anchor.x + Math.abs(drift);
            x = Math.max(x, boardRect.right + outsideGap + size * 0.5);
            y = clamp(anchor.y + bob + f.sideNudge * 0.08, minY, maxY);
          } else if (anchor.side === "left") {
            x = anchor.x - Math.abs(drift);
            x = Math.min(x, boardRect.left - outsideGap - size * 0.5);
            y = clamp(anchor.y + bob + f.sideNudge * 0.08, minY, maxY);
          } else if (anchor.side === "mobile-top") {
            x = clamp(anchor.x + drift + f.sideNudge * 0.22, minX, maxX);
            y = anchor.y + bob * 0.32;
            y = Math.min(y, boardRect.top - outsideGap - size * 0.5);
          } else if (anchor.side === "mobile-bottom") {
            x = clamp(anchor.x + drift + f.sideNudge * 0.22, minX, maxX);
            y = anchor.y + bob * 0.32;
            y = Math.max(y, boardRect.bottom + outsideGap + size * 0.5);
          } else if (anchor.side === "top") {
            x = clamp(anchor.x + drift + f.sideNudge * 0.3, minX, maxX);
            y = anchor.y - Math.abs(bob);
            y = Math.min(y, boardRect.top - outsideGap - size * 0.5);
          } else {
            x = clamp(anchor.x + drift + f.sideNudge * 0.3, minX, maxX);
            y = anchor.y + Math.abs(bob);
            y = Math.max(y, boardRect.bottom + outsideGap + size * 0.5);
          }

          // Safety net: never allow overlap with board rectangle.
          if (intersectsBoard({ x, y, size, boardRect })) {
            if (anchor.side === "right") {
              x = boardRect.right + outsideGap + size * 0.5;
            } else if (anchor.side === "left") {
              x = boardRect.left - outsideGap - size * 0.5;
            } else if (anchor.side === "top" || anchor.side === "mobile-top") {
              y = boardRect.top - outsideGap - size * 0.5;
            } else {
              y = boardRect.bottom + outsideGap + size * 0.5;
            }
          }
        } else {
          const anchorX = p.width * 0.88 + f.sideNudge;
          const anchorY = p.height * f.fallbackY;
          x = p.constrain(anchorX + drift, minX, maxX);
          y = p.constrain(anchorY + bob, minY, maxY);
        }

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
