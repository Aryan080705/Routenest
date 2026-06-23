JS
/* public/sw.js — Service Worker for Web Push notifications */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
 
self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch { data = { title: "RouteNest", body: event.data?.text() || "New notification" }; }
  const title = data.title || "RouteNest";
  const options = {
    body: data.body || "",
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    tag: data.type || "general",
    data: { url: data.url || "/" },
    actions: [{ action: "view", title: "View" }],
  };
  event.waitUntil(self.registration.showNotification(title, options));
});
 
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      const existing = clients.find((c) => c.url.includes(url));
      if (existing) return existing.focus();
      return self.clients.openWindow(url);
    })
  );
});
 