import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Compass,
  GraduationCap,
  LockKeyhole,
  PlayCircle,
  Target,
  Trash2,
  X,
} from "lucide-react";

import Sidebar from "../../components/Sidebar";
import StudentPageHeader from "../../components/student/StudentPageHeader";
import {
  BackLink,
  Card,
  EmptyState,
  Hero,
  IconBadge,
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
  useProgress,
} from "../../data/studentProgress";
import {
  getFinalAssignmentForCourse,
  getQuizForCourseModule,
  getQuizForTopic,
} from "../../data/quizData";

function EnrolledCourseList({ courses, progress, onRemoveCourse }) {
  const [coursePendingRemoval, setCoursePendingRemoval] = useState(null);

  return (
    <>
      <StudentPageHeader
        title="My Learning"
        subtitle="Your enrolled courses, topics, lessons and assessment progress."
      />

      {courses.length === 0 ? (
        <Card className="p-6 sm:p-9">
          <EmptyState
            icon={BookOpen}
            title="Your learning space is ready"
            text="Explore the available courses, review a course overview and add the courses you want to study. Every course you add will appear here."
            action={
              <LinkButton to="/student/topics" variant="gold" icon={Compass}>
                Explore Courses
              </LinkButton>
            }
          />
        </Card>
      ) : (
        <>
          <SectionHeading
            title="Your enrolled courses"
            subtitle="Open a course to continue its topics, lesson content and assessments. Your learning stays inside My Learning."
          />
          <div className="grid gap-4 lg:grid-cols-2">
            {courses.map((course) => {
              const isTechnologyTrack = course.enrollmentKind === "technology";
              const courseStats = courseProgress(progress, course);
              const itemCount = isTechnologyTrack ? course.topics.length : course.modules.length;
              const itemLabel = isTechnologyTrack ? "topics" : "topics";
              const coursePath = isTechnologyTrack
                ? myLearningCoursePath(null, course.id)
                : myLearningCoursePath(course.id);

              return (
                <Card key={course.id} className="flex flex-col p-6">
                  <div className="flex items-start gap-4">
                    <IconBadge
                      icon={isTechnologyTrack ? GraduationCap : BookOpen}
                      tone={course.accent === "gold" ? "gold" : "teal"}
                      size="lg"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-extrabold tracking-[1.3px] text-[#B07A06]">
                        {course.category.toUpperCase()}
                      </p>
                      <h3 className="mt-1 text-xl font-bold text-[#06424B]">
                        {course.name}
                      </h3>
                      <p className="mt-1 text-[13px] text-[#5A7478]">
                        {itemCount} {itemLabel}
                      </p>
                    </div>
                    <div
                      className="relative flex h-12 w-12 shrink-0 items-center justify-center"
                      role="progressbar"
                      aria-label="Course progress"
                      aria-valuenow={courseStats.percent}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <svg
                        className="h-12 w-12 -rotate-90"
                        viewBox="0 0 48 48"
                      >
                        {/* Background Circle */}
                        <circle
                          cx="24"
                          cy="24"
                          r="20"
                          fill="none"
                          stroke="#E7EEEE"
                          strokeWidth="4"
                        />

                        {/* Gold Progress Circle */}
                        <circle
                          cx="24"
                          cy="24"
                          r="20"
                          fill="none"
                          stroke="#FFAB0B"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeDasharray={2 * Math.PI * 20}
                          strokeDashoffset={
                            2 * Math.PI * 20 * (1 - courseStats.percent / 100)
                          }
                          className="transition-all duration-500 ease-in-out"
                        />
                      </svg>

                      {/* Progress Percentage */}
                      <span className="absolute text-[11px] font-extrabold text-[#06424B]">
                        {courseStats.percent}%
                      </span>
                    </div>
                  </div>

                  <p className="mt-4 min-h-[48px] text-sm leading-6 text-[#627C7F]">
                    {course.description}
                  </p>
                  <ProgressBar value={courseStats.percent} className="mt-4" />
                  <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-[#829596]">
                    <span>
                      {courseStats.done} / {courseStats.total} topics completed
                    </span>
                    <span>
                      {courseStats.completed ? "Course completed" : "In progress"}
                    </span>
                  </div>

                  <div className="mt-auto flex flex-wrap gap-3 pt-5">
                    <LinkButton
                      to={coursePath}
                      icon={PlayCircle}
                    >
                      {courseStats.done > 0 ? "Continue Learning" : "Open Course"}
                    </LinkButton>
                    <LinkButton
                      to={coursePath}
                      variant="outline"
                      iconRight={ArrowRight}
                    >
                      View Topics
                    </LinkButton>
                    <button
                      type="button"
                      onClick={() => setCoursePendingRemoval(course)}
                      className="inline-flex items-center gap-2 rounded-xl border border-[#E7D9D7] bg-white px-4 py-2.5 text-xs font-bold text-[#8B514B] transition hover:border-[#C98E86] hover:bg-[#FFF8F7] focus:outline-none focus:ring-2 focus:ring-[#C98E86]/30"
                    >
                      <Trash2 size={14} /> Remove course
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
          <p className="mt-6 text-sm text-[#5A7478]">
            Want to learn something new?{" "}
            <Link
              to="/student/topics"
              className="font-bold !text-[#06424B] underline decoration-[#FFAB0B] decoration-2 underline-offset-4"
            >
              Explore more courses
            </Link>
          </p>
        </>
      )}

      {coursePendingRemoval && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-[#102F33]/55 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setCoursePendingRemoval(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="remove-course-title"
            aria-describedby="remove-course-description"
            className="w-full max-w-[440px] rounded-[24px] border border-white/70 bg-white p-6 shadow-[0_24px_80px_rgba(6,44,49,0.28)] sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF1EE] text-[#A85A50]">
                <AlertTriangle size={22} />
              </div>
              <button
                type="button"
                onClick={() => setCoursePendingRemoval(null)}
                aria-label="Close confirmation"
                className="flex h-9 w-9 items-center justify-center rounded-xl text-[#73898B] transition hover:bg-[#F2F5F5] hover:text-[#06424B]"
              >
                <X size={18} />
              </button>
            </div>
            <h2 id="remove-course-title" className="mt-5 text-xl font-extrabold text-[#123B43]">Remove this course?</h2>
            <p id="remove-course-description" className="mt-2 text-sm leading-7 text-[#5A7478]">
              <span className="font-bold text-[#06424B]">{coursePendingRemoval.name}</span> will be removed from your My Learning list. Your saved lesson and quiz progress will remain available if you enrol in this course again.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setCoursePendingRemoval(null)}
                className="rounded-xl border border-[#DCE6E4] bg-white px-5 py-3 text-sm font-bold text-[#456367] transition hover:bg-[#F6F8F8]"
              >
                Keep course
              </button>
              <button
                type="button"
                onClick={() => {
                  onRemoveCourse(coursePendingRemoval.id);
                  setCoursePendingRemoval(null);
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#8B514B] px-5 py-3 text-sm font-bold text-white shadow-[0_8px_18px_rgba(139,81,75,0.18)] transition hover:bg-[#75413C]"
              >
                <Trash2 size={15} /> Remove course
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function FinalAssignmentCard({ course, progress, allTopicsComplete }) {
  const finalAssignment = getFinalAssignmentForCourse(course.id);
  const finalScore = finalAssignment
    ? bestScore(progress, finalAssignment.slug)
    : null;
  const completed = Boolean(progress.completedCourses?.[course.id]);

  return (
    <Card className={`p-5 ${completed ? "border-[#B9DED2] bg-[#F3FAF7]" : allTopicsComplete ? "border-[#F3D78B] bg-[#FFF9EA]" : ""}`}>
      <div className="flex flex-wrap items-center gap-2 text-[#06424B]">
        {completed ? (
          <CheckCircle2 size={19} className="text-[#28765E]" />
        ) : allTopicsComplete ? (
          <Target size={19} className="text-[#B07A06]" />
        ) : (
          <LockKeyhole size={19} className="text-[#8B9A9C]" />
        )}
        <h3 className="text-base font-extrabold">Final Assignment</h3>
        <span className={`ml-auto rounded-full px-2.5 py-1 text-[10px] font-extrabold ${completed
            ? "bg-[#E1F2EC] text-[#28765E]"
            : allTopicsComplete
              ? "bg-[#FFF1D1] text-[#94650C]"
              : "bg-[#F0F3F3] text-[#829596]"
          }`}>
          {completed ? "Completed" : allTopicsComplete ? "Unlocked" : "Locked"}
        </span>
      </div>
      <p className="mt-2 text-[13px] leading-6 text-[#5A7478]">
        Complete the 15-question final assignment after finishing every topic. A score of 80% (12 correct answers) is required to complete the course and earn its certificate.
      </p>
      {finalScore !== null && (
        <p className="mt-2 text-xs font-bold text-[#06424B]">
          Best attempt: {finalScore}%
        </p>
      )}
      {completed ? (
        <p className="mt-4 rounded-xl bg-white px-3 py-2.5 text-xs font-bold text-[#28765E]">
          Course completed. Your certificate is available in Certificates.
        </p>
      ) : allTopicsComplete && finalAssignment ? (
        <LinkButton
          to={`/student/quiz/${finalAssignment.slug}`}
          variant="gold"
          className="mt-4 w-full"
          icon={ClipboardCheck}
        >
          {finalScore !== null ? "Retake / Review Final Assignment" : "Start Final Assignment"}
        </LinkButton>
      ) : (
        <p className="mt-4 rounded-xl bg-[#F2F5F5] px-3 py-2.5 text-xs font-semibold leading-5 text-[#72888B]">
          Finish all topic lessons and submit each 10-question topic quiz to unlock the final assignment. Topic quiz scores do not affect progression.
        </p>
      )}
    </Card>
  );
}

function VocationalCourseWorkspace({ course, progress }) {
  const stats = courseProgress(progress, course);
  const allTopicsComplete = stats.total > 0 && stats.done === stats.total;
  const nextAvailable = course.modules.find((module, index) => {
    const alreadyCompleted = Boolean(progress.completed[`${course.id}/${module.id}`]);
    const previous = course.modules[index - 1];
    const previousCompleted = !previous || Boolean(progress.completed[`${course.id}/${previous.id}`]);
    return !alreadyCompleted && previousCompleted;
  });

  return (
    <>
      <StudentPageHeader
        title={course.name}
        subtitle="Your enrolled course workspace. Continue every topic, lesson and quiz here in My Learning."
      />
      <BackLink to="/student/my-learning">Back to My Learning</BackLink>

      <Hero
        eyebrow="YOUR ENROLLED COURSE"
        title={`Continue ${course.name}`}
        text={`${course.description} Work through each topic in order. After every topic lesson, answer its 10-question quiz; your score does not block the next topic.`}
      >
        <span className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white">
          <BookOpen size={15} className="text-[#FFAB0B]" />
          {course.duration}
        </span>
        {nextAvailable && (
          <LinkButton
            to={`/student/topics/${course.id}/topic/${nextAvailable.id}`}
            variant="gold"
            icon={PlayCircle}
          >
            Continue Lesson
          </LinkButton>
        )}
      </Hero>

      <div className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section>
          <SectionHeading
            title="Course topics"
            subtitle="Open the first topic to begin. The next topic unlocks automatically after all 10 questions in the previous topic quiz are submitted, regardless of score."
          />
          <div className="space-y-3">
            {course.modules.map((module, index) => {
              const previous = course.modules[index - 1];
              const unlocked = !previous || Boolean(progress.completed[`${course.id}/${previous.id}`]);
              const done = Boolean(progress.completed[`${course.id}/${module.id}`]);
              const quiz = getQuizForCourseModule(course.id, module.id);
              const score = quiz ? bestScore(progress, quiz.slug) : null;
              const lessonRead = hasReadLesson(progress, course.id, module.id) || done;

              return (
                <Card
                  key={module.id}
                  className={`p-5 sm:p-6 ${done ? "border-[#A8D9CB] bg-[#F5FBF9]" : ""}`}
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex min-w-0 items-start gap-4">
                      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-extrabold ${done ? "bg-[#06424B] text-[#FFAB0B]" : "bg-[#FFF1D1] text-[#94650C]"}`}>
                        {done ? <CheckCircle2 size={22} /> : String(index + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-extrabold text-[#06424B]">{module.title}</h3>
                          {done ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#E1F2EC] px-2.5 py-1 text-[10px] font-bold text-[#28765E]">
                              <CheckCircle2 size={11} /> Quiz completed
                            </span>
                          ) : !unlocked ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#F0F3F3] px-2.5 py-1 text-[10px] font-bold text-[#829596]">
                              <LockKeyhole size={11} /> Locked · Previous quiz required
                            </span>
                          ) : lessonRead ? (
                            <span className="rounded-full bg-[#EAF4F2] px-2.5 py-1 text-[10px] font-bold text-[#376C68]">Quiz available in lesson</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF5DF] px-2.5 py-1 text-[10px] font-bold text-[#8A650E]">
                              <LockKeyhole size={11} /> Read lesson to unlock quiz
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm leading-6 text-[#5A7478]">{module.description}</p>
                        <p className="mt-2 text-[11px] font-semibold text-[#829596]">
                          Lesson content · 10-question topic quiz{score !== null ? ` · Best score ${score}%` : ""}
                        </p>
                      </div>
                    </div>
                    {unlocked ? (
                      <LinkButton
                        to={`/student/topics/${course.id}/topic/${module.id}`}
                        iconRight={ChevronRight}
                        className="self-start sm:self-center"
                      >
                        {done ? "Review Lesson" : "Open Lesson"}
                      </LinkButton>
                    ) : (
                      <span className="inline-flex items-center gap-2 self-start rounded-xl bg-[#F2F5F5] px-3 py-2.5 text-xs font-bold text-[#8A9B9D] sm:self-center">
                        <LockKeyhole size={14} /> Complete previous quiz
                      </span>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        <aside className="space-y-4 xl:sticky xl:top-6 xl:h-fit">
          <Card className="p-5">
            <h3 className="text-base font-extrabold text-[#06424B]">Course progress</h3>
            <p className="mt-3 text-4xl font-extrabold text-[#06424B]">{stats.percent}%</p>
            <ProgressBar value={stats.percent} className="mt-3" />
            <p className="mt-2 text-xs text-[#5A7478]">{stats.done} of {stats.total} topics completed</p>
          </Card>
          <FinalAssignmentCard
            course={course}
            progress={progress}
            allTopicsComplete={allTopicsComplete}
          />
        </aside>
      </div>
    </>
  );
}

function TechnologyPathWorkspace({ technology, progress }) {
  const stats = courseProgress(progress, technology);
  const allTopicsComplete = stats.total > 0 && stats.done === stats.total;
  const nextAvailable = technology.topics.find((topic, index) => {
    const alreadyCompleted = Boolean(progress.completed[`${technology.id}/${topic.id}`]);
    const previous = technology.topics[index - 1];
    const previousCompleted = !previous || Boolean(progress.completed[`${technology.id}/${previous.id}`]);
    return !alreadyCompleted && previousCompleted;
  });

  return (
    <>
      <StudentPageHeader
        title={technology.name}
        subtitle={`Your individual ${technology.name} course workspace. Topics, lessons, quizzes and its final assignment stay together here in My Learning.`}
      />
      <BackLink to="/student/my-learning">Back to My Learning</BackLink>
      <Hero
        eyebrow="YOUR ENROLLED IT COURSE"
        title={`Continue ${technology.name}`}
        text={`${technology.description} Study each topic in order. After reading its lesson content, complete the 10-question topic quiz. Every topic quiz has no pass mark; the 80% requirement applies only to the final assignment.`}
      >
        <span className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white">
          <GraduationCap size={15} className="text-[#FFAB0B]" />
          {technology.topics.length} topics · {technology.lessons} lessons
        </span>
        {nextAvailable && (
          <LinkButton
            to={`/student/topics/${technology.id}/topic/${nextAvailable.id}`}
            variant="gold"
            icon={PlayCircle}
          >
            Continue Learning
          </LinkButton>
        )}
      </Hero>

      <div className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section>
          <SectionHeading
            title="Topics and lessons"
            subtitle="Open a topic to study its web content. Mark it as read to unlock its 10-question quiz; submit all answers to unlock the next topic, regardless of score."
          />
          <div className="space-y-3">
            {technology.topics.map((topic, index) => {
              const previous = technology.topics[index - 1];
              const unlocked = !previous || Boolean(progress.completed[`${technology.id}/${previous.id}`]);
              const done = Boolean(progress.completed[`${technology.id}/${topic.id}`]);
              const quiz = getQuizForTopic(technology.id, topic.id);
              const score = quiz ? bestScore(progress, quiz.slug) : null;
              const lessonRead = hasReadLesson(progress, technology.id, topic.id) || done;

              return (
                <Card key={topic.id} className={`p-5 sm:p-6 ${done ? "border-[#A8D9CB] bg-[#F5FBF9]" : ""}`}>
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex min-w-0 items-start gap-4">
                      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-extrabold ${done ? "bg-[#06424B] text-[#FFAB0B]" : "bg-[#FFF1D1] text-[#94650C]"}`}>
                        {done ? <CheckCircle2 size={22} /> : String(index + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-extrabold text-[#06424B]">{topic.title}</h3>
                          {done ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#E1F2EC] px-2.5 py-1 text-[10px] font-bold text-[#28765E]"><CheckCircle2 size={11} /> Quiz completed</span>
                          ) : !unlocked ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#F0F3F3] px-2.5 py-1 text-[10px] font-bold text-[#829596]"><LockKeyhole size={11} /> Locked · Previous quiz required</span>
                          ) : lessonRead ? (
                            <span className="rounded-full bg-[#EAF4F2] px-2.5 py-1 text-[10px] font-bold text-[#376C68]">Quiz available in lesson</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF5DF] px-2.5 py-1 text-[10px] font-bold text-[#8A650E]"><LockKeyhole size={11} /> Read lesson to unlock quiz</span>
                          )}
                        </div>
                        <p className="mt-1 text-sm leading-6 text-[#5A7478]">{topic.summary}</p>
                        <p className="mt-2 text-[11px] font-semibold text-[#829596]">{topic.lessons.length} lesson sections · 10-question topic quiz{score !== null ? ` · Best score ${score}%` : ""}</p>
                      </div>
                    </div>
                    {unlocked ? (
                      <LinkButton to={`/student/topics/${technology.id}/topic/${topic.id}`} iconRight={ChevronRight} className="self-start sm:self-center">
                        {done ? "Review Lesson" : "Open Lesson"}
                      </LinkButton>
                    ) : (
                      <span className="inline-flex items-center gap-2 self-start rounded-xl bg-[#F2F5F5] px-3 py-2.5 text-xs font-bold text-[#8A9B9D] sm:self-center"><LockKeyhole size={14} /> Complete previous quiz</span>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        <aside className="space-y-4 xl:sticky xl:top-6 xl:h-fit">
          <Card className="p-5">
            <h3 className="text-base font-extrabold text-[#06424B]">Course progress</h3>
            <p className="mt-3 text-4xl font-extrabold text-[#06424B]">{stats.percent}%</p>
            <ProgressBar value={stats.percent} className="mt-3" />
            <p className="mt-2 text-xs text-[#5A7478]">{stats.done} of {stats.total} topics completed</p>
          </Card>
          <FinalAssignmentCard
            course={technology}
            progress={progress}
            allTopicsComplete={allTopicsComplete}
          />
        </aside>
      </div>
    </>
  );
}

function MyLearning() {
  const progress = useProgress();
  const { enrolledCourseIds, removeCourse } = useEnrolledCourses();
  const [searchParams] = useSearchParams();
  const enrolledVocationalCourses = courseCategories.filter(
    (course) => course.type === "vocational" && enrolledCourseIds.includes(course.id)
  );
  const enrolledTechnologyCourses = technologies
    .filter((technology) => enrolledCourseIds.includes(technology.id))
    .map((technology) => ({ ...technology, enrollmentKind: "technology" }));
  const enrolledCourses = [...enrolledVocationalCourses, ...enrolledTechnologyCourses];
  const selectedCourseId = searchParams.get("course");
  const selectedTechnologyId = searchParams.get("technology");
  const selectedCourse = enrolledVocationalCourses.find((course) => course.id === selectedCourseId);
  const selectedTechnology = enrolledTechnologyCourses.find((technology) => technology.id === selectedTechnologyId);

  return (
    <Sidebar>
      <PageShell>
        <div className="mx-auto w-full max-w-[1250px]">
          {selectedCourse?.type === "vocational" && (
            <VocationalCourseWorkspace course={selectedCourse} progress={progress} />
          )}
          {selectedTechnology && (
            <TechnologyPathWorkspace technology={selectedTechnology} progress={progress} />
          )}
          {!selectedCourse && !selectedTechnology && (
            <EnrolledCourseList courses={enrolledCourses} progress={progress} onRemoveCourse={removeCourse} />
          )}
        </div>
      </PageShell>
    </Sidebar>
  );
}

export default MyLearning;
