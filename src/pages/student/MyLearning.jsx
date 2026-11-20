import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
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
  Trash2,
  AlertTriangle,
  X,
} from "lucide-react";

import StudentPageHeader from "../../components/student/StudentPageHeader";
import {
  Card,
  Hero,
  PageShell,
  SectionHeading,
} from "../../components/student/ui";
import Loader from "../../components/Loader";
import { getMyLearnings, getCourseLearningPath, leaveCourse } from "../../api/course.api";
import { getApiErrorMessage } from "../../utils/apiErrorHandler";

/* =====================================================
   API + PROGRESS HELPERS
===================================================== */

const getErrorMessage = (error, fallback) => {
  const backend = error?.response?.data;
  const detail = backend?.detail;

  // Preserve a useful validation message returned by the service.
  const backendMessage =
    (typeof backend === "string" && backend.trim() ? backend : "") ||
    (typeof backend?.message === "string" && backend.message.trim() ? backend.message : "") ||
    (typeof detail === "string" && detail.trim() ? detail : "") ||
    (Array.isArray(detail)
      ? detail.map((item) => item?.msg || item?.message || "").filter(Boolean).join(" ")
      : "");

  // Preserve errors created by response normalization or local validation.
  if (!error?.response && !error?.request && error?.message) return error.message;

  // Reuse the application's shared status, network and timeout messages.
  return backendMessage || getApiErrorMessage(error, fallback);
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
    throw new Error("Your enrolled courses are unavailable right now. Please try again.");
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

const normalizeCourseLearningPath = (response) => {
  if (!response || response.success === false) {
    throw new Error(response?.message || "Your course learning path could not be loaded.");
  }

  const payload = response.data ?? response;
  const course = payload?.course;
  if (!course?.id) {
    throw new Error("Course details are unavailable right now. Please try again.");
  }

  const modules = Array.isArray(payload.modules)
    ? payload.modules
        .filter((module) => module && module.id !== undefined && module.id !== null)
        .map((module) => ({
          ...module,
          position: Number(module.position) || 0,
          contentsCount: Math.max(0, Number(module.contentsCount) || 0),
          isRead: module.isRead === true,
          assessmentPassed: module.assessmentPassed === true,
          isUnlocked: module.isUnlocked === true,
          status: String(module.status || "LOCKED").toUpperCase(),
        }))
        .sort((a, b) => a.position - b.position)
    : [];

  const rawProgress = payload.progress || {};
  const progress = {
    ...rawProgress,
    totalModules: Math.max(0, Number(rawProgress.totalModules ?? modules.length) || 0),
    readModules: Math.max(
      0,
      Number(rawProgress.readModules ?? modules.filter((module) => module.isRead).length) || 0
    ),
    passedModules: Math.max(
      0,
      Number(rawProgress.passedModules ?? modules.filter((module) => module.assessmentPassed).length) || 0
    ),
    remainingModules: Math.max(
      0,
      Number(rawProgress.remainingModules ?? (modules.length - modules.filter((module) => module.assessmentPassed).length)) || 0
    ),
    completionPercentage: clampPercentage(rawProgress.completionPercentage),
    finalAssessmentUnlocked: rawProgress.finalAssessmentUnlocked === true,
  };

  const finalAssessment = payload.finalAssessment || null;

  return { course, progress, modules, finalAssessment };
};

/* =====================================================
   LOADING / ERROR STATES
===================================================== */

function MyLearningLoading({ variant = "list" }) {
  const loadingIndicator = (
    <div className="inline-flex items-center gap-2.5 rounded-full border border-[#E6ECEB] bg-white/90 px-3.5 py-2 text-[11px] font-semibold text-[#718486] shadow-[0_3px_12px_rgba(6,66,75,0.035)]">
      <span
        aria-hidden="true"
        className="h-4 w-4 animate-spin rounded-full border-2 border-[#E8EFEE] border-t-[#FFAB0B]"
      />
      <span>Loading your learning space...</span>
    </div>
  );

  if (variant === "workspace") {
    return (
      <div
        className="mx-auto w-full max-w-[1250px] space-y-6"
        role="status"
        aria-label="Loading course learning path"
        aria-busy="true"
      >
        <div className="flex justify-end">{loadingIndicator}</div>

        <div className="animate-pulse space-y-3 rounded-[28px] border border-[#E7ECEB] bg-white p-6 shadow-[0_8px_24px_rgba(6,66,75,0.035)] sm:p-8">
          <div className="h-2.5 w-32 rounded-full bg-[#F1E7D2]" />
          <div className="h-7 w-2/3 max-w-[420px] rounded-lg bg-[#E9EFEE]" />
          <div className="h-3 w-full max-w-[620px] rounded-full bg-[#EEF2F1]" />
          <div className="h-3 w-4/5 max-w-[500px] rounded-full bg-[#EEF2F1]" />
          <div className="flex flex-wrap gap-3 pt-3">
            <div className="h-9 w-28 rounded-xl bg-[#F1F4F3]" />
            <div className="h-9 w-32 rounded-xl bg-[#F1F4F3]" />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <section className="space-y-4 animate-pulse">
            <div className="space-y-2 pb-1">
              <div className="h-5 w-44 rounded-md bg-[#E9EFEE]" />
              <div className="h-3 w-3/4 max-w-[460px] rounded-full bg-[#EEF2F1]" />
            </div>
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="rounded-[22px] border border-[#E7ECEB] bg-white p-5 shadow-[0_5px_18px_rgba(6,66,75,0.025)]">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-[#EEF3F4]" />
                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="h-2.5 w-20 rounded-full bg-[#F1E7D2]" />
                    <div className="h-4 w-2/3 rounded-md bg-[#E9EFEE]" />
                    <div className="h-3 w-full max-w-[440px] rounded-full bg-[#EEF2F1]" />
                    <div className="h-3 w-28 rounded-full bg-[#EEF2F1]" />
                    <div className="h-9 w-32 rounded-xl bg-[#F4F6F5]" />
                  </div>
                </div>
              </div>
            ))}
          </section>
          <aside className="animate-pulse space-y-4">
            <div className="h-[300px] rounded-[22px] border border-[#E7ECEB] bg-white p-5">
              <div className="h-4 w-36 rounded-md bg-[#E9EFEE]" />
              <div className="mx-auto mt-8 h-28 w-28 rounded-full border-[9px] border-[#EEF3F4] border-t-[#F5DDA6]" />
              <div className="mx-auto mt-5 h-3 w-36 rounded-full bg-[#EEF2F1]" />
              <div className="mt-8 grid grid-cols-2 gap-3">
                <div className="h-16 rounded-xl bg-[#F4F7F7]" />
                <div className="h-16 rounded-xl bg-[#F4F7F7]" />
              </div>
            </div>
            <div className="h-28 rounded-[22px] border border-[#E7ECEB] bg-white p-5">
              <div className="h-4 w-40 rounded-md bg-[#E9EFEE]" />
              <div className="mt-4 h-3 w-full rounded-full bg-[#EEF2F1]" />
              <div className="mt-2 h-3 w-4/5 rounded-full bg-[#EEF2F1]" />
            </div>
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div
      className="mx-auto w-full max-w-[1250px] space-y-6"
      role="status"
      aria-label="Loading your learning space"
      aria-busy="true"
    >
      {/* Page header skeleton + a subtle inline loader */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full animate-pulse space-y-3">
          <div className="h-7 w-48 rounded-lg bg-[#E9EFEE]" />
          <div className="h-3 w-full max-w-[470px] rounded-full bg-[#EEF2F1]" />
        </div>
        {loadingIndicator}
      </div>

      {/* Hero banner skeleton */}
      <section className="animate-pulse overflow-hidden rounded-[28px] border border-[#E6ECEB] bg-white px-6 py-7 shadow-[0_8px_24px_rgba(6,66,75,0.035)] sm:px-9 sm:py-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full max-w-2xl space-y-4">
            <div className="h-6 w-36 rounded-full bg-[#F7F1E5]" />
            <div className="h-7 w-3/4 max-w-[390px] rounded-lg bg-[#E9EFEE] sm:h-8" />
            <div className="h-3 w-full max-w-[580px] rounded-full bg-[#EEF2F1]" />
            <div className="h-3 w-4/5 max-w-[460px] rounded-full bg-[#EEF2F1]" />
          </div>
          <div className="h-11 w-40 shrink-0 rounded-xl bg-[#F5E9C9]" />
        </div>
      </section>

      {/* Section heading skeleton */}
      <div className="animate-pulse space-y-2 pt-1">
        <div className="h-5 w-44 rounded-md bg-[#E9EFEE]" />
        <div className="h-3 w-full max-w-[500px] rounded-full bg-[#EEF2F1]" />
      </div>

      {/* Course card skeletons retain the same two-column layout as the actual cards */}
      <div className="grid gap-5 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse overflow-hidden rounded-[22px] border border-[#E6ECEB] bg-white shadow-[0_6px_22px_rgba(6,66,75,0.03)]"
          >
            <div className="h-1.5 bg-[#F1F4F3]" />
            <div className="flex h-full flex-col p-5 sm:p-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 shrink-0 rounded-2xl bg-[#EEF3F4]" />
                <div className="min-w-0 flex-1 space-y-2.5 pt-1">
                  <div className="h-2.5 w-24 rounded-full bg-[#F1E7D2]" />
                  <div className="h-4 w-3/4 rounded-md bg-[#E9EFEE]" />
                  <div className="h-5 w-24 rounded-full bg-[#F2F5F4]" />
                </div>
                <div className="h-[68px] w-[68px] shrink-0 rounded-full border-[6px] border-[#EEF3F4] border-t-[#F5DDA6]" />
              </div>

              <div className="mt-5 space-y-2">
                <div className="h-3 w-full rounded-full bg-[#EEF2F1]" />
                <div className="h-3 w-4/5 rounded-full bg-[#EEF2F1]" />
              </div>

              <div className="mt-5 rounded-2xl border border-[#EDF1F0] bg-[#FAFBFB] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="h-3 w-28 rounded-full bg-[#E9EFEE]" />
                  <div className="h-3 w-10 rounded-full bg-[#E9EFEE]" />
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#EEF2F1]" />
                <div className="mt-3 flex items-center justify-between gap-3">
                  <div className="h-2.5 w-36 rounded-full bg-[#EEF2F1]" />
                  <div className="h-2.5 w-12 rounded-full bg-[#EEF2F1]" />
                </div>
              </div>

              <div className="mt-5 h-11 w-full rounded-xl bg-[#EAF0EF]" />
            </div>
          </div>
        ))}
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

function EnrolledCourseList({ enrollments, onLeaveCourse }) {
  const [coursePendingRemoval, setCoursePendingRemoval] = useState(null);
  const [isRemovingCourse, setIsRemovingCourse] = useState(false);
  const [removeCourseError, setRemoveCourseError] = useState("");

  const handleConfirmLeaveCourse = async () => {
    if (!coursePendingRemoval?.id || isRemovingCourse) return;

    setIsRemovingCourse(true);
    setRemoveCourseError("");

    try {
      await onLeaveCourse(coursePendingRemoval.id);
      setCoursePendingRemoval(null);
    } catch (requestError) {
      setRemoveCourseError(
        getErrorMessage(requestError, "We couldn't remove this course. Please try again.")
      );
    } finally {
      setIsRemovingCourse(false);
    }
  };

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
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-[#06424B] sm:text-[30px] sm:leading-tight">
              Keep your learning moving
            </h2>
            <p className="mt-2 max-w-[650px] text-sm leading-7 text-[#718486] sm:text-[15px]">
              Continue your lessons or explore new courses and build your skills one module at a time.
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
                        <div className="flex shrink-0 items-start gap-2">
                          <CircularProgress value={percentage} size={68} label={`${courseName} completion`} />
                          <button
                            type="button"
                            onClick={() => {
                              setRemoveCourseError("");
                              setCoursePendingRemoval({ id: courseId, name: courseName });
                            }}
                            aria-label={`Leave ${courseName}`}
                            title="Leave course"
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#F0D9D6] bg-white text-[#A85A50] transition hover:border-[#D9A29B] hover:bg-[#FFF3F1] hover:text-[#8B3E36] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C98E86]/40 focus-visible:ring-offset-2"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
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

      {coursePendingRemoval && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-[#102F33]/55 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (!isRemovingCourse && event.target === event.currentTarget) {
              setCoursePendingRemoval(null);
              setRemoveCourseError("");
            }
          }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="leave-course-title"
            aria-describedby="leave-course-description"
            className="w-full max-w-[440px] rounded-[24px] border border-white/70 bg-white p-6 shadow-[0_24px_80px_rgba(6,44,49,0.28)] sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF1EE] text-[#A85A50]">
                <AlertTriangle size={22} />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (isRemovingCourse) return;
                  setCoursePendingRemoval(null);
                  setRemoveCourseError("");
                }}
                aria-label="Close confirmation"
                disabled={isRemovingCourse}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-[#73898B] transition hover:bg-[#F2F5F5] hover:text-[#06424B] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            <h2 id="leave-course-title" className="mt-5 text-xl font-extrabold text-[#123B43]">
              Leave this course?
            </h2>
            <p id="leave-course-description" className="mt-2 text-sm leading-7 text-[#5A7478]">
              Are you sure you want to remove <span className="font-bold text-[#06424B]">{coursePendingRemoval.name}</span> from My Learning? Your saved lesson progress and assessment attempts will be kept.
            </p>

            {removeCourseError && (
              <div role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs leading-5 text-red-700">
                {removeCourseError}
              </div>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setCoursePendingRemoval(null);
                  setRemoveCourseError("");
                }}
                disabled={isRemovingCourse}
                className="rounded-xl border border-[#DCE6E4] bg-white px-5 py-3 text-sm font-bold text-[#456367] transition hover:bg-[#F6F8F8] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Keep course
              </button>
              <button
                type="button"
                onClick={handleConfirmLeaveCourse}
                disabled={isRemovingCourse}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#8B514B] px-5 py-3 text-sm font-bold text-white shadow-[0_8px_18px_rgba(139,81,75,0.18)] transition hover:bg-[#75413C] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Trash2 size={15} />
                {isRemovingCourse ? "Leaving course..." : "Leave course"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* =====================================================
   STUDENT LEARNING PATH + SEQUENTIAL MODULE ACCESS
   GET /api/courses/{course_id}/learning-path/me
===================================================== */

function CourseModulesWorkspace({ learningPath, onBack }) {
  const { course, progress, modules, finalAssessment } = learningPath;
  const courseId = course.id;

  // These IDs are passed only as navigation context. Unlocking is always based
  // on the backend's isUnlocked / assessmentPassed fields, not this route state.
  const passedModuleIds = modules
    .filter((module) => module.assessmentPassed)
    .map((module) => Number(module.id));
  const readModuleIds = modules
    .filter((module) => module.isRead)
    .map((module) => Number(module.id));

  const totalModules = progress.totalModules;
  const readCount = progress.readModules;
  const passedCount = progress.passedModules;
  const remainingCount = progress.remainingModules;
  const percentage = progress.completionPercentage;
  const finalAssessmentUnlocked = Boolean(
    progress.finalAssessmentUnlocked || finalAssessment?.isUnlocked === true
  );
  const finalAssessmentTitle = finalAssessment?.title || "Final Course Assessment";
  const routeState = {
    courseId: Number(courseId),
    passedModuleIds,
    readModuleIds,
  };

  return (
    <>
      <StudentPageHeader
        title={course.fullName || course.shortName || "Course"}
        subtitle="Continue your lessons and track your module progress in one place."
      />

      <button
        type="button"
        onClick={onBack}
        className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-[#527477] transition hover:text-[#06424B]"
      >
        <ArrowLeft size={16} /> Back to My Learning
      </button>

      <Hero
        eyebrow={course.categoryName || course.shortName || "YOUR ENROLLED COURSE"}
        title={course.fullName || course.shortName || "Continue learning"}
        text={course.summary || "Continue through your course modules one step at a time."}
      >
        <span className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white">
          <BookOpen size={15} className="text-[#FFAB0B]" />
          {totalModules} {totalModules === 1 ? "module" : "modules"}
        </span>
        <span className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white">
          <GraduationCap size={15} className="text-[#FFAB0B]" />
          {percentage}% complete
        </span>
      </Hero>

      <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <section className="min-w-0">
          <SectionHeading
            title="Your learning path"
            subtitle="Your module availability and progress are synchronized with your learning account."
          />

          {modules.length === 0 ? (
            <Card className="p-6">
              <p className="text-sm leading-6 text-[#718486]">No modules are available for this course yet.</p>
            </Card>
          ) : (
            <ol className="space-y-3">
              {modules.map((module, index) => {
                const isPassed = module.assessmentPassed;
                const isRead = module.isRead;
                const isUnlocked = module.isUnlocked;
                const isCurrent = isUnlocked && !isPassed;
                const contentsCount = module.contentsCount;
                const linkPath = `/student/topics/${courseId}/topic/${module.id}`;
                const statusLabel = isPassed
                  ? "ASSESSMENT PASSED"
                  : !isUnlocked
                    ? "LOCKED"
                    : isRead
                      ? "ASSESSMENT AVAILABLE"
                      : "AVAILABLE NOW";

                return (
                  <li key={module.id}>
                    <Card className={`p-4 sm:p-5 ${isCurrent ? "border-[#FFAB0B] shadow-[0_10px_28px_rgba(255,171,11,0.12)]" : isPassed ? "border-[#CFE5DB] bg-[#FBFDFC]" : "bg-[#FAFBFB]"}`}>
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold ${isPassed ? "bg-[#E5F3EC] text-[#28765E]" : isCurrent ? "bg-[#FFAB0B] text-[#06424B]" : "border border-[#DCE6E4] bg-[#EEF2F2] text-[#9AABAC]"}`}>
                          {isPassed ? <CheckCircle2 size={19} /> : isUnlocked ? <PlayCircle size={19} /> : <LockKeyhole size={17} />}
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
                            <span className={`rounded-full px-3 py-1 text-[10px] font-extrabold ${isPassed ? "bg-[#E5F3EC] text-[#28765E]" : isCurrent ? "bg-[#FFF2D8] text-[#8A650E]" : "bg-[#EEF2F2] text-[#829596]"}`}>
                              {statusLabel}
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
                              state={routeState}
                              className={`mt-4 inline-flex h-10 items-center gap-2 rounded-xl px-4 text-xs font-extrabold !no-underline transition ${isPassed ? "border border-[#CFE5DB] bg-white text-[#28765E] hover:bg-[#F2F8F5]" : "bg-[#FFAB0B] text-[#06424B] hover:bg-[#FFC13C]"}`}
                            >
                              {isPassed ? "Review Module" : isRead ? "Continue Assessment" : "Open Module"}
                              <ArrowRight size={15} />
                            </Link>
                          ) : (
                            <p className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-[#91A1A2]">
                              <LockKeyhole size={13} /> Complete the previous module requirements to unlock this one.
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

          {modules.length > 0 && (
            <Card
              className={`mt-5 overflow-hidden border p-5 shadow-[0_8px_24px_rgba(6,66,75,0.04)] sm:p-6 ${
                finalAssessmentUnlocked
                  ? "border-[#CFE5DB] bg-[#FBFDFC]"
                  : "border-[#E2EAEA] bg-[#FAFBFB]"
              }`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-3.5">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                      finalAssessmentUnlocked
                        ? "bg-[#E5F3EC] text-[#28765E]"
                        : "bg-[#EEF2F2] text-[#829596]"
                    }`}
                  >
                    {finalAssessmentUnlocked ? <GraduationCap size={22} /> : <LockKeyhole size={20} />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-extrabold text-[#06424B]">{finalAssessmentTitle}</h3>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${
                          finalAssessmentUnlocked
                            ? "bg-[#E5F3EC] text-[#28765E]"
                            : "bg-[#EEF2F2] text-[#829596]"
                        }`}
                      >
                        {finalAssessmentUnlocked ? "UNLOCKED" : "LOCKED"}
                      </span>
                    </div>

                    <p className="mt-1.5 text-sm leading-6 text-[#627C7F]">
                      {finalAssessmentUnlocked
                        ? "Your final course assessment is now available."
                        : "Complete the required module learning to unlock your final course assessment."}
                    </p>

                    <p className="mt-2 text-[11px] font-semibold text-[#829596]">
                      {readCount} of {totalModules} modules read · {passedCount} assessments passed
                    </p>
                  </div>
                </div>

                {finalAssessmentUnlocked ? (
                  <Link
                    to={`/student/final-assessment?course=${encodeURIComponent(courseId)}`}
                    state={{ ...routeState, finalAssessmentId: finalAssessment?.id ?? null }}
                    className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#FFAB0B] px-5 text-xs font-extrabold text-[#06424B] !no-underline transition hover:bg-[#FFC13C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#06424B] focus-visible:ring-offset-2"
                  >
                    Start Final Assessment
                    <ArrowRight size={15} />
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="inline-flex h-11 shrink-0 cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-[#DCE6E4] bg-white px-5 text-xs font-bold text-[#91A1A2]"
                  >
                    <LockKeyhole size={14} /> Complete modules first
                  </button>
                )}
              </div>
            </Card>
          )}
        </section>

        <aside className="space-y-4 lg:sticky lg:top-6 lg:h-fit">
          <Card className="overflow-hidden border border-[#E2EAEA] p-0 shadow-[0_10px_28px_rgba(6,66,75,0.05)]">
            <div className="border-b border-[#EAF0EF] bg-[#F8FAFA] px-5 py-4">
              <h3 className="font-extrabold text-[#06424B]">Assessment progress</h3>
              <p className="mt-1 text-[11px] text-[#829596]">Based on your saved learning progress</p>
            </div>
            <div className="flex flex-col items-center px-5 py-6">
              <CircularProgress value={percentage} size={112} label="Course completion" />
              <p className="mt-3 text-sm font-extrabold text-[#06424B]">
                {percentage === 100 ? "Course requirements completed" : percentage > 0 ? "You're making progress" : "Ready to get started"}
              </p>
              <p className="mt-1 text-xs text-[#829596]">
                {passedCount} of {totalModules} assessments passed
              </p>
              <div className="mt-5 grid w-full grid-cols-2 gap-2">
                <div className="rounded-xl bg-[#F4F7F7] px-3 py-3 text-center">
                  <p className="text-xl font-extrabold tabular-nums text-[#06424B]">{totalModules}</p>
                  <p className="mt-1 text-[10px] font-bold text-[#829596]">Total modules</p>
                </div>
                <div className="rounded-xl bg-[#F4F7F7] px-3 py-3 text-center">
                  <p className="text-xl font-extrabold tabular-nums text-[#06424B]">{remainingCount}</p>
                  <p className="mt-1 text-[10px] font-bold text-[#829596]">Remaining</p>
                </div>
              </div>
              {finalAssessmentUnlocked && (
                <p className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#28765E]">
                  <CheckCircle2 size={15} /> Final assessment unlocked
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
              Finish the visible learning items and pass the required module assessments to continue through your course.
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
  const [searchParams] = useSearchParams();
  const selectedCourseId = searchParams.get("course");
  const navigate = useNavigate();

  const [enrollments, setEnrollments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [learningPath, setLearningPath] = useState(null);
  const [isLearningPathLoading, setIsLearningPathLoading] = useState(false);
  const [learningPathError, setLearningPathError] = useState("");
  const learningPathRequestIdRef = useRef(0);

  const selectedEnrollment = useMemo(
    () => enrollments.find((entry) => String(entry.course.id) === String(selectedCourseId)),
    [enrollments, selectedCourseId]
  );
  const enrolledCourseId = selectedEnrollment?.course?.id;

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

  const handleLeaveCourse = useCallback(async (courseId) => {
    const response = await leaveCourse(courseId, false);

    if (response?.success === false) {
      throw new Error(response?.message || "The course could not be removed.");
    }

    setEnrollments((currentEnrollments) =>
      currentEnrollments.filter(
        (enrollment) => String(enrollment?.course?.id) !== String(courseId)
      )
    );
  }, []);

  const loadCourseLearningPath = useCallback(async () => {
    if (!enrolledCourseId) return;

    const requestId = ++learningPathRequestIdRef.current;
    setIsLearningPathLoading(true);
    setLearningPathError("");
    setLearningPath(null);

    try {
      const response = await getCourseLearningPath(enrolledCourseId);
      const normalizedLearningPath = normalizeCourseLearningPath(response);

      // Ignore an older response if the learner selected another course meanwhile.
      if (requestId === learningPathRequestIdRef.current) {
        setLearningPath(normalizedLearningPath);
      }
    } catch (requestError) {
      console.error("Course Learning Path API Error:", requestError);
      if (requestId === learningPathRequestIdRef.current) {
        setLearningPathError(
          getErrorMessage(requestError, "We couldn't load your course learning path. Please try again.")
        );
      }
    } finally {
      if (requestId === learningPathRequestIdRef.current) {
        setIsLearningPathLoading(false);
      }
    }
  }, [enrolledCourseId]);

  useEffect(() => {
    loadMyLearnings();
  }, [loadMyLearnings]);

  useEffect(() => {
    if (isLoading) return;

    if (!selectedCourseId || !selectedEnrollment) {
      learningPathRequestIdRef.current += 1;
      setLearningPath(null);
      setLearningPathError("");
      setIsLearningPathLoading(false);
      return undefined;
    }

    loadCourseLearningPath();

    return () => {
      // Prevent a stale course response from updating this page after navigation.
      learningPathRequestIdRef.current += 1;
    };
  }, [isLoading, selectedCourseId, selectedEnrollment, loadCourseLearningPath]);

  const returnToCourseList = () => {
    setLearningPath(null);
    navigate("/student/my-learning");
  };

  if (isLoading) {
    return (
      <PageShell>
        <div className="mx-auto w-full max-w-[1250px]">
          <MyLearningLoading />
        </div>
        <Loader open={isLoading} text="Loading your learning space..." />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="mx-auto w-full max-w-[1250px]">
        {!selectedCourseId && (
          <StudentPageHeader
            title="My Learning"
            subtitle="Pick up where you left off. Your enrolled courses and learning progress are all in one place."
          />
        )}

        {error ? (
          <ErrorState title="Unable to load My Learning" message={error} onRetry={loadMyLearnings} />
        ) : selectedCourseId ? (
          !selectedEnrollment ? (
            <ErrorState
              title="Course not found in My Learning"
              message="This course is not listed in your enrolled courses. Return to My Learning and select one of your enrolled courses."
              backToList
            />
          ) : isLearningPathLoading ? (
            <>
              <MyLearningLoading variant="workspace" />
              <Loader open={isLearningPathLoading} text="Loading your course learning path..." />
            </>
          ) : learningPathError ? (
            <ErrorState
              title="Unable to load your learning path"
              message={learningPathError}
              onRetry={loadCourseLearningPath}
              backToList
            />
          ) : learningPath ? (
            <CourseModulesWorkspace
              learningPath={learningPath}
              onBack={returnToCourseList}
            />
          ) : null
        ) : (
          <EnrolledCourseList enrollments={enrollments} onLeaveCourse={handleLeaveCourse} />
        )}
      </div>
    </PageShell>
  );
}

export default MyLearning;
