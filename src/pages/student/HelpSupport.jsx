import { LifeBuoy, Mail, MessageCircle } from "lucide-react";
import StudentSidebar from "../../components/student/StudentSidebar";
import StudentPageHeader from "../../components/student/StudentPageHeader";
import { Card, IconBadge, PageShell } from "../../components/student/ui";
function HelpSupport() {
  return (
    <StudentSidebar>
      <PageShell max="max-w-[1100px]">
        <StudentPageHeader title="Help & Support" subtitle="Get help with your learning account and course experience." />
        <div className="grid gap-5 md:grid-cols-2">
          <Card className="p-6">
            <IconBadge icon={Mail} size="lg" />
            <h2 className="mt-4 text-xl font-bold text-[#06424B]">Email support</h2>
            <p className="mt-2 text-[15px] leading-7 text-[#4F6B6F]">The official student support email can be published here once confirmed.</p>
          </Card>
          <Card className="p-6">
            <IconBadge icon={MessageCircle} tone="gold" size="lg" />
            <h2 className="mt-4 text-xl font-bold text-[#06424B]">Learning assistance</h2>
            <p className="mt-2 text-[15px] leading-7 text-[#4F6B6F]">Use this area for help requests about lessons, resources, quizzes and AI practice.</p>
          </Card>
        </div>
        <Card className="mt-5 p-6">
          <div className="flex items-center gap-3 text-[#06424B]"><LifeBuoy size={22} /><h2 className="text-xl font-bold">Support centre</h2></div>
          <p className="mt-2 text-[15px] leading-7 text-[#4F6B6F]">Support ticket submission and response tracking can be enabled after the support workflow and backend endpoints are defined.</p>
        </Card>
      </PageShell>
    </StudentSidebar>
  );
}

export default HelpSupport;
