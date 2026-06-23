/**
 * frontend/src/lib/pushService.js
 * Handles Service Worker registration + Web Push subscription.
 */

const SW_PATH = "/sw.js";

export async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register(SW_PATH);
    console.log("✅ Service Worker registered:", reg.scope);
    return reg;
  } catch (err) {
    console.warn("SW registration failed:", err);
    return null;
  }
}

export async function getVapidPublicKey(api) {
  try {
    const r = await api.get("/api/notifications/vapid-public-key");
    return r.data.publicKey;
  } catch { return null; }
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export async function subscribeToPush(api, userId) {
  try {
    const reg = await registerServiceWorker();
    if (!reg) return { success: false, reason: "SW not supported" };

    const permission = await Notification.requestPermission();
    if (permission !== "granted") return { success: false, reason: "Permission denied" };

    const vapidKey = await getVapidPublicKey(api);

    let subscription;
    if (vapidKey) {
      // Real VAPID push
      subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });
      await api.post("/api/notifications/push-subscribe", { userId, subscription });
      return { success: true, type: "vapid", subscription };
    } else {
      // Fallback: browser Notification API only
      return { success: true, type: "browser-only", subscription: null };
    }
  } catch (err) {
    console.warn("Push subscribe error:", err);
    return { success: false, reason: err.message };
  }
}

export async function showBrowserNotification(title, body, options = {}) {
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  const reg = await navigator.serviceWorker?.ready;
  if (reg) {
    // Show via service worker (persists even when tab is in background)
    await reg.showNotification(title, {
      body,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      tag: options.tag || "routenest",
      ...options,
    });
  } else {
    new Notification(title, { body, icon: "/favicon.ico", ...options });
  }
}