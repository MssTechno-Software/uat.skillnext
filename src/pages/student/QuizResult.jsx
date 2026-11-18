import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  RotateCcw,
  Trophy,
  XCircle,
} from "lucide-react";
import { useLocation } from "react-router-dom";

 
import StudentPageHeader from "../../components/student/StudentPageHeader";
import { Card, LinkButton, PageShell, ProgressBar, SectionHeading } from "../../components/student/ui";
import { courseCategories, myLearningCoursePath, technologies } from "../../data/studentLearningData";

function QuizResult() {
  const { state } = useLocation();
  const result = state || { quizTitle: "Quiz result", score: 0, total: 0, questions: [], answers: {} };
  const percentage = result.percentage ?? (result.total ? Math.round((result.score / result.total) * 100) : 0);
  const isFinalAssignment = result.assessmentType === "final" || Boolean(result.isFinalAssignment);
  const passPercentage = isFinalAssignment ? (result.passPercentage || 80) : null;
  const passed = isFinalAssignment ? (result.passed ?? percentage >= passPercentage) : true;
  const message = isFinalAssignment
    ? passed ? "Course completed!" : "Final assignment not passed yet"
    : "Topic quiz completed!";
  const resultCourse = courseCategories.find((course) => course.id === result.courseId);
  const resultTechnology = technologies.find((technology) => technology.id === result.courseId);
  const coursePath = result.myLearningPath || (
    resultCourse
      ? myLearningCoursePath(resultCourse.id)
      : resultTechnology
        ? myLearningCoursePath(null, resultTechnology.id)
        : "/student/my-learning"
  );

  return (
    
      <PageShell max="max-w-[950px]">
        <StudentPageHeader
          title={isFinalAssignment ? "Final Assignment Results" : "Quiz Results"}
          subtitle="Review your answers, understand your score and continue your learning path."
        />

        <section className={`relative overflow-hidden rounded-3xl p-8 text-center shadow-[0_18px_40px_rgba(6,66,75,0.16)] ${passed ? "bg-gradient-to-br from-[#06424B] to-[#0E6B73]" : "bg-gradient-to-br from-[#40565A] to-[#52676B]"}`}>
          <div className="pointer-events-none absolute -right-16 -top-20 h-[240px] w-[240px] rounded-full border-[34px] border-white/[0.07]" />
          <span className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFAB0B] text-[#06424B]">
            {isFinalAssignment ? passed ? <Award size={32} /> : <XCircle size={30} /> : <Trophy size={32} />}
          </span>
          <h1 className="relative mt-4 text-3xl font-extrabold text-white">{message}</h1>
          <p className="relative mt-1 text-sm text-white/80">{result.quizTitle}</p>
          <p className="relative mt-5 text-[56px] font-extrabold leading-none text-white">
            {result.score}<span className="text-2xl font-semibold text-white/70"> / {result.total}</span>
          </p>
          <p className="relative mt-2 text-base font-bold text-[#FFAB0B]">{percentage}% score</p>
          <ProgressBar value={percentage} className="relative mx-auto mt-4 max-w-[380px] bg-white/20" />
          {isFinalAssignment ? (
            <>
              <p className="relative mt-4 text-xs font-semibold text-white/80">
                Required to pass: {passPercentage}% ({Math.ceil((result.total * passPercentage) / 100)} correct answers)
              </p>
              <span className={`relative mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-extrabold ${passed ? "bg-white/15 text-[#BFF0D9]" : "bg-white/15 text-[#FFE0A0]"}`}>
                {passed ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
                {passed ? "PASSED" : "NOT PASSED"}
              </span>
            </>
          ) : (
            <span className="relative mt-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-extrabold text-[#BFF0D9]">
              <CheckCircle2 size={15} /> TOPIC COMPLETED · NO PASS MARK
            </span>
          )}
        </section>

        {isFinalAssignment && !passed && (
          <Card className="mt-6 border-[#F3D78B] bg-[#FFF9EA] p-5">
            <div className="flex items-start gap-3">
              <XCircle size={19} className="mt-0.5 shrink-0 text-[#94650C]" />
              <div>
                <h2 className="font-extrabold text-[#06424B]">80% is required to earn your certificate</h2>
                <p className="mt-1 text-sm leading-6 text-[#6F5313]">
                  Review the answers below and retake the 15-question final assignment. Your course will be completed and its certificate issued only after you score at least 80%.
                </p>
              </div>
            </div>
          </Card>
        )}

        {isFinalAssignment && passed && (
          <Card className="mt-6 border-[#B9DED2] bg-[#F3FAF7] p-5">
            <div className="flex items-start gap-3">
              <Award size={20} className="mt-0.5 shrink-0 text-[#28765E]" />
              <div>
                <h2 className="font-extrabold text-[#06424B]">Your course certificate has been earned.</h2>
                <p className="mt-1 text-sm leading-6 text-[#4F6B6F]">
                  You achieved the required score in the final assignment. Your course is complete, and the certificate is available on the Certificates page.
                </p>
              </div>
            </div>
          </Card>
        )}

        {!isFinalAssignment && (
          <Card className="mt-6 border-[#B9DED2] bg-[#F3FAF7] p-5">
            <div className="flex items-start gap-3">
              <CheckCircle2 size={19} className="mt-0.5 shrink-0 text-[#28765E]" />
              <div>
                <h2 className="font-extrabold text-[#06424B]">Your topic progress has been saved.</h2>
                <p className="mt-1 text-sm leading-6 text-[#4F6B6F]">
                  Your score is recorded for review, but this 10-question topic quiz has no pass requirement. You can continue to the next topic.
                </p>
              </div>
            </div>
          </Card>
        )}

        <section className="mt-8">
          <SectionHeading title="Answer review" subtitle="See what you selected and why the correct answer is right." />
          <div className="space-y-4">
            {result.questions?.length ? (
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
          {isFinalAssignment && !passed && result.quizSlug && (
            <LinkButton to={`/student/quiz/${result.quizSlug}`} variant="gold" icon={RotateCcw}>Retake Final Assignment</LinkButton>
          )}
          {isFinalAssignment && passed && (
            <LinkButton to="/student/certificates" variant="gold" icon={Award}>View Certificate</LinkButton>
          )}
          {!isFinalAssignment && result.nextPath && (
            <LinkButton to={result.nextPath} variant="gold" iconRight={ArrowRight}>Continue Learning</LinkButton>
          )}
          <LinkButton to={coursePath} variant="outline" icon={ArrowLeft}>Back to My Learning</LinkButton>
          <LinkButton to="/student/my-learning" variant="outline" icon={BookOpen}>My Learning</LinkButton>
        </div>
      </PageShell>
    
  );
}

export default QuizResult;
