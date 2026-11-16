
import {
  ArrowUpRight,
  Brain,
  MessageSquareText,
  Mic2,
  Sparkles,
} from "lucide-react";

import Sidebar from "../../components/Sidebar";
import StudentPageHeader from "../../components/student/StudentPageHeader";

import {
  Card,
  Hero,
  IconBadge,
  LinkButton,
  Note,
  PageShell,
} from "../../components/student/ui";

const chip =
  "rounded-full bg-[#EAF3F2] px-3.5 py-1.5 text-xs font-semibold text-[#3F5C60]";

function AIPractice() {
  return (
    <Sidebar>
      <PageShell max="max-w-[1250px]">
        <StudentPageHeader
          title="Interview Prep"
          subtitle="Prepare for professional conversations with guided interview practice and clear feedback."
        />

        <Hero
          icon={Sparkles}
          eyebrow="SKILL NEXT · INTERVIEW PREPARATION"
          title="Build confidence before your next interview"
          text="Practise a professional self-introduction or take a course-specific theory interview using only the courses you have added to My Learning."
        />

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <Card className="overflow-hidden transition hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(6,66,75,0.12)]">
            <div className="h-1.5 bg-[#06424B]" />

            <div className="p-6 sm:p-7">
              <IconBadge icon={Mic2} size="lg" />

              <p className="mt-5 text-xs font-bold tracking-[1.3px] text-[#B07A06]">
                INTERVIEW MODE 01
              </p>

              <h3 className="mt-1 text-2xl font-extrabold text-[#06424B]">
                Common Self-Introduction
              </h3>

              <p className="mt-3 min-h-[72px] text-[15px] leading-7 text-[#4F6B6F]">
                Practise a confident introduction covering your background,
                skills, projects, strengths and career goals. Speak or type
                your response and review the transcript.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className={chip}>Common interview question</span>
                <span className={chip}>Voice / transcript</span>
                <span className={chip}>119 seconds</span>
              </div>

              <LinkButton
                to="/student/ai-practice/self-introduction"
                iconRight={ArrowUpRight}
                className="mt-6"
              >
                Start self-introduction
              </LinkButton>
            </div>
          </Card>

          <Card className="overflow-hidden transition hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(6,66,75,0.12)]">
            <div className="h-1.5 bg-[#FFAB0B]" />

            <div className="p-6 sm:p-7">
              <IconBadge icon={MessageSquareText} tone="gold" size="lg" />

              <p className="mt-5 text-xs font-bold tracking-[1.3px] text-[#B07A06]">
                INTERVIEW MODE 02
              </p>

              <h3 className="mt-1 text-2xl font-extrabold text-[#06424B]">
                Course-Specific AI Theory
              </h3>

              <p className="mt-3 min-h-[72px] text-[15px] leading-7 text-[#4F6B6F]">
                Select an enrolled course, choose one of its subtopics and
                practise ten spoken theory questions. Review your transcript
                and guided feedback after each answer.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className={chip}>Enrolled courses only</span>
                <span className={chip}>Easy / Medium / Hard</span>
                <span className={chip}>Mixed by default</span>
                <span className={chip}>Theory only</span>
              </div>

              <LinkButton
                to="/student/ai-practice/topic-theory"
                variant="gold"
                iconRight={ArrowUpRight}
                className="mt-6"
              >
                Choose course and topic
              </LinkButton>
            </div>
          </Card>
        </div>

        <Note icon={Brain} className="mt-6">
          Voice transcription uses the browser speech-recognition feature when
          supported. The current source includes a topic-based interview
          question set and guided response review; live AI question generation
          and semantic evaluation require the Skill Next interview API.
        </Note>
      </PageShell>
    </Sidebar>
  );
}

export default AIPractice;
