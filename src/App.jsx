
import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

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

// Student Routes
import StudentRoutes from "./student/StudentRoutes";

function App() {
  return (
    <Routes>

      {/* Default Route */}
      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      {/* Authentication Routes */}
      <Route
        path="/login"
        element={<Login />}
      />
      <Route
        path="/signup"
        element={<Signup />}
      />

      <Route
        path="/email-sent"
        element={<EmailSent />}
      />
    
      <Route
        path="/set-password"
        element={<SetPassword />}
      />

      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />

      <Route
        path="/reset-password"
        element={<ResetPassword />}
      />

      {/* Legal Routes */}
      <Route
        path="/terms-and-conditions"
        element={<TermsAndConditions />}
      />

      <Route
        path="/privacy-policy"
        element={<PrivacyPolicy />}
      />

      {/* Student Portal Routes */}
      <Route
        path="/student/*"
        element={<StudentRoutes />}
      />

      {/* Invalid Routes */}
      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />

    </Routes>
  );
}

export default App;
