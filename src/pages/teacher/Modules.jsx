import { translateValue } from "../../i18n";

import { Link } from "react-router-dom";
import {
  Layers3,
  ArrowRight,
  FileText,
  BookOpen,
  GraduationCap,
  FolderOpen,
  ChevronRight,
} from "lucide-react";

import { useTeacherData } from "../../data/teacherMockData";
import TeacherLayout from "./TeacherLayout";
import { PageHeader, EmptyState, StatusPill } from "./TeacherUI";

export default function Modules() {
  const data = useTeacherData();

  // Group modules course-wise
  const courseGroups = data.courses
    .map((course) => {
      const courseModules = data.modules
        .filter(
          (module) => String(module.courseId) === String(course.id)
        )
        .sort((a, b) => (a.position || 0) - (b.position || 0));

      return {
        ...course,
        modules: courseModules,
      };
    })
    .filter((course) => course.modules.length > 0);

  const totalModules = data.modules.length;

  const totalContent = data.contents.filter((content) =>
    data.modules.some(
      (module) => String(module.id) === String(content.moduleId)
    )
  ).length;

  return (
    <TeacherLayout>
      <div className="mx-auto w-full max-w-[1440px] space-y-6 pb-8">

        {/* Header */}
        <PageHeader
          title={translateValue("Modules")}
          description={translateValue("Explore your courses and manage the learning modules inside each course.")}
        />

        {/* Overview */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

          <div className="flex items-center gap-4 rounded-2xl border border-[#E5ECEC] bg-white p-5 shadow-sm">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#EAF2F1] text-[#06424B]">
              <GraduationCap size={22} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[1px] text-[#91A1A3]">
                {translateValue("Courses")}</p>
              <p className="mt-1 text-2xl font-extrabold text-[#17464D]">
                {translateValue(courseGroups.length)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-[#E5ECEC] bg-white p-5 shadow-sm">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FFF5E2] text-[#A87512]">
              <Layers3 size={21} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[1px] text-[#91A1A3]">
                {translateValue("Total Modules")}</p>
              <p className="mt-1 text-2xl font-extrabold text-[#17464D]">
                {translateValue(totalModules)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-[#E5ECEC] bg-white p-5 shadow-sm">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#F0EFFB] text-[#68619C]">
              <FileText size={21} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[1px] text-[#91A1A3]">
                {translateValue("Learning Content")}</p>
              <p className="mt-1 text-2xl font-extrabold text-[#17464D]">
                {translateValue(totalContent)}
              </p>
            </div>
          </div>
        </div>

        {/* Course-wise Modules */}
        {courseGroups.length > 0 ? (
          <div className="space-y-5">

            {courseGroups.map((course, courseIndex) => (
              <section
                key={course.id}
                className="overflow-hidden rounded-[20px] border border-[#E3EBEB] bg-white shadow-[0_4px_18px_rgba(6,66,75,0.035)]"
              >

                {/* Course Header */}
                <div className="flex flex-col gap-4 border-b border-[#EAF0F0] bg-[#FBFCFC] p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">

                  <div className="flex min-w-0 items-center gap-3.5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-[#06424B] text-white shadow-sm">
                      <BookOpen size={21} />
                    </div>

                    <div className="min-w-0">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <span className="text-[9px] font-extrabold uppercase tracking-[1.2px] text-[#A0ADAE]">
                          {translateValue("Course")}{" "}{translateValue(String(courseIndex + 1).padStart(2, "0"))}
                        </span>
                        <span className="h-1 w-1 rounded-full bg-[#C5CECE]" />
                        <span className="text-[9px] font-bold text-[#688589]">
                          {translateValue(course.modules.length)} {translateValue("Modules")}</span>
                      </div>

                      <h2 className="truncate text-[15px] font-extrabold text-[#17464D] sm:text-[17px]">
                        {translateValue(course.fullName)}
                      </h2>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start rounded-full border border-[#DDE9E7] bg-white px-3 py-1.5 sm:self-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#4D8B65]" />
                    <span className="text-[10px] font-bold text-[#527276]">
                      {translateValue(course.modules.filter((module) => module.visible).length)} {translateValue("Active")}</span>
                  </div>
                </div>

                {/* Module List */}
                <div className="p-3 sm:p-4">

                  <div className="hidden grid-cols-[minmax(0,1.5fr)_110px_120px_155px] items-center gap-4 px-4 py-3 md:grid">
                    <span className="text-[9px] font-extrabold uppercase tracking-[1px] text-[#9AA9AA]">
                      {translateValue("Module Details")}</span>
                    <span className="text-[9px] font-extrabold uppercase tracking-[1px] text-[#9AA9AA]">
                      {translateValue("Content")}</span>
                    <span className="text-[9px] font-extrabold uppercase tracking-[1px] text-[#9AA9AA]">
                      {translateValue("Status")}</span>
                    <span className="text-[9px] font-extrabold uppercase tracking-[1px] text-[#9AA9AA]">
                      {translateValue("Action")}</span>
                  </div>

                  <div className="space-y-2">
                    {course.modules.map((module) => {
                      const contentCount = data.contents.filter(
                        (item) =>
                          String(item.moduleId) === String(module.id)
                      ).length;

                      return (
                        <div
                          key={module.id}
                          className="grid gap-3 rounded-xl border border-[#EDF1F1] bg-white p-3.5 transition-all duration-200 hover:border-[#D4E3E1] hover:bg-[#FBFDFD] sm:p-4 md:grid-cols-[minmax(0,1.5fr)_110px_120px_155px] md:items-center md:gap-4"
                        >

                          {/* Module Name */}
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EFF5F4] text-[#06424B]">
                              <Layers3 size={18} />
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-[12px] font-bold text-[#244F54]">
                                {translateValue(module.name)}
                              </p>
                              <p className="mt-1 text-[10px] font-medium text-[#98A7A8]">
                                {translateValue("Module")}{" "}{translateValue(module.position)}
                              </p>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold text-[#9AA9AA] md:hidden">
                              {translateValue("Content")}</span>
                            <div className="flex items-center gap-1.5 rounded-lg bg-[#F5F8F8] px-2.5 py-1.5">
                              <FileText size={12} className="text-[#688589]" />
                              <span className="text-[10px] font-bold text-[#547277]">
                                {translateValue(contentCount)} {translateValue("items")}</span>
                            </div>
                          </div>

                          {/* Status */}
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold text-[#9AA9AA] md:hidden">
                              {translateValue("Status")}</span>
                            <StatusPill visible={module.visible} />
                          </div>

                          {/* Manage Content */}
                          <div className="flex items-center justify-between gap-2 md:justify-start">
                            <span className="text-[9px] font-bold text-[#9AA9AA] md:hidden">
                              {translateValue("Action")}</span>

                            <Link
                              to={`/teacher/courses/${course.id}/modules/${module.id}`}
                              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#06424B] px-3.5 text-[10px] font-bold !text-white shadow-sm transition-all duration-200 hover:bg-[#0A5660] hover:shadow-md"
                            >
                              <FolderOpen size={13} className="text-white" />
                              <span className="text-white">
                                {translateValue("Manage Content")}</span>
                              <ChevronRight size={13} className="text-white" />
                            </Link>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Course Footer */}
                <div className="flex items-center justify-between border-t border-[#EDF1F1] bg-[#FBFCFC] px-5 py-3 sm:px-6">
                  <p className="text-[10px] font-medium text-[#91A1A3]">
                    {translateValue(course.modules.length)} {translateValue("modules in this course")}</p>

                  <Link
                    to="/teacher/courses"
                    className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#527276] transition-colors hover:text-[#06424B]"
                  >
                    {translateValue("View Courses")}<ArrowRight size={13} />
                  </Link>
                </div>

              </section>
            ))}

          </div>
        ) : (
          <div className="rounded-[20px] border border-[#E3EBEB] bg-white px-5 py-12">
            <EmptyState
              icon={Layers3}
              title={translateValue("No modules created")}
              description={translateValue("Open a course and add its first module to build a learning sequence.")}
              action={
                <Link
                  to="/teacher/courses"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#06424B] px-5 py-3 text-[11px] font-bold !text-white transition-colors hover:bg-[#0A5660]"
                >
                  <GraduationCap size={15} />
                  <span className="text-white">{translateValue("Browse Courses")}</span>
                  <ArrowRight size={14} className="text-white" />
                </Link>
              }
            />
          </div>
        )}
      </div>
    </TeacherLayout>
  );
}
