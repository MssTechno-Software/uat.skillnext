import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  LockKeyhole,
  PlayCircle,
  RefreshCw,
} from "lucide-react";

import StudentPageHeader from "../../components/student/StudentPageHeader";
import {
  Card,
  Hero,
  PageShell,
  SectionHeading,
} from "../../components/student/ui";
import Loader from "../../components/Loader";
import { getMyLearnings, getCourseContent } from "../../api/course.api";

const STORAGE_PREFIX = "skillnext:course-module-progress:";

/* =====================================================
   API + PROGRESS HELPERS
===================================================== */

const getErrorMessage = (error, fallback) => {
  const backend = error?.response?.data;
  if (typeof backend === "string" && backend.trim()) return backend;
  if (typeof backend?.message === "string" && backend.message.trim()) return backend.message;

  if (backend?.detail) {
    if (typeof backend.detail === "string") return backend.detail;
    if (Array.isArray(backend.detail)) {
      const messages = backend.detail
        .map((item) => item?.msg || item?.message || "")
        .filter(Boolean);
      if (messages.length) return messages.join(" ");
    }
  }

  if (!error?.response && !error?.request && error?.message) return error.message;
  return fallback;
};

const clampPercentage = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.min(100, Math.max(0, Math.round(number)));
};

// Prefer the API's item counts so the displayed percentage always matches
// the completed/total figures. Fall back to the API percentage when counts
// are not available in the response.
const getEnrollmentPercentage = (entry) => {
  const total = Number(entry?.totalItems);
  const completed = Number(entry?.completedItems);

  if (Number.isFinite(total) && total > 0 && Number.isFinite(completed)) {
    return clampPercentage((completed / total) * 100);
  }

  const rawPercentage = entry?.percentage;
  if (rawPercentage !== undefined && rawPercentage !== null && String(rawPercentage).trim() !== "") {
    return clampPercentage(String(rawPercentage).replace("%", "").trim());
  }

  return String(entry?.status || "").toLowerCase() === "completed" ? 100 : 0;
};

const normalizeMyLearnings = (response) => {
  if (!response || response.success === false) {
    throw new Error(response?.message || "Your enrolled courses could not be loaded.");
  }
  if (!Array.isArray(response.data)) {
    throw new Error("The My Learnings response does not contain a valid course list.");
  }

  return response.data
    .filter((entry) => entry?.course?.id !== undefined && entry?.course?.id !== null)
    .map((entry) => ({
      ...entry,
      totalItems: Math.max(0, Number(entry.totalItems) || 0),
      completedItems: Math.max(0, Number(entry.completedItems) || 0),
      percentage: getEnrollmentPercentage(entry),
      status: entry.status || "not_started",
    }));
};

const isModuleCompleted = (module) => {
  const status = String(module?.status || module?.completionStatus || "").toLowerCase();
  return (
    module?.completed === true ||
    module?.isCompleted === true ||
    status === "completed" ||
    Number(module?.percentage) >= 100
  );
};

const readStoredModuleProgress = (courseId) => {
  if (typeof window === "undefined") return { completedModuleIds: [], apiProgress: null };
  try {
    const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${courseId}`);
    if (!raw) return { completedModuleIds: [], apiProgress: null };
    const parsed = JSON.parse(raw);
    return {
      completedModuleIds: Array.isArray(parsed?.completedModuleIds)
        ? parsed.completedModuleIds.map(Number).filter(Number.isFinite)
        : [],
      apiProgress: parsed?.apiProgress || null,
    };
  } catch {
    return { completedModuleIds: [], apiProgress: null };
  }
};

const getCompletedModuleIds = (courseId, modules) => {
  const stored = readStoredModuleProgress(courseId).completedModuleIds;
  const returnedByContent = modules.filter(isModuleCompleted).map((module) => Number(module.id));
  return [...new Set([...stored, ...returnedByContent].filter(Number.isFinite))];
};

const formatStatus = (status) => {
  const normalized = String(status || "not_started").toLowerCase();
  if (normalized === "completed") return "Completed";
  if (normalized === "in_progress") return "In progress";
  if (normalized === "not_started" || normalized === "not started") return "Not started";
  return normalized.replace(/[_-]+/g, " ");
};

function CircularProgress({ value = 0, size = 68, label = "Course progress" }) {
  const percentage = clampPercentage(value);
  const strokeWidth = size >= 76 ? 6 : 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percentage / 100);

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percentage}
    >
      <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E7EEEE"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#FFAB0B"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-1000 ease-out"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-extrabold tabular-nums text-[#06424B]">
        {percentage}%
      </span>
    </div>
  );
}

const normalizeCourseContent = (response) => {
  if (!response || response.success === false) {
    throw new Error(response?.message || "The course content could not be loaded.");
  }

  const payload = response.data;
  const course = payload?.course;
  if (!course?.id) {
    throw new Error("The course content response is missing course information.");
  }

  const modules = Array.isArray(payload.modules)
    ? payload.modules
      .filter((module) => module && module.visible !== false)
      .map((module) => ({
        ...module,
        contents: Array.isArray(module.contents)
          ? module.contents.filter((item) => item && item.visible !== false)
          : [],
      }))
      .sort((a, b) => Number(a.position || 0) - Number(b.position || 0))
    : [];

  return { course, modules };
};

/* =====================================================
   LOADING / ERROR STATES
===================================================== */

function MyLearningLoading() {
  return (
    <div className="mx-auto w-full max-w-[1250px] animate-pulse space-y-6">
      <div className="h-8 w-56 rounded-lg bg-[#DCE7E5]" />
      <div className="h-4 w-80 max-w-full rounded bg-[#E5ECEA]" />
      <div className="grid gap-5 md:grid-cols-2">
        <div className="h-64 rounded-[22px] bg-white" />
        <div className="h-64 rounded-[22px] bg-white" />
      </div>
    </div>
  );
}

function ErrorState({ title, message, onRetry, backToList = false }) {
  return (
    <Card className="px-6 py-12 text-center sm:px-10">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF1EE] text-[#A85A50]">
        <AlertCircle size={25} />
      </div>
      <h2 className="mt-4 text-xl font-extrabold text-[#06424B]">{title}</h2>
      <p className="mx-auto mt-2 max-w-[520px] text-sm leading-6 text-[#718486]">{message}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#FFAB0B] px-5 text-sm font-bold text-[#06424B] transition hover:bg-[#FFC13C]"
          >
            <RefreshCw size={15} /> Try Again
          </button>
        )}
        {backToList && (
          <Link
            to="/student/my-learning"
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#DCE6E3] bg-white px-5 text-sm font-bold text-[#06424B] !no-underline transition hover:bg-[#F4F7F7]"
          >
            <ArrowLeft size={15} /> Back to My Learning
          </Link>
        )}
      </div>
    </Card>
  );
}

/* =====================================================
   ENROLLED COURSE LIST — GET /api/my-learnings
===================================================== */

function EnrolledCourseList({ enrollments }) {
  return (
    <>
      <style>{`
        @keyframes skillNextFadeUp {
          from { opacity: 0; transform: translate3d(0, 14px, 0); }
          to { opacity: 1; transform: translate3d(0, 0, 0); }
        }
        @keyframes skillNextGoldIn {
          from { opacity: 0; transform: translate3d(10px, 0, 0) scale(.98); }
          to { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
        }
        .skill-next-enter { animation: skillNextFadeUp 520ms cubic-bezier(.2,.75,.25,1) both; }
        .skill-next-card-enter { animation: skillNextGoldIn 560ms cubic-bezier(.2,.75,.25,1) both; }
        @media (prefers-reduced-motion: reduce) {
          .skill-next-enter, .skill-next-card-enter { animation: none !important; }
        }
      `}</style>

      <section className="skill-next-enter relative isolate mb-8 overflow-hidden rounded-[28px] border border-[#DCE7E5] bg-white px-6 py-7 shadow-[0_14px_38px_rgba(6,66,75,0.055)] sm:px-9 sm:py-8">
        <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full border-[26px] border-[#FFAB0B]/[0.07]" />
        <div aria-hidden="true" className="pointer-events-none absolute right-28 top-10 h-2 w-2 rounded-full bg-[#FFAB0B] shadow-[0_0_0_7px_rgba(255,171,11,0.12)]" />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#FFF5DF] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[1.55px] text-[#91680D]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FFAB0B]" />
              Your learning space
            </span>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#06424B] sm:text-[38px] sm:leading-tight">
              My Learning
            </h1>
            <p className="mt-2 max-w-[650px] text-sm leading-7 text-[#718486] sm:text-[15px]">
              Pick up where you left off. Your courses, module progress and learning content are all in one place.
            </p>
          </div>

          <Link
            to="/student/topics"
            className="group inline-flex h-12 shrink-0 items-center justify-center gap-3 self-start rounded-xl bg-[#FFAB0B] px-5 text-sm font-extrabold text-[#06424B] !no-underline shadow-[0_8px_20px_rgba(255,171,11,0.18)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#FFC13C] hover:shadow-[0_12px_24px_rgba(255,171,11,0.24)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#06424B] focus-visible:ring-offset-2 sm:self-center"
          >
            Explore Courses
            <ArrowRight size={17} className="transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      {enrollments.length === 0 ? (
        <Card className="p-8 text-center sm:p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EEF3F4] text-[#06424B]">
            <BookOpen size={25} />
          </div>
          <h2 className="mt-4 text-xl font-extrabold text-[#06424B]">Your learning space is ready</h2>
          <p className="mx-auto mt-2 max-w-[500px] text-sm leading-6 text-[#718486]">
            You have not enrolled in any courses yet. Explore the available courses and add one to start learning.
          </p>
          <Link
            to="/student/topics"
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-[#FFAB0B] px-5 text-sm font-extrabold text-[#06424B] !no-underline transition hover:bg-[#FFC13C]"
          >
            Explore Courses <ArrowRight size={16} />
          </Link>
        </Card>
      ) : (
        <>
          <SectionHeading
            title="Your enrolled courses"
            subtitle="Open a course to view its modules and learning content. Modules become available one at a time."
          />
          <div className="grid gap-5 lg:grid-cols-2">
            {enrollments.map((enrollment, index) => {
              const course = enrollment.course;
              const courseName = course.fullName || course.shortName || "Untitled course";
              const courseId = course.id;
              const percentage = clampPercentage(enrollment.percentage);
              const isCompleted = percentage === 100 || String(enrollment.status).toLowerCase() === "completed";
              const statusLabel = isCompleted ? "Completed" : percentage > 0 ? "In progress" : formatStatus(enrollment.status);

              return (
                <div
                  key={courseId}
                  className="skill-next-card-enter h-full"
                  style={{ animationDelay: `${Math.min(index * 90, 450)}ms` }}
                >
                  <Card
                    className="group flex h-full flex-col overflow-hidden border border-[#E2EAEA] bg-white p-0 shadow-[0_8px_26px_rgba(6,66,75,0.045)] transition duration-200 hover:-translate-y-1 hover:border-[#E4C77F] hover:shadow-[0_16px_34px_rgba(6,66,75,0.09)]"
                  >
                    <div className="h-1.5 w-full bg-[#EEF3F4]">
                      <div
                        className="h-full rounded-r-full bg-[#FFAB0B] transition-all duration-700"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    <div className="flex flex-1 flex-col p-5 sm:p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EEF3F4] text-[#06424B] transition group-hover:bg-[#FFF3D8]">
                          <GraduationCap size={23} />
                        </div>
                        <div className="min-w-0 flex-1 pt-0.5">
                          <p className="text-[10px] font-extrabold uppercase tracking-[1.25px] text-[#A87916]">
                            {course.categoryName || course.shortName || "ENROLLED COURSE"}
                          </p>
                          <h2 className="mt-1 line-clamp-2 text-base font-extrabold leading-6 text-[#06424B] sm:text-lg">
                            {courseName}
                          </h2>
                          <span className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${isCompleted ? "bg-[#E8F5EE] text-[#28765E]" : percentage > 0 ? "bg-[#FFF5DF] text-[#936B12]" : "bg-[#EEF3F4] text-[#718486]"}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${isCompleted ? "bg-[#34866E]" : percentage > 0 ? "bg-[#D49A18]" : "bg-[#9AABAC]"}`} />
                            {statusLabel}
                          </span>
                        </div>
                        <CircularProgress value={percentage} size={68} label={`${courseName} completion`} />
                      </div>

                      <p className="mt-5 min-h-[48px] text-sm leading-6 text-[#627C7F] line-clamp-2">
                        {course.summary || "Continue through the course modules in the order provided."}
                      </p>

                      <div className="mt-5 rounded-2xl border border-[#EAF0EF] bg-[#F8FAFA] p-4 transition-colors duration-200 group-hover:border-[#F0DCA9] group-hover:bg-[#FFFCF5]">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-xs font-bold text-[#526D71]">Learning progress</p>
                          <p className="text-xs font-extrabold tabular-nums text-[#06424B]">{percentage}%</p>
                        </div>
                        <div
                          className="mt-3 h-2 overflow-hidden rounded-full bg-[#E5ECEB]"
                          role="progressbar"
                          aria-label={`${courseName} learning progress`}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={percentage}
                        >
                          <div
                            className="h-full rounded-full bg-[#FFAB0B] transition-all duration-700"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-2 text-[11px] font-medium text-[#829596]">
                          <span>{enrollment.completedItems} of {enrollment.totalItems} learning items completed</span>
                          <span className="shrink-0">{enrollment.totalItems} total</span>
                        </div>
                      </div>

                      <div className="mt-auto pt-5">
                        <Link
                          to={`/student/my-learning?course=${encodeURIComponent(courseId)}`}
                          className="inline-flex h-11 w-full items-center justify-between rounded-xl bg-[#06424B] px-4 text-sm font-extrabold !no-underline transition hover:bg-[#0B5661] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFAB0B] focus-visible:ring-offset-2"
                        >
                          <span className="!text-[#F4F7F7]">
                            {percentage > 0 ? "Continue Learning" : "Start Learning"}
                          </span>

                          <ArrowRight size={17} className="text-[#FFAB0B] transition group-hover:translate-x-0.5" />
                        </Link>
                      </div>
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}

/* =====================================================
   COURSE CONTENT + SEQUENTIAL MODULE ACCESS
   GET /api/courses/{course_id}/content
===================================================== */

function CourseModulesWorkspace({ course, modules, onBack }) {
  const courseId = course.id;
  const completedIds = useMemo(() => getCompletedModuleIds(courseId, modules), [courseId, modules]);
  const completedSet = useMemo(() => new Set(completedIds.map(String)), [completedIds]);
  const completedCount = modules.filter((module) => completedSet.has(String(module.id))).length;
  const percentage = modules.length ? Math.round((completedCount / modules.length) * 100) : 0;
  const nextModuleIndex = modules.findIndex((module) => !completedSet.has(String(module.id)));

  return (
    <>
      <StudentPageHeader
        title={course.fullName || course.shortName || "Course"}
        subtitle="Follow the course in order. Open the available module, review its learning content, and mark it complete to unlock the next module."
      />

      <button
        type="button"
        onClick={onBack}
        className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-[#527477] transition hover:text-[#06424B]"
      >
        <ArrowLeft size={16} /> Back to My Learning
      </button>

      <Hero
        eyebrow={course.shortName || "YOUR ENROLLED COURSE"}
        title={course.fullName || course.shortName || "Continue learning"}
        text={course.summary || "Start with the first module and progress through the course one step at a time."}
      >
        <span className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white">
          <BookOpen size={15} className="text-[#FFAB0B]" />
          {modules.length} {modules.length === 1 ? "module" : "modules"}
        </span>
        <span className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white">
          <GraduationCap size={15} className="text-[#FFAB0B]" />
          {percentage}% modules completed
        </span>
      </Hero>

      <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <section className="min-w-0">
          <SectionHeading
            title="Your learning path"
            subtitle="Completed modules remain available for review. Only the next unfinished module is open."
          />

          {modules.length === 0 ? (
            <Card className="p-6">
              <p className="text-sm leading-6 text-[#718486]">No published modules are available for this course yet.</p>
            </Card>
          ) : (
            <ol className="space-y-3">
              {modules.map((module, index) => {
                const isCompleted = completedSet.has(String(module.id));
                const isUnlocked = isCompleted || index === 0 || completedSet.has(String(modules[index - 1]?.id));
                const isCurrent = !isCompleted && index === nextModuleIndex;
                const contentsCount = Array.isArray(module.contents) ? module.contents.length : 0;
                const linkPath = `/student/topics/${courseId}/topic/${module.id}`;

                return (
                  <li key={module.id}>
                    <Card className={`p-4 sm:p-5 ${isCurrent ? "border-[#FFAB0B] shadow-[0_10px_28px_rgba(255,171,11,0.12)]" : isCompleted ? "border-[#CFE5DB] bg-[#FBFDFC]" : "bg-[#FAFBFB]"}`}>
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold ${isCompleted ? "bg-[#E5F3EC] text-[#28765E]" : isCurrent ? "bg-[#FFAB0B] text-[#06424B]" : "border border-[#DCE6E4] bg-[#EEF2F2] text-[#9AABAC]"}`}>
                          {isCompleted ? <CheckCircle2 size={19} /> : isUnlocked ? <PlayCircle size={19} /> : <LockKeyhole size={17} />}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-[10px] font-extrabold tracking-[1.1px] text-[#A87916]">
                                MODULE {String(index + 1).padStart(2, "0")}
                              </p>
                              <h3 className={`mt-1 text-base font-extrabold ${isUnlocked ? "text-[#06424B]" : "text-[#7C9193]"}`}>
                                {module.name || "Untitled module"}
                              </h3>
                            </div>
                            <span className={`rounded-full px-3 py-1 text-[10px] font-extrabold ${isCompleted ? "bg-[#E5F3EC] text-[#28765E]" : isCurrent ? "bg-[#FFF2D8] text-[#8A650E]" : "bg-[#EEF2F2] text-[#829596]"}`}>
                              {isCompleted ? "COMPLETED" : isCurrent ? "AVAILABLE NOW" : "LOCKED"}
                            </span>
                          </div>

                          <p className="mt-2 text-sm leading-6 text-[#627C7F]">
                            {module.summary || "Review the learning items in this module."}
                          </p>
                          <p className="mt-2 text-[11px] font-semibold text-[#829596]">
                            {contentsCount} {contentsCount === 1 ? "learning item" : "learning items"}
                          </p>

                          {isUnlocked ? (
                            <Link
                              to={linkPath}
                              className={`mt-4 inline-flex h-10 items-center gap-2 rounded-xl px-4 text-xs font-extrabold !no-underline transition ${isCompleted ? "border border-[#CFE5DB] bg-white text-[#28765E] hover:bg-[#F2F8F5]" : "bg-[#FFAB0B] text-[#06424B] hover:bg-[#FFC13C]"}`}
                            >
                              {isCompleted ? "Review Module" : "Open Module"}
                              <ArrowRight size={15} />
                            </Link>
                          ) : (
                            <p className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-[#91A1A2]">
                              <LockKeyhole size={13} /> Complete the previous module to unlock this one.
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  </li>
                );
              })}
            </ol>
          )}
        </section>

        <aside className="space-y-4 lg:sticky lg:top-6 lg:h-fit">
          <Card className="overflow-hidden border border-[#E2EAEA] p-0 shadow-[0_10px_28px_rgba(6,66,75,0.05)]">
            <div className="border-b border-[#EAF0EF] bg-[#F8FAFA] px-5 py-4">
              <h3 className="font-extrabold text-[#06424B]">Course progress</h3>
              <p className="mt-1 text-[11px] text-[#829596]">Based on completed modules</p>
            </div>
            <div className="flex flex-col items-center px-5 py-6">
              <CircularProgress value={percentage} size={112} label="Course module completion" />
              <p className="mt-3 text-sm font-extrabold text-[#06424B]">
                {percentage === 100 ? "Course modules completed" : percentage > 0 ? "You're making progress" : "Ready to get started"}
              </p>
              <p className="mt-1 text-xs text-[#829596]">
                {completedCount} of {modules.length} modules completed
              </p>
              <div className="mt-5 grid w-full grid-cols-2 gap-2">
                <div className="rounded-xl bg-[#F4F7F7] px-3 py-3 text-center">
                  <p className="text-xl font-extrabold tabular-nums text-[#06424B]">{modules.length}</p>
                  <p className="mt-1 text-[10px] font-bold text-[#829596]">Total modules</p>
                </div>
                <div className="rounded-xl bg-[#F4F7F7] px-3 py-3 text-center">
                  <p className="text-xl font-extrabold tabular-nums text-[#06424B]">{Math.max(0, modules.length - completedCount)}</p>
                  <p className="mt-1 text-[10px] font-bold text-[#829596]">Remaining</p>
                </div>
              </div>
              {completedCount === modules.length && modules.length > 0 && (
                <p className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#28765E]">
                  <CheckCircle2 size={15} /> All course modules completed
                </p>
              )}
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2 text-[#06424B]">
              <LockKeyhole size={17} className="text-[#B88736]" />
              <h3 className="text-sm font-extrabold">Sequential learning</h3>
            </div>
            <p className="mt-2 text-xs leading-6 text-[#718486]">
              Finish the current module and select Mark Module Complete. The completion API confirms the module, and the next module then becomes available.
            </p>
          </Card>
        </aside>
      </div>
    </>
  );
}

/* =====================================================
   MAIN PAGE
===================================================== */

function MyLearning() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCourseId = searchParams.get("course");

  const [enrollments, setEnrollments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [courseContent, setCourseContent] = useState(null);
  const [isContentLoading, setIsContentLoading] = useState(false);
  const [contentError, setContentError] = useState("");

  const selectedEnrollment = useMemo(
    () => enrollments.find((entry) => String(entry.course.id) === String(selectedCourseId)),
    [enrollments, selectedCourseId]
  );

  const loadMyLearnings = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await getMyLearnings();
      setEnrollments(normalizeMyLearnings(response));
    } catch (requestError) {
      console.error("My Learnings API Error:", requestError);
      setEnrollments([]);
      setError(getErrorMessage(requestError, "We couldn't load your enrolled courses. Please try again."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadCourseContent = useCallback(async () => {
    if (!selectedEnrollment?.course?.id) return;
    setIsContentLoading(true);
    setContentError("");
    setCourseContent(null);

    try {
      const response = await getCourseContent(selectedEnrollment.course.id);
      setCourseContent(normalizeCourseContent(response));
    } catch (requestError) {
      console.error("Course Content API Error:", requestError);
      setContentError(getErrorMessage(requestError, "We couldn't load this course's content. Please try again."));
    } finally {
      setIsContentLoading(false);
    }
  }, [selectedEnrollment]);

  useEffect(() => {
    loadMyLearnings();
  }, [loadMyLearnings]);

  useEffect(() => {
    if (isLoading) return;
    if (!selectedCourseId || !selectedEnrollment) {
      setCourseContent(null);
      setContentError("");
      setIsContentLoading(false);
      return;
    }
    loadCourseContent();
  }, [isLoading, selectedCourseId, selectedEnrollment, loadCourseContent]);

  const returnToCourseList = () => {
    setSearchParams({});
    loadMyLearnings();
  };

  if (isLoading) {
    return (
      <PageShell>
        <MyLearningLoading />
        <Loader open={isLoading} text="Loading your learning space..." />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="mx-auto w-full max-w-[1250px]">
        {error ? (
          <ErrorState title="Unable to load My Learning" message={error} onRetry={loadMyLearnings} />
        ) : selectedCourseId ? (
          !selectedEnrollment ? (
            <ErrorState
              title="Course not found in My Learning"
              message="This course is not listed in your enrolled courses. Return to My Learning and select one of your enrolled courses."
              backToList
            />
          ) : isContentLoading ? (
            <>
              <MyLearningLoading />
              <Loader open={isContentLoading} text="Loading course content and modules..." />
            </>
          ) : contentError ? (
            <ErrorState
              title="Unable to load course content"
              message={contentError}
              onRetry={loadCourseContent}
              backToList
            />
          ) : courseContent ? (
            <CourseModulesWorkspace
              course={courseContent.course}
              modules={courseContent.modules}
              onBack={returnToCourseList}
            />
          ) : null
        ) : (
          <EnrolledCourseList enrollments={enrollments} />
        )}
      </div>
    </PageShell>
  );
}

export default MyLearning;
