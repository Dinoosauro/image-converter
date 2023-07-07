const cacheName = 'imageconverter-cache';
const filestoCache = [
    `./`,
    `./index.html`,
    `./convert.js`,
    `./heic2any.js`,
    `./manifest.json`,
    `./style.css`,
    'https://fonts.googleapis.com/css2?family=Montserrat:wght@700&family=Work+Sans&display=swap',
    `https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js`,
];
self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(cacheName)
            .then(cache => cache.addAll(filestoCache))
    );
});
self.addEventListener('activate', e => self.clients.claim());
self.addEventListener('fetch', event => {
    const req = event.request;
    event.respondWith(networkFirst(req));
});

async function networkFirst(req) {
    try {
        const networkResponse = await fetch(req);
        const cache = await caches.open('imageconverter-cache');
        await cache.delete(req);
        await cache.put(req, networkResponse.clone());
        return networkResponse;
    } catch (error) {
        const cachedResponse = await caches.match(req);
        return cachedResponse;
    }
}