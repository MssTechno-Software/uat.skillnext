import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  LoaderCircle,
  Lock,
  Pencil,
  Save,
  Settings,
  X,
} from "lucide-react";

import { updateProfile } from "../../api/profile.api";
import { useProfile } from "../ProfileProvider";
import { getUserRole } from "../../services/authSession";
import { getApiErrorMessage } from "../../utils/apiErrorHandler";

/* ------------------------------------------------------------------ */
/* Field configuration                                                */
/* Required: First Name and Last Name only. Email is read-only.       */
/* ------------------------------------------------------------------ */

const DEFAULT_MAX_LENGTH = 150;

const PERSONAL_FIELDS = [
  {
    name: "firstName",
    label: "First Name",
    required: true,
    maxLength: 60,
    autoComplete: "given-name",
  },
  {
    name: "lastName",
    label: "Last Name",
    required: true,
    maxLength: 60,
    autoComplete: "family-name",
  },
];

const CONTACT_FIELDS = [
  { name: "phone", label: "Phone Number", type: "tel", autoComplete: "tel" },
  { name: "country", label: "Country", autoComplete: "country-name" },
  { name: "state", label: "State", autoComplete: "address-level1" },
  { name: "city", label: "City", autoComplete: "address-level2" },
];

const EDUCATION_FIELDS = [
  { name: "institution", label: "Institution" },
  { name: "educationLevel", label: "Education Level" },
  { name: "course", label: "Course" },
  { name: "studyYear", label: "Study Year" },
];

const TEACHER_ONLY_FIELDS = [
  { name: "department", label: "Department" },
  { name: "subject", label: "Subject" },
  { name: "designation", label: "Designation" },
];

const STUDENT_PROFILE_GROUPS = [
  { title: "Personal Information", fields: PERSONAL_FIELDS },
  { title: "Contact & Location", fields: CONTACT_FIELDS },
  { title: "Education Details", fields: EDUCATION_FIELDS },
];

const TEACHER_PROFILE_GROUPS = [
  ...STUDENT_PROFILE_GROUPS,
  { title: "Professional Details", fields: TEACHER_ONLY_FIELDS },
];

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

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

// "First Name" -> "First name"
const toSentenceCase = (text) =>
  text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();

const formatRole = (role) => {
  const value = String(role || "student").trim().toLowerCase();
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const getInitials = ({ firstName, lastName }) =>
  [firstName, lastName]
    .filter(Boolean)
    .map((part) => part.trim().charAt(0).toUpperCase())
    .join("") || "U";

// Single source of error text: the shared API error handler.
// Errors thrown locally (no HTTP response) keep their own message.
const getErrorMessage = (error, fallback) => {
  if (!error?.response && !error?.request && error?.message) {
    return error.message;
  }

  return getApiErrorMessage(error, fallback);
};

// Map backend validation errors (detail[].loc) to the visible fields.
const getServerFieldErrors = (error, allowedKeys) => {
  const details = error?.response?.data?.detail;
  if (!Array.isArray(details)) return {};

  return details.reduce((result, item) => {
    const field = Array.isArray(item?.loc) ? item.loc[item.loc.length - 1] : "";

    if (allowedKeys.includes(field)) {
      result[field] = item?.msg || "Please check this value.";
    }

    return result;
  }, {});
};

// Client-side validation, run before the PUT request.
const validateProfile = (profile, fields) => {
  const errors = {};
  const valueOf = (name) => String(profile[name] || "").trim();

  // Required and max-length rules
  fields.forEach((field) => {
    const value = valueOf(field.name);
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
  const phone = valueOf("phone");
  if (phone) {
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
    payload[field.name] = String(profile[field.name] ?? "").trim();
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
        <div
          className={`h-1.5 ${isError ? "bg-[#D97770]" : "bg-[#FFAB0B]"}`}
        />

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
            className={`mt-6 h-11 w-full rounded-xl text-sm font-semibold transition-colors focus:outline-none focus:ring-4 ${
              isError
                ? "bg-[#06424B] text-white hover:bg-[#0A515B] focus:ring-[#06424B]/20"
                : "bg-[#06424B] text-white hover:bg-[#0A515B] focus:ring-[#FFAB0B]/30"
            }`}
          >
            {isError ? "Close" : "Done"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function Avatar({ initials, size = "md", loading = false }) {
  const sizes = {
    sm: "h-full w-full text-sm",
    md: "h-12 w-12 text-sm",
    lg: "h-14 w-14 text-base",
  };

  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full bg-[#06424B] font-bold text-[#FFAB0B] ${sizes[size]}`}
    >
      {loading ? <LoaderCircle size={17} className="animate-spin" /> : initials}
    </span>
  );
}

function MenuItem({ icon: Icon, title, description, iconClass }) {
  return (
    <span className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors group-hover/item:bg-[#EEF5F4]">
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconClass}`}
      >
        <Icon size={17} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-semibold text-[#06424B]">
          {title}
        </span>
        <span className="mt-0.5 block text-[11px] text-[#6C8589]">
          {description}
        </span>
      </span>

      <ChevronRight size={15} className="text-[#A5B0B1]" />
    </span>
  );
}

function FormField({ field, value, error, disabled, onChange }) {
  const id = `profile-${field.name}`;

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-[12px] font-semibold text-[#06424B]"
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
        autoComplete={field.autoComplete}
        maxLength={field.maxLength ?? DEFAULT_MAX_LENGTH}
        aria-required={field.required || undefined}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        disabled={disabled}
        className={`h-11 w-full rounded-xl border bg-white px-4 text-[13px] text-[#2F4A4E] outline-none transition-all placeholder:text-[#9AABAD] focus:ring-4 disabled:cursor-not-allowed disabled:bg-[#F5F7F7] ${
          error
            ? "border-[#D97770] focus:border-[#C0392B] focus:ring-[#D97770]/15"
            : "border-[#D5E4E2] focus:border-[#06424B] focus:ring-[#FFAB0B]/25"
        }`}
      />

      {error && (
        <p
          id={`${id}-error`}
          className="mt-1.5 text-[11px] font-medium text-[#C0392B]"
        >
          {error}
        </p>
      )}
    </div>
  );
}

// Edit profile dialog, rendered in a portal so it always sits on top
function EditProfileModal({
  roleLabel,
  groups,
  draft,
  email,
  initials,
  fullName,
  fieldErrors,
  isSaving,
  onChange,
  onSubmit,
  onClose,
}) {
  // Close on Escape and lock page scroll while open
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#063B43]/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-profile-title"
        className="flex max-h-[90vh] w-full max-w-[760px] flex-col overflow-hidden rounded-3xl border border-[#E2EAE7] bg-white shadow-[0_24px_70px_rgba(6,66,75,0.25)]"
      >
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#F0E3BE] bg-[#FFFCF3] px-6 py-5">
          <div className="min-w-0">
            <h2
              id="edit-profile-title"
              className="text-xl font-bold text-[#06424B]"
            >
              Edit {roleLabel} profile
            </h2>
            <p className="mt-1 text-xs text-[#6C8589]">
              Update your personal, contact and education details.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E2EAEA] bg-white text-[#62797C] transition-colors hover:bg-[#FFF4D6] hover:text-[#06424B] disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={onSubmit}
          noValidate
          className="flex min-h-0 flex-1 flex-col"
        >
          {/* Scrollable body */}
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-6">
            {/* Identity summary */}
            <div className="flex items-center gap-4 rounded-2xl border border-[#E5ECEA] bg-[#F8FAF9] p-4">
              <Avatar initials={initials} size="lg" />

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[#06424B]">
                  {fullName || `${roleLabel} profile`}
                </p>
                <p className="mt-0.5 truncate text-xs text-[#6C8589]">
                  {email || `${roleLabel} account`}
                </p>
              </div>

              <span className="rounded-full bg-[#FFF4D6] px-3 py-1 text-[11px] font-bold text-[#8A5F00]">
                {roleLabel}
              </span>
            </div>

            {/* Role-specific sections */}
            {groups.map((group) => (
              <section key={group.title}>
                <h3 className="mb-3 flex items-center gap-2 text-[13px] font-bold text-[#06424B]">
                  <span className="h-4 w-1 rounded-full bg-[#FFAB0B]" />
                  {group.title}
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  {group.fields.map((field) => (
                    <FormField
                      key={field.name}
                      field={field}
                      value={draft[field.name]}
                      error={fieldErrors[field.name]}
                      disabled={isSaving}
                      onChange={onChange}
                    />
                  ))}
                </div>
              </section>
            ))}

            {/* Email: read-only and never sent to the API */}
            <section>
              <h3 className="mb-3 flex items-center gap-2 text-[13px] font-bold text-[#06424B]">
                <span className="h-4 w-1 rounded-full bg-[#FFAB0B]" />
                Account Information
              </h3>

              <label
                htmlFor="profile-email"
                className="mb-1.5 block text-[12px] font-semibold text-[#06424B]"
              >
                Email Address
              </label>

              <div className="relative">
                <input
                  id="profile-email"
                  type="email"
                  value={email}
                  readOnly
                  disabled
                  tabIndex={-1}
                  placeholder="Email not available"
                  className="h-11 w-full cursor-not-allowed rounded-xl border border-[#D5E4E2] bg-[#F5F7F7] pl-4 pr-10 text-[13px] text-[#718486] outline-none"
                />
                <Lock
                  size={15}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9AABAD]"
                />
              </div>

              <p className="mt-1.5 text-[11px] text-[#6C8589]">
                Your email cannot be changed here.
              </p>
            </section>
          </div>

          {/* Footer */}
          <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-[#EAF0EE] bg-[#FAFCFB] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[11px] text-[#6C8589]">
              Fields marked with <span className="text-[#C0392B]">*</span> are
              required.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="h-10 rounded-lg border border-[#D5E4E2] bg-white px-4 text-xs font-semibold text-[#06424B] transition-colors hover:bg-[#F2F6F5] disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#06424B] px-5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#0A515B] focus:outline-none focus:ring-4 focus:ring-[#FFAB0B]/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? (
                  <LoaderCircle size={15} className="animate-spin" />
                ) : (
                  <Save size={15} />
                )}
                {isSaving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        </form>
      </section>
    </div>,
    document.body
  );
}

/* ------------------------------------------------------------------ */
/* Shared profile menu                                                */
/* ------------------------------------------------------------------ */

function StudentProfileMenu({ className = "", showProfileErrorDialog = false }) {
  const userRole = String(getUserRole() || "student").trim().toLowerCase();
  const roleLabel = formatRole(userRole);
  const isTeacher = userRole === "teacher";

  // Form sections and fields depend on the logged-in role
  const profileGroups = isTeacher
    ? TEACHER_PROFILE_GROUPS
    : STUDENT_PROFILE_GROUPS;
  const profileFields = profileGroups.flatMap((group) => group.fields);
  const profileFieldKeys = profileFields.map((field) => field.name);

  const {
    profile,
    isProfileLoading,
    profileError,
    refreshProfile,
    updateProfileData,
  } = useProfile();

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [draftProfile, setDraftProfile] = useState(EMPTY_PROFILE);
  const [isSaving, setIsSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [dialog, setDialog] = useState(null);

  const menuRef = useRef(null);

  const fullName = [profile.firstName, profile.lastName]
    .filter(Boolean)
    .join(" ");
  const initials = getInitials(profile);

  // Open or close the centered popup
  const showDialog = useCallback(
    (type, message) => setDialog({ type, message }),
    []
  );
  const closeDialog = useCallback(() => setDialog(null), []);

  // Profile data is provided by ProfileProvider and shared across pages.
  // Preserve the existing error popup when the shared profile request fails.
  useEffect(() => {
    if (showProfileErrorDialog && profileError) {
      showDialog("error", profileError);
    }
  }, [profileError, showDialog, showProfileErrorDialog]);

  // Close the dropdown on outside click or Escape
  useEffect(() => {
    if (!profileMenuOpen) return undefined;

    const onPointerDown = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setProfileMenuOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [profileMenuOpen]);

  const openEditProfile = () => {
    setDraftProfile({ ...profile });
    setFieldErrors({});
    setProfileMenuOpen(false);
    setEditProfileOpen(true);
  };

  // Ignored while saving or while a message popup is on top
  const closeEditProfile = useCallback(() => {
    if (isSaving || dialog) return;
    setEditProfileOpen(false);
    setFieldErrors({});
  }, [isSaving, dialog]);

  // Update a field and clear its error
  const handleFieldChange = useCallback((name, value) => {
    setDraftProfile((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: "" }));
  }, []);

  // Validate, save, then confirm with a popup
  const handleSaveProfile = async (event) => {
    event.preventDefault();
    if (isSaving) return;

    const errors = validateProfile(draftProfile, profileFields);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      showDialog("error", "Please correct the highlighted fields before saving.");
      return;
    }

    const payload = createProfilePayload(draftProfile, profileFields);
    setIsSaving(true);

    try {
      const response = await updateProfile(payload);

      if (response?.success === false) {
        throw new Error(response.message || "The profile could not be updated.");
      }

      // Update the shared profile so every page shows the saved values.
      updateProfileData(payload);
      setDraftProfile((current) => ({ ...current, ...payload }));
      setEditProfileOpen(false);
      showDialog("success", "Your profile has been updated successfully.");
    } catch (error) {
      console.error("Update Profile API Error:", error);

      setFieldErrors(getServerFieldErrors(error, profileFieldKeys));
      showDialog(
        "error",
        getErrorMessage(
          error,
          "Unable to update your profile. Please try again."
        )
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* Profile dropdown trigger and menu */}
      <div className={`relative z-[80] ${className}`} ref={menuRef}>
            <button
              type="button"
              aria-label="Open profile menu"
              aria-expanded={profileMenuOpen}
              aria-haspopup="menu"
              onClick={() => setProfileMenuOpen((open) => !open)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[#D5E4E2] bg-white p-0.5 shadow-sm transition-all hover:border-[#FFAB0B] hover:shadow-md focus:outline-none focus:ring-4 focus:ring-[#FFAB0B]/25"
            >
              <Avatar initials={initials} size="sm" loading={isProfileLoading} />
            </button>

            {profileMenuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-[calc(100%+10px)] z-50 w-[min(320px,calc(100vw-2rem))] max-h-[calc(100dvh-5rem)] overflow-y-auto rounded-2xl border border-[#E1E9E7] bg-white shadow-[0_15px_45px_rgba(6,66,75,0.18)] sm:top-[calc(100%+12px)]"
              >
                {/* Summary */}
                <div className="border-b border-[#F0E3BE] bg-[#FFFCF3] p-4">
                  <div className="flex items-center gap-3">
                    <Avatar initials={initials} size="md" />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#06424B]">
                        {isProfileLoading
                          ? "Loading profile..."
                          : fullName || `${roleLabel} profile`}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-[#6C8589]">
                        {profile.email || `${roleLabel} account`}
                      </p>
                    </div>
                  </div>

                  {profileError && (
                    <div className="mt-3 flex items-center justify-between gap-3 rounded-lg bg-[#FFF1EE] px-3 py-2 text-xs text-[#A65349]">
                      <span>Profile could not be loaded.</span>
                      <button
                        type="button"
                        onClick={() => refreshProfile(true).catch(() => {})}
                        className="font-bold underline"
                      >
                        Retry
                      </button>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="space-y-1 p-2">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={openEditProfile}
                    disabled={isProfileLoading || Boolean(profileError)}
                    className="group/item block w-full disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <MenuItem
                      icon={Pencil}
                      title="Edit profile"
                      description="Update your personal and account details"
                      iconClass="bg-[#FFF4D6] text-[#8A5F00]"
                    />
                  </button>

                  <Link
                    to={isTeacher ? "/teacher/settings" : "/student/settings"}
                    role="menuitem"
                    onClick={() => setProfileMenuOpen(false)}
                    className="group/item block w-full"
                  >
                    <MenuItem
                      icon={Settings}
                      title="Account settings"
                      description="Manage your preferences"
                      iconClass="bg-[#EAF2F1] text-[#06424B]"
                    />
                  </Link>
                </div>

                <div className="border-t border-[#EAF0EE] px-4 py-3">
                  <p className="text-center text-[11px] text-[#8A9A9C]">
                    Skill Next {roleLabel} Portal
                  </p>
                </div>
              </div>
            )}
          </div>

      {editProfileOpen && (
        <EditProfileModal
          roleLabel={roleLabel}
          groups={profileGroups}
          draft={draftProfile}
          email={profile.email}
          initials={initials}
          fullName={fullName}
          fieldErrors={fieldErrors}
          isSaving={isSaving}
          onChange={handleFieldChange}
          onSubmit={handleSaveProfile}
          onClose={closeEditProfile}
        />
      )}

      {/* Success and error popup */}
      <MessageDialog dialog={dialog} onClose={closeDialog} />
    </>
  );
}

export default StudentProfileMenu;
