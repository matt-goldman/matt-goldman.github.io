// sw.js — one-time cleanup worker
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', async () => {
  try {
    // Delete ALL caches
    const keys = await caches.keys();
    await Promise.all(keys.map(k => caches.delete(k)));
    // Unregister this SW
    await self.registration.unregister();
  } finally {
    // Take control of open pages
    await self.clients.claim();
    // Tell pages to reload (best effort)
    const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of all) client.navigate(client.url);
  }
});
