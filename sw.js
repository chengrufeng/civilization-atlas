/* =========================================================================
 * Service Worker · Civilization Atlas
 *
 * 缓存策略：
 *   - 静态资源（HTML/CSS/JS/manifest）：stale-while-revalidate
 *     → 立即从缓存返回，同时后台拉新版更新缓存
 *   - CDN 资源（leaflet/unpkg）：cache-first，命中即返回，未命中去网络
 *   - 数据集 JS（同源 /js/data/）：与静态资源同策略，首次访问后即可离线
 *   - 其他：network-first，网络失败回退到缓存（如果有）
 *
 * 版本升级：bump CACHE_VERSION，下次访问会清掉旧缓存。
 * ========================================================================= */

const CACHE_VERSION = 'v1-2026-07';
const STATIC_CACHE = `atlas-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `atlas-runtime-${CACHE_VERSION}`;

const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './js/app.js',
  './js/core/state.js',
  './js/core/atlas.js',
  './js/core/map.js',
  './js/core/render.js',
  './js/core/controls.js',
  './js/core/timeline.js',
  './js/core/event-list.js',
  './js/core/detail.js',
  './js/core/compare.js',
  './js/core/domain-browser.js',
  './js/core/url-state.js',
  './js/core/i18n.js',
  './js/core/life-journey.js',
  './js/core/favorites.js',
  './js/data/index.js',
  './js/data/cross-links.js',
];

const CDN_PREFIXES = [
  'https://unpkg.com/leaflet@',
  'https://cdn.jsdelivr.net/npm/leaflet@',
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(STATIC_CACHE);
    // 用 addAll，单个失败不阻塞其他
    await Promise.allSettled(CORE_ASSETS.map(url => cache.add(url)));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter(k => k !== STATIC_CACHE && k !== RUNTIME_CACHE)
        .map(k => caches.delete(k))
    );
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  const isCdn = CDN_PREFIXES.some(p => req.url.startsWith(p));

  // 静态 + 数据集 JS：stale-while-revalidate
  if (sameOrigin) {
    event.respondWith(staleWhileRevalidate(req, STATIC_CACHE));
    return;
  }

  // CDN：cache-first
  if (isCdn) {
    event.respondWith(cacheFirst(req, RUNTIME_CACHE));
    return;
  }

  // 其他跨源：network-first，失败回退缓存
  event.respondWith(networkFirst(req, RUNTIME_CACHE));
});

async function staleWhileRevalidate(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  const fetchPromise = fetch(req).then(res => {
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  }).catch(() => cached);
  return cached || fetchPromise;
}

async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  if (cached) return cached;
  try {
    const res = await fetch(req);
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  } catch { return cached || Response.error(); }
}

async function networkFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const res = await fetch(req);
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  } catch {
    const cached = await cache.match(req);
    return cached || Response.error();
  }
}
