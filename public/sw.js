/**
 * bikko.studio Service Worker
 * High-performance local device caching for first-time and returning visitors.
 *
 * Strategies:
 * 1. Pre-caching: Instantly caches core brand identity, icons, and shell elements on first visit.
 * 2. Cache-First: Static JS/CSS chunks, SVG vector stems, WebP/GIF animations, and web fonts.
 * 3. Stale-While-Revalidate: Navigations and HTML page shells for instant rendering with background updates.
 * 4. Network-Only (Strict Bypass): All dynamic API endpoints (/api/*), WebAuthn passkeys, and auth sessions.
 */

const CACHE_VERSION = 'bikko-v2';
const PRECACHE_NAME = `bikko-core-${CACHE_VERSION}`;
const STATIC_CACHE_NAME = `bikko-static-${CACHE_VERSION}`;
const MEDIA_CACHE_NAME = `bikko-media-${CACHE_VERSION}`;
const PAGES_CACHE_NAME = `bikko-pages-${CACHE_VERSION}`;

const CURRENT_CACHES = [
  PRECACHE_NAME,
  STATIC_CACHE_NAME,
  MEDIA_CACHE_NAME,
  PAGES_CACHE_NAME,
];

// Core brand assets pre-cached locally on the user's device upon initial arrival
const CORE_ASSETS = [
  '/',
  '/icon.svg',
  '/favicon.ico',
  '/apple-icon.png',
  '/bikko-mark.svg',
  '/bikko-mark.png',
  '/manifest.webmanifest',
];

// --- 1. INSTALLATION ---
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(PRECACHE_NAME)
      .then((cache) => {
        // Cache core assets resiliently so individual misses don't abort entire install
        return Promise.allSettled(
          CORE_ASSETS.map((url) =>
            fetch(url, { cache: 'reload' })
              .then((response) => {
                if (response.ok) {
                  return cache.put(url, response);
                }
              })
              .catch(() => {
                // Silently ignore individual pre-cache failures during install
              })
          )
        );
      })
      .then(() => self.skipWaiting())
  );
});

// --- 2. ACTIVATION ---
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!CURRENT_CACHES.includes(cacheName)) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Helper: Determine if request is for static media, imagery, or web fonts
function isMediaOrFont(url) {
  if (
    url.hostname === 'bikkostudio.blob.core.windows.net' ||
    url.hostname.includes('fonts.gstatic.com') ||
    url.hostname.includes('fonts.googleapis.com')
  ) {
    return true;
  }
  return /\.(svg|png|jpg|jpeg|webp|gif|ico|woff|woff2|ttf|eot)$/i.test(url.pathname);
}

// Helper: Determine if request is Next.js static asset chunk
function isNextStatic(url) {
  return (
    url.pathname.startsWith('/_next/static/') &&
    !url.pathname.includes('hot-update') &&
    !url.pathname.includes('webpack-hmr')
  );
}

// --- 3. FETCH INTERCEPTION ---
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Only handle HTTP/HTTPS GET requests
  if (request.method !== 'GET') {
    return;
  }

  // DEV BYPASS: In local development, bypass caching to allow instant hot module reload
  if (self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1') {
    return;
  }

  const url = new URL(request.url);

  // STRICT BYPASS: Never cache dynamic API routes, auth endpoints, or passkey challenges
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // STRICT BYPASS: Dev-server HMR hot module reload & development manifests
  if (
    url.pathname.includes('/_next/webpack-hmr') ||
    url.pathname.includes('hot-update')
  ) {
    return;
  }

  // Non-HTTP(S) schemes (chrome-extension://, etc.)
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return;
  }

  // STRATEGY A: Cache-First for static media, SVG vector stems, GIF/WebP animations, and web fonts
  if (isMediaOrFont(url)) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request)
          .then((networkResponse) => {
            // Cache valid responses (including opaque responses for cross-origin assets like Google Fonts / Azure Blob)
            if (
              networkResponse &&
              (networkResponse.status === 200 || networkResponse.type === 'opaque')
            ) {
              const responseClone = networkResponse.clone();
              caches.open(MEDIA_CACHE_NAME).then((cache) => {
                cache.put(request, responseClone).catch(() => {});
              });
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);
      })
    );
    return;
  }

  // STRATEGY B: Next.js static asset chunks
  if (isNextStatic(url)) {
    const isDev = self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1';

    if (isDev) {
      // In development: Network-first to ensure live CSS/JS changes reload immediately
      event.respondWith(
        fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(STATIC_CACHE_NAME).then((cache) => {
                cache.put(request, responseClone).catch(() => {});
              });
            }
            return networkResponse;
          })
          .catch(() => caches.match(request))
      );
      return;
    }

    // In production: Cache-first for instant delivery of hashed immutable bundles
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(STATIC_CACHE_NAME).then((cache) => {
                cache.put(request, responseClone).catch(() => {});
              });
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);
      })
    );
    return;
  }

  // STRATEGY C: Stale-While-Revalidate for HTML page navigations
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(PAGES_CACHE_NAME).then((cache) => {
                cache.put(request, responseClone).catch(() => {});
              });
            }
            return networkResponse;
          })
          .catch(async () => {
            // If network fails (e.g. offline) and no cached page, fall back to cached root
            if (cachedResponse) return cachedResponse;
            return caches.match('/');
          });

        // Serve cached version immediately if available, while network updates in background
        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Default: Stale-While-Revalidate for other local GET assets
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(STATIC_CACHE_NAME).then((cache) => {
                cache.put(request, responseClone).catch(() => {});
              });
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
  }
});
