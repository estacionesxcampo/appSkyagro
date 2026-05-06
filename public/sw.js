const CACHE_NAME = 'skyagro-cache-v1';

// Service worker básico para permitir la instalación
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Por ahora, solo pasamos las peticiones.
  // En el futuro se puede implementar cache offline aquí.
  event.respondWith(fetch(event.request));
});
