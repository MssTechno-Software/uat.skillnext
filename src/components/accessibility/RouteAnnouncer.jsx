import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

/** Announces route changes to screen readers without moving keyboard focus. */
export default function RouteAnnouncer() {
  const location = useLocation();
  const { t } = useTranslation("ui");
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    let frameId;

    frameId = window.requestAnimationFrame(() => {
      const heading = document.querySelector("#main-content h1, #main-content h2");
      const pageName = heading?.textContent?.trim() || document.title || "Page";
      setAnnouncement(`${pageName}. ${t("Page loaded")}`);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [location.pathname, t]);

  return (
    <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
      {announcement}
    </div>
  );
}
