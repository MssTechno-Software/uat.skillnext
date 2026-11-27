import { translateValue } from "../../i18n";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Clock3,
  Gauge,
  Loader2,
  Mic,
  Play,
  RotateCcw,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import {
  useNavigate,
  useParams,
  useLocation,
} from "react-router-dom";

import StudentPageHeader from "../../components/student/StudentPageHeader";
import {
  Card,
  PageShell,
  SectionHeading,
} from "../../components/student/ui";

import {
  getCourseTheoryDailyLimit,
  getCourseTheoryQuestions,
} from "../../api/aiTheoryPractice.api";
import { getUserId } from "../../services/authSession";
import { getApiErrorMessage } from "../../utils/apiErrorHandler";

import {
  saveInterviewFeedback,
  saveInterviewSession,
} from "../../data/interviewPrepSession";

// Re-use a usage result fetched in the last 30s (avoids repeat API hits
// when the student opens / closes the popup quickly).
const USAGE_CACHE_MS = 30000;

const difficultyOptions = [
  {
    id: "Easy",
    title: "Easy",
    subtitle: "Fundamentals and clear explanations",
    Icon: BookOpen,
    surface: "bg-[#EAF5EF]",
    tone: "text-[#39765D]",
  },
  {
    id: "Medium",
    title: "Medium",
    subtitle: "Practical application and reasoning",
    Icon: Gauge,
    surface: "bg-[#FFF5DE]",
    tone: "text-[#A87512]",
  },
  {
    id: "Hard",
    title: "Hard",
    subtitle: "Complex situations and decisions",
    Icon: Zap,
    surface: "bg-[#F8EDEA]",
    tone: "text-[#A9523E]",
  },
  {
    id: "Mixed",
    title: "Mixed",
    subtitle: "A balanced mix of all difficulty levels",
    Icon: Sparkles,
    surface: "bg-[#EAF3F2]",
    tone: "text-[#06424B]",
  },
];

function UsageChips({ usage, loading, error, onRetry }) {
  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-2" aria-busy="true">
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={index}
            className="h-14 animate-pulse rounded-xl bg-[#EEF3F4]"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="rounded-xl border border-[#E6C9C4] bg-[#FFF7F5] p-3 text-xs text-[#8D4035]"
        role="alert"
      >
        {error}{" "}
        <button
          type="button"
          onClick={onRetry}
          className="font-bold underline"
        >
          {translateValue("Try again")}
        </button>
      </div>
    );
  }

  if (!usage) return null;

  const items = [
    {
      label: "DAILY LIMIT",
      value: usage.daily_limit,
      cls: "border-[#DCE7E5] bg-[#F7FAFA] text-[#06424B]",
    },
    {
      label: "SUBMITTED TODAY",
      value: usage.submitted_today,
      cls: "border-[#DCE7E5] bg-[#F7FAFA] text-[#06424B]",
    },
    {
      label: "REMAINING TODAY",
      value: usage.remaining,
      cls: "border-[#F1DFB6] bg-[#FFFAEE] text-[#815C12]",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map((item) => (
        <div
          key={item.label}
          className={`rounded-xl border px-3 py-2 ${item.cls}`}
        >
          <p className="text-[8px] font-extrabold leading-tight tracking-wide opacity-70">
            {translateValue(item.label)}
          </p>
          <p className="mt-1 text-lg font-extrabold leading-none">
            {item.value ?? "—"}
          </p>
        </div>
      ))}
    </div>
  );
}

// ---- Daily limit reset helpers -------------------------------------------
// If the usage API returns a reset time we use it; otherwise we fall back to
// the next local midnight (and label it as such).
const RESET_AT_KEYS = [
  "reset_at",
  "resets_at",
  "reset_time",
  "reset_datetime",
  "next_reset_at",
  "next_reset",
];
const RESET_SECONDS_KEYS = [
  "reset_in_seconds",
  "resets_in_seconds",
  "seconds_until_reset",
];

function resolveResetAt(usage) {
  const now = Date.now();

  for (const key of RESET_AT_KEYS) {
    const raw = usage?.[key];
    if (!raw) continue;
    const time = new Date(raw).getTime();
    if (Number.isFinite(time) && time > now) {
      return { at: time, estimated: false };
    }
  }

  for (const key of RESET_SECONDS_KEYS) {
    const seconds = Number(usage?.[key]);
    if (Number.isFinite(seconds) && seconds > 0) {
      return { at: now + seconds * 1000, estimated: false };
    }
  }

  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  return { at: midnight.getTime(), estimated: true };
}

function formatDuration(ms) {
  const totalMinutes = Math.max(Math.ceil(ms / 60000), 1);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours <= 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}

function ResetNotice({ usage }) {
  const reset = useMemo(() => resolveResetAt(usage), [usage]);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(id);
  }, []);

  const msLeft = reset.at - now;
  const when = new Date(reset.at).toLocaleString(undefined, {
    hour: "numeric",
    minute: "2-digit",
    day: "numeric",
    month: "short",
  });
  const limitHit =
    usage?.limit_reached === true || Number(usage?.remaining) <= 0;

  return (
    <div
      className={`mt-3 flex items-start gap-2 rounded-xl border px-3 py-2.5 text-xs leading-5 ${
        limitHit
          ? "border-[#E6C9C4] bg-[#FFF7F5] text-[#8D4035]"
          : "border-[#DCE7E5] bg-[#F7FAFA] text-[#45666A]"
      }`}
    >
      <Clock3 size={14} className="mt-0.5 shrink-0" />
      <p>
        {msLeft > 0 ? (
          <>
            <span className="font-bold">
              {translateValue("Limit resets in")} {formatDuration(msLeft)}
            </span>
            {" · "}
            {when}
          </>
        ) : (
          translateValue(
            "Your daily limit should have reset. Press Refresh to update."
          )
        )}
        {reset.estimated && (
          <span className="block opacity-75">
            {translateValue("Resets daily at midnight (your local time).")}
          </span>
        )}
      </p>
    </div>
  );
}

function InterviewPrepDifficulty() {
  const navigate = useNavigate();
  const location = useLocation();
  const { courseId } = useParams();
  const studentId = getUserId();

  // Receive the already selected course from InterviewPrepCourses.
  const selectedCourse = location.state?.course;

  const courseName =
    location.state?.courseName ||
    selectedCourse?.fullName ||
    selectedCourse?.shortName ||
    "";

  const [difficulty, setDifficulty] = useState("Easy");

  // Start popup + daily usage
  const [showModal, setShowModal] = useState(false);
  const [usage, setUsage] = useState(null);
  const [usageLoading, setUsageLoading] = useState(false);
  const [usageError, setUsageError] = useState("");
  const usageCacheRef = useRef({ value: null, at: 0 });
  const usageInFlightRef = useRef(false);

  // Questions API
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const startLockRef = useRef(false);

  // Validate selected course information.
  useEffect(() => {
    if (!courseId || !courseName) {
      navigate("/student/ai-practice/topic-theory", {
        replace: true,
      });
    }
  }, [courseId, courseName, navigate]);

  // Close popup with Escape (only when questions are not loading).
  useEffect(() => {
    if (!showModal) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape" && !loading) setShowModal(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [showModal, loading]);

  // 1) USAGE API — runs only when the student clicks "Start Interview"
  //    (or Refresh / Try again inside the popup).
  const loadUsage = useCallback(
    async ({ force = false } = {}) => {
      if (usageInFlightRef.current) return usageCacheRef.current.value;

      if (!studentId) {
        setUsage(null);
        setUsageError(
          translateValue(
            "Student account could not be identified. Please sign in again."
          )
        );
        return null;
      }

      const cache = usageCacheRef.current;
      if (
        !force &&
        cache.value &&
        Date.now() - cache.at < USAGE_CACHE_MS
      ) {
        setUsage(cache.value);
        setUsageError("");
        return cache.value;
      }

      usageInFlightRef.current = true;
      setUsageLoading(true);
      setUsageError("");
      try {
        const result = await getCourseTheoryDailyLimit(studentId);
        const value = result || null;
        usageCacheRef.current = { value, at: Date.now() };
        setUsage(value);
        return value;
      } catch (usageErr) {
        setUsage(null);
        setUsageError(
          getApiErrorMessage(
            usageErr,
            translateValue(
              "Unable to load daily usage. Please try again."
            )
          )
        );
        return null;
      } finally {
        usageInFlightRef.current = false;
        setUsageLoading(false);
      }
    },
    [studentId]
  );

  const openStartPopup = () => {
    if (loading) return;
    setError("");
    setShowModal(true);
    void loadUsage();
  };

  // 2) QUESTIONS API — runs only when the student confirms in the popup.
  //    Then we go straight to the question screen.
  const startInterview = async () => {
    if (!courseId || !courseName || loading || startLockRef.current) return;
    if (!usage || usage.limit_reached === true || Number(usage.remaining) <= 0) {
      return;
    }

    startLockRef.current = true;
    try {
      setLoading(true);
      setError("");

      // "Mixed" is sent to the backend exactly as selected (not converted
      // to any other level on the client).
      const response = await getCourseTheoryQuestions(
        courseId,
        difficulty
      );

      // API service returns response.data directly.
      const questions = Array.isArray(response?.questions)
        ? response.questions
        : [];

      if (questions.length === 0) {
        setError(
          translateValue(
            "No questions are available for this course and difficulty level."
          )
        );
        return;
      }

      // Clear previous interview feedback.
      saveInterviewFeedback(null);

      // Save actual backend questions + the usage we already fetched,
      // so the question screen does NOT need to call the usage API again.
      saveInterviewSession({
        courseId: String(courseId),
        courseName,
        difficulty,
        questions,
        totalQuestions:
          response?.total_questions ?? questions.length,
        questionIndex: 0,
        responses: [],
        completed: false,
        dailyUsage: usage,
        startedAt: new Date().toISOString(),
      });

      setShowModal(false);

      // Go directly to the question screen (no intro screen in between).
      navigate(
        "/student/ai-practice/topic-theory/interview",
        {
          state: {
            courseId,
            courseName,
            difficulty,
          },
        }
      );
    } catch (err) {
      console.error(
        "Failed to fetch course theory questions:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          err?.message ||
          translateValue(
            "Unable to load questions. Please try again."
          )
      );
    } finally {
      setLoading(false);
      startLockRef.current = false;
    }
  };

  if (!courseId || !courseName) {
    return null;
  }

  const startDisabled =
    loading ||
    usageLoading ||
    !!usageError ||
    !usage ||
    usage.limit_reached === true ||
    Number(usage.remaining) <= 0;

  return (
    <PageShell max="max-w-[1400px]">
      <StudentPageHeader
        title={translateValue("Refine Your Focus")}
        subtitle={translateValue(
          "Select the interview difficulty before starting your course-specific theory practice."
        )}
      />

      {/* Selected Course */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#DCE6E5] bg-white px-4 py-4 shadow-sm">
        <div className="min-w-0">
          <p className="text-[9px] font-extrabold tracking-[0.15em] text-[#B07A06]">
            {translateValue("INTERVIEW PREP")}
          </p>

          <h2 className="mt-1 text-base font-extrabold text-[#06424B]">
            {translateValue(courseName)}
          </h2>

          <p className="mt-1 text-xs text-[#718486]">
            {translateValue(
              "Choose a difficulty level to begin."
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate("/student/ai-practice/topic-theory")
          }
          className="inline-flex items-center gap-2 text-xs font-bold text-[#527477] transition hover:text-[#06424B]"
        >
          <ArrowLeft size={14} />
          {translateValue("Change course")}
        </button>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.8fr)]">
        {/* Difficulty Options */}
        <section>
          <SectionHeading
            title={translateValue("Select difficulty")}
            subtitle={translateValue(
              "Choose the level that best matches the practice you want."
            )}
          />

          <div className="grid gap-3 sm:grid-cols-2">
            {difficultyOptions.map(
              ({
                id,
                title,
                subtitle,
                Icon,
                surface,
                tone,
              }) => {
                const active = difficulty === id;

                return (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={active}
                    disabled={loading}
                    onClick={() => {
                      setDifficulty(id);
                      setError("");
                    }}
                    className={`relative min-h-[155px] rounded-[18px] border p-5 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${
                      active
                        ? "border-[#06424B] bg-[#F1F7F6] shadow-[0_0_0_2px_rgba(6,66,75,0.08)]"
                        : "border-[#DCE6E3] bg-white hover:border-[#A8C1BD] hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${surface} ${tone}`}
                      >
                        <Icon size={20} />
                      </span>

                      {active && (
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#06424B] text-white">
                          <Check size={14} />
                        </span>
                      )}
                    </div>

                    <h3 className="mt-4 text-base font-extrabold text-[#06424B]">
                      {translateValue(title)}
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-[#718486]">
                      {translateValue(subtitle)}
                    </p>
                  </button>
                );
              }
            )}
          </div>
        </section>

        {/* Interview Configuration */}
        <Card className="h-fit p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF3F2] text-[#06424B]">
              <Target size={22} />
            </span>

            <div>
              <p className="text-[9px] font-extrabold tracking-[0.15em] text-[#B07A06]">
                {translateValue("INTERVIEW CONFIGURATION")}
              </p>

              <h2 className="text-lg font-extrabold text-[#06424B]">
                {translateValue("Ready to practise")}
              </h2>
            </div>
          </div>

          <div className="mt-5 space-y-3 rounded-xl bg-[#F5F8F7] p-4">
            <div>
              <p className="text-[9px] font-extrabold tracking-wide text-[#829596]">
                {translateValue("COURSE")}
              </p>

              <p className="mt-1 text-sm font-bold text-[#2F4A4E]">
                {translateValue(courseName)}
              </p>
            </div>

            <div>
              <p className="text-[9px] font-extrabold tracking-wide text-[#829596]">
                {translateValue("DIFFICULTY")}
              </p>

              <p className="mt-1 inline-flex rounded-lg bg-[#FFAB0B] px-3 py-1.5 text-xs font-extrabold text-[#06424B]">
                {translateValue(difficulty)}
              </p>
            </div>

            <div>
              <p className="text-[9px] font-extrabold tracking-wide text-[#829596]">
                {translateValue("QUESTION FORMAT")}
              </p>

              <p className="mt-1 text-sm font-semibold text-[#2F4A4E]">
                {translateValue(
                  "Course-specific theory questions"
                )}
              </p>
            </div>
          </div>

          {/* Start Interview -> opens popup (usage API is called here) */}
          <button
            type="button"
            onClick={openStartPopup}
            disabled={loading}
            className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#06424B] px-5 py-3 text-xs font-extrabold text-white shadow-sm transition hover:bg-[#0A515C] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {translateValue("Start Interview")}
            <ArrowRight size={15} />
          </button>
        </Card>
      </div>

      {/* Start popup: mic note + daily usage + confirm */}
      {showModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#102F33]/45 px-4 py-6 backdrop-blur-sm"
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="topic-theory-start-title"
            className="w-full max-w-[540px] overflow-hidden rounded-2xl border border-[#EADBC8] bg-white shadow-[0_24px_80px_rgba(6,35,39,0.22)]"
          >
            <div className="p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EEF5F4] text-[#06424B]">
                  <Mic size={21} />
                </div>

                <div className="min-w-0 flex-1">
                  <h2
                    id="topic-theory-start-title"
                    className="text-xl font-extrabold text-[#142D3D] sm:text-2xl"
                  >
                    {translateValue("Ready to begin Topic Theory Practice?")}
                  </h2>

                  <p className="mt-4 rounded-xl border border-[#E6D5D0] bg-[#F8FAFC] px-5 py-4 text-sm leading-7 text-[#58666B]">
                    {translateValue(
                      "Please ensure your microphone is active and you are in a quiet environment. Your timer starts only when you click Speak Now."
                    )}
                  </p>

                  {/* Daily usage */}
                  <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <p className="text-[10px] font-extrabold tracking-[0.15em] text-[#B07A06]">
                        {translateValue("DAILY USAGE")}
                      </p>
                      <button
                        type="button"
                        onClick={() => void loadUsage({ force: true })}
                        disabled={usageLoading || loading}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#06424B] disabled:opacity-50"
                      >
                        <RotateCcw
                          size={12}
                          className={usageLoading ? "animate-spin" : ""}
                        />
                        {translateValue("Refresh")}
                      </button>
                    </div>

                    <UsageChips
                      usage={usage}
                      loading={usageLoading}
                      error={usageError}
                      onRetry={() => void loadUsage({ force: true })}
                    />

                    {usage && !usageLoading && <ResetNotice usage={usage} />}

                    {usage &&
                      (usage.limit_reached === true ||
                        Number(usage.remaining) <= 0) && (
                        <p
                          className="mt-3 text-xs font-semibold text-[#8D4035]"
                          role="alert"
                        >
                          {translateValue(
                            "You have reached your daily Topic Theory limit. Please try again after it resets."
                          )}
                        </p>
                      )}
                  </div>

                  {/* Questions API error */}
                  {error && (
                    <div
                      role="alert"
                      className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs leading-5 text-red-700"
                    >
                      {translateValue(error)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-[#E6D5D0] px-6 py-5 sm:flex-row sm:justify-end sm:px-8">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                disabled={loading}
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[#E6D5D0] bg-white px-6 text-sm font-bold text-[#665A57] disabled:opacity-50"
              >
                {translateValue("Cancel")}
              </button>

              <button
                type="button"
                onClick={() => void startInterview()}
                disabled={startDisabled}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#06424B] px-7 text-sm font-extrabold text-white disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    {translateValue("Loading Questions...")}
                  </>
                ) : (
                  <>
                    <Play size={15} />
                    {translateValue("Start practice")}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}

export default InterviewPrepDifficulty;