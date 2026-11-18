
import API from "./axiosInstance";

// Validate required IDs before making API requests.
const validateId = (value, label) => {
  if (value === undefined || value === null || String(value).trim() === "") {
    throw new Error(`${label} is required.`);
  }
};

// Get all courses enrolled by the logged-in student for the My Learning page.
export const getMyLearnings = async (params = {}) => {
  const response = await API.get("/api/my-learnings", {
    params,
    requiresAuth: true,
  });
  return response.data;
};

// Get all available courses for the Explore Topics page and category-wise course listing.
export const getCourses = async (params = {}) => {
  const response = await API.get("/api/courses", {
    params,
    requiresAuth: true,
  });
  return response.data;
};

// Get basic details of a specific course using its course ID.
export const getCourseById = async (courseId) => {
  validateId(courseId, "Course reference");
  const response = await API.get(`/api/courses/${encodeURIComponent(courseId)}`, {
    requiresAuth: true,
  });
  return response.data;
};

// Get the overview and summary information of a specific course.
export const getCourseOverview = async (courseId) => {
  validateId(courseId, "Course reference");
  const response = await API.get(
    `/api/courses/${encodeURIComponent(courseId)}/overview`,
    { requiresAuth: true }
  );
  return response.data;
};

// Get the list of modules available in a specific course.
export const getCourseModules = async (courseId) => {
  validateId(courseId, "Course reference");
  const response = await API.get(
    `/api/courses/${encodeURIComponent(courseId)}/modules`,
    { requiresAuth: true }
  );
  return response.data;
};

// Get complete course details, including all modules and their learning content.
export const getCourseContent = async (courseId) => {
  validateId(courseId, "Course reference");
  const response = await API.get(
    `/api/courses/${encodeURIComponent(courseId)}/content`,
    { requiresAuth: true }
  );
  return response.data;
};

// Enroll the logged-in student in one or more selected courses.
export const enrollInMyCourses = async (courseIds) => {
  if (!Array.isArray(courseIds) || courseIds.length === 0) {
    throw new Error("At least one course is required for enrollment.");
  }

  const normalizedCourseIds = [...new Set(courseIds.map(Number))];
  if (normalizedCourseIds.some((id) => !Number.isInteger(id) || id <= 0)) {
    throw new Error("Course references must be valid positive integers.");
  }

  const response = await API.post(
    "/api/courses/enroll/me",
    { courseIds: normalizedCourseIds },
    { requiresAuth: true }
  );
  return response.data;
};

// Mark a specific course module as completed for the logged-in student.
export const completeModule = async (moduleId) => {
  validateId(moduleId, "Module reference");
  const response = await API.post(
    `/api/modules/${encodeURIComponent(moduleId)}/complete`,
    null,
    { requiresAuth: true }
  );
  return response.data;
};
