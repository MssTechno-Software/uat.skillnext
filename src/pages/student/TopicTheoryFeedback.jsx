import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Check,
  CheckCircle2,
  Clock3,
  Lightbulb,
  SkipForward,
  Target,
  TrendingUp,
} from "lucide-react";

import { translateValue } from "../../i18n";
import { PageShell } from "../../components/student/ui";
import {
  readInterviewSession,
  saveInterviewSession,
} from "../../data/interviewPrepSession";

const COURSES_PATH = "/student/ai-practice/topic-theory";
const INTERVIEW_PATH = "/student/ai-practice/topic-theory/interview";

const DONE_STATUSES = [
  "completed",
  "complete",
  "attempted",
  "submitted",
  "answered",
  "true",
  "1",
  "yes",
];

const statusOf = (value) => String(value ?? "").trim().toLowerCase();
const questionIdOf = (question) => question?.question_id ?? question?.id;

function ScoreCard({ label, value }) {
  const score = Number(value ?? 0);

  return (
    <div className="rounded-2xl border border-[#DCE7E5] bg-white p-5 shadow-sm">
      <p className="text-[10px] font-extrabold tracking-widest text-[#718486]">
        {translateValue(label)}
      </p>

      <div className="mt-3 flex items-end gap-1">
        <span className="text-3xl font-extrabold text-[#06424B]">
          {Number.isFinite(score) ? score : 0}
        </span>
        <span className="pb-1 text-xs font-bold text-[#829596]">/ 100</span>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#EEF3F4]">
        <div
          className="h-full rounded-full bg-[#06424B] transition-all"
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>
    </div>
  );
}

function FeedbackList({ title, items, icon: Icon, tone = "teal" }) {
  const styles = {
    teal: "bg-[#EAF5EF] text-[#39765D]",
    gold: "bg-[#FFF1D0] text-[#936400]",
  };

  return (
    <section className="rounded-2xl border border-[#DCE7E5] bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${styles[tone]}`}
        >
          <Icon size={17} />
        </span>

        <h3 className="text-sm font-extrabold text-[#06424B]">
          {translateValue(title)}
        </h3>
      </div>

      {items.length ? (
        <ul className="mt-4 space-y-3">
          {items.map((item, index) => (
            <li
              key={`${title}-${index}`}
              className="flex items-start gap-3 text-sm leading-6 text-[#45666A]"
            >
              <CheckCircle2
                size={16}
                className="mt-1 shrink-0 text-[#39765D]"
              />
              <span>{translateValue(item)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-[#829596]">
          {translateValue("No items available.")}
        </p>
      )}
    </section>
  );
}

/* Small progress stepper: shows where the student is in the practice. */
function PracticeStepper({ items, currentId }) {
  if (!items.length) return null;

  return (
    <ol
      className="mt-4 flex w-full min-w-0 items-center overflow-x-auto pb-1 [scrollbar-width:thin]"
      aria-label={translateValue("Question progress stepper")}
    >
      {items.map((item, index) => {
        const current = item.id === currentId;
        const label = current
          ? "Current question"
          : item.status === "done"
            ? "Submitted"
            : item.status === "skipped"
              ? "Skipped"
              : "Not started";

        return (
          <li
            key={item.id}
            className="flex min-w-[34px] flex-1 items-center last:flex-none"
          >
            <span
              aria-current={current ? "step" : undefined}
              aria-label={`${translateValue("Question")} ${index + 1}: ${translateValue(label)}`}
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[10px] font-extrabold ${
                current
                  ? "border-[#06424B] bg-[#06424B] text-white shadow-[0_0_0_4px_rgba(6,66,75,0.10)]"
                  : item.status === "done"
                    ? "border-[#A8D5BE] bg-[#EAF5EF] text-[#39765D]"
                    : item.status === "skipped"
                      ? "border-[#EADBC8] bg-[#FBF7F1] text-[#9A7845]"
                      : "border-[#DCE7E5] bg-[#FAFCFC] text-[#829596]"
              }`}
            >
              {item.status === "done" && !current ? (
                <Check size={13} />
              ) : (
                index + 1
              )}
            </span>

            {index < items.length - 1 && (
              <span
                className={`mx-1.5 h-px min-w-2 flex-1 ${
                  item.status === "done" ? "bg-[#A8D5BE]" : "bg-[#E7EEEE]"
                }`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function TopicTheoryFeedback() {
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state || {};
  const payload = state.submitPayload || {};
  const evaluation = state.evaluation || payload.evaluation || {};

  const question = state.question || {};
  const questionText = question.question_text || question.text || "";

  const answer = state.answer || "";

  const score = Number(evaluation.overall_score ?? 0);
  const scores = evaluation.scores || {};

  const session = state.session || readInterviewSession();

  const questionStepper = Array.isArray(state.questionStepper)
    ? state.questionStepper
    : [];

  const currentQuestionId =
    payload.question_id ?? question.question_id ?? questionIdOf(question);
  const currentId = String(currentQuestionId);

  // Remaining submissions today. `null` means "unknown" (not the same as 0).
  const remainingRaw =
    state.remainingToday ??
    payload.remaining_today ??
    session?.remainingToday ??
    session?.dailyUsage?.remaining ??
    null;
  const remainingToday =
    remainingRaw === null || !Number.isFinite(Number(remainingRaw))
      ? null
      : Number(remainingRaw);
  const limitReached = remainingToday !== null && remainingToday <= 0;

  // Work out every question's status from the session + stepper (single source of truth).
  const progress = useMemo(() => {
    const questions = Array.isArray(session?.questions) ? session.questions : [];
    const responses = Array.isArray(session?.responses) ? session.responses : [];

    const stepperStatus = new Map(
      questionStepper.map((item) => [
        String(item.question_id),
        statusOf(item.attempted_status),
      ])
    );
    const answered = new Set(
      responses
        .filter((item) => !item.skipped)
        .map((item) => String(item.questionId))
    );
    const skipped = new Set(
      responses
        .filter((item) => item.skipped)
        .map((item) => String(item.questionId))
    );

    // The question that was just submitted is always done.
    answered.add(currentId);
    skipped.delete(currentId);

    const items = questions.map((item, index) => {
      const id = String(questionIdOf(item));
      const step = stepperStatus.get(id);

      let status = "pending";
      if (
        answered.has(id) ||
        DONE_STATUSES.includes(statusOf(item.attempted_status)) ||
        DONE_STATUSES.includes(step)
      ) {
        status = "done";
      } else if (skipped.has(id) || step === "skipped") {
        status = "skipped";
      }

      return { id, index, status };
    });

    const currentIndex = Math.max(
      items.findIndex((item) => item.id === currentId),
      0
    );
    const pending = items.filter((item) => item.status === "pending");
    const skippedItems = items.filter((item) => item.status === "skipped");

    return {
      items,
      total: items.length,
      doneCount: items.filter((item) => item.status === "done").length,
      pending,
      skippedItems,
      // next unanswered question after this one, otherwise wrap to the first unanswered
      nextPending:
        pending.find((item) => item.index > currentIndex) || pending[0] || null,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, questionStepper, currentId]);

  // What the main button does.
  const action = (() => {
    if (!progress.total) return { kind: "courses" };

    if (progress.pending.length > 0) {
      return limitReached
        ? { kind: "blocked" }
        : { kind: "next", target: progress.nextPending };
    }

    if (progress.skippedItems.length > 0) {
      return limitReached
        ? { kind: "blocked" }
        : { kind: "skipped", target: progress.skippedItems[0] };
    }

    return { kind: "finish" };
  })();

  const openQuestion = (target) => {
    if (!session || !target) {
      navigate(COURSES_PATH);
      return;
    }

    saveInterviewSession({
      ...session,
      questionIndex: target.index,
      completed: false,
    });

    navigate(INTERVIEW_PATH, {
      state: { continueAfterSubmission: true },
    });
  };

  const finishPractice = () => {
    if (session) {
      saveInterviewSession({ ...session, completed: true });
    }
    navigate(INTERVIEW_PATH, { state: { practiceFinished: true } });
  };

  const handlePrimary = () => {
    if (action.kind === "next" || action.kind === "skipped") {
      openQuestion(action.target);
    } else if (action.kind === "finish") {
      finishPractice();
    } else if (action.kind === "courses") {
      navigate(COURSES_PATH);
    }
  };

  const goBackToCourses = () => {
    navigate(COURSES_PATH);
  };

  if (!state.submitPayload) {
    return (
      <PageShell max="max-w-[1200px]">
        <div className="rounded-2xl border border-[#DCE7E5] bg-white p-8 text-center">
          <p className="text-sm text-[#718486]">
            {translateValue(
              "Feedback is not available. Please complete an interview question first."
            )}
          </p>

          <button
            type="button"
            onClick={goBackToCourses}
            className="mt-5 rounded-xl bg-[#06424B] px-5 py-3 text-sm font-bold text-white"
          >
            {translateValue("Back to courses")}
          </button>
        </div>
      </PageShell>
    );
  }

  // Footer content per state
  const leftCount = progress.pending.length;
  let footerMessage = "";
  if (action.kind === "next") {
    footerMessage = `${progress.doneCount} / ${progress.total} ${translateValue("answered")} · ${leftCount} ${translateValue("left")}`;
  } else if (action.kind === "skipped") {
    footerMessage = `${translateValue("All new questions answered. You skipped")} ${progress.skippedItems.length}.`;
  } else if (action.kind === "blocked") {
    footerMessage = translateValue(
      "You have reached your daily Topic Theory limit. Please try again after it resets."
    );
  } else if (action.kind === "finish") {
    footerMessage = `${progress.doneCount} / ${progress.total} ${translateValue("answered")} · ${translateValue("Great work!")}`;
  }

  const donePercent = progress.total
    ? (progress.doneCount / progress.total) * 100
    : 0;

  return (
    <PageShell max="max-w-[1400px]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-extrabold tracking-[0.16em] text-[#B07A06]">
            {translateValue("SKILL NEXT AI EVALUATION")}
          </p>

          <h1 className="mt-2 text-2xl font-extrabold text-[#06424B]">
            {translateValue("Interview Feedback")}
          </h1>

          <p className="mt-2 text-sm text-[#718486]">
            {translateValue(state.courseName || "Course")} ·{" "}
            {translateValue(state.difficulty || "Easy")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {remainingToday !== null && (
            <div className="inline-flex items-center gap-2 rounded-lg border border-[#F1DFB6] bg-[#FFFAEE] px-3 py-2 text-[11px] font-bold text-[#815C12]">
              <span className="tracking-wide">
                {translateValue("REMAINING TODAY")}
              </span>
              <span className="text-sm font-extrabold tabular-nums">
                {remainingToday}
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={goBackToCourses}
            className="inline-flex items-center gap-2 rounded-xl border border-[#DCE7E5] bg-white px-4 py-3 text-xs font-bold text-[#45666A] hover:border-[#06424B]"
          >
            <ArrowLeft size={15} />
            {translateValue("Back to courses")}
          </button>
        </div>
      </div>

      {progress.total > 0 && (
        <div className="mt-5 rounded-2xl border border-[#DCE7E5] bg-white px-4 py-4 shadow-sm sm:px-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[10px] font-extrabold tracking-[0.15em] text-[#527477]">
              {translateValue("OVERALL QUESTION PROGRESS")}
            </p>
            <p className="text-xs font-bold tabular-nums text-[#06424B]">
              {progress.doneCount} / {progress.total}
            </p>
          </div>
          <PracticeStepper items={progress.items} currentId={currentId} />
        </div>
      )}

      <section className="mt-5 overflow-hidden rounded-[24px] border border-[#DCE7E5] bg-white shadow-sm">
        <div className="bg-[#06424B] px-6 py-7 text-white sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-extrabold tracking-widest text-[#B9D8D2]">
                {translateValue("OVERALL PERFORMANCE")}
              </p>

              <h2 className="mt-2 text-3xl font-extrabold">
                {Number.isFinite(score) ? score : 0}
                <span className="ml-1 text-sm font-semibold text-[#B9D8D2]">
                  / 100
                </span>
              </h2>

              <p className="mt-2 text-sm text-[#D5E6E2]">
                {translateValue("Your answer evaluation is ready.")}
              </p>
            </div>

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
              <Award size={34} className="text-[#FFAB0B]" />
            </div>
          </div>

          <div className="mt-5 inline-flex rounded-full bg-[#FFAB0B] px-4 py-2 text-xs font-extrabold text-[#06424B]">
            {translateValue(evaluation.candidate_tier || "Evaluated")}
          </div>
        </div>

        <div className="p-5 sm:p-8">
          <p className="text-[10px] font-extrabold tracking-widest text-[#527477]">
            {translateValue("QUESTION")}
          </p>

          <h3 className="mt-3 text-lg font-extrabold leading-8 text-[#06424B]">
            {translateValue(questionText)}
          </h3>

          <div className="mt-5 rounded-2xl border border-[#DCE7E5] bg-[#F7FAFA] p-5">
            <p className="text-[10px] font-extrabold tracking-widest text-[#527477]">
              {translateValue("YOUR SUBMITTED ANSWER")}
            </p>

            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#45666A]">
              {answer}
            </p>
          </div>
        </div>
      </section>

      <div className="mt-5">
        <div className="mb-4 flex items-center gap-2">
          <Target size={18} className="text-[#06424B]" />
          <h2 className="text-base font-extrabold text-[#06424B]">
            {translateValue("Detailed Score Breakdown")}
          </h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <ScoreCard label="Accuracy" value={scores.accuracy} />
          <ScoreCard label="Completeness" value={scores.completeness} />
          <ScoreCard label="Clarity" value={scores.clarity} />
          <ScoreCard label="Depth" value={scores.depth} />
        </div>
      </div>

      <section className="mt-5 rounded-2xl border border-[#DCE7E5] bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <BookOpen size={18} className="text-[#06424B]" />
          <h2 className="text-sm font-extrabold text-[#06424B]">
            {translateValue("Overall Feedback")}
          </h2>
        </div>

        <p className="mt-4 text-sm leading-7 text-[#45666A]">
          {translateValue(
            evaluation.overall_feedback || "No overall feedback is available."
          )}
        </p>
      </section>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <FeedbackList
          title="Strengths"
          icon={CheckCircle2}
          items={evaluation.strengths || []}
        />

        <FeedbackList
          title="Areas for Improvement"
          icon={TrendingUp}
          tone="gold"
          items={evaluation.improvement_areas || []}
        />

        <FeedbackList
          title="Matched Key Points"
          icon={CheckCircle2}
          items={evaluation.matched_points || []}
        />

        <FeedbackList
          title="Missing Key Points"
          icon={Lightbulb}
          tone="gold"
          items={evaluation.missing_points || []}
        />
      </div>

      {/* Sticky action bar: the next step is always one click away */}
      <div className="sticky bottom-3 z-20 mt-6 pb-1">
        <div className="overflow-hidden rounded-2xl border border-[#DCE7E5] bg-white/95 shadow-[0_10px_30px_rgba(6,66,75,0.14)] backdrop-blur">
          {progress.total > 0 && (
            <div className="h-1 w-full bg-[#E8EFEE]">
              <div
                className="h-full bg-[#06424B] transition-[width] duration-500"
                style={{ width: `${donePercent}%` }}
              />
            </div>
          )}

          <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
            <p
              className={`min-w-0 text-xs font-semibold leading-5 ${
                action.kind === "blocked" ? "text-[#8D4035]" : "text-[#45666A]"
              }`}
              role={action.kind === "blocked" ? "alert" : "status"}
            >
              {footerMessage}
            </p>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={goBackToCourses}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#C9DAD8] bg-white px-5 text-xs font-bold text-[#45666A] transition hover:border-[#06424B]"
              >
                <ArrowLeft size={15} />
                {translateValue("Choose Another Course")}
              </button>

              {action.kind === "next" && (
                <button
                  type="button"
                  onClick={handlePrimary}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#FFAB0B] px-7 text-xs font-extrabold text-[#06424B] shadow-sm transition hover:bg-[#FFC13C]"
                >
                  {translateValue("Next Question")}
                  <ArrowRight size={15} />
                </button>
              )}

              {action.kind === "skipped" && (
                <button
                  type="button"
                  onClick={handlePrimary}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#FFAB0B] px-7 text-xs font-extrabold text-[#06424B] shadow-sm transition hover:bg-[#FFC13C]"
                >
                  <SkipForward size={15} />
                  {translateValue("Answer Skipped Questions")} (
                  {progress.skippedItems.length})
                </button>
              )}

              {action.kind === "finish" && (
                <button
                  type="button"
                  onClick={handlePrimary}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#06424B] px-7 text-xs font-extrabold text-white shadow-sm transition hover:bg-[#0A515C]"
                >
                  <Award size={15} />
                  {translateValue("Finish Practice")}
                </button>
              )}

              {action.kind === "blocked" && (
                <button
                  type="button"
                  disabled
                  className="inline-flex min-h-12 cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-[#E3E8E7] px-7 text-xs font-extrabold text-[#91A09F]"
                >
                  <Clock3 size={15} />
                  {translateValue("Daily limit reached")}
                </button>
              )}

              {action.kind === "courses" && (
                <button
                  type="button"
                  onClick={handlePrimary}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#FFAB0B] px-7 text-xs font-extrabold text-[#06424B] shadow-sm transition hover:bg-[#FFC13C]"
                >
                  {translateValue("Back to courses")}
                  <ArrowRight size={15} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

export default TopicTheoryFeedback;