const SPRITE_PACKS = {
  set_a: [
    "./assets/original/sprite-sets/set_a/1.png",
    "./assets/original/sprite-sets/set_a/2.png",
    "./assets/original/sprite-sets/set_a/3.png",
    "./assets/original/sprite-sets/set_a/4.png",
    "./assets/original/sprite-sets/set_a/5.png",
    "./assets/original/sprite-sets/set_a/6.png",
  ],
  set_b: [
    "./assets/original/sprite-sets/set_b/1.png",
    "./assets/original/sprite-sets/set_b/2.png",
    "./assets/original/sprite-sets/set_b/3.png",
    "./assets/original/sprite-sets/set_b/4.png",
    "./assets/original/sprite-sets/set_b/5.png",
    "./assets/original/sprite-sets/set_b/6.png",
  ],
};

const DEFAULT_SPRITE_PACK = "set_a";
let activeSpritePack = DEFAULT_SPRITE_PACK;

function hasPack(packId) {
  return Object.prototype.hasOwnProperty.call(SPRITE_PACKS, packId);
}

function getPack(packId) {
  const key = hasPack(packId) ? packId : DEFAULT_SPRITE_PACK;
  return SPRITE_PACKS[key];
}

function pickSprite(variant = 0) {
  const pack = getPack(activeSpritePack);
  const idx = Math.abs(Math.floor(Number(variant) || 0)) % pack.length;
  return pack[idx];
}

export function getSpritePackId() {
  return activeSpritePack;
}

export function setSpritePackId(packId) {
  activeSpritePack = hasPack(packId) ? packId : DEFAULT_SPRITE_PACK;
  return activeSpritePack;
}

export function getSpriteVariantCount() {
  return getPack(activeSpritePack).length;
}

export function getAvailableSpritePacks() {
  return Object.keys(SPRITE_PACKS);
}

function escAttr(value) {
  return String(value).replace(/"/g, "&quot;");
}

function badgeMarkup(kind) {
  if (kind === "bonus") {
    return `<span class="sprite__badge sprite__badge--bonus" aria-hidden="true">BONUS</span>`;
  }

  if (kind === "decoy") {
    return [
      `<span class="sprite__badge sprite__badge--friend" aria-hidden="true">FREI</span>`,
      `<span class="sprite__sleep" aria-hidden="true">zz</span>`,
    ].join("");
  }

  return "";
}

export function critterSvg({ variant, kind }) {
  const safeKind = kind === "bonus" || kind === "decoy" ? kind : "critter";
  const src = pickSprite(variant);
  const classes = ["sprite", `sprite--${safeKind}`];

  return [
    `<span class="${classes.join(" ")}">`,
    `<img class="sprite__img sprite__img--sweet" src="${escAttr(src)}" alt="" draggable="false" loading="eager" decoding="async" />`,
    badgeMarkup(safeKind),
    `</span>`,
  ].join("");
}
