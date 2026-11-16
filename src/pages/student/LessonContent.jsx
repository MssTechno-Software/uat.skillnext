
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import CodeMirror from "@uiw/react-codemirror";
import { html } from "@codemirror/lang-html";
import { EditorView } from "@codemirror/view";

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
  Code2,
  Eye,
  BookOpen,
  Maximize2,
  Minimize2,
  Check,
  LockKeyhole,
} from "lucide-react";

import Sidebar from "../../components/Sidebar";
import StudentPageHeader from "../../components/student/StudentPageHeader";
import {
  Card,
  LinkButton,
  PageShell,
} from "../../components/student/ui";

import { courseCategories, myLearningCoursePath, technologies } from "../../data/studentLearningData";
import { useEnrolledCourses } from "../../data/studentCourseEnrollment";
import { getQuizForCourseModule, getQuizForTopic } from "../../data/quizData";
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
      <Sidebar>
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
      </Sidebar>
    );
  }

  return (
    <Sidebar>
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
    </Sidebar>
  );
}

function VocationalModuleLesson({ course, module }) {
  const progress = useProgress();
  const done = Boolean(progress.completed[`${course.id}/${module.id}`]);
  const lessonRead = hasReadLesson(progress, course.id, module.id) || done;
  const moduleIndex = course.modules.findIndex((item) => item.id === module.id);
  const previousModule = course.modules[moduleIndex - 1];
  const nextModule = course.modules[moduleIndex + 1];
  const quiz = getQuizForCourseModule(course.id, module.id);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [course.id, module.id]);

  const previousModuleComplete = !previousModule || Boolean(progress.completed[`${course.id}/${previousModule.id}`]);
  const learningWorkspacePath = myLearningCoursePath(course.id);
  if (!previousModuleComplete) {
    return (
      <Sidebar>
        <PageShell max="max-w-[980px]">
          <LockedTopicNotice
            courseName={course.name}
            topicName={module.title}
            step={moduleIndex + 1}
            total={course.modules.length}
            backTo={learningWorkspacePath}
            previousTo={previousModule ? `/student/topics/${course.id}/topic/${previousModule.id}` : null}
          />
        </PageShell>
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      <PageShell max="max-w-[1180px]">
        <StudentPageHeader title={course.name} subtitle={`${course.category} / ${module.title}`} />

        <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs font-semibold text-[#789094]">
          <Link to="/student/my-learning" className="!text-[#526D71] !no-underline hover:!text-[#06424B]">My Learning</Link>
          <ChevronRight size={14} />
          <Link to={learningWorkspacePath} className="!text-[#526D71] !no-underline hover:!text-[#06424B]">{course.name}</Link>
          <ChevronRight size={14} />
          <span className="text-[#06424B]">{module.title}</span>
        </nav>

        <div className="grid gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-5 lg:h-fit">
            <Card className="overflow-hidden">
              <div className="bg-[#123B43] px-5 py-5">
                <div className="mb-3 flex items-center gap-2">
                  <BookOpen size={15} className="text-[#FFAB0B]" />
                  <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#FFAB0B]">Course Topics</span>
                </div>
                <h2 className="text-xl font-extrabold text-white">{course.name}</h2>
                <p className="mt-1 text-xs text-white/55">{course.modules.length} structured topics</p>
              </div>
              <nav className="max-h-[65vh] space-y-1 overflow-y-auto p-3">
                {course.modules.map((item, index) => {
                  const active = item.id === module.id;
                  const complete = Boolean(progress.completed[`${course.id}/${item.id}`]);
                  const previous = course.modules[index - 1];
                  const unlocked = !previous || Boolean(progress.completed[`${course.id}/${previous.id}`]);
                  const content = (
                    <>
                      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold ${complete ? "bg-[#06424B] text-white" : active ? "bg-[#FFAB0B] text-[#123B43]" : "bg-[#EEF3F4] text-[#526D71]"}`}>
                        {complete ? <CheckCircle2 size={15} /> : unlocked ? index + 1 : <LockKeyhole size={13} />}
                      </span>
                      <span className="min-w-0 flex-1 leading-5">{item.title}</span>
                      {active && <ChevronRight size={15} className="shrink-0 text-[#06424B]" />}
                    </>
                  );
                  const classes = `flex items-center gap-3 rounded-xl px-3 py-3 text-[13px] !no-underline transition ${active ? "bg-[#E9F0EF] font-bold !text-[#06424B] ring-1 ring-[#06424B]/10" : unlocked ? "font-medium !text-[#526D71] hover:bg-[#F4F7F7]" : "cursor-not-allowed font-medium !text-[#9AAEAF]"}`;
                  return unlocked ? (
                    <Link key={item.id} to={`/student/topics/${course.id}/topic/${item.id}`} className={classes}>
                      {content}
                    </Link>
                  ) : (
                    <div key={item.id} aria-disabled="true" className={classes}>
                      {content}
                    </div>
                  );
                })}
              </nav>
            </Card>
          </aside>

          <article className="min-w-0 space-y-6">
            <Card className="p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-lg bg-[#FFF3D8] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#94650C]">Topic {String(moduleIndex + 1).padStart(2, "0")}</span>
                <span className="text-xs font-semibold text-[#789094]">{course.name}</span>
                {done && <span className="rounded-full bg-[#E1F2EC] px-3 py-1 text-[10px] font-bold text-[#28765E]">Topic Completed</span>}
              </div>
              <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-[#123B43] sm:text-[38px]">{module.title}</h1>
              <p className="mt-4 max-w-3xl text-[15px] leading-8 text-[#526D71]">{module.description}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                {previousModule && <LinkButton to={`/student/topics/${course.id}/topic/${previousModule.id}`} variant="outline" size="sm" icon={ArrowLeft}>Previous Topic</LinkButton>}
                {nextModule && done && <LinkButton to={`/student/topics/${course.id}/topic/${nextModule.id}`} size="sm" iconRight={ArrowRight}>Next Topic</LinkButton>}
              </div>
            </Card>

            <Card className="p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF1D1] text-[#94650C]"><BookOpen size={19} /></span>
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[1.4px] text-[#B07A06]">Learning Content</p>
                  <h2 className="text-xl font-extrabold text-[#123B43]">Understand the topic</h2>
                </div>
              </div>
              <div className="mt-6 space-y-5">
                {(module.overview || "Study the topic overview and review the key learning points before attempting the quiz.").split("\n\n").map((paragraph, index) => (
                  <p key={index} className="text-[15px] leading-8 text-[#405D61]">{paragraph}</p>
                ))}
              </div>

              {module.lessonSections?.length > 0 && (
                <div className="mt-8 space-y-5">
                  <div className="border-b border-[#E7EEEE] pb-3">
                    <p className="text-[10px] font-extrabold uppercase tracking-[1.5px] text-[#B07A06]">Detailed learning guide</p>
                    <h3 className="mt-1 text-lg font-extrabold text-[#123B43]">Learn the topic step by step</h3>
                    <p className="mt-1 text-sm leading-6 text-[#71878A]">Read each section in order. The examples explain how the knowledge is used in a real training or workplace situation.</p>
                  </div>
                  {module.lessonSections.map((section, sectionIndex) => (
                    <section key={`${module.id}-section-${sectionIndex}`} className="rounded-2xl border border-[#E1EAE8] bg-white p-5 sm:p-6">
                      <div className="mb-4 flex items-start gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#EAF2F0] text-xs font-extrabold text-[#245D53]">
                          {String(sectionIndex + 1).padStart(2, "0")}
                        </span>
                        <h3 className="pt-1 text-base font-extrabold leading-6 text-[#123B43]">{section.title}</h3>
                      </div>
                      {section.paragraphs?.length > 0 && (
                        <div className="space-y-4">
                          {section.paragraphs.map((paragraph, paragraphIndex) => (
                            <p key={paragraphIndex} className="text-sm leading-7 text-[#405D61]">{paragraph}</p>
                          ))}
                        </div>
                      )}
                      {section.steps?.length > 0 && (
                        <ol className="mt-4 space-y-3">
                          {section.steps.map((step, stepIndex) => (
                            <li key={stepIndex} className="flex items-start gap-3 rounded-xl bg-[#F7F9F9] p-3.5">
                              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#06424B] text-[11px] font-extrabold text-white">{stepIndex + 1}</span>
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-[#123B43]">{step.title}</p>
                                <p className="mt-1 text-sm leading-6 text-[#526D71]">{step.detail}</p>
                              </div>
                            </li>
                          ))}
                        </ol>
                      )}
                      {section.bullets?.length > 0 && (
                        <ul className="mt-4 space-y-3">
                          {section.bullets.map((item, itemIndex) => (
                            <li key={itemIndex} className="flex items-start gap-3 text-sm leading-6 text-[#405D61]">
                              <CheckCircle2 size={16} className="mt-1 shrink-0 text-[#34866E]" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </section>
                  ))}
                </div>
              )}

              {module.guidedPractice && (
                <div className="mt-7 rounded-2xl border border-[#DCE9E7] bg-white p-5 sm:p-6">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF3F1] text-[#245D53]"><PlayCircle size={18} /></span>
                    <div>
                      <p className="text-[10px] font-extrabold uppercase tracking-[1.4px] text-[#34866E]">Practical application</p>
                      <h3 className="text-base font-extrabold text-[#123B43]">Guided practice</h3>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-[#405D61]">{module.guidedPractice}</p>
                </div>
              )}
              {module.professionalChecklist?.length > 0 && (
                <div className="mt-6 rounded-2xl border border-[#E4ECEB] bg-[#F7F9F9] p-5 sm:p-6">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#123B43]">Professional practice checklist</h3>
                  <ul className="mt-4 space-y-3">
                    {module.professionalChecklist.map((item, index) => (
                      <li key={index} className="flex items-start gap-3 text-sm leading-6 text-[#405D61]">
                        <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-[#34866E]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {module.learningPoints?.length > 0 && (
                <div className="mt-7 rounded-xl border border-[#E4ECEB] bg-[#F7F9F9] p-5">
                  <h3 className="mb-4 text-xs font-extrabold uppercase tracking-wider text-[#123B43]">Key Learning Points</h3>
                  <ul className="space-y-3">
                    {module.learningPoints.map((point, index) => (
                      <li key={index} className="flex items-start gap-3 text-sm leading-6 text-[#405D61]">
                        <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-[#34866E]" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>

            <Card className="p-5 sm:p-6">
              {!lessonRead && (
                <div className="mb-5 flex flex-col gap-3 rounded-xl border border-[#DCE9E7] bg-[#F7FAF9] p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-extrabold text-[#123B43]">Finished reading this lesson?</p>
                    <p className="mt-1 text-xs leading-5 text-[#71878A]">Review the full learning content, detailed guide and practical activity above, then mark this topic as read to unlock its 10-question quiz.</p>
                  </div>
                  <button type="button" onClick={() => markLessonRead(course.id, module.id)} className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#06424B] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#0A515C]">
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
                  <h3 className="text-base font-extrabold text-[#123B43]">{done ? "Topic quiz completed" : "Check your understanding"}</h3>
                  <p className="mt-1 max-w-2xl text-xs leading-5 text-[#789094]">Complete the 10-question quiz. Each answer shows immediate feedback. Complete all 10 questions to unlock the next topic, regardless of score.</p>
                </div>
                {done ? (
                  <span className="inline-flex items-center gap-2 rounded-xl bg-[#EAF5EF] px-4 py-3 text-xs font-extrabold text-[#28765E]">
                    <CheckCircle2 size={15} /> Quiz completed
                  </span>
                ) : quiz && lessonRead ? (
                  <LinkButton to={`/student/quiz/${quiz.slug}`} variant="gold" icon={ClipboardCheck}>
                    Start 10-Question Quiz
                  </LinkButton>
                ) : quiz ? (
                  <span className="inline-flex items-center gap-2 rounded-xl bg-[#F2F5F5] px-4 py-3 text-xs font-bold text-[#839597]">
                    <LockKeyhole size={14} /> Mark this lesson as read to unlock the quiz
                  </span>
                ) : null}
              </div>
              <div className="mt-5 flex flex-wrap gap-3 border-t border-[#E9EEEE] pt-5">
                <LinkButton to={learningWorkspacePath} variant="outline">All Course Topics</LinkButton>
                {!nextModule && done && <LinkButton to={learningWorkspacePath} iconRight={ArrowRight}>Go to Final Assignment</LinkButton>}
              </div>
            </Card>
          </article>
        </div>
      </PageShell>
    </Sidebar>
  );
}

function LessonContent() {
  const { technologySlug, topicId } = useParams();
  const { isEnrolled } = useEnrolledCourses();
  const course = courseCategories.find((item) => item.id === technologySlug && item.type === "vocational");
  const module = course?.modules.find((item) => item.id === topicId);
  const technology = technologies.find((item) => item.id === technologySlug);
  const technologyTopic = technology?.topics.find((item) => item.id === topicId);
  const requiredCourseId = course ? course.id : technology ? technology.id : null;

  if (!requiredCourseId || (course && !module) || (technology && !technologyTopic)) {
    return (
      <Sidebar>
        <PageShell max="max-w-[900px]">
          <Card className="p-8">
            <h1 className="text-xl font-extrabold text-[#06424B]">Lesson not found</h1>
            <p className="mt-2 text-sm leading-6 text-[#5A7478]">The requested course topic is unavailable. Return to Explore Courses and select a valid topic.</p>
            <LinkButton to="/student/topics" className="mt-5">Explore Courses</LinkButton>
          </Card>
        </PageShell>
      </Sidebar>
    );
  }

  if (!isEnrolled(requiredCourseId)) {
    return (
      <Sidebar>
        <PageShell max="max-w-[900px]">
          <Card className="p-8 text-center">
            <h1 className="text-xl font-extrabold text-[#06424B]">Add this course to My Learning first</h1>
            <p className="mt-2 text-sm leading-6 text-[#5A7478]">Open the course overview and select Add Course to My Learning before starting its lessons.</p>
            <LinkButton to={`/student/topics/${course ? course.id : technology.id}`} variant="gold" className="mt-5">View Course Overview</LinkButton>
          </Card>
        </PageShell>
      </Sidebar>
    );
  }

  if (course && module) return <VocationalModuleLesson course={course} module={module} />;
  if (technology) return <TechnologyLessonContent />;
  return null;
}

export default LessonContent;
