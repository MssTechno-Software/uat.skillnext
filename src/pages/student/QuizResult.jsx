import { ArrowLeft, BookOpen, CheckCircle2, RotateCcw, Trophy, XCircle } from "lucide-react";
import { useLocation } from "react-router-dom";
import StudentSidebar from "../../components/student/StudentSidebar";
import StudentPageHeader from "../../components/student/StudentPageHeader";
import { Card, LinkButton, PageShell, ProgressBar, SectionHeading } from"../../components/student/ui";

function QuizResult() {
  const { state } = useLocation();
  const result = state || { quizTitle: "Quiz result", score: 0, total: 0, questions: [], answers: {} };
  const percentage = result.total ? Math.round((result.score / result.total) * 100) : 0;
  const message = percentage >= 80 ? "Excellent work!" : percentage >= 60 ? "Good job – keep going!" : "Keep practising – you will get there!";

  return (
    <StudentSidebar>
      <PageShell max="max-w-[950px]">
        <StudentPageHeader title="Quiz Results" subtitle="Review your answers and the explanations." />

        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#06424B] to-[#0E6B73] p-8 text-center shadow-[0_18px_40px_rgba(6,66,75,0.2)]">
          <div className="pointer-events-none absolute -right-16 -top-20 h-[240px] w-[240px] rounded-full border-[34px] border-white/[0.07]" />
          <span className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFAB0B] text-[#06424B]"><Trophy size={32} /></span>
          <h1 className="relative mt-4 text-3xl font-extrabold text-white">{message}</h1>
          <p className="relative mt-1 text-sm text-white/80">{result.quizTitle}</p>
          <p className="relative mt-5 text-[56px] font-extrabold leading-none text-white">{result.score}<span className="text-2xl font-semibold text-white/70"> / {result.total}</span></p>
          <p className="relative mt-2 text-base font-bold text-[#FFAB0B]">{percentage}% score</p>
          <ProgressBar value={percentage} className="relative mx-auto mt-4 max-w-[380px] bg-white/20" />
        </section>

        <section className="mt-8">
          <SectionHeading title="Answer review" subtitle="See what you chose and why the correct answer is right." />
          <div className="space-y-4">
            {result.questions.length ? (
              result.questions.map((question, index) => {
                const chosen = result.answers?.[question.id];
                const isCorrect = chosen === question.answer;
                return (
                  <Card key={question.id} className={`p-5 sm:p-6 ${isCorrect ? "border-[#A8D9CB] bg-[#F5FBF9]" : "border-[#F0CFA4] bg-[#FFFAF2]"}`}>
                    <div className="flex items-start gap-4">
                      {isCorrect ? <CheckCircle2 size={26} className="mt-0.5 shrink-0 text-[#1E8A6B]" /> : <XCircle size={26} className="mt-0.5 shrink-0 text-[#D9822B]" />}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold tracking-wider text-[#6C8589]">QUESTION {index + 1}</p>
                        <h3 className="mt-1 text-lg font-bold leading-7 text-[#06424B]">{question.question}</h3>
                        <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                          <p className="rounded-xl bg-white px-4 py-2.5 text-[#3F5C60] ring-1 ring-[#E1ECEA]">Your answer: <strong className={isCorrect ? "text-[#1E8A6B]" : "text-[#C46A12]"}>{chosen || "Not answered"}</strong></p>
                          <p className="rounded-xl bg-white px-4 py-2.5 text-[#3F5C60] ring-1 ring-[#E1ECEA]">Correct: <strong className="text-[#06424B]">{question.answer}</strong></p>
                        </div>
                        <p className="mt-3 text-[15px] leading-6 text-[#3F5C60]">{question.explanation}</p>
                      </div>
                    </div>
                  </Card>
                );
              })
            ) : (
              <Card className="border-dashed p-8 text-center text-sm text-[#5A7478]">Open a quiz and submit your answers to see the detailed review.</Card>
            )}
          </div>
        </section>

        <div className="mt-8 flex flex-wrap gap-3">
          <LinkButton to="/student/quizzes" variant="outline" icon={ArrowLeft}>All quizzes</LinkButton>
          {result.quizSlug && <LinkButton to={`/student/quiz/${result.quizSlug}`} variant="gold" icon={RotateCcw}>Retake quiz</LinkButton>}
          <LinkButton to={result.technologyId ? `/student/topics/${result.technologyId}` : "/student/topics"} icon={BookOpen}>Back to lessons</LinkButton>
        </div>
      </PageShell>
    </StudentSidebar>
  );
}

export default QuizResult;
