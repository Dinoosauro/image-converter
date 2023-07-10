const cacheName = 'imageconverter-cache';
const filestoCache = [
    `./`,
    `./index.html`,
    `./convert.js`,
    `./heic2any.js`,
    `./manifest.json`,
    `./style.css`,
    `./icon.png`,
    'https://fonts.googleapis.com/css2?family=Montserrat:wght@700&family=Work+Sans&display=swap',
    `https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js`,
    `https://cdn.jsdelivr.net/npm/utif@3.1.0/UTIF.min.js`,
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
    if (req.url.indexOf("updatecode") !== -1) return fetch(req); else event.respondWith(networkFirst(req));
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