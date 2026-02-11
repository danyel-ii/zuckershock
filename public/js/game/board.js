import { critterSvg } from "./art.js";

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") node.className = v;
    else if (k === "text") node.textContent = v;
    else if (k.startsWith("data-")) node.setAttribute(k, v);
    else if (k === "html") node.innerHTML = v;
    else node.setAttribute(k, v);
  }
  for (const c of children) node.append(c);
  return node;
}

function makeHoleButton(index) {
  const btn = el("button", {
    class: "hole",
    type: "button",
    "data-hole": String(index),
    "aria-label": `Feld ${index + 1}`,
  });

  const scene = el("div", { class: "hole__scene", "aria-hidden": "true" });
  const pit = el("div", { class: "hole__pit" });
  const critter = el("div", { class: "hole__critter" });
  const lip = el("div", { class: "hole__lip" });

  scene.append(pit, critter, lip);
  btn.append(scene);
  return { btn, critter };
}

function focusableHoles(root) {
  return Array.from(root.querySelectorAll("button.hole:not(:disabled)"));
}

export function createBoard({ root, maxHoles, cols, onBonk }) {
  root.style.setProperty("--cols", String(cols));
  root.innerHTML = "";
  const boardWrap = root.closest(".board-wrap");

  const holes = [];
  const critterSlots = [];
  const lastKinds = Array.from({ length: maxHoles }, () => null);
  let shudderTimer = 0;

  for (let i = 0; i < maxHoles; i++) {
    const { btn, critter } = makeHoleButton(i);
    btn.addEventListener("click", () => onBonk(i));
    root.append(btn);
    holes.push(btn);
    critterSlots.push(critter);
  }

  root.addEventListener("keydown", (e) => {
    const key = e.key;
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(key)) return;

    const active = document.activeElement;
    if (!(active instanceof HTMLElement) || !active.classList.contains("hole")) return;

    e.preventDefault();

    const idx = Number(active.dataset.hole);
    if (!Number.isFinite(idx)) return;

    const row = Math.floor(idx / cols);
    const col = idx % cols;

    let next = idx;
    if (key === "ArrowLeft") next = row * cols + (col - 1);
    if (key === "ArrowRight") next = row * cols + (col + 1);
    if (key === "ArrowUp") next = (row - 1) * cols + col;
    if (key === "ArrowDown") next = (row + 1) * cols + col;

    const list = focusableHoles(root);
    const target = list.find((b) => Number(b.dataset.hole) === next);
    if (target) target.focus();
  });

  function setUnlocked(unlockedCount) {
    for (let i = 0; i < holes.length; i++) {
      const unlocked = i < unlockedCount;
      holes[i].disabled = !unlocked;
      holes[i].classList.toggle("hole--locked", !unlocked);
      holes[i].setAttribute("aria-disabled", unlocked ? "false" : "true");
    }
  }

  function setKind(i, occ) {
    const kind = occ?.kind ?? null;
    if (lastKinds[i] === kind) return;
    lastKinds[i] = kind;

    const slot = critterSlots[i];
    const holeEl = holes[i];

    if (!kind) {
      slot.innerHTML = "";
      holeEl.removeAttribute("data-kind");
      holeEl.classList.remove("hole--up");
      return;
    }

    holeEl.setAttribute("data-kind", kind);
    holeEl.classList.add("hole--up");

    slot.innerHTML = critterSvg({ variant: occ.variant, kind });
  }

  function popScore(i, text, tone = "good") {
    const holeEl = holes[i];
    const pop = el("div", { class: `popup popup--${tone}`, text });
    holeEl.append(pop);
    const removeAt = window.setTimeout(() => pop.remove(), 900);
    pop.addEventListener("animationend", () => {
      window.clearTimeout(removeAt);
      pop.remove();
    });
  }

  function sparkles(i, reducedMotion) {
    if (reducedMotion) return;
    const holeEl = holes[i];
    const colors = ["#ff6ea9", "#ffd766", "#68d8ff", "#9ae86b", "#bca6ff", "#ff9f5a"];

    const waves = [
      { count: 18, delayBase: 0, travelMin: 92, travelMax: 148, lenMin: 9, lenMax: 18, thickMin: 4, thickMax: 7 },
      { count: 12, delayBase: 95, travelMin: 68, travelMax: 120, lenMin: 8, lenMax: 14, thickMin: 3, thickMax: 6 },
    ];

    for (const wave of waves) {
      for (let k = 0; k < wave.count; k++) {
        const isRound = Math.random() < 0.28;
        const sprinkle = el("span", {
          class: isRound ? "sparkle sparkle--sprinkle sparkle--sprinkle-round" : "sparkle sparkle--sprinkle",
        });
        const angle = (360 / wave.count) * k + (Math.random() * 18 - 9);
        const travel = wave.travelMin + Math.random() * (wave.travelMax - wave.travelMin);
        const len = wave.lenMin + Math.random() * (wave.lenMax - wave.lenMin);
        const thick = wave.thickMin + Math.random() * (wave.thickMax - wave.thickMin);
        const dot = 4 + Math.random() * 6;
        const spin = Math.random() * 180;
        const delay = wave.delayBase + Math.random() * 80;
        const color = colors[Math.floor(Math.random() * colors.length)];

        sprinkle.style.left = `${50 + (Math.random() * 6 - 3)}%`;
        sprinkle.style.top = `${50 + (Math.random() * 7 - 3.5)}%`;
        sprinkle.style.setProperty("--angle", `${angle}deg`);
        sprinkle.style.setProperty("--travel", `${travel}px`);
        sprinkle.style.setProperty("--len", `${len}px`);
        sprinkle.style.setProperty("--thick", `${thick}px`);
        sprinkle.style.setProperty("--size", `${dot}px`);
        sprinkle.style.setProperty("--spin", `${spin}deg`);
        sprinkle.style.setProperty("--sprinkle-color", color);
        sprinkle.style.animationDelay = `${delay}ms`;

        holeEl.append(sprinkle);
        sprinkle.addEventListener("animationend", () => sprinkle.remove());
      }
    }
  }

  function boardShudder(reducedMotion) {
    if (reducedMotion) return;
    if (!(boardWrap instanceof HTMLElement)) return;

    boardWrap.classList.remove("board-wrap--shudder");
    // Force a reflow so back-to-back forbidden hits can replay the shudder animation.
    void boardWrap.offsetWidth;
    boardWrap.classList.add("board-wrap--shudder");

    if (shudderTimer) window.clearTimeout(shudderTimer);
    shudderTimer = window.setTimeout(() => {
      boardWrap.classList.remove("board-wrap--shudder");
      shudderTimer = 0;
    }, 560);
  }

  function bonkAnim(i, reducedMotion) {
    if (reducedMotion) return;
    const holeEl = holes[i];
    holeEl.classList.add("hole--bonked");
    window.setTimeout(() => holeEl.classList.remove("hole--bonked"), 160);
  }

  return {
    setUnlocked,
    renderHoles(holesState) {
      for (let i = 0; i < holes.length; i++) setKind(i, holesState[i]);
    },
    effects: {
      popScore,
      sparkles,
      bonkAnim,
      boardShudder,
    },
    focusFirst() {
      const first = holes.find((b) => !b.disabled);
      if (first) first.focus();
    },
    destroy() {
      if (shudderTimer) window.clearTimeout(shudderTimer);
      root.innerHTML = "";
    },
  };
}
