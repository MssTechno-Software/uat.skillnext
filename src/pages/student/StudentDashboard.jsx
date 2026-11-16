import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import StudentPageHeader from "../../components/student/StudentPageHeader";
import {
  Card,
  EmptyState,
  IconBadge,
  LinkButton,
  PageShell,
  SectionHeading,
} from "../../components/student/ui";
import {
  courseCategories,
  learningFlow,
  myLearningCoursePath,
  technologies,
} from "../../data/studentLearningData";
import {
  courseProgress,
  summary,
  useProgress,
} from "../../data/studentProgress";
import { useEnrolledCourses } from "../../data/studentCourseEnrollment";
import {
  Brain,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Compass,
  FolderOpen,
  GraduationCap,
  PlayCircle,
  Rocket,
  Target,
  Trophy,
  ArrowUpRight,
  X,
} from "lucide-react";

const shortcuts = [
  {
    label: "Explore",
    title: "Explore topics",
    text: "Choose a technology and browse its lessons.",
    path: "/student/topics",
    icon: Compass,
    tone: "teal",
  },
  {
    label: "Resources",
    title: "Study resources",
    text: "Notes, PDFs, presentations and lessons.",
    path: "/student/resources",
    icon: FolderOpen,
    tone: "gold",
  },
  {
    label: "Interview Prep",
    title: "Interview prep",
    text: "Practise interview answers and self-introduction.",
    path: "/student/ai-practice",
    icon: Brain,
    tone: "teal",
  },
  {
    label: "Quizzes",
    title: "Quizzes",
    text: "Test what you have learned.",
    path: "/student/quizzes",
    icon: ClipboardCheck,
    tone: "gold",
  },
];

/* Quick-ball icon: a centre dot with four dots around it (the four shortcuts) */
function QuickIcon({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="7.6"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.4"
        strokeWidth="1.5"
      />
      <circle cx="12" cy="12" r="3.3" />
      <circle cx="12" cy="3.6" r="1.9" />
      <circle cx="20.4" cy="12" r="1.9" />
      <circle cx="12" cy="20.4" r="1.9" />
      <circle cx="3.6" cy="12" r="1.9" />
    </svg>
  );
}

/* Floating quick ball – fixed at the bottom right of the page
   - hover (mouse) or tap (touch) opens it, click on the ball closes it
   - the options slide out to the left of the ball */
function QuickBall() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const hoverBlocked = useRef(false);
  const closeTimer = useRef(null);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  useEffect(() => {
    if (!open) return undefined;

    const onPointerDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  /* Hover (mouse only): open on enter, close shortly after leaving */
  const onEnter = (e) => {
    clearTimeout(closeTimer.current);
    if (e.pointerType !== "mouse" || hoverBlocked.current) return;
    setOpen(true);
  };

  const onLeave = (e) => {
    if (e.pointerType !== "mouse") return;
    hoverBlocked.current = false;
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 250);
  };

  /* Click: closes when open, opens when closed (touch / keyboard) */
  const onBallClick = () => {
    if (open) {
      setOpen(false);
      hoverBlocked.current = true; /* stay closed until the mouse leaves */
    } else {
      setOpen(true);
    }
  };

  return (
    <div
      ref={rootRef}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      className="fixed bottom-20 right-12 z-40 h-0 w-0"
    >
      {/* Tray: the options slide out to the left of the ball */}
      <div
        className={`absolute -right-9 -top-[30px] flex items-start rounded-[28px] p-2 ring-1 transition-[background-color,box-shadow] duration-300 motion-reduce:transition-none ${
          open
            ? "bg-white shadow-[0_14px_34px_rgba(6,66,75,0.22)] ring-[#D9E8E6]"
            : "bg-transparent ring-transparent"
        }`}
      >
        <nav
          aria-label="Quick actions"
          aria-hidden={!open}
          className={`flex items-start overflow-hidden transition-all duration-300 ease-out motion-reduce:transition-none ${
            open ? "mr-2 max-w-[340px] opacity-100" : "max-w-0 opacity-0"
          }`}
        >
          {shortcuts.map(({ label, title, text, path, icon: Icon, tone }, i) => (
            <Link
              key={label}
              to={path}
              title={`${title} – ${text}`}
              tabIndex={open ? 0 : -1}
              onClick={() => {
                setOpen(false);
                hoverBlocked.current = true;
              }}
              style={{ transitionDelay: open ? `${i * 50}ms` : "0ms" }}
              className={`group flex w-[64px] shrink-0 flex-col items-center gap-1.5 !no-underline transition-all duration-300 focus-visible:outline-none motion-reduce:transition-none sm:w-[80px] ${
                open ? "translate-x-0" : "translate-x-6"
              }`}
            >
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-full shadow-[0_3px_10px_rgba(6,66,75,0.16)] transition-transform duration-200 group-hover:scale-110 group-focus-visible:ring-2 group-focus-visible:ring-[#FFAB0B] group-focus-visible:ring-offset-2 ${
                  tone === "gold"
                    ? "bg-[#FFAB0B] text-[#06424B]"
                    : "bg-[#06424B] text-[#FFAB0B]"
                }`}
              >
                <Icon className="h-5 w-5" />
              </span>

              <span className="flex h-6 items-start justify-center text-center text-[10px] font-semibold leading-3 text-[#2F4A4E] transition-colors group-hover:text-[#B27B20] sm:h-3 sm:whitespace-nowrap">
                {label}
              </span>
            </Link>
          ))}
        </nav>

        {/* Space where the ball sits */}
        <div className="h-14 w-14 shrink-0" aria-hidden="true" />
      </div>

      {/* The ball + its tag */}
      <div className="absolute left-0 top-0 z-10 -translate-x-1/2 -translate-y-1/2">
        <button
          type="button"
          onClick={onBallClick}
          aria-expanded={open}
          aria-label={open ? "Close quick actions" : "Open quick actions"}
          title="Quick actions"
          className={`flex h-14 w-14 items-center justify-center rounded-full ring-4 ring-white shadow-[0_8px_20px_rgba(6,66,75,0.28)] transition-[background-color,color,transform] duration-300 hover:scale-105 focus-visible:outline-none focus-visible:ring-[#FFD36B] motion-reduce:transition-none ${
            open
              ? "bg-[#06424B] text-[#FFAB0B]"
              : "bg-[#FFAB0B] text-[#06424B]"
          }`}
        >
          <span
            className={`transition-transform duration-300 motion-reduce:transition-none ${
              open ? "rotate-90" : "rotate-0"
            }`}
          >
            {open ? (
              <X className="h-6 w-6" />
            ) : (
              <QuickIcon className="h-7 w-7" />
            )}
          </span>
        </button>

        <span
          className={`pointer-events-none absolute left-1/2 top-full mt-1.5 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#06424B] px-2 py-0.5 text-[10px] font-bold text-[#FFD36B] shadow-sm transition-opacity duration-200 ${
            open ? "opacity-0" : "opacity-100"
          }`}
        >
          Quick actions
        </span>
      </div>
    </div>
  );
}

/* Small progress ring for the learning path card */
function MiniRing({ percent }) {
  const size = 60;
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset =
    circumference - (Math.min(percent, 100) / 100) * circumference;

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
        {percent}%
      </span>
    </div>
  );
}

/* Learning space card */

function LearningSpaceCard({ course, progress }) {
  const p = courseProgress(progress, course);
  const isComplete = p.percent === 100;
  const isGold = course.accent === "gold";
  const itemCount = course.type === "technology"
    ? course.courses.length
    : course.modules.length;
  const itemLabel = course.type === "technology"
    ? "technology paths"
    : "topics to explore";

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

  return (
    <Link
      to={myLearningCoursePath(course.id)}
      className={`group flex min-h-[224px] flex-col overflow-hidden rounded-[19px] border border-[#E2E9E7] bg-white !no-underline shadow-[0_3px_12px_rgba(6,66,75,0.045)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_28px_rgba(6,66,75,0.10)] ${theme.border}`}
    >
      {/* Coloured course header */}
      <div className={`relative overflow-hidden px-5 pb-4 pt-4 ${theme.header}`}>
        <div className="pointer-events-none absolute -right-8 -top-12 h-32 w-32 rounded-full border-[18px] border-white/30" />

        <div className="relative flex items-center justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-[13px] bg-[#06424B] text-lg font-extrabold text-[#FFAB0B] shadow-sm">
            {course.name.charAt(0)}
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
            {course.name}
          </h3>
          <p className={`mt-0.5 text-[11px] font-semibold ${theme.subtitle}`}>
            {itemCount} {itemLabel}
          </p>
        </div>
      </div>

      {/* White content area */}
      <div className="flex flex-1 flex-col px-5 pb-4 pt-3.5">
        <p className="line-clamp-2 min-h-[36px] text-[12px] leading-[18px] text-[#63777A]">
          {course.description}
        </p>

        <div className="mt-auto pt-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#63777A]">
              Your progress
            </span>
            <span className="text-xs font-extrabold tabular-nums text-[#06424B]">
              {p.percent}%
            </span>
          </div>

          <div className="h-[6px] overflow-hidden rounded-full bg-[#E9EFEE]">
            <div
              className={`h-full rounded-full transition-all duration-700 ${theme.accent}`}
              style={{ width: `${Math.min(p.percent, 100)}%` }}
            />
          </div>

          <div className="mt-2.5 flex items-center justify-between">
            <span className="text-[10px] font-medium text-[#829194]">
              {p.done} of {p.total} completed
            </span>

            <span className="text-[11px] font-bold text-[#06424B] transition-colors group-hover:text-[#B27B20]">
              {isComplete ? "Review" : p.done > 0 ? "Continue" : "Open course"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function StudentDashboard() {
  const progress = useProgress();
  const { enrolledCourseIds } = useEnrolledCourses();
  const learningSpaces = enrolledCourseIds
    .map((courseId) => courseCategories.find((course) => course.id === courseId))
    .filter(Boolean)
    .slice(0, 6);
  const totals = summary(progress, technologies);

  const last =
    progress.last &&
    technologies.find((t) => t.id === progress.last.technologyId);

  const lastTopic = last?.topics.find(
    (t) => t.id === progress.last.topicId
  );

  const totalTopics = technologies.reduce(
    (sum, tech) => sum + tech.topics.length,
    0
  );

  const overallPercent = totalTopics
    ? Math.round((totals.topicsCompleted / totalTopics) * 100)
    : 0;

  const stats = [
    {
      label: "Technologies started",
      value: totals.started,
      note: `of ${technologies.length} available`,
      icon: Rocket,
      tone: "teal",
    },
    {
      label: "Topics completed",
      value: totals.topicsCompleted,
      note: "marked complete in lessons",
      icon: CheckCircle2,
      tone: "gold",
    },
    {
      label: "Quizzes attempted",
      value: totals.attempts,
      note: "technology knowledge checks",
      icon: ClipboardCheck,
      tone: "teal",
    },
    {
      label: "Average quiz score",
      value: totals.average === null ? "—" : `${totals.average}%`,
      note: "across all attempts",
      icon: Trophy,
      tone: "gold",
    },
  ];

  return (
    <Sidebar>
      <PageShell>
        <StudentPageHeader
          title="Dashboard"
          subtitle="Build skills, practise and grow. Your learning activity and next steps, all in one place."
        />

        {/* Learning path – dark card at the top: actions + overall progress */}
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
                Follow these steps for every technology.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex flex-wrap items-center gap-2.5">
                {lastTopic ? (
                  <LinkButton
                    to={`/student/topics/${last.id}/topic/${lastTopic.id}`}
                    variant="gold"
                    size="sm"
                    icon={PlayCircle}
                  >
                    Continue: {lastTopic.title}
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
                  to="/student/quizzes"
                  variant="light"
                  size="sm"
                  icon={ClipboardCheck}
                >
                  Take a quiz
                </LinkButton>
              </div>

              {/* Overall progress chip */}
              <div className="flex items-center gap-3 rounded-[18px] border border-white/10 bg-white/[0.08] py-2 pl-2.5 pr-4">
                <MiniRing percent={overallPercent} />

                <div>
                  <p className="text-[11px] font-semibold text-white/65">
                    Overall progress
                  </p>
                  <p className="mt-0.5 text-lg font-extrabold leading-none text-white">
                    {totals.topicsCompleted}
                    <span className="text-xs font-semibold text-white/55">
                      {" "}/ {totalTopics}
                    </span>
                  </p>
                  <p className="mt-0.5 text-[10px] text-white/65">
                    topics completed
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

        {/* Floating quick ball (fixed at bottom right, takes no space) */}
        <QuickBall />

        {/* Learning overview */}
        <section className="mt-7">
          <SectionHeading
            title="Learning overview"
            subtitle="Your personal learning summary."
          />

          <Card className="overflow-hidden p-0">
            <div className="grid grid-cols-2 xl:grid-cols-4">
              {stats.map(({ label, value, note, icon, tone }, i) => (
                <div
                  key={label}
                  className={`relative p-5 sm:p-6 ${
                    i % 2 === 1 ? "border-l" : ""
                  } ${
                    i > 1 ? "border-t xl:border-t-0" : ""
                  } ${
                    i > 0 ? "xl:border-l" : ""
                  } border-[#E3EEEC]`}
                >
                  <span
                    className={`absolute left-0 top-5 h-10 w-1 rounded-r-full ${
                      tone === "gold"
                        ? "bg-[#FFAB0B]"
                        : "bg-[#06424B]"
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

        {/* Your learning spaces */}
        <section className="mt-8">
          <SectionHeading
            title="Your learning spaces"
            subtitle="Your first six enrolled courses, ready to continue inside My Learning."
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
              {learningSpaces.map((course) => (
                <LearningSpaceCard
                  key={course.id}
                  course={course}
                  progress={progress}
                />
              ))}
            </div>
          ) : (
            <Card className="p-6 sm:p-7">
              <EmptyState
                icon={GraduationCap}
                title="No courses added yet"
                text="Explore the available courses and add a course to My Learning. Your enrolled courses will appear here."
                action={
                  <LinkButton to="/student/topics" variant="gold" icon={Compass}>
                    Explore Courses
                  </LinkButton>
                }
              />
            </Card>
          )}
        </section>

        {/* Recent activity */}
        <div className="mt-8 grid gap-5 xl:grid-cols-[1.35fr_1fr]">
          <Card className="p-5 sm:p-6">
            <SectionHeading
              title="Recent quiz results"
              subtitle="Your latest knowledge checks."
            />

            {progress.quizzes.length ? (
              <ul className="divide-y divide-[#EAF1F0]">
                {progress.quizzes.slice(0, 4).map((attempt, i) => {
                  const pct = Math.round(
                    (attempt.score / attempt.total) * 100
                  );

                  return (
                    <li
                      key={i}
                      className="flex items-center justify-between gap-3 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-[#2F4A4E]">
                          {attempt.title}
                        </p>

                        <p className="text-xs text-[#6C8589]">
                          {new Date(attempt.date).toLocaleDateString()}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-sm font-extrabold ${
                          pct >= 60
                            ? "bg-[#E1F2F0] text-[#06424B]"
                            : "bg-[#FFF1D2] text-[#8A5700]"
                        }`}
                      >
                        {attempt.score}/{attempt.total} · {pct}%
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <EmptyState
                icon={ClipboardCheck}
                title="No quizzes attempted yet"
                text="Finish a topic and take its technology quiz. Your scores will show up here."
                action={
                  <LinkButton
                    to="/student/quizzes"
                    variant="gold"
                    iconRight={Target}
                  >
                    Browse quizzes
                  </LinkButton>
                }
              />
            )}
          </Card>

          <Card className="p-5 sm:p-6">
            <SectionHeading
              title="Upcoming activity"
              subtitle="Classes and planned assessments."
            />

            <EmptyState
              icon={CalendarDays}
              tone="gold"
              title="Nothing scheduled yet"
              text="Live classes and due dates will appear here once they are added to your account."
            />
          </Card>
        </div>

        <footer className="mt-9 border-t border-[#D9E8E6] py-5 text-center text-xs text-[#6C8589]">
          © 2026 Skill Next Consulting Inc. · Learning without limits.
        </footer>
      </PageShell>
    </Sidebar>
  );
}

export default StudentDashboard;