import { useTranslation } from "react-i18next";

export default function SkipToContent() {
  const { t } = useTranslation("ui");

  return (
    <a className="skip-to-content" href="#main-content">
      {t("Skip to main content")}
    </a>
  );
}
