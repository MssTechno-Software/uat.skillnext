
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
  learningFlow,
  technologies,
} from "../../data/studentLearningData";
import {
  summary,
  technologyProgress,
  useProgress,
} from "../../data/studentProgress";
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
} from "lucide-react";

const shortcuts = [
  {
    title: "Explore topics",
    text: "Choose a technology and browse its lessons.",
    path: "/student/topics",
    icon: Compass,
    tone: "teal",
  },
  {
    title: "Study resources",
    text: "Notes, PDFs, presentations and lessons.",
    path: "/student/resources",
    icon: FolderOpen,
    tone: "gold",
  },
  {
    title: "AI practice",
    text: "Practise theory and self-introduction.",
    path: "/student/ai-practice",
    icon: Brain,
    tone: "teal",
  },
  {
    title: "Quizzes",
    text: "Test what you have learned.",
    path: "/student/quizzes",
    icon: ClipboardCheck,
    tone: "gold",
  },
];

/* Compact progress ring */
function ProgressRing({ percent }) {
  const size = 104;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset =
    circumference - (Math.min(percent, 100) / 100) * circumference;

  return (
    <div className="relative h-[104px] w-[104px] shrink-0">
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
          stroke="rgba(255,255,255,0.14)"
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

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[26px] font-extrabold leading-none text-white">
          {percent}%
        </span>
        <span className="mt-1 text-[10px] font-medium text-white/65">
          complete
        </span>
      </div>
    </div>
  );
}

/* Compact dashboard hero */
function WorkspaceHero({
  icon: Icon,
  eyebrow,
  title,
  text,
  percent,
  doneTopics,
  totalTopics,
  children,
}) {
  return (
    <section className="relative overflow-hidden rounded-[24px] bg-[#06424B] px-6 py-6 text-white shadow-[0_12px_30px_rgba(6,66,75,0.14)] sm:px-8 sm:py-7">
      {/* Decorative circles */}
      <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full border-[24px] border-[#FFAB0B]/10" />
      <div className="pointer-events-none absolute -right-5 -top-12 h-40 w-40 rounded-full border-[12px] border-[#FFAB0B]/10" />

  
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-[#FFAB0B]" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.09] py-1 pl-1.5 pr-3 text-xs font-semibold text-[#FFD36B]">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FFAB0B] text-[#06424B]">
              {Icon && <Icon className="h-3.5 w-3.5" />}
            </span>
            {eyebrow}
          </span>

          <h2 className="mt-4 text-[30px] font-extrabold leading-tight tracking-tight sm:text-[36px]">
            {title}
          </h2>

          <p className="mt-2 max-w-[620px] text-[13px] leading-6 text-white/75 sm:text-sm">
            {text}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            {children}
          </div>
        </div>

        {/* Compact progress panel */}
        <div className="flex shrink-0 items-center gap-4 self-start rounded-[18px] border border-white/10 bg-white/[0.08] p-3.5 backdrop-blur-sm lg:self-center">
          <ProgressRing percent={percent} />

          <div className="min-w-[112px]">
            <p className="text-xs font-semibold text-white/65">
              Overall progress
            </p>

            <p className="mt-1.5 text-[23px] font-extrabold leading-none text-white">
              {doneTopics}
              <span className="text-sm font-semibold text-white/55">
                {" "}/ {totalTopics}
              </span>
            </p>

            <p className="mt-1.5 text-[11px] text-white/65">
              topics completed
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* Learning space card */

function LearningSpaceCard({ tech, progress }) {
  const p = technologyProgress(progress, tech);
  const isComplete = p.percent === 100;
  const isGold = tech.accent === "gold";

  const theme = isGold
    ? {
        header: "bg-gradient-to-br from-[#FFF0D0] to-[#F8E5BD]",
        subtitle: "text-[#8A6A36]",
        icon: "text-[#FFAB0B]",
        accent: "bg-[#C79537]",
        border: "hover:border-[#D9AD52]",
      }
    : {
        header: "bg-gradient-to-br from-[#E5F0EE] to-[#D5E7E3]",
        subtitle: "text-[#58736C]",
        icon: "text-[#FFAB0B]",
        accent: "bg-[#397B73]",
        border: "hover:border-[#75A69C]",
      };

  return (
    <Link
      to={`/student/topics/${tech.id}`}
      className={`group flex min-h-[224px] flex-col overflow-hidden rounded-[19px] border border-[#E2E9E7] bg-white !no-underline shadow-[0_3px_12px_rgba(6,66,75,0.045)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_28px_rgba(6,66,75,0.10)] ${theme.border}`}
    >
      {/* Coloured course header */}
      <div className={`relative overflow-hidden px-5 pb-4 pt-4 ${theme.header}`}>
        <div className="pointer-events-none absolute -right-8 -top-12 h-32 w-32 rounded-full border-[18px] border-white/30" />

        <div className="relative flex items-center justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-[13px] bg-[#06424B] text-lg font-extrabold text-[#FFAB0B] shadow-sm">
            {tech.name.charAt(0)}
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
            {tech.name}
          </h3>
          <p className={`mt-0.5 text-[11px] font-semibold ${theme.subtitle}`}>
            {tech.topics.length} topics to explore
          </p>
        </div>
      </div>

      {/* White content area */}
      <div className="flex flex-1 flex-col px-5 pb-4 pt-3.5">
        <p className="line-clamp-2 min-h-[36px] text-[12px] leading-[18px] text-[#63777A]">
          {tech.description}
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
              {isComplete ? "Review" : "Continue"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}


function StudentDashboard() {
  const progress = useProgress();
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
          subtitle="Your learning activity and next steps, all in one place."
        />

        {/* Hero */}
        <WorkspaceHero
          icon={GraduationCap}
          eyebrow="Your learning workspace"
          title="Build skills. Practice. Grow."
          text="Learn each topic with clear explanations and examples, test yourself with quizzes and sharpen your answers with AI practice."
          percent={overallPercent}
          doneTopics={totals.topicsCompleted}
          totalTopics={totalTopics}
        >
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
        </WorkspaceHero>

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
            subtitle="Choose a technology and continue building your skills."
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

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {technologies.map((tech) => (
              <LearningSpaceCard
                key={tech.id}
                tech={tech}
                progress={progress}
              />
            ))}
          </div>
        </section>

        {/* Learning path */}
        <section className="mt-8">
          <SectionHeading
            title="Your learning path"
            subtitle="Follow these steps for every technology."
          />

          <Card className="p-5 sm:p-6">
            <div className="relative">
              <div className="pointer-events-none absolute left-[7.2%] right-[7.2%] top-[22px] hidden h-0.5 border-t-2 border-dashed border-[#BFD6D3] lg:block" />

              <ol className="relative grid gap-5 sm:grid-cols-2 lg:grid-cols-7 lg:gap-2">
                {learningFlow.map((step, index) => (
                  <li
                    key={step}
                    className="flex items-start gap-3 lg:flex-col lg:items-center lg:text-center"
                  >
                    <span
                      className={`relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base font-extrabold ring-4 ring-white ${
                        index % 2 === 0
                          ? "bg-[#06424B] text-[#FFAB0B]"
                          : "bg-[#FFAB0B] text-[#06424B]"
                      }`}
                    >
                      {index + 1}
                    </span>

                    <span className="pt-2 text-[13px] font-semibold leading-5 text-[#2F4A4E] lg:pt-0">
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </Card>
        </section>

        {/* Quick actions */}
        <section className="mt-8">
          <SectionHeading
            title="Quick actions"
            subtitle="Jump straight to what you need."
          />

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {shortcuts.map(({ title, text, path, icon, tone }) => (
              <Link
                key={title}
                to={path}
                className="group rounded-2xl border border-[#D9E8E6] bg-white p-5 !no-underline shadow-[0_2px_10px_rgba(6,66,75,0.04)] transition-all duration-200 hover:-translate-y-1 hover:border-[#FFAB0B] hover:shadow-[0_12px_25px_rgba(6,66,75,0.09)]"
              >
                <IconBadge icon={icon} tone={tone} />

                <h3 className="mt-4 text-base font-bold text-[#06424B]">
                  {title}
                </h3>

                <p className="mt-1 text-[13px] leading-5 text-[#5A7478]">
                  {text}
                </p>
              </Link>
            ))}
          </div>
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
