import { Link } from "react-router-dom";
import { BookOpen, Compass, PlayCircle } from "lucide-react";
import StudentSidebar from "../../components/student/StudentSidebar";
import StudentPageHeader from "../../components/student/StudentPageHeader";
import { Card, EmptyState, IconBadge, LinkButton, PageShell, ProgressBar, SectionHeading } from"../../components/student/ui";
import { technologies } from "../../data/studentLearningData";
import { technologyProgress, useProgress } from "../../data/studentProgress";

function MyLearning() {
  const progress = useProgress();
  const started = technologies.filter((tech) => {
    const done = technologyProgress(progress, tech).done;
    return done > 0 || progress.last?.technologyId === tech.id;
  });

  return (
    <StudentSidebar>
      <PageShell>
        <StudentPageHeader title="My Learning" subtitle="Your learning paths, lessons and completion status." />

        {started.length === 0 ? (
          <Card className="p-6 sm:p-9">
            <EmptyState
              icon={BookOpen}
              title="Your learning space is ready"
              text="Open any topic and it will appear here with your progress and the next step to continue."
              action={<LinkButton to="/student/topics" variant="gold" icon={Compass}>Explore topics</LinkButton>}
            />
          </Card>
        ) : (
          <>
            <SectionHeading title="In progress" subtitle="Pick up where you left off." />
            <div className="grid gap-4 lg:grid-cols-2">
              {started.map((tech) => {
                const p = technologyProgress(progress, tech);
                const next = tech.topics.find((topic) => !progress.completed[`${tech.id}/${topic.id}`]) || tech.topics[0];
                return (
                  <Card key={tech.id} className="p-6">
                    <div className="flex items-center gap-4">
                      <IconBadge icon={BookOpen} tone={tech.accent === "gold" ? "gold" : "teal"} size="lg" />
                      <div className="min-w-0 flex-1">
                        <h3 className="text-xl font-bold text-[#06424B]">{tech.name}</h3>
                        <p className="text-[13px] text-[#5A7478]">{p.done} of {p.total} topics completed</p>
                      </div>
                      <span className="text-2xl font-extrabold text-[#06424B]">{p.percent}%</span>
                    </div>
                    <ProgressBar value={p.percent} className="mt-4" />
                    <p className="mt-4 text-sm text-[#2F4A4E]">Next up: <strong className="text-[#06424B]">{next.title}</strong></p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <LinkButton to={`/student/topics/${tech.id}/topic/${next.id}`} icon={PlayCircle}>Continue</LinkButton>
                      <LinkButton to={`/student/topics/${tech.id}`} variant="outline">All topics</LinkButton>
                    </div>
                  </Card>
                );
              })}
            </div>
            <p className="mt-6 text-sm text-[#5A7478]">
              Want to learn something new? <Link to="/student/topics" className="font-bold !text-[#06424B] underline decoration-[#FFAB0B] decoration-2 underline-offset-4">Explore all technologies</Link>
            </p>
          </>
        )}
      </PageShell>
    </StudentSidebar>
  );
}

export default MyLearning;
