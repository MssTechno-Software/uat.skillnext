import { BarChart3, BookOpen, CheckCircle2, ClipboardCheck, Trophy } from "lucide-react";

import Sidebar from "../../components/Sidebar";
import StudentPageHeader from "../../components/student/StudentPageHeader";
import { Card, EmptyState, IconBadge, LinkButton, PageShell, ProgressBar, SectionHeading } from "../../components/student/ui";
import { courseCategories, technologies } from "../../data/studentLearningData";
import { useEnrolledCourses } from "../../data/studentCourseEnrollment";
import { courseProgress, useProgress } from "../../data/studentProgress";

function MyProgress() {
  const progress = useProgress();
  const { enrolledCourseIds } = useEnrolledCourses();
  const enrolledCourses = [
    ...courseCategories.filter((course) => course.type === "vocational" && enrolledCourseIds.includes(course.id)),
    ...technologies.filter((technology) => enrolledCourseIds.includes(technology.id)),
  ];
  const courseTotals = enrolledCourses.reduce((totals, course) => {
    const stats = courseProgress(progress, course);
    totals.done += stats.done;
    totals.total += stats.total;
    return totals;
  }, { done: 0, total: 0 });
  const attempts = progress.quizzes.length;
  const average = attempts
    ? Math.round(progress.quizzes.reduce((sum, item) => sum + (item.total ? item.score / item.total : 0), 0) / attempts * 100)
    : null;

  const metrics = [
    { label: "Topics completed", value: `${courseTotals.done}/${courseTotals.total}`, icon: CheckCircle2, tone: "teal" },
    { label: "Quizzes attempted", value: attempts, icon: ClipboardCheck, tone: "gold" },
    { label: "Average quiz score", value: average === null ? "—" : `${average}%`, icon: Trophy, tone: "teal" },
  ];

  return (
    <Sidebar>
      <PageShell max="max-w-[1300px]">
        <StudentPageHeader title="My Progress" subtitle="Track course completion, topic quizzes and final assessment results." />

        <div className="grid gap-4 sm:grid-cols-3">
          {metrics.map(({ label, value, icon, tone }) => (
            <Card key={label} className="p-5">
              <IconBadge icon={icon} tone={tone} />
              <p className="mt-4 text-[32px] font-extrabold leading-none text-[#06424B]">{value}</p>
              <p className="mt-2 text-sm font-semibold text-[#3F5C60]">{label}</p>
            </Card>
          ))}
        </div>

        <div className="mt-8 grid gap-5 xl:grid-cols-2">
          <Card className="p-5 sm:p-6">
            <SectionHeading title="Course progress" subtitle="Completion across your enrolled courses." />
            {enrolledCourses.length ? (
              <div className="space-y-5">
                {enrolledCourses.map((course) => {
                  const stats = courseProgress(progress, course);
                  return (
                    <div key={course.id}>
                      <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                        <span className="font-bold text-[#06424B]">{course.name}</span>
                        <span className="font-semibold text-[#4F6B6F]">{stats.done}/{stats.total} · {stats.percent}%</span>
                      </div>
                      <ProgressBar value={stats.percent} />
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState icon={BookOpen} title="No enrolled courses yet" text="Add a course from Explore Topics to start tracking your progress." action={<LinkButton to="/student/topics" variant="gold">Explore Courses</LinkButton>} />
            )}
          </Card>

          <Card className="p-5 sm:p-6">
            <SectionHeading title="Assessment history" subtitle="Your latest topic quiz and final assignment attempts." />
            {progress.quizzes.length ? (
              <ul className="divide-y divide-[#EAF1F0]">
                {progress.quizzes.slice(0, 8).map((attempt, index) => {
                  const pct = attempt.total ? Math.round((attempt.score / attempt.total) * 100) : 0;
                  return (
                    <li key={`${attempt.slug}-${attempt.date}-${index}`} className="flex items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-[#2F4A4E]">{attempt.title}</p>
                        <p className="text-xs text-[#6C8589]">{new Date(attempt.date).toLocaleString()}</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-3 py-1 text-sm font-extrabold ${pct >= 80 ? "bg-[#E1F2F0] text-[#06424B]" : "bg-[#FFEFC2] text-[#8A5700]"}`}>{pct}%</span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <EmptyState icon={BarChart3} tone="gold" title="No assessment history yet" text="Your quiz scores will be listed here after you take a topic quiz." action={<LinkButton to="/student/quizzes" variant="gold">Take a quiz</LinkButton>} />
            )}
          </Card>
        </div>

        <LinkButton to="/student/my-learning" icon={BookOpen} className="mt-6">Continue Learning</LinkButton>
        <p className="mt-4 text-xs text-[#6C8589]">Progress is stored in this browser until the Skill Next progress API is connected.</p>
      </PageShell>
    </Sidebar>
  );
}

export default MyProgress;
