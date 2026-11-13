
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  BookOpen,
  Check,
  ChevronDown,
  Code2,
  GraduationCap,
  Mic,
  MicOff,
  Play,
  RotateCcw,
  Send,
  SkipForward,
  Sparkles,
  Timer,
  Target,
  Zap,
} from "lucide-react";

import Sidebar from "../../components/Sidebar";
import StudentPageHeader from "../../components/student/StudentPageHeader";
import { technologies } from "../../data/studentLearningData";

const QUESTION_SECONDS = 119;

const difficultyOptions = [
  {
    name: "Easy",
    subtitle: "Fundamentals",
    icon: BookOpen,
    bg: "bg-[#E4F1EC]",
    color: "text-[#39765D]",
  },
  {
    name: "Medium",
    subtitle: "Intermediate",
    icon: Target,
    bg: "bg-[#FFF1D3]",
    color: "text-[#A87512]",
  },
  {
    name: "Hard",
    subtitle: "Advanced",
    icon: Zap,
    bg: "bg-[#F5E6E2]",
    color: "text-[#A9523E]",
  },
];

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
  const [voiceMessage, setVoiceMessage] = useState("");
  const [sessionMessage, setSessionMessage] = useState("");

  const technology =
    technologies.find((item) => item.id === technologyId) ||
    technologies[0];

  const availableTopics = technology.topics;

  const topic = useMemo(
    () =>
      availableTopics.find((item) => item.id === topicId) ||
      availableTopics[0],
    [availableTopics, topicId]
  );

  const questions = useMemo(() => {
    const codingFirst =
      technologyId === "react" && topicId === "components";

    return [
      codingFirst
        ? {
            type: "coding",
            text: "Create a reusable React component named ProfileCard that accepts a name prop and displays the name inside a heading.",
          }
        : {
            type: "theory",
            text: `Explain ${topic.title.toLowerCase()} in your own words and describe one practical situation where it is useful.`,
          },
      {
        type: "theory",
        text: `What is one important concept or best practice related to ${topic.title.toLowerCase()}? Explain why it matters.`,
      },
    ];
  }, [technologyId, topicId, topic.title]);

  const currentQuestion = questions[questionIndex];

  // Timer
  useEffect(() => {
    if (
      !started ||
      currentQuestion?.type === "coding" ||
      remaining <= 0
    ) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setRemaining((value) => Math.max(0, value - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [started, questionIndex, currentQuestion?.type, remaining]);

  // Stop microphone when time ends
  useEffect(() => {
    if (remaining === 0 && listening) {
      recognitionRef.current?.stop();
      setListening(false);
      setVoiceMessage("Time is up. Submit or skip this question.");
    }
  }, [remaining, listening]);

  // Cleanup
  useEffect(() => {
    return () => recognitionRef.current?.stop();
  }, []);

  const stopVoice = () => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setListening(false);
  };

  const resetPractice = () => {
    stopVoice();
    setStarted(false);
    setQuestionIndex(0);
    setAnswer("");
    setRemaining(QUESTION_SECONDS);
    setSessionMessage("");
    setVoiceMessage("");
  };

  const startPractice = () => {
    stopVoice();
    setQuestionIndex(0);
    setAnswer("");
    setRemaining(QUESTION_SECONDS);
    setSessionMessage("");
    setVoiceMessage("");
    setStarted(true);
  };

  const handleTechnologyChange = (e) => {
    const nextId = e.target.value;
    const next = technologies.find((item) => item.id === nextId);

    resetPractice();
    setTechnologyId(nextId);
    setTopicId(next?.topics[0]?.id || "");
  };

  const handleTopicChange = (e) => {
    resetPractice();
    setTopicId(e.target.value);
  };

  const handleDifficultyChange = (value) => {
    resetPractice();
    setDifficulty(value);
  };

  // Voice recognition
  const toggleVoice = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceMessage("Speech recognition is not supported. Please type your answer.");
      return;
    }

    if (listening) {
      stopVoice();
      setVoiceMessage("Voice input stopped.");
      return;
    }

    if (remaining <= 0) return;

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let transcript = "";

      for (let i = 0; i < event.results.length; i += 1) {
        transcript += `${event.results[i][0].transcript} `;
      }

      setAnswer(transcript.trim());
    };

    recognition.onerror = () => {
      setListening(false);
      setVoiceMessage("Voice capture stopped. Continue typing your answer.");
    };

    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;

    try {
      recognition.start();
      setListening(true);
      setVoiceMessage("Listening... Speak your answer.");
    } catch {
      setListening(false);
      setVoiceMessage("Unable to start microphone. Try again.");
    }
  };

  // Coding workspace
  const openCodingPanel = () => {
    navigate("/student/ai-practice/coding", {
      state: {
        technology: technology.name,
        topic: topic.title,
        difficulty,
        question: currentQuestion.text,
        starterCode:
          "function ProfileCard({ name }) {\n  // Write your component here\n}\n\nexport default ProfileCard;",
      },
    });
  };

  // Submit answer
  const submitAnswer = () => {
    stopVoice();

    navigate("/student/ai-practice/feedback", {
      state: {
        title: `${technology.name} · ${topic.title}`,
        answer,
        question: currentQuestion.text,
        note: "Your response is ready for AI evaluation. Connect the Skill Next topic-theory API to receive actual evaluation and feedback.",
      },
    });
  };

  // Skip question
  const skipQuestion = () => {
    stopVoice();

    if (questionIndex < questions.length - 1) {
      setQuestionIndex((value) => value + 1);
      setAnswer("");
      setRemaining(QUESTION_SECONDS);
      setVoiceMessage("");
    } else {
      setSessionMessage(
        "You have completed all preview questions. The live system can retrieve your next question or final feedback from the backend."
      );
    }
  };

  const minutes = String(Math.floor(remaining / 60)).padStart(2, "0");
  const seconds = String(remaining % 60).padStart(2, "0");

  const progress = ((questionIndex + 1) / questions.length) * 100;

  return (
    <Sidebar>
      <div className="min-h-screen bg-[#EEF3F3]">

        <div className="mx-auto w-full max-w-[1150px] px-4 py-4 sm:px-6 sm:py-6 lg:px-8">

          <StudentPageHeader
            title="Topic-Specific AI Practice"
            subtitle="Build confidence through focused technical practice."
          />

          {/* ================= CONFIGURATION SCREEN ================= */}

          {!started && (
            <div className="mt-5">

              {/* Compact teal banner */}
              <div className="relative mb-5 overflow-hidden rounded-[22px] bg-[#06424B] px-5 py-5 text-white sm:px-7 sm:py-6">

                <div className="absolute -right-10 -top-16 h-48 w-48 rounded-full border-[28px] border-white/[0.05]" />

                <div className="relative flex items-center justify-between gap-4">
                  <div>
                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-wider text-[#FFAB0B]">
                      <Sparkles size={14} />
                      SKILL NEXT · AI LEARNING
                    </div>

                    <h2 className="text-xl font-bold sm:text-2xl">
                      Ready to test your skills?
                    </h2>

                    <p className="mt-2 max-w-lg text-xs leading-6 text-white/70 sm:text-sm">
                      Select your technology, choose a topic and challenge yourself.
                    </p>
                  </div>

                  <div className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-[#FFAB0B] sm:flex">
                    <Brain size={34} />
                  </div>
                </div>
              </div>

              {/* Main configuration */}
              <div className="overflow-hidden rounded-[22px] border border-[#DCE6E5] bg-white shadow-sm">

                {/* Section title */}
                <div className="flex items-center justify-between gap-3 border-b border-[#E6EEEE] bg-[#F7FAF9] px-5 py-4 sm:px-7">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#06424B] text-[#FFAB0B]">
                      <GraduationCap size={21} />
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-[#06424B] sm:text-base">
                        Practice configuration
                      </h3>
                      <p className="text-[11px] text-[#849797]">
                        Personalize your learning session
                      </p>
                    </div>
                  </div>

                  <span className="rounded-lg bg-[#FFF1D0] px-3 py-1.5 text-[10px] font-bold text-[#936400]">
                    STEP 01
                  </span>
                </div>

                <div className="p-5 sm:p-7">

                  {/* Technology and topic */}
                  <div className="grid gap-5 sm:grid-cols-2">

                    <div>
                      <label
                        htmlFor="technology"
                        className="mb-2 block text-xs font-bold text-[#345257]"
                      >
                        SELECT TECHNOLOGY
                      </label>

                      <div className="relative">
                        <select
                          id="technology"
                          value={technologyId}
                          onChange={handleTechnologyChange}
                          className="h-12 w-full appearance-none rounded-xl border border-[#C9DAD8] bg-[#F1F7F6] px-4 pr-10 text-sm font-semibold text-[#06424B] outline-none transition focus:border-[#06424B] focus:ring-2 focus:ring-[#06424B]/10"
                        >
                          {technologies.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name}
                            </option>
                          ))}
                        </select>

                        <ChevronDown
                          size={17}
                          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#527579]"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="topic"
                        className="mb-2 block text-xs font-bold text-[#345257]"
                      >
                        SELECT TOPIC / SUBTOPIC
                      </label>

                      <div className="relative">
                        <select
                          id="topic"
                          value={topicId}
                          onChange={handleTopicChange}
                          className="h-12 w-full appearance-none rounded-xl border border-[#C9DAD8] bg-[#F1F7F6] px-4 pr-10 text-sm font-semibold text-[#06424B] outline-none transition focus:border-[#06424B] focus:ring-2 focus:ring-[#06424B]/10"
                        >
                          {availableTopics.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.title}
                            </option>
                          ))}
                        </select>

                        <ChevronDown
                          size={17}
                          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#527579]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Difficulty */}
                  <div className="mt-7">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <label className="text-xs font-bold text-[#345257]">
                        SELECT DIFFICULTY
                      </label>
                      <span className="text-[10px] font-medium text-[#91A1A2]">
                        Choose your challenge
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
                      {difficultyOptions.map((option) => {
                        const Icon = option.icon;
                        const active = difficulty === option.name;

                        return (
                          <button
                            type="button"
                            key={option.name}
                            onClick={() => handleDifficultyChange(option.name)}
                            aria-pressed={active}
                            className={`relative flex min-h-[100px] flex-col items-start justify-center rounded-2xl border p-3 text-left transition-all sm:min-h-[112px] sm:p-4 ${
                              active
                                ? "border-[#06424B] bg-[#EAF3F1] shadow-[inset_0_0_0_1px_#06424B]"
                                : "border-[#E5EBEA] bg-[#FAFBFA] hover:border-[#A9C4C0]"
                            }`}
                          >
                            {active && (
                              <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#06424B] text-white">
                                <Check size={12} />
                              </span>
                            )}

                            <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-lg ${option.bg} ${option.color}`}>
                              <Icon size={17} />
                            </div>

                            <p className="text-sm font-bold text-[#06424B]">
                              {option.name}
                            </p>

                            <p className="mt-0.5 text-[10px] text-[#829395]">
                              {option.subtitle}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Summary strip */}
                  <div className="mt-6 flex flex-wrap items-center gap-2 rounded-xl bg-[#06424B] px-4 py-3 text-white">
                    <span className="text-[10px] font-bold tracking-wider text-[#FFAB0B]">
                      SELECTED
                    </span>
                    <span className="text-xs font-semibold">
                      {technology.name}
                    </span>
                    <span className="text-white/40">/</span>
                    <span className="text-xs text-white/80">
                      {topic.title}
                    </span>
                    <span className="ml-auto rounded-lg bg-[#FFAB0B] px-2.5 py-1 text-[10px] font-bold text-[#06424B]">
                      {difficulty}
                    </span>
                  </div>

                  {/* Yellow start button */}
                  <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-[11px] text-[#8B9A9B]">
                      Your practice session is ready.
                    </p>

                    <button
                      type="button"
                      onClick={startPractice}
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#FFAB0B] px-7 text-sm font-extrabold text-[#06424B] shadow-[0_4px_12px_rgba(255,171,11,0.2)] transition hover:-translate-y-0.5 hover:bg-[#FFC13C] active:translate-y-0"
                    >
                      <Play size={17} fill="currentColor" />
                      Start Practice
                      <ArrowRight size={17} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Small information strip */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 rounded-xl border border-[#DCE6E5] bg-[#E3EDEA] px-4 py-3">
                <span className="flex items-center gap-2 text-[11px] font-semibold text-[#47696B]">
                  <Timer size={14} />
                  Timed questions
                </span>
                <span className="flex items-center gap-2 text-[11px] font-semibold text-[#47696B]">
                  <Mic size={14} />
                  Voice answers
                </span>
                <span className="flex items-center gap-2 text-[11px] font-semibold text-[#47696B]">
                  <Code2 size={14} />
                  Coding challenges
                </span>
              </div>
            </div>
          )}

          {/* ================= PRACTICE SCREEN ================= */}

          {started && currentQuestion && (
            <div className="mt-5">

              {/* Top navigation */}
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={resetPractice}
                  className="inline-flex items-center gap-2 text-xs font-bold text-[#06424B] transition hover:text-[#B17A0A]"
                >
                  <ArrowLeft size={16} />
                  Back to configuration
                </button>

                <div className="flex items-center gap-2 rounded-lg bg-[#06424B] px-3 py-2 text-[11px] font-bold text-white">
                  <Sparkles size={13} className="text-[#FFAB0B]" />
                  AI PRACTICE
                </div>
              </div>

              {/* Compact practice header */}
              <div className="overflow-hidden rounded-[20px] bg-[#06424B] text-white shadow-sm">

                <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-7">
                  <div>
                    <div className="mb-1 text-[10px] font-bold tracking-widest text-[#FFAB0B]">
                      {technology.name.toUpperCase()} · {difficulty.toUpperCase()}
                    </div>

                    <h2 className="text-lg font-bold sm:text-xl">
                      {topic.title}
                    </h2>

                    <p className="mt-1 text-[11px] text-white/60">
                      Focus on understanding. Give your best answer.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="rounded-xl border border-white/15 bg-white/10 px-3 py-2">
                      <p className="text-[9px] font-bold text-white/60">
                        QUESTION
                      </p>
                      <p className="mt-1 text-sm font-bold">
                        {questionIndex + 1}
                        <span className="text-white/50">
                          {" "}/ {questions.length}
                        </span>
                      </p>
                    </div>

                    {currentQuestion.type !== "coding" && (
                      <div className={`min-w-[90px] rounded-xl px-3 py-2 ${
                        remaining <= 15
                          ? "bg-[#FFE1D8] text-[#A83C2A]"
                          : "bg-[#FFAB0B] text-[#06424B]"
                      }`}>
                        <div className="flex items-center gap-1 text-[9px] font-bold">
                          <Timer size={12} />
                          TIME LEFT
                        </div>
                        <p className="mt-0.5 text-xl font-extrabold tabular-nums">
                          {minutes}:{seconds}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress */}
                <div className="h-1.5 bg-white/10">
                  <div
                    className="h-full bg-[#FFAB0B] transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Question panel */}
              <div className="mt-4 overflow-hidden rounded-[20px] border border-[#D8E5E3] bg-white shadow-sm">

                <div className="flex items-center justify-between border-b border-[#E6EEEE] bg-[#F1F7F5] px-5 py-3 sm:px-6">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#06424B] text-[#FFAB0B]">
                      {currentQuestion.type === "coding" ? (
                        <Code2 size={17} />
                      ) : (
                        <Brain size={17} />
                      )}
                    </div>

                    <span className="text-xs font-bold text-[#06424B]">
                      {currentQuestion.type === "coding"
                        ? "Coding Challenge"
                        : "Theory Question"}
                    </span>
                  </div>

                  <span className="rounded-lg bg-[#FFF0CC] px-3 py-1.5 text-[10px] font-bold text-[#926500]">
                    {difficulty}
                  </span>
                </div>

                <div className="p-5 sm:p-6">

                  {/* Question */}
                  <div className="rounded-xl border-l-4 border-[#FFAB0B] bg-[#F0F5F4] px-5 py-4">
                    <p className="mb-2 text-[9px] font-extrabold tracking-widest text-[#A17A22]">
                      QUESTION {questionIndex + 1}
                    </p>

                    <h3 className="text-base font-semibold leading-7 text-[#06424B] sm:text-lg">
                      {currentQuestion.text}
                    </h3>
                  </div>

                  {/* Coding button */}
                  {currentQuestion.type === "coding" && (
                    <button
                      type="button"
                      onClick={openCodingPanel}
                      className="mt-5 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#FFAB0B] px-6 text-sm font-bold text-[#06424B] transition hover:bg-[#FFC13C]"
                    >
                      <Code2 size={17} />
                      Open Coding Workspace
                      <ArrowRight size={17} />
                    </button>
                  )}

                  {/* Theory answer */}
                  {currentQuestion.type === "theory" && (
                    <>
                      <div className="mb-2 mt-5 flex items-center justify-between gap-2">
                        <label
                          htmlFor="practice-answer"
                          className="text-xs font-bold text-[#06424B]"
                        >
                          YOUR ANSWER
                        </label>

                        <span className="text-[10px] text-[#899B9C]">
                          Write or speak your response
                        </span>
                      </div>

                      <textarea
                        id="practice-answer"
                        rows={4}
                        value={answer}
                        disabled={remaining === 0}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder="Start writing your answer here..."
                        className="w-full resize-y rounded-xl border border-[#C9DAD8] bg-[#F7FAF9] p-4 text-sm leading-6 text-[#29494D] outline-none transition placeholder:text-[#9AA9AA] focus:border-[#06424B] focus:ring-2 focus:ring-[#06424B]/10 disabled:opacity-60"
                      />

                      {/* Voice section */}
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#DBE7E5] bg-[#EAF2F0] px-4 py-3">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={toggleVoice}
                            disabled={remaining === 0}
                            className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
                              listening
                                ? "bg-[#A74C3B] text-white"
                                : "bg-[#06424B] text-[#FFAB0B] hover:bg-[#0A515C]"
                            } disabled:opacity-40`}
                          >
                            {listening ? (
                              <MicOff size={18} />
                            ) : (
                              <Mic size={18} />
                            )}
                          </button>

                          <div>
                            <p className="text-xs font-bold text-[#06424B]">
                              {listening ? "Listening..." : "Voice response"}
                            </p>
                            <p className="mt-0.5 text-[10px] text-[#718B8C]">
                              {voiceMessage || "Tap microphone to speak"}
                            </p>
                          </div>
                        </div>

                        {listening && (
                          <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#A74C3B]">
                            <span className="h-2 w-2 animate-pulse rounded-full bg-[#A74C3B]" />
                            RECORDING
                          </span>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="mt-5 flex flex-col-reverse justify-between gap-3 border-t border-[#E8EEEE] pt-4 sm:flex-row sm:items-center">
                        <button
                          type="button"
                          onClick={skipQuestion}
                          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#D8E4E2] px-5 text-xs font-bold text-[#527477] transition hover:bg-[#F0F5F4]"
                        >
                          <SkipForward size={15} />
                          Skip Question
                        </button>

                        <button
                          type="button"
                          onClick={submitAnswer}
                          disabled={!answer.trim() || remaining === 0}
                          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#FFAB0B] px-7 text-xs font-extrabold text-[#06424B] transition hover:bg-[#FFC13C] disabled:cursor-not-allowed disabled:bg-[#E1E6E5] disabled:text-[#9AA6A5]"
                        >
                          Submit Answer
                          <Send size={15} />
                        </button>
                      </div>
                    </>
                  )}

                  {/* Coding actions */}
                  {currentQuestion.type === "coding" && (
                    <div className="mt-5 flex justify-end border-t border-[#E8EEEE] pt-4">
                      <button
                        type="button"
                        onClick={skipQuestion}
                        className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#D8E4E2] px-5 text-xs font-bold text-[#527477] hover:bg-[#F0F5F4]"
                      >
                        Skip Question
                        <SkipForward size={15} />
                      </button>
                    </div>
                  )}

                  {/* Completed */}
                  {sessionMessage && (
                    <div className="mt-5 rounded-xl border border-[#C9E2D4] bg-[#E9F5ED] p-4">
                      <p className="text-sm font-bold text-[#286447]">
                        Practice completed
                      </p>
                      <p className="mt-1 text-xs leading-5 text-[#557C65]">
                        {sessionMessage}
                      </p>
                      <button
                        type="button"
                        onClick={startPractice}
                        className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#FFAB0B] px-4 py-2 text-xs font-bold text-[#06424B]"
                      >
                        <RotateCcw size={14} />
                        Restart Practice
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Compact footer */}
              <div className="mt-3 flex items-center justify-between gap-2 px-1">
                <span className="text-[10px] font-medium text-[#829394]">
                  Skill Next · AI Learning
                </span>
                <span className="text-[10px] font-semibold text-[#527477]">
                  {questionIndex + 1} of {questions.length} questions
                </span>
              </div>
            </div>
          )}

        </div>
      </div>
    </Sidebar>
  );
}

export default TopicTheoryPractice;
