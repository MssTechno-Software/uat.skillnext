import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import {
  ArrowLeft,
  Award,
  Check,
  ChevronDown,
  ClipboardCheck,
  Clock3,
  Languages,
  LoaderCircle,
  Mic,
  MicOff,
  Play,
  RotateCcw,
  Send,
  SkipForward,
  ShieldCheck,
  Volume2,
} from "lucide-react";

import { translateValue } from "../../i18n";
import {
  getSelfIntroductionDailyLimit,
  getSelfIntroductionQuestions,
  skipSelfIntroductionQuestion,
  submitSelfIntroductionAnswer,
} from "../../api/selfIntroduction.api";
import { translateApiContent } from "../../services/apiContentTranslation";
import { getUserId } from "../../services/authSession";
import { getApiErrorMessage } from "../../utils/apiErrorHandler";
import StudentPageHeader from "../../components/student/StudentPageHeader";
import { BackLink, Card, PageShell } from "../../components/student/ui";
import Loader from "../../components/Loader";

const QUESTION_SECONDS = 119;

const SPEECH_LANGUAGES = [
  { value: "en-US", label: "English (United States)" },
  { value: "fr-FR", label: "French (France)" },
];

const SUBMIT_STAGES = [
  { id: "saving", label: "Saving your answer" },
  { id: "evaluating", label: "Reviewing your answer" },
  { id: "finalizing", label: "Preparing your feedback" },
];

/* ------------------------------------------------------------------ */
/* Student-facing messages.                                            */
/* Every message shown to a student comes from this list (or from a    */
/* literal string passed through translateValue). Raw API text such as */
/* detail / message / error.message is NEVER displayed.                */
/* Add every value below to your English + French i18n dictionaries.   */
/* ------------------------------------------------------------------ */
const MESSAGES = {
  // Page-specific fallback messages only. HTTP/network status wording lives
  // exclusively in src/utils/apiErrorHandler.js.
  limit: "You have reached today's practice limit. Please come back tomorrow.",
  loadFailed: "We couldn't load your practice session. Please try again.",
  skipFailed: "We couldn't skip this question. Please try again.",
  submitFailed: "We couldn't submit your answer. Your response is saved here, so please try again.",
  evaluationFailed: "Your answer was submitted, but its evaluation could not be loaded.",
  translationUnavailable: "A French preview is not available right now. Your original transcript is unchanged.",
  questionUnavailable: "Question text is not available.",

  // Voice / status
  ready: "Use the microphone to speak, or type directly into the transcript area.",
  selected: "Question selected. Press Speak Now when you are ready.",
  skipped: "Question skipped. You can return to it anytime from the progress bar.",
  submittedReview: "You submitted this question earlier. Further submissions may be limited by the practice rules.",
  questionsLoaded: "Your questions are ready. Press Speak Now when you are ready.",
  speechUnsupported: "Speech recognition is not supported in this browser. Please type your answer instead.",
  micBlocked: "Microphone access is unavailable. Allow microphone permission or type your answer.",
  micStopped: "Voice capture stopped and the timer is paused. Press Speak Now to resume.",
  micStartFailed: "We couldn't start the microphone. Please check your browser permission and try again.",
  listening: "Listening. Speak clearly and your words will appear in the transcript.",
  listeningFallback: "Listening. In this browser you may need to press Speak Now again after a pause.",
  submitting: "Submitting your answer...",
  autoSubmitting: "Time is up. Your recorded answer is being submitted.",
  timeUpNoAnswer: "Time is up. No answer was captured, so nothing was submitted.",
  noAnswerCaptured: "No answer was captured. You can retry this question or type an answer.",
};

// Every message shown to a student goes through this helper, so French mode
// always shows the French dictionary text and never a raw backend string.
const tr = (message) => translateValue(message);

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
function unwrapPayload(payload) {
  return payload?.data && typeof payload.data === "object" ? payload.data : payload;
}

function normalizeQuestions(payload) {
  const source = unwrapPayload(payload);
  const questions = Array.isArray(source?.questions) ? source.questions : [];

  return [...questions]
    .filter((question) => question && question.question_id != null)
    .filter((question) => {
      const status = String(question.status || "enabled").trim().toLowerCase();
      return ["enabled", "active", "published"].includes(status);
    })
    .sort((first, second) => {
      const firstOrder = Number(first.display_order ?? Number.MAX_SAFE_INTEGER);
      const secondOrder = Number(second.display_order ?? Number.MAX_SAFE_INTEGER);
      return firstOrder - secondOrder;
    });
}

function isAttempted(question) {
  const value = question?.attempted_status;
  return value === true || value === 1 || ["true", "1", "yes", "submitted", "attempted"]
    .includes(String(value ?? "").trim().toLowerCase());
}

// If the backend adds a count field later, the UI shows it without guessing.
function getQuestionAttemptCount(question) {
  const rawCount = question?.attempt_count
    ?? question?.attempts_count
    ?? question?.total_attempts
    ?? question?.submission_count;
  if (rawCount == null || rawCount === "") return null;
  const count = Number(rawCount);
  return Number.isFinite(count) && count >= 0 ? count : null;
}

function extractTotalQuestionCount(payload, normalizedQuestions) {
  const source = unwrapPayload(payload);
  const total = Number(source?.total_questions);
  return Number.isFinite(total) && total >= 0 ? total : normalizedQuestions.length;
}

function normalizeDailyLimit(payload) {
  const source = unwrapPayload(payload);
  const limit = Number(source?.daily_limit ?? 0);
  const submitted = Number(source?.submitted_today ?? 0);
  const remaining = Number(source?.remaining ?? Math.max(0, limit - submitted));

  return {
    dailyLimit: Number.isFinite(limit) ? limit : 0,
    submittedToday: Number.isFinite(submitted) ? submitted : 0,
    remaining: Number.isFinite(remaining) ? Math.max(0, remaining) : 0,
    limitReached: Boolean(source?.limit_reached) || remaining <= 0,
    resetsAt: source?.resets_at || null,
    date: source?.date || null,
  };
}

// A missing authenticated student is represented as the same 401 shape that
// the shared API error handler already understands. No local status mapping.
const SESSION_EXPIRED_ERROR = Object.freeze({
  response: Object.freeze({ status: 401 }),
});

// Returns an empty string for anything that is not a valid date, never the raw value.
function formatResetTime(value, language = "en") {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat(language === "fr" ? "fr-FR" : "en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

/* ------------------------------------------------------------------ */
/* Small presentational components                                     */
/* ------------------------------------------------------------------ */
function VoiceWave({ active = false, compact = false }) {
  return (
    <div
      className={`sn-ai-wave ${active ? "sn-ai-wave-active" : ""} ${compact ? "sn-ai-wave-compact" : ""}`}
      aria-hidden="true"
    >
      {Array.from({ length: compact ? 17 : 29 }, (_, index) => (
        <span
          key={index}
          style={{
            height: `${8 + ((index * 11) % (compact ? 18 : 30))}px`,
            animationDelay: `${(index % 9) * -0.09}s`,
          }}
        />
      ))}
    </div>
  );
}

function IntroSkeleton() {
  return (
    <div className="mt-8 space-y-5" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">{tr("Loading your daily practice limit...")}</span>
      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="rounded-2xl border border-[#DCE7E5] bg-[#F7FAFA] p-5">
            <div className="h-3 w-28 animate-pulse rounded bg-[#DCE7E5]" />
            <div className="mt-4 h-8 w-16 animate-pulse rounded-lg bg-[#DCE7E5]" />
            <div className="mt-3 h-2 w-20 animate-pulse rounded bg-[#E7EEEE]" />
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-[#DCE7E5] bg-white p-5">
        <div className="h-3 w-40 animate-pulse rounded bg-[#E2EBEA]" />
        <div className="mt-4 h-3 w-full animate-pulse rounded bg-[#EDF2F1]" />
        <div className="mt-3 h-3 w-4/5 animate-pulse rounded bg-[#EDF2F1]" />
      </div>
    </div>
  );
}

// Custom dropdown (replaces the native <select>) with keyboard and screen-reader support.
function LanguageDropdown({ id, labelId, value, options, onChange, disabled = false }) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef(null);
  const buttonRef = useRef(null);

  const selectedIndex = Math.max(options.findIndex((option) => option.value === value), 0);
  const selected = options[selectedIndex];

  useEffect(() => {
    if (!open) return undefined;

    const handleOutside = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, [open]);

  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);

  const openMenu = () => {
    if (disabled) return;
    setActiveIndex(selectedIndex);
    setOpen(true);
  };

  const choose = (index) => {
    const option = options[index];
    if (option) onChange(option.value);
    setOpen(false);
    buttonRef.current?.focus();
  };

  const handleKeyDown = (event) => {
    if (disabled) return;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (!open) openMenu();
        else setActiveIndex((current) => (current + 1) % options.length);
        break;
      case "ArrowUp":
        event.preventDefault();
        if (!open) openMenu();
        else setActiveIndex((current) => (current - 1 + options.length) % options.length);
        break;
      case "Home":
        if (open) {
          event.preventDefault();
          setActiveIndex(0);
        }
        break;
      case "End":
        if (open) {
          event.preventDefault();
          setActiveIndex(options.length - 1);
        }
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        if (!open) openMenu();
        else choose(activeIndex);
        break;
      case "Escape":
        if (open) {
          event.preventDefault();
          setOpen(false);
        }
        break;
      case "Tab":
        setOpen(false);
        break;
      default:
        break;
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-listbox`}
        aria-labelledby={labelId}
        aria-activedescendant={open ? `${id}-option-${activeIndex}` : undefined}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={handleKeyDown}
        className="inline-flex min-h-9 items-center justify-between gap-2 rounded-lg border border-[#DCE6E5] bg-white px-3 text-xs font-semibold text-[#29494D] transition hover:border-[#06424B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFAB0B] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span>{tr(selected?.label || "")}</span>
        <ChevronDown
          size={14}
          aria-hidden="true"
          className={`shrink-0 text-[#527477] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ul
          id={`${id}-listbox`}
          role="listbox"
          aria-labelledby={labelId}
          className="absolute left-0 z-30 mt-1.5 w-max min-w-full overflow-hidden rounded-xl border border-[#DCE7E5] bg-white py-1 shadow-[0_12px_32px_rgba(6,66,75,0.14)]"
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const isActive = index === activeIndex;
            return (
              <li
                key={option.value}
                id={`${id}-option-${index}`}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => choose(index)}
                className={`flex cursor-pointer items-center justify-between gap-6 px-3 py-2 text-xs font-semibold transition-colors ${
                  isActive ? "bg-[#EEF5F4] text-[#06424B]" : "text-[#29494D]"
                } ${isSelected ? "font-extrabold" : ""}`}
              >
                <span>{tr(option.label)}</span>
                {isSelected && <Check size={14} className="text-[#39765D]" aria-hidden="true" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function InterviewLoadingSkeleton() {
  return (
    <div className="mt-1 space-y-4" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">{tr("Loading interview questions...")}</span>

      <div className="rounded-2xl border border-[#DCE7E5] bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="h-3 w-40 animate-pulse rounded bg-[#E2EBEA]" />
          <div className="h-3 w-24 animate-pulse rounded bg-[#EDF2F1]" />
        </div>
        <div className="mt-5 flex items-center gap-3">
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className="flex min-w-0 flex-1 items-center gap-2">
              <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-[#E8EFEE]" />
              {index < 7 && <div className="h-px min-w-1 flex-1 bg-[#E8EFEE]" />}
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,.95fr)]">
        <div className="flex min-h-[510px] flex-col items-center justify-center rounded-[26px] border border-[#DCE7E5] bg-white px-6 py-9 shadow-sm">
          <div className="h-28 w-28 animate-pulse rounded-[28px] bg-[#E8EFEE]" />
          <div className="mt-6 h-8 w-36 animate-pulse rounded-full bg-[#EEF3F4]" />
          <div className="mt-6 h-3 w-32 animate-pulse rounded-full bg-[#E2EBEA]" />
          <div className="mt-5 h-8 w-3/4 max-w-[480px] animate-pulse rounded-lg bg-[#E8EFEE]" />
          <div className="mt-3 h-4 w-2/3 max-w-[380px] animate-pulse rounded-lg bg-[#EEF2F1]" />
          <div className="mt-8 h-10 w-44 animate-pulse rounded-xl bg-[#F1E7D2]" />
        </div>

        <div className="min-h-[510px] rounded-[26px] border border-[#DCE7E5] bg-white p-6 shadow-sm">
          <div className="h-4 w-40 animate-pulse rounded bg-[#E2EBEA]" />
          <div className="mt-6 h-16 animate-pulse rounded-xl bg-[#EEF3F4]" />
          <div className="mt-5 h-40 animate-pulse rounded-xl bg-[#F1F5F4]" />
          <div className="mt-5 h-3 w-full animate-pulse rounded bg-[#EEF2F1]" />
          <div className="mt-3 h-3 w-4/5 animate-pulse rounded bg-[#EEF2F1]" />
          <div className="mt-8 h-11 animate-pulse rounded-xl bg-[#E8EFEE]" />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="h-12 animate-pulse rounded-xl bg-[#E8EFEE]" />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */
function SelfIntroductionPractice() {
  const { i18n: translationI18n } = useTranslation("ui");
  const location = useLocation();
  const navigate = useNavigate();
  const studentId = getUserId();

  const routeIntentRef = useRef(location.state || null);
  const speechBaselineRef = useRef("");
  const answerRef = useRef("");
  const draftsRef = useRef({}); // per-question drafts, no re-render needed
  const initialLoadStartedRef = useRef(false);
  const submissionLockRef = useRef(false);
  const autoSubmitTriggeredRef = useRef(false);

  const {
    transcript: speechTranscript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    browserSupportsContinuousListening,
    isMicrophoneAvailable,
  } = useSpeechRecognition({ clearTranscriptOnListen: false });

  const appLanguage = String(
    translationI18n.resolvedLanguage || translationI18n.language || "en",
  ).toLowerCase().split("-")[0];
  const [speechLanguage, setSpeechLanguage] = useState(appLanguage === "fr" ? "fr-FR" : "en-US");

  useEffect(() => {
    setSpeechLanguage(appLanguage === "fr" ? "fr-FR" : "en-US");
  }, [appLanguage]);

  const [questions, setQuestions] = useState([]);
  const [questionsLoaded, setQuestionsLoaded] = useState(false);
  const [questionLoadFailed, setQuestionLoadFailed] = useState(false);
  const [apiTotalQuestions, setApiTotalQuestions] = useState(0);
  const [dailyLimit, setDailyLimit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [phase, setPhase] = useState("intro");
  const [showStartModal, setShowStartModal] = useState(false);
  // When arriving from the feedback page via "Next Question", skip the intro and load directly.
  const [startingInterview, setStartingInterview] = useState(
    Boolean(routeIntentRef.current?.continueAfterSubmission),
  );
  const [skippingQuestion, setSkippingQuestion] = useState(false);
  const [activeQuestionId, setActiveQuestionId] = useState(null);
  const [submittedQuestionIds, setSubmittedQuestionIds] = useState([]);
  const [skippedQuestionIds, setSkippedQuestionIds] = useState([]);
  const [answer, setAnswer] = useState("");
  const [voiceMessage, setVoiceMessage] = useState(MESSAGES.ready);
  const [remainingSeconds, setRemainingSeconds] = useState(QUESTION_SECONDS);
  const [timerStarted, setTimerStarted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitStage, setSubmitStage] = useState("saving");
  const [submissionError, setSubmissionError] = useState("");
  const [translationPreview, setTranslationPreview] = useState("");
  const [translatingTranscript, setTranslatingTranscript] = useState(false);
  const [translationError, setTranslationError] = useState("");

  /* ---------------------------- Derived data ---------------------------- */
  const sortedQuestions = useMemo(() => normalizeQuestions({ questions }), [questions]);

  const activeQuestion = useMemo(
    () => sortedQuestions.find(
      (question) => String(question.question_id) === String(activeQuestionId),
    ) || null,
    [sortedQuestions, activeQuestionId],
  );

  const locallySubmitted = useMemo(
    () => new Set(submittedQuestionIds.map(String)),
    [submittedQuestionIds],
  );

  const locallySkipped = useMemo(
    () => new Set(skippedQuestionIds.map(String)),
    [skippedQuestionIds],
  );

  const isDone = useCallback(
    (question) => isAttempted(question) || locallySubmitted.has(String(question.question_id)),
    [locallySubmitted],
  );

  const unansweredQuestions = useMemo(
    () => sortedQuestions.filter(
      (question) => !isDone(question) && !locallySkipped.has(String(question.question_id)),
    ),
    [sortedQuestions, isDone, locallySkipped],
  );

  // Next pending (not submitted, not skipped) question after the current one, wrapping around.
  const findNextPending = useCallback((currentId, skippedSet) => {
    const list = sortedQuestions;
    if (list.length === 0) return null;
    const start = list.findIndex((q) => String(q.question_id) === String(currentId));

    for (let step = 1; step <= list.length; step += 1) {
      const candidate = list[(start + step + list.length) % list.length];
      const id = String(candidate.question_id);
      if (id !== String(currentId) && !isDone(candidate) && !skippedSet.has(id)) {
        return candidate;
      }
    }
    return null;
  }, [sortedQuestions, isDone]);

  const nextPendingQuestion = useMemo(
    () => (activeQuestionId == null ? null : findNextPending(activeQuestionId, locallySkipped)),
    [activeQuestionId, locallySkipped, findNextPending],
  );

  const totalQuestions = apiTotalQuestions || sortedQuestions.length;
  const submittedCount = Math.max(
    sortedQuestions.filter(isAttempted).length,
    locallySubmitted.size,
    Number(dailyLimit?.submittedToday || 0),
  );
  const progressPercent = totalQuestions > 0
    ? Math.min(100, Math.round((submittedCount / totalQuestions) * 100))
    : 0;
  const remainingToday = dailyLimit?.remaining ?? 0;
  const dailyLimitReached = Boolean(dailyLimit?.limitReached) || remainingToday <= 0;
  const questionIndex = activeQuestion
    ? sortedQuestions.findIndex(
      (question) => String(question.question_id) === String(activeQuestion.question_id),
    )
    : -1;
  const questionNumber = questionIndex >= 0 ? questionIndex + 1 : 0;
  const wordCount = answer.trim() ? answer.trim().split(/\s+/).length : 0;
  const canStart = !loading && !startingInterview && !loadError
    && Boolean(dailyLimit) && !dailyLimitReached;

  /* --------------- Question text (API content) translation --------------- */
  // Question text is content authored in the backend, so the static dictionary
  // cannot translate it. It is the only API text shown to the student.
  const [translatedQuestionText, setTranslatedQuestionText] = useState("");
  const [questionTranslationLoading, setQuestionTranslationLoading] = useState(false);
  const [questionTranslationFailed, setQuestionTranslationFailed] = useState(false);
  const rawQuestionText = activeQuestion?.question_text || "";

  useEffect(() => {
    let cancelled = false;
    setTranslatedQuestionText("");
    setQuestionTranslationFailed(false);

    if (appLanguage !== "fr" || !rawQuestionText) {
      setQuestionTranslationLoading(false);
      return undefined;
    }

    // Reuse the shared translation cache. This avoids a second page-local
    // cache and ensures the same logout/cache-clearing rules apply everywhere.
    const cached = translateValue(rawQuestionText, { lng: "fr" });
    if (
      typeof cached === "string"
      && cached.trim()
      && cached.trim() !== rawQuestionText.trim()
    ) {
      setTranslatedQuestionText(cached.trim());
      setQuestionTranslationLoading(false);
      return undefined;
    }

    setQuestionTranslationLoading(true);

    (async () => {
      try {
        // Pass the complete API question record so the centralized translation
        // service can recognize question_text using its question-field rules.
        const translatedQuestion = await translateApiContent(activeQuestion, "fr");
        const translatedText = typeof translatedQuestion === "string"
          ? translatedQuestion
          : translatedQuestion?.question_text
            ?? translatedQuestion?.questionText
            ?? translatedQuestion?.prompt
            ?? "";

        if (cancelled) return;

        if (
          typeof translatedText === "string"
          && translatedText.trim()
          && translatedText.trim() !== rawQuestionText.trim()
        ) {
          const cleanTranslation = translatedText.trim();
          setTranslatedQuestionText(cleanTranslation);
          setQuestionTranslationFailed(false);
        } else {
          // Do not silently show English while French is the selected UI language.
          setQuestionTranslationFailed(true);
        }
      } catch {
        if (!cancelled) setQuestionTranslationFailed(true);
      } finally {
        if (!cancelled) setQuestionTranslationLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [appLanguage, activeQuestion, rawQuestionText]);

  const displayQuestionText = appLanguage === "fr"
    ? translatedQuestionText
      || (questionTranslationLoading
        ? "Traduction de la question..."
        : questionTranslationFailed
          ? "La traduction de cette question est temporairement indisponible."
          : "Traduction de la question...")
    : (rawQuestionText ? translateValue(rawQuestionText) : tr(MESSAGES.questionUnavailable));

  /* ------------------------------ Data loading ------------------------------ */
  // Initial page load: fetch ONLY the daily limit. Questions load after "Proceed to interview".
  const loadDailyLimit = useCallback(async () => {
    if (!studentId) {
      setLoadError(getApiErrorMessage(SESSION_EXPIRED_ERROR));
      setLoading(false);
      return null;
    }

    setLoading(true);
    setLoadError("");
    setQuestionLoadFailed(false);

    try {
      const limitPayload = await getSelfIntroductionDailyLimit(studentId);
      const normalizedLimit = normalizeDailyLimit(limitPayload);
      setDailyLimit(normalizedLimit);
      return normalizedLimit;
    } catch (error) {
      setLoadError(getApiErrorMessage(error, MESSAGES.loadFailed));
      return null;
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  const loadQuestions = useCallback(async () => {
    if (!studentId) throw SESSION_EXPIRED_ERROR;

    const questionPayload = await getSelfIntroductionQuestions(studentId);
    const normalizedQuestions = normalizeQuestions(questionPayload);

    setQuestions(normalizedQuestions);
    setApiTotalQuestions(extractTotalQuestionCount(questionPayload, normalizedQuestions));
    setQuestionsLoaded(true);
    return normalizedQuestions;
  }, [studentId]);

  // The initial load effect lives below, after beginPractice is defined.

  /* ------------------------------ Speech sync ------------------------------ */
  useEffect(() => {
    const recognizedText = String(speechTranscript || "").trim();
    const nextAnswer = [speechBaselineRef.current, recognizedText]
      .filter(Boolean)
      .join(" ")
      .trim();

    if (nextAnswer !== answerRef.current) {
      answerRef.current = nextAnswer;
      setAnswer(nextAnswer);
      setTranslationPreview("");
      setTranslationError("");
    }
  }, [speechTranscript]);

  // Graceful stop (used before submitting so final words are flushed).
  // stopListening() can stay pending when the mic is not active, so never wait on it for long.
  const stopVoice = useCallback(async () => {
    try {
      await Promise.race([
        Promise.resolve(SpeechRecognition.stopListening()),
        new Promise((resolve) => window.setTimeout(resolve, 400)),
      ]);
    } catch {
      // The browser may already have stopped the microphone.
    } finally {
      setTimerStarted(false);
    }
  }, []);

  // Immediate stop (used when moving between questions). Fire-and-forget: never blocks the UI.
  const abortVoice = useCallback(() => {
    try {
      void Promise.resolve(SpeechRecognition.abortListening()).catch(() => {});
    } catch {
      // Ignore: the microphone may already be stopped.
    }
    setTimerStarted(false);
  }, []);

  useEffect(() => () => {
    void Promise.resolve(SpeechRecognition.abortListening()).catch(() => {
      // Ignore cleanup errors after unmount.
    });
  }, []);

  const resetAnswerState = useCallback(() => {
    answerRef.current = "";
    speechBaselineRef.current = "";
    resetTranscript();
    setAnswer("");
    setSubmissionError("");
    setTranslationPreview("");
    setTranslationError("");
    autoSubmitTriggeredRef.current = false;
    setRemainingSeconds(QUESTION_SECONDS);
    setTimerStarted(false);
  }, [resetTranscript]);

  /* ---------------------- Single navigation entry point ---------------------- */
  // Skip and the stepper both go through this function so state never drifts.
  const openQuestion = useCallback(async (question, message = MESSAGES.selected) => {
    if (!question) return;

    // Save the current draft before leaving it.
    if (activeQuestionId != null) {
      draftsRef.current[String(activeQuestionId)] = answerRef.current;
    }

    abortVoice();
    resetTranscript();

    const draft = draftsRef.current[String(question.question_id)] || "";
    answerRef.current = draft;
    speechBaselineRef.current = draft;
    autoSubmitTriggeredRef.current = false;

    setAnswer(draft);
    setTranslationPreview("");
    setTranslationError("");
    setSubmissionError("");
    setRemainingSeconds(QUESTION_SECONDS);
    setTimerStarted(false);
    setSkippedQuestionIds((current) => current.filter((id) => String(id) !== String(question.question_id)));
    setActiveQuestionId(question.question_id);
    setVoiceMessage(message);
    setPhase("answer");
  }, [activeQuestionId, abortVoice, resetTranscript]);

  /* ------------------------------ Submit answer ------------------------------ */
  const submitAnswer = useCallback(async ({ automatic = false } = {}) => {
    if (!activeQuestion || !studentId || submissionLockRef.current) return;

    submissionLockRef.current = true;
    await stopVoice();
    // Let the speech library flush its final result before reading the ref.
    await new Promise((resolve) => window.setTimeout(resolve, 120));

    const cleanAnswer = answerRef.current.trim();
    if (!cleanAnswer) {
      submissionLockRef.current = false;
      setSubmitting(false);
      setPhase("timeout");
      setVoiceMessage(MESSAGES.noAnswerCaptured);
      return;
    }

    setSubmitting(true);
    setSubmitStage("saving");
    setPhase("submitting");
    setSubmissionError("");
    setVoiceMessage(automatic ? MESSAGES.autoSubmitting : MESSAGES.submitting);

    try {
      const submitPayload = await submitSelfIntroductionAnswer(
        studentId,
        activeQuestion.question_id,
        cleanAnswer,
      );

      setSubmitStage("evaluating");
      const submittedId = String(activeQuestion.question_id);
      const nextSubmittedIds = [...new Set([...submittedQuestionIds.map(String), submittedId])];
      setSubmittedQuestionIds(nextSubmittedIds);
      delete draftsRef.current[submittedId];

      // The submit-answer API already returns the evaluation in its response.
      // Reuse that response directly instead of making a second evaluation request.
      const evaluationPayload = submitPayload;

      setSubmitStage("finalizing");
      // Reuse the questions already loaded for this interview. The successful
      // submission updates only the local attempted flag and daily counter;
      // do not refetch either endpoint after every answer.
      const latestQuestions = questions.map((question) =>
        String(question.question_id) === submittedId
          ? { ...question, attempted_status: true }
          : question
      );
      const latestDailyLimit = dailyLimit ? {
        ...dailyLimit,
        submittedToday: dailyLimit.submittedToday + 1,
        remaining: Math.max(0, dailyLimit.remaining - 1),
        limitReached: dailyLimit.remaining - 1 <= 0,
      } : dailyLimit;

      setQuestions(latestQuestions);
      setQuestionsLoaded(true);
      setDailyLimit(latestDailyLimit);

      navigate("/student/ai-practice/feedback", {
        state: {
          mode: "self-introduction-api",
          title: "Self-Introduction Evaluation",
          question: activeQuestion,
          questionId: activeQuestion.question_id,
          answer: cleanAnswer,
          evaluationPayload,
          submitPayload,
          questionNumber,
          totalQuestions,
          questions: latestQuestions,
          submittedQuestionIds: nextSubmittedIds,
          dailyLimit: latestDailyLimit,
        },
      });
    } catch (error) {
      setSubmissionError(getApiErrorMessage(error, MESSAGES.submitFailed));
      setPhase("answer");
      setVoiceMessage(MESSAGES.submitFailed);
    } finally {
      setSubmitting(false);
      submissionLockRef.current = false;
    }
  }, [
    activeQuestion,
    studentId,
    stopVoice,
    submittedQuestionIds,
    questions,
    dailyLimit,
    navigate,
    questionNumber,
    totalQuestions,
  ]);

  /* --------------------------------- Timer --------------------------------- */
  useEffect(() => {
    if (phase !== "answer" || !activeQuestion || !timerStarted) return undefined;

    const timerId = window.setInterval(() => {
      setRemainingSeconds((current) => {
        if (current <= 1) {
          window.clearInterval(timerId);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [phase, activeQuestion?.question_id, timerStarted]);

  useEffect(() => {
    if (phase !== "answer" || remainingSeconds !== 0 || !activeQuestion) return;
    if (autoSubmitTriggeredRef.current || submissionLockRef.current) return;

    autoSubmitTriggeredRef.current = true;
    void (async () => {
      // Stop gracefully so the speech engine can flush any final recognised words.
      await stopVoice();
      await new Promise((resolve) => window.setTimeout(resolve, 180));

      if (answerRef.current.trim()) {
        setVoiceMessage(MESSAGES.autoSubmitting);
        await submitAnswer({ automatic: true });
        return;
      }

      // The API requires answer_text; never submit an empty response.
      setVoiceMessage(MESSAGES.timeUpNoAnswer);
      setPhase("timeout");
    })();
  }, [phase, remainingSeconds, activeQuestion, stopVoice, submitAnswer]);

  /* ----------------------------- Start interview ----------------------------- */
  const startInterview = () => {
    if (!canStart) return;
    setShowStartModal(true);
  };

  const confirmStartInterview = async () => {
    if (startingInterview || loading) return;

    setShowStartModal(false);
    await beginPractice(null);
  };

  // Loads the questions and opens the first pending one.
  // limitOverride is used when the daily limit was just fetched (auto-continue from feedback).
  const beginPractice = async (limitOverride) => {
    const limitReached = limitOverride
      ? Boolean(limitOverride.limitReached) || limitOverride.remaining <= 0
      : dailyLimitReached;

    setStartingInterview(true);
    setLoading(true);
    setLoadError("");
    setQuestionLoadFailed(false);
    setQuestionsLoaded(false);

    try {
      const navigationIntent = routeIntentRef.current;
      const cachedQuestions = Array.isArray(navigationIntent?.questions)
        && navigationIntent.questions.length
        ? navigationIntent.questions
        : null;

      // Next Question navigation carries the already-loaded list. Reuse it
      // instead of calling GET /questions again. Fetch only as a safe fallback
      // when the page was refreshed and router state is unavailable.
      const freshQuestions = cachedQuestions || await loadQuestions();
      if (cachedQuestions) {
        setQuestions(cachedQuestions);
        setQuestionsLoaded(true);
        setApiTotalQuestions(
          Number(navigationIntent?.totalQuestions) || cachedQuestions.length,
        );
      }

      const priorSubmittedIds = Array.isArray(navigationIntent?.submittedQuestionIds)
        ? navigationIntent.submittedQuestionIds.map(String)
        : submittedQuestionIds.map(String);

      setSubmittedQuestionIds(priorSubmittedIds);

      let firstQuestion = null;
      if (navigationIntent?.retryQuestionId != null) {
        firstQuestion = freshQuestions.find(
          (question) => String(question.question_id) === String(navigationIntent.retryQuestionId),
        ) || null;
      } else {
        const submittedSet = new Set(priorSubmittedIds);
        const isPending = (question) => !isAttempted(question)
          && !submittedSet.has(String(question.question_id));

        // After a submission, continue with the question that follows the one just answered.
        const fromIndex = navigationIntent?.fromQuestionId != null
          ? freshQuestions.findIndex(
            (question) => String(question.question_id) === String(navigationIntent.fromQuestionId),
          )
          : -1;
        const ordered = fromIndex >= 0
          ? [...freshQuestions.slice(fromIndex + 1), ...freshQuestions.slice(0, fromIndex + 1)]
          : freshQuestions;

        firstQuestion = ordered.find(isPending) || null;
      }

      routeIntentRef.current = null;

      if (!firstQuestion || limitReached) {
        setActiveQuestionId(null);
        setPhase(limitReached ? "limit" : "complete");
        return;
      }

      resetAnswerState();
      draftsRef.current = {};
      setSkippedQuestionIds([]);
      setActiveQuestionId(firstQuestion.question_id);
      setVoiceMessage(MESSAGES.questionsLoaded);
      setPhase("answer");
    } catch (error) {
      setQuestionLoadFailed(true);
      setLoadError(getApiErrorMessage(error, MESSAGES.loadFailed));
      setPhase("intro");
    } finally {
      setStartingInterview(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    // StrictMode replays effects in development; keep the initial read single-shot.
    if (initialLoadStartedRef.current) return;
    initialLoadStartedRef.current = true;

    // Coming from feedback: use the questions and daily-limit snapshot already
    // carried in router state. No extra GET requests are needed for Next Question.
    if (routeIntentRef.current?.continueAfterSubmission) {
      const navigationIntent = routeIntentRef.current;
      const cachedLimit = navigationIntent?.dailyLimit;

      if (
        Array.isArray(navigationIntent?.questions)
        && navigationIntent.questions.length
        && cachedLimit
      ) {
        setDailyLimit(cachedLimit);
        void beginPractice(cachedLimit);
      } else {
        // Safe recovery path for a refreshed/deep-linked page with no router state.
        void (async () => {
          const limit = await loadDailyLimit();
          if (limit) {
            await beginPractice(limit);
          } else {
            setStartingInterview(false);
          }
        })();
      }
      return;
    }

    void loadDailyLimit();
  }, [loadDailyLimit]); // eslint-disable-line react-hooks/exhaustive-deps

  /* --------------------------------- Voice --------------------------------- */
  const toggleVoice = async () => {
    if (!browserSupportsSpeechRecognition) {
      setVoiceMessage(MESSAGES.speechUnsupported);
      return;
    }

    if (listening) {
      await stopVoice();
      setVoiceMessage(MESSAGES.micStopped);
      return;
    }

    if (remainingSeconds <= 0 || submitting || phase !== "answer") return;
    if (isMicrophoneAvailable === false) {
      setVoiceMessage(MESSAGES.micBlocked);
      return;
    }

    // Keep any manually typed text, then let the library append the speech transcript.
    speechBaselineRef.current = answerRef.current.trim();
    resetTranscript();

    try {
      await SpeechRecognition.startListening({
        continuous: Boolean(browserSupportsContinuousListening),
        language: speechLanguage,
      });
      setTimerStarted(true);
      setVoiceMessage(browserSupportsContinuousListening
        ? MESSAGES.listening
        : MESSAGES.listeningFallback);
    } catch {
      setVoiceMessage(MESSAGES.micStartFailed);
    }
  };

  const handleAnswerChange = async (event) => {
    const nextValue = event.target.value;
    if (listening) await stopVoice();
    speechBaselineRef.current = nextValue;
    resetTranscript();
    answerRef.current = nextValue;
    if (activeQuestionId != null) draftsRef.current[String(activeQuestionId)] = nextValue;
    setAnswer(nextValue);
    setTranslationPreview("");
    setTranslationError("");
  };

  const translateTranscriptToFrench = async () => {
    const cleanAnswer = answerRef.current.trim();
    if (!cleanAnswer || speechLanguage !== "en-US") return;

    setTranslatingTranscript(true);
    setTranslationError("");

    try {
      const translated = await translateApiContent(cleanAnswer, "fr");
      if (typeof translated !== "string" || !translated.trim() || translated === cleanAnswer) {
        setTranslationError(MESSAGES.translationUnavailable);
      } else {
        setTranslationPreview(translated);
      }
    } catch {
      setTranslationError(MESSAGES.translationUnavailable);
    } finally {
      setTranslatingTranscript(false);
    }
  };

  /* ---------------------------- Skip & stepper ---------------------------- */
  const skipQuestion = async () => {
    if (!activeQuestion || submitting || skippingQuestion) return;

    const currentId = String(activeQuestion.question_id);
    setSkippingQuestion(true);
    setSubmissionError("");

    try {
      // Save the skip in the backend first.
      await skipSelfIntroductionQuestion(studentId, activeQuestion.question_id);

      // A skipped question's draft is discarded.
      delete draftsRef.current[currentId];
      answerRef.current = "";

      const nextSkipped = new Set([...locallySkipped, currentId]);
      const next = findNextPending(currentId, nextSkipped);

      setSkippedQuestionIds([...nextSkipped]);

      if (!next) {
        abortVoice();
        setActiveQuestionId(null);
        setPhase("complete");
        return;
      }

      await openQuestion(next, MESSAGES.skipped);
    } catch (error) {
      setSubmissionError(getApiErrorMessage(error, MESSAGES.skipFailed));
    } finally {
      setSkippingQuestion(false);
    }
  };

  const goToStepperQuestion = (question) => {
    if (!questionsLoaded || !question || submitting || skippingQuestion) return;
    if (String(question.question_id) === String(activeQuestionId) && phase === "answer") return;
    void openQuestion(question, isDone(question) ? MESSAGES.submittedReview : MESSAGES.selected);
  };

  /* ------------------------------ Page actions ------------------------------ */
  const restartPractice = () => {
    void stopVoice();
    draftsRef.current = {};
    setSkippedQuestionIds([]);
    setActiveQuestionId(null);
    resetAnswerState();
    setQuestions([]);
    setQuestionsLoaded(false);
    setApiTotalQuestions(0);
    setPhase("intro");
    void loadDailyLimit();
  };

  const exitPractice = () => {
    void stopVoice();
    setPhase("intro");
    setActiveQuestionId(null);
    resetAnswerState();
  };

  const minutes = String(Math.floor(remainingSeconds / 60)).padStart(2, "0");
  const seconds = String(remainingSeconds % 60).padStart(2, "0");
  const timerIsUrgent = remainingSeconds <= 15;

  /* -------------------------------- Stepper -------------------------------- */
  const renderQuestionStepper = () => (
    <div className="rounded-2xl border border-[#DCE7E5] bg-white px-4 py-4 shadow-[0_2px_10px_rgba(6,66,75,0.035)] sm:px-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[9px] font-extrabold tracking-[0.16em] text-[#789093]">
            {tr("SELF-INTRODUCTION PRACTICE")}
          </p>
          <p className="mt-1 text-sm font-extrabold text-[#06424B]">
            {tr("Question")} {questionNumber} {tr("of")} {totalQuestions}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden w-28 sm:block">
            <div className="h-1.5 overflow-hidden rounded-full bg-[#E8EFEF]">
              <div
                className="h-full rounded-full bg-[#06424B] transition-[width] duration-500"
                style={{ width: `${questionNumber > 0 ? (questionNumber / Math.max(totalQuestions, 1)) * 100 : 0}%` }}
              />
            </div>
          </div>
          <button
            type="button"
            onClick={exitPractice}
            className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-[#DCE7E5] bg-white px-3 text-[11px] font-bold text-[#36585C] transition hover:border-[#06424B] hover:bg-[#F7FAFA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFAB0B]"
          >
            <ArrowLeft size={13} aria-hidden="true" />
            {tr("Exit practice")}
          </button>
        </div>
      </div>

      <ol className="mt-5 flex min-w-0 items-center gap-0 overflow-x-auto pb-1 [scrollbar-width:thin]" aria-label={tr("Question progress stepper")}>
        {sortedQuestions.map((question, index) => {
          const isCurrent = ["answer", "timeout"].includes(phase)
            && String(question.question_id) === String(activeQuestionId);
          const isComplete = isDone(question);
          const isSkipped = locallySkipped.has(String(question.question_id));
          const attemptCount = getQuestionAttemptCount(question);
          const statusLabel = isCurrent
            ? tr("Current question")
            : isComplete
              ? tr("Submitted")
              : isSkipped
                ? tr("Skipped")
                : tr("Not started");

          return (
            <li key={question.question_id} className="flex min-w-[34px] flex-1 items-center last:flex-none">
              <div className="flex shrink-0 flex-col items-center gap-1.5">
                <button
                  type="button"
                  title={attemptCount == null ? statusLabel : `${statusLabel} · ${tr("Attempts")}: ${attemptCount}`}
                  aria-label={`${tr("Go to question")} ${index + 1}: ${statusLabel}${attemptCount == null ? "" : `, ${tr("Attempts")}: ${attemptCount}`}`}
                  aria-current={isCurrent ? "step" : undefined}
                  onClick={() => goToStepperQuestion(question)}
                  disabled={submitting || skippingQuestion || phase === "submitting"}
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[10px] font-extrabold transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFAB0B] disabled:cursor-not-allowed disabled:opacity-60 sm:h-8 sm:w-8 ${
                    isCurrent
                      ? "border-[#06424B] bg-[#06424B] text-white shadow-[0_0_0_4px_rgba(6,66,75,0.10)]"
                      : isComplete
                        ? "border-[#A8D5BE] bg-[#EAF5EF] text-[#39765D] hover:border-[#39765D]"
                        : isSkipped
                          ? "border-[#EADBC8] bg-[#FBF7F1] text-[#9A7845] hover:border-[#06424B] hover:bg-[#EEF5F4]"
                          : "border-[#DCE7E5] bg-[#FAFCFC] text-[#829596] hover:border-[#06424B] hover:bg-[#EEF5F4] hover:text-[#06424B]"
                  }`}
                >
                  {isComplete && !isCurrent ? <Check size={13} aria-hidden="true" /> : index + 1}
                </button>
                {attemptCount != null && (
                  <span className="whitespace-nowrap text-[8px] font-medium text-[#829596]">
                    {tr("Attempts")}: {attemptCount}
                  </span>
                )}
              </div>
              {index < sortedQuestions.length - 1 && (
                <span
                  className={`mx-1.5 h-px min-w-2 flex-1 rounded-full sm:mx-2 ${
                    isComplete ? "bg-[#A8D5BE]" : "bg-[#E7EEEE]"
                  }`}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );

  const resetsAtText = formatResetTime(dailyLimit?.resetsAt, appLanguage);

  /* --------------------- Interview loading state --------------------- */
  // Keep the question skeleton visible together with the shared main loader.
  if (startingInterview) {
    return (
      <div data-a11y-page="self-introduction">
        <PageShell max="max-w-[1400px]">
        <Loader open={startingInterview} text={tr("Loading interview questions...")} />
        <style>{`
          @keyframes sn-fade-in { from { opacity: 0; } to { opacity: 1; } }
          .sn-skeleton-calm { animation: sn-fade-in .3s ease-out both; }
        `}</style>
        <div className="sn-skeleton-calm">
          <InterviewLoadingSkeleton />
        </div>
        </PageShell>
      </div>
    );
  }

  /* --------------------------------- Render --------------------------------- */
  return (
    <div data-a11y-page="self-introduction">
      <PageShell max={phase === "answer" || phase === "submitting" ? "max-w-[1400px]" : "max-w-[1100px]"}>
      <style>{`
        @keyframes sn-ai-wave-motion {
          0%, 100% { transform: scaleY(.24); opacity: .54; }
          50% { transform: scaleY(1); opacity: 1; }
        }
        @keyframes sn-ai-orbit {
          0%, 100% { transform: scale(.96); opacity: .65; }
          50% { transform: scale(1.04); opacity: 1; }
        }
        .sn-ai-wave { display:flex; align-items:center; justify-content:center; gap:3px; height:44px; }
        .sn-ai-wave span { display:block; width:3px; min-height:6px; border-radius:999px; background:#0B5961; transform:scaleY(.42); transform-origin:center; animation:sn-ai-wave-motion .82s ease-in-out infinite; }
        .sn-ai-wave span:nth-child(4n) { background:#FFAB0B; }
        .sn-ai-wave-compact { height:34px; gap:2px; }
        .sn-ai-wave-compact span { width:2.5px; }
        .sn-ai-wave:not(.sn-ai-wave-active) span { animation:none !important; opacity:.55; transform:scaleY(.42); }
        .sn-ai-orbit { animation:sn-ai-orbit 2.6s ease-in-out infinite; }
        @keyframes sn-ai-ripple {
          0% { transform: scale(.72); opacity: .9; }
          100% { transform: scale(1.28); opacity: 0; }
        }
        @keyframes sn-ai-spin { to { transform: rotate(360deg); } }
        @keyframes sn-ai-bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .sn-ai-ripple { animation: sn-ai-ripple 2.2s ease-out infinite; }
        .sn-ai-ripple-delay { animation-delay: 1.1s; }
        .sn-ai-spin-ring { border: 3px solid transparent; border-top-color: #FFAB0B; border-right-color: #FFAB0B; animation: sn-ai-spin 1.4s linear infinite; }
        .sn-ai-icon-bob { animation: sn-ai-bob 1.6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .sn-ai-wave span, .sn-ai-orbit, .sn-ai-ripple, .sn-ai-spin-ring, .sn-ai-icon-bob { animation:none !important; transform:none !important; }
        }
      `}</style>

      {(phase === "intro" || phase === "limit" || phase === "complete") && (
        <>
          <StudentPageHeader
            title={tr("Self-Introduction Evaluation")}
            subtitle={tr("Practise a clear and confident professional introduction.")}
          />
          <div className="mt-5">
            <BackLink to="/student/ai-practice">{tr("AI Practice")}</BackLink>
          </div>
        </>
      )}

      {/* ------------------------------ Intro ------------------------------ */}
      {phase === "intro" && (
        <Card className="mt-5 overflow-hidden p-6 sm:p-9" data-a11y-region="self-introduction-practice">
          <div className="grid gap-5">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] border border-[#DCE7E5] bg-[#EEF3F4] text-[#06424B] shadow-sm">
                <Volume2 size={29} aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-extrabold tracking-[0.17em] text-[#B07A06]">
                  {tr("SELF-INTRODUCTION PRACTICE")}
                </p>
                <h1 className="mt-2 text-3xl font-extrabold leading-tight text-[#06424B] sm:text-[36px]">
                  {tr("Tell us about yourself.")}
                </h1>
                <p className="mt-3 max-w-[760px] text-sm leading-7 text-[#587276]">
                  {tr("Answer the interview questions below. Your responses and daily progress are saved to your account automatically.")}
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <>
              <Loader open={loading} text={tr("Loading your learning space...")} />
              <IntroSkeleton />
            </>
          ) : loadError ? (
            <div className="mt-8 rounded-2xl border border-[#E6C9C4] bg-[#FFF7F5] p-5" role="alert">
              <p className="text-sm font-semibold leading-6 text-[#8D4035]">{tr(loadError)}</p>
              <button
                type="button"
                onClick={() => (questionLoadFailed ? void confirmStartInterview() : void loadDailyLimit())}
                className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#06424B] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0A5963] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFAB0B]"
              >
                <RotateCcw size={15} aria-hidden="true" />
                {tr("Try again")}
              </button>
            </div>
          ) : (
            <>
              <div className="mt-8 grid gap-3 sm:grid-cols-3" role="group" aria-label={tr("Daily practice summary")}>
                <div className="rounded-2xl border border-[#DCE7E5] bg-[#F7FAFA] p-5">
                  <p className="text-[10px] font-extrabold tracking-wide text-[#6D8588]">{tr("QUESTIONS AVAILABLE")}</p>
                  <p className="mt-2 text-3xl font-extrabold text-[#06424B]">{questionsLoaded ? sortedQuestions.length : "—"}</p>
                  <p className="mt-1 text-[10px] text-[#829596]">{tr(questionsLoaded ? "Ready for you" : "Loaded when interview starts")}</p>
                </div>
                <div className="rounded-2xl border border-[#DCE7E5] bg-[#F7FAFA] p-5">
                  <p className="text-[10px] font-extrabold tracking-wide text-[#6D8588]">{tr("SUBMITTED TODAY")}</p>
                  <p className="mt-2 text-3xl font-extrabold text-[#06424B]">{dailyLimit?.submittedToday ?? 0}<span className="text-lg text-[#8AA0A2]"> / {dailyLimit?.dailyLimit ?? 0}</span></p>
                  <p className="mt-1 text-[10px] text-[#829596]">{tr("Saved to your account")}</p>
                </div>
                <div className="rounded-2xl border border-[#F1DFB6] bg-[#FFFAEE] p-5">
                  <p className="text-[10px] font-extrabold tracking-wide text-[#946B13]">{tr("REMAINING TODAY")}</p>
                  <p className="mt-2 text-3xl font-extrabold text-[#815C12]">{remainingToday}</p>
                  <p className="mt-1 text-[10px] text-[#9A7B3B]">{tr("Available submissions")}</p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-[#E5ECEB] bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[10px] font-extrabold tracking-wide text-[#527477]">{tr("OVERALL QUESTION PROGRESS")}</p>
                  <p className="text-xs font-bold tabular-nums text-[#06424B]">{questionsLoaded ? `${submittedCount} / ${totalQuestions}` : `${dailyLimit?.submittedToday ?? 0} / ${dailyLimit?.dailyLimit ?? 0}`}</p>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#E8EFEF]">
                  <div className="h-full rounded-full bg-[#06424B] transition-[width] duration-500" style={{ width: `${questionsLoaded ? progressPercent : (dailyLimit?.dailyLimit ? Math.min(100, (dailyLimit.submittedToday / dailyLimit.dailyLimit) * 100) : 0)}%` }} />
                </div>
              </div>

              {resetsAtText && (
                <p className="mt-3 text-xs text-[#718486]">
                  {tr("Daily limit resets at")} {resetsAtText}
                </p>
              )}

              {questionsLoaded && sortedQuestions.length === 0 ? (
                <div className="mt-6 rounded-xl border border-[#DCE7E5] bg-[#F7FAFA] p-5 text-sm leading-6 text-[#45666A]" role="status">
                  {tr("No questions are currently available for this practice.")}
                </div>
              ) : dailyLimitReached ? (
                <div className="mt-6 rounded-xl border border-[#F1DFB6] bg-[#FFFAEE] p-5 text-sm leading-6 text-[#795817]" role="status">
                  {tr(MESSAGES.limit)}
                </div>
              ) : questionsLoaded && unansweredQuestions.length === 0 ? (
                <div className="mt-6 rounded-xl border border-[#DCE7E5] bg-[#F7FAFA] p-5 text-sm leading-6 text-[#45666A]" role="status">
                  {tr("You have answered all currently available questions.")}
                </div>
              ) : null}

              <div className="mt-7 flex flex-col gap-4 border-t border-[#E8EEEE] pt-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="max-w-2xl">
                  <p className="text-sm font-bold text-[#36585C]">{tr("Ready for your introduction?")}</p>
                  <p className="mt-1 text-xs leading-6 text-[#718486]">
                    {tr("Each question has 119 seconds. You can speak or type, review your transcript, and submit it for feedback.")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={startInterview}
                  disabled={!canStart}
                  className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#FFAB0B] px-7 py-3 text-sm font-extrabold text-[#06424B] shadow-sm transition hover:bg-[#FFC13C] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#06424B]"
                >
                  <Play size={16} aria-hidden="true" />
                  {tr("Start interview")}
                </button>
              </div>
            </>
          )}
        </Card>
      )}

      {/* --------------------------- Answer / Submitting --------------------------- */}
      {(phase === "answer" || phase === "submitting") && activeQuestion && (
        <>
          {phase === "answer" && (
            <div className="mt-1">
              {renderQuestionStepper()}
            </div>
          )}

          {phase === "submitting" ? (
            /* Compact, viewport-fitted submitting screen. */
            <Card
              className="mx-auto mt-3 flex min-h-[calc(100dvh-180px)] w-full max-w-[960px] flex-col items-center justify-center px-4 py-4 text-center sm:min-h-[calc(100dvh-190px)] sm:px-6 sm:py-5"
              aria-busy="true"
              role="status"
              aria-live="polite"
              data-a11y-region="self-introduction-submitting"
            >
              <div className="relative flex h-24 w-24 shrink-0 items-center justify-center sm:h-28 sm:w-28" aria-hidden="true">
                <span className="sn-ai-ripple absolute inset-0 rounded-full border-2 border-[#06424B]/25" />
                <span className="sn-ai-ripple sn-ai-ripple-delay absolute inset-0 rounded-full border-2 border-[#FFAB0B]/45" />
                <span className="sn-ai-spin-ring absolute inset-2 rounded-full" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[#06424B] text-white shadow-lg sm:h-20 sm:w-20">
                  <ClipboardCheck size={34} className="sn-ai-icon-bob" />
                </div>
              </div>

              <div className="mt-2">
                <VoiceWave active />
              </div>

              <h2 className="mt-3 text-xl font-extrabold text-[#06424B] sm:text-2xl">
                {tr(MESSAGES.submitting)}
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-5 text-[#718486]">
                {tr("Please keep this page open while we save and review your answer.")}
              </p>

              <ol className="mt-4 w-full max-w-xl space-y-2 text-left">
                {SUBMIT_STAGES.map((stage, index) => {
                  const currentIndex = SUBMIT_STAGES.findIndex((item) => item.id === submitStage);
                  const done = index < currentIndex;
                  const active = index === currentIndex;
                  return (
                    <li
                      key={stage.id}
                      aria-current={active ? "step" : undefined}
                      className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-bold transition-colors ${
                        done
                          ? "border-[#A8D5BE] bg-[#EAF5EF] text-[#39765D]"
                          : active
                            ? "border-[#06424B] bg-[#EEF5F4] text-[#06424B]"
                            : "border-[#E7EEEE] bg-white text-[#9AA9AA]"
                      }`}
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-current text-xs">
                        {done
                          ? <Check size={18} aria-hidden="true" />
                          : active
                            ? <LoaderCircle size={18} className="animate-spin" aria-hidden="true" />
                            : index + 1}
                      </span>
                      {tr(stage.label)}
                    </li>
                  );
                })}
              </ol>
            </Card>
          ) : (
            <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,.95fr)]">
              <div className="flex flex-col gap-4">
                <section className="flex min-h-[510px] flex-col items-center justify-center rounded-[26px] border border-[#DCE7E5] bg-white px-6 py-9 text-center shadow-[0_3px_14px_rgba(6,66,75,0.045)] sm:px-10" aria-labelledby="self-introduction-question-title">
                  <div className="relative flex h-[112px] w-[112px] items-center justify-center overflow-hidden rounded-[28px] border border-[#C8DEDC] bg-[#EEF5F4] p-2 shadow-sm">
                    <img src="/interviewer-avatar.png" alt={tr("Skill Next AI interviewer")} className="h-full w-full rounded-[21px] object-cover" />
                    <span className="absolute bottom-2 right-2 h-3 w-3 rounded-full border-2 border-white bg-[#65A889]" aria-label={tr("Interviewer ready")} />
                  </div>

                  <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                    <span className="rounded-full bg-[#EAF3F2] px-3 py-1.5 text-[9px] font-extrabold tracking-[0.12em] text-[#06424B]">{tr("AI INTERVIEWER")}</span>
                    <span className="rounded-full bg-[#FFF5DB] px-3 py-1.5 text-[9px] font-extrabold tracking-wide text-[#936400]">{tr("SELF INTRODUCTION")}</span>
                  </div>

                  <div className={`mt-5 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold tabular-nums ${timerIsUrgent ? "bg-[#FFF0D8] text-[#936400]" : "bg-[#EEF4F3] text-[#06424B]"}`} aria-live="off">
                    <Clock3 size={15} aria-hidden="true" />
                    {tr("QUESTION TIME REMAINING")}
                    <span className="text-sm">{minutes}:{seconds}</span>
                  </div>

                  <p className="mt-6 text-[10px] font-extrabold tracking-[0.18em] text-[#B07A06]">{tr("SKILL NEXT INTERVIEW PRACTICE")}</p>
                  <h2 id="self-introduction-question-title" className="mt-3 max-w-[760px] text-xl font-extrabold leading-9 text-[#06424B] sm:text-[26px]">
                    {displayQuestionText}
                  </h2>
                  <p className="mt-4 max-w-xl text-xs leading-6 text-[#829596]">
                    {tr("Your response will be submitted exactly as shown in the transcript.")}
                  </p>

                  <div className="mt-5 flex min-h-12 flex-col items-center justify-center" aria-live="polite">
                    <VoiceWave active={listening} compact />
                    <span className="mt-1 text-[9px] font-extrabold tracking-[0.13em] text-[#527477]">
                      {tr(listening ? "LISTENING TO YOUR ANSWER" : "AI INTERVIEWER READY")}
                    </span>
                  </div>
                </section>

                <div className="grid gap-3 sm:grid-cols-3" aria-label={tr("Interview actions")}>
                  <button
                    type="button"
                    onClick={toggleVoice}
                    disabled={remainingSeconds === 0 || submitting || !browserSupportsSpeechRecognition}
                    aria-pressed={listening}
                    aria-controls="self-introduction-transcript"
                    className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-extrabold transition disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFAB0B] ${listening ? "bg-[#A74631] text-white hover:bg-[#913C2B]" : "bg-[#06424B] text-white hover:bg-[#0A515C]"}`}
                  >
                    {listening ? <MicOff size={16} aria-hidden="true" /> : <Mic size={16} aria-hidden="true" />}
                    {tr(listening ? "Stop listening" : "Speak now")}
                  </button>

                  <button
                    type="button"
                    onClick={() => void skipQuestion()}
                    disabled={submitting || skippingQuestion || !nextPendingQuestion}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-[#06424B] bg-white px-4 py-3 text-xs font-extrabold text-[#06424B] transition hover:bg-[#F2F7F6] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFAB0B]"
                  >
                    {skippingQuestion
                      ? <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
                      : <SkipForward size={16} aria-hidden="true" />}
                    {tr(skippingQuestion ? "Skipping..." : "Skip question")}
                  </button>

                  <button
                    type="button"
                    onClick={() => void submitAnswer()}
                    disabled={!answer.trim() || submitting}
                    aria-busy={submitting}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#FFAB0B] px-4 py-3 text-xs font-extrabold text-[#06424B] shadow-sm transition hover:bg-[#FFC13C] disabled:cursor-not-allowed disabled:bg-[#E3E8E7] disabled:text-[#91A09F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#06424B]"
                  >
                    {submitting ? <LoaderCircle size={15} className="animate-spin" aria-hidden="true" /> : <Send size={15} aria-hidden="true" />}
                    {tr(remainingSeconds === 0 ? "Retry submission" : "Submit answer")}
                  </button>
                </div>
              </div>

              <section className="flex min-h-[510px] flex-col rounded-[26px] border border-[#DCE7E5] bg-white p-5 shadow-[0_3px_14px_rgba(6,66,75,0.045)] sm:p-6" data-a11y-region="self-introduction-transcript">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-[10px] font-extrabold tracking-[0.15em] text-[#527477]">
                    <span className={`h-2 w-2 rounded-full ${listening ? "animate-pulse bg-[#65A889]" : "bg-[#9BB8B5]"}`} />
                    {tr("LIVE TRANSCRIPTION")}
                  </div>
                  <span className="text-[10px] font-semibold text-[#829596]">{wordCount} {tr("words")}</span>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span id="self-introduction-voice-language-label" className="text-xs font-bold text-[#06424B]">
                    {tr("Voice input language")}
                  </span>
                  <LanguageDropdown
                    id="self-introduction-voice-language"
                    labelId="self-introduction-voice-language-label"
                    value={speechLanguage}
                    options={SPEECH_LANGUAGES}
                    onChange={setSpeechLanguage}
                    disabled={listening || submitting}
                  />
                </div>
                <p className="mt-1 text-[10px] leading-5 text-[#8A9B9C]">
                  {tr("Choose the language you will speak. Your original transcript is kept for submission.")}
                </p>

                <label htmlFor="self-introduction-transcript" className="mt-4 text-xs font-bold text-[#06424B]">
                  {tr("Your answer transcript")}
                </label>
                <textarea
                  id="self-introduction-transcript"
                  value={answer}
                  onChange={handleAnswerChange}
                  lang={speechLanguage.startsWith("fr") ? "fr" : "en"}
                  rows={8}
                  aria-describedby="self-introduction-voice-status self-introduction-original-answer-note"
                  placeholder={tr("Start speaking to see your transcript here, or type your answer...")}
                  className="mt-2 min-h-[230px] w-full flex-1 resize-y rounded-xl border border-[#DCE6E5] bg-[#FAFCFB] p-4 text-sm leading-6 text-[#29494D] outline-none transition placeholder:text-[#9AA9AA] focus:border-[#06424B] focus:ring-2 focus:ring-[#06424B]/10"
                />

                <p id="self-introduction-voice-status" aria-live="polite" className="mt-3 text-[10px] leading-5 text-[#718486]">
                  {tr(voiceMessage)}
                </p>
                <p id="self-introduction-original-answer-note" className="mt-1 text-[10px] leading-5 text-[#8A9B9C]">
                  {tr("Your answer will be submitted exactly as it appears above.")}
                </p>

                {!browserSupportsSpeechRecognition && (
                  <p className="mt-2 text-xs leading-5 text-[#8A6B24]" role="status">
                    {tr("Voice input is not supported in this browser. You can type your answer instead.")}
                  </p>
                )}
                {isMicrophoneAvailable === false && (
                  <p className="mt-2 text-xs leading-5 text-[#98513F]" role="alert">
                    {tr("Microphone access is blocked. Allow microphone permission in your browser settings or type your answer.")}
                  </p>
                )}

                {appLanguage === "fr" && speechLanguage === "en-US" && answer.trim() && (
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={translateTranscriptToFrench}
                      disabled={translatingTranscript || submitting}
                      className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#C9DAD8] bg-white px-3 py-2 text-xs font-bold text-[#06424B] transition hover:bg-[#F5F9F8] disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFAB0B]"
                    >
                      {translatingTranscript ? <LoaderCircle size={14} className="animate-spin" aria-hidden="true" /> : <Languages size={14} aria-hidden="true" />}
                      {tr("Translate transcript to French")}
                    </button>
                    {translationError && <p className="mt-2 text-xs text-[#98513F]" role="status">{tr(translationError)}</p>}
                    {translationPreview && (
                      <div className="mt-3 rounded-xl border border-[#DCE6E5] bg-[#F7FAFA] p-4" aria-live="polite">
                        <p className="text-[10px] font-extrabold tracking-wide text-[#527477]">{tr("FRENCH TRANSLATION PREVIEW")}</p>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#29494D]">{translationPreview}</p>
                        <p className="mt-2 text-[10px] leading-5 text-[#829596]">
                          {tr("This preview is not submitted. Your original transcript remains unchanged.")}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {submissionError && (
                  <p className="mt-3 rounded-lg bg-[#FFF7F5] p-3 text-xs leading-5 text-[#8D4035]" role="alert">
                    {tr(submissionError)}
                  </p>
                )}
              </section>
            </div>
          )}
        </>
      )}

      {/* -------------------------------- Timeout -------------------------------- */}
      {phase === "timeout" && activeQuestion && (
        <>
          <div className="mt-1">{renderQuestionStepper()}</div>
          <Card className="mt-5 p-7 text-center sm:p-10" data-a11y-region="self-introduction-timeout">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFF5DB] text-[#936400]">
              <Clock3 size={30} aria-hidden="true" />
            </div>
            <p className="mt-5 text-[10px] font-extrabold tracking-[0.16em] text-[#B07A06]">{tr("TIME IS UP")}</p>
            <h2 className="mt-2 text-2xl font-extrabold text-[#06424B]">{tr("No answer was captured")}</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#718486]">
              {tr("The timer ended before we could capture your answer, so nothing was submitted. You can try this question again.")}
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  resetAnswerState();
                  setVoiceMessage(MESSAGES.ready);
                  setPhase("answer");
                }}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#FFAB0B] px-5 py-3 text-xs font-extrabold text-[#06424B] transition hover:bg-[#FFC13C]"
              >
                <RotateCcw size={15} aria-hidden="true" /> {tr("Try this question again")}
              </button>
              <button
                type="button"
                onClick={exitPractice}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#C9DAD8] bg-white px-5 py-3 text-xs font-bold text-[#45666A] transition hover:border-[#06424B]"
              >
                {tr("Exit practice")}
              </button>
            </div>
          </Card>
        </>
      )}

      {/* --------------------------- Complete / Limit --------------------------- */}
      {(phase === "complete" || phase === "limit") && (
        <Card className="mt-5 p-7 text-center sm:p-10" data-a11y-region="self-introduction-completion">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EEF3F4] text-[#06424B]">
            {phase === "limit" ? <ShieldCheck size={30} aria-hidden="true" /> : <Award size={31} aria-hidden="true" />}
          </div>
          <p className="mt-5 text-[10px] font-extrabold tracking-[0.16em] text-[#B07A06]">{tr("SELF-INTRODUCTION PRACTICE")}</p>
          <h2 className="mt-2 text-2xl font-extrabold text-[#06424B]">
            {tr(phase === "limit" ? "Daily practice limit reached" : "Well done!")}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[#5A7478]">
            {tr(phase === "limit"
              ? "You have used all answer submissions available for today. Your saved answers will remain in your account."
              : skippedQuestionIds.length > 0
                ? "You have reached the end of the available questions. Skipped questions were not submitted and do not count toward your daily limit."
                : "You have answered all the questions currently available. Your responses and feedback are saved in your account.")}
          </p>
          <div className="mx-auto mt-6 grid max-w-md grid-cols-2 gap-3 text-left">
            <div className="rounded-xl border border-[#DCE7E5] bg-[#F7FAFA] p-4">
              <p className="text-[10px] font-extrabold tracking-wide text-[#718486]">{tr("SUBMITTED TODAY")}</p>
              <p className="mt-2 text-2xl font-extrabold text-[#06424B]">{dailyLimit?.submittedToday ?? submittedCount}</p>
            </div>
            <div className="rounded-xl border border-[#DCE7E5] bg-[#F7FAFA] p-4">
              <p className="text-[10px] font-extrabold tracking-wide text-[#718486]">{tr("REMAINING TODAY")}</p>
              <p className="mt-2 text-2xl font-extrabold text-[#06424B]">{remainingToday}</p>
            </div>
          </div>
          {resetsAtText && (
            <p className="mt-4 text-xs text-[#718486]">{tr("Daily limit resets at")} {resetsAtText}</p>
          )}
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={restartPractice}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#FFAB0B] px-5 py-3 text-xs font-extrabold text-[#06424B] transition hover:bg-[#FFC13C]"
            >
              <RotateCcw size={15} aria-hidden="true" /> {tr("Refresh practice")}
            </button>
            <BackLink to="/student/ai-practice">{tr("Back to AI Practice")}</BackLink>
          </div>
        </Card>
      )}

      {/* ------------------------------ Start modal ------------------------------ */}
      {showStartModal && (
        <div
          data-a11y-region="self-introduction-start-overlay"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#102F33]/45 px-4 py-6 backdrop-blur-sm"
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="self-intro-start-title"
            data-a11y-region="self-introduction-start-dialog"
            className="w-full max-w-[540px] overflow-hidden rounded-2xl border border-[#EADBC8] bg-white shadow-[0_24px_80px_rgba(6,35,39,0.22)]"
          >
            <div className="p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div data-a11y-modal-part="icon" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EEF5F4] text-[#06424B]">
                  <Mic size={21} aria-hidden="true" />
                </div>
                <div>
                  <h2 id="self-intro-start-title" data-a11y-modal-part="title" className="text-xl font-extrabold text-[#142D3D] sm:text-2xl">
                    {tr("Ready to Begin Your Self-Introduction?")}
                  </h2>
                  <p data-a11y-modal-part="description" className="mt-4 rounded-xl border border-[#E6D5D0] bg-[#F8FAFC] px-5 py-4 text-sm leading-7 text-[#58666B]">
                    {tr("Please ensure your microphone is active and you are in a quiet environment. Once you proceed, the first question will appear. Your timer starts only when you click Speak Now.")}
                  </p>
                </div>
              </div>
            </div>
            <div data-a11y-modal-part="footer" className="flex flex-col-reverse gap-3 border-t border-[#E6D5D0] px-6 py-5 sm:flex-row sm:justify-end sm:px-8">
              <button
                type="button"
                onClick={() => setShowStartModal(false)}
                data-a11y-modal-part="cancel"
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[#E6D5D0] bg-white px-6 text-sm font-bold text-[#665A57] transition hover:bg-[#FAF7F5]"
              >
                {tr("Cancel")}
              </button>
              <button
                type="button"
                onClick={confirmStartInterview}
                data-a11y-modal-part="primary"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#06424B] px-7 text-sm font-extrabold text-white transition hover:bg-[#0A5963] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFAB0B]"
              >
                <Play size={15} aria-hidden="true" />
                {tr("Proceed to interview")}
              </button>
            </div>
          </div>
        </div>
      )}
      </PageShell>
    </div>
  );
}

export default SelfIntroductionPractice;
