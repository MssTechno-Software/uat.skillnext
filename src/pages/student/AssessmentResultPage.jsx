import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronsUpDown,
  Lightbulb,
  PartyPopper,
  CircleHelp,
  Clock3,
  GraduationCap,
  RotateCcw,
  ShieldCheck,
  Target,
  Trophy,
} from "lucide-react";

import StudentPageHeader from "../../components/student/StudentPageHeader";
import { Card, PageShell, SectionHeading } from "../../components/student/ui";

const toNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const clampPercentage = (value) =>
  Math.min(100, Math.max(0, Math.round(toNumber(value))));

const toPositiveId = (value) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

const formatSubmittedAt = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const formatQuestionType = (value) =>
  String(value || "Question")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/* Status of one question row: "review" | "correct" | "incorrect" */
const getRowStatus = (row) =>
  row?.needsReview === true
    ? "review"
    : row?.isCorrect === true
      ? "correct"
      : "incorrect";

/* Yellow = "look at this one", green = done, slate = waiting */
const STATUS = {
  correct: {
    label: "Correct",
    Icon: Check,
    pill: "bg-[#EAF4F0] text-[#28765E] border-[#CFE6DC]",
    dot: "bg-[#28765E]",
    badgeIcon: "bg-[#28765E] text-white",
    card: "border-[#E1EAE8]",
    hint: "Full marks on this one. Nice work.",
  },
  incorrect: {
    label: "Needs improvement",
    Icon: Lightbulb,
    pill: "bg-[#FFF5DF] text-[#94650C] border-[#FFD782]",
    dot: "bg-[#FFAB0B]",
    badgeIcon: "bg-[#FFAB0B] text-[#06424B]",
    card: "border-[#F5DDA0]",
    hint: "Revisit this topic in the module before your next attempt.",
  },
  review: {
    label: "Awaiting review",
    Icon: Clock3,
    pill: "bg-[#EEF3F4] text-[#526D71] border-[#DCE6E4]",
    dot: "bg-[#7FA3A8]",
    badgeIcon: "bg-[#7FA3A8] text-white",
    card: "border-[#DCE6E4]",
    hint: "This answer needs manual review. Your marks may be updated once it is checked.",
  },
};

/* One-time page-load entrance. Respects reduced-motion. */
const PAGE_STYLES = `
@keyframes ar-rise {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes ar-open {
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: translateY(0); }
}
.ar-rise { opacity: 0; animation: ar-rise 560ms cubic-bezier(0.22, 1, 0.36, 1) forwards; }
.ar-open { animation: ar-open 220ms ease-out; }
@media (prefers-reduced-motion: reduce) {
  .ar-rise { opacity: 1; animation: none; }
  .ar-open { animation: none; }
}
`;

function ScoreRing({ percentage, passed }) {
  const size = 164;
  const stroke = 11;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  // Ring fills from 0 -> percentage once on mount
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setShown(percentage));
    return () => cancelAnimationFrame(frame);
  }, [percentage]);

  const offset = circumference * (1 - shown / 100);

  return (
    <div
      className="relative mx-auto h-[142px] w-[142px] sm:h-[164px] sm:w-[164px]"
      role="progressbar"
      aria-label="Assessment score"
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
          stroke="rgba(255,255,255,0.13)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#FFAB0B"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-[1400ms] ease-out motion-reduce:transition-none"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-[36px] font-black leading-none tracking-tight text-white tabular-nums sm:text-[42px]">
          {percentage}%
        </span>
        <span className="mt-2 text-[10px] font-extrabold uppercase tracking-[1.6px] text-white/65">
          {passed ? "Passed" : "Your score"}
        </span>
      </div>
    </div>
  );
}

function ResultUnavailable() {
  return (
    <PageShell max="max-w-[1120px]">
      <div className="mx-auto flex min-h-[62vh] w-full items-center justify-center py-10">
        <Card className="w-full max-w-xl overflow-hidden border border-[#E1EAE8] p-0 shadow-[0_18px_48px_rgba(6,66,75,0.07)]">
          <div className="relative overflow-hidden bg-gradient-to-br from-[#06424B] to-[#0A5962] px-7 py-9 text-center text-white sm:px-10">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full border-[22px] border-white/[0.06]"
            />
            <span className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-[#FFAB0B]">
              <CircleHelp size={27} />
            </span>
            <h1 className="relative mt-4 text-2xl font-extrabold">
              Your result is not available
            </h1>
            <p className="relative mx-auto mt-2 max-w-md text-sm leading-6 text-white/70">
              This result may have expired or the page was opened directly. Return to
              My Learning to continue your course.
            </p>
          </div>
          <div className="flex justify-center p-6 sm:p-8">
            <Link
              to="/student/my-learning"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#FFAB0B] px-5 text-sm font-extrabold !text-white [text-shadow:0_1px_2px_rgba(6,66,75,0.4)] !no-underline transition hover:bg-[#FFC13C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#06424B] focus-visible:ring-offset-2"
            >
              <BookOpen size={16} /> Go to My Learning <ArrowRight size={16} />
            </Link>
          </div>
        </Card>
      </div>
    </PageShell>
  );
}

function SummaryCard({ icon: Icon, label, value, helper, tone = "teal" }) {
  const iconTone =
    tone === "gold"
      ? "bg-[#FFF5DF] text-[#A87916]"
      : tone === "success"
        ? "bg-[#EAF4F0] text-[#28765E]"
        : "bg-[#EEF3F4] text-[#06424B]";

  const accent =
    tone === "gold"
      ? "bg-[#FFAB0B]"
      : tone === "success"
        ? "bg-[#28765E]"
        : "bg-[#06424B]";

  return (
    <Card className="relative h-full overflow-hidden border border-[#E2EAE8] p-5 shadow-[0_6px_20px_rgba(6,66,75,0.035)] transition duration-200 hover:shadow-[0_12px_26px_rgba(6,66,75,0.06)] sm:p-5">
      <span
        aria-hidden="true"
        className={`absolute inset-x-0 top-0 h-[3px] ${accent} opacity-80`}
      />
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold text-[#718486]">{label}</p>
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconTone}`}>
          <Icon size={18} />
        </span>
      </div>
      <p className="mt-3 text-[28px] font-black leading-none tracking-tight text-[#06424B] tabular-nums">
        {value}
      </p>
      <p className="mt-2 text-[11px] leading-5 text-[#91A1A2]">{helper}</p>
    </Card>
  );
}

function StatusPill({ status }) {
  const cfg = STATUS[status];
  const Icon = cfg.Icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-extrabold ${cfg.pill}`}
    >
      <Icon size={11} /> {cfg.label}
    </span>
  );
}

function QuestionFeedbackCard({ result, question, index, open, onToggle }) {
  const status = getRowStatus(result);
  const cfg = STATUS[status];
  const BadgeIcon = cfg.Icon;
  const questionScore = toNumber(result.score);
  const questionMaxScore = toNumber(result.maxScore);
  const title = question?.text || question?.question || `Question ${index + 1}`;
  const hasDetails = Boolean(result.reason || result.feedback);

  return (
    <article
      id={`question-${index}`}
      className={`scroll-mt-6 overflow-hidden rounded-[20px] border bg-white transition duration-200 ${cfg.card} ${
        open
          ? "shadow-[0_10px_26px_rgba(6,66,75,0.06)]"
          : "shadow-[0_3px_12px_rgba(6,66,75,0.02)] hover:shadow-[0_8px_20px_rgba(6,66,75,0.045)]"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={`question-panel-${index}`}
        className="flex w-full items-center gap-3 p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#FFAB0B] sm:gap-4 sm:p-5"
      >
        {/* Number badge with status marker */}
        <span className="relative shrink-0">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#06424B] text-base font-black tabular-nums text-[#FFAB0B]">
            {index + 1}
          </span>
          <span
            className={`absolute -bottom-1 -right-1 flex h-[18px] w-[18px] items-center justify-center rounded-full ring-2 ring-white ${cfg.badgeIcon}`}
          >
            <BadgeIcon size={10} strokeWidth={3} />
          </span>
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-1.5">
            <StatusPill status={status} />
            {question?.questionType && (
              <span className="rounded-full bg-[#F4F7F7] px-2 py-0.5 text-[10px] font-bold capitalize text-[#829596]">
                {formatQuestionType(question.questionType)}
              </span>
            )}
          </span>
          <span
            className={`mt-1.5 block text-sm font-extrabold leading-6 text-[#123B43] sm:text-[15px] ${
              open ? "" : "line-clamp-2"
            }`}
          >
            {title}
          </span>
        </span>

        <span className="flex shrink-0 items-center gap-2.5">
          <span className="text-right">
            <span className="block text-[15px] font-black leading-none tabular-nums text-[#06424B]">
              {questionScore}
              <span className="text-[11px] font-bold text-[#91A1A2]"> / {questionMaxScore}</span>
            </span>
            <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.8px] text-[#A3B1B2]">
              marks
            </span>
          </span>
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-full transition duration-200 ${
              open ? "rotate-180 bg-[#FFAB0B] text-[#06424B]" : "bg-[#F4F7F7] text-[#829596]"
            }`}
          >
            <ChevronDown size={16} />
          </span>
        </span>
      </button>

      {open && (
        <div
          id={`question-panel-${index}`}
          className="ar-open border-t border-[#EDF1F0] bg-[#FCFDFD] px-4 pb-5 pt-4 sm:pl-[80px] sm:pr-5"
        >
          {result.reason && (
            <div>
              <p className="text-[11px] font-extrabold text-[#06424B]">Why this answer</p>
              <p className="mt-1 max-w-3xl text-[13px] leading-6 text-[#526D71]">{result.reason}</p>
            </div>
          )}

          {result.feedback && (
            <div className="mt-3 rounded-xl border border-[#F5E3B5] bg-[#FFFAEC] px-4 py-3">
              <p className="flex items-center gap-1.5 text-[11px] font-extrabold text-[#94650C]">
                <Lightbulb size={13} /> Feedback
              </p>
              <p className="mt-1 max-w-3xl text-[13px] leading-6 text-[#6F5A2B]">{result.feedback}</p>
            </div>
          )}

          {!hasDetails && (
            <p className="text-[13px] leading-6 text-[#718486]">{cfg.hint}</p>
          )}
        </div>
      )}
    </article>
  );
}

const FILTERS = [
  { key: "all", label: "All" },
  { key: "correct", label: "Correct" },
  { key: "incorrect", label: "Needs improvement" },
  { key: "review", label: "Awaiting review" },
];

function AssessmentResultPage() {
  const location = useLocation();
  const { state } = location;
  const topRef = useRef(null);
  const [filter, setFilter] = useState("all");

  // Always open the result page from the very top
  useLayoutEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    // Also handles layouts where an inner container scrolls instead of the window
    topRef.current?.scrollIntoView({ block: "start", behavior: "auto" });
  }, [location.key]);

  const attempt = state?.attempt;
  const assignment = state?.assignment;
  const questions = Array.isArray(state?.questions) ? state.questions : [];

  const resultRows = useMemo(
    () => (Array.isArray(attempt?.results) ? attempt.results : []),
    [attempt?.results]
  );

  const questionById = useMemo(
    () => new Map(questions.map((question) => [String(question.id), question])),
    [questions]
  );

  // Questions that need attention start open; correct ones stay collapsed
  const [openIds, setOpenIds] = useState(
    () =>
      new Set(
        resultRows
          .map((row, i) => (getRowStatus(row) !== "correct" ? i : -1))
          .filter((i) => i >= 0)
      )
  );

  if (!attempt || !assignment) return <ResultUnavailable />;

  // The backend's explicit passed flag remains the source of truth.
  const passed = attempt.passed === true;
  const percentage = clampPercentage(attempt.percentage);
  const score = toNumber(attempt.score);
  const totalScore = toNumber(attempt.totalScore);
  const passPercentage = clampPercentage(assignment.passPercentage);
  const maxAttempts = Math.max(0, toNumber(assignment.maxAttempts));
  const attemptNo = Math.max(1, toNumber(attempt.attemptNo, 1));
  const courseId = toPositiveId(state?.courseId ?? assignment.courseId);
  const moduleId = toPositiveId(state?.moduleId ?? assignment.moduleId);
  const nextModuleId = toPositiveId(state?.nextModuleId);
  const passedModuleIds = [
    ...new Set(
      [
        ...(Array.isArray(state?.passedModuleIds) ? state.passedModuleIds : []),
        ...(passed && moduleId ? [moduleId] : []),
      ]
        .map(toPositiveId)
        .filter(Boolean)
    ),
  ];

  const canRetry =
    !passed &&
    Boolean(assignment.id && courseId && moduleId) &&
    (!maxAttempts || attemptNo < maxAttempts);
  const submittedAt = formatSubmittedAt(attempt.submittedAt);
  const assignmentTitle = assignment.title || "Module Assessment";
  const questionCount = questions.length || resultRows.length;
  const correctCount = resultRows.filter((item) => item.isCorrect === true).length;
  const reviewCount = resultRows.filter((item) => item.needsReview === true).length;
  const incorrectCount = resultRows.filter(
    (item) => item.isCorrect === false && item.needsReview !== true
  ).length;

  const myLearningPath = `/student/my-learning${courseId ? `?course=${encodeURIComponent(courseId)}` : ""}`;
  const nextModulePath = courseId && nextModuleId
    ? `/student/topics/${courseId}/topic/${nextModuleId}`
    : myLearningPath;
  const retryPath = `/student/assessments/${assignment.id}?course=${encodeURIComponent(courseId)}&module=${encodeURIComponent(moduleId)}${nextModuleId ? `&next=${encodeURIComponent(nextModuleId)}` : ""}`;

  /* Display-only helpers for the question section */
  const statusCounts = {
    all: resultRows.length,
    correct: resultRows.filter((r) => getRowStatus(r) === "correct").length,
    incorrect: resultRows.filter((r) => getRowStatus(r) === "incorrect").length,
    review: resultRows.filter((r) => getRowStatus(r) === "review").length,
  };
  const visibleFilters = FILTERS.filter(
    (f) => f.key === "all" || statusCounts[f.key] > 0
  );
  const activeFilter = statusCounts[filter] > 0 || filter === "all" ? filter : "all";
  const visibleRows = resultRows
    .map((result, index) => ({ result, index }))
    .filter(({ result }) => activeFilter === "all" || getRowStatus(result) === activeFilter);

  const allVisibleOpen =
    visibleRows.length > 0 && visibleRows.every(({ index }) => openIds.has(index));

  const toggleOne = (index) =>
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });

  const toggleAllVisible = () =>
    setOpenIds((prev) => {
      const next = new Set(prev);
      visibleRows.forEach(({ index }) => {
        if (allVisibleOpen) next.delete(index);
        else next.add(index);
      });
      return next;
    });

  const jumpToQuestion = (index) => {
    setFilter("all");
    setOpenIds((prev) => new Set(prev).add(index));
    const smooth = !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    setTimeout(() => {
      document
        .getElementById(`question-${index}`)
        ?.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
    }, 80);
  };

  const attentionCount = statusCounts.incorrect + statusCounts.review;

  const segment = (count) =>
    resultRows.length ? `${(count / resultRows.length) * 100}%` : "0%";

  const rise = (delay) => ({ animationDelay: `${delay}ms` });

  return (
    <PageShell max="max-w-[1180px]">
      <style>{PAGE_STYLES}</style>
      <div ref={topRef} aria-hidden="true" className="scroll-mt-4" />

      <div className="mx-auto w-full">
        <StudentPageHeader
          title="Assessment Result"
          subtitle="Your attempt has been evaluated. Review your score and feedback below."
        />

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <Link
            to={myLearningPath}
            state={{ courseId, passedModuleIds }}
            className="group inline-flex items-center gap-2 rounded-lg py-1 text-xs font-bold text-[#607B7E] !no-underline transition hover:text-[#06424B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFAB0B] focus-visible:ring-offset-2"
          >
            <ArrowLeft size={15} className="transition-transform group-hover:-translate-x-0.5" />
            Back to My Learning
          </Link>
          <span className="inline-flex items-center gap-2 rounded-full border border-[#E1EAE8] bg-white px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[1.1px] text-[#789094]">
            <GraduationCap size={14} className="text-[#B88736]" /> Learning report
          </span>
        </div>

        {/* Result overview */}
        <section
          className="ar-rise relative isolate overflow-hidden rounded-[28px] border border-[#0A5962] bg-gradient-to-br from-[#06424B] via-[#07515A] to-[#0B6871] px-5 py-7 text-white shadow-[0_18px_44px_rgba(6,66,75,0.14)] sm:px-8 sm:py-9"
          style={rise(0)}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border-[32px] border-white/[0.055]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-20 bottom-[-120px] h-60 w-60 rounded-full border-[26px] border-white/[0.035]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-[-105px] right-[22%] h-56 w-56 rounded-full bg-[#FFAB0B]/[0.09] blur-2xl"
          />

          <div className="relative grid items-center gap-7 md:grid-cols-[minmax(0,1fr)_200px]">
            <div className="min-w-0">
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[1.3px] ${
                  passed
                    ? "border-[#FFAB0B]/35 bg-[#FFAB0B]/10 text-[#FFD782]"
                    : "border-white/15 bg-white/10 text-white/75"
                }`}
              >
                {passed ? <CheckCircle2 size={13} /> : <Target size={13} />}
                {passed ? "Requirement achieved" : "Attempt completed"}
              </span>

              <div className="mt-4 flex items-start gap-3.5 sm:gap-4">
                <span
                  className={`mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                    passed
                      ? "bg-[#FFAB0B] text-[#06424B] shadow-[0_8px_20px_rgba(255,171,11,0.3)]"
                      : "border border-white/15 bg-white/10 text-[#FFD782]"
                  }`}
                >
                  {passed ? <Trophy size={23} /> : <BookOpen size={22} />}
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-extrabold uppercase tracking-[1.45px] text-[#FFCF70]">
                    {assignmentTitle}
                  </p>
                  <h1 className="mt-1 text-[27px] font-black leading-tight tracking-tight text-white sm:text-[36px]">
                    {passed ? "Assessment passed" : "Assessment completed"}
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
                    {passed
                      ? nextModuleId
                        ? "Well done. The next module is ready for you to continue learning."
                        : "Well done. You have met the required score for this assessment."
                      : canRetry
                        ? "You have not reached the required score yet. Review the feedback and try again when you are ready."
                        : "The available attempts for this assessment have been used."}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.08] px-3 py-2 text-[11px] font-bold text-white/85">
                  <Target size={14} className="text-[#FFAB0B]" />
                  Attempt {attemptNo}{maxAttempts ? ` of ${maxAttempts}` : ""}
                </span>
                {attempt.timedOut && (
                  <span className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.08] px-3 py-2 text-[11px] font-bold text-white/85">
                    <Clock3 size={14} className="text-[#FFAB0B]" /> Time limit reached
                  </span>
                )}
                {submittedAt && (
                  <span className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.08] px-3 py-2 text-[11px] font-bold text-white/85">
                    <Clock3 size={14} className="text-[#FFAB0B]" /> {submittedAt}
                  </span>
                )}
              </div>
            </div>

            <div className="mx-auto w-full max-w-[200px] rounded-[25px] border border-white/15 bg-white/[0.07] px-3 py-4 backdrop-blur-sm">
              <ScoreRing percentage={percentage} passed={passed} />
              <p className="mt-2 text-center text-[10px] font-semibold text-white/55">
                Overall percentage
              </p>
            </div>
          </div>

          <div className="relative mt-7 border-t border-white/15 pt-5">
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-bold">
              <span className="text-white/65">Passing requirement</span>
              <span className="tabular-nums text-[#FFD782]">{passPercentage}% required</span>
            </div>
            <div className="relative mt-3 h-2.5 overflow-visible rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#FFAB0B] to-[#FFC13C] transition-all duration-1000 ease-out"
                style={{ width: `${percentage}%` }}
              />
              <span
                className="absolute -top-1.5 h-[22px] w-[2px] rounded-full bg-white/90 shadow-[0_0_0_2px_rgba(255,255,255,0.12)]"
                style={{ left: `${passPercentage}%` }}
                aria-hidden="true"
              />
            </div>
            <div className="mt-2.5 flex justify-between gap-3 text-[10px] font-medium text-white/50">
              <span>0%</span>
              <span>
                Your score: <span className="font-bold text-white/80">{percentage}%</span>
              </span>
              <span>100%</span>
            </div>
          </div>
        </section>

        {/* Next step: moved right under the hero so the action is visible without scrolling far */}
        <Card
          className="ar-rise mt-5 overflow-hidden border border-[#E1EAE8] p-0 shadow-[0_7px_22px_rgba(6,66,75,0.035)]"
          style={rise(90)}
        >
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
            <div className="flex min-w-0 items-start gap-3">
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  passed ? "bg-[#EAF4F0] text-[#28765E]" : "bg-[#FFF5DF] text-[#A87916]"
                }`}
              >
                {passed ? <CheckCircle2 size={20} /> : <RotateCcw size={19} />}
              </span>
              <div className="min-w-0">
                <h2 className="text-sm font-extrabold text-[#06424B]">
                  {passed
                    ? "Your progress has been updated"
                    : canRetry
                      ? "Keep practising and try once more"
                      : "You have reached the attempt limit"}
                </h2>
                <p className="mt-1 max-w-2xl text-xs leading-6 text-[#718486]">
                  {passed
                    ? "Your assessment result is saved. Continue to the next available learning step."
                    : canRetry
                      ? "Use the question feedback below to understand what to improve before your next attempt."
                      : "Return to the module from My Learning to review the available next steps."}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap gap-2">
              {passed && nextModuleId ? (
                <Link
                  to={nextModulePath}
                  state={{ courseId, passedModuleIds }}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#FFAB0B] px-5 text-xs font-extrabold !text-white [text-shadow:0_1px_2px_rgba(6,66,75,0.4)] !no-underline shadow-[0_8px_18px_rgba(255,171,11,0.28)] transition hover:-translate-y-0.5 hover:bg-[#FFC13C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#06424B] focus-visible:ring-offset-2"
                >
                  Continue to next module <ArrowRight size={15} />
                </Link>
              ) : (
                <Link
                  to={myLearningPath}
                  state={{ courseId, passedModuleIds }}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#06424B] px-5 text-xs font-extrabold !text-white !no-underline transition hover:bg-[#0A5962] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFAB0B] focus-visible:ring-offset-2"
                >
                  Go to My Learning <ArrowRight size={15} />
                </Link>
              )}
              {canRetry && (
                <Link
                  to={retryPath}
                  state={{ courseId, moduleId, nextModuleId, passedModuleIds }}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#DCE6E4] bg-white px-4 text-xs font-bold text-[#06424B] !no-underline transition hover:border-[#B8CECA] hover:bg-[#F4F7F7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFAB0B] focus-visible:ring-offset-2"
                >
                  <RotateCcw size={14} /> Retry assessment
                </Link>
              )}
            </div>
          </div>
        </Card>

        {/* Score summary */}
        <section
          className="ar-rise mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
          style={rise(170)}
        >
          <SummaryCard
            icon={Award}
            label="Marks obtained"
            value={`${score} / ${totalScore}`}
            helper="Your assessment score"
          />
          <SummaryCard
            icon={ShieldCheck}
            label="Passing score"
            value={`${passPercentage}%`}
            helper="Minimum percentage required"
            tone="gold"
          />
          <SummaryCard
            icon={CheckCircle2}
            label="Correct answers"
            value={resultRows.length ? correctCount : "—"}
            helper={resultRows.length ? `${incorrectCount} need another look` : "Question-level results not provided"}
            tone="success"
          />
          <SummaryCard
            icon={BookOpen}
            label="Total questions"
            value={questionCount || "—"}
            helper={reviewCount ? `${reviewCount} awaiting manual review` : "Included in this assessment"}
          />
        </section>

        {/* Per-question feedback */}
        <section className="ar-rise mt-9" style={rise(250)}>
          <SectionHeading
            title="Question-wise feedback"
            subtitle="See how you did on each question. Yellow ones are worth another look."
          />

          {resultRows.length > 0 ? (
            <>
              <div className="mt-4 overflow-hidden rounded-[22px] border border-[#E1EAE8] bg-white shadow-[0_4px_16px_rgba(6,66,75,0.025)]">
                {/* What to do first */}
                <div
                  className={`flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 ${
                    attentionCount > 0 ? "bg-[#FFF8E6]" : "bg-[#F1F8F5]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        attentionCount > 0
                          ? "bg-[#FFAB0B] text-[#06424B]"
                          : "bg-[#28765E] text-white"
                      }`}
                    >
                      {attentionCount > 0 ? <Lightbulb size={19} /> : <PartyPopper size={19} />}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-extrabold text-[#06424B]">
                        {attentionCount > 0
                          ? `${attentionCount} ${attentionCount === 1 ? "question needs" : "questions need"} another look`
                          : "All answers are correct"}
                      </p>
                      <p className="mt-0.5 text-xs leading-5 text-[#718486]">
                        {attentionCount > 0
                          ? "Start with these. They are already open below."
                          : "Great work. Open any question to see its explanation."}
                      </p>
                    </div>
                  </div>
                  {statusCounts.incorrect > 0 && activeFilter !== "incorrect" && (
                    <button
                      type="button"
                      onClick={() => setFilter("incorrect")}
                      className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#06424B] px-4 text-xs font-extrabold text-white transition hover:bg-[#0A5962] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFAB0B] focus-visible:ring-offset-2"
                    >
                      Show only these
                    </button>
                  )}
                </div>

                {/* Progress split + question navigator */}
                <div className="border-t border-[#EDF1F0] px-4 py-4 sm:px-5">
                  <div
                    className="flex h-2.5 w-full overflow-hidden rounded-full bg-[#EEF3F4]"
                    role="img"
                    aria-label={`${statusCounts.correct} correct, ${statusCounts.incorrect} need improvement, ${statusCounts.review} awaiting review`}
                  >
                    <span
                      className="h-full bg-[#28765E] transition-all duration-700"
                      style={{ width: segment(statusCounts.correct) }}
                    />
                    <span
                      className="h-full bg-[#FFAB0B] transition-all duration-700"
                      style={{ width: segment(statusCounts.incorrect) }}
                    />
                    <span
                      className="h-full bg-[#7FA3A8] transition-all duration-700"
                      style={{ width: segment(statusCounts.review) }}
                    />
                  </div>

                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-semibold text-[#718486]">
                    <span className="inline-flex items-center gap-1.5">
                      <span className={`h-2 w-2 rounded-full ${STATUS.correct.dot}`} />
                      {statusCounts.correct} correct
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className={`h-2 w-2 rounded-full ${STATUS.incorrect.dot}`} />
                      {statusCounts.incorrect} need improvement
                    </span>
                    {statusCounts.review > 0 && (
                      <span className="inline-flex items-center gap-1.5">
                        <span className={`h-2 w-2 rounded-full ${STATUS.review.dot}`} />
                        {statusCounts.review} awaiting review
                      </span>
                    )}
                  </div>

                  {resultRows.length > 1 && (
                    <div className="mt-4">
                      <p className="text-[11px] font-extrabold text-[#06424B]">Jump to question</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {resultRows.map((row, i) => {
                          const st = getRowStatus(row);
                          return (
                            <button
                              key={`jump-${i}`}
                              type="button"
                              onClick={() => jumpToQuestion(i)}
                              aria-label={`Question ${i + 1}: ${STATUS[st].label}`}
                              className={`flex h-9 w-9 items-center justify-center rounded-xl border text-xs font-extrabold tabular-nums transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#06424B] focus-visible:ring-offset-1 ${STATUS[st].pill}`}
                            >
                              {i + 1}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Filters + expand all */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#EDF1F0] bg-[#FAFCFB] px-4 py-3 sm:px-5">
                  <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter questions">
                    {visibleFilters.length > 2 &&
                      visibleFilters.map((f) => {
                        const active = activeFilter === f.key;
                        return (
                          <button
                            key={f.key}
                            type="button"
                            aria-pressed={active}
                            onClick={() => setFilter(f.key)}
                            className={`inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[11px] font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFAB0B] focus-visible:ring-offset-1 ${
                              active
                                ? "border-[#06424B] bg-[#06424B] text-white"
                                : "border-[#DCE6E4] bg-white text-[#526D71] hover:bg-[#F4F7F7]"
                            }`}
                          >
                            {f.label}
                            <span
                              className={`rounded-full px-1.5 text-[10px] tabular-nums ${
                                active ? "bg-[#FFAB0B] text-[#06424B]" : "bg-[#F4F7F7] text-[#829596]"
                              }`}
                            >
                              {statusCounts[f.key]}
                            </span>
                          </button>
                        );
                      })}
                  </div>
                  <button
                    type="button"
                    onClick={toggleAllVisible}
                    className="inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[11px] font-bold text-[#06424B] transition hover:bg-[#EEF3F4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFAB0B] focus-visible:ring-offset-1"
                  >
                    <ChevronsUpDown size={14} />
                    {allVisibleOpen ? "Collapse all" : "Expand all"}
                  </button>
                </div>
              </div>

              <div className="mt-3 space-y-2.5">
                {visibleRows.map(({ result, index }) => (
                  <QuestionFeedbackCard
                    key={`${result.questionId ?? "question"}-${index}`}
                    result={result}
                    question={questionById.get(String(result.questionId))}
                    index={index}
                    open={openIds.has(index)}
                    onToggle={() => toggleOne(index)}
                  />
                ))}
              </div>
            </>
          ) : (
            <Card className="mt-4 border border-dashed border-[#DCE6E4] bg-white p-7 text-center sm:p-9">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF3F4] text-[#06424B]">
                <BookOpen size={21} />
              </span>
              <h3 className="mt-3 text-sm font-extrabold text-[#06424B]">
                Detailed feedback is not available
              </h3>
              <p className="mx-auto mt-1 max-w-md text-xs leading-6 text-[#829596]">
                Your overall result is shown above. Individual question feedback was not included in the response for this attempt.
              </p>
            </Card>
          )}
        </section>

        {/* Bottom navigation */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[#E4ECEA] py-6">
          <Link
            to={myLearningPath}
            state={{ courseId, passedModuleIds }}
            className="group inline-flex h-10 items-center gap-2 rounded-lg text-xs font-bold text-[#607B7E] !no-underline transition hover:text-[#06424B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFAB0B] focus-visible:ring-offset-2"
          >
            <ArrowLeft size={15} className="transition-transform group-hover:-translate-x-0.5" />
            Back to My Learning
          </Link>
          <Link
            to="/student/my-analytics"
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#DCE6E4] bg-white px-4 text-xs font-bold text-[#06424B] !no-underline transition hover:border-[#B8CECA] hover:bg-[#F4F7F7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFAB0B] focus-visible:ring-offset-2"
          >
            View My Analytics <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </PageShell>
  );
}

export default AssessmentResultPage;