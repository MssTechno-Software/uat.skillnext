import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Code2, GraduationCap } from "lucide-react";
import { Card } from "../../components/student/ui";
import { courseAssessmentSummary, recordCourseAssessmentSubmission } from "../../data/studentProgress";

function CourseAssessmentPanel({ course, progress, quizList, allTopicsComplete }) {
  const [projectUrl, setProjectUrl] = useState("");
  const [projectSummary, setProjectSummary] = useState("");
  const summary = courseAssessmentSummary(progress, course.id, quizList.map((quiz) => quiz?.slug).filter(Boolean));
  const codingSubmitted = Boolean(summary.coding);
  const projectSubmitted = Boolean(summary.megaProject);
  const statusClass = "rounded-full px-3 py-1 text-[10px] font-extrabold";

  const submitProject = (event) => {
    event.preventDefault();
    if (!projectUrl.trim() || !projectSummary.trim() || !codingSubmitted) return;
    recordCourseAssessmentSubmission(course.id, "megaProject", {
      projectUrl: projectUrl.trim(), summary: projectSummary.trim(), courseName: course.name,
    });
    setProjectUrl("");
    setProjectSummary("");
  };

  return (
    <section className="space-y-4">
      <Card className="p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-extrabold tracking-[1.2px] text-[#9A741E]">COURSE ASSESSMENT</p>
            <h3 className="mt-1 text-lg font-extrabold text-[#06424B]">Your assessment score</h3>
            <p className="mt-1 text-xs leading-5 text-[#698084]">All module quiz scores are combined into one 30-mark component.</p>
          </div>
          <span className="rounded-xl bg-[#F7F5EF] px-3 py-2 text-xs font-extrabold text-[#775A1A]">100 marks total</span>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <ScoreTile label="Module quizzes" score={summary.quizMarks} total="30" detail={`${summary.quizzesCompleted} of ${summary.quizCount} completed · ${summary.quizAverage}% average`} />
          <ScoreTile label="Coding assignment" score={summary.codingMarks} total="20" detail={summary.coding?.status === "evaluated" ? "Evaluated" : summary.coding ? "Submitted · Awaiting evaluation" : "Not submitted"} />
          <ScoreTile label="Mega project" score={summary.projectMarks} total="50" detail={summary.megaProject?.status === "evaluated" ? "Evaluated" : summary.megaProject ? "Submitted · Awaiting evaluation" : "Not submitted"} />
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#EDF0EF] pt-4">
          <span className="text-xs font-bold text-[#627A7E]">Evaluated marks earned</span>
          <strong className="text-xl text-[#06424B]">{summary.totalMarks} <span className="text-sm font-semibold text-[#829596]">/ 100</span></strong>
        </div>
        <p className="mt-2 text-[11px] leading-5 text-[#879799]">Pending coding and project evaluations are not included in the earned total.</p>
      </Card>

      <Card className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF3D9] text-[#9A741E]"><Code2 size={19} /></span>
            <div><h3 className="font-extrabold text-[#06424B]">Final Coding Assignment</h3><p className="text-xs text-[#7B9093]">Course-wide practical assessment · 20 marks</p></div>
          </div>
          <span className={`${statusClass} ${codingSubmitted ? "bg-[#E7F4EE] text-[#28765E]" : allTopicsComplete ? "bg-[#FFF3D9] text-[#94650C]" : "bg-[#F0F3F3] text-[#829596]"}`}>{summary.coding?.status === "evaluated" ? "Evaluated" : codingSubmitted ? "Submitted" : allTopicsComplete ? "Unlocked" : "Locked"}</span>
        </div>
        <p className="mt-3 text-sm leading-6 text-[#60797D]">Solve a practical coding task using concepts covered throughout {course.name}, then submit your solution for evaluation.</p>
        {codingSubmitted ? (
          <div className="mt-4 rounded-xl border border-[#DCEAE4] bg-[#F6FAF8] p-4">
            <p className="text-sm font-bold text-[#28765E]">Coding assignment submitted successfully.</p>
            <p className="mt-1 text-xs text-[#6F8588]">Status: {summary.coding.status === "evaluated" ? `${summary.coding.score}/20 marks` : "Awaiting evaluator review"}</p>
            {summary.coding.feedback && <p className="mt-2 text-sm text-[#526D70]">{summary.coding.feedback}</p>}
          </div>
        ) : allTopicsComplete ? (
          <div className="mt-4 space-y-3">
            <p className="text-sm leading-6 text-[#60797D]">Your topic-wise concepts are complete. Open the coding workspace to solve a course-related problem, run the sample tests and submit your solution.</p>
            <Link
              to={`/student/course-coding-assignment?course=${encodeURIComponent(course.id)}`}
              className="inline-flex items-center gap-2 rounded-xl bg-[#06424B] px-5 py-3 text-xs font-extrabold text-white transition hover:bg-[#0B5962]"
            >
              Start Coding Assignment <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <p className="mt-4 rounded-xl bg-[#F4F6F5] px-4 py-3 text-xs font-semibold text-[#829295]">Complete all course topics and quizzes to unlock this assessment.</p>
        )}
      </Card>

      <Card className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF2F1] text-[#376C68]"><GraduationCap size={19} /></span>
            <div><h3 className="font-extrabold text-[#06424B]">Course Mega Project</h3><p className="text-xs text-[#7B9093]">Complete course implementation · 50 marks</p></div>
          </div>
          <span className={`${statusClass} ${projectSubmitted ? "bg-[#E7F4EE] text-[#28765E]" : codingSubmitted ? "bg-[#FFF3D9] text-[#94650C]" : "bg-[#F0F3F3] text-[#829596]"}`}>{summary.megaProject?.status === "evaluated" ? "Evaluated" : projectSubmitted ? "Submitted" : codingSubmitted ? "Unlocked" : "Locked"}</span>
        </div>
        <p className="mt-3 text-sm leading-6 text-[#60797D]">Build one project demonstrating the concepts learned across the complete {course.name} course.</p>
        {projectSubmitted ? (
          <div className="mt-4 rounded-xl border border-[#DCEAE4] bg-[#F6FAF8] p-4">
            <p className="text-sm font-bold text-[#28765E]">Mega project submitted successfully.</p>
            <a href={summary.megaProject.projectUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex break-all text-xs font-bold text-[#176A73] underline">{summary.megaProject.projectUrl}</a>
            <p className="mt-2 text-xs text-[#6F8588]">Status: {summary.megaProject.status === "evaluated" ? `${summary.megaProject.score}/50 marks` : "Awaiting evaluator review"}</p>
            {summary.megaProject.feedback && <p className="mt-2 text-sm text-[#526D70]">{summary.megaProject.feedback}</p>}
          </div>
        ) : codingSubmitted ? (
          <form onSubmit={submitProject} className="mt-4 space-y-3">
            <div><label className="mb-1.5 block text-xs font-bold text-[#506A6E]" htmlFor={`project-url-${course.id}`}>Project URL</label><input id={`project-url-${course.id}`} type="url" required value={projectUrl} onChange={(event) => setProjectUrl(event.target.value)} placeholder="https://github.com/your-project" className="w-full rounded-xl border border-[#DCE5E3] bg-white px-4 py-3 text-sm text-[#29494E] outline-none transition focus:border-[#B88A2C] focus:ring-2 focus:ring-[#EAD9AE]/50" /></div>
            <div><label className="mb-1.5 block text-xs font-bold text-[#506A6E]" htmlFor={`project-summary-${course.id}`}>Project description</label><textarea id={`project-summary-${course.id}`} rows={3} required value={projectSummary} onChange={(event) => setProjectSummary(event.target.value)} placeholder="Explain what you built and which course concepts you used..." className="w-full rounded-xl border border-[#DCE5E3] bg-white px-4 py-3 text-sm text-[#29494E] outline-none transition focus:border-[#B88A2C] focus:ring-2 focus:ring-[#EAD9AE]/50" /></div>
            <button type="submit" disabled={!projectUrl.trim() || !projectSummary.trim()} className="inline-flex items-center gap-2 rounded-xl bg-[#06424B] px-5 py-3 text-xs font-extrabold text-white transition hover:bg-[#0B5962] disabled:cursor-not-allowed disabled:opacity-50">Submit mega project <ArrowRight size={15} /></button>
          </form>
        ) : <p className="mt-4 rounded-xl bg-[#F4F6F5] px-4 py-3 text-xs font-semibold text-[#829295]">Submit your coding assignment first to unlock the mega project.</p>}
      </Card>
    </section>
  );
}

function ScoreTile({ label, score, total, detail }) {
  return <div className="rounded-2xl border border-[#E8ECEB] bg-white p-4"><p className="text-xs font-bold text-[#718589]">{label}</p><p className="mt-2 text-2xl font-extrabold text-[#06424B]">{score}<span className="text-sm text-[#829596]"> / {total}</span></p><p className="mt-1 text-[11px] text-[#829596]">{detail}</p></div>;
}

export default CourseAssessmentPanel;
