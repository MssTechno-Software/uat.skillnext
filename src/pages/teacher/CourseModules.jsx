
import { useEffect, useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import {
  Layers3,
  Plus,
  Pencil,
  Trash2,
  ArrowLeft,
  ArrowRight,
  GripVertical,
  BookOpen,
  FileText,
  Eye,
  EyeOff,
  Hash,
  CheckCircle2,
  X,
  ListOrdered,
  CircleAlert,
} from "lucide-react";

import {
  useTeacherData,
  teacherActions,
} from "../../data/teacherMockData";

import TeacherLayout from "./TeacherLayout";

import {
  PageHeader,
  Button,
  Modal,
  Field,
  inputClass,
  textareaClass,
  StatusPill,
  EmptyState,
} from "./TeacherUI";

const emptyForm = {
  name: "",
  summary: "",
  position: 1,
  visible: true,
};

export default function CourseModules() {
  const { courseId } = useParams();
  const data = useTeacherData();

  const course = data.courses.find(
    (item) => String(item.id) === String(courseId)
  );

  const modules = data.modules
    .filter(
      (item) => String(item.courseId) === String(courseId)
    )
    .sort(
      (a, b) =>
        Number(a.position || 0) - Number(b.position || 0)
    );

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const [notice, setNotice] = useState("");
  const [noticeType, setNoticeType] = useState("success");
  const [busy, setBusy] = useState(false);

  const [draggingId, setDraggingId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const [reordering, setReordering] = useState(false);

  useEffect(() => {
    if (!notice) return undefined;

    const timeout = setTimeout(() => {
      setNotice("");
    }, 3500);

    return () => clearTimeout(timeout);
  }, [notice]);

  if (!course) {
    return <Navigate to="/teacher/courses" replace />;
  }

  const totalContent = data.contents.filter((item) =>
    modules.some(
      (module) =>
        String(module.id) === String(item.moduleId)
    )
  ).length;

  const visibleModules = modules.filter(
    (module) => module.visible
  ).length;

  const showNotice = (message, type = "success") => {
    setNotice(message);
    setNoticeType(type);
  };

  const openCreate = () => {
    setEditing(null);

    setForm({
      ...emptyForm,
      position: modules.length + 1,
    });

    setNotice("");
    setModalOpen(true);
  };

  const openEdit = (module) => {
    setEditing(module);

    setForm({
      ...emptyForm,
      ...module,
    });

    setNotice("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (busy) return;

    setModalOpen(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const submit = async (event) => {
    event.preventDefault();

    setBusy(true);
    setNotice("");

    const payload = {
      ...form,
      name: form.name.trim(),
      summary: form.summary.trim(),
      position:
        Number(form.position) || modules.length + 1,
    };

    try {
      if (editing) {
        await teacherActions.updateModule(
          editing.id,
          payload
        );

        showNotice("Module updated successfully.");
      } else {
        await teacherActions.createModule(
          course.id,
          payload
        );

        showNotice("Module created successfully.");
      }

      setModalOpen(false);
      setEditing(null);
      setForm(emptyForm);
    } catch (error) {
      showNotice(
        error.message || "Unable to save the module.",
        "error"
      );
    } finally {
      setBusy(false);
    }
  };

  const remove = async (module) => {
    const confirmed = window.confirm(
      `Delete "${module.name}" and all its content items?`
    );

    if (!confirmed) return;

    try {
      await teacherActions.deleteModule(module.id);

      showNotice("Module deleted successfully.");
    } catch (error) {
      showNotice(
        error.message || "Unable to delete the module.",
        "error"
      );
    }
  };

  // Handle module drag start.
  const handleDragStart = (event, moduleId) => {
    if (reordering) {
      event.preventDefault();
      return;
    }

    setDraggingId(moduleId);

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData(
      "text/plain",
      String(moduleId)
    );
  };

  // Highlight the module drop target.
  const handleDragOver = (event, moduleId) => {
    event.preventDefault();

    if (
      draggingId === null ||
      String(draggingId) === String(moduleId)
    ) {
      return;
    }

    setDragOverId(moduleId);
    event.dataTransfer.dropEffect = "move";
  };

  // Save the new module order.
  const handleDrop = async (event, targetId) => {
    event.preventDefault();

    const sourceId =
      draggingId ??
      event.dataTransfer.getData("text/plain");

    setDraggingId(null);
    setDragOverId(null);

    if (
      !sourceId ||
      String(sourceId) === String(targetId) ||
      reordering
    ) {
      return;
    }

    const reorderedModules = [...modules];

    const sourceIndex = reorderedModules.findIndex(
      (item) => String(item.id) === String(sourceId)
    );

    const targetIndex = reorderedModules.findIndex(
      (item) => String(item.id) === String(targetId)
    );

    if (sourceIndex === -1 || targetIndex === -1) {
      return;
    }

    const [movedModule] = reorderedModules.splice(
      sourceIndex,
      1
    );

    reorderedModules.splice(
      targetIndex,
      0,
      movedModule
    );

    setReordering(true);
    setNotice("");

    try {
      for (
        let index = 0;
        index < reorderedModules.length;
        index += 1
      ) {
        const module = reorderedModules[index];

        await teacherActions.updateModule(module.id, {
          ...module,
          position: index + 1,
        });
      }

      showNotice("Module sequence updated successfully.");
    } catch (error) {
      showNotice(
        error.message ||
          "Unable to update the module sequence.",
        "error"
      );
    } finally {
      setReordering(false);
    }
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDragOverId(null);
  };

  return (
    <TeacherLayout>
      <div className="mx-auto w-full max-w-[1440px] space-y-6 pb-10">

        {/* Page Header */}
        <PageHeader
          title="Course modules"
          description="Build your course structure and organize learning materials into modules."
          backLink={
            <Link
              to="/teacher/courses"
              className="mb-3 inline-flex items-center gap-2 text-[10px] font-bold text-[#829598] transition-colors hover:text-[#06424B]"
            >
              <ArrowLeft size={14} />
              Back to courses
            </Link>
          }
          actions={
            <Button onClick={openCreate}>
              <Plus size={15} />
              Add module
            </Button>
          }
        />

        {/* Notification */}
        {notice && (
          <div
            role="status"
            className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-[11px] font-semibold animate-[moduleNoticeIn_.25s_ease-out] ${
              noticeType === "error"
                ? "border-[#F0D8D4] bg-[#FFF6F4] text-[#A84F43]"
                : "border-[#D7E8E3] bg-[#F2F8F5] text-[#36745E]"
            }`}
          >
            <div className="flex items-center gap-2">
              {noticeType === "error" ? (
                <CircleAlert size={15} />
              ) : (
                <CheckCircle2 size={15} />
              )}

              {notice}
            </div>

            <button
              type="button"
              onClick={() => setNotice("")}
              aria-label="Dismiss notification"
              className="rounded-md p-1 transition hover:bg-black/5"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Course Overview */}
        <section className="overflow-hidden rounded-[20px] border border-[#DDE7E7] bg-white shadow-[0_3px_14px_rgba(6,66,75,0.035)]">

          <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[16px] bg-[#EAF2F1] text-[#06424B]">
                <BookOpen size={25} strokeWidth={1.8} />
              </div>

              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="text-[9px] font-extrabold uppercase tracking-[1.5px] text-[#B27B20]">
                    Selected course
                  </span>

                  <StatusPill visible={course.visible} />
                </div>

                <h2 className="break-words text-[17px] font-extrabold text-[#06424B] sm:text-[20px]">
                  {course.fullName}
                </h2>

                <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] font-medium text-[#87999B]">
                  <span className="inline-flex items-center gap-1.5">
                    <Hash size={12} />
                    {course.idNumber || `COURSE-${course.id}`}
                  </span>

                  <span className="h-1 w-1 rounded-full bg-[#C4D0D0]" />

                  <span>{modules.length} modules</span>
                </div>
              </div>
            </div>

            <Link
              to="/teacher/courses"
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-[#DDE7E7] px-4 py-2.5 text-[10px] font-bold text-[#52777B] transition-all hover:border-[#06424B] hover:bg-[#06424B] hover:text-white"
            >
              <ArrowLeft size={13} />
              All courses
            </Link>
          </div>

          {/* Course Statistics */}
          <div className="grid grid-cols-1 border-t border-[#EAF0F0] bg-[#FAFCFC] sm:grid-cols-3">

            <div className="flex items-center gap-3 px-5 py-4 sm:px-6">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EAF2F1] text-[#06424B]">
                <Layers3 size={17} />
              </span>

              <div>
                <p className="text-[17px] font-extrabold text-[#06424B]">
                  {modules.length}
                </p>

                <p className="text-[9px] font-semibold text-[#899B9D]">
                  Total modules
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 border-t border-[#EAF0F0] px-5 py-4 sm:border-l sm:border-t-0 sm:px-6">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EAF2F1] text-[#06424B]">
                <Eye size={17} />
              </span>

              <div>
                <p className="text-[17px] font-extrabold text-[#06424B]">
                  {visibleModules}
                </p>

                <p className="text-[9px] font-semibold text-[#899B9D]">
                  Visible modules
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 border-t border-[#EAF0F0] px-5 py-4 sm:border-l sm:border-t-0 sm:px-6">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EAF2F1] text-[#06424B]">
                <FileText size={17} />
              </span>

              <div>
                <p className="text-[17px] font-extrabold text-[#06424B]">
                  {totalContent}
                </p>

                <p className="text-[9px] font-semibold text-[#899B9D]">
                  Learning content
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Learning Modules */}
        <section>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-5 w-[3px] rounded-full bg-[#FFAB0B]" />

                <h2 className="text-[16px] font-extrabold text-[#06424B]">
                  Learning modules
                </h2>

                <span className="rounded-full bg-[#EAF2F1] px-2.5 py-1 text-[9px] font-bold text-[#06424B]">
                  {modules.length}
                </span>
              </div>

              <p className="mt-1.5 pl-3 text-[10px] text-[#8B9B9D]">
                Each module represents a learning unit in your course.
              </p>
            </div>

            <div className="flex items-center gap-2 text-[9px] font-semibold text-[#819497]">
              <GripVertical size={14} />
              Drag to rearrange
            </div>
          </div>

          {modules.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

              {modules.map((module, index) => {
                const contentCount = data.contents.filter(
                  (item) =>
                    String(item.moduleId) === String(module.id)
                ).length;

                const isDragging =
                  String(draggingId) === String(module.id);

                const isDragOver =
                  String(dragOverId) === String(module.id);

                return (
                  <article
                    key={module.id}
                    onDragOver={(event) =>
                      handleDragOver(event, module.id)
                    }
                    onDrop={(event) =>
                      handleDrop(event, module.id)
                    }
                    className={`
                      group relative overflow-hidden rounded-[18px] border bg-white
                      transition-all duration-300 ease-out
                      ${
                        isDragOver
                          ? "border-[#06424B] bg-[#F4F9F8] shadow-[0_0_0_2px_rgba(6,66,75,0.12)]"
                          : "border-[#DFE8E8] hover:border-[#BFD3D1] hover:shadow-[0_8px_24px_rgba(6,66,75,0.07)]"
                      }
                      ${isDragging ? "scale-[0.98] opacity-40" : ""}
                    `}
                  >
                    {/* Rounded Top Accent */}
                    <div className="absolute inset-x-0 top-0 h-[3px] rounded-t-[18px] bg-[#06424B] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                    <div className="p-4 sm:p-5">

                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-3">

                        <div className="flex min-w-0 items-start gap-3">

                          {/* Drag Handle */}
                          <button
                            type="button"
                            draggable={!reordering}
                            onDragStart={(event) =>
                              handleDragStart(event, module.id)
                            }
                            onDragEnd={handleDragEnd}
                            title="Drag to change order"
                            aria-label={`Drag to reorder ${module.name}`}
                            className="mt-1 flex h-7 w-6 shrink-0 cursor-grab items-center justify-center rounded-md text-[#9AABAC] transition hover:bg-[#EAF2F1] hover:text-[#06424B] active:cursor-grabbing"
                          >
                            <GripVertical size={17} />
                          </button>

                          {/* Module Number */}
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] text-[12px] font-extrabold transition-colors ${
                              isDragOver
                                ? "bg-[#06424B] text-white"
                                : "bg-[#FFF4D7] text-[#A77924]"
                            }`}
                          >
                            {String(index + 1).padStart(2, "0")}
                          </div>

                          {/* Module Title */}
                          <div className="min-w-0 pt-0.5">
                            <h3 className="break-words text-[12px] font-extrabold leading-5 text-[#17464D]">
                              {module.name}
                            </h3>

                            <div className="mt-1.5 flex flex-wrap items-center gap-2">
                              <StatusPill visible={module.visible} />

                              <span className="text-[9px] font-medium text-[#95A3A4]">
                                Module {index + 1}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Edit and Delete - Top Right */}
                        <div className="flex shrink-0 items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEdit(module)}
                            title="Edit module"
                            aria-label={`Edit ${module.name}`}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-[#71898C] transition-all duration-200 hover:border-[#DDE9E7] hover:bg-[#EAF2F1] hover:text-[#06424B] active:scale-95"
                          >
                            <Pencil size={14} />
                          </button>

                          <button
                            type="button"
                            onClick={() => remove(module)}
                            title="Delete module"
                            aria-label={`Delete ${module.name}`}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-[#9A8581] transition-all duration-200 hover:border-[#F1DDDA] hover:bg-[#FFF2F0] hover:text-[#B65345] active:scale-95"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Module Summary */}
                      <p className="mt-4 line-clamp-2 min-h-[34px] text-[10px] leading-[1.7] text-[#87999B]">
                        {module.summary ||
                          "No module summary added yet."}
                      </p>

                      <div className="my-4 border-t border-[#EDF1F1]" />

                      {/* Module Metadata */}
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-3">

                          <div className="inline-flex items-center gap-1.5 text-[9px] font-semibold text-[#819497]">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#EAF2F1] text-[#06424B]">
                              <FileText size={13} />
                            </span>

                            {contentCount} items
                          </div>

                          <div className="inline-flex items-center gap-1.5 text-[9px] font-semibold text-[#819497]">
                            {module.visible ? (
                              <Eye
                                size={13}
                                className="text-[#52777B]"
                              />
                            ) : (
                              <EyeOff
                                size={13}
                                className="text-[#9AA9AA]"
                              />
                            )}

                            {module.visible
                              ? "Published"
                              : "Hidden"}
                          </div>
                        </div>

                        {/* Manage Content replaces More Details */}
                        <Link
                          to={`/teacher/courses/${course.id}/modules/${module.id}`}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[#06424B] px-3.5 py-2.5 text-[9px] font-bold text-white shadow-[0_2px_7px_rgba(6,66,75,0.10)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0B5661] hover:shadow-[0_5px_12px_rgba(6,66,75,0.16)]"
                        >
                          <span className="!text-white">
                            Manage content
                          </span>

                          <ArrowRight
                            size={12}
                            className="text-[#FFAB0B]"
                          />
                        </Link>
                      </div>

                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={Layers3}
              title="No modules yet"
              description="Create your first module to start building the course learning sequence."
              action={
                <Button onClick={openCreate}>
                  <Plus size={14} />
                  Create first module
                </Button>
              }
            />
          )}
        </section>

        {/* Reordering Guidance */}
        {modules.length > 1 && (
          <div className="flex items-start gap-3 rounded-[14px] border border-[#DDE7E7] bg-white px-4 py-3.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EAF2F1] text-[#06424B]">
              <GripVertical size={16} />
            </span>

            <div>
              <p className="text-[10px] font-bold text-[#06424B]">
                Organize your learning journey
              </p>

              <p className="mt-1 text-[9px] leading-5 text-[#89999B]">
                Drag the grip icon on any module card and drop it
                onto another module to change the learning order.
              </p>
            </div>
          </div>
        )}

        {/* Create / Edit Modal */}
        <Modal
          open={modalOpen}
          onClose={closeModal}
          title={editing ? "Edit module" : "Create module"}
          description={
            editing
              ? "Update the module details and learning sequence."
              : `Add a new learning unit to ${course.fullName}.`
          }
        >
          <form onSubmit={submit} className="space-y-5">

            <Field label="Module name" required>
              <input
                required
                maxLength={120}
                value={form.name}
                onChange={(event) =>
                  setForm({
                    ...form,
                    name: event.target.value,
                  })
                }
                placeholder="e.g. JavaScript Essentials"
                className={inputClass}
              />
            </Field>

            <Field label="Module summary">
              <textarea
                rows={3}
                value={form.summary}
                onChange={(event) =>
                  setForm({
                    ...form,
                    summary: event.target.value,
                  })
                }
                placeholder="Briefly describe what students will learn in this module..."
                className={textareaClass}
              />
            </Field>

            <Field label="Display position" required>
              <div className="relative">
                <Hash
                  size={15}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#82989A]"
                />

                <input
                  required
                  type="number"
                  min="1"
                  value={form.position}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      position: event.target.value,
                    })
                  }
                  className={`${inputClass} pl-10`}
                />
              </div>

              <p className="mt-1.5 text-[9px] text-[#91A0A1]">
                Determines the position of this module in the course.
              </p>
            </Field>

            {/* Student Visibility */}
            <div className="flex items-center justify-between gap-3 rounded-[14px] border border-[#DDE7E7] bg-[#F7FAFA] p-3.5">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EAF2F1] text-[#06424B]">
                  {form.visible ? (
                    <Eye size={16} />
                  ) : (
                    <EyeOff size={16} />
                  )}
                </span>

                <div>
                  <p className="text-[10px] font-bold text-[#365D62]">
                    Visible to students
                  </p>

                  <p className="mt-1 text-[9px] text-[#91A0A1]">
                    Allow students to access this module.
                  </p>
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={form.visible}
                onClick={() =>
                  setForm({
                    ...form,
                    visible: !form.visible,
                  })
                }
                className={`relative h-[23px] w-[42px] shrink-0 rounded-full transition-colors duration-200 ${
                  form.visible
                    ? "bg-[#06424B]"
                    : "bg-[#C8D2D2]"
                }`}
              >
                <span
                  className={`absolute top-[3px] h-[17px] w-[17px] rounded-full bg-white shadow-sm transition-all duration-200 ${
                    form.visible
                      ? "left-[22px]"
                      : "left-[3px]"
                  }`}
                />
              </button>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col-reverse gap-2 border-t border-[#EAF0F0] pt-4 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={closeModal}
                disabled={busy}
              >
                Cancel
              </Button>

              <Button type="submit" disabled={busy}>
                {busy ? (
                  "Saving..."
                ) : (
                  <>
                    {editing ? (
                      <Pencil size={14} />
                    ) : (
                      <Plus size={14} />
                    )}

                    {editing
                      ? "Save changes"
                      : "Create module"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </TeacherLayout>
  );
}
