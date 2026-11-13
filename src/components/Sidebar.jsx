
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Compass,
  FolderOpen,
  Brain,
  ClipboardList,
  TrendingUp,
  Award,
  CalendarDays,
  Settings,
  LifeBuoy,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  X,
} from "lucide-react";

// Update this import path if authSession.js is in another folder.
import { getUserRole, clearAuthSession } from "../services/authSession";

// ============================================
// STUDENT NAVIGATION
// ============================================

const studentNavigation = [
  {
    title: "OVERVIEW",
    items: [
      {
        label: "Dashboard",
        path: "/student/dashboard",
        icon: LayoutDashboard,
        end: true,
      },
    ],
  },
  {
    title: "LEARNING",
    items: [
      {
        label: "My Learning",
        path: "/student/my-learning",
        icon: BookOpen,
      },
      {
        label: "Explore Topics",
        path: "/student/topics",
        icon: Compass,
      },
      {
        label: "Study Resources",
        path: "/student/resources",
        icon: FolderOpen,
      },
    ],
  },
  {
    title: "PRACTICE & ASSESSMENT",
    items: [
      {
        label: "AI Practice",
        path: "/student/ai-practice",
        icon: Brain,
      },
      {
        label: "Quizzes & Assessments",
        path: "/student/quizzes",
        icon: ClipboardList,
      },
    ],
  },
  {
    title: "ACHIEVEMENTS",
    items: [
      {
        label: "My Progress",
        path: "/student/progress",
        icon: TrendingUp,
      },
      {
        label: "Certificates",
        path: "/student/certificates",
        icon: Award,
      },
      {
        label: "Calendar",
        path: "/student/calendar",
        icon: CalendarDays,
      },
    ],
  },
  {
    title: "PREFERENCES",
    items: [
      {
        label: "Settings",
        path: "/student/settings",
        icon: Settings,
      },
    ],
  },
];

// ============================================
// TEACHER NAVIGATION
// ============================================

const teacherNavigation = [
  {
    title: "OVERVIEW",
    items: [
      {
        label: "Dashboard",
        path: "/teacher/dashboard",
        icon: LayoutDashboard,
        end: true,
      },
    ],
  },
];

// ============================================
// COMMON SIDEBAR
// ============================================

function Sidebar({ children }) {
  const navigate = useNavigate();

  const [openSidebar, setOpenSidebar] = useState(true);
  const [mobileSidebar, setMobileSidebar] = useState(false);

  // Get logged-in user's role
  const userRole = (getUserRole() || "").trim().toLowerCase();

  // Select navigation according to role
  const navigationGroups =
    userRole === "teacher"
      ? teacherNavigation
      : studentNavigation;

  const isTeacher = userRole === "teacher";

  const portalTitle = isTeacher
    ? "Teacher Portal"
    : "Student Portal";

  const portalSubtitle = isTeacher
    ? "Teaching Workspace"
    : "Learning Workspace";

  const supportPath = isTeacher
    ? "/teacher/support"
    : "/student/support";

  const handleLogout = () => {
    setMobileSidebar(false);
    clearAuthSession();
    navigate("/login", { replace: true });
  };

  const closeMobileSidebar = () => {
    setMobileSidebar(false);
  };

  return (
    <div className="min-h-dvh bg-[#F4F7F7] font-sans antialiased">

      {/* MOBILE OVERLAY */}
      {mobileSidebar && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={closeMobileSidebar}
          className="
            fixed inset-0 z-40
            bg-[#06424B]/35
            backdrop-blur-[2px]
            lg:hidden
          "
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex h-dvh flex-col
          border-r border-[#DDE2DC]
          bg-[#F0F1EC]
          transition-all duration-300 ease-in-out
          w-[min(270px,88vw)]
          ${mobileSidebar ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
          ${openSidebar ? "lg:w-[270px]" : "lg:w-[82px]"}
        `}
      >

        {/* BRAND HEADER */}
        <div
          className={`
            relative flex h-[100px] shrink-0
            items-center gap-3
            border-b border-[#DDE2DC]
            bg-[#F0F1EC]
            px-6
            ${openSidebar ? "justify-start" : "lg:justify-center"}
          `}
        >
          {/* ORIGINAL LOGO */}
          <img
            src="/logo.png"
            alt="Skill Next Consulting Inc."
            className={`
              shrink-0 object-contain
              transition-all duration-300
              ${
                openSidebar
                  ? "h-[48px] w-[64px]"
                  : "h-[43px] w-[43px]"
              }
            `}
          />

          {/* PORTAL DETAILS */}
          {openSidebar && (
            <div className="
              min-w-0 border-l border-[#D5DCD5]
              pl-3.5
            ">
              <p className="
                whitespace-nowrap
                text-[13px] font-semibold
                tracking-[-0.2px]
                text-[#243746]
              ">
                {portalTitle}
              </p>

              <p className="
                mt-1 whitespace-nowrap
                text-[11px] font-normal
                text-[#77858A]
              ">
                {portalSubtitle}
              </p>
            </div>
          )}

          {/* DESKTOP COLLAPSE */}
          <button
            type="button"
            onClick={() => setOpenSidebar(!openSidebar)}
            aria-label={
              openSidebar ? "Collapse sidebar" : "Expand sidebar"
            }
            className="
              absolute -right-4 top-[31px] z-50
              hidden h-[32px] w-[32px]
              items-center justify-center
              rounded-full
              border border-[#D9E0DA]
              bg-white
              text-[#243746]
              shadow-sm
              transition-all duration-200
              hover:border-[#C69B62]
              hover:bg-[#F7F5EF]
              lg:flex
            "
          >
            {openSidebar ? (
              <ChevronLeft size={17} />
            ) : (
              <ChevronRight size={17} />
            )}
          </button>

          {/* MOBILE CLOSE */}
          <button
            type="button"
            onClick={closeMobileSidebar}
            aria-label="Close sidebar"
            className="
              ml-auto rounded-lg p-2
              text-[#607A7E]
              transition-colors
              hover:bg-[#E5E9E2]
              lg:hidden
            "
          >
            <X size={19} />
          </button>
        </div>

        {/* NAVIGATION */}
        <nav
          className="
            flex-1 overflow-y-auto
            px-[22px]
            pb-6 pt-[25px]
          "
        >
          {navigationGroups.map((group) => (
            <div
              key={group.title}
              className="mb-[25px]"
            >

              {/* SECTION HEADING */}
              {openSidebar && (
                <div className="mb-[13px] px-[13px]">
                  <p className="
                    whitespace-nowrap
                    text-[11px]
                    font-bold
                    tracking-[1.15px]
                    text-[#8A795E]
                  ">
                    {group.title}
                  </p>
                </div>
              )}

              {/* MENU ITEMS */}
              <div className="space-y-[6px]">
                {group.items.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.end || false}
                      onClick={closeMobileSidebar}
                      title={!openSidebar ? item.label : undefined}
                      style={({ isActive }) => ({
                        color: isActive ? "#FFFFFF" : "#435C64",
                      })}
                      className={({ isActive }) => `
                        group relative
                        flex min-h-[52px]
                        items-center gap-[15px]
                        rounded-[14px]
                        px-[17px] py-3
                        text-[13px]
                        transition-all duration-200
                        ${
                          !openSidebar
                            ? "lg:justify-center lg:px-0"
                            : ""
                        }
                        ${
                          isActive
                            ? `
                              bg-[#243746]
                              font-semibold
                              text-white
                              shadow-[0_9px_22px_rgba(36,55,70,0.14)]
                            `
                            : `
                              font-medium
                              text-[#435C64]
                              hover:bg-[#E5E9E2]
                              hover:text-[#243746]
                            `
                        }
                      `}
                    >
                      {({ isActive }) => (
                        <>
                          {/* MENU ICON */}
                          <Icon
                            size={21}
                            strokeWidth={1.8}
                            style={{
                              color: isActive ? "#E3BD7A" : "#607A7E",
                            }}
                            className="shrink-0 transition-colors"
                          />

                          {/* MENU LABEL */}
                          {openSidebar && (
                            <span
                              className="min-w-0 flex-1 truncate"
                              style={{
                                color: isActive ? "#FFFFFF" : "#435C64",
                              }}
                            >
                              {item.label}
                            </span>
                          )}

                          {/* ACTIVE INDICATOR */}
                          {isActive && openSidebar && (
                            <span className="
                              h-[10px] w-[10px]
                              shrink-0 rounded-full
                              bg-[#E3BD7A]
                            " />
                          )}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* BOTTOM SECTION */}
        <div className="
          shrink-0
          border-t border-[#DDE2DC]
          bg-[#F0F1EC]
          px-[18px]
          pb-[7px] pt-[17px]
        ">

          {/* HELP & SUPPORT */}
          <NavLink
            to={supportPath}
            onClick={closeMobileSidebar}
            title={!openSidebar ? "Help & Support" : undefined}
            className={({ isActive }) => `
              group flex min-h-[50px]
              items-center gap-3
              rounded-xl
              px-[19px]
              transition-all duration-200
              ${
                !openSidebar
                  ? "lg:justify-center lg:px-0"
                  : ""
              }
              ${
                isActive
                  ? "bg-[#E4EAE4] text-[#243746]"
                  : "text-[#435C64] hover:bg-[#E5E9E2] hover:text-[#243746]"
              }
            `}
          >
            {({ isActive }) => (
              <>
                <LifeBuoy
                  size={21}
                  strokeWidth={1.8}
                  className={`
                    shrink-0
                    ${
                      isActive
                        ? "text-[#243746]"
                        : "text-[#607A7E] group-hover:text-[#243746]"
                    }
                  `}
                />

                {openSidebar && (
                  <span className="text-[13px] font-medium">
                    Help & Support
                  </span>
                )}
              </>
            )}
          </NavLink>

          {/* SIGN OUT */}
          <button
            type="button"
            onClick={handleLogout}
            title={!openSidebar ? "Sign out" : undefined}
            className={`
              group mt-[5px]
              flex min-h-[70px] w-full
              items-center gap-[15px]
              rounded-[15px]
              border border-[#D9E0DA]
              bg-white
              px-[15px] py-[9px]
              text-left
              transition-all duration-200
              hover:border-[#C7D3CB]
              hover:bg-[#F8F9F5]
              ${
                !openSidebar
                  ? "lg:justify-center lg:px-0"
                  : ""
              }
            `}
          >

            {/* SIGN OUT ICON */}
            <div className="
              flex h-[46px] w-[46px]
              shrink-0
              items-center justify-center
              rounded-[12px]
              bg-[#243746]
              text-[#E3BD7A]
              transition-colors duration-200
              group-hover:bg-[#344D5D]
            ">
              <LogOut size={20} strokeWidth={1.9} />
            </div>

            {/* SIGN OUT TEXT */}
            {openSidebar && (
              <div className="min-w-0 flex-1">
                <p className="
                  text-[13px] font-semibold
                  text-[#243746]
                ">
                  Sign out
                </p>

                <p className="
                  mt-1 text-[11px]
                  font-normal
                  text-[#7B898B]
                ">
                  End your session
                </p>
              </div>
            )}

            {openSidebar && (
              <ChevronRight
                size={17}
                className="
                  shrink-0
                  text-[#9AA6A3]
                  transition-transform duration-200
                  group-hover:translate-x-0.5
                  group-hover:text-[#243746]
                "
              />
            )}
          </button>
        </div>
      </aside>

      {/* RIGHT CONTENT */}
      <div
        className={`
          min-h-dvh min-w-0
          transition-all duration-300 ease-in-out
          ${
            openSidebar
              ? "lg:ml-[270px]"
              : "lg:ml-[82px]"
          }
        `}
      >

        {/* MOBILE HEADER */}
        <header className="
          sticky top-0 z-30
          flex h-[68px]
          items-center justify-between
          border-b border-[#E5EBEB]
          bg-white/95 px-4
          backdrop-blur-xl
          lg:hidden
        ">
          <button
            type="button"
            onClick={() => setMobileSidebar(true)}
            aria-label="Open sidebar"
            className="
              flex h-10 w-10
              items-center justify-center
              rounded-xl
              border border-[#E5EBEB]
              text-[#06424B]
              transition-colors
              hover:bg-[#EEF5F4]
            "
          >
            <Menu size={20} />
          </button>

          <p className="
            text-[13px] font-semibold
            text-[#06424B]
          ">
            {portalTitle}
          </p>

          <div className="
            flex h-9 w-9
            items-center justify-center
            rounded-xl
            bg-[#06424B]
            text-[11px] font-semibold
            text-white
          ">
            {isTeacher ? "TE" : "ST"}
          </div>
        </header>

        {/* CHILD PAGE CONTENT */}
        <main className="min-h-dvh">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Sidebar;
