import { translateValue } from "../../i18n";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  Brain,
  Compass,
  FolderOpen,
  TrendingUp,
  X,
} from "lucide-react";

const shortcuts = [
  {
    label: "Explore",
    title: "Explore Topics",
    text: "Choose a technology and browse its lessons.",
    path: "/student/topics",
    icon: Compass,
    tone: "teal",
  },
  {
    label: "Resources",
    title: "Study Resources",
    text: "Access notes, PDFs and presentations.",
    path: "/student/resources",
    icon: FolderOpen,
    tone: "gold",
  },
  {
    label: "Interview Prep",
    title: "Interview Preparation",
    text: "Practice interview answers and self-introduction.",
    path: "/student/ai-practice",
    icon: Brain,
    tone: "teal",
  },
  {
    label: "My Analytics",
    title: "My Analytics",
    text: "Track your learning progress and performance.",
    path: "/student/my-analytics",
    icon: TrendingUp,
    tone: "gold",
  },
];

function QuickIcon({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="7.6"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.4"
        strokeWidth="1.5"
      />
      <circle cx="12" cy="12" r="3.3" />
      <circle cx="12" cy="3.6" r="1.9" />
      <circle cx="20.4" cy="12" r="1.9" />
      <circle cx="12" cy="20.4" r="1.9" />
      <circle cx="3.6" cy="12" r="1.9" />
    </svg>
  );
}

function QuickActions() {
  const { i18n: activeI18n } = useTranslation();
  const currentLanguage = String(
    activeI18n.resolvedLanguage || activeI18n.language || "en"
  ).toLowerCase();
  const isFrench = currentLanguage === "fr" || currentLanguage.startsWith("fr-");

  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const hoverBlocked = useRef(false);
  const closeTimer = useRef(null);

  useEffect(() => {
    return () => clearTimeout(closeTimer.current);
  }, []);

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      if (
        rootRef.current &&
        !rootRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const handlePointerEnter = (event) => {
    clearTimeout(closeTimer.current);

    if (event.pointerType !== "mouse" || hoverBlocked.current) {
      return;
    }

    setOpen(true);
  };

  const handlePointerLeave = (event) => {
    if (event.pointerType !== "mouse") return;

    hoverBlocked.current = false;
    clearTimeout(closeTimer.current);

    closeTimer.current = setTimeout(() => {
      setOpen(false);
    }, 250);
  };

  const handleBallClick = () => {
    if (open) {
      setOpen(false);
      hoverBlocked.current = true;
    } else {
      setOpen(true);
    }
  };

  const handleNavigation = () => {
    setOpen(false);
    hoverBlocked.current = true;
  };

  const openNavigationWidth = isFrench
    ? "mr-2 max-w-[320px] sm:max-w-[480px] opacity-100"
    : "mr-2 max-w-[340px] opacity-100";

  return (
    <div
      ref={rootRef}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      className="fixed bottom-20 right-12 z-50 h-0 w-0"
    >
      <div
        className={`absolute -right-9 -top-[30px] flex items-start rounded-[28px] p-2 ring-1 transition-all duration-300 ${
          open
            ? "bg-white shadow-[0_14px_34px_rgba(6,66,75,0.22)] ring-[#D9E8E6]"
            : "bg-transparent ring-transparent"
        }`}
      >
        <nav
          aria-label={translateValue("Quick actions")}
          aria-hidden={!open}
          className={`flex items-start overflow-hidden transition-all duration-300 ease-out ${
            open ? openNavigationWidth : "max-w-0 opacity-0"
          }`}
        >
          {shortcuts.map(
            ({ label, title, text, path, icon: Icon, tone }, index) => (
              <Link
                key={label}
                to={path}
                title={`${translateValue(title)} - ${translateValue(text)}`}
                tabIndex={open ? 0 : -1}
                onClick={handleNavigation}
                style={{
                  transitionDelay: open ? `${index * 50}ms` : "0ms",
                }}
                className={`group flex shrink-0 flex-col items-center gap-1.5 !no-underline transition-all duration-300 focus-visible:outline-none ${
                  isFrench ? "w-[76px] sm:w-[112px]" : "w-[64px] sm:w-[80px]"
                } ${open ? "translate-x-0" : "translate-x-6"}`}
              >
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-full shadow-[0_3px_10px_rgba(6,66,75,0.16)] transition-transform duration-200 group-hover:scale-110 group-focus-visible:ring-2 group-focus-visible:ring-[#FFAB0B] group-focus-visible:ring-offset-2 ${
                    tone === "gold"
                      ? "bg-[#FFAB0B] text-[#06424B]"
                      : "bg-[#06424B] text-[#FFAB0B]"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </span>

                <span
                  className={`flex items-start justify-center text-center text-[10px] font-semibold leading-3 text-[#2F4A4E] transition-colors group-hover:text-[#B27B20] ${
                    isFrench
                      ? "min-h-9 w-full max-w-full whitespace-normal break-words px-1 hyphens-auto"
                      : "min-h-6 sm:whitespace-nowrap"
                  }`}
                >
                  {translateValue(label)}
                </span>
              </Link>
            )
          )}
        </nav>

        <div
          className="h-14 w-14 shrink-0"
          aria-hidden="true"
        />
      </div>

      <div className="absolute left-0 top-0 z-10 -translate-x-1/2 -translate-y-1/2">
        <button
          type="button"
          onClick={handleBallClick}
          aria-expanded={open}
          aria-label={translateValue(open ? "Close quick actions" : "Open quick actions")}
          title={translateValue("Quick actions")}
          className={`flex h-14 w-14 items-center justify-center rounded-full ring-4 ring-white shadow-[0_8px_20px_rgba(6,66,75,0.28)] transition-all duration-300 hover:scale-105 focus-visible:outline-none focus-visible:ring-[#FFD36B] ${
            open
              ? "bg-[#06424B] text-[#FFAB0B]"
              : "bg-[#FFAB0B] text-[#06424B]"
          }`}
        >
          <span
            className={`transition-transform duration-300 ${
              open ? "rotate-90" : "rotate-0"
            }`}
          >
            {open ? (
              <X className="h-6 w-6" />
            ) : (
              <QuickIcon className="h-7 w-7" />
            )}
          </span>
        </button>

        <span
          className={`pointer-events-none absolute left-1/2 top-full mt-1.5 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#06424B] px-2 py-0.5 text-[10px] font-bold text-[#FFD36B] shadow-sm transition-opacity duration-200 ${
            open ? "opacity-0" : "opacity-100"
          }`}
        >
          {translateValue("Quick actions")}
        </span>
      </div>
    </div>
  );
}

export default QuickActions;
