import i18n, { translateValue } from "../../i18n";
import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { BookOpen, CalendarDays, Layers3, Pencil, Plus, Trash2, ArrowUpRight } from "lucide-react";
import { useTeacherData, teacherActions } from "../../data/teacherMockData";
import TeacherLayout from "./TeacherLayout";
import { PageHeader, Button, SearchField, StatusPill, Modal, Field, inputClass, textareaClass, EmptyState } from "./TeacherUI";

const blankForm = { categoryId: "", fullName: "", shortName: "", idNumber: "", summary: "", startDate: "2026-11-16", endDate: "2027-02-28", visible: true };

export default function Courses() {
  const data = useTeacherData();
  const [searchParams] = useSearchParams();
  const requestedCategoryId = searchParams.get("categoryId") || "";
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(requestedCategoryId || "all");
  const [visibilityFilter, setVisibilityFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blankForm);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const courses = useMemo(() => data.courses.filter((course) => {
    const matchesSearch = `${course.fullName} ${course.shortName} ${course.idNumber} ${course.summary}`.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || String(course.categoryId) === String(categoryFilter);
    const matchesVisibility = visibilityFilter === "all" || (visibilityFilter === "visible" ? course.visible : !course.visible);
    return matchesSearch && matchesCategory && matchesVisibility;
  }), [data.courses, search, categoryFilter, visibilityFilter]);

  const openCreate = () => { setEditing(null); setForm({ ...blankForm, categoryId: requestedCategoryId || data.categories[0]?.id || "" }); setModalOpen(true); };
  const openEdit = (course) => { setEditing(course); setForm({ ...course, categoryId: String(course.categoryId) }); setModalOpen(true); };
  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setNotice("");
    const payload = { ...form, categoryId: Number(form.categoryId), fullName: form.fullName.trim(), shortName: form.shortName.trim(), idNumber: form.idNumber.trim(), summary: form.summary.trim() };
    try {
      if (editing) await teacherActions.updateCourse(editing.id, payload);
      else await teacherActions.createCourse(payload);
      setModalOpen(false);
    } catch (error) {
      setNotice(error.message || "Unable to save the course.");
    } finally {
      setBusy(false);
    }
  };
  const remove = async (course) => {
    if (!window.confirm(i18n.t("Delete “{{name}}” and its modules, content and assignments?", { name: course.fullName, ns: "ui" }))) return;
    try { await teacherActions.deleteCourse(course.id); setNotice("Course deleted."); }
    catch (error) { setNotice(error.message || "Unable to delete the course."); }
  };

  return (
    <TeacherLayout>
      <PageHeader title={translateValue("Courses")} description={translateValue("Create courses inside categories, define their schedule and manage the learning structure.")} actions={
        <Button onClick={openCreate} disabled={!data.categories.length}>
          <Plus size={15} />
          <span className="!text-white">{translateValue("Create course")}</span>
        </Button>
      } />
      {notice && <div className="mb-4 rounded-xl border border-[#E9DCC0] bg-[#FFF9EC] px-4 py-3 text-[11px] text-[#89651F]">{translateValue(notice)}</div>}
      <div className="mb-5 grid gap-3 lg:grid-cols-[minmax(220px,1fr)_220px_170px]">
        <SearchField value={search} onChange={setSearch} placeholder={translateValue("Search course name or ID...")} />
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className={inputClass}><option value="all">{translateValue("All categories")}</option>{data.categories.map((category) => <option key={category.id} value={category.id}>{translateValue(category.name)}</option>)}</select>
        <select value={visibilityFilter} onChange={(e) => setVisibilityFilter(e.target.value)} className={inputClass}><option value="all">{translateValue("All statuses")}</option><option value="visible">{translateValue("Visible only")}</option><option value="hidden">{translateValue("Hidden only")}</option></select>
      </div>
      {courses.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {courses.map((course) => {
            const category = data.categories.find((item) => String(item.id) === String(course.categoryId));
            const modules = data.modules.filter((item) => String(item.courseId) === String(course.id));
            const contents = modules.reduce((count, module) => count + data.contents.filter((item) => String(item.moduleId) === String(module.id)).length, 0);
            return (
              <article key={course.id} className="group rounded-[20px] border border-[#E0E9E9] bg-white p-5 shadow-[0_5px_18px_rgba(18,59,67,0.03)] transition hover:border-[#C7D9D8] hover:shadow-[0_12px_28px_rgba(18,59,67,0.06)] sm:p-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[15px] bg-[#EAF2F1] text-[#06424B]"><BookOpen size={21} /></div>
                  <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="rounded-md bg-[#F5F7F7] px-2 py-1 text-[9px] font-extrabold tracking-wide text-[#7C9295]">{translateValue(course.idNumber || `COURSE-${course.id}`)}</span><StatusPill visible={course.visible} /></div><h2 className="mt-2 text-[15px] font-extrabold leading-6 text-[#17464D]">{translateValue(course.fullName)}</h2><p className="mt-1 text-[10px] font-semibold text-[#B27B20]">{translateValue(category?.name || "Uncategorised")}</p></div>
                  <div className="flex gap-1"><button onClick={() => openEdit(course)} title={translateValue("Edit course")} className="flex h-8 w-8 items-center justify-center rounded-lg text-[#819699] hover:bg-[#EEF4F3] hover:text-[#06424B]"><Pencil size={14} /></button><button onClick={() => remove(course)} title={translateValue("Delete course")} className="flex h-8 w-8 items-center justify-center rounded-lg text-[#A4B0B1] hover:bg-[#FFF1EF] hover:text-[#B65345]"><Trash2 size={14} /></button></div>
                </div>
                <p className="mt-4 line-clamp-2 min-h-[42px] text-[11px] leading-6 text-[#829497]">{translateValue(course.summary || "No course summary added yet.")}</p>
                <div className="mt-4 grid grid-cols-2 gap-2 rounded-[14px] bg-[#F8FAFA] p-3 sm:grid-cols-3">
                  <div><p className="text-[9px] font-bold uppercase tracking-wide text-[#A0ADAF]">{translateValue("Modules")}</p><p className="mt-1 flex items-center gap-1.5 text-[12px] font-extrabold text-[#315B60]"><Layers3 size={13} /> {translateValue(modules.length)}</p></div>
                  <div><p className="text-[9px] font-bold uppercase tracking-wide text-[#A0ADAF]">{translateValue("Content items")}</p><p className="mt-1 flex items-center gap-1.5 text-[12px] font-extrabold text-[#315B60]"><BookOpen size={13} /> {translateValue(contents)}</p></div>
                  <div className="col-span-2 sm:col-span-1"><p className="text-[9px] font-bold uppercase tracking-wide text-[#A0ADAF]">{translateValue("Course period")}</p><p className="mt-1 flex items-center gap-1.5 text-[10px] font-bold text-[#617B7F]"><CalendarDays size={12} /> {translateValue(course.startDate || "—")} {translateValue("–")}{" "}{translateValue(course.endDate || "—")}</p></div>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-[#EDF1F1] pt-4"><span className="text-[10px] text-[#9AA8AA]">{translateValue("Short name:")}{" "}<strong className="text-[#607A7E]">{translateValue(course.shortName || "—")}</strong></span><Link to={`/teacher/courses/${course.id}/modules`} className="inline-flex items-center gap-1.5 rounded-lg bg-[#06424B] px-3.5 py-2.5 text-[10px] font-bold !text-white transition hover:bg-[#0B5661]"><span className="!text-white">{translateValue("Manage course")}</span> <ArrowUpRight size={13} /></Link></div>
              </article>
            );
          })}
        </div>
      ) : <EmptyState icon={BookOpen} title={translateValue("No courses found")} description={translateValue(data.categories.length ? "Change the filters or create a course under one of your categories." : "Create a category first. Courses must belong to a category.")} action={data.categories.length ? <Button onClick={openCreate}><Plus size={14} /> {translateValue("Create course")}</Button> : <Link to="/teacher/categories" className="inline-flex min-h-[42px] items-center justify-center rounded-xl bg-[#06424B] px-4 py-2.5 text-[12px] font-bold !text-white hover:bg-[#0B5661]"><span className="!text-white">{translateValue("Go to categories")}</span></Link>} />}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={translateValue(editing ? "Edit course" : "Create course")} description={translateValue("Enter the course details and assign it to a category.")} width="max-w-2xl">
        <form onSubmit={submit} className="space-y-4">
          <Field label={translateValue("Main category")} required><select required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className={inputClass}><option value="">{translateValue("Select a main category")}</option>{data.categories.map((category) => <option key={category.id} value={category.id}>{translateValue(category.name)}</option>)}</select></Field>
          <div className="grid gap-4 sm:grid-cols-2"><Field label={translateValue("Full course name")} required><input required maxLength={150} value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder={translateValue("e.g. Full Stack Web Development")} className={inputClass} /></Field><Field label={translateValue("Short name")}><input maxLength={60} value={form.shortName} onChange={(e) => setForm({ ...form, shortName: e.target.value })} placeholder={translateValue("e.g. Full Stack")} className={inputClass} /></Field></div>
          <Field label={translateValue("Course ID number")}><input maxLength={50} value={form.idNumber} onChange={(e) => setForm({ ...form, idNumber: e.target.value })} placeholder={translateValue("e.g. SN-WEB-101")} className={inputClass} /></Field>
          <Field label={translateValue("Course summary")}><textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} placeholder={translateValue("What will students learn in this course?")} className={textareaClass} /></Field>
          <div className="grid gap-4 sm:grid-cols-2"><Field label={translateValue("Start date")}><input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className={inputClass} /></Field><Field label={translateValue("End date")}><input type="date" min={form.startDate || undefined} value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className={inputClass} /></Field></div>
          <label className="flex items-center gap-2.5 rounded-xl bg-[#F6F9F9] px-3.5 py-3 text-[11px] font-semibold text-[#526F73]"><input type="checkbox" checked={form.visible} onChange={(e) => setForm({ ...form, visible: e.target.checked })} className="h-4 w-4 accent-[#06424B]" /> {translateValue("Visible to students")}</label>
          <div className="flex justify-end gap-2 border-t border-[#EDF1F1] pt-4"><Button variant="secondary" onClick={() => setModalOpen(false)} disabled={busy}>{translateValue("Cancel")}</Button><Button type="submit" disabled={busy}><span className="!text-white">{translateValue(busy ? "Saving..." : editing ? "Save changes" : "Create course")}</span></Button></div>
        </form>
      </Modal>
    </TeacherLayout>
  );
}