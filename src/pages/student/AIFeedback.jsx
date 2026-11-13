import { Brain, CheckCircle2, MessageSquareText } from "lucide-react";
import { useLocation } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import StudentPageHeader from "../../components/student/StudentPageHeader";
import { BackLink, Card, IconBadge, LinkButton, Note, PageShell } from"../../components/student/ui";

function AIFeedback() {
  const { state } = useLocation();
  return (
    <Sidebar>
      <PageShell max="max-w-[950px]">
        <StudentPageHeader title="Practice Feedback" subtitle="Review the submitted response and evaluation status." />
        <BackLink to="/student/ai-practice">AI Practice</BackLink>
        <Card className="p-6 sm:p-8">
          <IconBadge icon={Brain} size="lg" />
          <h1 className="mt-4 text-2xl font-extrabold text-[#06424B]">{state?.title || "Practice response"}</h1>
          {state?.question && <p className="mt-3 text-[15px] font-semibold leading-7 text-[#2F4A4E]">{state.question}</p>}
          <p className="mt-2 text-[15px] leading-7 text-[#4F6B6F]">{state?.note || "The AI evaluation service has not been connected yet."}</p>
          {state?.answer && (
            <div className="mt-5 rounded-2xl bg-[#F0F7F6] p-5">
              <p className="text-sm font-bold text-[#06424B]">Your submitted response</p>
              <p className="mt-2 whitespace-pre-wrap text-[15px] leading-7 text-[#3F5C60]">{state.answer}</p>
            </div>
          )}
          <Note icon={MessageSquareText} className="mt-5">No score or AI feedback is shown until the real evaluation API is connected. This avoids showing a made-up result.</Note>
          <div className="mt-6 flex flex-wrap gap-3">
            <LinkButton to="/student/ai-practice" variant="outline">Practise again</LinkButton>
            <LinkButton to="/student/dashboard" icon={CheckCircle2}>Dashboard</LinkButton>
          </div>
        </Card>
      </PageShell>
    </Sidebar>
  );
}

export default AIFeedback;
