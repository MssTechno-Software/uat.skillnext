import { useTranslation } from "react-i18next";
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

import {
  getCourseOverview,
  enrollInMyCourses,
} from "../../api/course.api";

import { getApiErrorMessage } from "../../utils/apiErrorHandler";

/* =====================================================
   FORMATTERS AND API RESPONSE HELPERS
===================================================== */

const formatDate = (value, language, t) => {
  if (!value) return t("Not specified");

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) return String(value);

  const locale = language === "fr" ? "fr-FR" : "en-IN";

  return date.toLocaleDateString(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getContentTypeLabel = (content, language, t) => {
  const rawType =
    content?.content_type ||
    content?.contentType ||
    "Content";

  const type =
    rawType && typeof rawType === "object" && !Array.isArray(rawType)
      ? rawType[language] ?? rawType.en ?? "Content"
      : rawType;

  const normalizedType = String(type).trim().toLowerCase().replace(/[_-]+/g, " ");
  const knownTypes = {
    text: "Text",
    article: "Article",
    video: "Video",
    audio: "Audio",
    pdf: "PDF",
    document: "Document",
    presentation: "Presentation",
    image: "Image",
    link: "Link",
    quiz: "Quiz",
    assignment: "Assignment",
    "coding practice": "Coding Practice",
    "code practice": "Coding Practice",
    "code example": "Code Example",
    interactive: "Interactive",
    content: "Content",
  };
  const label =
    knownTypes[normalizedType] ||
    normalizedType.replace(/\b\w/g, (character) => character.toUpperCase());

  return t(label, { defaultValue: label }).toLocaleUpperCase(
    language === "fr" ? "fr-FR" : "en-IN"
  );
};

const getErrorMessage = (error) => {
  const backend = error?.response?.data;

  if (typeof backend === "string" && backend.trim()) {
    return backend;
  }

  if (backend?.message) {
    return backend.message;
  }

  if (backend?.detail) {
    if (typeof backend.detail === "string") {
      return backend.detail;
    }

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



const normalizeCourseOverview = (response) => {
  if (!response || response.success === false) {
    throw new Error(
      response?.message ||
      "The course overview could not be loaded."
    );
  }

  const payload = response.data;

  const course = payload?.course;

  if (!course || course.id === undefined || course.id === null) {
    throw new Error(
      "The course overview response is missing course information."
    );
  }

  const modules = Array.isArray(payload.modules)
    ? payload.modules
    : [];

  const visibleModules = modules
    .filter(
      (module) =>
        module && module.visible !== false
    )
    .map((module) => {
      const contents = Array.isArray(module.contents)
        ? module.contents
        : [];

      const visibleContents = contents
        .filter(
          (content) =>
            content && content.visible !== false
        )
        .sort(
          (a, b) =>
            Number(a.position || 0) -
            Number(b.position || 0)
        );

      return {
        ...module,
        contents: visibleContents,
      };
    })
    .sort(
      (a, b) =>
        Number(a.position || 0) -
        Number(b.position || 0)
    );

  const calculatedContentCount = visibleModules.reduce(
    (total, module) =>
      total + module.contents.length,
    0
  );

  return {
    course,

    modules: visibleModules,

    totalModules: Number.isFinite(
      Number(payload.total_modules)
    )
      ? Number(payload.total_modules)
      : visibleModules.length,

    totalContents: Number.isFinite(
      Number(payload.total_contents)
    )
      ? Number(payload.total_contents)
      : calculatedContentCount,

    contentsByType: payload.contents_by_type || {},
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
  const { t } = useTranslation("ui");

  return (
    <PageShell max="max-w-[1250px]">
      <Card className="px-6 py-12 text-center sm:px-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
          <AlertCircle size={25} />
        </div>

        <h1 className="mt-4 text-xl font-extrabold text-[#06424B]">
          {t("Unable to load course details")}</h1>

        <p className="mx-auto mt-2 max-w-[520px] text-sm leading-6 text-[#718486]">
          {t(message, { defaultValue: message })}
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#FFAB0B] px-5 text-sm font-bold text-[#06424B] transition hover:bg-[#FFC13C]"
          >
            <RefreshCw size={15} />
            {t("Try Again")}</button>

          <Link
            to="/student/topics"
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#DCE6E3] bg-white px-5 text-sm font-bold text-[#06424B] !no-underline transition hover:bg-[#F4F7F7]"
          >
            <ArrowLeft size={15} />
            {t("Back to Explore Topics")}</Link>
        </div>
      </Card>
    </PageShell>
  );
}

/* =====================================================
   EMPTY COURSE CURRICULUM
   Shown only when the overview API has no visible modules.
===================================================== */

function EmptyCurriculum({ categoryPath }) {
  const { t } = useTranslation("ui");

  return (
    <div className="overflow-hidden rounded-[22px] border border-[#DCE7E5] bg-white shadow-[0_5px_20px_rgba(6,66,75,0.035)]">
      <div className="relative px-5 py-9 text-center sm:px-8 sm:py-10">
        {/* Soft background accents */}
        <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-[#EEF5F3]" />
        <div className="pointer-events-none absolute -bottom-20 -left-12 h-48 w-48 rounded-full bg-[#FFF6E3]" />

        <div className="relative z-10 mx-auto max-w-[650px]">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[25px] bg-[#F0F6F4] text-[#06424B]">
            <GraduationCap size={39} strokeWidth={1.7} />
          </div>

          <div className="mt-3 inline-flex items-center rounded-full bg-[#FFE8DF] px-3 py-1 text-[11px] font-bold text-[#A63D0B]">
            {t("COURSE CONTENT")}</div>

          <h3 className="mt-4 text-xl font-extrabold tracking-tight text-[#06424B] sm:text-2xl">
            {t("Learning Materials Coming Soon")}</h3>

          <p className="mt-3 text-sm leading-6 text-[#718486] sm:text-base">
            {t("The learning modules and study materials for this course have not been published yet. Please check back later for updates.")}</p>

          <div className="my-7 h-px w-full bg-[#E7EFED]" />

          <div className="rounded-2xl bg-[#F5F8F7] px-4 py-5 text-left sm:px-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#B88736]">
                <BookOpen size={20} />
              </div>

              <div>
                <h4 className="text-sm font-bold text-[#06424B]">
                  {t("What happens next?")}</h4>
                <p className="mt-1 text-xs leading-6 text-[#718486] sm:text-sm">
                  {t("Once the course materials are published, you will be able to explore the modules, lessons and learning activities here.")}</p>
              </div>
            </div>
          </div>

          <Link
            to="/student/topics"
            state={{ restoreCategoryPath: categoryPath }}
            className="mt-4 flex min-h-[58px] w-full items-center justify-center gap-3 rounded-2xl bg-[#06424B] px-5 py-4 !text-white hover:!text-white transition duration-200 hover:bg-[#0A5660]"
          >
            <ArrowLeft size={17} />
            {t("Explore Other Courses")}</Link>
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   TOPIC DETAILS — COURSE OVERVIEW API
===================================================== */

function TopicDetails() {
  const { t, i18n } = useTranslation("ui");
  const language = i18n.resolvedLanguage || i18n.language || "en";

  const localize = useCallback(
    (value) => {
      if (value && typeof value === "object" && !Array.isArray(value)) {
        const selected = value[language] ?? value.en ?? "";
        return typeof selected === "string"
          ? t(selected, { defaultValue: selected })
          : selected ?? "";
      }

      if (typeof value === "string") {
        return t(value, { defaultValue: value });
      }

      return value ?? "";
    },
    [language, t]
  );

  // Existing route parameter
  const { technologySlug } = useParams();

  const location = useLocation();
  const navigate = useNavigate();

  const [courseContent, setCourseContent] = useState(null);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState("");

  const [enrollmentError, setEnrollmentError] = useState("");

  const [isAdding, setIsAdding] = useState(false);

  const [isEnrolled, setIsEnrolled] = useState(
    Boolean(
      location.state?.isEnrolled ||
      location.state?.enrollmentStatus === "enrolled"
    )
  );

  const [showEnrollmentDialog, setShowEnrollmentDialog] =
    useState(false);

  const [enrollmentDialogTitle, setEnrollmentDialogTitle] =
    useState("");

  const [enrollmentDialogMessage, setEnrollmentDialogMessage] =
    useState("");

  const categoryName =
    location.state?.categoryName || "Course";

  const categoryPath = Array.isArray(
    location.state?.categoryPath
  )
    ? location.state.categoryPath
    : [];

  /* =====================================================
     LOAD COURSE OVERVIEW

     ONLY ONE GET API:
     /api/courses/{course_id}/overview
  ===================================================== */

  const loadCourseOverview = useCallback(async () => {
    if (
      !technologySlug ||
      !/^\d+$/.test(String(technologySlug))
    ) {
      setCourseContent(null);

      setError(
        "This course link is invalid. Return to Explore Topics and select a course."
      );

      setIsLoading(false);

      return;
    }

    setIsLoading(true);

    setError("");

    try {
      // Fetch course + modules + content list
      // Using Course Overview API only.

      const response = await getCourseOverview(
        technologySlug
      );

      const normalized = normalizeCourseOverview(response);

      if (normalized.course.visible === false) {
        throw new Error(
          "This course is currently unavailable."
        );
      }

      setCourseContent(normalized);
    } catch (requestError) {
      console.error(
        "Course Overview API Error:",
        requestError
      );

      setCourseContent(null);

      setError(getErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  }, [technologySlug]);

  useEffect(() => {
    loadCourseOverview();
  }, [loadCourseOverview]);

  /* =====================================================
     COURSE DATA
  ===================================================== */

  const course = courseContent?.course;

  const modules = courseContent?.modules || [];

  const learningOutcomes = useMemo(
    () =>
      modules.filter((module) => {
        const summary = module.summary;
        const searchableSummary =
          summary && typeof summary === "object"
            ? summary[language] ?? summary.en ?? summary.fr ?? ""
            : summary;
        return Boolean(String(searchableSummary || "").trim());
      }),
    [modules, language]
  );

  /* =====================================================
     ENROLL COURSE
     Existing enrollment logic retained
  ===================================================== */

  const handleAddCourse = async () => {
    if (!course || isAdding || isEnrolled) return;

    setIsAdding(true);

    setEnrollmentError("");

    try {
      // Enroll only the selected course
      const response = await enrollInMyCourses([
        course.id,
      ]);

      if (response?.success !== true) {
        throw new Error(
          response?.message ||
          "The course could not be added to My Learning."
        );
      }

      const result = response.data || {};

      const requestedCourseId = Number(course.id);

      const newlyEnrolledIds = Array.isArray(
        result.enrolled
      )
        ? result.enrolled
          .map((item) => Number(item?.course?.id))
          .filter(Number.isSafeInteger)
        : [];

      const alreadyEnrolledIds = Array.isArray(
        result.alreadyEnrolled
      )
        ? result.alreadyEnrolled
          .map(Number)
          .filter(Number.isSafeInteger)
        : [];

      const wasNewlyEnrolled =
        newlyEnrolledIds.includes(requestedCourseId);

      const wasAlreadyEnrolled =
        alreadyEnrolledIds.includes(requestedCourseId);

      if (!wasNewlyEnrolled && !wasAlreadyEnrolled) {
        const skippedItem = Array.isArray(result.skipped)
          ? result.skipped.find(
            (item) =>
              Number(item?.courseId) ===
              requestedCourseId
          )
          : null;

        throw new Error(
          skippedItem?.reason ||
          response?.message ||
          "The course was not enrolled. Please try again."
        );
      }

      // Keep student on the overview page
      setIsEnrolled(true);

      setEnrollmentDialogTitle(
        wasAlreadyEnrolled
          ? "Already in My Learning"
          : "Course added successfully"
      );

      setEnrollmentDialogMessage(
        wasAlreadyEnrolled
          ? "This course is already part of your learning space. Select Continue Learning when you are ready to open it."
          : "{{course}} has been added to your learning space. Select OK, then choose Continue Learning to start."
      );

      setShowEnrollmentDialog(true);
    } catch (enrollmentRequestError) {
      console.error(
        "Course Enrollment API Error:",
        enrollmentRequestError
      );

      setEnrollmentError(
        getErrorMessage(enrollmentRequestError)
      );
    } finally {
      setIsAdding(false);
    }
  };

  /* =====================================================
     CONTINUE LEARNING
  ===================================================== */

  const handleContinueLearning = () => {
    if (!course || !isEnrolled) return;

    navigate(
      `/student/my-learning?course=${encodeURIComponent(
        course.id
      )}`,
      {
        state: {
          enrolledCourse: course,
        },
      }
    );
  };

  /* =====================================================
     LOADING STATE
  ===================================================== */

  if (isLoading) {
    return (
      <>
        <CourseDetailsLoading />

        <Loader
          open={isLoading}
          text={t("Loading course details...")}
        />
      </>
    );
  }

  /* =====================================================
     ERROR STATE
  ===================================================== */

  if (error || !courseContent || !course) {
    return (
      <CourseDetailsError
        message={t(error || "Course information is unavailable.", {
          defaultValue: error || "Course information is unavailable.",
        })}
        onRetry={loadCourseOverview}
      />
    );
  }

  /* =====================================================
     COURSE DETAILS
  ===================================================== */

  const courseName = localize(
    course.fullName || course.shortName || "Course Overview"
  );

  const summary = localize(
    course.summary || "A course description has not been provided."
  );

  const categoryNameLabel = localize(categoryName);

  const totalModules = courseContent.totalModules;

  const totalContents = courseContent.totalContents;

  /* =====================================================
     UI — EXISTING DESIGN PRESERVED
  ===================================================== */

  return (
    <PageShell max="max-w-[1250px]">
      <div className="mx-auto w-full">
        <StudentPageHeader
          title={courseName}
          subtitle={summary}
        />

        <Link
          to="/student/topics"
          state={{
            restoreCategoryPath: categoryPath,
          }}
          className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-[#527477] !no-underline transition hover:text-[#06424B]"
        >
          <ArrowLeft size={16} />
          {t("Back to Explore Courses")}</Link>

        {/* COURSE HERO */}

        <Hero
          eyebrow={categoryNameLabel.toLocaleUpperCase(language === "fr" ? "fr-FR" : "en-IN")}
          title={t("Learn {{course}}", { course: courseName })}
          text={summary}
        >
          <span className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white">
            <BookOpen
              size={15}
              className="text-[#FFAB0B]"
            />

            {totalModules} {t("learning modules")}</span>

          <span className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white">
            <GraduationCap
              size={15}
              className="text-[#FFAB0B]"
            />

            {totalContents} {t("learning items")}</span>
        </Hero>

        <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* MAIN CONTENT */}

          <div className="min-w-0">
            {/* SHOW LEARNING OUTCOMES ONLY WHEN THE API PROVIDES THEM.
                When there are no outcomes, avoid showing a second empty card.
                The centered Course Curriculum empty state below becomes the
                single, clear message for the student. */}
            {learningOutcomes.length > 0 && (
              <section>
                <SectionHeading
                  title={t("What you will learn")}
                  subtitle={t("Explore the learning areas included in this course.")}
                />

                <Card className="p-5 sm:p-6">
                  <div className="space-y-4">
                    {learningOutcomes.map((module, index) => (
                      <div
                        key={module.id ?? `${module.name}-${index}`}
                        className="flex items-start gap-3"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#FFF1D1] text-xs font-extrabold text-[#94650C]">
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        <div className="min-w-0 pt-1">
                          <h3 className="text-sm font-bold text-[#06424B]">
                            {localize(module.name)}
                          </h3>

                          <p className="mt-1 text-sm leading-6 text-[#405D61]">
                            {localize(module.summary)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </section>
            )}

            {/* COURSE CURRICULUM FROM OVERVIEW API */}

            <div className={learningOutcomes.length > 0 ? "mt-7" : ""}>
              <SectionHeading
                title={t("Course curriculum")}
                subtitle={
                  t(modules.length > 0
                    ? "Review the modules and learning items included in this course before adding it to My Learning."
                    : "Explore the learning materials available for this course.")
                }
              />

              {modules.length > 0 ? (
                <div className="space-y-3">
                  {modules.map((module, index) => (
                    <Card
                      key={
                        module.id ??
                        `${module.name}-${index}`
                      }
                      className="p-4 sm:p-5"
                    >
                      <div className="flex items-start gap-4">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F0F5F5] text-sm font-extrabold text-[#526D71]">
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <h3 className="text-sm font-bold text-[#06424B]">
                              {localize(module.name || "Untitled module")}
                            </h3>

                            <span className="rounded-lg bg-[#F0F5F5] px-2.5 py-1 text-[10px] font-bold text-[#527477]">
                              {module.contents.length}{" "}
                              {t(module.contents.length === 1
                                ? "item"
                                : "items")}
                            </span>
                          </div>

                          {module.summary && (
                            <p className="mt-1 text-xs leading-5 text-[#718486]">
                              {localize(module.summary)}
                            </p>
                          )}

                          {module.contents.length > 0 ? (
                            <div className="mt-4 space-y-2 border-t border-[#EAF0EE] pt-3">
                              {module.contents.map(
                                (content, contentIndex) => (
                                  <div
                                    key={
                                      content.id ??
                                      `${content.title}-${contentIndex}`
                                    }
                                    className="flex items-center gap-3 rounded-xl bg-[#F7F9F8] px-3 py-3"
                                  >
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#B88736]">
                                      <FileText size={16} />
                                    </span>

                                    <div className="min-w-0 flex-1">
                                      <p className="text-xs font-bold text-[#29494D]">
                                        {localize(content.title || "Untitled learning item")}
                                      </p>

                                      <p className="mt-1 text-[10px] font-semibold tracking-wide text-[#829596]">
                                        {getContentTypeLabel(content, language, t)}
                                      </p>
                                    </div>

                                    <LockKeyhole
                                      size={15}
                                      className="shrink-0 text-[#9AAEAF]"
                                    />
                                  </div>
                                )
                              )}
                            </div>
                          ) : (
                            <p className="mt-3 text-xs text-[#91A1A2]">
                              {t("No visible learning items in this module yet.")}</p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <EmptyCurriculum categoryPath={categoryPath} />
              )}
            </div>
          </div>

          {/* COURSE AT A GLANCE + ADD COURSE */}

          <aside className="space-y-4 lg:sticky lg:top-6 lg:h-fit">
            <Card className="p-5">
              <div className="flex items-center gap-2 text-[#06424B]">
                <GraduationCap
                  size={19}
                  className="text-[#B88736]"
                />

                <h3 className="font-extrabold">
                  {t("Course at a glance")}</h3>
              </div>

              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[#718486]">
                    {t("Category")}</span>

                  <strong className="text-right text-[#06424B]">
                    {categoryNameLabel}
                  </strong>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-[#718486]">
                    {t("Curriculum")}</span>

                  <strong className="text-right text-[#06424B]">
                    {totalModules}{" "}
                    {t(totalModules === 1
                      ? "module"
                      : "modules")}
                  </strong>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-[#718486]">
                    {t("Learning items")}</span>

                  <strong className="text-right text-[#06424B]">
                    {totalContents}
                  </strong>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-[#718486]">
                    {t("Start date")}</span>

                  <strong className="text-right text-[#06424B]">
                    {formatDate(course.startDate, language, t)}
                  </strong>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-[#718486]">
                    {t("End date")}</span>

                  <strong className="text-right text-[#06424B]">
                    {formatDate(course.endDate, language, t)}
                  </strong>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-[#718486]">
                    {t("Availability")}</span>

                  <strong className="text-right text-[#39765D]">
                    {t(course.visible === false
                      ? "Unavailable"
                      : "Available")}
                  </strong>
                </div>
              </div>

              <div className="my-5 border-t border-[#EAF0EE]" />

              {/* EXISTING LMS LEARNING RULES */}

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[#718486]">
                    {t("Topic quiz")}</span>

                  <strong className="text-right text-[#06424B]">
                    {t("10 questions")}</strong>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-[#718486]">
                    {t("Final assessment")}</span>

                  <strong className="text-right text-[#06424B]">
                    {t("15 questions")}</strong>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-[#718486]">
                    {t("Pass requirement")}</span>

                  <strong className="text-right text-[#06424B]">
                    {t("80%")}</strong>
                </div>
              </div>

              {/* ADD COURSE / CONTINUE LEARNING */}

              <button
                type="button"
                onClick={
                  isEnrolled
                    ? handleContinueLearning
                    : handleAddCourse
                }
                disabled={isAdding}
                className="mt-6 flex w-full items-center justify-between rounded-xl bg-[#FFAB0B] px-4 py-3.5 text-left text-sm font-extrabold text-[#06424B] transition hover:bg-[#FFC13C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#06424B] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span>
                  {t(isAdding
                    ? "Adding course..."
                    : isEnrolled
                      ? "Continue Learning"
                      : "Add Course to My Learning")}
                </span>

                <ArrowRight size={18} />
              </button>

              {isEnrolled ? (
                <p className="mt-3 text-center text-[11px] leading-5 text-[#39765D]">
                  {t("This course is in your learning space. Continue whenever you are ready.")}</p>
              ) : (
                <p className="mt-3 text-center text-[11px] leading-5 text-[#8A9B9D]">
                  {t("After adding, you can choose Continue Learning to open this course.")}</p>
              )}

              {enrollmentError && (
                <div
                  role="alert"
                  className="mt-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs leading-5 text-red-700"
                >
                  <AlertCircle
                    size={15}
                    className="mt-0.5 shrink-0"
                  />

                  <span>{t(enrollmentError, { defaultValue: enrollmentError })}</span>
                </div>
              )}
            </Card>

            {/* BEFORE YOU BEGIN */}

            <Card className="p-5">
              <div className="flex items-center gap-2 text-[#06424B]">
                <CheckCircle2
                  size={17}
                  className="text-[#B88736]"
                />

                <h3 className="text-sm font-extrabold">
                  {t("Before you begin")}</h3>
              </div>

              <p className="mt-2 text-xs leading-6 text-[#718486]">
                {t("Review the course modules and learning items. Add the course to your learning space when you are ready to begin.")}</p>
            </Card>
          </aside>
        </div>
      </div>

      {/* ENROLLMENT SUCCESS DIALOG */}

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
              <CheckCircle2
                size={34}
                strokeWidth={1.8}
              />
            </div>

            <h2
              id="enrollment-success-title"
              className="mt-5 text-xl font-extrabold text-[#06424B]"
            >
              {t(enrollmentDialogTitle)}
            </h2>

            <p
              id="enrollment-success-description"
              className="mt-2 text-sm leading-6 text-[#718486]"
            >
              {t(enrollmentDialogMessage, { course: localize(courseName) })}
            </p>

            <button
              type="button"
              onClick={() =>
                setShowEnrollmentDialog(false)
              }
              className="mt-6 inline-flex h-11 min-w-[140px] items-center justify-center rounded-xl bg-[#FFAB0B] px-6 text-sm font-extrabold text-[#06424B] transition hover:bg-[#FFC13C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#06424B] focus-visible:ring-offset-2"
            >
              {t("OK")}</button>
          </div>
        </div>
      )}
    </PageShell>
  );
}

export default TopicDetails;
