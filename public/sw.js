// Minimal offline cache: pre-cache app shell; runtime-cache same-origin GET requests.
const CACHE_NAME = "wam-cache-v49";
const SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./manifest.webmanifest",
  "./js/app.js",
  "./js/tooth-fairy-float.js",
  "./js/game/storage.js",
  "./js/game/audio.js",
  "./js/game/board.js",
  "./js/game/game-core.js",
  "./js/game/prng.js",
  "./js/game/difficulty.js",
  "./js/game/utils.js",
  "./js/game/art.js",
  "./vendor/p5/p5.min.js",
  "./assets/original/sprite-sets/set_a/1.png",
  "./assets/original/sprite-sets/set_a/2.png",
  "./assets/original/sprite-sets/set_a/3.png",
  "./assets/original/sprite-sets/set_a/4.png",
  "./assets/original/sprite-sets/set_a/5.png",
  "./assets/original/sprite-sets/set_a/6.png",
  "./assets/original/sprite-sets/set_b/1.png",
  "./assets/original/sprite-sets/set_b/2.png",
  "./assets/original/sprite-sets/set_b/3.png",
  "./assets/original/sprite-sets/set_b/4.png",
  "./assets/original/sprite-sets/set_b/5.png",
  "./assets/original/sprite-sets/set_b/6.png",
  "./assets/original/tooth-fairy/tooth_fairy.png",
  "./assets/original/kawaii-gui/button-orange-wide.png",
  "./assets/original/kawaii-gui/panel-blue-tight.png",
  "./assets/original/kawaii-gui/decor-cupcake.png",
  "./assets/original/kawaii-gui/decor-macaron.png",
  "./assets/original/kawaii-gui/decor-sandwich.png",
  "./assets/original/post-ui/big-bar.png",
  "./assets/original/post-ui/press-big-bar.png",
  "./assets/original/post-ui/small-bar.png",
  "./assets/original/post-ui/press-small-bar.png",
  "./assets/original/post-ui/pieces-bar-1.png",
  "./assets/original/post-ui/pieces-bar-2.png",
  "./assets/original/post-ui/background-green.png",
  "./assets/original/fonts/MGF-PinlockPersonalUse.otf",
  "./assets/original/backgrounds/kawaii-food-bg-1344879.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((k) => (k === CACHE_NAME ? null : caches.delete(k)))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  // SPA-ish navigation fallback to cached index.html.
  if (req.mode === "navigate") {
    event.respondWith(
      caches.match("./index.html").then((cached) => cached || fetch(req).catch(() => cached))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => cached);
    })
  );
});
