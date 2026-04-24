const app = require("./app");

const PORT = process.env.PORT || 4173;

app.listen(PORT, () => {
  console.log();
  console.log("  ╔══════════════════════════════════════════╗");
  console.log("  ║                                          ║");
  console.log(`  ║   🚌  RouteNest API is live!              ║`);
  console.log(`  ║   🌐  http://localhost:${PORT}              ║`);
  console.log("  ║                                          ║");
  console.log("  ╠══════════════════════════════════════════╣");
  console.log("  ║  Endpoints:                              ║");
  console.log("  ║   GET    /api/health                     ║");
  console.log("  ║   GET    /api/community                  ║");
  console.log("  ║   POST   /api/community                  ║");
  console.log("  ║   POST   /api/community/:id/like         ║");
  console.log("  ║   POST   /api/community/:id/comment      ║");
  console.log("  ║   POST   /api/community/:id/report       ║");
  console.log("  ║   DELETE /api/community/:id               ║");
  console.log("  ║   GET    /api/notifications               ║");
  console.log("  ║   GET    /api/notifications/stats         ║");
  console.log("  ║   POST   /api/notifications               ║");
  console.log("  ║   POST   /api/notifications/:id/retry     ║");
  console.log("  ║   GET    /api/reviews                     ║");
  console.log("  ║   GET    /api/reviews/stats               ║");
  console.log("  ║   POST   /api/reviews                     ║");
  console.log("  ║   POST   /api/reviews/:id/helpful         ║");
  console.log("  ║   POST   /api/reviews/:id/report          ║");
  console.log("  ╚══════════════════════════════════════════╝");
  console.log();
});
