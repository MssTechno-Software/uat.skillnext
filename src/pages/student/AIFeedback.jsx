import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  BookOpen,
  Brain,
  Check,
  CheckCircle2,
  Lightbulb,
  MessageSquareText,
  TrendingUp,
  RefreshCw,
  Sparkles,
  Target,
} from "lucide-react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

import { translateValue } from "../../i18n";
import { translateApiContent } from "../../services/apiContentTranslation";
import {
  readInterviewFeedback,
  saveInterviewFeedback,
  saveInterviewSession,
} from "../../data/interviewPrepSession";
import StudentPageHeader from "../../components/student/StudentPageHeader";
import {
  BackLink,
  Card,
  IconBadge,
  LinkButton,
  PageShell,
} from "../../components/student/ui";

/* ------------------------------------------------------------------ */
/* API-authored text translation                                       */
/* ------------------------------------------------------------------ */
// Evaluation text is dynamic API content, so it is translated by the shared
// service. The service owns the memory/IndexedDB cache; this hook only triggers
// translation for the current feedback view and re-renders when it completes.
function useApiText(texts) {
  const { i18n: translationI18n } = useTranslation("ui");
  const language = String(
    translationI18n.resolvedLanguage || translationI18n.language || "en",
  ).toLowerCase().split("-")[0];
  const [version, setVersion] = useState(0);
  const textsKey = JSON.stringify(Array.isArray(texts) ? texts : []);

  useEffect(() => {
    if (language !== "fr") return undefined;

    let parsedTexts = [];
    try {
      parsedTexts = JSON.parse(textsKey);
    } catch {
      parsedTexts = [];
    }

    // Static dictionary entries and previously cached API translations do not
    // need another request. Dynamic translations are stored centrally by
    // translateApiContent(), so no page-local translation Map is necessary.
    const pending = [...new Set(parsedTexts)].filter(
      (text) =>
        typeof text === "string"
        && text.trim()
        && translateValue(text, { lng: "fr" }) === text,
    );

    if (pending.length === 0) return undefined;

    let cancelled = false;

    Promise.allSettled(
      pending.map((text) => translateApiContent(text, "fr")),
    ).then(() => {
      if (!cancelled) {
        setVersion((current) => current + 1);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [language, textsKey]);

  // The revision is intentionally used only to trigger a render after the
  // shared cache is populated; all translated values are read from that cache.
  void version;

  return (text) => {
    if (typeof text !== "string" || !text) return text;
    return translateValue(text, { lng: language });
  };
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
function normalizeSelfIntroductionEvaluation(payload) {
  const response = payload?.data && typeof payload.data === "object"
    ? payload.data
    : payload && typeof payload === "object"
      ? payload
      : {};
  const evaluation = response.evaluation && typeof response.evaluation === "object"
    ? response.evaluation
    : {};

  const scoreValue = evaluation.overall_score;
  const score = scoreValue === null || scoreValue === undefined || scoreValue === ""
    ? null
    : Number(scoreValue);

  return {
    studentId: response.student_id ?? null,
    questionId: response.question_id ?? null,
    status: String(response.status ?? ""),
    score: Number.isFinite(score) ? score : null,
    overallFeedback: typeof evaluation.overall_feedback === "string"
      ? evaluation.overall_feedback
      : "",
    strengths: Array.isArray(evaluation.strengths)
      ? evaluation.strengths.filter((item) => typeof item === "string" && item.trim())
      : [],
    improvementAreas: Array.isArray(evaluation.improvement_areas)
      ? evaluation.improvement_areas.filter((item) => typeof item === "string" && item.trim())
      : [],
  };
}

function isAttemptedQuestion(question) {
  const value = question?.attempted_status;
  return value === true || value === 1 || ["true", "1", "yes", "submitted", "attempted"]
    .includes(String(value ?? "").trim().toLowerCase());
}

function FeedbackCard({ icon: Icon, eyebrow, title, tone = "teal", children }) {
  const tones = {
    teal: {
      card: "border-[#DCE7E5] bg-white",
      icon: "bg-[#EAF5EF] text-[#39765D]",
      eyebrow: "text-[#39765D]",
      body: "text-[#45666A]",
    },
    gold: {
      card: "border-[#F1DFB6] bg-[#FFFAEE]",
      icon: "bg-[#FFF1D0] text-[#936400]",
      eyebrow: "text-[#936400]",
      body: "text-[#6F5A31]",
    },
  };
  const style = tones[tone] || tones.teal;

  return (
    <section className={`rounded-2xl border p-5 ${style.card}`}>
      <div className="flex items-center gap-2">
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${style.icon}`}>
          <Icon size={16} aria-hidden="true" />
        </span>
        <p className={`text-[9px] font-extrabold tracking-[0.14em] ${style.eyebrow}`}>
          {translateValue(eyebrow)}
        </p>
      </div>
      <h3 className="mt-2 text-sm font-extrabold text-[#06424B]">{translateValue(title)}</h3>
      <p className={`mt-1 text-sm leading-6 ${style.body}`}>{children}</p>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Self-introduction feedback                                          */
/* ------------------------------------------------------------------ */
function SelfIntroductionFeedback({ state }) {
  const navigate = useNavigate();
  const evaluation = normalizeSelfIntroductionEvaluation(
    state?.evaluationPayload ?? state?.submitPayload,
  );
  const question = state?.question || {};
  const questionText = question.question_text || "";
  const answerText = typeof state?.answer === "string" ? state.answer : "";

  // Only authored content is translated. Raw status values are never shown to students.
  const tr = useApiText([
    questionText,
    answerText,
    evaluation.overallFeedback,
    state?.evaluationError,
    ...evaluation.strengths,
    ...evaluation.improvementAreas,
  ]);

  const questionId = evaluation.questionId ?? state?.questionId ?? question.question_id;
  const questions = Array.isArray(state?.questions) ? state.questions : [];
  const totalQuestions = Number(state?.totalQuestions) || questions.length || 1;
  const questionNumber = Number(state?.questionNumber)
    || Math.max(
      questions.findIndex((item) => String(item.question_id) === String(questionId)) + 1,
      1,
    );
  const submittedQuestionIds = Array.isArray(state?.submittedQuestionIds)
    ? state.submittedQuestionIds.map(String)
    : questionId == null
      ? []
      : [String(questionId)];
  const dailyRemaining = Number(state?.dailyLimit?.remaining ?? 0);
  const submittedSet = new Set(submittedQuestionIds);

  const hasNextQuestion = questions.some((item) => {
    const id = String(item.question_id);
    return id !== String(questionId) && !isAttemptedQuestion(item) && !submittedSet.has(id);
  });
  const canContinue = hasNextQuestion && dailyRemaining > 0;

  // Goes straight to the next question: the practice page skips its intro screen
  // when it receives continueAfterSubmission, and continues after fromQuestionId.
  const continuePractice = () => {
    if (canContinue) {
      navigate("/student/ai-practice/self-introduction", {
        state: {
          continueAfterSubmission: true,
          fromQuestionId: questionId,
          submittedQuestionIds,
          questions,
          totalQuestions,
          dailyLimit: state?.dailyLimit ?? null,
        },
      });
      return;
    }

    navigate("/student/ai-practice");
  };

  const statusReady = evaluation.status.toLowerCase() === "ready";
  const wordCount = answerText.trim() ? answerText.trim().split(/\s+/).length : 0;
  const hasEvaluation = evaluation.score !== null
    || Boolean(evaluation.overallFeedback)
    || evaluation.strengths.length > 0
    || evaluation.improvementAreas.length > 0;

  return (
    <PageShell max="max-w-[1400px]">
      <StudentPageHeader
        title={translateValue("Self-Introduction Feedback")}
        subtitle={translateValue("Review the evaluation for your submitted answer.")}
      />

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <BackLink to="/student/ai-practice/self-introduction">
          {translateValue("Self-Introduction Practice")}
        </BackLink>
        <span className="rounded-full border border-[#F1DFB6] bg-[#FFFAEE] px-3 py-1.5 text-[10px] font-extrabold tracking-wide text-[#936400]">
          {translateValue("QUESTION")} {questionNumber} {translateValue("OF")} {totalQuestions}
        </span>
      </div>

      {/* Fixed student-friendly notice when the evaluation could not be loaded. */}
      {state?.evaluationError && !hasEvaluation && (
        <div className="mt-5 rounded-2xl border border-[#F1DFB6] bg-[#FFFAEE] p-4" role="status">
          <p className="text-sm font-semibold leading-6 text-[#795817]">
            {tr(state.evaluationError)}
          </p>
        </div>
      )}

      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-12 lg:gap-4">
        <section className="lg:col-span-7">
          <Card className="h-full bg-[#F7FAFA] p-3 sm:p-4">
            <div className="flex flex-col gap-4 rounded-2xl border border-[#DCE7E5] bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div>
                <p className="mb-3 text-[10px] font-extrabold tracking-[0.14em] text-[#527477]">
                  {translateValue("OVERALL SCORE")}
                </p>
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={30} className="text-[#39765D]" aria-hidden="true" />
                  <h1 className="text-3xl font-extrabold text-[#06424B] sm:text-[40px]">
                    {evaluation.score ?? "—"}
                    <span className="text-xl text-[#718486]"> / 100</span>
                  </h1>
                </div>
              </div>

              {evaluation.status && (
                <span
                  className={`inline-flex min-h-9 items-center justify-center rounded-full px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.12em] ${
                    statusReady
                      ? "bg-[#EAF5EF] text-[#39765D]"
                      : "bg-[#EEF3F4] text-[#527477]"
                  }`}
                >
                  {translateValue(statusReady ? "Ready" : "Review in progress")}
                </span>
              )}
            </div>

            <div className="mt-3 rounded-xl border border-[#DCE7E5] bg-white p-3 sm:p-4 shadow-sm">
              <h2 className="mb-3 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.12em] text-[#06424B]">
                <TrendingUp size={17} className="text-[#39765D]" aria-hidden="true" />
                {translateValue("COMPREHENSIVE STRENGTHS")}
              </h2>
              {evaluation.strengths.length > 0 ? (
                <ul className="space-y-3">
                  {evaluation.strengths.map((item, index) => (
                    <li
                      key={`${index}-${item.slice(0, 22)}`}
                      className="flex items-start gap-3 text-sm leading-6 text-[#45666A]"
                    >
                      <CheckCircle2 size={16} className="mt-1 shrink-0 text-[#39765D]" aria-hidden="true" />
                      <span>{tr(item)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm leading-6 text-[#829596]">—</p>
              )}
            </div>

            <div className="mt-3 rounded-xl border border-[#DCE7E5] bg-white p-3 sm:p-4 shadow-sm">
              <h2 className="mb-3 text-xs font-extrabold uppercase tracking-[0.12em] text-[#06424B]">
                {translateValue("OVERALL FEEDBACK")}
              </h2>
              <p className="whitespace-pre-wrap text-sm leading-7 text-[#45666A]">
                {evaluation.overallFeedback ? tr(evaluation.overallFeedback) : "—"}
              </p>
            </div>

            <div className="mt-3 rounded-xl border border-[#F1DFB6] bg-[#FFFAEE] p-3 sm:p-4">
              <h2 className="mb-4 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.12em] text-[#936400]">
                <Lightbulb size={17} aria-hidden="true" />
                {translateValue("IMPROVEMENT AREAS")}
              </h2>
              {evaluation.improvementAreas.length > 0 ? (
                <ul className="space-y-3">
                  {evaluation.improvementAreas.map((item, index) => (
                    <li
                      key={`${index}-${item.slice(0, 22)}`}
                      className="flex items-start gap-3 text-sm leading-6 text-[#6F5A31]"
                    >
                      <Lightbulb size={15} className="mt-1 shrink-0 text-[#936400]" aria-hidden="true" />
                      <span>{tr(item)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm leading-6 text-[#8A7548]">—</p>
              )}
            </div>
          </Card>
        </section>

        <section className="lg:col-span-5">
          <Card className="flex h-full min-h-0 flex-col p-3 sm:p-4">
            <div className="mb-3 flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-[#65A889]" aria-hidden="true" />
              <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#527477]">
                {translateValue("LIVE TRANSCRIPTION")}
              </span>
              <span className="ml-auto text-[10px] font-semibold text-[#829596]">
                {wordCount} {translateValue("words")}
              </span>
            </div>

            <div className="rounded-xl border-l-4 border-[#06424B] bg-[#F0F5F4] p-4">
              <p className="text-[9px] font-extrabold tracking-[0.13em] text-[#527477]">
                {translateValue("AI QUESTION")}
              </p>
              <p className="mt-2 text-sm italic leading-7 text-[#45666A]">
                {questionText ? tr(questionText) : "—"}
              </p>
            </div>

            <div className="mt-3 flex-1 rounded-xl border border-[#DCE7E5] bg-white p-3 sm:p-4">
              <p className="mb-3 text-[10px] font-extrabold tracking-[0.12em] text-[#527477]">
                {translateValue("YOUR ANSWER TRANSCRIPT")}
              </p>
              <p className="whitespace-pre-wrap text-sm leading-7 text-[#29494D]">
                {answerText ? tr(answerText) : "—"}
              </p>
            </div>
          </Card>
        </section>
      </div>

      <button
        type="button"
        onClick={continuePractice}
        className="mt-3 inline-flex min-h-[44px] w-full items-center justify-center gap-3 rounded-xl bg-[#06424B] px-6 py-4 text-sm font-extrabold uppercase text-white shadow-sm transition hover:bg-[#0A5963] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFAB0B]"
      >
        <ArrowRight size={19} aria-hidden="true" />
        {translateValue(canContinue ? "Next Question" : "Finish Interview")}
      </button>
    </PageShell>
  );
}

/* ------------------------------------------------------------------ */
/* Topic interview feedback                                            */
/* ------------------------------------------------------------------ */
function TopicInterviewFeedback({ state }) {
  const navigate = useNavigate();
  const session = state?.session;
  const feedback = state?.feedback;
  const question = state?.question;
  const referencePoints = Array.isArray(feedback?.referencePoints) ? feedback.referencePoints : [];
  const answerText = typeof state?.answer === "string" ? state.answer : "";

  const tr = useApiText([
    state?.title,
    question?.text,
    answerText,
    feedback?.title,
    feedback?.summary,
    feedback?.strength,
    feedback?.improvement,
    ...referencePoints,
  ]);

  const totalQuestions = session?.questions?.length || 1;
  const currentQuestion = session?.questionIndex ?? 0;
  const currentNumber = Math.min(currentQuestion + 1, totalQuestions);
  const isLastQuestion = !session?.questions?.length || currentQuestion >= totalQuestions - 1;
  const hasReferencePoints = referencePoints.length > 0;

  const continueInterview = () => {
    if (!session?.questions?.length) {
      saveInterviewFeedback(null);
      navigate("/student/ai-practice");
      return;
    }

    const nextSession = {
      ...session,
      questionIndex: isLastQuestion ? session.questionIndex : session.questionIndex + 1,
      completed: isLastQuestion,
    };

    saveInterviewSession(nextSession);
    saveInterviewFeedback(null);

    if (isLastQuestion) {
      navigate("/student/ai-practice");
      return;
    }

    navigate("/student/ai-practice/topic-theory/interview");
  };

  return (
    <PageShell max="max-w-[1120px]">
      <StudentPageHeader
        title={translateValue("Interview Feedback")}
        subtitle={translateValue("Review your answer, identify what worked well and plan your next improvement.")}
      />

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <BackLink to="/student/ai-practice">{translateValue("Interview Prep")}</BackLink>
        <span className="rounded-full border border-[#F1DFB6] bg-[#FFFAEE] px-3 py-1.5 text-[10px] font-extrabold tracking-wide text-[#936400]">
          {translateValue("QUESTION")} {currentNumber} {translateValue("OF")} {totalQuestions}
        </span>
      </div>

      <Card className="mt-5 overflow-hidden p-0">
        <div className="border-b border-[#E6EEEE] bg-gradient-to-r from-[#F4F8F7] to-white px-6 py-7 sm:px-8">
          <div className="flex flex-wrap items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#D5E5E2] bg-white text-[#06424B] shadow-sm">
              <Brain size={27} aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-extrabold tracking-[0.16em] text-[#B07A06]">
                {translateValue("SKILL NEXT PRACTICE REVIEW")}
              </p>
              <h1 className="mt-1 text-2xl font-extrabold leading-tight text-[#06424B] sm:text-3xl">
                {state?.title ? tr(state.title) : translateValue("Interview response")}
              </h1>
              <p className="mt-2 text-sm leading-6 text-[#718486]">
                {translateValue("Use this review to make your next answer clearer and more structured.")}
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF5EF] px-3 py-1.5 text-[9px] font-extrabold tracking-wide text-[#39765D]">
              <CheckCircle2 size={13} aria-hidden="true" /> {translateValue("REVIEW READY")}
            </span>
          </div>
        </div>

        <div className="space-y-3 p-3 sm:p-5">
          {question?.text && (
            <section className="rounded-2xl border border-[#DCE7E5] bg-[#F7FAFA] p-5">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#06424B]">
                  <MessageSquareText size={16} aria-hidden="true" />
                </span>
                <p className="text-[10px] font-extrabold tracking-[0.14em] text-[#527477]">
                  {translateValue("INTERVIEW QUESTION")}
                </p>
                {question.difficulty && (
                  <span className="ml-auto rounded-full bg-[#FFF1D0] px-2.5 py-1 text-[9px] font-bold text-[#936400]">
                    {translateValue(question.difficulty)}
                  </span>
                )}
              </div>
              <p className="mt-3 text-base font-bold leading-7 text-[#06424B]">
                {tr(question.text)}
              </p>
            </section>
          )}

          <section className="rounded-2xl border border-[#DCE7E5] bg-white p-3 sm:p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-extrabold tracking-[0.12em] text-[#527477]">
                <MessageSquareText size={16} aria-hidden="true" />
                {translateValue("YOUR ANSWER TRANSCRIPT")}
              </div>
              <span className="text-[10px] font-semibold text-[#829596]">
                {answerText.trim() ? answerText.trim().split(/\s+/).length : 0} {translateValue("words")}
              </span>
            </div>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#3F5C60]">
              {answerText ? tr(answerText) : translateValue("No transcript was submitted for this question.")}
            </p>
          </section>

          {feedback ? (
            <>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF3F4] text-[#06424B]">
                  <Sparkles size={19} aria-hidden="true" />
                </div>
                <div>
                  <p className="text-[9px] font-extrabold tracking-[0.15em] text-[#B07A06]">{translateValue("GUIDED FEEDBACK")}</p>
                  <h2 className="mt-0.5 text-lg font-extrabold text-[#06424B]">
                    {tr(feedback.title || "Your response review")}
                  </h2>
                </div>
              </div>

              {feedback.summary && (
                <div className="rounded-2xl border border-[#DCE7E5] bg-[#F7FAFA] p-5">
                  <p className="text-sm leading-7 text-[#45666A]">{tr(feedback.summary)}</p>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                {feedback.strength && (
                  <FeedbackCard
                    icon={CheckCircle2}
                    eyebrow="WHAT WENT WELL"
                    title="Your strengths"
                    tone="teal"
                  >
                    {tr(feedback.strength)}
                  </FeedbackCard>
                )}
                {feedback.improvement && (
                  <FeedbackCard
                    icon={Lightbulb}
                    eyebrow="NEXT STEP"
                    title="How to improve"
                    tone="gold"
                  >
                    {tr(feedback.improvement)}
                  </FeedbackCard>
                )}
              </div>

              {hasReferencePoints && (
                <section className="rounded-2xl border border-[#DCE7E5] bg-white p-3 sm:p-4">
                  <div className="flex items-center gap-2">
                    <Target size={18} className="text-[#06424B]" aria-hidden="true" />
                    <h2 className="text-sm font-extrabold text-[#06424B]">{translateValue("TOPIC POINTS TO REVISE")}</h2>
                  </div>
                  <ul className="mt-2 space-y-2">
                    {referencePoints.map((point, index) => (
                      <li key={`${index}-${String(point).slice(0, 24)}`} className="flex items-start gap-3 text-sm leading-6 text-[#527477]">
                        <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#EAF5EF] text-[#39765D]">
                          <Check size={12} aria-hidden="true" />
                        </span>
                        <span>{tr(point)}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </>
          ) : (
            <div className="rounded-2xl border border-[#F1DFB6] bg-[#FFFAEE] p-5" role="status">
              <p className="text-sm font-semibold text-[#795817]">{translateValue("No guided feedback was returned for this response.")}</p>
            </div>
          )}

          <div className="flex flex-col gap-4 border-t border-[#E8EEEE] pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-2xl text-[10px] leading-5 text-[#829596]">
              {translateValue("This guided feedback is based on your answer structure and the selected topic. It is not an automated score.")}
            </p>
            <button
              type="button"
              onClick={continueInterview}
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#FFAB0B] px-6 py-3 text-xs font-extrabold text-[#06424B] transition hover:bg-[#FFC13C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#06424B]"
            >
              {translateValue(isLastQuestion ? "Finish interview" : "Next interview question")}
              <ArrowRight size={15} aria-hidden="true" />
            </button>
          </div>
        </div>
      </Card>
    </PageShell>
  );
}


function LegacyPracticeFeedback({ state }) {
  const fallbackQuestion = typeof state?.question === "string"
    ? state.question
    : state?.question?.question_text || state?.question?.text || "";
  const fallbackAnswer = typeof state?.answer === "string" ? state.answer : "";
  const fallbackTr = useApiText([
    state?.title,
    fallbackQuestion,
    fallbackAnswer,
    state?.note,
  ]);

  return (
    <PageShell max="max-w-[960px]">
      <StudentPageHeader
        title={translateValue("Practice Feedback")}
        subtitle={translateValue("Review the submitted response and practice progress.")}
      />
      <div className="mt-5">
        <BackLink to="/student/ai-practice">{translateValue("AI Practice")}</BackLink>
      </div>

      <Card className="mt-5 overflow-hidden p-0">
        <div className="border-b border-[#E6EEEE] bg-gradient-to-r from-[#F4F8F7] to-white p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <IconBadge icon={Brain} size="lg" />
            <div>
              <p className="text-[9px] font-extrabold tracking-[0.16em] text-[#B07A06]">{translateValue("SKILL NEXT PRACTICE")}</p>
              <h1 className="mt-1 text-2xl font-extrabold text-[#06424B]">{state?.title ? fallbackTr(state.title) : translateValue("Practice response")}</h1>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          {fallbackQuestion && (
            <div className="rounded-2xl border border-[#DCE7E5] bg-[#F7FAFA] p-5">
              <p className="text-[10px] font-extrabold tracking-wide text-[#527477]">{translateValue("INTERVIEW QUESTION")}</p>
              <p className="mt-2 text-sm font-semibold leading-7 text-[#06424B]">{fallbackTr(fallbackQuestion)}</p>
            </div>
          )}

          {state?.answer ? (
            <div className="mt-3 rounded-xl border border-[#DCE7E5] bg-white p-3">
              <p className="text-[10px] font-extrabold tracking-wide text-[#527477]">{translateValue("YOUR SUBMITTED RESPONSE")}</p>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#3F5C60]">{fallbackTr(fallbackAnswer)}</p>
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-[#DCE7E5] bg-[#F7FAFA] p-5 text-sm leading-6 text-[#718486]" role="status">
              {translateValue("No practice feedback is available yet. Complete a practice question to see your review here.")}
            </div>
          )}

          {state?.note && <p className="mt-4 text-sm leading-7 text-[#5A7478]">{fallbackTr(state.note)}</p>}

          <div className="mt-6 flex flex-col gap-3 border-t border-[#E8EEEE] pt-5 sm:flex-row">
            <LinkButton to="/student/ai-practice" variant="outline" icon={RefreshCw}>
              {translateValue("Practise again")}
            </LinkButton>
            <LinkButton to="/student/dashboard" icon={BookOpen}>
              {translateValue("Dashboard")}
            </LinkButton>
          </div>
        </div>
      </Card>
    </PageShell>
  );
}

/* ------------------------------------------------------------------ */
/* Route entry                                                         */
/* ------------------------------------------------------------------ */
function AIFeedback() {
  const location = useLocation();
  // Re-render when the app language changes so translated labels update immediately.
  useTranslation("ui");
  const state = location.state || readInterviewFeedback();

  // One page-level scope lets Dark and High Contrast styles cover the complete
  // feedback experience without changing shared cards, headers, or other routes.
  if (state?.mode === "topic-interview") {
    return (
      <div data-a11y-page="ai-feedback">
        <TopicInterviewFeedback state={state} />
      </div>
    );
  }

  if (state?.mode === "self-introduction-api") {
    return (
      <div data-a11y-page="ai-feedback">
        <SelfIntroductionFeedback state={state} />
      </div>
    );
  }

  // Keep links from the retired local self-introduction feedback flow safe.
  if (state?.mode === "self-introduction") {
    return <Navigate to="/student/ai-practice/self-introduction" replace />;
  }

  return (
    <div data-a11y-page="ai-feedback">
      <LegacyPracticeFeedback state={state} />
    </div>
  );
}

export default AIFeedback;