import axios from "axios";
import { getAccessToken } from "../services/authSession";
import i18n from "../i18n";
import { registerApiContent, translateApiContent, preloadApiContentTranslation } from "../services/apiContentTranslation";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach authentication token automatically
API.interceptors.request.use(
  (config) => {
    const requiresAuth = config.requiresAuth !== false;

    // Preserve the authentication requirement for response handling
    config.requiresAuth = requiresAuth;

    if (requiresAuth) {
      const token = getAccessToken();

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Translate all learner-facing API responses, while leaving authentication,
// personal profile, administrative, teacher-authoring, and translation calls
// untouched. Student content endpoints may vary as the LMS grows, so matching
// is intentionally based on API namespace rather than a short endpoint list.
const shouldTranslateApiResponse = (config = {}) => {
  if (config.skipDynamicTranslation === true) return false;

  const method = String(config.method || "get").toLowerCase();
  const rawUrl = String(config.url || "");
  let pathname = rawUrl.split("?")[0];

  try {
    pathname = new URL(rawUrl, config.baseURL || window.location.origin).pathname;
  } catch {
    // Keep the relative path when URL parsing is unavailable.
  }

  if (!/^\/api\//i.test(pathname)) return false;

  // Do not translate private identity/authentication data, teacher editing data,
  // admin datasets, or the translation endpoint itself.
  const excludedPath = /^\/api\/(?:auth|profile|users?|students?|teachers?|teacher|admin|translation)(?:\/|$)/i;
  if (excludedPath.test(pathname)) return false;

  // All remaining GET responses are treated as read-only application data.
  if (method === "get") return true;

  // These write operations return learner-facing content/status messages or
  // assessment results, but their request payloads are never translated.
  if (method === "post") {
    return (
      /^\/api\/assessments\/[^/]+\/start\/?$/i.test(pathname) ||
      /^\/api\/attempts\/[^/]+\/submit\/?$/i.test(pathname) ||
      /^\/api\/modules\/[^/]+\/(?:complete|restart)\/?$/i.test(pathname) ||
      /^\/api\/courses\/enroll\/me\/?$/i.test(pathname)
    );
  }

  if (method === "delete") {
    return /^\/api\/enrollments\/me\/[^/]+\/?$/i.test(pathname);
  }

  return false;
};

// Prepare French API content BEFORE React receives it. This deliberately uses
// the page's existing API loading state on first visits, so English lesson text
// is never painted briefly and then replaced by French. Cached French content is
// returned immediately on repeat visits. English mode remains non-blocking.
API.interceptors.response.use(
  async (response) => {
    if (!shouldTranslateApiResponse(response.config)) return response;

    const sourceData = response.data;
    const language = String(i18n.resolvedLanguage || i18n.language || "en")
      .toLowerCase()
      .split("-")[0];

    if (language === "fr") {
      // Strict mode fails the API request rather than rendering English content
      // under a French language selection when a translation batch fails.
      response.data = await translateApiContent(sourceData, language, { strict: true });
    } else {
      // Remember English source text for a later pre-activation French warm-up.
      registerApiContent(sourceData);
    }

    return response;
  },
  (error) => {
    if (
      error.response &&
      error.response.status !== 401 &&
      shouldTranslateApiResponse(error.config)
    ) {
      const sourceData = error.response.data;
      const language = i18n.resolvedLanguage || i18n.language || "en";

      void preloadApiContentTranslation(sourceData, language).catch((translationError) => {
        console.warn(
          "API error text could not be translated; original message remains available.",
          translationError,
        );
      });
    }

    if (
      error.response?.status === 401 &&
      error.config?.requiresAuth === true
    ) {
      window.dispatchEvent(new Event("session-expired"));
    }

    return Promise.reject(error);
  }
);

export default API;