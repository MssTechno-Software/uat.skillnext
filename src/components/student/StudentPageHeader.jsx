
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { translateValue } from "../../i18n";
import { Bell, Search } from "lucide-react";
import { getUserRole } from "../../services/authSession";
import StudentProfileMenu from "./StudentProfileMenu";

function StudentPageHeader({ title, subtitle, actions }) {
  const { t } = useTranslation("ui");
  const navigate = useNavigate();

  const [searchText, setSearchText] = useState("");

  const userRole = String(
    getUserRole() || "student"
  ).trim().toLowerCase();

  const roleLabel =
    userRole.charAt(0).toUpperCase() +
    userRole.slice(1);

  const handleSearch = (e) => {
    e.preventDefault();

    const query = searchText.trim();

    if (!query) return;

    navigate(
      `/student/search?q=${encodeURIComponent(query)}`
    );
  };

  return (
    <header className="relative z-40 mb-5 flex w-full items-start justify-between gap-3 sm:mb-6 sm:gap-4">

      {/* PAGE TITLE */}

      <div className="min-w-0 flex-1 pt-0.5">

        <p className="text-[9px] font-bold tracking-[1.15px] text-[#B07A06] sm:text-[11px] sm:tracking-[1.4px]">
          {translateValue(roleLabel).toUpperCase()}{" "}
          {t("WORKSPACE")}
        </p>

        <h1 className="mt-1 break-words text-xl font-extrabold leading-tight tracking-[-0.4px] text-[#06424B] sm:text-2xl lg:text-[28px] lg:tracking-[-0.5px]">
          {translateValue(title)}
        </h1>

        {subtitle && (
          <p className="mt-1 max-w-2xl text-xs leading-5 text-[#5A7478] sm:text-sm">
            {translateValue(subtitle)}
          </p>
        )}

      </div>

      {/* HEADER ACTIONS */}

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">

        {/* GLOBAL SEARCH */}

        <form
          onSubmit={handleSearch}
          role="search"
          className="relative hidden lg:block"
        >

          <label
            htmlFor="student-global-search"
            className="sr-only"
          >
            {t("Search learning")}
          </label>

          <Search
            size={17}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6C8589]"
          />

          <input
            id="student-global-search"
            type="search"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder={t("Search learning...")}
            autoComplete="off"
            className="h-11 w-[240px] rounded-xl border border-[#D5E4E2] bg-white pl-10 pr-12 text-sm text-[#2F4A4E] shadow-sm outline-none placeholder:text-[#8AA0A3] focus:border-[#06424B] focus:ring-4 focus:ring-[#FFAB0B]/25"
          />

          <button
            type="submit"
            disabled={!searchText.trim()}
            aria-label={t("Search")}
            className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-[#06424B] transition hover:bg-[#EEF3F4] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Search size={16} />
          </button>

        </form>

        {/* NOTIFICATIONS */}

        <button
          type="button"
          aria-label={t("Notifications")}
          className="relative hidden h-11 w-11 items-center justify-center rounded-xl border border-[#D5E4E2] bg-white text-[#06424B] shadow-sm transition-colors hover:bg-[#FFF4D6] lg:flex"
        >
          <Bell size={18} />

          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-[#FFAB0B] ring-2 ring-white" />
        </button>

        <div className="hidden h-10 w-px bg-[#D5E4E2] lg:block" />

        {/* PROFILE */}

        <StudentProfileMenu
          className="hidden lg:block"
          showProfileErrorDialog
        />

        {actions}

      </div>
    </header>
  );
}

export default StudentPageHeader;
