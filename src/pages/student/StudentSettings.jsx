import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  AlertCircle,
  Bell,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  Lock,
  LockKeyhole,
  MapPin,
  Pencil,
  RefreshCw,
  Save,
  UserRound,
  X,
} from "lucide-react";

import StudentPageHeader from "../../components/student/StudentPageHeader";
import { Card, IconBadge, PageShell } from "../../components/student/ui";
import Loader from "../../components/Loader";

import { getProfile, updateProfile } from "../../api/profile.api";
import { getUserRole } from "../../services/authSession";
import { getApiErrorMessage } from "../../utils/apiErrorHandler";

/* ------------------------------------------------------------------ */
/* Field configuration                                                */
/* Required: First Name and Last Name only. Email is read-only.       */
/* ------------------------------------------------------------------ */

const DEFAULT_MAX_LENGTH = 150;

const PERSONAL_FIELDS = [
  { name: "firstName", label: "First Name", required: true, maxLength: 60 },
  { name: "lastName", label: "Last Name", required: true, maxLength: 60 },
];

const CONTACT_FIELDS = [
  { name: "phone", label: "Phone Number", type: "tel" },
  { name: "countryCode", label: "Country Code", placeholder: "Example: +91" },
  { name: "country", label: "Country" },
  { name: "state", label: "State" },
  { name: "stateCode", label: "State Code" },
  { name: "city", label: "City" },
];

const EDUCATION_FIELDS = [
  { name: "institution", label: "Institution" },
  { name: "educationLevel", label: "Education Level" },
  { name: "course", label: "Course" },
  { name: "studyYear", label: "Study Year" },
];

const TEACHER_FIELDS = [
  { name: "department", label: "Department" },
  { name: "subject", label: "Subject" },
  { name: "designation", label: "Designation" },
];

const STUDENT_GROUPS = [
  {
    id: "personal",
    title: "Personal Information",
    description: "Your name as it appears across the platform.",
    icon: UserRound,
    fields: PERSONAL_FIELDS,
  },
  {
    id: "contact",
    title: "Contact & Location",
    description: "How we can reach you and where you are based.",
    icon: MapPin,
    fields: CONTACT_FIELDS,
  },
  {
    id: "education",
    title: "Education Details",
    description: "Your academic background.",
    icon: GraduationCap,
    fields: EDUCATION_FIELDS,
  },
];

const TEACHER_GROUPS = [
  ...STUDENT_GROUPS,
  {
    id: "professional",
    title: "Professional Details",
    description: "Your teaching role and expertise.",
    icon: Briefcase,
    fields: TEACHER_FIELDS,
  },
];

const EMPTY_PROFILE = {
  firstName: "",
  lastName: "",
  phone: "",
  countryCode: "",
  country: "",
  state: "",
  stateCode: "",
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

const ALL_PROFILE_KEYS = Object.keys(EMPTY_PROFILE).filter(
  (key) => key !== "email"
);

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

const toSnakeCase = (key) =>
  key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

// "First Name" -> "First name"
const toSentenceCase = (text) =>
  text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();

const trimmed = (value) => String(value ?? "").trim();

const getInitials = ({ firstName, lastName }) =>
  [firstName, lastName]
    .filter(Boolean)
    .map((part) => part.trim().charAt(0).toUpperCase())
    .join("") || "U";

// Read the profile from any supported API response shape and
// map backend fields (camelCase or snake_case) to the form shape.
const normalizeProfileResponse = (response) => {
  let data = response?.data ?? response;

  if (data?.success === false) {
    throw new Error(data.message || "Unable to load your profile.");
  }

  if (data && typeof data === "object" && data.data != null) {
    data = data.data;
  }

  if (data?.profile && typeof data.profile === "object") {
    data = data.profile;
  } else if (data?.user && typeof data.user === "object") {
    data = data.user;
  }

  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch {
      throw new Error("The profile API returned an unexpected response.");
    }
  }

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("The profile API returned an invalid response.");
  }

  const profile = { ...EMPTY_PROFILE };

  ALL_PROFILE_KEYS.forEach((key) => {
    const value = data[key] ?? data[toSnakeCase(key)];
    profile[key] = value == null ? "" : String(value);
  });

  profile.email = String(
    data.email ?? data.emailAddress ?? data.email_address ?? ""
  );

  return profile;
};

// Single source of error text: the shared API error handler.
// Errors thrown locally (no HTTP response) keep their own message.
const getErrorMessage = (error, fallback) => {
  if (!error?.response && !error?.request && error?.message) {
    return error.message;
  }

  return getApiErrorMessage(error, fallback);
};

// Map backend validation errors to the fields shown for this role.
const getServerFieldErrors = (error, allowedFields) => {
  const body = error?.response?.data;
  const fieldErrors = {};

  if (Array.isArray(body?.detail)) {
    body.detail.forEach((item) => {
      const field = Array.isArray(item?.loc)
        ? item.loc[item.loc.length - 1]
        : "";

      if (allowedFields.includes(field)) {
        fieldErrors[field] = item?.msg || "Please check this field.";
      }
    });
  }

  Object.entries(body?.errors || {}).forEach(([field, message]) => {
    if (allowedFields.includes(field)) {
      fieldErrors[field] = Array.isArray(message)
        ? message[0]
        : String(message);
    }
  });

  return fieldErrors;
};

// Client-side validation for the fields of one section.
const validateProfile = (profile, fields) => {
  const errors = {};

  // Required and max-length rules
  fields.forEach((field) => {
    const value = trimmed(profile[field.name]);
    const limit = field.maxLength ?? DEFAULT_MAX_LENGTH;
    const sentence = toSentenceCase(field.label);

    if (field.required && !value) {
      errors[field.name] = `${sentence} is required.`;
    } else if (value.length > limit) {
      errors[field.name] = field.maxLength
        ? `${sentence} cannot exceed ${limit} characters.`
        : "This field cannot exceed 150 characters.";
    }
  });

  // Phone number: 7 to 15 digits when provided
  const phone = trimmed(profile.phone);
  if (phone && fields.some((field) => field.name === "phone")) {
    const digits = phone.replace(/\D/g, "").length;
    if (digits < 7 || digits > 15) {
      errors.phone = "Enter a valid phone number containing 7 to 15 digits.";
    }
  }

  return errors;
};

// Build the PUT payload from role fields only (email is never sent).
const createProfilePayload = (profile, fields) =>
  fields.reduce((payload, field) => {
    payload[field.name] = trimmed(profile[field.name]);
    return payload;
  }, {});

/* ------------------------------------------------------------------ */
/* UI components                                                      */
/* ------------------------------------------------------------------ */

// Centered popup for success and error messages
function MessageDialog({ dialog, onClose }) {
  const buttonRef = useRef(null);

  // Close on Escape and focus the action button
  useEffect(() => {
    if (!dialog) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    buttonRef.current?.focus();
    document.addEventListener("keydown", onKeyDown);

    return () => document.removeEventListener("keydown", onKeyDown);
  }, [dialog, onClose]);

  if (!dialog) return null;

  const isError = dialog.type === "error";

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-[#063B43]/55 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role={isError ? "alertdialog" : "dialog"}
        aria-modal="true"
        aria-labelledby="message-dialog-title"
        aria-describedby="message-dialog-text"
        className="w-full max-w-[380px] overflow-hidden rounded-3xl border border-[#E2EAE7] bg-white text-center shadow-[0_24px_70px_rgba(6,66,75,0.3)]"
      >
        {/* Accent bar: amber for success, red for error */}
        <div className={`h-1.5 ${isError ? "bg-[#D97770]" : "bg-[#FFAB0B]"}`} />

        <div className="px-6 pb-6 pt-7">
          <span
            className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${
              isError
                ? "bg-[#FFF1EE] text-[#C0392B]"
                : "bg-[#E8F7EF] text-[#28765E]"
            }`}
          >
            {isError ? <AlertCircle size={28} /> : <CheckCircle2 size={28} />}
          </span>

          <h2
            id="message-dialog-title"
            className="mt-4 text-lg font-bold text-[#06424B]"
          >
            {isError ? "Something went wrong" : "Profile updated"}
          </h2>

          <p
            id="message-dialog-text"
            className="mt-2 break-words text-sm leading-6 text-[#5A7478]"
          >
            {dialog.message}
          </p>

          <button
            ref={buttonRef}
            type="button"
            onClick={onClose}
            className="mt-6 h-11 w-full rounded-xl bg-[#06424B] text-sm font-semibold text-white transition-colors hover:bg-[#0A515B] focus:outline-none focus:ring-4 focus:ring-[#FFAB0B]/30"
          >
            {isError ? "Close" : "Done"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// Editable input with inline validation message
function ProfileInput({ field, value, error, disabled, onChange }) {
  const id = `settings-${field.name}`;

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-[13px] font-semibold text-[#06424B]"
      >
        {field.label}
        {field.required && <span className="ml-1 text-[#C0392B]">*</span>}
      </label>

      <input
        id={id}
        name={field.name}
        type={field.type || "text"}
        value={value}
        onChange={(event) => onChange(field.name, event.target.value)}
        placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
        maxLength={field.maxLength ?? DEFAULT_MAX_LENGTH}
        disabled={disabled}
        aria-required={field.required || undefined}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`h-12 w-full rounded-xl border bg-white px-4 text-sm text-[#2F4A4E] outline-none transition-all placeholder:text-[#9AABAD] focus:ring-4 disabled:cursor-not-allowed disabled:bg-[#F5F7F7] ${
          error
            ? "border-[#D97770] focus:border-[#C0392B] focus:ring-[#D97770]/15"
            : "border-[#D5E4E2] focus:border-[#06424B] focus:ring-[#FFAB0B]/25"
        }`}
      />

      {error && (
        <p
          id={`${id}-error`}
          className="mt-1.5 text-xs font-medium text-[#C0392B]"
        >
          {error}
        </p>
      )}
    </div>
  );
}

// Read-only value shown until the section is opened for editing
function ProfileValue({ field, value }) {
  const text = trimmed(value);

  return (
    <div className="min-w-0 rounded-xl border border-[#E5ECEA] bg-[#F8FAF9] px-4 py-3">
      <p className="text-xs font-semibold text-[#6C8589]">{field.label}</p>

      {text ? (
        <p className="mt-1 break-words text-sm font-semibold text-[#06424B]">
          {text}
        </p>
      ) : (
        <p className="mt-1 text-sm italic text-[#9AABAD]">Not provided</p>
      )}
    </div>
  );
}

// Card wrapper with an optional action (pencil icon or status) in the header
function SettingsSection({
  id,
  title,
  description,
  icon: Icon,
  action,
  children,
}) {
  return (
    <section id={`section-${id}`} className="scroll-mt-6">
      <Card className="p-5 sm:p-7">
        <div className="flex items-center gap-4">
          <IconBadge icon={Icon} />

          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-[#06424B]">{title}</h2>
            <p className="text-sm text-[#5A7478]">{description}</p>
          </div>

          {action}
        </div>

        <div className="mt-6">{children}</div>
      </Card>
    </section>
  );
}

// Page-shaped placeholder shown during the first load
function SettingsSkeleton() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Loading profile">
      {[0, 1, 2].map((section) => (
        <Card key={section} className="p-5 sm:p-7">
          <div className="flex animate-pulse items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-[#E4EEEC]" />
            <div className="space-y-2">
              <div className="h-4 w-44 rounded bg-[#E4EEEC]" />
              <div className="h-3 w-64 rounded bg-[#EEF4F3]" />
            </div>
          </div>

          <div className="mt-6 grid animate-pulse gap-5 sm:grid-cols-2">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="h-[62px] rounded-xl bg-[#EEF4F3]" />
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                               */
/* ------------------------------------------------------------------ */

function StudentSettings() {
  const isTeacher =
    String(getUserRole() || "student").trim().toLowerCase() === "teacher";
  const roleLabel = isTeacher ? "Teacher" : "Student";

  // Form sections and fields depend on the logged-in role
  const groups = isTeacher ? TEACHER_GROUPS : STUDENT_GROUPS;
  const profileFields = useMemo(
    () => groups.flatMap((group) => group.fields),
    [groups]
  );
  const profileFieldKeys = useMemo(
    () => profileFields.map((field) => field.name),
    [profileFields]
  );

  // profile stays null until the first load finishes, so nothing flashes
  const [profile, setProfile] = useState(null);
  const [draftProfile, setDraftProfile] = useState(EMPTY_PROFILE);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [dialog, setDialog] = useState(null);

  const saved = profile ?? EMPTY_PROFILE;
  const fullName = [saved.firstName, saved.lastName].filter(Boolean).join(" ");
  const initials = getInitials(saved);

  // True when any field differs from the saved profile
  const isDirty = useMemo(
    () =>
      Boolean(profile) &&
      profileFields.some(
        (field) =>
          trimmed(draftProfile[field.name]) !== trimmed(profile[field.name])
      ),
    [draftProfile, profile, profileFields]
  );

  // Open the popup; focusField moves the cursor to a field once it closes
  const showDialog = useCallback(
    (type, message, focusField) => setDialog({ type, message, focusField }),
    []
  );

  const closeDialog = useCallback(() => {
    const focusField = dialog?.focusField;
    setDialog(null);

    if (focusField) {
      requestAnimationFrame(() =>
        document.getElementById(`settings-${focusField}`)?.focus()
      );
    }
  }, [dialog]);

  // Load the profile. A first-load failure shows an inline error card;
  // a failed refresh keeps the page and reports the error in the popup.
  const loadProfile = useCallback(
    async (isRefresh = false) => {
      setIsLoading(true);
      setLoadError("");

      try {
        const latestProfile = normalizeProfileResponse(await getProfile());
        setProfile(latestProfile);
        setDraftProfile(latestProfile);
        setIsEditing(false);
        setFieldErrors({});
      } catch (error) {
        console.error("Get Profile API Error:", error);

        const message = getErrorMessage(
          error,
          "Unable to load your profile. Please try again."
        );

        if (isRefresh) {
          showDialog("error", message);
        } else {
          setLoadError(message);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [showDialog]
  );

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Warn before leaving the page with unsaved changes
  useEffect(() => {
    if (!isDirty) return undefined;

    const onBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  // Switch the whole page to edit mode (pencil icon)
  const startEditing = () => {
    setDraftProfile({ ...saved });
    setFieldErrors({});
    setIsEditing(true);

    requestAnimationFrame(() =>
      document.getElementById(`settings-${profileFields[0].name}`)?.focus()
    );
  };

  // Leave edit mode and restore the saved values
  const cancelEditing = () => {
    setDraftProfile(saved);
    setFieldErrors({});
    setIsEditing(false);
  };

  // Update a field and clear its error
  const handleFieldChange = useCallback((name, value) => {
    setDraftProfile((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: "" }));
  }, []);

  // Validate, save, then confirm with a popup
  const handleSave = async (event) => {
    event.preventDefault();
    if (isSaving || isLoading || !isEditing) return;

    // Nothing changed: just close the editor
    if (!isDirty) {
      cancelEditing();
      return;
    }

    const errors = validateProfile(draftProfile, profileFields);
    setFieldErrors(errors);

    const firstInvalid = profileFieldKeys.find((key) => errors[key]);
    if (firstInvalid) {
      showDialog(
        "error",
        "Please correct the highlighted fields before saving.",
        firstInvalid
      );
      return;
    }

    const payload = createProfilePayload(draftProfile, profileFields);
    let outcome;

    setIsSaving(true);

    try {
      const response = await updateProfile(payload);

      if (response?.success === false) {
        throw new Error(response.message || "Unable to update your profile.");
      }

      // Show the new values immediately
      const updatedProfile = { ...saved, ...payload };
      setProfile(updatedProfile);
      setDraftProfile(updatedProfile);
      setIsEditing(false);

      outcome = {
        type: "success",
        message: "Your profile has been updated successfully.",
      };
    } catch (error) {
      console.error("Update Profile API Error:", error);

      const serverErrors = getServerFieldErrors(error, profileFieldKeys);
      setFieldErrors(serverErrors);

      outcome = {
        type: "error",
        message: getErrorMessage(
          error,
          "Unable to save your profile. Please try again."
        ),
        focusField: profileFieldKeys.find((key) => serverErrors[key]),
      };
    } finally {
      setIsSaving(false);
    }

    // The loader has closed by now, so the popup is never covered
    showDialog(outcome.type, outcome.message, outcome.focusField);

    // Silent sync with the backend; a failure does not undo the save
    if (outcome.type === "success") {
      try {
        const latestProfile = normalizeProfileResponse(await getProfile());
        setProfile(latestProfile);
        setDraftProfile(latestProfile);
      } catch (refreshError) {
        console.warn("Profile saved, but syncing failed:", refreshError);
      }
    }
  };

  const scrollToSection = (id) =>
    document
      .getElementById(`section-${id}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });

  const navItems = [
    ...groups.map(({ id, title, icon }) => ({ id, title, icon })),
    { id: "account", title: "Account Information", icon: LockKeyhole },
  ];

  const isFirstLoad = isLoading && !profile;
  const showContent = Boolean(profile) && !loadError;

  // Same loader as the dashboard, with a message for each state
  const loaderText = isSaving
    ? "Saving your changes..."
    : profile
      ? "Refreshing your profile..."
      : "Loading your profile...";

  return (
    <>
      <PageShell max="max-w-[1100px]">
        <StudentPageHeader
          title="Settings"
          subtitle="Manage your personal information and account preferences."
        />

        <div className="grid gap-6 lg:grid-cols-[270px_minmax(0,1fr)] lg:items-start">
          {/* Sidebar: profile summary and section navigation */}
          <aside className="space-y-4 lg:sticky lg:top-6">
            <Card className="overflow-hidden p-0">
              <div className="relative overflow-hidden bg-gradient-to-br from-[#06424B] to-[#0B5C66] px-5 py-6 text-center text-white">
                <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full border-[16px] border-white/[0.07]" />

                {isFirstLoad ? (
                  <div
                    className="relative animate-pulse"
                    aria-label="Loading profile"
                  >
                    <div className="mx-auto h-16 w-16 rounded-full bg-white/15" />
                    <div className="mx-auto mt-3 h-4 w-32 rounded bg-white/15" />
                    <div className="mx-auto mt-2 h-3 w-40 rounded bg-white/10" />
                    <div className="mx-auto mt-3 h-6 w-20 rounded-full bg-white/15" />
                  </div>
                ) : (
                  <div className="relative">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/25 bg-white/10 text-xl font-extrabold text-[#FFAB0B]">
                      {initials}
                    </div>

                    <h2 className="mt-3 truncate text-base font-bold">
                      {fullName || `${roleLabel} profile`}
                    </h2>

                    <p className="mt-0.5 truncate text-xs text-white/70">
                      {saved.email || `${roleLabel} account`}
                    </p>

                    <span className="mt-3 inline-block rounded-full bg-[#FFAB0B] px-3 py-1 text-[11px] font-bold text-[#06424B]">
                      {roleLabel}
                    </span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => loadProfile(true)}
                disabled={isLoading || isSaving || isEditing}
                className="flex w-full items-center justify-center gap-2 border-t border-[#EAF0EE] px-4 py-3 text-xs font-semibold text-[#06424B] transition-colors hover:bg-[#F4F7F7] disabled:opacity-50"
              >
                <RefreshCw size={14} />
                Refresh profile
              </button>
            </Card>

            {showContent && (
              <Card className="hidden p-2 lg:block">
                <nav aria-label="Settings sections">
                  {navItems.map(({ id, title, icon: Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => scrollToSection(id)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-semibold text-[#3F5C60] transition-colors hover:bg-[#EEF5F4] hover:text-[#06424B]"
                    >
                      <Icon size={16} className="text-[#8A5F00]" />
                      <span className="flex-1">{title}</span>
                      <ChevronRight size={14} className="text-[#A5B0B1]" />
                    </button>
                  ))}
                </nav>
              </Card>
            )}
          </aside>

          {/* Main content */}
          <div className="min-w-0">
            {isFirstLoad && <SettingsSkeleton />}

            {!isLoading && loadError && (
              <Card className="flex flex-col items-center p-8 text-center sm:p-10">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF1EE] text-[#C0392B]">
                  <AlertCircle size={28} />
                </span>

                <h2 className="mt-4 text-lg font-bold text-[#06424B]">
                  We could not load your profile
                </h2>

                <p className="mt-2 max-w-md break-words text-sm leading-6 text-[#5A7478]">
                  {loadError}
                </p>

                <button
                  type="button"
                  onClick={() => loadProfile()}
                  className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-[#06424B] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#0A515B] focus:outline-none focus:ring-4 focus:ring-[#FFAB0B]/30"
                >
                  <RefreshCw size={15} />
                  Try again
                </button>
              </Card>
            )}

            {showContent && (
              <form onSubmit={handleSave} noValidate className="space-y-5">
                {/* Edit toggle: one pencil for the whole page */}
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#D5E4E2] bg-white px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#06424B]">
                      Profile details
                    </p>
                    <p className="text-xs text-[#6C8589]">
                      {isEditing
                        ? "Update your details, then save your changes at the bottom."
                        : "Select the pencil to update your information."}
                    </p>
                  </div>

                  {isEditing ? (
                    <span className="shrink-0 rounded-full bg-[#FFF4D6] px-3 py-1 text-[11px] font-bold text-[#8A5F00]">
                      Editing
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={startEditing}
                      disabled={isSaving}
                      aria-label="Edit profile"
                      className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full border border-[#D5E4E2] bg-white px-4 text-xs font-bold text-[#06424B] transition-colors hover:border-[#FFAB0B] hover:bg-[#FFF4D6] focus:outline-none focus:ring-4 focus:ring-[#FFAB0B]/25 disabled:opacity-50"
                    >
                      <Pencil size={15} />
                      Edit profile
                    </button>
                  )}
                </div>

                {groups.map((group) => (
                  <SettingsSection
                    key={group.id}
                    id={group.id}
                    title={group.title}
                    description={group.description}
                    icon={group.icon}
                  >
                    <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
                      {group.fields.map((field) =>
                        isEditing ? (
                          <ProfileInput
                            key={field.name}
                            field={field}
                            value={draftProfile[field.name]}
                            error={fieldErrors[field.name]}
                            disabled={isSaving}
                            onChange={handleFieldChange}
                          />
                        ) : (
                          <ProfileValue
                            key={field.name}
                            field={field}
                            value={saved[field.name]}
                          />
                        )
                      )}
                    </div>
                  </SettingsSection>
                ))}

                {/* Email: read-only and never sent to the API */}
                <SettingsSection
                  id="account"
                  title="Account Information"
                  description="Your registered account details."
                  icon={LockKeyhole}
                  action={
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EEF3F4] px-3 py-1 text-[11px] font-bold text-[#526D71]">
                      <Lock size={12} />
                      Read only
                    </span>
                  }
                >
                  <ProfileValue
                    field={{ label: "Email Address" }}
                    value={saved.email}
                  />

                  <p className="mt-3 text-xs text-[#6C8589]">
                    Your email cannot be changed here. Password changes are
                    handled separately from profile settings.
                  </p>
                </SettingsSection>

                {/* Notifications (backend not available yet) */}
                <SettingsSection
                  id="notifications"
                  title="Learning Notifications"
                  description="Email and in-app notification preferences."
                  icon={Bell}
                  action={
                    <span className="rounded-full bg-[#FFF4D6] px-3 py-1 text-[11px] font-bold text-[#8A5F00]">
                      Coming soon
                    </span>
                  }
                >
                  <p className="rounded-xl border border-dashed border-[#D5E4E2] bg-[#F8FAF9] px-4 py-3 text-sm text-[#5A7478]">
                    These preferences will be available once the notification
                    settings service is connected.
                  </p>
                </SettingsSection>

                {/* Sticky action bar, shown only while editing */}
                {isEditing && (
                  <div className="sticky bottom-4 z-20 flex flex-col gap-3 rounded-2xl border border-[#D5E4E2] bg-white/95 p-3 shadow-[0_12px_35px_rgba(6,66,75,0.15)] backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:pl-5">
                    <p
                      role="status"
                      className={`flex items-center gap-2 text-xs font-semibold ${
                        isDirty ? "text-[#8A5F00]" : "text-[#6C8589]"
                      }`}
                    >
                      {isDirty ? (
                        <>
                          <span className="h-2 w-2 rounded-full bg-[#FFAB0B]" />
                          You have unsaved changes
                        </>
                      ) : (
                        <>
                          Fields marked with{" "}
                          <span className="text-[#C0392B]">*</span> are required
                        </>
                      )}
                    </p>

                    <div className="flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={cancelEditing}
                        disabled={isSaving}
                        className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#D5E4E2] bg-white px-4 text-sm font-semibold text-[#06424B] transition-colors hover:bg-[#F2F6F5] disabled:opacity-50"
                      >
                        <X size={15} />
                        Cancel
                      </button>

                      <button
                        type="submit"
                        disabled={!isDirty || isSaving}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#06424B] px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0A515B] focus:outline-none focus:ring-4 focus:ring-[#FFAB0B]/30 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Save size={15} />
                        Save changes
                      </button>
                    </div>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      </PageShell>

      {/* Dashboard loader: first load, refresh and save */}
      <Loader open={isLoading || isSaving} text={loaderText} />

      {/* Success and error popup */}
      <MessageDialog dialog={dialog} onClose={closeDialog} />
    </>
  );
}

export default StudentSettings;