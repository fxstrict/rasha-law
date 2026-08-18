/**
 * رشا حسن — Service Worker
 * استراتيجية التخزين المؤقت: App Shell + Stale-While-Revalidate للمحتوى،
 * Cache First للأصول الثابتة (خطوط/أيقونات/CSS/JS)، وصفحة Offline احتياطية.
 */
const VERSION = "v1.0.1";
const APP_SHELL_CACHE = `rasha-shell-${VERSION}`;
const RUNTIME_CACHE = `rasha-runtime-${VERSION}`;
const OFFLINE_URL = new URL("offline.html", self.registration.scope).href;

const APP_SHELL_FILES = [
  "index.html",
  "offline.html",
  "css/tokens.css",
  "css/main.css",
  "js/config.js",
  "js/main.js",
  "manifest.webmanifest",
  "images/logo.webp",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "fonts/Cairo-Regular.woff2",
  "fonts/Cairo-SemiBold.woff2",
  "fonts/Cairo-Bold.woff2",
  "fonts/Cairo-ExtraBold.woff2"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(APP_SHELL_CACHE).then((cache) => cache.addAll(APP_SHELL_FILES)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== APP_SHELL_CACHE && key !== RUNTIME_CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

function isSameOrigin(url) {
  return url.origin === self.location.origin;
}

// أصول ثابتة: Cache First
function isStaticAsset(url) {
  return /\.(css|js|woff2?|png|jpg|jpeg|webp|svg|ico)$/.test(url.pathname);
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // تنقل بين الصفحات (HTML) — Network First مع رجوع لصفحة Offline
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() =>
          caches.match(request).then((cached) => cached || caches.match(OFFLINE_URL))
        )
    );
    return;
  }

  if (!isSameOrigin(url)) {
    // مصادر خارجية (خرائط/خطوط CDN إن وُجدت) — Stale While Revalidate
    event.respondWith(
      caches.open(RUNTIME_CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          const fetchPromise = fetch(request)
            .then((response) => {
              cache.put(request, response.clone());
              return response;
            })
            .catch(() => cached);
          return cached || fetchPromise;
        })
      )
    );
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            const copy = response.clone();
            caches.open(APP_SHELL_CACHE).then((cache) => cache.put(request, copy));
            return response;
          })
      )
    );
    return;
  }

  // باقي الطلبات (مثل data/articles.json) — Stale While Revalidate
  event.respondWith(
    caches.open(RUNTIME_CACHE).then((cache) =>
      cache.match(request).then((cached) => {
        const fetchPromise = fetch(request)
          .then((response) => {
            cache.put(request, response.clone());
            return response;
          })
          .catch(() => cached);
        return cached || fetchPromise;
      })
    )
  );
});
