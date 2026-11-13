import { BarChart3, BookOpen, CheckCircle2, ClipboardCheck, Trophy } from "lucide-react";
import StudentSidebar from "../../components/student/StudentSidebar";
import StudentPageHeader from "../../components/student/StudentPageHeader";
import { Card, EmptyState, IconBadge, LinkButton, PageShell, ProgressBar, SectionHeading } from"../../components/student/ui";
import { technologies } from "../../data/studentLearningData";
import { summary, technologyProgress, useProgress } from "../../data/studentProgress";

function MyProgress() {
  const progress = useProgress();
  const totals = summary(progress, technologies);
  const totalTopics = technologies.reduce((sum, t) => sum + t.topics.length, 0);

  const metrics = [
    { label: "Topics completed", value: `${totals.topicsCompleted}/${totalTopics}`, icon: CheckCircle2, tone: "teal" },
    { label: "Quizzes attempted", value: totals.attempts, icon: ClipboardCheck, tone: "gold" },
    { label: "Average quiz score", value: totals.average === null ? "—" : `${totals.average}%`, icon: Trophy, tone: "teal" },
  ];

  return (
    <StudentSidebar>
      <PageShell max="max-w-[1300px]">
        <StudentPageHeader title="My Progress" subtitle="Track completed topics, quiz results and your learning activity." />

        <div className="grid gap-4 sm:grid-cols-3">
          {metrics.map(({ label, value, icon, tone }) => (
            <Card key={label} className="p-5">
              <IconBadge icon={icon} tone={tone} />
              <p className="mt-4 text-[32px] font-extrabold leading-none text-[#06424B]">{value}</p>
              <p className="mt-2 text-sm font-semibold text-[#3F5C60]">{label}</p>
            </Card>
          ))}
        </div>

        <div className="mt-8 grid gap-5 xl:grid-cols-2">
          <Card className="p-5 sm:p-6">
            <SectionHeading title="Topic progress" subtitle="Completion for each technology." />
            <div className="space-y-5">
              {technologies.map((tech) => {
                const p = technologyProgress(progress, tech);
                return (
                  <div key={tech.id}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="font-bold text-[#06424B]">{tech.name}</span>
                      <span className="font-semibold text-[#4F6B6F]">{p.done}/{p.total} · {p.percent}%</span>
                    </div>
                    <ProgressBar value={p.percent} />
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <SectionHeading title="Assessment history" subtitle="Your latest quiz attempts." />
            {progress.quizzes.length ? (
              <ul className="divide-y divide-[#EAF1F0]">
                {progress.quizzes.slice(0, 8).map((attempt, i) => {
                  const pct = Math.round((attempt.score / attempt.total) * 100);
                  return (
                    <li key={i} className="flex items-center justify-between gap-3 py-3">
                      <div>
                        <p className="text-sm font-bold text-[#2F4A4E]">{attempt.title}</p>
                        <p className="text-xs text-[#6C8589]">{new Date(attempt.date).toLocaleString()}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-sm font-extrabold ${pct >= 60 ? "bg-[#E1F2F0] text-[#06424B]" : "bg-[#FFEFC2] text-[#8A5700]"}`}>{pct}%</span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <EmptyState icon={BarChart3} tone="gold" title="No assessment history yet" text="Your quiz scores will be listed here after you take a quiz." action={<LinkButton to="/student/quizzes" variant="gold">Take a quiz</LinkButton>} />
            )}
          </Card>
        </div>

        <LinkButton to="/student/topics" icon={BookOpen} className="mt-6">Continue learning</LinkButton>
        <p className="mt-4 text-xs text-[#6C8589]">Progress is stored in this browser until the Skill Next progress API is connected.</p>
      </PageShell>
    </StudentSidebar>
  );
}

export default MyProgress;
