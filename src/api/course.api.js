import API from "./axiosInstance";
// In-memory cache
const learningPathCache = new Map();
const learningPathRequests = new Map();

const contentCache = new Map();
const contentRequests = new Map();

// Reuse cached data and pending requests
const getCachedData = async (
  key,
  cache,
  requests,
  fetcher,
  forceRefresh = false
) => {
  if (forceRefresh) {
    cache.delete(key);
    requests.delete(key);
  }

  if (cache.has(key)) return cache.get(key);
  if (requests.has(key)) return requests.get(key);

  const request = fetcher()
    .then((data) => {
      if (requests.get(key) === request) {
        cache.set(key, data);
      }
      return data;
    })
    .finally(() => {
      if (requests.get(key) === request) {
        requests.delete(key);
      }
    });

  requests.set(key, request);
  return request;
};

// Clear one course or all learning paths
export const invalidateCourseLearningPath = (courseId) => {
  if (courseId == null) {
    learningPathCache.clear();
    learningPathRequests.clear();
    return;
  }

  learningPathCache.delete(String(courseId));
  learningPathRequests.delete(String(courseId));
};

// Clear all course API caches on logout
export const clearCourseApiCache = () => {
  learningPathCache.clear();
  learningPathRequests.clear();
  contentCache.clear();
  contentRequests.clear();
};

// Validate required IDs
const validateId = (value, label) => {
  if (
    value === undefined ||
    value === null ||
    String(value).trim() === ""
  ) {
    throw new Error(`${label} is required.`);
  }
};

// Get enrolled courses
export const getMyLearnings = async (params = {}) => {
  const response = await API.get("/api/my-learnings", {
    params,
    requiresAuth: true,
  });

  return response.data;
};

// Get student's course learning path
export const getCourseLearningPath = async (
  courseId,
  { forceRefresh = false } = {}
) => {
  validateId(courseId, "Course reference");

  const key = String(courseId);

  return getCachedData(
    key,
    learningPathCache,
    learningPathRequests,
    async () => {
      const response = await API.get(
        `/api/courses/${encodeURIComponent(courseId)}/learning-path/me`,
        { requiresAuth: true }
      );

      return response.data;
    },
    forceRefresh
  );
};

// Get all available courses
export const getCourses = async (params = {}) => {
  const response = await API.get("/api/courses", {
    params,
    requiresAuth: true,
  });

  return response.data;
};

// Get actual lesson content
export const getCourseContent = async (
  courseId,
  { forceRefresh = false } = {}
) => {
  validateId(courseId, "Course reference");

  const key = String(courseId);

  return getCachedData(
    key,
    contentCache,
    contentRequests,
    async () => {
      const response = await API.get(
        `/api/courses/${encodeURIComponent(courseId)}/content`,
        { requiresAuth: true }
      );

      return response.data;
    },
    forceRefresh
  );
};

// Enroll in selected courses
export const enrollInMyCourses = async (courseIds) => {
  if (!Array.isArray(courseIds) || courseIds.length === 0) {
    throw new Error("At least one course is required for enrollment.");
  }

  const normalizedCourseIds = [...new Set(courseIds.map(Number))];

  if (
    normalizedCourseIds.some(
      (id) => !Number.isInteger(id) || id <= 0
    )
  ) {
    throw new Error("Course references must be valid positive integers.");
  }

  const response = await API.post(
    "/api/courses/enroll/me",
    { courseIds: normalizedCourseIds },
    { requiresAuth: true }
  );

  normalizedCourseIds.forEach((id) => {
    invalidateCourseLearningPath(id);
    contentCache.delete(String(id));
    contentRequests.delete(String(id));
  });

  return response.data;
};
// Leave enrolled course
export const leaveCourse = async (
  courseId,
  removeProgress = false
) => {
  validateId(courseId, "Course reference");

  const response = await API.delete(
    `/api/enrollments/me/${encodeURIComponent(courseId)}`,
    {
      params: {
        removeProgress,
      },
      requiresAuth: true,
    }
  );

  // Clear related cached learning data
  invalidateCourseLearningPath(courseId);

  contentCache.delete(String(courseId));
  contentRequests.delete(String(courseId));

  return response.data;
};

// Mark module as completed
export const completeModule = async (moduleId) => {
  validateId(moduleId, "Module reference");

  const response = await API.post(
    `/api/modules/${encodeURIComponent(moduleId)}/complete`,
    null,
    { requiresAuth: true }
  );

  invalidateCourseLearningPath();

  return response.data;
};
