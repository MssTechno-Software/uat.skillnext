
import API from "./axiosInstance";
import { preloadApiContentTranslation } from "../services/apiContentTranslation";
import i18n from "../i18n";

const COURSE_THEORY_BASE = "/api/course-theory";

const getActiveLanguage = () =>
  String(i18n.resolvedLanguage || i18n.language || "en")
    .trim()
    .toLowerCase()
    .split("-")[0];

function validateId(value, label) {
  const id = String(value ?? "").trim();

  if (!/^\d+$/.test(id)) {
    throw new Error(`A valid ${label} is required.`);
  }

  return id;
}

async function preloadContent(data) {
  try {
    await preloadApiContentTranslation(data, getActiveLanguage());
  } catch (error) {
    console.warn(
      "Course theory translation preload failed.",
      error
    );
  }
}

/**
 * Get Topic Theory questions by course and difficulty.
 *
 * GET /api/course-theory/courses/{course_id}/questions
 */
export async function getCourseTheoryQuestions(
  courseId,
  difficultyLevel
) {
  const safeCourseId = validateId(courseId, "course ID");

  const response = await API.get(
    `${COURSE_THEORY_BASE}/courses/${encodeURIComponent(
      safeCourseId
    )}/questions`,
    {
      params: {
        difficulty_level: String(
          difficultyLevel || "easy"
        ).toLowerCase(),
      },
      requiresAuth: true,
      skipDynamicTranslation: true,
    }
  );

  await preloadContent(response.data);

  return response.data;
}

/**
 * Get Topic Theory daily usage limit.
 *
 * GET /api/course-theory/students/{student_id}/daily-limit
 */
export async function getCourseTheoryDailyLimit(studentId) {
  const safeStudentId = validateId(studentId, "student ID");

  const response = await API.get(
    `${COURSE_THEORY_BASE}/students/${encodeURIComponent(
      safeStudentId
    )}/daily-limit`,
    {
      requiresAuth: true,
      skipDynamicTranslation: true,
    }
  );

  return response.data;
}

/**
 * Submit Topic Theory answer.
 *
 * POST /api/course-theory/students/{student_id}/questions/{question_id}/submit-answer
 */
export async function submitCourseTheoryAnswer(
  studentId,
  questionId,
  answerText
) {
  const safeStudentId = validateId(studentId, "student ID");
  const safeQuestionId = validateId(questionId, "question ID");

  const cleanAnswer = String(answerText ?? "").trim();

  if (!cleanAnswer) {
    throw new Error("Please enter an answer before submitting.");
  }

  const response = await API.post(
    `${COURSE_THEORY_BASE}/students/${encodeURIComponent(
      safeStudentId
    )}/questions/${encodeURIComponent(
      safeQuestionId
    )}/submit-answer`,
    {
      answer_text: cleanAnswer,
    },
    {
      requiresAuth: true,
    }
  );

  // Evaluation is already included in the submit response.
  await preloadContent(response.data);

  return response.data;
}

/**
 * Skip Topic Theory question.
 *
 * POST /api/course-theory/students/{student_id}/questions/{question_id}/skip
 */
export async function skipCourseTheoryQuestion(
  studentId,
  questionId
) {
  const safeStudentId = validateId(studentId, "student ID");
  const safeQuestionId = validateId(questionId, "question ID");

  const response = await API.post(
    `${COURSE_THEORY_BASE}/students/${encodeURIComponent(
      safeStudentId
    )}/questions/${encodeURIComponent(
      safeQuestionId
    )}/skip`,
    {},
    {
      requiresAuth: true,
      skipDynamicTranslation: true,
    }
  );

  return response.data;
}
