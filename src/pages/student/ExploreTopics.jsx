import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Braces, Code2, Compass, Database, Globe, Layers, Palette, Search } from "lucide-react";
import StudentSidebar from "../../components/student/StudentSidebar";
import StudentPageHeader from "../../components/student/StudentPageHeader";
import { Hero, IconBadge, PageShell, ProgressBar } from"../../components/student/ui";
import { technologies } from "../../data/studentLearningData";
import { technologyProgress, useProgress } from "../../data/studentProgress";

const icons = { react: Layers, python: Braces, javascript: Code2, java: Code2, sql: Database, "html-css": Globe };

function ExploreTopics() {
  const progress = useProgress();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const categories = ["All", ...new Set(technologies.map((item) => item.category))];
  const filtered = useMemo(
    () =>
      technologies.filter((item) => {
        const matchesSearch = `${item.name} ${item.category} ${item.description}`.toLowerCase().includes(search.toLowerCase());
        return matchesSearch && (category === "All" || item.category === category);
      }),
    [search, category]
  );

  return (
    <StudentSidebar>
      <PageShell>
        <StudentPageHeader title="Explore Topics" subtitle="Choose a technology and start learning one topic at a time." />
        <Hero
          icon={Compass}
          eyebrow="EXPLORE YOUR NEXT SKILL"
          title="What would you like to learn?"
          text="Select a technology to open its lessons. Read the theory, try the examples, then check yourself with the technology quiz."
        />

        <div className="my-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <label className="relative block w-full md:max-w-[380px]">
            <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6C8589]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search technologies..."
              className="h-12 w-full rounded-xl border border-[#CFE2E0] bg-white pl-11 pr-3 text-sm text-[#2F4A4E] shadow-sm outline-none placeholder:text-[#8AA0A3] focus:border-[#06424B] focus:ring-4 focus:ring-[#FFAB0B]/25"
            />
          </label>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`shrink-0 rounded-full px-5 py-2.5 text-[13px] font-bold transition ${
                  category === item
                    ? "bg-[#06424B] !text-white shadow-md"
                    : "border border-[#CFE2E0] bg-white !text-[#3F5C60] hover:border-[#FFAB0B] hover:bg-[#FFF9EA]"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((tech) => {
            const Icon = icons[tech.id] || Palette;
            const gold = tech.accent === "gold";
            const p = technologyProgress(progress, tech);
            return (
              <Link
                key={tech.id}
                to={`/student/topics/${tech.id}`}
                className="group overflow-hidden rounded-3xl border border-[#D9E8E6] bg-white !no-underline shadow-[0_2px_10px_rgba(6,66,75,0.05)] transition hover:-translate-y-1.5 hover:border-[#FFAB0B] hover:shadow-[0_18px_36px_rgba(6,66,75,0.14)]"
              >
                <div className={`flex items-center justify-between px-6 py-5 ${gold ? "bg-gradient-to-br from-[#FFAB0B] to-[#FFC94D]" : "bg-gradient-to-br from-[#06424B] to-[#0E6B73]"}`}>
                  <span className={`flex h-14 w-14 items-center justify-center rounded-2xl ${gold ? "bg-white/70 text-[#06424B]" : "bg-white/15 text-[#FFAB0B]"}`}>
                    <Icon size={28} />
                  </span>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${gold ? "bg-[#06424B] text-white" : "bg-[#FFAB0B] text-[#06424B]"}`}>{tech.level}</span>
                </div>
                <div className="p-6">
                  <p className="text-xs font-bold tracking-wide text-[#B07A06]">{tech.category.toUpperCase()}</p>
                  <h3 className="mt-1 text-2xl font-extrabold text-[#06424B]">{tech.name}</h3>
                  <p className="mt-2 min-h-[60px] text-sm leading-6 text-[#4F6B6F]">{tech.description}</p>
                  <div className="mt-4 flex items-center gap-4 text-[13px] font-semibold text-[#3F5C60]">
                    <span className="flex items-center gap-1.5"><BookOpen size={15} className="text-[#B07A06]" />{tech.topics.length} topics</span>
                    <span>{tech.lessons} lessons</span>
                    <span>5 quiz Qs</span>
                  </div>
                  <ProgressBar value={p.percent} className="mt-4" />
                  <div className="mt-4 flex items-center justify-between border-t border-[#EAF1F0] pt-4">
                    <span className="text-xs font-semibold text-[#6C8589]">{p.done}/{p.total} completed</span>
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#06424B] px-4 py-2 text-[13px] font-bold !text-white transition group-hover:bg-[#0B5C68]">
                      Start learning <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[#BFD6D3] bg-white p-12 text-center text-sm text-[#5A7478]">
            <IconBadge icon={Search} tone="gold" className="mx-auto mb-3" />
            No matching technology found.
          </div>
        )}
      </PageShell>
    </StudentSidebar>
  );
}

export default ExploreTopics;
