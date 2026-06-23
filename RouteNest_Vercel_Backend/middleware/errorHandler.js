
function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  const message = err.message || "Internal server error";

  console.error(`[ERROR] ${status} — ${message}`);
  if (status === 500) console.error(err.stack);

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack })
  });
}

module.exports = errorHandler;
