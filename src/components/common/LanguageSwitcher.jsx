import { useState, useRef, useEffect } from "react";
import { changeAppLanguage } from "../../i18n";
import { Languages, ChevronDown, Check } from "lucide-react";
import { useTranslation } from "react-i18next";

const languages = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
];

export default function LanguageSwitcher({
  variant = "sidebar",
  compact = false,
}) {
  const { i18n, t } = useTranslation("ui");
  const [open, setOpen] = useState(false);
  const [isChangingLanguage, setIsChangingLanguage] = useState(false);
  const [pendingLanguage, setPendingLanguage] = useState(null);
  const wrapperRef = useRef(null);

  const language = (
    i18n.resolvedLanguage ||
    i18n.language ||
    "en"
  ).split("-")[0];

  const selected =
    languages.find((item) => item.code === language) ||
    languages[0];

  const isFloating = variant === "floating";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const selectLanguage = async (code) => {
    setOpen(false);

    if (code === language || isChangingLanguage) return;

    setPendingLanguage(code);
    setIsChangingLanguage(true);

    try {
      // Activate the selected language immediately.
      // API content translations are prepared in the background by
      // the existing skillnext-language-changed listener in apiContentTranslation.js.
      await changeAppLanguage(code);
    } catch (error) {
      console.error("Could not change the application language.", error);
    } finally {
      setIsChangingLanguage(false);
      setPendingLanguage(null);
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div
        className={[
          "flex items-center gap-2 rounded-lg border px-2 py-1.5",
          "transition-colors duration-200",
          isFloating
            ? "border-[#DCE7E5] bg-white shadow-sm"
            : "border-[#DCE7E5] bg-white",
        ].join(" ")}
      >
        {!compact && (
          <Languages
            size={15}
            className="shrink-0 text-[#06424B]"
          />
        )}

        {!compact && (
          <span className="min-w-0 flex-1 truncate text-[11px] font-semibold text-[#06424B]">
            {t("Language")}
          </span>
        )}

        <button
          type="button"
          disabled={isChangingLanguage}
          onClick={() => setOpen((prev) => !prev)}
          aria-label={t("Change language")}
          aria-expanded={open}
          aria-haspopup="listbox"
          className={[
            "flex min-w-0 items-center gap-1.5 rounded-md",
            "px-1.5 py-1 text-[11px] font-bold",
            "text-[#06424B] hover:bg-[#EEF3F4]",
            "focus:outline-none focus:ring-2 focus:ring-[#FFAB0B]/50",
            compact ? "flex-1 justify-center" : "",
          ].join(" ")}
        >
          <span>{selected.flag}</span>

          <span className="whitespace-nowrap text-[#06424B]">
            {selected.code.toUpperCase()}
          </span>

          <ChevronDown
            size={13}
            className={[
              "shrink-0 text-[#06424B] transition-transform",
              open ? "rotate-180" : "",
            ].join(" ")}
          />
        </button>
      </div>

      {open && (
        <div
          role="listbox"
          aria-label={t("Choose language")}
          className={[
            "absolute right-0 top-full z-50 mt-1.5",
            "min-w-[145px] rounded-lg border border-[#DCE7E5]",
            "bg-white p-1 shadow-lg",
          ].join(" ")}
        >
          {languages.map((item) => {
            const active = language === item.code;

            return (
              <button
                key={item.code}
                type="button"
                role="option"
                disabled={isChangingLanguage}
                aria-selected={active}
                onClick={() => selectLanguage(item.code)}
                className={[
                  "flex w-full items-center justify-between",
                  "rounded-md px-2.5 py-2 text-left",
                  "text-[12px] font-semibold transition-colors",
                  active
                    ? "bg-[#06424B] text-white"
                    : "bg-white text-[#06424B] hover:bg-[#EEF3F4]",
                ].join(" ")}
              >
                <span className="flex items-center gap-2">
                  <span>{item.flag}</span>
                  <span>{item.label}</span>
                </span>

                {active && (
                  <Check
                    size={13}
                    className="text-[#FFAB0B]"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}

      {isChangingLanguage && (
        <div
          className="fixed inset-0 z-[11000] flex items-center justify-center bg-[#F4F7F7]/95 p-6 backdrop-blur-sm"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <div className="flex w-full max-w-sm flex-col items-center rounded-2xl border border-[#DCE7E5] bg-white px-7 py-8 text-center shadow-xl">
            <span className="h-9 w-9 animate-spin rounded-full border-[3px] border-[#DCE7E5] border-t-[#06424B]" />
            <p className="mt-4 text-sm font-bold text-[#06424B]">
              {pendingLanguage === "fr"
                ? "Switching to French…"
                : "Switching language…"}
            </p>
            <p className="mt-2 text-xs leading-5 text-[#718486]">
              Please wait while the page updates.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
