const CACHE_NAME = 'daw-cache';
const MAX_MB = 50;
const TTL_MS = 60 * 60 * 1000; // 1 hour

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());

self.addEventListener('fetch', (e) => {
  if (e.request.destination !== 'audio' && e.request.destination !== 'image') return;
  e.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      // TTL cleanup
      (await cache.keys()).forEach(req => cache.delete(req));
      const cached = await cache.match(e.request);
      if (cached) return cached;
      const fresh = await fetch(e.request);
      if (fresh.ok) {
        const keys = await cache.keys();
        if (keys.length * 0.001 < MAX_MB) cache.put(e.request, fresh.clone());
      }
      return fresh;
    })
  );
});
