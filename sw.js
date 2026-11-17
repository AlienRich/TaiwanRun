/**
 * 台灣瘋狂大賽車 TaiwanRun - 現代 PWA 離線 Service Worker
 * 策略：Stale-While-Revalidate（即開即玩，背景更新，100% 離線遊玩）
 */
const CACHE_NAME = 'taiwanrun-v6.4';

const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/arcade.css',
  './js/audio.js',
  './js/stages_data.js',
  './js/vehicle_sprites_data.js',
  './js/sprites.js',
  './js/road.js',
  './js/player.js',
  './js/collision.js',
  './js/main.js',
  './assets/icons/icon.svg',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[SW] Pre-caching partial warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  // Stale-While-Revalidate 策略
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // 離線時靜默返回快取
        return cachedResponse;
      });

      return cachedResponse || fetchPromise;
    })
  );
});
