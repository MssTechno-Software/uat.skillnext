import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useLayoutEffect,
} from "react";

const STORAGE_KEY = "skillnext_accessibility_preferences";

export const DEFAULT_ACCESSIBILITY_PREFERENCES = Object.freeze({
  contrast: "normal",
  fontSize: "normal",
  underlineLinks: false,
  enhancedFocus: true,
});

const VALID_VALUES = {
  contrast: ["normal", "high", "dark"],
  fontSize: ["normal", "large", "larger"],
};

const AccessibilityContext = createContext(null);

function normalizePreferences(value) {
  const source = value && typeof value === "object" ? value : {};

  return {
    contrast: VALID_VALUES.contrast.includes(source.contrast)
      ? source.contrast
      : DEFAULT_ACCESSIBILITY_PREFERENCES.contrast,
    fontSize: VALID_VALUES.fontSize.includes(source.fontSize)
      ? source.fontSize
      : DEFAULT_ACCESSIBILITY_PREFERENCES.fontSize,
    underlineLinks: Boolean(source.underlineLinks),
    enhancedFocus: source.enhancedFocus !== false,
  };
}

function readPreferences() {
  if (typeof window === "undefined") return DEFAULT_ACCESSIBILITY_PREFERENCES;

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved
      ? normalizePreferences(JSON.parse(saved))
      : DEFAULT_ACCESSIBILITY_PREFERENCES;
  } catch {
    // Accessibility controls remain usable when browser storage is blocked.
    return DEFAULT_ACCESSIBILITY_PREFERENCES;
  }
}

export function AccessibilityProvider({ children }) {
  const [preferences, setPreferences] = useState(readPreferences);

  useLayoutEffect(() => {
    const root = document.documentElement;

    root.dataset.a11yContrast = preferences.contrast;
    root.dataset.a11yFontSize = preferences.fontSize;
    root.dataset.a11yUnderlineLinks = String(preferences.underlineLinks);
    root.dataset.a11yEnhancedFocus = String(preferences.enhancedFocus);

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch {
      // The current session still uses the selected preferences.
    }
  }, [preferences]);

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key !== STORAGE_KEY) return;

      if (!event.newValue) {
        setPreferences(DEFAULT_ACCESSIBILITY_PREFERENCES);
        return;
      }

      try {
        setPreferences(normalizePreferences(JSON.parse(event.newValue)));
      } catch {
        setPreferences(DEFAULT_ACCESSIBILITY_PREFERENCES);
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const updatePreference = useCallback((key, value) => {
    if (!Object.prototype.hasOwnProperty.call(DEFAULT_ACCESSIBILITY_PREFERENCES, key)) {
      return;
    }

    setPreferences((current) => normalizePreferences({ ...current, [key]: value }));
  }, []);

  const resetPreferences = useCallback(() => {
    setPreferences({ ...DEFAULT_ACCESSIBILITY_PREFERENCES });
  }, []);

  const contextValue = useMemo(
    () => ({ preferences, updatePreference, resetPreferences }),
    [preferences, updatePreference, resetPreferences]
  );

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);

  if (!context) {
    throw new Error("useAccessibility must be used inside AccessibilityProvider.");
  }

  return context;
}
