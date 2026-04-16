// =============================================
// Service Worker - 検査準備物表 PWA
// オフライン対応 + キャッシュ管理
// =============================================

var CACHE_NAME = 'inspection-app-v1';
var URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/config.js',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
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
  if (event.request.url.includes('supabase')) {
    return;
  }

  event.respondWith(
    fetch(event.request).then(function(response) {
      // ネットワーク成功 → キャッシュも更新
      if (response.status === 200) {
        var responseClone = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, responseClone);
        });
      }
      return response;
    }).catch(function() {
      // ネットワーク失敗 → キャッシュから返す
      return caches.match(event.request);
    })
  );
});
