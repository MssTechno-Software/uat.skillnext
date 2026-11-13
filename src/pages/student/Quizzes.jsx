import { ArrowUpRight, Clock3, ClipboardCheck, ListChecks, Trophy } from "lucide-react";
import StudentSidebar from "../../components/student/StudentSidebar";
import StudentPageHeader from "../../components/student/StudentPageHeader";
import { Card, Hero, IconBadge, LinkButton, PageShell } from"../../components/student/ui";
import { quizzes } from "../../data/quizData";
import { technologies } from "../../data/studentLearningData";
import { bestScore, useProgress } from "../../data/studentProgress";

function Quizzes() {
  const progress = useProgress();
  return (
    <StudentSidebar>
      <PageShell max="max-w-[1300px]">
        <StudentPageHeader title="Quizzes & Assessments" subtitle="Test your understanding after studying each technology." />
        <Hero
          icon={ClipboardCheck}
          eyebrow="KNOWLEDGE CHECKS"
          title="Check what you have learned"
          text="Each technology has its own quiz. Answer one question at a time, then review every answer with an explanation."
        />

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {quizzes.map((quiz) => {
            const tech = technologies.find((t) => t.id === quiz.technologyId);
            const best = bestScore(progress, quiz.slug);
            const gold = tech?.accent === "gold";
            return (
              <Card key={quiz.slug} className="flex flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(6,66,75,0.12)]">
                <div className={`h-1.5 ${gold ? "bg-[#FFAB0B]" : "bg-[#06424B]"}`} />
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-start justify-between">
                    <IconBadge icon={ListChecks} tone={gold ? "gold" : "teal"} />
                    {best !== null && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E1F2F0] px-3 py-1 text-xs font-bold text-[#06424B]"><Trophy size={13} className="text-[#B07A06]" /> Best {best}%</span>
                    )}
                  </div>
                  <p className="mt-4 text-xs font-bold tracking-wider text-[#B07A06]">{tech?.name.toUpperCase()} · {tech?.category.toUpperCase()}</p>
                  <h3 className="mt-1 text-xl font-extrabold text-[#06424B]">{quiz.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-[#4F6B6F]">{quiz.description}</p>
                  <p className="mt-4 flex items-center gap-2 text-[13px] font-semibold text-[#3F5C60]"><Clock3 size={15} /> {quiz.questions.length} questions · Multiple choice</p>
                  <LinkButton to={`/student/quiz/${quiz.slug}`} variant={best !== null ? "outline" : "primary"} iconRight={ArrowUpRight} className="mt-5 w-full">
                    {best !== null ? "Retake quiz" : "Start quiz"}
                  </LinkButton>
                </div>
              </Card>
            );
          })}
        </div>
      </PageShell>
    </StudentSidebar>
  );
}

export default Quizzes;
