
import { Navigate } from "react-router-dom";
import {
  hasAuthSession,
  getUserRole,
} from "../../services/authSession";

function ProtectedRoute({ allowedRole, children }) {
  // No active session: redirect to login
  if (!hasAuthSession()) {
    return <Navigate to="/login" replace />;
  }

  const userRole = (getUserRole() || "").trim().toLowerCase();
  const requiredRole = (allowedRole || "").trim().toLowerCase();

  // Invalid role
  if (!userRole) {
    return <Navigate to="/login" replace />;
  }

  // Redirect users to their respective portals
  if (userRole !== requiredRole) {
    if (userRole === "student") {
      return <Navigate to="/student/dashboard" replace />;
    }

    if (userRole === "teacher") {
      return <Navigate to="/teacher/dashboard" replace />;
    }

    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
