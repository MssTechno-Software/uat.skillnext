// Centralised browser session storage for the course-specific interview flow.
// API integration can replace these local persistence helpers without changing page components.

const SESSION_KEY = "skill-next-topic-interview-session-v1";
const FEEDBACK_KEY = "skill-next-topic-interview-feedback-v1";

function readJson(key) {
  if (typeof window === "undefined") return null;
  try {
    const value = window.sessionStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

function writeJson(key, value) {
  if (typeof window === "undefined") return;
  try {
    if (value == null) {
      window.sessionStorage.removeItem(key);
      return;
    }
    window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // The active React route state remains usable if browser storage is unavailable.
  }
}

export function readInterviewSession() {
  const session = readJson(SESSION_KEY);
  return session && typeof session === "object" ? session : null;
}

export function saveInterviewSession(session) {
  writeJson(SESSION_KEY, session);
}

export function clearInterviewSession() {
  writeJson(SESSION_KEY, null);
  writeJson(FEEDBACK_KEY, null);
}

export function readInterviewFeedback() {
  const feedback = readJson(FEEDBACK_KEY);
  return feedback && typeof feedback === "object" ? feedback : null;
}

export function saveInterviewFeedback(feedback) {
  writeJson(FEEDBACK_KEY, feedback);
}
