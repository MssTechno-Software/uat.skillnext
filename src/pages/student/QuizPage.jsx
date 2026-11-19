import { useParams } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { Card, PageShell } from "../../components/student/ui";
import ModuleAssessmentPage from "./ModuleAssessmentPage";

// QuizPage accepts assignment IDs and loads question data through the assessment API.
function QuizPage() {
  const { assignmentId } = useParams();

  if (!assignmentId) {
    return (
      <PageShell max="max-w-[900px]">
        <Card className="p-8 text-center">
          <AlertCircle size={26} className="mx-auto text-[#94650C]" />
          <h1 className="mt-4 text-xl font-extrabold text-[#06424B]">Assessment not selected</h1>
          <p className="mt-2 text-sm leading-6 text-[#718486]">
            Open the module lesson and select an assessment published by your course teacher.
          </p>
        </Card>
      </PageShell>
    );
  }

  return <ModuleAssessmentPage />;
}

export default QuizPage;
