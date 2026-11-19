import { Bell, Search } from "lucide-react";
import { getUserRole } from "../../services/authSession";
import StudentProfileMenu from "./StudentProfileMenu";

function StudentPageHeader({ title, subtitle, actions }) {
  const userRole = String(getUserRole() || "student").trim().toLowerCase();
  const roleLabel = userRole.charAt(0).toUpperCase() + userRole.slice(1);

  return (
    <header className="relative z-40 mb-5 flex w-full items-start justify-between gap-3 sm:mb-6 sm:gap-4">
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-[9px] font-bold tracking-[1.15px] text-[#B07A06] sm:text-[11px] sm:tracking-[1.4px]">
          {roleLabel.toUpperCase()} WORKSPACE
        </p>

        <h1 className="mt-1 break-words text-xl font-extrabold leading-tight tracking-[-0.4px] text-[#06424B] sm:text-2xl lg:text-[28px] lg:tracking-[-0.5px]">
          {title}
        </h1>

        {subtitle && (
          <p className="mt-1 max-w-2xl text-xs leading-5 text-[#5A7478] sm:text-sm">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {/* Search remains desktop-only to keep the mobile header uncluttered. */}
        <label className="relative hidden lg:block">
          <span className="sr-only">Search learning</span>
          <Search
            size={17}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6C8589]"
          />
          <input
            type="search"
            placeholder="Search learning..."
            className="h-11 w-[240px] rounded-xl border border-[#D5E4E2] bg-white pl-10 pr-3 text-sm text-[#2F4A4E] shadow-sm outline-none placeholder:text-[#8AA0A3] focus:border-[#06424B] focus:ring-4 focus:ring-[#FFAB0B]/25"
          />
        </label>

        {/* Notifications remain desktop-only. */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative hidden h-11 w-11 items-center justify-center rounded-xl border border-[#D5E4E2] bg-white text-[#06424B] shadow-sm transition-colors hover:bg-[#FFF4D6] lg:flex"
        >
          <Bell size={18} />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-[#FFAB0B] ring-2 ring-white" />
        </button>

        <div className="hidden h-10 w-px bg-[#D5E4E2] lg:block" />

        {/* The desktop trigger is hidden on mobile; mobile trigger lives in Sidebar. */}
        <StudentProfileMenu className="hidden lg:block" showProfileErrorDialog />

        {actions}
      </div>
    </header>
  );
}

export default StudentPageHeader;
