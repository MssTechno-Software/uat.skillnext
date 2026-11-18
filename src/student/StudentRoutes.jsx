
import { Navigate, Route, Routes } from "react-router-dom";

// Common layout for all student pages
import StudentLayout from "../components/student/StudentLayout";

// Dashboard and learning pages
import StudentDashboard from "../pages/student/StudentDashboard";
import MyLearning from "../pages/student/MyLearning";
import CourseCodingAssignment from "../pages/student/CourseCodingAssignment";

// Explore Topics and lesson pages
import ExploreTopics from "../pages/student/ExploreTopics";
import TopicDetails from "../pages/student/TopicDetails";
import LessonContent from "../pages/student/LessonContent";

// Study Resources
import StudyResources from "../pages/student/StudyResources";

// Individual quiz functionality
import QuizPage from "../pages/student/QuizPage";
import QuizResult from "../pages/student/QuizResult";

// Interview Preparation pages
import AIPractice from "../pages/student/AIPractice";
import SelfIntroductionPractice from "../pages/student/SelfIntroductionPractice";
import InterviewPrepCourses from "../pages/student/InterviewPrepCourses";
import InterviewPrepSubtopics from "../pages/student/InterviewPrepSubtopics";
import InterviewPrepDifficulty from "../pages/student/InterviewPrepDifficulty";
import TopicTheoryPractice from "../pages/student/TopicTheoryPractice";
import AIFeedback from "../pages/student/AIFeedback";

// Analytics
import MyAnalytics from "../pages/student/MyAnalytics";

// Other student pages
import Certificates from "../pages/student/Certificates";
import Calendar from "../pages/student/Calendar";
import StudentSettings from "../pages/student/StudentSettings";
import HelpSupport from "../pages/student/HelpSupport";

function StudentRoutes() {
  return (
    <Routes>
      {/* All student routes share the same layout */}
      <Route element={<StudentLayout />}>

        {/* Redirect the default student route to Dashboard */}
        <Route
          index
          element={<Navigate to="dashboard" replace />}
        />

        {/* Student Dashboard */}
        <Route
          path="dashboard"
          element={<StudentDashboard />}
        />

        {/* My Learning */}
        <Route
          path="my-learning"
          element={<MyLearning />}
        />

        {/* Course Coding Assignment */}
        <Route
          path="course-coding-assignment"
          element={<CourseCodingAssignment />}
        />

        {/* Explore Topics */}
        <Route
          path="topics"
          element={<ExploreTopics />}
        />

        {/* Technology Details */}
        <Route
          path="topics/:technologySlug"
          element={<TopicDetails />}
        />

        {/* Individual Topic Lesson */}
        <Route
          path="topics/:technologySlug/topic/:topicId"
          element={<LessonContent />}
        />

        {/* Study Resources */}
        <Route
          path="resources"
          element={<StudyResources />}
        />

        {/* Individual Quiz */}
        <Route
          path="quiz/:quizSlug"
          element={<QuizPage />}
        />

        {/* Quiz Result */}
        <Route
          path="quiz-result"
          element={<QuizResult />}
        />

        {/* Interview Preparation */}
        <Route
          path="ai-practice"
          element={<AIPractice />}
        />

        {/* Self Introduction Practice */}
        <Route
          path="ai-practice/self-introduction"
          element={<SelfIntroductionPractice />}
        />

        {/* Interview Preparation Course Selection */}
        <Route
          path="ai-practice/topic-theory"
          element={<InterviewPrepCourses />}
        />

        {/* Interview Preparation Subtopics */}
        <Route
          path="ai-practice/topic-theory/:courseId/topics"
          element={<InterviewPrepSubtopics />}
        />

        {/* Technology-specific Interview Subtopics */}
        <Route
          path="ai-practice/topic-theory/:courseId/technology/:technologyId/topics"
          element={<InterviewPrepSubtopics />}
        />

        {/* Interview Difficulty Selection */}
        <Route
          path="ai-practice/topic-theory/:courseId/topic/:topicId/difficulty"
          element={<InterviewPrepDifficulty />}
        />

        {/* Topic Theory Interview */}
        <Route
          path="ai-practice/topic-theory/interview"
          element={<TopicTheoryPractice />}
        />

        {/* AI Interview Feedback */}
        <Route
          path="ai-practice/feedback"
          element={<AIFeedback />}
        />

        {/* My Analytics */}
        <Route
          path="my-analytics"
          element={<MyAnalytics />}
        />

        {/* Certificates */}
        <Route
          path="certificates"
          element={<Certificates />}
        />

        {/* Calendar */}
        <Route
          path="calendar"
          element={<Calendar />}
        />

        {/* Student Settings */}
        <Route
          path="settings"
          element={<StudentSettings />}
        />

        {/* Help and Support */}
        <Route
          path="support"
          element={<HelpSupport />}
        />

      </Route>

      {/* Redirect invalid student routes to Dashboard */}
      <Route
        path="*"
        element={<Navigate to="dashboard" replace />}
      />
    </Routes>
  );
}

export default StudentRoutes;
