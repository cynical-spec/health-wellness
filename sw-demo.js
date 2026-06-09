/**
 * Sehat Saathi — DEMO service worker (single-file github.io demos).
 *
 * The stakeholder demos are one index.html served from a project SUBPATH
 * (e.g. /health-wellness/ or /…/health/sehat-saathi/). This SW is colocated
 * with that index.html and registered RELATIVELY, so its scope is that folder
 * — no hardcoded /health paths (those belong to the real PWA's sw.js).
 *
 * Goal: kill the "hard-refresh to see the new push" problem on the demos.
 *   • NETWORK-FIRST for navigations → the demo HTML is always fresh when
 *     online (falls back to cache offline).
 *   • STALE-WHILE-REVALIDATE for same-origin assets (Lottie JSON, icons).
 *   • Worker proxy + cross-origin bypassed (fresh auth, let browser handle CDN).
 */

const CACHE = "ss-demo-v1";

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  if (url.hostname.endsWith(".workers.dev")) return; // proxy — always fresh
  if (url.origin !== self.location.origin) return; // CDN/fonts — browser handles

  const isNavigation =
    req.mode === "navigate" ||
    (req.headers.get("Accept") || "").includes("text/html");

  if (isNavigation) {
    // Network-first: always try fresh HTML, cache as offline fallback.
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match("./"))),
    );
    return;
  }

  // Assets: stale-while-revalidate.
  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(req);
      const network = fetch(req)
        .then((res) => {
          if (res && res.ok) cache.put(req, res.clone());
          return res;
        })
        .catch(() => cached);
      return cached || network;
    }),
  );
});

self.addEventListener("message", (e) => {
  if (e.data === "SKIP_WAITING") self.skipWaiting();
});
