import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import {
  buildI18nResources,
  getAvailableLocales,
  persistLocale,
  resolveInitialLocale,
} from "../locales";
import { DEFAULT_LOCALE } from "../locales/config";

const available = getAvailableLocales();

void i18n.use(initReactI18next).init({
  resources: buildI18nResources(),
  lng: resolveInitialLocale(),
  fallbackLng: available.includes("en") ? "en" : DEFAULT_LOCALE,
  interpolation: { escapeValue: false },
});

i18n.on("languageChanged", (code) => {
  persistLocale(code);
});

export default i18n;
