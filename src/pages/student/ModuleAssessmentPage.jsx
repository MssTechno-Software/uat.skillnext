import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
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
  RefreshCw,
  RotateCcw,
  Send,
  ShieldCheck,
  TimerReset,
} from "lucide-react";

import { Card, PageShell } from "../../components/student/ui";
import Loader from "../../components/Loader";
import {
  restartModule,
  startAssessment,
  submitAssessmentAttempt,
} from "../../api/assessment.api";
import {
  getCourseLearningPath,
  invalidateCourseLearningPath,
} from "../../api/course.api";
import { getApiErrorMessage } from "../../utils/apiErrorHandler";

const EMPTY_IDS = Object.freeze([]);


const normalizeLearningPath = (response) => {
  if (!response || response.success === false) {
    throw new Error(response?.message || "We couldn't verify your course progress.");
  }

  const payload = response.data ?? response;
  if (!payload?.course?.id || !Array.isArray(payload.modules)) {
    throw new Error("The Learning Path API returned an unexpected response.");
  }

  return {
    course: payload.course,
    modules: payload.modules
      .filter((module) => module && module.id !== undefined && module.id !== null)
      .map((module) => ({
        ...module,
        isRead: module.isRead === true,
        assessmentPassed: module.assessmentPassed === true,
        isUnlocked: module.isUnlocked === true,
        position: Number(module.position) || 0,
      }))
      .sort((a, b) => a.position - b.position),
  };
};

const getStudentErrorMessage = (error, fallbackMessage) => {
  const responseData = error?.response?.data;
  const detail = responseData?.detail;

  // Keep useful field or validation messages returned by the application.
  const validationMessage =
    (typeof responseData === "string" && responseData.trim() ? responseData : "") ||
    (typeof responseData?.message === "string" && responseData.message.trim()
      ? responseData.message
      : "") ||
    (typeof detail === "string" && detail.trim() ? detail : "") ||
    (Array.isArray(detail)
      ? detail
          .map((item) => item?.msg || item?.message || "")
          .filter(Boolean)
          .join(" ")
      : "");

  // Errors created by local response validation should remain understandable.
  if (!error?.response && !error?.request && error?.message) {
    return error.message;
  }

  // Reuse the shared application error handler for network, timeout and HTTP errors.
  return validationMessage || getApiErrorMessage(error, fallbackMessage);
};

// Detects the backend message returned when every attempt has been used.
const isAttemptsExhaustedMessage = (message) =>
  /all (of your )?attempts|no attempts? (left|remaining)|attempts? (have been |has been |are |is )?(used|exhausted|exceeded|reached)|attempts? limit|limit (of )?attempts|max(imum)? (number of )?attempts/i.test(
    String(message || "")
  );

const formatDuration = (seconds) => {
  const safeSeconds = Math.max(0, Number(seconds) || 0);
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
};

const isAnswerComplete = (value) => {
  if (Array.isArray(value)) return value.length > 0;
  return String(value ?? "").trim().length > 0;
};

// The submit endpoint expects an answers array with question IDs and selected values.
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

    return {
      questionId: Number(question.id),
      answer: normalizedAnswer,
    };
  });

function AssessmentLoadingState({
  title = "Preparing your questions",
  message = "We’re getting your quiz ready. Please keep this page open.",
}) {
  return (
    <PageShell max="max-w-[1180px]">
      <div className="mx-auto w-full">
        <section className="mt-6 overflow-hidden rounded-[28px] border border-[#DCE7E5] bg-white shadow-[0_16px_45px_rgba(6,66,75,0.07)]">
          <div className="bg-gradient-to-br from-[#06424B] via-[#07535D] to-[#0D6871] px-6 py-8 sm:px-9">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[#FFAB0B] ring-1 ring-white/15">
                <LoaderCircle size={24} className="animate-spin" />
              </span>
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[1.6px] text-[#FFD47A]">
                  Module assessment
                </p>
                <h2 className="mt-1 text-xl font-extrabold text-white sm:text-2xl">
                  {title}
                </h2>
              </div>
            </div>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/75">
              {message}
            </p>
          </div>

          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_260px]">
            <div className="space-y-5">
              <div className="h-3 w-28 animate-pulse rounded-full bg-[#FFF0CC]" />
              <div className="h-7 w-4/5 animate-pulse rounded-lg bg-[#E5ECEB]" />
              <div className="h-4 w-full animate-pulse rounded bg-[#EEF3F3]" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-[#EEF3F3]" />
              <div className="space-y-3 pt-3">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="h-[66px] animate-pulse rounded-2xl border border-[#E9EFEE] bg-[#F8FAFA]"
                  />
                ))}
              </div>
            </div>

            <aside className="space-y-3">
              <div className="h-36 animate-pulse rounded-2xl bg-[#F1F5F4]" />
              <div className="h-48 animate-pulse rounded-2xl bg-[#F1F5F4]" />
            </aside>
          </div>
        </section>
      </div>
    </PageShell>
  );
}

function AssessmentLoadError({
  message,
  onRetry,
  courseId,
  passedModuleIds = EMPTY_IDS,
  attemptsExhausted = false,
  onRestart,
  isRestarting = false,
  restartError = "",
}) {
  const backPath = courseId
    ? `/student/my-learning?course=${encodeURIComponent(courseId)}`
    : "/student/my-learning";

  return (
    <PageShell max="max-w-[900px]">
      <Card className="mt-6 overflow-hidden border border-[#E6EDEC] p-0 shadow-[0_14px_38px_rgba(6,66,75,0.06)]">
        <div className="bg-gradient-to-r from-[#06424B] to-[#0B5962] px-6 py-7 text-white sm:px-8">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[#FFAB0B] ring-1 ring-white/15">
              {attemptsExhausted ? <RotateCcw size={23} /> : <AlertCircle size={23} />}
            </span>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[1.5px] text-[#FFD47A]">
                {attemptsExhausted ? "Attempts completed" : "Assessment unavailable"}
              </p>
              <h2 className="mt-1 text-xl font-extrabold sm:text-2xl">
                {attemptsExhausted ? "All attempts used" : "We couldn't open your quiz"}
              </h2>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          {attemptsExhausted ? (
            <div
              role="status"
              className="flex items-start gap-3 rounded-2xl border border-[#F3E2B8] bg-[#FFFAEE] p-4"
            >
              <Info size={18} className="mt-0.5 shrink-0 text-[#B07A06]" />
              <div>
                <p className="text-sm font-bold leading-6 text-[#805C17]">{message}</p>
                <p className="mt-1 text-sm leading-6 text-[#8A6B2A]">
                  Restart this module to read it again and unlock a fresh assessment.
                </p>
              </div>
            </div>
          ) : (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-2xl border border-[#F0D8D2] bg-[#FFF8F6] p-4"
            >
              <AlertCircle size={18} className="mt-0.5 shrink-0 text-[#A85A50]" />
              <p className="text-sm leading-6 text-[#80534D]">{message}</p>
            </div>
          )}

          {restartError && (
            <div
              role="alert"
              className="mt-4 flex items-start gap-2 rounded-xl border border-[#F0D8D2] bg-[#FFF8F6] px-4 py-3 text-xs leading-6 text-[#80534D]"
            >
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              <span>{restartError}</span>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            {attemptsExhausted ? (
              <button
                type="button"
                onClick={onRestart}
                disabled={isRestarting}
                aria-busy={isRestarting}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#FFAB0B] px-5 text-sm font-extrabold text-[#06424B] transition hover:bg-[#FFC13C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#06424B] focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
              >
                {isRestarting ? (
                  <LoaderCircle size={16} className="animate-spin" />
                ) : (
                  <RotateCcw size={16} />
                )}
                {isRestarting ? "Restarting module..." : "Restart Module"}
              </button>
            ) : (
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#FFAB0B] px-5 text-sm font-extrabold text-[#06424B] transition hover:bg-[#FFC13C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#06424B] focus-visible:ring-offset-2"
              >
                <TimerReset size={16} />
                Try Again
              </button>
            )}
            <Link
              to={backPath}
              state={courseId ? { courseId: Number(courseId), passedModuleIds } : undefined}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#DCE6E4] bg-white px-5 text-sm font-bold text-[#06424B] !no-underline transition hover:bg-[#F4F7F7]"
            >
              <ArrowLeft size={16} />
              Back to My Learning
            </Link>
          </div>
        </div>
      </Card>
    </PageShell>
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

function QuestionAnswer({ question, value, onChange, disabled }) {
  const options = Array.isArray(question.options) ? question.options : [];
  const questionType = String(question.questionType || "text")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  const isTrueFalse =
    questionType === "true_false" || questionType === "boolean" || questionType === "truefalse";
  const isMultiple =
    question.multipleAnswers === true || questionType === "multiple_select" || questionType === "multi_select";
  const isCode =
    questionType === "coding" || questionType === "code" || questionType.includes("coding");
  const isEssay =
    questionType === "essay" || questionType === "long_answer" || questionType === "paragraph";

  if (isCode) {
    return <CodingEditor question={question} value={value} onChange={onChange} disabled={disabled} />;
  }

  if (isTrueFalse) {
    const selectedValue = value === true || value === "true" ? true : value === false || value === "false" ? false : null;
    return (
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {[true, false].map((option) => {
          const selected = selectedValue === option;
          return (
            <button
              key={String(option)} type="button" disabled={disabled} aria-pressed={selected}
              onClick={() => onChange(option)}
              className={`flex min-h-[62px] items-center justify-between rounded-2xl border px-5 py-4 text-left text-sm font-bold transition ${selected ? "border-[#06424B] bg-[#EDF5F3] text-[#06424B] shadow-[0_6px_18px_rgba(6,66,75,0.07)]" : "border-[#E2EBE9] bg-white text-[#38565A] hover:border-[#D6B76D] hover:bg-[#FFFCF5]"} disabled:cursor-not-allowed disabled:opacity-60`}
            >
              <span>{option ? "True" : "False"}</span>
              <span className={`flex h-7 w-7 items-center justify-center rounded-full border ${selected ? "border-[#06424B] bg-[#06424B] text-white" : "border-[#D5E1DE] bg-[#F7FAF9] text-transparent"}`}><Check size={15} /></span>
            </button>
          );
        })}
      </div>
    );
  }

  if (options.length > 0) {
    const selectedIds = isMultiple ? (Array.isArray(value) ? value.map(String) : []) : [String(value ?? "")];
    return (
      <div className="mt-6 grid gap-3">
        {options.map((option, index) => {
          const optionValue = option.id ?? option.value ?? option.text;
          const selected = selectedIds.includes(String(optionValue));
          return (
            <label key={optionValue ?? index} className={`group flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-4 text-sm transition duration-200 sm:gap-4 sm:px-5 ${selected ? "border-[#06424B] bg-[#EDF5F3] text-[#06424B] shadow-[0_6px_18px_rgba(6,66,75,0.07)]" : "border-[#E2EBE9] bg-white text-[#38565A] hover:border-[#D6B76D] hover:bg-[#FFFCF5]"} ${disabled ? "cursor-not-allowed opacity-70" : ""}`}>
              <input
                type={isMultiple ? "checkbox" : "radio"} name={`question-${question.id}`}
                checked={selected} disabled={disabled}
                onChange={() => {
                  if (isMultiple) {
                    const nextIds = selected ? selectedIds.filter((id) => id !== String(optionValue)) : [...selectedIds, String(optionValue)];
                    onChange(nextIds.map((id) => {
                      const match = options.find((item) => String(item.id ?? item.value ?? item.text) === id);
                      return match?.id ?? match?.value ?? match?.text ?? id;
                    }));
                  } else onChange(option.id ?? option.value ?? option.text);
                }}
                className="h-4 w-4 shrink-0 accent-[#06424B]"
              />
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold transition ${selected ? "bg-[#06424B] text-white" : "bg-[#F0F5F4] text-[#5D777A] group-hover:bg-[#FFF0CC] group-hover:text-[#8D6817]"}`}>
                {isMultiple ? (selected ? <Check size={16} /> : <span>{index + 1}</span>) : String.fromCharCode(65 + index)}
              </span>
              <span className="min-w-0 flex-1 font-semibold leading-6">{option.text ?? option.label ?? String(option.value ?? "")}</span>
              {selected && <CheckCircle2 size={18} className="shrink-0 text-[#06424B]" />}
            </label>
          );
        })}
      </div>
    );
  }

  const answerLabel = isEssay ? "Your response" : "Your answer";
  return (
    <div className="mt-6">
      <div className="mb-2 flex items-center justify-between gap-3">
        <label htmlFor={`answer-${question.id}`} className="block text-xs font-extrabold uppercase tracking-[0.8px] text-[#526D71]">{answerLabel}</label>
        {isEssay && <span className="rounded-full bg-[#EEF3F4] px-2.5 py-1 text-[10px] font-bold text-[#526D71]">Long answer</span>}
      </div>
      {isEssay ? (
        <textarea id={`answer-${question.id}`} value={value ?? ""} onChange={(event) => onChange(event.target.value)} disabled={disabled} rows={7} placeholder="Write your response here..." className="w-full resize-y rounded-2xl border border-[#DCE8E6] bg-[#FCFDFD] px-4 py-4 text-sm leading-7 text-[#23464B] outline-none transition focus:border-[#06424B] focus:ring-4 focus:ring-[#06424B]/[0.07] disabled:bg-[#F4F7F7]" />
      ) : (
        <input id={`answer-${question.id}`} type="text" value={value ?? ""} onChange={(event) => onChange(event.target.value)} disabled={disabled} placeholder="Enter your answer..." autoComplete="off" className="h-12 w-full rounded-2xl border border-[#DCE8E6] bg-[#FCFDFD] px-4 text-sm text-[#23464B] outline-none transition focus:border-[#06424B] focus:ring-4 focus:ring-[#06424B]/[0.07] disabled:bg-[#F4F7F7]" />
      )}
      <p className="mt-2 text-[11px] text-[#8A9B9D]">Your response will be included when you submit the assessment.</p>
    </div>
  );
}

function SubmitConfirmation({ open, onCancel, onConfirm, isSubmitting, answeredCount, totalQuestions }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-[#092F35]/55 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="submit-confirmation-title"
    >
      <div className="w-full max-w-md overflow-hidden rounded-[26px] border border-white/60 bg-white shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
        <div className="bg-gradient-to-r from-[#06424B] to-[#0B5962] px-6 py-6 text-white">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-[#FFAB0B] ring-1 ring-white/15">
            <Send size={20} />
          </span>
          <h2 id="submit-confirmation-title" className="mt-4 text-xl font-extrabold">
            Ready to submit?
          </h2>
          <p className="mt-1 text-sm leading-6 text-white/75">
            Take a moment to make sure your answers are complete.
          </p>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between rounded-2xl bg-[#F4F7F7] px-4 py-3">
            <span className="text-sm font-semibold text-[#526D71]">Questions answered</span>
            <span className="text-sm font-extrabold tabular-nums text-[#06424B]">
              {answeredCount} / {totalQuestions}
            </span>
          </div>

          <p className="mt-4 text-xs leading-5 text-[#718486]">
            Once submitted, your answers cannot be changed for this attempt.
          </p>

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-[#DCE6E4] px-5 text-sm font-bold text-[#526D71] transition hover:bg-[#F4F7F7] disabled:opacity-50"
            >
              Review Answers
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isSubmitting}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#FFAB0B] px-5 text-sm font-extrabold text-[#06424B] transition hover:bg-[#FFC13C] disabled:cursor-wait disabled:opacity-60"
            >
              {isSubmitting ? <LoaderCircle size={16} className="animate-spin" /> : <Send size={15} />}
              {isSubmitting ? "Submitting..." : "Submit Assessment"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModuleAssessmentPage() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const routeContext = location.state || {};
  const courseIdFromRoute = routeContext.courseId ?? searchParams.get("course");
  const moduleIdFromRoute = routeContext.moduleId ?? searchParams.get("module");
  const nextModuleIdFromRoute = routeContext.nextModuleId ?? searchParams.get("next") ?? null;

  // Progress is loaded from the backend Learning Path API, not route state.
  const [passedModuleIds, setPassedModuleIds] = useState(EMPTY_IDS);
  const [courseName, setCourseName] = useState("");
  const [moduleName, setModuleName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [assignment, setAssignment] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [questionIndex, setQuestionIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [answerValidation, setAnswerValidation] = useState("");
  const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);
  const [attemptsExhausted, setAttemptsExhausted] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);
  const [restartError, setRestartError] = useState("");

  const startCalledRef = useRef(false);
  const submitLockRef = useRef(false);
  const autoSubmitStartedRef = useRef(false);
  const answersRef = useRef(answers);
  const questionsRef = useRef(questions);
  const attemptRef = useRef(attempt);
  const assignmentRef = useRef(assignment);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    questionsRef.current = questions;
  }, [questions]);

  useEffect(() => {
    attemptRef.current = attempt;
  }, [attempt]);

  useEffect(() => {
    assignmentRef.current = assignment;
  }, [assignment]);

  const loadAttempt = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");
    setSubmitError("");
    setAttemptsExhausted(false);
    setRestartError("");

    try {
      if (!assignmentId || !/^\d+$/.test(String(assignmentId))) {
        throw new Error("This assessment link is incomplete. Please open it again from your course.");
      }

      if (!courseIdFromRoute || !moduleIdFromRoute) {
        throw new Error("Please open this assessment from its lesson in My Learning.");
      }

      // The Learning Path API provides module availability and persisted progress.
      // Do not download all course lesson content just to verify assessment access.
      const learningPathResponse = await getCourseLearningPath(courseIdFromRoute);
      const learningPath = normalizeLearningPath(learningPathResponse);
      const modules = learningPath.modules;

      const currentModule = modules.find(
        (item) => String(item.id) === String(moduleIdFromRoute)
      );

      if (!currentModule) {
        throw new Error("This lesson is no longer available in your course.");
      }

      if (currentModule.isUnlocked !== true) {
        throw new Error("This module is locked. Pass the previous module assessment before continuing.");
      }

      if (currentModule.isRead !== true) {
        throw new Error("Please finish reading this module and mark it as read before starting the assessment.");
      }

      const response = await startAssessment(assignmentId);
      if (!response || response.success === false) {
        throw new Error(response?.message || "We couldn't start your assessment. Please try again.");
      }

      const data = response.data ?? response;
      const nextAttempt = data.attempt || data;
      const nextAssignment = data.assignment || null;
      const nextQuestions = Array.isArray(data.questions) ? data.questions : [];

      if (!nextAttempt?.id) {
        throw new Error("Your assessment could not be started. Please try again.");
      }

      if (!nextAssignment?.id) {
        throw new Error("Assessment details are unavailable. Please try again.");
      }

      if (
        String(nextAssignment.courseId) !== String(courseIdFromRoute) ||
        String(nextAssignment.moduleId) !== String(moduleIdFromRoute)
      ) {
        throw new Error("This assessment does not match the selected course lesson.");
      }

      if (!nextQuestions.length) {
        throw new Error("There are no questions available for this assessment yet.");
      }

      setCourseName(
        learningPath.course.fullName ||
          learningPath.course.shortName ||
          "Your course"
      );
      setModuleName(currentModule.name || "Module assessment");
      setPassedModuleIds(
        modules
          .filter((item) => item.assessmentPassed === true)
          .map((item) => Number(item.id))
          .filter((id) => Number.isInteger(id) && id > 0)
      );
      setAttempt(nextAttempt);
      setAssignment(nextAssignment);
      setQuestions(nextQuestions);

      const initialAnswers = {};
      nextQuestions.forEach((question) => {
        const type = String(question.questionType || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
        if ((type === "coding" || type === "code" || type.includes("coding")) && question.starterCode) {
          initialAnswers[question.id] = question.starterCode;
        }
      });
      setAnswers(initialAnswers);
      setQuestionIndex(0);
      setAnswerValidation("");

      const hasTimeLimit = Number(nextAssignment.timeLimitMinutes) > 0;
      const apiSeconds = Number(data.secondsLeft);
      const deadlineMillis = nextAttempt.deadline
        ? new Date(nextAttempt.deadline).getTime()
        : NaN;
      const deadlineSeconds = Number.isFinite(deadlineMillis)
        ? Math.max(0, Math.floor((deadlineMillis - Date.now()) / 1000))
        : null;

      const initialSeconds = !hasTimeLimit
        ? null
        : Number.isFinite(apiSeconds) && apiSeconds >= 0
          ? apiSeconds
          : deadlineSeconds !== null
            ? deadlineSeconds
            : null;

      setSecondsLeft(initialSeconds);
    } catch (error) {
      console.error("Start Assessment Error:", error);
      const friendlyMessage = getStudentErrorMessage(
        error,
        "We couldn't open your assessment. Please try again."
      );
      setAttemptsExhausted(isAttemptsExhaustedMessage(friendlyMessage));
      setLoadError(friendlyMessage);
    } finally {
      setIsLoading(false);
    }
  }, [assignmentId, courseIdFromRoute, moduleIdFromRoute]);

  useEffect(() => {
    if (startCalledRef.current) return;
    startCalledRef.current = true;
    loadAttempt();
  }, [loadAttempt]);

  const handleSubmit = useCallback(
    async (timedOut = false) => {
      const activeAttempt = attemptRef.current;
      const activeAssignment = assignmentRef.current;
      const activeQuestions = questionsRef.current;

      if (
        !activeAttempt?.id ||
        !activeAssignment ||
        !activeQuestions.length ||
        submitLockRef.current
      ) {
        return;
      }

      submitLockRef.current = true;
      setIsSubmitting(true);
      setSubmitError("");
      setAnswerValidation("");

      try {
        const answersPayload = buildAnswerPayload(activeQuestions, answersRef.current);
        const response = await submitAssessmentAttempt(activeAttempt.id, answersPayload);

        if (!response || response.success === false) {
          throw new Error(response?.message || "Your answers could not be submitted. Please try again.");
        }

        const data = response.data ?? response;
        const resultAttempt = data.attempt || data;
        const passed = resultAttempt.passed === true;
        const courseId = activeAssignment.courseId ?? courseIdFromRoute;
        const moduleId = activeAssignment.moduleId ?? moduleIdFromRoute;

        // The submit API persists the attempt. Force the next Learning Path read
        // to come from the backend rather than using the previous cached status.
       invalidateCourseLearningPath();

        const updatedPassedIds = passed
          ? [
              ...new Set(
                [...passedModuleIds.map(Number), Number(moduleId)].filter(
                  (id) => Number.isInteger(id) && id > 0
                )
              ),
            ]
          : passedModuleIds;

        navigate("/student/assessment-result", {
          replace: true,
          state: {
            attempt: {
              ...resultAttempt,
              timedOut: resultAttempt.timedOut ?? timedOut,
            },
            assignment: activeAssignment,
            questions: activeQuestions,
            courseId,
            moduleId,
            nextModuleId: nextModuleIdFromRoute,
            passedModuleIds: updatedPassedIds,
          },
        });
      } catch (error) {
        console.error("Submit Assessment Error:", error);
        submitLockRef.current = false;
        setSubmitError(
          getStudentErrorMessage(error, "We couldn't submit your answers. Please try again.")
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      navigate,
      courseIdFromRoute,
      moduleIdFromRoute,
      nextModuleIdFromRoute,
      passedModuleIds,
    ]
  );

  // The remaining time starts from the value supplied for this attempt.
  const timerEnabled = secondsLeft !== null;

  useEffect(() => {
    if (!timerEnabled || isLoading || isSubmitting || secondsLeft === 0) {
      return undefined;
    }

    const timerId = window.setInterval(() => {
      setSecondsLeft((current) =>
        current === null ? null : Math.max(0, current - 1)
      );
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [timerEnabled, isLoading, isSubmitting, secondsLeft]);

  useEffect(() => {
    if (
      secondsLeft !== 0 ||
      isLoading ||
      isSubmitting ||
      autoSubmitStartedRef.current
    ) {
      return;
    }

    autoSubmitStartedRef.current = true;
    handleSubmit(true);
  }, [secondsLeft, isLoading, isSubmitting, handleSubmit]);

  const currentQuestion = questions[questionIndex];
  const answeredCount = useMemo(
    () =>
      questions.filter((question) =>
        isAnswerComplete(answers[question.id])
      ).length,
    [answers, questions]
  );

  const unansweredCount = Math.max(0, questions.length - answeredCount);
  const isLastQuestion = questionIndex === questions.length - 1;
  const passPercentage = Number(assignment?.passPercentage) || 0;
  const answeredProgress = questions.length
    ? (answeredCount / questions.length) * 100
    : 0;
  const backToLesson = `/student/topics/${courseIdFromRoute}/topic/${moduleIdFromRoute}`;
  const myLearningPath = courseIdFromRoute
    ? `/student/my-learning?course=${encodeURIComponent(courseIdFromRoute)}`
    : "/student/my-learning";
  const selectedValue =
    answers[currentQuestion?.id] ??
    (currentQuestion?.multipleAnswers ? [] : "");

  const updateAnswer = (questionId, value) => {
    setAnswers((current) => ({ ...current, [questionId]: value }));
    setAnswerValidation("");
    setSubmitError("");
  };

  const handleRequestSubmit = () => {
    if (unansweredCount > 0) {
      const firstUnansweredIndex = questions.findIndex(
        (question) => !isAnswerComplete(answers[question.id])
      );
      setQuestionIndex(Math.max(0, firstUnansweredIndex));
      setAnswerValidation(
        `You still have ${unansweredCount} ${unansweredCount === 1 ? "question" : "questions"} to answer. Complete them before submitting.`
      );
      return;
    }

    setShowSubmitConfirmation(true);
  };

  const handleRestartModule = async () => {
    if (isRestarting || !courseIdFromRoute || !moduleIdFromRoute) return;

    setIsRestarting(true);
    setRestartError("");

    try {
      const response = await restartModule(moduleIdFromRoute);
      if (!response || response.success === false) {
        throw new Error(response?.message || "The module could not be restarted. Please try again.");
      }

      const data = response.data ?? response;
      if (data?.moduleId !== undefined && String(data.moduleId) !== String(moduleIdFromRoute)) {
        throw new Error("The restart response does not match the current module.");
      }

     invalidateCourseLearningPath();

      navigate(`/student/topics/${courseIdFromRoute}/topic/${moduleIdFromRoute}`, {
        replace: true,
        state: {
          courseId: Number(courseIdFromRoute),
          moduleId: Number(moduleIdFromRoute),
          restartedModuleId: Number(moduleIdFromRoute),
          restartMessage:
            response.message ||
            "Module restarted. Read it again and mark it complete to unlock the assessment.",
          restartDetails: data,
        },
      });
    } catch (error) {
      console.error("Restart Module Error:", error);
      setRestartError(
        getStudentErrorMessage(error, "We couldn't restart this module. Please try again.")
      );
    } finally {
      setIsRestarting(false);
    }
  };

  const handleRetry = () => {
    startCalledRef.current = true;
    autoSubmitStartedRef.current = false;
    loadAttempt();
  };

  if (isLoading) {
    return (
      <>
        <AssessmentLoadingState
          title="Preparing your assessment"
          message="We’re loading your questions and checking your learning progress."
        />
        <Loader open={isLoading} text="Loading your assessment..." />
      </>
    );
  }

  if (isSubmitting) {
    return (
      <>
        <AssessmentLoadingState
          title="Submitting your answers"
          message="Your responses are being evaluated. Please keep this page open while we prepare your result."
        />
        <Loader open={isSubmitting} text="Submitting your assessment..." />
      </>
    );
  }

  if (loadError || !assignment || !attempt || !questions.length) {
    return (
      <AssessmentLoadError
        message={loadError || "Your assessment details are not available right now."}
        onRetry={handleRetry}
        courseId={courseIdFromRoute}
        passedModuleIds={passedModuleIds}
        attemptsExhausted={attemptsExhausted}
        onRestart={handleRestartModule}
        isRestarting={isRestarting}
        restartError={restartError}
      />
    );
  }

  const timerIsLow = secondsLeft !== null && secondsLeft <= 60;

  return (
    <PageShell max="max-w-[1220px]">
      <div
        className="mx-auto w-full select-none"
        style={{ userSelect: "none", WebkitUserSelect: "none" }}
        onCopy={(event) => event.preventDefault()}
        onCut={(event) => event.preventDefault()}
        onContextMenu={(event) => event.preventDefault()}
      >
        <div className="mb-5 mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-2 text-xs font-semibold text-[#829596]">
            <Link
              to={myLearningPath}
              state={{ courseId: Number(courseIdFromRoute), passedModuleIds }}
              className="!text-[#607B7E] !no-underline transition hover:!text-[#06424B]"
            >
              My Learning
            </Link>
            <span className="text-[#BBC8C7]">/</span>
            <span className="max-w-[220px] truncate text-[#607B7E]">{courseName}</span>
            <span className="text-[#BBC8C7]">/</span>
            <span className="max-w-[220px] truncate font-bold text-[#06424B]">
              {moduleName}
            </span>
          </div>

          <Link
            to={backToLesson}
            state={{ courseId: Number(courseIdFromRoute), passedModuleIds }}
            className="inline-flex h-9 shrink-0 items-center gap-2 rounded-xl border border-[#DCE6E4] bg-white px-3 text-xs font-bold text-[#526D71] !no-underline transition hover:border-[#B8CECA] hover:bg-[#F7FAF9] hover:text-[#06424B]"
          >
            <ArrowLeft size={14} />
            Back to Lesson
          </Link>
        </div>

        {/* Assessment overview */}
        <section className="relative isolate overflow-hidden rounded-[28px] bg-gradient-to-br from-[#06424B] via-[#07535D] to-[#0B6972] px-6 py-7 text-white shadow-[0_18px_45px_rgba(6,66,75,0.15)] sm:px-9 sm:py-8">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border-[34px] border-white/[0.055]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-[-88px] right-[22%] h-52 w-52 rounded-full border-[22px] border-[#FFAB0B]/[0.08]"
          />

          <div className="relative grid gap-7 lg:grid-cols-[minmax(0,1fr)_230px] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[1.5px] text-[#FFD47A]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#FFAB0B]" />
                Your learning checkpoint
              </div>

              <h1 className="mt-4 max-w-3xl text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-3xl lg:text-[36px]">
                {assignment.title || "Module Assessment"}
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/75">
                Answer the questions at your own pace. You can move between questions and review your answers before you finish.
              </p>

              <div className="mt-6 flex flex-wrap gap-2.5">
                <span className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3.5 py-2.5 text-xs font-bold text-white/90">
                  <BookOpen size={15} className="text-[#FFAB0B]" />
                  {questions.length} {questions.length === 1 ? "question" : "questions"}
                </span>
                <span className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3.5 py-2.5 text-xs font-bold text-white/90">
                  <GraduationCap size={15} className="text-[#FFAB0B]" />
                  Attempt {attempt.attemptNo || 1}
                  {assignment.maxAttempts ? ` of ${assignment.maxAttempts}` : ""}
                </span>
                {passPercentage > 0 && (
                  <span className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3.5 py-2.5 text-xs font-bold text-white/90">
                    <ShieldCheck size={15} className="text-[#FFAB0B]" />
                    {passPercentage}% to pass
                  </span>
                )}
              </div>
            </div>

            <div className="rounded-[22px] border border-white/15 bg-white/[0.09] p-5 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-xs font-bold text-white/70">
                <Clock3 size={15} className={timerIsLow ? "text-[#FFB6A7]" : "text-[#FFAB0B]"} />
                Time remaining
              </div>
              <p
                className={`mt-2 text-[34px] font-extrabold tabular-nums tracking-tight ${
                  timerIsLow ? "text-[#FFD0C7]" : "text-white"
                }`}
                aria-live="off"
              >
                {secondsLeft === null ? "No limit" : formatDuration(secondsLeft)}
              </p>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/15">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    timerIsLow ? "bg-[#FFB6A7]" : "bg-[#FFAB0B]"
                  }`}
                  style={{
                    width:
                      secondsLeft !== null && Number(assignment.timeLimitMinutes) > 0
                        ? `${Math.min(
                            100,
                            Math.max(
                              0,
                              (secondsLeft / (Number(assignment.timeLimitMinutes) * 60)) * 100
                            )
                          )}%`
                        : "100%",
                  }}
                />
              </div>
              <p className="mt-3 text-[11px] leading-5 text-white/60">
                {secondsLeft === null
                  ? "Take the time you need."
                  : timerIsLow
                    ? "Your time is nearly up. Review and submit your answers."
                    : "Your remaining time is shown here."}
              </p>
            </div>
          </div>

          <div className="relative mt-7 border-t border-white/15 pt-5">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
              <span className="text-white/75">Your assessment progress</span>
              <span className="tabular-nums text-[#FFD47A]">
                {answeredCount} of {questions.length} answered
              </span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-[#FFAB0B] transition-all duration-500"
                style={{ width: `${answeredProgress}%` }}
              />
            </div>
          </div>
        </section>

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          {/* Question panel */}
          <section className="min-w-0">
            <Card className="overflow-hidden border border-[#E1EAE8] p-0 shadow-[0_10px_32px_rgba(6,66,75,0.055)]">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAF0EF] bg-[#FAFCFB] px-5 py-4 sm:px-7">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FFF1D1] text-[#94650C]">
                    <BookOpen size={16} />
                  </span>
                  <span className="text-xs font-extrabold uppercase tracking-[1px] text-[#526D71]">
                    Question {questionIndex + 1}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-bold text-[#829596]">
                  {currentQuestion.score !== undefined && (
                    <span className="rounded-full bg-[#EEF3F4] px-3 py-1.5">
                      {currentQuestion.score} {Number(currentQuestion.score) === 1 ? "mark" : "marks"}
                    </span>
                  )}
                  <span className="rounded-full bg-[#EEF3F4] px-3 py-1.5">
                    {currentQuestion.questionType
                      ? String(currentQuestion.questionType).replace(/[_-]+/g, " ")
                      : "Question"}
                  </span>
                </div>
              </div>

              <div className="p-5 sm:p-7 lg:p-8">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#06424B] text-sm font-extrabold text-white">
                    {String(questionIndex + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-extrabold uppercase tracking-[1.25px] text-[#B07A06]">
                      Your question
                    </p>
                    <h2
                      onCopy={(event) => event.preventDefault()}
                      onCut={(event) => event.preventDefault()}
                      onContextMenu={(event) => event.preventDefault()}
                      className="mt-2 select-none whitespace-pre-wrap text-lg font-extrabold leading-8 text-[#123B43] sm:text-[21px]"
                    >
                      {currentQuestion.text || currentQuestion.question || "Question"}
                    </h2>
                  </div>
                </div>

                <QuestionAnswer
                  question={currentQuestion}
                  value={selectedValue}
                  onChange={(value) => updateAnswer(currentQuestion.id, value)}
                  disabled={isSubmitting || secondsLeft === 0}
                />

                {answerValidation && (
                  <div
                    role="status"
                    className="mt-5 flex items-start gap-2 rounded-xl border border-[#F0D9A5] bg-[#FFFAED] px-4 py-3 text-xs leading-5 text-[#795B1D]"
                  >
                    <Info size={15} className="mt-0.5 shrink-0" />
                    {answerValidation}
                  </div>
                )}

                {submitError && (
                  <div
                    role="alert"
                    className="mt-5 flex flex-col gap-3 rounded-xl border border-[#F0D8D2] bg-[#FFF8F6] p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-start gap-2 text-sm leading-6 text-[#80534D]">
                      <AlertCircle size={17} className="mt-0.5 shrink-0 text-[#A85A50]" />
                      <span>{submitError}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSubmit(secondsLeft === 0)}
                      disabled={isSubmitting}
                      className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#06424B] px-3 text-xs font-bold text-white transition hover:bg-[#0B5962] disabled:opacity-60"
                    >
                      <RefreshCw size={13} />
                      Try submitting again
                    </button>
                  </div>
                )}

                {secondsLeft === 0 && (
                  <div
                    role="status"
                    className="mt-5 flex items-center gap-2 rounded-xl border border-[#F0D8D2] bg-[#FFF8F6] px-4 py-3 text-xs font-semibold text-[#80534D]"
                  >
                    <Clock3 size={15} />
                    Time is up. Your answers are being submitted.
                  </div>
                )}

                <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[#EAF0EF] pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setQuestionIndex((index) => Math.max(0, index - 1));
                      setAnswerValidation("");
                    }}
                    disabled={questionIndex === 0 || isSubmitting}
                    className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#DCE6E4] bg-white px-4 text-sm font-bold text-[#526D71] transition hover:bg-[#F4F7F7] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ArrowLeft size={15} />
                    Previous
                  </button>

                  <div className="flex flex-1 justify-end gap-2 sm:flex-none">
                    {isLastQuestion ? (
                      <button
                        type="button"
                        onClick={handleRequestSubmit}
                        disabled={isSubmitting || secondsLeft === 0}
                        className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#FFAB0B] px-5 text-sm font-extrabold text-[#06424B] shadow-[0_6px_16px_rgba(255,171,11,0.17)] transition hover:-translate-y-0.5 hover:bg-[#FFC13C] disabled:cursor-wait disabled:opacity-60"
                      >
                        <Send size={15} />
                        Review & Submit
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setQuestionIndex((index) =>
                            Math.min(questions.length - 1, index + 1)
                          );
                          setAnswerValidation("");
                        }}
                        disabled={isSubmitting}
                        className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#06424B] px-5 text-sm font-extrabold text-white transition hover:bg-[#0A5660] disabled:opacity-60"
                      >
                        Next Question
                        <ArrowRight size={15} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            <div className="mt-4 flex items-start gap-2 rounded-2xl border border-[#E6EDEB] bg-white/80 px-4 py-3 text-[11px] leading-5 text-[#829596]">
              <ShieldCheck size={15} className="mt-0.5 shrink-0 text-[#527477]" />
              Your answers are saved when you submit. You can revisit questions and change your responses before submitting.
            </div>
          </section>

          {/* Progress and question navigation */}
          <aside className="space-y-4 lg:sticky lg:top-5">
            <Card className="overflow-hidden border border-[#E1EAE8] p-0 shadow-[0_8px_26px_rgba(6,66,75,0.045)]">
              <div className="border-b border-[#EAF0EF] bg-[#FAFCFB] px-5 py-4">
                <h3 className="font-extrabold text-[#06424B]">Question navigator</h3>
                <p className="mt-1 text-[11px] text-[#829596]">
                  Select a number to move to that question.
                </p>
              </div>

              <div className="p-5">
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((question, index) => {
                    const answered = isAnswerComplete(answers[question.id]);
                    const active = index === questionIndex;

                    return (
                      <button
                        key={question.id}
                        type="button"
                        onClick={() => {
                          setQuestionIndex(index);
                          setAnswerValidation("");
                        }}
                        disabled={isSubmitting}
                        aria-label={`Go to question ${index + 1}`}
                        aria-current={active ? "step" : undefined}
                        className={`relative flex h-10 items-center justify-center rounded-xl text-xs font-extrabold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#06424B] focus-visible:ring-offset-2 ${
                          active
                            ? "bg-[#06424B] text-white shadow-[0_5px_12px_rgba(6,66,75,0.18)]"
                            : answered
                              ? "bg-[#EAF4F1] text-[#06424B] hover:bg-[#DCEDE8]"
                              : "bg-[#F0F4F3] text-[#607B7E] hover:bg-[#FFF3D6]"
                        }`}
                      >
                        {index + 1}
                        {answered && !active && (
                          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-[#2F806B] text-white">
                            <Check size={9} strokeWidth={3} />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 border-t border-[#EAF0EF] pt-4 text-[10px] font-semibold text-[#829596]">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded bg-[#06424B]" />
                    Current
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded bg-[#DCEDE8]" />
                    Answered
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded bg-[#F0F4F3]" />
                    Not answered
                  </span>
                </div>
              </div>
            </Card>

            <Card className="border border-[#E1EAE8] p-5 shadow-[0_8px_26px_rgba(6,66,75,0.04)]">
              <h3 className="text-sm font-extrabold text-[#06424B]">Your progress</h3>
              <div className="mt-4 flex items-end justify-between gap-3">
                <div>
                  <p className="text-3xl font-extrabold tabular-nums text-[#06424B]">
                    {Math.round(answeredProgress)}%
                  </p>
                  <p className="mt-1 text-[11px] text-[#829596]">Questions completed</p>
                </div>
                <span className="mb-1 inline-flex items-center gap-1 rounded-full bg-[#FFF4D9] px-2.5 py-1 text-[10px] font-extrabold text-[#8A650E]">
                  {answeredCount}/{questions.length}
                </span>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#EAF0EE]">
                <div
                  className="h-full rounded-full bg-[#FFAB0B] transition-all duration-500"
                  style={{ width: `${answeredProgress}%` }}
                />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-[#F4F7F7] px-3 py-3">
                  <p className="text-xl font-extrabold tabular-nums text-[#06424B]">
                    {answeredCount}
                  </p>
                  <p className="mt-1 text-[10px] font-bold text-[#829596]">Answered</p>
                </div>
                <div className="rounded-xl bg-[#F4F7F7] px-3 py-3">
                  <p className="text-xl font-extrabold tabular-nums text-[#06424B]">
                    {unansweredCount}
                  </p>
                  <p className="mt-1 text-[10px] font-bold text-[#829596]">Remaining</p>
                </div>
              </div>
            </Card>

            <Card className="border border-[#E1EAE8] bg-[#FBFDFC] p-5">
              <div className="flex items-center gap-2 text-[#06424B]">
                <Info size={16} className="text-[#B88736]" />
                <h3 className="text-sm font-extrabold">Before you submit</h3>
              </div>
              <ul className="mt-3 space-y-2.5 text-xs leading-5 text-[#718486]">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-[#2F806B]" />
                  Answer every question.
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-[#2F806B]" />
                  Review your selections.
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-[#2F806B]" />
                  Submit before your time runs out.
                </li>
              </ul>
            </Card>
          </aside>
        </div>

        <SubmitConfirmation
          open={showSubmitConfirmation}
          onCancel={() => setShowSubmitConfirmation(false)}
          onConfirm={() => {
            setShowSubmitConfirmation(false);
            handleSubmit(false);
          }}
          isSubmitting={isSubmitting}
          answeredCount={answeredCount}
          totalQuestions={questions.length}
        />
      </div>
    </PageShell>
  );
}

export default ModuleAssessmentPage;