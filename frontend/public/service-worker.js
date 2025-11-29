self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  self.clients.claim();
});

// Basic offline support (cache index.html and main assets)
self.addEventListener('fetch', event => {
  // You can add custom caching logic here if needed
});

// Handle push notifications
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  const title = data.notification?.title || "NewsXpress";
  const options = {
    body: data.notification?.body || "You have a new notification.",
    icon: "/Logo4.png",
    badge: "/Logo4.png",
    data: data
  };
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const url = event.notification.data?.url || '/';
  const articleId = event.notification.data?.id;
  
  if (event.action === 'save') {
    // Save article: send message to client to handle bookmarking
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        // Try to find an existing window
        for (const client of clientList) {
          if (client.url.includes(self.registration.scope) && 'focus' in client) {
            client.postMessage({
              type: 'SAVE_ARTICLE',
              articleId: articleId,
              url: url
            });
            return client.focus();
          }
        }
        // No window found, open new one
        if (clients.openWindow) {
          return clients.openWindow(url + '?save=true');
        }
      })
    );
  } else {
    // Default action or 'open' action: just open the article
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
    );
  }
});