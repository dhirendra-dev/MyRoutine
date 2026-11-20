/* MyRoutine offline worker — same-origin assets only. */
const CACHE_VERSION = "myroutine-shell-v14";
const APP_SHELL = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/offline.html",
  "/icons/icon-192.svg",
  "/icons/icon-512.svg",
  "/icons/icon-maskable.svg",
  "/myroutine.js",
  "/app-shell.js",
  "/routine-ui.js",
  "/routine-storage.js",
  "/routine-data.js",
  "/routine-settings.js",
  "/routine-editor.js",
  "/routine-view.js",
  "/routine-share.js",
  "/routine-calendar.js",
  "/routine-notifications.js",
  "/routine-templates.js",
  "/routine-dashboard.js",
  "/routine-search.js",
  "/routine-analytics.js",
  "/routine-backup.js",
  "/routine-print.js",
  "/atelier-modules.js",
  "/atelier-polish.css",
  "/pwa.js",
  "/routine-smart.js",
  "/routine-daily-planner.js",
  "/routine-task-desk.js",
  "/routine-command-center.js",
  "/routine-analytics-studio.js",
  "/routine-streak-engine.js",
  "/app-shell.css",
  "/myroutine-design-system.css",
  "/privacy-notice.js",
  "/settings-privacy.js",
  "/legal.html"
];

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_VERSION);
    await Promise.allSettled(APP_SHELL.map(async path => {
      const response = await fetch(path, { cache: "reload" });
      if (response.ok) await cache.put(path, response);
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith("myroutine-shell-") && key !== CACHE_VERSION).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(request);
        if (fresh.ok) {
          const cache = await caches.open(CACHE_VERSION);
          cache.put("/index.html", fresh.clone());
        }
        return fresh;
      } catch {
        return (await caches.match(request)) || (await caches.match("/index.html")) || (await caches.match("/offline.html"));
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) return cached;
    try {
      const fresh = await fetch(request);
      if (fresh.ok && (url.pathname.endsWith(".js") || url.pathname.endsWith(".css") || url.pathname.endsWith(".svg"))) {
        const cache = await caches.open(CACHE_VERSION);
        cache.put(request, fresh.clone());
      }
      return fresh;
    } catch {
      return new Response("Offline", { status: 503, statusText: "Offline" });
    }
  })());
});