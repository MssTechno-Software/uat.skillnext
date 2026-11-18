
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  X,
  Search,
  Plus,
  ArrowUpRight,
  BookOpen,
  FolderTree,
  Layers3,
  FileText,
  Video,
  CheckCircle2,
  EyeOff,
  Bell,
  ChevronRight,
  Settings,
  Pencil,
  Save,
} from "lucide-react";

const defaultTeacherProfile = {
  name: "Teacher",
  email: "",
  phone: "",
};

export function TeacherPage({ children }) {
  return (
    <div className="min-h-dvh bg-[#F4F7F7] px-4 py-6 font-sans sm:px-6 lg:px-9 lg:py-8">
      <div className="mx-auto w-full max-w-[1440px]">{children}</div>
    </div>
  );
}

export function PageHeader({
  eyebrow = "TEACHER WORKSPACE",
  title,
  description,
  actions,
  backLink,
}) {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);

  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem("skillnext_teacher_profile");
      return saved
        ? { ...defaultTeacherProfile, ...JSON.parse(saved) }
        : defaultTeacherProfile;
    } catch {
      return defaultTeacherProfile;
    }
  });

  const [draftProfile, setDraftProfile] = useState(profile);

  useEffect(() => {
    try {
      localStorage.setItem(
        "skillnext_teacher_profile",
        JSON.stringify(profile)
      );
    } catch {
      // Local storage may be unavailable.
    }
  }, [profile]);

  const initials =
    profile.name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "TC";

  const handleEditProfile = () => {
    setDraftProfile({ ...profile });
    setProfileMenuOpen(false);
    setEditProfileOpen(true);
  };

  const handleSaveProfile = (event) => {
    event.preventDefault();

    setProfile({
      name: draftProfile.name.trim() || "Teacher",
      email: draftProfile.email.trim(),
      phone: draftProfile.phone.trim(),
    });

    setEditProfileOpen(false);
  };

  return (
    <>
      {/* EXISTING PAGE HEADER */}
      <div className="relative z-30 mb-7 flex flex-col gap-5 border-b border-[#DDE8E8] pb-6 xl:flex-row xl:items-end xl:justify-between">
        {/* LEFT: PAGE TITLE */}
        <div className="min-w-0">
          {backLink}

          <p className="mb-2 text-[10px] font-extrabold tracking-[1.8px] text-[#B27B20]">
            {eyebrow}
          </p>

          <h1 className="text-[27px] font-extrabold tracking-[-0.8px] text-[#06424B] sm:text-[32px]">
            {title}
          </h1>

          {description && (
            <p className="mt-2 max-w-2xl text-[13px] leading-6 text-[#71868A]">
              {description}
            </p>
          )}
        </div>

        {/* RIGHT: HEADER ACTIONS */}
        <div className="flex shrink-0 flex-wrap items-center gap-3">
          {/* SEARCH */}
          <label className="relative hidden sm:block">
            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6C8589]"
            />

            <input
              type="search"
              placeholder="Search workspace..."
              className="h-11 w-[210px] rounded-xl border border-[#D5E4E2] bg-white pl-10 pr-3 text-sm text-[#2F4A4E] shadow-sm outline-none placeholder:text-[#8AA0A3] focus:border-[#06424B] focus:ring-4 focus:ring-[#FFAB0B]/25"
            />
          </label>

          {/* NOTIFICATIONS */}
          <button
            type="button"
            aria-label="Notifications"
            className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-[#D5E4E2] bg-white text-[#06424B] shadow-sm transition-colors hover:bg-[#FFF4D6]"
          >
            <Bell size={18} />

            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-[#FFAB0B] ring-2 ring-white" />
          </button>

          {/* DIVIDER */}
          <div className="hidden h-10 w-px bg-[#D5E4E2] sm:block" />

          {/* PROFILE BUTTON */}
          <div className="relative">
            <button
              type="button"
              aria-label="Open teacher profile"
              aria-expanded={profileMenuOpen}
              aria-haspopup="menu"
              onClick={() => setProfileMenuOpen((prev) => !prev)}
              className="group flex h-11 w-11 items-center justify-center rounded-full border border-[#D5E4E2] bg-white p-0.5 shadow-sm transition-all duration-200 hover:border-[#FFAB0B] hover:shadow-md focus:outline-none focus:ring-4 focus:ring-[#FFAB0B]/20"
            >
              <span className="flex h-full w-full items-center justify-center rounded-full bg-[#06424B] text-sm font-bold text-[#FFAB0B] transition-colors group-hover:bg-[#0A515B]">
                {initials}
              </span>
            </button>

            {/* PROFILE DROPDOWN */}
            {profileMenuOpen && (
              <>
                <button
                  type="button"
                  aria-label="Close profile menu"
                  onClick={() => setProfileMenuOpen(false)}
                  className="fixed inset-0 z-40 cursor-default"
                />

                <div className="absolute right-0 top-[calc(100%+12px)] z-50 w-[290px] overflow-hidden rounded-2xl border border-[#E1E9E7] bg-white shadow-[0_15px_45px_rgba(6,66,75,0.14)]">
                  {/* PROFILE SUMMARY */}
                  <div className="border-b border-[#EAF0EE] bg-[#FFFCF3] p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#06424B] text-sm font-bold text-[#FFAB0B]">
                        {initials}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#06424B]">
                          {profile.name}
                        </p>

                        <p className="mt-1 truncate text-[11px] text-[#829092]">
                          {profile.email || "Teacher Account"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* MENU OPTIONS */}
                  <div className="space-y-1 p-2">
                    <button
                      type="button"
                      onClick={handleEditProfile}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-[#EEF5F4]"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EAF2F1] text-[#06424B]">
                        <Pencil size={17} />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block text-[12px] font-semibold text-[#344B4F]">
                          Edit Profile
                        </span>

                        <span className="mt-0.5 block text-[10px] text-[#89999B]">
                          Update your personal details
                        </span>
                      </span>

                      <ChevronRight size={15} className="text-[#A5B0B1]" />
                    </button>

                    <Link
                      to="/teacher/settings"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-[#EEF5F4]"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F1F4F4] text-[#61777B]">
                        <Settings size={17} />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block text-[12px] font-semibold text-[#344B4F]">
                          Account Settings
                        </span>

                        <span className="mt-0.5 block text-[10px] text-[#89999B]">
                          Manage your preferences
                        </span>
                      </span>

                      <ChevronRight size={15} className="text-[#A5B0B1]" />
                    </Link>
                  </div>

                  {/* FOOTER */}
                  <div className="border-t border-[#EAF0EE] px-4 py-3">
                    <p className="text-center text-[10px] text-[#9AA7A8]">
                      Skill Next Teacher Portal
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          {actions}
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      {editProfileOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#063B43]/35 p-4 backdrop-blur-[3px]">
          <button
            type="button"
            aria-label="Close edit profile"
            onClick={() => setEditProfileOpen(false)}
            className="absolute inset-0 cursor-default"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="teacher-edit-profile-title"
            className="relative z-10 w-full max-w-[470px] overflow-hidden rounded-[22px] border border-[#E2EAE7] bg-white shadow-[0_24px_70px_rgba(6,66,75,0.2)]"
          >
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-[#EAF0EE] bg-[#FFFCF3] px-6 py-5">
              <div>
                <p className="text-[10px] font-bold tracking-[1.3px] text-[#B07A06]">
                  ACCOUNT INFORMATION
                </p>

                <h2
                  id="teacher-edit-profile-title"
                  className="mt-1 text-[19px] font-bold text-[#06424B]"
                >
                  Edit Profile
                </h2>

                <p className="mt-1 text-[11px] text-[#829092]">
                  Update your personal information.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditProfileOpen(false)}
                aria-label="Close modal"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E2EAEA] bg-white text-[#62797C] transition-colors hover:bg-[#EEF5F4] hover:text-[#06424B]"
              >
                <X size={18} />
              </button>
            </div>

            {/* FORM */}
            <form onSubmit={handleSaveProfile}>
              <div className="space-y-5 px-6 py-6">
                {/* PROFILE AVATAR */}
                <div className="flex items-center gap-4 rounded-xl border border-[#E5ECEA] bg-[#F8FAF9] p-4">
                  <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#06424B] text-base font-bold text-[#FFAB0B]">
                    {initials}
                  </div>

                  <div>
                    <p className="text-[13px] font-semibold text-[#06424B]">
                      Teacher Profile
                    </p>

                    <p className="mt-1 text-[11px] text-[#829092]">
                      Your account information
                    </p>
                  </div>
                </div>

                {/* NAME */}
                <div>
                  <label
                    htmlFor="teacher-name"
                    className="mb-2 block text-[11px] font-semibold text-[#435D61]"
                  >
                    Full Name
                  </label>

                  <input
                    id="teacher-name"
                    type="text"
                    value={draftProfile.name}
                    onChange={(event) =>
                      setDraftProfile({
                        ...draftProfile,
                        name: event.target.value,
                      })
                    }
                    placeholder="Enter your full name"
                    required
                    className="h-11 w-full rounded-xl border border-[#DCE7E5] bg-white px-4 text-[12px] text-[#344B4F] outline-none placeholder:text-[#A0ADAE] transition-all focus:border-[#06424B] focus:ring-4 focus:ring-[#FFAB0B]/15"
                  />
                </div>

                {/* EMAIL */}
                <div>
                  <label
                    htmlFor="teacher-email"
                    className="mb-2 block text-[11px] font-semibold text-[#435D61]"
                  >
                    Email Address
                  </label>

                  <input
                    id="teacher-email"
                    type="email"
                    value={draftProfile.email}
                    onChange={(event) =>
                      setDraftProfile({
                        ...draftProfile,
                        email: event.target.value,
                      })
                    }
                    placeholder="Enter your email address"
                    className="h-11 w-full rounded-xl border border-[#DCE7E5] bg-white px-4 text-[12px] text-[#344B4F] outline-none placeholder:text-[#A0ADAE] transition-all focus:border-[#06424B] focus:ring-4 focus:ring-[#FFAB0B]/15"
                  />
                </div>

                {/* PHONE */}
                <div>
                  <label
                    htmlFor="teacher-phone"
                    className="mb-2 block text-[11px] font-semibold text-[#435D61]"
                  >
                    Phone Number
                  </label>

                  <input
                    id="teacher-phone"
                    type="tel"
                    value={draftProfile.phone}
                    onChange={(event) =>
                      setDraftProfile({
                        ...draftProfile,
                        phone: event.target.value,
                      })
                    }
                    placeholder="Enter your phone number"
                    className="h-11 w-full rounded-xl border border-[#DCE7E5] bg-white px-4 text-[12px] text-[#344B4F] outline-none placeholder:text-[#A0ADAE] transition-all focus:border-[#06424B] focus:ring-4 focus:ring-[#FFAB0B]/15"
                  />
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex items-center justify-end gap-3 border-t border-[#EAF0EE] bg-[#FAFCFB] px-6 py-4">
                <button
                  type="button"
                  onClick={() => setEditProfileOpen(false)}
                  className="h-10 rounded-lg border border-[#DCE6E4] bg-white px-4 text-[11px] font-semibold text-[#60777A] transition-colors hover:bg-[#F2F6F5]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#06424B] px-5 text-[11px] font-semibold text-white shadow-sm transition-colors hover:bg-[#0A515B]"
                >
                  <Save size={15} />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled = false,
  className = "",
}) {
  const base =
    "inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[12px] font-bold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFAB0B] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

  const variants = {
    primary:
      "bg-[#06424B] text-white shadow-[0_7px_16px_rgba(6,66,75,0.14)] hover:bg-[#0B5661]",
    gold: "bg-[#FFAB0B] text-[#123B43] shadow-sm hover:bg-[#F3A000]",
    secondary:
      "border border-[#DCE6E6] bg-white text-[#31565B] hover:border-[#B8CECE] hover:bg-[#F8FBFB]",
    danger:
      "border border-[#F0D8D4] bg-white text-[#A94D40] hover:bg-[#FFF6F4]",
    ghost: "bg-transparent text-[#607A7E] hover:bg-[#EDF3F3] hover:text-[#06424B]",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant] || variants.primary} ${className}`}
    >
      {children}
    </button>
  );
}

export function SectionHeading({ title, description, action }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-[16px] font-extrabold text-[#17464D]">{title}</h2>
        {description && (
          <p className="mt-1 text-[11px] leading-5 text-[#85979A]">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, detail, icon: Icon, tone = "teal" }) {
  const tones = {
    teal: "bg-[#E7F1F0] text-[#06424B]",
    gold: "bg-[#FFF2D8] text-[#9A6A17]",
    blue: "bg-[#EAF0F7] text-[#4C6585]",
    slate: "bg-[#EEF1F2] text-[#566C72]",
  };

  return (
    <div className="rounded-[20px] border border-[#E0E9E9] bg-white p-5 shadow-[0_5px_18px_rgba(18,59,67,0.035)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold text-[#829497]">{label}</p>
          <p className="mt-2 text-[27px] font-extrabold tracking-[-0.8px] text-[#17464D]">
            {value}
          </p>
          {detail && (
            <p className="mt-1 text-[10px] text-[#91A0A2]">{detail}</p>
          )}
        </div>
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-[14px] ${tones[tone] || tones.teal}`}
        >
          <Icon size={20} strokeWidth={1.8} />
        </span>
      </div>
    </div>
  );
}

export function StatusPill({ visible }) {
  return visible ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF5EF] px-2.5 py-1 text-[10px] font-bold text-[#34866E]">
      <CheckCircle2 size={12} /> Visible
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F1F3F4] px-2.5 py-1 text-[10px] font-bold text-[#78898D]">
      <EyeOff size={12} /> Hidden
    </span>
  );
}

export function SearchField({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
}) {
  return (
    <label
      className={`flex h-[43px] min-w-0 items-center gap-2.5 rounded-xl border border-[#DFE8E8] bg-white px-3.5 transition focus-within:border-[#8FB5B5] focus-within:ring-2 focus-within:ring-[#DDEDEC] ${className}`}
    >
      <Search size={16} className="shrink-0 text-[#91A3A5]" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full min-w-0 bg-transparent text-[12px] text-[#244E54] outline-none placeholder:text-[#A2B0B2]"
      />
    </label>
  );
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  width = "max-w-xl",
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#082F35]/45 p-4 backdrop-blur-[3px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`my-auto w-full ${width} overflow-hidden rounded-[24px] border border-white/70 bg-white shadow-[0_24px_80px_rgba(6,42,47,0.24)]`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#E8EEEE] px-5 py-5 sm:px-7">
          <div>
            <h2 className="text-[18px] font-extrabold text-[#06424B]">
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-[11px] leading-5 text-[#829497]">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[#809295] transition hover:bg-[#F0F5F5] hover:text-[#06424B]"
          >
            <X size={18} />
          </button>
        </div>
        <div className="max-h-[calc(100dvh-150px)] overflow-y-auto px-5 py-5 sm:px-7">
          {children}
        </div>
      </section>
    </div>
  );
}

export function Field({ label, required = false, hint, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-bold text-[#385D62]">
        {label}
        {required && <span className="ml-1 text-[#C47A43]">*</span>}
      </span>
      {children}
      {hint && (
        <span className="mt-1.5 block text-[10px] leading-4 text-[#91A1A3]">
          {hint}
        </span>
      )}
    </label>
  );
}

export const inputClass =
  "h-[43px] w-full rounded-xl border border-[#DDE7E7] bg-white px-3.5 text-[12px] text-[#244E54] outline-none transition placeholder:text-[#A5B2B4] focus:border-[#8FB5B5] focus:ring-2 focus:ring-[#E5F0EF]";

export const textareaClass =
  "min-h-[104px] w-full resize-y rounded-xl border border-[#DDE7E7] bg-white px-3.5 py-3 text-[12px] leading-6 text-[#244E54] outline-none transition placeholder:text-[#A5B2B4] focus:border-[#8FB5B5] focus:ring-2 focus:ring-[#E5F0EF]";

export function EmptyState({
  icon: Icon = BookOpen,
  title,
  description,
  action,
}) {
  return (
    <div className="flex min-h-[250px] flex-col items-center justify-center rounded-[20px] border border-dashed border-[#D6E3E3] bg-white px-6 py-10 text-center">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#EAF2F1] text-[#06424B]">
        <Icon size={25} strokeWidth={1.7} />
      </span>
      <h3 className="text-[15px] font-extrabold text-[#17464D]">{title}</h3>
      <p className="mt-2 max-w-sm text-[11px] leading-5 text-[#87999B]">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function WorkflowCard({
  step,
  title,
  detail,
  count,
  icon: Icon,
  to,
}) {
  const content = (
    <>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-extrabold tracking-[1.2px] text-[#A0AFB0]">
          STEP {step}
        </span>
        <span className="flex h-10 w-10 items-center justify-center rounded-[13px] bg-[#EAF2F1] text-[#06424B]">
          <Icon size={19} />
        </span>
      </div>
      <h3 className="mt-4 text-[14px] font-extrabold text-[#17464D]">
        {title}
      </h3>
      <p className="mt-1 min-h-[34px] text-[10px] leading-5 text-[#87999B]">
        {detail}
      </p>
      <div className="mt-4 flex items-center justify-between border-t border-[#EDF1F1] pt-3">
        <span className="text-[11px] font-bold text-[#547277]">
          {count} {count === 1 ? "item" : "items"}
        </span>
        <span className="flex items-center gap-1 text-[10px] font-bold text-[#B27B20]">
          Open <ArrowUpRight size={13} />
        </span>
      </div>
    </>
  );

  return (
    <Link
      to={to}
      className="group rounded-[18px] border border-[#E1EAEA] bg-white p-4 shadow-[0_5px_18px_rgba(18,59,67,0.025)] transition hover:-translate-y-0.5 hover:border-[#BBD2D1] hover:shadow-[0_12px_26px_rgba(18,59,67,0.07)]"
    >
      {content}
    </Link>
  );
}

export function ContentTypeIcon({ type }) {
  const Icon =
    type === "video" ? Video : type === "document" ? FileText : BookOpen;

  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EEF4F3] text-[#426B70]">
      <Icon size={17} />
    </span>
  );
}

export function AddIcon() {
  return <Plus size={15} strokeWidth={2.4} />;
}

export function CategoryIcon() {
  return <FolderTree size={18} />;
}

export function ModuleIcon() {
  return <Layers3 size={18} />;
}
