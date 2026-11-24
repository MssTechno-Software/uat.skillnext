import { useTranslation } from "react-i18next";
import { getLocalizedValue } from "./index";

/** Renders bilingual API content and updates when the selected language changes. */
export default function LocalizedText({ value, as: Component = "span", fallback = "", ...props }) {
  const { i18n } = useTranslation("ui");
  const language = i18n.resolvedLanguage || i18n.language || "en";
  const text = getLocalizedValue(value, language) || fallback;

  return <Component {...props}>{text}</Component>;
}
