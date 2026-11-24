import { translateValue } from "../i18n";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle, RefreshCw, X } from "lucide-react";

function ApiErrorModal({
  title = "Something went wrong",
  message = "Please try again.",
  onRetry,
  onClose,
}) {
  const { t } = useTranslation("ui");
  const primaryButtonRef = useRef(null);
  const closeButtonRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", handleKeyDown);
    (primaryButtonRef.current || closeButtonRef.current)?.focus();

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[10001] flex items-center justify-center bg-[#06424B]/40 p-4 backdrop-blur-[3px]"
      role="presentation"
      onClick={onClose}
    >
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="api-error-title"
        aria-describedby="api-error-message"
        onClick={(event) => event.stopPropagation()}
        className="relative w-full max-w-[420px] overflow-hidden rounded-3xl bg-white text-center shadow-[0_24px_70px_rgba(6,66,75,0.22)]"
      >
        {/* Brand yellow accent bar */}
        <div className="h-1.5 w-full bg-[#FFAB0B]" aria-hidden="true" />

        <button
          type="button"
          onClick={onClose}
          aria-label={translateValue("Close")}
          className="absolute right-3 top-4 flex h-9 w-9 items-center justify-center rounded-xl text-[#8FA3A5] transition hover:bg-[#F1F5F4] hover:text-[#06424B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFAB0B]"
        >
          <X size={18} />
        </button>

        <div className="px-6 pb-7 pt-8 sm:px-8">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF3D8] ring-8 ring-[#FFF9EC]">
            <AlertTriangle size={28} className="text-[#E89A00]" strokeWidth={2.2} />
          </span>

          <h2
            id="api-error-title"
            className="mt-5 text-xl font-extrabold leading-snug text-[#06424B] sm:text-[22px]"
          >
            {t(title)}
          </h2>

          <p
            id="api-error-message"
            className="mx-auto mt-2 max-w-[330px] break-words text-sm leading-6 text-[#5A7478]"
          >
            {t(message)}
          </p>

          <div className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
            {onRetry && (
              <button
                ref={primaryButtonRef}
                type="button"
                onClick={onRetry}
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#FFAB0B] px-6 text-sm font-extrabold text-[#06424B] shadow-[0_8px_18px_rgba(255,171,11,0.28)] transition hover:bg-[#FFC13C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#06424B] focus-visible:ring-offset-2 sm:flex-none"
              >
                <RefreshCw size={15} />
                {t("Try Again")}
              </button>
            )}
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              className="inline-flex h-11 flex-1 items-center justify-center rounded-xl border border-[#DCE6E4] bg-white px-6 text-sm font-bold text-[#06424B] transition hover:bg-[#F4F7F7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#06424B] focus-visible:ring-offset-2 sm:flex-none"
            >
              {t("Close")}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ApiErrorModal;