/**
 * JalDrishti Service Worker
 * Provides complete 100% offline functionality:
 * 1. App Shell & assets pre-caching
 * 2. Basemap tile caching (OSM, CartoDB, Esri) for offline map rendering
 * 3. Predictions API fallback to local pilot GeoJSONs
 * 4. Transparent offline fallback for network drops
 */

const STATIC_CACHE = 'jaldrishti-static-v1';
const TILES_CACHE = 'jaldrishti-tiles-v1';
const API_CACHE = 'jaldrishti-api-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/icons.svg',
  '/data/pilot/road_segments.geojson',
  '/data/pilot/predictions_h1.geojson',
  '/data/pilot/predictions_h2.geojson',
  '/data/pilot/predictions_h3.geojson',
  '/data/pilot/predictions_h4.geojson',
  '/data/pilot/predictions_h5.geojson',
  '/data/pilot/predictions_h6.geojson'
];

// 1. Install & Pre-cache
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      // Use map + Promise.allSettled so individual missing assets don't fail registration
      return Promise.allSettled(
        STATIC_ASSETS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn(`[SW] Pre-cache skipped for ${url}:`, err);
          })
        )
      );
    })
  );
});

// 2. Activate & Cleanup Old Caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (![STATIC_CACHE, TILES_CACHE, API_CACHE].includes(key)) {
            console.log('[SW] Clearing deprecated cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Helper: Match map tile request
function isMapTile(url) {
  return (
    url.hostname.includes('tile.openstreetmap.org') ||
    url.hostname.includes('basemaps.cartocdn.com') ||
    url.hostname.includes('arcgisonline.com')
  );
}

// 3. Fetch interceptor
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Ignore non-GET requests (e.g. POST /api/reports handled by IndexedDB in app)
  if (request.method !== 'GET') {
    return;
  }

  // A. MAP TILE REQUESTS: CacheFirst with transparent fallback
  if (isMapTile(url)) {
    event.respondWith(
      caches.open(TILES_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;

        try {
          const networkResponse = await fetch(request);
          if (networkResponse && networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        } catch {
          // In offline mode with unvisited tile: return transparent 256x256 pixel
          return new Response(
            '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect width="256" height="256" fill="rgba(240, 240, 235, 0.4)" stroke="rgba(200, 200, 190, 0.15)" stroke-width="1"/></svg>',
            { headers: { 'Content-Type': 'image/svg+xml' } }
          );
        }
      })
    );
    return;
  }

  // B. PREDICTIONS API REQUESTS: NetworkFirst with Local Pilot GeoJSON Fallback
  if (url.pathname.includes('/api/predictions')) {
    event.respondWith(
      (async () => {
        try {
          const networkRes = await fetch(request);
          if (networkRes && networkRes.ok) {
            const cache = await caches.open(API_CACHE);
            cache.put(request, networkRes.clone());
            return networkRes;
          }
          throw new Error('API request failed');
        } catch {
          // Offline: first check cached API response
          const cache = await caches.open(API_CACHE);
          const cached = await cache.match(request);
          if (cached) return cached;

          // If not in cache, fallback to bundled static horizon GeoJSON
          const hourParam = url.searchParams.get('hour') || '1';
          const fallbackStatic = await caches.match(`/data/pilot/predictions_h${hourParam}.geojson`);
          if (fallbackStatic) return fallbackStatic;

          return new Response(JSON.stringify({ type: 'FeatureCollection', features: [] }), {
            headers: { 'Content-Type': 'application/json' }
          });
        }
      })()
    );
    return;
  }

  // C. APP SHELL & STATIC ASSETS: StaleWhileRevalidate / CacheFirst
  event.respondWith(
    caches.match(request).then(async (cached) => {
      if (cached) {
        // Background revalidation
        fetch(request)
          .then((networkRes) => {
            if (networkRes && networkRes.ok) {
              caches.open(STATIC_CACHE).then((cache) => cache.put(request, networkRes));
            }
          })
          .catch(() => {});
        return cached;
      }

      try {
        const networkRes = await fetch(request);
        if (networkRes && networkRes.ok && (request.destination === 'script' || request.destination === 'style' || request.destination === 'image')) {
          const cache = await caches.open(STATIC_CACHE);
          cache.put(request, networkRes.clone());
        }
        return networkRes;
      } catch {
        // If navigation request (e.g. reload on deep link), return cached index.html
        if (request.mode === 'navigate') {
          return caches.match('/index.html');
        }
        return new Response('Network unavailable', { status: 503, statusText: 'Offline' });
      }
    })
  );
});
