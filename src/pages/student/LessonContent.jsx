import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
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
  RotateCcw,
} from "lucide-react";
import StudentSidebar from "../../components/student/StudentSidebar";
import StudentPageHeader from "../../components/student/StudentPageHeader";
import { Btn, Card, LinkButton, PageShell } from"../../components/student/ui";
import { technologies } from "../../data/studentLearningData";
import { getQuizForTechnology } from "../../data/quizData";
import { rememberLastTopic, toggleTopicComplete, useProgress } from "../../data/studentProgress";

/* Editable HTML/CSS example with a live preview (scripts are blocked in the preview frame). */
function TryItYourself({ initial }) {
  const [source, setSource] = useState(initial);
  const [rendered, setRendered] = useState(initial);

  useEffect(() => {
    setSource(initial);
    setRendered(initial);
  }, [initial]);

  return (
    <div className="mt-5 overflow-hidden rounded-2xl border-2 border-[#06424B]/15 bg-white">
      <div className="flex items-center justify-between bg-[#06424B] px-4 py-2.5">
        <span className="text-sm font-bold text-white">Try it Yourself</span>
        <div className="flex gap-2">
          <Btn size="sm" variant="light" icon={RotateCcw} onClick={() => { setSource(initial); setRendered(initial); }}>Reset</Btn>
          <Btn size="sm" variant="gold" icon={Play} onClick={() => setRendered(source)}>Run</Btn>
        </div>
      </div>
      <div className="grid lg:grid-cols-2">
        <textarea
          spellCheck="false"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          aria-label="Editable code"
          className="min-h-[220px] w-full resize-y bg-[#0F2F36] p-4 font-mono text-[13px] leading-6 text-[#E4F0EF] outline-none"
        />
        <iframe title="Result" sandbox="" srcDoc={`<body style="font-family:system-ui,sans-serif;padding:14px;color:#222">${rendered}</body>`} className="min-h-[220px] w-full border-t-2 border-[#06424B]/10 bg-white lg:border-l-2 lg:border-t-0" />
      </div>
    </div>
  );
}

function CodeBlock({ code, language }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };
  return (
    <div className="mt-5 overflow-hidden rounded-2xl border border-[#0F2F36] bg-[#0F2F36]">
      <div className="flex items-center justify-between border-b border-white/10 bg-[#143B44] px-4 py-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[#FFAB0B]">{language || "code"}</span>
        <button type="button" onClick={copy} className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold !text-white/80 hover:bg-white/10">
          <Copy size={13} /> {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-[13px] leading-6 text-[#E4F0EF]"><code>{code}</code></pre>
    </div>
  );
}

function LessonContent() {
  const { technologySlug, topicId } = useParams();
  const progress = useProgress();
  const technology = technologies.find((item) => item.id === technologySlug) || technologies[0];
  const topicIndex = Math.max(0, technology.topics.findIndex((item) => item.id === topicId));
  const topic = technology.topics[topicIndex];
  const prev = technology.topics[topicIndex - 1];
  const next = technology.topics[topicIndex + 1];
  const quiz = getQuizForTechnology(technology.id);
  const done = Boolean(progress.completed[`${technology.id}/${topic.id}`]);

  useEffect(() => {
    rememberLastTopic(technology.id, topic.id);
    window.scrollTo({ top: 0 });
  }, [technology.id, topic.id]);

  return (
    <StudentSidebar>
      <PageShell max="max-w-[1500px]">
        <StudentPageHeader title="Lesson" subtitle={`${technology.name} / ${topic.title}`} />

        {/* breadcrumb */}
        <nav className="mb-5 flex flex-wrap items-center gap-1.5 text-[13px] font-semibold text-[#4F6B6F]">
          <Link to="/student/topics" className="!text-[#4F6B6F] !no-underline hover:!text-[#06424B]">Topics</Link><ChevronRight size={14} />
          <Link to={`/student/topics/${technology.id}`} className="!text-[#4F6B6F] !no-underline hover:!text-[#06424B]">{technology.name}</Link><ChevronRight size={14} />
          <span className="text-[#06424B]">{topic.title}</span>
        </nav>

        <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)] 2xl:grid-cols-[260px_minmax(0,1fr)_240px]">
          {/* Left: technology topic menu (like a tutorial menu) */}
          <aside className="lg:sticky lg:top-6 lg:h-fit">
            <Card className="overflow-hidden">
              <div className="bg-[#06424B] px-5 py-4">
                <p className="text-[11px] font-bold tracking-[1.3px] text-[#FFAB0B]">TUTORIAL</p>
                <h2 className="text-lg font-extrabold text-white">{technology.name}</h2>
              </div>
              <nav className="p-2">
                {technology.topics.map((item, i) => {
                  const active = item.id === topic.id;
                  const complete = Boolean(progress.completed[`${technology.id}/${item.id}`]);
                  return (
                    <Link
                      key={item.id}
                      to={`/student/topics/${technology.id}/topic/${item.id}`}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] !no-underline transition ${active ? "bg-[#FFAB0B] font-bold !text-[#06424B]" : "font-medium !text-[#3F5C60] hover:bg-[#FFF4D6]"}`}
                    >
                      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${complete ? "bg-[#06424B] text-[#FFAB0B]" : "bg-[#E3EEEC] text-[#3F5C60]"}`}>
                        {complete ? <CheckCircle2 size={14} /> : i + 1}
                      </span>
                      <span className="min-w-0 flex-1">{item.title}</span>
                    </Link>
                  );
                })}
                {quiz && (
                  <Link to={`/student/quiz/${quiz.slug}`} className="mt-1 flex items-center gap-3 rounded-xl border-t border-[#EAF1F0] px-3 py-3 text-[13px] font-bold !text-[#06424B] !no-underline hover:bg-[#FFF4D6]">
                    <ClipboardCheck size={17} className="text-[#B07A06]" /> Take {technology.name} quiz
                  </Link>
                )}
              </nav>
            </Card>
          </aside>

          {/* Centre: lesson article */}
          <article className="min-w-0 space-y-5">
            <Card className="p-6 sm:p-8">
              <p className="text-xs font-bold tracking-[1.3px] text-[#B07A06]">TOPIC {String(topicIndex + 1).padStart(2, "0")} · {technology.name.toUpperCase()}</p>
              <h1 className="mt-2 text-[30px] font-extrabold leading-tight tracking-tight text-[#06424B] sm:text-[36px]">{topic.title}</h1>
              <p className="mt-3 text-base leading-7 text-[#3F5C60]">{topic.summary}</p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                {prev && <LinkButton to={`/student/topics/${technology.id}/topic/${prev.id}`} variant="outline" size="sm" icon={ArrowLeft}>Previous</LinkButton>}
                {next && <LinkButton to={`/student/topics/${technology.id}/topic/${next.id}`} size="sm" iconRight={ArrowRight}>Next: {next.title}</LinkButton>}
              </div>
            </Card>

            {topic.lessonItems.map((lesson, index) => (
              <Card key={lesson.title} id={`lesson-${index + 1}`} className="scroll-mt-6 p-6 sm:p-8">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFAB0B] text-sm font-extrabold text-[#06424B]">{index + 1}</span>
                  <h2 className="text-2xl font-extrabold text-[#06424B]">{lesson.title}</h2>
                </div>
                <p className="mt-4 text-[16px] leading-8 text-[#2F4A4E]">{lesson.text}</p>

                <ul className="mt-4 space-y-2.5">
                  {lesson.points.map((point) => (
                    <li key={point} className="flex items-start gap-3 text-[15px] leading-6 text-[#2F4A4E]">
                      <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[#1E8A6B]" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>

                {lesson.live ? (
                  <TryItYourself initial={lesson.code} />
                ) : (
                  <>
                    <p className="mt-6 text-sm font-bold text-[#06424B]">Example</p>
                    <CodeBlock code={lesson.code} language={lesson.language} />
                    {lesson.output && (
                      <div className="mt-3 rounded-2xl border border-[#BFDCD8] bg-[#EAF6F4] p-4">
                        <p className="text-xs font-bold tracking-wider text-[#1B5159]">RESULT</p>
                        <pre className="mt-1.5 whitespace-pre-wrap font-mono text-[13px] leading-6 text-[#123F47]">{lesson.output}</pre>
                      </div>
                    )}
                  </>
                )}
              </Card>
            ))}

            <div className="flex items-start gap-3 rounded-2xl border border-[#F3D78B] bg-[#FFF7DF] p-5">
              <Lightbulb size={22} className="mt-0.5 shrink-0 text-[#B07A06]" />
              <div>
                <h3 className="text-base font-bold text-[#7A5410]">Pro tip</h3>
                <p className="mt-1 text-[15px] leading-6 text-[#6F5313]">{topic.tip}</p>
              </div>
            </div>

            {/* Footer actions */}
            <Card className="p-5 sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <Btn variant={done ? "soft" : "gold"} icon={CheckCircle2} onClick={() => toggleTopicComplete(technology.id, topic.id)}>
                  {done ? "Completed – tap to undo" : "Mark topic as complete"}
                </Btn>
                <div className="flex flex-wrap gap-3">
                  <LinkButton to="/student/resources" variant="outline" icon={FileText}>Resources</LinkButton>
                  {quiz && <LinkButton to={`/student/quiz/${quiz.slug}`} variant="outline" icon={ClipboardCheck}>Take quiz</LinkButton>}
                  {next ? (
                    <LinkButton to={`/student/topics/${technology.id}/topic/${next.id}`} iconRight={ArrowRight}>Next topic</LinkButton>
                  ) : (
                    quiz && <LinkButton to={`/student/quiz/${quiz.slug}`} iconRight={ArrowRight}>Finish with quiz</LinkButton>
                  )}
                </div>
              </div>
            </Card>

            <a href={technology.reference} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-[13px] font-semibold !text-[#4F6B6F] !no-underline hover:!text-[#06424B]">
              <ExternalLink size={14} /> More {technology.name} tutorials on W3Schools
            </a>
          </article>

          {/* Right: on this page */}
          <aside className="hidden 2xl:block">
            <div className="sticky top-6 rounded-2xl border border-[#D9E8E6] bg-white p-5">
              <h3 className="text-sm font-bold text-[#06424B]">On this page</h3>
              <ul className="mt-3 space-y-1 border-l-2 border-[#E3EEEC]">
                {topic.lessons.map((title, i) => (
                  <li key={title}>
                    <a href={`#lesson-${i + 1}`} className="-ml-[2px] block border-l-2 border-transparent py-1.5 pl-3 text-[13px] font-medium !text-[#4F6B6F] !no-underline hover:border-[#FFAB0B] hover:!text-[#06424B]">
                      {title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </PageShell>
    </StudentSidebar>
  );
}

export default LessonContent;
