
import { useState } from "react";
import { Link } from "react-router-dom";

import {
  Bell,
  Search,
  ChevronDown,
  ChevronRight,
  UserRound,
  Settings,
  Pencil,
  X,
  Save,
} from "lucide-react";

function StudentPageHeader({ title, subtitle, actions }) {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);

  const [profile, setProfile] = useState({
    name: "Student",
    email: "",
    phone: "",
  });

  const [draftProfile, setDraftProfile] = useState(profile);

  // Generate initials from student name
  const initials =
    profile.name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "ST";

  // Open edit profile modal
  const handleEditProfile = () => {
    setDraftProfile({ ...profile });
    setProfileMenuOpen(false);
    setEditProfileOpen(true);
  };

  // Save profile changes
  const handleSaveProfile = (event) => {
    event.preventDefault();

    setProfile({
      name: draftProfile.name.trim() || "Student",
      email: draftProfile.email.trim(),
      phone: draftProfile.phone.trim(),
    });

    setEditProfileOpen(false);
  };

  return (
    <>
      {/* ====================================== */}
      {/* DESKTOP PAGE HEADER */}
      {/* ====================================== */}

      <header className="
        relative z-30
        mb-6 hidden
        items-center justify-between
        gap-4 lg:flex
      ">

        {/* PAGE TITLE */}
        <div className="min-w-0">
          <p className="
            text-[11px] font-bold
            tracking-[1.4px]
            text-[#B07A06]
          ">
            STUDENT WORKSPACE
          </p>

          <h1 className="
            mt-1
            text-[28px]
            font-extrabold
            tracking-[-0.5px]
            text-[#06424B]
          ">
            {title}
          </h1>

          {subtitle && (
            <p className="
              mt-1 text-sm
              text-[#5A7478]
            ">
              {subtitle}
            </p>
          )}
        </div>

        {/* RIGHT HEADER ACTIONS */}
        <div className="
          flex shrink-0
          items-center gap-3
        ">

          {/* SEARCH */}
          <label className="relative">
            <Search
              size={17}
              className="
                absolute left-3.5 top-1/2
                -translate-y-1/2
                text-[#6C8589]
              "
            />

            <input
              type="search"
              placeholder="Search learning..."
              className="
                h-11 w-[240px]
                rounded-xl
                border border-[#D5E4E2]
                bg-white
                pl-10 pr-3
                text-sm text-[#2F4A4E]
                shadow-sm outline-none
                placeholder:text-[#8AA0A3]
                focus:border-[#06424B]
                focus:ring-4
                focus:ring-[#FFAB0B]/25
              "
            />
          </label>

          {/* NOTIFICATIONS */}
          <button
            type="button"
            aria-label="Notifications"
            className="
              relative flex h-11 w-11
              items-center justify-center
              rounded-xl
              border border-[#D5E4E2]
              bg-white
              text-[#06424B]
              shadow-sm
              transition-colors
              hover:bg-[#FFF4D6]
            "
          >
            <Bell size={18} />

            <span className="
              absolute right-2.5 top-2.5
              h-2 w-2
              rounded-full
              bg-[#FFAB0B]
              ring-2 ring-white
            " />
          </button>

          {/* DIVIDER */}
          <div className="
            h-10 w-px
            bg-[#D5E4E2]
          " />

          {/* ================================== */}
          {/* STUDENT PROFILE BUTTON */}
          {/* ================================== */}

          <div className="relative">

            <button
              type="button"
              aria-label="Open student profile"
              aria-expanded={profileMenuOpen}
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="
                group flex items-center gap-3
                rounded-xl px-2 py-1.5
                text-left
                transition-all duration-200
                hover:bg-white/80
              "
            >
              {/* AVATAR */}
              <span className="
                flex h-12 w-12
                shrink-0 items-center
                justify-center
                rounded-[13px]
                bg-[#06424B]
                text-sm font-bold
                text-[#FFAB0B]
                shadow-sm
              ">
                {initials}
              </span>

              {/* STUDENT NAME */}
              <span className="min-w-[95px]">
                <span className="
                  block max-w-[120px]
                  truncate
                  text-sm font-bold
                  text-[#06424B]
                ">
                  {profile.name}
                </span>

                <span className="
                  block max-w-[120px]
                  truncate
                  text-xs
                  text-[#5A7478]
                ">
                  {profile.email || "My Account"}
                </span>
              </span>

              <ChevronDown
                size={16}
                className={`
                  ml-1 text-[#789093]
                  transition-transform duration-200
                  ${profileMenuOpen ? "rotate-180" : ""}
                `}
              />
            </button>

            {/* ================================== */}
            {/* PROFILE DROPDOWN */}
            {/* ================================== */}

            {profileMenuOpen && (
              <>
                {/* CLICK OUTSIDE */}
                <button
                  type="button"
                  aria-label="Close profile menu"
                  onClick={() => setProfileMenuOpen(false)}
                  className="
                    fixed inset-0 z-40
                    cursor-default
                  "
                />

                <div className="
                  absolute right-0 top-[calc(100%+12px)]
                  z-50 w-[290px]
                  overflow-hidden
                  rounded-2xl
                  border border-[#E1E9E7]
                  bg-white
                  shadow-[0_15px_45px_rgba(6,66,75,0.14)]
                ">

                  {/* PROFILE SUMMARY */}
                  <div className="
                    border-b border-[#EAF0EE]
                    bg-[#FFFCF3]
                    p-4
                  ">
                    <div className="flex items-center gap-3">

                      <div className="
                        flex h-12 w-12
                        shrink-0 items-center
                        justify-center
                        rounded-xl
                        bg-[#06424B]
                        text-sm font-bold
                        text-[#FFAB0B]
                      ">
                        {initials}
                      </div>

                      <div className="min-w-0">
                        <p className="
                          truncate
                          text-sm font-semibold
                          text-[#06424B]
                        ">
                          {profile.name}
                        </p>

                        <p className="
                          mt-1 truncate
                          text-[11px]
                          text-[#829092]
                        ">
                          {profile.email || "Student Account"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* MENU OPTIONS */}
                  <div className="space-y-1 p-2">

                    {/* EDIT PROFILE */}
                    <button
                      type="button"
                      onClick={handleEditProfile}
                      className="
                        flex w-full
                        items-center gap-3
                        rounded-xl
                        px-3 py-3
                        text-left
                        transition-colors
                        hover:bg-[#EEF5F4]
                      "
                    >
                      <span className="
                        flex h-9 w-9
                        items-center justify-center
                        rounded-lg
                        bg-[#EAF2F1]
                        text-[#06424B]
                      ">
                        <Pencil size={17} />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="
                          block text-[12px]
                          font-semibold
                          text-[#344B4F]
                        ">
                          Edit Profile
                        </span>

                        <span className="
                          mt-0.5 block text-[10px]
                          text-[#89999B]
                        ">
                          Update your personal details
                        </span>
                      </span>

                      <ChevronRight
                        size={15}
                        className="text-[#A5B0B1]"
                      />
                    </button>

                    {/* ACCOUNT SETTINGS */}
                    <Link
                      to="/student/settings"
                      onClick={() => setProfileMenuOpen(false)}
                      className="
                        flex w-full
                        items-center gap-3
                        rounded-xl
                        px-3 py-3
                        transition-colors
                        hover:bg-[#EEF5F4]
                      "
                    >
                      <span className="
                        flex h-9 w-9
                        items-center justify-center
                        rounded-lg
                        bg-[#F1F4F4]
                        text-[#61777B]
                      ">
                        <Settings size={17} />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="
                          block text-[12px]
                          font-semibold
                          text-[#344B4F]
                        ">
                          Account Settings
                        </span>

                        <span className="
                          mt-0.5 block text-[10px]
                          text-[#89999B]
                        ">
                          Manage your preferences
                        </span>
                      </span>

                      <ChevronRight
                        size={15}
                        className="text-[#A5B0B1]"
                      />
                    </Link>
                  </div>

                  {/* FOOTER */}
                  <div className="
                    border-t border-[#EAF0EE]
                    px-4 py-3
                  ">
                    <p className="
                      text-center text-[10px]
                      text-[#9AA7A8]
                    ">
                      Skill Next Student Portal
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          {actions}
        </div>
      </header>

      {/* ====================================== */}
      {/* EDIT PROFILE MODAL */}
      {/* ====================================== */}

      {editProfileOpen && (
        <div className="
          fixed inset-0 z-[100]
          flex items-center justify-center
          bg-[#063B43]/35
          p-4 backdrop-blur-[3px]
        ">

          {/* BACKDROP */}
          <button
            type="button"
            aria-label="Close edit profile"
            onClick={() => setEditProfileOpen(false)}
            className="absolute inset-0 cursor-default"
          />

          {/* MODAL CONTENT */}
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-profile-title"
            className="
              relative z-10
              w-full max-w-[470px]
              overflow-hidden
              rounded-[22px]
              border border-[#E2EAE7]
              bg-white
              shadow-[0_24px_70px_rgba(6,66,75,0.2)]
            "
          >

            {/* MODAL HEADER */}
            <div className="
              flex items-center
              justify-between
              border-b border-[#EAF0EE]
              bg-[#FFFCF3]
              px-6 py-5
            ">
              <div>
                <p className="
                  text-[10px] font-bold
                  tracking-[1.3px]
                  text-[#B07A06]
                ">
                  ACCOUNT INFORMATION
                </p>

                <h2
                  id="edit-profile-title"
                  className="
                    mt-1 text-[19px]
                    font-bold text-[#06424B]
                  "
                >
                  Edit Profile
                </h2>

                <p className="
                  mt-1 text-[11px]
                  text-[#829092]
                ">
                  Update your personal information.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditProfileOpen(false)}
                aria-label="Close modal"
                className="
                  flex h-9 w-9
                  items-center justify-center
                  rounded-full
                  border border-[#E2EAEA]
                  bg-white
                  text-[#62797C]
                  transition-colors
                  hover:bg-[#EEF5F4]
                  hover:text-[#06424B]
                "
              >
                <X size={18} />
              </button>
            </div>

            {/* FORM */}
            <form onSubmit={handleSaveProfile}>

              <div className="space-y-5 px-6 py-6">

                {/* PROFILE AVATAR */}
                <div className="
                  flex items-center gap-4
                  rounded-xl
                  border border-[#E5ECEA]
                  bg-[#F8FAF9]
                  p-4
                ">
                  <div className="
                    flex h-[52px] w-[52px]
                    items-center justify-center
                    rounded-xl
                    bg-[#06424B]
                    text-base font-bold
                    text-[#FFAB0B]
                  ">
                    {(
                      draftProfile.name.trim() || "ST"
                    )
                      .split(/\s+/)
                      .slice(0, 2)
                      .map((part) => part[0]?.toUpperCase())
                      .join("")}
                  </div>

                  <div>
                    <p className="
                      text-[13px] font-semibold
                      text-[#06424B]
                    ">
                      Student Profile
                    </p>

                    <p className="
                      mt-1 text-[11px]
                      text-[#829092]
                    ">
                      Your account information
                    </p>
                  </div>
                </div>

                {/* FULL NAME */}
                <div>
                  <label
                    htmlFor="student-name"
                    className="
                      mb-2 block
                      text-[11px] font-semibold
                      text-[#435D61]
                    "
                  >
                    Full Name
                  </label>

                  <input
                    id="student-name"
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
                    className="
                      h-11 w-full
                      rounded-xl
                      border border-[#DCE7E5]
                      bg-white px-4
                      text-[12px] text-[#344B4F]
                      outline-none
                      placeholder:text-[#A0ADAE]
                      transition-all
                      focus:border-[#06424B]
                      focus:ring-4
                      focus:ring-[#FFAB0B]/15
                    "
                  />
                </div>

                {/* EMAIL */}
                <div>
                  <label
                    htmlFor="student-email"
                    className="
                      mb-2 block
                      text-[11px] font-semibold
                      text-[#435D61]
                    "
                  >
                    Email Address
                  </label>

                  <input
                    id="student-email"
                    type="email"
                    value={draftProfile.email}
                    onChange={(event) =>
                      setDraftProfile({
                        ...draftProfile,
                        email: event.target.value,
                      })
                    }
                    placeholder="Enter your email address"
                    className="
                      h-11 w-full
                      rounded-xl
                      border border-[#DCE7E5]
                      bg-white px-4
                      text-[12px] text-[#344B4F]
                      outline-none
                      placeholder:text-[#A0ADAE]
                      transition-all
                      focus:border-[#06424B]
                      focus:ring-4
                      focus:ring-[#FFAB0B]/15
                    "
                  />
                </div>

                {/* PHONE */}
                <div>
                  <label
                    htmlFor="student-phone"
                    className="
                      mb-2 block
                      text-[11px] font-semibold
                      text-[#435D61]
                    "
                  >
                    Phone Number
                  </label>

                  <input
                    id="student-phone"
                    type="tel"
                    value={draftProfile.phone}
                    onChange={(event) =>
                      setDraftProfile({
                        ...draftProfile,
                        phone: event.target.value,
                      })
                    }
                    placeholder="Enter your phone number"
                    className="
                      h-11 w-full
                      rounded-xl
                      border border-[#DCE7E5]
                      bg-white px-4
                      text-[12px] text-[#344B4F]
                      outline-none
                      placeholder:text-[#A0ADAE]
                      transition-all
                      focus:border-[#06424B]
                      focus:ring-4
                      focus:ring-[#FFAB0B]/15
                    "
                  />
                </div>
              </div>

              {/* FORM ACTIONS */}
              <div className="
                flex items-center
                justify-end gap-3
                border-t border-[#EAF0EE]
                bg-[#FAFCFB]
                px-6 py-4
              ">
                <button
                  type="button"
                  onClick={() => setEditProfileOpen(false)}
                  className="
                    h-10 rounded-lg
                    border border-[#DCE6E4]
                    bg-white px-4
                    text-[11px] font-semibold
                    text-[#60777A]
                    transition-colors
                    hover:bg-[#F2F6F5]
                  "
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="
                    inline-flex h-10
                    items-center justify-center
                    gap-2 rounded-lg
                    bg-[#06424B] px-5
                    text-[11px] font-semibold
                    text-white
                    shadow-sm
                    transition-colors
                    hover:bg-[#0A515B]
                  "
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

export default StudentPageHeader;
