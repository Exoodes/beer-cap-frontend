// UI translations. The language is picked from the switcher in the header,
// remembered on this device, and on a first visit taken from the browser.
import dayjs from "dayjs";
import "dayjs/locale/cs";
import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import cs from "./cs.json";
import en from "./en.json";

export const LANGUAGES = ["en", "cs"] as const;
export type Language = (typeof LANGUAGES)[number];

export const resources = {
  en: { translation: en },
  cs: { translation: cs },
} as const;

/** The language the UI is shown in: "cs" also for a browser set to "cs-CZ". */
export function currentLanguage(): Language {
  return i18n.resolvedLanguage === "cs" ? "cs" : "en";
}

i18n.on("languageChanged", () => {
  const language = currentLanguage();
  // No document when tests run outside a browser.
  if (typeof document !== "undefined") document.documentElement.lang = language;
  // Month names in date pickers and "2 days ago" follow the UI.
  dayjs.locale(language);
});

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    supportedLngs: LANGUAGES,
    nonExplicitSupportedLngs: true,
    fallbackLng: "en",
    // React already escapes what it renders.
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "language",
      caches: ["localStorage"],
    },
  });

export default i18n;
