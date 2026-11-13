
import { Navigate, Route, Routes } from "react-router-dom";
import TeacherDashboard from "../pages/teacher/TeacherDashboard";

function TeacherRoutes() {
  return (
    <Routes>
      <Route index element={<Navigate to="dashboard" replace />} />

      <Route
        path="dashboard"
        element={<TeacherDashboard />}
      />

      <Route
        path="*"
        element={<Navigate to="dashboard" replace />}
      />
    </Routes>
  );
}

export default TeacherRoutes;
