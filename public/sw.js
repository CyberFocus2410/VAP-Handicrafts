// Service Worker for VAP Handicrafts & Artisan CRM
const CACHE_NAME = "vap-crm-v1";
const OFFLINE_URLS = ["/admin", "/admin/orders", "/icons/icon-192x192.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(OFFLINE_URLS).catch(() => {
        // Non-fatal if offline caching fails during install
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Handle incoming Web Push notifications from server
self.addEventListener("push", (event) => {
  let data = {
    title: "VAP Handicrafts Update",
    body: "You have a new activity in your artisan store.",
    url: "/admin/orders",
    icon: "/icons/icon-192x192.png",
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body || "New order or inquiry received.",
    icon: data.icon || "/icons/icon-192x192.png",
    badge: "/images/brand/logo-128.webp",
    vibrate: [200, 100, 200, 100, 200],
    data: {
      url: data.url || "/admin/orders",
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: "view",
        title: "View Order",
      },
      {
        action: "close",
        title: "Dismiss",
      },
    ],
    tag: data.tag || "vap-admin-order",
    renotify: true,
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Handle notification interaction / click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "close") {
    return;
  }

  const targetUrl = event.notification.data?.url || "/admin/orders";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes("/admin") && "focus" in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});
