
import {
  BookOpen,
  Sparkles,
  FileText,
  FileDown,
  Presentation,
  FolderOpen,
  NotebookPen,
  ClipboardList,
  ArrowRight,
  Download,
  BookMarked,
} from "lucide-react";

import StudentPageHeader from "../../components/student/StudentPageHeader";
import { PageShell } from "../../components/student/ui";

const resourceItems = [
  {
    icon: FileText,
    title: "PDF Notes",
    description: "Topic-wise notes, study guides and downloadable PDF materials.",
    tag: "PDF",
    color: "bg-[#EAF3F2] text-[#06424B]",
  },
  {
    icon: Presentation,
    title: "Presentations",
    description: "Easy-to-understand PowerPoint slides for every learning topic.",
    tag: "PPT / PPTX",
    color: "bg-[#FFF4DE] text-[#A87816]",
  },
  {
    icon: BookOpen,
    title: "Study Materials",
    description: "Organized learning materials to strengthen your understanding.",
    tag: "MATERIALS",
    color: "bg-[#EDF1F8] text-[#526A91]",
  },
  {
    icon: FolderOpen,
    title: "Reference Documents",
    description: "Additional documents and useful references for your learning.",
    tag: "DOCUMENTS",
    color: "bg-[#F1EDF8] text-[#79649C]",
  },
  {
    icon: ClipboardList,
    title: "Practice Worksheets",
    description: "Practice exercises and worksheets to test your knowledge.",
    tag: "PRACTICE",
    color: "bg-[#FDF0E9] text-[#AD7450]",
  },
  {
    icon: NotebookPen,
    title: "Quick Revision",
    description: "Important points and revision materials for quick learning.",
    tag: "REVISION",
    color: "bg-[#EAF3F2] text-[#39766D]",
  },
];

function StudyResources() {
  return (
    <PageShell max="max-w-[1300px]">
      <StudentPageHeader
        title="Study Resources"
        subtitle="Everything you need to learn, revise and practice."
      />

      <div className="relative mt-6 overflow-hidden rounded-[26px] bg-[#06424B] px-6 py-10 shadow-[0_12px_35px_rgba(6,66,75,0.12)] sm:px-10 sm:py-12">

        {/* Background decoration */}
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full border-[35px] border-white/[0.045]" />
        <div className="pointer-events-none absolute right-24 bottom-[-100px] h-64 w-64 rounded-full bg-[#FFAB0B]/10 blur-3xl" />
        <div className="pointer-events-none absolute left-[-60px] bottom-[-100px] h-60 w-60 rounded-full bg-white/[0.05] blur-3xl" />

        <div className="relative z-10 grid items-center gap-10 lg:grid-cols-[1fr_280px]">

          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#FFAB0B]/30 bg-[#FFAB0B]/10 px-4 py-2">
              <Sparkles size={14} className="text-[#FFAB0B]" />
              <span className="text-[10px] font-extrabold tracking-[1.8px] text-[#FFCB65]">
                YOUR LEARNING LIBRARY
              </span>
            </div>

            <h2 className="mt-5 max-w-[620px] text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
              Learn More.
              <span className="block text-[#FFAB0B]">
                Explore More.
              </span>
            </h2>

            <p className="mt-4 max-w-[530px] text-sm leading-7 text-white/65">
              Your learning journey deserves more than lessons.
              Explore notes, presentations, reference materials and
              practice resources to make learning easier.
            </p>

            <div className="mt-7 inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.08] px-4 py-3">
              <span className="h-2 w-2 rounded-full bg-[#FFAB0B] animate-pulse" />
              <span className="text-xs font-bold tracking-wide text-white">
                COMING SOON
              </span>
            </div>
          </div>

          {/* Animated resource illustration */}
          <div className="relative hidden h-[230px] items-center justify-center lg:flex">

            <div className="absolute h-48 w-48 rounded-full border border-white/10 animate-pulse" />

            <div className="absolute left-3 top-7 flex h-14 w-14 rotate-[-12deg] items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-[#FFAB0B] shadow-lg">
              <FileText size={27} />
            </div>

            <div className="absolute right-2 top-10 flex h-14 w-14 rotate-[12deg] items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-white shadow-lg">
              <Presentation size={27} />
            </div>

            <div className="relative z-10 flex h-32 w-32 items-center justify-center rounded-[30px] border border-[#FFAB0B]/30 bg-[#FFAB0B] text-[#06424B] shadow-[0_15px_40px_rgba(0,0,0,0.20)] animate-[bounce_3s_ease-in-out_infinite]">
              <BookOpen size={58} strokeWidth={1.5} />
              <Sparkles
                size={22}
                className="absolute -right-3 -top-3 text-white"
                fill="#FFAB0B"
              />
            </div>

            <div className="absolute bottom-5 left-8 flex h-12 w-12 rotate-[10deg] items-center justify-center rounded-xl border border-white/10 bg-white/10 text-white">
              <BookMarked size={23} />
            </div>

            <div className="absolute bottom-3 right-8 flex h-12 w-12 rotate-[-10deg] items-center justify-center rounded-xl border border-white/10 bg-white/10 text-[#FFAB0B]">
              <FileDown size={23} />
            </div>
          </div>
        </div>
      </div>

      {/* Resource categories */}
      <section className="mt-9">

        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-[#06424B]">
              What's Inside?
            </h2>
            <p className="mt-1 text-xs leading-5 text-[#829596]">
              Explore the different types of learning resources.
            </p>
          </div>

          <span className="inline-flex w-fit items-center gap-2 rounded-lg border border-[#DCE7E5] bg-white px-3 py-2 text-[10px] font-bold text-[#527477]">
            <BookOpen size={13} />
            6 RESOURCE CATEGORIES
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">

          {resourceItems.map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="group relative overflow-hidden rounded-[19px] border border-[#DCE7E5] bg-white p-5 shadow-[0_3px_12px_rgba(6,66,75,0.025)] transition-all duration-300 hover:-translate-y-1 hover:border-[#D5B56F] hover:shadow-[0_12px_25px_rgba(6,66,75,0.08)]"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-[14px] ${item.color} transition-transform duration-300 group-hover:scale-110`}>
                    <Icon size={23} strokeWidth={1.8} />
                  </div>

                  <span className="rounded-md bg-[#F3F6F5] px-2.5 py-1.5 text-[9px] font-extrabold tracking-wide text-[#718486]">
                    {item.tag}
                  </span>
                </div>

                <h3 className="mt-5 text-[15px] font-extrabold text-[#06424B]">
                  {item.title}
                </h3>

                <p className="mt-2 min-h-[48px] text-xs leading-6 text-[#829596]">
                  {item.description}
                </p>

                <div className="mt-5 flex items-center justify-between border-t border-[#EDF1EF] pt-4">
                  <span className="text-[10px] font-bold tracking-wide text-[#A0ACAC]">
                    COMING SOON
                  </span>

                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F5F8F7] text-[#06424B] transition-all group-hover:bg-[#FFAB0B]">
                    <ArrowRight size={15} />
                  </div>
                </div>
              </div>
            );
          })}

        </div>
      </section>

      {/* Bottom note */}
      <div className="mt-7 flex items-center gap-3 rounded-xl border border-[#E8EDEB] bg-white px-5 py-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FFF4DE] text-[#A87816]">
          <Download size={18} />
        </div>

        <div>
          <p className="text-xs font-bold text-[#06424B]">
            Your resources are on their way!
          </p>
          <p className="mt-1 text-[11px] leading-5 text-[#829596]">
            Get ready to explore, read, revise and download your learning materials.
          </p>
        </div>
      </div>
    </PageShell>
  );
}

export default StudyResources;
