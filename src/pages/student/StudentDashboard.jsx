import { Link } from "react-router-dom";
import StudentSidebar from "../../components/student/StudentSidebar";
import StudentPageHeader from "../../components/student/StudentPageHeader";
import { Card, EmptyState, Hero, IconBadge, LinkButton, PageShell, ProgressBar, SectionHeading } from"../../components/student/ui";
import { learningFlow, technologies } from "../../data/studentLearningData";
import { summary, technologyProgress, useProgress } from "../../data/studentProgress";
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
} from "lucide-react";

const shortcuts = [
  { title: "Explore topics", text: "Pick a technology and browse its lessons.", path: "/student/topics", icon: Compass, tone: "teal" },
  { title: "Study resources", text: "Notes, PDFs, presentations and lessons.", path: "/student/resources", icon: FolderOpen, tone: "gold" },
  { title: "AI practice", text: "Practise theory and self-introduction.", path: "/student/ai-practice", icon: Brain, tone: "teal" },
  { title: "Quizzes", text: "Test what you have learned.", path: "/student/quizzes", icon: ClipboardCheck, tone: "gold" },
];

function StudentDashboard() {
  const progress = useProgress();
  const totals = summary(progress, technologies);
  const last = progress.last && technologies.find((t) => t.id === progress.last.technologyId);
  const lastTopic = last?.topics.find((t) => t.id === progress.last.topicId);

  const stats = [
    { label: "Technologies started", value: totals.started, note: `of ${technologies.length} available`, icon: Rocket, tone: "teal" },
    { label: "Topics completed", value: totals.topicsCompleted, note: "marked complete in lessons", icon: CheckCircle2, tone: "gold" },
    { label: "Quizzes attempted", value: totals.attempts, note: "technology knowledge checks", icon: ClipboardCheck, tone: "teal" },
    { label: "Average quiz score", value: totals.average === null ? "—" : `${totals.average}%`, note: "across all attempts", icon: Trophy, tone: "gold" },
  ];

  return (
    <StudentSidebar>
      <PageShell>
        <StudentPageHeader title="Dashboard" subtitle="Your learning activity and next steps, all in one place." />

        <Hero
          icon={GraduationCap}
          eyebrow="YOUR LEARNING WORKSPACE"
          title="Build skills. Practice. Grow."
          text="Learn each topic with clear explanations and examples, test yourself with quizzes and sharpen your answers with AI practice."
        >
          {lastTopic ? (
            <LinkButton to={`/student/topics/${last.id}/topic/${lastTopic.id}`} variant="gold" size="lg" icon={PlayCircle}>
              Continue: {lastTopic.title}
            </LinkButton>
          ) : (
            <LinkButton to="/student/topics" variant="gold" size="lg" icon={Compass}>Start learning</LinkButton>
          )}
          <LinkButton to="/student/quizzes" variant="light" size="lg" icon={ClipboardCheck}>Take a quiz</LinkButton>
        </Hero>

        {/* Stats */}
        <section className="mt-8">
          <SectionHeading title="Learning overview" subtitle="Your personal learning summary." />
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            {stats.map(({ label, value, note, icon, tone }) => (
              <Card key={label} className="p-5">
                <IconBadge icon={icon} tone={tone} />
                <p className="mt-4 text-[32px] font-extrabold leading-none tracking-tight text-[#06424B]">{value}</p>
                <p className="mt-2 text-sm font-bold text-[#2F4A4E]">{label}</p>
                <p className="mt-0.5 text-xs text-[#6C8589]">{note}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Technologies */}
        <section className="mt-9">
          <SectionHeading
            title="Choose your technology"
            subtitle="Pick one to study its lessons, then take its quiz."
            right={<LinkButton to="/student/topics" variant="outline" size="sm">View all</LinkButton>}
          />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {technologies.map((tech) => {
              const p = technologyProgress(progress, tech);
              const gold = tech.accent === "gold";
              return (
                <Link
                  key={tech.id}
                  to={`/student/topics/${tech.id}`}
                  className="group overflow-hidden rounded-2xl border border-[#D9E8E6] bg-white !no-underline shadow-[0_2px_10px_rgba(6,66,75,0.05)] transition hover:-translate-y-1 hover:border-[#FFAB0B] hover:shadow-[0_14px_30px_rgba(6,66,75,0.12)]"
                >
                  <div className={`h-1.5 ${gold ? "bg-[#FFAB0B]" : "bg-[#06424B]"}`} />
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-[#06424B]">{tech.name}</h3>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${gold ? "bg-[#FFEFC2] text-[#8A5700]" : "bg-[#E1F2F0] text-[#06424B]"}`}>{tech.topics.length} topics</span>
                    </div>
                    <p className="mt-1.5 line-clamp-2 min-h-[40px] text-[13px] leading-5 text-[#5A7478]">{tech.description}</p>
                    <ProgressBar value={p.percent} className="mt-4" />
                    <p className="mt-2 text-xs font-semibold text-[#4F6B6F]">{p.done} of {p.total} topics completed</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Learning flow */}
        <section className="mt-9">
          <SectionHeading title="Your learning path" subtitle="Follow these steps for every technology." />
          <Card className="p-5 sm:p-6">
            <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-7">
              {learningFlow.map((step, index) => (
                <li key={step} className="relative flex items-start gap-3 lg:flex-col lg:items-center lg:text-center">
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base font-extrabold ${index % 2 === 0 ? "bg-[#06424B] text-[#FFAB0B]" : "bg-[#FFAB0B] text-[#06424B]"}`}>{index + 1}</span>
                  <span className="pt-2 text-[13px] font-semibold leading-5 text-[#2F4A4E] lg:pt-0">{step}</span>
                </li>
              ))}
            </ol>
          </Card>
        </section>

        {/* Shortcuts */}
        <section className="mt-9">
          <SectionHeading title="Quick actions" subtitle="Jump straight to what you need." />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {shortcuts.map(({ title, text, path, icon, tone }) => (
              <Link key={title} to={path} className="group rounded-2xl border border-[#D9E8E6] bg-white p-5 !no-underline shadow-[0_2px_10px_rgba(6,66,75,0.05)] transition hover:-translate-y-1 hover:border-[#FFAB0B] hover:shadow-[0_14px_30px_rgba(6,66,75,0.12)]">
                <IconBadge icon={icon} tone={tone} />
                <h3 className="mt-4 text-base font-bold text-[#06424B]">{title}</h3>
                <p className="mt-1 text-[13px] leading-5 text-[#5A7478]">{text}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Activity */}
        <div className="mt-9 grid gap-5 xl:grid-cols-[1.35fr_1fr]">
          <Card className="p-5 sm:p-6">
            <SectionHeading title="Recent quiz results" subtitle="Your latest knowledge checks." />
            {progress.quizzes.length ? (
              <ul className="divide-y divide-[#EAF1F0]">
                {progress.quizzes.slice(0, 4).map((attempt, i) => {
                  const pct = Math.round((attempt.score / attempt.total) * 100);
                  return (
                    <li key={i} className="flex items-center justify-between gap-3 py-3">
                      <div>
                        <p className="text-sm font-bold text-[#2F4A4E]">{attempt.title}</p>
                        <p className="text-xs text-[#6C8589]">{new Date(attempt.date).toLocaleDateString()}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-sm font-extrabold ${pct >= 60 ? "bg-[#E1F2F0] text-[#06424B]" : "bg-[#FFEFC2] text-[#8A5700]"}`}>{attempt.score}/{attempt.total} · {pct}%</span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <EmptyState
                icon={ClipboardCheck}
                title="No quizzes attempted yet"
                text="Finish a topic and take its technology quiz. Your scores will show up here."
                action={<LinkButton to="/student/quizzes" variant="gold" iconRight={Target}>Browse quizzes</LinkButton>}
              />
            )}
          </Card>
          <Card className="p-5 sm:p-6">
            <SectionHeading title="Upcoming activity" subtitle="Classes and planned assessments." />
            <EmptyState icon={CalendarDays} tone="gold" title="Nothing scheduled yet" text="Live classes and due dates will appear here once they are added to your account." />
          </Card>
        </div>

        <footer className="mt-10 border-t border-[#D9E8E6] py-5 text-center text-xs text-[#6C8589]">
          © 2026 Skill Next Consulting Inc. · Learning without limits.
        </footer>
      </PageShell>
    </StudentSidebar>
  );
}

export default StudentDashboard;
