
import {
  Brain,
  CheckCircle2,
  MessageSquareText,
  Sparkles,
  XCircle,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  readInterviewFeedback,
  saveInterviewFeedback,
  saveInterviewSession,
} from "../../data/interviewPrepSession";

import Sidebar from "../../components/Sidebar";
import StudentPageHeader from "../../components/student/StudentPageHeader";

import {
  BackLink,
  Card,
  IconBadge,
  LinkButton,
  Note,
  PageShell,
} from "../../components/student/ui";

function TopicInterviewFeedback({ state }) {
  const navigate = useNavigate();

  const session = state?.session;
  const feedback = state?.feedback;
  const question = state?.question;

  const isLastQuestion =
    !session?.questions?.length ||
    session.questionIndex >= session.questions.length - 1;

  const continueInterview = () => {
    if (!session?.questions?.length) {
      navigate("/student/ai-practice");
      return;
    }

    const nextSession = {
      ...session,
      questionIndex: isLastQuestion
        ? session.questionIndex
        : session.questionIndex + 1,
      completed: isLastQuestion,
    };

    saveInterviewSession(nextSession);
    saveInterviewFeedback(null);

    navigate("/student/ai-practice/topic-theory/interview");
  };

  return (
    <Sidebar>
      <PageShell max="max-w-[1050px]">
        <StudentPageHeader
          title="Interview Feedback"
          subtitle="Review your answer, strengthen your explanation and continue the interview."
        />

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <BackLink to="/student/ai-practice">Interview Prep</BackLink>

          <span className="rounded-lg bg-[#FFF1D0] px-3 py-1.5 text-[10px] font-extrabold tracking-wide text-[#936400]">
            QUESTION{" "}
            {session?.questionIndex != null
              ? session.questionIndex + 1
              : 1}{" "}
            OF {session?.questions?.length || 10}
          </span>
        </div>

        <Card className="mt-4 p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <IconBadge icon={Brain} size="lg" />

            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-extrabold tracking-[0.14em] text-[#B07A06]">
                COURSE-SPECIFIC INTERVIEW
              </p>

              <h1 className="mt-1 text-xl font-extrabold text-[#06424B] sm:text-2xl">
                {state?.title || "Interview response"}
              </h1>
            </div>
          </div>

          {question?.text && (
            <div className="mt-6 rounded-xl border-l-4 border-[#FFAB0B] bg-[#F0F5F4] p-4">
              <p className="text-[9px] font-extrabold tracking-[0.14em] text-[#A17A22]">
                INTERVIEW QUESTION · {question.difficulty || "MIXED"}
              </p>

              <p className="mt-2 text-sm font-semibold leading-7 text-[#06424B]">
                {question.text}
              </p>
            </div>
          )}

          <div className="mt-5 rounded-2xl border border-[#DCE7E5] bg-white p-5">
            <div className="flex items-center gap-2 text-xs font-extrabold tracking-[0.12em] text-[#527477]">
              <MessageSquareText size={15} />
              YOUR ANSWER TRANSCRIPT
            </div>

            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#3F5C60]">
              {state?.answer ||
                "No transcript was submitted for this question."}
            </p>
          </div>

          {feedback && (
            <div className="mt-5">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E9F5ED] text-[#39765D]">
                  <CheckCircle2 size={19} />
                </span>

                <div>
                  <p className="text-[10px] font-extrabold tracking-[0.13em] text-[#39765D]">
                    GUIDED FEEDBACK
                  </p>

                  <h2 className="mt-0.5 text-lg font-extrabold text-[#06424B]">
                    {feedback.title}
                  </h2>
                </div>
              </div>

              <p className="mt-3 text-sm leading-6 text-[#527477]">
                {feedback.summary}
              </p>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-xl bg-[#EEF6F1] p-4">
                  <p className="text-[10px] font-extrabold tracking-[0.12em] text-[#39765D]">
                    RESPONSE NOTE
                  </p>

                  <p className="mt-2 text-xs leading-6 text-[#45666A]">
                    {feedback.strength}
                  </p>
                </div>

                <div className="rounded-xl bg-[#FFF7E5] p-4">
                  <p className="text-[10px] font-extrabold tracking-[0.12em] text-[#9A6D0B]">
                    HOW TO IMPROVE
                  </p>

                  <p className="mt-2 text-xs leading-6 text-[#6F5A31]">
                    {feedback.improvement}
                  </p>
                </div>
              </div>

              {Array.isArray(feedback.referencePoints) &&
                feedback.referencePoints.length > 0 && (
                  <div className="mt-4 rounded-xl border border-[#E2EBE8] p-4">
                    <p className="text-[10px] font-extrabold tracking-[0.12em] text-[#06424B]">
                      TOPIC POINTS TO REVISE
                    </p>

                    <ul className="mt-2 space-y-2">
                      {feedback.referencePoints.map((point, index) => (
                        <li
                          key={`${index}-${String(point).slice(0, 18)}`}
                          className="flex gap-2 text-xs leading-5 text-[#527477]"
                        >
                          <CheckCircle2
                            size={13}
                            className="mt-0.5 shrink-0 text-[#6DA58A]"
                          />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>
          )}

          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-[#E8EEEE] pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-[470px] text-[10px] leading-5 text-[#91A1A2]">
              This is guided frontend feedback based on answer structure and
              the selected topic. Semantic AI evaluation requires the Skill
              Next interview API.
            </p>

            <button
              type="button"
              onClick={continueInterview}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#FFAB0B] px-6 py-3 text-xs font-extrabold text-[#06424B] transition hover:bg-[#FFC13C]"
            >
              {isLastQuestion ? "Finish Interview" : "Next Interview Question"}
              <Sparkles size={15} />
            </button>
          </div>
        </Card>
      </PageShell>
    </Sidebar>
  );
}

function SelfIntroductionFeedback({ state }) {
  const responses = Array.isArray(state?.responses)
    ? state.responses
    : [
        {
          questionNumber: 1,
          question: state?.question || "Please introduce yourself.",
          answer: state?.answer || "",
          skipped: Boolean(state?.skipped),
        },
      ];

  const totalQuestions = state?.totalQuestions || 10;

  const answeredCount = responses.filter(
    (response) => !response.skipped && response.answer?.trim()
  ).length;

  const skippedCount = responses.filter(
    (response) => response.skipped
  ).length;

  return (
    <Sidebar>
      <PageShell max="max-w-[1050px]">
        <StudentPageHeader
          title="Interview Feedback"
          subtitle="Review all your answers from the common HR interview practice."
        />

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <BackLink to="/student/ai-practice">Interview Prep</BackLink>

          <span className="rounded-lg bg-[#FFF1D0] px-3 py-1.5 text-[10px] font-extrabold tracking-wide text-[#936400]">
            HR INTERVIEW COMPLETED
          </span>
        </div>

        <Card className="mt-4 p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <IconBadge icon={Brain} size="lg" />

            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-extrabold tracking-[0.14em] text-[#B07A06]">
                COMMON SELF-INTRODUCTION
              </p>

              <h1 className="mt-1 text-xl font-extrabold text-[#06424B] sm:text-2xl">
                {state?.title || "Common HR Interview Feedback"}
              </h1>
            </div>
          </div>

          <p className="mt-3 text-sm leading-6 text-[#527477]">
            {state?.note ||
              "Your HR interview practice is complete. Review your answers and skipped questions below."}
          </p>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-[#DCE7E5] bg-[#F7FAF9] p-4">
              <p className="text-[10px] font-extrabold tracking-[0.12em] text-[#527477]">
                TOTAL QUESTIONS
              </p>

              <p className="mt-2 text-2xl font-extrabold text-[#06424B]">
                {totalQuestions}
              </p>
            </div>

            <div className="rounded-xl border border-[#DCE7E5] bg-[#EEF6F1] p-4">
              <p className="text-[10px] font-extrabold tracking-[0.12em] text-[#39765D]">
                ANSWERED
              </p>

              <p className="mt-2 text-2xl font-extrabold text-[#39765D]">
                {answeredCount}
              </p>
            </div>

            <div className="rounded-xl border border-[#F1DFB6] bg-[#FFFAEE] p-4">
              <p className="text-[10px] font-extrabold tracking-[0.12em] text-[#9A6D0B]">
                SKIPPED
              </p>

              <p className="mt-2 text-2xl font-extrabold text-[#9A6D0B]">
                {skippedCount}
              </p>
            </div>
          </div>

          <div className="mt-7">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-extrabold text-[#06424B]">
                Your interview responses
              </h2>

              <span className="text-[10px] font-bold text-[#829596]">
                {responses.length} / {totalQuestions} reviewed
              </span>
            </div>

            <div className="mt-4 space-y-4">
              {responses.map((response, index) => {
                const skipped = response.skipped;
                const hasAnswer = Boolean(response.answer?.trim());

                return (
                  <div
                    key={`${response.questionNumber || index + 1}-${index}`}
                    className="rounded-2xl border border-[#DCE7E5] bg-white p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EAF3F2] text-xs font-extrabold text-[#06424B]">
                          {response.questionNumber || index + 1}
                        </span>

                        <div className="min-w-0">
                          <p className="text-[10px] font-extrabold tracking-[0.12em] text-[#B07A06]">
                            QUESTION {response.questionNumber || index + 1}
                          </p>

                          <h3 className="mt-1 text-sm font-bold leading-6 text-[#06424B]">
                            {response.question}
                          </h3>
                        </div>
                      </div>

                      {skipped ? (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#FFF1D0] px-3 py-1.5 text-[10px] font-bold text-[#936400]">
                          <XCircle size={12} />
                          Skipped
                        </span>
                      ) : (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#EAF5EF] px-3 py-1.5 text-[10px] font-bold text-[#39765D]">
                          <CheckCircle2 size={12} />
                          Answered
                        </span>
                      )}
                    </div>

                    <div className="mt-4 rounded-xl bg-[#F5F8F7] p-4">
                      <div className="flex items-center gap-2 text-[10px] font-extrabold tracking-[0.12em] text-[#527477]">
                        <MessageSquareText size={14} />
                        YOUR ANSWER
                      </div>

                      <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[#3F5C60]">
                        {hasAnswer
                          ? response.answer
                          : "No answer was submitted for this question."}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Note icon={MessageSquareText} className="mt-6">
            This page displays your submitted transcripts and completion
            details. Automated scoring, answer-quality analysis and
            personalised AI feedback require the Skill Next evaluation API.
          </Note>

          <div className="mt-6 flex flex-wrap gap-3 border-t border-[#E8EEEE] pt-5">
            <LinkButton
              to="/student/ai-practice/self-introduction"
              variant="outline"
            >
              Practise again
            </LinkButton>

            <LinkButton to="/student/dashboard" icon={CheckCircle2}>
              Dashboard
            </LinkButton>
          </div>
        </Card>
      </PageShell>
    </Sidebar>
  );
}

function AIFeedback() {
  const location = useLocation();
  const state = location.state || readInterviewFeedback();

  if (state?.mode === "topic-interview") {
    return <TopicInterviewFeedback state={state} />;
  }

  if (
    state?.mode === "self-introduction" &&
    Array.isArray(state?.responses)
  ) {
    return <SelfIntroductionFeedback state={state} />;
  }

  return (
    <Sidebar>
      <PageShell max="max-w-[950px]">
        <StudentPageHeader
          title="Practice Feedback"
          subtitle="Review the submitted response and evaluation status."
        />

        <BackLink to="/student/ai-practice">AI Practice</BackLink>

        <Card className="p-6 sm:p-8">
          <IconBadge icon={Brain} size="lg" />

          <h1 className="mt-4 text-2xl font-extrabold text-[#06424B]">
            {state?.title || "Practice response"}
          </h1>

          {state?.question && (
            <p className="mt-3 text-[15px] font-semibold leading-7 text-[#2F4A4E]">
              {state.question}
            </p>
          )}

          <p className="mt-2 text-[15px] leading-7 text-[#4F6B6F]">
            {state?.note ||
              "The AI evaluation service has not been connected yet."}
          </p>

          {state?.answer && (
            <div className="mt-5 rounded-2xl bg-[#F0F7F6] p-5">
              <p className="text-sm font-bold text-[#06424B]">
                Your submitted response
              </p>

              <p className="mt-2 whitespace-pre-wrap text-[15px] leading-7 text-[#3F5C60]">
                {state.answer}
              </p>
            </div>
          )}

          <Note icon={MessageSquareText} className="mt-5">
            No score or AI feedback is shown for the common self-introduction
            until its real evaluation API is connected.
          </Note>

          <div className="mt-6 flex flex-wrap gap-3">
            <LinkButton to="/student/ai-practice" variant="outline">
              Practise again
            </LinkButton>

            <LinkButton to="/student/dashboard" icon={CheckCircle2}>
              Dashboard
            </LinkButton>
          </div>
        </Card>
      </PageShell>
    </Sidebar>
  );
}

export default AIFeedback;
