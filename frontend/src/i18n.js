/**
 * Backwards-compatible useI18n() wrapper around react-i18next.
 * Keeps the existing API surface (lang, setLang, t, languages) so no
 * component needs to be touched. Also persists the language to the
 * backend when the user is logged in.
 */
import React, { createContext, useContext, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import i18n, { SUPPORTED, LANG_LABELS } from "./i18nConfig";
import { api } from "./lib/api";

const I18nCtx = createContext(null);

function persistToServer(lng) {
  let token = null;
  try { token = localStorage.getItem("token"); } catch {}
  if (!token) return;
  api.patch("/api/auth/me/preferences", { language: lng }).catch(() => {});
}

export function I18nProvider({ children }) {
  const { t, i18n: i18nInstance } = useTranslation();

  const setLang = useCallback((next) => {
    if (!SUPPORTED.includes(next)) return;
    i18nInstance.changeLanguage(next);          // dynamic, no reload
    try { localStorage.setItem("i18nextLng", next); } catch {}
    persistToServer(next);
  }, [i18nInstance]);

  // Apply a server-provided language (called after login / /auth/me).
  useEffect(() => {
    const onServerLang = (e) => {
      const lng = e.detail;
      if (SUPPORTED.includes(lng) && lng !== i18nInstance.language) {
        i18nInstance.changeLanguage(lng);
        try { localStorage.setItem("i18nextLng", lng); } catch {}
      }
    };
    window.addEventListener("languagefromserver", onServerLang);
    return () => window.removeEventListener("languagefromserver", onServerLang);
  }, [i18nInstance]);

  const value = {
    lang: i18nInstance.language?.split("-")[0] || "en",
    setLang,
    t,
    languages: SUPPORTED.map((code) => ({ code, label: LANG_LABELS[code] })),
  };

  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>;
}

export const useI18n = () => {
  const ctx = useContext(I18nCtx);
  if (!ctx) throw new Error("useI18n must be inside I18nProvider");
  return ctx;
};

// Re-export i18n instance so anyone importing './i18n' default still works.
export default i18n;
