import { useEffect, useState } from "react";

// Lightweight progress tracking stored in the browser (localStorage).
// This keeps the portal useful before the backend exists. Replace these helpers
// with API calls to the Skill Next progress service when it is available.

const KEY = "skillnext.student.progress.v1";
const EVENT = "skillnext-progress-changed";
const empty = () => ({ completed: {}, quizzes: [], last: null });

export function loadProgress() {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? { ...empty(), ...JSON.parse(raw) } : empty();
  } catch {
    return empty();
  }
}

function saveProgress(progress) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(progress));
  } catch {
    /* storage unavailable – progress simply is not remembered */
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

export function rememberLastTopic(technologyId, topicId) {
  const progress = loadProgress();
  if (progress.last?.technologyId === technologyId && progress.last?.topicId === topicId) return;
  progress.last = { technologyId, topicId };
  saveProgress(progress);
}

export function recordQuizAttempt({ slug, title, score, total }) {
  const progress = loadProgress();
  progress.quizzes = [{ slug, title, score, total, date: new Date().toISOString() }, ...progress.quizzes].slice(0, 50);
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
  const done = technology.topics.filter((topic) => progress.completed[`${technology.id}/${topic.id}`]).length;
  const total = technology.topics.length;
  return { done, total, percent: total ? Math.round((done / total) * 100) : 0 };
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
