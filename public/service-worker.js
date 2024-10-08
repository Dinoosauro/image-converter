const cacheName = 'imageconverter-cache';
const filestoCache = [
    './',
    './index.html',
    './icon.png',
    './icon.svg',
    './assets/heic2any.js',
    './assets/index.css',
    './assets/index.js',
    './assets/index2.js',
    './assets/UTIF.js',
    './assets/pdf.js',
    './assets/pdf.worker.js',
    './assets/__vite-browser-external.js',
    'https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;500;700&display=swap'
];
self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(cacheName)
            .then(cache => cache.addAll(filestoCache))
    );
});
self.addEventListener('activate', e => self.clients.claim());
self.addEventListener('fetch', async (event) => {
    const req = event.request;
    if (req.url.indexOf("updatecode") !== -1 || (typeof localStorage !== undefined && req.url.indexOf(localStorage.getItem("ImageConverter-TikTokServer")) !== -1)) event.respondWith(await fetch(req)); else event.respondWith(networkFirst(req));
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
