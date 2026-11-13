
import { Navigate } from "react-router-dom";
import {
  hasAuthSession,
  getUserRole,
} from "../../services/authSession";

function ProtectedRoute({ allowedRole, children }) {
  // Check authentication
  if (!hasAuthSession()) {
    return <Navigate to="/login" replace />;
  }

  // Get logged-in user role
  const userRole = (getUserRole() || "").trim().toLowerCase();

  // Invalid role
  if (!userRole) {
    return <Navigate to="/login" replace />;
  }

  // Redirect users to their own portal
  if (userRole !== allowedRole) {
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
