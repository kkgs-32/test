const CACHE_NAME = 'kkgs-32-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/404.html',
    '/index.js',
    '/app/manifest.json',
    '/app/apple-touch-icon.png',
    '/app/favicon-96x96.png',
    '/app/favicon.ico',
    '/app/favicon.svg',
    'https://cdn.jsdelivr.net/npm/bulma@1.0.2/css/bulma.min.css' // 外部リソースもキャッシュ
];

// インストールイベント
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(urlsToCache);
            })
    );
});

// フェッチイベント
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse; // キャッシュがあればそれを返す
                }
                return fetch(event.request); // キャッシュがなければネットワークから取得
            })
    );
});

// アクティベートイベント
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        return caches.delete(cacheName); // 古いキャッシュを削除
                    }
                })
            );
        })
    );
});