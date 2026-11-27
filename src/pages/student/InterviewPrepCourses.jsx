
import { useCallback, useEffect, useState } from "react";
import { translateValue } from "../../i18n";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  Sparkles,
  RefreshCw,
  Play,
  BookMarked,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import StudentPageHeader from "../../components/student/StudentPageHeader";
import {
  Card,
  EmptyState,
  PageShell,
  SectionHeading,
} from "../../components/student/ui";

import { getMyLearnings } from "../../api/course.api";

function InterviewPrepCourses() {
  const navigate = useNavigate();

  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch enrolled courses from existing My Learning API
  const fetchEnrolledCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getMyLearnings();

      const courses = Array.isArray(response?.data)
        ? response.data
        : [];

      const formattedCourses = courses
        .filter((item) => item?.course?.id)
        .map((item) => ({
          ...item.course,
          enrolledAt: item.enrolledAt,
          totalItems: item.totalItems ?? 0,
          completedItems: item.completedItems ?? 0,
          percentage: Number(item.percentage) || 0,
          status: item.status ?? "",
        }));

      setEnrolledCourses(formattedCourses);
    } catch (err) {
      console.error("Failed to load My Learning courses:", err);

      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          err?.message ||
          "Unable to load your enrolled courses. Please try again."
      );

      setEnrolledCourses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEnrolledCourses();
  }, [fetchEnrolledCourses]);

  // Navigate directly to difficulty selection
  const openCourse = (course) => {
    if (!course?.id) return;

    navigate(
      `/student/ai-practice/topic-theory/${course.id}/difficulty`,
      {
        state: {
          courseId: course.id,
          courseName: course.fullName,
          course,
        },
      }
    );
  };

  return (
    <PageShell max="max-w-[1400px]">
      <StudentPageHeader
        title={translateValue("Course-Specific Interview Prep")}
        subtitle={translateValue(
          "Choose an enrolled course and practise explaining what you have learned."
        )}
      />

      {/* Hero Section */}
      <section className="relative mt-5 overflow-hidden rounded-[24px] bg-[#06424B] px-6 py-7 text-white shadow-[0_10px_28px_rgba(6,66,75,0.12)] sm:px-9 sm:py-8">
        <div className="pointer-events-none absolute -right-12 -top-20 h-60 w-60 rounded-full border-[30px] border-white/[0.05]" />

        <div className="pointer-events-none absolute -bottom-20 right-24 h-44 w-44 rounded-full bg-[#FFAB0B]/10 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div className="max-w-[760px]">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.08] px-3 py-1.5 text-[10px] font-bold tracking-[0.14em] text-[#FFAB0B]">
              <Sparkles size={13} />
              {translateValue("SKILL NEXT · INTERVIEW PREPARATION")}
            </span>

            <h2 className="mt-4 text-2xl font-extrabold leading-tight sm:text-3xl">
              {translateValue("Turn your learning into confidence")}
            </h2>

            <p className="mt-3 max-w-[650px] text-sm leading-7 text-white/75">
              {translateValue(
                "Choose a course from your learning list, select your preferred difficulty level and start practising with AI-powered theory questions."
              )}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3 text-xs font-semibold text-white/80">
              <span className="inline-flex items-center gap-2">
                <BookOpen size={15} className="text-[#FFAB0B]" />
                {translateValue("Course-specific questions")}
              </span>

              <span className="inline-flex items-center gap-2">
                <GraduationCap size={15} className="text-[#FFAB0B]" />
                {translateValue("Choose your difficulty")}
              </span>
            </div>
          </div>

          <div className="hidden h-[108px] w-[108px] shrink-0 items-center justify-center rounded-[30px] border border-white/10 bg-white/[0.08] text-[#FFAB0B] sm:flex">
            <GraduationCap size={54} strokeWidth={1.4} />
          </div>
        </div>
      </section>

      {/* Enrolled Courses Section */}
      <section className="mt-8">
        <SectionHeading
          title={translateValue("Choose your course")}
          subtitle={translateValue(
            "Select a course to continue to difficulty selection and begin your interview practice."
          )}
          right={
            <span className="rounded-xl border border-[#DCE7E5] bg-white px-3.5 py-2 text-[10px] font-extrabold tracking-wide text-[#527477]">
              {loading ? "..." : enrolledCourses.length}{" "}
              {translateValue("ENROLLED")}
            </span>
          }
        />

        {/* Loading State */}
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-[22px] border border-[#DCE6E3] bg-white"
              >
                <div className="h-[150px] animate-pulse bg-[#E8EFED]" />

                <div className="space-y-4 p-5">
                  <div className="h-5 w-3/4 animate-pulse rounded-md bg-[#E8EFED]" />
                  <div className="h-3 w-full animate-pulse rounded-md bg-[#E8EFED]" />
                  <div className="h-3 w-2/3 animate-pulse rounded-md bg-[#E8EFED]" />
                  <div className="h-11 w-full animate-pulse rounded-xl bg-[#E8EFED]" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          /* Error State */
          <Card className="p-6 sm:p-9">
            <EmptyState
              icon={BookOpen}
              title={translateValue("Unable to load courses")}
              text={translateValue(error)}
              action={
                <button
                  type="button"
                  onClick={fetchEnrolledCourses}
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#06424B] px-5 py-3 text-xs font-extrabold text-white transition hover:bg-[#0A5964]"
                >
                  <RefreshCw size={15} />
                  {translateValue("Try Again")}
                </button>
              }
            />
          </Card>
        ) : enrolledCourses.length === 0 ? (
          /* Empty State */
          <Card className="p-6 sm:p-9">
            <EmptyState
              icon={BookOpen}
              title={translateValue("No enrolled courses yet")}
              text={translateValue(
                "Add a course to My Learning first. Your enrolled courses will appear here automatically."
              )}
              action={
                <button
                  type="button"
                  onClick={() => navigate("/student/topics")}
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#FFAB0B] px-5 py-3 text-xs font-extrabold text-[#06424B] transition hover:bg-[#FFC13C]"
                >
                  {translateValue("Explore Courses")}
                  <ArrowRight size={15} />
                </button>
              }
            />
          </Card>
        ) : (
          /* API Enrolled Course Cards */
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {enrolledCourses.map((course, index) => (
              <article
                key={course.id}
                className="group flex flex-col overflow-hidden rounded-[22px] border border-[#DCE6E3] bg-white shadow-[0_4px_16px_rgba(6,66,75,0.045)] transition duration-300 hover:-translate-y-1 hover:border-[#C5A45D] hover:shadow-[0_16px_32px_rgba(6,66,75,0.10)]"
              >
                {/* Card Header */}
                <div
                  className={`relative overflow-hidden px-5 py-6 ${
                    index % 2 === 0
                      ? "bg-[#06424B]"
                      : "bg-[#52676B]"
                  }`}
                >
                  <div className="pointer-events-none absolute -right-7 -top-12 h-36 w-36 rounded-full border-[20px] border-white/[0.06]" />

                  <div className="pointer-events-none absolute -bottom-12 right-20 h-28 w-28 rounded-full bg-[#FFAB0B]/10 blur-2xl" />

                  <div className="relative flex items-start justify-between gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-[15px] border border-white/10 bg-white/[0.09] text-[#FFAB0B]">
                      <BookMarked size={23} strokeWidth={1.7} />
                    </div>

                    <span className="rounded-full border border-white/15 bg-white/[0.09] px-3 py-1.5 text-[9px] font-extrabold tracking-wide text-white/90">
                      {translateValue("ENROLLED")}
                    </span>
                  </div>

                  <div className="relative mt-5">
                    <p className="text-[9px] font-bold tracking-[0.16em] text-[#FFAB0B]">
                      {translateValue("MY LEARNING")}
                    </p>

                    <h3 className="mt-2 min-h-[52px] text-lg font-extrabold leading-6 text-white">
                      {translateValue(
                        course.fullName ||
                          course.shortName ||
                          "Course"
                      )}
                    </h3>

                    {course.shortName && (
                      <p className="mt-1 text-xs font-medium text-white/60">
                        {translateValue(course.shortName)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="flex flex-1 flex-col p-5">
                  <p className="min-h-[60px] text-xs leading-6 text-[#718486]">
                    {translateValue(
                      course.summary ||
                        "Practise your course knowledge with AI-powered theory questions."
                    )}
                  </p>

                  <div className="mt-auto pt-5">
                    <button
                      type="button"
                      onClick={() => openCourse(course)}
                      className="inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-[#FFAB0B] px-4 py-3 text-xs font-extrabold text-[#06424B] transition hover:bg-[#FFC13C] focus:outline-none focus:ring-2 focus:ring-[#FFAB0B]/40 focus:ring-offset-2"
                    >
                      <Play size={15} fill="currentColor" />
                      {translateValue("Start Practice")}
                      <ArrowRight
                        size={15}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}

export default InterviewPrepCourses;
