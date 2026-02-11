const SWEETS = [
  "./assets/original/kawaii-sweets/1.png",
  "./assets/original/kawaii-sweets/2.png",
  "./assets/original/kawaii-sweets/3.png",
  "./assets/original/kawaii-sweets/4.png",
];

function pickSweet(variant = 0) {
  const idx = Math.abs(Math.floor(Number(variant) || 0)) % SWEETS.length;
  return SWEETS[idx];
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
  const src = pickSweet(variant);
  const classes = ["sprite", `sprite--${safeKind}`];

  return [
    `<span class="${classes.join(" ")}">`,
    `<img class="sprite__img sprite__img--sweet" src="${escAttr(src)}" alt="" draggable="false" loading="eager" decoding="async" />`,
    badgeMarkup(safeKind),
    `</span>`,
  ].join("");
}
