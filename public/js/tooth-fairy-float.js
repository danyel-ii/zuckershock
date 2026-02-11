function makeFairies() {
  const sizeScale = 1.95;
  return [
    { fallbackY: 0.23, boardY: 0.2, sideNudge: 0, size: Math.round(92 * sizeScale), amp: 16, speed: 0.72, drift: 11, phase: 0.4 },
    { fallbackY: 0.17, boardY: 0.5, sideNudge: 8, size: Math.round(104 * sizeScale), amp: 20, speed: 0.63, drift: 14, phase: 1.7 },
    { fallbackY: 0.26, boardY: 0.78, sideNudge: -6, size: Math.round(88 * sizeScale), amp: 14, speed: 0.78, drift: 10, phase: 3.1 },
  ];
}

function clampCount(value, max) {
  const n = Number.isFinite(value) ? Math.floor(value) : max;
  return Math.max(0, Math.min(max, n));
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
  const state = { visibleCount: fairies.length };

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

      for (let i = 0; i < state.visibleCount; i++) {
        const f = fairies[i];
        const drift = reduced ? 0 : Math.sin(t * 0.33 + f.phase) * f.drift;
        const bob = reduced ? 0 : Math.sin(t * f.speed + f.phase) * f.amp;
        const roll = reduced ? 0 : Math.sin(t * (0.8 + i * 0.1) + f.phase) * 0.08;

        const minX = f.size * 0.5 + 8;
        const maxX = p.width - f.size * 0.5 - 8;
        const minY = f.size * 0.5 + 8;
        const maxY = p.height - f.size * 0.5 - 8;
        const rightGap = Math.max(12, Math.min(52, Math.round(p.width * 0.03)));
        const anchorX = boardRect ? boardRect.right + rightGap + f.size * 0.5 + f.sideNudge : p.width * 0.88 + f.sideNudge;
        const anchorY = boardRect ? boardRect.top + boardRect.height * f.boardY : p.height * f.fallbackY;
        const x = p.constrain(anchorX + drift, minX, maxX);
        const y = p.constrain(anchorY + bob, minY, maxY);

        p.push();
        p.translate(x, y);
        p.rotate(roll);
        // Keep original PNG alpha; do not fade the sprite globally.
        p.noTint();
        p.image(fairyImg, 0, 0, f.size, f.size);
        p.pop();
      }
    };
  };

  // eslint-disable-next-line no-new
  new window.p5(sketch);

  return {
    setVisibleCount(count) {
      state.visibleCount = clampCount(count, fairies.length);
    },
    reset() {
      state.visibleCount = fairies.length;
    },
    getVisibleCount() {
      return state.visibleCount;
    },
  };
}
