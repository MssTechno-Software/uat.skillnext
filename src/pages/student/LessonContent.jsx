import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Code2,
  Copy,
  ExternalLink,
  LockKeyhole,
  Maximize2,
  Minimize2,
  Play,
  PlayCircle,
  RefreshCw,
  RotateCcw,
  Terminal,
  X,
} from "lucide-react";

import StudentPageHeader from "../../components/student/StudentPageHeader";
import { Card, LinkButton, PageShell } from "../../components/student/ui";
import Loader from "../../components/Loader";
import ApiErrorModal from "../../components/ApiErrorModal";
import { getApiErrorMessage } from "../../utils/apiErrorHandler";
import {
  getCourseContent,
  getCourseLearningPath,
  completeModule,
} from "../../api/course.api";
import { getModuleAssessments } from "../../api/assessment.api";
import Editor from "@monaco-editor/react";

const normalizeModules = (payload) => (Array.isArray(payload?.modules) ? payload.modules : [])
  .filter((module) => module && module.visible !== false && module.id !== undefined && module.id !== null)
  .map((module) => ({
    ...module,
    contents: Array.isArray(module.contents)
      ? module.contents.filter((content) => content && content.visible !== false)
      : [],
  }))
  .sort((a, b) => Number(a.position || 0) - Number(b.position || 0));


const normalizeLearningPath = (response, t) => {
  if (!response || response.success === false) {
    throw new Error(response?.message || t("Your course progress could not be loaded."));
  }

  const payload = response.data ?? response;
  if (!payload?.course?.id || !Array.isArray(payload.modules)) {
    throw new Error(t("The Learning Path API returned an unexpected response."));
  }

  const modules = payload.modules
    .filter((module) => module && module.id !== undefined && module.id !== null)
    .map((module) => ({
      ...module,
      position: Number(module.position) || 0,
      contentsCount: Math.max(0, Number(module.contentsCount) || 0),
      isRead: module.isRead === true,
      assessmentPassed: module.assessmentPassed === true,
      isUnlocked: module.isUnlocked === true,
      status: String(module.status || "LOCKED").toUpperCase(),
    }))
    .sort((a, b) => a.position - b.position);

  return {
    course: payload.course,
    progress: payload.progress || {},
    modules,
    finalAssessment: payload.finalAssessment || null,
  };
};

// The Learning Path API owns progress/status; the content API owns lesson text.
// Merge by module ID without allowing content data to overwrite progress flags.
const mergeContentWithLearningPath = (contentModules, progressModules) => {
  const contentById = new Map(
    contentModules.map((module) => [String(module.id), module])
  );

  return progressModules.map((progressModule) => {
    const contentModule = contentById.get(String(progressModule.id));
    return {
      ...(contentModule || {}),
      ...progressModule,
      contents: contentModule?.contents || [],
      // Prefer the actual content API list when the Learning Path API reports
      // zero or omits contentsCount. This keeps Mark as Read available for IT
      // modules whose progress response does not include the content count.
      contentsCount: Math.max(
        0,
        Number(progressModule.contentsCount) > 0
          ? Number(progressModule.contentsCount)
          : Number(contentModule?.contents?.length) || 0
      ),
    };
  });
};

const normalizeAssessments = (response, t) => {
  const payload = response;
  if (!payload || payload.success === false) {
    throw new Error(t("We couldn't load your assessment. Please try again."));
  }

  const data = payload.data ?? payload;
  const list = Array.isArray(data)
    ? data
    : Array.isArray(data?.assessments)
      ? data.assessments
      : Array.isArray(data?.items)
        ? data.items
        : data?.assignment
          ? [data.assignment]
          : [];

  return list.filter((assessment) => assessment && assessment.visible !== false && assessment.id !== undefined);
};

const parseTextBlocks = (body) => {
  if (typeof body !== "string" || !body.trim()) return [];
  const blocks = [];
  let paragraph = [];
  let listItems = [];
  let listType = null;

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push({ type: "paragraph", text: paragraph.join(" ").trim() });
      paragraph = [];
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
    const bullet = line.match(/^[-*]\s+(.+)$/);
    const numbered = line.match(/^\d+[.)]\s+(.+)$/);

    if (heading) {
      flushParagraph();
      flushList();
      blocks.push({ type: heading[1].length === 1 ? "heading" : "subheading", text: heading[2] });
      return;
    }
    if (bullet || numbered) {
      flushParagraph();
      const nextType = bullet ? "bullet_list" : "numbered_list";
      if (listType && listType !== nextType) flushList();
      listType = nextType;
      listItems.push((bullet || numbered)[1]);
      return;
    }
    flushList();
    paragraph.push(line);
  });

  flushParagraph();
  flushList();
  return blocks;
};


// Load Pyodide once and reuse the browser-side Python runtime across code examples.
// Python runs in the learner's browser; code is not sent to the LMS API.
let pyodidePromise = null;

const PYODIDE_VERSION = "v0.27.7";
const PYODIDE_BASE_URL = `https://cdn.jsdelivr.net/pyodide/${PYODIDE_VERSION}/full/`;
const PYODIDE_LOAD_TIMEOUT_MS = 60000;

const loadPyodideRuntime = (t) => {
  if (pyodidePromise) return pyodidePromise;

  pyodidePromise = new Promise((resolve, reject) => {
    let settled = false;
    let timeoutId;

    const finish = (callback, value) => {
      if (settled) return;
      settled = true;
      if (timeoutId) window.clearTimeout(timeoutId);
      callback(value);
    };

    const fail = (message) => {
      pyodidePromise = null;
      finish(reject, new Error(message));
    };

    const initialize = async () => {
      try {
        if (typeof window.loadPyodide !== "function") {
          throw new Error(t("Python runtime script loaded, but the Python engine was not found. Please refresh and try again."));
        }

        const runtime = await window.loadPyodide({ indexURL: PYODIDE_BASE_URL });
        finish(resolve, runtime);
      } catch (error) {
        pyodidePromise = null;
        finish(reject, error);
      }
    };

    timeoutId = window.setTimeout(
      () => fail(t("Python is taking too long to load. Check your internet connection and try again.")),
      PYODIDE_LOAD_TIMEOUT_MS
    );

    if (typeof window.loadPyodide === "function") {
      initialize();
      return;
    }

    const downloadError = t("Could not download the Python runtime. Check your internet connection.");
    let script = document.querySelector('script[data-skillnext-pyodide="true"]');

    if (script) {
      // A previous script may already have finished before this component mounted.
      if (script.dataset.loaded === "true") {
        initialize();
        return;
      }

      script.addEventListener("load", initialize, { once: true });
      script.addEventListener("error", () => fail(downloadError), { once: true });
      return;
    }

    script = document.createElement("script");
    script.src = `${PYODIDE_BASE_URL}pyodide.js`;
    script.async = true;
    script.dataset.skillnextPyodide = "true";
    script.onload = () => {
      script.dataset.loaded = "true";
      initialize();
    };
    script.onerror = () => {
      script.remove(); // allow a clean retry on the next run
      fail(downloadError);
    };
    document.head.appendChild(script);
  });

  return pyodidePromise;
};

function CodingPlayground({ block }) {
  const { t } = useTranslation("ui");
  const language = String(block?.language || "python").toLowerCase();
  const originalCode = String(
    block?.starterCode ?? block?.starter_code ?? block?.code ?? block?.example ?? ""
  );
  const normalizedLanguage = ({
    js: "javascript",
    jsx: "react",
    ts: "javascript",
    tsx: "react",
    vanilla_js: "javascript",
    "c++": "cpp",
    html5: "html",
    css3: "css",
  })[language] || language;

  const supportedBrowserLanguages = ["html", "css", "javascript", "react"];
  const isPython = normalizedLanguage === "python";
  const isBrowserLanguage = supportedBrowserLanguages.includes(normalizedLanguage);
  const isRunnable = block?.runnable !== false && (isPython || isBrowserLanguage);

  const [code, setCode] = useState(originalCode);
  const [output, setOutput] = useState("");
  const [programInput, setProgramInput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const [previewDoc, setPreviewDoc] = useState("");
  const editorRef = useRef(null);
  const iframeRef = useRef(null);
  const runIdRef = useRef(0);

  useEffect(() => {
    setCode(originalCode);
    setProgramInput("");
    setOutput("");
    setPreviewDoc("");
  }, [originalCode, block?.title]);

  useEffect(() => {
    if (!isExpanded) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event) => {
      if (event.key === "Escape" && !isRunning) setIsExpanded(false);
    };
    window.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isExpanded, isRunning]);

  // Only accept messages coming from THIS playground's own preview iframe,
  // so several code blocks on one page never receive each other's console output.
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.source !== "skillnext-code-preview") return;
      if (!iframeRef.current || event.source !== iframeRef.current.contentWindow) return;

      const prefix = event.data.type === "error" ? t("Error: ") : "";
      if (event.data.type === "console" || event.data.type === "error") {
        setOutput((previous) => `${previous}${previous ? "\n" : ""}${prefix}${event.data.value}`);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [t]);

  const makePreviewDocument = () => {
    const bridge = `
      <script>
        (function () {
          const send = (type, value) => parent.postMessage({
            source: "skillnext-code-preview", type, value: String(value)
          }, "*");
          ["log", "info", "warn", "error"].forEach((method) => {
            const original = console[method];
            console[method] = (...args) => {
              send(method === "error" ? "error" : "console",
                args.map((item) => {
                  if (typeof item === "object") {
                    try { return JSON.stringify(item); } catch (_) { return String(item); }
                  }
                  return String(item);
                }).join(" "));
              original.apply(console, args);
            };
          });
          window.addEventListener("error", (event) => send("error", event.message));
          window.addEventListener("unhandledrejection", (event) => send("error", event.reason));
          window.addEventListener("load", () => send("console", ${JSON.stringify(t("Preview loaded successfully."))}));
        })();
      </script>`;

    const meta = `<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">`;
    const suppliedHtml = String(block?.previewHtml || block?.html || "");
    const suppliedCss = String(block?.css || "");
    const suppliedJs = String(block?.javascript || block?.js || "");

    if (normalizedLanguage === "html") {
      const html = code || suppliedHtml || `<h1>${t("Hello Skill Next!")}</h1><p>${t("Your HTML preview is ready.")}</p>`;
      const cssTag = suppliedCss ? `<style>${suppliedCss}</style>` : "";
      const jsTag = suppliedJs ? `<script>${suppliedJs.replace(/<\/script/gi, "<\\/script")}</script>` : "";
      if (/<html[\s>]/i.test(html) || /<!doctype/i.test(html)) {
        return html.replace(/<\/head>/i, `${bridge}${cssTag}</head>`)
          .replace(/<\/body>/i, `${jsTag}</body>`);
      }
      return `<!doctype html><html><head>${meta}${bridge}${cssTag}</head><body>${html}${jsTag}</body></html>`;
    }

    if (normalizedLanguage === "css") {
      const previewMarkup = suppliedHtml || `
        <main class="sn-preview">
          <span class="sn-tag">${t("SKILL NEXT · CSS PLAYGROUND")}</span>
          <h1>${t("Design your first page")}</h1>
          <p>${t("Edit the CSS and run it to see your styles here.")}</p>
          <button class="sn-button">${t("Explore course")}</button>
          <div class="sn-card"><strong>${t("Live preview")}</strong><br><span>${t("Your CSS changes appear in this card.")}</span></div>
        </main>`;
      return `<!doctype html><html><head>${meta}
        <style>
          *{box-sizing:border-box}body{margin:0;padding:24px;font-family:Inter,Arial,sans-serif;color:#183C42;background:#fff}
          .sn-preview{max-width:640px;margin:0 auto;padding:24px;border:1px solid #DCE7E5;border-radius:18px;background:#F8FAFA}
          .sn-tag{font-size:10px;letter-spacing:1.2px;font-weight:800;color:#A8791B}
          .sn-preview h1{font-size:28px;margin:14px 0 8px;color:#06424B}
          .sn-preview p{line-height:1.7;color:#526D71}
          .sn-button{border:0;border-radius:9px;padding:11px 16px;background:#FFAB0B;color:#06424B;font-weight:800}
          .sn-card{margin-top:18px;padding:18px;border:1px solid #DCE7E5;border-radius:12px;background:white;line-height:1.8}
          ${code}
        </style>${bridge}</head><body>${previewMarkup}</body></html>`;
    }

    if (normalizedLanguage === "react") {
      return `<!doctype html><html><head>${meta}
        <style>body{font-family:Arial,sans-serif;padding:20px;color:#06424B}button{padding:9px 14px;border:0;border-radius:8px;background:#FFAB0B;color:#06424B;cursor:pointer}</style>
        ${bridge}
        <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
        <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
        <script src="https://unpkg.com/@babel/standalone@7/babel.min.js"></script>
      </head><body><div id="root"></div>
        <script type="text/babel" data-presets="env,react">
          try {
            ${code}
          } catch (error) {
            console.error(error);
          }
        </script>
      </body></html>`;
    }

    return `<!doctype html><html><head>${meta}${bridge}</head><body>
      <div id="app"></div>
      <script>
        try {
          ${code}
        } catch (error) {
          console.error(error);
        }
      </script>
    </body></html>`;
  };

  const handleRun = async () => {
    if (!isRunnable || isRunning) return;

    const currentRunId = ++runIdRef.current;
    setIsRunning(true);
    setOutput("");
    setPreviewDoc("");

    try {
      if (isPython) {
        setOutput(t("Loading Python runtime..."));
        const pyodide = await loadPyodideRuntime(t);
        if (currentRunId !== runIdRef.current) return;

        const outputLines = [];
        // Match ModuleAssessmentPage: each line in Input (stdin) is supplied
        // to the next Python input() call, in order.
        const inputLines = programInput.replace(/\r\n/g, "\n").split("\n");

        pyodide.setStdin({
          stdin: () => inputLines.length ? inputLines.shift() : null,
        });
        pyodide.setStdout({
          batched: (message) => outputLines.push(String(message)),
        });
        pyodide.setStderr({
          batched: (message) => outputLines.push(String(message)),
        });

        setOutput(t("Running Python code..."));

        // Fresh globals for every run so variables never leak between runs or code blocks.
        const globals = pyodide.globals.get("dict")();
        try {
          await pyodide.runPythonAsync(code, { globals });
        } finally {
          globals.destroy();
        }

        if (currentRunId === runIdRef.current) {
          setOutput(outputLines.join("\n").trimEnd() || t("Code executed successfully. No output was produced."));
        }
      } else {
        setOutput(t("Preparing live preview..."));
        const documentHtml = makePreviewDocument();
        setPreviewDoc(documentHtml);
        setOutput(
          normalizedLanguage === "html" || normalizedLanguage === "css" || normalizedLanguage === "react"
            ? t("Preview is ready. See the live result below.")
            : t("JavaScript is running in the preview frame. Console output will appear here.")
        );
      }
    } catch (error) {
      if (currentRunId === runIdRef.current) {
        setOutput(t("Execution error:\n{{message}}", { message: error?.message || String(error) }));
      }
    } finally {
      if (currentRunId === runIdRef.current) setIsRunning(false);
    }
  };

  const handleReset = () => {
    if (isRunning) return;
    runIdRef.current += 1;
    setCode(originalCode);
    setProgramInput("");
    setOutput("");
    setPreviewDoc("");
    editorRef.current?.focus();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setHasCopied(true);
      window.setTimeout(() => setHasCopied(false), 1600);
    } catch {
      setOutput(t("Clipboard access is unavailable. Select the code and copy it manually."));
    }
  };

  const isPreviewLanguage = isBrowserLanguage;
  const languageLabel = normalizedLanguage === "react" ? "React / JSX" : normalizedLanguage.toUpperCase();

  const editor = (
    <div className="overflow-hidden rounded-2xl border border-[#DCE7E5] bg-white shadow-[0_12px_36px_rgba(6,66,75,0.08)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5ECEB] bg-[#F4F7F7] px-4 py-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFAB0B] text-[#06424B]"><Code2 size={19} /></span>
          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold text-[#06424B]">{block?.title || t("Coding practice")}</p>
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[1.2px] text-[#789094]">{languageLabel} {t("coding workspace")}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={handleCopy} className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#DCE7E5] bg-white px-3 text-xs font-bold text-[#526D71] hover:bg-[#F4F7F7]"><Copy size={13} /> {hasCopied ? t("Copied") : t("Copy")}</button>
          <button type="button" onClick={handleReset} disabled={isRunning} className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#DCE7E5] bg-white px-3 text-xs font-bold text-[#526D71] hover:bg-[#F4F7F7] disabled:opacity-40"><RotateCcw size={13} /> {t("Reset")}</button>
          <button type="button" onClick={() => setIsExpanded(false)} className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#DCE7E5] bg-white px-3 text-xs font-bold text-[#526D71] hover:bg-[#F4F7F7]"><Minimize2 size={14} /> {t("Close")}</button>
        </div>
      </div>

      <div className="grid min-h-0 grid-cols-1 lg:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.85fr)]">
        <div className="min-w-0 border-b border-[#E5ECEB] lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between border-b border-[#E5ECEB] bg-white px-4 py-2.5">
            <span className="text-[10px] font-extrabold uppercase tracking-[1.2px] text-[#526D71]">{t("Code editor")}</span>
            <span className="text-[10px] text-[#829596]">{languageLabel} {t("· Editable")}</span>
          </div>
          <div className="min-h-[340px] overflow-hidden bg-white">
            <Editor
              height="min(55vh, 480px)"
              language={normalizedLanguage === "react" ? "javascript" : normalizedLanguage}
              value={code}
              onChange={(value) => setCode(value ?? "")}
              onMount={(editor, monaco) => {
                editorRef.current = editor;
                monaco.editor.defineTheme("skillnext-light", {
                  base: "vs",
                  inherit: true,
                  rules: [
                    { token: "comment", foreground: "829596", fontStyle: "italic" },
                    { token: "keyword", foreground: "06424B", fontStyle: "bold" },
                    { token: "string", foreground: "A15C20" },
                    { token: "number", foreground: "94650C" },
                  ],
                  colors: {
                    "editor.background": "#FFFFFF",
                    "editor.foreground": "#183C42",
                    "editorLineNumber.foreground": "#A3B3B4",
                    "editorLineNumber.activeForeground": "#06424B",
                    "editor.lineHighlightBackground": "#F4F7F7",
                    "editor.selectionBackground": "#FFF0C9",
                    "editorCursor.foreground": "#B88736",
                    "editorIndentGuide.background": "#E8EEEE",
                    "editorIndentGuide.activeBackground": "#C9D8D6",
                  },
                });
                monaco.editor.setTheme("skillnext-light");
                editor.addCommand(
                  monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
                  () => handleRun()
                );
              }}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                lineHeight: 25,
                fontFamily: "'Cascadia Code', 'Fira Code', Consolas, monospace",
                tabSize: 4,
                insertSpaces: true,
                automaticLayout: true,
                scrollBeyondLastLine: false,
                wordWrap: "off",
                lineNumbers: "on",
                roundedSelection: true,
                renderLineHighlight: "line",
                padding: { top: 16, bottom: 16 },
                scrollbar: { verticalScrollbarSize: 9, horizontalScrollbarSize: 9 },
                suggestOnTriggerCharacters: true,
                quickSuggestions: true,
              }}
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E5ECEB] bg-[#F4F7F7] px-4 py-3">
            <p className="text-[10px] text-[#718486]">
              {isRunnable ? t("Edit the code and run it. Shortcut: Ctrl + Enter.") : t("This language needs a configured compiler service to execute.")}
            </p>
            <button type="button" onClick={handleRun} disabled={!isRunnable || isRunning} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#FFAB0B] px-5 text-xs font-extrabold text-[#06424B] transition hover:bg-[#FFC13C] disabled:cursor-not-allowed disabled:opacity-50">
              {isRunning ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} fill="currentColor" />}
              {isRunning ? t("Running...") : t("Run Code")}
            </button>
          </div>
        </div>

        <div className="flex min-h-[340px] min-w-0 flex-col bg-white">
          {isPython && (
            <div className="border-b border-[#E5ECEB] px-4 py-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <label
                  htmlFor={`stdin-${block?.id || block?.title || "editor"}`}
                  className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.8px] text-[#06424B]"
                >
                  <Terminal size={14} className="text-[#B88736]" /> {t("Input (stdin)")}</label>
                <span className="text-[10px] text-[#829596]">{t("One value per line")}</span>
              </div>
              <textarea
                id={`stdin-${block?.id || block?.title || "editor"}`}
                value={programInput}
                onChange={(event) => setProgramInput(event.target.value)}
                disabled={isRunning}
                rows={4}
                spellCheck={false}
                placeholder={t("Example:\n10\n20")}
                className="w-full resize-y rounded-xl border border-[#DCE7E5] bg-[#F8FAFA] px-3 py-3 font-mono text-xs leading-6 text-[#183C42] outline-none placeholder:text-[#A3B3B4] focus:border-[#B88736] disabled:opacity-60"
              />
            </div>
          )}
          <div className="flex items-center gap-2 border-b border-[#E5ECEB] bg-[#F8FAFA] px-4 py-3">
            <Terminal size={15} className="text-[#B88736]" />
            <span className="text-[11px] font-extrabold uppercase tracking-[1.2px] text-[#06424B]">{isPreviewLanguage ? t("Live preview / console") : t("Output")}</span>
            {isRunning && <span className="ml-auto inline-flex items-center gap-1.5 text-[10px] font-semibold text-[#94650C]"><RefreshCw size={11} className="animate-spin" /> {t("Executing")}</span>}
          </div>
          {previewDoc ? (
            <iframe ref={iframeRef} title={t("{{language}} live preview", { language: languageLabel })} sandbox="allow-scripts" srcDoc={previewDoc} className="min-h-[260px] w-full flex-1 bg-white" />
          ) : (
            <pre aria-live="polite" className="min-h-[220px] flex-1 whitespace-pre-wrap break-words bg-white px-4 py-4 font-mono text-[12px] leading-6 text-[#35575B]">
              {output || t("Your program output will appear here after you click Run Code.")}
            </pre>
          )}
          {output && previewDoc && <pre aria-live="polite" className="max-h-28 overflow-auto whitespace-pre-wrap break-words border-t border-[#E5ECEB] bg-[#F8FAFA] px-4 py-3 font-mono text-[11px] leading-5 text-[#526D71]">{output}</pre>}
          <div className="border-t border-[#E5ECEB] px-4 py-2.5 text-[10px] text-[#829596]">
            {isPreviewLanguage ? t("Preview runs in an isolated browser frame.") : t("Execution result and errors appear here.")}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <section className="my-7 rounded-2xl border border-[#DCE7E5] bg-[#F4F7F7] p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FFAB0B] text-[#06424B]"><Code2 size={20} /></span>
            <div className="min-w-0">
              <p className="text-[10px] font-extrabold uppercase tracking-[1.3px] text-[#B88736]">{t("Practice workspace")}</p>
              <h4 className="mt-1 text-base font-extrabold text-[#06424B]">{block?.title || t("Try it yourself")}</h4>
              <p className="mt-1 text-xs leading-5 text-[#607A7D]">{t("Edit, run your code and view the result in a focused workspace.")}</p>
            </div>
          </div>
          <button type="button" onClick={() => setIsExpanded(true)} className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#06424B] px-5 text-xs font-extrabold text-white transition hover:bg-[#0B5962]"><Maximize2 size={15} /> {t("Open Coding Workspace")}</button>
        </div>
      </section>

      {isExpanded && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto bg-[#EEF3F4]/95 p-3 sm:p-6" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget && !isRunning) setIsExpanded(false);
        }}>
          <section
            role="dialog"
            aria-modal="true"
            aria-label={t("{{title}} coding workspace", {
              title: block?.title || languageLabel,
            })}
            className="my-auto flex max-h-[94vh] w-full max-w-[1320px] flex-col"
          >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[1.5px] text-[#B88736]">
                  {t("Skill Next · Practice workspace")}
                </p>
                <h3 className="mt-1 text-lg font-extrabold text-[#06424B]">{block?.title || t("{{language}} Coding Workspace", { language: languageLabel })}</h3>
              </div>
              <span className="rounded-full border border-[#DCE7E5] bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#526D71]">{languageLabel}</span>
            </div>
            {editor}
          </section>
        </div>
      )}
    </>
  );
}

function ApiContentBlocks({ content }) {
  const { t } = useTranslation("ui");
  const blocks = Array.isArray(content?.blocks) && content.blocks.length
    ? content.blocks
    : parseTextBlocks(content?.body || content?.text || content?.content);

  if (!blocks.length && content?.code) {
    return (
      <CodingPlayground
        block={{
          type: "code",
          title: content.title || "Try this code",
          language: content.language || "python",
          code: content.code,
          runnable: content.runnable !== false,
        }}
      />
    );
  }

  if (!blocks.length) {
    return <p className="text-sm leading-7 text-[#718486]">{t("No learning content is available for this item yet.")}</p>;
  }

  return (
    <div className="space-y-5">
      {blocks.map((block, index) => {
        const type = String(block?.type || "paragraph").toLowerCase();
        const text = block?.text || block?.content || "";
        const items = Array.isArray(block?.items) ? block.items : [];

        if (type === "heading") {
          return <h3 key={index} className="pt-2 text-xl font-extrabold leading-snug text-[#123B43] sm:text-2xl">{text}</h3>;
        }
        if (type === "subheading") {
          return <h4 key={index} className="pt-1 text-base font-extrabold leading-6 text-[#123B43] sm:text-lg">{text}</h4>;
        }
        if (["code", "code_example", "code_practice"].includes(type)) {
          return <CodingPlayground key={index} block={block} />;
        }
        if (type === "bullet_list" || type === "numbered_list") {
          const ListTag = type === "numbered_list" ? "ol" : "ul";
          return (
            <ListTag key={index} className={`${type === "numbered_list" ? "list-decimal" : "list-disc"} ml-6 space-y-2.5 text-sm leading-7 text-[#405D61] marker:text-[#B88736]`}>
              {items.map((item, itemIndex) => <li key={itemIndex} className="pl-1">{item}</li>)}
            </ListTag>
          );
        }
        return <p key={index} className="whitespace-pre-wrap text-sm leading-7 text-[#405D61] sm:text-[15px]">{text}</p>;
      })}
    </div>
  );
}

function LessonContent() {
  const { t } = useTranslation("ui");
  const { technologySlug: courseId, topicId: moduleId } = useParams();
  const location = useLocation();

  // Restart route state is used only for the one-time notice, never as progress data.
  const restartedModuleId = location.state?.restartedModuleId;
  const isRestartedModule =
    restartedModuleId !== undefined &&
    restartedModuleId !== null &&
    String(restartedModuleId) === String(moduleId);

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isMarkingRead, setIsMarkingRead] = useState(false);
  const [isAssessmentsLoading, setIsAssessmentsLoading] = useState(false);
  const [assessmentError, setAssessmentError] = useState("");
  const [showReadConfirmation, setShowReadConfirmation] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [restartNotice, setRestartNotice] = useState("");

  const contentModulesRef = useRef([]);
  const contentCourseRef = useRef(null);
  const assessmentSectionRef = useRef(null);
  const assessmentRequestRef = useRef(0);
  const loadRequestRef = useRef(0);

  const reportApiError = useCallback((error, title, fallbackMessage, retryAction) => {
    if (error?.response?.status === 401) {
      setApiError(null);
      return;
    }

    const message = error?.response || error?.request
      ? getApiErrorMessage(error, fallbackMessage)
      : error?.message || fallbackMessage;

    setApiError({
      title,
      message,
      onRetry: retryAction || null,
    });
  }, [t]);

  // Fetch full content once per course. getCourseContent is in-memory cached in
  // course.api.js, while Learning Path supplies the authoritative progress flags.
  // moduleId is deliberately NOT a dependency: moving between modules in this
  // course must not re-fetch the complete course content.
  const loadCourse = useCallback(async ({ forceRefresh = false } = {}) => {
    const requestId = ++loadRequestRef.current;

    if (!/^\d+$/.test(String(courseId || ""))) {
      setLoadError("This course link isn't valid. Please open it again from My Learning.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setLoadError("");
    setApiError(null);

    try {
      const [contentResponse, learningPathResponse] = await Promise.all([
        getCourseContent(courseId, { forceRefresh }),
        getCourseLearningPath(courseId, { forceRefresh }),
      ]);

      if (!contentResponse || contentResponse.success === false) {
        throw new Error(contentResponse?.message || t("We couldn't load this lesson. Please try again."));
      }

      const contentPayload = contentResponse.data ?? contentResponse;
      const contentCourse = contentPayload?.course;
      if (!contentCourse?.id) {
        throw new Error(t("This course isn't available right now. Please try again later."));
      }

      const contentModules = normalizeModules(contentPayload);
      const learningPath = normalizeLearningPath(learningPathResponse, t);
      const mergedModules = mergeContentWithLearningPath(contentModules, learningPath.modules);

      if (requestId !== loadRequestRef.current) return;

      contentModulesRef.current = contentModules;
      contentCourseRef.current = contentCourse;
      setCourse({ ...contentCourse, ...learningPath.course });
      setModules(mergedModules);
    } catch (error) {
      if (requestId !== loadRequestRef.current) return;
      console.error("Lesson / Learning Path API Error:", error);
      setLoadError("We couldn't load this lesson. Please try again.");
      reportApiError(
        error,
        "Unable to Load Lesson",
        "We couldn't load this lesson. Please try again.",
        () => loadCourse({ forceRefresh: true })
      );
    } finally {
      if (requestId === loadRequestRef.current) {
        setIsLoading(false);
      }
    }
  }, [courseId, reportApiError, t]);

  useEffect(() => {
    loadCourse();
    return () => {
      loadRequestRef.current += 1;
      assessmentRequestRef.current += 1;
    };
  }, [loadCourse]);

  // Module navigation only resets module-specific UI; it does not fetch course content.
  useEffect(() => {
    setAssessments([]);
    setAssessmentError("");
    setShowReadConfirmation(false);
    setApiError(null);
    setRestartNotice(
      isRestartedModule
        ? location.state?.restartMessage || "Module restarted. Read it again and mark it as read to unlock its assessment."
        : ""
    );
  }, [courseId, moduleId, location.key, isRestartedModule, location.state?.restartMessage, t]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [courseId, moduleId]);

  const moduleIndex = modules.findIndex((item) => String(item.id) === String(moduleId));
  const module = moduleIndex >= 0 ? modules[moduleIndex] : null;
  const previousModule = moduleIndex > 0 ? modules[moduleIndex - 1] : null;
  const nextModule = moduleIndex >= 0 ? modules[moduleIndex + 1] || null : null;

  // These values always come from the most recent backend Learning Path response.
  const passedModuleIds = useMemo(
    () => modules.filter((item) => item.assessmentPassed === true).map((item) => item.id),
    [modules]
  );
  const readModuleIds = useMemo(
    () => modules.filter((item) => item.isRead === true).map((item) => item.id),
    [modules]
  );
  const passedSet = useMemo(() => new Set(passedModuleIds.map(String)), [passedModuleIds]);
  const readSet = useMemo(() => new Set(readModuleIds.map(String)), [readModuleIds]);

  const isPassed = Boolean(module && module.assessmentPassed === true);
  const isRead = Boolean(module && (module.isRead === true || isPassed));
  const isUnlocked = Boolean(module && module.isUnlocked === true);
  // Use the loaded lesson items as a fallback if the progress API returns 0.
  const contentCount = Math.max(
    0,
    Number(module?.contentsCount) > 0
      ? Number(module.contentsCount)
      : Number(module?.contents?.length) || 0
  );
  const learningPath = `/student/my-learning?course=${encodeURIComponent(courseId || "")}`;
  const courseName = course?.fullName || course?.shortName || t("Course");
  const courseClassification = [
    course?.fullName,
    course?.shortName,
    course?.name,
    course?.category,
    course?.categoryName,
    course?.track,
    course?.courseType,
  ].map((value) => typeof value === "string" ? value : value?.name || "").join(" ");
  const isITCourse = /python|programming|software|web development|web technology|javascript|react|java|html|css|computer science|information technology|\bit\b/i.test(courseClassification);

  // Shared navigation helpers (used by every link to a module / back to the course).
  const moduleHref = (id) => `/student/topics/${courseId}/topic/${id}`;
  const courseLinkState = { courseId: Number(courseId), passedModuleIds };
  const moduleLinkState = { ...courseLinkState, readModuleIds: [...readSet] };

  // Refresh only the small progress endpoint after a write. Do not re-fetch lesson content.
  const refreshLearningPath = useCallback(async () => {
    const response = await getCourseLearningPath(courseId, { forceRefresh: true });
    const learningPathData = normalizeLearningPath(response, t);
    const mergedModules = mergeContentWithLearningPath(
      contentModulesRef.current,
      learningPathData.modules
    );

    setCourse({
      ...(contentCourseRef.current || {}),
      ...learningPathData.course,
    });
    setModules(mergedModules);
    return learningPathData;
  }, [courseId, t]);

  const loadModuleAssessments = useCallback(async (targetModuleId) => {
    if (!targetModuleId) return;

    const requestId = ++assessmentRequestRef.current;
    setIsAssessmentsLoading(true);
    setAssessmentError("");
    setApiError(null);
    setAssessments([]);

    try {
      const response = await getModuleAssessments(targetModuleId);
      const items = normalizeAssessments(response, t);
      if (requestId === assessmentRequestRef.current) {
        setAssessments(items);
      }
      return items;
    } catch (error) {
      console.error("Module Assessments API Error:", error);
      if (requestId === assessmentRequestRef.current) {
        setAssessmentError("We couldn't load your assessment. Please try again.");
        reportApiError(
          error,
          "Unable to Load Assessment",
          "We could not load this module assessment. Please try again.",
          () => loadModuleAssessments(targetModuleId)
        );
      }
      return null;
    } finally {
      if (requestId === assessmentRequestRef.current) {
        setIsAssessmentsLoading(false);
      }
    }
  }, [reportApiError, t]);

  useEffect(() => {
    if (!module || !isRead || isPassed || !isUnlocked) {
      assessmentRequestRef.current += 1;
      setAssessments([]);
      setAssessmentError("");
      setIsAssessmentsLoading(false);
      return undefined;
    }

    loadModuleAssessments(module.id);
    return () => {
      assessmentRequestRef.current += 1;
    };
  }, [module?.id, isRead, isPassed, isUnlocked, loadModuleAssessments]);

  const handleReadConfirmationAction = () => {
    if (isAssessmentsLoading) return;
    if (assessmentError) {
      loadModuleAssessments(module.id);
      return;
    }

    setShowReadConfirmation(false);
    window.requestAnimationFrame(() => {
      assessmentSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  };

  const handleMarkAsRead = async () => {
    if (!module || isMarkingRead || isRead || contentCount === 0) return;

    setIsMarkingRead(true);
    setAssessmentError("");

    try {
      const response = await completeModule(module.id);
      if (!response || response.success === false) {
        throw new Error(response?.message || t("We couldn't save your progress. Please try again."));
      }

      const refreshedPath = await refreshLearningPath();
      const refreshedModule = refreshedPath.modules.find(
        (item) => String(item.id) === String(module.id)
      );

      // Do not claim that the lesson is read until the backend confirms it.
      if (!refreshedModule?.isRead) {
        throw new Error(
          t("The completion request was accepted, but the Learning Path API still reports this module as not read. Please verify that all visible learning items are marked finished in the backend.")
        );
      }

      setRestartNotice("");
      setShowReadConfirmation(true);
    } catch (error) {
      console.error("Mark Lesson as Read / Progress Refresh Error:", error);
      reportApiError(
        error,
        "Unable to Confirm Lesson Progress",
        "We could not confirm that your lesson progress was saved. Please try again.",
        () => handleMarkAsRead()
      );
    } finally {
      setIsMarkingRead(false);
    }
  };

  // One shared error modal, rendered by every screen state below.
  const apiErrorModal = apiError ? (
    <ApiErrorModal
      title={t(apiError.title)}
      message={t(apiError.message)}
      onRetry={apiError.onRetry ? () => {
        const retry = apiError.onRetry;
        setApiError(null);
        retry();
      } : undefined}
      onClose={() => setApiError(null)}
    />
  ) : null;

  if (isLoading) return <Loader open={isLoading} text={t("Loading course lesson...")} />;

  if (loadError || !course || !module) {
    return (
      <PageShell max="max-w-[980px]">
        <Card className="p-8">
          <AlertCircle size={25} className="text-[#94650C]" />
          <h1 className="mt-3 text-xl font-extrabold text-[#06424B]">{module ? t("Unable to load lesson") : t("Lesson not found")}</h1>
          <p className="mt-2 text-sm leading-6 text-[#5A7478]">{t(loadError || "This lesson isn't available in your course.")}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" onClick={() => loadCourse({ forceRefresh: true })} className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#FFAB0B] px-4 text-sm font-bold text-[#06424B]"><RefreshCw size={14} /> {t("Retry")}</button>
            <LinkButton to={learningPath} variant="outline" icon={ArrowLeft}>{t("Back to My Learning")}</LinkButton>
          </div>
        </Card>
        {apiErrorModal}
      </PageShell>
    );
  }

  if (!isUnlocked) {
    return (
      <PageShell max="max-w-[980px]">
        <Card className="overflow-hidden border-[#DCE7E5] p-0">
          <div className="bg-[#06424B] px-6 py-7 text-white sm:px-8">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFAB0B] text-[#06424B]"><LockKeyhole size={21} /></span>
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[1.5px] text-[#FFCF70]">{t("Learning sequence")}</p>
                <h1 className="mt-1 text-2xl font-extrabold">{t("Previous assessment required")}</h1>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-white/75">{t("This module is locked. Pass the previous module's assessment to unlock it.")}</p>
          </div>
          <div className="p-6 sm:p-8">
            <p className="text-sm font-bold text-[#06424B]">{t("Previous module:")}{" "}{previousModule?.name || t("Previous module")}</p>
            <Link to={moduleHref(previousModule?.id)} state={moduleLinkState} className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-[#FFAB0B] px-5 text-sm font-extrabold text-[#06424B] !no-underline hover:bg-[#FFC13C]"><PlayCircle size={15} /> {t("Open Previous Module")}</Link>
          </div>
        </Card>
        {apiErrorModal}
      </PageShell>
    );
  }

  const passedCount = modules.filter((item) => passedSet.has(String(item.id))).length;
  const moduleProgress = modules.length ? Math.round((passedCount / modules.length) * 100) : 0;
  const routeState = {
    courseId: Number(courseId),
    moduleId: Number(module.id),
    nextModuleId: nextModule?.id ?? null,
    passedModuleIds,
    readModuleIds: [...new Set([...readSet, String(module.id)])].map(Number),
  };
  const canGoNext = isPassed && nextModule?.isUnlocked === true;

  // Roadmap step (IT courses): numbered circle + connector line + label underneath.
  const renderRoadmapStep = (item, index) => {
    const itemPassed = passedSet.has(String(item.id));
    const itemUnlocked = item.isUnlocked === true;
    const active = String(item.id) === String(module.id);
    const isLast = index === modules.length - 1;

    const circleClass = active
      ? "border-[#FFAB0B] bg-[#FFAB0B] text-[#123B43] ring-4 ring-[#FFAB0B]/25"
      : itemPassed
        ? "border-[#06424B] bg-[#06424B] text-white"
        : itemUnlocked
          ? "border-[#06424B]/30 bg-white text-[#06424B] group-hover:border-[#06424B]"
          : "border-[#DCE7E5] bg-[#F4F7F7] text-[#9AAEAF]";
    const labelClass = active
      ? "font-extrabold text-[#06424B]"
      : itemUnlocked
        ? "font-semibold text-[#405D61] group-hover:text-[#06424B]"
        : "font-medium text-[#9AAEAF]";

    const stepBody = (
      <>
        <span className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-bold transition ${circleClass}`}>
          {itemPassed ? <CheckCircle2 size={17} /> : itemUnlocked ? index + 1 : <LockKeyhole size={14} />}
        </span>
        <span className="mt-2.5 text-[10px] font-bold uppercase tracking-[1.2px] text-[#B88736]">{t("Module {{number}}", { number: String(index + 1).padStart(2, "0") })}</span>
        <span className={`mt-1 line-clamp-2 text-[12px] leading-4 ${labelClass}`}>{item.name || t("Untitled module")}</span>
      </>
    );
    const stepClass = "group relative z-10 flex w-full flex-col items-center px-2 text-center !no-underline";

    return (
      <li key={item.id} className="relative flex w-[150px] shrink-0 grow justify-center">
        {!isLast && (
          <span aria-hidden="true" className={`absolute left-1/2 top-[18px] h-[3px] w-full -translate-y-1/2 rounded-full ${itemPassed ? "bg-[#06424B]" : "bg-[#DCE7E5]"}`} />
        )}
        {itemUnlocked
          ? <Link to={moduleHref(item.id)} state={moduleLinkState} aria-current={active ? "step" : undefined} className={stepClass}>{stepBody}</Link>
          : <div aria-disabled="true" className={`${stepClass} cursor-not-allowed`}>{stepBody}</div>}
      </li>
    );
  };

  // Sidebar item (non-IT courses): unchanged list style.
  const renderSidebarItem = (item, index) => {
    const itemPassed = passedSet.has(String(item.id));
    const itemUnlocked = item.isUnlocked === true;
    const active = String(item.id) === String(module.id);
    const className = `flex shrink-0 items-center gap-3 rounded-xl px-3 py-3 text-[13px] !no-underline transition w-full ${active ? "border-[#06424B]/20 bg-[#E9F0EF] font-bold !text-[#06424B] ring-1 ring-[#06424B]/10" : itemUnlocked ? "font-medium !text-[#526D71] hover:bg-[#F4F7F7]" : "cursor-not-allowed font-medium !text-[#9AAEAF]"}`;
    const itemLabel = (
      <>
        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold ${itemPassed ? "bg-[#06424B] text-white" : active ? "bg-[#FFAB0B] text-[#123B43]" : "bg-[#EEF3F4] text-[#526D71]"}`}>
          {itemPassed ? <CheckCircle2 size={15} /> : itemUnlocked ? index + 1 : <LockKeyhole size={13} />}
        </span>
        <span className="min-w-0 flex-1 leading-5">{item.name || t("Untitled module")}</span>
      </>
    );
    return itemUnlocked
      ? <Link key={item.id} to={moduleHref(item.id)} state={moduleLinkState} className={className}>{itemLabel}</Link>
      : <div key={item.id} aria-disabled="true" className={className}>{itemLabel}</div>;
  };

  const backToCourseClass = "inline-flex h-10 items-center gap-2 rounded-xl border border-[#DCE6E4] bg-white px-4 text-xs font-bold text-[#06424B] !no-underline hover:bg-[#F4F7F7]";

  return (
    <PageShell max="max-w-[1500px]">
      <StudentPageHeader title={courseName} subtitle={t("{{course}} / {{module}}", { course: course.shortName || t("Course curriculum"), module: module.name })} />

      <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs font-semibold text-[#789094]">
        <Link to={learningPath} state={courseLinkState} className="!text-[#526D71] !no-underline hover:!text-[#06424B]">{t("My Learning")}</Link>
        <ChevronRight size={14} />
        <Link to={learningPath} state={courseLinkState} className="!text-[#526D71] !no-underline hover:!text-[#06424B]">{courseName}</Link>
        <ChevronRight size={14} />
        <span className="text-[#06424B]">{module.name}</span>
      </nav>

      <div className={`w-full ${isITCourse ? "flex flex-col gap-6" : "grid grid-cols-1 items-start gap-6 lg:grid-cols-[260px_minmax(0,1fr)]"}`}>
        <aside className={`w-full min-w-0 ${isITCourse ? "order-1" : "sticky top-5 h-fit"}`}>
          <Card className={`w-full overflow-hidden border border-[#DCE7E5] bg-white p-0 shadow-[0_8px_28px_rgba(6,66,75,0.07)] ${isITCourse ? "rounded-2xl" : ""}`}>
            <div className={`${isITCourse ? "flex flex-wrap items-center justify-between gap-3 bg-[#06424B] px-5 py-3.5 sm:px-6" : "bg-[#06424B] px-5 py-5"}`}>
              <div className={`${isITCourse ? "flex min-w-0 items-center gap-3" : ""}`}>
                <div className="mb-1 flex items-center gap-2"><BookOpen size={15} className="text-[#FFAB0B]" /><span className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#FFAB0B]">{isITCourse ? t("Course Roadmap") : t("Course Modules")}</span></div>
                {!isITCourse && <h2 className="text-xl font-extrabold text-white">{courseName}</h2>}
              </div>
              <p className={`${isITCourse ? "shrink-0 text-xs font-semibold text-white/75" : "mt-1 text-xs text-white/55"}`}>{t(modules.length === 1 ? "{{number}} module · {{progress}}% passed" : "{{number}} modules · {{progress}}% passed", { number: modules.length, progress: moduleProgress })}</p>
            </div>

            {isITCourse ? (
              <nav aria-label={t("Course roadmap")} className="overflow-x-auto">
                <ol className="flex w-max min-w-full items-start px-4 py-6 sm:px-6">
                  {modules.map(renderRoadmapStep)}
                </ol>
              </nav>
            ) : (
              <nav aria-label={t("Course module navigation")} className="max-h-[65vh] space-y-1 overflow-y-auto p-3">
                {modules.map(renderSidebarItem)}
              </nav>
            )}
          </Card>
        </aside>

        <article className={`w-full min-w-0 space-y-6 ${isITCourse ? "order-2 mx-auto max-w-[1120px] self-center" : ""}`}>
          {restartNotice && (
            <div role="status" className="flex items-start gap-3 rounded-2xl border border-[#F3E2B8] bg-[#FFFAEE] px-5 py-4 text-sm leading-6 text-[#805C17]">
              <RefreshCw size={17} className="mt-0.5 shrink-0" />
              <span>{t(restartNotice)}</span>
            </div>
          )}

          <Card className={`p-6 sm:p-8 ${isITCourse ? "w-full" : ""}`}>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg bg-[#FFF3D8] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#94650C]">{t("Module {{current}} of {{total}}", { current: String(moduleIndex + 1).padStart(2, "0"), total: modules.length })}</span>
              <span className="rounded-lg bg-[#EEF3F4] px-3 py-1.5 text-[10px] font-bold text-[#526D71]">{t(contentCount === 1 ? "{{number}} learning item" : "{{number}} learning items", { number: contentCount })}</span>
              {isPassed && <span className="inline-flex items-center gap-1 rounded-full bg-[#EAF4F2] px-3 py-1 text-[10px] font-bold text-[#06424B]"><CheckCircle2 size={13} /> {t("Assessment passed")}</span>}
            </div>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-[#123B43] sm:text-[38px]">{module.name}</h1>
            {module.summary && <p className="mt-4 max-w-3xl text-[15px] leading-8 text-[#526D71]">{module.summary}</p>}
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to={learningPath} state={courseLinkState} className={backToCourseClass}><ArrowLeft size={15} /> {t("Back to Course")}</Link>
              {previousModule && <Link to={moduleHref(previousModule.id)} state={moduleLinkState} className={backToCourseClass}>{t("Previous Module")}</Link>}
              {canGoNext && <Link to={moduleHref(nextModule.id)} state={moduleLinkState} className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#FFAB0B] px-4 text-xs font-extrabold text-[#06424B] !no-underline hover:bg-[#FFC13C]">{t("Next Module")}{" "}<ArrowRight size={15} /></Link>}
            </div>
          </Card>

          {contentCount > 0 ? module.contents.map((content, index) => (
            <Card key={content.id ?? `${module.id}-content-${index}`} className="p-6 sm:p-8">
              <div className="mb-6 flex items-start gap-4 border-b border-[#E7EEEE] pb-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFF1D1] text-sm font-extrabold text-[#94650C]">{String(index + 1).padStart(2, "0")}</span>
                <div className="min-w-0">
                  <p className="text-[10px] font-extrabold uppercase tracking-[1.4px] text-[#B07A06]">{(content.contentType || content.content_type ? String(content.contentType || content.content_type).replace(/[_-]+/g, " ") : t("learning content"))}</p>
                  <h2 className="mt-1 text-xl font-extrabold leading-snug text-[#123B43] sm:text-2xl">{content.title || t("Learning content")}</h2>
                </div>
              </div>
              <ApiContentBlocks content={content} />
              {(content.url || content.previewUrl || content.downloadUrl) && (
                <div className="mt-7 flex flex-wrap gap-3 border-t border-[#E7EEEE] pt-5">
                  {(content.previewUrl || content.url) && <a href={content.previewUrl || content.url} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#DCE6E4] bg-white px-4 text-xs font-bold text-[#06424B] transition hover:bg-[#F4F7F7]"><BookOpen size={15} /> {t("Open resource")}</a>}
                  {content.downloadUrl && <a href={content.downloadUrl} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#EEF3F4] px-4 text-xs font-bold text-[#06424B] transition hover:bg-[#E2EBEC]"><ExternalLink size={15} /> {t("Download {{fileName}}", { fileName: content.fileName || t("resource") })}</a>}
                </div>
              )}
            </Card>
          )) : (
            <Card className="p-7"><p className="text-sm leading-7 text-[#718486]">{t("No learning content is available for this module yet.")}</p></Card>
          )}

          <Card className="p-5 sm:p-6">
            {isPassed ? (
              <div className="rounded-xl border border-[#CFE2E0] bg-[#F4F7F7] p-4">
                <p className="inline-flex items-center gap-2 text-sm font-extrabold text-[#06424B]"><CheckCircle2 size={17} /> {t("Module assessment passed")}</p>
                <p className="mt-1 text-xs leading-5 text-[#526D71]">{t("Great work! You've passed this module's assessment.")}</p>
              </div>
            ) : !isRead ? (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-[#123B43]">{t("Finished reading this module?")}</h3>
                  <p className="mt-1 max-w-2xl text-xs leading-5 text-[#789094]">{t("Mark this lesson as read to open its assessment. Pass the assessment to unlock the next module.")}</p>
                </div>
                <button type="button" onClick={handleMarkAsRead} disabled={isMarkingRead || contentCount === 0} aria-busy={isMarkingRead} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#FFAB0B] px-5 py-3 text-xs font-extrabold text-[#06424B] shadow-[0_7px_18px_rgba(255,171,11,0.18)] transition hover:bg-[#FFC13C] disabled:cursor-not-allowed disabled:opacity-60">
                  {isMarkingRead ? <><RefreshCw size={15} className="animate-spin" /> {t("Saving read status...")}</> : <><CheckCircle2 size={15} /> {t("Mark as Read")}</>}
                </button>
              </div>
            ) : (
              <div>
                <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[#CFE2E0] bg-[#F4F7F7] p-4"><CheckCircle2 size={17} className="text-[#06424B]" /><p className="text-sm font-extrabold text-[#06424B]">{t("Lesson marked as read")}</p><span className="text-xs text-[#526D71]">{t("Your assessment is ready below.")}</span></div>
                <div id="module-assessment-panel" ref={assessmentSectionRef} className="mt-5 scroll-mt-8">
                  <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-base font-extrabold text-[#123B43]">{t("Module assessment")}</h3><p className="mt-1 text-xs text-[#789094]">{t("Pass this assessment to unlock the next module.")}</p></div><button type="button" onClick={() => loadModuleAssessments(module.id)} disabled={isAssessmentsLoading} className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#DCE6E4] bg-white px-3 text-xs font-bold text-[#06424B] hover:bg-[#F4F7F7] disabled:opacity-60"><RefreshCw size={13} className={isAssessmentsLoading ? "animate-spin" : ""} /> {t("Refresh")}</button></div>
                  {isAssessmentsLoading ? (
                    <div role="status" aria-live="polite" className="mt-4 flex items-center gap-3 rounded-2xl border border-[#E3EBE9] bg-[#F8FAFA] px-4 py-5">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#06424B] shadow-sm">
                        <RefreshCw size={18} className="animate-spin" />
                      </span>
                      <span>
                        <span className="block text-sm font-extrabold text-[#06424B]">{t("Preparing your assessment")}</span>
                        <span className="mt-1 block text-xs leading-5 text-[#718486]">{t("Getting your assessment ready...")}</span>
                      </span>
                    </div>
                  ) : assessmentError ? (
                    <div role="alert" className="mt-4 flex flex-col gap-3 rounded-2xl border border-[#EADBC8] bg-[#F8F6F2] p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-3">
                        <AlertCircle size={18} className="mt-0.5 shrink-0 text-[#8A573D]" />
                        <div>
                          <p className="text-sm font-extrabold text-[#6B2D1A]">{t("Assessment couldn't be loaded")}</p>
                          <p className="mt-1 text-xs leading-5 text-[#795D4E]">{t("Please try again in a moment.")}</p>
                        </div>
                      </div>
                      <button type="button" onClick={() => loadModuleAssessments(module.id)} disabled={isAssessmentsLoading} className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-[#DCC9B9] bg-white px-4 text-xs font-extrabold text-[#6B2D1A] transition hover:bg-[#FFFDFC] disabled:cursor-wait disabled:opacity-60">
                        <RefreshCw size={14} className={isAssessmentsLoading ? "animate-spin" : ""} /> {t("Try again")}</button>
                    </div>
                  ) : assessments.length ? (
                    <div className="mt-4 grid gap-3">
                      {assessments.map((assignment) => (
                        <div key={assignment.id} className="flex flex-col gap-4 rounded-2xl border border-[#E3EBE9] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0">
                            {/* Keep the assessment card concise. The API description may contain the full assignment brief and is intentionally not rendered here. */}
                            <h4 className="font-extrabold text-[#06424B]">{assignment.title || t("Module Assessment")}</h4>
                            <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-bold text-[#718486]">
                              {assignment.questionCount !== undefined && <span className="rounded-full bg-[#EEF3F4] px-2.5 py-1">{t(assignment.questionCount === 1 ? "{{number}} question" : "{{number}} questions", { number: assignment.questionCount })}</span>}
                              {Number(assignment.timeLimitMinutes) > 0 && <span className="rounded-full bg-[#EEF3F4] px-2.5 py-1">{assignment.timeLimitMinutes} {t("min")}</span>}
                              {Number(assignment.passPercentage) > 0 && <span className="rounded-full bg-[#FFF3D8] px-2.5 py-1">{t("{{percentage}}% to pass", { percentage: assignment.passPercentage })}</span>}
                              {Number(assignment.maxAttempts) > 0 && <span className="rounded-full bg-[#EEF3F4] px-2.5 py-1">{t(assignment.maxAttempts === 1 ? "{{number}} attempt" : "{{number}} attempts", { number: assignment.maxAttempts })}</span>}
                            </div>
                          </div>
                          <Link to={`/student/assessments/${assignment.id}?course=${encodeURIComponent(courseId)}&module=${encodeURIComponent(module.id)}${nextModule ? `&next=${encodeURIComponent(nextModule.id)}` : ""}`} state={routeState} className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#FFAB0B] px-5 text-xs font-extrabold text-[#06424B] !no-underline transition hover:bg-[#FFC13C]"><ClipboardCheck size={15} /> {t("Start Assessment")}{" "}<ArrowRight size={15} /></Link>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-4 rounded-2xl border border-dashed border-[#DCE6E4] bg-[#F8FAFA] p-5">
                      <div className="flex items-start gap-3">
                        <ClipboardCheck size={19} className="mt-0.5 shrink-0 text-[#8A9B9D]" />
                        <div>
                          <p className="text-sm font-extrabold text-[#526D71]">{t("No assessment available yet")}</p>
                          <p className="mt-1 text-xs leading-5 text-[#829596]">{t("Your lesson is marked as read. An assessment will appear here when one is available for this module.")}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {isMarkingRead && <p role="status" aria-live="polite" className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[#F3E2B8] bg-[#FFFAEE] px-4 py-3 text-xs font-semibold text-[#805C17]"><RefreshCw size={14} className="animate-spin" /> {t("Saving your progress...")}</p>}

            <div className="mt-5 flex flex-wrap gap-3 border-t border-[#E9EEEE] pt-5">
              <Link to={learningPath} state={courseLinkState} className={backToCourseClass}>{t("All Course Modules")}</Link>
              {canGoNext && <Link to={moduleHref(nextModule.id)} state={moduleLinkState} className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#FFAB0B] px-5 text-sm font-extrabold text-[#06424B] !no-underline hover:bg-[#FFC13C]">{t("Continue to Next Module")}{" "}<ArrowRight size={16} /></Link>}
              {isPassed && !nextModule && <span className="inline-flex items-center gap-2 rounded-xl bg-[#FFF3D8] px-4 py-3 text-xs font-extrabold text-[#94650C]"><CheckCircle2 size={15} /> {t("All module assessments passed")}</span>}
            </div>
          </Card>
        </article>
      </div>

      {showReadConfirmation && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#0B252B]/55 p-4 backdrop-blur-sm" role="presentation">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="lesson-read-dialog-title"
            aria-describedby="lesson-read-dialog-description"
            className="relative w-full max-w-[470px] overflow-hidden rounded-[28px] border border-white/70 bg-white p-6 shadow-[0_28px_90px_rgba(4,33,38,0.28)] sm:p-8"
          >
            <button
              type="button"
              onClick={() => setShowReadConfirmation(false)}
              aria-label={t("Close confirmation")}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl text-[#829596] transition hover:bg-[#F1F5F4] hover:text-[#06424B]"
            >
              <X size={18} />
            </button>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF4F2] text-[#06424B]">
              <CheckCircle2 size={29} />
            </div>
            <p className="mt-5 text-[10px] font-extrabold uppercase tracking-[1.5px] text-[#B88736]">{t("Learning progress saved")}</p>
            <h2 id="lesson-read-dialog-title" className="mt-2 text-2xl font-extrabold tracking-tight text-[#06424B]">{t("Lesson marked as read")}</h2>
            <p id="lesson-read-dialog-description" className="mt-2 text-sm leading-7 text-[#627C7F]">
              {t("Your progress has been saved. We're getting your assessment ready.")}</p>

            <div className="mt-5 rounded-2xl border border-[#E5ECEB] bg-[#F8FAFA] p-4" aria-live="polite">
              {isAssessmentsLoading ? (
                <div className="flex items-center gap-3">
                  <RefreshCw size={18} className="shrink-0 animate-spin text-[#B88736]" />
                  <div>
                    <p className="text-xs font-extrabold text-[#06424B]">{t("Loading module assessment")}</p>
                    <p className="mt-1 text-[11px] leading-5 text-[#829596]">{t("Please wait a moment...")}</p>
                  </div>
                </div>
              ) : assessmentError ? (
                <div className="flex items-start gap-3">
                  <AlertCircle size={18} className="mt-0.5 shrink-0 text-[#8A573D]" />
                  <div>
                    <p className="text-xs font-extrabold text-[#6B2D1A]">{t("Assessment is temporarily unavailable")}</p>
                    <p className="mt-1 text-[11px] leading-5 text-[#795D4E]">{t("Please try again in a moment.")}</p>
                  </div>
                </div>
              ) : assessments.length > 0 ? (
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EAF4F2] text-[#06424B]"><ClipboardCheck size={18} /></span>
                  <div>
                    <p className="text-xs font-extrabold text-[#06424B]">{t("Assessment ready")}</p>
                    <p className="mt-1 text-[11px] leading-5 text-[#829596]">{t(assessments.length === 1 ? "{{number}} assessment is ready for this module." : "{{number}} assessments are ready for this module.", { number: assessments.length })}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <ClipboardCheck size={18} className="shrink-0 text-[#829596]" />
                  <div>
                    <p className="text-xs font-extrabold text-[#526D71]">{t("No assessment available yet")}</p>
                    <p className="mt-1 text-[11px] leading-5 text-[#829596]">{t("Your progress is saved. An assessment will appear here once it's available.")}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowReadConfirmation(false)}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-[#DCE6E4] bg-white px-5 text-sm font-bold text-[#526D71] transition hover:bg-[#F4F7F7]"
              >
                {t("Close")}</button>
              <button
                type="button"
                onClick={handleReadConfirmationAction}
                disabled={isAssessmentsLoading}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#FFAB0B] px-5 text-sm font-extrabold text-[#06424B] shadow-[0_7px_18px_rgba(255,171,11,0.18)] transition hover:bg-[#FFC13C] disabled:cursor-wait disabled:opacity-60"
              >
                {isAssessmentsLoading ? <RefreshCw size={15} className="animate-spin" /> : assessmentError ? <RefreshCw size={15} /> : <ArrowRight size={16} />}
                {isAssessmentsLoading ? t("Loading assessment...") : assessmentError ? t("Retry loading") : assessments.length ? t("Continue to Assessment") : t("View Lesson Status")}
              </button>
            </div>
          </section>
        </div>
      )}

      {apiErrorModal}
    </PageShell>
  );
}

export default LessonContent;