import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, CircleAlert, RefreshCw } from "lucide-react";

import StudentPageHeader from "../../components/student/StudentPageHeader";
import { Card, PageShell } from "../../components/student/ui";
import Loader from "../../components/Loader";
import { getMyLearnings } from "../../api/course.api";

const unwrapCourseList = (response) => {
  if (!response || response.success === false) {
    throw new Error(response?.message || "Your learning progress could not be loaded.");
  }
  const data = response.data ?? response;
  if (!Array.isArray(data)) throw new Error("The My Learnings API did not return a course list.");
  return data.filter((entry) => entry?.course?.id !== undefined && entry?.course?.id !== null);
};

const getApiProgress = (entry) => {
  const completed = Number(entry?.completedItems);
  const total = Number(entry?.totalItems);
  const hasCounts = Number.isFinite(completed) && Number.isFinite(total) && total > 0;
  const rawPercentage = entry?.percentage;
  const hasPercentage = rawPercentage !== undefined && rawPercentage !== null && String(rawPercentage).trim() !== "";
  const percentage = hasCounts
    ? Math.min(100, Math.max(0, Math.round((completed / total) * 100)))
    : hasPercentage
      ? Math.min(100, Math.max(0, Math.round(Number(String(rawPercentage).replace("%", "")) || 0)))
      : null;
  return { completed: hasCounts ? completed : null, total: hasCounts ? total : null, percentage };
};

function MyProgress() {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProgress = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      setCourses(unwrapCourseList(await getMyLearnings()));
    } catch (error) {
      console.error("My Progress API Error:", error);
      const message = error?.response?.data?.detail || error?.response?.data?.message || error?.message;
      setError(typeof message === "string" ? message : "We couldn't load your progress. Please try again.");
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadProgress(); }, [loadProgress]);

  const totals = useMemo(() => {
    const rows = courses.map((entry) => getApiProgress(entry));
    const countable = rows.filter((row) => row.completed !== null && row.total !== null);
    const completed = countable.reduce((sum, row) => sum + row.completed, 0);
    const total = countable.reduce((sum, row) => sum + row.total, 0);
    const percentageRows = rows.filter((row) => row.percentage !== null);
    const average = percentageRows.length
      ? Math.round(percentageRows.reduce((sum, row) => sum + row.percentage, 0) / percentageRows.length)
      : null;
    return { completed, total, percentage: total > 0 ? Math.round((completed / total) * 100) : average };
  }, [courses]);

  if (isLoading) return <PageShell><Loader open={isLoading} text="Loading your progress from Skill Next..." /></PageShell>;

  return (
    <PageShell>
      <div className="mx-auto w-full max-w-[1250px]">
        <StudentPageHeader title="My Progress" subtitle="Course progress reported by the Skill Next learning API." />
        {error ? (
          <Card className="p-8 text-center">
            <CircleAlert size={28} className="mx-auto text-[#94650C]" />
            <h2 className="mt-3 text-lg font-extrabold text-[#06424B]">Unable to load progress</h2>
            <p className="mt-2 text-sm text-[#718486]">{error}</p>
            <button type="button" onClick={loadProgress} className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-[#FFAB0B] px-4 text-sm font-bold text-[#06424B]"><RefreshCw size={14} /> Try Again</button>
          </Card>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <Card className="p-5"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF3F4] text-[#06424B]"><BookOpen size={19} /></span><div><p className="text-xs font-semibold text-[#789094]">Enrolled courses</p><p className="text-2xl font-extrabold tabular-nums text-[#06424B]">{courses.length}</p></div></div></Card>
              <Card className="p-5"><p className="text-xs font-semibold text-[#789094]">Learning items completed</p><p className="mt-2 text-2xl font-extrabold tabular-nums text-[#06424B]">{totals.total > 0 ? `${totals.completed} / ${totals.total}` : "—"}</p></Card>
              <Card className="p-5"><p className="text-xs font-semibold text-[#789094]">Overall course progress</p><p className="mt-2 text-2xl font-extrabold tabular-nums text-[#06424B]">{totals.percentage === null ? "—" : `${totals.percentage}%`}</p></Card>
            </div>

            <div className="mt-8 flex flex-wrap items-end justify-between gap-3">
              <div><h2 className="text-xl font-extrabold text-[#06424B]">Course progress</h2><p className="mt-1 text-sm text-[#789094]">Values below are read from the My Learnings API response.</p></div>
              <button type="button" onClick={loadProgress} className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#DCE6E4] bg-white px-3 text-xs font-bold text-[#06424B] hover:bg-[#F4F7F7]"><RefreshCw size={13} /> Refresh</button>
            </div>

            {courses.length === 0 ? (
              <Card className="mt-4 p-8 text-center"><p className="text-sm text-[#718486]">The My Learnings API returned no enrolled courses.</p><Link to="/student/topics" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#06424B] !no-underline">Explore Courses <ArrowRight size={15} /></Link></Card>
            ) : (
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                {courses.map((entry) => {
                  const course = entry.course;
                  const progress = getApiProgress(entry);
                  return (
                    <Card key={course.id} className="p-5 sm:p-6">
                      <div className="flex items-start justify-between gap-4"><div className="min-w-0"><p className="text-[10px] font-extrabold uppercase tracking-wider text-[#A87916]">{course.shortName || "COURSE"}</p><h3 className="mt-1 text-base font-extrabold text-[#06424B]">{course.fullName || course.shortName || `Course ${course.id}`}</h3></div><span className="rounded-full bg-[#FFF3D8] px-3 py-1 text-xs font-extrabold text-[#94650C]">{progress.percentage === null ? "Not reported" : `${progress.percentage}%`}</span></div>
                      {progress.percentage !== null && <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#E5ECEB]"><div className="h-full rounded-full bg-[#FFAB0B] transition-all" style={{ width: `${progress.percentage}%` }} /></div>}
                      <div className="mt-3 flex items-center justify-between text-xs font-semibold text-[#718486]"><span>{progress.completed === null ? "Completion count not provided by API" : `${progress.completed} learning items completed`}</span><span>{progress.total === null ? "—" : `${progress.total} total`}</span></div>
                      <Link to={`/student/my-learning?course=${encodeURIComponent(course.id)}`} className="mt-5 inline-flex h-10 w-full items-center justify-between rounded-xl bg-[#06424B] px-4 text-xs font-extrabold text-white !no-underline hover:bg-[#0A515C]">Continue Learning <ArrowRight size={15} className="text-[#FFAB0B]" /></Link>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </PageShell>
  );
}

export default MyProgress;
