// sw.js  (자동 업데이트 최적화 버전)
const BUILD = 'v6';                   // ← 배포할 때마다 숫자만 올려줘요
const CACHE = `wordlink-${BUILD}`;

const ASSETS = [
  './',
  'index.html',
  `manifest.json?v=${BUILD}`,
  `words.txt?v=${BUILD}`,
  'icons/icon-192.png',
  'icons/icon-512.png'
];

// 새 워커가 설치되면 즉시 대기 해제
self.addEventListener('install', (e) => {
  self.skipWaiting(); // ★ 새 SW 즉시 활성화 준비
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});

// 활성화되면 구캐시 제거 + 열린 탭 장악
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  return self.clients.claim(); // ★ 열린 탭에 바로 적용
});

// 캐시 우선, 없으면 네트워크 → GET만 동적 캐싱
self.addEventListener('fetch', (e) => {
  const req = e.request;
  e.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(resp => {
        if (req.method === 'GET' && resp.ok && resp.type === 'basic') {
          const clone = resp.clone();
          caches.open(CACHE).then(c => c.put(req, clone));
        }
        return resp;
      });
    })
  );
});
