/**
 * Server entrypoint for local Node + Socket.IO.
 * Replace your current backend/server.js with this when adopting Socket.IO.
 *
 * Note: Socket.IO requires a long-lived HTTP server; Vercel serverless
 * functions cannot hold WebSocket connections. For Vercel deploy, run
 * Socket.IO on a separate host (e.g. Render/Fly/Railway) and point the
 * frontend's REACT_APP_BACKEND_URL at the WS host, while keeping REST on
 * Vercel — or use a long-running Node host for both.
 */
require("dotenv").config();
const http = require("http");
const app = require("./app");
const { attachSocket } = require("./socket");

const server = http.createServer(app);
const { io, pushNotification, emitUnreadCount } = attachSocket(server);

app.set("io", io);
app.set("pushNotification", pushNotification);
app.set("emitUnreadCount", emitUnreadCount);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\nRouteNest API + Socket.IO live on http://localhost:${PORT}`);
});
