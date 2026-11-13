
const SESSION_KEYS = Object.freeze({
  accessToken: "skillnext.accessToken",
  refreshToken: "skillnext.refreshToken",
  userId: "skillnext.userId",
  role: "skillnext.role",
});

const getStorage = () => {
  if (typeof window === "undefined") return null;
  return window.sessionStorage;
};

// Get session value
const getSessionValue = (key) => {
  try {
    return getStorage()?.getItem(key) ?? null;
  } catch {
    return null;
  }
};

// Getters
export const getAccessToken = () =>
  getSessionValue(SESSION_KEYS.accessToken);

export const getRefreshToken = () =>
  getSessionValue(SESSION_KEYS.refreshToken);

export const getUserId = () =>
  getSessionValue(SESSION_KEYS.userId);

export const getUserRole = () =>
  getSessionValue(SESSION_KEYS.role);

// Check authentication
export const hasAuthSession = () =>
  Boolean(getAccessToken());

// Create session after successful authentication
export const createAuthSession = ({
  accessToken,
  refreshToken,
  userId,
  role,
}) => {
  const storage = getStorage();

  if (!storage) {
    throw new Error("Session storage is unavailable.");
  }

  if (!accessToken || typeof accessToken !== "string") {
    throw new Error("Valid access token is required.");
  }

  clearAuthSession();

  const sessionData = {
    [SESSION_KEYS.accessToken]: accessToken,
    [SESSION_KEYS.refreshToken]: refreshToken,
    [SESSION_KEYS.userId]: userId,
    [SESSION_KEYS.role]: role,
  };

  try {
    Object.entries(sessionData).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        storage.setItem(key, String(value));
      }
    });
  } catch {
    clearAuthSession();
    throw new Error("Unable to create authentication session.");
  }
};

// Clear session during logout
export const clearAuthSession = () => {
  try {
    const storage = getStorage();

    Object.values(SESSION_KEYS).forEach((key) => {
      storage?.removeItem(key);
    });
  } catch {
    // Storage unavailable
  }
};
