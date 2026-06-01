// Builder-Pro service worker — makes the app open & work offline.
// Strategy: hashed static assets cache-first; everything else (navigations +
// App Router RSC payloads) network-first with a cache fallback, so a
// previously-visited page (and the New Defect screen) loads with no signal.
// Bump CACHE when changing this file to roll the cache.
const CACHE = "bp-cache-v1";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.add("/offline"))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

function isRsc(req) {
  try {
    return (
      req.headers.get("RSC") === "1" ||
      new URL(req.url).searchParams.has("_rsc")
    );
  } catch {
    return false;
  }
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  let url;
  try {
    url = new URL(req.url);
  } catch {
    return;
  }
  if (url.origin !== self.location.origin) return; // skip Supabase / cross-origin
  if (url.pathname.startsWith("/api/")) return; // never cache API calls

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(req));
    return;
  }
  event.respondWith(networkFirst(req));
});

async function cacheFirst(req) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(req, { ignoreVary: true });
  if (hit) return hit;
  const res = await fetch(req);
  if (res && res.ok && !res.redirected) cache.put(req, res.clone());
  return res;
}

async function networkFirst(req) {
  const cache = await caches.open(CACHE);
  // Keep RSC payloads under a separate key so they don't clash with the HTML.
  const key = isRsc(req)
    ? new Request(req.url + (req.url.includes("?") ? "&" : "?") + "__rsc=1")
    : req;
  try {
    const res = await fetch(req);
    if (res && res.ok && !res.redirected && res.type !== "opaque") {
      cache.put(key, res.clone());
    }
    return res;
  } catch (err) {
    const cached = await cache.match(key, { ignoreVary: true });
    if (cached) return cached;
    if (req.mode === "navigate") {
      const offline = await cache.match("/offline", { ignoreVary: true });
      if (offline) return offline;
    }
    throw err;
  }
}
