import { useState } from "react";
import { Bell, LockKeyhole, Save, UserRound } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import StudentPageHeader from "../../components/student/StudentPageHeader";
import {
  Btn,
  Card,
  IconBadge,
  Note,
  PageShell,
} from "../../components/student/ui";
const input = "mt-2 h-12 w-full rounded-xl border border-[#CFE2E0] bg-white px-4 text-sm font-normal text-[#2F4A4E] outline-none placeholder:text-[#8AA0A3] focus:border-[#06424B] focus:ring-4 focus:ring-[#FFAB0B]/25";

function StudentSettings() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [notice, setNotice] = useState("");

  const handleSave = (event) => {
    event.preventDefault();
    setNotice("Profile saving is not connected yet. Connect the student profile API to persist these changes.");
  };

  return (
    <Sidebar>
      <PageShell max="max-w-[1000px]">
        <StudentPageHeader title="Settings" subtitle="Manage your student profile and account preferences." />
        <form onSubmit={handleSave} className="space-y-5">
          <Card className="p-5 sm:p-7">
            <div className="flex items-center gap-4">
              <IconBadge icon={UserRound} />
              <div><h2 className="text-lg font-bold text-[#06424B]">Profile information</h2><p className="text-sm text-[#5A7478]">Update your display details.</p></div>
            </div>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-bold text-[#3F5C60]">Display name<input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" className={input} /></label>
              <label className="text-sm font-bold text-[#3F5C60]">Email address<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={input} /></label>
            </div>
          </Card>
          <Card className="p-5 sm:p-7">
            <div className="flex items-center gap-4">
              <IconBadge icon={Bell} tone="gold" />
              <div><h2 className="text-lg font-bold text-[#06424B]">Learning notifications</h2><p className="text-sm text-[#5A7478]">Choose how you want to be reminded.</p></div>
            </div>
            <p className="mt-4 text-sm leading-6 text-[#4F6B6F]">Email and in-app notification preferences will be configurable once the backend supports them.</p>
          </Card>
          {notice && <Note role="status">{notice}</Note>}
          <Btn type="submit" icon={Save}>Save changes</Btn>
        </form>
        <Note icon={LockKeyhole} tone="teal" className="mt-6">Password updates and account security actions should use the secure authentication endpoints, not local-only form state.</Note>
      </PageShell>
    </Sidebar>
  );
}

export default StudentSettings;
