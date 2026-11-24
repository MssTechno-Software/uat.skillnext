import axios from "axios";
import { getAccessToken } from "../services/authSession";
import i18n from "../i18n";

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

    // Send the selected language to endpoints that provide localized content.
    config.headers["Accept-Language"] = i18n.resolvedLanguage || i18n.language || "en";

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

// Centralized response error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
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