
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import StudentPageHeader from "../../components/student/StudentPageHeader";
import {
  Card,
  EmptyState,
  IconBadge,
  LinkButton,
  PageShell,
  SectionHeading,
} from "../../components/student/ui";
import Loader from "../../components/Loader";
import ApiErrorModal from "../../components/ApiErrorModal";
import { learningFlow } from "../../data/studentLearningData";
import { getStudentDashboard } from "../../api/dashboard.api";
import { getApiErrorMessage } from "../../utils/apiErrorHandler";
import {
  ArrowUpRight,
  CalendarDays,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  Compass,
  GraduationCap,
  PlayCircle,
  Rocket,
  Trophy,
  TrendingUp,
  BookOpen,
  Clock3,
  FileText,
} from "lucide-react";

const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const clampPercentage = (value) =>
  Math.max(0, Math.min(100, toNumber(value)));

const firstArray = (...values) =>
  values.find(Array.isArray) || [];

const getDashboardPayload = (response) => {
  const payload = response?.data ?? response;

  if (!payload || payload.success === false) {
    throw new Error(
      payload?.message || "Unable to load dashboard information."
    );
  }

  const data = payload.data ?? payload;

  return {
    enrolledCourses: toNumber(
      data.enrolledCourses ?? data.enrolled_courses
    ),
    modulesCompleted: toNumber(
      data.modulesCompleted ?? data.modules_completed
    ),
    assignmentsCompleted: toNumber(
      data.assignmentsCompleted ?? data.assignments_completed
    ),
    averageAssessmentScore:
      data.averageAssessmentScore ??
      data.average_assessment_score ??
      null,
    learnings: Array.isArray(data.learnings) ? data.learnings : [],

    // Updated: Read actual recentAssignments API response.
    recentQuizzes: firstArray(
      data.recentAssignments,
      data.recent_assignments,
      data.recentQuizzes,
      data.recent_quizzes,
      data.recentQuizResults,
      data.recent_quiz_results,
      data.quizAttempts,
      data.quiz_attempts
    ),

    upcomingActivities: firstArray(
      data.upcomingActivities,
      data.upcoming_activities,
      data.upcomingActivity,
      data.upcoming_activity
    ),
  };
};

const getDashboardError = (error) => {
  const backend = error?.response?.data;

  if (typeof backend === "string" && backend.trim()) return backend;
  if (backend?.message) return backend.message;
  if (typeof backend?.detail === "string") return backend.detail;

  if (Array.isArray(backend?.detail)) {
    const messages = backend.detail
      .map((item) => item?.msg || item?.message)
      .filter(Boolean);
    if (messages.length) return messages.join(" ");
  }

  return getApiErrorMessage(
    error,
    "We couldn't load your dashboard. Please try again."
  );
};

const normalizeLearning = (item) => {
  const course = item?.course || item;
  const courseId =
    item?.courseId ??
    item?.course_id ??
    course?.id ??
    course?.courseId ??
    course?.course_id;

  const fullName =
    item?.fullName ||
    item?.full_name ||
    course?.fullName ||
    course?.full_name ||
    course?.shortName ||
    course?.short_name ||
    "";

  const shortName =
    item?.shortName ||
    item?.short_name ||
    course?.shortName ||
    course?.short_name ||
    "";

  const totalModules = toNumber(
    item?.totalModules ??
      item?.total_modules ??
      course?.totalModules ??
      course?.total_modules
  );

  const modulesCompleted = toNumber(
    item?.modulesCompleted ??
      item?.modules_completed ??
      course?.modulesCompleted ??
      course?.modules_completed
  );

  const totalItems = toNumber(
    item?.totalItems ??
      item?.total_items ??
      course?.totalItems ??
      course?.total_items
  );

  const itemsCompleted = toNumber(
    item?.itemsCompleted ??
      item?.items_completed ??
      course?.itemsCompleted ??
      course?.items_completed
  );

  const apiPercentage =
    item?.completionPercentage ??
    item?.completion_percentage ??
    course?.completionPercentage ??
    course?.completion_percentage ??
    item?.percentage ??
    course?.percentage;

  const completionPercentage = clampPercentage(
    apiPercentage != null
      ? apiPercentage
      : totalModules > 0
        ? (modulesCompleted / totalModules) * 100
        : totalItems > 0
          ? (itemsCompleted / totalItems) * 100
          : 0
  );

  return {
    courseId,
    fullName,
    shortName,
    enrolledAt:
      item?.enrolledAt ||
      item?.enrolled_at ||
      item?.enrolledOn ||
      item?.enrolled_on ||
      null,
    totalModules,
    modulesCompleted,
    totalItems,
    itemsCompleted,
    completionPercentage,
    isCompleted:
      item?.isCompleted === true ||
      item?.is_completed === true ||
      course?.isCompleted === true ||
      course?.is_completed === true ||
      (totalModules > 0 && modulesCompleted >= totalModules),
  };
};

// Updated: Supports the actual recentAssignments API structure.
const normalizeQuiz = (item, index) => {
  const title =
    item?.assignmentName ||
    item?.assignment_name ||
    item?.title ||
    item?.quizTitle ||
    item?.quiz_title ||
    item?.name ||
    "Quiz assessment";

  const scoreValue =
    item?.score ??
    item?.marksObtained ??
    item?.marks_obtained ??
    item?.correctAnswers ??
    item?.correct_answers;

  const totalValue =
    item?.totalScore ??
    item?.total_score ??
    item?.total ??
    item?.totalMarks ??
    item?.total_marks ??
    item?.totalQuestions ??
    item?.total_questions;

  const score =
    scoreValue == null ? Number.NaN : Number(scoreValue);

  const total =
    totalValue == null ? Number.NaN : Number(totalValue);

  const suppliedPercentage =
    item?.percentage ??
    item?.scorePercentage ??
    item?.score_percentage;

  const percentage =
    suppliedPercentage != null && Number.isFinite(Number(suppliedPercentage))
      ? clampPercentage(suppliedPercentage)
      : Number.isFinite(score) &&
          Number.isFinite(total) &&
          total > 0
        ? clampPercentage((score / total) * 100)
        : null;

  return {
    id:
      item?.attemptId ??
      item?.attempt_id ??
      item?.id ??
      `${title}-${index}`,
    title,
    score: Number.isFinite(score) ? score : null,
    total: Number.isFinite(total) && total > 0 ? total : null,
    percentage,
    date:
      item?.submittedAt ||
      item?.submitted_at ||
      item?.date ||
      item?.attemptedAt ||
      item?.attempted_at ||
      item?.submittedAt ||
      item?.submitted_at ||
      null,
  };
};

const normalizeActivity = (item, index) => ({
  id:
    item?.id ??
    item?.activityId ??
    item?.activity_id ??
    `activity-${index}`,
  title:
    item?.title ||
    item?.name ||
    item?.activityName ||
    item?.activity_name ||
    "Scheduled activity",
  description: item?.description || item?.summary || "",
  type:
    item?.type ||
    item?.activityType ||
    item?.activity_type ||
    "Activity",
  date:
    item?.date ||
    item?.scheduledAt ||
    item?.scheduled_at ||
    item?.dueDate ||
    item?.due_date ||
    item?.startDate ||
    item?.start_date ||
    null,
  courseName:
    item?.courseName ||
    item?.course_name ||
    item?.course?.fullName ||
    "",
  status: item?.status || "Upcoming",
});

const formatDate = (value) => {
  if (!value) return "Date to be announced";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: date.getHours() || date.getMinutes() ? "2-digit" : undefined,
    minute: date.getHours() || date.getMinutes() ? "2-digit" : undefined,
  });
};

const formatEnrollmentDate = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return `Enrolled ${date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })}`;
};

function MiniRing({ percent }) {
  const size = 60;
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset =
    circumference -
    (clampPercentage(percent) / 100) * circumference;

  return (
    <div className="relative h-[60px] w-[60px] shrink-0">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.16)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#FFAB0B"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>

      <span className="absolute inset-0 flex items-center justify-center text-[14px] font-extrabold text-white">
        {Math.round(clampPercentage(percent))}%
      </span>
    </div>
  );
}

function LearningSpaceCard({ course, index }) {
  const isGold = index % 2 === 1;
  const isComplete = course.isCompleted;

  const theme = isGold
    ? {
        header: "bg-gradient-to-br from-[#FFF0D0] to-[#F8E5BD]",
        subtitle: "text-[#8A6A36]",
        accent: "bg-[#C79537]",
        border: "hover:border-[#D9AD52]",
      }
    : {
        header: "bg-gradient-to-br from-[#E5F0EE] to-[#D5E7E3]",
        subtitle: "text-[#58736C]",
        accent: "bg-[#397B73]",
        border: "hover:border-[#75A69C]",
      };

  const coursePath = `/student/my-learning?course=${encodeURIComponent(course.courseId)}`;
  const itemLabel =
    course.totalModules === 1 ? "learning module" : "learning modules";

  return (
    <Link
      to={coursePath}
      className={`group flex min-h-[224px] flex-col overflow-hidden rounded-[19px] border border-[#E2E9E7] bg-white !no-underline shadow-[0_3px_12px_rgba(6,66,75,0.045)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_28px_rgba(6,66,75,0.10)] ${theme.border}`}
    >
      <div className={`relative overflow-hidden px-5 pb-4 pt-4 ${theme.header}`}>
        <div className="pointer-events-none absolute -right-8 -top-12 h-32 w-32 rounded-full border-[18px] border-white/30" />

        <div className="relative flex items-center justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-[13px] bg-[#06424B] text-lg font-extrabold text-[#FFAB0B] shadow-sm">
            {course.fullName.charAt(0).toUpperCase()}
          </div>

          <div className="flex items-center gap-2">
            {isComplete && (
              <span className="rounded-full bg-white/75 px-2.5 py-1 text-[10px] font-bold text-[#376B4D]">
                Completed
              </span>
            )}

            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/70 bg-white/60 text-[#06424B] transition-all group-hover:bg-[#06424B] group-hover:text-white">
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>

        <div className="relative mt-3">
          <h3 className="text-[17px] font-bold tracking-tight text-[#06424B]">
            {course.fullName}
          </h3>

          <p className={`mt-0.5 text-[11px] font-semibold ${theme.subtitle}`}>
            {course.totalModules} {itemLabel}
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-5 pb-4 pt-3.5">
        <p className="line-clamp-2 min-h-[36px] text-[12px] leading-[18px] text-[#63777A]">
          {[
            course.shortName && course.shortName !== course.fullName
              ? course.shortName
              : "",
            formatEnrollmentDate(course.enrolledAt),
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>

        <div className="mt-auto pt-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#63777A]">
              Your progress
            </span>

            <span className="text-xs font-extrabold tabular-nums text-[#06424B]">
              {Math.round(course.completionPercentage)}%
            </span>
          </div>

          <div className="h-[6px] overflow-hidden rounded-full bg-[#E9EFEE]">
            <div
              className={`h-full rounded-full transition-all duration-700 ${theme.accent}`}
              style={{ width: `${course.completionPercentage}%` }}
            />
          </div>

          <div className="mt-2.5 flex items-center justify-between gap-2">
            <span className="text-[10px] font-medium text-[#829194]">
              {course.modulesCompleted} of {course.totalModules} modules completed
            </span>

            <span className="shrink-0 text-[11px] font-bold text-[#06424B] transition-colors group-hover:text-[#B27B20]">
              {isComplete
                ? "Review"
                : course.modulesCompleted > 0
                  ? "Continue"
                  : "Open course"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function DashboardLoadingCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {[1, 2, 3].map((item) => (
        <Card
          key={item}
          className="min-h-[224px] animate-pulse overflow-hidden p-0"
        >
          <div className="h-[112px] bg-[#E5F0EE] p-5">
            <div className="h-10 w-10 rounded-xl bg-white/70" />
            <div className="mt-3 h-4 w-2/3 rounded bg-white/70" />
          </div>

          <div className="p-5">
            <div className="h-3 w-3/4 rounded bg-[#EEF3F3]" />
            <div className="mt-5 h-2 rounded bg-[#EEF3F3]" />
          </div>
        </Card>
      ))}
    </div>
  );
}

function DashboardLoadingState() {
  return (
    <PageShell>
      <div className="animate-pulse space-y-7">
        <div className="space-y-3">
          <div className="h-7 w-48 rounded-lg bg-[#DCE7E5]" />
          <div className="h-4 w-2/3 max-w-[560px] rounded bg-[#E5ECEA]" />
        </div>

        <div className="h-[230px] rounded-[24px] bg-[#DCE7E5]" />

        <div className="space-y-3">
          <div className="h-6 w-44 rounded bg-[#DCE7E5]" />
          <div className="h-28 rounded-2xl bg-white" />
        </div>

        <div className="space-y-3">
          <div className="h-6 w-48 rounded bg-[#DCE7E5]" />
          <DashboardLoadingCards />
        </div>

        <div className="grid gap-5 xl:grid-cols-[1.35fr_1fr]">
          <div className="h-[300px] rounded-2xl bg-white" />
          <div className="h-[300px] rounded-2xl bg-white" />
        </div>
      </div>
    </PageShell>
  );
}

function DashboardError({ message, onRetry, onClose }) {
  return (
    <ApiErrorModal
      title="Unable to load dashboard data"
      message={message}
      onRetry={onRetry}
      onClose={onClose}
    />
  );
}

function RecentQuizResults({ quizzes, isLoading }) {
  const results = quizzes
    .map(normalizeQuiz)
    .filter(
      (quiz) =>
        quiz.title &&
        (quiz.percentage !== null ||
          (quiz.score !== null && quiz.total !== null))
    );

  return (
    <Card className="flex min-h-[320px] flex-col p-5 sm:p-6">
      <SectionHeading
        title="Recent quiz results"
        subtitle="Your latest knowledge checks."
      />

      {isLoading ? (
        <div
          className="mt-5 animate-pulse space-y-4"
          aria-label="Loading quiz results"
        >
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="flex items-center justify-between gap-4 border-b border-[#EAF1F0] pb-4"
            >
              <div className="flex-1 space-y-2">
                <div className="h-4 w-2/3 rounded bg-[#E8EFEE]" />
                <div className="h-3 w-24 rounded bg-[#F0F4F3]" />
              </div>

              <div className="h-8 w-24 rounded-full bg-[#FFF1D2]" />
            </div>
          ))}
        </div>
      ) : results.length > 0 ? (
        <ul className="mt-5 divide-y divide-[#EAF1F0]">
          {results.slice(0, 5).map((quiz) => (
            <li
              key={quiz.id}
              className="flex items-center justify-between gap-4 py-3.5 first:pt-1 last:pb-0"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FFF3D8] text-[#A87513]">
                  <ClipboardCheck size={17} />
                </span>

                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-[#2F4A4E]">
                    {quiz.title}
                  </p>

                  <p className="mt-0.5 text-xs text-[#6C8589]">
                    {quiz.date
                      ? formatDate(quiz.date)
                      : "Recently attempted"}
                  </p>
                </div>
              </div>

              <span className="shrink-0 rounded-full bg-[#FFF1D2] px-3 py-1.5 text-xs font-extrabold tabular-nums text-[#8A5700]">
                {quiz.score !== null && quiz.total !== null
                  ? `${quiz.score}/${quiz.total} · ${Math.round(quiz.percentage)}%`
                  : `${Math.round(quiz.percentage)}%`}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-1 items-center justify-center py-8">
          <EmptyState
            icon={ClipboardCheck}
            title="No quiz results yet"
            text="Your completed quiz attempts will appear here."
          />
        </div>
      )}
    </Card>
  );
}

function UpcomingActivity({ activities, isLoading }) {
  const items = activities.map(normalizeActivity);

  return (
    <Card className="flex min-h-[320px] flex-col p-5 sm:p-6">
      <SectionHeading
        title="Upcoming activity"
        subtitle="Classes and planned assessments."
      />

      {isLoading ? (
        <div
          className="mt-5 animate-pulse space-y-4"
          aria-label="Loading upcoming activity"
        >
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="flex gap-3 border-b border-[#EAF1F0] pb-4"
            >
              <div className="h-10 w-10 rounded-xl bg-[#FFF1D2]" />

              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded bg-[#E8EFEE]" />
                <div className="h-3 w-1/2 rounded bg-[#F0F4F3]" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length > 0 ? (
        <ul className="mt-5 divide-y divide-[#EAF1F0]">
          {items.slice(0, 5).map((activity) => (
            <li
              key={activity.id}
              className="flex items-start gap-3 py-3.5 first:pt-1 last:pb-0"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFF3D8] text-[#A87513]">
                {String(activity.type).toLowerCase().includes("class") ? (
                  <CalendarDays size={18} />
                ) : String(activity.type)
                    .toLowerCase()
                    .includes("assignment") ? (
                  <FileText size={18} />
                ) : (
                  <CalendarClock size={18} />
                )}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-bold text-[#2F4A4E]">
                    {activity.title}
                  </p>

                  <span className="rounded-full bg-[#EEF3F4] px-2 py-0.5 text-[10px] font-semibold text-[#526D71]">
                    {activity.status}
                  </span>
                </div>

                {activity.description && (
                  <p className="mt-1 text-xs leading-5 text-[#6C8589]">
                    {activity.description}
                  </p>
                )}

                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#829194]">
                  <span className="inline-flex items-center gap-1">
                    <Clock3 size={12} />
                    {formatDate(activity.date)}
                  </span>

                  {activity.courseName && (
                    <span>{activity.courseName}</span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-1 items-center justify-center py-8">
          <EmptyState
            icon={CalendarDays}
            tone="gold"
            title="Nothing scheduled yet"
            text="Live classes and due dates will appear here once they are added to your account."
          />
        </div>
      )}
    </Card>
  );
}

function StudentDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await getStudentDashboard();
      setDashboard(getDashboardPayload(response));
    } catch (requestError) {
      console.error("Student Dashboard API Error:", requestError);
      setError(getDashboardError(requestError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const allLearnings = useMemo(
    () =>
      (dashboard?.learnings || [])
        .map(normalizeLearning)
        .filter((course) => course.courseId != null && course.fullName),
    [dashboard]
  );

  const learningSpaces = allLearnings;

  const totalModules = useMemo(
    () =>
      allLearnings.reduce(
        (total, course) => total + course.totalModules,
        0
      ),
    [allLearnings]
  );

  const modulesCompleted = dashboard?.modulesCompleted ?? 0;

  const overallPercent =
    totalModules > 0
      ? clampPercentage((modulesCompleted / totalModules) * 100)
      : 0;

  const stats = [
    {
      label: "Courses enrolled",
      value: dashboard ? dashboard.enrolledCourses : "—",
      note: "in your learning space",
      icon: Rocket,
      tone: "teal",
    },
    {
      label: "Modules completed",
      value: dashboard ? dashboard.modulesCompleted : "—",
      note: "across your enrolled courses",
      icon: CheckCircle2,
      tone: "gold",
    },
    {
      label: "Assignments completed",
      value: dashboard ? dashboard.assignmentsCompleted : "—",
      note: "completed assignments",
      icon: ClipboardCheck,
      tone: "teal",
    },
    {
      label: "Average assessment score",
      value:
        dashboard && dashboard.averageAssessmentScore != null
          ? `${dashboard.averageAssessmentScore}%`
          : "—",
      note: "across your assessments",
      icon: Trophy,
      tone: "gold",
    },
  ];

  const continueCourse =
    learningSpaces.find((course) => !course.isCompleted) ||
    learningSpaces[0];

  if (isLoading && !dashboard) {
    return (
      <>
        <DashboardLoadingState />
        <Loader open={isLoading} text="Loading your dashboard..." />
      </>
    );
  }

  return (
    <>
      <PageShell>
        <StudentPageHeader
          title="Dashboard"
          subtitle="Build skills, practise and grow. Your learning activity and next steps, all in one place."
        />

        {error && (
          <DashboardError
            message={error}
            onRetry={loadDashboard}
            onClose={() => setError("")}
          />
        )}

        <section className="relative overflow-hidden rounded-[24px] bg-[#06424B] px-6 py-5 text-white shadow-[0_12px_30px_rgba(6,66,75,0.14)] sm:px-8 sm:py-6">
          <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full border-[18px] border-[#FFAB0B]/10" />

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-[#FFAB0B]" />

          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-5 w-1.5 rounded-full bg-[#FFAB0B]" />

                <h2 className="text-lg font-extrabold tracking-tight">
                  Your learning path
                </h2>
              </div>

              <p className="mt-1 pl-[18px] text-xs text-white/65">
                Follow these steps for every enrolled course.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex flex-wrap items-center gap-2.5">
                {continueCourse ? (
                  <LinkButton
                    to={`/student/my-learning?course=${encodeURIComponent(continueCourse.courseId)}`}
                    variant="gold"
                    size="sm"
                    icon={PlayCircle}
                  >
                    Continue: {continueCourse.fullName}
                  </LinkButton>
                ) : (
                  <LinkButton
                    to="/student/topics"
                    variant="gold"
                    size="sm"
                    icon={Compass}
                  >
                    Start learning
                  </LinkButton>
                )}

                <LinkButton
                  to="/student/my-analytics"
                  variant="gold"
                  iconRight={TrendingUp}
                >
                  View My Analytics
                </LinkButton>
              </div>

              <div className="flex items-center gap-3 rounded-[18px] border border-white/10 bg-white/[0.08] py-2 pl-2.5 pr-4">
                <MiniRing percent={overallPercent} />

                <div>
                  <p className="text-[11px] font-semibold text-white/65">
                    Overall progress
                  </p>

                  <p className="mt-0.5 text-lg font-extrabold leading-none text-white">
                    {dashboard ? modulesCompleted : "—"}

                    <span className="text-xs font-semibold text-white/55">
                      {" "}
                      / {dashboard ? totalModules : "—"}
                    </span>
                  </p>

                  <p className="mt-0.5 text-[10px] text-white/65">
                    modules completed
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative mt-6">
            <div className="pointer-events-none absolute left-[7.2%] right-[7.2%] top-[22px] hidden h-0.5 border-t-2 border-dashed border-white/25 lg:block" />

            <ol className="relative grid gap-5 sm:grid-cols-2 lg:grid-cols-7 lg:gap-2">
              {learningFlow.map((step, index) => (
                <li
                  key={step}
                  className="flex items-start gap-3 lg:flex-col lg:items-center lg:text-center"
                >
                  <span
                    className={`relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base font-extrabold ring-4 ring-[#06424B] ${
                      index % 2 === 0
                        ? "bg-[#FFAB0B] text-[#06424B]"
                        : "border border-white/25 bg-[#0B5964] text-[#FFAB0B]"
                    }`}
                  >
                    {index + 1}
                  </span>

                  <span className="pt-2 text-[13px] font-semibold leading-5 text-white/90 lg:pt-0">
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mt-7">
          <SectionHeading
            title="Learning overview"
            subtitle="Your personal learning summary."
          />

          <Card className="overflow-hidden p-0">
            <div className="grid grid-cols-2 xl:grid-cols-4">
              {stats.map(({ label, value, note, icon, tone }, index) => (
                <div
                  key={label}
                  className={`relative border-[#E3EEEC] p-5 sm:p-6 ${
                    index % 2 === 1 ? "border-l" : ""
                  } ${index > 1 ? "border-t xl:border-t-0" : ""} ${
                    index > 0 ? "xl:border-l" : ""
                  }`}
                >
                  <span
                    className={`absolute left-0 top-5 h-10 w-1 rounded-r-full ${
                      tone === "gold" ? "bg-[#FFAB0B]" : "bg-[#06424B]"
                    }`}
                  />

                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[30px] font-extrabold leading-none tracking-tight text-[#06424B]">
                      {value}
                    </p>

                    <IconBadge icon={icon} tone={tone} />
                  </div>

                  <p className="mt-3 text-sm font-bold text-[#2F4A4E]">
                    {label}
                  </p>

                  <p className="mt-0.5 text-xs text-[#6C8589]">
                    {note}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <section className="mt-8">
          <SectionHeading
            title="Your learning spaces"
            subtitle="Your enrolled courses, ready to continue inside My Learning."
            right={
              <LinkButton
                to="/student/topics"
                variant="outline"
                size="sm"
              >
                Explore all
              </LinkButton>
            }
          />

          {learningSpaces.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {learningSpaces.map((course, index) => (
                <LearningSpaceCard
                  key={course.courseId}
                  course={course}
                  index={index}
                />
              ))}
            </div>
          ) : error ? (
            <Card className="p-6 sm:p-7">
              <EmptyState
                icon={GraduationCap}
                title="Learning spaces unavailable"
                text="We couldn't retrieve your enrolled courses. Use Try again above to reload your dashboard."
              />
            </Card>
          ) : (
            <Card className="p-6 sm:p-7">
              <EmptyState
                icon={GraduationCap}
                title="No courses added yet"
                text="Your enrolled courses will appear here after you add a course from Explore Courses."
                action={
                  <LinkButton
                    to="/student/topics"
                    variant="gold"
                    icon={Compass}
                  >
                    Explore Courses
                  </LinkButton>
                }
              />
            </Card>
          )}
        </section>

        <div className="mt-8 grid gap-5 xl:grid-cols-[1.35fr_1fr]">
          <RecentQuizResults
            quizzes={dashboard?.recentQuizzes || []}
            isLoading={isLoading}
          />

          <UpcomingActivity
            activities={dashboard?.upcomingActivities || []}
            isLoading={isLoading}
          />
        </div>

        <footer className="mt-9 border-t border-[#D9E8E6] py-5 text-center text-xs text-[#6C8589]">
          © 2026 Skill Next Consulting Inc. · Learning without limits.
        </footer>
      </PageShell>

      <Loader open={isLoading} text="Refreshing your dashboard..." />
    </>
  );
}

export default StudentDashboard;
