
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import CodeMirror from "@uiw/react-codemirror";
import { html } from "@codemirror/lang-html";
import { EditorView } from "@codemirror/view";
import Loader from "../../components/Loader";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Copy,
  ExternalLink,
  FileText,
  Lightbulb,
  Play,
  PlayCircle,
  RotateCcw,
  RefreshCw,
  Code2,
  Eye,
  BookOpen,
  Maximize2,
  Minimize2,
  Check,
  LockKeyhole,
} from "lucide-react";

 
import StudentPageHeader from "../../components/student/StudentPageHeader";
import {
  Card,
  LinkButton,
  PageShell,
} from "../../components/student/ui";

import { myLearningCoursePath, technologies } from "../../data/studentLearningData";
import { getQuizForTopic } from "../../data/quizData";
import { getCourseContent, completeModule } from "../../api/course.api";
import { hasReadLesson, markLessonRead, rememberLastTopic, useProgress } from "../../data/studentProgress";

/* ======================================================
   CODE EDITOR THEME
====================================================== */

const editorTheme = EditorView.theme(
  {
    "&": {
      backgroundColor: "#102E36",
      color: "#E5F3F0",
      fontSize: "13px",
      height: "100%",
    },

    ".cm-content": {
      caretColor: "#FFAB0B",
      fontFamily: "Consolas, Monaco, monospace",
      padding: "16px 0",
    },

    ".cm-line": {
      padding: "0 16px",
      lineHeight: "1.8",
    },

    ".cm-gutters": {
      backgroundColor: "#102E36",
      color: "#66858A",
      border: "none",
      paddingLeft: "8px",
    },

    ".cm-activeLine": {
      backgroundColor: "#FFFFFF08",
    },

    ".cm-activeLineGutter": {
      backgroundColor: "#FFFFFF08",
      color: "#FFAB0B",
    },

    "&.cm-focused": {
      outline: "none",
    },

    ".cm-selectionBackground": {
      backgroundColor: "#35616A !important",
    },

    ".cm-cursor": {
      borderLeftColor: "#FFAB0B",
    },
  },
  { dark: true }
);

/* ======================================================
   BUILD HTML PREVIEW
====================================================== */

function buildPreview(code) {
  const source = code || "";

  const hasFullDocument =
    /<!doctype\s+html/i.test(source) ||
    /<html[\s>]/i.test(source);

  if (hasFullDocument) {
    return source;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <style>
    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      padding: 20px;
      font-family: Arial, sans-serif;
      color: #222;
      line-height: 1.6;
    }
  </style>
</head>

<body>
  ${source}
</body>
</html>`;
}

/* ======================================================
   TRY IT YOURSELF PLAYGROUND
====================================================== */

function TryItYourself({ initial }) {
  const [code, setCode] = useState(initial || "");
  const [lastRun, setLastRun] = useState(initial || "");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState("editor");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCode(initial || "");
    setLastRun(initial || "");
    setActiveTab("editor");
  }, [initial]);

  // Automatically update output while typing.
  const preview = useMemo(
    () => buildPreview(code),
    [code]
  );

  const runCode = () => {
    setLastRun(code);
    setActiveTab("preview");
  };

  const resetCode = () => {
    setCode(initial || "");
    setLastRun(initial || "");
    setActiveTab("editor");
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const editorExtensions = useMemo(
    () => [html(), editorTheme, EditorView.lineWrapping],
    []
  );

  return (
    <section
      className={`mt-7 overflow-hidden rounded-2xl border border-[#DCE5E7] bg-white shadow-sm ${
        isFullscreen
          ? "fixed inset-3 z-[100] mt-0 flex flex-col"
          : ""
      }`}
    >
      {/* Playground Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#123B43] px-5 py-4">

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
            <Code2 size={20} className="text-[#FFAB0B]" />
          </div>

          <div>
            <h3 className="text-sm font-extrabold text-white">
              Try it Yourself
            </h3>

            <p className="mt-1 text-[11px] text-white/60">
              Write code. Experiment. See the result.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#FFAB0B]">
            HTML
          </span>

          <button
            type="button"
            onClick={() => setIsFullscreen((value) => !value)}
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            {isFullscreen ? (
              <Minimize2 size={17} />
            ) : (
              <Maximize2 size={17} />
            )}
          </button>
        </div>
      </div>

      {/* Editor / Preview Toolbar */}
      <div className="flex flex-wrap items-center justify-between border-b border-[#E7EEEE] bg-[#F7F9F9] px-4">

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("editor")}
            className={`flex items-center gap-2 border-b-2 px-3 py-3 text-xs font-bold transition ${
              activeTab === "editor"
                ? "border-[#06424B] text-[#06424B]"
                : "border-transparent text-[#789094] hover:text-[#06424B]"
            }`}
          >
            <Code2 size={15} />
            Code Editor
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`flex items-center gap-2 border-b-2 px-3 py-3 text-xs font-bold transition ${
              activeTab === "preview"
                ? "border-[#06424B] text-[#06424B]"
                : "border-transparent text-[#789094] hover:text-[#06424B]"
            }`}
          >
            <Eye size={15} />
            Output
          </button>
        </div>

        <button
          type="button"
          onClick={copyCode}
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-[#526D71] transition hover:bg-white"
        >
          {copied ? (
            <Check size={14} className="text-[#34866E]" />
          ) : (
            <Copy size={14} />
          )}

          {copied ? "Copied" : "Copy Code"}
        </button>
      </div>

      {/* Playground Workspace */}
      <div
        className={`grid min-h-[390px] lg:grid-cols-2 ${
          isFullscreen ? "min-h-0 flex-1" : ""
        }`}
      >

        {/* Code Editor */}
        <div
          className={`flex min-w-0 flex-col ${
            activeTab === "preview" ? "hidden lg:flex" : ""
          }`}
        >
          <div className="flex items-center justify-between border-b border-white/10 bg-[#173A42] px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#FFAB0B]" />

              <span className="text-[11px] font-bold text-white/80">
                index.html
              </span>
            </div>

            <span className="text-[10px] text-white/45">
              Editable
            </span>
          </div>

          <div
            className={`min-h-[340px] flex-1 overflow-auto bg-[#102E36] ${
              isFullscreen ? "min-h-0" : ""
            }`}
          >
            <CodeMirror
              value={code}
              height={isFullscreen ? "100%" : "390px"}
              minHeight="340px"
              extensions={editorExtensions}
              theme="dark"
              basicSetup={{
                lineNumbers: true,
                foldGutter: true,
                highlightActiveLine: true,
                highlightActiveLineGutter: true,
                autocompletion: true,
                bracketMatching: true,
                closeBrackets: true,
                searchKeymap: true,
                indentOnInput: true,
              }}
              onChange={(value) => setCode(value)}
              aria-label="HTML code editor"
            />
          </div>

          <div className="border-t border-white/10 bg-[#173A42] px-4 py-2.5">
            <p className="text-[10px] text-white/45">
              Edit the HTML code and watch your output update.
            </p>
          </div>
        </div>

        {/* Live Output */}
        <div
          className={`flex min-w-0 flex-col border-[#DCE5E7] lg:border-l ${
            activeTab === "editor" ? "hidden lg:flex" : ""
          }`}
        >
          <div className="flex items-center justify-between border-b border-[#E7EEEE] bg-white px-4 py-3">

            <div className="flex items-center gap-2">
              <Eye size={15} className="text-[#06424B]" />

              <span className="text-xs font-extrabold text-[#123B43]">
                Live Preview
              </span>
            </div>

            <span className="flex items-center gap-1.5 rounded-full bg-[#EAF5EF] px-2.5 py-1 text-[10px] font-bold text-[#34866E]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#34866E]" />
              Live
            </span>
          </div>

          <iframe
            title="HTML live output"
            sandbox="allow-scripts"
            srcDoc={preview}
            className={`min-h-[340px] w-full flex-1 border-0 bg-white ${
              isFullscreen ? "min-h-0" : ""
            }`}
          />
        </div>
      </div>

      {/* Playground Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E5ECEC] bg-[#F7F9F9] px-4 py-4">

        <button
          type="button"
          onClick={resetCode}
          className="flex items-center gap-2 rounded-lg border border-[#DCE5E7] bg-white px-4 py-2.5 text-xs font-bold text-[#526D71] transition hover:bg-[#EEF3F4]"
        >
          <RotateCcw size={14} />
          Reset
        </button>

        <div className="flex items-center gap-3">
          <span className="hidden text-[10px] text-[#789094] sm:block">
            Output updates automatically
          </span>

          <button
            type="button"
            onClick={runCode}
            className="flex items-center gap-2 rounded-lg bg-[#FFAB0B] px-6 py-2.5 text-xs font-extrabold text-[#123B43] shadow-sm transition hover:bg-[#F3A000] active:scale-[0.98]"
          >
            <Play size={15} fill="currentColor" />
            Run Code
          </button>
        </div>
      </div>
    </section>
  );
}

/* ======================================================
   STATIC CODE EXAMPLE
====================================================== */

function CodeBlock({ code, language }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="mt-5 overflow-hidden rounded-2xl border border-[#173A42] bg-[#102E36]">

      <div className="flex items-center justify-between border-b border-white/10 bg-[#173A42] px-4 py-3">

        <div className="flex items-center gap-2">
          <Code2 size={15} className="text-[#FFAB0B]" />

          <span className="text-[11px] font-bold uppercase tracking-wider text-[#FFAB0B]">
            {language || "Code Example"}
          </span>
        </div>

        <button
          type="button"
          onClick={copy}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white/75 transition hover:bg-white/10"
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      <pre className="overflow-x-auto p-5 text-[13px] leading-7 text-[#E5F3F0]">
        <code>{code}</code>
      </pre>
    </div>
  );
}

/* ======================================================
   LOCKED TOPIC NOTICE
====================================================== */

function LockedTopicNotice({ courseName, topicName, step, total, backTo, previousTo }) {
  return (
    <Card className="overflow-hidden border-[#DCE7E5] p-0 shadow-[0_12px_34px_rgba(6,66,75,0.07)]">
      <div className="relative overflow-hidden bg-[#06424B] px-6 py-7 sm:px-8">
        <div className="pointer-events-none absolute -right-10 -top-16 h-44 w-44 rounded-full border-[22px] border-white/[0.06]" />
        <div className="relative flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFAB0B] text-[#06424B]">
            <LockKeyhole size={21} />
          </span>
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[1.5px] text-[#FFCF70]">Learning sequence</p>
            <h1 className="mt-1 text-2xl font-extrabold text-white sm:text-[28px]">Complete the previous topic first</h1>
          </div>
        </div>
        <p className="relative mt-4 max-w-3xl text-sm leading-7 text-white/75">
          This topic is locked until the previous topic's 10-question quiz is submitted. There is no minimum score for these topic quizzes.
        </p>
      </div>

      <div className="p-6 sm:p-8">
        <div className="flex flex-col gap-4 rounded-2xl border border-[#E4ECEB] bg-[#F7F9F9] p-5 sm:flex-row sm:items-center">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-lg font-extrabold text-[#06424B] shadow-sm">
            {String(step).padStart(2, "0")}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#8A9B9D]">{courseName} · Topic {step} of {total}</p>
            <h2 className="mt-1 text-lg font-extrabold text-[#06424B]">{topicName}</h2>
            <p className="mt-1 text-sm leading-6 text-[#5A7478]">Finish the previous topic's lesson and submit all 10 quiz questions. Your score will not block the next topic.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 self-start rounded-full bg-[#FFF1D1] px-3 py-2 text-[11px] font-extrabold text-[#94650C] sm:self-center">
            <LockKeyhole size={13} /> Locked
          </span>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <LinkButton to={backTo} variant="gold" icon={ArrowLeft}>
            Back to {courseName} in My Learning
          </LinkButton>
          {previousTo && (
            <LinkButton to={previousTo} variant="outline" icon={PlayCircle}>
              Open Previous Topic
            </LinkButton>
          )}
        </div>
      </div>
    </Card>
  );
}

/* ======================================================
   MAIN LESSON PAGE
====================================================== */

function TechnologyLessonContent() {
  const { technologySlug, topicId } = useParams();
  const progress = useProgress();

  const technology =
    technologies.find((item) => item.id === technologySlug) ||
    technologies[0];

  const topicIndex = Math.max(
    0,
    technology.topics.findIndex((item) => item.id === topicId)
  );

  const topic = technology.topics[topicIndex];

  const prev = technology.topics[topicIndex - 1];
  const next = technology.topics[topicIndex + 1];

  const quiz = getQuizForTopic(technology.id, topic.id);

  const done = Boolean(
    progress.completed[`${technology.id}/${topic.id}`]
  );
  const lessonRead = hasReadLesson(progress, technology.id, topic.id) || done;

  useEffect(() => {
    rememberLastTopic(technology.id, topic.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [technology.id, topic.id]);

  const previousTopicComplete = !prev || Boolean(progress.completed[`${technology.id}/${prev.id}`]);
  const learningWorkspacePath = myLearningCoursePath(null, technology.id);
  if (!previousTopicComplete) {
    return (
      
        <PageShell max="max-w-[980px]">
          <LockedTopicNotice
            courseName={technology.name}
            topicName={topic.title}
            step={topicIndex + 1}
            total={technology.topics.length}
            backTo={learningWorkspacePath}
            previousTo={prev ? `/student/topics/${technology.id}/topic/${prev.id}` : null}
          />
        </PageShell>
      
    );
  }

  return (
    
      <PageShell max="max-w-[1500px]">

        <StudentPageHeader
          title="Learning Tutorial"
          subtitle={`${technology.name} / ${topic.title}`}
        />

        {/* Breadcrumb */}
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs font-semibold text-[#789094]">

          <Link
            to="/student/my-learning"
            className="!text-[#526D71] !no-underline hover:!text-[#06424B]"
          >
            My Learning
          </Link>

          <ChevronRight size={14} />

          <Link
            to={learningWorkspacePath}
            className="!text-[#526D71] !no-underline hover:!text-[#06424B]"
          >
            {technology.name}
          </Link>

          <ChevronRight size={14} />

          <span className="text-[#06424B]">
            {topic.title}
          </span>
        </nav>

        <div className="grid gap-6 lg:grid-cols-[250px_minmax(0,1fr)] 2xl:grid-cols-[250px_minmax(0,1fr)_220px]">

          {/* LEFT: TOPIC NAVIGATION */}
          <aside className="lg:sticky lg:top-5 lg:h-fit">

            <Card className="overflow-hidden">

              <div className="bg-[#123B43] px-5 py-5">

                <div className="mb-3 flex items-center gap-2">
                  <BookOpen size={15} className="text-[#FFAB0B]" />

                  <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#FFAB0B]">
                    Learning Path
                  </span>
                </div>

                <h2 className="text-xl font-extrabold text-white">
                  {technology.name}
                </h2>

                <p className="mt-1 text-xs text-white/55">
                  Step-by-step tutorials
                </p>
              </div>

              <nav className="max-h-[65vh] space-y-1 overflow-y-auto p-3">

                {technology.topics.map((item, i) => {
                  const active = item.id === topic.id;

                  const complete = Boolean(
                    progress.completed[
                      `${technology.id}/${item.id}`
                    ]
                  );

                  return (
                    <Link
                      key={item.id}
                      to={`/student/topics/${technology.id}/topic/${item.id}`}
                      className={`flex items-center gap-3 rounded-xl px-3 py-3 text-[13px] !no-underline transition ${
                        active
                          ? "bg-[#E9F0EF] font-bold !text-[#06424B] ring-1 ring-[#06424B]/10"
                          : "font-medium !text-[#526D71] hover:bg-[#F4F7F7]"
                      }`}
                    >
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold ${
                          complete
                            ? "bg-[#06424B] text-white"
                            : active
                            ? "bg-[#FFAB0B] text-[#123B43]"
                            : "bg-[#EEF3F4] text-[#526D71]"
                        }`}
                      >
                        {complete ? (
                          <CheckCircle2 size={15} />
                        ) : (
                          i + 1
                        )}
                      </span>

                      <span className="min-w-0 flex-1 leading-5">
                        {item.title}
                      </span>

                      {active && (
                        <ChevronRight
                          size={15}
                          className="shrink-0 text-[#06424B]"
                        />
                      )}
                    </Link>
                  );
                })}

                {quiz && (
                  <div className="mt-3 border-t border-[#E9EEEE] px-3 py-4">
                    {done ? (
                      <p className="inline-flex items-center gap-2 text-xs font-extrabold text-[#28765E]">
                        <CheckCircle2 size={17} /> {topic.title} quiz completed
                      </p>
                    ) : lessonRead ? (
                      <Link
                        to={`/student/quiz/${quiz.slug}`}
                        className="flex items-center gap-3 rounded-xl bg-[#FFF7E6] px-3 py-3 text-xs font-bold !text-[#06424B] !no-underline transition hover:bg-[#FFF0CA]"
                      >
                        <ClipboardCheck size={18} className="text-[#C18B1C]" />
                        Open this topic's 10-question quiz
                      </Link>
                    ) : (
                      <p className="inline-flex items-center gap-2 text-xs font-semibold text-[#87989A]">
                        <LockKeyhole size={15} /> Read this lesson to unlock its quiz
                      </p>
                    )}
                  </div>
                )}
              </nav>
            </Card>
          </aside>

          {/* CENTRE: LESSON */}
          <article className="min-w-0 space-y-6">

            {/* Topic Introduction */}
            <Card className="p-6 sm:p-8">

              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-lg bg-[#FFF3D8] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#94650C]">
                  Topic {String(topicIndex + 1).padStart(2, "0")}
                </span>

                <span className="text-xs font-semibold text-[#789094]">
                  {technology.name}
                </span>
              </div>

              <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-[#123B43] sm:text-[38px]">
                {topic.title}
              </h1>

              <p className="mt-4 max-w-3xl text-[15px] leading-8 text-[#526D71]">
                {topic.summary}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">

                {prev && (
                  <LinkButton
                    to={`/student/topics/${technology.id}/topic/${prev.id}`}
                    variant="outline"
                    size="sm"
                    icon={ArrowLeft}
                  >
                    Previous
                  </LinkButton>
                )}

                {next && (
                  <LinkButton
                    to={`/student/topics/${technology.id}/topic/${next.id}`}
                    size="sm"
                    iconRight={ArrowRight}
                  >
                    Next: {next.title}
                  </LinkButton>
                )}
              </div>
            </Card>

            {/* Lesson Items */}
            {topic.lessonItems.map((lesson, index) => {

              const language = (
                lesson.language || ""
              ).toLowerCase();

              const isHtml =
                lesson.live ||
                ["html", "htm"].includes(language);

              return (
                <Card
                  key={`${topic.id}-${index}`}
                  id={`lesson-${index + 1}`}
                  className="scroll-mt-6 p-6 sm:p-8"
                >

                  {/* Lesson Heading */}
                  <div className="flex items-start gap-4">

                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFF1D1] text-sm font-extrabold text-[#94650C]">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <div className="min-w-0">
                      <h2 className="text-xl font-extrabold leading-snug text-[#123B43] sm:text-2xl">
                        {lesson.title}
                      </h2>

                      <p className="mt-1 text-xs text-[#789094]">
                        {technology.name} Tutorial
                      </p>
                    </div>
                  </div>

                  {/* Explanation */}
                  <div className="mt-5">
                    <p className="text-[15px] leading-8 text-[#405D61]">
                      {lesson.text}
                    </p>
                  </div>

                  {/* Learning Points */}
                  {lesson.points?.length > 0 && (
                    <div className="mt-6 rounded-xl border border-[#E4ECEB] bg-[#F7F9F9] p-5">

                      <h3 className="mb-4 text-xs font-extrabold uppercase tracking-wider text-[#123B43]">
                        What you will learn
                      </h3>

                      <ul className="space-y-3">
                        {lesson.points.map((point, pointIndex) => (
                          <li
                            key={pointIndex}
                            className="flex items-start gap-3 text-sm leading-6 text-[#405D61]"
                          >
                            <CheckCircle2
                              size={17}
                              className="mt-0.5 shrink-0 text-[#34866E]"
                            />

                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* HTML Compiler / Code Example */}
                  {isHtml ? (
                    <TryItYourself initial={lesson.code} />
                  ) : (
                    <>
                      <div className="mt-7">
                        <h3 className="flex items-center gap-2 text-sm font-extrabold text-[#123B43]">
                          <Code2
                            size={17}
                            className="text-[#C18B1C]"
                          />
                          Example
                        </h3>

                        <CodeBlock
                          code={lesson.code}
                          language={lesson.language}
                        />
                      </div>

                      {lesson.output && (
                        <div className="mt-4 overflow-hidden rounded-xl border border-[#DCE8E6]">

                          <div className="flex items-center gap-2 bg-[#EAF3F1] px-4 py-3">
                            <Eye
                              size={15}
                              className="text-[#34866E]"
                            />

                            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#245D53]">
                              Expected Output
                            </span>
                          </div>

                          <pre className="whitespace-pre-wrap bg-white p-5 font-mono text-[13px] leading-6 text-[#405D61]">
                            {lesson.output}
                          </pre>
                        </div>
                      )}
                    </>
                  )}
                </Card>
              );
            })}

            {/* Learning Tip */}
            <div className="flex items-start gap-4 rounded-2xl border border-[#F1DFB6] bg-[#FFFAEE] p-5 sm:p-6">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFF0C9]">
                <Lightbulb size={21} className="text-[#B07A06]" />
              </div>

              <div>
                <h3 className="text-sm font-extrabold text-[#805C17]">
                  Learning Tip
                </h3>

                <p className="mt-2 text-sm leading-7 text-[#765E2E]">
                  {topic.tip}
                </p>
              </div>
            </div>

            {/* Completion Card */}
            <Card className="p-5 sm:p-6">
              {!lessonRead && (
                <div className="mb-5 flex flex-col gap-3 rounded-xl border border-[#DCE9E7] bg-[#F7FAF9] p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-extrabold text-[#123B43]">Finished reading this lesson?</p>
                    <p className="mt-1 text-xs leading-5 text-[#71878A]">Review the lesson sections and examples above, then mark this topic as read to unlock its 10-question quiz.</p>
                  </div>
                  <button type="button" onClick={() => markLessonRead(technology.id, topic.id)} className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#06424B] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#0A515C]">
                    <CheckCircle2 size={15} /> Mark as read
                  </button>
                </div>
              )}
              {lessonRead && !done && (
                <p className="mb-5 inline-flex items-center gap-2 rounded-lg bg-[#EAF5EF] px-3 py-2 text-xs font-bold text-[#28765E]">
                  <CheckCircle2 size={14} /> Lesson marked as read · Quiz unlocked
                </p>
              )}

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-[#123B43]">
                    {done ? "Topic quiz completed" : "Complete this topic"}
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-[#789094]">
                    {done
                      ? "Your topic progress has been saved. You can review the lesson or continue to the next topic."
                      : "Take the 10-question topic quiz. Answer all 10 questions. Each answer shows immediate feedback, and the next topic unlocks regardless of your score."}
                  </p>
                </div>
                {done ? (
                  <span className="inline-flex items-center gap-2 rounded-xl bg-[#EAF5EF] px-4 py-3 text-xs font-extrabold text-[#28765E]">
                    <CheckCircle2 size={15} /> Quiz completed
                  </span>
                ) : quiz && lessonRead ? (
                  <LinkButton to={`/student/quiz/${quiz.slug}`} variant="gold" icon={ClipboardCheck}>
                    Take Topic Quiz · 10 Questions
                  </LinkButton>
                ) : quiz ? (
                  <span className="inline-flex items-center gap-2 rounded-xl bg-[#F2F5F5] px-4 py-3 text-xs font-bold text-[#839597]">
                    <LockKeyhole size={14} /> Mark this lesson as read to unlock the quiz
                  </span>
                ) : null}
              </div>

              <div className="mt-5 flex flex-wrap gap-3 border-t border-[#E9EEEE] pt-5">
                <LinkButton to="/student/resources" variant="outline" icon={FileText}>
                  Resources
                </LinkButton>
                {next && done && (
                  <LinkButton to={`/student/topics/${technology.id}/topic/${next.id}`} iconRight={ArrowRight}>
                    Next Topic
                  </LinkButton>
                )}
                {!next && done && (
                  <LinkButton to={myLearningCoursePath(null, technology.id)} iconRight={ArrowRight}>
                    Back to IT Courses in My Learning
                  </LinkButton>
                )}
              </div>
            </Card>

            {/* Reference */}
            <a
              href={technology.reference}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-xs font-semibold !text-[#526D71] !no-underline transition hover:!text-[#06424B]"
            >
              <ExternalLink size={14} />
              Explore more {technology.name} tutorials
            </a>
          </article>

          {/* RIGHT: ON THIS PAGE */}
          <aside className="hidden 2xl:block">

            <div className="sticky top-5 rounded-2xl border border-[#E1E9E9] bg-white p-5">

              <div className="flex items-center gap-2">
                <BookOpen
                  size={16}
                  className="text-[#C18B1C]"
                />

                <h3 className="text-sm font-extrabold text-[#123B43]">
                  On This Page
                </h3>
              </div>

              <p className="mt-2 text-[11px] text-[#789094]">
                Jump to a section
              </p>

              <ul className="mt-5 space-y-1 border-l-2 border-[#E8EEEE]">

                {topic.lessons.map((title, i) => (
                  <li key={title}>
                    <a
                      href={`#lesson-${i + 1}`}
                      className="-ml-[2px] block border-l-2 border-transparent py-2 pl-3 text-xs font-medium leading-5 !text-[#71878A] !no-underline transition hover:border-[#FFAB0B] hover:!text-[#06424B]"
                    >
                      {title}
                    </a>
                  </li>
                ))}
              </ul>

              <div className="mt-6 rounded-xl bg-[#F4F7F7] p-4">
                <p className="text-[11px] font-bold text-[#123B43]">
                  Practice makes progress
                </p>

                <p className="mt-2 text-[11px] leading-5 text-[#789094]">
                  Try editing the examples and running your code to understand each concept.
                </p>
              </div>
            </div>
          </aside>

        </div>
      </PageShell>
    
  );
}

/* ======================================================
   API COURSE MODULE CONTENT
   GET /api/courses/{course_id}/content
   POST /api/modules/{module_id}/complete
====================================================== */

const MODULE_PROGRESS_STORAGE_PREFIX = "skillnext:course-module-progress:";

function readApiModuleProgress(courseId) {
  if (typeof window === "undefined") return [];
  try {
    const saved = JSON.parse(
      window.localStorage.getItem(`${MODULE_PROGRESS_STORAGE_PREFIX}${courseId}`) || "{}"
    );
    return Array.isArray(saved.completedModuleIds)
      ? saved.completedModuleIds.map(Number).filter(Number.isFinite)
      : [];
  } catch {
    return [];
  }
}

function isApiModuleComplete(module) {
  const status = String(module?.status || module?.completionStatus || "").toLowerCase();
  return (
    module?.completed === true ||
    module?.isCompleted === true ||
    status === "completed" ||
    Number(module?.percentage) >= 100
  );
}

function markdownBodyToBlocks(body) {
  if (!body || typeof body !== "string") return [];

  const blocks = [];
  let paragraphLines = [];
  let listItems = [];
  let listType = null;

  const flushParagraph = () => {
    if (paragraphLines.length) {
      blocks.push({ type: "paragraph", text: paragraphLines.join(" ").trim() });
      paragraphLines = [];
    }
  };

  const flushList = () => {
    if (listItems.length) {
      blocks.push({ type: listType, items: [...listItems] });
      listItems = [];
      listType = null;
    }
  };

  body.split(/\r?\n/).forEach((rawLine) => {
    const line = rawLine.trim();
    if (!line) {
      flushParagraph();
      flushList();
      return;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushList();
      blocks.push({
        type: heading[1].length === 1 ? "heading" : "subheading",
        text: heading[2],
      });
      return;
    }

    const bullet = line.match(/^[-*]\s+(.+)$/);
    const numbered = line.match(/^\d+[.)]\s+(.+)$/);
    if (bullet || numbered) {
      flushParagraph();
      const nextType = bullet ? "bullet_list" : "numbered_list";
      if (listType && listType !== nextType) flushList();
      listType = nextType;
      listItems.push((bullet || numbered)[1]);
      return;
    }

    flushList();
    paragraphLines.push(line);
  });

  flushParagraph();
  flushList();
  return blocks;
}

function ApiContentBlocks({ content }) {
  const blocks = Array.isArray(content?.blocks) && content.blocks.length
    ? content.blocks
    : markdownBodyToBlocks(content?.body);

  if (!blocks.length) {
    return (
      <p className="text-sm leading-7 text-[#718486]">
        Learning content has not been published for this item yet.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {blocks.map((block, index) => {
        const type = String(block?.type || "paragraph").toLowerCase();
        const text = block?.text || block?.content || "";
        const items = Array.isArray(block?.items) ? block.items : [];

        if (type === "heading") {
          return (
            <h2 key={index} className="pt-2 text-xl font-extrabold leading-snug text-[#123B43] sm:text-2xl">
              {text}
            </h2>
          );
        }

        if (type === "subheading") {
          return (
            <h3 key={index} className="pt-1 text-base font-extrabold leading-6 text-[#123B43] sm:text-lg">
              {text}
            </h3>
          );
        }

        if (type === "bullet_list" || type === "numbered_list") {
          const ListTag = type === "numbered_list" ? "ol" : "ul";
          return (
            <ListTag
              key={index}
              className={`${type === "numbered_list" ? "list-decimal" : "list-disc"} ml-6 space-y-2.5 text-sm leading-7 text-[#405D61] marker:text-[#B88736]`}
            >
              {items.map((item, itemIndex) => (
                <li key={itemIndex} className="pl-1">{item}</li>
              ))}
            </ListTag>
          );
        }

        return (
          <p key={index} className="text-sm leading-7 text-[#405D61] sm:text-[15px]">
            {text}
          </p>
        );
      })}
    </div>
  );
}

function CourseModuleLoading() {
  return (
    <PageShell max="max-w-[1180px]">
      <section
        role="status"
        aria-live="polite"
        aria-label="Loading course lesson"
        className="mx-auto w-full"
      >
        <div className="mb-6 flex items-center gap-4 rounded-2xl border border-[#E1E9E9] bg-white px-5 py-4 shadow-[0_8px_28px_rgba(6,66,75,0.05)]">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EEF3F4]">
            <span className="absolute inset-0 rounded-2xl border-2 border-[#DCE7E5]" />
            <span className="absolute inset-0 animate-spin rounded-2xl border-2 border-transparent border-t-[#FFAB0B]" />
            <BookOpen size={20} className="relative text-[#06424B]" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-extrabold text-[#06424B]">
              Preparing your learning space
            </p>
            <p className="mt-1 text-xs leading-5 text-[#718486]">
              Loading course modules and lesson content...
            </p>
          </div>
          <span className="ml-auto hidden h-2 w-2 shrink-0 animate-pulse rounded-full bg-[#FFAB0B] sm:block" />
        </div>

        <div className="grid gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
          <div className="hidden space-y-3 lg:block">
            <div className="h-40 animate-pulse rounded-2xl bg-[#DCE7E5]" />
            <div className="space-y-2 rounded-2xl border border-[#E5ECEB] bg-white p-4">
              {[0, 1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-10 animate-pulse rounded-xl bg-[#F0F4F3]"
                />
              ))}
            </div>
          </div>

          <div className="min-w-0 space-y-5">
            <div className="rounded-2xl border border-[#E5ECEB] bg-white p-6 sm:p-8">
              <div className="h-6 w-32 animate-pulse rounded-lg bg-[#FFF1D1]" />
              <div className="mt-5 h-9 w-3/4 animate-pulse rounded-lg bg-[#DCE7E5]" />
              <div className="mt-4 h-4 w-full animate-pulse rounded bg-[#E8EFED]" />
              <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-[#E8EFED]" />
            </div>
            <div className="space-y-4 rounded-2xl border border-[#E5ECEB] bg-white p-6 sm:p-8">
              <div className="h-6 w-2/5 animate-pulse rounded-lg bg-[#DCE7E5]" />
              <div className="h-4 w-full animate-pulse rounded bg-[#E8EFED]" />
              <div className="h-4 w-full animate-pulse rounded bg-[#E8EFED]" />
              <div className="h-4 w-4/5 animate-pulse rounded bg-[#E8EFED]" />
              <div className="mt-6 h-28 animate-pulse rounded-xl bg-[#F0F4F3]" />
            </div>
          </div>
        </div>
        <span className="sr-only">Please wait while the lesson loads.</span>
      </section>
    </PageShell>
  );
}

function ApiCourseModuleLesson({ courseId, moduleId }) {
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [completedModuleIds, setCompletedModuleIds] = useState(() => readApiModuleProgress(courseId));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCompleting, setIsCompleting] = useState(false);
  const [completionError, setCompletionError] = useState("");
  const [completionMessage, setCompletionMessage] = useState("");
  const [completionSummary, setCompletionSummary] = useState(null);

  useEffect(() => {
    let active = true;

    const loadContent = async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await getCourseContent(courseId);
        if (!response || response.success === false) {
          throw new Error(response?.message || "Course content could not be loaded.");
        }

        const payload = response.data || {};
        if (!payload.course?.id) {
          throw new Error("The course content response is missing course details.");
        }

        const visibleModules = (Array.isArray(payload.modules) ? payload.modules : [])
          .filter((item) => item && item.visible !== false)
          .map((item) => ({
            ...item,
            contents: Array.isArray(item.contents)
              ? item.contents.filter((content) => content && content.visible !== false)
              : [],
          }))
          .sort((a, b) => Number(a.position || 0) - Number(b.position || 0));

        if (active) {
          setCourse(payload.course);
          setModules(visibleModules);
          const apiDoneIds = visibleModules.filter(isApiModuleComplete).map((item) => Number(item.id));
          setCompletedModuleIds((current) => [...new Set([
            ...current,
            ...readApiModuleProgress(courseId),
            ...apiDoneIds,
          ])]);
        }
      } catch (requestError) {
        console.error("Course Content API Error:", requestError);
        if (active) {
          const backend = requestError?.response?.data;
          const message = backend?.message || backend?.detail || requestError?.message;
          setError(typeof message === "string" ? message : "We couldn't load this module's learning content. Please try again.");
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };

    loadContent();
    return () => { active = false; };
  }, [courseId]);

  useEffect(() => {
    setCompletedModuleIds(readApiModuleProgress(courseId));
    setCompletionError("");
    setCompletionMessage("");
    setCompletionSummary(null);
  }, [courseId, moduleId]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [courseId, moduleId]);

  const moduleIndex = modules.findIndex((item) => String(item.id) === String(moduleId));
  const module = moduleIndex >= 0 ? modules[moduleIndex] : null;
  const previousModule = moduleIndex > 0 ? modules[moduleIndex - 1] : null;
  const nextModule = moduleIndex >= 0 ? modules[moduleIndex + 1] || null : null;
  const completedSet = new Set(completedModuleIds.map(String));
  const isCompleted = Boolean(module && (completedSet.has(String(module.id)) || isApiModuleComplete(module)));
  const isUnlocked = Boolean(module && (isCompleted || !previousModule || completedSet.has(String(previousModule.id))));
  const learningPath = `/student/my-learning?course=${encodeURIComponent(courseId)}`;

  const handleCompleteModule = async () => {
    if (!module || isCompleting || isCompleted) return;

    setIsCompleting(true);
    setCompletionError("");
    setCompletionMessage("");

    try {
      const response = await completeModule(module.id);
      if (!response || response.success === false) {
        throw new Error(response?.message || "The module could not be marked as completed.");
      }

      const progressData = response.data || {};
      const returnedModules = Array.isArray(progressData.modules) ? progressData.modules : [];
      const returnedDoneIds = returnedModules
        .filter(isApiModuleComplete)
        .map((item) => Number(item.moduleId ?? item.id))
        .filter(Number.isFinite);
      const nextCompletedIds = [...new Set([
        ...readApiModuleProgress(courseId),
        ...completedModuleIds,
        ...returnedDoneIds,
        Number(module.id),
      ])];

      try {
        window.localStorage.setItem(
          `${MODULE_PROGRESS_STORAGE_PREFIX}${courseId}`,
          JSON.stringify({
            completedModuleIds: nextCompletedIds,
            apiProgress: progressData,
          })
        );
      } catch (storageError) {
        console.warn("Module progress could not be saved in this browser:", storageError);
      }

      setCompletedModuleIds(nextCompletedIds);
      setCompletionSummary(progressData);
      setCompletionMessage(
        response.message || `${module.name || "This module"} has been marked as completed. The next module is now unlocked.`
      );
    } catch (requestError) {
      console.error("Complete Module API Error:", requestError);
      const backend = requestError?.response?.data;
      const message = backend?.message || backend?.detail || requestError?.message;
      setCompletionError(typeof message === "string" ? message : "We couldn't complete this module. Please try again.");
    } finally {
      setIsCompleting(false);
    }
  };

 if (isLoading) {
  return (
    <Loader
      open={isLoading}
      text="Loading course content..."
    />
  );
}

  if (error || !course || !module) {
    return (
      <PageShell max="max-w-[980px]">
        <Card className="p-8">
          <h1 className="text-xl font-extrabold text-[#06424B]">
            {module ? "Unable to load module content" : "Module not found"}
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#5A7478]">
            {error || "This module is not part of the selected course."}
          </p>
          <LinkButton to={learningPath} variant="gold" className="mt-5" icon={ArrowLeft}>
            Back to My Learning
          </LinkButton>
        </Card>
      </PageShell>
    );
  }

  if (!isUnlocked) {
    return (
      <PageShell max="max-w-[980px]">
        <Card className="overflow-hidden border-[#DCE7E5] p-0">
          <div className="bg-[#06424B] px-6 py-7 text-white sm:px-8">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFAB0B] text-[#06424B]">
                <LockKeyhole size={21} />
              </span>
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[1.5px] text-[#FFCF70]">Learning sequence</p>
                <h1 className="mt-1 text-2xl font-extrabold">Complete the previous module first</h1>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-white/75">
              This module stays locked until the previous module is marked as completed.
            </p>
          </div>
          <div className="p-6 sm:p-8">
            <p className="text-sm font-bold text-[#06424B]">Previous module: {previousModule?.name || "Previous module"}</p>
            <LinkButton to={`/student/topics/${courseId}/topic/${previousModule?.id}`} variant="gold" icon={PlayCircle} className="mt-5">
              Open Previous Module
            </LinkButton>
          </div>
        </Card>
      </PageShell>
    );
  }

  const courseName = course.fullName || course.shortName || "Course";
  const totalContents = modules.reduce((total, item) => total + (item.contents?.length || 0), 0);
  const contentCount = module.contents?.length || 0;

  return (
    <PageShell max="max-w-[1500px]">
      <StudentPageHeader title={courseName} subtitle={`${course.shortName || "Course curriculum"} / ${module.name}`} />

      <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs font-semibold text-[#789094]">
        <Link to="/student/my-learning" className="!text-[#526D71] !no-underline hover:!text-[#06424B]">My Learning</Link>
        <ChevronRight size={14} />
        <Link to={learningPath} className="!text-[#526D71] !no-underline hover:!text-[#06424B]">{courseName}</Link>
        <ChevronRight size={14} />
        <span className="text-[#06424B]">{module.name}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-5 lg:h-fit">
          <Card className="overflow-hidden">
            <div className="bg-[#123B43] px-5 py-5">
              <div className="mb-3 flex items-center gap-2">
                <BookOpen size={15} className="text-[#FFAB0B]" />
                <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#FFAB0B]">Course Modules</span>
              </div>
              <h2 className="text-xl font-extrabold text-white">{courseName}</h2>
              <p className="mt-1 text-xs text-white/55">{modules.length} structured modules</p>
            </div>

            <nav className="max-h-[65vh] space-y-1 overflow-y-auto p-3">
              {modules.map((item, index) => {
                const itemComplete = completedSet.has(String(item.id)) || isApiModuleComplete(item);
                const prev = modules[index - 1];
                const itemUnlocked = itemComplete || !prev || completedSet.has(String(prev.id));
                const active = String(item.id) === String(module.id);
                const itemClass = `flex items-center gap-3 rounded-xl px-3 py-3 text-[13px] !no-underline transition ${
                  active
                    ? "bg-[#E9F0EF] font-bold !text-[#06424B] ring-1 ring-[#06424B]/10"
                    : itemUnlocked
                      ? "font-medium !text-[#526D71] hover:bg-[#F4F7F7]"
                      : "cursor-not-allowed font-medium !text-[#9AAEAF]"
                }`;
                const label = (
                  <>
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold ${itemComplete ? "bg-[#06424B] text-white" : active ? "bg-[#FFAB0B] text-[#123B43]" : "bg-[#EEF3F4] text-[#526D71]"}`}>
                      {itemComplete ? <CheckCircle2 size={15} /> : itemUnlocked ? index + 1 : <LockKeyhole size={13} />}
                    </span>
                    <span className="min-w-0 flex-1 leading-5">{item.name}</span>
                    {active && <ChevronRight size={15} className="shrink-0 text-[#06424B]" />}
                  </>
                );
                return itemUnlocked ? (
                  <Link key={item.id} to={`/student/topics/${courseId}/topic/${item.id}`} className={itemClass}>
                    {label}
                  </Link>
                ) : (
                  <div key={item.id} aria-disabled="true" className={itemClass}>
                    {label}
                  </div>
                );
              })}
            </nav>
          </Card>
        </aside>

        <article className="min-w-0 space-y-6">
          <Card className="p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg bg-[#FFF3D8] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#94650C]">
                Module {String(moduleIndex + 1).padStart(2, "0")} of {modules.length}
              </span>
              <span className="rounded-lg bg-[#EEF3F4] px-3 py-1.5 text-[10px] font-bold text-[#526D71]">
                {contentCount} {contentCount === 1 ? "learning item" : "learning items"}
              </span>
              {isCompleted && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#E1F2EC] px-3 py-1 text-[10px] font-bold text-[#28765E]">
                  <CheckCircle2 size={13} /> Module completed
                </span>
              )}
            </div>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-[#123B43] sm:text-[38px]">
              {module.name}
            </h1>
            <p className="mt-4 max-w-3xl text-[15px] leading-8 text-[#526D71]">
              {module.summary || "Read the learning items below and review the key concepts in this module."}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <LinkButton to={learningPath} variant="outline" size="sm" icon={ArrowLeft}>
                Back to Course
              </LinkButton>
              {previousModule && (
                <LinkButton to={`/student/topics/${courseId}/topic/${previousModule.id}`} variant="outline" size="sm">
                  Previous Module
                </LinkButton>
              )}
              {isCompleted && nextModule && (
                <LinkButton to={`/student/topics/${courseId}/topic/${nextModule.id}`} size="sm" iconRight={ArrowRight}>
                  Next Module
                </LinkButton>
              )}
            </div>
          </Card>

          {contentCount > 0 ? (
            module.contents.map((content, index) => (
              <Card key={content.id ?? `${module.id}-content-${index}`} className="p-6 sm:p-8">
                <div className="mb-6 flex items-start gap-4 border-b border-[#E7EEEE] pb-5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFF1D1] text-sm font-extrabold text-[#94650C]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-extrabold uppercase tracking-[1.4px] text-[#B07A06]">
                      {String(content.contentType || content.content_type || "learning content").replace(/[_-]+/g, " ")}
                    </p>
                    <h2 className="mt-1 text-xl font-extrabold leading-snug text-[#123B43] sm:text-2xl">
                      {content.title || "Learning content"}
                    </h2>
                  </div>
                </div>

                <ApiContentBlocks content={content} />

                {(content.url || content.previewUrl || content.downloadUrl) && (
                  <div className="mt-7 flex flex-wrap gap-3 border-t border-[#E7EEEE] pt-5">
                    {(content.url || content.previewUrl) && (
                      <a
                        href={content.previewUrl || content.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#DCE6E4] bg-white px-4 text-xs font-bold text-[#06424B] transition hover:bg-[#F4F7F7]"
                      >
                        <BookOpen size={15} /> Open resource
                      </a>
                    )}
                    {content.downloadUrl && (
                      <a
                        href={content.downloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#EEF3F4] px-4 text-xs font-bold text-[#06424B] transition hover:bg-[#E2EBEC]"
                      >
                        <ExternalLink size={15} /> Download {content.fileName || "file"}
                      </a>
                    )}
                  </div>
                )}
              </Card>
            ))
          ) : (
            <Card className="p-7">
              <p className="text-sm leading-7 text-[#718486]">
                This module has been published, but its learning content has not been added yet.
              </p>
            </Card>
          )}

          <Card className="p-5 sm:p-6">
            {isCompleted ? (
              <div className="rounded-xl border border-[#CFE5DB] bg-[#F3FAF6] p-4">
                <p className="inline-flex items-center gap-2 text-sm font-extrabold text-[#28765E]">
                  <CheckCircle2 size={17} /> Module completed
                </p>
                <p className="mt-1 text-xs leading-5 text-[#55786A]">
                  {completionMessage || "This module has been marked as completed. The next module is available in your learning path."}
                </p>
                {completionSummary?.percentage !== undefined && (
                  <p className="mt-2 text-xs font-bold text-[#28765E]">
                    Course module completion: {Math.round(Number(completionSummary.percentage) || 0)}%
                  </p>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-[#123B43]">Finished this module?</h3>
                  <p className="mt-1 max-w-2xl text-xs leading-5 text-[#789094]">
                    Review all learning items, then mark this module as complete. The completion API will update your course progress and release the next module.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCompleteModule}
                  disabled={isCompleting}
                  aria-busy={isCompleting}
                  className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#FFAB0B] px-5 py-3 text-xs font-extrabold text-[#06424B] shadow-[0_6px_16px_rgba(255,171,11,0.18)] transition hover:-translate-y-0.5 hover:bg-[#FFC13C] hover:shadow-[0_9px_20px_rgba(255,171,11,0.22)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#06424B] focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  {isCompleting ? (
                    <>
                      <RefreshCw size={15} className="animate-spin" />
                      Saving completion...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={15} />
                      Mark Module Complete
                    </>
                  )}
                </button>
              </div>
            )}

            {isCompleting && (
              <p role="status" aria-live="polite" className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[#F3E2B8] bg-[#FFFAEE] px-4 py-3 text-xs font-semibold text-[#805C17]">
                <RefreshCw size={14} className="animate-spin" />
                Saving your module progress securely...
              </p>
            )}

            {completionError && (
              <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs leading-5 text-red-700">
                {completionError}
              </p>
            )}

            <div className="mt-5 flex flex-wrap gap-3 border-t border-[#E9EEEE] pt-5">
              <LinkButton to={learningPath} variant="outline">All Course Modules</LinkButton>
              {isCompleted && nextModule && (
                <LinkButton to={`/student/topics/${courseId}/topic/${nextModule.id}`} variant="gold" iconRight={ArrowRight}>
                  Continue to Next Module
                </LinkButton>
              )}
              {isCompleted && !nextModule && (
                <span className="inline-flex items-center gap-2 rounded-xl bg-[#EAF5EF] px-4 py-3 text-xs font-extrabold text-[#28765E]">
                  <CheckCircle2 size={15} /> All modules completed
                </span>
              )}
            </div>
          </Card>
        </article>
      </div>
    </PageShell>
  );
}

function LessonContent() {
  const { technologySlug, topicId } = useParams();

  // Numeric route values are backend course IDs (for example /topics/5/topic/26).
  // Non-numeric values continue to use the existing technology learning path.
  if (/^\d+$/.test(String(technologySlug || ""))) {
    return <ApiCourseModuleLesson courseId={technologySlug} moduleId={topicId} />;
  }

  const technology = technologies.find((item) => item.id === technologySlug);
  const technologyTopic = technology?.topics.find((item) => item.id === topicId);

  if (!technology || !technologyTopic) {
    return (
      <PageShell max="max-w-[900px]">
        <Card className="p-8">
          <h1 className="text-xl font-extrabold text-[#06424B]">Lesson not found</h1>
          <p className="mt-2 text-sm leading-6 text-[#5A7478]">
            The requested learning topic is unavailable. Return to Explore Courses and select a valid topic.
          </p>
          <LinkButton to="/student/topics" className="mt-5">Explore Courses</LinkButton>
        </Card>
      </PageShell>
    );
  }

  return <TechnologyLessonContent />;
}

export default LessonContent;
