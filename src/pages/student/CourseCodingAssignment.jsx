import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, CheckCircle2, Code2, FileText, Play,
  Send, ShieldCheck, Terminal, Trophy
} from "lucide-react";
 
import StudentPageHeader from "../../components/student/StudentPageHeader";
import { Card, PageShell } from "../../components/student/ui";
import { courseCategories, technologies } from "../../data/studentLearningData";
import { useEnrolledCourses } from "../../data/studentCourseEnrollment";
import { courseProgress, recordCourseAssessmentSubmission, useProgress } from "../../data/studentProgress";

const starterFor = (courseName) => {
  if (/python/i.test(courseName)) {
    return "def process_scores(scores):\n    # Write your solution here\n    pass\n\n\n# Example\nprint(process_scores([70, 85, 90]))";
  }
  return "function processScores(scores) {\n  // Write your solution here\n}\n\n// Example\nconsole.log(processScores([70, 85, 90]));";
};

function CourseCodingAssignment() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const progress = useProgress();
  const { enrolledCourseIds } = useEnrolledCourses();
  const courseId = params.get("course");
  const course = useMemo(() => {
    const vocational = courseCategories.find((item) => item.id === courseId && enrolledCourseIds.includes(item.id));
    const technology = technologies.find((item) => item.id === courseId && enrolledCourseIds.includes(item.id));
    return vocational || technology;
  }, [courseId, enrolledCourseIds]);
  const topicList = course?.topics || course?.modules || [];
  const stats = course ? courseProgress(progress, course) : { done: 0, total: 0 };
  const allTopicsComplete = stats.total > 0 && stats.done === stats.total;
  const finalTopic = topicList[topicList.length - 1];
  const topicName = finalTopic?.title || "Course fundamentals";
  const isPython = /python/i.test(course?.name || "");
  const language = isPython ? "Python" : "JavaScript";
  const [code, setCode] = useState(() => starterFor(course?.name || "JavaScript"));
  const [hasRun, setHasRun] = useState(false);
  const [runPassed, setRunPassed] = useState(false);
  const [output, setOutput] = useState("Run your solution to view the sample test preview.");
  const [submitted, setSubmitted] = useState(false);

  const handleRun = () => {
    if (!code.trim() || code.trim() === starterFor(course?.name || "JavaScript").trim()) {
      setHasRun(true);
      setRunPassed(false);
      setOutput("Please write your solution before running the sample tests.");
      return;
    }
    // Frontend-only preview: real execution requires a secured code-runner service.
    setHasRun(true);
    setRunPassed(true);
    setOutput("Sample test preview\nInput: [70, 85, 90]\nExpected output: 81.67\nStatus: Solution received. Connect a sandboxed runner to execute code and verify test cases.");
  };

  const handleSubmit = () => {
    if (!course || !hasRun || !runPassed || !code.trim()) return;
    recordCourseAssessmentSubmission(course.id, "coding", {
      answer: code.trim(),
      language,
      courseName: course.name,
      relatedTopic: topicName,
      runPreview: output,
    });
    setSubmitted(true);
  };

  if (!course) {
    return (
      
        <PageShell>
          <div className="mx-auto max-w-3xl rounded-2xl border border-[#E1E9E8] bg-white p-8 text-center">
            <h1 className="text-xl font-extrabold text-[#06424B]">Course not found</h1>
            <p className="mt-2 text-sm text-[#627C7F]">Open this assignment from an enrolled course in My Learning.</p>
            <Link to="/student/my-learning" className="mt-5 inline-flex rounded-xl bg-[#06424B] px-5 py-3 text-sm font-bold text-white">Back to My Learning</Link>
          </div>
        </PageShell>
      
    );
  }

  const coursePath = `/student/my-learning?${course.topics ? `technology=${course.id}` : `course=${course.id}`}`;

  if (!allTopicsComplete) {
    return (
      
        <PageShell>
          <div className="mx-auto max-w-2xl rounded-2xl border border-[#E1E9E8] bg-white p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F0F3F3] text-[#829596]"><ShieldCheck size={25} /></div>
            <h1 className="mt-4 text-xl font-extrabold text-[#06424B]">Coding assignment is locked</h1>
            <p className="mt-2 text-sm leading-6 text-[#627C7F]">Complete all topics and quizzes in {course.name} to unlock this course assessment.</p>
            <Link to={coursePath} className="mt-5 inline-flex rounded-xl bg-[#06424B] px-5 py-3 text-sm font-bold text-white">Return to course</Link>
          </div>
        </PageShell>
      
    );
  }

  return (
    
      <PageShell max="max-w-[1500px]">
        <StudentPageHeader
          title="Final Coding Assignment"
          subtitle={`Apply the concepts learned in ${course.name}. Run the sample preview and submit your solution for evaluation.`}
        />
        <Link to={coursePath} className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-[#176A73] hover:text-[#06424B]">
          <ArrowLeft size={16} /> Back to {course.name}
        </Link>

        <div className="mb-5 grid gap-3 sm:grid-cols-3">
          <Card className="flex items-center gap-3 p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF3D9] text-[#9A741E]"><FileText size={19} /></span>
            <div><p className="text-[11px] font-bold text-[#829295]">ASSESSMENT</p><p className="text-sm font-extrabold text-[#06424B]">20 marks</p></div>
          </Card>
          <Card className="flex items-center gap-3 p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF2F1] text-[#376C68]"><Code2 size={19} /></span>
            <div><p className="text-[11px] font-bold text-[#829295]">LANGUAGE</p><p className="text-sm font-extrabold text-[#06424B]">{language}</p></div>
          </Card>
          <Card className="flex items-center gap-3 p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E7F4EE] text-[#28765E]"><Trophy size={19} /></span>
            <div><p className="text-[11px] font-bold text-[#829295]">RELATED TOPIC</p><p className="text-sm font-extrabold text-[#06424B]">{topicName}</p></div>
          </Card>
        </div>

        <div className="grid items-start gap-5 xl:grid-cols-[minmax(300px,0.78fr)_minmax(0,1.5fr)]">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFF3D9] text-[#9A741E]"><Code2 size={21} /></span>
              <div><p className="text-[10px] font-extrabold tracking-[1.2px] text-[#B07A06]">COURSE CHALLENGE</p><h2 className="text-lg font-extrabold text-[#06424B]">Coding question</h2></div>
            </div>
            <h3 className="mt-6 text-xl font-extrabold leading-8 text-[#06424B]">Process a list of scores</h3>
            <p className="mt-3 text-sm leading-7 text-[#526F73]">
              Using the concepts from <strong>{topicName}</strong>, write a function that accepts a list of numeric scores and returns their average rounded to two decimal places. Handle an empty list by returning 0.
            </p>
            <div className="mt-5 rounded-xl border border-[#E5ECEA] bg-[#F8FAF9] p-4">
              <p className="text-xs font-extrabold text-[#06424B]">Example</p>
              <p className="mt-2 font-mono text-xs leading-6 text-[#526F73]">Input: [70, 85, 90]<br />Output: 81.67</p>
            </div>
            <div className="mt-4 rounded-xl border border-[#E5ECEA] p-4">
              <p className="text-xs font-extrabold text-[#06424B]">Requirements</p>
              <ul className="mt-2 list-disc space-y-2 pl-4 text-xs leading-5 text-[#627C7F]">
                <li>Use a reusable function.</li>
                <li>Calculate the average of all values.</li>
                <li>Round the result to two decimal places.</li>
                <li>Return 0 when the list is empty.</li>
              </ul>
            </div>
            <div className="mt-5 flex items-start gap-2 rounded-xl bg-[#FFF8E9] p-3 text-xs leading-5 text-[#80621F]">
              <ShieldCheck size={16} className="mt-0.5 shrink-0" />
              This page currently provides a frontend sample-run preview. Actual code execution and automatic test verification require a secure code-runner backend.
            </div>
          </Card>

          <section className="overflow-hidden rounded-2xl border border-[#173740] bg-[#0F2F36] shadow-[0_12px_30px_rgba(6,66,75,0.16)]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-[#143B44] px-5 py-4">
              <div className="flex items-center gap-2 text-white"><Code2 size={18} className="text-[#FFAB0B]" /><span className="text-sm font-bold">Code workspace</span></div>
              <span className="rounded-lg border border-white/15 bg-[#0F2F36] px-3 py-2 text-xs font-semibold text-[#DCE9E8]">{language}</span>
            </div>
            <div className="grid min-h-[430px] grid-cols-[48px_minmax(0,1fr)]">
              <div className="select-none bg-[#0B2329] px-3 py-4 text-right font-mono text-xs leading-6 text-[#6F8E96]">{code.split("\n").map((_, index) => <div key={index}>{index + 1}</div>)}</div>
              <textarea spellCheck="false" value={code} onChange={(event) => { setCode(event.target.value); setHasRun(false); setRunPassed(false); setOutput("Code changed. Run the sample preview again before submitting."); }} aria-label="Coding solution editor" className="min-h-[430px] w-full resize-y bg-[#0F2F36] p-4 font-mono text-[13px] leading-6 text-[#E4F0EF] outline-none" />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-[#143B44] px-5 py-4">
              <span className="text-xs text-[#A9C1C6]">{language} · {code.split("\n").length} lines</span>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={handleRun} className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white px-4 py-2.5 text-xs font-extrabold text-[#16434A] hover:bg-[#EEF5F4]"><Play size={14} /> Run Code</button>
                <button type="button" onClick={handleSubmit} disabled={!hasRun || !runPassed || submitted} className="inline-flex items-center gap-2 rounded-xl bg-[#FFAB0B] px-4 py-2.5 text-xs font-extrabold text-[#3D310E] hover:bg-[#F6B92F] disabled:cursor-not-allowed disabled:opacity-40"><Send size={14} /> Submit Assignment</button>
              </div>
            </div>
            <div className="border-t border-white/10 bg-[#0B2329] p-5">
              <div className="flex items-center gap-2 text-[#E4F0EF]"><Terminal size={16} /><span className="text-sm font-bold">Output & test preview</span></div>
              <pre className="mt-3 whitespace-pre-wrap rounded-xl bg-[#102D34] p-4 font-mono text-xs leading-6 text-[#BFD2D3]">{output}</pre>
              {hasRun && runPassed && <p className="mt-3 flex items-center gap-2 text-xs font-bold text-[#9BD7B8]"><CheckCircle2 size={15} /> Sample preview completed. Ready to submit.</p>}
              {submitted && <div className="mt-4 rounded-xl border border-[#7DBB9A]/30 bg-[#1C4A40]/30 p-4"><p className="font-bold text-[#A9E0C2]">Assignment submitted successfully.</p><p className="mt-1 text-xs text-[#C0D8D0]">Submitted for evaluation · Marks: Awaiting review / 20</p><button type="button" onClick={() => navigate(coursePath)} className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-[#FFCB65]">Back to course <ArrowRight size={14} /></button></div>}
            </div>
          </section>
        </div>
      </PageShell>
    
  );
}

export default CourseCodingAssignment;
