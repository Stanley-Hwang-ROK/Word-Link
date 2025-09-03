// sw.js (업데이트 버전)
const CACHE = 'wordlink-v4'; // ★ 버전 올리기
const ASSETS = [
  './',
  'index.html',
  'manifest.json',
  'words.txt',
  'icons/icon-192.png',
  'icons/icon-512.png'
];

// 새 SW가 바로 활성화되도록
self.addEventListener('install', e => {
  self.skipWaiting(); // ★ 대기 없이 곧바로 대체
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  return self.clients.claim(); // ★ 열린 탭 즉시 제어
});

self.addEventListener('fetch', e => {
  const req = e.request;
  e.respondWith(
    caches.match(req).then(cached => {
      // 캐시 먼저, 없으면 네트워크
      return cached || fetch(req).then(resp => {
        // GET만 캐시, same-origin만
        if (req.method === 'GET' && resp.ok && resp.type === 'basic') {
          const clone = resp.clone();
          caches.open(CACHE).then(c => c.put(req, clone));
        }
        return resp;
      });
    })
  );
});
