
import { useEffect, useRef, useState } from "react";
import {
  UserRound,
  Settings,
  LogOut,
  ChevronDown,
  Camera,
  Mail,
  Phone,
  BriefcaseBusiness,
  X,
  Check,
  Pencil,
} from "lucide-react";

const DEFAULT_PROFILE = {
  name: "Praveen Reddy",
  email: "teacher@skillnext.com",
  phone: "",
  designation: "Teacher",
  avatar: "",
};

export default function TeacherProfile() {
  const [profile, setProfile] = useState(() => {
    try {
      return {
        ...DEFAULT_PROFILE,
        ...JSON.parse(localStorage.getItem("teacherProfile") || "{}"),
      };
    } catch {
      return DEFAULT_PROFILE;
    }
  });

  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState(profile);
  const rootRef = useRef(null);

  useEffect(() => {
    const handleOutside = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        setEditOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handleOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const initials = profile.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const saveProfile = (event) => {
    event.preventDefault();

    const updated = {
      ...form,
      name: form.name.trim(),
      email: form.email.trim(),
    };

    if (!updated.name || !updated.email) return;

    setProfile(updated);
    localStorage.setItem("teacherProfile", JSON.stringify(updated));
    setEditOpen(false);
    setOpen(false);
  };

  const openEditor = () => {
    setForm({ ...profile });
    setOpen(false);
    setEditOpen(true);
  };

  const handleAvatar = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Please select an image smaller than 2 MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      updateField("avatar", reader.result);
    };

    reader.readAsDataURL(file);
  };

  const logout = () => {
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (!confirmed) return;

    // Connect your existing logout logic here.
    // Example: clear authentication state and navigate to login.
    window.dispatchEvent(new Event("teacher-logout"));
  };

  return (
    <>
      <div ref={rootRef} className="relative z-50">
        {/* Profile trigger */}
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-label="Open profile menu"
          className={`group flex h-11 items-center gap-2 rounded-full border p-1 pr-3 transition-all duration-300 ${
            open
              ? "border-[#A7C6C2] bg-[#EAF2F1] shadow-md"
              : "border-[#E2EAEA] bg-white hover:border-[#A7C6C2] hover:shadow-md"
          }`}
        >
          <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-[#06424B] text-[12px] font-extrabold text-[#FFAB0B] ring-2 ring-white">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            ) : (
              initials || "T"
            )}
          </span>

          <span className="hidden text-left sm:block">
            <span className="block max-w-[110px] truncate text-[11px] font-extrabold text-[#17464D]">
              {profile.name}
            </span>
            <span className="block text-[9px] font-medium text-[#899B9D]">
              {profile.designation}
            </span>
          </span>

          <ChevronDown
            size={14}
            className={`text-[#71888B] transition-transform duration-300 ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Dropdown */}
        <div
          className={`absolute right-0 top-[calc(100%+12px)] w-[290px] origin-top-right transition-all duration-200 ${
            open
              ? "visible translate-y-0 scale-100 opacity-100"
              : "invisible -translate-y-2 scale-95 opacity-0"
          }`}
        >
          <div className="overflow-hidden rounded-[20px] border border-[#E0E9E9] bg-white shadow-[0_18px_55px_rgba(6,66,75,0.16)]">
            <div className="relative overflow-hidden bg-[#06424B] px-5 py-5">
              <div className="pointer-events-none absolute -right-8 -top-12 h-32 w-32 rounded-full border-[18px] border-white/[0.07]" />

              <div className="relative flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white/30 bg-[#FFAB0B] text-[14px] font-extrabold text-[#06424B]">
                  {profile.avatar ? (
                    <img
                      src={profile.avatar}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initials || "T"
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-[13px] font-extrabold text-white">
                    {profile.name}
                  </h3>
                  <p className="mt-1 truncate text-[10px] text-white/60">
                    {profile.email}
                  </p>
                  <span className="mt-2 inline-flex rounded-full border border-white/15 bg-white/10 px-2 py-0.5 text-[9px] font-bold text-[#FFD36B]">
                    {profile.designation}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-2">
              <button
                type="button"
                onClick={openEditor}
                className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-[#EEF5F4]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E7F1F0] text-[#06424B]">
                  <UserRound size={17} />
                </span>
                <span className="flex-1">
                  <span className="block text-[11px] font-bold text-[#31565B]">
                    Edit Profile
                  </span>
                  <span className="mt-0.5 block text-[9px] text-[#94A3A5]">
                    Update your personal information
                  </span>
                </span>
                <Pencil size={13} className="text-[#A4B2B3]" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  window.location.href = "/teacher/settings";
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-[#EEF5F4]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFF2D8] text-[#A9781C]">
                  <Settings size={17} />
                </span>
                <span>
                  <span className="block text-[11px] font-bold text-[#31565B]">
                    Account Settings
                  </span>
                  <span className="mt-0.5 block text-[9px] text-[#94A3A5]">
                    Manage account preferences
                  </span>
                </span>
              </button>
            </div>

            <div className="border-t border-[#EDF1F1] p-2">
              <button
                type="button"
                onClick={logout}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-[#FFF3F1]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFF0ED] text-[#B65345]">
                  <LogOut size={17} />
                </span>
                <span className="text-[11px] font-bold text-[#B65345]">
                  Logout
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {editOpen && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center overflow-y-auto bg-[#082F35]/55 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setEditOpen(false);
            }
          }}
        >
          <section className="my-auto w-full max-w-[510px] overflow-hidden rounded-[24px] border border-white/70 bg-white shadow-[0_25px_80px_rgba(6,42,47,0.25)]">
            <div className="relative overflow-hidden bg-[#06424B] px-6 py-6">
              <div className="pointer-events-none absolute -right-10 -top-14 h-36 w-36 rounded-full border-[22px] border-white/[0.06]" />

              <div className="relative flex items-start justify-between">
                <div>
                  <span className="text-[9px] font-extrabold tracking-[1.8px] text-[#FFAB0B]">
                    ACCOUNT PROFILE
                  </span>
                  <h2 className="mt-2 text-[21px] font-extrabold text-white">
                    Edit your profile
                  </h2>
                  <p className="mt-1 text-[11px] text-white/60">
                    Keep your teacher information up to date.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setEditOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20"
                  aria-label="Close"
                >
                  <X size={17} />
                </button>
              </div>
            </div>

            <form onSubmit={saveProfile} className="space-y-5 p-6">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="flex h-[68px] w-[68px] items-center justify-center overflow-hidden rounded-full border-4 border-[#E7F1F0] bg-[#06424B] text-xl font-extrabold text-[#FFAB0B]">
                  {form.avatar ? (
                    <img
                      src={form.avatar}
                      alt="Profile preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    form.name
                      .trim()
                      .split(/\s+/)
                      .slice(0, 2)
                      .map((word) => word[0])
                      .join("")
                      .toUpperCase() || "T"
                  )}
                </div>

                <div>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#DDE8E8] px-3 py-2 text-[10px] font-bold text-[#31565B] transition hover:bg-[#F1F6F5]">
                    <Camera size={14} />
                    Change photo
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatar}
                    />
                  </label>
                  <p className="mt-1.5 text-[9px] text-[#94A3A5]">
                    JPG or PNG · Maximum 2 MB
                  </p>
                </div>
              </div>

              {/* Name */}
              <label className="block">
                <span className="mb-2 block text-[11px] font-bold text-[#385D62]">
                  Full name
                </span>
                <div className="relative">
                  <UserRound
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#91A3A5]"
                  />
                  <input
                    required
                    maxLength={80}
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder="Enter your full name"
                    className="h-[44px] w-full rounded-xl border border-[#DDE7E7] bg-white pl-10 pr-3 text-[12px] text-[#244E54] outline-none transition focus:border-[#8FB5B5] focus:ring-2 focus:ring-[#E5F0EF]"
                  />
                </div>
              </label>

              {/* Email */}
              <label className="block">
                <span className="mb-2 block text-[11px] font-bold text-[#385D62]">
                  Email address
                </span>
                <div className="relative">
                  <Mail
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#91A3A5]"
                  />
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="Enter email address"
                    className="h-[44px] w-full rounded-xl border border-[#DDE7E7] bg-white pl-10 pr-3 text-[12px] text-[#244E54] outline-none transition focus:border-[#8FB5B5] focus:ring-2 focus:ring-[#E5F0EF]"
                  />
                </div>
              </label>

              {/* Phone */}
              <label className="block">
                <span className="mb-2 block text-[11px] font-bold text-[#385D62]">
                  Phone number
                </span>
                <div className="relative">
                  <Phone
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#91A3A5]"
                  />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="Enter phone number"
                    className="h-[44px] w-full rounded-xl border border-[#DDE7E7] bg-white pl-10 pr-3 text-[12px] text-[#244E54] outline-none transition focus:border-[#8FB5B5] focus:ring-2 focus:ring-[#E5F0EF]"
                  />
                </div>
              </label>

              {/* Designation */}
              <label className="block">
                <span className="mb-2 block text-[11px] font-bold text-[#385D62]">
                  Designation
                </span>
                <div className="relative">
                  <BriefcaseBusiness
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#91A3A5]"
                  />
                  <input
                    value={form.designation}
                    onChange={(e) =>
                      updateField("designation", e.target.value)
                    }
                    placeholder="Teacher"
                    className="h-[44px] w-full rounded-xl border border-[#DDE7E7] bg-white pl-10 pr-3 text-[12px] text-[#244E54] outline-none transition focus:border-[#8FB5B5] focus:ring-2 focus:ring-[#E5F0EF]"
                  />
                </div>
              </label>

              <div className="flex justify-end gap-2 border-t border-[#EDF1F1] pt-4">
                <button
                  type="button"
                  onClick={() => setEditOpen(false)}
                  className="rounded-xl border border-[#DCE6E6] bg-white px-4 py-2.5 text-[11px] font-bold text-[#527277] transition hover:bg-[#F4F7F7]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#06424B] px-5 py-2.5 text-[11px] font-bold text-white shadow-lg shadow-[#06424B]/15 transition hover:bg-[#0B5661]"
                >
                  <Check size={14} />
                  Save changes
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
