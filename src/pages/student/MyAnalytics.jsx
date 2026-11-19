import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Code2,
  FileCheck2,
  Flag,
  GraduationCap,
  LockKeyhole,
  Mountain,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
} from "lucide-react";

import StudentPageHeader from "../../components/student/StudentPageHeader";
import {
  Card,
  EmptyState,
  LinkButton,
  PageShell,
} from "../../components/student/ui";
import Loader from "../../components/Loader";
import { getMyAnalytics } from "../../api/analytics.api";
import { getApiErrorMessage } from "../../utils/apiErrorHandler";

/* -------------------------------------------------------------------------- */
/*  Constants & helpers                                                       */
/* -------------------------------------------------------------------------- */

const round1 = (value) => Math.round((Number(value) || 0) * 10) / 10;
const optionalNumber = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};
const percentOf = (score, total) =>
  Number(total) > 0 ? Math.round((Number(score) / Number(total)) * 100) : 0;
const pad2 = (n) => String(n).padStart(2, "0");

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const isTechnologyCourse = (categoryName = "") =>
  /\b(it|technology|technical)\b/i.test(String(categoryName));

const ATTEMPT_LABELS = {
  attemptsUsed: "Attempts used",
  attempts_used: "Attempts used",
  attemptsRemaining: "Attempts remaining",
  attempts_remaining: "Attempts remaining",
  maxAttempts: "Maximum attempts",
  max_attempts: "Maximum attempts",
  attemptCount: "Total attempts",
  attempt_count: "Total attempts",
  totalAttempts: "Total attempts",
  total_attempts: "Total attempts",
  bestScore: "Best score",
  best_score: "Best score",
  lastAttemptAt: "Last attempt",
  last_attempt_at: "Last attempt",
  status: "Assessment status",
};

const formatAttemptLabel = (key) =>
  ATTEMPT_LABELS[key] ||
  String(key)
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());

const formatAttemptValue = (key, value) => {
  if (value === null || value === undefined || value === "") return "Not available yet";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (key === "status") {
    const status = String(value).toLowerCase().replace(/[_-]+/g, " ");
    const labels = {
      completed: "Completed",
      passed: "Passed",
      failed: "Not passed",
      inprogress: "In progress",
      "in progress": "In progress",
      notstarted: "Not started",
      "not started": "Not started",
      submitted: "Submitted",
      pending: "Pending review",
    };
    return labels[status] || status.replace(/\b\w/g, (character) => character.toUpperCase());
  }
  if (/date|time|At$/i.test(key)) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  }
  if (/percentage|percent/i.test(key) && Number.isFinite(Number(value))) {
    return `${round1(value)}%`;
  }
  return String(value);
};

/* -------------------------------------------------------------------------- */
/*  Motion utilities                                                          */
/* -------------------------------------------------------------------------- */

const MOTION_CSS = `
@keyframes spRise { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: none; } }
@keyframes spPulse { 0% { box-shadow: 0 0 0 0 rgba(228,179,62,.6); } 70% { box-shadow: 0 0 0 14px rgba(228,179,62,0); } 100% { box-shadow: 0 0 0 0 rgba(228,179,62,0); } }
@keyframes spFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-9px); } }
@keyframes spBob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
@keyframes spSpark { 0% { opacity: 0; transform: scale(0) rotate(0deg); } 50% { opacity: 1; transform: scale(1) rotate(90deg); } 100% { opacity: 0; transform: scale(0) rotate(180deg); } }
@keyframes spShine { 0% { transform: translateX(-120%); } 60%,100% { transform: translateX(220%); } }
@keyframes spBlink { 0%,100% { opacity: 1; } 50% { opacity: .45; } }
@keyframes spFlow { to { stroke-dashoffset: -24; } }
.sp-hero-1 { animation: spRise .7s cubic-bezier(.2,.7,.2,1) both; }
.sp-hero-2 { animation: spRise .7s cubic-bezier(.2,.7,.2,1) .18s both; }
.sp-hero-3 { animation: spRise .7s cubic-bezier(.2,.7,.2,1) .36s both; }
.sp-hero-4 { animation: spRise .8s cubic-bezier(.2,.7,.2,1) .54s both; }
.sp-pulse { animation: spPulse 2s ease-out infinite; }
.sp-float { animation: spFloat 6s ease-in-out infinite; }
.sp-float-slow { animation: spFloat 9s ease-in-out infinite; }
.sp-bob { animation: spBob 2.2s ease-in-out infinite; }
.sp-blink { animation: spBlink 1.6s ease-in-out infinite; }
.sp-spark { animation: spSpark 2.4s ease-in-out infinite; }
.sp-flow { animation: spFlow 1.4s linear infinite; }
.sp-cta { position: relative; overflow: hidden; }
.sp-cta::after { content: ""; position: absolute; inset: 0; width: 40%; background: linear-gradient(100deg, transparent, rgba(255,255,255,.55), transparent); animation: spShine 3.2s ease-in-out infinite; }
.sp-node { transition: transform .25s cubic-bezier(.2,.7,.2,1), box-shadow .25s ease; }
.sp-node:hover { transform: scale(1.1); }
@media (prefers-reduced-motion: reduce) {
  .sp-hero-1,.sp-hero-2,.sp-hero-3,.sp-hero-4,.sp-pulse,.sp-float,.sp-float-slow,.sp-bob,.sp-blink,.sp-spark,.sp-flow,.sp-cta::after { animation: none !important; }
  .sp-node { transition: none; }
}
`;

/** Returns [ref, shown]; flips to true once the element scrolls into view. */
function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion() || typeof IntersectionObserver === "undefined") {
      setShown(true);
      return undefined;
    }
    const node = ref.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, shown];
}

function Reveal({ children, delay = 0, className = "", as: Tag = "div" }) {
  const [ref, shown] = useReveal();
  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "none" : "translateY(18px)",
        transition: `opacity .6s ease ${delay}ms, transform .6s cubic-bezier(.2,.7,.2,1) ${delay}ms`,
      }}
    >
      {children}
    </Tag>
  );
}

/** Measures an element's width and keeps it updated on resize. */
function useElementWidth() {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    const update = () => setWidth(Math.round(node.getBoundingClientRect().width));
    update();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", update);
      return () => window.removeEventListener("resize", update);
    }
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return [ref, width];
}

/** Smoothly counts from 0 to target. */
function useCountUp(target, duration = 1100) {
  const safeTarget = Number(target) || 0;
  const [value, setValue] = useState(prefersReducedMotion() ? safeTarget : 0);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setValue(safeTarget);
      return undefined;
    }
    let frame;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(safeTarget * eased);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [safeTarget, duration]);

  return value;
}

function AnimatedNumber({ value, suffix = "", decimals = 0 }) {
  const animated = useCountUp(value);
  return (
    <>
      {Number(animated).toFixed(decimals)}
      {suffix}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Small UI pieces                                                           */
/* -------------------------------------------------------------------------- */

function ScoreRing({ value, label = "Overall", ariaLabel = "Overall course score", size = 86, dark = false, color }) {
  const hasValue = value !== null && value !== undefined && Number.isFinite(Number(value));
  const safeValue = hasValue ? Math.max(0, Math.min(100, Number(value))) : 0;
  const animated = useCountUp(safeValue, 1300);
  const inner = size - 16;
  return (
    <div
      className="relative flex shrink-0 items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        background: `conic-gradient(${color || (dark ? "#F2C35B" : "#0B5960")} ${animated}%, ${dark ? "rgba(255,255,255,0.14)" : "#E8EFEE"} ${animated}% 100%)`,
      }}
      role="progressbar"
      aria-label={hasValue ? ariaLabel : `${ariaLabel} not available yet`}
      aria-valuenow={hasValue ? safeValue : undefined}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={`flex flex-col items-center justify-center rounded-full ${dark ? "bg-[#0E4C52]" : "bg-white"}`}
        style={{ width: inner, height: inner }}
      >
        <span className={`font-extrabold leading-none ${dark ? "text-white" : "text-[#123F45]"} ${size > 100 ? "text-3xl" : size > 72 ? "text-xl" : "text-[15px]"}`}>
          {hasValue ? `${Math.round(animated)}%` : "—"}
        </span>
        {label && <span className={`mt-1 text-[9px] font-bold ${dark ? "text-[#9FC7C5]" : "text-[#829596]"}`}>{label}</span>}
      </div>
    </div>
  );
}

function StatusPill({ label, tone = "muted" }) {
  const styles = {
    success: "border-[#D5EAE1] bg-[#EAF5EF] text-[#28765E]",
    active: "border-[#F2DDA6] bg-[#FFF6DF] text-[#94650C]",
    info: "border-[#D5E7E6] bg-[#EDF6F5] text-[#0B6268]",
    danger: "border-[#F0D9D6] bg-[#FFF2F0] text-[#9A5148]",
    muted: "border-[#E4EBEA] bg-[#F4F6F6] text-[#829596]",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-extrabold ${styles[tone] || styles.muted}`}>
      {label}
    </span>
  );
}


function MetricCard({
  icon: Icon,
  label,
  value,
  suffix = "",
  fallback = "—",
  helper,
  tone = "teal",
  delay = 0,
}) {
  const tones = {
    teal: "bg-[#EAF3F2] text-[#0B5960]",
    gold: "bg-[#FFF5DE] text-[#9A6B0B]",
    green: "bg-[#EAF5EF] text-[#28765E]",
    slate: "bg-[#F0F3F3] text-[#617A7D]",
  };

  return (
    <Reveal delay={delay} className="h-full min-w-0">
      <Card className="flex h-full min-h-[146px] flex-col p-4 sm:p-5">
        <div className="flex h-full items-start justify-between gap-3">

          <div className="flex min-w-0 flex-1 flex-col">
            <p className="text-[11px] font-bold text-[#829596]">
              {label}
            </p>

            <p className="mt-2 text-[27px] font-extrabold leading-none text-[#123F45]">
              {value === null || value === undefined ? (
                fallback
              ) : (
                <AnimatedNumber value={value} suffix={suffix} />
              )}
            </p>

            <p className="mt-2 min-h-[32px] line-clamp-2 text-[11px] font-medium leading-4 text-[#829596]">
              {helper}
            </p>
          </div>

          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}
          >
            <Icon size={19} />
          </span>

        </div>
      </Card>
    </Reveal>
  );
}

function MarkRow({ label, earned, total, tone = "teal" }) {
  const [ref, shown] = useReveal();
  const hasEarned = earned !== null && earned !== undefined && Number.isFinite(Number(earned));
  const hasTotal = total !== null && total !== undefined && Number.isFinite(Number(total)) && Number(total) > 0;
  const safeTotal = hasTotal ? Number(total) : 0;
  const safeEarned = hasEarned ? Math.max(0, Math.min(safeTotal || Number(earned), Number(earned))) : 0;
  const hasBreakdown = hasEarned && hasTotal;
  const fill = hasBreakdown ? (safeEarned / safeTotal) * 100 : 0;
  const fillClass = tone === "gold" ? "bg-[#E8B33D]" : tone === "green" ? "bg-[#70A994]" : "bg-[#0B5960]";
  const valueLabel = hasBreakdown
    ? `${round1(safeEarned)} / ${round1(safeTotal)}`
    : hasEarned
      ? `${round1(Number(earned))} marks earned`
      : "Awaiting results";

  return (
    <div ref={ref}>
      <div className="mb-1.5 flex items-center justify-between gap-3 text-[11px]">
        <span className="font-semibold text-[#60797C]">{label}</span>
        <span className="font-extrabold tabular-nums text-[#234B50]">{valueLabel}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#EDF1F0]">
        <div
          className={`h-full rounded-full ${fillClass}`}
          style={{ width: shown ? `${fill}%` : "0%", transition: "width 1.1s cubic-bezier(.2,.7,.2,1) .15s" }}
        />
      </div>
    </div>
  );
}

function JourneyLink({ to, children, muted = false }) {
  return (
    <Link
      to={to}
      style={{ color: muted ? "#365B5F" : "#FFFFFF" }}
      className={`inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[11px] font-extrabold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E4B33E] ${muted
        ? "border border-[#DCE6E4] bg-white hover:border-[#9CB8B5] hover:bg-[#F7FAF9]"
        : "bg-[#0B5960] hover:bg-[#08484E]"
        }`}
    >
      {children}
    </Link>
  );
}

/** The right-hand action for a step: a link, a pill, a "done" note or a lock note. */
function StepAction({ step }) {
  const Cta = step.cta;
  if (Cta) {
    return (
      <JourneyLink to={Cta.to} muted={Cta.muted}>
        <Cta.icon size={13} /> {Cta.label}
      </JourneyLink>
    );
  }
  if (step.pillInstead) return <StatusPill label={step.pillInstead.label} tone={step.pillInstead.tone} />;
  if (step.doneText) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-[#28765E]">
        <CheckCircle2 size={14} /> {step.doneText}
      </span>
    );
  }
  if (step.lockedText) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#91A1A2]">
        <LockKeyhole size={13} /> {step.lockedText}
      </span>
    );
  }
  return null;
}

/* -------------------------------------------------------------------------- */
/*  Course progress adapter                                                  */
/* -------------------------------------------------------------------------- */

function buildCourseModel(chapter) {
  const courseId = chapter?.courseId;
  const course = {
    id: courseId,
    name: chapter?.courseName || "Course details coming soon",
    category: chapter?.categoryName || "Course",
  };
  const isIT = isTechnologyCourse(chapter?.categoryName);
  const stats = {
    done: Math.max(0, Number(chapter?.topicsCompleted) || 0),
    total: Math.max(0, Number(chapter?.totalTopics) || 0),
  };
  const performance = chapter?.performance || {};
  const marksBreakdown = chapter?.marksBreakdown || {};
  const topicBreakdown = marksBreakdown.topicQuizzes || {};
  const finalBreakdown = marksBreakdown.finalAssessment || {};
  const quizPerformance = Array.isArray(chapter?.quizPerformance)
    ? chapter.quizPerformance
    : [];
  const apiNextStep = chapter?.nextStep || null;
  // Use the stable My Learning route. Course metadata and learning data
  // are sourced from the signed-in student's learning summary, not frontend seed data.
  const coursePath = "/student/my-learning";

  const steps = (Array.isArray(chapter?.roadmap) ? chapter.roadmap : []).map(
    (item, index) => {
      const kindValue = String(item?.kind || "topic").toLowerCase();
      const kind = kindValue.includes("final")
        ? "final"
        : kindValue.includes("coding")
          ? "coding"
          : "topic";
      const stateValue = String(item?.state || "locked").toLowerCase();
      const state = stateValue === "completed" || stateValue === "done"
        ? "done"
        : stateValue === "current" || stateValue === "in_progress"
          ? "current"
          : "locked";
      const scoreRecord = quizPerformance.find(
        (quiz) => String(quiz?.moduleId) === String(item?.moduleId)
      );
      const score = scoreRecord?.bestPercentage ?? null;
      const scoreText = score === null || score === undefined
        ? "Your quiz result will appear here once it is available."
        : `Best score: ${round1(score)}%${scoreRecord?.passed === true ? " · Passed" : scoreRecord?.passed === false ? " · Not passed" : ""}`;
      const moduleId = item?.moduleId;
      const assignmentId = item?.assignmentId;
      const isNextFromApi = Boolean(
        apiNextStep &&
        ((moduleId !== null && moduleId !== undefined && String(apiNextStep.moduleId) === String(moduleId)) ||
          (assignmentId !== null && assignmentId !== undefined && String(apiNextStep.assignmentId) === String(assignmentId)))
      );

      let itemPath = null;
      let actionLabel = "Open";
      let actionIcon = BookOpen;

      if (kind !== "topic" && assignmentId !== null && assignmentId !== undefined) {
        itemPath = `/student/assessments/${encodeURIComponent(assignmentId)}`;
        actionLabel = state === "done" ? "View result" : "Open assessment";
        actionIcon = kind === "coding" ? FileCheck2 : Flag;
      } else if (moduleId !== null && moduleId !== undefined) {
        itemPath = `/student/topics/${encodeURIComponent(courseId)}/topic/${encodeURIComponent(moduleId)}`;
        actionLabel = state === "done" ? "Review" : "Open lesson";
      }

      const canOpenLesson = isNextFromApi && String(apiNextStep?.type || "").toLowerCase() === "lesson";
      const canOpenAssignment = isNextFromApi && assignmentId !== null && assignmentId !== undefined;
      const cta = state === "done" && itemPath
        ? { to: itemPath, label: actionLabel, icon: actionIcon, muted: true }
        : state === "current" && itemPath && (canOpenLesson || canOpenAssignment)
          ? { to: itemPath, label: actionLabel, icon: actionIcon }
          : null;

      const badge = state === "done"
        ? { label: "Completed", tone: "success" }
        : state === "current"
          ? { label: "Up next", tone: "active" }
          : { label: "Locked", tone: "muted" };

      const marksLabel = score === null || score === undefined
        ? "Result not available yet"
        : `${round1(score)}% best score`;

      return {
        key: `${kind}-${moduleId ?? assignmentId ?? index}`,
        moduleId,
        assignmentId,
        kind,
        number: Number(item?.order) || index + 1,
        state,
        title: item?.title || `Learning step ${index + 1}`,
        score: score === null || score === undefined ? null : Number(score),
        description: scoreText,
        ring: { value: score === null || score === undefined ? null : Number(score), label: "Best score", marks: marksLabel },
        badge,
        cta,
        lockedText: state === "locked" ? "Complete the previous step first" : null,
        icon: kind === "coding" ? Code2 : kind === "final" ? Flag : BookOpen,
      };
    }
  );

  const nextStep = steps.find((step) => step.state === "current" && step.cta) || null;
  const coursePassed = performance?.isPassed === true;

  return {
    course,
    isIT,
    status: chapter?.status || "not_started",
    stats,
    marks: {
      topics: optionalNumber(topicBreakdown?.outOf),
      final: optionalNumber(finalBreakdown?.outOf),
    },
    assessment: {
      topicMarks: optionalNumber(topicBreakdown?.marks),
      finalMarks: optionalNumber(finalBreakdown?.marks),
      totalMarks: optionalNumber(performance?.combinedMarks),
      outOf: optionalNumber(performance?.outOf),
      overallPercentage: optionalNumber(performance?.overallPercentage),
      passMark: optionalNumber(performance?.passMark) ?? 80,
      passed: coursePassed,
    },
    attemptTracker: chapter?.attemptTracker ?? null,
    coursePassed,
    coursePath,
    steps,
    nextStep,
    overall: optionalNumber(performance?.overallPercentage),
    nextTopicName: chapter?.nextTopicName || null,
    categoryName: chapter?.categoryName || "",
  };
}

/** One friendly sentence about where the student is in this chapter. */
function chapterStory(model) {
  if (model.coursePassed) return "Course completed. You have achieved the required overall score.";
  if (model.stats.total === 0) return "You are enrolled in this course. Your lessons and learning activities will appear here once they are available.";
  if (model.stats.done === 0) return "Start with the first available lesson to begin making progress in this course.";
  if (model.nextStep) return `You have completed ${model.stats.done} of ${model.stats.total} topics. Next, continue with ${model.nextStep.title}.`;
  return `You have completed ${model.stats.done} of ${model.stats.total} topics. Continue learning to make further progress.`;
}

/* -------------------------------------------------------------------------- */
/*  Story hero                                                                */
/* -------------------------------------------------------------------------- */

function StoryHero({ models, completedUnits, totalUnits, passedCourses, focusCourseId, overallPercentage }) {
  const hasJourneyPercentage =
    overallPercentage !== null &&
    overallPercentage !== undefined &&
    Number.isFinite(Number(overallPercentage));
  const journeyPercent = hasJourneyPercentage
    ? Number(overallPercentage)
    : percentOf(completedUnits, totalUnits);
  const focus = models.find(
    (model) => String(model.course.id) === String(focusCourseId) && model.nextStep
  ) || models.find((model) => model.nextStep) || null;
  const allPassed = models.length > 0 && passedCourses === models.length;

  let headline = "Your learning journey starts here";
  let sub = "Begin with your first lesson. Your progress will grow as you complete topics and assessments.";
  if (allPassed) {
    headline = "You have completed all your courses. Well done!";
    sub = `You have successfully completed ${passedCourses} course${passedCourses === 1 ? "" : "s"}. Review your results below or explore another course.`;
  } else if (completedUnits > 0) {
    headline = `You are ${Math.round(journeyPercent)}% through your learning journey`;
    sub = `You have completed ${completedUnits} of ${totalUnits} topics across ${models.length} course${models.length === 1 ? "" : "s"}. Review your progress and next steps below.`;
  }

  return (
    <section className="relative mt-5 overflow-hidden rounded-[26px] bg-gradient-to-br from-[#0B5960] via-[#0E4C52] to-[#123F45] p-6 text-white shadow-[0_18px_50px_rgba(11,89,96,0.22)] sm:p-9">
      <div aria-hidden="true" className="sp-float-slow pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[#F2C35B]/15 blur-2xl" />
      <div aria-hidden="true" className="sp-float pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-[#4FA3A0]/20 blur-3xl" />
      <Mountain aria-hidden="true" size={150} strokeWidth={1} className="pointer-events-none absolute -bottom-6 right-6 hidden text-white/[0.06] sm:block" />
      {allPassed && (
        <>
          <Sparkles aria-hidden="true" size={18} className="sp-spark absolute left-[48%] top-8 text-[#F2C35B]" />
          <Sparkles aria-hidden="true" size={14} className="sp-spark absolute right-[22%] top-20 text-[#F2C35B]" style={{ animationDelay: "0.8s" }} />
          <Sparkles aria-hidden="true" size={12} className="sp-spark absolute bottom-12 left-[40%] text-[#F2C35B]" style={{ animationDelay: "1.5s" }} />
        </>
      )}

      <div className="relative grid gap-7 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)] lg:items-center">
        <div>
          <p className="sp-hero-1 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold text-[#F6D88B]">
            <Sparkles size={13} /> Your learning overview
          </p>
          <h2 className="sp-hero-2 mt-4 max-w-xl text-2xl font-extrabold leading-tight sm:text-[34px] sm:leading-[1.15]">{headline}</h2>
          <p className="sp-hero-3 mt-3 max-w-lg text-sm leading-6 text-[#C6DEDC]">{sub}</p>

          <div className="sp-hero-4 mt-6">
            <p className="text-[11px] font-bold text-[#9FC7C5]">Your course progress</p>
            <ol className="mt-3 flex flex-wrap items-center gap-y-2">
              {models.map((m, index) => {
                const state = m.coursePassed ? "done" : m.stats.done > 0 ? "current" : "locked";
                return (
                  <li key={m.course.id} className="flex items-center">
                    <span
                      title={m.course.name}
                      className={`flex h-8 max-w-[190px] items-center gap-2 rounded-full border px-3 text-[11px] font-bold ${state === "done"
                        ? "border-[#F2C35B] bg-[#F2C35B] text-[#4A3305]"
                        : state === "current"
                          ? "sp-pulse border-[#F2C35B]/70 bg-[#F2C35B]/15 text-[#F6D88B]"
                          : "border-white/15 bg-white/5 text-[#9FC7C5]"
                        }`}
                    >
                      {state === "done" ? <CheckCircle2 size={13} /> : <span>{pad2(index + 1)}</span>}
                      <span className="truncate">{m.course.name}</span>
                    </span>
                    {index < models.length - 1 && <span aria-hidden="true" className="mx-1.5 h-px w-4 bg-white/20" />}
                  </li>
                );
              })}
            </ol>
          </div>
        </div>

        <div className="sp-hero-4 flex flex-col items-center gap-5 sm:flex-row lg:flex-col lg:items-stretch">
          <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm lg:justify-between">
            <ScoreRing value={journeyPercent} label="Journey" ariaLabel="Overall journey completion" size={104} dark />
            <div>
              <p className="text-[11px] font-bold text-[#9FC7C5]">Topics completed</p>
              <p className="mt-1 text-2xl font-extrabold">
                <AnimatedNumber value={completedUnits} />
                <span className="text-base font-bold text-[#9FC7C5]"> / {totalUnits}</span>
              </p>
            </div>
          </div>

          {focus ? (
            <div className="w-full rounded-2xl bg-[#FFF8E6] p-4 text-[#123F45] shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
              <p className="flex items-center gap-1.5 text-[11px] font-extrabold text-[#94650C]">
                <Target size={13} /> Your next learning step
              </p>
              <p className="mt-1.5 text-sm font-extrabold leading-snug">{focus.nextStep.title}</p>
              <p className="mt-0.5 truncate text-[11px] text-[#74898B]">in {focus.course.name}</p>
              <Link
                to={focus.nextStep.cta.to}
                style={{ color: "#3F2B03" }}
                className="sp-cta mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#E8B33D] px-4 py-2.5 text-xs font-extrabold transition hover:bg-[#F0BD4C] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0B5960]"
              >
                {focus.nextStep.cta.label} <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-xs leading-5 text-[#C6DEDC]">
              {allPassed ? "You have completed your current courses. Explore another course to continue building your skills." : "Choose a course to view your progress and next learning steps."}
              <Link to="/student/topics" style={{ color: "#F6D88B" }} className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-extrabold hover:underline">
                Explore courses <ArrowRight size={13} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Roadmap: winding trail with one stop per step                             */
/* -------------------------------------------------------------------------- */

const ROW_H = 156;
const TOP_PAD = 40;
const NODE_CENTER = 30;

function buildTrail(points, upTo, width) {
  if (upTo < 1 || points.length < 2) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i <= upTo; i += 1) {
    const a = points[i - 1];
    const b = points[i];
    if (a.row === b.row) {
      const mx = (a.x + b.x) / 2;
      d += ` C ${mx} ${a.y} ${mx} ${b.y} ${b.x} ${b.y}`;
    } else {
      const dir = a.x > width / 2 ? 1 : -1;
      const bulge = Math.min(72, (width / Math.max(2, Math.round(width / 150))) * 0.55) * dir;
      d += ` C ${a.x + bulge} ${a.y} ${b.x + bulge} ${b.y} ${b.x} ${b.y}`;
    }
  }
  return d;
}

function RoadmapNode({ step, index, x, y, boxW, selected, shown, onSelect }) {
  const isFinal = step.kind === "final";
  const size = isFinal ? 66 : 56;
  const Icon = step.icon;

  const tone =
    step.state === "done"
      ? { bg: "#0B5960", fg: "#FFFFFF" }
      : step.state === "current"
        ? { bg: "#E8B33D", fg: "#3F2B03" }
        : { bg: "#EEF2F1", fg: "#9AA9A9" };

  let inner;
  if (step.state === "locked") inner = <LockKeyhole size={isFinal ? 24 : 20} />;
  else if (step.state === "done") inner = isFinal ? <Trophy size={26} /> : Icon ? <Icon size={22} /> : <CheckCircle2 size={24} />;
  else if (Icon) inner = <Icon size={isFinal ? 26 : 22} />;
  else inner = <span className="text-base font-extrabold">{step.number}</span>;

  return (
    <div
      className="absolute flex flex-col items-center"
      style={{
        left: x - boxW / 2,
        top: y - NODE_CENTER - (size - 56) / 2,
        width: boxW,
        opacity: shown ? 1 : 0,
        transform: shown ? "none" : "translateY(14px) scale(.7)",
        transition: `opacity .5s ease ${300 + index * 110}ms, transform .6s cubic-bezier(.2,.9,.3,1.3) ${300 + index * 110}ms`,
      }}
    >
      {step.state === "current" && (
        <span
          className="sp-bob absolute -top-7 whitespace-nowrap rounded-full bg-[#123F45] px-2.5 py-1 text-[10px] font-extrabold text-[#F6D88B] shadow-[0_6px_14px_rgba(18,63,69,0.25)]"
          style={{ zIndex: 2 }}
        >
          You are here
          <span aria-hidden="true" className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-[#123F45]" />
        </span>
      )}

      <button
        type="button"
        onClick={() => onSelect(step.key)}
        aria-pressed={selected}
        aria-label={`${step.title}: ${step.badge.label}`}
        className={`sp-node flex items-center justify-center rounded-full border-4 border-white focus:outline-none focus-visible:ring-4 focus-visible:ring-[#E8B33D]/60 ${step.state === "current" ? "sp-pulse" : ""}`}
        style={{
          width: size,
          height: size,
          background: tone.bg,
          color: tone.fg,
          boxShadow: selected
            ? "0 0 0 4px rgba(11,89,96,0.22), 0 10px 22px rgba(18,63,69,0.2)"
            : "0 6px 16px rgba(18,63,69,0.14)",
        }}
      >
        {inner}
      </button>

      <span
        className="mt-2 text-center text-[11px] font-bold leading-4"
        style={{
          color: step.state === "locked" ? "#839496" : "#234B50",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {step.title}
      </span>
    </div>
  );
}

function Roadmap({ steps, selectedKey, onSelect }) {
  const [wrapRef, width] = useElementWidth();
  const [revealRef, shown] = useReveal(0.2);

  const cols = Math.max(2, Math.min(6, Math.floor(width / 150)));
  const colW = width / cols;
  const rows = Math.ceil(steps.length / cols);
  const height = TOP_PAD + rows * ROW_H;
  const boxW = Math.max(80, Math.min(132, colW - 10));

  const points = useMemo(
    () =>
      steps.map((_, i) => {
        const row = Math.floor(i / cols);
        let col = i % cols;
        if (row % 2 === 1) col = cols - 1 - col;
        return {
          x: (col + 0.5) * colW,
          y: TOP_PAD + row * ROW_H + NODE_CENTER + (i % 2 === 0 ? -8 : 8),
          row,
        };
      }),
    [steps, cols, colW]
  );

  const firstOpen = steps.findIndex((s) => s.state !== "done");
  const progressTo = firstOpen === -1 ? steps.length - 1 : firstOpen;
  const fullTrail = width ? buildTrail(points, steps.length - 1, width) : "";
  const doneTrail = width ? buildTrail(points, progressTo, width) : "";

  return (
    <div ref={revealRef}>
      <div
        ref={wrapRef}
        className="relative overflow-hidden rounded-[22px] border border-[#E3ECEA] bg-[#F7FAF9]"
        style={{
          height: width ? height : 220,
          backgroundImage: "radial-gradient(#DCE7E5 1.2px, transparent 1.2px)",
          backgroundSize: "22px 22px",
        }}
      >
        {width > 0 && (
          <>
            <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="absolute inset-0" aria-hidden="true">
              {/* faint trail for the whole route */}
              <path d={fullTrail} fill="none" stroke="#CBD9D7" strokeWidth="5" strokeLinecap="round" strokeDasharray="1 12" />
              {/* glow + solid trail for the part already walked */}
              {doneTrail && (
                <>
                  <path
                    d={doneTrail}
                    fill="none"
                    stroke="#E8B33D"
                    strokeOpacity="0.22"
                    strokeWidth="16"
                    strokeLinecap="round"
                    pathLength="1"
                    strokeDasharray="1"
                    strokeDashoffset={shown ? 0 : 1}
                    style={{ transition: "stroke-dashoffset 1.8s cubic-bezier(.4,.1,.2,1) .2s" }}
                  />
                  <path
                    d={doneTrail}
                    fill="none"
                    stroke="#0B5960"
                    strokeWidth="6"
                    strokeLinecap="round"
                    pathLength="1"
                    strokeDasharray="1"
                    strokeDashoffset={shown ? 0 : 1}
                    style={{ transition: "stroke-dashoffset 1.8s cubic-bezier(.4,.1,.2,1) .2s" }}
                  />
                </>
              )}
              {/* flowing gold dashes from the last finished stop toward the next one */}
              {progressTo < steps.length && points[progressTo - 1] && points[progressTo] && (
                <path
                  d={`M ${points[progressTo - 1].x} ${points[progressTo - 1].y} ${buildTrail(
                    [points[progressTo - 1], points[progressTo]],
                    1,
                    width
                  ).replace(/^M [\d.-]+ [\d.-]+/, "")}`}
                  fill="none"
                  stroke="#E8B33D"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray="6 18"
                  className="sp-flow"
                  opacity={shown ? 1 : 0}
                  style={{ transition: "opacity .4s ease 2s" }}
                />
              )}
            </svg>

            {steps.map((step, i) => (
              <RoadmapNode
                key={step.key}
                step={step}
                index={i}
                x={points[i].x}
                y={points[i].y}
                boxW={boxW}
                selected={selectedKey === step.key}
                shown={shown}
                onSelect={onSelect}
              />
            ))}
          </>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11px] font-semibold text-[#60797C]">
        <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-[#0B5960]" /> Completed</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-[#E8B33D]" /> Up next</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-[#DCE5E3]" /> Locked</span>
        <span className="text-[#829596]">Select a topic or assessment to view its details.</span>
      </div>
    </div>
  );
}

/** Compact score circle for the selected stop's card. */
function StepScoreRing({ ring }) {
  if (!ring) return null;
  const has = ring.value !== null && ring.value !== undefined;
  const size = 68;
  return has ? (
    <ScoreRing
      value={ring.value}
      label=""
      ariaLabel={`${ring.label}: ${ring.value}%`}
      size={size}
      color={ring.value >= 80 ? "#0B5960" : "#E8B33D"}
    />
  ) : (
    <div
      className="flex shrink-0 items-center justify-center rounded-full border-[6px] border-[#E8EFEE] bg-white text-lg font-extrabold text-[#B5C3C4]"
      style={{ width: size, height: size }}
      role="img"
      aria-label="Not scored yet"
    >
      –
    </div>
  );
}

/** Details of whichever stop is selected on the roadmap. */
function StepDetail({ step }) {
  const tone = step.state === "done" ? "#0B5960" : step.state === "current" ? "#E8B33D" : "#C9D6D4";
  const hasScore = step.ring && step.ring.value !== null && step.ring.value !== undefined;
  return (
    <div
      key={step.key}
      className={`mt-4 rounded-[18px] border px-4 py-3.5 sm:px-5 ${step.state === "current" ? "border-[#E9CD83] bg-[#FFFCF4]" : step.state === "done" ? "border-[#DFECE7] bg-[#FBFDFC]" : "border-[#E9EFEE] bg-[#FAFBFB]"
        }`}
      style={{ animation: "spRise .45s cubic-bezier(.2,.7,.2,1) both", borderLeft: `5px solid ${tone}` }}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <StepScoreRing ring={step.ring} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[11px] font-extrabold text-[#A77916]">
                {step.kind === "topic" ? `Topic ${step.number}` : step.kind === "coding" ? "Practical assessment" : "Final assessment"}
              </p>
              <StatusPill label={step.badge.label} tone={step.badge.tone} />
              {hasScore && <StatusPill label={step.ring.marks} tone="info" />}
            </div>
            <h4 className="mt-1 text-base font-extrabold leading-snug text-[#123F45]">{step.title}</h4>
            <p className="mt-0.5 text-xs leading-5 text-[#74898B]">{step.description}</p>
          </div>
        </div>

        <div className="shrink-0">
          <StepAction step={step} />
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Analytics widgets                                                         */
/* -------------------------------------------------------------------------- */

function TopicScoreChart({ steps }) {
  const [ref, shown] = useReveal();
  const topics = steps.filter((s) => s.kind === "topic");
  const maxH = 96;

  return (
    <div ref={ref} className="rounded-[18px] border border-[#E7EEEC] bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-extrabold text-[#A77916]">Quiz performance</p>
          <h3 className="mt-1 text-sm font-extrabold text-[#123F45]">Best score per topic</h3>
        </div>
        <TrendingUp size={18} className="text-[#0B5960]" />
      </div>

      {topics.length === 0 ? (
        <div className="mt-4 flex h-[118px] items-center justify-center rounded-xl bg-[#F8FAFA] px-4 text-center text-[11px] text-[#829596]">
          Complete a topic quiz to see your score here.
        </div>
      ) : (
        <div className="relative mt-4" style={{ height: maxH + 22 }}>
          {/* 80% guide line */}
          <div aria-hidden="true" className="absolute left-0 right-0 border-t border-dashed border-[#E0B85A]" style={{ bottom: 22 + maxH * 0.8 }}>
            <span className="absolute -top-4 right-0 text-[9px] font-bold text-[#A77916]">80%</span>
          </div>
          <div className="absolute inset-x-0 bottom-0 flex items-end gap-1.5" style={{ height: maxH + 22 }}>
            {topics.map((t, i) => {
              const has = t.score !== null && t.score !== undefined;
              const h = has ? Math.max(6, (t.score / 100) * maxH) : 6;
              return (
                <div key={t.key} className="flex min-w-0 flex-1 flex-col items-center justify-end" title={`${t.title}: ${has ? `${t.score}%` : "not attempted"}`} style={{ height: "100%" }}>
                  {has && <span className="mb-1 text-[9px] font-extrabold tabular-nums text-[#234B50]">{t.score}</span>}
                  <div
                    className="w-full max-w-[26px] rounded-t-md"
                    style={{
                      height: shown ? h : 0,
                      background: has ? (t.score >= 80 ? "#0B5960" : "#E8B33D") : "#E8EFEE",
                      transition: `height .9s cubic-bezier(.2,.7,.2,1) ${i * 70}ms`,
                    }}
                  />
                  <span className="mt-1.5 h-3 text-[9px] font-bold text-[#829596]">{i + 1}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <p className="mt-2 text-[10px] leading-5 text-[#829596]">
        Teal bars show scores of 80% or higher. Gold bars show scores below 80%. The line is a guide; your course result is based on the overall marks above.
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Course card                                                               */
/* -------------------------------------------------------------------------- */

function CourseChapterCard({ model, courseNumber }) {
  const {
    course,
    isIT,
    status,
    stats,
    marks,
    assessment,
    attemptTracker,
    coursePassed,
    coursePath,
    steps,
    overall,
  } = model;
  const statusLabel = coursePassed
    ? "Course passed"
    : status === "in_progress" || stats.done > 0
      ? "In progress"
      : "Not started";
  const statusTone = coursePassed ? "success" : stats.done > 0 ? "active" : "muted";

  const [pickedKey, setPickedKey] = useState(null);
  const defaultStep =
    steps.find((step) => step.state === "current") ||
    [...steps].reverse().find((step) => step.state === "done") ||
    steps[0] ||
    null;
  const selected = steps.find((step) => step.key === pickedKey) || defaultStep;
  const trackerEntries =
    attemptTracker && typeof attemptTracker === "object" && !Array.isArray(attemptTracker)
      ? Object.entries(attemptTracker).filter(
        ([key, value]) =>
          Object.prototype.hasOwnProperty.call(ATTEMPT_LABELS, key) &&
          (value === null || ["string", "number", "boolean"].includes(typeof value))
      )
      : [];
  const passMark = assessment.passMark ?? 80;

  return (
    <Reveal>
      <Card className="overflow-hidden border-[#E5ECEA] p-0 shadow-[0_8px_28px_rgba(21,57,58,0.045)]">
        <div className="relative border-b border-[#E8EFED] bg-gradient-to-br from-[#FBFCFC] to-[#F4F9F8] px-5 py-5 sm:px-6">
          {coursePassed && <Sparkles aria-hidden="true" size={16} className="sp-spark absolute right-6 top-4 text-[#E4B33E]" />}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#EAF3F2] text-[#0B5960]">
                {isIT ? <GraduationCap size={21} /> : <BookOpen size={21} />}
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[11px] font-extrabold text-[#A77916]">
                    Course {courseNumber} · {course.category || "Course"}
                  </p>
                  <StatusPill label={statusLabel} tone={statusTone} />
                </div>
                <h2 className="mt-1 text-lg font-extrabold text-[#123F45] sm:text-xl">{course.name}</h2>
                <p className="mt-1 max-w-md text-xs leading-5 text-[#60797C]">{chapterStory(model)}</p>
                <p className="mt-1 text-[11px] text-[#829596]">
                  {stats.done} of {stats.total} topics completed
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between gap-4 sm:justify-end">
              <div className="min-w-0 sm:text-right">
                <p className="text-[11px] font-bold text-[#829596]">Overall course score</p>
                <p className="mt-1 text-sm font-extrabold text-[#234B50]">
                  {assessment.totalMarks === null ? "—" : round1(assessment.totalMarks)} / {assessment.outOf > 0 ? round1(assessment.outOf) : "—"} marks
                </p>
                <p className="mt-0.5 text-[10px] text-[#829596]">Pass mark: {passMark}% overall</p>
              </div>
              <ScoreRing value={overall} />
            </div>
          </div>

          {coursePassed && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-[#D8EAE1] bg-[#F0F8F4] px-3.5 py-3 text-[11px] font-bold text-[#28765E]">
              <Award size={15} /> Congratulations! You have passed this course.
            </div>
          )}
        </div>

        <div className="p-5 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-[11px] font-extrabold text-[#A77916]">Your learning journey</p>
              <h3 className="mt-1 text-base font-extrabold text-[#123F45]">Learning roadmap</h3>
            </div>
            <Link to={coursePath} style={{ color: "#0B5960" }} className="inline-flex items-center gap-1 text-[11px] font-extrabold hover:underline">
              Open My Learning <ArrowRight size={13} />
            </Link>
          </div>

          {steps.length > 0 ? (
            <>
              <Roadmap steps={steps} selectedKey={selected?.key} onSelect={setPickedKey} />
              {selected && <StepDetail step={selected} />}
            </>
          ) : (
            <div className="rounded-[18px] border border-dashed border-[#DCE7E5] bg-[#F8FAFA] px-4 py-7 text-center">
              <BookOpen size={22} className="mx-auto text-[#829596]" />
              <p className="mt-2 text-sm font-bold text-[#365B5F]">Your learning path will appear here</p>
              <p className="mt-1 text-xs text-[#829596]">Your lessons and assessments are not available yet. Please check back soon.</p>
            </div>
          )}

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <div className="rounded-[18px] border border-[#E7EEEC] bg-[#FBFCFC] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-extrabold text-[#A77916]">Your results</p>
                  <h3 className="mt-1 text-sm font-extrabold text-[#123F45]">Marks breakdown</h3>
                </div>
                <BarChart3 size={18} className="text-[#0B5960]" />
              </div>
              <div className="mt-4 space-y-4">
                <MarkRow label="Topic quizzes" earned={assessment.topicMarks} total={marks.topics} />
                <MarkRow label="Final assessment" earned={assessment.finalMarks} total={marks.final} tone="gold" />
              </div>
              <div className="mt-4 border-t border-[#E6EDEB] pt-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#60797C]">Overall score</span>
                  <span className="text-base font-extrabold text-[#123F45]">{overall === null ? "—" : `${round1(overall)}%`}</span>
                </div>
                <p className="mt-1 text-[10px] leading-5 text-[#829596]">
                  {assessment.topicMarks !== null || assessment.finalMarks !== null
                    ? "These results show the marks you have earned so far in this course."
                    : "Your marks will appear here once your assessments have been reviewed."}
                </p>
              </div>
            </div>

            <TopicScoreChart steps={steps} />

            <div className="flex flex-col gap-4">
              <div className="rounded-[18px] border border-[#E7EEEC] bg-white p-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FFF5DE] text-[#94650C]"><Target size={16} /></span>
                  <div>
                    <p className="text-[11px] font-extrabold text-[#A77916]">Final assessment</p>
                    <h3 className="text-sm font-extrabold text-[#123F45]">Assessment attempts</h3>
                  </div>
                </div>
                {trackerEntries.length > 0 ? (
                  <div className="mt-4 space-y-2">
                    {trackerEntries.map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between gap-3 border-b border-[#F0F3F2] pb-2 text-[10px] last:border-0">
                        <span className="font-semibold text-[#74898B]">{formatAttemptLabel(key)}</span>
                        <span className="font-extrabold text-[#234B50]">{formatAttemptValue(key, value)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 rounded-xl bg-[#F7FAF9] px-3 py-3 text-[10px] leading-5 text-[#829596]">
                    Your assessment attempt details are being prepared and will appear here once available.
                  </p>
                )}
                <p className="mt-3 text-[10px] leading-5 text-[#829596]">
                  Your final assessment score will appear here once your submission has been reviewed.
                </p>
              </div>

              <LinkButton to={coursePath} variant="outline" icon={BookOpen} className="w-full">
                Continue this course
              </LinkButton>
            </div>
          </div>
        </div>
      </Card>
    </Reveal>
  );
}

/* -------------------------------------------------------------------------- */
/*  Loading skeleton — mirrors the MyLearning loading experience              */
/* -------------------------------------------------------------------------- */

function MyAnalyticsLoading() {
  const loadingIndicator = (
    <div className="inline-flex items-center gap-2.5 rounded-full border border-[#E6ECEB] bg-white/90 px-3.5 py-2 text-[11px] font-semibold text-[#718486] shadow-[0_3px_12px_rgba(6,66,75,0.035)]">
      <span
        aria-hidden="true"
        className="h-4 w-4 animate-spin rounded-full border-2 border-[#E8EFEE] border-t-[#FFAB0B]"
      />
      <span>Loading your learning progress...</span>
    </div>
  );

  return (
    <div
      className="mx-auto w-full max-w-[1320px] space-y-6"
      role="status"
      aria-label="Loading your learning progress"
      aria-busy="true"
    >
      {/* Page header skeleton + the same inline loading indicator as MyLearning. */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full animate-pulse space-y-3">
          <div className="h-7 w-48 rounded-lg bg-[#E9EFEE]" />
          <div className="h-3 w-full max-w-[520px] rounded-full bg-[#EEF2F1]" />
        </div>
        {loadingIndicator}
      </div>

      {/* Story hero skeleton — keeps the dark analytics hero proportions. */}
      <section className="animate-pulse overflow-hidden rounded-[26px] bg-gradient-to-br from-[#0B5960] via-[#0E4C52] to-[#123F45] p-6 shadow-[0_18px_50px_rgba(11,89,96,0.12)] sm:p-9">
        <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(260px,340px)] lg:items-center">
          <div className="space-y-4">
            <div className="h-6 w-36 rounded-full bg-white/15" />
            <div className="h-8 w-3/4 max-w-[460px] rounded-lg bg-white/20" />
            <div className="h-3 w-full max-w-[600px] rounded-full bg-white/15" />
            <div className="h-3 w-4/5 max-w-[500px] rounded-full bg-white/15" />
            <div className="flex flex-wrap gap-3 pt-2">
              <div className="h-10 w-32 rounded-xl bg-white/15" />
              <div className="h-10 w-36 rounded-xl bg-white/15" />
            </div>
          </div>
          <div className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.07] p-4 sm:grid-cols-[100px_minmax(0,1fr)] sm:items-center">
            <div className="mx-auto h-[100px] w-[100px] rounded-full border-[10px] border-white/15 border-t-[#F2C35B] sm:mx-0" />
            <div className="space-y-3">
              <div className="h-3 w-28 rounded-full bg-white/20" />
              <div className="h-7 w-32 rounded-lg bg-white/20" />
              <div className="h-3 w-full rounded-full bg-white/15" />
              <div className="h-10 w-full rounded-xl bg-[#F2C35B]/30" />
            </div>
          </div>
        </div>
      </section>

      {/* Four metric cards — same responsive grid as the real page. */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse rounded-[22px] border border-[#E6ECEB] bg-white p-4 shadow-[0_6px_22px_rgba(6,66,75,0.025)] sm:p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-3">
                <div className="h-3 w-28 rounded-full bg-[#EEF2F1]" />
                <div className="h-8 w-20 rounded-lg bg-[#E9EFEE]" />
                <div className="h-2.5 w-36 max-w-full rounded-full bg-[#F1F4F3]" />
              </div>
              <div className="h-10 w-10 rounded-xl bg-[#EEF3F4]" />
            </div>
          </div>
        ))}
      </div>

      {/* Roadmap heading skeleton. */}
      <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-end sm:justify-between">
        <div className="animate-pulse space-y-2">
          <div className="h-3 w-28 rounded-full bg-[#F1E7D2]" />
          <div className="h-5 w-48 rounded-md bg-[#E9EFEE]" />
          <div className="h-3 w-full max-w-[480px] rounded-full bg-[#EEF2F1]" />
        </div>
        <div className="h-10 w-56 animate-pulse rounded-xl border border-[#E6ECEB] bg-white" />
      </div>

      {/* Course cards — the skeleton follows the real course-progress layout. */}
      <div className="space-y-6">
        {Array.from({ length: 2 }).map((_, courseIndex) => (
          <section
            key={courseIndex}
            className="overflow-hidden rounded-[22px] border border-[#E5ECEA] bg-white shadow-[0_8px_28px_rgba(21,57,58,0.035)]"
          >
            <div className="animate-pulse border-b border-[#E8EFED] bg-[#F7FAF9] p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <div className="h-11 w-11 shrink-0 rounded-[14px] bg-[#EAF3F2]" />
                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="h-3 w-40 rounded-full bg-[#F1E7D2]" />
                    <div className="h-5 w-2/3 max-w-[360px] rounded-md bg-[#E9EFEE]" />
                    <div className="h-3 w-full max-w-[460px] rounded-full bg-[#EEF2F1]" />
                  </div>
                </div>
                <div className="flex items-center gap-4 sm:justify-end">
                  <div className="space-y-2">
                    <div className="h-3 w-28 rounded-full bg-[#E9EFEE]" />
                    <div className="h-4 w-24 rounded-md bg-[#E9EFEE]" />
                  </div>
                  <div className="h-[86px] w-[86px] shrink-0 rounded-full border-[9px] border-[#EEF3F4] border-t-[#F5DDA6]" />
                </div>
              </div>
            </div>

            <div className="grid gap-5 p-5 sm:p-6 xl:grid-cols-[minmax(0,1fr)_300px]">
              <div className="space-y-4">
                <div className="animate-pulse space-y-2">
                  <div className="h-3 w-44 rounded-full bg-[#F1E7D2]" />
                  <div className="h-5 w-40 rounded-md bg-[#E9EFEE]" />
                </div>
                <div className="animate-pulse rounded-[22px] border border-[#E3ECEA] bg-[#F7FAF9] p-5">
                  <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
                    {Array.from({ length: 4 }).map((__, index) => (
                      <div key={index} className="flex flex-col items-center gap-3">
                        <div className="h-14 w-14 rounded-full border-[6px] border-[#E8EFEE] border-t-[#E8B33D]" />
                        <div className="h-3 w-20 rounded-full bg-[#E9EFEE]" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  {Array.from({ length: 2 }).map((__, index) => (
                    <div key={index} className="animate-pulse rounded-[18px] border border-[#E7EEEC] bg-white p-4">
                      <div className="h-3 w-28 rounded-full bg-[#F1E7D2]" />
                      <div className="mt-2 h-4 w-36 rounded-md bg-[#E9EFEE]" />
                      <div className="mt-5 space-y-4">
                        <div className="h-2 rounded-full bg-[#EEF2F1]" />
                        <div className="h-2 rounded-full bg-[#EEF2F1]" />
                        <div className="h-2 rounded-full bg-[#EEF2F1]" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <aside className="animate-pulse space-y-4">
                <div className="h-[170px] rounded-[18px] border border-[#E7EEEC] bg-[#F8FAFA] p-4">
                  <div className="h-4 w-36 rounded-md bg-[#E9EFEE]" />
                  <div className="mt-5 h-3 w-full rounded-full bg-[#EEF2F1]" />
                  <div className="mt-3 h-3 w-4/5 rounded-full bg-[#EEF2F1]" />
                  <div className="mt-6 h-9 w-full rounded-xl bg-[#EAF0EF]" />
                </div>
                <div className="h-24 rounded-[18px] border border-[#E7EEEC] bg-white p-4">
                  <div className="h-3 w-32 rounded-full bg-[#E9EFEE]" />
                  <div className="mt-4 h-3 w-full rounded-full bg-[#EEF2F1]" />
                </div>
              </aside>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Error state — same inline retry pattern as MyLearning                      */
/* -------------------------------------------------------------------------- */

function AnalyticsErrorState({ title, message, onRetry }) {
  return (
    <Card className="mt-5 px-6 py-12 text-center sm:px-10">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF1EE] text-[#A85A50]">
        <AlertCircle size={25} />
      </div>
      <h2 className="mt-4 text-xl font-extrabold text-[#06424B]">{title}</h2>
      <p className="mx-auto mt-2 max-w-[520px] text-sm leading-6 text-[#718486]">{message}</p>
      {onRetry && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#FFAB0B] px-5 text-sm font-bold text-[#06424B] transition hover:bg-[#FFC13C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#06424B] focus-visible:ring-offset-2"
          >
            <RefreshCw size={15} /> Try again
          </button>
        </div>
      )}
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main analytics page                                                      */
/* -------------------------------------------------------------------------- */

function MyAnalytics() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const requestControllerRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  }, []);

  const loadAnalytics = useCallback(async () => {
    // Cancel an earlier request before starting a retry/new request.
    requestControllerRef.current?.abort();
    const controller = new AbortController();
    requestControllerRef.current = controller;

    setLoading(true);
    setError("");

    try {
      const response = await getMyAnalytics({ signal: controller.signal });
      if (controller.signal.aborted) return;

      // Support both the direct response body and the standard data envelope.
      let payload = response?.data ?? response;
      if (payload?.success === false) {
        const responseError = new Error("The learning summary could not be prepared.");
        responseError.code = "ANALYTICS_RESPONSE_ERROR";
        throw responseError;
      }
      if (payload?.data && typeof payload.data === "object" && !Array.isArray(payload.data)) {
        payload = payload.data;
      }

      if (!payload || typeof payload !== "object" || Array.isArray(payload) || !Array.isArray(payload.chapters)) {
        const responseError = new Error("The learning summary is incomplete.");
        responseError.code = "ANALYTICS_RESPONSE_ERROR";
        throw responseError;
      }

      setAnalyticsData(payload);
    } catch (requestError) {
      // Ignore cancellation after retry, navigation or component unmount.
      if (controller.signal.aborted || requestError?.code === "ERR_CANCELED") return;

      // Keep the shared Axios interceptor responsible for session expiry.
      // This page only renders the same inline error state used by MyLearning.
      console.error("My Analytics loading error:", requestError);
      // Use the existing centralized error handler. Do not duplicate HTTP
      // status maps, network handling or timeout messages in this page.
      setError(
        getApiErrorMessage(
          requestError,
          "We couldn't load your learning progress right now. Please try again."
        )
      );
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
        if (requestControllerRef.current === controller) {
          requestControllerRef.current = null;
        }
      }
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
    return () => {
      requestControllerRef.current?.abort();
    };
  }, [loadAnalytics]);

  const summary = analyticsData?.summary || {};
  const chapters = Array.isArray(analyticsData?.chapters) ? analyticsData.chapters : [];

  const models = useMemo(() => chapters.map(buildCourseModel), [chapters]);
  const completedUnits = Number(summary.topicsCompleted) || 0;
  const totalUnits = Number(summary.totalTopics) || 0;
  const passedCourses = Number(summary.coursesPassed) || 0;
  const focusCourseId = summary?.nextStep?.courseId ?? null;
  const enrolledCourses = summary.enrolledCourses ?? chapters.length;
  const assessmentAttempts = summary.assessmentAttempts ?? null;
  const averageAssessmentScore = summary.averageAssessmentScore ?? null;

  return (
    <>
      <style>{MOTION_CSS}</style>
      <PageShell max="max-w-[1360px]">
        <div className="mx-auto w-full max-w-[1320px]">
          {loading ? (
            <>
              <MyAnalyticsLoading />
              <Loader open={loading} text="Loading your learning progress..." />
            </>
          ) : (
            <>
              <StudentPageHeader
                title="My Analytics"
                subtitle="Review your course progress, assessment results and next learning steps."
              />

              {error ? (
                <AnalyticsErrorState
                  title="We couldn't load your progress"
                  message={error}
                  onRetry={loadAnalytics}
                />
              ) : chapters.length === 0 ? (
                <Card className="mt-5 p-6 sm:p-9">
                  <EmptyState
                    icon={BarChart3}
                    title={Number(enrolledCourses) > 0 ? "Your course progress is getting ready" : "Your learning journey starts with a course"}
                    text={Number(enrolledCourses) > 0
                      ? "Your course details are still being prepared. Your lessons, assessments and progress will appear here once they are available."
                      : "You haven't enrolled in a course yet. Explore the available courses and add one to your learning space. Your progress and assessment results will appear here as you learn."}
                    action={<LinkButton to="/student/topics" variant="gold" icon={BookOpen}>Explore courses</LinkButton>}
                  />
                </Card>
              ) : (
                <>
                  <StoryHero
                    models={models}
                    completedUnits={completedUnits}
                    totalUnits={totalUnits}
                    passedCourses={passedCourses}
                    focusCourseId={focusCourseId}
                    overallPercentage={summary.overallPercentage}
                  />

                  <div className="mt-5 grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard
                      icon={GraduationCap}
                      label="Enrolled courses"
                      value={enrolledCourses}
                      helper="Courses you have joined"
                      tone="teal"
                    />
                    <MetricCard
                      icon={CheckCircle2}
                      label="Topics completed"
                      value={summary.topicsCompleted ?? null}
                      suffix={summary.totalTopics !== undefined ? `/${summary.totalTopics}` : ""}
                      helper="Across your enrolled courses"
                      tone="green"
                      delay={80}
                    />
                    <MetricCard
                      icon={ClipboardCheck}
                      label="Assessment attempts"
                      value={assessmentAttempts}
                      helper="Quizzes and assessments you have taken"
                      tone="gold"
                      delay={160}
                    />
                    <MetricCard
                      icon={Trophy}
                      label="Courses passed"
                      value={summary.coursesPassed ?? null}
                      helper="Courses where you have met the passing requirement"
                      tone="slate"
                      delay={240}
                    />
                  </div>

                  <Reveal className="mt-9 flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-extrabold text-[#A77916]">Your courses</p>
                      <h2 className="mt-1 text-lg font-extrabold text-[#123F45]">Course progress and learning paths</h2>
                      <p className="mt-1 text-xs text-[#829596]">Review each course to see completed topics, assessment results and your next learning step.</p>
                    </div>
                    <div className="flex items-center gap-2 rounded-xl border border-[#E3EBE9] bg-white px-3 py-2">
                      <TrendingUp size={15} className="text-[#0B5960]" />
                      <span className="text-[11px] font-bold text-[#60797C]">Average assessment score</span>
                      <span className="text-sm font-extrabold text-[#123F45]">
                        {averageAssessmentScore === null || averageAssessmentScore === undefined
                          ? "—"
                          : <AnimatedNumber value={averageAssessmentScore} decimals={2} suffix="%" />}
                      </span>
                    </div>
                  </Reveal>

                  <div className="mt-4 space-y-6">
                    {models.map((model, index) => (
                      <CourseChapterCard
                        key={model.course.id ?? model.course.name}
                        model={model}
                        courseNumber={pad2(index + 1)}
                      />
                    ))}
                  </div>
                </>
              )}

              <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-[#E4EBE9] pt-5">
                <p className="text-[11px] text-[#829596]">Your progress is updated as you complete lessons and assessments.</p>
                <LinkButton to="/student/my-learning" variant="outline" icon={BookOpen}>Continue learning</LinkButton>
              </div>
            </>
          )}
        </div>
      </PageShell>
    </>
  );
}

export default MyAnalytics;