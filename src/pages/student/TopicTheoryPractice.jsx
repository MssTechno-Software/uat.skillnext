import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Brain, Code2, MessageSquareText, Mic, MicOff, SkipForward, Timer } from "lucide-react";
import StudentSidebar from "../../components/student/StudentSidebar";
import StudentPageHeader from "../../components/student/StudentPageHeader";
import { BackLink, Btn, Card, IconBadge, Note, PageShell } from"../../components/student/ui";
import { technologies } from "../../data/studentLearningData";

const QUESTION_SECONDS = 119;

function TopicTheoryPractice() {
  const navigate = useNavigate();
  const recognitionRef = useRef(null);
  const [technologyId, setTechnologyId] = useState("react");
  const [topicId, setTopicId] = useState("components");
  const [difficulty, setDifficulty] = useState("Easy");
  const [started, setStarted] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [remaining, setRemaining] = useState(QUESTION_SECONDS);
  const [listening, setListening] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState("Type your answer or use speech input in a supported browser.");
  const [sessionMessage, setSessionMessage] = useState("");

  const technology = technologies.find((item) => item.id === technologyId) || technologies[0];
  const availableTopics = technology.topics;
  const topic = useMemo(
    () => availableTopics.find((item) => item.id === topicId) || availableTopics[0],
    [availableTopics, topicId]
  );

  const questions = useMemo(() => {
    const codingFirst = technologyId === "react" && topicId === "components";
    const firstQuestion = codingFirst
      ? {
          type: "coding",
          text: "Create a reusable React component named ProfileCard that accepts a name prop and displays the name inside a heading.",
        }
      : {
          type: "theory",
          text: `Explain ${topic.title.toLowerCase()} in your own words and describe one practical situation where it is useful.`,
        };
    return [
      firstQuestion,
      {
        type: "theory",
        text: `What is one important concept or best practice related to ${topic.title.toLowerCase()}? Explain why it matters.`,
      },
    ];
  }, [technologyId, topicId, topic.title]);

  const currentQuestion = questions[questionIndex];

  useEffect(() => {
    if (!started || !currentQuestion || currentQuestion.type === "coding" || remaining <= 0) return undefined;
    const timerId = window.setInterval(() => setRemaining((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timerId);
  }, [started, currentQuestion, remaining]);

  useEffect(() => {
    if (remaining === 0 && listening) {
      recognitionRef.current?.stop();
      setListening(false);
      setVoiceMessage("The question timer has ended. Submit or skip this question.");
    }
  }, [remaining, listening]);

  useEffect(() => () => recognitionRef.current?.stop(), []);

  const startPractice = () => {
    setStarted(true);
    setQuestionIndex(0);
    setAnswer("");
    setRemaining(QUESTION_SECONDS);
    setSessionMessage("");
  };

  const toggleVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceMessage("Speech recognition is not supported in this browser. Type your answer instead.");
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
      setVoiceMessage("Voice capture stopped. You can continue typing.");
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
    setVoiceMessage("Listening in English (en-US). Select the microphone again to stop.");
  };

  const openCodingPanel = () => navigate("/student/ai-practice/coding", {
    state: {
      technology: technology.name,
      topic: topic.title,
      difficulty,
      question: currentQuestion.text,
      starterCode: "function ProfileCard({ name }) {\n  // Write your component here\n}\n\nexport default ProfileCard;",
    },
  });

  const submitAnswer = () => {
    recognitionRef.current?.stop();
    setListening(false);
    navigate("/student/ai-practice/feedback", {
      state: {
        title: `${technology.name} · ${topic.title}`,
        answer,
        question: currentQuestion.text,
        note: "Your response is ready for AI evaluation. Connect the Skill Next topic-theory API to receive actual evaluation and feedback.",
      },
    });
  };

  const skipQuestion = () => {
    recognitionRef.current?.stop();
    setListening(false);
    if (questionIndex < questions.length - 1) {
      setQuestionIndex((value) => value + 1);
      setAnswer("");
      setRemaining(QUESTION_SECONDS);
      setVoiceMessage("Type your answer or use speech input in a supported browser.");
    } else {
      setSessionMessage("The preview question set is complete. In the live system, the backend records this skip and supplies the next available question or final feedback.");
    }
  };

  const minutes = String(Math.floor(remaining / 60)).padStart(2, "0");
  const seconds = String(remaining % 60).padStart(2, "0");

  const select = "mt-2 h-12 w-full rounded-xl border-2 border-[#CFE2E0] bg-white px-3 text-sm font-medium text-[#2F4A4E] outline-none focus:border-[#06424B] focus:ring-4 focus:ring-[#FFAB0B]/25";

  return (
    <StudentSidebar>
      <PageShell max="max-w-[1050px]">
        <StudentPageHeader title="Topic-Specific AI Practice" subtitle="Choose a technology, subtopic and difficulty before starting practice." />
        <BackLink to="/student/ai-practice">AI Practice</BackLink>

        <Card className="p-5 sm:p-8">
          <div className="flex items-center gap-4">
            <IconBadge icon={Brain} />
            <div><h1 className="text-xl font-bold text-[#06424B]">Configure your practice</h1><p className="text-sm text-[#5A7478]">Select the area you want to practise.</p></div>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-3">
            <label className="text-sm font-bold text-[#3F5C60]">Technology
              <select value={technologyId} onChange={(e) => { const next = technologies.find((item) => item.id === e.target.value); setTechnologyId(e.target.value); setTopicId(next?.topics[0]?.id || ""); setStarted(false); }} className={select}>{technologies.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
            </label>
            <label className="text-sm font-bold text-[#3F5C60]">Topic / subtopic
              <select value={topicId} onChange={(e) => { setTopicId(e.target.value); setStarted(false); }} className={select}>{availableTopics.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select>
            </label>
            <label className="text-sm font-bold text-[#3F5C60]">Difficulty
              <select value={difficulty} onChange={(e) => { setDifficulty(e.target.value); setStarted(false); }} className={select}><option>Easy</option><option>Medium</option><option>Hard</option></select>
            </label>
          </div>
          <Btn variant="gold" iconRight={ArrowRight} onClick={startPractice} className="mt-6">Start practice</Btn>
        </Card>

        {started && currentQuestion && (
          <Card className="mt-5 p-5 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold tracking-[1.3px] text-[#B07A06]">{technology.name.toUpperCase()} · {difficulty.toUpperCase()}</p>
                <h2 className="mt-1 text-2xl font-extrabold text-[#06424B]">{topic.title}</h2>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-[#EAF3F2] px-4 py-2 text-xs font-bold text-[#3F5C60]">Question {questionIndex + 1} of {questions.length}</span>
                {currentQuestion.type !== "coding" && <span className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-extrabold ${remaining <= 15 ? "bg-[#FFE8D9] text-[#B4501F]" : "bg-[#E1F2F0] text-[#06424B]"}`}><Timer size={15} /> {minutes}:{seconds}</span>}
              </div>
            </div>

            <div className={`mt-5 rounded-2xl p-5 ${currentQuestion.type === "coding" ? "border border-[#F3D78B] bg-[#FFF7DF]" : "bg-[#F0F7F6]"}`}>
              <div className="flex items-center gap-2">
                {currentQuestion.type === "coding" ? <Code2 size={18} className="text-[#B07A06]" /> : <MessageSquareText size={18} className="text-[#06424B]" />}
                <p className="text-sm font-bold text-[#2F4A4E]">{currentQuestion.type === "coding" ? "Coding question" : "AI theory question"}</p>
              </div>
              <p className="mt-3 text-[17px] font-medium leading-8 text-[#2F4A4E]">{currentQuestion.text}</p>
              {currentQuestion.type === "coding" && <Btn iconRight={ArrowRight} onClick={openCodingPanel} className="mt-4">Open coding workspace</Btn>}
            </div>

            {currentQuestion.type === "theory" && (
              <>
                <label className="mt-5 block text-sm font-bold text-[#2F4A4E]">Your answer / voice transcript</label>
                <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} rows={6} placeholder="Write your explanation or dictate your answer…" className="mt-2 w-full rounded-2xl border-2 border-[#CFE2E0] p-4 text-[15px] leading-7 text-[#2F4A4E] outline-none placeholder:text-[#8AA0A3] focus:border-[#06424B] focus:ring-4 focus:ring-[#FFAB0B]/25" />
                <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <Btn size="sm" variant={listening ? "soft" : "outline"} icon={listening ? MicOff : Mic} onClick={toggleVoice} disabled={remaining === 0}>{listening ? "Stop voice input" : "Use microphone"}</Btn>
                    <p className="mt-2 text-xs text-[#6C8589]">{voiceMessage}</p>
                  </div>
                  <div className="flex gap-3">
                    <Btn variant="outline" icon={SkipForward} onClick={skipQuestion}>Skip</Btn>
                    <Btn variant="gold" iconRight={ArrowRight} onClick={submitAnswer} disabled={!answer.trim()}>Submit answer</Btn>
                  </div>
                </div>
              </>
            )}
            {currentQuestion.type === "coding" && <div className="mt-4 flex justify-end"><Btn variant="outline" icon={SkipForward} onClick={skipQuestion}>Skip question</Btn></div>}
            {sessionMessage && <Note className="mt-4">{sessionMessage}</Note>}
          </Card>
        )}
        <p className="mt-5 text-xs leading-5 text-[#6C8589]">Flow: technology → subtopic → difficulty (Easy / Medium / Hard) → question → answer or skip → feedback, with a 119-second answer timer. Real question retrieval, attempt status and evaluation need Skill Next API integration.</p>
      </PageShell>
    </StudentSidebar>
  );
}

export default TopicTheoryPractice;
