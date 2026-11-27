
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enUi from "./locales/en/ui.json";
import frUi from "./locales/fr/ui.json";
import { getDynamicTranslation } from "./dynamicTranslationStore";

// Stores the selected language in the browser.
export const LANGUAGE_STORAGE_KEY = "skillnext_language";

// Defines the default and supported application languages.
export const DEFAULT_LANGUAGE = "en";
export const SUPPORTED_LANGUAGES = Object.freeze(["en", "fr"]);

// Converts the language code into a supported format.
// Example: "en-US" becomes "en", and unsupported languages fall back to English.
function normalizeLanguage(language) {
  const code = String(language || DEFAULT_LANGUAGE)
    .trim()
    .toLowerCase()
    .split("-")[0];

  return SUPPORTED_LANGUAGES.includes(code) ? code : DEFAULT_LANGUAGE;
}

// Reads the previously selected language from browser storage.
// Uses English when no saved language is available or storage cannot be accessed.
function readSavedLanguage() {
  if (typeof window === "undefined") return DEFAULT_LANGUAGE;

  try {
    return normalizeLanguage(
      window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
    );
  } catch {
    return DEFAULT_LANGUAGE;
  }
}

// Lets t() resolve API-authored content already translated at runtime.
// Static ui.json translations always take priority over this dynamic cache.
const dynamicApiTextPostProcessor = {
  type: "postProcessor",
  name: "dynamicApiText",
  process(value, key, options = {}) {
    if (typeof key !== "string") return value;

    const language = normalizeLanguage(
      options.lng || i18n.resolvedLanguage || i18n.language || DEFAULT_LANGUAGE
    );

    // Check the requested language's own catalog instead of fallbackLng.
    // This ensures a missing French static key can still resolve a dynamic API
    // translation registered at runtime.
    if (Object.prototype.hasOwnProperty.call(resources[language]?.ui || {}, key)) return value;

    const inputText = typeof options.defaultValue === "string"
      ? options.defaultValue
      : key;

    return getDynamicTranslation(inputText, language) ?? value;
  },
};

// Registers English and French translation resources.
// Each language uses the "ui" namespace for interface translations.
const resources = {
  en: { ui: enUi },
  fr: { ui: frUi },
};

// Initializes the single i18next instance before React renders.
// Prevents the same translation instance from being initialized multiple times.
if (!i18n.isInitialized) {
  i18n.use(dynamicApiTextPostProcessor).use(initReactI18next).init({
    resources,
    lng: readSavedLanguage(),
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: SUPPORTED_LANGUAGES,
    load: "languageOnly",
    ns: ["ui"],
    defaultNS: "ui",
    keySeparator: false,
    nsSeparator: false,
    returnNull: false,
    returnEmptyString: false,
    interpolation: { escapeValue: false },
    postProcess: ["dynamicApiText"],
    react: {
      useSuspense: false,
      bindI18n: "languageChanged loaded",
    },
    debug: false,
  });
}

// Updates the HTML document language.
// Helps browsers and assistive technologies identify the page language.
function syncDocumentLanguage(language) {
  if (typeof document !== "undefined") {
    document.documentElement.lang = normalizeLanguage(language);
  }
}

// Sets the initial HTML language when the application loads.
syncDocumentLanguage(i18n.resolvedLanguage || i18n.language);

// Listens for language changes and synchronizes the document language.
// Also saves the newly selected language for future visits.
i18n.on("languageChanged", (language) => {
  const normalized = normalizeLanguage(language);

  syncDocumentLanguage(normalized);

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, normalized);
    } catch {
      // Keeps the language change active even if browser storage is unavailable.
    }

    // Re-translate API content already loaded in the current page without a reload.
    window.dispatchEvent(
      new CustomEvent("skillnext-language-changed", { detail: { language: normalized } })
    );
  }
});

// Synchronizes the selected language across multiple browser tabs.
// Updates the current tab when another tab changes the saved language.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key !== LANGUAGE_STORAGE_KEY || !event.newValue) return;

    const next = normalizeLanguage(event.newValue);
    const active = normalizeLanguage(
      i18n.resolvedLanguage || i18n.language
    );

    if (next !== active) void i18n.changeLanguage(next);
  });
}

// Changes the application language and returns the normalized language code.
// Can be imported and used by language switchers or other components.
export async function changeAppLanguage(language) {
  const next = normalizeLanguage(language);

  await i18n.changeLanguage(next);
  return next;
}

/**
 * Translates static UI text using the "ui" namespace.
 * Supports strings and arrays of strings.
 * Preserves numbers, booleans, React elements, and other non-string values.
 * Uses the original text as the fallback when a translation is unavailable.
 */
export function translateValue(value, options = {}) {
  if (typeof value === "string") {
    const language = normalizeLanguage(
      options.lng || i18n.resolvedLanguage || i18n.language || DEFAULT_LANGUAGE
    );
    const staticCatalog = resources[language]?.ui || {};

    // Static interface copy has priority. Otherwise, read the exact dynamic
    // API-text cache directly instead of relying only on the i18next
    // post-processor. This covers components that render API fields with t(),
    // translateValue() or getLocalizedValue().
    if (!Object.prototype.hasOwnProperty.call(staticCatalog, value)) {
      const dynamicValue = getDynamicTranslation(value, language);
      if (typeof dynamicValue === "string" && dynamicValue.length > 0) {
        return dynamicValue;
      }
    }

    return i18n.t(value, {
      ns: "ui",
      defaultValue: value,
      ...options,
      lng: language,
    });
  }

  if (Array.isArray(value)) {
    return value.map((item) => translateValue(item, options));
  }

  return value;
}

/**
 * Selects the appropriate language from multilingual API content.
 * Supports backend values such as { en: "Hair Styling", fr: "Coiffure" }.
 * Falls back to English or the default language when the selected translation is unavailable.
 */
export function getLocalizedValue(
  value,
  language = i18n.resolvedLanguage || i18n.language || DEFAULT_LANGUAGE
) {
  const normalized = normalizeLanguage(language);

  if (value && typeof value === "object" && !Array.isArray(value)) {
    const selected =
      value[normalized] ?? value.en ?? value[DEFAULT_LANGUAGE];

    return typeof selected === "string"
      ? translateValue(selected, { lng: normalized })
      : selected ?? "";
  }

  return value == null ? "" : translateValue(String(value), { lng: normalized });
}

// Exports the initialized i18next instance for use throughout the application.
export default i18n;
