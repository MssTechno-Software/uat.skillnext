import { useMemo, useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  FolderTree,
  Layers3,
  FileText,
  ClipboardCheck,
  Sparkles,
  GraduationCap,
  Eye,
  EyeOff,
  Plus,
  Clock3,
  CircleCheck,
  X,
} from "lucide-react";

import { useTeacherData } from "../../data/teacherMockData";
import TeacherLayout from "./TeacherLayout";
import { PageHeader, StatusPill } from "./TeacherUI";

/* =========================================================
   QUICK BALL ICON
========================================================= */

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

/* =========================================================
   QUICK BALL SHORTCUTS
   All paths use existing teacher routes.
========================================================= */

const shortcuts = [
  {
    label: "Categories",
    title: "Manage Categories",
    text: "Organise subject categories",
    path: "/teacher/categories",
    icon: FolderTree,
    tone: "gold",
  },
  {
    label: "Modules",
    title: "Manage Modules",
    text: "Organise course modules",
    path: "/teacher/modules",
    icon: Layers3,
    tone: "gold",
  },
  {
    label: "Assignments",
    title: "Manage Assignments",
    text: "Create and manage assignments",
    path: "/teacher/assignments",
    icon: ClipboardCheck,
    tone: "gold",
  },
  {
    label: "Students",
    title: "Student Management",
    text: "View and manage students",
    path: "/teacher/students",
    icon: GraduationCap,
    tone: "teal",
  },
];

/* =========================================================
   FLOATING QUICK BALL
========================================================= */

function QuickBall() {
  const [open, setOpen] = useState(false);

  const rootRef = useRef(null);
  const hoverBlocked = useRef(false);
  const closeTimer = useRef(null);

  useEffect(() => {
    return () => clearTimeout(closeTimer.current);
  }, []);

  useEffect(() => {
    if (!open) return undefined;

    const onPointerDown = (event) => {
      if (
        rootRef.current &&
        !rootRef.current.contains(event.target)
      ) {
        setOpen(false);
        hoverBlocked.current = true;
      }
    };

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        hoverBlocked.current = true;
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const onEnter = (event) => {
    clearTimeout(closeTimer.current);

    if (
      event.pointerType !== "mouse" ||
      hoverBlocked.current
    ) {
      return;
    }

    setOpen(true);
  };

  const onLeave = (event) => {
    if (event.pointerType !== "mouse") return;

    hoverBlocked.current = false;
    clearTimeout(closeTimer.current);

    closeTimer.current = setTimeout(() => {
      setOpen(false);
    }, 250);
  };

  const onBallClick = () => {
    if (open) {
      setOpen(false);
      hoverBlocked.current = true;
    } else {
      hoverBlocked.current = false;
      setOpen(true);
    }
  };

  return (
    <div
      ref={rootRef}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      className="fixed bottom-20 right-6 z-[90] h-0 w-0 sm:right-12"
    >
      {/* SHORTCUT TRAY */}

      <div
        className={`absolute -right-9 -top-[30px] flex items-start rounded-[28px] p-2 ring-1 transition-all duration-300 ${open
          ? "bg-white shadow-[0_14px_34px_rgba(6,66,75,0.22)] ring-[#D9E8E6]"
          : "bg-transparent ring-transparent"
          }`}
      >
        <nav
          aria-label="Quick actions"
          aria-hidden={!open}
          className={`flex items-start overflow-hidden transition-all duration-300 ease-out ${open
            ? "mr-2 max-w-[340px] opacity-100"
            : "max-w-0 opacity-0"
            }`}
        >
          {shortcuts.map(
            ({ label, title, text, path, icon: Icon, tone }, index) => (
              <Link
                key={label}
                to={path}
                title={`${title} – ${text}`}
                tabIndex={open ? 0 : -1}
                onClick={() => {
                  setOpen(false);
                  hoverBlocked.current = true;
                }}
                style={{
                  transitionDelay: open
                    ? `${index * 50}ms`
                    : "0ms",
                }}
                className={`group flex w-[64px] shrink-0 flex-col items-center gap-1.5 !no-underline transition-all duration-300 focus-visible:outline-none sm:w-[80px] ${open
                  ? "translate-x-0"
                  : "translate-x-6"
                  }`}
              >
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-full shadow-[0_3px_10px_rgba(6,66,75,0.16)] transition-transform duration-200 group-hover:scale-110 group-focus-visible:ring-2 group-focus-visible:ring-[#FFAB0B] group-focus-visible:ring-offset-2 ${tone === "gold"
                    ? "bg-[#FFAB0B] text-[#06424B]"
                    : "bg-[#06424B] text-[#FFAB0B]"
                    }`}
                >
                  <Icon className="h-5 w-5" />
                </span>

                <span className="flex h-6 items-start justify-center text-center text-[10px] font-semibold leading-3 text-[#2F4A4E] transition-colors group-hover:text-[#B27B20] sm:h-3 sm:whitespace-nowrap">
                  {label}
                </span>
              </Link>
            )
          )}
        </nav>

        {/* BALL SPACE */}

        <div
          className="h-14 w-14 shrink-0"
          aria-hidden="true"
        />
      </div>

      {/* MAIN FLOATING BUTTON */}

      <div className="absolute left-0 top-0 z-10 -translate-x-1/2 -translate-y-1/2">
        <button
          type="button"
          onClick={onBallClick}
          aria-expanded={open}
          aria-label={
            open
              ? "Close quick actions"
              : "Open quick actions"
          }
          title="Quick actions"
          className={`flex h-14 w-14 items-center justify-center rounded-full ring-4 ring-white shadow-[0_8px_20px_rgba(6,66,75,0.28)] transition-all duration-300 hover:scale-105 focus-visible:outline-none focus-visible:ring-[#FFD36B] ${open
            ? "bg-[#06424B] text-[#FFAB0B]"
            : "bg-[#FFAB0B] text-[#06424B]"
            }`}
        >
          <span
            className={`transition-transform duration-300 ${open ? "rotate-90" : "rotate-0"
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
          className={`pointer-events-none absolute left-1/2 top-full mt-1.5 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#06424B] px-2 py-0.5 text-[10px] font-bold text-[#FFD36B] shadow-sm transition-opacity duration-200 ${open ? "opacity-0" : "opacity-100"
            }`}
        >
          Quick actions
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  accent,
  index,
}) {
  return (
    <div
      className="dashboard-card group relative overflow-hidden rounded-[22px] border border-[#E5ECEC] bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#B9D3D3] hover:shadow-[0_16px_35px_rgba(6,66,75,0.09)]"
      style={{ animationDelay: `${index * 90}ms` }}
    >
      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[#F4F8F8] transition-transform duration-500 group-hover:scale-150" />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold text-[#87999B]">
            {label}
          </p>

          <h3 className="mt-3 text-[30px] font-extrabold tracking-tight text-[#173F46]">
            {value}
          </h3>
        </div>

        <div
          className="flex h-11 w-11 items-center justify-center rounded-[14px] transition-all duration-300 group-hover:rotate-[-8deg] group-hover:scale-110"
          style={{
            backgroundColor: `${accent}13`,
            color: accent,
          }}
        >
          <Icon size={20} strokeWidth={2} />
        </div>
      </div>

      <div className="relative mt-4 flex items-center gap-2 border-t border-[#F0F3F3] pt-3">
        <span className="h-1.5 w-1.5 rounded-full bg-[#FFAB0B]" />
        <p className="text-[10px] font-medium text-[#91A0A2]">
          {detail}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   SECTION TITLE
========================================================= */

function SectionTitle({ title, subtitle, action }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-[16px] font-extrabold tracking-tight text-[#173F46]">
          {title}
        </h2>

        <p className="mt-1 text-[11px] text-[#899A9C]">
          {subtitle}
        </p>
      </div>

      {action}
    </div>
  );
}

/* =========================================================
   TEACHER DASHBOARD
========================================================= */

export default function TeacherDashboard() {
  const data = useTeacherData();

  const visibleCourses = data.courses.filter(
    (course) => course.visible
  ).length;

  const visibleContent = data.contents.filter(
    (content) => content.visible
  ).length;

  const visibleModules = data.modules.filter(
    (module) => module.visible
  ).length;

  const recentCourses = useMemo(
    () => [...data.courses].slice(-5).reverse(),
    [data.courses]
  );

  const courseStats = [
    {
      label: "Main Categories",
      value: data.categories.length,
      detail: "Subject categories created",
      icon: FolderTree,
      accent: "#06424B",
    },
    {
      label: "Total Courses",
      value: data.courses.length,
      detail: `${visibleCourses} published courses`,
      icon: BookOpen,
      accent: "#C18B26",
    },
    {
      label: "Learning Modules",
      value: data.modules.length,
      detail: `${visibleModules} visible modules`,
      icon: Layers3,
      accent: "#527E91",
    },
    {
      label: "Learning Materials",
      value: data.contents.length,
      detail: `${visibleContent} published materials`,
      icon: FileText,
      accent: "#648A79",
    },
    {
      label: "Assignments",
      value: data.assignments.length,
      detail: "Learning activities created",
      icon: ClipboardCheck,
      accent: "#A17A48",
    },
  ];

  const publishedPercentage = data.courses.length
    ? Math.round(
      (visibleCourses / data.courses.length) * 100
    )
    : 0;

  const contentPercentage = data.contents.length
    ? Math.round(
      (visibleContent / data.contents.length) * 100
    )
    : 0;

  const today = new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <TeacherLayout>
      <style>{`
        @keyframes dashboardFadeUp {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes dashboardFloat {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-12px);
          }
        }

        @keyframes dashboardGlow {
          0%, 100% {
            opacity: .25;
            transform: scale(1);
          }
          50% {
            opacity: .55;
            transform: scale(1.12);
          }
        }

        @keyframes dashboardShine {
          0% {
            transform: translateX(-150%);
          }
          100% {
            transform: translateX(250%);
          }
        }

        @keyframes dashboardProgress {
          from {
            width: 0;
          }
        }

        .dashboard-enter {
          animation: dashboardFadeUp .65s cubic-bezier(.2,.7,.3,1) both;
        }

        .dashboard-card {
          animation: dashboardFadeUp .55s ease both;
        }

        .dashboard-float {
          animation: dashboardFloat 6s ease-in-out infinite;
        }

        .dashboard-glow {
          animation: dashboardGlow 5s ease-in-out infinite;
        }

        .dashboard-progress {
          animation: dashboardProgress 1.1s ease-out both;
        }

        .dashboard-hero-shine {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
        }

        .dashboard-hero-shine::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 35%;
          height: 100%;
          background: linear-gradient(
            100deg,
            transparent,
            rgba(255,255,255,.045),
            transparent
          );
          animation: dashboardShine 9s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .dashboard-enter,
          .dashboard-card,
          .dashboard-float,
          .dashboard-glow,
          .dashboard-progress,
          .dashboard-hero-shine::after {
            animation: none !important;
          }
        }
      `}</style>

      <div className="space-y-7 pb-8">
        {/* PAGE HEADER */}
        <PageHeader
          eyebrow="TEACHING WORKSPACE"
          title="Teacher Dashboard"
          description="Manage your courses, learning materials and teaching activities."
        />

        {/* HERO SECTION */}

        <section className="dashboard-enter relative isolate overflow-hidden rounded-[26px] bg-[#06424B] shadow-[0_18px_45px_rgba(6,66,75,0.16)]">
          <div className="dashboard-hero-shine" />

          <div className="dashboard-glow absolute -right-20 -top-32 h-80 w-80 rounded-full bg-[#FFAB0B]/10 blur-[70px]" />

          <div className="dashboard-float absolute -right-10 top-10 hidden h-64 w-64 rounded-full border border-white/[0.10] lg:block" />

          <div className="absolute -right-2 top-24 hidden h-48 w-48 rounded-full border-[25px] border-white/[0.035] lg:block" />

          <div className="relative z-10 grid items-center gap-8 px-6 py-8 sm:px-9 sm:py-10 lg:grid-cols-[1fr_270px]">
            <div className="max-w-2xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.09] px-3 py-1.5">
                <Sparkles size={13} className="text-[#FFAB0B]" />
                <span className="text-[9px] font-bold tracking-[1.5px] text-[#FFE0A0]">
                  YOUR LEARNING COMMAND CENTER
                </span>
              </div>

              <h2 className="text-[25px] font-extrabold leading-[1.3] tracking-tight text-white sm:text-[34px]">
                Create. Teach.
                <br />
                <span className="text-[#FFAB0B]">
                  Inspire the Next Generation.
                </span>
              </h2>

              <p className="mt-4 max-w-xl text-[11px] leading-6 text-white/65 sm:text-[12px]">
                Build meaningful learning experiences. Organise your
                courses, create interactive lessons and deliver quality
                education through Skill Next.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  to="/teacher/courses"
                  className="group inline-flex items-center gap-2 rounded-xl bg-[#FFAB0B] px-5 py-3 text-[11px] font-extrabold text-[#173F46] shadow-lg shadow-black/10 transition-all duration-300 hover:-translate-y-1 hover:bg-[#FFC34C]"
                >
                  <Plus size={15} />
                  Manage Courses
                  <ArrowRight
                    size={14}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>

                <div className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/[0.08] px-4 py-3 text-[10px] font-semibold text-white/85">
                  <GraduationCap size={15} className="text-[#FFAB0B]" />
                  Teaching Overview
                </div>
              </div>
            </div>

            {/* HERO VISUAL */}

            <div className="relative hidden h-[215px] items-center justify-center lg:flex">
              <div className="absolute h-52 w-52 rounded-full border border-white/10" />
              <div className="absolute h-40 w-40 rounded-full border border-dashed border-white/20" />

              <div className="dashboard-float relative flex h-32 w-32 items-center justify-center rounded-[34px] border border-white/20 bg-white/[0.10] shadow-2xl backdrop-blur-xl">
                <div className="flex h-24 w-24 items-center justify-center rounded-[26px] bg-[#FFAB0B] shadow-lg shadow-black/20">
                  <GraduationCap
                    size={51}
                    strokeWidth={1.5}
                    className="text-[#06424B]"
                  />
                </div>
              </div>

              <div className="absolute right-2 top-7 flex items-center gap-2 rounded-xl border border-white/15 bg-[#15545B] px-3 py-2 shadow-xl">
                <BookOpen size={15} className="text-[#FFAB0B]" />
                <span className="text-[9px] font-bold text-white">
                  Learning
                </span>
              </div>

              <div className="absolute bottom-5 left-0 flex items-center gap-2 rounded-xl border border-white/15 bg-[#15545B] px-3 py-2 shadow-xl">
                <CircleCheck size={15} className="text-[#8DE1B6]" />
                <span className="text-[9px] font-bold text-white">
                  Teaching Excellence
                </span>
              </div>
            </div>
          </div>

          {/* HERO FOOTER */}

          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-white/[0.035] px-6 py-3.5 sm:px-9">
            <span className="text-[9px] font-medium text-white/55">
              SKILL NEXT CONSULTING INC.
            </span>

            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#8DE1B6]" />
              <span className="text-[9px] font-semibold text-white/70">
                Workspace Active
              </span>
            </div>
          </div>
        </section>

        {/* WORKSPACE OVERVIEW */}

        <section className="dashboard-enter">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Layers3 size={16} className="text-[#B27B20]" />
                <h2 className="text-[15px] font-extrabold text-[#173F46]">
                  Workspace Overview
                </h2>
              </div>

              <p className="mt-1 text-[10px] text-[#899A9C]">
                Your complete teaching catalogue at a glance.
              </p>
            </div>

            <span className="rounded-full border border-[#E3EBEB] bg-white px-3 py-1.5 text-[9px] font-bold text-[#789093]">
              LIVE COUNTS
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {courseStats.map((stat, index) => (
              <StatCard
                key={stat.label}
                {...stat}
                index={index}
              />
            ))}
          </div>
        </section>

        {/* PUBLISHING OVERVIEW */}

        <section className="dashboard-enter rounded-[22px] border border-[#E3EBEB] bg-white p-5 shadow-[0_5px_20px_rgba(6,66,75,0.025)] sm:p-6">
          <SectionTitle
            title="Publishing Overview"
            subtitle="Understand your course and content visibility."
          />

          <div className="grid gap-7 lg:grid-cols-2">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EAF2F1] text-[#06424B]">
                    <BookOpen size={17} />
                  </div>

                  <div>
                    <p className="text-[11px] font-bold text-[#31565B]">
                      Published Courses
                    </p>
                    <p className="text-[9px] text-[#92A0A2]">
                      Visible to students
                    </p>
                  </div>
                </div>

                <p className="text-[13px] font-extrabold text-[#17464D]">
                  {visibleCourses}
                  <span className="text-[10px] font-medium text-[#A1ADAE]">
                    {" "}/ {data.courses.length}
                  </span>
                </p>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-[#EDF2F2]">
                <div
                  className="dashboard-progress h-full rounded-full bg-[#06424B]"
                  style={{ width: `${publishedPercentage}%` }}
                />
              </div>

              <p className="mt-1.5 text-right text-[9px] font-semibold text-[#829698]">
                {publishedPercentage}% published
              </p>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFF5DF] text-[#B27B20]">
                    <FileText size={17} />
                  </div>

                  <div>
                    <p className="text-[11px] font-bold text-[#31565B]">
                      Published Learning Materials
                    </p>
                    <p className="text-[9px] text-[#92A0A2]">
                      Visible lesson resources
                    </p>
                  </div>
                </div>

                <p className="text-[13px] font-extrabold text-[#17464D]">
                  {visibleContent}
                  <span className="text-[10px] font-medium text-[#A1ADAE]">
                    {" "}/ {data.contents.length}
                  </span>
                </p>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-[#EDF2F2]">
                <div
                  className="dashboard-progress h-full rounded-full bg-[#FFAB0B]"
                  style={{ width: `${contentPercentage}%` }}
                />
              </div>

              <p className="mt-1.5 text-right text-[9px] font-semibold text-[#829698]">
                {contentPercentage}% published
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 border-t border-[#EDF1F1] pt-5">
            <div className="rounded-xl bg-[#F6F9F9] p-3">
              <div className="flex items-center gap-2 text-[#648A79]">
                <Eye size={14} />
                <span className="text-[9px] font-bold">
                  Visible Modules
                </span>
              </div>

              <p className="mt-2 text-[22px] font-extrabold text-[#17464D]">
                {visibleModules}
              </p>
            </div>

            <div className="rounded-xl bg-[#F6F9F9] p-3">
              <div className="flex items-center gap-2 text-[#A17A35]">
                <EyeOff size={14} />
                <span className="text-[9px] font-bold">
                  Hidden Courses
                </span>
              </div>

              <p className="mt-2 text-[22px] font-extrabold text-[#17464D]">
                {data.courses.length - visibleCourses}
              </p>
            </div>
          </div>
        </section>

        {/* RECENT COURSES */}

        <section className="dashboard-enter rounded-[22px] border border-[#E3EBEB] bg-white p-5 shadow-[0_5px_20px_rgba(6,66,75,0.025)] sm:p-6">
          <SectionTitle
            title="Recently Added Courses"
            subtitle="Your latest courses and their current publishing status."
            action={
              <Link
                to="/teacher/courses"
                className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#B27B20] transition-colors hover:text-[#06424B]"
              >
                View all courses
                <ArrowRight size={13} />
              </Link>
            }
          />

          {recentCourses.length ? (
            <div className="divide-y divide-[#EDF1F1]">
              {recentCourses.map((course) => {
                const category = data.categories.find(
                  (item) =>
                    String(item.id) === String(course.categoryId)
                );

                const modules = data.modules.filter(
                  (item) =>
                    String(item.courseId) === String(course.id)
                );

                const contentCount = data.contents.filter((item) =>
                  modules.some(
                    (module) =>
                      String(module.id) === String(item.moduleId)
                  )
                ).length;

                return (
                  <div
                    key={course.id}
                    className="group flex flex-col gap-3 py-4 transition-all duration-200 hover:px-2 sm:flex-row sm:items-center"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#EAF2F1] text-[#06424B] transition-all duration-300 group-hover:scale-105 group-hover:bg-[#06424B] group-hover:text-white">
                      <BookOpen size={19} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-[12px] font-extrabold text-[#17464D]">
                          {course.fullName || course.name}
                        </h3>

                        <StatusPill visible={course.visible} />
                      </div>

                      <p className="mt-1 text-[10px] text-[#91A0A2]">
                        {category?.name || "Uncategorised"}
                        <span className="mx-2 text-[#CCD4D4]">•</span>
                        {modules.length} modules
                        <span className="mx-2 text-[#CCD4D4]">•</span>
                        {contentCount} learning materials
                      </p>
                    </div>

                    <Link
                      to={`/teacher/courses/${course.id}/modules`}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#E3EBEB] px-3.5 py-2 text-[10px] font-bold text-[#52777B] transition-all hover:border-[#06424B] hover:bg-[#06424B] hover:text-white"
                    >
                      Manage course
                      <ArrowRight size={12} />
                    </Link>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl bg-[#F6F9F9] py-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#789093] shadow-sm">
                <BookOpen size={22} />
              </div>

              <h3 className="mt-3 text-[12px] font-bold text-[#31565B]">
                No courses yet
              </h3>

              <p className="mt-1 text-[10px] text-[#92A0A2]">
                Start building your learning catalogue.
              </p>

              <Link
                to="/teacher/courses"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#06424B] px-4 py-2.5 text-[10px] font-bold text-white transition-all hover:bg-[#0B5963]"
              >
                <Plus size={13} />
                Create your first course
              </Link>
            </div>
          )}
        </section>

        {/* FOOTER */}

        <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-[#E2EAEA] pt-5">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#06424B]">
              <GraduationCap
                size={15}
                className="text-[#FFAB0B]"
              />
            </div>

            <span className="text-[10px] font-extrabold text-[#52777B]">
              SKILL NEXT
            </span>
          </div>

          <p className="text-[9px] text-[#A0ADAF]">
            © 2026 Skill Next Consulting Inc. All rights reserved.
          </p>
        </footer>
      </div>

      {/* FLOATING QUICK BALL - OUTSIDE DASHBOARD CONTENT */}

      <QuickBall />
    </TeacherLayout>
  );
}
