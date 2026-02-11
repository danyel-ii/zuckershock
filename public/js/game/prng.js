// Small, fast, seedable PRNG (deterministic for a given seed).
// mulberry32: https://stackoverflow.com/a/47593316 (public domain snippet pattern)
export function mulberry32(seed) {
  let t = seed >>> 0;
  return function next() {
    t += 0x6d2b79f5;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

export function seedFromNow() {
  // Keep it deterministic-ish per run; avoids leaking identifiers (local only).
  return (Date.now() ^ (Math.random() * 0xffffffff)) >>> 0;
}

