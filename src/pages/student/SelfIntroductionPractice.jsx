import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, MicOff, Send, CircleHelp, Timer, Play } from "lucide-react";
import StudentSidebar from "../../components/student/StudentSidebar";
import StudentPageHeader from "../../components/student/StudentPageHeader";
import { BackLink, Btn, Card, IconBadge, Note, PageShell } from"../../components/student/ui";

const SESSION_SECONDS = 119;

function SelfIntroductionPractice() {
  const navigate = useNavigate();
  const recognitionRef = useRef(null);
  const [answer, setAnswer] = useState("");
  const [listening, setListening] = useState(false);
  const [started, setStarted] = useState(false);
  const [remaining, setRemaining] = useState(SESSION_SECONDS);
  const [voiceMessage, setVoiceMessage] = useState("You can type your response or use supported browser speech recognition.");

  useEffect(() => {
    if (!started || remaining <= 0) return undefined;
    const timerId = window.setInterval(() => {
      setRemaining((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(timerId);
  }, [started, remaining]);

  useEffect(() => {
    if (remaining === 0 && listening) {
      recognitionRef.current?.stop();
      setListening(false);
      setVoiceMessage("The practice timer has ended. Submit your response to continue.");
    }
  }, [remaining, listening]);

  useEffect(() => () => recognitionRef.current?.stop(), []);

  const toggleVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceMessage("Speech recognition is not supported in this browser. You can type your answer instead.");
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    if (remaining <= 0) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i += 1) transcript += `${event.results[i][0].transcript} `;
      setAnswer(transcript.trim());
    };
    recognition.onerror = () => {
      setListening(false);
      setVoiceMessage("Voice capture stopped. You can continue by typing.");
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
    setVoiceMessage("Listening in English (en-US). Select the microphone again to stop.");
  };

  const submit = () => {
    recognitionRef.current?.stop();
    setListening(false);
    navigate("/student/ai-practice/feedback", {
      state: {
        title: "Self-Introduction Practice",
        answer,
        note: "Your response is ready for AI evaluation. Connect the Skill Next question and evaluation APIs to generate real feedback and scores.",
      },
    });
  };

  const minutes = String(Math.floor(remaining / 60)).padStart(2, "0");
  const seconds = String(remaining % 60).padStart(2, "0");

  return (
    <StudentSidebar>
      <PageShell max="max-w-[1050px]">
        <StudentPageHeader title="Self-Introduction Evaluation" subtitle="Practise a clear and confident professional introduction." />
        <BackLink to="/student/ai-practice">AI Practice</BackLink>

        {!started ? (
          <Card className="p-6 sm:p-9">
            <IconBadge icon={CircleHelp} size="lg" />
            <p className="mt-5 text-xs font-bold tracking-[1.3px] text-[#B07A06]">SELF-INTRODUCTION PRACTICE</p>
            <h1 className="mt-2 text-3xl font-extrabold text-[#06424B]">Tell us about yourself.</h1>
            <p className="mt-3 max-w-[660px] text-[15px] leading-7 text-[#4F6B6F]">You will have 119 seconds for this practice response. Introduce your education, technical skills, projects and the kind of opportunity you are preparing for.</p>
            <div className="mt-6 rounded-2xl bg-[#FFF7DF] p-5">
              <p className="text-sm font-bold text-[#7A5410]">A simple structure to follow</p>
              <ol className="mt-3 list-inside list-decimal space-y-2 text-[15px] leading-6 text-[#6F5313]">
                <li>Your name and educational background.</li>
                <li>Relevant technical skills and projects.</li>
                <li>Your strengths and what you want to learn next.</li>
              </ol>
            </div>
            <Btn variant="gold" size="lg" icon={Play} onClick={() => setStarted(true)} className="mt-6">Begin assessment</Btn>
          </Card>
        ) : (
          <Card className="p-5 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAF1F0] pb-5">
              <div>
                <p className="text-xs font-bold tracking-[1.3px] text-[#B07A06]">QUESTION 01</p>
                <h1 className="mt-1 text-2xl font-extrabold text-[#06424B]">Tell us about yourself.</h1>
              </div>
              <div className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-base font-extrabold ${remaining <= 15 ? "bg-[#FFE8D9] text-[#B4501F]" : "bg-[#E1F2F0] text-[#06424B]"}`}><Timer size={18} /> {minutes}:{seconds}</div>
            </div>
            <p className="mt-4 text-[15px] leading-7 text-[#4F6B6F]">Speak naturally or type your answer. The transcript will appear in the response area.</p>
            <label className="mt-5 block text-sm font-bold text-[#2F4A4E]">Your answer / voice transcript</label>
            <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} rows={8} placeholder="Type your introduction here, or use the microphone to dictate…" className="mt-2 w-full resize-y rounded-2xl border-2 border-[#CFE2E0] bg-white p-4 text-[15px] leading-7 text-[#2F4A4E] outline-none placeholder:text-[#8AA0A3] focus:border-[#06424B] focus:ring-4 focus:ring-[#FFAB0B]/25" />
            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Btn variant={listening ? "soft" : "outline"} icon={listening ? MicOff : Mic} onClick={toggleVoice} disabled={remaining === 0}>{listening ? "Stop recording" : "Use microphone"}</Btn>
                <p className="mt-2 text-xs text-[#6C8589]">{voiceMessage}</p>
              </div>
              <Btn variant="gold" iconRight={Send} onClick={submit} disabled={!answer.trim()}>Submit response</Btn>
            </div>
          </Card>
        )}
        <Note className="mt-5">The 119-second timer and browser speech-to-text are frontend behaviours. AI question delivery, transcript submission and scoring need Skill Next backend integration.</Note>
      </PageShell>
    </StudentSidebar>
  );
}

export default SelfIntroductionPractice;
