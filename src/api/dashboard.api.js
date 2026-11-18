import API from "./axiosInstance";

// Fetch the logged-in student's dashboard summary and enrolled courses.
export const getStudentDashboard = async () => {
  const response = await API.get("/api/dashboard/me", {
    requiresAuth: true,
  });

  return response.data;
};