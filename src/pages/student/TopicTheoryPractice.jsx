import { translateValue } from "../../i18n";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Check, Mic, MicOff, Send, SkipForward, Timer, Award, RotateCcw, BookOpen } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

 
import { PageShell } from "../../components/student/ui";
import { courseCategories, technologies } from "../../data/studentLearningData";
import { useEnrolledCourses } from "../../data/studentCourseEnrollment";
import { buildGuidedAnswerFeedback } from "../../data/interviewPrepData";
import { clearInterviewSession, readInterviewSession, saveInterviewFeedback, saveInterviewSession } from "../../data/interviewPrepSession";

const QUESTION_SECONDS = 119;
const FEEDBACK_PATH = "/student/ai-practice/feedback";

function TopicTheoryPractice() {
  const navigate = useNavigate();
  const location = useLocation();
  const recognitionRef = useRef(null);
  const { enrolledCourseIds } = useEnrolledCourses();
  const [session, setSession] = useState(() => readInterviewSession());
  const [answer, setAnswer] = useState("");
  const [remaining, setRemaining] = useState(QUESTION_SECONDS);
  const [listening, setListening] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState("Use the microphone to speak or type directly into this transcript area.");

  useEffect(() => {
    const saved = readInterviewSession();
    if (saved) setSession(saved);
  }, [location.key]);

  useEffect(() => {
    if (!session) {
      navigate("/student/ai-practice/topic-theory", { replace: true });
      return;
    }
    if (!enrolledCourseIds.includes(session.courseId)) {
      clearInterviewSession();
      navigate("/student/ai-practice/topic-theory", { replace: true });
    }
  }, [session, enrolledCourseIds, navigate]);

  const currentQuestion = session?.questions?.[session.questionIndex] || null;
  const responses = session?.responses || [];
  const course = useMemo(
    () => courseCategories.find((item) => item.id === session?.courseId && item.type === "vocational")
      || technologies.find((item) => item.id === session?.courseId),
    [session?.courseId]
  );
  const title = [session?.courseName, session?.technologyName, session?.topicTitle]
    .filter(Boolean)
    .map((value) => translateValue(value))
    .join(" · ");
  const isCompleted = Boolean(session?.completed);

  useEffect(() => {
    if (!session || isCompleted || !currentQuestion) return undefined;
    setRemaining(QUESTION_SECONDS);
    const timerId = window.setInterval(() => {
      setRemaining((value) => {
        if (value <= 1) {
          window.clearInterval(timerId);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(timerId);
  }, [session?.questionIndex, Boolean(session), isCompleted, currentQuestion?.id]);

  useEffect(() => {
    if (remaining === 0 && listening) {
      recognitionRef.current?.stop();
      setListening(false);
      setVoiceMessage("Time is up. Submit the captured answer or skip this question.");
    }
  }, [remaining, listening]);

  useEffect(() => () => {
    const activeRecognition = recognitionRef.current;
    recognitionRef.current = null;
    if (activeRecognition) {
      try {
        activeRecognition.stop();
      } catch {
        // Speech recognition may already have stopped when the route changes.
      }
    }
  }, []);

  const stopVoice = () => {
    const activeRecognition = recognitionRef.current;
    recognitionRef.current = null;
    if (activeRecognition) {
      activeRecognition.onend = null;
      try {
        activeRecognition.stop();
      } catch {
        // Ignore an already-ended speech-recognition session.
      }
    }
    setListening(false);
  };

  const toggleVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceMessage("Speech recognition is not supported in this browser. You can type your answer instead.");
      return;
    }
    if (listening) {
      stopVoice();
      setVoiceMessage("Voice capture stopped. You can edit your transcript before submitting.");
      return;
    }
    if (remaining <= 0) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      const transcriptParts = [];
      for (let index = 0; index < event.results.length; index += 1) {
        transcriptParts.push(event.results[index][0].transcript);
      }
      setAnswer(transcriptParts.join(" ").trim());
    };
    recognition.onerror = () => {
      if (recognitionRef.current === recognition) recognitionRef.current = null;
      setListening(false);
      setVoiceMessage("Voice capture stopped. Continue by editing or typing your transcript.");
    };
    recognition.onend = () => {
      if (recognitionRef.current === recognition) recognitionRef.current = null;
      setListening(false);
    };
    recognitionRef.current = recognition;
    try {
      recognition.start();
      setListening(true);
      setVoiceMessage("Listening... Speak clearly. Your words will appear in the transcript.");
    } catch {
      recognitionRef.current = null;
      setListening(false);
      setVoiceMessage("Unable to start the microphone. Check browser permission and try again.");
    }
  };

  const persistSession = (nextSession) => {
    setSession(nextSession);
    saveInterviewSession(nextSession);
  };

  const submitAnswer = () => {
    if (!answer.trim() || !session || !currentQuestion || !course) return;
    stopVoice();
    const cleanAnswer = answer.trim();
    const nextResponses = [
      ...responses,
      {
        questionNumber: session.questionIndex + 1,
        question: currentQuestion.text,
        answer: cleanAnswer,
        skipped: false,
      },
    ];
    const nextSession = { ...session, responses: nextResponses };
    persistSession(nextSession);

    const topic = Array.isArray(course.topics)
      ? course.topics.find((item) => item.id === session.topicId)
      : course.modules?.find((item) => item.id === session.topicId);
    const feedback = buildGuidedAnswerFeedback({ answer: cleanAnswer, topic, question: currentQuestion });
    const feedbackPayload = {
      mode: "topic-interview",
      title,
      question: currentQuestion,
      answer: cleanAnswer,
      feedback,
      session: nextSession,
    };
    saveInterviewFeedback(feedbackPayload);
    navigate(FEEDBACK_PATH, { state: feedbackPayload });
  };

  const skipQuestion = () => {
    if (!session || !currentQuestion) return;
    stopVoice();
    const nextResponses = [
      ...responses,
      {
        questionNumber: session.questionIndex + 1,
        question: currentQuestion.text,
        answer: "",
        skipped: true,
      },
    ];
    const lastQuestion = session.questionIndex >= session.questions.length - 1;
    const nextSession = {
      ...session,
      responses: nextResponses,
      completed: lastQuestion,
      questionIndex: lastQuestion ? session.questionIndex : session.questionIndex + 1,
    };
    persistSession(nextSession);
    setAnswer("");
    setRemaining(QUESTION_SECONDS);
    setVoiceMessage("Use the microphone to speak or type directly into this transcript area.");
  };

  const restartInterview = () => {
    if (!session) return;
    const restarted = { ...session, questionIndex: 0, responses: [], completed: false, startedAt: new Date().toISOString() };
    persistSession(restarted);
    setAnswer("");
    setRemaining(QUESTION_SECONDS);
    setVoiceMessage("Use the microphone to speak or type directly into this transcript area.");
  };

  const chooseAnotherCourse = () => {
    stopVoice();
    clearInterviewSession();
    setSession(null);
    navigate("/student/ai-practice/topic-theory");
  };

  const minutes = String(Math.floor(remaining / 60)).padStart(2, "0");
  const seconds = String(remaining % 60).padStart(2, "0");
  const submittedCount = responses.filter((item) => !item.skipped).length;
  const skippedCount = responses.filter((item) => item.skipped).length;

  if (!session || !course) return null;

  return (
    
      <PageShell max="max-w-[1400px]">
        <style>{`
          @keyframes skillNextVoiceWave {
            0%, 100% { transform: scaleY(0.24); opacity: 0.58; }
            50% { transform: scaleY(1); opacity: 1; }
          }
          .skill-next-voice-wave-bar {
            display: inline-block;
            width: 4px;
            min-height: 8px;
            border-radius: 9999px;
            transform: scaleY(0.35);
            transform-origin: center;
            animation: skillNextVoiceWave 760ms ease-in-out infinite;
          }
          @media (prefers-reduced-motion: reduce) {
            .skill-next-voice-wave-bar { animation: none; transform: scaleY(0.62); }
          }
        `}</style>
        {!isCompleted && currentQuestion ? (
          <>
            <div className="mt-1 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#DCE6E5] bg-white px-4 py-3 shadow-sm">
              <div className="min-w-0">
                <p className="truncate text-[9px] font-extrabold tracking-[0.14em] text-[#527477]">{translateValue("INTERVIEW PREP")}{" "}<span className="px-1 text-[#A1B1B0]">{translateValue("›")}</span> {title.toUpperCase()}</p>
                <p className="mt-1 text-xs font-bold text-[#06424B]">{translateValue("Question")}{" "}{translateValue(session.questionIndex + 1)} {translateValue("of")}{" "}{translateValue(session.questions.length)}</p>
              </div>
              <button type="button" onClick={chooseAnotherCourse} className="inline-flex items-center gap-2 text-xs font-semibold text-[#718486] transition hover:text-[#06424B]"><ArrowLeft size={14}/> {translateValue("Exit interview")}</button>
            </div>

            <div className="mt-4 overflow-x-auto rounded-xl border border-[#DCE6E5] bg-white px-4 py-4 shadow-sm">
              <div className="flex min-w-[600px] items-center gap-2">
                {session.questions.map((question, index) => {
                  const response = responses.find((item) => item.questionNumber === index + 1);
                  const active = index === session.questionIndex;
                  return (
                    <div key={question.id} className="flex flex-1 items-center gap-2">
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold ${active ? "border-[#06424B] bg-[#06424B] text-white" : response ? "border-[#A7D9BD] bg-[#E9F5ED] text-[#39765D]" : "border-[#DCE6E5] bg-[#F7FAF9] text-[#829596]"}`}>
                        {response && !active ? <Check size={13}/> : index + 1}
                      </span>
                      {index < session.questions.length - 1 && <span className={`h-[2px] min-w-2 flex-1 ${response ? "bg-[#A7D9BD]" : "bg-[#E7ECEB]"}`}/>}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(360px,0.9fr)]">
              <section className="flex min-h-[500px] flex-col items-center justify-center rounded-[24px] border border-[#DCE6E5] bg-white px-6 py-9 text-center shadow-[0_3px_12px_rgba(6,66,75,0.045)] sm:px-10">
                <div className="flex h-[112px] w-[112px] items-center justify-center overflow-hidden rounded-[25px] border-2 border-[#B6DCC8] bg-[#EAF5EF] p-1.5 shadow-sm">
                  <img src="/interviewer-avatar.png" alt={translateValue("Skill Next AI interviewer")} className="h-full w-full rounded-[19px] object-cover" />
                </div>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                  <span className="rounded-full bg-[#EAF3F2] px-3 py-1.5 text-[9px] font-extrabold tracking-[0.12em] text-[#06424B]">{translateValue("AI INTERVIEWER")}</span>
                  <span className="rounded-full bg-[#FFF1D0] px-3 py-1.5 text-[9px] font-extrabold text-[#936400]">{translateValue(currentQuestion.difficulty).toUpperCase()}</span>
                </div>
                <div className={`mt-5 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold tabular-nums ${remaining <= 15 ? "bg-[#FFE4DC] text-[#A74631]" : "bg-[#EEF4F3] text-[#06424B]"}`}>
                  <Timer size={15}/> {translateValue("QUESTION TIME REMAINING ·")}{" "}{translateValue(minutes)}{translateValue(":")}{translateValue(seconds)}
                </div>
                <p className="mt-6 text-[10px] font-extrabold tracking-[0.18em] text-[#B07A06]">{translateValue("SKILL NEXT INTERVIEW PRACTICE")}</p>
                <h2 className="mt-3 max-w-[740px] text-xl font-extrabold leading-9 text-[#06424B] sm:text-[25px]">{translateValue(currentQuestion.text)}</h2>

                {/* Animated voice activity indicator appears only while microphone capture is active. */}
                <div className="mt-5 flex min-h-[54px] flex-col items-center justify-center" aria-live="polite">
                  {listening ? (
                    <>
                      <div className="flex h-9 items-center justify-center gap-[4px]" role="status" aria-label={translateValue("Listening to your answer")}>
                        {Array.from({ length:  30 }, (_, index) => (
                          <span
                            key={index}
                            className="skill-next-voice-wave-bar"
                            style={{
                              height: `${10 + ((index * 7) % 21)}px`,
                              animationDelay: `${(index % 8) * -0.105}s`,
                              backgroundColor: index % 7 === 0 ? "#FFAB0B" : "#06424B",
                            }}
                          />
                        ))}
                      </div>
                      <span className="mt-2 text-[10px] font-bold tracking-[0.12em] text-[#527477]">{translateValue("LISTENING TO YOUR ANSWER")}</span>
                    </>
                  ) : (
                    <span className="text-[10px] text-[#A0AEAE]">{translateValue("Voice activity will appear here when you speak.")}</span>
                  )}
                </div>

                <p className="mt-3 text-xs text-[#829596]">{translateValue("Focus area:")}{" "}{translateValue(currentQuestion.focus)}</p>
              </section>

              <section className="flex min-h-[500px] flex-col rounded-[24px] border border-[#DCE6E5] bg-white p-5 shadow-[0_3px_12px_rgba(6,66,75,0.045)] sm:p-6">
                <div className="flex items-center gap-2 text-[10px] font-extrabold tracking-[0.14em] text-[#527477]">
                  <span className={`h-2 w-2 rounded-full ${listening ? "animate-pulse bg-[#D45B48]" : "bg-[#7DA58E]"}`}/>
                  {translateValue("LIVE TRANSCRIPTION")}</div>
                <p className="mt-4 rounded-xl border-l-4 border-[#06424B] bg-[#F0F5F4] px-4 py-4 text-xs italic leading-6 text-[#45666A]">{translateValue(currentQuestion.text)}</p>
                <label htmlFor="interview-transcript" className="mt-5 text-xs font-bold text-[#06424B]">{translateValue("Your answer transcript")}</label>
                <textarea
                  id="interview-transcript"
                  value={answer}
                  onChange={(event) => setAnswer(event.target.value)}
                  rows={8}
                  placeholder={translateValue("Start speaking to see your transcript here, or type your answer...")}
                  className="mt-2 min-h-[190px] w-full flex-1 resize-y rounded-xl border border-[#DCE6E5] bg-[#FAFCFB] p-4 text-sm leading-6 text-[#29494D] outline-none transition placeholder:text-[#9AA9AA] focus:border-[#06424B] focus:ring-2 focus:ring-[#06424B]/10"
                />
                <div className="mt-3 flex items-center justify-between gap-3">
                  <p aria-live="polite" className="text-[10px] leading-5 text-[#829596]">{translateValue(voiceMessage)}</p>
                  <span className="shrink-0 text-[10px] font-semibold text-[#829596]">{translateValue(answer.trim() ? answer.trim().split(/\s+/).length : 0)} {translateValue("words")}</span>
                </div>
                <button type="button" onClick={toggleVoice} disabled={remaining === 0} className={`mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-4 text-xs font-extrabold transition disabled:cursor-not-allowed disabled:opacity-50 ${listening ? "bg-[#A74631] text-white" : "bg-[#06424B] text-white hover:bg-[#0A515C]"}`}>
                  {listening ? <MicOff size={16}/> : <Mic size={16}/>}
                  {translateValue(listening ? "Stop Listening" : "Speak Now")}
                </button>
              </section>
            </div>

            <div className="mt-4 flex flex-col-reverse gap-3 pb-2 sm:flex-row sm:items-center sm:justify-between">
              <button type="button" onClick={skipQuestion} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#C9DAD8] bg-white px-5 py-3 text-xs font-bold text-[#45666A] transition hover:border-[#06424B] hover:bg-[#F5F9F8]"><SkipForward size={15}/> {translateValue("Skip Question")}</button>
              <button type="button" onClick={submitAnswer} disabled={!answer.trim()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#FFAB0B] px-6 py-3 text-xs font-extrabold text-[#06424B] shadow-sm transition hover:bg-[#FFC13C] disabled:cursor-not-allowed disabled:bg-[#E3E8E7] disabled:text-[#91A09F]"><Send size={15}/> {translateValue("Submit Answer")}</button>
            </div>
          </>
        ) : (
          <section className="mt-6 rounded-[24px] border border-[#DCE6E5] bg-white px-6 py-10 text-center shadow-sm sm:px-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-[#E9F5ED] text-[#39765D]"><Award size={32}/></div>
            <p className="mt-5 text-[10px] font-extrabold tracking-[0.16em] text-[#B07A06]">{translateValue("INTERVIEW PRACTICE COMPLETED")}</p>
            <h2 className="mt-2 text-2xl font-extrabold text-[#06424B]">{translateValue("Well done!")}</h2>
            <p className="mx-auto mt-3 max-w-[540px] text-sm leading-7 text-[#718486]">{translateValue("You have completed your interview practice for")}{" "}{translateValue(title)}{translateValue(". Review your answers and practise again whenever you are ready.")}</p>
            <div className="mx-auto mt-6 grid max-w-[420px] grid-cols-2 gap-3">
              <div className="rounded-xl bg-[#F0F5F4] p-4"><p className="text-2xl font-extrabold text-[#06424B]">{translateValue(submittedCount)}</p><p className="mt-1 text-[10px] font-bold text-[#718486]">{translateValue("ANSWERS SUBMITTED")}</p></div>
              <div className="rounded-xl bg-[#FFF6E1] p-4"><p className="text-2xl font-extrabold text-[#8B650B]">{translateValue(skippedCount)}</p><p className="mt-1 text-[10px] font-bold text-[#8B7A56]">{translateValue("QUESTIONS SKIPPED")}</p></div>
            </div>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <button type="button" onClick={restartInterview} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#FFAB0B] px-5 py-3 text-xs font-extrabold text-[#06424B] transition hover:bg-[#FFC13C]"><RotateCcw size={15}/> {translateValue("Practise Again")}</button>
              <button type="button" onClick={chooseAnotherCourse} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#C9DAD8] bg-white px-5 py-3 text-xs font-bold text-[#45666A] transition hover:border-[#06424B]">{translateValue("Choose Another Course")}</button>
              <button type="button" onClick={() => navigate("/student/ai-practice")} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#C9DAD8] bg-white px-5 py-3 text-xs font-bold text-[#45666A] transition hover:border-[#06424B]"><BookOpen size={14}/> {translateValue("Interview Prep Home")}</button>
            </div>
          </section>
        )}
      </PageShell>
    
  );
}

export default TopicTheoryPractice;
