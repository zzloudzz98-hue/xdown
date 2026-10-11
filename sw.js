// X 영상 받기 — 백그라운드 받기 도우미 (v16)
// 페이지가 내려가 있어도 휴대폰이 대신 받고, 다 받으면 보관함(cache)에 넣어 둔 뒤 페이지에 알림
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

async function tell() {
  for (const c of await self.clients.matchAll({ includeUncontrolled: true })) c.postMessage('done');
}

self.addEventListener('backgroundfetchsuccess', e => {
  e.waitUntil((async () => {
    const c = await caches.open('xdown');
    const recs = await e.registration.matchAll();
    if (recs.length) await c.put(`done/${e.registration.id}`, await recs[0].responseReady);
    await e.updateUI({ title: '✅ 받기 완료 · 눌러서 저장하기' });
    await tell();
  })());
});

self.addEventListener('backgroundfetchfail', e => {
  e.waitUntil((async () => {
    const c = await caches.open('xdown');
    const why = { 'bad-status': 'X가 막음', 'fetch-error': '연결 끊김', 'quota-exceeded': '휴대폰 저장공간 부족', 'download-total-exceeded': '파일이 너무 큼' }[e.registration.failureReason] || '연결 끊김';
    await c.put(`fail/${e.registration.id}`, new Response(why));
    await e.updateUI({ title: '받기 실패 · 눌러서 다시 시도' });
    await tell();
  })());
});

self.addEventListener('backgroundfetchabort', e => {
  e.waitUntil((async () => {
    const c = await caches.open('xdown');
    await c.put(`fail/${e.registration.id}`, new Response('알림에서 취소함'));
    await tell();
  })());
});

// 알림을 누르면 페이지 열기 (열려 있으면 그 창으로)
self.addEventListener('backgroundfetchclick', e => {
  e.waitUntil((async () => {
    const list = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    if (list.length) return list[0].focus();
    return self.clients.openWindow('./');
  })());
});
