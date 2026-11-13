import { ArrowUpRight, Brain, MessageSquareText, Mic2, Sparkles } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import StudentPageHeader from "../../components/student/StudentPageHeader";
import { Card, Hero, IconBadge, LinkButton, Note, PageShell } from"../../components/student/ui";

const chip = "rounded-full bg-[#EAF3F2] px-3.5 py-1.5 text-xs font-semibold text-[#3F5C60]";

function AIPractice() {
  return (
    <Sidebar>
      <PageShell max="max-w-[1250px]">
        <StudentPageHeader title="AI Practice" subtitle="Practise with guided questions and review feedback on your answers." />
        <Hero icon={Sparkles} eyebrow="PRACTICE WITH PURPOSE" title="Strengthen your confidence with AI practice" text="Choose a self-introduction exercise or practise theory for a selected technology and subtopic. Coding questions open a dedicated code workspace." />

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <Card className="overflow-hidden transition hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(6,66,75,0.12)]">
            <div className="h-1.5 bg-[#06424B]" />
            <div className="p-6 sm:p-7">
              <IconBadge icon={Mic2} size="lg" />
              <p className="mt-5 text-xs font-bold tracking-[1.3px] text-[#B07A06]">PRACTICE MODE 01</p>
              <h3 className="mt-1 text-2xl font-extrabold text-[#06424B]">Self-Introduction Evaluation</h3>
              <p className="mt-3 min-h-[72px] text-[15px] leading-7 text-[#4F6B6F]">Answer guided introduction prompts. Speak or type your response, review the transcript and get feedback.</p>
              <div className="mt-4 flex flex-wrap gap-2"><span className={chip}>Introduction prompts</span><span className={chip}>Voice / transcript</span><span className={chip}>119 seconds</span></div>
              <LinkButton to="/student/ai-practice/self-introduction" iconRight={ArrowUpRight} className="mt-6">Start practice</LinkButton>
            </div>
          </Card>

          <Card className="overflow-hidden transition hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(6,66,75,0.12)]">
            <div className="h-1.5 bg-[#FFAB0B]" />
            <div className="p-6 sm:p-7">
              <IconBadge icon={MessageSquareText} tone="gold" size="lg" />
              <p className="mt-5 text-xs font-bold tracking-[1.3px] text-[#B07A06]">PRACTICE MODE 02</p>
              <h3 className="mt-1 text-2xl font-extrabold text-[#06424B]">Topic-Specific AI Theory</h3>
              <p className="mt-3 min-h-[72px] text-[15px] leading-7 text-[#4F6B6F]">Select a technology, subtopic and difficulty. Answer AI-guided questions, skip when needed and review feedback.</p>
              <div className="mt-4 flex flex-wrap gap-2"><span className={chip}>Easy / Medium / Hard</span><span className={chip}>Theory + coding</span></div>
              <LinkButton to="/student/ai-practice/topic-theory" variant="gold" iconRight={ArrowUpRight} className="mt-6">Choose topic</LinkButton>
            </div>
          </Card>
        </div>

        <Note icon={Brain} className="mt-6">
          This is the frontend workflow. AI question generation, speech processing and evaluation need the Skill Next backend / API to be connected.
        </Note>
      </PageShell>
    </Sidebar>
  );
}

export default AIPractice;
