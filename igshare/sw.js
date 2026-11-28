// 인스타 저장 공유 페이지 — 설치 조건용 최소 서비스 워커(저장은 하지 않음)
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {});
