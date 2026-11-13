import { useParams } from "react-router-dom";
import { BookOpen, CheckCircle2, ChevronRight, ClipboardCheck, ExternalLink, PlayCircle, Target } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import StudentPageHeader from "../../components/student/StudentPageHeader";
import { BackLink, Card, Hero, LinkButton, PageShell, ProgressBar, SectionHeading } from"../../components/student/ui";
import { technologies } from "../../data/studentLearningData";
import { getQuizForTechnology } from "../../data/quizData";
import { technologyProgress, useProgress, bestScore } from "../../data/studentProgress";

function TopicDetails() {
  const { technologySlug } = useParams();
  const progress = useProgress();
  const technology = technologies.find((item) => item.id === technologySlug);

  if (!technology) {
    return (
      <Sidebar>
        <PageShell>
          <Card className="p-8">
            <h1 className="text-xl font-bold text-[#06424B]">Technology not found</h1>
            <LinkButton to="/student/topics" className="mt-4">Back to Explore Topics</LinkButton>
          </Card>
        </PageShell>
      </Sidebar>
    );
  }

  const quiz = getQuizForTechnology(technology.id);
  const p = technologyProgress(progress, technology);
  const best = quiz ? bestScore(progress, quiz.slug) : null;
  const firstTopic = technology.topics[0];

  return (
    <Sidebar>
      <PageShell max="max-w-[1250px]">
        <StudentPageHeader title={technology.name} subtitle={technology.description} />
        <BackLink to="/student/topics">All technologies</BackLink>

        <Hero eyebrow={technology.category.toUpperCase()} title={`${technology.name} learning path`} text={technology.description}>
          <LinkButton to={`/student/topics/${technology.id}/topic/${firstTopic.id}`} variant="gold" size="lg" icon={PlayCircle}>
            {p.done ? "Continue learning" : "Start first topic"}
          </LinkButton>
          {quiz && <LinkButton to={`/student/quiz/${quiz.slug}`} variant="light" size="lg" icon={ClipboardCheck}>Take {technology.name} quiz</LinkButton>}
        </Hero>

        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <SectionHeading title="Topics and lessons" subtitle="Open a topic to read lessons, see examples and mark it complete." />
            <div className="space-y-4">
              {technology.topics.map((topic, index) => {
                const done = Boolean(progress.completed[`${technology.id}/${topic.id}`]);
                return (
                  <Card key={topic.id} className={`p-5 sm:p-6 ${done ? "border-[#9FD3C8] bg-[#F5FBFA]" : ""}`}>
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                      <div className="flex items-start gap-4">
                        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-base font-extrabold ${done ? "bg-[#06424B] text-[#FFAB0B]" : "bg-[#FFEFC2] text-[#8A5700]"}`}>
                          {done ? <CheckCircle2 size={22} /> : String(index + 1).padStart(2, "0")}
                        </span>
                        <div>
                          <h3 className="text-lg font-bold text-[#06424B]">{topic.title}</h3>
                          <p className="mt-1 text-sm leading-6 text-[#4F6B6F]">{topic.summary}</p>
                        </div>
                      </div>
                      <LinkButton to={`/student/topics/${technology.id}/topic/${topic.id}`} iconRight={ChevronRight} className="self-start sm:self-center">
                        {done ? "Review topic" : "Open topic"}
                      </LinkButton>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2 border-t border-[#EAF1F0] pt-4">
                      {topic.lessons.map((lesson) => (
                        <span key={lesson} className="inline-flex items-center gap-1.5 rounded-full bg-[#F0F7F6] px-3.5 py-1.5 text-xs font-semibold text-[#3F5C60]">
                          <BookOpen size={12} className="text-[#B07A06]" />{lesson}
                        </span>
                      ))}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          <aside className="space-y-4 xl:sticky xl:top-6 xl:h-fit">
            <Card className="p-5">
              <h3 className="text-base font-bold text-[#06424B]">Your progress</h3>
              <p className="mt-3 text-4xl font-extrabold text-[#06424B]">{p.percent}%</p>
              <ProgressBar value={p.percent} className="mt-3" />
              <p className="mt-2 text-[13px] text-[#4F6B6F]">{p.done} of {p.total} topics completed</p>
            </Card>
            {quiz && (
              <Card className="border-[#F3D78B] bg-[#FFF9EA] p-5">
                <div className="flex items-center gap-2 text-[#8A5700]"><Target size={18} /><h3 className="text-base font-bold">{technology.name} quiz</h3></div>
                <p className="mt-2 text-[13px] leading-5 text-[#6F5313]">{quiz.questions.length} questions · multiple choice.{best !== null ? ` Best score: ${best}%.` : ""}</p>
                <LinkButton to={`/student/quiz/${quiz.slug}`} variant="gold" className="mt-4 w-full">Start quiz</LinkButton>
              </Card>
            )}
            <Card className="p-5">
              <h3 className="text-base font-bold text-[#06424B]">Keep exploring</h3>
              <p className="mt-2 text-[13px] leading-5 text-[#4F6B6F]">Want another explanation? Read the same topic in a public tutorial.</p>
              <LinkButton href={technology.reference} variant="outline" size="sm" iconRight={ExternalLink} className="mt-4">W3Schools {technology.name}</LinkButton>
            </Card>
          </aside>
        </div>
      </PageShell>
    </Sidebar>
  );
}

export default TopicDetails;
