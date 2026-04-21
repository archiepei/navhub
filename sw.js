const CACHE_NAME = 'navhub-v1';
const ASSETS_TO_CACHE = [
  '/navhub/',
  '/navhub/index.html',
  '/navhub/manifest.json',
  '/navhub/icons/icon-72.png',
  '/navhub/icons/icon-96.png',
  '/navhub/icons/icon-128.png',
  '/navhub/icons/icon-144.png',
  '/navhub/icons/icon-192.png',
  '/navhub/icons/icon-256.png',
  '/navhub/icons/icon-384.png',
  '/navhub/icons/icon-512.png',
];

// Install: cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).catch(() => {
      // Silent fail for optional assets
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch: network first, fallback to cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses
        if (response.ok && event.request.method === 'GET') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache
        return caches.match(event.request).then((cached) => {
          return cached || new Response('Offline', { status: 503 });
        });
      })
  );
});
