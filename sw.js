// Abre al instante desde el teléfono y actualiza en segundo plano (los cambios se ven en la siguiente apertura).
const CACHE = 'facturas-v3';
const BASE = ['./', 'index.html', 'config.js', 'manifest.webmanifest', 'icon.svg'];
self.addEventListener('install', e => e.waitUntil(
  caches.open(CACHE).then(c => c.addAll(BASE)).catch(() => {}).then(() => self.skipWaiting())
));
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())
));
self.addEventListener('fetch', e => {
  const req = e.request, u = new URL(req.url);
  if (req.method !== 'GET' || !(u.origin === location.origin || u.hostname === 'cdn.jsdelivr.net')) return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(req, { ignoreSearch: true });
    const net = fetch(req).then(r => { if (r.ok || r.type === 'opaque') c.put(req, r.clone()); return r; });
    if (hit) { e.waitUntil(net.catch(() => {})); return hit; }
    return net.catch(() => req.mode === 'navigate' ? c.match('./') : Response.error());
  }));
});
