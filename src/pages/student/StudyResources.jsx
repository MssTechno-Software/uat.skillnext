import { useMemo, useState } from "react";
import { BookOpen, Download, ExternalLink, FileText, Presentation, Search } from "lucide-react";
import StudentSidebar from "../../components/student/StudentSidebar";
import StudentPageHeader from "../../components/student/StudentPageHeader";
import { Btn, Card, Hero, IconBadge, LinkButton, Note, PageShell } from"../../components/student/ui";
import { sampleResources, technologies } from "../../data/studentLearningData";

const typeIcons = { PDF: FileText, PPT: Presentation, Lesson: BookOpen };

function StudyResources() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("All");

  // Online lessons are real (they open the in-app lesson). PDFs / PPTs wait for uploaded files.
  const lessonResources = technologies.map((tech) => ({
    id: `lesson-${tech.id}`,
    title: `${tech.name} – Online Lessons`,
    technology: tech.name,
    type: "Lesson",
    description: `${tech.topics.length} topics · ${tech.lessons} lessons with examples`,
    to: `/student/topics/${tech.id}`,
  }));
  const all = [...lessonResources, ...sampleResources];

  const resources = useMemo(
    () =>
      all.filter((resource) => {
        const matchText = `${resource.title} ${resource.technology} ${resource.description}`.toLowerCase().includes(search.toLowerCase());
        return matchText && (type === "All" || resource.type === type);
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [search, type]
  );

  return (
    <StudentSidebar>
      <PageShell max="max-w-[1300px]">
        <StudentPageHeader title="Study Resources" subtitle="Lessons, notes and presentations for your technologies." />
        <Hero icon={BookOpen} eyebrow="LEARN YOUR WAY" title="Everything you need to revise" text="Open the online lessons any time. Downloadable notes and slide decks appear here as soon as they are uploaded." />

        <Card className="mt-8 p-5 sm:p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <label className="relative block w-full md:max-w-[380px]">
              <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6C8589]" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search lessons, PDFs and PPTs..." className="h-11 w-full rounded-xl border border-[#CFE2E0] bg-white pl-11 pr-3 text-sm outline-none placeholder:text-[#8AA0A3] focus:border-[#06424B] focus:ring-4 focus:ring-[#FFAB0B]/25" />
            </label>
            <div className="flex flex-wrap gap-2">
              {["All", "Lesson", "PDF", "PPT"].map((item) => (
                <button key={item} type="button" onClick={() => setType(item)} className={`rounded-full px-5 py-2 text-[13px] font-bold transition ${type === item ? "bg-[#06424B] !text-white" : "bg-[#EAF3F2] !text-[#3F5C60] hover:bg-[#FFEFC2]"}`}>
                  {item === "Lesson" ? "Online lessons" : item}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {resources.map((resource) => {
              const Icon = typeIcons[resource.type] || FileText;
              const gold = resource.type === "PPT";
              return (
                <div key={resource.id} className="flex flex-col gap-4 rounded-2xl border border-[#DCE9E7] bg-[#FBFEFD] p-5 transition hover:border-[#FFAB0B] sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <IconBadge icon={Icon} tone={gold ? "gold" : "teal"} size="lg" />
                    <div>
                      <h3 className="text-[15px] font-bold text-[#06424B]">{resource.title}</h3>
                      <p className="mt-1 text-[13px] text-[#5A7478]"><span className="font-bold text-[#B07A06]">{resource.type}</span> · {resource.description}</p>
                    </div>
                  </div>
                  {resource.to ? (
                    <LinkButton to={resource.to} size="sm" iconRight={ExternalLink}>Open</LinkButton>
                  ) : (
                    <Btn variant="outline" size="sm" icon={Download} disabled title="Connect the resource file URL to enable access">Coming soon</Btn>
                  )}
                </div>
              );
            })}
          </div>
          {resources.length === 0 && <p className="py-10 text-center text-sm text-[#5A7478]">No matching resources found.</p>}
        </Card>

        <Note icon={ExternalLink} className="mt-5">
          PDF and PPT items are sample records. Upload the actual files and connect their secure URLs to enable opening and downloading.
        </Note>
      </PageShell>
    </StudentSidebar>
  );
}

export default StudyResources;
