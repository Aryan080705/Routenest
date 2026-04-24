const cors = require("cors");

/**
 * CORS middleware — allows any origin in development.
 * Tighten `origin` for production deployments.
 */
const corsMiddleware = cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
});

module.exports = corsMiddleware;
