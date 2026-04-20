if (typeof window === 'undefined') {
  self.addEventListener('install', () => self.skipWaiting());
  self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
} else {
  (async () => {
    if (window.crossOriginIsolated) return;

    // ★ 修正ここ
    const swUrl = new URL(location.href);

    // ❌ NG
    // swUrl.pathname = '/coi-serviceworker.js';

    // ✅ OK（リポジトリ対応）
    swUrl.pathname = location.pathname.replace(/\/[^/]*$/, '') + '/coi-serviceworker.js';

    const reg = await navigator.serviceWorker.register(swUrl);
    await navigator.serviceWorker.ready;

    location.reload();
  })();
}
