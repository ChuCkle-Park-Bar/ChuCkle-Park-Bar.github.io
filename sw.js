/* Basic service worker for offline cache */
const VERSION = 'v1.0.2';
const STATIC_CACHE = `static-${VERSION}`;
const RUNTIME_CACHE = 'runtime';
const OFFLINE_URL = 'offline.html';

const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/images/chuckleparkbar-logo.png',
  '/images/hero/hero_01.jpg',
  '/offline.html'
];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(STATIC_CACHE);
    await cache.addAll(CORE_ASSETS);
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => ![STATIC_CACHE, RUNTIME_CACHE].includes(k)).map(k => caches.delete(k)));
    clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  if (request.method !== 'GET') return;

  // HTML navigation requests: network first, fallback to cache, then offline page
  if (request.mode === 'navigate' || (request.headers.get('accept') || '').includes('text/html')) {
    e.respondWith((async () => {
      try {
        const net = await fetch(request);
        const cache = await caches.open(STATIC_CACHE);
        cache.put(request, net.clone());
        return net;
      } catch (_) {
        const cacheMatch = await caches.match(request);
        return cacheMatch || caches.match(OFFLINE_URL);
      }
    })());
    return;
  }

  // Images & other: stale-while-revalidate
  if (request.destination === 'image' || request.destination === 'script' || request.destination === 'style') {
    e.respondWith((async () => {
      const cache = await caches.open(RUNTIME_CACHE);
      const cached = await cache.match(request);
      const fetchPromise = fetch(request).then(res => {
        cache.put(request, res.clone());
        return res;
      }).catch(() => cached);
      return cached || fetchPromise;
    })());
    return;
  }

  // Default: try cache first then network
  e.respondWith((async () => (await caches.match(request)) || fetch(request).catch(() => caches.match(OFFLINE_URL)))());
});
