
import {
  ArrowRight,
  BookOpen,
  Braces,
  CheckCircle2,
  Code2,
  Compass,
  Database,
  Globe,
  GraduationCap,
  Layers,
  Palette,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

import Sidebar from "../../components/Sidebar";
import StudentPageHeader from "../../components/student/StudentPageHeader";
import { PageShell } from "../../components/student/ui";
import { technologies } from "../../data/studentLearningData";
import {
  technologyProgress,
  useProgress,
} from "../../data/studentProgress";

const icons = {
  react: Layers,
  python: Braces,
  javascript: Code2,
  java: Code2,
  sql: Database,
  "html-css": Globe,
};

// Two coordinated colours matching Skill Next branding
const cardThemes = [
  {
    header: "bg-[#06424B]",
    icon: "bg-white/10 text-[#FFAB0B]",
    category: "text-[#D5E7E5]",
    level: "bg-[#FFAB0B] text-[#06424B]",
    decoration: "border-white/[0.08]",
  },
  {
    header: "bg-[#52676B]",
    icon: "bg-white/10 text-[#FFE0A0]",
    category: "text-[#E3ECEB]",
    level: "bg-[#FFE0A0] text-[#40565A]",
    decoration: "border-white/[0.08]",
  },
];

function ExploreTopics() {
  const progress = useProgress();

  return (
    <Sidebar>
      <PageShell>
        <div className="mx-auto w-full max-w-[1250px]">

          {/* PAGE HEADER */}
          <StudentPageHeader
            title="Explore Topics"
            subtitle="Discover technologies, explore lessons and build your skills."
          />

          {/* HERO SECTION */}
          <section className="relative mt-5 overflow-hidden rounded-[22px] bg-[#06424B] shadow-[0_8px_25px_rgba(6,66,75,0.10)]">

            <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full border-[32px] border-white/[0.045]" />
            <div className="pointer-events-none absolute -right-4 -top-12 h-40 w-40 rounded-full border border-[#FFAB0B]/20" />
            <div className="pointer-events-none absolute -bottom-20 right-[30%] h-44 w-44 rounded-full bg-[#FFAB0B]/[0.07] blur-3xl" />

            <div className="relative z-10 flex flex-col items-start justify-between gap-6 px-6 py-7 sm:px-8 sm:py-8 lg:flex-row lg:items-center lg:px-10">

              <div className="max-w-[650px]">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#FFAB0B]/30 bg-[#FFAB0B]/10 px-3 py-1.5 text-[10px] font-bold tracking-[1.4px] text-[#FFCB65]">
                  <Sparkles size={13} />
                  EXPLORE YOUR NEXT SKILL
                </div>

                <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-3xl lg:text-[36px]">
                  What would you like
                  <span className="text-[#FFAB0B]">
                    {" "}to learn?
                  </span>
                </h1>

                <p className="mt-3 max-w-[570px] text-xs leading-6 text-white/70 sm:text-sm sm:leading-7">
                  Choose a technology, explore structured lessons,
                  understand concepts and test your knowledge through
                  interactive quizzes.
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.08] px-3 py-2 text-[11px] font-semibold text-white">
                    <BookOpen size={14} className="text-[#FFAB0B]" />
                    Theory & Lessons
                  </span>

                  <span className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.08] px-3 py-2 text-[11px] font-semibold text-white">
                    <Code2 size={14} className="text-[#FFAB0B]" />
                    Practical Examples
                  </span>

                  <span className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.08] px-3 py-2 text-[11px] font-semibold text-white">
                    <GraduationCap size={14} className="text-[#FFAB0B]" />
                    Knowledge Quizzes
                  </span>
                </div>
              </div>

              {/* HERO ILLUSTRATION */}
              <div className="hidden h-[135px] w-[145px] shrink-0 items-center justify-center rounded-[24px] border border-white/10 bg-white/[0.07] lg:flex">
                <div className="relative flex h-[76px] w-[76px] items-center justify-center rounded-[22px] bg-[#FFAB0B] text-[#06424B] shadow-xl">
                  <Compass size={40} strokeWidth={1.6} />

                  <span className="absolute -right-3 -top-3 flex h-9 w-9 items-center justify-center rounded-xl border-2 border-[#06424B] bg-white text-[#06424B]">
                    <Sparkles size={16} />
                  </span>
                </div>
              </div>

            </div>
          </section>

          {/* TECHNOLOGY SECTION */}
          <section className="mt-7">

            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-extrabold tracking-tight text-[#06424B]">
                  Explore Technologies
                </h2>

                <p className="mt-1 text-xs text-[#829596]">
                  Select a learning path to get started.
                </p>
              </div>

              <span className="hidden rounded-lg border border-[#DCE7E5] bg-white px-3 py-2 text-[10px] font-bold text-[#527477] sm:inline-flex">
                {technologies.length} TECHNOLOGIES
              </span>
            </div>

            {/* TECHNOLOGY CARDS */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">

              {technologies.map((tech, index) => {
                const Icon = icons[tech.id] || Palette;
                const p = technologyProgress(progress, tech);
                const theme = cardThemes[index % 2];

                return (
                  <Link
                    key={tech.id}
                    to={`/student/topics/${tech.id}`}
                    className="group flex min-w-0 flex-col overflow-hidden rounded-[19px] border border-[#DCE6E3] bg-white !no-underline shadow-[0_3px_12px_rgba(6,66,75,0.035)] transition-all duration-300 hover:-translate-y-1 hover:border-[#C5A45D] hover:shadow-[0_12px_28px_rgba(6,66,75,0.10)]"
                  >

                    {/* CARD TOP - TWO ALTERNATING BRAND COLOURS */}
                    <div className={`relative overflow-hidden ${theme.header} px-5 py-5`}>

                      <div className={`pointer-events-none absolute -right-7 -top-12 h-36 w-36 rounded-full border-[20px] ${theme.decoration}`} />

                      <div className="pointer-events-none absolute -right-2 -bottom-14 h-28 w-28 rounded-full bg-[#FFAB0B]/10 blur-2xl" />

                      <div className="relative flex items-center justify-between gap-3">

                        <div className={`flex h-12 w-12 items-center justify-center rounded-[14px] border border-white/10 ${theme.icon} transition-all duration-300 group-hover:scale-105`}>
                          <Icon size={24} strokeWidth={1.8} />
                        </div>

                        <span className={`rounded-lg px-3 py-1.5 text-[10px] font-extrabold tracking-wide ${theme.level}`}>
                          {tech.level}
                        </span>
                      </div>

                      <div className="relative mt-4">
                        <p className={`text-[10px] font-bold tracking-[1.5px] ${theme.category}`}>
                          {tech.category.toUpperCase()}
                        </p>

                        <h3 className="mt-1 text-xl font-extrabold tracking-tight text-white">
                          {tech.name}
                        </h3>
                      </div>
                    </div>

                    {/* CARD CONTENT */}
                    <div className="flex flex-1 flex-col p-5">

                      <p className="min-h-[48px] text-xs leading-6 text-[#718486]">
                        {tech.description}
                      </p>

                      {/* COURSE INFORMATION */}
                      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-[#EAF0EE] pb-4">

                        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#49686B]">
                          <BookOpen size={14} className="text-[#B88736]" />
                          {tech.topics.length} Topics
                        </span>

                        <span className="text-[11px] font-semibold text-[#49686B]">
                          {tech.lessons} Lessons
                        </span>

                        <span className="text-[11px] font-semibold text-[#49686B]">
                          5 Quiz Qs
                        </span>
                      </div>

                      {/* LEARNING PROGRESS */}
                      <div className="mt-4">

                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-[11px] font-bold text-[#587477]">
                            Learning Progress
                          </span>

                          <span className="text-xs font-extrabold text-[#06424B]">
                            {p.percent}%
                          </span>
                        </div>

                        <div className="h-[7px] overflow-hidden rounded-full bg-[#E8EFED]">
                          <div
                            className="h-full rounded-full bg-[#FFAB0B] transition-all duration-500"
                            style={{
                              width: `${p.percent}%`,
                            }}
                          />
                        </div>

                        <div className="mt-2 flex items-center justify-between">

                          <span className="text-[10px] text-[#91A1A2]">
                            {p.done} of {p.total} completed
                          </span>

                          {p.percent === 100 && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-[#39765D]">
                              <CheckCircle2 size={12} />
                              Completed
                            </span>
                          )}
                        </div>
                      </div>

                      {/* ACTION BUTTON */}
                      <div className="mt-auto pt-5">

                        <div className="flex items-center justify-between rounded-xl bg-[#FFAB0B] px-4 py-3 text-[#06424B] transition-all duration-200 group-hover:bg-[#FFC13C]">

                          <span className="text-xs font-extrabold">
                            {p.percent > 0
                              ? "Continue Learning"
                              : "Start Learning"}
                          </span>

                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#06424B] text-[#FFAB0B] transition-transform duration-200 group-hover:translate-x-1">
                            <ArrowRight size={15} />
                          </span>
                        </div>
                      </div>

                    </div>
                  </Link>
                );
              })}

            </div>
          </section>

          {/* FOOTER */}
          <div className="mt-6 flex items-center justify-center gap-2 border-t border-[#DCE6E3] py-4">
            <Sparkles size={13} className="text-[#B88736]" />
            <p className="text-[10px] font-medium text-[#829596]">
              Skill Next · Every skill starts with curiosity.
            </p>
          </div>

        </div>
      </PageShell>
    </Sidebar>
  );
}

export default ExploreTopics;
