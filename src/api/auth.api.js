
import API from "./axiosInstance";

// Register a new user
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

// Set initial password after registration
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

// Login user
export const loginUser = async (credentials) => {
  const response = await API.post(
    "/api/auth/login",
    credentials,
    { requiresAuth: false }
  );

  return response.data;
};

// Send password reset link to registered email
export const forgotPassword = async (email) => {
  const response = await API.post(
    "/api/auth/forgot-password",
    { email },
    {
      requiresAuth: false,
    }
  );

  return response.data;
};

// Reset existing password using email reset token
export const resetPassword = async ({
  token,
  password,
  confirmPassword,
}) => {
  const response = await API.post(
    "/api/auth/reset-password",
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
