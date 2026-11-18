import {
  useLayoutEffect,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
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
  ChevronDown,
  LogOut,
  Menu,
  X,
  FolderTree,
  Layers3,
  FileText,
  Users,
  ClipboardCheck,
} from "lucide-react";

import { getUserRole, clearAuthSession } from "../services/authSession";
import { useEnrolledCourses } from "../data/studentCourseEnrollment";
import { useTeacherData } from "../data/teacherMockData";

const EXPANDED_STORAGE_KEY = "skillnext_sidebar_expanded";
const SCROLL_STORAGE_KEY = "skillnext_sidebar_scroll";

// Page that opens in the main area when you click "Course Explorer".
// Make sure a route exists for it (list of categories / courses).
const EXPLORER_PATH = "/teacher/categories";

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
        end: true,
      },
      {
        label: "My Analytics",
        path: "/student/my-analytics",
        icon: TrendingUp,
      },
      {
        label: "Study Resources",
        path: "/student/resources",
        icon: FolderOpen,
      },
    ],
  },
  {
    title: "CAREER READINESS",
    items: [
      {
        label: "Interview Prep",
        path: "/student/ai-practice",
        icon: Brain,
      },
    ],
  },
  {
    title: "ACHIEVEMENTS",
    items: [
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

function buildTeacherNavigation(data = {}) {
  const categories = data.categories || [];
  const courses = data.courses || [];
  const modules = data.modules || [];

  const categoryItems = [...categories]
    .sort(
      (a, b) =>
        Number(a.sortOrder || 0) - Number(b.sortOrder || 0) ||
        String(a.name || "").localeCompare(String(b.name || ""))
    )
    .map((category) => ({
      key: `category-${category.id}`,
      type: "category",
      label: category.name,
      path: `/teacher/categories/${category.id}/courses`,
      icon: FolderTree,
      end: true,

      children: courses
        .filter(
          (course) => String(course.categoryId) === String(category.id)
        )
        .sort((a, b) =>
          String(a.fullName || "").localeCompare(String(b.fullName || ""))
        )
        .map((course) => ({
          key: `course-${course.id}`,
          type: "course",
          label: course.fullName,
          path: `/teacher/courses/${course.id}/modules`,
          icon: BookOpen,
          end: true,

          children: modules
            .filter(
              (module) => String(module.courseId) === String(course.id)
            )
            .sort(
              (a, b) => Number(a.position || 0) - Number(b.position || 0)
            )
            .map((module) => ({
              key: `module-${module.id}`,
              type: "module",
              label: module.name,
              path: `/teacher/courses/${course.id}/modules/${module.id}`,
              icon: Layers3,
              end: true,
              children: [],
            })),
        })),
    }));

  return [
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
    {
      title: "COURSE EXPLORER",
      items: [
        {
          key: "course-explorer",
          type: "explorer",
          label: "Course Explorer",
          icon: Compass,
          children: categoryItems,
        },
      ],
    },
    {
      title: "CONTENT MANAGEMENT",
      items: [
        {
          label: "All Modules",
          path: "/teacher/modules",
          icon: Layers3,
        },
        {
          label: "Learning Content",
          path: "/teacher/content",
          icon: FileText,
        },
      ],
    },
    {
      title: "STUDENT MANAGEMENT",
      items: [
        {
          label: "Students & Enrolments",
          path: "/teacher/students",
          icon: Users,
        },
      ],
    },
    {
      title: "ASSESSMENTS",
      items: [
        {
          label: "Assignments",
          path: "/teacher/assignments",
          icon: ClipboardCheck,
        },
      ],
    },
  ];
}

// ============================================
// ROUTE HELPERS
// ============================================

// Course Explorer parent is teal only while you are on a
// category / course / module page. Clicking the Course Explorer
// button itself only opens / closes the dropdown.
function isCourseExplorerRoute(pathname) {
  return (
    pathname.startsWith("/teacher/categories") ||
    pathname.startsWith("/teacher/courses")
  );
}

// True when the current page is somewhere INSIDE this item
// (e.g. a module page -> its course and its category are "parents").
function hasActiveDescendant(item, pathname) {
  const current = pathname.replace(/\/+$/, "");

  const check = (node) =>
    (node.children || []).some(
      (child) => child.path === current || check(child)
    );

  return check(item);
}

// ============================================
// SIDEBAR LINK
//
// - Normal links (Dashboard, Students...) : active = green + white
// - Course Explorer subs (nested)         : active = yellow
//   Only the exact page you are on is active.
// ============================================

function SidebarLink({
  item,
  openSidebar,
  onClick,
  activeOverride = false,
  ancestor = false,
  nested = false,
}) {
  const Icon = item.icon || BookOpen;

  return (
    <NavLink
      to={item.path}
      end={item.end || false}
      onClick={onClick}
      title={!openSidebar ? item.label : undefined}
      className={({ isActive }) => {
        const active = activeOverride || isActive;

        let tone =
          "font-medium text-[#435C64] hover:bg-[#E5E9E2] hover:text-[#06424B]";

        if (active && nested) {
          tone =
            "bg-[#FFF1C9] font-semibold text-[#06424B] hover:bg-[#FFE9A8]";
        } else if (active) {
          tone =
            "bg-[#06424B] font-semibold text-white shadow-[0_8px_18px_rgba(6,66,75,0.12)]";
        } else if (ancestor && nested) {
          // Parent of the active page: softer yellow with a thin outline.
          tone =
            "bg-[#FFF8E3] font-semibold text-[#06424B] ring-1 ring-inset ring-[#F0DFA6] hover:bg-[#FFF1C9]";
        }

        return `
          group relative flex min-w-0 items-center gap-3
          rounded-[12px] py-2.5 text-[12px]
          transition-all duration-200
          ${nested ? "min-h-[40px] px-3" : "min-h-[46px] px-[15px]"}
          ${!openSidebar ? "lg:justify-center lg:px-0" : ""}
          ${tone}
        `;
      }}
    >
      {({ isActive }) => {
        const active = activeOverride || isActive;

        let iconColor = "#607A7E";
        let textColor = "text-inherit";

        if (active && nested) {
          iconColor = "#06424B";
          textColor = "text-[#06424B]";
        } else if (active) {
          iconColor = "#FFAB0B";
          textColor = "text-white";
        } else if (ancestor && nested) {
          iconColor = "#06424B";
          textColor = "text-[#06424B]";
        }

        return (
          <>
            <Icon
              size={nested ? 16 : 20}
              strokeWidth={1.8}
              className="shrink-0"
              style={{ color: iconColor }}
            />

            {openSidebar && (
              <span className={`min-w-0 flex-1 truncate ${textColor}`}>
                {item.label}
              </span>
            )}

            {active && !nested && openSidebar && (
              <span className="h-[9px] w-[9px] shrink-0 rounded-full bg-[#FFAB0B]" />
            )}
          </>
        );
      }}
    </NavLink>
  );
}

// ============================================
// RECURSIVE TEACHER TREE (category > course > module)
//
// - Clicking the label navigates and makes ONLY that item active.
// - The dropdown opens / closes ONLY from the arrow button.
// ============================================

function TeacherTreeItem({
  item,
  openSidebar,
  expandedNodes,
  toggleNode,
  onNavigate,
}) {
  const location = useLocation();

  const hasChildren = Boolean(item.children?.length);
  const expanded = Boolean(expandedNodes[item.key]);

  // The current page is inside this item (category / course parents).
  const isAncestor = hasActiveDescendant(item, location.pathname);

  return (
    <div className="w-full">
      <div className="flex w-full items-center gap-1">
        <div className="min-w-0 flex-1">
          <SidebarLink
            item={item}
            openSidebar={openSidebar}
            onClick={onNavigate}
            ancestor={isAncestor}
            nested
          />
        </div>

        {hasChildren && openSidebar && (
          <button
            type="button"
            aria-label={`${expanded ? "Collapse" : "Expand"} ${item.label}`}
            aria-expanded={expanded}
            onClick={() => toggleNode(item.key)}
            className="
              flex h-8 w-8 shrink-0
              items-center justify-center
              rounded-lg text-[#71898B]
              transition-colors
              hover:bg-[#E5E9E2] hover:text-[#06424B]
            "
          >
            {expanded ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </button>
        )}
      </div>

      {hasChildren && expanded && openSidebar && (
        <div
          className={`ml-[17px] mt-1 space-y-1 border-l-2 py-1 pl-2 ${isAncestor ? "border-[#E6D29A]" : "border-[#D5DFD9]"
            }`}
        >
          {item.children.map((child) => (
            <TeacherTreeItem
              key={child.key}
              item={child}
              openSidebar={openSidebar}
              expandedNodes={expandedNodes}
              toggleNode={toggleNode}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// MAIN SIDEBAR
// ============================================

function Sidebar({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const { enrolledCourseIds = [] } = useEnrolledCourses();

  const userRole = (getUserRole() || "").trim().toLowerCase();

  const isTeacher = userRole === "teacher";

  const teacherData = useTeacherData({
    enabled: isTeacher,
  });

  const [openSidebar, setOpenSidebar] = useState(true);
  const [mobileSidebar, setMobileSidebar] = useState(false);

  // Which dropdowns are open. Only changed by the arrow buttons.
  const [expandedNodes, setExpandedNodes] = useState(() => {
    try {
      return JSON.parse(
        sessionStorage.getItem(EXPANDED_STORAGE_KEY) || "{}"
      );
    } catch {
      return {};
    }
  });

  const navRef = useRef(null);
  const scrollRestoredRef = useRef(false);

  const navigationGroups = useMemo(
    () =>
      isTeacher ? buildTeacherNavigation(teacherData) : studentNavigation,
    [isTeacher, teacherData]
  );

  const explorerActive =
    isTeacher && isCourseExplorerRoute(location.pathname);

  // Remember which dropdowns are open across page changes.
  useEffect(() => {
    try {
      sessionStorage.setItem(
        EXPANDED_STORAGE_KEY,
        JSON.stringify(expandedNodes)
      );
    } catch {
      // Session storage may be unavailable.
    }
  }, [expandedNodes]);

  useLayoutEffect(() => {
    const nav = navRef.current;

    if (!nav || scrollRestoredRef.current) return;

    let saved = 0;

    try {
      saved = Number(sessionStorage.getItem(SCROLL_STORAGE_KEY) || 0);
    } catch {
      saved = 0;
    }

    if (!saved) {
      scrollRestoredRef.current = true;
      return;
    }

    nav.scrollTop = saved;

    if (Math.abs(nav.scrollTop - saved) < 2) {
      scrollRestoredRef.current = true;
    }
  }, [navigationGroups, expandedNodes]);

  const handleNavScroll = (event) => {
    // Ignore the scroll events caused by the restore itself.
    if (!scrollRestoredRef.current) return;

    try {
      sessionStorage.setItem(
        SCROLL_STORAGE_KEY,
        String(event.currentTarget.scrollTop)
      );
    } catch {
      // Session storage may be unavailable.
    }
  };

  // If the user starts scrolling before the restore finished,
  // stop restoring so we never fight their scrolling.
  const handleNavUserScroll = () => {
    scrollRestoredRef.current = true;
  };

  const toggleNode = (key) => {
    setExpandedNodes((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  const closeMobileSidebar = () => {
    setMobileSidebar(false);
  };

  const handleLogout = () => {
    closeMobileSidebar();

    try {
      sessionStorage.removeItem(SCROLL_STORAGE_KEY);
      sessionStorage.removeItem(EXPANDED_STORAGE_KEY);
    } catch {
      // Ignore.
    }

    clearAuthSession();
    navigate("/login", { replace: true });
  };

  // Course lessons opened from My Learning use the shared topic route:
  // /student/topics/:courseId/topic/:moduleId
  // Treat this nested lesson route as part of My Learning even when the
  // enrolled-course IDs are loaded from the API rather than local mock state.
  const topicRouteMatch = location.pathname.match(
    /^\/student\/topics\/([^/]+)/
  );

  const routeCourseId = topicRouteMatch?.[1] || null;
  const isStudentModuleContentRoute = /^\/student\/topics\/[^/]+\/topic\/[^/]+(?:\/|$)/.test(
    location.pathname
  );

  const isEnrolledCourseRoute = Boolean(
    !isTeacher &&
    routeCourseId &&
    (isStudentModuleContentRoute ||
      enrolledCourseIds.map(String).includes(String(routeCourseId)))
  );

  const portalTitle = isTeacher ? "Teacher Portal" : "Student Portal";

  const portalSubtitle = isTeacher
    ? "Teaching Workspace"
    : "Learning Workspace";

  const supportPath = isTeacher ? "/teacher/support" : "/student/support";

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
            bg-[#F0F1EC] px-6
            ${openSidebar ? "justify-start" : "lg:justify-center"}
          `}
        >
          <img
            src="/logo.png"
            alt="Skill Next Consulting Inc."
            className={`
              shrink-0 object-contain
              transition-all duration-300
              ${openSidebar ? "h-[48px] w-[64px]" : "h-[43px] w-[43px]"}
            `}
          />

          {openSidebar && (
            <div className="min-w-0 border-l border-[#D5DCD5] pl-3.5">
              <p className="whitespace-nowrap text-[13px] font-semibold tracking-[-0.2px] text-[#243746]">
                {portalTitle}
              </p>
              <p className="mt-1 whitespace-nowrap text-[11px] font-normal text-[#77858A]">
                {portalSubtitle}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={() => setOpenSidebar((value) => !value)}
            aria-label={openSidebar ? "Collapse sidebar" : "Expand sidebar"}
            className="
              absolute -right-4 top-[31px] z-50
              hidden h-[32px] w-[32px]
              items-center justify-center
              rounded-full border border-[#D9E0DA]
              bg-white text-[#243746]
              shadow-sm transition-all duration-200
              hover:border-[#FFAB0B]
              hover:bg-[#FFF9EA]
              lg:flex
            "
          >
            {openSidebar ? (
              <ChevronLeft size={17} />
            ) : (
              <ChevronRight size={17} />
            )}
          </button>

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

        {/* NAVIGATION (scroll position is saved and restored) */}
        <nav
          ref={navRef}
          onScroll={handleNavScroll}
          onWheel={handleNavUserScroll}
          onTouchMove={handleNavUserScroll}
          className="flex-1 overflow-y-auto px-[18px] pb-6 pt-[23px]"
        >
          {navigationGroups.map((group) => (
            <div key={group.title} className="mb-[23px]">
              {openSidebar && (
                <div className="mb-[11px] px-[13px]">
                  <p className="whitespace-nowrap text-[10px] font-bold tracking-[1.15px] text-[#8A795E]">
                    {group.title}
                  </p>
                </div>
              )}

              <div className="space-y-[5px]">
                {group.items.map((item) => {
                  // ---------- COURSE EXPLORER (parent) ----------
                  if (isTeacher && item.type === "explorer") {
                    const expanded = Boolean(expandedNodes[item.key]);

                    return (
                      <div key={item.key}>
                        <div
                          className={`
                            flex min-h-[50px] w-full items-center
                            rounded-[13px]
                            transition-all duration-200
                            ${explorerActive
                              ? "bg-[#06424B] text-white shadow-[0_8px_18px_rgba(6,66,75,0.12)] hover:bg-[#07515C]"
                              : "text-[#435C64] hover:bg-[#E5E9E2] hover:text-[#06424B]"
                            }
                          `}
                        >
                          {/* Label: only opens the Course Explorer page (dropdown NOT opened) */}
                          <NavLink
                            to={EXPLORER_PATH}
                            end
                            title={!openSidebar ? item.label : undefined}
                            onClick={closeMobileSidebar}
                            className={`
                              flex min-h-[50px] min-w-0 flex-1
                              items-center gap-[13px]
                              rounded-[13px] py-2.5 pl-[15px]
                              text-[13px]
                              ${explorerActive ? "font-semibold" : "font-medium"}
                              ${!openSidebar ? "lg:justify-center lg:pl-0" : ""}
                            `}
                          >
                            <Compass
                              size={20}
                              strokeWidth={1.8}
                              className="shrink-0"
                              style={{
                                color: explorerActive ? "#FFAB0B" : "#607A7E",
                              }}
                            />

                            {openSidebar && (
                              <span className="min-w-0 flex-1 truncate">
                                {item.label}
                              </span>
                            )}
                          </NavLink>

                          {/* Arrow: only opens / closes the list */}
                          {openSidebar && (
                            <button
                              type="button"
                              aria-label={`${expanded ? "Collapse" : "Expand"} ${item.label}`}
                              aria-expanded={expanded}
                              onClick={() => toggleNode(item.key)}
                              className={`
                                mr-2 flex h-9 w-9 shrink-0
                                items-center justify-center
                                rounded-lg transition-colors
                                ${explorerActive
                                  ? "text-white hover:bg-white/10"
                                  : "text-[#71898B] hover:bg-[#D9DFD8]"
                                }
                              `}
                            >
                              {expanded ? (
                                <ChevronDown size={17} />
                              ) : (
                                <ChevronRight size={17} />
                              )}
                            </button>
                          )}
                        </div>

                        {/* Categories > Courses > Modules */}
                        {expanded && openSidebar && (
                          <div className="mt-2 space-y-1">
                            {item.children.map((category) => (
                              <TeacherTreeItem
                                key={category.key}
                                item={category}
                                openSidebar={openSidebar}
                                expandedNodes={expandedNodes}
                                toggleNode={toggleNode}
                                onNavigate={closeMobileSidebar}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  }

                  // ---------- NORMAL LINKS (green + white when active) ----------
                  const activeOverride =
                    !isTeacher &&
                    ((item.path === "/student/my-learning" &&
                      isEnrolledCourseRoute) ||
                      (item.path === "/student/topics" &&
                        Boolean(routeCourseId && !isEnrolledCourseRoute)));

                  return (
                    <SidebarLink
                      key={item.path}
                      item={item}
                      openSidebar={openSidebar}
                      onClick={closeMobileSidebar}
                      activeOverride={activeOverride}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* BOTTOM SECTION */}
        <div
          className="
            shrink-0 border-t border-[#DDE2DC]
            bg-[#F0F1EC] px-[18px]
            pb-[7px] pt-[15px]
          "
        >
          <NavLink
            to={supportPath}
            onClick={closeMobileSidebar}
            title={!openSidebar ? "Help & Support" : undefined}
            className={({ isActive }) => `
              group flex min-h-[48px]
              items-center gap-3
              rounded-xl px-[17px]
              transition-all duration-200
              ${!openSidebar ? "lg:justify-center lg:px-0" : ""}
              ${isActive
                ? "bg-[#E4EAE4] text-[#243746]"
                : "text-[#435C64] hover:bg-[#E5E9E2] hover:text-[#243746]"
              }
            `}
          >
            {({ isActive }) => (
              <>
                <LifeBuoy
                  size={20}
                  strokeWidth={1.8}
                  className="shrink-0"
                  color={isActive ? "#243746" : "#607A7E"}
                />
                {openSidebar && (
                  <span className="text-[12px] font-medium">
                    Help & Support
                  </span>
                )}
              </>
            )}
          </NavLink>

          <button
            type="button"
            onClick={handleLogout}
            title={!openSidebar ? "Sign out" : undefined}
            className={`
              group mt-[5px] flex min-h-[68px]
              w-full items-center gap-[13px]
              rounded-[15px]
              border border-[#D9E0DA]
              bg-white px-[13px] py-[9px]
              text-left transition-all duration-200
              hover:border-[#C7D3CB]
              hover:bg-[#F8F9F5]
              ${!openSidebar ? "lg:justify-center lg:px-0" : ""}
            `}
          >
            <span
              className="
                flex h-[44px] w-[44px]
                shrink-0 items-center justify-center
                rounded-[12px]
                bg-[#06424B] text-[#FFAB0B]
                transition-colors
                group-hover:bg-[#0A5661]
              "
            >
              <LogOut size={19} strokeWidth={1.9} />
            </span>

            {openSidebar && (
              <>
                <span className="min-w-0 flex-1">
                  <span className="block text-[12px] font-semibold text-[#243746]">
                    Sign out
                  </span>
                  <span className="mt-1 block text-[10px] font-normal text-[#7B898B]">
                    End your session
                  </span>
                </span>

                <ChevronRight
                  size={16}
                  className="shrink-0 text-[#9AA6A3]"
                />
              </>
            )}
          </button>
        </div>
      </aside>

      {/* RIGHT CONTENT */}
      <div
        className={`
          min-h-dvh min-w-0
          transition-all duration-300 ease-in-out
          ${openSidebar ? "lg:ml-[270px]" : "lg:ml-[82px]"}
        `}
      >
        {/* MOBILE HEADER */}
        <header
          className="
            sticky top-0 z-30
            flex h-[68px]
            items-center justify-between
            border-b border-[#E5EBEB]
            bg-white/95 px-4
            backdrop-blur-xl lg:hidden
          "
        >
          <button
            type="button"
            onClick={() => setMobileSidebar(true)}
            aria-label="Open sidebar"
            className="
              flex h-10 w-10
              items-center justify-center
              rounded-xl border border-[#E5EBEB]
              text-[#06424B]
              transition-colors
              hover:bg-[#EEF5F4]
            "
          >
            <Menu size={20} />
          </button>

          <p className="text-[13px] font-semibold text-[#06424B]">
            {portalTitle}
          </p>

          <div
            className="
              flex h-9 w-9
              items-center justify-center
              rounded-xl bg-[#06424B]
              text-[11px] font-semibold text-white
            "
          >
            {isTeacher ? "TE" : "ST"}
          </div>
        </header>

        <main className="min-h-dvh">{children}</main>
      </div>
    </div>
  );
}

export default Sidebar;