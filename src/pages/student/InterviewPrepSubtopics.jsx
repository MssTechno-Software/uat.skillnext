import { translateValue } from "../../i18n";
import { useEffect } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Braces, Code2, Database, Globe, Layers } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

 
import StudentPageHeader from "../../components/student/StudentPageHeader";
import { Card, IconBadge, PageShell, SectionHeading } from "../../components/student/ui";
import { courseCategories, technologies } from "../../data/studentLearningData";
import { useEnrolledCourses } from "../../data/studentCourseEnrollment";

const technologyIcons = {
  react: Layers,
  python: Braces,
  javascript: Code2,
  java: Code2,
  sql: Database,
  "html-css": Globe,
};

function InterviewPrepSubtopics() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { enrolledCourseIds } = useEnrolledCourses();

  const vocationalCourse = courseCategories.find(
    (item) => item.id === courseId && item.type === "vocational"
  );
  const technology = technologies.find((item) => item.id === courseId);
  const isEnrolled = enrolledCourseIds.includes(courseId);
  const topics = technology?.topics || vocationalCourse?.modules || [];
  const courseName = technology?.name || vocationalCourse?.name || "";

  useEffect(() => {
    if (!technology && !vocationalCourse) {
      navigate("/student/ai-practice/topic-theory", { replace: true });
      return;
    }
    if (!isEnrolled) navigate("/student/ai-practice/topic-theory", { replace: true });
  }, [technology, vocationalCourse, isEnrolled, navigate]);

  const selectTopic = (topic) => {
    navigate(`/student/ai-practice/topic-theory/${courseId}/topic/${topic.id}/difficulty`);
  };

  if ((!technology && !vocationalCourse) || !isEnrolled) return null;

  return (
    
      <PageShell max="max-w-[1400px]">
        <StudentPageHeader
          title={translateValue(technology ? "Choose a Topic" : "Choose a Subtopic")}
          subtitle={translateValue("Choose one focused {{course}} area for your theory interview practice.", { course: translateValue(courseName) })}
        />

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#DCE6E5] bg-white px-4 py-3 shadow-sm">
          <div className="min-w-0">
            <p className="text-[9px] font-extrabold tracking-[0.15em] text-[#B07A06]">{translateValue("INTERVIEW PREP")}{" "}<span className="px-1 text-[#9BAEAD]">{translateValue("›")}</span> {translateValue(courseName).toUpperCase()}</p>
            <p className="mt-1 text-sm font-bold text-[#06424B]">{translateValue(topics.length)} {translateValue("available topics · 10 interview questions per topic")}</p>
          </div>
          <button type="button" onClick={() => navigate("/student/ai-practice/topic-theory")} className="inline-flex items-center gap-2 text-xs font-bold text-[#527477] transition hover:text-[#06424B]"><ArrowLeft size={14}/> {translateValue("Change course")}</button>
        </div>

        <section className="mt-7">
          <SectionHeading title={translateValue("Select a subtopic")} subtitle={translateValue("Choose the area you want the AI interviewer to focus on. The selected topic and difficulty will be carried into your interview.")} />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {topics.map((topic, index) => {
              const Icon = technology ? technologyIcons[technology.id] || Code2 : BookOpen;
              const summary = topic.summary || topic.description || topic.overview;
              return (
                <button key={topic.id} type="button" onClick={() => selectTopic(topic)} className="group flex min-h-[190px] flex-col rounded-[19px] border border-[#DCE6E3] bg-white p-5 text-left shadow-[0_3px_12px_rgba(6,66,75,0.035)] transition duration-200 hover:-translate-y-1 hover:border-[#C5A45D] hover:shadow-[0_12px_26px_rgba(6,66,75,0.09)] focus:outline-none focus:ring-2 focus:ring-[#06424B]/20">
                  <div className="flex items-center justify-between gap-3">
                    <IconBadge icon={Icon} tone={index % 2 === 0 ? "teal" : "gold"} />
                    <span className="text-[10px] font-extrabold tracking-wide text-[#9AAEAF]">{translateValue("TOPIC")}{" "}{translateValue(String(index + 1).padStart(2, "0"))}</span>
                  </div>
                  <h3 className="mt-4 text-base font-extrabold text-[#06424B]">{translateValue(topic.title)}</h3>
                  <p className="mt-2 flex-1 text-xs leading-6 text-[#718486]">{translateValue(summary)}</p>
                  <div className="mt-4 flex items-center justify-between border-t border-[#EAF0EE] pt-3">
                    <span className="text-[10px] font-bold text-[#527477]">{translateValue("10 theory questions")}</span>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-[#06424B] transition group-hover:text-[#A87512]">{translateValue("Select topic")}{" "}<ArrowRight size={14}/></span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </PageShell>
    
  );
}

export default InterviewPrepSubtopics;
