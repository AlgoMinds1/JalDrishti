/**
 * JalDrishti Service Worker — Resilient Offline Engine
 * 1. Bundled Real Tile Fallback: Serves local Pune street map tiles when offline.
 * 2. Instant Predictions API: Fast 1.2s timeout -> Cache -> Local Static Pilot GeoJSON.
 * 3. Graceful API handling: Reports, notifications, and health endpoints return valid JSON offline.
 * 4. Full App Shell caching with offline SPA routing fallback.
 */

const STATIC_CACHE = 'jaldrishti-static-v3';
const TILES_CACHE = 'jaldrishti-tiles-v3';
const API_CACHE = 'jaldrishti-api-v3';

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

// Helper: Fast-fail fetch with AbortController
function quickFetch(request, timeoutMs = 1200) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  return fetch(request, { signal: controller.signal })
    .then((res) => {
      clearTimeout(timer);
      return res;
    })
    .catch((err) => {
      clearTimeout(timer);
      throw err;
    });
}

// 1. Install & Pre-cache App Shell
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
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
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Helper: Match map tile requests across all basemaps & weather layers
function isMapTile(url) {
  const host = url.hostname;
  return (
    host.includes('tile.openstreetmap.org') ||
    host.includes('basemaps.cartocdn.com') ||
    host.includes('arcgisonline.com') ||
    host.includes('openweathermap.org') ||
    url.pathname.startsWith('/tiles/') ||
    url.pathname.match(/\/\d+\/\d+\/\d+(\.png|\.jpg|\/tile)/)
  );
}

// Subtle fallback tile if user pans completely outside Pune pilot bounding box
const OFFLINE_TILE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
  <rect width="256" height="256" fill="#f5f0e7"/>
  <path d="M0 64 H256 M0 128 H256 M0 192 H256 M64 0 V256 M128 0 V256 M192 0 V256" stroke="#e7ddcc" stroke-width="0.8"/>
  <circle cx="128" cy="128" r="1.5" fill="#c9bea9"/>
</svg>
`.trim();

// 3. Fetch interceptor
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Non-GET requests (e.g. POST /api/reports) are handled by app-level IndexedDB
  if (request.method !== 'GET') {
    return;
  }

  // A. MAP TILE REQUESTS: CacheFirst -> Network -> Bundled Pune Real Tiles -> SVG Fallback
  if (isMapTile(url)) {
    event.respondWith(
      caches.open(TILES_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;

        // Try network first if online (short 1.5s timeout)
        try {
          const networkRes = await quickFetch(request, 1500);
          const opaqueBasemapTile = networkRes?.type === 'opaque' && (
            url.hostname.includes('tile.openstreetmap.org') ||
            url.hostname.includes('basemaps.cartocdn.com') ||
            url.hostname.includes('arcgisonline.com')
          );
          if (networkRes && (networkRes.ok || opaqueBasemapTile)) {
            void cache.put(request, networkRes.clone()).catch(() => {});
            return networkRes;
          }
          throw new Error('Tile network error');
        } catch {
          // Offline fallback: Check if this tile exists in bundled local /tiles/{z}/{x}/{y}.png
          const tileMatch = url.pathname.match(/\/(\d+)\/(\d+)\/(\d+)(\.png|\/tile)/);
          if (tileMatch) {
            const z = tileMatch[1];
            const x = tileMatch[2];
            const y = tileMatch[3].replace(/\.png$/, '');
            const localTileUrl = `/tiles/${z}/${x}/${y}.png`;
            try {
              const localTileRes = await fetch(localTileUrl);
              if (localTileRes && localTileRes.ok) {
                void cache.put(request, localTileRes.clone()).catch(() => {});
                return localTileRes;
              }
            } catch {
              // Local tile not in zoom range, fallback to SVG
            }
          }

          // Return tactical SVG tile
          return new Response(OFFLINE_TILE_SVG, {
            headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=86400' }
          });
        }
      })
    );
    return;
  }

  // B. PREDICTIONS API: Fast-fail network (1.2s) -> Cache -> Local Static Pilot GeoJSON
  if (url.pathname.includes('/api/predictions')) {
    event.respondWith(
      (async () => {
        try {
          const networkRes = await quickFetch(request, 1200);
          if (networkRes && networkRes.ok) {
            const cache = await caches.open(API_CACHE);
            cache.put(request, networkRes.clone());
            return networkRes;
          }
          throw new Error('API request failed or timed out');
        } catch {
          // Fast offline fallback: check cached API response
          const cache = await caches.open(API_CACHE);
          const cached = await cache.match(request);
          if (cached) return cached;

          // If not in API cache, deliver bundled static horizon GeoJSON
          const hourParam = url.searchParams.get('hour') || '1';
          const fallbackStatic = await caches.match(`/data/pilot/predictions_h${hourParam}.geojson`) ||
                                 await fetch(`/data/pilot/predictions_h${hourParam}.geojson`).catch(() => null);
          if (fallbackStatic && fallbackStatic.ok) return fallbackStatic;

          return new Response(JSON.stringify({ type: 'FeatureCollection', features: [] }), {
            headers: { 'Content-Type': 'application/json' }
          });
        }
      })()
    );
    return;
  }

  // C. API endpoints: allow normal server latency and surface offline failures.
  if (url.pathname.includes('/api/notifications')) {
    event.respondWith(
      quickFetch(request, 10000).catch(() =>
        new Response(JSON.stringify({ detail: 'Notification service is unavailable. Check your connection and retry.' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
        })
      )
    );
    return;
  }

  if (url.pathname.includes('/api/reports')) {
    event.respondWith(
      quickFetch(request, 10000).catch(() =>
        new Response(JSON.stringify({ detail: 'Report service is unavailable. Check your connection and retry.' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
        })
      )
    );
    return;
  }

  if (url.pathname.includes('/api/health')) {
    event.respondWith(
      quickFetch(request, 1000).catch(() =>
        new Response(JSON.stringify({ status: 'offline', rain_data_age_min: 15 }), { headers: { 'Content-Type': 'application/json' } })
      )
    );
    return;
  }

  // D. APP SHELL & ASSETS: Cache-First / Stale-While-Revalidate with fast-fail
  event.respondWith(
    caches.match(request).then(async (cached) => {
      if (cached) {
        // Background revalidation without blocking UI
        quickFetch(request, 2000)
          .then((networkRes) => {
            if (networkRes && networkRes.ok) {
              caches.open(STATIC_CACHE).then((cache) => cache.put(request, networkRes));
            }
          })
          .catch(() => {});
        return cached;
      }

      try {
        const networkRes = await quickFetch(request, 1500);
        if (networkRes && networkRes.ok) {
          const cache = await caches.open(STATIC_CACHE);
          cache.put(request, networkRes.clone());
        }
        return networkRes;
      } catch {
        // If navigation request (e.g. reload or route change), deliver cached index.html
        if (request.mode === 'navigate') {
          const indexHtml = await caches.match('/index.html') || await fetch('/index.html').catch(() => null);
          if (indexHtml) return indexHtml;
        }
        return new Response('Offline', { status: 200, statusText: 'Offline' });
      }
    })
  );
});

// Push notification listeners
self.addEventListener('push', (event) => {
  let message = { title: 'JalDrishti', body: 'There is an update.', id: Date.now() };
  try { message = { ...message, ...event.data.json() }; } catch { /* use default */ }
  event.waitUntil(Promise.all([
    self.registration.showNotification(message.title, {
      body: message.body,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      tag: `jaldrishti-${message.id}`,
      renotify: true,
      requireInteraction: true,
      data: { url: '/', notificationId: message.id }
    }),
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
      const visibleClient = windows.find((client) => client.visibilityState === 'visible');
      const target = visibleClient || windows[0];
      target?.postMessage({ type: 'JALDRISHTI_PUSH_NOTICE', notice: message });
    })
  ]));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
    const existing = windows.find((client) => 'focus' in client);
    return existing ? existing.focus() : clients.openWindow(event.notification.data?.url || '/');
  }));
});
