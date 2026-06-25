import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "../lib/api";
import { joinUserRoom, leaveUserRoom } from "../lib/socket";

function applyServerTheme(user) {
  const t = user && user.theme;
  if (t === "dark" || t === "light") {
    document.documentElement.setAttribute("data-theme", t);
    try { localStorage.setItem("theme", t); } catch {}
    try { window.dispatchEvent(new CustomEvent("themechange", { detail: t })); } catch {}
  }
}

function applyServerLanguage(user) {
  const lng = user && user.language;
  if (lng === "en" || lng === "hi" || lng === "es") {
    try { localStorage.setItem("i18nextLng", lng); } catch {}
    try { window.dispatchEvent(new CustomEvent("languagefromserver", { detail: lng })); } catch {}
  }
}

function applyServerPrefs(user) { applyServerTheme(user); applyServerLanguage(user); }

const Ctx = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) { setLoading(false); return; }
    api.get("/api/auth/me").then(r => { setUser(r.data.user); applyServerPrefs(r.data.user); joinUserRoom(t); }).catch(() => localStorage.removeItem("token")).finally(() => setLoading(false));
  }, []);
  const login = useCallback(async (email, password) => {
    const r = await api.post("/api/auth/login", { email, password });
    localStorage.setItem("token", r.data.token); setUser(r.data.user); applyServerPrefs(r.data.user); joinUserRoom(r.data.token); return r.data.user;
  }, []);
  const register = useCallback(async (name, email, password) => {
    const r = await api.post("/api/auth/register", { name, email, password });
    localStorage.setItem("token", r.data.token); setUser(r.data.user); applyServerPrefs(r.data.user); joinUserRoom(r.data.token); return r.data.user;
  }, []);
  const logout = useCallback(() => { leaveUserRoom(); localStorage.removeItem("token"); setUser(null); }, []);
  const reloadUser = useCallback(async () => {
    const t = localStorage.getItem("token");
    if (!t) return;
    try {
      const r = await api.get("/api/auth/me");
      setUser(r.data.user);
      applyServerPrefs(r.data.user);
    } catch {}
  }, []);
  return <Ctx.Provider value={{ user, loading, login, register, logout, reloadUser }}>{children}</Ctx.Provider>;
}
export const useAuth = () => useContext(Ctx);
