import API from "./axiosInstance";

// Share simultaneous dashboard requests.
let dashboardRequest = null;

// Get student dashboard data.
export const getStudentDashboard = () => {
  if (dashboardRequest) {
    return dashboardRequest;
  }

  dashboardRequest = API.get("/api/dashboard/me", {
    requiresAuth: true,
  })
    .then((response) => response.data)
    .finally(() => {
      dashboardRequest = null;
    });

  return dashboardRequest;
};