import API from "./axiosInstance";

const requireId = (value, label) => {
  if (
    value === undefined ||
    value === null ||
    String(value).trim() === ""
  ) {
    throw new Error(`${label} is required.`);
  }

  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error(`${label} must be a positive integer.`);
  }

  return id;
};

// GET /api/modules/{module_id}/assessments
export const getModuleAssessments = async (moduleId) => {
  const id = requireId(moduleId, "Module ID");

  const response = await API.get(
    `/api/modules/${id}/assessments`
  );

  return response.data;
};

// POST /api/assessments/{assignment_id}/start
export const startAssessment = async (assignmentId) => {
  const id = requireId(assignmentId, "Assignment ID");

  const response = await API.post(
    `/api/assessments/${id}/start`
  );

  return response.data;
};

// POST /api/attempts/{attempt_id}/submit
export const submitAssessmentAttempt = async (
  attemptId,
  answers
) => {
  const id = requireId(attemptId, "Attempt ID");

  if (!Array.isArray(answers)) {
    throw new Error("Assessment answers must be an array.");
  }

  const response = await API.post(
    `/api/attempts/${id}/submit`,
    { answers }
  );

  return response.data;
};

// GET /api/courses/{course_id}/final-assessment
export const getFinalAssessment = async (courseId) => {
  const id = requireId(courseId, "Course ID");

  const response = await API.get(
    `/api/courses/${id}/final-assessment`
  );

  return response.data;
};

// POST /api/modules/{module_id}/restart
export const restartModule = async (moduleId) => {
  const id = requireId(moduleId, "Module ID");

  const response = await API.post(
    `/api/modules/${id}/restart`
  );

  return response.data;
};