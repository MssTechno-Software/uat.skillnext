import i18n from "../i18n";
const env = import.meta.env || {};

const trimSlash = (value) => String(value || "").replace(/\/$/, "");
const API_BASE_URL = trimSlash(env.VITE_API_BASE_URL);

const endpoints = {
  categories: env.VITE_API_CATEGORIES_ENDPOINT || "/api/categories",
  courses: env.VITE_API_COURSES_ENDPOINT || "/api/courses",
  modules: env.VITE_API_MODULES_ENDPOINT || "/api/modules",
  contents: env.VITE_API_CONTENTS_ENDPOINT || "/api/contents",
  assignments: env.VITE_API_ASSIGNMENTS_ENDPOINT || "/api/assignments",
  students: env.VITE_API_STUDENTS_ENDPOINT || "/api/students",
  enrollments: env.VITE_API_COURSE_ENROLLMENTS_ENDPOINT || "/api/courses/{course_id}/enrollments",
  courseModules: env.VITE_API_COURSE_MODULES_ENDPOINT || "/api/courses/{course_id}/modules",
  moduleContents: env.VITE_API_MODULE_CONTENTS_ENDPOINT || "/api/modules/{module_id}/contents",
  courseAssignments: env.VITE_API_COURSE_ASSIGNMENTS_ENDPOINT || "/api/courses/{course_id}/assignments",
  uploads: env.VITE_API_UPLOAD_ENDPOINT || "",
};

const tokenKeys = ["access_token", "accessToken", "access-token", "token", "authToken", "jwt", "jwtToken", "skillnext_token"];

function readAccessToken() {
  if (typeof window === "undefined") return "";
  for (const key of tokenKeys) {
    const value = window.localStorage.getItem(key);
    if (value && value !== "undefined" && value !== "null") return value;
  }
  for (const key of ["authSession", "auth", "session", "userSession"]) {
    const value = window.localStorage.getItem(key);
    if (!value) continue;
    try {
      const parsed = JSON.parse(value);
      const token = parsed?.access_token || parsed?.accessToken || parsed?.token;
      if (token) return token;
    } catch {
      // Ignore non-JSON storage entries.
    }
  }
  return "";
}

export function isTeacherApiConfigured() {
  return Boolean(API_BASE_URL);
}

function resolveEndpoint(path) {
  if (!path) throw new Error("This API endpoint has not been configured.");
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE_URL}${path.startsWith("/") ? path : "/" + path}`;
}

async function request(path, options = {}) {
  if (!API_BASE_URL && !/^https?:\/\//i.test(path || "")) {
    throw new Error("Set VITE_API_BASE_URL in your .env file before using teacher API operations.");
  }

  const { method = "GET", body, isFormData = false, headers = {} } = options;
  const token = readAccessToken();
  const response = await fetch(resolveEndpoint(path), {
    method,
    credentials: "include",
    headers: {
      "Accept-Language": i18n.resolvedLanguage || i18n.language || "en",
      ...(isFormData ? {} : body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${String(token).replace(/^Bearer\s+/i, "")}` } : {}),
      ...headers,
    },
    ...(body !== undefined ? { body: isFormData ? body : JSON.stringify(body) } : {}),
  });

  const responseText = await response.text();
  let payload = null;
  if (responseText) {
    try {
      payload = JSON.parse(responseText);
    } catch {
      payload = responseText;
    }
  }

  if (!response.ok) {
    const message = payload?.detail || payload?.message || payload?.error || `Request failed (${response.status}).`;
    throw new Error(typeof message === "string" ? message : JSON.stringify(message));
  }
  return payload;
}

function withId(endpoint, id) {
  return `${endpoint.replace(/\/$/, "")}/${encodeURIComponent(id)}`;
}

function fillTemplate(template, values = {}) {
  return Object.entries(values).reduce(
    (path, [key, value]) => path.replaceAll(`{${key}}`, encodeURIComponent(String(value))),
    template,
  );
}

export function extractList(payload, preferredKeys = []) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];
  const keys = [...new Set([...preferredKeys, "items", "results", "students", "users", "categories", "courses", "modules", "contents", "assignments", "data"])];
  for (const key of keys) {
    if (Array.isArray(payload[key])) return payload[key];
    if (payload[key] && typeof payload[key] === "object") {
      for (const nestedKey of [...keys, "items", "results", "data"]) {
        if (Array.isArray(payload[key][nestedKey])) return payload[key][nestedKey];
      }
    }
  }
  return [];
}

export const teacherApi = {
  async list(resource) {
    const path = endpoints[resource];
    if (!path) throw new Error(`No endpoint configured for ${resource}.`);
    return extractList(await request(path), [resource]);
  },

  async create(resource, payload) {
    return request(endpoints[resource], { method: "POST", body: payload });
  },

  async update(resource, id, payload) {
    return request(withId(endpoints[resource], id), { method: "PUT", body: payload });
  },

  async remove(resource, id) {
    return request(withId(endpoints[resource], id), { method: "DELETE" });
  },

  async createModule(courseId, payload) {
    const path = fillTemplate(endpoints.courseModules, { course_id: courseId });
    return request(path, { method: "POST", body: payload });
  },

  async updateModule(id, payload) {
    return request(withId(endpoints.modules, id), { method: "PUT", body: payload });
  },

  async deleteModule(id) {
    return request(withId(endpoints.modules, id), { method: "DELETE" });
  },

  async createContent(moduleId, payload) {
    const path = fillTemplate(endpoints.moduleContents, { module_id: moduleId });
    return request(path, { method: "POST", body: payload });
  },

  async updateContent(id, payload) {
    return request(withId(endpoints.contents, id), { method: "PUT", body: payload });
  },

  async deleteContent(id) {
    return request(withId(endpoints.contents, id), { method: "DELETE" });
  },

  async createAssignment(courseId, payload) {
    const path = fillTemplate(endpoints.courseAssignments, { course_id: courseId });
    return request(path, { method: "POST", body: payload });
  },

  async updateAssignment(id, payload) {
    return request(withId(endpoints.assignments, id), { method: "PUT", body: payload });
  },

  async deleteAssignment(id) {
    return request(withId(endpoints.assignments, id), { method: "DELETE" });
  },

  async listStudents() {
    const firstPayload = await request(endpoints.students);
    const allStudents = extractList(firstPayload, ["students", "users"]);
    const pagination = firstPayload?.pagination || firstPayload?.meta?.pagination || firstPayload?.data?.pagination || firstPayload?.meta || {};
    const totalPages = Number(pagination.total_pages || pagination.totalPages || pagination.pages || 1);
    if (totalPages <= 1) return allStudents;

    const separator = endpoints.students.includes("?") ? "&" : "?";
    const remainingPages = await Promise.all(
      Array.from({ length: Math.min(totalPages - 1, 49) }, (_, index) => index + 2)
        .map((page) => request(`${endpoints.students}${separator}page=${page}`)),
    );
    return [...allStudents, ...remainingPages.flatMap((payload) => extractList(payload, ["students", "users"]))];
  },

  async enrollStudents(courseId, { studentIds = [], emails = [] }) {
    const path = fillTemplate(endpoints.enrollments, { course_id: courseId });
    return request(path, {
      method: "POST",
      body: {
        studentIds: [...new Set(studentIds)],
        emails: [...new Set(emails.map((email) => email.trim().toLowerCase()).filter(Boolean))],
      },
    });
  },

  async uploadFile(file) {
    if (!endpoints.uploads) {
      throw new Error("Configure VITE_API_UPLOAD_ENDPOINT to upload files. You can also paste an already hosted file URL.");
    }
    const formData = new FormData();
    formData.append("file", file);
    const result = await request(endpoints.uploads, { method: "POST", body: formData, isFormData: true });
    const url = result?.url || result?.fileUrl || result?.file_url || result?.data?.url || result?.data?.file_url;
    if (!url) throw new Error("The upload API did not return a file URL.");
    return { url, result };
  },
};

export const teacherApiEndpoints = endpoints;
