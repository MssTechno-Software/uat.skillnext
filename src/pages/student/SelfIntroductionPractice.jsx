
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Mic,
  MicOff,
  Play,
  Send,
  SkipForward,
  Timer,
} from "lucide-react";

import Sidebar from "../../components/Sidebar";
import StudentPageHeader from "../../components/student/StudentPageHeader";
import { BackLink, Card, PageShell } from "../../components/student/ui";

const SESSION_SECONDS = 119;
const FEEDBACK_PATH = "/student/ai-practice/feedback";

const HR_QUESTIONS = [
  {
    text: "Please introduce yourself.",
    label: "INTRODUCTION",
  },
  {
    text: "Can you walk me through your educational and professional background?",
    label: "BACKGROUND",
  },
  {
    text: "What are your key strengths and one area you are working to improve?",
    label: "STRENGTHS",
  },
  {
    text: "Why should we hire you for this role?",
    label: "WHY HIRE YOU",
  },
  {
    text: "Why do you want to join our company?",
    label: "COMPANY",
  },
  {
    text: "What are your short-term and long-term career goals?",
    label: "CAREER GOALS",
  },
  {
    text: "Tell me about a challenging situation you faced and how you handled it.",
    label: "CHALLENGE",
  },
  {
    text: "How do you handle pressure and tight deadlines?",
    label: "PRESSURE",
  },
  {
    text: "Are you comfortable working in a team? Can you share an example?",
    label: "TEAMWORK",
  },
  {
    text: "Do you have any questions for us?",
    label: "YOUR QUESTIONS",
  },
];

function SelfIntroductionPractice() {
  const navigate = useNavigate();
  const recognitionRef = useRef(null);

  const [answer, setAnswer] = useState("");
  const [listening, setListening] = useState(false);
  const [started, setStarted] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [responses, setResponses] = useState([]);
  const [remaining, setRemaining] = useState(SESSION_SECONDS);

  const [voiceMessage, setVoiceMessage] = useState(
    "Use the microphone to speak or type directly into this transcript area."
  );

  const currentQuestion = HR_QUESTIONS[questionIndex];
  const totalQuestions = HR_QUESTIONS.length;
  const isLastQuestion = questionIndex === totalQuestions - 1;

  useEffect(() => {
    if (!started) return undefined;

    setRemaining(SESSION_SECONDS);

    const timerId = window.setInterval(() => {
      setRemaining((value) => Math.max(0, value - 1));
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [started, questionIndex]);

  useEffect(() => {
    if (remaining === 0 && listening) {
      const recognition = recognitionRef.current;
      recognitionRef.current = null;

      try {
        recognition?.stop();
      } catch {
        // The browser may have already stopped recognition when the timer ends.
      }

      setListening(false);
      setVoiceMessage(
        "Time is up. Submit your captured answer or skip this question."
      );
    }
  }, [remaining, listening]);

  useEffect(() => {
    return () => {
      const recognition = recognitionRef.current;
      recognitionRef.current = null;

      if (recognition) {
        try {
          recognition.stop();
        } catch {
          // Ignore cleanup errors when speech recognition has already stopped.
        }
      }
    };
  }, []);

  const stopVoice = () => {
    const recognition = recognitionRef.current;
    recognitionRef.current = null;

    if (recognition) {
      recognition.onend = null;

      try {
        recognition.stop();
      } catch {
        // Ignore an already-ended speech-recognition session.
      }
    }

    setListening(false);
  };

  const toggleVoice = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceMessage(
        "Speech recognition is not supported in this browser. You can type your answer instead."
      );
      return;
    }

    if (listening) {
      stopVoice();
      setVoiceMessage(
        "Voice capture stopped. You can edit your transcript before submitting."
      );
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
      if (recognitionRef.current === recognition) {
        recognitionRef.current = null;
      }

      setListening(false);
      setVoiceMessage(
        "Voice capture stopped. Continue by editing or typing your transcript."
      );
    };

    recognition.onend = () => {
      if (recognitionRef.current === recognition) {
        recognitionRef.current = null;
      }

      setListening(false);
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
      setListening(true);
      setVoiceMessage(
        "Listening... Speak clearly. Your words will appear in the transcript."
      );
    } catch {
      recognitionRef.current = null;
      setListening(false);
      setVoiceMessage(
        "Unable to start the microphone. Check browser permission and try again."
      );
    }
  };

  const saveResponse = (skipped = false) => {
    if (!skipped && !answer.trim()) return;

    stopVoice();

    const updatedResponses = [
      ...responses,
      {
        questionNumber: questionIndex + 1,
        question: currentQuestion.text,
        answer: skipped ? "" : answer.trim(),
        skipped,
      },
    ];

    if (isLastQuestion) {
      navigate(FEEDBACK_PATH, {
        state: {
          mode: "self-introduction",
          title: "Common HR Interview Feedback",
          responses: updatedResponses,
          totalQuestions,
          completed: true,
          note:
            "Your 10-question HR interview practice is complete. Review your answers and skipped questions below. Real AI scoring and semantic evaluation will be available when the Skill Next evaluation API is connected.",
        },
      });

      return;
    }

    setResponses(updatedResponses);
    setQuestionIndex((value) => value + 1);
    setAnswer("");
    setRemaining(SESSION_SECONDS);
    setVoiceMessage(
      "Use the microphone to speak or type directly into this transcript area."
    );
  };

  const submit = () => saveResponse(false);

  const skip = () => saveResponse(true);

  const begin = () => {
    setAnswer("");
    setResponses([]);
    setQuestionIndex(0);
    setRemaining(SESSION_SECONDS);
    setVoiceMessage(
      "Use the microphone to speak or type directly into this transcript area."
    );
    setStarted(true);
  };

  const exitInterview = () => {
    stopVoice();
    setStarted(false);
    setAnswer("");
    setResponses([]);
    setQuestionIndex(0);
    setRemaining(SESSION_SECONDS);
  };

  const minutes = String(Math.floor(remaining / 60)).padStart(2, "0");
  const seconds = String(remaining % 60).padStart(2, "0");

  const wordCount = answer.trim()
    ? answer.trim().split(/\s+/).length
    : 0;

  return (
    <Sidebar>
      <PageShell max={started ? "max-w-[1400px]" : "max-w-[1050px]"}>
        {!started ? (
          <>
            <StudentPageHeader
              title="Self-Introduction Evaluation"
              subtitle="Practise a clear and confident professional introduction."
            />

            <BackLink to="/student/ai-practice">AI Practice</BackLink>

            <Card className="p-6 sm:p-9">
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-[#B6DCC8] bg-[#EAF5EF] p-1 shadow-sm">
                <img
                  src="/interviewer-avatar.png"
                  alt="Skill Next AI interviewer"
                  className="h-full w-full rounded-xl object-cover"
                />
              </div>

              <p className="mt-5 text-xs font-extrabold tracking-[1.3px] text-[#B07A06]">
                SELF-INTRODUCTION PRACTICE
              </p>

              <h1 className="mt-2 text-3xl font-extrabold text-[#06424B]">
                Tell us about yourself.
              </h1>

              <p className="mt-3 max-w-[700px] text-[15px] leading-7 text-[#4F6B6F]">
                You will have 119 seconds for each question. Practise common HR
                interview questions covering your education, skills, projects,
                strengths and career goals.
              </p>

              <div className="mt-6 rounded-2xl border border-[#F1DFB6] bg-[#FFFAEE] p-5">
                <p className="text-sm font-extrabold text-[#7A5410]">
                  A simple structure to follow
                </p>

                <ol className="mt-3 list-inside list-decimal space-y-2 text-sm leading-6 text-[#6F5313]">
                  <li>Your name and educational background.</li>
                  <li>Relevant technical skills and projects.</li>
                  <li>Your strengths, achievements and what you want to learn next.</li>
                </ol>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full bg-[#EAF3F2] px-3 py-1.5 text-xs font-semibold text-[#3F5C60]">
                  10 HR questions
                </span>
                <span className="rounded-full bg-[#EAF3F2] px-3 py-1.5 text-xs font-semibold text-[#3F5C60]">
                  119 seconds per question
                </span>
                <span className="rounded-full bg-[#EAF3F2] px-3 py-1.5 text-xs font-semibold text-[#3F5C60]">
                  Voice / transcript
                </span>
              </div>

              <button
                type="button"
                onClick={begin}
                className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#FFAB0B] px-6 py-3 text-sm font-extrabold text-[#06424B] shadow-sm transition hover:bg-[#FFC13C]"
              >
                <Play size={16} /> Start Interview
              </button>
            </Card>
          </>
        ) : (
          <>
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
                .skill-next-voice-wave-bar {
                  animation: none;
                  transform: scaleY(0.62);
                }
              }
            `}</style>

            <div className="mt-1 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#DCE6E5] bg-white px-4 py-3 shadow-sm">
              <div>
                <p className="text-[9px] font-extrabold tracking-[0.14em] text-[#527477]">
                  INTERVIEW MODES
                  <span className="px-1 text-[#A1B1B0]">›</span>
                  SELF INTRODUCTION
                  <span className="px-1 text-[#A1B1B0]">›</span>
                  QUESTION {questionIndex + 1}
                </p>

                <p className="mt-1 text-xs font-bold text-[#06424B]">
                  Question {questionIndex + 1} of {totalQuestions}
                </p>
              </div>

              <button
                type="button"
                onClick={exitInterview}
                className="inline-flex items-center gap-2 text-xs font-semibold text-[#718486] transition hover:text-[#06424B]"
              >
                <ArrowLeft size={14} /> Exit interview
              </button>
            </div>

            <div className="mt-4 overflow-x-auto rounded-xl border border-[#DCE6E5] bg-white px-4 py-4 shadow-sm">
              <div className="flex min-w-[850px] items-center">
                {HR_QUESTIONS.map((item, index) => {
                  const isCompleted = index < questionIndex;
                  const isCurrent = index === questionIndex;

                  return (
                    <div
                      key={item.label}
                      className="flex min-w-0 flex-1 items-center"
                    >
                      <div className="flex shrink-0 flex-col items-center gap-1.5">
                        <span
                          className={`flex h-8 w-8 items-center justify-center rounded-full border text-[10px] font-bold ${
                            isCompleted || isCurrent
                              ? "border-[#06424B] bg-[#06424B] text-white"
                              : "border-[#DCE6E5] bg-white text-[#829596]"
                          }`}
                        >
                          {isCompleted ? "✓" : index + 1}
                        </span>

                        <span
                          className={`whitespace-nowrap text-[9px] font-bold ${
                            isCurrent
                              ? "text-[#06424B]"
                              : isCompleted
                                ? "text-[#527477]"
                                : "text-[#A0AEAE]"
                          }`}
                        >
                          {item.label}
                        </span>
                      </div>

                      {index < totalQuestions - 1 && (
                        <span
                          className={`mx-2 mb-5 h-[2px] min-w-3 flex-1 ${
                            isCompleted ? "bg-[#A7D9BD]" : "bg-[#DCE6E5]"
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(360px,0.9fr)]">
              <section className="flex min-h-[500px] flex-col items-center justify-center rounded-[24px] border border-[#DCE6E5] bg-white px-6 py-9 text-center shadow-[0_3px_12px_rgba(6,66,75,0.045)] sm:px-10">
                <div className="flex h-[112px] w-[112px] items-center justify-center overflow-hidden rounded-[25px] border-2 border-[#B6DCC8] bg-[#EAF5EF] p-1.5 shadow-sm">
                  <img
                    src="/interviewer-avatar.png"
                    alt="Skill Next AI interviewer"
                    className="h-full w-full rounded-[19px] object-cover"
                  />
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                  <span className="rounded-full bg-[#EAF3F2] px-3 py-1.5 text-[9px] font-extrabold tracking-[0.12em] text-[#06424B]">
                    AI INTERVIEWER
                  </span>

                  <span className="rounded-full bg-[#FFF1D0] px-3 py-1.5 text-[9px] font-extrabold text-[#936400]">
                    SELF INTRODUCTION
                  </span>
                </div>

                <div
                  className={`mt-5 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold tabular-nums ${
                    remaining <= 15
                      ? "bg-[#FFE4DC] text-[#A74631]"
                      : "bg-[#EEF4F3] text-[#06424B]"
                  }`}
                >
                  <Timer size={15} />
                  QUESTION TIME REMAINING · {minutes}:{seconds}
                </div>

                <p className="mt-6 text-[10px] font-extrabold tracking-[0.18em] text-[#B07A06]">
                  SKILL NEXT INTERVIEW PRACTICE
                </p>

                <h2 className="mt-3 max-w-[740px] text-xl font-extrabold leading-9 text-[#06424B] sm:text-[25px]">
                  {currentQuestion.text}
                </h2>

                <div
                  className="mt-5 flex min-h-[54px] flex-col items-center justify-center"
                  aria-live="polite"
                >
                  {listening ? (
                    <>
                      <div
                        className="flex h-9 items-center justify-center gap-[4px]"
                        role="status"
                        aria-label="Listening to your answer"
                      >
                        {Array.from({ length: 30 }, (_, index) => (
                          <span
                            key={index}
                            className="skill-next-voice-wave-bar"
                            style={{
                              height: `${10 + ((index * 7) % 21)}px`,
                              animationDelay: `${(index % 8) * -0.105}s`,
                              backgroundColor:
                                index % 7 === 0 ? "#FFAB0B" : "#06424B",
                            }}
                          />
                        ))}
                      </div>

                      <span className="mt-2 text-[10px] font-bold tracking-[0.12em] text-[#527477]">
                        LISTENING TO YOUR ANSWER
                      </span>
                    </>
                  ) : (
                    <span className="text-[10px] text-[#A0AEAE]">
                      Voice activity will appear here when you speak.
                    </span>
                  )}
                </div>

                <p className="mt-3 text-xs text-[#829596]">
                  Focus area: Common HR interview and communication skills
                </p>
              </section>

              <section className="flex min-h-[500px] flex-col rounded-[24px] border border-[#DCE6E5] bg-white p-5 shadow-[0_3px_12px_rgba(6,66,75,0.045)] sm:p-6">
                <div className="flex items-center gap-2 text-[10px] font-extrabold tracking-[0.14em] text-[#527477]">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      listening
                        ? "animate-pulse bg-[#D45B48]"
                        : "bg-[#7DA58E]"
                    }`}
                  />
                  LIVE TRANSCRIPTION
                </div>

                <p className="mt-4 rounded-xl border-l-4 border-[#06424B] bg-[#F0F5F4] px-4 py-4 text-xs italic leading-6 text-[#45666A]">
                  AI: {currentQuestion.text}
                </p>

                <label
                  htmlFor="self-introduction-transcript"
                  className="mt-5 text-xs font-bold text-[#06424B]"
                >
                  Your answer transcript
                </label>

                <textarea
                  id="self-introduction-transcript"
                  value={answer}
                  onChange={(event) => setAnswer(event.target.value)}
                  rows={8}
                  placeholder="Start speaking to see your transcript here, or type your answer..."
                  className="mt-2 min-h-[190px] w-full flex-1 resize-y rounded-xl border border-[#DCE6E5] bg-[#FAFCFB] p-4 text-sm leading-6 text-[#29494D] outline-none transition placeholder:text-[#9AA9AA] focus:border-[#06424B] focus:ring-2 focus:ring-[#06424B]/10"
                />

                <div className="mt-3 flex items-center justify-between gap-3">
                  <p
                    aria-live="polite"
                    className="text-[10px] leading-5 text-[#829596]"
                  >
                    {voiceMessage}
                  </p>

                  <span className="shrink-0 text-[10px] font-semibold text-[#829596]">
                    {wordCount} words
                  </span>
                </div>

                <button
                  type="button"
                  onClick={toggleVoice}
                  disabled={remaining === 0}
                  className={`mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-4 text-xs font-extrabold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    listening
                      ? "bg-[#A74631] text-white"
                      : "bg-[#06424B] text-white hover:bg-[#0A515C]"
                  }`}
                >
                  {listening ? <MicOff size={16} /> : <Mic size={16} />}
                  {listening ? "Stop Listening" : "Speak Now"}
                </button>
              </section>
            </div>

            <div className="mt-4 flex flex-col-reverse gap-3 pb-2 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={skip}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#C9DAD8] bg-white px-5 py-3 text-xs font-bold text-[#45666A] transition hover:border-[#06424B] hover:bg-[#F5F9F8]"
              >
                <SkipForward size={15} /> Skip Question
              </button>

              <button
                type="button"
                onClick={submit}
                disabled={!answer.trim()}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#FFAB0B] px-6 py-3 text-xs font-extrabold text-[#06424B] shadow-sm transition hover:bg-[#FFC13C] disabled:cursor-not-allowed disabled:bg-[#E3E8E7] disabled:text-[#91A09F]"
              >
                <Send size={15} />
                {isLastQuestion ? "Finish Interview" : "Submit Answer"}
              </button>
            </div>
          </>
        )}
      </PageShell>
    </Sidebar>
  );
}

export default SelfIntroductionPractice;
