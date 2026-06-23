const express = require("express");
const path = require("path");

/* ── Middleware ─────────────────────────────────────────── */
const corsMiddleware = require("./middleware/cors");
const requestLogger = require("./middleware/requestLogger");
const errorHandler = require("./middleware/errorHandler");

/* ── Route modules ─────────────────────────────────────── */
const communityRoutes = require("./routes/community");
const forumRoutes = require("./routes/forums");
const profileRoutes = require("./routes/profiles");
const moderationRoutes = require("./routes/moderation");
const notificationRoutes = require("./routes/notifications");
const reviewRoutes = require("./routes/reviews");
const preferencesRoutes = require("./routes/preferences");
const plannerRoutes = require("./routes/planner");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");

/* ── App setup ─────────────────────────────────────────── */
const app = express();

// Global middleware
app.use(corsMiddleware);
app.use(express.json({ limit: "1mb" }));
app.use(requestLogger);

// API routes
app.use("/api/community", communityRoutes);
app.use("/api/posts", communityRoutes);
app.use("/api/forums", forumRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/moderation", moderationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/preferences", preferencesRoutes);
app.use("/api/planner", plannerRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    message: "RouteNest Backend Running"
  });
});

// Serve frontend static files
const frontendDir = path.join(__dirname, "..", "frontend", "build");
app.use(express.static(frontendDir));

// SPA fallback — send index.html for unmatched routes
app.get("*", (_req, res) => {
  res.sendFile(path.join(frontendDir, "index.html"));
});

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;
