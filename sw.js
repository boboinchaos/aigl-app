// Minimal service worker so Android/Chrome treats the launcher as an installable app.
// It caches only the launcher shell; all data still comes live from the Apps Script web app.
var CACHE = 'aigl-cc-v2';
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(['./', 'manifest.webmanifest', 'icons/icon-192.png']); }));
  self.skipWaiting();
});
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', function (e) {
  if (new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(fetch(e.request).catch(function () { return caches.match(e.request); }));
});
