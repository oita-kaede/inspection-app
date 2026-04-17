// -----------------------------------------------
// Service Worker - 検査準備物表 PWA
// オフライン対応 + キャッシュ管理
// -----------------------------------------------

var CACHE_NAME = 'inspection-app-v2';
var URLS_TO_CACHE = [
      '/inspection-app/',
      '/inspection-app/index.html',
      '/inspection-app/config.js',
      '/inspection-app/manifest.json',
      '/inspection-app/icons/icon-192.png',
      '/inspection-app/icons/icon-512.png'
  ];

// インストール時にキャッシュ
self.addEventListener('install', function(event) {
      event.waitUntil(
                caches.open(CACHE_NAME).then(function(cache) {
                              return cache.addAll(URLS_TO_CACHE);
                })
            );
      self.skipWaiting();
});

// 古いキャッシュを削除
self.addEventListener('activate', function(event) {
      event.waitUntil(
                caches.keys().then(function(names) {
                              return Promise.all(
                                                names.filter(function(name) {
                                                                      return name !== CACHE_NAME;
                                                }).map(function(name) {
                                                                      return caches.delete(name);
                                                })
                                            );
                })
            );
      self.clients.claim();
});

// ネットワーク優先、失敗時にキャッシュ
self.addEventListener('fetch', function(event) {
      // Supabase APIリクエストはキャッシュしない
                          if (event.request.url.includes('supabase.co')) {
                                    return;
                          }
      event.respondWith(
                fetch(event.request).then(function(response) {
                              var responseClone = response.clone();
                              caches.open(CACHE_NAME).then(function(cache) {
                                                cache.put(event.request, responseClone);
                              });
                              return response;
                }).catch(function() {
                              return caches.match(event.request);
                })
            );
});
