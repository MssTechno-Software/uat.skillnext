import API from "./axiosInstance";

// Fetch the authenticated user's profile.
export const getProfile = async () => {
  const response = await API.get("/api/profile", {
    requiresAuth: true,
  });

  return response.data;
};

// Update all profile fields supported by the backend.
export const updateProfile = async (profileData) => {
  if (
    !profileData ||
    typeof profileData !== "object" ||
    Array.isArray(profileData)
  ) {
    throw new Error("Valid profile details are required.");
  }

  const response = await API.put(
    "/api/profile",
    profileData,
    {
      requiresAuth: true,
    }
  );

  return response.data;
};