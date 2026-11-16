import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Braces,
  CheckCircle2,
  Code2,
  Database,
  Globe,
  GraduationCap,
  Layers,
  LockKeyhole,
} from "lucide-react";

import Sidebar from "../../components/Sidebar";
import StudentPageHeader from "../../components/student/StudentPageHeader";
import {
  BackLink,
  Card,
  Hero,
  LinkButton,
  PageShell,
  SectionHeading,
} from "../../components/student/ui";
import {
  courseCategories,
  myLearningCoursePath,
  technologies,
} from "../../data/studentLearningData";
import { useEnrolledCourses } from "../../data/studentCourseEnrollment";

const technologyIcons = {
  react: Layers,
  python: Braces,
  javascript: Code2,
  java: Code2,
  sql: Database,
  "html-css": Globe,
};

function VocationalCourseDetails({ course }) {
  const navigate = useNavigate();
  const { enrollCourse, isEnrolled } = useEnrolledCourses();
  const enrolled = isEnrolled(course.id);

  const handleAddCourse = () => {
    enrollCourse(course.id);
    navigate(myLearningCoursePath(course.id));
  };

  if (enrolled) return <Navigate to={myLearningCoursePath(course.id)} replace />;

  return (
    <Sidebar>
      <PageShell max="max-w-[1250px]">
        <StudentPageHeader title={course.name} subtitle={course.description} />
        <BackLink to="/student/topics">Back to Explore Courses</BackLink>

        <Hero eyebrow={course.category.toUpperCase()} title={`Learn ${course.name}`} text={course.description}>
          <span className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white">
            <BookOpen size={15} className="text-[#FFAB0B]" /> {course.duration}
          </span>
          <span className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white">
            <GraduationCap size={15} className="text-[#FFAB0B]" /> 10-question topic quizzes · no pass mark
          </span>
        </Hero>

        <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <SectionHeading title="What you will learn" subtitle="Review the course outcomes and curriculum before adding the course to My Learning." />
            <Card className="p-5 sm:p-6">
              <div className="space-y-4">
                {(course.outcomes || []).map((outcome, index) => (
                  <div key={outcome} className="flex items-start gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#FFF1D1] text-xs font-extrabold text-[#94650C]">{String(index + 1).padStart(2, "0")}</span>
                    <p className="pt-1 text-sm leading-6 text-[#405D61]">{outcome}</p>
                  </div>
                ))}
              </div>
            </Card>

            <div className="mt-7">
              <SectionHeading title="Course curriculum" subtitle="These topics become available in order after you add the course." />
              <div className="space-y-3">
                {course.modules.map((module, index) => (
                  <Card key={module.id} className="flex items-center gap-4 p-4 sm:p-5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F0F5F5] text-sm font-extrabold text-[#526D71]">{String(index + 1).padStart(2, "0")}</span>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-[#06424B]">{module.title}</h3>
                      <p className="mt-1 text-xs leading-5 text-[#718486]">{module.description}</p>
                    </div>
                    <LockKeyhole size={16} className="shrink-0 text-[#9AAEAF]" />
                  </Card>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-6 lg:h-fit">
            <Card className="p-5">
              <div className="flex items-center gap-2 text-[#06424B]"><GraduationCap size={19} className="text-[#B88736]" /><h3 className="font-extrabold">Course at a glance</h3></div>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between gap-3"><span className="text-[#718486]">Level</span><strong className="text-right text-[#06424B]">{course.level}</strong></div>
                <div className="flex items-center justify-between gap-3"><span className="text-[#718486]">Curriculum</span><strong className="text-right text-[#06424B]">{course.duration}</strong></div>
                <div className="flex items-center justify-between gap-3"><span className="text-[#718486]">Topic quiz</span><strong className="text-right text-[#06424B]">10 questions</strong></div>
                <div className="flex items-center justify-between gap-3"><span className="text-[#718486]">Final assignment</span><strong className="text-right text-[#06424B]">15 questions</strong></div>
                <div className="flex items-center justify-between gap-3"><span className="text-[#718486]">Final pass mark</span><strong className="text-right text-[#06424B]">80%</strong></div>
              </div>
              <button type="button" onClick={handleAddCourse} className="mt-6 flex w-full items-center justify-between rounded-xl bg-[#FFAB0B] px-4 py-3.5 text-left text-sm font-extrabold text-[#06424B] transition hover:bg-[#FFC13C]">
                <span>Add Course to My Learning</span><ArrowRight size={18} />
              </button>
              <p className="mt-3 text-center text-[11px] leading-5 text-[#8A9B9D]">After adding, the course opens directly in My Learning.</p>
            </Card>
          </aside>
        </div>
      </PageShell>
    </Sidebar>
  );
}

function ITCoursesDirectory({ course }) {
  const { enrolledCourseIds } = useEnrolledCourses();

  return (
    <Sidebar>
      <PageShell max="max-w-[1250px]">
        <StudentPageHeader title="IT Courses" subtitle="Choose one technology course at a time. You only add the individual course you select to My Learning." />
        <BackLink to="/student/topics">Back to Explore Courses</BackLink>
        <Hero eyebrow="INFORMATION TECHNOLOGY" title="Choose your technology" text="Explore the available learning paths. Open a technology to review its curriculum, then add that course individually. Adding one technology does not enrol you in the others.">
          <span className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white"><GraduationCap size={15} className="text-[#FFAB0B]" /> {course.courses.length} individual courses</span>
        </Hero>

        <section className="mt-7">
          <SectionHeading title="Available IT courses" subtitle="Each technology has its own course overview, lessons, topic quizzes and final assignment." />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {course.courses.map((technology, index) => {
              const Icon = technologyIcons[technology.id] || Code2;
              const enrolled = enrolledCourseIds.includes(technology.id);
              return (
                <Link key={technology.id} to={enrolled ? myLearningCoursePath(null, technology.id) : `/student/topics/${technology.id}`} className="group flex min-w-0 flex-col overflow-hidden rounded-[19px] border border-[#DCE6E3] bg-white !no-underline shadow-[0_3px_12px_rgba(6,66,75,0.035)] transition-all duration-300 hover:-translate-y-1 hover:border-[#C5A45D] hover:shadow-[0_12px_28px_rgba(6,66,75,0.10)]">
                  <div className={`relative overflow-hidden px-5 py-5 ${index % 2 === 0 ? "bg-[#06424B]" : "bg-[#52676B]"}`}>
                    <div className="pointer-events-none absolute -right-7 -top-12 h-36 w-36 rounded-full border-[20px] border-white/[0.08]" />
                    <div className="relative flex items-center justify-between gap-3">
                      <span className="flex h-12 w-12 items-center justify-center rounded-[14px] border border-white/10 bg-white/10 text-[#FFAB0B]"><Icon size={24} /></span>
                      {enrolled && <span className="rounded-lg bg-[#FFAB0B] px-3 py-1.5 text-[10px] font-extrabold text-[#06424B]">ADDED</span>}
                    </div>
                    <p className="relative mt-4 text-[10px] font-bold tracking-[1.4px] text-white/65">{technology.category.toUpperCase()}</p>
                    <h3 className="relative mt-1 text-xl font-extrabold text-white">{technology.name}</h3>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <p className="min-h-[52px] text-xs leading-6 text-[#718486]">{technology.description}</p>
                    <div className="mt-4 flex items-center justify-between border-t border-[#EAF0EE] pt-4 text-[11px] font-semibold text-[#49686B]">
                      <span>{technology.topics.length} topics</span><span>{technology.lessons} lessons</span>
                    </div>
                    <div className="mt-auto flex items-center justify-between rounded-xl bg-[#FFAB0B] px-4 py-3 text-[#06424B] transition group-hover:bg-[#FFC13C]">
                      <span className="text-xs font-extrabold">{enrolled ? "Continue in My Learning" : "Explore Course"}</span><ArrowRight size={16} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </PageShell>
    </Sidebar>
  );
}

function TechnologyCourseOverview({ technology }) {
  const navigate = useNavigate();
  const { enrollCourse, isEnrolled } = useEnrolledCourses();
  const enrolled = isEnrolled(technology.id);
  const Icon = technologyIcons[technology.id] || Code2;

  if (enrolled) return <Navigate to={myLearningCoursePath(null, technology.id)} replace />;

  const outcomes = [
    `Build a foundation in ${technology.name} through ${technology.topics.length} structured topics.`,
    "Read detailed explanations and practical examples in every lesson.",
    "Complete the 10-question quiz after each topic; no minimum score is required.",
    "Attempt the 15-question final assignment after completing all topic quizzes; 80% is required to pass.",
  ];

  const handleAddCourse = () => {
    enrollCourse(technology.id);
    navigate(myLearningCoursePath(null, technology.id));
  };

  return (
    <Sidebar>
      <PageShell max="max-w-[1250px]">
        <StudentPageHeader title={technology.name} subtitle={technology.description} />
        <BackLink to="/student/topics/it-courses">Back to IT Courses</BackLink>
        <Hero eyebrow={technology.category.toUpperCase()} title={`${technology.name} learning path`} text={technology.description}>
          <span className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white"><BookOpen size={15} className="text-[#FFAB0B]" /> {technology.topics.length} topics · {technology.lessons} lessons</span>
        </Hero>

        <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <SectionHeading title="What you will learn" subtitle={`A structured ${technology.name} learning path with lessons, examples and topic quizzes.`} />
            <Card className="p-5 sm:p-6">
              <div className="space-y-4">
                {outcomes.map((outcome, index) => <div key={outcome} className="flex items-start gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#FFF1D1] text-xs font-extrabold text-[#94650C]">{String(index + 1).padStart(2, "0")}</span><p className="pt-1 text-sm leading-6 text-[#405D61]">{outcome}</p></div>)}
              </div>
            </Card>
            <div className="mt-7">
              <SectionHeading title="Course curriculum" subtitle="These topics appear in My Learning after you add this technology course." />
              <div className="space-y-3">
                {technology.topics.map((topic, index) => <Card key={topic.id} className="flex items-center gap-4 p-4 sm:p-5"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F0F5F5] text-sm font-extrabold text-[#526D71]">{String(index + 1).padStart(2, "0")}</span><div className="min-w-0 flex-1"><h3 className="text-sm font-bold text-[#06424B]">{topic.title}</h3><p className="mt-1 text-xs leading-5 text-[#718486]">{topic.summary}</p></div><LockKeyhole size={16} className="shrink-0 text-[#9AAEAF]" /></Card>)}
              </div>
            </div>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-6 lg:h-fit">
            <Card className="p-5">
              <div className="flex items-center gap-2 text-[#06424B]"><Icon size={19} className="text-[#B88736]" /><h3 className="font-extrabold">Course at a glance</h3></div>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between gap-3"><span className="text-[#718486]">Level</span><strong className="text-right text-[#06424B]">{technology.level}</strong></div>
                <div className="flex items-center justify-between gap-3"><span className="text-[#718486]">Topics</span><strong className="text-right text-[#06424B]">{technology.topics.length}</strong></div>
                <div className="flex items-center justify-between gap-3"><span className="text-[#718486]">Topic quiz</span><strong className="text-right text-[#06424B]">10 questions</strong></div>
                <div className="flex items-center justify-between gap-3"><span className="text-[#718486]">Final assignment</span><strong className="text-right text-[#06424B]">15 questions</strong></div>
                <div className="flex items-center justify-between gap-3"><span className="text-[#718486]">Final pass mark</span><strong className="text-right text-[#06424B]">80%</strong></div>
              </div>
              <button type="button" onClick={handleAddCourse} className="mt-6 flex w-full items-center justify-between rounded-xl bg-[#FFAB0B] px-4 py-3.5 text-left text-sm font-extrabold text-[#06424B] transition hover:bg-[#FFC13C]"><span>Add {technology.name} to My Learning</span><ArrowRight size={18} /></button>
              <p className="mt-3 text-center text-[11px] leading-5 text-[#8A9B9D]">Only {technology.name} will be added. Other IT courses remain available to add separately.</p>
            </Card>
          </aside>
        </div>
      </PageShell>
    </Sidebar>
  );
}

function TopicDetails() {
  const { technologySlug } = useParams();
  const category = courseCategories.find((item) => item.id === technologySlug);
  const technology = technologies.find((item) => item.id === technologySlug);

  if (category?.id === "it-courses") return <ITCoursesDirectory course={category} />;
  if (category?.type === "vocational") return <VocationalCourseDetails course={category} />;
  if (technology) return <TechnologyCourseOverview technology={technology} />;

  return (
    <Sidebar>
      <PageShell>
        <Card className="p-8">
          <h1 className="text-xl font-bold text-[#06424B]">Course not found</h1>
          <p className="mt-2 text-sm text-[#5A7478]">This course or learning path could not be found.</p>
          <LinkButton to="/student/topics" className="mt-4">Back to Explore Topics</LinkButton>
        </Card>
      </PageShell>
    </Sidebar>
  );
}

export default TopicDetails;
