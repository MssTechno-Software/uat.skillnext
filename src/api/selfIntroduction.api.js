
import API from "./axiosInstance";
import i18n from "../i18n";
import { preloadApiContentTranslation } from "../services/apiContentTranslation";

const SELF_INTRODUCTION_BASE = "/api/self-introduction/students";
const COURSE_THEORY_BASE = "/api/course-theory/students";

function getActiveLanguage() {
  return String(i18n.resolvedLanguage || i18n.language || "en")
    .trim()
    .toLowerCase()
    .split("-")[0];
}

// Keep the existing pre-display translation timing, but never let a translation
// failure turn a successful self-introduction API response into a failed request.
async function preloadSelfIntroductionContent(data) {
  try {
    await preloadApiContentTranslation(data, getActiveLanguage());
  } catch (error) {
    console.warn(
      "Self-introduction content translation could not be preloaded; the original API response will be used.",
      error,
    );
  }
}

function validateStudentId(studentId) {
  const value = String(studentId ?? "").trim();

  if (!/^\d+$/.test(value)) {
    throw new Error("A valid student ID is required. Please sign in again.");
  }

  return value;
}

function validateQuestionId(questionId) {
  const value = String(questionId ?? "").trim();

  if (!/^\d+$/.test(value)) {
    throw new Error("A valid question ID is required.");
  }

  return value;
}

/**
 * Fetch self-introduction questions.
 */
export async function getSelfIntroductionQuestions(studentId) {
  const safeStudentId = validateStudentId(studentId);

  const response = await API.get(
    `${SELF_INTRODUCTION_BASE}/${encodeURIComponent(safeStudentId)}/questions`,
    {
      requiresAuth: true,
      skipDynamicTranslation: true,
    },
  );

  await preloadSelfIntroductionContent(response.data);

  return response.data;
}

/**
 * Fetch daily submission limit.
 */
export async function getSelfIntroductionDailyLimit(studentId) {
  const safeStudentId = validateStudentId(studentId);

  const response = await API.get(
    `${SELF_INTRODUCTION_BASE}/${encodeURIComponent(safeStudentId)}/daily-limit`,
    {
      requiresAuth: true,
      skipDynamicTranslation: true,
    },
  );

  return response.data;
}

/**
 * Submit self-introduction answer.
 * Evaluation is returned by this API response itself.
 */
export async function submitSelfIntroductionAnswer(
  studentId,
  questionId,
  answerText,
) {
  const safeStudentId = validateStudentId(studentId);
  const safeQuestionId = validateQuestionId(questionId);
  const cleanAnswer = String(answerText ?? "").trim();

  if (!cleanAnswer) {
    throw new Error(
      "Please enter or record an answer before submitting.",
    );
  }

  const response = await API.post(
    `${SELF_INTRODUCTION_BASE}/${encodeURIComponent(safeStudentId)}/questions/${encodeURIComponent(safeQuestionId)}/submit-answer`,
    {
      answer_text: cleanAnswer,
    },
    {
      requiresAuth: true,
    },
  );

  return response.data;
}

/**
 * Skip a self-introduction question.
 *
 * Swagger endpoint:
 * POST /api/course-theory/students/{student_id}/questions/{question_id}/skip
 */
export async function skipSelfIntroductionQuestion(
  studentId,
  questionId,
) {
  const safeStudentId = validateStudentId(studentId);
  const safeQuestionId = validateQuestionId(questionId);

  const response = await API.post(
    `${COURSE_THEORY_BASE}/${encodeURIComponent(safeStudentId)}/questions/${encodeURIComponent(safeQuestionId)}/skip`,
    {},
    {
      requiresAuth: true,
      skipDynamicTranslation: true,
    },
  );

  return response.data;
}
