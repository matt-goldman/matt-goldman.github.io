// One-time cleanup service worker
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', async () => {
  try {
    // Purge ALL caches
    const keys = await caches.keys();
    await Promise.all(keys.map(k => caches.delete(k)));
  } finally {
    // Take control of any open pages
    await self.clients.claim();

    // Tell pages to unregister+reload themselves
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of clients) {
      client.postMessage({ type: 'FORCE_RELOAD' });
    }
  }
});

// No fetch handler: everything falls through to network (fresh Blake site)
