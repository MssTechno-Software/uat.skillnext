import API from "./axiosInstance";

export const registerUser = async (registrationDetails) => {
  const response = await API.post(
    "/api/auth/register",
    registrationDetails,
    {
      requiresAuth: false,
    }
  );

  return response.data;
};

// Resend Email Verification
export const resendVerification = async (email) => {
  const response = await API.post(
    "/api/auth/resend-verification",
    { email },
    { requiresAuth: false }
  );

  return response.data;
};

export const setUserPassword = async ({
  token,
  password,
  confirmPassword,
}) => {
  const response = await API.post(
    "/api/auth/set-password",
    {
      token,
      password,
      confirmPassword,
    },
    {
      requiresAuth: false,
    }
  );

  return response.data;
};
export const loginUser = async (credentials) => {
  const response = await API.post(
    "/api/auth/login",
    credentials,
    { requiresAuth: false }
  );

  return response.data;
};