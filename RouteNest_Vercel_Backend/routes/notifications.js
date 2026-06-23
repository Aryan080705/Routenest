/**
 * Notification routes — Socket.IO + Email simulation + Web Push (VAPID).
 */
const express = require("express");
const router = express.Router();
const { getStore, nextId } = require("../data/store");

function emit(req, userId, notif) {
  const push = req.app.get("pushNotification");
  if (push) push(userId, notif);
}
function emitUnread(req, userId) {
  const fn = req.app.get("emitUnreadCount");
  if (fn) fn(userId);
}

// ── Email simulation (logs to console + stores in deliveryLogs) ──
function simulateEmail(store, userId, notification) {
  const user = (store.users || []).find((u) => u.id === userId);
  const email = user?.email || `user-${userId}@routenest.app`;
  const logEntry = {
    id: nextId(store.deliveryLogs),
    notificationId: notification.id,
    userId,
    channel: "email",
    status: "delivered",
    sentAt: new Date().toISOString(),
    deliveredAt: new Date().toISOString(),
    failureReason: null,
    retryCount: 0,
    meta: { to: email, subject: notification.title },
  };
  store.deliveryLogs.push(logEntry);
  console.log(`📧 EMAIL SENT → ${email} | Subject: "${notification.title}" | Body: "${notification.body.slice(0, 60)}..."`);
  return logEntry;
}

// ── Web Push via VAPID (real push to subscribed browsers) ──
async function sendWebPush(store, userId, notification) {
  const subscriptions = (store.pushSubscriptions || []).filter((s) => s.userId === userId);
  if (!subscriptions.length) return;

  let webpush;
  try { webpush = require("web-push"); } catch { return; } // graceful if not installed

  const vapidPublic  = process.env.VAPID_PUBLIC_KEY  || store.vapidKeys?.publicKey;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY || store.vapidKeys?.privateKey;
  const vapidEmail   = process.env.VAPID_EMAIL        || "mailto:admin@routenest.app";

  if (!vapidPublic || !vapidPrivate) return;

  webpush.setVapidDetails(vapidEmail, vapidPublic, vapidPrivate);

  const payload = JSON.stringify({
    title: notification.title,
    body: notification.body,
    type: notification.type,
    url: "/notifications",
  });

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(sub.subscription, payload);
      store.deliveryLogs.push({
        id: nextId(store.deliveryLogs),
        notificationId: notification.id,
        userId,
        channel: "webpush",
        status: "delivered",
        sentAt: new Date().toISOString(),
        deliveredAt: new Date().toISOString(),
        failureReason: null,
        retryCount: 0,
      });
      console.log(`🔔 WEB PUSH SENT → userId:${userId}`);
    } catch (err) {
      // Remove stale subscription
      if (err.statusCode === 410) {
        store.pushSubscriptions = store.pushSubscriptions.filter((s) => s.id !== sub.id);
      }
      store.deliveryLogs.push({
        id: nextId(store.deliveryLogs),
        notificationId: notification.id,
        userId,
        channel: "webpush",
        status: "failed",
        sentAt: new Date().toISOString(),
        deliveredAt: null,
        failureReason: err.message,
        retryCount: 0,
      });
    }
  }
}

// ─────────────────────────────────────────────
// VAPID keys endpoint (frontend needs public key)
// ─────────────────────────────────────────────
router.get("/vapid-public-key", (req, res) => {
  const store = getStore();
  const key = process.env.VAPID_PUBLIC_KEY || store.vapidKeys?.publicKey || null;
  res.json({ publicKey: key });
});

// ─────────────────────────────────────────────
// Save push subscription from browser
// ─────────────────────────────────────────────
router.post("/push-subscribe", (req, res) => {
  const { userId, subscription } = req.body || {};
  if (!userId || !subscription) return res.status(400).json({ error: "userId and subscription required" });
  const store = getStore();
  store.pushSubscriptions = store.pushSubscriptions || [];
  // Remove old subscription for this user+endpoint
  store.pushSubscriptions = store.pushSubscriptions.filter(
    (s) => !(s.userId === parseInt(userId) && s.subscription.endpoint === subscription.endpoint)
  );
  store.pushSubscriptions.push({
    id: nextId(store.pushSubscriptions),
    userId: parseInt(userId),
    subscription,
    createdAt: new Date().toISOString(),
  });
  console.log(`✅ Push subscription saved for userId:${userId}`);
  res.json({ message: "Subscribed successfully" });
});

// ─────────────────────────────────────────────
// Unsubscribe
// ─────────────────────────────────────────────
router.post("/push-unsubscribe", (req, res) => {
  const { userId } = req.body || {};
  const store = getStore();
  store.pushSubscriptions = (store.pushSubscriptions || []).filter((s) => s.userId !== parseInt(userId));
  res.json({ message: "Unsubscribed" });
});

// ─────────────────────────────────────────────
// Standard notification routes
// ─────────────────────────────────────────────

router.get("/", (req, res) => {
  const store = getStore();
  res.json(store.notificationHistory || []);
});

router.get("/preferences/:userId", (req, res) => {
  const store = getStore();
  let p = store.userNotificationPreferences.find((x) => x.userId === parseInt(req.params.userId));
  if (!p) {
    // Auto-create default preferences for new users
    p = {
      id: store.userNotificationPreferences.length > 0
        ? Math.max(...store.userNotificationPreferences.map((x) => x.id)) + 1
        : 1,
      userId: parseInt(req.params.userId),
      email: `user-${req.params.userId}@routenest.app`,
      language: "en",
      channels: { email: true, push: true, sms: false },
      notificationTypes: {
        booking: true,
        cancellation: true,
        scheduleChange: true,
        journeyReminder: true,
        promotional: false,
        offers: false,
      },
      timezone: "Asia/Kolkata",
      quiet_hours_enabled: false,
      quiet_hours_start: "22:00",
      quiet_hours_end: "08:00",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.userNotificationPreferences.push(p);
  }
  res.json(p);
});

router.put("/preferences/:userId", (req, res) => {
  const store = getStore();
  const idx = store.userNotificationPreferences.findIndex((x) => x.userId === parseInt(req.params.userId));
  if (idx === -1) return res.status(404).json({ error: "Preferences not found" });
  store.userNotificationPreferences[idx] = {
    ...store.userNotificationPreferences[idx], ...req.body,
    id: store.userNotificationPreferences[idx].id,
    userId: store.userNotificationPreferences[idx].userId,
    updatedAt: new Date().toISOString(),
  };
  res.json({ message: "Preferences updated", preferences: store.userNotificationPreferences[idx] });
});

router.get("/history/:userId", (req, res) => {
  const { limit = 50, offset = 0, type, unread } = req.query;
  const store = getStore();
  let items = store.notificationHistory.filter((n) => n.userId === parseInt(req.params.userId));
  if (type) items = items.filter((n) => n.type === type);
  if (unread === "true") items = items.filter((n) => !n.read);
  items.sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));
  const paginated = items.slice(parseInt(offset), parseInt(offset) + parseInt(limit));
  res.json({ total: items.length, count: paginated.length, limit: +limit, offset: +offset, notifications: paginated });
});

router.get("/unread-count/:userId", (req, res) => {
  const store = getStore();
  const count = store.notificationHistory.filter((n) => n.userId === parseInt(req.params.userId) && !n.read).length;
  res.json({ userId: parseInt(req.params.userId), unreadCount: count });
});

router.post("/mark-read", (req, res) => {
  const { notificationIds, userId } = req.body || {};
  const store = getStore();
  let marked = 0;
  (notificationIds || []).forEach((id) => {
    const it = store.notificationHistory.find((n) => n.id === parseInt(id) && n.userId === parseInt(userId) && !n.read);
    if (it) { it.read = true; it.readAt = new Date().toISOString(); marked++; }
  });
  emitUnread(req, parseInt(userId));
  res.json({ message: `${marked} marked as read`, markedCount: marked });
});

router.post("/mark-all-read", (req, res) => {
  const { userId } = req.body || {};
  const store = getStore();
  let marked = 0;
  store.notificationHistory.forEach((n) => {
    if (n.userId === parseInt(userId) && !n.read) { n.read = true; n.readAt = new Date().toISOString(); marked++; }
  });
  emitUnread(req, parseInt(userId));
  res.json({ message: `${marked} marked as read`, markedCount: marked });
});

router.post("/send", async (req, res) => {
  const { userId, type, title, body, channels, language = "en", metadata = {} } = req.body || {};
  if (!userId || !type || !title || !body) return res.status(400).json({ error: "Missing required fields" });
  const store = getStore();
  store.deliveryLogs = store.deliveryLogs || [];

  const notification = {
    id: nextId(store.notificationHistory),
    userId: parseInt(userId), type, title, body,
    channels: channels || ["push"], language,
    sentAt: new Date().toISOString(), read: false, readAt: null, metadata,
  };
  store.notificationHistory.push(notification);

  const activeChannels = channels || ["push"];
  const deliveryResults = [];

  // Email simulation
  if (activeChannels.includes("email")) {
    const log = simulateEmail(store, parseInt(userId), notification);
    deliveryResults.push({ channel: "email", status: "delivered", logId: log.id });
  }

  // Web Push (real)
  if (activeChannels.includes("push") || activeChannels.includes("inApp")) {
    await sendWebPush(store, parseInt(userId), notification);
    // Also add in-app delivery log
    store.deliveryLogs.push({
      id: nextId(store.deliveryLogs),
      notificationId: notification.id,
      userId: parseInt(userId),
      channel: "inApp",
      status: "delivered",
      sentAt: new Date().toISOString(),
      deliveredAt: new Date().toISOString(),
      failureReason: null,
      retryCount: 0,
    });
    deliveryResults.push({ channel: "inApp", status: "delivered" });
  }

  emit(req, notification.userId, notification); // Socket.IO real-time
  res.status(201).json({ message: "Notification sent", notification, delivery: deliveryResults });
});

/* GET /api/notifications/delivery-logs/:userId */
router.get("/delivery-logs/:userId", (req, res) => {
  const store = getStore();
  const logs = (store.deliveryLogs || [])
    .filter((l) => l.userId === parseInt(req.params.userId))
    .sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt))
    .slice(0, 20);
  res.json(logs);
});

/* POST /api/notifications/retry/:id */
router.post("/retry/:id", async (req, res) => {
  const store = getStore();
  const log = (store.deliveryLogs || []).find((l) => l.id === parseInt(req.params.id));
  if (!log) return res.status(404).json({ error: "Log not found" });

  log.retryCount = (log.retryCount || 0) + 1;

  // Re-attempt actual delivery
  const notif = store.notificationHistory.find((n) => n.id === log.notificationId);
  if (notif) {
    if (log.channel === "email") {
      simulateEmail(store, log.userId, notif);
    } else if (log.channel === "webpush") {
      await sendWebPush(store, log.userId, notif);
    }
  }

  log.status = "delivered";
  log.deliveredAt = new Date().toISOString();
  log.failureReason = null;
  res.json({ message: "Retry successful", log });
});

module.exports = router;