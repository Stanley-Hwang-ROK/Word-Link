// sw.js
const CACHE = 'wordlink-v5'; // ★ 숫자 올리기
const ASSETS = [
  './',
  'index.html',
  'manifest.json',
  'words.txt',
  'icons/icon-192.png',
  'icons/icon-512.png'
];

self.addEventListener('install', e => {
  self.skipWaiting(); // ★ 새 워커 즉시 대기 종료
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  return self.clients.claim(); // ★ 열린 탭 즉시 장악
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached =>
      cached || fetch(e.request).then(resp => {
        if (e.request.method === 'GET' && resp.ok && resp.type === 'basic') {
          const clone = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return resp;
      })
    )
  );
});
