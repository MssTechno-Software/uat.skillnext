import { Navigate, Route, Routes } from "react-router-dom";
import TeacherDashboard from "../pages/teacher/TeacherDashboard";
import Categories from "../pages/teacher/Categories";
import CategoryCourses from "../pages/teacher/CategoryCourses";
import Courses from "../pages/teacher/Courses";
import CourseModules from "../pages/teacher/CourseModules";
import Modules from "../pages/teacher/Modules";
import ModuleContent from "../pages/teacher/ModuleContent";
import ContentLibrary from "../pages/teacher/ContentLibrary";
import StudentManagement from "../pages/teacher/StudentManagement";
import Assignments from "../pages/teacher/Assignments";
import TeacherSupport from "../pages/teacher/TeacherSupport";

export default function TeacherRoutes() {
  return (
    <Routes>
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<TeacherDashboard />} />
      <Route path="categories" element={<Categories />} />
      <Route path="categories/:categoryId/courses" element={<CategoryCourses />} />
      <Route path="courses" element={<Courses />} />
      <Route path="courses/:courseId/modules" element={<CourseModules />} />
      <Route path="courses/:courseId/modules/:moduleId" element={<ModuleContent />} />
      <Route path="modules" element={<Modules />} />
      <Route path="content" element={<ContentLibrary />} />
      <Route path="students" element={<StudentManagement />} />
      <Route path="assignments" element={<Assignments />} />
      <Route path="support" element={<TeacherSupport />} />
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
}
