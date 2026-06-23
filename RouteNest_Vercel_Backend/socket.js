/**
 * Socket.IO server for the Express bundle (paste into backend/socket.js).
 *
 * Wire it up in your server.js:
 *   const http = require("http");
 *   const app = require("./app");
 *   const { attachSocket } = require("./socket");
 *   const server = http.createServer(app);
 *   const { io, pushNotification } = attachSocket(server);
 *   app.set("io", io);
 *   app.set("pushNotification", pushNotification);
 *   server.listen(process.env.PORT || 5000);
 *
 * In any route that creates a notification, call:
 *   req.app.get("pushNotification")(userId, notificationObject);
 */
const { Server } = require("socket.io");
const { getStore } = require("./data/store");

function userRoom(uid) {
  return `user:${uid}`;
}

function unreadCount(uid) {
  const { notificationHistory } = getStore();
  return notificationHistory.filter((n) => n.userId === uid && !n.read).length;
}

function attachSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] },
    // Use /api/* path so a single proxy/ingress that routes /api/* to the API
    // server also covers the WebSocket. Frontend must match this path.
    path: "/api/socket.io",
  });

  io.on("connection", (socket) => {
    const { sessions } = getStore();
    let uid = null;

    // Auto-join on connect if a valid token was supplied in handshake auth
    const initialToken = socket.handshake?.auth?.token;
    if (initialToken && sessions[initialToken]) {
      uid = sessions[initialToken];
      socket.join(userRoom(uid));
    }

    // Manual join after login
    socket.on("join", (payload, ack) => {
      const token = payload?.token;
      if (!token || !sessions[token]) {
        if (typeof ack === "function") ack({ ok: false, error: "invalid token" });
        return;
      }
      const newUid = sessions[token];
      if (uid && uid !== newUid) socket.leave(userRoom(uid));
      uid = newUid;
      socket.join(userRoom(uid));
      if (typeof ack === "function") ack({ ok: true, userId: uid });
    });

    // Manual leave on logout
    socket.on("leave", (_payload, ack) => {
      if (uid) socket.leave(userRoom(uid));
      uid = null;
      if (typeof ack === "function") ack({ ok: true });
    });

    socket.on("disconnect", () => {
      if (uid) socket.leave(userRoom(uid));
      uid = null;
    });
  });

  function pushNotification(userId, notification) {
    io.to(userRoom(userId)).emit("notification:new", notification);
    io.to(userRoom(userId)).emit("notification:unread-count", {
      userId, unreadCount: unreadCount(userId),
    });
  }

  function emitUnreadCount(userId) {
    io.to(userRoom(userId)).emit("notification:unread-count", {
      userId, unreadCount: unreadCount(userId),
    });
  }

  return { io, pushNotification, emitUnreadCount };
}

module.exports = { attachSocket };
