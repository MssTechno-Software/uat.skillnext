import { Navigate, Route, Routes } from "react-router-dom";
import StudentDashboard from "../pages/student/StudentDashboard";
import MyLearning from "../pages/student/MyLearning";
import ExploreTopics from "../pages/student/ExploreTopics";
import TopicDetails from "../pages/student/TopicDetails";
import LessonContent from "../pages/student/LessonContent";
import StudyResources from "../pages/student/StudyResources";
import Quizzes from "../pages/student/Quizzes";
import QuizPage from "../pages/student/QuizPage";
import QuizResult from "../pages/student/QuizResult";
import AIPractice from "../pages/student/AIPractice";
import SelfIntroductionPractice from "../pages/student/SelfIntroductionPractice";
import InterviewPrepCourses from "../pages/student/InterviewPrepCourses";
import InterviewPrepSubtopics from "../pages/student/InterviewPrepSubtopics";
import InterviewPrepDifficulty from "../pages/student/InterviewPrepDifficulty";
import TopicTheoryPractice from "../pages/student/TopicTheoryPractice";
import CodingAssessment from "../pages/student/CodingAssessment";
import AIFeedback from "../pages/student/AIFeedback";
import MyProgress from "../pages/student/MyProgress";
import Certificates from "../pages/student/Certificates";
import Calendar from "../pages/student/Calendar";
import StudentSettings from "../pages/student/StudentSettings";
import HelpSupport from "../pages/student/HelpSupport";

function StudentRoutes() {
  return (
    <Routes>
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<StudentDashboard />} />
      <Route path="my-learning" element={<MyLearning />} />
      <Route path="topics" element={<ExploreTopics />} />
      <Route path="topics/:technologySlug" element={<TopicDetails />} />
      <Route path="topics/:technologySlug/topic/:topicId" element={<LessonContent />} />
      <Route path="resources" element={<StudyResources />} />
      <Route path="quizzes" element={<Quizzes />} />
      <Route path="assignments" element={<Quizzes />} />
      <Route path="quiz/:quizSlug" element={<QuizPage />} />
      <Route path="quiz-result" element={<QuizResult />} />

      {/* Interview Prep: each selection stage has its own page and route. */}
      <Route path="ai-practice" element={<AIPractice />} />
      <Route path="ai-practice/self-introduction" element={<SelfIntroductionPractice />} />
      <Route path="ai-practice/topic-theory" element={<InterviewPrepCourses />} />
      <Route path="ai-practice/topic-theory/:courseId/topics" element={<InterviewPrepSubtopics />} />
      <Route path="ai-practice/topic-theory/:courseId/technology/:technologyId/topics" element={<InterviewPrepSubtopics />} />
      <Route path="ai-practice/topic-theory/:courseId/topic/:topicId/difficulty" element={<InterviewPrepDifficulty />} />
      <Route path="ai-practice/topic-theory/interview" element={<TopicTheoryPractice />} />
      <Route path="ai-practice/feedback" element={<AIFeedback />} />
      <Route path="ai-practice/coding" element={<CodingAssessment />} />

      <Route path="progress" element={<MyProgress />} />
      <Route path="certificates" element={<Certificates />} />
      <Route path="calendar" element={<Calendar />} />
      <Route path="settings" element={<StudentSettings />} />
      <Route path="support" element={<HelpSupport />} />
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
}

export default StudentRoutes;
