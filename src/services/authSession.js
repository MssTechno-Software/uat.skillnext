const SESSION_KEYS = Object.freeze({
  accessToken: "skillnext.accessToken",
  refreshToken: "skillnext.refreshToken",
  userId: "skillnext.userId",
  role: "skillnext.role",
  firstName: "skillnext.firstName",
  lastName: "skillnext.lastName",
  email: "skillnext.email",
});

const getStorage = () => {
  if (typeof window === "undefined") return null;
  return window.sessionStorage;
};

const getSessionValue = (key) => {
  try {
    return getStorage()?.getItem(key) ?? null;
  } catch {
    return null;
  }
};

// Existing getters
export const getAccessToken = () =>
  getSessionValue(SESSION_KEYS.accessToken);

export const getRefreshToken = () =>
  getSessionValue(SESSION_KEYS.refreshToken);

export const getUserId = () =>
  getSessionValue(SESSION_KEYS.userId);

export const getUserRole = () =>
  getSessionValue(SESSION_KEYS.role);

// New profile getters
export const getFirstName = () =>
  getSessionValue(SESSION_KEYS.firstName);

export const getLastName = () =>
  getSessionValue(SESSION_KEYS.lastName);

export const getUserEmail = () =>
  getSessionValue(SESSION_KEYS.email);

// Authentication check
export const hasAuthSession = () =>
  Boolean(getAccessToken());

// Create session after successful login
export const createAuthSession = ({
  accessToken,
  refreshToken,
  userId,
  role,
  firstName,
  lastName,
  email,
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
    [SESSION_KEYS.firstName]: firstName,
    [SESSION_KEYS.lastName]: lastName,
    [SESSION_KEYS.email]: email,
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

// Clear complete session during logout
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