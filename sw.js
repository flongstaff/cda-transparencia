
// Service Worker for CDA Transparency Portal
const CACHE_NAME = 'cda-transparency-v1';
const urlsToCache = [
  '/',
  '/data/api/index.json',
  '/data/api/transparency.json',
  '/data/api/statistics.json',
  '/data/api/audit.json',
  '/data/api/pdf_manifest.json'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});
