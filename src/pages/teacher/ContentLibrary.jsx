import { translateValue } from "../../i18n";

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Video,
  BookOpen,
  ArrowUpRight,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  Layers3,
  Search,
} from "lucide-react";

import { useTeacherData } from "../../data/teacherMockData";
import TeacherLayout from "./TeacherLayout";
import {
  PageHeader,
  SearchField,
  StatusPill,
  EmptyState,
  ContentTypeIcon,
} from "./TeacherUI";

export default function ContentLibrary() {
  const data = useTeacherData();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [expandedModules, setExpandedModules] = useState({});

  // Group contents by Course > Module > Content
  const groupedCourses = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    return data.courses
      .map((course) => {
        const courseModules = data.modules
          .filter(
            (module) =>
              String(module.courseId) === String(course.id)
          )
          .map((module) => {
            const moduleContents = data.contents.filter((content) => {
              const matchesModule =
                String(content.moduleId) === String(module.id);

              const matchesType =
                typeFilter === "all" ||
                content.contentType === typeFilter;

              const searchableText = `
                ${content.title || ""}
                ${content.body || ""}
                ${content.url || ""}
                ${module.name || ""}
                ${course.fullName || ""}
              `.toLowerCase();

              const matchesSearch =
                !searchText || searchableText.includes(searchText);

              return matchesModule && matchesType && matchesSearch;
            });

            return {
              ...module,
              contents: moduleContents,
            };
          })
          .filter((module) => module.contents.length > 0);

        return {
          ...course,
          modules: courseModules,
        };
      })
      .filter((course) => course.modules.length > 0);
  }, [
    data.courses,
    data.modules,
    data.contents,
    search,
    typeFilter,
  ]);

  const totalFilteredContents = groupedCourses.reduce(
    (total, course) =>
      total +
      course.modules.reduce(
        (moduleTotal, module) =>
          moduleTotal + module.contents.length,
        0
      ),
    0
  );

  // Expand / Collapse individual modules
  const toggleModule = (moduleId) => {
    setExpandedModules((previous) => ({
      ...previous,
      [moduleId]: !(previous[moduleId] ?? true),
    }));
  };

  // Expand all modules
  const expandAll = () => {
    const expanded = {};

    groupedCourses.forEach((course) => {
      course.modules.forEach((module) => {
        expanded[module.id] = true;
      });
    });

    setExpandedModules(expanded);
  };

  // Collapse all modules
  const collapseAll = () => {
    const collapsed = {};

    groupedCourses.forEach((course) => {
      course.modules.forEach((module) => {
        collapsed[module.id] = false;
      });
    });

    setExpandedModules(collapsed);
  };

  const allExpanded =
    groupedCourses.length > 0 &&
    groupedCourses.every((course) =>
      course.modules.every(
        (module) => expandedModules[module.id] ?? true
      )
    );

  // Existing content statistics
  const textCount = data.contents.filter(
    (item) => item.contentType === "text"
  ).length;

  const videoCount = data.contents.filter(
    (item) => item.contentType === "video"
  ).length;

  const documentCount = data.contents.filter(
    (item) => item.contentType === "document"
  ).length;

  return (
    <TeacherLayout>
      <div className="space-y-5">
        <PageHeader
          title={translateValue("Content library")}
          description={translateValue("A consolidated view of the text lessons, videos and documents added to your course modules.")}
        />

        {/* Search and Content Type Filter */}
        <div className="grid gap-3 sm:grid-cols-[minmax(220px,1fr)_190px]">
          <SearchField
            value={search}
            onChange={setSearch}
            placeholder={translateValue("Search content, module or course...")}
          />

          <select
            aria-label={translateValue("Filter content by type")}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-[43px] rounded-xl border border-[#DDE7E7] bg-white px-3.5 text-[12px] font-medium text-[#244E54] outline-none transition-all duration-200 hover:border-[#B8CACA] focus:border-[#06424B] focus:ring-2 focus:ring-[#06424B]/10"
          >
            <option value="all">{translateValue("All content types")}</option>
            <option value="text">{translateValue("Text lessons")}</option>
            <option value="video">{translateValue("Videos")}</option>
            <option value="document">{translateValue("Documents")}</option>
          </select>
        </div>

        {/* Structure Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[13px] font-bold text-[#17464D]">
              {translateValue("Course content structure")}</p>

            <p className="mt-1 text-[11px] text-[#91A1A3]">
              {translateValue(groupedCourses.length)} {translateValue("courses")}<span className="mx-1.5">{translateValue("·")}</span>
              {translateValue(totalFilteredContents)} {translateValue("content items")}</p>
          </div>

          {groupedCourses.length > 0 && (
            <button
              type="button"
              onClick={allExpanded ? collapseAll : expandAll}
              className="group flex items-center gap-2 rounded-lg border border-[#DDE7E7] bg-white px-3.5 py-2 text-[11px] font-bold text-[#06424B] transition-all duration-200 hover:border-[#E7C66D] hover:bg-[#FFFAEB] hover:text-[#9A7017] active:scale-[0.97]"
            >
              <Layers3 size={14} />
              {translateValue(allExpanded ? "Collapse all" : "Expand all")}
            </button>
          )}
        </div>

        {/* Course Groups */}
        {groupedCourses.length > 0 ? (
          <div className="space-y-4">
            {groupedCourses.map((course, courseIndex) => {
              const courseContentCount = course.modules.reduce(
                (total, module) => total + module.contents.length,
                0
              );

              return (
                <section
                  key={course.id}
                  className="group overflow-hidden rounded-[18px] border border-[#E0E9E9] bg-white shadow-[0_4px_16px_rgba(18,59,67,0.035)] transition-all duration-300 hover:border-[#D1DFDF] hover:shadow-[0_8px_24px_rgba(18,59,67,0.06)]"
                >
                  {/* Course Header */}
                  <div className="relative flex flex-wrap items-center justify-between gap-3 overflow-hidden border-b border-[#EAF0F0] bg-[#F8FAFA] px-4 py-4 sm:px-5">
                    <div className="absolute bottom-0 left-0 top-0 w-[3px] bg-[#06424B]" />

                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#DCE8E7] bg-[#EAF2F1] text-[#06424B] transition-all duration-300 group-hover:bg-[#06424B] group-hover:text-white">
                        <BookOpen size={19} />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-extrabold text-[#17464D]">
                          {translateValue(course.fullName || course.name)}
                        </p>

                        <p className="mt-1 text-[10px] font-medium text-[#91A1A3]">
                          {translateValue(course.modules.length)} {translateValue("modules")}<span className="mx-1.5">{translateValue("·")}</span>
                          {translateValue(courseContentCount)} {translateValue("content items")}</p>
                      </div>
                    </div>

                    <span className="rounded-lg border border-[#F0DFAE] bg-[#FFF7E1] px-2.5 py-1.5 text-[9px] font-extrabold uppercase tracking-wide text-[#9B741B]">
                      {translateValue("Course")}{" "}{translateValue(String(courseIndex + 1).padStart(2, "0"))}
                    </span>
                  </div>

                  {/* Module List */}
                  <div className="space-y-2.5 p-3 sm:p-4">
                    {course.modules.map((module, moduleIndex) => {
                      const isExpanded =
                        expandedModules[module.id] ?? true;

                      return (
                        <div
                          key={module.id}
                          className={`overflow-hidden rounded-xl border transition-all duration-300 ${
                            isExpanded
                              ? "border-[#DDE8E7] bg-white shadow-[0_3px_12px_rgba(18,59,67,0.025)]"
                              : "border-[#E7EEEE] bg-white hover:border-[#D6E3E2]"
                          }`}
                        >
                          {/* Module Header */}
                          <button
                            type="button"
                            onClick={() => toggleModule(module.id)}
                            aria-expanded={isExpanded}
                            className={`flex w-full items-center justify-between gap-3 px-3.5 py-3.5 text-left transition-all duration-200 sm:px-4 ${
                              isExpanded
                                ? "bg-[#F5F8F8]"
                                : "bg-white hover:bg-[#FAFCFC]"
                            }`}
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <div
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all duration-300 ${
                                  isExpanded
                                    ? "bg-[#FFF3D2] text-[#A87914]"
                                    : "bg-[#EEF3F3] text-[#527579]"
                                }`}
                              >
                                <FolderOpen size={17} />
                              </div>

                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="truncate text-[12px] font-bold text-[#244E54]">
                                    {translateValue(module.name)}
                                  </p>

                                  <span
                                    className={`rounded-md px-2 py-1 text-[9px] font-semibold transition-colors ${
                                      isExpanded
                                        ? "bg-[#FFF5DC] text-[#9B741B]"
                                        : "bg-[#F3F6F6] text-[#829598]"
                                    }`}
                                  >
                                    {translateValue("Module")}{" "}{translateValue(moduleIndex + 1)}
                                  </span>
                                </div>

                                <p className="mt-1 text-[10px] text-[#91A1A3]">
                                  {translateValue(module.contents.length)}{translateValue(" ")}
                                  {translateValue(module.contents.length === 1
                                    ? "content item"
                                    : "content items")}
                                </p>
                              </div>
                            </div>

                            <div className="flex shrink-0 items-center gap-2">
                              <span className="hidden rounded-lg border border-[#E9EEEE] bg-white px-2.5 py-1.5 text-[10px] font-bold text-[#668084] sm:inline-flex">
                                {translateValue(module.contents.length)} {translateValue("items")}</span>

                              <div
                                className={`flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-300 ${
                                  isExpanded
                                    ? "rotate-180 bg-[#FFF0CA] text-[#A87914]"
                                    : "rotate-0 bg-[#F1F5F5] text-[#668084]"
                                }`}
                              >
                                <ChevronDown size={15} />
                              </div>
                            </div>
                          </button>

                          {/* Animated Module Content */}
                          <div
                            className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                              isExpanded
                                ? "grid-rows-[1fr] opacity-100"
                                : "grid-rows-[0fr] opacity-0"
                            }`}
                          >
                            <div className="min-h-0 overflow-hidden">
                              <div className="border-t border-[#EDF1F1] bg-[#FBFCFC] px-3 py-3 sm:px-4">
                                <div className="mb-2.5 flex items-center gap-2 pl-1">
                                  <Layers3
                                    size={13}
                                    className="text-[#B08A37]"
                                  />

                                  <span className="text-[9px] font-extrabold uppercase tracking-[1px] text-[#91A1A3]">
                                    {translateValue("Learning contents")}</span>

                                  <div className="ml-auto h-px flex-1 max-w-[70px] bg-[#E9EEEE]" />
                                </div>

                                <div className="space-y-1.5">
                                  {module.contents.map(
                                    (content, contentIndex) => {
                                      const typeStyles = {
                                        text: {
                                          iconBg: "bg-[#FFF4D8]",
                                          iconColor: "text-[#B27B12]",
                                          labelBg: "bg-[#FFF8E8]",
                                          labelColor: "text-[#A47B24]",
                                        },
                                        video: {
                                          iconBg: "bg-[#E8F1F1]",
                                          iconColor: "text-[#06424B]",
                                          labelBg: "bg-[#EEF5F4]",
                                          labelColor: "text-[#416E70]",
                                        },
                                        document: {
                                          iconBg: "bg-[#F0ECF7]",
                                          iconColor: "text-[#8063A6]",
                                          labelBg: "bg-[#F5F1FA]",
                                          labelColor: "text-[#8063A6]",
                                        },
                                      };

                                      const styles =
                                        typeStyles[content.contentType] ||
                                        typeStyles.text;

                                      return (
                                        <div
                                          key={content.id}
                                          style={{
                                            animationDelay: `${contentIndex * 35}ms`,
                                          }}
                                          className="group/item flex flex-wrap items-center justify-between gap-3 rounded-xl border border-transparent bg-white px-3 py-3 transition-all duration-200 hover:-translate-y-[1px] hover:border-[#E5EAEA] hover:shadow-[0_4px_12px_rgba(18,59,67,0.045)] sm:px-3.5"
                                        >
                                          <div className="flex min-w-0 flex-1 items-center gap-3">
                                            <div
                                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover/item:scale-105 ${styles.iconBg} ${styles.iconColor}`}
                                            >
                                              <ContentTypeIcon
                                                type={content.contentType}
                                              />
                                            </div>

                                            <div className="min-w-0">
                                              <p className="truncate text-[11px] font-bold text-[#244E54] transition-colors group-hover/item:text-[#06424B]">
                                                {translateValue(content.title)}
                                              </p>

                                              <p className="mt-1 truncate text-[10px] text-[#91A1A3]">
                                                {translateValue(content.url ||
                                                  "Learning content")}
                                              </p>
                                            </div>
                                          </div>

                                          <div className="flex shrink-0 items-center gap-2.5">
                                            <span
                                              className={`rounded-md px-2 py-1.5 text-[9px] font-extrabold uppercase tracking-wide ${styles.labelBg} ${styles.labelColor}`}
                                            >
                                              {translateValue(content.contentType)}
                                            </span>

                                            <StatusPill
                                              visible={content.visible}
                                            />

                                            <Link
                                              to={`/teacher/courses/${course.id}/modules/${module.id}`}
                                              title={translateValue("Open module content")}
                                              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#829598] transition-all duration-200 hover:bg-[#FFF3D5] hover:text-[#A87914] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFAB0B]/40"
                                            >
                                              <ArrowUpRight
                                                size={15}
                                                className="transition-transform duration-200 group-hover/item:translate-x-[1px] group-hover/item:-translate-y-[1px]"
                                              />
                                            </Link>
                                          </div>
                                        </div>
                                      );
                                    }
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={Search}
            title={translateValue("No content found")}
            description={translateValue("Content you add inside a course module will appear here. Try changing the search or type filter.")}
          />
        )}

        {/* Existing Statistics */}
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="group rounded-[16px] border border-[#E3EBEB] bg-white p-4 shadow-[0_3px_12px_rgba(18,59,67,0.025)] transition-all duration-300 hover:-translate-y-1 hover:border-[#EAD59B] hover:shadow-[0_7px_18px_rgba(18,59,67,0.06)]">
            <p className="text-[10px] font-medium text-[#91A1A3]">
              {translateValue("Text lessons")}</p>

            <p className="mt-2 flex items-center gap-2 text-[19px] font-extrabold text-[#17464D]">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FFF4D8] text-[#B27B12] transition-transform duration-300 group-hover:scale-110">
                <BookOpen size={16} />
              </span>
              {translateValue(textCount)}
            </p>
          </div>

          <div className="group rounded-[16px] border border-[#E3EBEB] bg-white p-4 shadow-[0_3px_12px_rgba(18,59,67,0.025)] transition-all duration-300 hover:-translate-y-1 hover:border-[#C8DDDB] hover:shadow-[0_7px_18px_rgba(18,59,67,0.06)]">
            <p className="text-[10px] font-medium text-[#91A1A3]">
              {translateValue("Videos")}</p>

            <p className="mt-2 flex items-center gap-2 text-[19px] font-extrabold text-[#17464D]">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E8F1F1] text-[#06424B] transition-transform duration-300 group-hover:scale-110">
                <Video size={16} />
              </span>
              {translateValue(videoCount)}
            </p>
          </div>

          <div className="group rounded-[16px] border border-[#E3EBEB] bg-white p-4 shadow-[0_3px_12px_rgba(18,59,67,0.025)] transition-all duration-300 hover:-translate-y-1 hover:border-[#D9CEE8] hover:shadow-[0_7px_18px_rgba(18,59,67,0.06)]">
            <p className="text-[10px] font-medium text-[#91A1A3]">
              {translateValue("Documents")}</p>

            <p className="mt-2 flex items-center gap-2 text-[19px] font-extrabold text-[#17464D]">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F0ECF7] text-[#8063A6] transition-transform duration-300 group-hover:scale-110">
                <FileText size={16} />
              </span>
              {translateValue(documentCount)}
            </p>
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
}
