import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "skill-next-enrolled-courses-v1";
const EVENT_NAME = "skillnext-courses-changed";
const LEGACY_GROUP_COURSE_IDS = new Set(["it-courses"]);

function readEnrolledCourses() {
  if (typeof window === "undefined") return [];
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    if (!Array.isArray(parsed)) return [];

    // IT Courses is a directory, not an enrolment. Remove the old group ID so
    // learners can add React, Python, JavaScript, Java, SQL and HTML/CSS one by one.
    const normalized = [...new Set(parsed.filter(
      (id) => typeof id === "string" && id && !LEGACY_GROUP_COURSE_IDS.has(id)
    ))];
    if (normalized.length !== parsed.length) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    }
    return normalized;
  } catch {
    return [];
  }
}

function persistEnrolledCourses(courseIds) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(courseIds));
  } catch {
    // Enrollment remains in the current session if browser storage is unavailable.
  }
}

function notifyEnrollmentChange() {
  window.dispatchEvent(new Event(EVENT_NAME));
}

// Browser persistence is immediate so an Add Course action is saved before navigation.
export function useEnrolledCourses() {
  const [enrolledCourseIds, setEnrolledCourseIds] = useState(readEnrolledCourses);

  useEffect(() => {
    const refresh = () => setEnrolledCourseIds(readEnrolledCourses());
    window.addEventListener(EVENT_NAME, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(EVENT_NAME, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const enrollCourse = useCallback((courseId) => {
    if (!courseId || LEGACY_GROUP_COURSE_IDS.has(courseId)) return;
    const current = readEnrolledCourses();
    if (current.includes(courseId)) return;
    const next = [...current, courseId];
    persistEnrolledCourses(next);
    setEnrolledCourseIds(next);
    notifyEnrollmentChange();
  }, []);

  const removeCourse = useCallback((courseId) => {
    const next = readEnrolledCourses().filter((id) => id !== courseId);
    persistEnrolledCourses(next);
    setEnrolledCourseIds(next);
    notifyEnrollmentChange();
  }, []);

  const isEnrolled = useCallback(
    (courseId) => enrolledCourseIds.includes(courseId),
    [enrolledCourseIds]
  );

  return { enrolledCourseIds, enrollCourse, removeCourse, isEnrolled };
}
