import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en/translation.json";
import hi from "./locales/hi/translation.json";
import es from "./locales/es/translation.json";

export const SUPPORTED = ["en", "hi", "es"];
export const LANG_LABELS = { en: "English", hi: "हिंदी", es: "Español" };

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      es: { translation: es },
    },
    supportedLngs: SUPPORTED,
    fallbackLng: "en",                   // requirement #8
    nonExplicitSupportedLngs: true,      // map 'hi-IN' → 'hi' etc.
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      lookupLocalStorage: "i18nextLng",
      caches: ["localStorage"],
    },
    returnNull: false,
    react: { useSuspense: false },
  });

// Keep document <html lang> in sync
i18n.on("languageChanged", (lng) => {
  document.documentElement.lang = lng;
});

export default i18n;
