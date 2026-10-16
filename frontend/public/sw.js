self.addEventListener('push', (event) => {
  let message = { title: 'JalDrishti', body: 'There is an update.' };
  try { message = { ...message, ...event.data.json() }; } catch { /* use default */ }
  event.waitUntil(self.registration.showNotification(message.title, {
    body: message.body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: { url: '/' }
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
    const existing = windows.find((client) => 'focus' in client);
    return existing ? existing.focus() : clients.openWindow(event.notification.data?.url || '/');
  }));
});
