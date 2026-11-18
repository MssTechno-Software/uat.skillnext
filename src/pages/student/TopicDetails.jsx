import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  FileText,
  GraduationCap,
  LockKeyhole,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import StudentPageHeader from "../../components/student/StudentPageHeader";
import {
  Card,
  Hero,
  PageShell,
  SectionHeading,
} from "../../components/student/ui";
import Loader from "../../components/Loader";

import { getCourseContent, enrollInMyCourses } from "../../api/course.api";
import { getApiErrorMessage } from "../../utils/apiErrorHandler";

/* =====================================================
   FORMATTERS AND API RESPONSE HELPERS
===================================================== */

const formatDate = (value) => {
  if (!value) return "Not specified";

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getContentTypeLabel = (content) => {
  const type = content?.content_type || content?.contentType || "content";
  return String(type).replace(/[_-]+/g, " ").toUpperCase();
};

const getErrorMessage = (error) => {
  const backend = error?.response?.data;

  if (typeof backend === "string" && backend.trim()) return backend;
  if (backend?.message) return backend.message;

  if (backend?.detail) {
    if (typeof backend.detail === "string") return backend.detail;
    if (Array.isArray(backend.detail)) {
      return backend.detail
        .map((item) => item?.msg || item?.message || "")
        .filter(Boolean)
        .join(" ");
    }
  }

  if (!error?.response && !error?.request && error?.message) {
    return error.message;
  }

  return getApiErrorMessage(
    error,
    "We couldn't load this course. Please try again."
  );
};

const normalizeCourseContent = (response) => {
  if (!response || response.success === false) {
    throw new Error(response?.message || "The course content could not be loaded.");
  }

  // Expected backend shape: { success, message, data: { course, modules } }.
  const payload = response.data;
  const course = payload?.course;

  if (!course || course.id === undefined || course.id === null) {
    throw new Error("The course content response is missing course information.");
  }

  const modules = Array.isArray(payload.modules) ? payload.modules : [];

  const visibleModules = modules
    .filter((module) => module && module.visible !== false)
    .map((module) => {
      const contents = Array.isArray(module.contents) ? module.contents : [];
      const visibleContents = contents
        .filter((content) => content && content.visible !== false)
        .sort((a, b) => Number(a.position || 0) - Number(b.position || 0));

      return {
        ...module,
        contents: visibleContents,
      };
    })
    .sort((a, b) => Number(a.position || 0) - Number(b.position || 0));

  const calculatedContentCount = visibleModules.reduce(
    (total, module) => total + module.contents.length,
    0
  );

  return {
    course,
    modules: visibleModules,
    totalModules: Number.isFinite(Number(payload.total_modules))
      ? Number(payload.total_modules)
      : visibleModules.length,
    totalContents: Number.isFinite(Number(payload.total_contents))
      ? Number(payload.total_contents)
      : calculatedContentCount,
  };
};

/* =====================================================
   LOADING AND ERROR STATES
===================================================== */

function CourseDetailsLoading() {
  return (
    <PageShell max="max-w-[1250px]">
      <div className="animate-pulse space-y-6">
        <div className="h-7 w-2/3 rounded-lg bg-[#DCE7E5]" />
        <div className="h-4 w-1/2 rounded bg-[#E5ECEA]" />
        <div className="h-[165px] rounded-[22px] bg-[#DCE7E5]" />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-4">
            <div className="h-7 w-1/3 rounded bg-[#DCE7E5]" />
            <div className="h-36 rounded-2xl bg-white" />
            <div className="h-7 w-1/3 rounded bg-[#DCE7E5]" />
            <div className="h-24 rounded-2xl bg-white" />
          </div>
          <div className="h-72 rounded-2xl bg-white" />
        </div>
      </div>

    </PageShell>
  );
}

function CourseDetailsError({ message, onRetry }) {
  return (
    <PageShell max="max-w-[1250px]">
      <Card className="px-6 py-12 text-center sm:px-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
          <AlertCircle size={25} />
        </div>
        <h1 className="mt-4 text-xl font-extrabold text-[#06424B]">
          Unable to load course details
        </h1>
        <p className="mx-auto mt-2 max-w-[520px] text-sm leading-6 text-[#718486]">
          {message}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#FFAB0B] px-5 text-sm font-bold text-[#06424B] transition hover:bg-[#FFC13C]"
          >
            <RefreshCw size={15} />
            Try Again
          </button>
          <Link
            to="/student/topics"
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#DCE6E3] bg-white px-5 text-sm font-bold text-[#06424B] !no-underline transition hover:bg-[#F4F7F7]"
          >
            <ArrowLeft size={15} />
            Back to Explore Topics
          </Link>
        </div>
      </Card>
    </PageShell>
  );
}

/* =====================================================
   TOPIC DETAILS — API-DRIVEN COURSE CONTENT
===================================================== */

function TopicDetails() {
  // The existing route uses :technologySlug. It now carries the
  // backend course reference internally; it is never shown in the UI.
  const { technologySlug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [courseContent, setCourseContent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [enrollmentError, setEnrollmentError] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(
    Boolean(location.state?.isEnrolled || location.state?.enrollmentStatus === "enrolled")
  );
  const [showEnrollmentDialog, setShowEnrollmentDialog] = useState(false);
  const [enrollmentDialogTitle, setEnrollmentDialogTitle] = useState("");
  const [enrollmentDialogMessage, setEnrollmentDialogMessage] = useState("");

  const categoryName = location.state?.categoryName || "Course";
  const categoryPath = Array.isArray(location.state?.categoryPath)
    ? location.state.categoryPath
    : [];

  const loadCourseContent = useCallback(async () => {
    if (!technologySlug || !/^\d+$/.test(String(technologySlug))) {
      setCourseContent(null);
      setError("This course link is invalid. Return to Explore Topics and select a course.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // One request only: course + modules + content items.
      // No GET course, GET overview, or additional curriculum calls here.
      const response = await getCourseContent(technologySlug);
      const normalized = normalizeCourseContent(response);

      if (normalized.course.visible === false) {
        throw new Error("This course is currently unavailable.");
      }

      setCourseContent(normalized);
    } catch (requestError) {
      console.error("Course Content API Error:", requestError);
      setCourseContent(null);
      setError(getErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  }, [technologySlug]);

  useEffect(() => {
    loadCourseContent();
  }, [loadCourseContent]);

  const course = courseContent?.course;
  const modules = courseContent?.modules || [];

  const learningOutcomes = useMemo(
    () => modules.filter((module) => Boolean(module.summary?.trim())),
    [modules]
  );

  const handleAddCourse = async () => {
    if (!course || isAdding || isEnrolled) return;

    setIsAdding(true);
    setEnrollmentError("");

    try {
      // Enroll only the course currently being viewed.
      const response = await enrollInMyCourses([course.id]);

      if (response?.success !== true) {
        throw new Error(
          response?.message || "The course could not be added to My Learning."
        );
      }

      const result = response.data || {};
      const requestedCourseId = Number(course.id);

      const newlyEnrolledIds = Array.isArray(result.enrolled)
        ? result.enrolled
          .map((item) => Number(item?.course?.id))
          .filter(Number.isSafeInteger)
        : [];

      const alreadyEnrolledIds = Array.isArray(result.alreadyEnrolled)
        ? result.alreadyEnrolled.map(Number).filter(Number.isSafeInteger)
        : [];

      const wasNewlyEnrolled = newlyEnrolledIds.includes(requestedCourseId);
      const wasAlreadyEnrolled = alreadyEnrolledIds.includes(requestedCourseId);

      if (!wasNewlyEnrolled && !wasAlreadyEnrolled) {
        const skippedItem = Array.isArray(result.skipped)
          ? result.skipped.find(
            (item) => Number(item?.courseId) === requestedCourseId
          )
          : null;

        throw new Error(
          skippedItem?.reason ||
          response?.message ||
          "The course was not enrolled. Please try again."
        );
      }

      // Keep the student on the overview page. Show confirmation first.
      setIsEnrolled(true);
      setEnrollmentDialogTitle(
        wasAlreadyEnrolled ? "Already in My Learning" : "Course added successfully"
      );
      setEnrollmentDialogMessage(
        wasAlreadyEnrolled
          ? "This course is already part of your learning space. Select Continue Learning when you are ready to open it."
          : `${course.fullName || course.shortName || "This course"} has been added to your learning space. Select OK, then choose Continue Learning to start.`
      );
      setShowEnrollmentDialog(true);
    } catch (enrollmentRequestError) {
      console.error("Course Enrollment API Error:", enrollmentRequestError);
      setEnrollmentError(getErrorMessage(enrollmentRequestError));
    } finally {
      setIsAdding(false);
    }
  };

  const handleContinueLearning = () => {
    if (!course || !isEnrolled) return;

    // MyLearning.jsx reads the selected course from the `course` query param.
    // Keep the URL format consistent so the course workspace opens directly.
    navigate(`/student/my-learning?course=${encodeURIComponent(course.id)}`, {
      state: { enrolledCourse: course },
    });
  };
  if (isLoading) {
    return (
      <>
        <CourseDetailsLoading />

        <Loader
          open={isLoading}
          text="Loading course details..."
        />
      </>
    );
  }

  if (error || !courseContent || !course) {
    return (
      <CourseDetailsError
        message={error || "Course information is unavailable."}
        onRetry={loadCourseContent}
      />
    );
  }

  const courseName = course.fullName || course.shortName || "Course Overview";
  const summary = course.summary || "A course description has not been provided.";
  const totalModules = courseContent.totalModules;
  const totalContents = courseContent.totalContents;

  return (
    <PageShell max="max-w-[1250px]">
      <div className="mx-auto w-full">
        <StudentPageHeader title={courseName} subtitle={summary} />

        <Link
          to="/student/topics"
          state={{ restoreCategoryPath: categoryPath }}
          className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-[#527477] !no-underline transition hover:text-[#06424B]"
        >
          <ArrowLeft size={16} />
          Back to Explore Courses
        </Link>

        {/* COURSE HERO — course data comes from the content API */}
        <Hero
          eyebrow={categoryName.toUpperCase()}
          title={`Learn ${courseName}`}
          text={summary}
        >
          <span className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white">
            <BookOpen size={15} className="text-[#FFAB0B]" />
            {totalModules} learning modules
          </span>
          <span className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white">
            <GraduationCap size={15} className="text-[#FFAB0B]" />
            {totalContents} learning items
          </span>
        </Hero>

        <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* MAIN CONTENT */}
          <div className="min-w-0">
            <SectionHeading
              title="What you will learn"
              subtitle="Explore the learning areas included in this course."
            />

            <Card className="p-5 sm:p-6">
              {learningOutcomes.length > 0 ? (
                <div className="space-y-4">
                  {learningOutcomes.map((module, index) => (
                    <div key={module.id ?? `${module.name}-${index}`} className="flex items-start gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#FFF1D1] text-xs font-extrabold text-[#94650C]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0 pt-1">
                        <h3 className="text-sm font-bold text-[#06424B]">
                          {module.name}
                        </h3>
                        <p className="mt-1 text-sm leading-6 text-[#405D61]">
                          {module.summary}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm leading-6 text-[#718486]">
                  Learning outcomes have not been added to this course yet.
                </p>
              )}
            </Card>

            {/* CURRICULUM FROM GET /content */}
            <div className="mt-7">
              <SectionHeading
                title="Course curriculum"
                subtitle="Review the modules and learning items included in this course before adding it to My Learning."
              />

              {modules.length > 0 ? (
                <div className="space-y-3">
                  {modules.map((module, index) => (
                    <Card key={module.id ?? `${module.name}-${index}`} className="p-4 sm:p-5">
                      <div className="flex items-start gap-4">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F0F5F5] text-sm font-extrabold text-[#526D71]">
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <h3 className="text-sm font-bold text-[#06424B]">
                              {module.name || "Untitled module"}
                            </h3>
                            <span className="rounded-lg bg-[#F0F5F5] px-2.5 py-1 text-[10px] font-bold text-[#527477]">
                              {module.contents.length} {module.contents.length === 1 ? "item" : "items"}
                            </span>
                          </div>

                          {module.summary && (
                            <p className="mt-1 text-xs leading-5 text-[#718486]">
                              {module.summary}
                            </p>
                          )}

                          {module.contents.length > 0 ? (
                            <div className="mt-4 space-y-2 border-t border-[#EAF0EE] pt-3">
                              {module.contents.map((content, contentIndex) => (
                                <div
                                  key={content.id ?? `${content.title}-${contentIndex}`}
                                  className="flex items-center gap-3 rounded-xl bg-[#F7F9F8] px-3 py-3"
                                >
                                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#B88736]">
                                    <FileText size={16} />
                                  </span>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold text-[#29494D]">
                                      {content.title || "Untitled learning item"}
                                    </p>
                                    <p className="mt-1 text-[10px] font-semibold tracking-wide text-[#829596]">
                                      {getContentTypeLabel(content)}
                                    </p>
                                  </div>
                                  <LockKeyhole size={15} className="shrink-0 text-[#9AAEAF]" />
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="mt-3 text-xs text-[#91A1A2]">
                              No visible learning items in this module yet.
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-6">
                  <p className="text-sm text-[#718486]">
                    The curriculum has not been published for this course yet.
                  </p>
                </Card>
              )}
            </div>
          </div>

          {/* COURSE AT A GLANCE + ADD COURSE */}
          <aside className="space-y-4 lg:sticky lg:top-6 lg:h-fit">
            <Card className="p-5">
              <div className="flex items-center gap-2 text-[#06424B]">
                <GraduationCap size={19} className="text-[#B88736]" />
                <h3 className="font-extrabold">Course at a glance</h3>
              </div>

              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[#718486]">Category</span>
                  <strong className="text-right text-[#06424B]">{categoryName}</strong>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[#718486]">Curriculum</span>
                  <strong className="text-right text-[#06424B]">
                    {totalModules} {totalModules === 1 ? "module" : "modules"}
                  </strong>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[#718486]">Learning items</span>
                  <strong className="text-right text-[#06424B]">{totalContents}</strong>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[#718486]">Start date</span>
                  <strong className="text-right text-[#06424B]">{formatDate(course.startDate)}</strong>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[#718486]">End date</span>
                  <strong className="text-right text-[#06424B]">{formatDate(course.endDate)}</strong>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[#718486]">Availability</span>
                  <strong className="text-right text-[#39765D]">
                    {course.visible === false ? "Unavailable" : "Available"}
                  </strong>
                </div>
              </div>

              <div className="my-5 border-t border-[#EAF0EE]" />

              {/* Existing LMS learning rules, retained from the old overview UI. */}
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[#718486]">Topic quiz</span>
                  <strong className="text-right text-[#06424B]">10 questions</strong>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[#718486]">Final assessment</span>
                  <strong className="text-right text-[#06424B]">15 questions</strong>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[#718486]">Pass requirement</span>
                  <strong className="text-right text-[#06424B]">80%</strong>
                </div>
              </div>

              <button
                type="button"
                onClick={isEnrolled ? handleContinueLearning : handleAddCourse}
                disabled={isAdding}
                className="mt-6 flex w-full items-center justify-between rounded-xl bg-[#FFAB0B] px-4 py-3.5 text-left text-sm font-extrabold text-[#06424B] transition hover:bg-[#FFC13C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#06424B] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span>
                  {isAdding
                    ? "Adding course..."
                    : isEnrolled
                      ? "Continue Learning"
                      : "Add Course to My Learning"}
                </span>
                <ArrowRight size={18} />
              </button>

              {isEnrolled ? (
                <p className="mt-3 text-center text-[11px] leading-5 text-[#39765D]">
                  This course is in your learning space. Continue whenever you are ready.
                </p>
              ) : (
                <p className="mt-3 text-center text-[11px] leading-5 text-[#8A9B9D]">
                  After adding, you can choose Continue Learning to open this course.
                </p>
              )}

              {enrollmentError && (
                <div
                  role="alert"
                  className="mt-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs leading-5 text-red-700"
                >
                  <AlertCircle size={15} className="mt-0.5 shrink-0" />
                  <span>{enrollmentError}</span>
                </div>
              )}

            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-2 text-[#06424B]">
                <CheckCircle2 size={17} className="text-[#B88736]" />
                <h3 className="text-sm font-extrabold">Before you begin</h3>
              </div>
              <p className="mt-2 text-xs leading-6 text-[#718486]">
                Review the course modules and learning items. Add the course to your learning space when you are ready to begin.
              </p>
            </Card>
          </aside>
        </div>
      </div>

      {showEnrollmentDialog && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#063B43]/40 p-4 backdrop-blur-[3px]"
          role="presentation"
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="enrollment-success-title"
            aria-describedby="enrollment-success-description"
            className="relative z-10 w-full max-w-[390px] rounded-[24px] border border-[#E1EAE7] bg-white px-7 py-7 text-center shadow-[0_24px_70px_rgba(6,66,75,0.22)]"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#EAF5EF] text-[#34845A]">
              <CheckCircle2 size={34} strokeWidth={1.8} />
            </div>

            <h2
              id="enrollment-success-title"
              className="mt-5 text-xl font-extrabold text-[#06424B]"
            >
              {enrollmentDialogTitle}
            </h2>

            <p
              id="enrollment-success-description"
              className="mt-2 text-sm leading-6 text-[#718486]"
            >
              {enrollmentDialogMessage}
            </p>

            <button
              type="button"
              onClick={() => setShowEnrollmentDialog(false)}
              className="mt-6 inline-flex h-11 min-w-[140px] items-center justify-center rounded-xl bg-[#FFAB0B] px-6 text-sm font-extrabold text-[#06424B] transition hover:bg-[#FFC13C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#06424B] focus-visible:ring-offset-2"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </PageShell>
  );
}

export default TopicDetails;
