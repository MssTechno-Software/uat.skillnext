import { useTranslation } from "react-i18next";
import { ExternalLink, RotateCcw, ScreenShare } from "lucide-react";
import { useAccessibility } from "../../accessibility/AccessibilityContext";

function Choice({ id, name, value, checked, onChange, children }) {
  return (
    <label
      htmlFor={id}
      className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-[#DCE7E5] bg-white px-3 py-2.5 text-sm font-medium text-[#294B50] transition-colors hover:border-[#8CA9A7] focus-within:ring-2 focus-within:ring-[#06424B] focus-within:ring-offset-2"
    >
      <input
        id={id}
        name={name}
        type="radio"
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="h-4 w-4 accent-[#06424B]"
      />
      <span>{children}</span>
    </label>
  );
}

function PreferenceToggle({ id, checked, onChange, title, description }) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-[#E1EAE8] bg-white px-4 py-3.5 transition-colors hover:border-[#B8CCCA]"
    >
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-[#244951]">{title}</span>
        <span className="mt-0.5 block text-xs leading-5 text-[#6C8589]">
          {description}
        </span>
      </span>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-[#06424B]"
      />
    </label>
  );
}

export default function AccessibilitySettings() {
  const { t } = useTranslation("ui");
  const { preferences, updatePreference, resetPreferences } = useAccessibility();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-bold text-[#244951]">{t("Display preferences")}</h3>
        <p className="mt-1 text-xs leading-5 text-[#6C8589]">
          {t("Choose display options that make Skill Next easier to use. These preferences apply across the website and are saved on this device.")}
        </p>
      </div>

      <fieldset className="space-y-3">
        <legend className="mb-2 text-sm font-semibold text-[#294B50]">
          {t("Contrast")}
        </legend>
        <div className="grid gap-2 sm:grid-cols-3">
          <Choice
            id="a11y-contrast-normal"
            name="a11y-contrast"
            value="normal"
            checked={preferences.contrast === "normal"}
            onChange={(value) => updatePreference("contrast", value)}
          >
            {t("Default")}
          </Choice>
          <Choice
            id="a11y-contrast-high"
            name="a11y-contrast"
            value="high"
            checked={preferences.contrast === "high"}
            onChange={(value) => updatePreference("contrast", value)}
          >
            {t("High contrast")}
          </Choice>
          <Choice
            id="a11y-contrast-dark"
            name="a11y-contrast"
            value="dark"
            checked={preferences.contrast === "dark"}
            onChange={(value) => updatePreference("contrast", value)}
          >
            {t("Dark contrast")}
          </Choice>
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="mb-2 text-sm font-semibold text-[#294B50]">
          {t("Text size")}
        </legend>
        <div className="grid gap-2 sm:grid-cols-3">
          <Choice
            id="a11y-font-normal"
            name="a11y-font-size"
            value="normal"
            checked={preferences.fontSize === "normal"}
            onChange={(value) => updatePreference("fontSize", value)}
          >
            {t("Default size")}
          </Choice>
          <Choice
            id="a11y-font-large"
            name="a11y-font-size"
            value="large"
            checked={preferences.fontSize === "large"}
            onChange={(value) => updatePreference("fontSize", value)}
          >
            {t("Large")}
          </Choice>
          <Choice
            id="a11y-font-larger"
            name="a11y-font-size"
            value="larger"
            checked={preferences.fontSize === "larger"}
            onChange={(value) => updatePreference("fontSize", value)}
          >
            {t("Extra large")}
          </Choice>
        </div>
      </fieldset>

      <div className="space-y-3">
        <PreferenceToggle
          id="a11y-underline-links"
          checked={preferences.underlineLinks}
          onChange={(value) => updatePreference("underlineLinks", value)}
          title={t("Always underline links")}
          description={t("Show an underline on text links so they are easier to identify.")}
        />
        <PreferenceToggle
          id="a11y-enhanced-focus"
          checked={preferences.enhancedFocus}
          onChange={(value) => updatePreference("enhancedFocus", value)}
          title={t("Enhanced keyboard focus")}
          description={t("Make the currently focused link, button or field easier to see when using a keyboard.")}
        />
      </div>

      <div className="rounded-2xl border border-[#DCE8E6] bg-[#F5F9F8] p-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#06424B]">
            <ScreenShare size={18} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-[#244951]">
              {t("Screen reader support")}
            </h3>
            <p className="mt-1 text-xs leading-5 text-[#5D777A]">
              {t("Skill Next is designed to work with screen readers such as NVDA. NVDA is a Windows application and must be installed and started separately.")}
            </p>
            <p className="mt-2 text-xs leading-5 text-[#5D777A]">
              {t("Keyboard navigation: use Tab and Shift plus Tab to move between controls. In NVDA browse mode, press H to move through headings and B to move through buttons.")}
            </p>
            <a
              href="https://www.nvaccess.org/download/"
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-[#06424B] underline decoration-[#FFAB0B] decoration-2 underline-offset-4 hover:text-[#0A6570] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#06424B]"
            >
              {t("Get NVDA for Windows")}
              <ExternalLink size={13} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E8EFED] pt-4">
        <p className="text-xs text-[#718486]">
          {t("Your accessibility preferences are saved automatically.")}
        </p>
        <button
          type="button"
          onClick={resetPreferences}
          className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#CBDAD7] bg-white px-4 text-xs font-bold text-[#244951] transition-colors hover:bg-[#F2F7F6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#06424B]"
        >
          <RotateCcw size={14} aria-hidden="true" />
          {t("Reset accessibility settings")}
        </button>
      </div>
    </div>
  );
}
