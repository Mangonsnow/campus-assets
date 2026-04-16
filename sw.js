const CACHE = 'campus-assets-v1';
const PRECACHE = ['/', '/index.html'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache =>
      // Use individual cache.add() calls so one 404 doesn't break the whole cache
      Promise.allSettled(PRECACHE.map(url => cache.add(url).catch(() => console.warn('[SW] failed to cache:', url))))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Don't cache API calls or Netlify functions
  if (url.pathname.startsWith('/.netlify/') || url.pathname.startsWith('/api/')) return;
  // Network-first for HTML, cache-first for static assets
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      }).catch(() => caches.match(e.request))
    );
  }
});
