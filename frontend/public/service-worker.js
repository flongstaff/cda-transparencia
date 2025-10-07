/**
 * Service Worker for CDA Transparency Portal
 *
 * Provides:
 * - Offline support
 * - Smart caching strategies
 * - Background sync for external APIs
 * - Progressive web app capabilities
 */

const CACHE_VERSION = 'cda-transparency-v1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DATA_CACHE = `${CACHE_VERSION}-data`;
const API_CACHE = `${CACHE_VERSION}-api`;

// Resources to cache immediately on install
const STATIC_RESOURCES = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Data files that should be cached
const DATA_PATTERNS = [
  /^\/data\/.+\.json$/,
  /^\/data\/.+\.csv$/,
  /^\/data\/charts\/.+/,
  /^\/data\/consolidated\/.+/
];

// External API patterns
const API_PATTERNS = [
  /^https:\/\/cda-transparencia-api\.franco-longstaff\.workers\.dev\/.+/,
  /^https:\/\/api\.cda-transparencia\.org\/.+/,
  /^http:\/\/localhost:3001\/api\/.+/
];

/**
 * Install event - cache static resources
 */
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');

  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[Service Worker] Caching static resources');
        return cache.addAll(STATIC_RESOURCES);
      })
      .then(() => {
        console.log('[Service Worker] Installation complete');
        return self.skipWaiting();
      })
  );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName.startsWith('cda-transparency-') &&
                     cacheName !== STATIC_CACHE &&
                     cacheName !== DATA_CACHE &&
                     cacheName !== API_CACHE;
            })
            .map((cacheName) => {
              console.log('[Service Worker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[Service Worker] Activation complete');
        return self.clients.claim();
      })
  );
});

/**
 * Fetch event - implement caching strategies
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Determine caching strategy based on request type
  if (isDataRequest(url)) {
    // Stale-while-revalidate for data files
    event.respondWith(staleWhileRevalidate(request, DATA_CACHE));
  } else if (isAPIRequest(url)) {
    // Network-first for external APIs with cache fallback
    event.respondWith(networkFirstWithCache(request, API_CACHE));
  } else if (isStaticResource(url)) {
    // Cache-first for static resources
    event.respondWith(cacheFirst(request, STATIC_CACHE));
  } else {
    // Network-first for everything else
    event.respondWith(networkFirst(request, STATIC_CACHE));
  }
});

/**
 * Check if request is for data files
 */
function isDataRequest(url) {
  return DATA_PATTERNS.some(pattern => pattern.test(url.pathname));
}

/**
 * Check if request is for external APIs
 */
function isAPIRequest(url) {
  return API_PATTERNS.some(pattern => pattern.test(url.href));
}

/**
 * Check if request is for static resources
 */
function isStaticResource(url) {
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.svg', '.woff', '.woff2'];
  return staticExtensions.some(ext => url.pathname.endsWith(ext));
}

/**
 * Cache-first strategy
 * Serve from cache if available, otherwise fetch from network and cache
 */
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  if (cached) {
    console.log('[Service Worker] Cache hit:', request.url);
    return cached;
  }

  console.log('[Service Worker] Cache miss, fetching:', request.url);
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('[Service Worker] Fetch failed:', error);
    return new Response('Network error', { status: 503 });
  }
}

/**
 * Network-first strategy
 * Try network first, fall back to cache if network fails
 */
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log('[Service Worker] Network failed, trying cache:', request.url);
    const cached = await cache.match(request);

    if (cached) {
      return cached;
    }

    return new Response('Network error and no cache available', { status: 503 });
  }
}

/**
 * Network-first with cache fallback for APIs
 * Always try network first, use cache only if network fails
 * Cache responses with short TTL
 */
async function networkFirstWithCache(request, cacheName) {
  const cache = await caches.open(cacheName);

  try {
    const response = await fetch(request, {
      headers: {
        'Cache-Control': 'no-cache'
      }
    });

    if (response.ok) {
      // Cache API responses for 1 hour
      const clonedResponse = response.clone();
      cache.put(request, clonedResponse);

      // Clean up old API cache entries
      cleanupAPICache(cache);
    }

    return response;
  } catch (error) {
    console.log('[Service Worker] API network failed, trying cache:', request.url);
    const cached = await cache.match(request);

    if (cached) {
      // Check if cache is stale (older than 1 hour)
      const cacheDate = cached.headers.get('date');
      if (cacheDate) {
        const age = Date.now() - new Date(cacheDate).getTime();
        if (age > 60 * 60 * 1000) { // 1 hour
          console.log('[Service Worker] Cache is stale, but returning anyway');
        }
      }
      return cached;
    }

    return new Response(JSON.stringify({ error: 'Network error and no cache available' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Stale-while-revalidate strategy
 * Return cached response immediately, then update cache in background
 */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  // Fetch from network in background
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch((error) => {
      console.error('[Service Worker] Background fetch failed:', error);
      return null;
    });

  // Return cached response immediately if available
  if (cached) {
    console.log('[Service Worker] Returning cached, revalidating:', request.url);
    return cached;
  }

  // If no cache, wait for network
  console.log('[Service Worker] No cache, waiting for network:', request.url);
  return fetchPromise;
}

/**
 * Clean up old API cache entries
 */
async function cleanupAPICache(cache) {
  const keys = await cache.keys();
  const now = Date.now();
  const maxAge = 60 * 60 * 1000; // 1 hour

  for (const request of keys) {
    const response = await cache.match(request);
    if (response) {
      const cacheDate = response.headers.get('date');
      if (cacheDate) {
        const age = now - new Date(cacheDate).getTime();
        if (age > maxAge) {
          console.log('[Service Worker] Deleting stale API cache:', request.url);
          await cache.delete(request);
        }
      }
    }
  }
}

/**
 * Background sync for external API data
 */
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-external-data') {
    console.log('[Service Worker] Background sync triggered');
    event.waitUntil(syncExternalData());
  }
});

/**
 * Sync external data in background
 */
async function syncExternalData() {
  const apiEndpoints = [
    '/api/external/rafam',
    '/api/external/gba',
    '/api/external/carmen'
  ];

  const cache = await caches.open(API_CACHE);

  for (const endpoint of apiEndpoints) {
    try {
      const response = await fetch(endpoint);
      if (response.ok) {
        await cache.put(endpoint, response);
        console.log('[Service Worker] Synced:', endpoint);
      }
    } catch (error) {
      console.error('[Service Worker] Sync failed for:', endpoint, error);
    }
  }
}

/**
 * Message handler for cache control
 */
self.addEventListener('message', (event) => {
  if (event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  } else if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data.type === 'PREFETCH') {
    const urls = event.data.urls || [];
    event.waitUntil(
      caches.open(DATA_CACHE).then((cache) => {
        return cache.addAll(urls);
      })
    );
  }
});

console.log('[Service Worker] Script loaded');
