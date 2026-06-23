/**
 * Socket.IO singleton + small helpers.
 */
import { io } from "socket.io-client";

const baseURL = process.env.REACT_APP_BACKEND_URL || window.location.origin;

let socket = null;

export function getSocket() {
  if (socket) return socket;
  socket = io(baseURL, {
    path: "/api/socket.io",
    transports: ["polling", "websocket"],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 800,
    auth: { token: (typeof localStorage !== "undefined" ? localStorage.getItem("token") : null) },
  });
  // Diagnostics — show useful state changes
  if (typeof window !== "undefined") {
    socket.on("connect", () => { window.__SOCKET_OK__ = true; console.log("[socket] connected", socket.id); });
    socket.on("disconnect", (r) => { window.__SOCKET_OK__ = false; console.log("[socket] disconnected", r); });
    socket.on("connect_error", (e) => console.warn("[socket] connect_error", e?.message || e));
  }
  return socket;
}

export function joinUserRoom(token) {
  const s = getSocket();
  s.auth = { token };  // make sure new connections (after reconnects) carry the token
  const doJoin = () => s.emit("join", { token }, (ack) => console.log("[socket] joined", ack));
  if (s.connected) doJoin(); else s.once("connect", doJoin);
}

export function leaveUserRoom() {
  if (!socket) return;
  socket.emit("leave", {}, () => {});
  socket.auth = { token: null };
}

export function disconnectSocket() {
  if (!socket) return;
  socket.disconnect();
  socket = null;
}
