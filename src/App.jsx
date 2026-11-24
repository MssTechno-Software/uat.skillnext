import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";

// Authentication Pages
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import EmailSent from "./pages/auth/EmailSent";
import SetPassword from "./pages/auth/SetPassword";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

// Legal Pages
import TermsAndConditions from "./pages/auth/legal/TermsAndConditions";
import PrivacyPolicy from "./pages/auth/legal/PrivacyPolicy";

// Protected Routes
import ProtectedRoute from "./components/auth/ProtectedRoute";
import StudentRoutes from "./student/StudentRoutes";
import TeacherRoutes from "./teacher/TeacherRoutes";

// Session
import { clearAuthSession } from "./services/authSession";
import { ProfileProvider } from "./components/ProfileProvider";
import LanguageSwitcher from "./components/common/LanguageSwitcher";
import NativeValidationLanguage from "./components/common/NativeValidationLanguage";
import { useTranslation } from "react-i18next";

function SessionExpiredPopup({ onLogin }) {
  const { t } = useTranslation("ui");

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#06424B]/25 p-4 backdrop-blur-[6px]">
      <div className="w-full max-w-[420px] rounded-[28px] border border-[#E8EFED] bg-white p-7 text-center shadow-2xl sm:p-9" role="alertdialog" aria-modal="true" aria-labelledby="session-expired-title" aria-describedby="session-expired-description">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFF3D8]">
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#94650C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>

        <h2 id="session-expired-title" className="mt-5 text-xl font-extrabold text-[#06424B]">
          {t("Your Session Has Expired")}
        </h2>

        <p id="session-expired-description" className="mx-auto mt-3 max-w-[320px] text-sm leading-6 text-[#718486]">
          {t("For your security, your session has expired. Please log in again to continue learning.")}
        </p>

        <button type="button" onClick={onLogin} className="mt-7 flex h-12 w-full items-center justify-center rounded-xl bg-[#FFAB0B] px-5 text-sm font-extrabold text-[#06424B] transition hover:bg-[#FFC13C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#06424B] focus-visible:ring-offset-2">
          {t("Login Again")}
        </button>

        <p className="mt-4 text-[11px] font-medium text-[#9AA9AA]">
          SKILL NEXT CONSULTING INC.</p>
      </div>
    </div>
  );
}

function App() {
  // Subscribe the routed application tree to language changes.
  useTranslation("ui");
  const navigate = useNavigate();
  const location = useLocation();
  const isPortalRoute = location.pathname.startsWith("/student") || location.pathname.startsWith("/teacher");
  const [sessionExpired, setSessionExpired] = useState(false);

  // Listen for session expiration from authenticated requests
  useEffect(() => {
    const handleSessionExpired = () => setSessionExpired(true);

    window.addEventListener("session-expired", handleSessionExpired);
    return () => window.removeEventListener("session-expired", handleSessionExpired);
  }, []);

  // Clear session and redirect to login
  const handleLoginAgain = () => {
    clearAuthSession();
    setSessionExpired(false);
    navigate("/login", { replace: true });
  };

  return (
    <>
      <NativeValidationLanguage />
      {!isPortalRoute && (
        <div className="fixed right-4 top-4 z-[10000] sm:right-6 sm:top-6">
          <LanguageSwitcher variant="floating" />
        </div>
      )}
      <Routes>
        {/* Default Route */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Authentication Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/email-sent" element={<EmailSent />} />
        <Route path="/set-password" element={<SetPassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Legal Routes */}
        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />

        {/* Protected Student Route */}
        <Route path="/student/*" element={<ProtectedRoute allowedRole="student"><ProfileProvider><StudentRoutes /></ProfileProvider></ProtectedRoute>} />

        {/* Protected Teacher Route */}
        <Route path="/teacher/*" element={<ProtectedRoute allowedRole="teacher"><ProfileProvider><TeacherRoutes /></ProfileProvider></ProtectedRoute>} />

        {/* Invalid Route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>

      {/* Global Session Expired Popup */}
      {sessionExpired && <SessionExpiredPopup onLogin={handleLoginAgain} />}
    </>
  );
}

export default App;