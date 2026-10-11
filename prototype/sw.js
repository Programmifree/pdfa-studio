// Programmifree PDF/A Studio — service worker
// Precache completo: l'app funziona totalmente offline dalla seconda visita.
// Aggiornamento automatico: nuova versione -> nuova cache -> vecchia eliminata.

const VERSION = 'v1.0.0';
const CACHE = 'pdfa-studio-' + VERSION;

const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon.svg',
  './icon-512.png',
  './icon-maskable-512.png',
  './gs-worker.js',
  './kura-worker.js',
  './vendor/gs.js',
  './vendor/gs.wasm',
  './vendor/wrapper.js',
  './vendor-kura/package/index.js',
  './vendor-kura/package/engine/kura.js',
  './vendor-kura/package/engine/kura.wasm',
  './lib/PDFA_def.ps',
  './assets/srgb.icc',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  if (e.request.method !== 'GET') return;
  if (url.pathname.endsWith('/__save')) return;

  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then((hit) => {
      if (hit) return hit;
      return fetch(e.request).then((res) => {
        if (res.ok && e.request.destination !== 'document') {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return res;
      });
    })
  );
});
