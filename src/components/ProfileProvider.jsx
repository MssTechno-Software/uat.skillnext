import { translateValue } from "../i18n";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { getProfile } from "../api/profile.api";

const ProfileContext = createContext(null);

const EMPTY_PROFILE = {
  firstName: "",
  lastName: "",
  phone: "",
  country: "",
  state: "",
  city: "",
  institution: "",
  educationLevel: "",
  course: "",
  studyYear: "",
  department: "",
  subject: "",
  designation: "",
  email: "",
};
// Shared cache prevents repeated profile GET requests.
let profileCache = null;
let profileRequest = null;

const toSnakeCase = (key) =>
  key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

const normalizeProfile = (response) => {
  let data = response?.data ?? response;

  if (data?.success === false) {
    throw new Error(data.message || "Unable to load your profile.");
  }

  if (data?.data != null) {
    data = data.data;
  }

  if (data?.profile && typeof data.profile === "object") {
    data = data.profile;
  } else if (data?.user && typeof data.user === "object") {
    data = data.user;
  }

  if (
    !data ||
    typeof data !== "object" ||
    Array.isArray(data)
  ) {
    throw new Error("Invalid profile response.");
  }

  const profile = { ...EMPTY_PROFILE };

  Object.keys(EMPTY_PROFILE).forEach((key) => {
    const value = data[key] ?? data[toSnakeCase(key)];
    profile[key] = value == null ? "" : String(value);
  });

  profile.email = String(
    data.email ??
      data.emailAddress ??
      data.email_address ??
      ""
  );

  return profile;
};

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(
    () => profileCache || EMPTY_PROFILE
  );

  const [isProfileLoading, setIsProfileLoading] = useState(
    () => !profileCache
  );

  const [profileError, setProfileError] = useState("");

  const refreshProfile = useCallback(async (force = false) => {
    // Reuse cached profile unless a refresh is requested.
    if (!force && profileCache) {
      setProfile(profileCache);
      setIsProfileLoading(false);
      setProfileError("");
      return profileCache;
    }

    // Reuse an ongoing request to avoid duplicate GET calls.
    if (profileRequest) {
      setIsProfileLoading(true);

      try {
        const data = await profileRequest;
        setProfile(data);
        setProfileError("");
        return data;
      } catch (error) {
        setProfileError(
          error?.message || "Unable to load your profile."
        );
        throw error;
      } finally {
        setIsProfileLoading(false);
      }
    }

    setIsProfileLoading(true);
    setProfileError("");

    if (force) {
      profileCache = null;
    }

    profileRequest = getProfile()
      .then(normalizeProfile)
      .then((data) => {
        profileCache = data;
        return data;
      })
      .finally(() => {
        profileRequest = null;
      });

    try {
      const data = await profileRequest;
      setProfile(data);
      return data;
    } catch (error) {
      setProfileError(
        error?.message || "Unable to load your profile."
      );
      throw error;
    } finally {
      setIsProfileLoading(false);
    }
  }, []);

  // Update shared profile data after a successful PUT request.
  const updateProfileData = useCallback((updates) => {
    setProfile((current) => {
      const updated = {
        ...current,
        ...updates,
      };

      profileCache = updated;
      return updated;
    });
  }, []);

  // Load profile once when the provider is mounted.
  useEffect(() => {
    refreshProfile().catch(() => {});
  }, [refreshProfile]);

  return (
    <ProfileContext.Provider
      value={{
        profile,
        isProfileLoading,
        profileError,
        refreshProfile,
        updateProfileData,
      }}
    >
      {translateValue(children)}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);

  if (!context) {
    throw new Error(
      "useProfile must be used inside ProfileProvider."
    );
  }

  return context;
}
