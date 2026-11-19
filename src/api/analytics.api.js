import API from "./axiosInstance";

// GET /api/analytics/me
export const getMyAnalytics = async () => {
  const response = await API.get("/api/analytics/me", {
    requiresAuth: true,
  });

  if (response?.data?.success === false) {
    throw new Error(
      response.data.message || "Unable to load student analytics."
    );
  }

  return response.data;
};