import {
  ArrowRight,
  BookOpen,
  Code2,
  GraduationCap,
  Scissors,
  ShoppingCart,
  Sparkles,
  Wrench,
  Cpu,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../../components/Sidebar";
import StudentPageHeader from "../../components/student/StudentPageHeader";
import { Card, EmptyState, IconBadge, PageShell, SectionHeading } from "../../components/student/ui";
import { courseCategories, technologies } from "../../data/studentLearningData";
import { useEnrolledCourses } from "../../data/studentCourseEnrollment";

const courseIcons = {
  hairstyling: Scissors,
  welding: Wrench,
  "cnc-toolmaking": Cpu,
  esthetics: Sparkles,
  "it-courses": Code2,
  "pos-training": ShoppingCart,
};

function InterviewPrepCourses() {
  const navigate = useNavigate();
  const { enrolledCourseIds } = useEnrolledCourses();
  const enrolledCourses = [
    ...courseCategories.filter((course) => course.type === "vocational" && enrolledCourseIds.includes(course.id)),
    ...technologies.filter((technology) => enrolledCourseIds.includes(technology.id)).map((technology) => ({
      ...technology,
      prepKind: "technology",
    })),
  ];

  const openCourse = (course) => {
    navigate(`/student/ai-practice/topic-theory/${course.id}/topics`);
  };

  return (
    <Sidebar>
      <PageShell max="max-w-[1400px]">
        <StudentPageHeader
          title="Course-Specific Interview Prep"
          subtitle="Choose a course you have enrolled in, select a subtopic and practise explaining your knowledge."
        />

        <section className="relative mt-5 overflow-hidden rounded-[22px] bg-[#06424B] px-6 py-7 text-white shadow-[0_10px_28px_rgba(6,66,75,0.12)] sm:px-8">
          <div className="pointer-events-none absolute -right-14 -top-20 h-56 w-56 rounded-full border-[28px] border-white/[0.05]" />
          <div className="pointer-events-none absolute -right-4 -bottom-20 h-44 w-44 rounded-full bg-[#FFAB0B]/10 blur-2xl" />
          <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div className="max-w-[760px]">
              <p className="flex items-center gap-2 text-[10px] font-extrabold tracking-[0.16em] text-[#FFAB0B]">
                <Sparkles size={13} /> SKILL NEXT · INTERVIEW PREPARATION
              </p>
              <h2 className="mt-2 text-2xl font-extrabold leading-tight sm:text-3xl">Practise what you have learned</h2>
              <p className="mt-3 text-sm leading-7 text-white/75">
                Your interview practice is based on the courses in My Learning. Choose one course and focus on a single subtopic at a time.
              </p>
            </div>
            <div className="hidden h-[92px] w-[92px] shrink-0 items-center justify-center rounded-[25px] border border-white/10 bg-white/[0.08] text-[#FFAB0B] sm:flex">
              <GraduationCap size={44} strokeWidth={1.5} />
            </div>
          </div>
        </section>

        <section className="mt-7">
          <SectionHeading
            title="Your enrolled courses"
            subtitle="Select the course you want to prepare for. Only enrolled courses are shown here."
            right={<span className="rounded-lg border border-[#DCE7E5] bg-white px-3 py-2 text-[10px] font-extrabold tracking-wide text-[#527477]">{enrolledCourses.length} ENROLLED</span>}
          />

          {enrolledCourses.length === 0 ? (
            <Card className="p-6 sm:p-9">
              <EmptyState
                icon={BookOpen}
                title="No enrolled courses yet"
                text="Add a course to My Learning first. Your enrolled courses will appear here automatically for interview practice."
                action={(
                  <button
                    type="button"
                    onClick={() => navigate("/student/topics")}
                    className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#FFAB0B] px-5 py-3 text-xs font-extrabold text-[#06424B] transition hover:bg-[#FFC13C]"
                  >
                    Explore Courses <ArrowRight size={15}/>
                  </button>
                )}
              />
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {enrolledCourses.map((course, index) => {
                const Icon = courseIcons[course.id] || BookOpen;
                const isTechnology = course.prepKind === "technology";
                const itemCount = isTechnology ? course.topics?.length || 0 : course.modules?.length || 0;
                const itemLabel = "subtopics";
                return (
                  <button
                    key={course.id}
                    type="button"
                    onClick={() => openCourse(course)}
                    className="group flex min-h-[220px] flex-col overflow-hidden rounded-[19px] border border-[#DCE6E3] bg-white text-left shadow-[0_3px_12px_rgba(6,66,75,0.04)] transition duration-200 hover:-translate-y-1 hover:border-[#C5A45D] hover:shadow-[0_14px_30px_rgba(6,66,75,0.10)] focus:outline-none focus:ring-2 focus:ring-[#06424B]/20"
                  >
                    <div className={`relative w-full px-5 py-5 ${index % 2 === 0 ? "bg-[#06424B]" : "bg-[#52676B]"}`}>
                      <div className="pointer-events-none absolute -right-6 -top-10 h-32 w-32 rounded-full border-[18px] border-white/[0.07]" />
                      <div className="relative flex items-start justify-between gap-3">
                        <span className="flex h-12 w-12 items-center justify-center rounded-[14px] border border-white/10 bg-white/10 text-[#FFAB0B]">
                          <Icon size={24} strokeWidth={1.8}/>
                        </span>
                        <span className="rounded-lg bg-[#FFAB0B] px-3 py-1.5 text-[9px] font-extrabold tracking-wide text-[#06424B]">ENROLLED</span>
                      </div>
                      <div className="relative mt-4">
                        <p className="text-[9px] font-extrabold tracking-[0.15em] text-white/65">{course.category?.toUpperCase()}</p>
                        <h3 className="mt-1 text-xl font-extrabold text-white">{course.name}</h3>
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <p className="text-xs leading-6 text-[#718486]">{course.description}</p>
                      <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                        <span className="text-[11px] font-semibold text-[#527477]">{itemCount} {itemLabel}</span>
                        <span className="inline-flex items-center gap-2 rounded-xl bg-[#FFAB0B] px-3.5 py-2.5 text-[10px] font-extrabold text-[#06424B] transition group-hover:bg-[#FFC13C]">
                          Choose course <ArrowRight size={14}/>
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </PageShell>
    </Sidebar>
  );
}

export default InterviewPrepCourses;
