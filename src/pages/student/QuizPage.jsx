import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, LockKeyhole, Send, XCircle } from "lucide-react";

import StudentPageHeader from "../../components/student/StudentPageHeader";
import { BackLink, Btn, Card, LinkButton, PageShell, ProgressBar } from "../../components/student/ui";
import { getQuiz } from "../../data/quizData";
import { courseCategories, myLearningCoursePath, technologies } from "../../data/studentLearningData";
import { useEnrolledCourses } from "../../data/studentCourseEnrollment";
import {
  completeCourseFinal,
  completeLearningUnit,
  hasReadLesson,
  courseProgress,
  recordQuizAttempt,
  technologyProgress,
  useProgress,
} from "../../data/studentProgress";

function QuizPage() {
  const navigate = useNavigate();
  const { quizSlug } = useParams();
  const quiz = getQuiz(quizSlug);
  const progress = useProgress();
  const { isEnrolled } = useEnrolledCourses();
  const [answers, setAnswers] = useState({});
  const [index, setIndex] = useState(0);

  if (!quiz) {
    return (
      
        <PageShell max="max-w-[900px]">
          <Card className="p-8">
            <h1 className="text-xl font-bold text-[#06424B]">Quiz not found</h1>
            <LinkButton to="/student/quizzes" className="mt-4">Back to quizzes</LinkButton>
          </Card>
        </PageShell>
      
    );
  }

  const courseCategory = courseCategories.find((course) => course.id === quiz.courseId);
  const vocationalCourse = courseCategory?.type === "vocational" ? courseCategory : null;
  const technology = technologies.find((item) => item.id === quiz.courseId);
  const isFinalAssignment = quiz.assessmentType === "final" || Boolean(quiz.isFinalAssignment);
  const isTopicQuiz = quiz.assessmentType === "module" || quiz.assessmentType === "topic";
  const parentCourseEnrolled = vocationalCourse
    ? isEnrolled(vocationalCourse.id)
    : technology
      ? isEnrolled(technology.id)
      : true;
  const learningWorkspacePath = vocationalCourse
    ? myLearningCoursePath(vocationalCourse.id)
    : technology
      ? myLearningCoursePath(null, technology.id)
      : "/student/my-learning";

  const courseStats = vocationalCourse
    ? courseProgress(progress, vocationalCourse)
    : technology
      ? technologyProgress(progress, technology)
      : null;
  const finalUnlocked = !isFinalAssignment || Boolean(courseStats && courseStats.total > 0 && courseStats.done === courseStats.total);
  const lessonUnitId = quiz.moduleId || quiz.topicId || null;
  const lessonContentRead = !isTopicQuiz || !lessonUnitId || hasReadLesson(progress, quiz.courseId, lessonUnitId);
  const topicAlreadyCompleted = isTopicQuiz && Boolean(progress.completed[`${quiz.courseId}/${lessonUnitId}`]);
  const finalAlreadyCompleted = isFinalAssignment && Boolean(progress.completedCourses?.[quiz.courseId]);
  const unitUnlocked = (() => {
    if (quiz.assessmentType === "module" && vocationalCourse) {
      const unitIndex = vocationalCourse.modules.findIndex((module) => module.id === quiz.moduleId);
      const previousModule = vocationalCourse.modules[unitIndex - 1];
      return !previousModule || Boolean(progress.completed[`${vocationalCourse.id}/${previousModule.id}`]);
    }
    if (quiz.assessmentType === "topic" && technology) {
      const topicIndex = technology.topics.findIndex((topic) => topic.id === quiz.topicId);
      const previousTopic = technology.topics[topicIndex - 1];
      return !previousTopic || Boolean(progress.completed[`${technology.id}/${previousTopic.id}`]);
    }
    return true;
  })();

  if (!parentCourseEnrolled || !finalUnlocked || !unitUnlocked || !lessonContentRead) {
    return (
      
        <PageShell max="max-w-[900px]">
          <Card className="p-8 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF1D1] text-[#94650C]"><LockKeyhole size={25} /></span>
            <h1 className="mt-4 text-xl font-bold text-[#06424B]">Assessment is locked</h1>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#5A7478]">
              {!parentCourseEnrolled
                ? "Add this course to My Learning before starting its assessments."
                : !unitUnlocked
                  ? "Complete the previous topic's 10-question quiz before starting this one. Your score does not block progression."
                  : !lessonContentRead
                    ? "Read the complete lesson content in this course and use the Mark as read action at the end of the lesson before starting its quiz."
                    : "Complete every topic quiz in this learning path before attempting the final assignment."}
            </p>
            <LinkButton to={learningWorkspacePath} className="mt-5">Go to My Learning</LinkButton>
          </Card>
        </PageShell>
      
    );
  }

  if (topicAlreadyCompleted || finalAlreadyCompleted) {
    return (
      
        <PageShell max="max-w-[900px]">
          <Card className="p-8 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF5EF] text-[#28765E]">
              <CheckCircle2 size={26} />
            </span>
            <h1 className="mt-4 text-xl font-extrabold text-[#06424B]">
              {finalAlreadyCompleted ? "Final assignment completed" : "Topic quiz completed"}
            </h1>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#5A7478]">
              {finalAlreadyCompleted
                ? "This course has already met the final-assignment requirement. Your certificate is available from the Certificates page."
                : "This topic's 10-question quiz has already been completed. Continue to the next topic from your course workspace."}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {finalAlreadyCompleted && (
                <LinkButton to="/student/certificates" variant="gold">View Certificate</LinkButton>
              )}
              <LinkButton to={learningWorkspacePath} variant={finalAlreadyCompleted ? "outline" : "gold"}>
                Back to My Learning
              </LinkButton>
            </div>
          </Card>
        </PageShell>
      
    );
  }

  const questions = quiz.questions;
  const question = questions[index];
  const answeredCount = Object.keys(answers).length;
  const isLast = index === questions.length - 1;
  const passPercentage = isFinalAssignment ? (quiz.passPercentage || 80) : null;
  const selectedAnswer = answers[question.id];
  const answerRevealed = isTopicQuiz && selectedAnswer !== undefined;
  const answerIsCorrect = selectedAnswer === question.answer;

  const handleAnswer = (option) => {
    if (answerRevealed) return;
    setAnswers((current) => ({ ...current, [question.id]: option }));
  };

  const handleSubmit = () => {
    const score = questions.filter((item) => answers[item.id] === item.answer).length;
    const percentage = Math.round((score / questions.length) * 100);
    const passed = isFinalAssignment ? percentage >= passPercentage : true;

    recordQuizAttempt({
      slug: quiz.slug,
      title: quiz.title,
      score,
      total: questions.length,
      courseId: quiz.courseId,
      unitId: quiz.moduleId || quiz.topicId || null,
      assessmentType: quiz.assessmentType,
    });

    if (isTopicQuiz) {
      // Topic quizzes are learning checkpoints, not pass/fail assessments.
      // Completing all 10 questions marks the unit complete regardless of score.
      completeLearningUnit(quiz.courseId, quiz.moduleId || quiz.topicId);
    } else if (isFinalAssignment && passed) {
      // Only the final assignment has an 80% pass requirement and issues course completion.
      completeCourseFinal(quiz.courseId);
    }

    navigate("/student/quiz-result", {
      state: {
        quizSlug: quiz.slug,
        quizTitle: quiz.title,
        courseId: quiz.courseId || null,
        courseName: quiz.courseName || null,
        moduleId: quiz.moduleId || null,
        topicId: quiz.topicId || null,
        assessmentType: quiz.assessmentType || "practice",
        isFinalAssignment,
        passPercentage,
        passed,
        score,
        total: questions.length,
        percentage,
        questions,
        answers,
        nextPath: passed ? quiz.nextPath : null,
        myLearningPath: learningWorkspacePath,
      },
    });
  };

  return (
    
      <PageShell max="max-w-[900px]">
        <StudentPageHeader
          title={isFinalAssignment ? "Final Course Assignment" : "Topic Quiz"}
          subtitle={isFinalAssignment
            ? "Complete the 15-question final assignment. You need at least 80% to earn your course certificate."
            : "Answer all 10 questions. See whether each answer is correct or incorrect immediately, then continue to the next topic."}
        />
        <BackLink to={learningWorkspacePath}>Back to My Learning</BackLink>

        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-[#06424B] to-[#0E6B73] px-6 py-6 sm:px-8">
            <p className="text-[11px] font-bold tracking-[1.3px] text-[#FFAB0B]">
              {isFinalAssignment ? "FINAL ASSIGNMENT" : "TOPIC KNOWLEDGE CHECK"}
            </p>
            <h1 className="mt-1 text-2xl font-extrabold text-white">{quiz.title}</h1>
            <p className="mt-2 text-xs leading-5 text-white/70">{quiz.description}</p>
            <div className="mt-4 flex items-center gap-3">
              <ProgressBar value={((index + 1) / questions.length) * 100} className="flex-1 bg-white/20" />
              <span className="text-sm font-bold text-white">{index + 1} / {questions.length}</span>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-bold tracking-wider text-[#B07A06]">QUESTION {index + 1} OF {questions.length}</p>
              {isFinalAssignment ? (
                <span className="rounded-full bg-[#FFF4D9] px-3 py-1 text-[10px] font-extrabold text-[#8A5700]">80% required to pass</span>
              ) : (
                <span className="rounded-full bg-[#EAF4F2] px-3 py-1 text-[10px] font-extrabold text-[#376C68]">Feedback after each answer</span>
              )}
            </div>
            <h2 className="mt-2 text-[22px] font-bold leading-8 text-[#06424B]">{question.question}</h2>

            <div className="mt-6 grid gap-3">
              {question.options.map((option, optionIndex) => {
                const selected = selectedAnswer === option;
                const correctOption = option === question.answer;
                const revealed = answerRevealed;
                const optionTheme = revealed
                  ? correctOption
                    ? "border-[#8CCDB7] bg-[#F0FAF5] text-[#176B51]"
                    : selected
                      ? "border-[#E8B2A9] bg-[#FFF4F1] text-[#A33B2B]"
                      : "border-[#E8EEEE] bg-[#FAFCFC] text-[#8A9B9D]"
                  : selected
                    ? "border-[#06424B] bg-[#E8F5F3] text-[#06424B] shadow-[0_6px_16px_rgba(6,66,75,0.12)]"
                    : "border-[#DCE9E7] bg-white text-[#2F4A4E] hover:border-[#FFAB0B] hover:bg-[#FFF9EA]";

                return (
                  <label
                    key={`${question.id}-${optionIndex}`}
                    className={`flex items-center gap-4 rounded-2xl border-2 px-4 py-4 text-[15px] font-medium transition ${revealed ? "cursor-default" : "cursor-pointer"} ${optionTheme}`}
                  >
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-extrabold ${revealed && correctOption ? "bg-[#176B51] text-white" : revealed && selected ? "bg-[#A33B2B] text-white" : selected ? "bg-[#06424B] text-[#FFAB0B]" : "bg-[#F0F5F5] text-[#4F6B6F]"}`}>
                      {revealed && correctOption ? <CheckCircle2 size={18} /> : revealed && selected ? <XCircle size={18} /> : String.fromCharCode(65 + optionIndex)}
                    </span>
                    <input
                      type="radio"
                      name={question.id}
                      value={option}
                      checked={selected}
                      disabled={revealed}
                      onChange={() => handleAnswer(option)}
                      className="sr-only"
                    />
                    <span className="flex-1">{option}</span>
                    {revealed && correctOption && <CheckCircle2 size={19} className="shrink-0 text-[#28765E]" />}
                  </label>
                );
              })}
            </div>

            {answerRevealed && (
              <div className={`mt-5 rounded-2xl border p-4 ${answerIsCorrect ? "border-[#B9DED2] bg-[#F3FAF7]" : "border-[#F0C9C2] bg-[#FFF7F5]"}`}>
                <div className="flex items-start gap-3">
                  {answerIsCorrect
                    ? <CheckCircle2 size={21} className="mt-0.5 shrink-0 text-[#28765E]" />
                    : <XCircle size={21} className="mt-0.5 shrink-0 text-[#B94B3B]" />}
                  <div>
                    <h3 className={`text-sm font-extrabold ${answerIsCorrect ? "text-[#176B51]" : "text-[#A33B2B]"}`}>
                      {answerIsCorrect ? "Correct answer" : "Incorrect answer"}
                    </h3>
                    {!answerIsCorrect && <p className="mt-1 text-sm font-semibold text-[#06424B]">Correct answer: {question.answer}</p>}
                    {question.explanation && <p className="mt-2 text-sm leading-6 text-[#526D71]">{question.explanation}</p>}
                    <p className="mt-2 text-[11px] font-semibold text-[#6F8588]">Your score will be recorded, but this topic quiz has no pass mark. You can continue after answering all 10 questions.</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-7 flex flex-wrap items-center gap-2">
              {questions.map((item, questionIndex) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setIndex(questionIndex)}
                  aria-label={`Go to question ${questionIndex + 1}`}
                  className={`h-9 w-9 rounded-full text-[13px] font-bold transition ${
                    questionIndex === index
                      ? "bg-[#06424B] !text-white"
                      : answers[item.id] !== undefined
                        ? "bg-[#FFAB0B] !text-[#06424B]"
                        : "bg-[#EAF1F0] !text-[#4F6B6F] hover:bg-[#DCE9E7]"
                  }`}
                >
                  {questionIndex + 1}
                </button>
              ))}
            </div>

            <div className="mt-7 flex flex-col-reverse items-stretch justify-between gap-3 border-t border-[#EAF1F0] pt-6 sm:flex-row sm:items-center">
              <Btn variant="outline" icon={ArrowLeft} disabled={index === 0} onClick={() => setIndex((value) => value - 1)}>Previous</Btn>
              <p className="text-center text-[13px] font-semibold text-[#4F6B6F]">Answered {answeredCount} of {questions.length}</p>
              {isLast ? (
                <Btn variant="gold" iconRight={Send} onClick={handleSubmit} disabled={answeredCount !== questions.length}>Submit {isFinalAssignment ? "Final Assignment" : "Quiz"}</Btn>
              ) : (
                <Btn iconRight={ArrowRight} onClick={() => setIndex((value) => value + 1)} disabled={isTopicQuiz && !answerRevealed}>Next Question</Btn>
              )}
            </div>
          </div>
        </Card>
      </PageShell>
    
  );
}

export default QuizPage;
