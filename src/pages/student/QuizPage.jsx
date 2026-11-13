import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, Send } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import StudentPageHeader from "../../components/student/StudentPageHeader";
import { BackLink, Btn, Card, LinkButton, PageShell, ProgressBar } from"../../components/student/ui";
import { getQuiz } from "../../data/quizData";
import { recordQuizAttempt } from "../../data/studentProgress";

function QuizPage() {
  const navigate = useNavigate();
  const { quizSlug } = useParams();
  const quiz = getQuiz(quizSlug);
  const [answers, setAnswers] = useState({});
  const [index, setIndex] = useState(0);

  if (!quiz) {
    return (
      <Sidebar>
        <PageShell max="max-w-[900px]">
          <Card className="p-8">
            <h1 className="text-xl font-bold text-[#06424B]">Quiz not found</h1>
            <LinkButton to="/student/quizzes" className="mt-4">Back to quizzes</LinkButton>
          </Card>
        </PageShell>
      </Sidebar>
    );
  }

  const questions = quiz.questions;
  const question = questions[index];
  const answeredCount = Object.keys(answers).length;
  const isLast = index === questions.length - 1;

  const handleSubmit = () => {
    const score = questions.filter((item) => answers[item.id] === item.answer).length;
    recordQuizAttempt({ slug: quiz.slug, title: quiz.title, score, total: questions.length });
    navigate("/student/quiz-result", {
      state: { quizSlug: quiz.slug, technologyId: quiz.technologyId, quizTitle: quiz.title, score, total: questions.length, questions, answers },
    });
  };

  return (
    <Sidebar>
      <PageShell max="max-w-[900px]">
        <StudentPageHeader title="Technology Quiz" subtitle="Answer each question, then review your result." />
        <BackLink to="/student/quizzes">Back to quizzes</BackLink>

        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-[#06424B] to-[#0E6B73] px-6 py-6 sm:px-8">
            <p className="text-[11px] font-bold tracking-[1.3px] text-[#FFAB0B]">PRACTICE QUIZ</p>
            <h1 className="mt-1 text-2xl font-extrabold text-white">{quiz.title}</h1>
            <div className="mt-4 flex items-center gap-3">
              <ProgressBar value={((index + 1) / questions.length) * 100} className="flex-1 bg-white/20" />
              <span className="text-sm font-bold text-white">{index + 1} / {questions.length}</span>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <p className="text-xs font-bold tracking-wider text-[#B07A06]">QUESTION {index + 1} OF {questions.length}</p>
            <h2 className="mt-2 text-[22px] font-bold leading-8 text-[#06424B]">{question.question}</h2>

            <div className="mt-6 grid gap-3">
              {question.options.map((option, i) => {
                const selected = answers[question.id] === option;
                return (
                  <label
                    key={option}
                    className={`flex cursor-pointer items-center gap-4 rounded-2xl border-2 px-4 py-4 text-[15px] font-medium transition ${
                      selected
                        ? "border-[#06424B] bg-[#E8F5F3] text-[#06424B] shadow-[0_6px_16px_rgba(6,66,75,0.12)]"
                        : "border-[#DCE9E7] bg-white text-[#2F4A4E] hover:border-[#FFAB0B] hover:bg-[#FFF9EA]"
                    }`}
                  >
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-extrabold ${selected ? "bg-[#06424B] text-[#FFAB0B]" : "bg-[#F0F5F5] text-[#4F6B6F]"}`}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <input
                      type="radio"
                      name={question.id}
                      value={option}
                      checked={selected}
                      onChange={() => setAnswers((old) => ({ ...old, [question.id]: option }))}
                      className="sr-only"
                    />
                    <span className="flex-1">{option}</span>
                    {selected && <CheckCircle2 size={20} className="text-[#06424B]" />}
                  </label>
                );
              })}
            </div>

            {/* question dots */}
            <div className="mt-7 flex flex-wrap items-center gap-2">
              {questions.map((item, i) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Go to question ${i + 1}`}
                  className={`h-9 w-9 rounded-full text-[13px] font-bold transition ${
                    i === index ? "bg-[#06424B] !text-white" : answers[item.id] ? "bg-[#FFAB0B] !text-[#06424B]" : "bg-[#EAF1F0] !text-[#4F6B6F] hover:bg-[#DCE9E7]"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <div className="mt-7 flex flex-col-reverse items-stretch justify-between gap-3 border-t border-[#EAF1F0] pt-6 sm:flex-row sm:items-center">
              <Btn variant="outline" icon={ArrowLeft} disabled={index === 0} onClick={() => setIndex((v) => v - 1)}>Previous</Btn>
              <p className="text-center text-[13px] font-semibold text-[#4F6B6F]">Answered {answeredCount} of {questions.length}</p>
              {isLast ? (
                <Btn variant="gold" iconRight={Send} onClick={handleSubmit} disabled={answeredCount !== questions.length}>Submit quiz</Btn>
              ) : (
                <Btn iconRight={ArrowRight} onClick={() => setIndex((v) => v + 1)}>Next</Btn>
              )}
            </div>
          </div>
        </Card>
      </PageShell>
    </Sidebar>
  );
}

export default QuizPage;
