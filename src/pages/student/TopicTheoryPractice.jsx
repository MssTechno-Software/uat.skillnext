// React hooks manage component state, effects, memoized values, and async-safe references.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
// Read the active application language and translate interface text.
import { useTranslation } from "react-i18next";
// Read route changes and navigate between practice screens.
import { useLocation, useNavigate } from "react-router-dom";
// Control microphone recognition and read the live speech transcript.
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
// Icons used by the question controls, status indicators, and result screens.
import {
  ArrowLeft, Award, Check, ChevronDown, Clock3, Languages, LoaderCircle,
  Mic, MicOff, Send, SkipForward,
} from "lucide-react";

// Translate static interface strings and cached question text.
import { translateValue } from "../../i18n";
// Translate API-provided question text and answer previews when required.
import { translateApiContent } from "../../services/apiContentTranslation";
// Shared page heading used by the practice and completion screens.
import StudentPageHeader from "../../components/student/StudentPageHeader";
// Shared layout components keep this page consistent with the student portal.
import { Card, PageShell } from "../../components/student/ui";
// API methods for daily usage, answer submission, and skipping a question.
import {
  getCourseTheoryDailyLimit,
  submitCourseTheoryAnswer,
  skipCourseTheoryQuestion,
} from "../../api/aiTheoryPractice.api";
// Get the signed-in student ID required by the practice APIs.
import { getUserId } from "../../services/authSession";
// Convert API failures into readable messages for the student.
import { getApiErrorMessage } from "../../utils/apiErrorHandler";
// Read and save the practice session between route changes or page reloads.
import {
  readInterviewSession,
  saveInterviewSession,
} from "../../data/interviewPrepSession";

// Text sent when the timer ends and the student has not answered.
const NO_ANSWER_TEXT = "No answer provided.";
// Set the answer time allowed for each question.
const QUESTION_SECONDS = 119;
// Route opened after a submitted answer has been evaluated.
const FEEDBACK_PATH = "/student/ai-practice/topic-theory/feedback";
// Route used when the student returns to the topic theory course list.
const COURSES_PATH = "/student/ai-practice/topic-theory";
// Route used by the completion screen to return to AI Practice.
const AI_PRACTICE_PATH = "/student/ai-practice";

// Languages available in the microphone input selector.
const SPEECH_LANGUAGES = [
  { value: "en-US", label: "English (United States)" },
  { value: "fr-FR", label: "French (France)" },
];

// Status and error messages shown during voice capture and answer processing.
const MESSAGES = {
  ready: "Use the microphone to speak, or type directly into the transcript area.",
  selected: "Question selected. Press Speak Now when you are ready.",
  skipped: "Question skipped. You can return to it anytime from the progress bar.",
  submittedReview: "You submitted this question earlier. Further submissions may be limited by the practice rules.",
  listening: "Listening. Speak clearly and your words will appear in the transcript.",
  listeningFallback: "Listening. In this browser you may need to press Speak Now again after a pause.",
  micStopped: "Voice capture stopped. Press Speak Now to resume.",
  speechUnsupported: "Speech recognition is not supported in this browser. Please type your answer instead.",
  micBlocked: "Microphone access is unavailable. Allow microphone permission or type your answer.",
  micStartFailed: "We couldn't start the microphone. Please check your browser permission and try again.",
  noAnswer: "No answer was captured. You can retry this question or type an answer.",
  timeUp: "Time is up. Your recorded answer is being submitted.",
  translationUnavailable: "A French preview is not available right now. Your original transcript is unchanged.",
  submitFailed: "We couldn't submit your answer. Please try again.",
  skipFailed: "We couldn't skip this question. Please try again.",
  evaluationFailed: "Your answer was submitted, but its evaluation could not be loaded.",
};

// Keep translation calls short and consistent throughout the component.
const tr = (value) => translateValue(value);

// Read the question ID consistently across the API response formats.
function normalizeQuestionId(question) {
  return question?.question_id ?? question?.id;
}

// Backend values that mean a question has already been answered.
const DONE_STATUSES = [
  "true", "1", "yes", "submitted", "attempted", "completed", "complete", "answered",
];
// Normalize backend status values before comparing them.
const normStatus = (value) => String(value ?? "").trim().toLowerCase();

// Treat backend status values as completed when they indicate an existing attempt.
function hasAttemptedStatus(question) {
  return question?.attempted_status === true
    || question?.attempted_status === 1
    || DONE_STATUSES.includes(normStatus(question?.attempted_status));
}

// Resolve each question status from saved responses, backend status, and the progress stepper.
function buildStatusResolver(saved) {
  const responses = Array.isArray(saved?.responses) ? saved.responses : [];
  const submitted = new Set(responses.filter((item) => !item.skipped).map((item) => String(item.questionId)));
  const skipped = new Set(responses.filter((item) => item.skipped).map((item) => String(item.questionId)));
  const stepper = new Map(
    (Array.isArray(saved?.questionStepper) ? saved.questionStepper : [])
      .map((item) => [String(item.question_id), normStatus(item.attempted_status)]),
  );

  return (question) => {
    const id = String(normalizeQuestionId(question));
    if (submitted.has(id)) return "done";
    const step = stepper.get(id);
    if (
      normStatus(question?.attempted_status) === "skipped"
      || step === "skipped"
      || skipped.has(id)
    ) return "skipped";
    if (hasAttemptedStatus(question) || DONE_STATUSES.includes(step)) return "done";
    return "pending";
  };
}

// Restore the saved session and select its screen phase without fetching questions.
function resolveSession(saved) {
  const questions = Array.isArray(saved?.questions) ? saved.questions : [];
  if (!saved || !questions.length) return { session: saved || null, phase: "empty" };

  const getStatus = buildStatusResolver(saved);
  if (questions.every((question) => getStatus(question) === "done")) {
    return { session: saved, phase: "complete" };
  }

  let index = Number(saved.questionIndex || 0);
  if (!Number.isInteger(index) || index < 0 || index >= questions.length || getStatus(questions[index]) === "done") {
    // Continue from the question after the current one (not always from the first one).
    const start = Number.isInteger(index) && index >= 0 && index < questions.length ? index : -1;
    const findFrom = (wanted) => {
      for (let step = 1; step <= questions.length; step += 1) {
        const candidate = (start + step + questions.length) % questions.length;
        if (getStatus(questions[candidate]) === wanted) return candidate;
      }
      return -1;
    };
    const nextPending = findFrom("pending");
    const nextSkipped = findFrom("skipped");
    index = nextPending >= 0 ? nextPending : Math.max(nextSkipped, 0);
  }
  return {
    session: index === Number(saved.questionIndex || 0) ? saved : { ...saved, questionIndex: index },
    phase: "answer",
  };
}

// Accessible keyboard- and mouse-controlled dropdown for the voice input language.
// Render an accessible language dropdown with mouse and keyboard support.
function LanguageDropdown({ id, labelId, value, options, onChange, disabled = false }) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const selectedIndex = Math.max(options.findIndex((item) => item.value === value), 0);
  const selected = options[selectedIndex];

  // Close the dropdown when the user clicks or taps outside it.
  useEffect(() => {
    if (!open) return undefined;
    const outside = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", outside);
    document.addEventListener("touchstart", outside);
    return () => {
      document.removeEventListener("mousedown", outside);
      document.removeEventListener("touchstart", outside);
    };
  }, [open]);

  // Open the menu and highlight the currently selected language.
  const openMenu = () => {
    if (disabled) return;
    setActiveIndex(selectedIndex);
    setOpen(true);
  };

  // Apply the selected language and return keyboard focus to the dropdown.
  const choose = (index) => {
    const option = options[index];
    if (option) onChange(option.value);
    setOpen(false);
    buttonRef.current?.focus();
  };

  // Support arrow keys, Home, End, Enter, Space, Escape, and Tab.
  const onKeyDown = (event) => {
    if (disabled) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!open) openMenu();
      else setActiveIndex((index) => (index + 1) % options.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) openMenu();
      else setActiveIndex((index) => (index - 1 + options.length) % options.length);
    } else if (event.key === "Home" && open) {
      event.preventDefault();
      setActiveIndex(0);
    } else if (event.key === "End" && open) {
      event.preventDefault();
      setActiveIndex(options.length - 1);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!open) openMenu();
      else choose(activeIndex);
    } else if (event.key === "Escape") {
      setOpen(false);
    } else if (event.key === "Tab") {
      setOpen(false);
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
        onKeyDown={onKeyDown}
        className="inline-flex min-h-9 items-center justify-between gap-2 rounded-lg border border-[#DCE6E5] bg-white px-3 text-xs font-semibold text-[#29494D] hover:border-[#06424B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFAB0B] disabled:opacity-60"
      >
        <span>{tr(selected?.label || "")}</span>
        <ChevronDown size={14} className={`text-[#527477] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <ul
          id={`${id}-listbox`}
          role="listbox"
          aria-labelledby={labelId}
          className="absolute left-0 z-30 mt-1.5 w-max min-w-full overflow-hidden rounded-xl border border-[#DCE7E5] bg-white py-1 shadow-[0_12px_32px_rgba(6,66,75,0.14)]"
        >
          {options.map((option, index) => (
            <li
              key={option.value}
              id={`${id}-option-${index}`}
              role="option"
              aria-selected={option.value === value}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => choose(index)}
              className={`flex cursor-pointer items-center justify-between gap-6 px-3 py-2 text-xs font-semibold ${
                index === activeIndex ? "bg-[#EEF5F4] text-[#06424B]" : "text-[#29494D]"
              }`}
            >
              <span>{tr(option.label)}</span>
              {option.value === value && <Check size={14} className="text-[#39765D]" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Visual indicator that animates while speech recognition is listening.
// Display animated bars while the microphone is actively listening.
function VoiceWave({ active = false }) {
  return (
    <div className="flex h-9 items-center justify-center gap-[3px]" aria-hidden="true">
      {Array.from({ length: 19 }, (_, index) => (
        <span
          key={index}
          className={`w-[3px] rounded-full ${index % 4 === 0 ? "bg-[#FFAB0B]" : "bg-[#0B5961]"}`}
          style={{
            height: `${8 + ((index * 11) % 25)}px`,
            animation: active ? `topic-wave .82s ease-in-out ${index % 8 * -0.09}s infinite` : "none",
            opacity: active ? 1 : 0.55,
          }}
        />
      ))}
    </div>
  );
}

// Progress labels displayed while the answer is saved and evaluated.
const SUBMIT_STAGES = [
  { id: "saving", label: "Saving your answer" },
  { id: "evaluating", label: "Reviewing your answer" },
  { id: "finalizing", label: "Preparing your feedback" },
];
// Pause briefly between submission stages so each progress state is visible.
const wait = (milliseconds) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));

// Main screen for answering, skipping, reviewing, and completing theory questions.
function TopicTheoryPractice() {
  const { i18n } = useTranslation("ui");
  const navigate = useNavigate();
  const location = useLocation();
  const studentId = getUserId();

  // Restore the session created on the difficulty-selection screen.
  const [initial] = useState(() => resolveSession(readInterviewSession()));
  const [session, setSession] = useState(initial.session);
  const [phase, setPhase] = useState(initial.phase);

  // Reuse the daily-limit data already fetched on the difficulty screen.
  const [dailyUsage, setDailyUsage] = useState(initial.session?.dailyUsage || null);
  const dailyUsageRef = useRef(initial.session?.dailyUsage || null);
  const usageRequestedRef = useRef(false);

  // Track the current submission stage and the current answer text.
  const [submitStage, setSubmitStage] = useState("saving");
  const [answer, setAnswer] = useState("");
  const answerRef = useRef("");
  const speechBaselineRef = useRef("");
  const submissionLockRef = useRef(false);
  const autoSubmitRef = useRef(false);

  // Popup shown when the student presses Submit with an empty answer.
  const [showEmptyPopup, setShowEmptyPopup] = useState(false);

  // Determine the application language and use it as the default voice language.
  const appLanguage = String(i18n.resolvedLanguage || i18n.language || "en")
    .toLowerCase().split("-")[0];
  const [speechLanguage, setSpeechLanguage] = useState(appLanguage === "fr" ? "fr-FR" : "en-US");

  // Read microphone support, listening state, and recognized speech from the browser.
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    browserSupportsContinuousListening,
    isMicrophoneAvailable,
  } = useSpeechRecognition({ clearTranscriptOnListen: false });

  // Track the question countdown, request states, messages, and translation previews.
  const [remaining, setRemaining] = useState(QUESTION_SECONDS);
  const [submitting, setSubmitting] = useState(false);
  const [skipping, setSkipping] = useState(false);
  const [error, setError] = useState("");
  const [voiceMessage, setVoiceMessage] = useState(MESSAGES.ready);
  const [translationPreview, setTranslationPreview] = useState("");
  const [translationError, setTranslationError] = useState("");
  const [translating, setTranslating] = useState(false);
  const [translatedQuestion, setTranslatedQuestion] = useState("");
  const [questionTranslationLoading, setQuestionTranslationLoading] = useState(false);
  const [questionTranslationFailed, setQuestionTranslationFailed] = useState(false);

  // Keep the voice input language aligned with the application language.
  useEffect(() => {
    setSpeechLanguage(appLanguage === "fr" ? "fr-FR" : "en-US");
  }, [appLanguage]);

  // Keep React state and the ref synchronized for async submission handlers.
  const updateUsage = useCallback((usage) => {
    dailyUsageRef.current = usage;
    setDailyUsage(usage);
  }, []);

  // Keep session persistence centralized so every save includes the latest daily usage.
  const persistSession = useCallback((next) => {
    const withUsage = { ...next, dailyUsage: dailyUsageRef.current ?? next.dailyUsage ?? null };
    saveInterviewSession(withUsage);
    setSession(withUsage);
    return withUsage;
  }, []);

  // Fetch daily usage only when an older or directly opened session has no saved value.
  const refreshDailyUsage = useCallback(async () => {
    if (!studentId) return null;
    try {
      const usage = (await getCourseTheoryDailyLimit(studentId)) || null;
      updateUsage(usage);
      const latest = readInterviewSession();
      if (latest) saveInterviewSession({ ...latest, dailyUsage: usage });
      setSession((prev) => (prev ? { ...prev, dailyUsage: usage } : prev));
      return usage;
    } catch (usageError) {
      console.error(getApiErrorMessage(usageError, "Unable to load daily usage."));
      return null;
    }
  }, [studentId, updateUsage]);

  // Avoid a duplicate daily-limit request when the session already contains usage.
  useEffect(() => {
    if (usageRequestedRef.current) return;
    if (phase === "empty" || dailyUsageRef.current) return;
    usageRequestedRef.current = true;
    void refreshDailyUsage();
  }, [phase, refreshDailyUsage]);

  // Restore session state when navigation returns to this route.
  const firstRunRef = useRef(true);
  useEffect(() => {
    if (firstRunRef.current) {
      firstRunRef.current = false;
      return;
    }
    const next = resolveSession(readInterviewSession());
    setSession(next.session);
    setPhase(next.phase);
    if (next.session?.dailyUsage) updateUsage(next.session.dailyUsage);
  }, [location.key, updateUsage]);

  // Derive the active question, saved answers, and progress from the current session.
  const questions = Array.isArray(session?.questions) ? session.questions : [];
  const questionIndex = Number(session?.questionIndex || 0);
  const currentQuestion = questions[questionIndex] || null;
  const questionId = normalizeQuestionId(currentQuestion);
  const questionText = currentQuestion?.question_text || currentQuestion?.text || "";
  const title = session?.courseName || "Interview Practice";
  const responses = Array.isArray(session?.responses) ? session.responses : [];

  const getStatus = useMemo(() => buildStatusResolver(session), [session]);
  const isSubmitted = useCallback((question) => getStatus(question) === "done", [getStatus]);
  const totalQuestions = questions.length;
  const submittedCount = questions.filter(isSubmitted).length;
  const allCompleted = totalQuestions > 0 && submittedCount === totalQuestions;

  // Show the completion screen when every question has been submitted.
  useEffect(() => {
    if (allCompleted && phase !== "submitting") {
      setPhase("complete");
    }
  }, [allCompleted, phase]);

  // Calculate values used by the timer, word counter, daily-limit warning, and loader.
  const wordCount = answer.trim() ? answer.trim().split(/\s+/).length : 0;
  const minutes = String(Math.floor(remaining / 60)).padStart(2, "0");
  const seconds = String(remaining % 60).padStart(2, "0");
  const limitReached = dailyUsage?.limit_reached === true || (dailyUsage && Number(dailyUsage.remaining) <= 0);
  const submitStageIndex = Math.max(SUBMIT_STAGES.findIndex((item) => item.id === submitStage), 0);

  // Build the per-question results shown on the completion screen.
  const summaryItems = questions.map((question, index) => {
    const id = String(normalizeQuestionId(question));
    const response = responses.find((item) => String(item.questionId) === id);
    const rawScore = response?.evaluation?.overall_score;
    const numericScore = rawScore === undefined || rawScore === null ? NaN : Number(rawScore);
    return {
      id,
      index,
      text: question?.question_text || question?.text || "",
      skipped: getStatus(question) === "skipped",
      score: Number.isFinite(numericScore) ? numericScore : null,
    };
  });
  const scoredItems = summaryItems.filter((item) => item.score !== null);
  const averageScore = scoredItems.length
    ? Math.round(scoredItems.reduce((sum, item) => sum + item.score, 0) / scoredItems.length)
    : null;

  // Keep the latest typed or transcribed answer available to async handlers.
  useEffect(() => {
    answerRef.current = answer;
  }, [answer]);

  // Merge newly recognized speech with any text already entered by the student.
  useEffect(() => {
    const recognized = String(transcript || "").trim();
    const next = [speechBaselineRef.current, recognized].filter(Boolean).join(" ").trim();
    if (next && next !== answerRef.current) {
      answerRef.current = next;
      setAnswer(next);
      setTranslationPreview("");
      setTranslationError("");
    }
  }, [transcript]);

  // Gracefully stop the current speech-recognition session.
  const stopVoice = useCallback(async () => {
    try {
      await SpeechRecognition.stopListening();
    } catch {
      // Speech recognition may already have stopped in the browser.
    }
  }, []);

  // Immediately cancel speech recognition when leaving or switching questions.
  const abortVoice = useCallback(() => {
    try {
      void SpeechRecognition.abortListening();
    } catch {
      // Cleanup should not interrupt navigation or unmounting.
    }
  }, []);

  useEffect(() => () => {
    try {
      void SpeechRecognition.abortListening();
    } catch {
      // Cleanup should not interrupt component unmounting.
    }
  }, []);

  // Clear answer, timer, transcript, and translation state before a new question.
  const resetQuestionState = useCallback(() => {
    answerRef.current = "";
    speechBaselineRef.current = "";
    setAnswer("");
    resetTranscript();
    setRemaining(QUESTION_SECONDS);
    setTranslationPreview("");
    setTranslationError("");
    setShowEmptyPopup(false);
    setError("");
    autoSubmitRef.current = false;
  }, [resetTranscript]);

  // Reset the countdown whenever the active question changes (it does not start yet).
  useEffect(() => {
    if (!questionId) return undefined;
    setRemaining(QUESTION_SECONDS);
    autoSubmitRef.current = false;
    return undefined;
  }, [questionId]);

  // The countdown runs only while the microphone is listening: Speak Now starts/resumes it,
  // Stop listening (or a browser pause) freezes it.
  useEffect(() => {
    if (!listening || !currentQuestion || submitting || phase !== "answer") return undefined;
    const timerId = window.setInterval(() => {
      setRemaining((value) => {
        if (value <= 1) {
          window.clearInterval(timerId);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(timerId);
  }, [listening, questionId, submitting, phase]);

  // Submit automatically when the countdown reaches zero, even when the answer is empty.
  useEffect(() => {
    if (phase !== "answer" || remaining !== 0 || autoSubmitRef.current) return;
    autoSubmitRef.current = true;
    setVoiceMessage(MESSAGES.timeUp);
    void submitAnswer({ automatic: true });
    // Prevent repeated submission when the timer reaches zero.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, phase]);

  // Load the French version of the current question when French is selected.
  useEffect(() => {
    let cancelled = false;
    setTranslatedQuestion("");
    setQuestionTranslationFailed(false);

    if (appLanguage !== "fr" || !currentQuestion || !questionText) {
      setQuestionTranslationLoading(false);
      return undefined;
    }

    const cached = translateValue(questionText, { lng: "fr" });
    if (typeof cached === "string" && cached.trim() && cached.trim() !== questionText.trim()) {
      setTranslatedQuestion(cached.trim());
      setQuestionTranslationLoading(false);
      return undefined;
    }

    setQuestionTranslationLoading(true);
    (async () => {
      try {
        const result = await translateApiContent(currentQuestion, "fr");
        const value = typeof result === "string"
          ? result
          : result?.question_text ?? result?.questionText ?? result?.prompt ?? "";
        if (cancelled) return;
        if (value && value.trim() && value.trim() !== questionText.trim()) {
          setTranslatedQuestion(value.trim());
        } else {
          setQuestionTranslationFailed(true);
        }
      } catch {
        if (!cancelled) setQuestionTranslationFailed(true);
      } finally {
        if (!cancelled) setQuestionTranslationLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [appLanguage, currentQuestion, questionText]);

  // Use the translated question when available, otherwise show the appropriate fallback.
  const displayQuestion = appLanguage === "fr"
    ? translatedQuestion || (questionTranslationLoading
      ? "Traduction de la question..."
      : questionTranslationFailed
        ? "La traduction de cette question est temporairement indisponible."
        : "Traduction de la question...")
    : (questionText ? tr(questionText) : tr("Question text is not available."));

  // Start or stop microphone capture after checking browser and permission support.
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
    if (remaining <= 0 || submitting || !currentQuestion) return;
    if (isMicrophoneAvailable === false) {
      setVoiceMessage(MESSAGES.micBlocked);
      return;
    }

    speechBaselineRef.current = answerRef.current.trim();
    resetTranscript();
    try {
      await SpeechRecognition.startListening({
        continuous: Boolean(browserSupportsContinuousListening),
        language: speechLanguage,
      });
      setVoiceMessage(browserSupportsContinuousListening ? MESSAGES.listening : MESSAGES.listeningFallback);
    } catch {
      setVoiceMessage(MESSAGES.micStartFailed);
    }
  };

  // Update the transcript when the student types and stop voice capture if needed.
  const handleAnswerChange = async (event) => {
    const value = event.target.value;
    if (listening) await stopVoice();
    speechBaselineRef.current = value;
    resetTranscript();
    answerRef.current = value;
    setAnswer(value);
    setTranslationPreview("");
    setTranslationError("");
  };

  // Create a French preview while keeping the original transcript unchanged.
  const translateTranscriptToFrench = async () => {
    const original = answerRef.current.trim();
    if (!original || speechLanguage !== "en-US") return;
    setTranslating(true);
    setTranslationError("");
    try {
      const result = await translateApiContent(original, "fr");
      if (typeof result !== "string" || !result.trim() || result.trim() === original) {
        setTranslationError(MESSAGES.translationUnavailable);
      } else {
        setTranslationPreview(result.trim());
      }
    } catch {
      setTranslationError(MESSAGES.translationUnavailable);
    } finally {
      setTranslating(false);
    }
  };

  // Submit the answer, update the saved session, and open the evaluation feedback.
  const submitAnswer = async ({ automatic = false } = {}) => {
    if (!studentId || !questionId || submissionLockRef.current) return;

    submissionLockRef.current = true;
    setShowEmptyPopup(false);

    // Show the submitting state immediately, as in the existing interview flow.
    setSubmitting(true);
    setPhase("submitting");
    setSubmitStage("saving");
    setError("");

    // Stop speech recognition first, then allow its final transcript event to update the answer.
    await stopVoice();
    await wait(500);

    try {
      // Read the latest transcript after the microphone has stopped and the final speech event has settled.
      const typedAnswer = String(answerRef.current || "").trim();
      // The backend rejects empty answers, so a timed-out empty answer is sent as a placeholder.
      const cleanAnswer = typedAnswer || (automatic ? NO_ANSWER_TEXT : "");
      const submitPayload = await submitCourseTheoryAnswer(studentId, questionId, cleanAnswer);
      setSubmitStage("evaluating");
      await wait(450);
      const evaluation = submitPayload?.evaluation;
      if (!evaluation) throw new Error(MESSAGES.evaluationFailed);

      // Use daily-limit values from the submission response and refresh only when they are missing.
      const remainingToday = submitPayload.remaining_today;
      const dailySubmissions = submitPayload.daily_submissions;
      if (remainingToday !== undefined && remainingToday !== null) {
        const previous = dailyUsageRef.current || {};
        const submittedToday = dailySubmissions ?? previous.submitted_today ?? null;
        updateUsage({
          ...previous,
          remaining: remainingToday,
          submitted_today: submittedToday,
          daily_limit: previous.daily_limit
            ?? (submittedToday !== null ? Number(remainingToday) + Number(submittedToday) : null),
          limit_reached: Number(remainingToday) <= 0,
        });
      } else {
        await refreshDailyUsage();
      }

      const stepper = Array.isArray(submitPayload.question_stepper) ? submitPayload.question_stepper : [];
      const nextResponses = [
        ...responses.filter((item) => String(item.questionId) !== String(questionId)),
        {
          questionId,
          question: questionText,
          answer: cleanAnswer,
          evaluation,
          skipped: false,
        },
      ];
      const nextSession = persistSession({
        ...session,
        responses: nextResponses,
        lastSubmittedQuestionId: questionId,
        questionStepper: stepper,
        remainingToday: submitPayload.remaining_today ?? null,
        dailySubmissions: submitPayload.daily_submissions ?? null,
        questions: questions.map((question) => (
          String(normalizeQuestionId(question)) === String(questionId)
            ? { ...question, attempted_status: true }
            : question
        )),
      });

      setSubmitStage("finalizing");
      await wait(450);

      navigate(FEEDBACK_PATH, {
        state: {
          mode: "course-theory-api",
          title,
          courseId: session.courseId,
          courseName: session.courseName,
          difficulty: session.difficulty,
          question: currentQuestion,
          answer: cleanAnswer,
          submitPayload,
          evaluation,
          questionStepper: stepper,
          remainingToday: submitPayload.remaining_today,
          dailySubmissions: submitPayload.daily_submissions,
          session: nextSession,
          automatic,
        },
      });
    } catch (apiError) {
      // Log the real reason (status code / response body) so the failure can be diagnosed.
      console.error("Submit answer failed:", apiError?.response?.status, apiError?.response?.data ?? apiError);
      setError(getApiErrorMessage(apiError, tr(MESSAGES.submitFailed)));
      setVoiceMessage(MESSAGES.submitFailed);
      setPhase("answer");
      // Do not retry an automatic submission in a loop; the student can submit manually.
      if (!automatic) autoSubmitRef.current = false;
    } finally {
      setSubmitting(false);
      submissionLockRef.current = false;
    }
  };

  // Manual Submit button: block empty answers with a popup, otherwise submit.
  const handleSubmitClick = () => {
    if (submitting) return;
    if (!answerRef.current.trim()) {
      setShowEmptyPopup(true);
      return;
    }
    void submitAnswer();
  };

  // Open a skipped question from the progress stepper without losing the session.
  // Only skipped questions can be opened this way; other steps are display-only.
  const goToQuestion = (index) => {
    if (index < 0 || index >= totalQuestions || submitting || skipping) return;
    if (index === questionIndex || getStatus(questions[index]) !== "skipped") return;

    // Abort speech recognition immediately so a slow browser cleanup cannot block navigation.
    abortVoice();
    resetQuestionState();
    persistSession({ ...session, questionIndex: index, completed: false });
    setPhase("answer");
    setVoiceMessage(MESSAGES.selected);
  };

  // Save the skipped status and move to the next pending question, or a skipped one if needed.
  const skipQuestion = async () => {
    if (skipping || submitting) return;

    // Validate the account and question before calling the skip API.
    if (!studentId) {
      setError(tr("Student account could not be identified. Please sign in again."));
      return;
    }
    if (!questionId) {
      setError(tr("This question could not be identified. Please reload the page."));
      return;
    }

    // Stop voice capture in the background so a pending browser audio operation cannot block Skip.
    setSkipping(true);
    setError("");
    void stopVoice();
    try {
      // Record the skip with the backend before updating the local session.
      const skipPayload = await skipCourseTheoryQuestion(studentId, questionId);

      const apiStepper = Array.isArray(skipPayload?.question_stepper) ? skipPayload.question_stepper : null;
      const nextResponses = [
        ...responses.filter((item) => String(item.questionId) !== String(questionId)),
        { questionId, question: questionText, answer: "", skipped: true },
      ];
      const nextQuestions = questions.map((question) => (
        String(normalizeQuestionId(question)) === String(questionId)
          ? { ...question, attempted_status: "skipped" }
          : question
      ));
      const base = {
        ...session,
        responses: nextResponses,
        questions: nextQuestions,
        questionStepper: apiStepper ?? session.questionStepper,
        completed: false,
      };

      // Choose the next pending question, wrap to the beginning if needed, or reopen a skipped question.
      const statusAfterSkip = buildStatusResolver(base);
      const findNextByStatus = (wantedStatus) => {
        for (let step = 1; step <= nextQuestions.length; step += 1) {
          const candidateIndex = (questionIndex + step) % nextQuestions.length;
          if (statusAfterSkip(nextQuestions[candidateIndex]) === wantedStatus) {
            return candidateIndex;
          }
        }
        return -1;
      };

      const nextPendingIndex = findNextByStatus("pending");
      const nextSkippedIndex = findNextByStatus("skipped");
      const target = nextPendingIndex >= 0
        ? nextPendingIndex
        : nextSkippedIndex >= 0
          ? nextSkippedIndex
          : questionIndex;

      resetQuestionState();
      persistSession({ ...base, questionIndex: target, completed: false });
      setVoiceMessage(MESSAGES.skipped);
      setPhase("answer");
    } catch (apiError) {
      console.error("Skip question failed:", apiError);
      setError(getApiErrorMessage(apiError, tr(MESSAGES.skipFailed)));
    } finally {
      setSkipping(false);
    }
  };

  // Return to the course list while keeping the current practice session saved.
  const exitInterview = () => {
    abortVoice();
    // Keep the saved session so the student can resume the practice later.
    navigate(COURSES_PATH);
  };

  // Return to the main AI Practice page from the completion screen.
  const goToAiPractice = () => {
    abortVoice();
    navigate(AI_PRACTICE_PATH);
  };

  // Show an empty state when there is no saved session or no question to display.
  if (!session || !questions.length || phase === "empty") {
    return (
      <div data-a11y-page="topic-theory-practice">
        <PageShell max="max-w-[1100px]">
          <StudentPageHeader title={tr("Topic Theory Practice")} subtitle={tr("Practice topic theory questions and receive feedback on your answers.")} />
          <Card className="mt-6 p-8 text-center">
            <p className="text-sm leading-6 text-[#527477]">{tr("No interview question is available.")}</p>
            <button type="button" onClick={exitInterview} className="mt-4 rounded-xl bg-[#06424B] px-5 py-3 text-sm font-bold text-white">{tr("Back to courses")}</button>
          </Card>
        </PageShell>
      </div>
    );
  }

  // Render the page content for the current phase: answer, submitting, or complete.
  return (
    <div data-a11y-page="topic-theory-practice">
      <PageShell max={phase === "answer" ? "max-w-[1400px]" : "max-w-[1100px]"}>
        {phase === "complete" && (
          <>
            <StudentPageHeader title={tr("Topic Theory Practice")} subtitle={tr("Practise topic theory questions and improve your understanding with AI feedback.")} />
            <div className="mt-5"><button type="button" onClick={exitInterview} className="inline-flex items-center gap-2 text-sm font-semibold text-[#45666A] transition hover:text-[#06424B]"><ArrowLeft size={15} /> {tr("Back")}</button></div>
          </>
        )}
        {phase === "submitting" && (
          <div className="flex min-h-[60vh] items-center justify-center py-4" role="status" aria-live="polite" aria-busy="true">
            <Card className="w-full max-w-[440px] overflow-hidden p-0">
              <div className="h-1 w-full bg-[#E8EFEE]">
                <div
                  className="h-full rounded-r-full bg-[#FFAB0B] transition-[width] duration-700 ease-out"
                  style={{ width: `${((submitStageIndex + 1) / SUBMIT_STAGES.length) * 100}%` }}
                />
              </div>

              <div className="px-6 pb-6 pt-6 text-center">
                <div className="relative mx-auto flex h-14 w-14 items-center justify-center">
                  <span className="absolute inset-0 rounded-full border-[3px] border-[#E6EFED]" />
                  <span className="absolute inset-0 animate-spin rounded-full border-[3px] border-transparent border-r-[#FFAB0B] border-t-[#FFAB0B]" />
                  <Send size={18} className="text-[#06424B]" />
                </div>

                <p className="mt-4 text-[9px] font-extrabold tracking-[0.17em] text-[#B07A06]">{tr("TOPIC THEORY PRACTICE")}</p>
                <h2 className="mt-1.5 text-lg font-extrabold text-[#06424B]">{tr(SUBMIT_STAGES[submitStageIndex].label)}</h2>
                <p className="mt-1 text-xs leading-5 text-[#718486]">{tr("Please wait while we save and review your answer.")}</p>

                <ol className="mt-5 space-y-2 text-left">
                  {SUBMIT_STAGES.map((stage, index) => {
                    const done = index < submitStageIndex;
                    const active = index === submitStageIndex;
                    return (
                      <li
                        key={stage.id}
                        className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 text-xs font-bold transition-colors ${
                          done
                            ? "border-[#A8D5BE] bg-[#EAF5EF] text-[#39765D]"
                            : active
                              ? "border-[#06424B] bg-[#EEF5F4] text-[#06424B]"
                              : "border-[#E7EEEE] bg-white text-[#9AA9AA]"
                        }`}
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current text-[10px]">
                          {done ? <Check size={12} /> : active ? <LoaderCircle size={12} className="animate-spin" /> : index + 1}
                        </span>
                        {tr(stage.label)}
                      </li>
                    );
                  })}
                </ol>

                <p className="mt-4 text-[10px] leading-5 text-[#829596]">{tr("Please do not close or refresh this page.")}</p>
              </div>
            </Card>
          </div>
        )}
        {phase === "complete" && (
          <Card className="mt-5 overflow-hidden p-0">
            <div className="bg-[#06424B] px-6 py-8 text-center text-white sm:px-10">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-[#FFAB0B]"><Award size={31} /></div>
              <p className="mt-4 text-[10px] font-extrabold tracking-[0.16em] text-[#B9D8D2]">{tr("TOPIC THEORY PRACTICE")}</p>
              <h2 className="mt-2 text-2xl font-extrabold">{tr("Well done!")}</h2>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#D5E6E2]">{tr("You have answered all the questions currently available. Your responses and feedback are saved in your practice session.")}</p>
            </div>

            <div className="px-6 py-6 sm:px-10">
              <div className="mx-auto grid max-w-xl grid-cols-3 gap-3 text-left">
                <div className="rounded-xl border border-[#DCE7E5] bg-[#F7FAFA] p-4"><p className="text-[10px] font-extrabold tracking-wide text-[#718486]">{tr("SUBMITTED")}</p><p className="mt-2 text-2xl font-extrabold text-[#06424B]">{submittedCount}</p></div>
                <div className="rounded-xl border border-[#DCE7E5] bg-[#F7FAFA] p-4"><p className="text-[10px] font-extrabold tracking-wide text-[#718486]">{tr("TOTAL QUESTIONS")}</p><p className="mt-2 text-2xl font-extrabold text-[#06424B]">{totalQuestions}</p></div>
                <div className="rounded-xl border border-[#F1DFB6] bg-[#FFFAEE] p-4"><p className="text-[10px] font-extrabold tracking-wide text-[#946B13]">{tr("AVERAGE SCORE")}</p><p className="mt-2 text-2xl font-extrabold text-[#815C12]">{averageScore ?? "—"}{averageScore !== null && <span className="ml-1 text-xs font-bold">/ 100</span>}</p></div>
              </div>

              <div className="mx-auto mt-6 max-w-xl">
                <p className="text-[10px] font-extrabold tracking-[0.15em] text-[#527477]">{tr("YOUR RESULTS")}</p>
                <ul className="mt-3 space-y-2">
                  {summaryItems.map((item) => (
                    <li key={item.id} className="flex items-center gap-3 rounded-xl border border-[#E5ECEB] bg-white px-3 py-2.5">
                      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[10px] font-extrabold ${item.skipped ? "border-[#EADBC8] bg-[#FBF7F1] text-[#9A7845]" : "border-[#A8D5BE] bg-[#EAF5EF] text-[#39765D]"}`}>{item.index + 1}</span>
                      <p className="min-w-0 flex-1 truncate text-xs font-semibold text-[#45666A]" title={item.text}>{tr(item.text)}</p>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-extrabold ${item.skipped ? "bg-[#FBF7F1] text-[#9A7845]" : item.score !== null ? "bg-[#EAF5EF] text-[#39765D]" : "bg-[#EEF3F4] text-[#527477]"}`}>
                        {item.skipped ? tr("Skipped") : item.score !== null ? `${item.score} / 100` : tr("Answered")}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                <button type="button" onClick={exitInterview} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#FFAB0B] px-5 py-3 text-xs font-extrabold text-[#06424B] hover:bg-[#FFC13C]"><ArrowLeft size={15} /> {tr("Choose Another Course")}</button>
                <button type="button" onClick={goToAiPractice} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#DCE7E5] bg-white px-5 py-3 text-xs font-bold text-[#45666A] hover:border-[#06424B]">{tr("Back to AI Practice")}</button>
              </div>
            </div>
          </Card>
        )}
        <style>{`
          @keyframes topic-wave { 0%,100% { transform:scaleY(.25); opacity:.55; } 50% { transform:scaleY(1); opacity:1; } }
          @media (prefers-reduced-motion: reduce) { * { scroll-behavior:auto !important; } }
        `}</style>

        {phase === "answer" && <>
        <div className="w-full rounded-2xl border border-[#DCE7E5] bg-white px-4 py-2 shadow-[0_2px_10px_rgba(6,66,75,0.035)] sm:px-6 sm:py-2">
          <div className="flex w-full flex-nowrap items-center justify-between gap-4 max-md:flex-wrap max-md:gap-y-3">
            <div className="min-w-[150px] shrink-0">
              <p className="text-[9px] font-extrabold tracking-[0.14em] text-[#789093]">{tr("INTERVIEW PREP")}</p>
              <p className="mt-1 text-sm font-extrabold text-[#06424B]">
                {tr("Question")} {questionIndex + 1} {tr("of")} {totalQuestions}
              </p>
            </div>
            <div className="ml-auto flex shrink-0 flex-nowrap items-center gap-3 sm:gap-4 max-md:ml-0 max-md:w-full max-md:flex-wrap">
              {dailyUsage && (
                <div
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[#F1DFB6] bg-[#FFFAEE] px-3 py-1 text-[10px] font-bold text-[#815C12]"
                  aria-live="polite"
                  title={`${tr("Submitted today")}: ${dailyUsage.submitted_today ?? "—"}`}
                >
                  <span className="tracking-wide">{tr("REMAINING TODAY")}</span>
                  <span className="text-sm font-extrabold tabular-nums">
                    {dailyUsage.remaining ?? "—"} / {dailyUsage.daily_limit ?? "—"}
                  </span>
                </div>
              )}
              <div className="hidden w-28 shrink-0 sm:block">
                <div className="h-1.5 overflow-hidden rounded-full bg-[#E8EFEF]">
                  <div
                    className="h-full rounded-full bg-[#06424B] transition-[width] duration-500"
                    style={{ width: `${totalQuestions ? ((questionIndex + 1) / totalQuestions) * 100 : 0}%` }}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={exitInterview}
                className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg border border-[#DCE7E5] bg-white px-3 text-xs font-medium text-[#36585C] hover:border-[#06424B] hover:bg-[#F7FAFA]"
              >
                <ArrowLeft size={13} /> {tr("Exit interview")}
              </button>
            </div>
          </div>

          <ol className="mt-2 flex w-full min-w-0 items-center gap-0 overflow-x-auto py-0 [scrollbar-width:thin]" aria-label={tr("Question progress stepper")}>
            {questions.map((question, index) => {
              const id = normalizeQuestionId(question);
              const status = getStatus(question);
              const done = status === "done";
              const skipped = status === "skipped";
              const active = index === questionIndex;
              // Only skipped questions (other than the open one) can be opened from the stepper.
              const clickable = skipped && !active;
              return (
                <li key={id ?? index} className="flex min-w-[32px] flex-1 items-center last:flex-none">
                  <button
                    type="button"
                    onClick={() => clickable && goToQuestion(index)}
                    disabled={submitting || skipping}
                    aria-current={active ? "step" : undefined}
                    aria-disabled={!clickable}
                    tabIndex={clickable || active ? 0 : -1}
                    aria-label={`${tr("Go to question")} ${index + 1}: ${tr(active ? "Current question" : done ? "Submitted" : skipped ? "Skipped" : "Not started")}`}
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-normal transition disabled:opacity-50 ${
                      clickable ? "cursor-pointer hover:border-[#9A7845]" : "cursor-default"
                    } ${
                      active
                        ? "border-[#06424B] bg-[#06424B] text-white shadow-[0_0_0_4px_rgba(6,66,75,0.12)]"
                        : done
                          ? "border-[#A8D5BE] bg-[#EAF5EF] text-[#39765D]"
                          : skipped
                            ? "border-[#EADBC8] bg-[#FBF7F1] text-[#9A7845]"
                            : "border-[#DCE7E5] bg-[#FAFCFC] text-[#829596]"
                    }`}
                  >
                    {done && !active ? <Check size={14} strokeWidth={1.8} /> : index + 1}
                  </button>
                  {index < questions.length - 1 && (
                    <span className={`mx-1.5 h-px min-w-2 flex-1 ${done ? "bg-[#86CDA9]" : "bg-[#DCE7E5]"}`} />
                  )}
                </li>
              );
            })}
          </ol>
        </div>

        {limitReached && (
          <div role="alert" className="mt-4 rounded-xl border border-[#E6C9C4] bg-[#FFF7F5] px-4 py-3 text-sm font-semibold text-[#8D4035]">
            {tr("You have reached your daily Topic Theory limit. Please try again after it resets.")}
          </div>
        )}

        <div className="mt-3 grid min-h-0 items-stretch gap-3 xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,.95fr)]">
          <div className="flex flex-col gap-4">
            <section className="flex min-h-[500px] flex-col items-center justify-center rounded-[26px] border border-[#DCE7E5] bg-white px-5 py-5 text-center shadow-[0_3px_14px_rgba(6,66,75,0.045)] sm:px-7">
              <div className="relative flex h-[84px] w-[84px] items-center justify-center overflow-hidden rounded-[24px] border border-[#C8DEDC] bg-[#EEF5F4] p-1.5 shadow-sm">
                <img src="/interviewer-avatar.png" alt={tr("Skill Next AI interviewer")} className="h-full w-full rounded-[18px] object-cover" />
                <span className="absolute bottom-2 right-2 h-3 w-3 rounded-full border-2 border-white bg-[#65A889]" />
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                <span className="rounded-full bg-[#EAF3F2] px-3 py-1.5 text-[9px] font-extrabold tracking-[0.12em] text-[#06424B]">{tr("AI INTERVIEWER")}</span>
                <span className="rounded-full bg-[#FFF5DB] px-3 py-1.5 text-[9px] font-extrabold tracking-wide text-[#936400]">
                  {tr(currentQuestion.difficulty_level || session.difficulty || "Easy")}
                </span>
              </div>

              <div className={`mt-3 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-[11px] font-extrabold tabular-nums ${remaining <= 15 ? "bg-[#FFF0D8] text-[#936400]" : "bg-[#EEF4F3] text-[#06424B]"}`}>
                <Clock3 size={15} />
                {tr("QUESTION TIME REMAINING")}
                <span className="text-sm">{minutes}:{seconds}</span>
              </div>

              <p className="mt-3 text-[9px] font-extrabold tracking-[0.18em] text-[#B07A06]">{tr("SKILL NEXT INTERVIEW PRACTICE")}</p>
              <h2 className="mt-2 max-w-[760px] text-lg font-extrabold leading-7 text-[#06424B] sm:text-[22px]">
                {displayQuestion}
              </h2>
              {appLanguage === "fr" && questionTranslationFailed && (
                <p className="mt-2 text-xs text-[#98513F]" role="status">
                  {tr("La traduction de cette question est temporairement indisponible.")}
                </p>
              )}
              <p className="mt-2 max-w-xl text-[11px] leading-5 text-[#829596]">
                {tr("Your response will be submitted exactly as shown in the transcript.")}
              </p>
              <div className="mt-2 flex min-h-10 flex-col items-center justify-center" aria-live="polite">
                <VoiceWave active={listening} />
                <span className="mt-1 text-[9px] font-extrabold tracking-[0.13em] text-[#527477]">
                  {tr(listening ? "LISTENING TO YOUR ANSWER" : "AI INTERVIEWER READY")}
                </span>
              </div>
            </section>

            <div className="grid gap-2 sm:grid-cols-3" aria-label={tr("Interview actions")}>
              <button
                type="button"
                onClick={() => void toggleVoice()}
                disabled={remaining === 0 || submitting || !browserSupportsSpeechRecognition}
                aria-pressed={listening}
                className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-3 py-2 text-[11px] font-extrabold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${listening ? "bg-[#A74631] hover:bg-[#913C2B]" : "bg-[#06424B] hover:bg-[#0A515C]"}`}
              >
                {listening ? <MicOff size={16} /> : <Mic size={16} />}
                {tr(listening ? "Stop listening" : "Speak now")}
              </button>
              <button
                type="button"
                onClick={() => void skipQuestion()}
                disabled={submitting || skipping}
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl border-2 border-[#06424B] bg-white px-3 py-2 text-[11px] font-extrabold text-[#06424B] transition hover:bg-[#F2F7F6] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {skipping ? <LoaderCircle size={16} className="animate-spin" /> : <SkipForward size={16} />}
                {tr(skipping ? "Skipping..." : "Skip question")}
              </button>
              <button
                type="button"
                onClick={handleSubmitClick}
                disabled={submitting}
                aria-busy={submitting}
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-[#FFAB0B] px-3 py-2 text-[11px] font-extrabold text-[#06424B] shadow-sm transition hover:bg-[#FFC13C] disabled:cursor-not-allowed disabled:bg-[#E3E8E7] disabled:text-[#91A09F]"
              >
                {submitting ? <LoaderCircle size={15} className="animate-spin" /> : <Send size={15} />}
                {tr(submitting ? "Evaluating Answer..." : "Submit answer")}
              </button>
            </div>
          </div>

          <section className="flex min-h-[500px] flex-col rounded-[26px] border border-[#DCE7E5] bg-white p-4 shadow-[0_3px_14px_rgba(6,66,75,0.045)] sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-[10px] font-extrabold tracking-[0.15em] text-[#527477]">
                <span className={`h-2 w-2 rounded-full ${listening ? "animate-pulse bg-[#65A889]" : "bg-[#9BB8B5]"}`} />
                {tr("LIVE TRANSCRIPTION")}
              </div>
              <span className="text-[10px] font-semibold text-[#829596]">{wordCount} {tr("words")}</span>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span id="topic-theory-language-label" className="text-xs font-bold text-[#06424B]">{tr("Voice input language")}</span>
              <LanguageDropdown
                id="topic-theory-language"
                labelId="topic-theory-language-label"
                value={speechLanguage}
                options={SPEECH_LANGUAGES}
                onChange={setSpeechLanguage}
                disabled={listening || submitting}
              />
            </div>
            <p className="mt-1 text-[9px] leading-4 text-[#8A9B9C]">
              {tr("Choose the language you will speak. Your original transcript is kept for submission.")}
            </p>

            <p className="mt-3 rounded-xl border-l-4 border-[#06424B] bg-[#F0F5F4] px-3 py-3 text-[11px] italic leading-5 text-[#45666A]">
              {displayQuestion}
            </p>

            <label htmlFor="topic-theory-transcript" className="mt-3 text-[11px] font-bold text-[#06424B]">
              {tr("Your answer transcript")}
            </label>
            <textarea
              id="topic-theory-transcript"
              value={answer}
              onChange={handleAnswerChange}
              lang={speechLanguage.startsWith("fr") ? "fr" : "en"}
              rows={6}
              placeholder={tr("Start speaking to see your transcript here, or type your answer...")}
              className="mt-2 min-h-[245px] w-full flex-1 resize-y rounded-xl border border-[#DCE6E5] bg-[#FAFCFB] p-3 text-[13px] leading-5 text-[#29494D] outline-none transition placeholder:text-[#9AA9AA] focus:border-[#06424B] focus:ring-2 focus:ring-[#06424B]/10"
            />
            <p className="mt-3 text-[10px] leading-5 text-[#718486]" aria-live="polite">{tr(voiceMessage)}</p>
            <p className="mt-1 text-[10px] leading-5 text-[#8A9B9C]">
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
                  disabled={translating || submitting}
                  className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#C9DAD8] bg-white px-3 py-2 text-xs font-bold text-[#06424B] transition hover:bg-[#F5F9F8] disabled:opacity-50"
                >
                  {translating ? <LoaderCircle size={14} className="animate-spin" /> : <Languages size={14} />}
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
          </section>
        </div>

        {error && (
          <div role="alert" className="mt-4 rounded-xl border border-[#E6C9C4] bg-[#FFF7F5] p-4 text-sm text-[#8D4035]">
            {error}
          </div>
        )}

        {showEmptyPopup && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="empty-answer-title"
          >
            <div className="w-full max-w-[380px] rounded-2xl bg-white p-6 text-center shadow-[0_20px_50px_rgba(6,66,75,0.25)]">
              <h3 id="empty-answer-title" className="text-base font-extrabold text-[#06424B]">
                {tr("Can't submit an empty answer")}
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#527477]">
                {tr("Please speak or type your answer before submitting.")}
              </p>
              <button
                type="button"
                autoFocus
                onClick={() => setShowEmptyPopup(false)}
                className="mt-5 inline-flex min-h-10 items-center justify-center rounded-xl bg-[#06424B] px-6 text-xs font-extrabold text-white hover:bg-[#0A515C]"
              >
                {tr("OK")}
              </button>
            </div>
          </div>
        )}

        </>}
      </PageShell>
    </div>
  );
}
export default TopicTheoryPractice;