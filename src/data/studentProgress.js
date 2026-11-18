import { useEffect, useState } from "react";
import { courseCategories, technologies } from "./studentLearningData";
import { courseFinalAssignments, courseUnitQuizzes } from "./quizData";

// Browser-local progress. This can later be replaced with the authenticated APIs.
const KEY = "skillnext.student.progress.v2";
const EVENT = "skillnext-progress-changed";
export const MAX_FINAL_ASSESSMENT_ATTEMPTS = 3;
export const COURSE_PASS_PERCENTAGE = 80;

const MARKS = {
  it: { quizzes: 30, coding: 20, final: 50 },
  vocational: { quizzes: 50, final: 50 },
};

const empty = () => ({
  completed: {},
  completedCourses: {},
  lessonRead: {},
  quizzes: [],
  assessments: {},
  assessmentHistory: {},
  courseCycles: {},
  last: null,
});

const round2 = (value) => Math.round((Number(value) || 0) * 100) / 100;
const roundPercent = (value) => Math.round((Number(value) || 0) * 10) / 10;

function getCourseDefinition(courseId) {
  const technology = technologies.find((item) => item.id === courseId);
  if (technology) {
    return {
      course: technology,
      units: technology.topics || [],
      hasCoding: true,
      marks: MARKS.it,
    };
  }

  const vocational = courseCategories.find(
    (item) => item.id === courseId && item.type === "vocational"
  );
  if (vocational) {
    return {
      course: vocational,
      units: vocational.modules || [],
      hasCoding: false,
      marks: MARKS.vocational,
    };
  }

  return { course: null, units: [], hasCoding: false, marks: MARKS.vocational };
}

function cycleAttemptCount(progress, courseId, cycleNumber) {
  return (progress?.quizzes || []).filter(
    (attempt) =>
      attempt.courseId === courseId &&
      attempt.assessmentType === "final" &&
      (Number(attempt.cycleNumber) || 1) === cycleNumber
  ).length;
}

export function getCourseCycle(progress, courseId) {
  const stored = progress?.courseCycles?.[courseId] || {};
  const number = Math.max(1, Number(stored.number) || 1);
  const attemptCount = cycleAttemptCount(progress, courseId, number);
  return {
    number,
    finalAttempts: Math.max(Number(stored.finalAttempts) || 0, attemptCount),
    status: stored.status || "active",
    lastOutcome: stored.lastOutcome || null,
    history: Array.isArray(stored.history) ? stored.history : [],
  };
}

function saveProgress(progress) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(progress));
  } catch {
    // The current session can still use the in-memory result if storage is unavailable.
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(EVENT));
  }
}

export function loadProgress() {
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    const base = empty();
    return {
      ...base,
      ...(parsed && typeof parsed === "object" ? parsed : {}),
      completed: parsed?.completed && typeof parsed.completed === "object" ? parsed.completed : {},
      completedCourses:
        parsed?.completedCourses && typeof parsed.completedCourses === "object"
          ? parsed.completedCourses
          : {},
      lessonRead: parsed?.lessonRead && typeof parsed.lessonRead === "object" ? parsed.lessonRead : {},
      quizzes: Array.isArray(parsed?.quizzes)
        ? parsed.quizzes.map((attempt) => ({
            ...attempt,
            cycleNumber: Number(attempt.cycleNumber) || 1,
          }))
        : [],
      assessments:
        parsed?.assessments && typeof parsed.assessments === "object" ? parsed.assessments : {},
      assessmentHistory:
        parsed?.assessmentHistory && typeof parsed.assessmentHistory === "object"
          ? parsed.assessmentHistory
          : {},
      courseCycles:
        parsed?.courseCycles && typeof parsed.courseCycles === "object" ? parsed.courseCycles : {},
    };
  } catch {
    return empty();
  }
}

function clearCourseCycleProgress(progress, courseId) {
  const prefix = `${courseId}/`;
  progress.completed = Object.fromEntries(
    Object.entries(progress.completed || {}).filter(([key]) => !key.startsWith(prefix))
  );
  progress.lessonRead = Object.fromEntries(
    Object.entries(progress.lessonRead || {}).filter(([key]) => !key.startsWith(prefix))
  );
  delete progress.completedCourses?.[courseId];

  const oldAssessment = progress.assessments?.[courseId];
  if (oldAssessment && Object.keys(oldAssessment).length) {
    progress.assessmentHistory = progress.assessmentHistory || {};
    progress.assessmentHistory[courseId] = [
      ...(progress.assessmentHistory[courseId] || []),
      { ...oldAssessment, archivedAt: new Date().toISOString() },
    ];
  }
  if (progress.assessments) delete progress.assessments[courseId];

  if (progress.last?.technologyId === courseId) {
    progress.last = null;
  }
}

function markCoursePassed(progress, courseId, summary) {
  progress.completedCourses = progress.completedCourses || {};
  progress.completedCourses[courseId] = new Date().toISOString();
  progress.courseCycles = progress.courseCycles || {};
  const cycle = getCourseCycle(progress, courseId);
  progress.courseCycles[courseId] = {
    ...cycle,
    status: "passed",
    passedAt: new Date().toISOString(),
    finalAttempts: cycle.finalAttempts,
    finalOverallPercentage: summary.overallPercentage,
  };
}

function restartCourseAfterFinalAttempts(progress, courseId, failedSummary) {
  const oldCycle = getCourseCycle(progress, courseId);
  const endedAt = new Date().toISOString();
  const history = [
    ...oldCycle.history,
    {
      number: oldCycle.number,
      finalAttempts: oldCycle.finalAttempts,
      overallPercentage: failedSummary.overallPercentage,
      outcome: "not-passed",
      endedAt,
    },
  ];

  clearCourseCycleProgress(progress, courseId);
  progress.courseCycles = progress.courseCycles || {};
  progress.courseCycles[courseId] = {
    number: oldCycle.number + 1,
    finalAttempts: 0,
    status: "active",
    history,
    lastOutcome: {
      type: "restarted",
      previousCycle: oldCycle.number,
      previousOverallPercentage: failedSummary.overallPercentage,
      endedAt,
    },
  };
}

export function toggleTopicComplete(technologyId, topicId) {
  const progress = loadProgress();
  const key = `${technologyId}/${topicId}`;
  if (progress.completed[key]) delete progress.completed[key];
  else progress.completed[key] = new Date().toISOString();
  saveProgress(progress);
}

export function markLessonRead(courseId, unitId) {
  if (!courseId || !unitId) return;
  const progress = loadProgress();
  progress.lessonRead = progress.lessonRead || {};
  progress.lessonRead[`${courseId}/${unitId}`] = new Date().toISOString();
  saveProgress(progress);
}

export function hasReadLesson(progress, courseId, unitId) {
  if (!courseId || !unitId) return false;
  const key = `${courseId}/${unitId}`;
  return Boolean(progress?.lessonRead?.[key] || progress?.completed?.[key]);
}

export function completeLearningUnit(courseId, unitId) {
  if (!courseId || !unitId) return;
  const progress = loadProgress();
  progress.completed[`${courseId}/${unitId}`] = new Date().toISOString();
  const cycle = progress.courseCycles?.[courseId];
  if (cycle?.lastOutcome) {
    progress.courseCycles[courseId] = { ...cycle, lastOutcome: null };
  }
  saveProgress(progress);
}

// Kept for compatibility with the existing quiz page. A final quiz only completes
// the course when the combined course percentage reaches 80%.
export function completeCourseFinal(courseId) {
  if (!courseId) return false;
  const progress = loadProgress();
  const summary = courseAssessmentSummary(progress, courseId);
  if (summary.overallPercentage < COURSE_PASS_PERCENTAGE) return false;
  markCoursePassed(progress, courseId, summary);
  saveProgress(progress);
  return true;
}

export function rememberLastTopic(technologyId, topicId) {
  const progress = loadProgress();
  if (progress.last?.technologyId === technologyId && progress.last?.topicId === topicId) return;
  progress.last = { technologyId, topicId };
  saveProgress(progress);
}

export function canAttemptFinalAssessment(progress, courseId) {
  if (!courseId) return { allowed: false, reason: "missing-course" };
  const cycle = getCourseCycle(progress, courseId);
  if (cycle.status === "passed" || progress?.completedCourses?.[courseId]) {
    return { allowed: false, reason: "course-passed", attemptsRemaining: 0 };
  }
  if (cycle.finalAttempts >= MAX_FINAL_ASSESSMENT_ATTEMPTS) {
    return { allowed: false, reason: "attempts-exhausted", attemptsRemaining: 0 };
  }

  const { units, hasCoding } = getCourseDefinition(courseId);
  if (units.length) {
    const allUnitsComplete = units.every((unit) => Boolean(progress?.completed?.[`${courseId}/${unit.id}`]));
    if (!allUnitsComplete) {
      return { allowed: false, reason: "topics-incomplete", attemptsRemaining: MAX_FINAL_ASSESSMENT_ATTEMPTS - cycle.finalAttempts };
    }
  }

  if (hasCoding && !progress?.assessments?.[courseId]?.coding) {
    return { allowed: false, reason: "coding-incomplete", attemptsRemaining: MAX_FINAL_ASSESSMENT_ATTEMPTS - cycle.finalAttempts };
  }

  return {
    allowed: true,
    reason: null,
    attemptsUsed: cycle.finalAttempts,
    attemptsRemaining: MAX_FINAL_ASSESSMENT_ATTEMPTS - cycle.finalAttempts,
    cycleNumber: cycle.number,
  };
}

function inferAssessmentDetails({ slug, courseId, assessmentType, unitId }) {
  const definition =
    courseUnitQuizzes.find((quiz) => quiz.slug === slug) ||
    courseFinalAssignments.find((quiz) => quiz.slug === slug);
  const finalDefinition = definition || null;
  return {
    courseId: courseId || finalDefinition?.courseId || null,
    assessmentType: assessmentType || finalDefinition?.assessmentType || "practice",
    unitId: unitId || finalDefinition?.moduleId || finalDefinition?.topicId || null,
  };
}

export function recordQuizAttempt({
  slug,
  title,
  score,
  total,
  courseId,
  unitId,
  assessmentType,
}) {
  const progress = loadProgress();
  const details = inferAssessmentDetails({ slug, courseId, assessmentType, unitId });
  const resolvedCourseId = details.courseId;
  const resolvedType = details.assessmentType;

  if (!slug || !Number.isFinite(Number(score)) || !Number.isFinite(Number(total)) || Number(total) <= 0) {
    return { ok: false, status: "invalid-result", message: "A valid quiz result is required." };
  }

  let cycleNumber = 1;
  let courseCycleBefore = null;
  if (resolvedCourseId) {
    courseCycleBefore = getCourseCycle(progress, resolvedCourseId);
    cycleNumber = courseCycleBefore.number;
  }

  if (resolvedType === "final") {
    const permission = canAttemptFinalAssessment(progress, resolvedCourseId);
    if (!permission.allowed) {
      return {
        ok: false,
        status: "blocked",
        reason: permission.reason,
        attemptsRemaining: permission.attemptsRemaining ?? 0,
      };
    }
  }

  const attempt = {
    slug,
    title: title || slug,
    score: Number(score),
    total: Number(total),
    courseId: resolvedCourseId,
    unitId: details.unitId,
    assessmentType: resolvedType,
    cycleNumber,
    date: new Date().toISOString(),
  };

  progress.quizzes = [attempt, ...(progress.quizzes || [])].slice(0, 500);

  if (resolvedType !== "final" && resolvedCourseId && details.unitId) {
    progress.completed[`${resolvedCourseId}/${details.unitId}`] = new Date().toISOString();
    const cycle = progress.courseCycles?.[resolvedCourseId];
    if (cycle?.lastOutcome) {
      progress.courseCycles[resolvedCourseId] = { ...cycle, lastOutcome: null };
    }
  }

  if (resolvedType !== "final") {
    saveProgress(progress);
    return { ok: true, status: "recorded", attempt, cycleNumber };
  }

  const cycle = courseCycleBefore || getCourseCycle(progress, resolvedCourseId);
  const nextCycle = {
    ...cycle,
    finalAttempts: cycle.finalAttempts + 1,
    status: "active",
  };
  progress.courseCycles = progress.courseCycles || {};
  progress.courseCycles[resolvedCourseId] = nextCycle;

  const assessmentSummary = courseAssessmentSummary(progress, resolvedCourseId);

  if (assessmentSummary.overallPercentage >= COURSE_PASS_PERCENTAGE) {
    markCoursePassed(progress, resolvedCourseId, assessmentSummary);
    saveProgress(progress);
    return {
      ok: true,
      status: "passed",
      attempt,
      summary: assessmentSummary,
      attemptsUsed: nextCycle.finalAttempts,
      attemptsRemaining: MAX_FINAL_ASSESSMENT_ATTEMPTS - nextCycle.finalAttempts,
    };
  }

  if (nextCycle.finalAttempts >= MAX_FINAL_ASSESSMENT_ATTEMPTS) {
    restartCourseAfterFinalAttempts(progress, resolvedCourseId, assessmentSummary);
    saveProgress(progress);
    return {
      ok: true,
      status: "course-restarted",
      attempt,
      summary: assessmentSummary,
      nextCycleNumber: nextCycle.number + 1,
      message: "The overall score was below 80% after all three final-assessment attempts. The course has restarted from its first topic.",
    };
  }

  saveProgress(progress);
  return {
    ok: true,
    status: "retry-available",
    attempt,
    summary: assessmentSummary,
    attemptsUsed: nextCycle.finalAttempts,
    attemptsRemaining: MAX_FINAL_ASSESSMENT_ATTEMPTS - nextCycle.finalAttempts,
  };
}

export function recordCourseAssessmentSubmission(courseId, assessmentType, submission) {
  if (!courseId || !["coding", "megaProject"].includes(assessmentType)) return;
  const progress = loadProgress();
  progress.assessments = progress.assessments || {};
  const courseAssessments = progress.assessments[courseId] || {};
  courseAssessments[assessmentType] = {
    ...submission,
    status: "pending",
    submittedAt: new Date().toISOString(),
    score: null,
  };
  progress.assessments[courseId] = courseAssessments;
  saveProgress(progress);
}

export function evaluateCourseAssessment(courseId, assessmentType, score, feedback = "") {
  const maximum = assessmentType === "coding" ? 20 : assessmentType === "megaProject" ? 50 : 0;
  if (!courseId || !maximum || !Number.isFinite(Number(score))) return;
  const numericScore = Number(score);
  if (numericScore < 0 || numericScore > maximum) return;

  const progress = loadProgress();
  const current = progress.assessments?.[courseId]?.[assessmentType];
  if (!current) return;

  progress.assessments[courseId][assessmentType] = {
    ...current,
    score: numericScore,
    feedback,
    status: "evaluated",
    evaluatedAt: new Date().toISOString(),
  };

  const summary = courseAssessmentSummary(progress, courseId);
  if (summary.overallPercentage >= COURSE_PASS_PERCENTAGE && summary.finalAttempts > 0) {
    markCoursePassed(progress, courseId, summary);
  }
  saveProgress(progress);
}

export function courseAssessmentSummary(progress, courseId, quizSlugs) {
  const cycle = getCourseCycle(progress, courseId);
  const topicQuizzes = Array.isArray(quizSlugs)
    ? quizSlugs.map((slug) => ({ slug }))
    : courseUnitQuizzes.filter((quiz) => quiz.courseId === courseId);
  const topicSlugList = topicQuizzes.map((quiz) => quiz.slug);
  const cycleAttempts = (progress?.quizzes || []).filter(
    (attempt) =>
      attempt.courseId === courseId &&
      (Number(attempt.cycleNumber) || 1) === cycle.number
  );

  const bestByQuiz = {};
  cycleAttempts.forEach((attempt) => {
    if (!attempt.total || !topicSlugList.includes(attempt.slug) || attempt.assessmentType === "final") return;
    const percentage = (Number(attempt.score) / Number(attempt.total)) * 100;
    bestByQuiz[attempt.slug] = Math.max(bestByQuiz[attempt.slug] ?? 0, percentage);
  });

  const quizCount = topicSlugList.length;
  const quizAverage = quizCount
    ? topicSlugList.reduce((sum, slug) => sum + (bestByQuiz[slug] || 0), 0) / quizCount
    : 0;
  const { marks } = getCourseDefinition(courseId);
  const assessments = progress?.assessments?.[courseId] || {};
  const coding = assessments.coding || null;
  const codingMarks = coding?.status === "evaluated" ? Number(coding.score) || 0 : 0;
  const finalAttempts = cycleAttempts.filter((attempt) => attempt.assessmentType === "final");
  const finalPercentages = finalAttempts
    .filter((attempt) => attempt.total)
    .map((attempt) => (Number(attempt.score) / Number(attempt.total)) * 100);
  const finalScore = finalPercentages.length ? Math.max(...finalPercentages) : null;
  const quizMarks = (quizAverage / 100) * marks.quizzes;
  const finalMarks = ((finalScore || 0) / 100) * marks.final;
  const totalMarks = quizMarks + (getCourseDefinition(courseId).hasCoding ? codingMarks : 0) + finalMarks;
  const maxTotal = marks.quizzes + (getCourseDefinition(courseId).hasCoding ? marks.coding : 0) + marks.final;
  const overallPercentage = maxTotal ? (totalMarks / maxTotal) * 100 : 0;

  return {
    cycleNumber: cycle.number,
    cycleStatus: cycle.status,
    cycle,
    quizCount,
    quizzesCompleted: Object.keys(bestByQuiz).length,
    quizAverage: roundPercent(quizAverage),
    topicMarks: round2(quizMarks),
    quizMarks: round2(quizMarks),
    topicScores: Object.fromEntries(
      topicSlugList.map((slug) => [slug, bestByQuiz[slug] === undefined ? null : roundPercent(bestByQuiz[slug])])
    ),
    coding,
    codingMarks: round2(getCourseDefinition(courseId).hasCoding ? codingMarks : 0),
    finalScore: finalScore === null ? null : roundPercent(finalScore),
    finalMarks: round2(finalMarks),
    finalAttempts: Math.max(cycle.finalAttempts, finalAttempts.length),
    attemptsRemaining: Math.max(0, MAX_FINAL_ASSESSMENT_ATTEMPTS - Math.max(cycle.finalAttempts, finalAttempts.length)),
    totalMarks: round2(totalMarks),
    maxTotal,
    overallPercentage: roundPercent(overallPercentage),
    passed: Boolean(progress?.completedCourses?.[courseId]) || cycle.status === "passed" || overallPercentage >= COURSE_PASS_PERCENTAGE,
    passPercentage: COURSE_PASS_PERCENTAGE,
  };
}

export function useProgress() {
  const [progress, setProgress] = useState(loadProgress);
  useEffect(() => {
    const refresh = () => setProgress(loadProgress());
    window.addEventListener(EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);
  return progress;
}

export function technologyProgress(progress, technology) {
  const topics = technology?.topics || [];
  const done = topics.filter((topic) => progress.completed[`${technology.id}/${topic.id}`]).length;
  const total = topics.length;
  return { done, total, percent: total ? Math.round((done / total) * 100) : 0 };
}

export function courseProgress(progress, course) {
  if (!course) return { done: 0, total: 0, percent: 0, completed: false };

  if (Array.isArray(course.topics)) {
    const stats = technologyProgress(progress, course);
    const completed = Boolean(progress.completedCourses?.[course.id]);
    return {
      ...stats,
      percent: completed ? 100 : Math.min(90, stats.total ? Math.round((stats.done / stats.total) * 90) : 0),
      completed,
    };
  }

  if (course.type === "technology" && Array.isArray(course.courses)) {
    const tracks = course.courses;
    const done = tracks.reduce((sum, technology) => sum + technologyProgress(progress, technology).done, 0);
    const total = tracks.reduce((sum, technology) => sum + technologyProgress(progress, technology).total, 0);
    const completed = Boolean(progress.completedCourses?.[course.id]);
    return {
      done,
      total,
      percent: completed ? 100 : Math.min(90, total ? Math.round((done / total) * 90) : 0),
      completed,
    };
  }

  const modules = course.modules || [];
  const done = modules.filter((module) => progress.completed[`${course.id}/${module.id}`]).length;
  const total = modules.length;
  return {
    done,
    total,
    percent: progress.completedCourses?.[course.id]
      ? 100
      : Math.min(90, total ? Math.round((done / total) * 90) : 0),
    completed: Boolean(progress.completedCourses?.[course.id]),
  };
}

export function bestScore(progress, slug) {
  const attempts = (progress?.quizzes || []).filter((item) => item.slug === slug);
  if (!attempts.length) return null;

  const courseId = attempts.find((item) => item.courseId)?.courseId;
  const cycleNumber = courseId ? getCourseCycle(progress, courseId).number : null;
  const currentAttempts = courseId
    ? attempts.filter((item) => item.courseId === courseId && (Number(item.cycleNumber) || 1) === cycleNumber)
    : attempts;
  if (!currentAttempts.length) return null;
  return Math.max(
    ...currentAttempts.map((item) =>
      item.total ? Math.round((Number(item.score) / Number(item.total)) * 100) : 0
    )
  );
}

export function summary(progress, technologiesList) {
  const topicsCompleted = Object.keys(progress.completed || {}).length;
  const started = technologiesList.filter((tech) => technologyProgress(progress, tech).done > 0).length;
  const attempts = (progress.quizzes || []).length;
  const average = attempts
    ? Math.round(
        progress.quizzes.reduce(
          (sum, item) => sum + (item.total ? (item.score / item.total) * 100 : 0),
          0
        ) / attempts
      )
    : null;
  return { topicsCompleted, started, attempts, average };
}
