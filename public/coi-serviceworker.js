if (typeof window === 'undefined') {
  self.addEventListener('install', () => self.skipWaiting());
  self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
} else {
  (async () => {
    if (window.crossOriginIsolated) return;
    
    const swUrl = new URL(location.href);

    swUrl.pathname = '/ivc_koelog/coi-serviceworker.js';
    
    const reg = await navigator.serviceWorker.register(swUrl);
    await navigator.serviceWorker.ready;

    location.reload();
  })();
}
