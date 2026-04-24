const express = require("express");
const { getStore, nextId } = require("../data/store");
const { requireFields } = require("../utils/validators");

const router = express.Router();

const VALID_TYPES = ["booking", "cancellation", "schedule", "reminder", "promo"];
const VALID_CHANNELS = ["email", "push"];
const VALID_STATUSES = ["delivered", "retrying", "failed"];

/* ── GET /api/notifications ──────────────────────────────── */
router.get("/", (_req, res) => {
  const { notifications } = getStore();
  res.json(notifications);
});

/* ── GET /api/notifications/stats ────────────────────────── */
router.get("/stats", (_req, res) => {
  const { notifications } = getStore();
  const stats = {
    total: notifications.length,
    delivered: notifications.filter((n) => n.status === "delivered").length,
    retrying: notifications.filter((n) => n.status === "retrying").length,
    failed: notifications.filter((n) => n.status === "failed").length
  };
  res.json(stats);
});

/* ── POST /api/notifications ─────────────────────────────── */
router.post("/", (req, res) => {
  const body = req.body;

  const err = requireFields(body, ["type", "channel", "text"]);
  if (err) return res.status(400).json({ error: err });

  if (!VALID_TYPES.includes(body.type)) {
    return res.status(400).json({
      error: `Invalid type. Must be one of: ${VALID_TYPES.join(", ")}`
    });
  }
  if (!VALID_CHANNELS.includes(body.channel)) {
    return res.status(400).json({
      error: `Invalid channel. Must be one of: ${VALID_CHANNELS.join(", ")}`
    });
  }

  const { notifications } = getStore();

  const notification = {
    id: nextId(notifications),
    type: body.type,
    channel: body.channel,
    status: "delivered",
    text: typeof body.text === "string" ? body.text.trim() : body.text,
    retries: 0,
    createdAt: new Date().toISOString()
  };

  notifications.push(notification);
  res.status(201).json(notification);
});

/* ── POST /api/notifications/:id/retry ───────────────────── */
router.post("/:id/retry", (req, res) => {
  const { notifications } = getStore();
  const notification = notifications.find(
    (n) => n.id === Number(req.params.id)
  );
  if (!notification) {
    return res.status(404).json({ error: "Notification not found." });
  }
  if (notification.status === "delivered") {
    return res
      .status(400)
      .json({ error: "Notification already delivered, no retry needed." });
  }

  notification.retries += 1;
  // Simulate: after 3 retries it either succeeds or fails
  notification.status = notification.retries >= 3 ? "failed" : "retrying";
  res.json(notification);
});

module.exports = router;
