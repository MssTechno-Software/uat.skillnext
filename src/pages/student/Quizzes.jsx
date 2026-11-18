import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  GraduationCap,
  LockKeyhole,
  PlayCircle,
  Target,
} from "lucide-react";

 
import StudentPageHeader from "../../components/student/StudentPageHeader";
import {
  Card,
  EmptyState,
  LinkButton,
  PageShell,
  ProgressBar,
  SectionHeading,
} from "../../components/student/ui";
import {
  courseCategories,
  myLearningCoursePath,
  technologies,
} from "../../data/studentLearningData";
import { useEnrolledCourses } from "../../data/studentCourseEnrollment";
import {
  bestScore,
  courseProgress,
  hasReadLesson,
  technologyProgress,
  useProgress,
} from "../../data/studentProgress";
import {
  getFinalAssignmentForCourse,
  getQuizForCourseModule,
  getQuizForTopic,
} from "../../data/quizData";

const tabs = [
  { id: "quizzes", label: "Topic Quizzes", icon: ClipboardCheck },
  { id: "assignments", label: "Final Assignments", icon: FileCheck2 },
];

function StatusPill({ status }) {
  const styles = {
    Completed: "bg-[#E7F4EE] text-[#28765E]",
    Available: "bg-[#E8F3F1] text-[#0B6268]",
    "Read lesson": "bg-[#FFF4D9] text-[#94650C]",
    Unlocked: "bg-[#FFF4D9] text-[#94650C]",
    Locked: "bg-[#F0F3F3] text-[#829596]",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-extrabold ${styles[status] || styles.Locked}`}>
      {status}
    </span>
  );
}

function AssessmentAction({ status, lessonPath, quizPath }) {
  if (status === "Completed") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#28765E]">
        <CheckCircle2 size={14} /> Completed
      </span>
    );
  }
  if (status === "Available") {
    return (
      <Link
        to={quizPath}
        className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg bg-[#FFAB0B] px-3.5 py-2 text-[11px] font-extrabold text-[#06424B] transition hover:bg-[#FFC13C]"
      >
        <PlayCircle size={14} /> Start quiz
      </Link>
    );
  }
  if (status === "Read lesson") {
    return (
      <Link
        to={lessonPath}
        className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-[#D7E3E1] bg-white px-3.5 py-2 text-[11px] font-bold text-[#06424B] transition hover:border-[#06424B] hover:bg-[#F5F9F8]"
      >
        <BookOpen size={14} /> Open lesson
      </Link>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#91A1A2]">
      <LockKeyhole size={13} /> Previous topic required
    </span>
  );
}

function TopicQuizRow({ courseId, unit, index, previousUnit, progress, quiz, isLast }) {
  const completed = Boolean(progress.completed?.[`${courseId}/${unit.id}`]);
  const previousCompleted = !previousUnit || Boolean(progress.completed?.[`${courseId}/${previousUnit.id}`]);
  const lessonRead = hasReadLesson(progress, courseId, unit.id);
  const status = completed
    ? "Completed"
    : !previousCompleted
      ? "Locked"
      : lessonRead
        ? "Available"
        : "Read lesson";
  const score = quiz ? bestScore(progress, quiz.slug) : null;
  const lessonPath = `/student/topics/${courseId}/topic/${unit.id}`;

  return (
    <div className="grid gap-3 border-b border-[#EAF0EE] py-4 last:border-b-0 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
      <div className="flex min-w-0 items-start gap-3">
        <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold ${completed ? "bg-[#E7F4EE] text-[#28765E]" : "bg-[#EEF4F3] text-[#06424B]"}`}>
          {completed ? <CheckCircle2 size={16} /> : index + 1}
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-bold text-[#06424B]">{unit.title}</h4>
            <StatusPill status={status} />
          </div>
          <p className="mt-1 text-xs leading-5 text-[#718486]">
            {quiz?.questions?.length || 10}-question topic quiz
            {score !== null ? ` · Best score ${score}%` : " · Lesson content required first"}
          </p>
          {status === "Locked" && (
            <p className="mt-1 text-[10px] text-[#91A1A2]">Complete the previous topic quiz to unlock this topic.</p>
          )}
          {isLast && <p className="mt-1 text-[10px] text-[#91A1A2]">Last topic in this course sequence.</p>}
        </div>
      </div>
      <div className="md:pl-4">
        <AssessmentAction
          status={status}
          lessonPath={lessonPath}
          quizPath={quiz ? `/student/quiz/${quiz.slug}` : "#"}
        />
      </div>
    </div>
  );
}

function VocationalQuizList({ course, progress }) {
  return (
    <div className="divide-y-0">
      {course.modules.map((module, index) => (
        <TopicQuizRow
          key={module.id}
          courseId={course.id}
          unit={module}
          index={index}
          previousUnit={course.modules[index - 1]}
          progress={progress}
          quiz={getQuizForCourseModule(course.id, module.id)}
          isLast={index === course.modules.length - 1}
        />
      ))}
    </div>
  );
}

function TechnologyQuizList({ technology, progress }) {
  return (
    <div className="rounded-xl border border-[#E8EFED] bg-[#FBFCFC] px-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EAF0EE] py-3">
        <div>
          <h4 className="text-sm font-extrabold text-[#06424B]">{technology.name}</h4>
          <p className="mt-0.5 text-[10px] text-[#829596]">{technology.topics.length} topic quizzes</p>
        </div>
        <span className="text-[10px] font-bold text-[#829596]">IT learning path</span>
      </div>
      {technology.topics.map((topic, index) => (
        <TopicQuizRow
          key={topic.id}
          courseId={technology.id}
          unit={topic}
          index={index}
          previousUnit={technology.topics[index - 1]}
          progress={progress}
          quiz={getQuizForTopic(technology.id, topic.id)}
          isLast={index === technology.topics.length - 1}
        />
      ))}
    </div>
  );
}

function CourseQuizCard({ course, progress }) {
  const isIT = course.type === "technology-track";
  const stats = isIT ? technologyProgress(progress, course) : courseProgress(progress, course);
  const totalTopicQuizzes = stats.total;
  const completedTopicQuizzes = stats.done;

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#EAF3F2] text-[#06424B]">
            {isIT ? <GraduationCap size={21} /> : <BookOpen size={21} />}
          </span>
          <div className="min-w-0">
            <p className="text-[9px] font-extrabold tracking-[1.25px] text-[#B07A06]">{course.category.toUpperCase()}</p>
            <h3 className="mt-1 text-lg font-extrabold text-[#06424B]">{course.name}</h3>
            <p className="mt-1 text-xs text-[#718486]">{completedTopicQuizzes} of {totalTopicQuizzes} topic quizzes completed</p>
          </div>
        </div>
        <LinkButton to={isIT ? myLearningCoursePath(null, course.id) : myLearningCoursePath(course.id)} variant="outline" iconRight={ArrowRight}>
          Open course
        </LinkButton>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between text-[10px] font-bold text-[#718486]">
          <span>Topic quiz progress</span>
          <span className="text-[#06424B]">{totalTopicQuizzes ? Math.round((completedTopicQuizzes / totalTopicQuizzes) * 100) : 0}%</span>
        </div>
        <ProgressBar value={totalTopicQuizzes ? (completedTopicQuizzes / totalTopicQuizzes) * 100 : 0} />
      </div>

      {isIT ? (
        <div className="mt-5 space-y-4">
          <SectionHeading title="Technology topic quizzes" subtitle="Each quiz is linked to its own lesson. Read the lesson first; later topics unlock in order." />
          <TechnologyQuizList technology={course} progress={progress} />
        </div>
      ) : (
        <div className="mt-5">
          <SectionHeading title="Course topic quizzes" subtitle="Open a lesson to read its web content. Its 10-question quiz becomes available after you mark the lesson as read." />
          <VocationalQuizList course={course} progress={progress} />
        </div>
      )}
    </Card>
  );
}

function CourseFinalAssignmentCard({ course, progress }) {
  const stats = course.type === "technology-track"
    ? technologyProgress(progress, course)
    : courseProgress(progress, course);
  const assignment = getFinalAssignmentForCourse(course.id);
  const completed = Boolean(progress.completedCourses?.[course.id]);
  const unlocked = stats.total > 0 && stats.done === stats.total;
  const score = assignment ? bestScore(progress, assignment.slug) : null;

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] ${completed ? "bg-[#E7F4EE] text-[#28765E]" : unlocked ? "bg-[#FFF4D9] text-[#94650C]" : "bg-[#F0F3F3] text-[#829596]"}`}>
            {completed ? <CheckCircle2 size={21} /> : unlocked ? <Target size={21} /> : <LockKeyhole size={21} />}
          </span>
          <div>
            <p className="text-[9px] font-extrabold tracking-[1.2px] text-[#B07A06]">FINAL COURSE ASSESSMENT</p>
            <h3 className="mt-1 text-base font-extrabold text-[#06424B]">{course.name} – Final Assignment</h3>
            <p className="mt-1 text-xs text-[#718486]">15 questions · 80% pass requirement</p>
          </div>
        </div>
        <StatusPill status={completed ? "Completed" : unlocked ? "Unlocked" : "Locked"} />
      </div>

      <p className="mt-4 text-xs leading-6 text-[#627C7F]">
        This assignment checks learning across the full course. It becomes available only after every topic quiz is completed. You need at least 12 correct answers out of 15 to complete the course and earn its certificate.
      </p>
      {score !== null && !completed && (
        <p className="mt-2 text-xs font-bold text-[#94650C]">Best previous attempt: {score}% · {score >= 80 ? "Requirement met" : "80% still required"}</p>
      )}
      {completed ? (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#EAF5EF] px-3 py-3 text-xs font-bold text-[#28765E]">
          <CheckCircle2 size={15} /> Assignment completed. Your certificate is available in Certificates.
        </div>
      ) : unlocked && assignment ? (
        <Link
          to={`/student/quiz/${assignment.slug}`}
          className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#FFAB0B] px-4 py-2.5 text-xs font-extrabold text-[#06424B] transition hover:bg-[#FFC13C]"
        >
          <FileCheck2 size={15} /> {score !== null ? "Retry final assignment" : "Start final assignment"}
        </Link>
      ) : (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#F2F5F5] px-3 py-3 text-xs font-semibold text-[#829596]">
          <LockKeyhole size={14} /> {stats.done} of {stats.total} topic quizzes completed. Finish all topics to unlock this assignment.
        </div>
      )}
    </Card>
  );
}

function Quizzes() {
  const [activeTab, setActiveTab] = useState("quizzes");
  const { enrolledCourseIds } = useEnrolledCourses();
  const progress = useProgress();
  const enrolledCourses = useMemo(() => {
    const vocationalCourses = courseCategories.filter(
      (course) => course.type === "vocational" && enrolledCourseIds.includes(course.id)
    );
    const technologyCourses = technologies
      .filter((technology) => enrolledCourseIds.includes(technology.id))
      .map((technology) => ({ ...technology, type: "technology-track" }));
    return [...vocationalCourses, ...technologyCourses];
  }, [enrolledCourseIds]);

  const summary = useMemo(() => {
    const topicQuizCount = enrolledCourses.reduce((sum, course) => {
      return sum + (course.type === "technology-track" ? course.topics.length : course.modules.length);
    }, 0);
    const completedCount = enrolledCourses.reduce((sum, course) => {
      const stats = course.type === "technology-track"
        ? technologyProgress(progress, course)
        : courseProgress(progress, course);
      return sum + stats.done;
    }, 0);
    const assignmentCount = enrolledCourses.filter((course) => Boolean(getFinalAssignmentForCourse(course.id))).length;
    const completedAssignments = enrolledCourses.filter((course) => Boolean(progress.completedCourses?.[course.id])).length;
    return { topicQuizCount, completedCount, assignmentCount, completedAssignments };
  }, [enrolledCourses, progress]);

  return (
    
      <PageShell>
        <div className="mx-auto w-full max-w-[1250px]">
          <StudentPageHeader
            title="Quizzes & Assignments"
            subtitle="Track every course assessment in one place. Topic quizzes stay connected to their lessons, and final assignments unlock after all topics are completed."
          />

          {enrolledCourses.length === 0 ? (
            <Card className="mt-5 p-6 sm:p-9">
              <EmptyState
                icon={ClipboardCheck}
                title="Your assessments will appear here"
                text="Enroll in a course first. Its topic quizzes and final assignment will then appear here with their individual locked, available and completed status."
                action={<LinkButton to="/student/topics" variant="gold" icon={BookOpen}>Explore Courses</LinkButton>}
              />
            </Card>
          ) : (
            <>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <Card className="p-4">
                  <p className="text-[10px] font-bold tracking-wide text-[#829596]">TOPIC QUIZZES</p>
                  <p className="mt-1 text-2xl font-extrabold text-[#06424B]">{summary.topicQuizCount}</p>
                  <p className="mt-1 text-[10px] text-[#829596]">Across enrolled courses</p>
                </Card>
                <Card className="p-4">
                  <p className="text-[10px] font-bold tracking-wide text-[#829596]">QUIZZES COMPLETED</p>
                  <p className="mt-1 text-2xl font-extrabold text-[#28765E]">{summary.completedCount}</p>
                  <p className="mt-1 text-[10px] text-[#829596]">10 questions per topic</p>
                </Card>
                <Card className="p-4">
                  <p className="text-[10px] font-bold tracking-wide text-[#829596]">FINAL ASSIGNMENTS</p>
                  <p className="mt-1 text-2xl font-extrabold text-[#06424B]">{summary.completedAssignments} / {summary.assignmentCount}</p>
                  <p className="mt-1 text-[10px] text-[#829596]">Completed courses</p>
                </Card>
              </div>

              <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
                <SectionHeading
                  title="Your course assessments"
                  subtitle="Only assessments for courses you have enrolled in are listed below."
                />
                <div className="inline-flex rounded-xl border border-[#DCE6E5] bg-white p-1 shadow-sm">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const active = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`inline-flex min-h-9 items-center gap-2 rounded-lg px-3 py-2 text-[11px] font-extrabold transition ${active ? "bg-[#06424B] text-white" : "text-[#607A7D] hover:bg-[#F1F6F5]"}`}
                      >
                        <Icon size={14} /> {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="mt-4 space-y-5">
                {activeTab === "quizzes" ? (
                  enrolledCourses.map((course) => (
                    <CourseQuizCard key={course.id} course={course} progress={progress} />
                  ))
                ) : (
                  enrolledCourses.map((course) => (
                    <CourseFinalAssignmentCard key={course.id} course={course} progress={progress} />
                  ))
                )}
              </div>
            </>
          )}

          <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-[#DCE6E5] pt-5">
            <p className="text-xs text-[#829596]">Assessments remain course-specific and follow your lesson completion.</p>
            <LinkButton to="/student/my-learning" variant="outline" icon={BookOpen}>Go to My Learning</LinkButton>
          </div>
        </div>
      </PageShell>
    
  );
}

export default Quizzes;
