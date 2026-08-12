/* CosmicLove · Firebase Cloud Messaging service worker */

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyCfwmK5b9xK0YAzPFCvGWCNex_N1B-5gII',
  authDomain: 'cosmiclove-ilyes.firebaseapp.com',
  projectId: 'cosmiclove-ilyes',
  storageBucket: 'cosmiclove-ilyes.firebasestorage.app',
  messagingSenderId: '1050605246477',
  appId: '1:1050605246477:web:67e7b8de8342c3e4779d44'
});

const messaging = firebase.messaging();
const APP_ICON_URL = new URL('cosmiclove-icon.svg', self.location.href).toString();

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = new URL(event.notification?.data?.link || './', self.registration.scope).toString();
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of windows) {
      if ('focus' in client) {
        await client.focus();
        if ('navigate' in client && client.url !== targetUrl) await client.navigate(targetUrl);
        return;
      }
    }
    if (self.clients.openWindow) await self.clients.openWindow(targetUrl);
  })());
});

messaging.onBackgroundMessage((payload) => {
  const data = payload?.data || {};
  const title = data.title || payload?.notification?.title || 'CosmicLove';
  const body = data.body || payload?.notification?.body || 'Quelqu’un est dans notre Univers ✨';
  const link = new URL(data.link || './', self.registration.scope).toString();

  return self.registration.showNotification(title, {
    body,
    icon: APP_ICON_URL,
    badge: APP_ICON_URL,
    tag: `cosmiclove-${data.sender || 'presence'}`,
    renotify: true,
    vibrate: [120, 60, 120],
    data: { link }
  });
});
