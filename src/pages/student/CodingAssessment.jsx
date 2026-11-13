import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Code2, Play, Send, ShieldCheck, Terminal } from "lucide-react";
import StudentSidebar from "../../components/student/StudentSidebar";
import StudentPageHeader from "../../components/student/StudentPageHeader";
import { BackLink, Btn, Card, IconBadge, Note, PageShell } from"../../components/student/ui";

const defaultQuestion = "Create a reusable React component named ProfileCard that accepts a name prop and displays the name inside a heading.";
const defaultCode = "function ProfileCard({ name }) {\n  // Write your component here\n}\n\nexport default ProfileCard;";

function CodingAssessment() {
  const { state } = useLocation();
  const [language, setLanguage] = useState("JavaScript");
  const [code, setCode] = useState(state?.starterCode || defaultCode);
  const [runnerMessage, setRunnerMessage] = useState("Run your solution to see output and test-case results here.");
  const [submitMessage, setSubmitMessage] = useState("");

  const handleRun = () => {
    setRunnerMessage("Secure code execution is not connected yet. Connect a sandboxed code-runner API before enabling execution.");
  };

  const handleSubmit = () => {
    setSubmitMessage("Your code is ready for submission. Connect the Skill Next coding evaluation API to run test cases and return an evaluation.");
  };

  return (
    <StudentSidebar>
      <PageShell max="max-w-[1500px]">
        <StudentPageHeader title="Coding Assessment" subtitle="Solve the coding question in the editor and review the execution results." />
        <BackLink to="/student/ai-practice/topic-theory">Back to AI practice</BackLink>

        <div className="grid gap-5 xl:grid-cols-[minmax(300px,0.8fr)_minmax(0,1.5fr)]">
          <Card className="p-6">
            <div className="flex items-center gap-3"><IconBadge icon={Code2} size="sm" /><span className="text-base font-bold text-[#06424B]">Coding question</span></div>
            <p className="mt-5 text-xs font-bold tracking-[1.3px] text-[#B07A06]">{(state?.technology || "React").toUpperCase()} · {(state?.topic || "Components").toUpperCase()} · {(state?.difficulty || "Easy").toUpperCase()}</p>
            <h1 className="mt-2 text-2xl font-extrabold leading-8 text-[#06424B]">Implement the required solution</h1>
            <p className="mt-3 text-[15px] leading-7 text-[#3F5C60]">{state?.question || defaultQuestion}</p>
            <div className="mt-6 rounded-2xl bg-[#F0F7F6] p-5">
              <p className="text-sm font-bold text-[#2F4A4E]">Assessment guidance</p>
              <ul className="mt-2 list-inside list-disc space-y-1.5 text-sm leading-6 text-[#4F6B6F]"><li>Write a readable and reusable solution.</li><li>Consider the expected inputs and output.</li><li>Run the test cases before submitting.</li></ul>
            </div>
            <Note icon={ShieldCheck} className="mt-5">Code execution must run in an isolated server-side sandbox, never with eval in the browser.</Note>
          </Card>

          <section className="overflow-hidden rounded-2xl border border-[#173740] bg-[#0F2F36] shadow-[0_12px_30px_rgba(6,66,75,0.18)]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-[#143B44] px-4 py-3">
              <div className="flex items-center gap-2 text-white"><Code2 size={17} className="text-[#FFAB0B]" /><span className="text-sm font-bold">Code editor</span></div>
              <select value={language} onChange={(e) => setLanguage(e.target.value)} className="h-9 rounded-lg border border-white/20 bg-[#0F2F36] px-3 text-[13px] font-medium text-white outline-none"><option>JavaScript</option><option>Python</option><option>Java</option><option>SQL</option></select>
            </div>
            <div className="grid min-h-[360px] grid-cols-[46px_minmax(0,1fr)]">
              <div className="select-none bg-[#0B2329] px-3 py-4 text-right font-mono text-[12px] leading-6 text-[#6F8E96]">{code.split("\n").map((_, i) => <div key={i}>{i + 1}</div>)}</div>
              <textarea spellCheck="false" value={code} onChange={(e) => setCode(e.target.value)} aria-label="Code editor" className="min-h-[360px] w-full resize-y bg-[#0F2F36] p-4 font-mono text-[13px] leading-6 text-[#E4F0EF] outline-none" />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-[#143B44] px-4 py-3">
              <span className="text-xs text-[#A9C1C6]">{language} · {code.split("\n").length} lines</span>
              <div className="flex gap-2">
                <Btn size="sm" variant="light" icon={Play} onClick={handleRun}>Run code</Btn>
                <Btn size="sm" variant="gold" icon={Send} onClick={handleSubmit}>Submit</Btn>
              </div>
            </div>
            <div className="border-t border-white/10 bg-[#0B2329] p-4">
              <div className="flex items-center gap-2 text-[#E4F0EF]"><Terminal size={15} /><span className="text-sm font-bold">Output / Test results</span></div>
              <p className="mt-2 text-[13px] leading-6 text-[#A9C1C6]">{runnerMessage}</p>
              {submitMessage && <p className="mt-3 rounded-xl border border-[#FFAB0B]/30 bg-[#FFAB0B]/10 p-3 text-[13px] leading-6 text-[#FFE2A0]">{submitMessage}</p>}
            </div>
          </section>
        </div>
      </PageShell>
    </StudentSidebar>
  );
}

export default CodingAssessment;
