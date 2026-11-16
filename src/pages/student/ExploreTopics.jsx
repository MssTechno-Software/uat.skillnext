import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Code2,
  Compass,
  Cpu,
  GraduationCap,
  Scissors,
  ShoppingCart,
  Sparkles,
  Wrench,
  Search,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Sidebar from "../../components/Sidebar";
import StudentPageHeader from "../../components/student/StudentPageHeader";
import { PageShell } from "../../components/student/ui";
import { courseCategories, myLearningCoursePath } from "../../data/studentLearningData";
import { useEnrolledCourses } from "../../data/studentCourseEnrollment";
import { courseProgress, useProgress } from "../../data/studentProgress";

const courseIcons = {
  hairstyling: Scissors,
  welding: Wrench,
  "cnc-toolmaking": Cpu,
  esthetics: Sparkles,
  "it-courses": Code2,
  "pos-training": ShoppingCart,
};

const cardThemes = [
  {
    header: "bg-[#06424B]",
    icon: "bg-white/10 text-[#FFAB0B]",
    category: "text-[#D5E7E5]",
    level: "bg-[#FFAB0B] text-[#06424B]",
    decoration: "border-white/[0.08]",
  },
  {
    header: "bg-[#52676B]",
    icon: "bg-white/10 text-[#FFE0A0]",
    category: "text-[#E3ECEB]",
    level: "bg-[#FFE0A0] text-[#40565A]",
    decoration: "border-white/[0.08]",
  },
];

function ExploreTopics() {
  const progress = useProgress();
  const { isEnrolled } = useEnrolledCourses();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCourses = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return courseCategories;

    return courseCategories.filter((course) => {
      const vocationalText = (course.modules || [])
        .flatMap((module) => [module.title, module.description, module.overview])
        .join(" ");
      const technologyText = (course.courses || [])
        .flatMap((technology) => [
          technology.name,
          technology.category,
          technology.description,
          ...(technology.topics || []).flatMap((topic) => [topic.title, topic.summary]),
        ])
        .join(" ");
      const searchableText = [
        course.name,
        course.category,
        course.description,
        course.level,
        course.duration,
        vocationalText,
        technologyText,
      ].join(" ").toLowerCase();

      return searchableText.includes(query);
    });
  }, [searchTerm]);

  return (
    <Sidebar>
      <PageShell>
        <div className="mx-auto w-full max-w-[1250px]">
          <StudentPageHeader
            title="Explore Topics"
            subtitle="Discover career-focused courses, explore the curriculum and build practical skills."
          />

          <section className="relative mt-5 overflow-hidden rounded-[22px] bg-[#06424B] shadow-[0_8px_25px_rgba(6,66,75,0.10)]">
            <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full border-[32px] border-white/[0.045]" />
            <div className="pointer-events-none absolute -right-4 -top-12 h-40 w-40 rounded-full border border-[#FFAB0B]/20" />
            <div className="pointer-events-none absolute -bottom-20 right-[30%] h-44 w-44 rounded-full bg-[#FFAB0B]/[0.07] blur-3xl" />

            <div className="relative z-10 flex flex-col items-start justify-between gap-6 px-6 py-7 sm:px-8 sm:py-8 lg:flex-row lg:items-center lg:px-10">
              <div className="max-w-[650px]">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#FFAB0B]/30 bg-[#FFAB0B]/10 px-3 py-1.5 text-[10px] font-bold tracking-[1.4px] text-[#FFCB65]">
                  <Sparkles size={13} />
                  EXPLORE YOUR NEXT SKILL
                </div>

                <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-3xl lg:text-[36px]">
                  What would you like <span className="text-[#FFAB0B]">to learn?</span>
                </h1>

                <p className="mt-3 max-w-[570px] text-xs leading-6 text-white/70 sm:text-sm sm:leading-7">
                  Choose a course, review what you will learn, add it to your learning space and follow each topic through its lesson and quiz.
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.08] px-3 py-2 text-[11px] font-semibold text-white">
                    <BookOpen size={14} className="text-[#FFAB0B]" />
                    Structured Lessons
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.08] px-3 py-2 text-[11px] font-semibold text-white">
                    <Code2 size={14} className="text-[#FFAB0B]" />
                    Practical Learning
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.08] px-3 py-2 text-[11px] font-semibold text-white">
                    <GraduationCap size={14} className="text-[#FFAB0B]" />
                    Topic Quizzes & Final Assessment
                  </span>
                </div>
              </div>

              <div className="hidden h-[135px] w-[145px] shrink-0 items-center justify-center rounded-[24px] border border-white/10 bg-white/[0.07] lg:flex">
                <div className="relative flex h-[76px] w-[76px] items-center justify-center rounded-[22px] bg-[#FFAB0B] text-[#06424B] shadow-xl">
                  <Compass size={40} strokeWidth={1.6} />
                  <span className="absolute -right-3 -top-3 flex h-9 w-9 items-center justify-center rounded-xl border-2 border-[#06424B] bg-white text-[#06424B]">
                    <Sparkles size={16} />
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-7">
            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-lg font-extrabold tracking-tight text-[#06424B]">Explore Courses</h2>
                <p className="mt-1 text-xs text-[#829596]">Search by course name, skill, category or subtopic.</p>
              </div>
              <span className="hidden rounded-lg border border-[#DCE7E5] bg-white px-3 py-2 text-[10px] font-bold text-[#527477] sm:inline-flex">
                {filteredCourses.length} OF {courseCategories.length} COURSES
              </span>
            </div>

            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative min-w-0 flex-1">
                <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#829596]" />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search courses, technologies or subtopics..."
                  aria-label="Search courses"
                  className="h-12 w-full rounded-xl border border-[#DCE7E5] bg-white pl-11 pr-11 text-sm text-[#29494D] shadow-[0_2px_8px_rgba(6,66,75,0.035)] outline-none transition placeholder:text-[#9AA9AA] focus:border-[#06424B] focus:ring-2 focus:ring-[#06424B]/10"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    aria-label="Clear course search"
                    className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-[#829596] transition hover:bg-[#EEF3F3] hover:text-[#06424B]"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
              <span className="text-[11px] font-medium text-[#829596] sm:px-2">
                {filteredCourses.length} {filteredCourses.length === 1 ? "course found" : "courses found"}
              </span>
            </div>

            {filteredCourses.length === 0 ? (
              <div className="rounded-[19px] border border-dashed border-[#C9DAD8] bg-white px-6 py-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF3F2] text-[#06424B]">
                  <Search size={22} />
                </div>
                <h3 className="mt-4 text-base font-extrabold text-[#06424B]">No matching courses</h3>
                <p className="mt-1 text-sm text-[#718486]">Try another course name, skill or subtopic.</p>
                <button type="button" onClick={() => setSearchTerm("")} className="mt-4 rounded-lg bg-[#FFAB0B] px-4 py-2.5 text-xs font-extrabold text-[#06424B] transition hover:bg-[#FFC13C]">
                  Clear search
                </button>
              </div>
            ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredCourses.map((course, index) => {
                const Icon = courseIcons[course.id] || BookOpen;
                const theme = cardThemes[index % cardThemes.length];
                const isTechnologyDirectory = course.id === "it-courses";
                const enrolled = !isTechnologyDirectory && isEnrolled(course.id);
                const p = courseProgress(progress, course);
                const moduleCount = course.type === "technology" ? course.courses.length : course.modules.length;
                const moduleLabel = course.type === "technology" ? "Individual Courses" : "Topics";
                const destination = isTechnologyDirectory
                  ? `/student/topics/${course.id}`
                  : enrolled
                    ? myLearningCoursePath(course.id)
                    : `/student/topics/${course.id}`;

                return (
                  <Link
                    key={course.id}
                    to={destination}
                    className="group flex min-w-0 flex-col overflow-hidden rounded-[19px] border border-[#DCE6E3] bg-white !no-underline shadow-[0_3px_12px_rgba(6,66,75,0.035)] transition-all duration-300 hover:-translate-y-1 hover:border-[#C5A45D] hover:shadow-[0_12px_28px_rgba(6,66,75,0.10)]"
                  >
                    <div className={`relative overflow-hidden ${theme.header} px-5 py-5`}>
                      <div className={`pointer-events-none absolute -right-7 -top-12 h-36 w-36 rounded-full border-[20px] ${theme.decoration}`} />
                      <div className="pointer-events-none absolute -right-2 -bottom-14 h-28 w-28 rounded-full bg-[#FFAB0B]/10 blur-2xl" />

                      <div className="relative flex items-center justify-between gap-3">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-[14px] border border-white/10 ${theme.icon} transition-all duration-300 group-hover:scale-105`}>
                          <Icon size={24} strokeWidth={1.8} />
                        </div>
                        <span className={`rounded-lg px-3 py-1.5 text-[10px] font-extrabold tracking-wide ${theme.level}`}>
                          {course.level}
                        </span>
                      </div>

                      <div className="relative mt-4">
                        <p className={`text-[10px] font-bold tracking-[1.5px] ${theme.category}`}>{course.category.toUpperCase()}</p>
                        <h3 className="mt-1 text-xl font-extrabold tracking-tight text-white">{course.name}</h3>
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      <p className="min-h-[48px] text-xs leading-6 text-[#718486]">{course.description}</p>

                      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-[#EAF0EE] pb-4">
                        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#49686B]">
                          <BookOpen size={14} className="text-[#B88736]" />
                          {moduleCount} {moduleLabel}
                        </span>
                        <span className="text-[11px] font-semibold text-[#49686B]">{course.duration}</span>
                      </div>

                      {isTechnologyDirectory ? (
                        <div className="mt-4 rounded-xl bg-[#F3F7F6] px-3 py-3 text-[11px] leading-5 text-[#527477]">
                          Choose a technology below and add only that individual course to My Learning.
                        </div>
                      ) : enrolled ? (
                        <div className="mt-4">
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-[11px] font-bold text-[#587477]">Learning Progress</span>
                            <span className="text-xs font-extrabold text-[#06424B]">{p.percent}%</span>
                          </div>
                          <div className="h-[7px] overflow-hidden rounded-full bg-[#E8EFED]">
                            <div className="h-full rounded-full bg-[#FFAB0B] transition-all duration-500" style={{ width: `${p.percent}%` }} />
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-[10px] text-[#91A1A2]">{p.done} of {p.total} topics completed</span>
                            {p.completed && <span className="flex items-center gap-1 text-[10px] font-bold text-[#39765D]"><CheckCircle2 size={12} /> Completed</span>}
                          </div>
                        </div>
                      ) : (
                        <div className="mt-4 flex items-center gap-2 text-[11px] font-semibold text-[#789094]">
                          <CheckCircle2 size={14} className="text-[#B88736]" />
                          Course overview and curriculum available
                        </div>
                      )}

                      <div className="mt-auto pt-5">
                        <div className="flex items-center justify-between rounded-xl bg-[#FFAB0B] px-4 py-3 text-[#06424B] transition-all duration-200 group-hover:bg-[#FFC13C]">
                          <span className="text-xs font-extrabold">{isTechnologyDirectory ? "Browse IT Courses" : enrolled ? "Continue in My Learning" : "Explore Course"}</span>
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#06424B] text-[#FFAB0B] transition-transform duration-200 group-hover:translate-x-1">
                            <ArrowRight size={15} />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
            )}
          </section>

          <div className="mt-6 flex items-center justify-center gap-2 border-t border-[#DCE6E3] py-4">
            <Sparkles size={13} className="text-[#B88736]" />
            <p className="text-[10px] font-medium text-[#829596]">Skill Next · Every skill starts with curiosity.</p>
          </div>
        </div>
      </PageShell>
    </Sidebar>
  );
}

export default ExploreTopics;
