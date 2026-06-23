import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { api } from "../lib/api";

const Ctx = createContext(null);

function readInitialTheme() {
  // Synchronous: matches the pre-render <script> in public/index.html
  try {
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || saved === "light") return saved;
  } catch {}
  if (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
  return "light";
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem("theme", theme);
    // notify same-tab listeners (storage event only fires cross-tab)
    window.dispatchEvent(new CustomEvent("themechange", { detail: theme }));
  } catch {}
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(readInitialTheme);
  const hydratedFromServer = useRef(false);

  // Apply immediately on first render so toggles always sync to DOM
  useEffect(() => { applyTheme(theme); }, [theme]);

  // Listen for external theme changes (e.g. after login, AuthContext writes to localStorage)
  useEffect(() => {
    const onChange = (e) => {
      const next = e.detail || (e.key === "theme" ? e.newValue : null);
      if ((next === "dark" || next === "light") && next !== theme) setThemeState(next);
    };
    window.addEventListener("themechange", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("themechange", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, [theme]);

  // After auth boot, prefer backend value if user is logged in
  useEffect(() => {
    let cancelled = false;
    const token = (() => { try { return localStorage.getItem("token"); } catch { return null; } })();
    if (!token) return;
    api.get("/api/auth/me")
      .then((r) => {
        if (cancelled) return;
        const serverTheme = r?.data?.user?.theme;
        if ((serverTheme === "dark" || serverTheme === "light") && serverTheme !== theme) {
          setThemeState(serverTheme);
        }
        hydratedFromServer.current = true;
      })
      .catch(() => { hydratedFromServer.current = true; });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persistToServer = (next) => {
    const token = (() => { try { return localStorage.getItem("token"); } catch { return null; } })();
    if (!token) return;
    api.put("/api/users/me/theme", { theme: next }).catch(() => {});
  };

  const setTheme = (next) => {
    if (next !== "dark" && next !== "light") return;
    setThemeState(next);
    applyTheme(next);
    persistToServer(next);
  };

  const toggle = () => setTheme(theme === "dark" ? "light" : "dark");

  return <Ctx.Provider value={{ theme, setTheme, toggle }}>{children}</Ctx.Provider>;
}

export const useTheme = () => useContext(Ctx);
