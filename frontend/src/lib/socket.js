/**
 * Socket.IO singleton + small helpers.
 * NOTE: Vercel serverless does NOT support persistent WebSocket connections.
 * Socket is disabled by default to prevent infinite reconnect loops on mobile.
 * Set REACT_APP_ENABLE_SOCKET=true only for non-Vercel deployments.
 */
import { io } from "socket.io-client";

const SOCKET_ENABLED = process.env.REACT_APP_ENABLE_SOCKET === "true";
const baseURL = process.env.REACT_APP_BACKEND_URL || window.location.origin;

let socket = null;

// No-op socket so app code never needs null checks
function createNoopSocket() {
  return { on: () => {}, off: () => {}, once: () => {}, emit: () => {}, connected: false };
}

export function getSocket() {
  if (!SOCKET_ENABLED) return createNoopSocket();
  if (socket) return socket;
  socket = io(baseURL, {
    path: "/api/socket.io",
    transports: ["websocket"],   // websocket only — polling hammers mobile network
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 3,     // give up after 3 tries
    reconnectionDelay: 3000,
    timeout: 5000,
    auth: { token: (typeof localStorage !== "undefined" ? localStorage.getItem("token") : null) },
  });
  if (typeof window !== "undefined") {
    socket.on("connect", () => { window.__SOCKET_OK__ = true; });
    socket.on("disconnect", () => { window.__SOCKET_OK__ = false; });
    socket.on("connect_error", () => {}); // silent
  }
  return socket;
}

export function joinUserRoom(token) {
  if (!SOCKET_ENABLED) return;
  const s = getSocket();
  s.auth = { token };
  const doJoin = () => s.emit("join", { token }, () => {});
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
