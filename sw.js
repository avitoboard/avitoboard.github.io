// Service Worker для AvitoBoard: установка PWA + push-уведомления.
const VERSION = "v1";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

// Пустой обработчик fetch — нужен для установки PWA (сеть по умолчанию).
self.addEventListener("fetch", () => {});

// Приём push → показать уведомление.
self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (_e) { data = { body: event.data ? event.data.text() : "" }; }
  const title = data.title || "AvitoBoard";
  const options = {
    body: data.body || "",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    vibrate: [80, 40, 80],
    tag: data.tag || "avitoboard",
    renotify: true,
    data: { url: data.url || "/" },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Клик по уведомлению → открыть/сфокусировать нужную страницу.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if ("focus" in c) { try { c.navigate(url); } catch (_e) { /* ignore */ } return c.focus(); }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
