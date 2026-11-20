import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpenCheck,
  Check,
  CheckCircle2,
  Clock3,
  Code2,
  Copy,
  Play,
  Terminal,
  GraduationCap,
  Info,
  LoaderCircle,
  LockKeyhole,
  Maximize2,
  ShieldAlert,
  ShieldCheck,
  Trophy,
} from "lucide-react";

import {
  getFinalAssessment,
  startAssessment,
  submitAssessmentAttempt,
} from "../../api/assessment.api";
import { getApiErrorMessage } from "../../utils/apiErrorHandler";

const MAX_FOCUS_VIOLATIONS = 3;
const EMPTY_QUESTIONS = Object.freeze([]);

const getStudentErrorMessage = (error, fallbackMessage) => {
  const responseData = error?.response?.data;
  const detail = responseData?.detail;

  const validationMessage =
    (typeof responseData === "string" && responseData.trim() ? responseData : "") ||
    (typeof responseData?.message === "string" && responseData.message.trim()
      ? responseData.message
      : "") ||
    (typeof detail === "string" && detail.trim() ? detail : "") ||
    (Array.isArray(detail)
      ? detail.map((item) => item?.msg || item?.message || "").filter(Boolean).join(" ")
      : "");

  if (!error?.response && !error?.request && error?.message) {
    return error.message;
  }

  return validationMessage || getApiErrorMessage(error, fallbackMessage);
};

const isAnswerComplete = (value) => {
  if (Array.isArray(value)) return value.length > 0;
  return String(value ?? "").trim().length > 0;
};

const formatDuration = (seconds) => {
  const safeSeconds = Math.max(0, Number(seconds) || 0);
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
};

const formatMinutes = (value) => {
  const minutes = Number(value);
  if (!Number.isFinite(minutes) || minutes <= 0) return "No time limit";
  return `${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
};

// Keep the answer-item format consistent with the existing module assessment flow.
const buildAnswerPayload = (questions, answers) =>
  questions.map((question) => {
    const questionType = String(question.questionType || "")
      .trim()
      .toLowerCase()
      .replace(/[\s-]+/g, "_");
    const isMultiple =
      question.multipleAnswers === true ||
      questionType === "multiple_select" ||
      questionType === "multi_select";
    const isTrueFalse =
      questionType === "true_false" ||
      questionType === "boolean" ||
      questionType === "truefalse";
    const answer = answers[question.id];

    let normalizedAnswer;
    if (answer === undefined || answer === null || answer === "") {
      normalizedAnswer = isMultiple ? [] : "";
    } else if (isTrueFalse) {
      normalizedAnswer =
        answer === true || answer === "true"
          ? true
          : answer === false || answer === "false"
            ? false
            : "";
    } else {
      normalizedAnswer = answer;
    }

    return { questionId: Number(question.id), answer: normalizedAnswer };
  });

function LoadingScreen() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#EEF3F4] px-4 py-10">
      <div aria-hidden="true" className="pointer-events-none absolute -right-28 -top-32 h-80 w-80 rounded-full border-[34px] border-[#06424B]/[0.035]" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-36 -left-28 h-96 w-96 rounded-full border-[42px] border-[#FFAB0B]/[0.08]" />

      <section
        role="status"
        aria-live="polite"
        aria-busy="true"
        className="relative w-full max-w-[520px] overflow-hidden rounded-[28px] border border-[#DFE8E8] bg-white shadow-[0_22px_65px_rgba(6,66,75,0.09)]"
      >
        <div className="h-1.5 w-full bg-[#F4F6F5]">
          <div className="h-full w-2/5 animate-pulse rounded-r-full bg-[#FFAB0B]" />
        </div>

        <div className="px-7 py-9 text-center sm:px-10 sm:py-11">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] border border-[#F4E5BD] bg-[#FFF7E5] text-[#A87916]">
            <LoaderCircle size={29} className="animate-spin" />
          </span>

          <p className="mt-6 text-[10px] font-black uppercase tracking-[1.8px] text-[#A87916]">
            Skill Next · Final assessment
          </p>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-[#06424B] sm:text-[28px]">
            Preparing your assessment
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#718486]">
            We are securely retrieving your assessment details. This page will move to the instructions once everything is ready.
          </p>

          <div className="mx-auto mt-8 max-w-sm space-y-3" aria-hidden="true">
            <div className="h-3 w-full animate-pulse rounded-full bg-[#EEF3F4]" />
            <div className="h-3 w-4/5 animate-pulse rounded-full bg-[#EEF3F4]" />
            <div className="h-3 w-3/5 animate-pulse rounded-full bg-[#EEF3F4]" />
          </div>
          <p className="mt-7 text-[10px] font-semibold tracking-wide text-[#91A1A2]">
            PLEASE KEEP THIS PAGE OPEN
          </p>
        </div>
      </section>
    </main>
  );
}

function ErrorScreen({ message, onRetry, courseId }) {
  const backPath = courseId
    ? `/student/my-learning?course=${encodeURIComponent(courseId)}`
    : "/student/my-learning";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#EEF3F4] px-4 py-10">
      <section className="w-full max-w-2xl overflow-hidden rounded-[28px] border border-[#E2EAEA] bg-white shadow-[0_18px_50px_rgba(6,66,75,0.08)]">
        <div className="bg-gradient-to-br from-[#063B43] to-[#0D6068] px-7 py-8 text-white sm:px-9">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[#FFAB0B]">
            <AlertCircle size={24} />
          </span>
          <p className="mt-5 text-[10px] font-black uppercase tracking-[1.6px] text-[#FFD47A]">
            Final assessment unavailable
          </p>
          <h1 className="mt-2 text-2xl font-black">We couldn't open this assessment</h1>
          <p className="mt-2 text-sm leading-6 text-white/70">
            The assessment could not be prepared. Your attempt has not been started from this page.
          </p>
        </div>
        <div className="p-7 sm:p-9">
          <div role="alert" className="flex items-start gap-3 rounded-2xl border border-[#F0D8D2] bg-[#FFF8F6] p-4">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-[#A85A50]" />
            <p className="text-sm leading-6 text-[#80534D]">{message}</p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#FFAB0B] px-5 text-sm font-extrabold text-[#06424B] transition hover:bg-[#FFC13C]"
            >
              <LoaderCircle size={15} /> Try Again
            </button>
            <Link
              to={backPath}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#DCE6E4] px-5 text-sm font-bold text-[#06424B] !no-underline transition hover:bg-[#F4F7F7]"
            >
              <ArrowLeft size={15} /> Back to My Learning
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function InstructionModal({
  open,
  checked,
  onCheckedChange,
  onStart,
  isStarting,
  assessment,
  instructionError,
}) {
  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const preventEscapeClose = (event) => {
      if (event.key === "Escape") event.preventDefault();
    };
    document.addEventListener("keydown", preventEscapeClose, true);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", preventEscapeClose, true);
    };
  }, [open]);

  if (!open) return null;

  const questionCount = Number(assessment?.questionCount) || 0;
  const passPercentage = Number(assessment?.passPercentage) || 0;
  const timeLimit = formatMinutes(assessment?.timeLimitMinutes);
  const attemptsLeft = Number(assessment?.attemptsLeft);
  const stats = [
    { label: "Questions", value: questionCount || "—", icon: BookOpenCheck },
    { label: "Time limit", value: timeLimit, icon: Clock3 },
    { label: "Pass mark", value: `${passPercentage}%`, icon: Award },
    {
      label: "Attempts left",
      value: Number.isFinite(attemptsLeft) ? Math.max(0, attemptsLeft) : "—",
      icon: ShieldCheck,
    },
  ];
  const instructions = [
    "Answer each question independently. You can move between questions and review your responses before submitting.",
    "The timer starts only after the assessment begins. When it reaches zero, your current answers are submitted automatically.",
    "Stay on this assessment page. Switching tabs or windows, losing browser focus, or exiting fullscreen may be counted as a focus violation.",
    "Copy, cut, paste, right-click, text selection, and common keyboard shortcuts are restricted while the assessment is active. Device-level screenshots cannot be blocked by this page.",
    `You are allowed ${MAX_FOCUS_VIOLATIONS - 1} warnings. The ${MAX_FOCUS_VIOLATIONS}rd detected focus/fullscreen violation automatically submits your current answers.`,
    "Once submitted, your answers cannot be changed for that attempt. Avoid refreshing or closing the browser while the assessment is in progress.",
  ];

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center overflow-y-auto bg-[#EEF3F4] px-3 py-4 sm:px-6 sm:py-6">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="final-instructions-title"
        className="my-auto flex max-h-[calc(100dvh-32px)] w-full max-w-[760px] flex-col overflow-hidden rounded-[28px] border border-[#DCE6E4] bg-white shadow-[0_24px_70px_rgba(6,66,75,0.13)] sm:max-h-[calc(100dvh-48px)]"
      >
        <div className="h-1.5 shrink-0 bg-[#FFAB0B]" />

        <header className="shrink-0 border-b border-[#E9EFED] bg-white px-5 py-5 sm:px-8 sm:py-6">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#F1E1B8] bg-[#FFF7E5] text-[#A87916]">
              <ShieldCheck size={24} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-black uppercase tracking-[1.7px] text-[#A87916]">
                Before you begin
              </p>
              <h2 id="final-instructions-title" className="mt-1 text-xl font-black tracking-tight text-[#06424B] sm:text-[26px]">
                Final assessment instructions
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#718486]">
                Please review the assessment details and rules carefully. Your timer starts only after the assessment start request succeeds.
              </p>
            </div>
            <span className="hidden shrink-0 rounded-full border border-[#E7ECEA] bg-[#F8FAF9] px-3 py-1.5 text-[9px] font-black uppercase tracking-[1.1px] text-[#718486] sm:inline-flex">
              Final exam
            </span>
          </div>
        </header>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-8 sm:py-6">
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
            {stats.map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-2xl border border-[#E6ECEA] bg-[#F8FAF9] p-3.5 sm:p-4">
                <div className="flex items-center gap-2 text-[#9A7A37]">
                  <Icon size={14} />
                  <p className="text-[10px] font-bold text-[#829596]">{label}</p>
                </div>
                <p className="mt-2 text-base font-black leading-5 text-[#06424B] sm:text-lg">
                  {value}
                </p>
              </div>
            ))}
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-sm font-black text-[#06424B]">Important rules</h3>
              <span className="text-[10px] font-semibold text-[#91A1A2]">Please read all 6 rules</span>
            </div>
            <div className="space-y-2.5">
              {instructions.map((instruction, index) => (
                <div key={instruction} className="flex items-start gap-3 rounded-2xl border border-[#E8EFED] bg-white px-3.5 py-3 sm:px-4 sm:py-3.5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#F1E1B8] bg-[#FFF7E5] text-xs font-black text-[#93660F]">
                    {index + 1}
                  </span>
                  <p className="pt-0.5 text-[13px] leading-6 text-[#526D71] sm:text-sm">
                    {instruction}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {instructionError && (
            <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-[#F0D8D2] bg-[#FFF8F6] px-4 py-3">
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-[#A85A50]" />
              <p className="text-xs leading-5 text-[#80534D]">{instructionError}</p>
            </div>
          )}
        </div>

        <footer className="shrink-0 border-t border-[#E9EFED] bg-[#FCFDFD] px-5 py-5 sm:px-8">
          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[#F0E1BC] bg-[#FFFBF1] p-3.5 sm:p-4">
            <input
              type="checkbox"
              checked={checked}
              onChange={(event) => onCheckedChange(event.target.checked)}
              className="mt-1 h-4 w-4 shrink-0 accent-[#A87916]"
            />
            <span className="text-[13px] font-semibold leading-6 text-[#38565A] sm:text-sm">
              I have read and understood the instructions. I am ready to begin the final assessment.
            </span>
          </label>

          <button
            type="button"
            onClick={onStart}
            disabled={!checked || isStarting}
            className="mt-3 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#FFAB0B] px-5 text-sm font-black text-[#06424B] shadow-[0_7px_18px_rgba(255,171,11,0.18)] transition hover:bg-[#FFC13C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#06424B] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none"
          >
            {isStarting ? <LoaderCircle size={17} className="animate-spin" /> : <ShieldCheck size={17} />}
            {isStarting ? "Starting assessment..." : "Accept & Start Assessment"}
            {!isStarting && <ArrowRight size={16} />}
          </button>
          <p className="mt-3 text-center text-[10px] leading-5 text-[#91A1A2]">
            The attempt is counted only after the server successfully starts it. The instruction screen does not use an attempt.
          </p>
        </footer>
      </section>
    </div>
  );
}

// Load the Python runtime only when a student presses Run Code.
// Pyodide executes Python in the browser; no backend execution endpoint is needed.
let pyodideLoadPromise;
const loadPyodideRuntime = () => {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Python execution is available in the browser only."));
  }

  if (window.loadPyodide) {
    return window.loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.27.7/full/",
    });
  }

  if (!pyodideLoadPromise) {
    pyodideLoadPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector('script[data-pyodide-runtime="true"]');
      const script = existingScript || document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.js";
      script.async = true;
      script.dataset.pyodideRuntime = "true";
      script.onload = () => {
        if (window.loadPyodide) resolve(window.loadPyodide({
          indexURL: "https://cdn.jsdelivr.net/pyodide/v0.27.7/full/",
        }));
        else reject(new Error("Python runtime loaded, but its initializer was not found."));
      };
      script.onerror = () => {
        pyodideLoadPromise = null;
        reject(new Error("Could not load the Python runtime. Please check your internet connection and try again."));
      };
      if (!existingScript) document.head.appendChild(script);
    });
  }

  return pyodideLoadPromise;
};

const getMonacoLanguage = (language) => {
  const value = String(language || "plaintext").trim().toLowerCase();
  const aliases = {
    py: "python", python3: "python", python: "python",
    js: "javascript", jsx: "javascript", node: "javascript", nodejs: "javascript",
    ts: "typescript", tsx: "typescript", typescript: "typescript",
    html: "html", css: "css", scss: "scss", json: "json",
    java: "java", c: "c", cpp: "cpp", "c++": "cpp", csharp: "csharp", "c#": "csharp",
    cs: "csharp", go: "go", golang: "go", rust: "rust", rs: "rust",
    php: "php", ruby: "ruby", rb: "ruby", sql: "sql", shell: "shell",
    bash: "shell", sh: "shell", yaml: "yaml", yml: "yaml", xml: "xml",
    markdown: "markdown", md: "markdown", plaintext: "plaintext", text: "plaintext",
  };
  return aliases[value] || value.replace(/[^a-z0-9+#-]/g, "") || "plaintext";
};

function buildBrowserPreviewDocument({ language, code, stdin, runId }) {
  const safeCode = String(code || '').replace(/<\/script/gi, '<\\/script');
  const inputLines = JSON.stringify(String(stdin || '').replace(/\r\n/g, '\n').split('\n'));
  const bridge = `<script>(()=>{const runId=${JSON.stringify(runId)};const inputs=${inputLines};const send=(kind,value)=>parent.postMessage({type:'skillnext-code-output',runId,kind,value:String(value??'')},'*');['log','info','warn','error'].forEach(k=>{const original=console[k].bind(console);console[k]=(...args)=>{original(...args);send(k,args.map(v=>typeof v==='object'?JSON.stringify(v):String(v)).join(' '))}});window.prompt=(message)=>{send('log',message||'Input requested');return inputs.length?inputs.shift():''};window.addEventListener('error',e=>send('error',e.message));window.addEventListener('unhandledrejection',e=>send('error',e.reason?.message||e.reason));window.addEventListener('load',()=>send('ready','Preview loaded'))})();</script>`;

  if (language === 'html') {
    if (/<html[\s>]/i.test(code) || /<!doctype/i.test(code)) return String(code).replace(/<\/head>/i, `${bridge}</head>`);
    return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${bridge}</head><body>${code}</body></html>`;
  }
  if (language === 'css') {
    return `<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:Arial;padding:24px;color:#173A40}.sample{padding:24px;border:1px solid #dce8e6;border-radius:16px;background:#f4f7f7}${code}</style>${bridge}</head><body><div class="sample"><h2>CSS Preview</h2><p>Change the CSS to style this sample content.</p><button class="demo-button">Preview button</button></div></body></html>`;
  }
  if (language === 'react') {
    const hasMount = /createRoot\s*\(|ReactDOM\.render\s*\(/.test(code);
    const mount = hasMount ? '' : `\nconst root=ReactDOM.createRoot(document.getElementById('root'));root.render(typeof App!=='undefined'?<App/>:<div style={{padding:20}}>Create an App component to preview.</div>);`;
    const reactCode = `${code}${mount}`.replace(/<\/script/gi, '<\\/script');
    return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:Arial;padding:20px;color:#173A40}</style>${bridge}<script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script><script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script><script src="https://unpkg.com/@babel/standalone/babel.min.js"></script></head><body><div id="root"></div><script type="text/babel" data-presets="env,react">${reactCode}</script></body></html>`;
  }
  return `<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:Arial;padding:20px;color:#173A40}</style>${bridge}</head><body><p style="font-size:12px;color:#829596">JavaScript sandbox preview. Use console.log() to print output.</p><script>${safeCode}</script></body></html>`;
}

function CodingEditor({ question, value, onChange, disabled }) {
  const [copied,setCopied]=useState(false);
  const [stdin,setStdin]=useState('');
  const [output,setOutput]=useState('');
  const [runError,setRunError]=useState('');
  const [isRunning,setIsRunning]=useState(false);
  const [runtimeReady,setRuntimeReady]=useState(false);
  const [previewDocument,setPreviewDocument]=useState('');
  const [showPreview,setShowPreview]=useState(false);
  const [activeTab,setActiveTab]=useState('output');
  const previewFrameRef=useRef(null);
  const activeRunIdRef=useRef('');
  const rawLanguage=String(question.language||'python').trim().toLowerCase();
  const language=['jsx','reactjs','react.js'].includes(rawLanguage)?'react':['js','node','nodejs'].includes(rawLanguage)?'javascript':rawLanguage;
  const code=value??question.starterCode??'';
  const isPython=['python','py','python3'].includes(language);
  const isBrowserLanguage=['html','css','javascript','react'].includes(language);
  const isJava=language==='java';

  useEffect(()=>{
    const onMessage=(event)=>{
      if(event.source!==previewFrameRef.current?.contentWindow)return;
      const data=event.data;
      if(!data||data.type!=='skillnext-code-output'||data.runId!==activeRunIdRef.current)return;
      if(data.kind==='ready'){setRuntimeReady(true);setIsRunning(false);return;}
      if(data.kind==='error')setRunError(current=>current?`${current}\n${data.value}`:data.value);
      else setOutput(current=>current?`${current}\n${data.value}`:data.value);
    };
    window.addEventListener('message',onMessage);
    return()=>window.removeEventListener('message',onMessage);
  },[]);

  const copyCode=async()=>{try{await navigator.clipboard.writeText(code);setCopied(true);window.setTimeout(()=>setCopied(false),1500);}catch(error){setRunError('Clipboard access is unavailable in this browser.');}};

  const runPythonCode=async()=>{
    if(!String(code).trim()){setRunError('Write your Python code before running it.');return;}
    setIsRunning(true);setOutput('');setRunError('');setShowPreview(false);setActiveTab('output');
    try{
      const pyodide=await loadPyodideRuntime();setRuntimeReady(true);
      const lines=stdin.replace(/\r\n/g,'\n').split('\n');const out=[];const err=[];
      pyodide.setStdin({stdin:()=>lines.length?lines.shift():null});
      pyodide.setStdout({batched:chunk=>out.push(chunk)});pyodide.setStderr({batched:chunk=>err.push(chunk)});
      await pyodide.runPythonAsync(String(code));
      setOutput(out.join('')||(err.length?'':'Program executed successfully with no output.'));
      if(err.length)setRunError(err.join(''));
    }catch(error){setRunError(error?.message||'Python execution failed. Check your code and try again.');}
    finally{setIsRunning(false);}
  };

  const runBrowserCode=()=>{
    if(!String(code).trim()){setRunError('Write your code before running it.');return;}
    const runId=`${question.id}-${Date.now()}`;activeRunIdRef.current=runId;
    setIsRunning(true);setRuntimeReady(false);setOutput('');setRunError('');
    setActiveTab(['html','css','react'].includes(language)?'preview':'output');setShowPreview(true);
    setPreviewDocument(buildBrowserPreviewDocument({language,code,stdin,runId}));
    window.setTimeout(()=>{if(activeRunIdRef.current===runId)setIsRunning(false);},3000);
  };

  const runJavaCode=()=>{
    setOutput('');setActiveTab('output');setShowPreview(false);
    setRunError('Java needs both a compiler and a JVM. CheerpJ CDN runs compiled .class/.jar files; it does not compile Java source typed in this editor. A secure Java execution API or browser-based Java compiler is required to enable this Run Code button.');
  };
  const handleRun=()=>isPython?runPythonCode():isBrowserLanguage?runBrowserCode():isJava?runJavaCode():setRunError(`Run Code is not configured for ${question.language||'this language'}.`);
  const monacoLanguage=getMonacoLanguage(language==='react'?'javascript':language);

  return (
    <div className="mt-6 overflow-hidden rounded-[22px] border border-[#D8E4E2] bg-[#102B30] shadow-[0_16px_38px_rgba(6,66,75,0.12)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-[#173A40] px-4 py-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFAB0B]/15 text-[#FFAB0B]"><Code2 size={18}/></span><div><p className="text-xs font-extrabold text-white">Coding workspace</p><p className="mt-0.5 text-[10px] text-[#A9C0C0]">{isPython?'Python browser runtime':isBrowserLanguage?'Live browser preview':isJava?'Java compiler setup required':'Code editor'}</p></div></div>
        <div className="flex items-center gap-2"><span className="rounded-lg border border-white/10 bg-white/[0.07] px-3 py-2 text-[10px] font-bold uppercase tracking-[1px] text-[#FFD47A]">{question.language||'Python'}</span><button type="button" onClick={copyCode} disabled={!code} className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.07] px-3 text-[11px] font-semibold text-white transition hover:bg-white/[0.13] disabled:opacity-40"><Copy size={13}/>{copied?'Copied':'Copy'}</button></div>
      </div>
      <div className="overflow-hidden bg-[#102B30]"><Editor height="360px" language={monacoLanguage} theme="vs-dark" value={code} onChange={next=>onChange(next??'')} loading={<div className="flex h-[360px] items-center justify-center text-xs text-[#A9C0C0]">Loading code editor...</div>} options={{readOnly:disabled,minimap:{enabled:false},fontSize:13,lineHeight:23,fontFamily:"'Cascadia Code','Fira Code',Consolas,monospace",fontLigatures:true,automaticLayout:true,scrollBeyondLastLine:false,wordWrap:'on',tabSize:4,insertSpaces:true,padding:{top:16,bottom:16},lineNumbers:'on',renderLineHighlight:'all',roundedSelection:true,cursorBlinking:'smooth',smoothScrolling:true,contextmenu:true,suggestOnTriggerCharacters:true,quickSuggestions:true,overviewRulerBorder:false,scrollbar:{verticalScrollbarSize:8,horizontalScrollbarSize:8}}}/></div>
      <div className="grid gap-4 border-t border-white/10 bg-[#173A40] p-4 sm:p-5 lg:grid-cols-2">
        <div className="min-w-0"><div className="mb-2 flex items-center justify-between gap-2"><label htmlFor={`stdin-${question.id}`} className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.8px] text-[#D9E7E5]"><Terminal size={14} className="text-[#FFAB0B]"/>Input (stdin)</label><span className="text-[10px] text-[#A9C0C0]">One value per line</span></div><textarea id={`stdin-${question.id}`} value={stdin} onChange={e=>setStdin(e.target.value)} disabled={disabled||isRunning} rows={4} placeholder={'Example:\n10\n20'} className="w-full resize-y rounded-xl border border-white/10 bg-[#102B30] px-3 py-3 font-mono text-xs leading-6 text-white outline-none placeholder:text-[#668084] focus:border-[#FFAB0B]/60 disabled:opacity-60"/></div>
        <div className="min-w-0"><div className="mb-2 flex items-center justify-between gap-2"><div className="flex items-center gap-2"><button type="button" onClick={()=>setActiveTab('output')} className={`rounded-lg px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wide ${activeTab==='output'?'bg-white/10 text-white':'text-[#A9C0C0]'}`}>Output</button>{isBrowserLanguage&&<button type="button" onClick={()=>setActiveTab('preview')} className={`rounded-lg px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wide ${activeTab==='preview'?'bg-white/10 text-white':'text-[#A9C0C0]'}`}>Preview</button>}</div>{runtimeReady&&<span className="text-[10px] text-[#A7D98E]">Runtime ready</span>}</div>
          {activeTab==='preview'&&showPreview&&isBrowserLanguage?<iframe key={activeRunIdRef.current} ref={previewFrameRef} title={`Code preview ${question.id}`} srcDoc={previewDocument} sandbox="allow-scripts allow-modals" className="h-[230px] w-full rounded-xl border border-white/10 bg-white"/>:<div className="min-h-[112px] max-h-[230px] overflow-auto rounded-xl border border-white/10 bg-[#0B2024] p-3 font-mono text-xs leading-6 text-[#DCE9E7]">{runError?<pre className="whitespace-pre-wrap break-words text-[#FFB4A9]">{runError}</pre>:output?<pre className="whitespace-pre-wrap break-words">{output}</pre>:<p className="text-[#668084]">Run your code to see the output here.</p>}</div>}
          {runError&&activeTab==='preview'&&<pre className="mt-2 max-h-20 overflow-auto whitespace-pre-wrap break-words text-[11px] text-[#FFB4A9]">{runError}</pre>}
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-[#102B30] px-4 py-3 sm:px-5"><p className="max-w-xl text-[10px] leading-5 text-[#A9C0C0]">{isPython?'Python runs in-browser using Pyodide.':isBrowserLanguage?'HTML, CSS, JavaScript and React run inside a sandboxed browser preview.':isJava?'Java source compilation needs an execution service or browser compiler.':'Execution is not configured.'} Your code is included in the assessment submission.</p><div className="flex items-center gap-3"><span className="hidden rounded-full bg-[#FFAB0B]/10 px-3 py-1.5 text-[10px] font-bold text-[#FFD47A] sm:inline-flex">{Number(question.score)||0} {Number(question.score)===1?'mark':'marks'}</span><button type="button" onClick={handleRun} disabled={disabled||isRunning||(!isPython&&!isBrowserLanguage&&!isJava)} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#FFAB0B] px-5 text-xs font-extrabold text-[#173A40] shadow-[0_5px_16px_rgba(255,171,11,0.18)] transition hover:bg-[#FFC044] disabled:cursor-not-allowed disabled:opacity-50">{isRunning?<LoaderCircle size={15} className="animate-spin"/>:<Play size={15} fill="currentColor"/>}{isRunning?'Running...':'Run Code'}</button></div></div>
    </div>
  );
}


function QuestionAnswer({ question, value, onChange, disabled, isITCourse }) {
  const options = Array.isArray(question.options) ? question.options : [];
  const questionType = String(question.questionType || "text")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
  const isTrueFalse = ["true_false", "boolean", "truefalse"].includes(questionType);
  const isMultiple =
    question.multipleAnswers === true ||
    ["multiple_select", "multi_select"].includes(questionType);
  const isEssay = ["essay", "long_answer", "paragraph"].includes(questionType);
  const isCode = isITCourse && (questionType === "code" || questionType.includes("coding") || Boolean(question.starterCode) || Boolean(question.language));

  if (isCode) {
    return <CodingEditor question={question} value={value} onChange={onChange} disabled={disabled} />;
  }

  if (isTrueFalse) {
    const selected = value === true || value === "true" ? true : value === false || value === "false" ? false : null;
    return (
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {[true, false].map((option) => (
          <button
            key={String(option)}
            type="button"
            disabled={disabled}
            aria-pressed={selected === option}
            onClick={() => onChange(option)}
            className={`flex min-h-[62px] items-center justify-between rounded-2xl border px-5 py-4 text-left text-sm font-bold transition ${
              selected === option
                ? "border-[#06424B] bg-[#EDF5F3] text-[#06424B]"
                : "border-[#E2EBE9] bg-white text-[#38565A] hover:border-[#D6B76D]"
            } disabled:cursor-not-allowed disabled:opacity-60`}
          >
            {option ? "True" : "False"}
            <span className={`flex h-7 w-7 items-center justify-center rounded-full border ${selected === option ? "border-[#06424B] bg-[#06424B] text-white" : "border-[#D5E1DE] text-transparent"}`}>
              <Check size={15} />
            </span>
          </button>
        ))}
      </div>
    );
  }

  if (options.length) {
    const selectedValues = isMultiple
      ? (Array.isArray(value) ? value.map(String) : [])
      : [String(value ?? "")];

    return (
      <div className="mt-6 grid gap-3">
        {options.map((option, index) => {
          const optionValue = option.id ?? option.value ?? option.text;
          const selected = selectedValues.includes(String(optionValue));
          return (
            <label
              key={optionValue ?? index}
              className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-4 text-sm transition sm:px-5 ${
                selected ? "border-[#06424B] bg-[#EDF5F3] text-[#06424B]" : "border-[#E2EBE9] bg-white text-[#38565A] hover:border-[#D6B76D]"
              } ${disabled ? "cursor-not-allowed opacity-70" : ""}`}
            >
              <input
                type={isMultiple ? "checkbox" : "radio"}
                name={`final-question-${question.id}`}
                checked={selected}
                disabled={disabled}
                onChange={() => {
                  if (!isMultiple) {
                    onChange(option.id ?? option.value ?? option.text);
                    return;
                  }
                  const nextIds = selected
                    ? selectedValues.filter((id) => id !== String(optionValue))
                    : [...selectedValues, String(optionValue)];
                  onChange(nextIds.map((id) => {
                    const match = options.find((item) => String(item.id ?? item.value ?? item.text) === id);
                    return match?.id ?? match?.value ?? match?.text ?? id;
                  }));
                }}
                className="h-4 w-4 shrink-0 accent-[#06424B]"
              />
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#F0F5F4] text-xs font-black text-[#526D71]">
                {isMultiple ? (selected ? <Check size={15} /> : index + 1) : String.fromCharCode(65 + index)}
              </span>
              <span className="min-w-0 flex-1 font-semibold leading-6">{option.text ?? option.label ?? String(option.value ?? "")}</span>
              {selected && <CheckCircle2 size={18} className="shrink-0 text-[#06424B]" />}
            </label>
          );
        })}
      </div>
    );
  }

  return (
    <div className="mt-6">
      <label htmlFor={`final-answer-${question.id}`} className="mb-2 block text-xs font-extrabold uppercase tracking-[0.8px] text-[#526D71]">
        {isCode ? "Your solution" : isEssay ? "Your response" : "Your answer"}
      </label>
      {isCode || isEssay ? (
        <textarea
          id={`final-answer-${question.id}`}
          value={value ?? (isCode ? question.starterCode || "" : "")}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          rows={isCode ? 12 : 7}
          spellCheck={!isCode}
          placeholder={isCode ? "Write your solution here..." : "Write your response here..."}
          className={`w-full resize-y rounded-2xl border border-[#DCE8E6] bg-[#FCFDFD] px-4 py-4 text-sm leading-7 text-[#23464B] outline-none transition focus:border-[#06424B] focus:ring-4 focus:ring-[#06424B]/[0.07] disabled:bg-[#F4F7F7] ${isCode ? "font-mono text-[13px]" : ""}`}
        />
      ) : (
        <input
          id={`final-answer-${question.id}`}
          type="text"
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          autoComplete="off"
          placeholder="Enter your answer..."
          className="h-12 w-full rounded-2xl border border-[#DCE8E6] bg-[#FCFDFD] px-4 text-sm text-[#23464B] outline-none transition focus:border-[#06424B] focus:ring-4 focus:ring-[#06424B]/[0.07] disabled:bg-[#F4F7F7]"
        />
      )}
    </div>
  );
}


const isITCourseRecord = (...records) => {
  const values = [];
  const addValue = (value) => {
    if (typeof value === "string" || typeof value === "number") values.push(String(value));
    else if (value && typeof value === "object") {
      if (typeof value.name === "string") values.push(value.name);
      if (typeof value.title === "string") values.push(value.title);
    }
  };

  records.filter(Boolean).forEach((record) => {
    [
      record.fullName,
      record.shortName,
      record.name,
      record.title,
      record.courseName,
      record.category,
      record.categoryName,
      record.track,
      record.courseType,
      record.type,
      record.subject,
      record.program,
      record.department,
      record.courseCategory,
      record.courseTrack,
      record.course?.fullName,
      record.course?.shortName,
      record.course?.name,
      record.course?.category,
      record.course?.categoryName,
      record.course?.track,
      record.course?.courseType,
    ].forEach(addValue);
  });

  return /python|programming|software|web development|web technology|javascript|react|java|html|css|computer science|information technology|\\bit\\b/i.test(values.join(" "));
};

function FinalAssessmentPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const courseId = searchParams.get("course");
  const routeFinalAssessmentId = location.state?.finalAssessmentId ?? null;

  const [assessment, setAssessment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [showInstructions, setShowInstructions] = useState(false);
  const [instructionsAccepted, setInstructionsAccepted] = useState(false);
  const [instructionError, setInstructionError] = useState("");
  const [isStarting, setIsStarting] = useState(false);
  const [attempt, setAttempt] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [questions, setQuestions] = useState(EMPTY_QUESTIONS);
  const [answers, setAnswers] = useState({});
  const [questionIndex, setQuestionIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [answerValidation, setAnswerValidation] = useState("");
  const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);
  const [showViolationWarning, setShowViolationWarning] = useState(false);
  const [violationMessage, setViolationMessage] = useState("");
  const [focusViolationCount, setFocusViolationCount] = useState(0);
  const [fullscreenWarning, setFullscreenWarning] = useState("");
  const [result, setResult] = useState(null);

  const startLockRef = useRef(false);
  const submitLockRef = useRef(false);
  const attemptStartedRef = useRef(false);
  const focusViolationRef = useRef(0);
  const lastViolationAtRef = useRef(0);
  const submitHandlerRef = useRef(null);
  const answersRef = useRef(answers);
  const questionsRef = useRef(questions);
  const attemptRef = useRef(attempt);
  const assignmentRef = useRef(assignment);

  useEffect(() => { answersRef.current = answers; }, [answers]);
  useEffect(() => { questionsRef.current = questions; }, [questions]);
  useEffect(() => { attemptRef.current = attempt; }, [attempt]);
  useEffect(() => { assignmentRef.current = assignment; }, [assignment]);

  const loadFinalAssessment = useCallback(async () => {
    if (!courseId || !/^\d+$/.test(String(courseId)) || Number(courseId) <= 0) {
      setLoadError("A valid course ID is required. Please open the final assessment from My Learning.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setLoadError("");
    try {
      const response = await getFinalAssessment(courseId);
      if (!response || response.success === false) {
        throw new Error(response?.message || "The final assessment could not be loaded.");
      }

      const payload = response.data ?? response;
      const data = payload?.finalAssessment ?? payload?.assessment ?? payload;
      if (!data || typeof data !== "object" || Array.isArray(data)) {
        throw new Error("The final assessment details are unavailable in the server response.");
      }
      if (data.courseId !== undefined && String(data.courseId) !== String(courseId)) {
        throw new Error("The final assessment does not belong to the selected course.");
      }

      setAssessment(data);
      setShowInstructions(
        data.passed !== true &&
        data.visible !== false &&
        data.pendingReview !== true &&
        !(Number(data.maxAttempts) > 0 && Number.isFinite(Number(data.attemptsLeft)) && Number(data.attemptsLeft) <= 0)
      );
    } catch (error) {
      console.error("Load Final Assessment Error:", error);
      setAssessment(null);
      setLoadError(getStudentErrorMessage(error, "We couldn't load the final assessment. Please try again."));
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => { loadFinalAssessment(); }, [loadFinalAssessment]);

  const status = useMemo(() => {
    if (!assessment) return { label: "Loading", tone: "muted" };
    if (assessment.passed === true) return { label: "Passed", tone: "success" };
    if (assessment.visible === false) return { label: "Unavailable", tone: "muted" };
    if (assessment.pendingReview === true) return { label: "Under review", tone: "warning" };
    if (Number(assessment.maxAttempts) > 0 && Number.isFinite(Number(assessment.attemptsLeft)) && Number(assessment.attemptsLeft) <= 0) {
      return { label: "Attempts exhausted", tone: "danger" };
    }
    return { label: "Ready to start", tone: "success" };
  }, [assessment]);

  const assessmentId =
    assessment?.id ?? assessment?.assessmentId ?? assessment?.finalAssessmentId ?? routeFinalAssessmentId;

  const handleStart = useCallback(async () => {
    if (!instructionsAccepted) {
      setInstructionError("Please confirm that you have read the instructions before starting.");
      return;
    }
    if (!assessmentId || startLockRef.current || isStarting) {
      if (!assessmentId) setInstructionError("The final assessment ID is missing from the assessment details.");
      return;
    }

    startLockRef.current = true;
    setIsStarting(true);
    setInstructionError("");
    setLoadError("");

    try {
      // Fullscreen is requested only from this user click, as browsers require user activation.
      if (document.documentElement?.requestFullscreen) {
        try {
          await document.documentElement.requestFullscreen();
        } catch (fullscreenError) {
          console.warn("Fullscreen request was not granted:", fullscreenError);
          setFullscreenWarning("Fullscreen could not be enabled by this browser. Keep the assessment tab active.");
        }
      } else {
        setFullscreenWarning("Fullscreen is not supported in this browser. Keep the assessment tab active.");
      }

      // This reuses the same assessment start helper used by module assessments.
      const response = await startAssessment(assessmentId);
      if (!response || response.success === false) {
        throw new Error(response?.message || "We couldn't start your final assessment. Please try again.");
      }

      const payload = response.data ?? response;
      const nextAttempt = payload.attempt ?? (payload.id ? payload : null);
      const nextAssignment = payload.assignment ?? assessment;
      const nextQuestions = Array.isArray(payload.questions)
        ? payload.questions
        : Array.isArray(nextAssignment?.questions)
          ? nextAssignment.questions
          : EMPTY_QUESTIONS;

      if (!nextAttempt?.id) throw new Error("The start response did not include a valid attempt ID.");
      if (!nextQuestions.length) throw new Error("The final assessment start response did not include any questions.");

      setAttempt(nextAttempt);
      setAssignment(nextAssignment);
      setQuestions(nextQuestions);
      const initialAnswers = {};
      nextQuestions.forEach((question) => {
        if (question.starterCode) initialAnswers[question.id] = question.starterCode;
      });
      setAnswers(initialAnswers);
      setQuestionIndex(0);
      setFocusViolationCount(0);
      focusViolationRef.current = 0;
      setShowInstructions(false);
      attemptStartedRef.current = true;

      const timeLimitMinutes = Number(nextAssignment?.timeLimitMinutes ?? assessment.timeLimitMinutes);
      const apiSeconds = Number(payload.secondsLeft);
      const deadlineMillis = nextAttempt.deadline ? new Date(nextAttempt.deadline).getTime() : NaN;
      const deadlineSeconds = Number.isFinite(deadlineMillis)
        ? Math.max(0, Math.floor((deadlineMillis - Date.now()) / 1000))
        : null;
      const initialSeconds = timeLimitMinutes <= 0
        ? null
        : Number.isFinite(apiSeconds) && apiSeconds >= 0
          ? apiSeconds
          : deadlineSeconds;
      setSecondsLeft(initialSeconds);
    } catch (error) {
      console.error("Start Final Assessment Error:", error);
      setInstructionError(getStudentErrorMessage(error, "We couldn't start the final assessment. Please try again."));
      // If the server rejected start, allow another explicit start attempt.
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    } finally {
      setIsStarting(false);
      startLockRef.current = false;
    }
  }, [assessmentId, assessment, instructionsAccepted, isStarting]);

  const handleSubmit = useCallback(async (automatic = false) => {
    const activeAttempt = attemptRef.current;
    const activeQuestions = questionsRef.current;
    if (!activeAttempt?.id || !activeQuestions.length || submitLockRef.current) return;

    submitLockRef.current = true;
    setIsSubmitting(true);
    setSubmitError("");
    setShowSubmitConfirmation(false);

    try {
      const answersPayload = buildAnswerPayload(activeQuestions, answersRef.current);
      const response = await submitAssessmentAttempt(activeAttempt.id, answersPayload);
      if (!response || response.success === false) {
        throw new Error(response?.message || "Your final assessment could not be submitted. Please try again.");
      }

      const payload = response.data ?? response;
      const resultAttempt = payload.attempt ?? payload;
      const finalResult = {
        ...resultAttempt,
        percentage: resultAttempt.percentage ?? payload.percentage ?? resultAttempt.scorePercentage ?? null,
        passed: resultAttempt.passed === true,
        autoSubmitted: automatic,
        focusViolationCount: focusViolationRef.current,
        totalQuestions: activeQuestions.length,
      };

      setResult(finalResult);
      setShowViolationWarning(false);
      setAttempt(null);
      setAssignment(null);
      setQuestions(EMPTY_QUESTIONS);
      attemptStartedRef.current = false;

      // Refresh assessment status/attempt count from the API after submission.
      try {
        const refreshed = await getFinalAssessment(courseId);
        const refreshedPayload = refreshed?.data ?? refreshed;
        const refreshedData = refreshedPayload?.finalAssessment ?? refreshedPayload?.assessment ?? refreshedPayload;
        if (refreshedData && typeof refreshedData === "object") setAssessment(refreshedData);
      } catch (refreshError) {
        console.warn("Final assessment status refresh failed:", refreshError);
      }
    } catch (error) {
      console.error("Submit Final Assessment Error:", error);
      submitLockRef.current = false;
      setSubmitError(getStudentErrorMessage(error, "We couldn't submit your answers. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  }, [courseId]);

  useEffect(() => { submitHandlerRef.current = handleSubmit; }, [handleSubmit]);

  // Security controls are deliberately active only after the backend has started an attempt.
  useEffect(() => {
    if (!attemptStartedRef.current || !attempt?.id || result) return undefined;

    const recordViolation = (reason) => {
      const now = Date.now();
      // One tab-switch can fire blur, visibility and fullscreen events together.
      if (now - lastViolationAtRef.current < 1400) return;
      lastViolationAtRef.current = now;

      const nextCount = Math.min(MAX_FOCUS_VIOLATIONS, focusViolationRef.current + 1);
      focusViolationRef.current = nextCount;
      setFocusViolationCount(nextCount);
      setViolationMessage(`${reason} Warning ${nextCount} of ${MAX_FOCUS_VIOLATIONS}.`);

      if (nextCount >= MAX_FOCUS_VIOLATIONS) {
        setShowViolationWarning(false);
        submitHandlerRef.current?.(true);
      } else {
        setShowViolationWarning(true);
      }
    };

    const onVisibilityChange = () => {
      if (document.hidden) recordViolation("You switched away from the assessment tab.");
    };
    const onWindowBlur = () => recordViolation("The assessment window lost focus.");
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) recordViolation("You exited fullscreen mode.");
    };
    const blockEvent = (event) => event.preventDefault();
    const onKeyDown = (event) => {
      const key = String(event.key || "").toLowerCase();
      const command = event.ctrlKey || event.metaKey;
      const blockedCommand = command && ["a", "c", "x", "v", "s", "p", "u", "r"].includes(key);
      const blockedDeveloperShortcut = command && event.shiftKey && ["i", "j", "c"].includes(key);
      if (blockedCommand || blockedDeveloperShortcut || key === "f12") {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    const onBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "Your assessment is in progress. Are you sure you want to leave?";
      return event.returnValue;
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("contextmenu", blockEvent);
    document.addEventListener("copy", blockEvent);
    document.addEventListener("cut", blockEvent);
    document.addEventListener("paste", blockEvent);
    document.addEventListener("selectstart", blockEvent);
    document.addEventListener("dragstart", blockEvent);
    document.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("blur", onWindowBlur);
    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener("contextmenu", blockEvent);
      document.removeEventListener("copy", blockEvent);
      document.removeEventListener("cut", blockEvent);
      document.removeEventListener("paste", blockEvent);
      document.removeEventListener("selectstart", blockEvent);
      document.removeEventListener("dragstart", blockEvent);
      document.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("blur", onWindowBlur);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [attempt?.id, result]);

  useEffect(() => {
    if (!attempt?.id || secondsLeft === null || isSubmitting || result) return undefined;
    if (secondsLeft <= 0) return undefined;
    const timerId = window.setInterval(() => {
      setSecondsLeft((current) => current === null ? null : Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(timerId);
  }, [attempt?.id, secondsLeft, isSubmitting, result]);

  useEffect(() => {
    if (secondsLeft === 0 && attempt?.id && !isSubmitting && !result) {
      handleSubmit(true);
    }
  }, [secondsLeft, attempt?.id, isSubmitting, result, handleSubmit]);

  const activeQuestions = questions || EMPTY_QUESTIONS;
  const isITCourse = isITCourseRecord(assessment, assignment, location.state?.course, location.state?.courseDetails);
  const currentQuestion = activeQuestions[questionIndex];
  const answeredCount = useMemo(
    () => activeQuestions.filter((question) => isAnswerComplete(answers[question.id])).length,
    [activeQuestions, answers]
  );
  const unansweredCount = Math.max(0, activeQuestions.length - answeredCount);
  const progress = activeQuestions.length ? (answeredCount / activeQuestions.length) * 100 : 0;
  const passPercentage = Number(assignment?.passPercentage ?? assessment?.passPercentage) || 0;
  const maxAttempts = Number(assessment?.maxAttempts) || 0;
  const attemptsUsed = Math.max(0, Number(assessment?.attemptsUsed) || 0);
  const attemptsLeft = Number(assessment?.attemptsLeft);
  const questionCount = Number(assessment?.questionCount) || activeQuestions.length || 0;
  const canStart = status.label === "Ready to start" && Boolean(assessmentId);
  const myLearningPath = courseId
    ? `/student/my-learning?course=${encodeURIComponent(courseId)}`
    : "/student/my-learning";

  const updateAnswer = (questionId, value) => {
    setAnswers((current) => ({ ...current, [questionId]: value }));
    setAnswerValidation("");
    setSubmitError("");
  };

  const requestSubmit = () => {
    if (unansweredCount > 0) {
      const firstUnanswered = activeQuestions.findIndex((question) => !isAnswerComplete(answers[question.id]));
      setQuestionIndex(Math.max(0, firstUnanswered));
      setAnswerValidation(`Please answer all questions before submitting. ${unansweredCount} remaining.`);
      return;
    }
    setShowSubmitConfirmation(true);
  };

  const dismissViolationWarning = async () => {
    setShowViolationWarning(false);
    if (!document.fullscreenElement && document.documentElement?.requestFullscreen) {
      try {
        await document.documentElement.requestFullscreen();
      } catch (error) {
        setFullscreenWarning("Fullscreen could not be restored. Keep this assessment window active.");
      }
    }
  };

  if (isLoading) return <LoadingScreen />;
  if (loadError || !assessment) return <ErrorScreen message={loadError || "The final assessment was not found."} onRetry={loadFinalAssessment} courseId={courseId} />;

  if (isSubmitting) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#EEF3F4] px-4">
        <section className="w-full max-w-lg rounded-[28px] border border-[#DFE8E8] bg-white p-8 text-center shadow-xl">
          <LoaderCircle size={32} className="mx-auto animate-spin text-[#B77A06]" />
          <h1 className="mt-5 text-2xl font-black text-[#06424B]">Submitting your assessment</h1>
          <p className="mt-2 text-sm leading-6 text-[#718486]">Your answers are being saved and evaluated. Please keep this page open.</p>
        </section>
      </main>
    );
  }

  if (result) {
    const resultPercentage = result.percentage === null || result.percentage === undefined
      ? null
      : Math.max(0, Math.min(100, Math.round(Number(result.percentage))));
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#EEF3F4] px-4 py-10">
        <section className="w-full max-w-2xl overflow-hidden rounded-[30px] border border-[#DFE8E8] bg-white shadow-[0_20px_55px_rgba(6,66,75,0.10)]">
          <div className={`px-7 py-9 text-center text-white ${result.passed ? "bg-gradient-to-br from-[#06424B] to-[#28765E]" : "bg-gradient-to-br from-[#06424B] to-[#536A6D]"}`}>
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-[#FFAB0B]">
              {result.passed ? <Trophy size={30} /> : <Award size={30} />}
            </span>
            <p className="mt-5 text-[10px] font-black uppercase tracking-[1.7px] text-[#FFD47A]">Final assessment result</p>
            <h1 className="mt-2 text-3xl font-black">{result.passed ? "Assessment passed" : "Assessment submitted"}</h1>
            <p className="mt-2 text-sm text-white/75">{result.passed ? "Well done. Your final assessment was passed." : "Your attempt has been submitted. Review your course status in My Learning."}</p>
          </div>
          <div className="grid gap-3 p-6 sm:grid-cols-3 sm:p-8">
            <div className="rounded-2xl bg-[#F4F7F7] p-4 text-center">
              <p className="text-[10px] font-bold text-[#829596]">Your score</p>
              <p className="mt-1 text-2xl font-black text-[#06424B]">{resultPercentage === null ? "—" : `${resultPercentage}%`}</p>
            </div>
            <div className="rounded-2xl bg-[#F4F7F7] p-4 text-center">
              <p className="text-[10px] font-bold text-[#829596]">Questions</p>
              <p className="mt-1 text-2xl font-black text-[#06424B]">{result.totalQuestions}</p>
            </div>
            <div className="rounded-2xl bg-[#F4F7F7] p-4 text-center">
              <p className="text-[10px] font-bold text-[#829596]">Focus warnings</p>
              <p className="mt-1 text-2xl font-black text-[#06424B]">{result.focusViolationCount}/{MAX_FOCUS_VIOLATIONS}</p>
            </div>
          </div>
          {result.autoSubmitted && (
            <p className="mx-6 rounded-xl border border-[#F0DFB8] bg-[#FFF8E8] px-4 py-3 text-xs leading-5 text-[#805C17] sm:mx-8">
              This attempt was automatically submitted because the timer ended or the focus-violation limit was reached.
            </p>
          )}
          <div className="flex flex-wrap justify-center gap-3 px-6 pb-7 pt-5 sm:px-8">
            <Link to={myLearningPath} className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#FFAB0B] px-5 text-sm font-extrabold text-[#06424B] !no-underline transition hover:bg-[#FFC13C]">
              <ArrowLeft size={16} /> Back to My Learning
            </Link>
            <button type="button" onClick={loadFinalAssessment} className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#DCE6E4] px-5 text-sm font-bold text-[#06424B] transition hover:bg-[#F4F7F7]">
              Refresh course status
            </button>
          </div>
        </section>
      </main>
    );
  }

  if (attempt?.id && activeQuestions.length > 0) {
    return (
      <main
        className="min-h-screen bg-[#EEF3F4] text-[#24464B]"
        style={{ userSelect: "none", WebkitUserSelect: "none" }}
        onContextMenu={(event) => event.preventDefault()}
        onCopy={(event) => event.preventDefault()}
        onCut={(event) => event.preventDefault()}
        onPaste={(event) => event.preventDefault()}
        onDragStart={(event) => event.preventDefault()}
      >
        <style>{`
          .final-exam-no-select, .final-exam-no-select * { -webkit-user-select: none !important; user-select: none !important; }
          .final-exam-no-select input, .final-exam-no-select textarea { caret-color: #06424B; }
        `}</style>
        <header className="sticky top-0 z-40 border-b border-[#DCE6E4] bg-white/95 backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-7">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#06424B] text-[#FFAB0B]"><GraduationCap size={21} /></span>
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-[#06424B]">{assignment?.title || assessment.title || "Final Course Assessment"}</p>
                <p className="text-[10px] font-bold uppercase tracking-[1px] text-[#829596]">Secure assessment session</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E6ECEA] bg-[#F7FAF9] px-3 py-2 text-[10px] font-extrabold text-[#526D71]">
                <ShieldAlert size={13} className="text-[#A87916]" /> Focus warnings: {focusViolationCount}/{MAX_FOCUS_VIOLATIONS}
              </span>
              {secondsLeft !== null && (
                <span className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-black tabular-nums ${secondsLeft <= 60 ? "bg-[#FFF0ED] text-[#B54B3E]" : "bg-[#06424B] text-white"}`}>
                  <Clock3 size={15} /> {formatDuration(secondsLeft)}
                </span>
              )}
            </div>
          </div>
        </header>

        <div className="final-exam-no-select mx-auto grid max-w-[1320px] gap-5 px-4 py-6 sm:px-7 lg:grid-cols-[minmax(0,1fr)_300px]">
          <section className="min-w-0 overflow-hidden rounded-[26px] border border-[#DFE8E8] bg-white shadow-[0_12px_35px_rgba(6,66,75,0.05)]">
            <div className="border-b border-[#EAF0EF] px-5 py-5 sm:px-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[1.4px] text-[#A87916]">Question {questionIndex + 1} of {activeQuestions.length}</p>
                  <h1 className="mt-1 text-lg font-black text-[#06424B] sm:text-xl">{currentQuestion?.title || "Answer the question"}</h1>
                </div>
                <span className="rounded-full bg-[#F4F7F7] px-3 py-1.5 text-[10px] font-extrabold text-[#607B7E]">{answeredCount} answered</span>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#EDF2F1]">
                <div className="h-full rounded-full bg-gradient-to-r from-[#06424B] to-[#FFAB0B] transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className="p-5 sm:p-7">
              <div className="rounded-2xl bg-[#F8FAFA] p-4 sm:p-5">
                <p className="text-[10px] font-black uppercase tracking-[1.2px] text-[#829596]">Question</p>
                <p className="mt-2 whitespace-pre-wrap text-sm font-semibold leading-7 text-[#284B50]">{currentQuestion?.questionText || currentQuestion?.question || currentQuestion?.text || "Question text is unavailable."}</p>
              </div>

              <QuestionAnswer
                question={currentQuestion}
                value={answers[currentQuestion?.id] ?? (currentQuestion?.multipleAnswers ? [] : "")}
                onChange={(value) => updateAnswer(currentQuestion.id, value)}
                disabled={isSubmitting}
                isITCourse={isITCourse}
              />

              {answerValidation && <p role="alert" className="mt-5 rounded-xl border border-[#F0DFB8] bg-[#FFF8E8] px-4 py-3 text-xs leading-5 text-[#805C17]">{answerValidation}</p>}
              {submitError && <p role="alert" className="mt-5 rounded-xl border border-[#F0D8D2] bg-[#FFF8F6] px-4 py-3 text-xs leading-5 text-[#80534D]">{submitError}</p>}

              <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[#EAF0EF] pt-5">
                <button type="button" disabled={questionIndex === 0} onClick={() => setQuestionIndex((index) => Math.max(0, index - 1))} className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#DCE6E4] px-4 text-sm font-bold text-[#526D71] transition hover:bg-[#F4F7F7] disabled:cursor-not-allowed disabled:opacity-40">
                  <ArrowLeft size={15} /> Previous
                </button>
                {questionIndex < activeQuestions.length - 1 ? (
                  <button type="button" onClick={() => setQuestionIndex((index) => Math.min(activeQuestions.length - 1, index + 1))} className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#06424B] px-5 text-sm font-extrabold text-white transition hover:bg-[#0B5962]">
                    Next Question <ArrowRight size={15} />
                  </button>
                ) : (
                  <button type="button" onClick={requestSubmit} className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#FFAB0B] px-5 text-sm font-extrabold text-[#06424B] transition hover:bg-[#FFC13C]">
                    Review & Submit <CheckCircle2 size={16} />
                  </button>
                )}
              </div>
            </div>
          </section>

          <aside className="space-y-4">
            <section className="rounded-[24px] border border-[#DFE8E8] bg-white p-5 shadow-[0_10px_28px_rgba(6,66,75,0.04)]">
              <h2 className="text-sm font-black text-[#06424B]">Question navigator</h2>
              <p className="mt-1 text-[11px] text-[#829596]">Select a number to review that question.</p>
              <div className="mt-4 grid grid-cols-5 gap-2">
                {activeQuestions.map((question, index) => {
                  const isAnswered = isAnswerComplete(answers[question.id]);
                  return (
                    <button key={question.id} type="button" onClick={() => setQuestionIndex(index)} className={`flex h-10 items-center justify-center rounded-xl border text-xs font-black transition ${index === questionIndex ? "border-[#06424B] bg-[#06424B] text-white" : isAnswered ? "border-[#CFE5DB] bg-[#EAF4EF] text-[#28765E]" : "border-[#E2EAEA] bg-[#F8FAFA] text-[#718486]"}`}>
                      {index + 1}
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 flex flex-wrap gap-3 text-[10px] font-semibold text-[#829596]">
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[#06424B]" /> Current</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[#CFE5DB]" /> Answered</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[#E2EAEA]" /> Unanswered</span>
              </div>
            </section>

            <section className="rounded-[24px] border border-[#DFE8E8] bg-white p-5 shadow-[0_10px_28px_rgba(6,66,75,0.04)]">
              <div className="flex items-center gap-2 text-[#06424B]"><ShieldCheck size={17} className="text-[#A87916]" /><h2 className="text-sm font-black">Assessment rules</h2></div>
              <p className="mt-3 text-xs leading-6 text-[#718486]">Stay on this page. Copy/paste, right-click, and text selection are disabled. Focus violations are counted and the attempt is automatically submitted at {MAX_FOCUS_VIOLATIONS}.</p>
              {fullscreenWarning && <p className="mt-3 rounded-xl border border-[#F0DFB8] bg-[#FFF8E8] p-3 text-[10px] leading-5 text-[#805C17]">{fullscreenWarning}</p>}
              <div className="mt-4 flex items-center justify-between border-t border-[#EAF0EF] pt-4 text-xs">
                <span className="font-semibold text-[#829596]">Answered</span>
                <span className="font-black text-[#06424B]">{answeredCount} / {activeQuestions.length}</span>
              </div>
              <button type="button" onClick={requestSubmit} className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#FFAB0B] px-4 text-xs font-black text-[#06424B] transition hover:bg-[#FFC13C]">
                Submit Final Assessment <ArrowRight size={15} />
              </button>
            </section>
          </aside>
        </div>

        {showSubmitConfirmation && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-[#263538]/45 p-4 backdrop-blur-[2px]">
            <section role="dialog" aria-modal="true" className="w-full max-w-md overflow-hidden rounded-[26px] bg-white shadow-2xl">
              <div className="bg-[#06424B] px-6 py-6 text-white">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-[#FFAB0B]"><CheckCircle2 size={22} /></span>
                <h2 className="mt-4 text-xl font-black">Submit final assessment?</h2>
                <p className="mt-1 text-sm leading-6 text-white/70">Once submitted, your answers cannot be changed.</p>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between rounded-xl bg-[#F4F7F7] px-4 py-3 text-sm">
                  <span className="font-semibold text-[#526D71]">Questions answered</span>
                  <strong className="text-[#06424B]">{answeredCount} / {activeQuestions.length}</strong>
                </div>
                <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <button type="button" onClick={() => setShowSubmitConfirmation(false)} className="h-11 rounded-xl border border-[#DCE6E4] px-4 text-sm font-bold text-[#526D71]">Review answers</button>
                  <button type="button" onClick={() => handleSubmit(false)} className="h-11 rounded-xl bg-[#FFAB0B] px-5 text-sm font-black text-[#06424B]">Confirm submit</button>
                </div>
              </div>
            </section>
          </div>
        )}

        {showViolationWarning && (
          <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-[#263538]/45 p-4 backdrop-blur-[2px]">
            <section role="alertdialog" aria-modal="true" className="w-full max-w-md rounded-[26px] border border-white/40 bg-white p-6 shadow-2xl">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF0ED] text-[#B54B3E]"><ShieldAlert size={24} /></span>
              <h2 className="mt-4 text-xl font-black text-[#06424B]">Focus warning</h2>
              <p className="mt-2 text-sm leading-6 text-[#718486]">{violationMessage} Keep the assessment tab active. Reaching {MAX_FOCUS_VIOLATIONS} violations will automatically submit your current answers.</p>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#EEF2F1]"><div className="h-full rounded-full bg-[#D97757]" style={{ width: `${(focusViolationCount / MAX_FOCUS_VIOLATIONS) * 100}%` }} /></div>
              <button type="button" onClick={dismissViolationWarning} className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#06424B] px-5 text-sm font-extrabold text-white"><Maximize2 size={15} /> Return to assessment</button>
            </section>
          </div>
        )}
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#EEF3F4] px-4 py-7 sm:px-7 sm:py-10">
      <div className="mx-auto max-w-[1120px]">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <Link to={myLearningPath} className="inline-flex items-center gap-2 text-sm font-bold text-[#587579] !no-underline transition hover:text-[#06424B]">
            <ArrowLeft size={16} /> Back to My Learning
          </Link>
          <span className="inline-flex items-center gap-2 rounded-full border border-[#E1EAE8] bg-white px-3 py-2 text-[10px] font-black uppercase tracking-[1.2px] text-[#789094]">
            <GraduationCap size={14} className="text-[#B88736]" /> Whole-course assessment
          </span>
        </div>

        <section className="relative isolate overflow-hidden rounded-[30px] bg-gradient-to-br from-[#063B43] via-[#06424B] to-[#0D6068] px-6 py-8 text-white shadow-[0_18px_50px_rgba(6,66,75,0.14)] sm:px-10 sm:py-10">
          <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full border-[34px] border-white/[0.055]" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[1.4px] text-[#FFD47A]"><BookOpenCheck size={13} /> Final assessment</span>
              <h1 className="mt-5 text-3xl font-black tracking-tight text-white sm:text-4xl">{assessment.title || "Final Course Assessment"}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/75">{assessment.description || "Complete this assessment to finish your course."}</p>
              <span className={`mt-5 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-black ${status.tone === "success" ? "border-[#CFE5DB] bg-[#EAF4EF] text-[#28765E]" : status.tone === "danger" ? "border-[#EAD9D4] bg-[#FFF5F2] text-[#A85A50]" : status.tone === "warning" ? "border-[#F0DFB8] bg-[#FFF8E8] text-[#916B18]" : "border-white/20 bg-white/10 text-white"}`}>
                {status.tone === "success" ? <CheckCircle2 size={13} /> : <Info size={13} />}{status.label}
              </span>
            </div>
            <div className="flex h-[122px] w-[122px] shrink-0 flex-col items-center justify-center self-start rounded-[26px] border border-white/15 bg-white/[0.08] text-center lg:self-center">
              <Trophy size={27} className="text-[#FFAB0B]" />
              <span className="mt-2 text-2xl font-black tabular-nums text-white">{Number(assessment.passPercentage) || 0}%</span>
              <span className="mt-0.5 text-[9px] font-black uppercase tracking-[1.1px] text-white/60">To pass</span>
            </div>
          </div>
        </section>

        <section className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Clock3, label: "Time limit", value: formatMinutes(assessment.timeLimitMinutes) },
            { icon: BookOpenCheck, label: "Questions", value: questionCount || "—" },
            { icon: Award, label: "Total score", value: assessment.totalScore ?? "—" },
            { icon: ShieldCheck, label: "Passing score", value: `${Number(assessment.passPercentage) || 0}%` },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-[#E2EAEA] bg-white p-4 shadow-[0_6px_18px_rgba(6,66,75,0.025)]">
              <div className="flex items-center gap-2 text-[#829596]"><item.icon size={16} className="text-[#A87916]" /><p className="text-[11px] font-bold">{item.label}</p></div>
              <p className="mt-2 text-lg font-black text-[#06424B]">{item.value}</p>
            </div>
          ))}
        </section>

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_310px]">
          <section className="rounded-[26px] border border-[#E2EAEA] bg-white p-6 shadow-[0_8px_26px_rgba(6,66,75,0.035)] sm:p-8">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF5DF] text-[#A87916]"><Info size={19} /></span>
              <div><h2 className="text-base font-black text-[#06424B]">Assessment overview</h2><p className="mt-0.5 text-xs text-[#829596]">Your final evaluation for the entire course.</p></div>
            </div>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-[#627C7F]">
              <li className="flex items-start gap-2.5"><CheckCircle2 size={16} className="mt-1 shrink-0 text-[#28765E]" />This is the final assessment for the entire course.</li>
              <li className="flex items-start gap-2.5"><CheckCircle2 size={16} className="mt-1 shrink-0 text-[#28765E]" />You need at least {Number(assessment.passPercentage) || 0}% to pass.</li>
              <li className="flex items-start gap-2.5"><CheckCircle2 size={16} className="mt-1 shrink-0 text-[#28765E]" />Time allowed: {formatMinutes(assessment.timeLimitMinutes)}.</li>
              {maxAttempts > 0 && <li className="flex items-start gap-2.5"><CheckCircle2 size={16} className="mt-1 shrink-0 text-[#28765E]" />You have {maxAttempts} total attempts.</li>}
            </ul>
            <div className="mt-6 rounded-2xl border border-[#E9EFED] bg-[#F8FAFA] p-4">
              <p className="text-xs font-black text-[#06424B]">Assessment status</p>
              <p className="mt-1 text-xs leading-6 text-[#718486]">
                {assessment.passed === true
                  ? "You have already passed this final assessment."
                  : assessment.pendingReview === true
                    ? "Your latest attempt is waiting for review."
                    : assessment.visible === false
                      ? "This assessment is currently unavailable."
                      : status.label === "Attempts exhausted"
                        ? "You have used all available attempts."
                        : "Your module requirements are complete. Review the rules, then begin when you are ready."}
              </p>
            </div>
            {loadError && <p role="alert" className="mt-4 rounded-xl border border-[#F0D8D2] bg-[#FFF8F6] px-4 py-3 text-xs text-[#80534D]">{loadError}</p>}
          </section>

          <aside className="space-y-4">
            <section className="rounded-[24px] border border-[#E2EAEA] bg-white p-5 shadow-[0_8px_26px_rgba(6,66,75,0.035)]">
              <h2 className="text-sm font-black text-[#06424B]">Your attempts</h2>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-[#F4F7F7] p-3"><p className="text-xl font-black tabular-nums text-[#06424B]">{attemptsUsed}</p><p className="mt-1 text-[10px] font-bold text-[#829596]">Used</p></div>
                <div className="rounded-xl bg-[#F4F7F7] p-3"><p className="text-xl font-black tabular-nums text-[#06424B]">{maxAttempts > 0 && Number.isFinite(attemptsLeft) ? Math.max(0, attemptsLeft) : "—"}</p><p className="mt-1 text-[10px] font-bold text-[#829596]">Remaining</p></div>
              </div>
              <div className="mt-4 border-t border-[#EAF0EF] pt-4"><p className="text-[11px] font-bold text-[#829596]">Best score</p><p className="mt-1 text-2xl font-black tabular-nums text-[#06424B]">{Number.isFinite(Number(assessment.bestPercentage)) ? `${Math.round(Number(assessment.bestPercentage))}%` : "—"}</p></div>
              {assessment.passed === true ? (
                <span className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#EAF4EF] px-4 text-xs font-black text-[#28765E]"><CheckCircle2 size={15} /> Final assessment passed</span>
              ) : (
                <button
                  type="button"
                  disabled={!canStart}
                  onClick={() => { setShowInstructions(true); setInstructionsAccepted(false); setInstructionError(""); }}
                  className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#FFAB0B] px-4 text-xs font-black text-[#06424B] transition hover:bg-[#FFC13C] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {canStart ? <><LockKeyhole size={14} /> Start Final Assessment <ArrowRight size={15} /></> : status.label}
                </button>
              )}
            </section>
            <section className="rounded-[24px] border border-[#E2EAEA] bg-[#FAFCFB] p-5">
              <div className="flex items-center gap-2 text-[#06424B]"><ShieldCheck size={18} className="text-[#B88736]" /><h3 className="text-sm font-black">Secure exam mode</h3></div>
              <p className="mt-2 text-xs leading-6 text-[#718486]">A dedicated full-page assessment screen will open. Copy/paste and text selection are disabled. Leaving the tab or fullscreen is counted as a focus warning.</p>
            </section>
          </aside>
        </div>
      </div>

      <InstructionModal
        open={showInstructions && canStart}
        checked={instructionsAccepted}
        onCheckedChange={(value) => { setInstructionsAccepted(value); setInstructionError(""); }}
        onStart={handleStart}
        isStarting={isStarting}
        assessment={assessment}
        instructionError={instructionError}
      />
    </main>
  );
}

export default FinalAssessmentPage;
