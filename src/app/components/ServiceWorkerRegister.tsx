'use client';

import { useEffect } from 'react';

/**
 * ServiceWorkerRegister
 * Seamlessly registers the studioNeo Service Worker on the visitor's local device
 * upon window load. This guarantees that on first visit, core brand identity,
 * media elements, icons, and static chunks are cached locally without competing
 * with critical path LCP (Largest Contentful Paint) resources.
 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    // Proactively purge legacy v2 caches that stored stale 4-item navbar HTML shells
    if ('caches' in window) {
      caches
        .keys()
        .then((cacheNames) =>
          Promise.all(
            cacheNames
              .filter((name) => name.includes('bikko-v2'))
              .map((name) => caches.delete(name))
          )
        )
        .catch(() => {});
    }

    // In development mode, unregister any active worker to avoid stale HMR and dev chunk conflicts
    if (process.env.NODE_ENV === 'development') {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const reg of registrations) {
          reg.unregister();
        }
      });
      return;
    }

    const registerWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none',
        });

        registration.update().catch(() => {});

        // Listen for updates and new service worker installs
        registration.addEventListener('updatefound', () => {
          const installing = registration.installing;
          if (!installing) return;

          installing.addEventListener('statechange', () => {
            if (installing.state === 'activated') {
              console.debug('[bikko-cache] Local device caching is active.');
            }
          });
        });
      } catch (err) {
        console.debug('[bikko-cache] Service worker registration note:', err);
      }
    };

    if (document.readyState === 'complete') {
      registerWorker();
    } else {
      window.addEventListener('load', registerWorker, { once: true });
      return () => window.removeEventListener('load', registerWorker);
    }
  }, []);

  return null;
}
