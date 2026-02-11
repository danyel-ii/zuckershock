export function clamp(min, max, v) {
  return Math.max(min, Math.min(max, v));
}

export function clamp01(v) {
  return clamp(0, 1, v);
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function easeInQuad(t) {
  return t * t;
}

export function formatSecondsCeil(ms) {
  const s = Math.ceil(ms / 1000);
  return String(Math.max(0, s));
}

