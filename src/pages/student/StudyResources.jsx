
import { BookOpen, Clock, Sparkles, FileText, Presentation, GraduationCap } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import StudentPageHeader from "../../components/student/StudentPageHeader";
import { Card, Hero, IconBadge, Note, PageShell } from "../../components/student/ui";

function StudyResources() {
  return (
    <Sidebar>
      <PageShell max="max-w-[1300px]">
        <StudentPageHeader
          title="Study Resources"
          subtitle="A dedicated learning resource library is planned for a future update."
        />

        <Hero
          icon={BookOpen}
          eyebrow="COMING IN A FUTURE UPDATE"
          title="Your learning resource library is on its way"
          text="We are planning to introduce a dedicated space where students can access study materials, downloadable notes, presentations, and additional learning resources. This feature will be developed and made available in a future platform update."
        />

        <Card className="mt-8 p-8 sm:p-10">
          <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EAF3F2]">
              <Clock size={30} className="text-[#06424B]" />
            </div>

            <span className="mt-5 rounded-full bg-[#FFF3D5] px-4 py-2 text-[11px] font-extrabold tracking-[0.14em] text-[#966600]">
              UNDER FUTURE DEVELOPMENT
            </span>

            <h2 className="mt-5 text-2xl font-extrabold tracking-tight text-[#06424B] sm:text-3xl">
              Better learning resources are coming soon.
            </h2>

            <p className="mt-3 text-sm leading-7 text-[#647D80]">
              The Study Resources section is currently planned for future development.
              Our goal is to provide a centralized library that makes accessing
              learning materials easier and more convenient for students.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: BookOpen,
                title: "Online Lessons",
                description: "Structured learning content and topic-wise lessons."
              },
              {
                icon: FileText,
                title: "Study Notes",
                description: "Downloadable PDFs, reference materials, and notes."
              },
              {
                icon: Presentation,
                title: "Presentations",
                description: "Topic-wise presentations and revision materials."
              }
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-[#DCE9E7] bg-[#FBFEFD] p-5"
              >
                <IconBadge icon={item.icon} tone="teal" size="lg" />

                <h3 className="mt-4 text-[15px] font-bold text-[#06424B]">
                  {item.title}
                </h3>

                <p className="mt-2 text-[13px] leading-6 text-[#647D80]">
                  {item.description}
                </p>

                <span className="mt-4 inline-flex rounded-full bg-[#EEF3F4] px-3 py-1.5 text-[10px] font-bold text-[#60777A]">
                  PLANNED
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Note icon={Sparkles} className="mt-5">
          This section is part of our planned platform enhancements.
          Study materials and additional learning resources will be introduced
          in upcoming updates.
        </Note>
      </PageShell>
    </Sidebar>
  );
}

export default StudyResources;
