import { translateValue } from "../../i18n";
import { BookOpen, MessageCircleQuestion, ShieldCheck, Workflow, Users, ClipboardCheck } from "lucide-react";
import TeacherLayout from "./TeacherLayout";
import { PageHeader } from "./TeacherUI";

const helpItems = [
  { icon: Workflow, title: "Course structure", text: "Create a main category, add courses directly under it, organise each course into modules, then add text, video or document content." },
  { icon: BookOpen, title: "Structured learning content", text: "Use the content editor to create headings, subheadings, paragraphs, bullet lists and numbered lists. Each content item includes title, contentType, body, blocks, url, position and visible fields." },
  { icon: Users, title: "Student management and enrolment", text: "Open Student Management to browse sample student records, assign a complete course to one or more students and manage existing demo enrolments. Changes are saved locally in this browser." },
  { icon: ClipboardCheck, title: "Assignments", text: "Create an assignment against a whole course or a specific module, set due dates and marks, then control visibility for enrolled students." },
  { icon: ShieldCheck, title: "Visibility settings", text: "Keep categories, courses, modules, content and assignments hidden while drafting. Make them visible when ready for students." },
  { icon: MessageCircleQuestion, title: "Need more help?", text: "Contact your Skill Next administrator for account, access or course-management assistance." },
];

export default function TeacherSupport() {
  return <TeacherLayout><PageHeader title={translateValue("Help & Support")} description={translateValue("Guidance for building courses, publishing learning materials and assigning courses to students.")} /><div className="grid gap-4 md:grid-cols-2">{helpItems.map(({ icon: Icon, title, text }) => <article key={title} className="rounded-[20px] border border-[#E0E9E9] bg-white p-5 shadow-[0_5px_18px_rgba(18,59,67,0.03)]"><span className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#EAF2F1] text-[#06424B]"><Icon size={20} /></span><h2 className="mt-4 text-[14px] font-extrabold text-[#17464D]">{translateValue(title)}</h2><p className="mt-2 text-[11px] leading-6 text-[#829497]">{translateValue(text)}</p></article>)}</div></TeacherLayout>;
}
