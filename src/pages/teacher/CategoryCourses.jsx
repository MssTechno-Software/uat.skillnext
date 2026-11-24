import { translateValue } from "../../i18n";

import { useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Plus,
  Layers3,
  FileText,
  GraduationCap,
  Scissors,
  Monitor,
  BriefcaseBusiness,
  Palette,
  Code2,
  Calculator,
  HeartPulse,
  Languages,
  Eye,
} from "lucide-react";

import { useTeacherData, teacherActions } from "../../data/teacherMockData";
import TeacherLayout from "./TeacherLayout";
import {
  PageHeader,
  StatusPill,
  EmptyState,
  Modal,
  Field,
  inputClass,
  textareaClass,
} from "./TeacherUI";

const blankCourseForm = {
  categoryId: "",
  fullName: "",
  shortName: "",
  idNumber: "",
  summary: "",
  startDate: "2026-11-16",
  endDate: "2027-02-28",
  visible: true,
};

const getCourseIcon = (name = "") => {
  const value = name.toLowerCase();

  const iconMappings = [
    { keywords: ["hair", "beauty", "styling", "salon"], icon: Scissors },
    { keywords: ["technology", "computer", "it"], icon: Monitor },
    { keywords: ["programming", "development", "coding"], icon: Code2 },
    { keywords: ["business", "management", "finance"], icon: BriefcaseBusiness },
    { keywords: ["design", "creative", "graphics"], icon: Palette },
    { keywords: ["math", "mathematics"], icon: Calculator },
    { keywords: ["health", "medical"], icon: HeartPulse },
    { keywords: ["language", "english"], icon: Languages },
    { keywords: ["education", "teaching"], icon: GraduationCap },
  ];

  const matched = iconMappings.find(({ keywords }) =>
    keywords.some((keyword) => value.includes(keyword))
  );

  return matched?.icon || BookOpen;
};

export default function CategoryCourses() {
  const { categoryId } = useParams();
  const data = useTeacherData();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(blankCourseForm);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  const category = data.categories.find(
    (item) => String(item.id) === String(categoryId)
  );

  const courses = data.courses
    .filter(
      (item) => String(item.categoryId) === String(categoryId)
    )
    .sort((a, b) => a.fullName.localeCompare(b.fullName));

  if (!category) {
    return <Navigate to="/teacher/categories" replace />;
  }

  const openCreate = () => {
    setForm({ ...blankCourseForm, categoryId: String(category.id) });
    setNotice("");
    setModalOpen(true);
  };

  const submitCourse = async (event) => {
    event.preventDefault();
    setBusy(true);
    setNotice("");

    const payload = {
      ...form,
      categoryId: Number(category.id),
      fullName: form.fullName.trim(),
      shortName: form.shortName.trim(),
      idNumber: form.idNumber.trim(),
      summary: form.summary.trim(),
    };

    try {
      await teacherActions.createCourse(payload);
      setModalOpen(false);
      setForm({ ...blankCourseForm, categoryId: String(category.id) });
      setNotice("Course created successfully.");
    } catch (error) {
      setNotice(error.message || "Unable to create the course.");
    } finally {
      setBusy(false);
    }
  };

  const totalModules = courses.reduce((sum, course) => {
    return (
      sum +
      data.modules.filter(
        (module) => String(module.courseId) === String(course.id)
      ).length
    );
  }, 0);

  const totalContent = courses.reduce((sum, course) => {
    const modules = data.modules.filter(
      (module) => String(module.courseId) === String(course.id)
    );

    return (
      sum +
      modules.reduce((moduleSum, module) => {
        return (
          moduleSum +
          data.contents.filter(
            (content) =>
              String(content.moduleId) === String(module.id)
          ).length
        );
      }, 0)
    );
  }, 0);

  const visibleCourses = courses.filter(
    (course) => course.visible
  ).length;

  return (
    <TeacherLayout>
      <div className="space-y-6 pb-8">
        {notice && (
          <div className="rounded-xl border border-[#DCE9E5] bg-[#F1F8F5] px-4 py-3 text-[11px] font-semibold text-[#245D4B]">
            {translateValue(notice)}
          </div>
        )}

        {/* Page Header */}
        <PageHeader
          title={translateValue(category.name)}
          description={
            translateValue(category.description ||
            "Explore and manage courses belonging to this main category.")
          }
          backLink={
            <Link
              to="/teacher/categories"
              className="mb-3 inline-flex items-center gap-2 text-[11px] font-bold text-[#06424B] transition-colors hover:text-[#B77C09]"
            >
              <ArrowLeft size={14} />
              {translateValue("All Categories")}</Link>
          }
          actions={
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl bg-[#06424B] px-4 py-2.5 text-[11px] font-bold !text-white shadow-[0_4px_12px_rgba(6,66,75,0.12)] transition-all hover:bg-[#0B5661] hover:shadow-[0_6px_16px_rgba(6,66,75,0.18)]"
            >
              <Plus size={15} className="shrink-0 text-[#FFAB0B]" />
              <span className="!text-white">{translateValue("Create Course")}</span>
            </button>
          }
        />

        {/* Category Overview */}
        <div className="relative overflow-hidden rounded-[22px] border border-[#E2EAEA] bg-white p-5 shadow-[0_4px_18px_rgba(18,59,67,0.025)] sm:p-6">
          <div className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-[#FFF3D6] opacity-50" />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-[17px] bg-[#06424B] text-[#FFAB0B] shadow-sm">
                <GraduationCap size={27} strokeWidth={1.8} />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[9px] font-extrabold uppercase tracking-[1.5px] text-[#9AA9AA]">
                    {translateValue("Main Category")}</p>

                  {category.visible && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#EAF2F1] px-2 py-1 text-[9px] font-bold text-[#06424B]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#06424B]" />
                      {translateValue("Published")}</span>
                  )}
                </div>

                <h2 className="mt-1.5 truncate text-[19px] font-extrabold tracking-tight text-[#06424B]">
                  {translateValue(category.name)}
                </h2>

                <p className="mt-1 text-[10px] font-medium text-[#8A9B9D]">
                  {translateValue(category.idNumber || "Course Category")}
                </p>
              </div>
            </div>

            <div className="relative flex items-center gap-2 rounded-xl border border-[#F0E5CB] bg-[#FFFAEF] px-4 py-3 sm:min-w-[145px]">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FFAB0B] text-[#06424B]">
                <BookOpen size={17} />
              </div>

              <div>
                <p className="text-[19px] font-extrabold leading-none text-[#06424B]">
                  {translateValue(courses.length.toString().padStart(2, "0"))}
                </p>
                <p className="mt-1 text-[9px] font-semibold text-[#927D54]">
                  {translateValue("Total Courses")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

          <div className="rounded-[18px] border border-[#E4EBEB] bg-white p-4 transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF2F1] text-[#06424B]">
                <BookOpen size={18} />
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#A0ADAF]">
                {translateValue("Courses")}</span>
            </div>
            <p className="mt-4 text-[25px] font-extrabold text-[#06424B]">
              {translateValue(courses.length.toString().padStart(2, "0"))}
            </p>
            <p className="mt-1 text-[10px] font-semibold text-[#829497]">
              {translateValue("Total courses")}</p>
          </div>

          <div className="rounded-[18px] border border-[#E4EBEB] bg-white p-4 transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF3D6] text-[#B77C09]">
                <Layers3 size={18} />
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#A0ADAF]">
                {translateValue("Structure")}</span>
            </div>
            <p className="mt-4 text-[25px] font-extrabold text-[#06424B]">
              {translateValue(totalModules.toString().padStart(2, "0"))}
            </p>
            <p className="mt-1 text-[10px] font-semibold text-[#829497]">
              {translateValue("Total modules")}</p>
          </div>

          <div className="rounded-[18px] border border-[#E4EBEB] bg-white p-4 transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF2F1] text-[#06424B]">
                <FileText size={18} />
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#A0ADAF]">
                {translateValue("Resources")}</span>
            </div>
            <p className="mt-4 text-[25px] font-extrabold text-[#06424B]">
              {translateValue(totalContent.toString().padStart(2, "0"))}
            </p>
            <p className="mt-1 text-[10px] font-semibold text-[#829497]">
              {translateValue("Learning content items")}</p>
          </div>
        </div>

        {/* Course Directory */}
        <div className="space-y-5">

          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[15px] font-extrabold text-[#06424B]">
                  {translateValue("Courses in this Category")}</h2>

                <span className="rounded-full bg-[#FFF3D6] px-2.5 py-1 text-[10px] font-extrabold text-[#946A12]">
                  {translateValue(courses.length)}
                </span>
              </div>

              <p className="mt-1 text-[11px] text-[#8A9B9D]">
                {translateValue("Explore course details and manage learning structures.")}</p>
            </div>

            <div className="inline-flex items-center gap-2 text-[10px] font-semibold text-[#819497]">
              <Eye size={13} className="text-[#06424B]" />
              {translateValue(visibleCourses)} {translateValue("visible courses")}</div>
          </div>

          {/* Course Cards */}
          {courses.length ? (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {courses.map((course) => {
                const modules = data.modules.filter(
                  (module) =>
                    String(module.courseId) === String(course.id)
                );

                const contentCount = modules.reduce(
                  (sum, module) => {
                    return (
                      sum +
                      data.contents.filter(
                        (content) =>
                          String(content.moduleId) ===
                          String(module.id)
                      ).length
                    );
                  },
                  0
                );

                const CourseIcon = getCourseIcon(course.fullName);

                return (
                  <article
                    key={course.id}
                    className="group relative overflow-hidden rounded-[20px] border border-[#E3EBEA] bg-white p-5 shadow-[0_4px_18px_rgba(18,59,67,0.025)] transition-all duration-300 hover:-translate-y-1 hover:border-[#FFAB0B]/60 hover:shadow-[0_12px_28px_rgba(18,59,67,0.07)] sm:p-6"
                  >
                    {/* Yellow Accent */}
                    <div className="absolute left-0 top-0 h-[3px] w-0 bg-[#FFAB0B] transition-all duration-300 group-hover:w-full" />

                    {/* Course Heading */}
                    <div className="flex items-start gap-3">

                      <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-[15px] bg-[#EAF2F1] text-[#06424B] transition-all duration-300 group-hover:bg-[#06424B] group-hover:text-[#FFAB0B]">
                        <CourseIcon size={22} strokeWidth={1.8} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-[13px] font-extrabold leading-5 text-[#06424B]">
                            {translateValue(course.fullName)}
                          </h3>

                          <StatusPill visible={course.visible} />
                        </div>

                        <p className="mt-1 text-[10px] font-semibold text-[#91A1A3]">
                          {translateValue(course.idNumber || `COURSE-${course.id}`)}
                        </p>
                      </div>
                    </div>

                    {/* Summary */}
                    <p className="mt-5 min-h-[42px] text-[11px] leading-[21px] text-[#829497] line-clamp-2">
                      {translateValue(course.summary ||
                        "No course summary added. Manage modules and learning resources inside this course.")}
                    </p>

                    {/* Course Statistics */}
                    <div className="mt-5 grid grid-cols-2 gap-3">

                      <div className="flex items-center gap-2.5 rounded-xl bg-[#F5F8F8] p-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#06424B]">
                          <Layers3 size={15} />
                        </div>
                        <div>
                          <p className="text-[14px] font-extrabold text-[#06424B]">
                            {translateValue(modules.length.toString().padStart(2, "0"))}
                          </p>
                          <p className="text-[9px] font-semibold text-[#91A1A3]">
                            {translateValue("Modules")}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 rounded-xl bg-[#FFFAEF] p-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#B77C09]">
                          <FileText size={15} />
                        </div>
                        <div>
                          <p className="text-[14px] font-extrabold text-[#06424B]">
                            {translateValue(contentCount.toString().padStart(2, "0"))}
                          </p>
                          <p className="text-[9px] font-semibold text-[#A18A5D]">
                            {translateValue("Content Items")}</p>
                        </div>
                      </div>
                    </div>

                    {/* Open Course Button */}
                    <Link
                      to={`/teacher/courses/${course.id}/modules`}
                      className="mt-5 flex min-h-[43px] w-full items-center justify-between gap-3 rounded-xl bg-[#06424B] px-4 py-3 text-[11px] font-bold !text-white shadow-[0_3px_10px_rgba(6,66,75,0.10)] transition-all duration-200 hover:bg-[#0B5661] hover:shadow-[0_5px_14px_rgba(6,66,75,0.18)]"
                    >
                      <span className="flex items-center gap-2 !text-white">
                        <BookOpen size={15} className="shrink-0 text-[#FFAB0B]" />
                        <span className="!text-white">
                          {translateValue("Open Course Structure")}</span>
                      </span>

                      <ArrowRight
                        size={16}
                        className="shrink-0 text-[#FFAB0B] transition-transform group-hover:translate-x-1"
                      />
                    </Link>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[20px] border border-[#E4EBEB] bg-white py-10">
              <EmptyState
                icon={BookOpen}
                title={translateValue("No courses in this category yet")}
                description={translateValue("Create a course and assign it directly to this main category. Then build its modules and learning content.")}
                action={
                  <button
                    type="button"
                    onClick={openCreate}
                    className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl bg-[#06424B] px-5 py-3 text-[11px] font-bold !text-white shadow-sm transition-all hover:bg-[#0B5661]"
                  >
                    <Plus size={15} className="shrink-0 text-[#FFAB0B]" />
                    <span className="!text-white">{translateValue("Create First Course")}</span>
                  </button>
                }
              />
            </div>
          )}
        </div>

        {/* Create Course Modal */}
        <Modal
          open={modalOpen}
          onClose={() => !busy && setModalOpen(false)}
          title={translateValue("Create Course")}
          description={translateValue("Add a new course to {{category}}.", { category: translateValue(category.name) })}
          width="max-w-2xl"
        >
          <form onSubmit={submitCourse} className="space-y-4">
            <Field label={translateValue("Main category")} required>
              <select
                value={String(category.id)}
                disabled
                className={`${inputClass} cursor-not-allowed bg-[#F4F7F7]`}
              >
                <option value={String(category.id)}>{translateValue(category.name)}</option>
              </select>
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={translateValue("Full course name")} required>
                <input
                  required
                  maxLength={150}
                  value={form.fullName}
                  onChange={(event) =>
                    setForm({ ...form, fullName: event.target.value })
                  }
                  placeholder={translateValue("e.g. Full Stack Web Development")}
                  className={inputClass}
                />
              </Field>

              <Field label={translateValue("Short name")}>
                <input
                  maxLength={60}
                  value={form.shortName}
                  onChange={(event) =>
                    setForm({ ...form, shortName: event.target.value })
                  }
                  placeholder={translateValue("e.g. Full Stack")}
                  className={inputClass}
                />
              </Field>
            </div>

            <Field label={translateValue("Course ID number")}>
              <input
                maxLength={50}
                value={form.idNumber}
                onChange={(event) =>
                  setForm({ ...form, idNumber: event.target.value })
                }
                placeholder={translateValue("e.g. SN-WEB-101")}
                className={inputClass}
              />
            </Field>

            <Field label={translateValue("Course summary")}>
              <textarea
                value={form.summary}
                onChange={(event) =>
                  setForm({ ...form, summary: event.target.value })
                }
                placeholder={translateValue("What will students learn in this course?")}
                className={textareaClass}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={translateValue("Start date")}>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(event) =>
                    setForm({ ...form, startDate: event.target.value })
                  }
                  className={inputClass}
                />
              </Field>

              <Field label={translateValue("End date")}>
                <input
                  type="date"
                  min={form.startDate || undefined}
                  value={form.endDate}
                  onChange={(event) =>
                    setForm({ ...form, endDate: event.target.value })
                  }
                  className={inputClass}
                />
              </Field>
            </div>

            <label className="flex items-center gap-2.5 rounded-xl bg-[#F6F9F9] px-3.5 py-3 text-[11px] font-semibold text-[#526F73]">
              <input
                type="checkbox"
                checked={form.visible}
                onChange={(event) =>
                  setForm({ ...form, visible: event.target.checked })
                }
                className="h-4 w-4 accent-[#06424B]"
              />
              {translateValue("Visible to students")}</label>

            <div className="flex justify-end gap-2 border-t border-[#EDF1F1] pt-4">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                disabled={busy}
                className="inline-flex min-h-[40px] items-center justify-center rounded-xl border border-[#DCE6E5] bg-white px-4 py-2.5 text-[11px] font-bold text-[#526F73] transition hover:bg-[#F5F8F8] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {translateValue("Cancel")}</button>
              <button
                type="submit"
                disabled={busy}
                className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-xl bg-[#06424B] px-5 py-2.5 text-[11px] font-bold !text-white shadow-sm transition hover:bg-[#0B5661] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Plus size={14} className="text-[#FFAB0B]" />
                <span className="!text-white">
                  {translateValue(busy ? "Creating..." : "Create Course")}
                </span>
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </TeacherLayout>
  );
}
