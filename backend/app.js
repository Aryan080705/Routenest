const express = require("express");
const path = require("path");

/* ── Middleware ─────────────────────────────────────────── */
const corsMiddleware = require("./middleware/cors");
const requestLogger = require("./middleware/requestLogger");
const errorHandler = require("./middleware/errorHandler");

/* ── Route modules ─────────────────────────────────────── */
const communityRoutes = require("./routes/community");
const notificationRoutes = require("./routes/notifications");
const reviewRoutes = require("./routes/reviews");

/* ── App setup ─────────────────────────────────────────── */
const app = express();

// Global middleware
app.use(corsMiddleware);
app.use(express.json({ limit: "1mb" }));
app.use(requestLogger);

// API routes
app.use("/api/community", communityRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reviews", reviewRoutes);

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// Serve frontend static files
const frontendDir = path.join(__dirname, "..", "frontend");
app.use(express.static(frontendDir));

// SPA fallback — send index.html for unmatched routes
app.get("/{*splat}", (_req, res) => {
  res.sendFile(path.join(frontendDir, "index.html"));
});

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;
