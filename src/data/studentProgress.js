import { useEffect, useState } from "react";

// Lightweight course and assessment progress stored in the browser.
// Replace the storage helpers with the authenticated Skill Next APIs when ready.

const KEY = "skillnext.student.progress.v2";
const EVENT = "skillnext-progress-changed";
const empty = () => ({ completed: {}, completedCourses: {}, lessonRead: {}, quizzes: [], last: null });

export function loadProgress() {
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return {
      ...empty(),
      ...(parsed && typeof parsed === "object" ? parsed : {}),
      completed: parsed?.completed || {},
      completedCourses: parsed?.completedCourses || {},
      lessonRead: parsed?.lessonRead || {},
      quizzes: Array.isArray(parsed?.quizzes) ? parsed.quizzes : [],
    };
  } catch {
    return empty();
  }
}

function saveProgress(progress) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(progress));
  } catch {
    // Progress remains available for the current session if storage is unavailable.
  }
  window.dispatchEvent(new Event(EVENT));
}

export function toggleTopicComplete(technologyId, topicId) {
  const progress = loadProgress();
  const key = `${technologyId}/${topicId}`;
  if (progress.completed[key]) delete progress.completed[key];
  else progress.completed[key] = new Date().toISOString();
  saveProgress(progress);
}

// A lesson is marked as read after the learner reaches the end of the lesson and confirms it.
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

// A learning unit is completed after all quiz questions are answered, regardless of score.
export function completeLearningUnit(courseId, unitId) {
  if (!courseId || !unitId) return;
  const progress = loadProgress();
  progress.completed[`${courseId}/${unitId}`] = new Date().toISOString();
  saveProgress(progress);
}

export function completeCourseFinal(courseId) {
  if (!courseId) return;
  const progress = loadProgress();
  progress.completedCourses[courseId] = new Date().toISOString();
  saveProgress(progress);
}

export function rememberLastTopic(technologyId, topicId) {
  const progress = loadProgress();
  if (progress.last?.technologyId === technologyId && progress.last?.topicId === topicId) return;
  progress.last = { technologyId, topicId };
  saveProgress(progress);
}

export function recordQuizAttempt({ slug, title, score, total, courseId, unitId, assessmentType }) {
  const progress = loadProgress();
  progress.quizzes = [
    {
      slug,
      title,
      score,
      total,
      courseId: courseId || null,
      unitId: unitId || null,
      assessmentType: assessmentType || "practice",
      date: new Date().toISOString(),
    },
    ...progress.quizzes,
  ].slice(0, 100);
  saveProgress(progress);
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

  // The IT Courses category is only a catalogue. Each technology is now an
  // individually enrolled learning course and owns its own final assignment.
  if (Array.isArray(course.topics)) {
    const stats = technologyProgress(progress, course);
    const completed = Boolean(progress.completedCourses?.[course.id]);
    return {
      ...stats,
      percent: completed ? 100 : Math.min(90, stats.total ? Math.round((stats.done / stats.total) * 90) : 0),
      completed,
    };
  }

  // Retain support for the legacy IT catalogue shape if any older page reads it.
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
  const attempts = progress.quizzes.filter((item) => item.slug === slug);
  if (!attempts.length) return null;
  return Math.max(...attempts.map((item) => Math.round((item.score / item.total) * 100)));
}

export function summary(progress, technologies) {
  const topicsCompleted = Object.keys(progress.completed).length;
  const started = technologies.filter((tech) => technologyProgress(progress, tech).done > 0).length;
  const attempts = progress.quizzes.length;
  const average = attempts
    ? Math.round(progress.quizzes.reduce((sum, item) => sum + (item.score / item.total) * 100, 0) / attempts)
    : null;
  return { topicsCompleted, started, attempts, average };
}
