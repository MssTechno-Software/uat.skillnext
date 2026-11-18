import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Check, Gauge, Sparkles, Target, Zap } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

 
import StudentPageHeader from "../../components/student/StudentPageHeader";
import { Card, PageShell, SectionHeading } from "../../components/student/ui";
import { courseCategories, technologies } from "../../data/studentLearningData";
import { useEnrolledCourses } from "../../data/studentCourseEnrollment";
import { buildInterviewQuestions } from "../../data/interviewPrepData";
import { saveInterviewFeedback, saveInterviewSession } from "../../data/interviewPrepSession";

const difficultyOptions = [
  { id: "Easy", title: "Easy", subtitle: "Fundamentals and clear explanations", Icon: BookOpen, surface: "bg-[#EAF5EF]", tone: "text-[#39765D]" },
  { id: "Medium", title: "Medium", subtitle: "Practical application and reasoning", Icon: Gauge, surface: "bg-[#FFF5DE]", tone: "text-[#A87512]" },
  { id: "Hard", title: "Hard", subtitle: "Complex situations and decisions", Icon: Zap, surface: "bg-[#F8EDEA]", tone: "text-[#A9523E]" },
  { id: "Mixed", title: "Mixed", subtitle: "A balanced mix of all difficulty levels", Icon: Sparkles, surface: "bg-[#EAF3F2]", tone: "text-[#06424B]" },
];

function InterviewPrepDifficulty() {
  const navigate = useNavigate();
  const { courseId, topicId } = useParams();
  const { enrolledCourseIds } = useEnrolledCourses();
  const [difficulty, setDifficulty] = useState("Mixed");
  const vocationalCourse = useMemo(
    () => courseCategories.find((item) => item.id === courseId && item.type === "vocational"),
    [courseId]
  );
  const technology = useMemo(
    () => technologies.find((item) => item.id === courseId),
    [courseId]
  );
  const learningCourse = technology || vocationalCourse;
  const topicList = technology?.topics || vocationalCourse?.modules || [];
  const topic = topicList.find((item) => item.id === topicId) || null;
  const enrolled = enrolledCourseIds.includes(courseId);
  const courseName = learningCourse?.name || "";

  useEffect(() => {
    if (!learningCourse || !enrolled || !topic) {
      navigate("/student/ai-practice/topic-theory", { replace: true });
    }
  }, [learningCourse, enrolled, navigate, topic]);

  const startInterview = () => {
    if (!learningCourse || !topic || !enrolled) return;
    const questions = buildInterviewQuestions({ courseName, topic, difficulty });
    saveInterviewFeedback(null);
    saveInterviewSession({
      courseId,
      courseName,
      technologyId: technology?.id || "",
      technologyName: technology?.name || "",
      topicId,
      topicTitle: topic.title,
      difficulty,
      questions,
      questionIndex: 0,
      responses: [],
      completed: false,
      startedAt: new Date().toISOString(),
    });
    navigate("/student/ai-practice/topic-theory/interview");
  };

  if (!learningCourse || !enrolled || !topic) return null;

  return (
    
      <PageShell max="max-w-[1400px]">
        <StudentPageHeader
          title="Refine Your Focus"
          subtitle="Select the interview difficulty before starting your course-specific theory practice."
        />

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#DCE6E5] bg-white px-4 py-3 shadow-sm">
          <div className="min-w-0">
            <p className="text-[9px] font-extrabold tracking-[0.15em] text-[#B07A06]">INTERVIEW PREP <span className="px-1 text-[#9BAEAD]">›</span> {courseName.toUpperCase()} <span className="px-1 text-[#9BAEAD]">›</span> {topic.title.toUpperCase()}</p>
            <p className="mt-1 text-sm font-bold text-[#06424B]">10 theory questions · One subtopic</p>
          </div>
          <button type="button" onClick={() => navigate(`/student/ai-practice/topic-theory/${courseId}/topics`)} className="inline-flex items-center gap-2 text-xs font-bold text-[#527477] transition hover:text-[#06424B]"><ArrowLeft size={14}/> Change subtopic</button>
        </div>

        <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.8fr)]">
          <section>
            <SectionHeading title="Select difficulty" subtitle="Choose the level that best matches the practice you want." />
            <div className="grid gap-3 sm:grid-cols-2">
              {difficultyOptions.map(({ id, title, subtitle, Icon, surface, tone }) => {
                const active = difficulty === id;
                return (
                  <button key={id} type="button" aria-pressed={active} onClick={() => setDifficulty(id)} className={`relative min-h-[155px] rounded-[18px] border p-5 text-left transition ${active ? "border-[#06424B] bg-[#F1F7F6] shadow-[0_0_0_2px_rgba(6,66,75,0.08)]" : "border-[#DCE6E3] bg-white hover:border-[#A8C1BD] hover:shadow-sm"}`}>
                    <div className="flex items-center justify-between gap-3">
                      <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${surface} ${tone}`}><Icon size={20}/></span>
                      {active && <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#06424B] text-white"><Check size={14}/></span>}
                    </div>
                    <h3 className="mt-4 text-base font-extrabold text-[#06424B]">{title}</h3>
                    <p className="mt-1 text-xs leading-5 text-[#718486]">{subtitle}</p>
                  </button>
                );
              })}
            </div>
          </section>

          <Card className="h-fit p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF3F2] text-[#06424B]"><Target size={22}/></span>
              <div>
                <p className="text-[9px] font-extrabold tracking-[0.15em] text-[#B07A06]">INTERVIEW CONFIGURATION</p>
                <h2 className="text-lg font-extrabold text-[#06424B]">Ready to practise</h2>
              </div>
            </div>
            <div className="mt-5 space-y-3 rounded-xl bg-[#F5F8F7] p-4">
              <div><p className="text-[9px] font-extrabold tracking-wide text-[#829596]">COURSE</p><p className="mt-1 text-sm font-bold text-[#2F4A4E]">{courseName}</p></div>
              <div><p className="text-[9px] font-extrabold tracking-wide text-[#829596]">SUBTOPIC</p><p className="mt-1 text-sm font-bold text-[#2F4A4E]">{topic.title}</p></div>
              <div><p className="text-[9px] font-extrabold tracking-wide text-[#829596]">DIFFICULTY</p><p className="mt-1 inline-flex rounded-lg bg-[#FFAB0B] px-3 py-1.5 text-xs font-extrabold text-[#06424B]">{difficulty}</p></div>
              <div><p className="text-[9px] font-extrabold tracking-wide text-[#829596]">QUESTION FORMAT</p><p className="mt-1 text-sm font-semibold text-[#2F4A4E]">10 open-ended theory questions</p></div>
            </div>
            <button type="button" onClick={startInterview} className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#06424B] px-5 py-3 text-xs font-extrabold text-white shadow-sm transition hover:bg-[#0A515C]">
              Start Interview <ArrowRight size={15}/>
            </button>
          </Card>
        </div>
      </PageShell>
    
  );
}

export default InterviewPrepDifficulty;
