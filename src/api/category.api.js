import API from "./axiosInstance";

export const getCategories = async (params = {}) => {
  const response = await API.get("/api/categories", {
    params,
    requiresAuth: true,
  });

  return response.data;
};