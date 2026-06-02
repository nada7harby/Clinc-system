import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enCommon from "@/locales/en/common.json";
import arCommon from "@/locales/ar/common.json";

const STORAGE_KEY = "cms_lang";
const DEFAULT_LANG = "en";

const resources = {
  en: { translation: enCommon },
  ar: { translation: arCommon },
};

const setDocumentDirection = (lang) => {
  const dir = lang === "ar" ? "rtl" : "ltr";
  document.documentElement.setAttribute("dir", dir);
  document.documentElement.setAttribute("lang", lang);
};

const savedLang = localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;

i18n.use(initReactI18next).init({
  resources,
  lng: savedLang,
  fallbackLng: DEFAULT_LANG,
  interpolation: { escapeValue: false },
});

setDocumentDirection(savedLang);

i18n.on("languageChanged", (lang) => {
  localStorage.setItem(STORAGE_KEY, lang);
  setDocumentDirection(lang);
});

export const languageOptions = [
  { value: "en", label: "EN" },
  { value: "ar", label: "ع" },
];

export default i18n;
