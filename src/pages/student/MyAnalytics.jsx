import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
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
  RotateCcw,
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
import {
  courseCategories,
  myLearningCoursePath,
  technologies,
} from "../../data/studentLearningData";
import { useEnrolledCourses } from "../../data/studentCourseEnrollment";
import {
  bestScore,
  canAttemptFinalAssessment,
  courseAssessmentSummary,
  courseProgress,
  getCourseCycle,
  hasReadLesson,
  useProgress,
} from "../../data/studentProgress";
import {
  getFinalAssignmentForCourse,
  getQuizForCourseModule,
  getQuizForTopic,
} from "../../data/quizData";

/* -------------------------------------------------------------------------- */
/*  Constants & helpers                                                       */
/* -------------------------------------------------------------------------- */

const MARKS = {
  it: { topics: 30, coding: 20, final: 50 },
  vocational: { topics: 50, final: 50 },
};

const round1 = (value) => Math.round((Number(value) || 0) * 10) / 10;
const percentOf = (score, total) => (total > 0 ? Math.round((score / total) * 100) : 0);
const pad2 = (n) => String(n).padStart(2, "0");

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

function AnimatedNumber({ value, suffix = "" }) {
  const animated = useCountUp(value);
  return (
    <>
      {Math.round(animated)}
      {suffix}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Small UI pieces                                                           */
/* -------------------------------------------------------------------------- */

function ScoreRing({ value, label = "Overall", ariaLabel = "Overall course score", size = 86, dark = false, color }) {
  const safeValue = Math.max(0, Math.min(100, Number(value) || 0));
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
      aria-label={ariaLabel}
      aria-valuenow={safeValue}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={`flex flex-col items-center justify-center rounded-full ${dark ? "bg-[#0E4C52]" : "bg-white"}`}
        style={{ width: inner, height: inner }}
      >
        <span className={`font-extrabold leading-none ${dark ? "text-white" : "text-[#123F45]"} ${size > 100 ? "text-3xl" : size > 72 ? "text-xl" : "text-[15px]"}`}>
          {Math.round(animated)}%
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

function MetricCard({ icon: Icon, label, value, suffix = "", fallback = "—", helper, tone = "teal", delay = 0 }) {
  const tones = {
    teal: "bg-[#EAF3F2] text-[#0B5960]",
    gold: "bg-[#FFF5DE] text-[#9A6B0B]",
    green: "bg-[#EAF5EF] text-[#28765E]",
    slate: "bg-[#F0F3F3] text-[#617A7D]",
  };
  return (
    <Reveal delay={delay}>
      <Card className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold text-[#829596]">{label}</p>
            <p className="mt-2 text-[27px] font-extrabold leading-none text-[#123F45]">
              {value === null ? fallback : <AnimatedNumber value={value} suffix={suffix} />}
            </p>
            <p className="mt-2 text-[11px] font-medium text-[#829596]">{helper}</p>
          </div>
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}>
            <Icon size={19} />
          </span>
        </div>
      </Card>
    </Reveal>
  );
}

function MarkRow({ label, earned, total, tone = "teal" }) {
  const [ref, shown] = useReveal();
  const safeEarned = Math.max(0, Math.min(Number(total) || 0, Number(earned) || 0));
  const fill = total > 0 ? (safeEarned / total) * 100 : 0;
  const fillClass = tone === "gold" ? "bg-[#E8B33D]" : tone === "green" ? "bg-[#70A994]" : "bg-[#0B5960]";

  return (
    <div ref={ref}>
      <div className="mb-1.5 flex items-center justify-between gap-3 text-[11px]">
        <span className="font-semibold text-[#60797C]">{label}</span>
        <span className="font-extrabold tabular-nums text-[#234B50]">{round1(safeEarned)} / {total}</span>
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
/*  Course model: all the derived data for one course in one place            */
/* -------------------------------------------------------------------------- */

function buildCourseModel(course, progress) {
  const isIT = course.track === "it";
  const units = isIT ? course.topics || [] : course.modules || [];
  const marks = isIT ? MARKS.it : MARKS.vocational;
  const stats = courseProgress(progress, course);
  const courseCycle = getCourseCycle(progress, course.id);
  const assessment = courseAssessmentSummary(progress, course.id);
  const finalQuiz = getFinalAssignmentForCourse(course.id);
  const finalPath = finalQuiz ? `/student/quiz/${finalQuiz.slug}` : null;
  const coding = isIT ? progress.assessments?.[course.id]?.coding || null : null;
  const codingSubmitted = Boolean(coding);
  const codingEvaluated = coding?.status === "evaluated";
  const codingMarks = codingEvaluated ? Number(coding.score) || 0 : 0;
  const isDone = (unit) => Boolean(progress.completed?.[`${course.id}/${unit.id}`]);
  const allTopicsComplete = units.length > 0 && units.every(isDone);
  const finalPermission = canAttemptFinalAssessment(progress, course.id);
  const coursePassed = Boolean(progress.completedCourses?.[course.id]) || assessment.passed;
  const topicPerUnit = units.length ? marks.topics / units.length : 0;
  const topicPath = `/student/topics/${course.id}`;
  const coursePath = isIT ? myLearningCoursePath(null, course.id) : myLearningCoursePath(course.id);
  const codingPath = `/student/course-coding-assignment?course=${encodeURIComponent(course.id)}`;

  /* ---- Topic steps ---- */
  const steps = units.map((unit, index) => {
    const previous = units[index - 1];
    const completed = isDone(unit);
    const previousCompleted = !previous || isDone(previous);
    const lessonRead = hasReadLesson(progress, course.id, unit.id) || completed;
    const quiz = isIT ? getQuizForTopic(course.id, unit.id) : getQuizForCourseModule(course.id, unit.id);
    const score = quiz ? bestScore(progress, quiz.slug) : null;
    const state = completed ? "done" : previousCompleted ? "current" : "locked";
    const lessonPath = `${topicPath}/topic/${unit.id}`;

    // Students must read the lesson first; the quiz is started from inside the lesson page.
    let cta = null;
    let lockedText = null;
    if (completed) cta = { to: lessonPath, label: "Review", icon: BookOpen, muted: true };
    else if (!previousCompleted) lockedText = "Finish the previous step";
    else cta = { to: lessonPath, label: lessonRead ? "Continue lesson" : "Open lesson", icon: BookOpen };

    const badge = completed
      ? { label: "Completed", tone: "success" }
      : !previousCompleted
        ? { label: "Locked", tone: "muted" }
        : lessonRead
          ? { label: "Lesson read", tone: "active" }
          : { label: "Read lesson", tone: "info" };

    return {
      key: unit.id,
      kind: "topic",
      number: index + 1,
      state,
      title: unit.title,
      score,
      description: `${quiz?.questions?.length || 10} questions${score !== null ? "" : " · Complete the lesson and quiz to record your score"
        }`,
      ring: {
        value: score,
        label: "Best score",
        marks:
          score !== null
            ? `${round1((score / 100) * topicPerUnit)} / ${round1(topicPerUnit)} marks`
            : `${round1(topicPerUnit)} marks available`,
      },
      badge,
      cta,
      lockedText,
    };
  });

  /* ---- Coding assignment (IT only) ---- */
  if (isIT) {
    const state = codingEvaluated ? "done" : codingSubmitted || allTopicsComplete ? "current" : "locked";
    steps.push({
      key: "coding-assignment",
      kind: "coding",
      icon: Code2,
      state,
      title: "Coding assignment",
      description: codingEvaluated
        ? `Evaluated score: ${codingMarks} / 20 marks`
        : codingSubmitted
          ? "Submission received · waiting for evaluator feedback and marks"
          : "Submit your practical coding task after completing every topic quiz",
      badge: codingEvaluated
        ? { label: "Evaluated", tone: "success" }
        : codingSubmitted
          ? { label: "Submitted", tone: "info" }
          : allTopicsComplete
            ? { label: "Available", tone: "active" }
            : { label: "Locked", tone: "muted" },
      cta: codingEvaluated
        ? { to: codingPath, label: "View submission", icon: FileCheck2, muted: true }
        : codingSubmitted
          ? null
          : allTopicsComplete
            ? { to: codingPath, label: "Submit coding task", icon: Code2 }
            : null,
      ring: codingEvaluated
        ? { value: percentOf(codingMarks, marks.coding), label: "Evaluated", marks: `${codingMarks} / ${marks.coding} marks` }
        : { value: null, label: "Pending", marks: `${marks.coding} marks available` },
      pillInstead: codingSubmitted && !codingEvaluated ? { label: "Under review", tone: "info" } : null,
      lockedText: !allTopicsComplete && !codingSubmitted ? "Complete every topic first" : null,
    });
  }

  /* ---- Final assessment ---- */
  const finalState = coursePassed ? "done" : finalPermission.allowed ? "current" : "locked";
  steps.push({
    key: "final-assessment",
    kind: "final",
    icon: Flag,
    state: finalState,
    title: "Final assessment",
    description: `15 questions · ${assessment.finalAttempts} of 3 attempts used · ${assessment.attemptsRemaining} remaining. Your final score combines with your topic${isIT ? " and coding" : ""} marks. You need 80% overall to pass.`,
    badge: coursePassed
      ? { label: "Course passed", tone: "success" }
      : finalPermission.allowed
        ? { label: assessment.finalAttempts ? "Retry available" : "Ready", tone: "active" }
        : { label: "Locked", tone: "muted" },
    cta:
      !coursePassed && finalPermission.allowed && finalPath
        ? { to: finalPath, label: assessment.finalAttempts ? "Continue assessment" : "Start assessment", icon: Flag }
        : null,
    ring: {
      value: assessment.finalScore,
      label: "Best score",
      marks: `${round1(assessment.finalMarks)} / ${marks.final} marks`,
    },
    doneText: coursePassed ? "Completed" : null,
    lockedText:
      !coursePassed && !(finalPermission.allowed && finalPath)
        ? finalPermission.reason === "coding-incomplete"
          ? "Submit coding task first"
          : "Complete previous steps first"
        : null,
  });

  const nextStep = coursePassed ? null : steps.find((step) => step.state === "current" && step.cta) || null;

  return {
    course,
    isIT,
    marks,
    stats,
    courseCycle,
    assessment,
    coding: { marks: codingMarks },
    coursePassed,
    coursePath,
    steps,
    nextStep,
    overall: assessment.overallPercentage,
  };
}

/** One friendly sentence about where the student is in this chapter. */
function chapterStory(model) {
  const { coursePassed, stats, steps, nextStep, assessment } = model;
  if (coursePassed) return "Chapter complete. You reached the 80% mark, and this course is yours.";
  if (stats.done === 0) return "Your story starts here. Open the first lesson and take the first step.";
  if (nextStep?.kind === "final") {
    return assessment.finalAttempts
      ? `You are close. ${assessment.attemptsRemaining} attempt${assessment.attemptsRemaining === 1 ? "" : "s"} left to reach 80%.`
      : "Every topic is behind you. The final assessment is the last scene.";
  }
  if (nextStep?.kind === "coding") return "The lessons are done. Now show what you can build in the coding task.";
  if (steps.some((s) => s.kind === "coding" && s.state === "current" && !s.cta)) {
    return "Your code is with the evaluator. Marks will appear here once it is reviewed.";
  }
  return `${stats.done} of ${stats.total} topics done. Next up: ${nextStep?.title || "keep going"}.`;
}

/* -------------------------------------------------------------------------- */
/*  Story hero                                                                */
/* -------------------------------------------------------------------------- */

function StoryHero({ models, completedUnits, totalUnits, passedCourses }) {
  const journeyPercent = percentOf(completedUnits, totalUnits);
  const focus = models.find((m) => m.nextStep) || null;
  const allPassed = models.length > 0 && passedCourses === models.length;

  let headline = "Your learning story is just beginning";
  let sub = "Pick up your first lesson. Every topic you finish adds a new stop to your roadmap.";
  if (allPassed) {
    headline = "Every chapter complete. Well done.";
    sub = `You passed ${passedCourses} course${passedCourses === 1 ? "" : "s"} with 80% or more. Scroll down to relive the journey.`;
  } else if (completedUnits > 0) {
    headline = `You are ${journeyPercent}% through your story`;
    sub = `${completedUnits} of ${totalUnits} topics are behind you across ${models.length} course${models.length === 1 ? "" : "s"}. Here is where you stand and what comes next.`;
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
            <Sparkles size={13} /> Your learning story
          </p>
          <h2 className="sp-hero-2 mt-4 max-w-xl text-2xl font-extrabold leading-tight sm:text-[34px] sm:leading-[1.15]">{headline}</h2>
          <p className="sp-hero-3 mt-3 max-w-lg text-sm leading-6 text-[#C6DEDC]">{sub}</p>

          <div className="sp-hero-4 mt-6">
            <p className="text-[11px] font-bold text-[#9FC7C5]">Chapters on your map</p>
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
                <Target size={13} /> Your next stop
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
              {allPassed ? "Nothing left to do here. Explore a new course to start the next chapter." : "Open a course to begin your first chapter."}
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
        <span className="text-[#829596]">Tap any stop to see its details.</span>
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
                {step.kind === "topic" ? `Stop ${step.number}` : step.kind === "coding" ? "Practical" : "Finish line"}
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
      <p className="mt-2 text-[10px] leading-5 text-[#829596]">
        Teal bars are 80% or higher. Gold bars have room to grow. The 80% line is a guide; the pass mark uses your combined marks.
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Chapter card                                                              */
/* -------------------------------------------------------------------------- */

function CourseChapterCard({ model, chapterNumber }) {
  const { course, isIT, marks, stats, courseCycle, assessment, coding, coursePassed, coursePath, steps, overall } = model;
  const statusLabel = coursePassed ? "Course passed" : stats.done > 0 ? "In progress" : "Not started";
  const statusTone = coursePassed ? "success" : stats.done > 0 ? "active" : "muted";

  const [pickedKey, setPickedKey] = useState(null);
  const defaultStep =
    steps.find((s) => s.state === "current") || [...steps].reverse().find((s) => s.state === "done") || steps[0];
  const selected = steps.find((s) => s.key === pickedKey) || defaultStep;

  return (
    <Reveal>
      <Card className="overflow-hidden border-[#E5ECEA] p-0 shadow-[0_8px_28px_rgba(21,57,58,0.045)]">
        {/* Chapter header */}
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
                    Chapter {chapterNumber} · {course.category || (isIT ? "IT course" : "Vocational course")}
                  </p>
                  <StatusPill label={statusLabel} tone={statusTone} />
                </div>
                <h2 className="mt-1 text-lg font-extrabold text-[#123F45] sm:text-xl">{course.name}</h2>
                <p className="mt-1 max-w-md text-xs leading-5 text-[#60797C]">{chapterStory(model)}</p>
                <p className="mt-1 text-[11px] text-[#829596]">
                  {stats.done} of {stats.total} topics completed
                </p>              </div>
            </div>
            <div className="flex items-center justify-between gap-4 sm:justify-end">
              <div className="min-w-0 sm:text-right">
                <p className="text-[11px] font-bold text-[#829596]">Combined performance</p>
                <p className="mt-1 text-sm font-extrabold text-[#234B50]">{round1(assessment.totalMarks)} / 100 marks</p>
                <p className="mt-0.5 text-[10px] text-[#829596]">Pass mark: 80%</p>
              </div>
              <ScoreRing value={overall} />
            </div>
          </div>

          {courseCycle.lastOutcome?.type === "restarted" && (
            <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-[#F0DDB0] bg-[#FFF9EA] px-3.5 py-3 text-[11px] leading-5 text-[#806018]">
              <RotateCcw size={15} className="mt-0.5 shrink-0" />
              <p>A new cycle has started. Your previous cycle ended below 80% after all three Final Assessment attempts, so this course restarted from Topic 1. Your earlier attempt history is kept.</p>
            </div>
          )}
          {coursePassed && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-[#D8EAE1] bg-[#F0F8F4] px-3.5 py-3 text-[11px] font-bold text-[#28765E]">
              <Award size={15} /> You reached the required 80% overall score for this course.
            </div>
          )}
        </div>

        <div className="p-5 sm:p-6">
          {/* Roadmap */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-[11px] font-extrabold text-[#A77916]">Your route through this chapter</p>
              <h3 className="mt-1 text-base font-extrabold text-[#123F45]">Learning roadmap</h3>
            </div>
            <Link to={coursePath} style={{ color: "#0B5960" }} className="inline-flex items-center gap-1 text-[11px] font-extrabold hover:underline">
              Open My Learning <ArrowRight size={13} />
            </Link>
          </div>

          <Roadmap steps={steps} selectedKey={selected.key} onSelect={setPickedKey} />
          <StepDetail step={selected} />

          {/* Analytics row */}
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <div className="rounded-[18px] border border-[#E7EEEC] bg-[#FBFCFC] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-extrabold text-[#A77916]">Score analytics</p>
                  <h3 className="mt-1 text-sm font-extrabold text-[#123F45]">Marks breakdown</h3>
                </div>
                <BarChart3 size={18} className="text-[#0B5960]" />
              </div>
              <div className="mt-4 space-y-4">
                <MarkRow label="Topic quizzes" earned={assessment.topicMarks} total={marks.topics} />
                {isIT && <MarkRow label="Coding assignment" earned={coding.marks} total={marks.coding} tone="green" />}
                <MarkRow label="Final assessment" earned={assessment.finalMarks} total={marks.final} tone="gold" />
              </div>
              <div className="mt-4 border-t border-[#E6EDEB] pt-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#60797C]">Overall score</span>
                  <span className="text-base font-extrabold text-[#123F45]">{overall}%</span>
                </div>
                <p className="mt-1 text-[10px] leading-5 text-[#829596]">Passing needs 80% from all weighted course assessments combined. The Final Assessment has no separate 80% pass mark.</p>
              </div>
            </div>

            <TopicScoreChart steps={steps} />

            <div className="flex flex-col gap-4">
              <div className="rounded-[18px] border border-[#E7EEEC] bg-white p-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FFF5DE] text-[#94650C]"><Target size={16} /></span>
                  <div>
                    <p className="text-[11px] font-extrabold text-[#A77916]">Final assessment</p>
                    <h3 className="text-sm font-extrabold text-[#123F45]">Attempt tracker</h3>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className={`h-2.5 flex-1 rounded-full ${i < assessment.finalAttempts ? "bg-[#0B5960]" : "bg-[#E8EFEE]"}`} />
                  ))}
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px] font-bold text-[#74898B]">
                  <span>{assessment.finalAttempts} used</span>
                  <span>{assessment.attemptsRemaining} remaining</span>
                </div>
                <p className="mt-3 text-[10px] leading-5 text-[#829596]">You get three attempts in each course cycle. If the combined result is still below 80%, the course restarts from the first topic.</p>
                {assessment.finalScore !== null && (
                  <div className="mt-3 rounded-lg bg-[#F5F8F7] px-3 py-2 text-[11px] font-bold text-[#365B5F]">
                    Best final assessment score: {assessment.finalScore}%
                  </div>
                )}
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
function MyAnalytics() {
  const progress = useProgress();
  const { enrolledCourseIds } = useEnrolledCourses();
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }, []);


  const enrolledCourses = useMemo(() => {
    const vocationalCourses = courseCategories
      .filter((course) => course.type === "vocational" && enrolledCourseIds.includes(course.id))
      .map((course) => ({ ...course, track: "vocational" }));
    const technologyCourses = technologies
      .filter((technology) => enrolledCourseIds.includes(technology.id))
      .map((technology) => ({ ...technology, track: "it" }));
    return [...vocationalCourses, ...technologyCourses];
  }, [enrolledCourseIds]);

  const models = useMemo(
    () => enrolledCourses.map((course) => buildCourseModel(course, progress)),
    [enrolledCourses, progress]
  );

  const analytics = useMemo(() => {
    const courseIds = new Set(enrolledCourses.map((course) => course.id));
    const attempts = (progress.quizzes || []).filter((attempt) => courseIds.has(attempt.courseId));
    const completedUnits = models.reduce((sum, m) => sum + m.stats.done, 0);
    const totalUnits = models.reduce((sum, m) => sum + m.stats.total, 0);
    const passedCourses = models.filter((m) => m.assessment.passed).length;
    const average = attempts.length
      ? Math.round(attempts.reduce((sum, attempt) => sum + percentOf(attempt.score, attempt.total), 0) / attempts.length)
      : null;
    return { attempts, completedUnits, totalUnits, passedCourses, average };
  }, [enrolledCourses, models, progress]);

  return (
    <>
      <style>{MOTION_CSS}</style>
      <PageShell max="max-w-[1360px]">
        <div className="mx-auto w-full max-w-[1320px]">
          <StudentPageHeader
            title="My Analytics"
            subtitle="Your learning roadmap: what you have finished, how you scored and what comes next."
          />

          {enrolledCourses.length === 0 ? (
            <Card className="mt-5 p-6 sm:p-9">
              <EmptyState
                icon={BarChart3}
                title="Your roadmap starts with your first course"
                text="Enrol in a course and this page will turn into your roadmap: topic scores, coding marks, final assessment attempts and your overall result."
                action={<LinkButton to="/student/topics" variant="gold" icon={BookOpen}>Explore courses</LinkButton>}
              />
            </Card>
          ) : (
            <>
              <StoryHero
                models={models}
                completedUnits={analytics.completedUnits}
                totalUnits={analytics.totalUnits}
                passedCourses={analytics.passedCourses}
              />

              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard icon={GraduationCap} label="Enrolled courses" value={enrolledCourses.length} helper="Your active learning tracks" tone="teal" />
                <MetricCard icon={CheckCircle2} label="Topics completed" value={analytics.completedUnits} suffix={`/${analytics.totalUnits}`} helper="Across all enrolled courses" tone="green" delay={80} />
                <MetricCard icon={ClipboardCheck} label="Assessment attempts" value={analytics.attempts.length} helper="Topic quizzes + final assessments" tone="gold" delay={160} />
                <MetricCard icon={Trophy} label="Courses passed" value={analytics.passedCourses} helper="80% overall score achieved" tone="slate" delay={240} />
              </div>

              <Reveal className="mt-9 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-[11px] font-extrabold text-[#A77916]">The chapters</p>
                  <h2 className="mt-1 text-lg font-extrabold text-[#123F45]">Your course roadmaps</h2>
                  <p className="mt-1 text-xs text-[#829596]">Each course is a chapter: lessons and quizzes first, then the coding task and the final assessment.</p>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-[#E3EBE9] bg-white px-3 py-2">
                  <TrendingUp size={15} className="text-[#0B5960]" />
                  <span className="text-[11px] font-bold text-[#60797C]">Average assessment score</span>
                  <span className="text-sm font-extrabold text-[#123F45]">
                    {analytics.average === null ? "—" : <AnimatedNumber value={analytics.average} suffix="%" />}
                  </span>
                </div>
              </Reveal>

              <div className="mt-4 space-y-6">
                {models.map((model, index) => (
                  <CourseChapterCard key={model.course.id} model={model} chapterNumber={pad2(index + 1)} />
                ))}
              </div>
            </>
          )}
          <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-[#E4EBE9] pt-5">
            <p className="text-[11px] text-[#829596]">Analytics uses your current course-cycle scores.</p>
            <LinkButton to="/student/my-learning" variant="outline" icon={BookOpen}>Continue learning</LinkButton>
          </div>
        </div>
      </PageShell>
    </>
  );
}

export default MyAnalytics;