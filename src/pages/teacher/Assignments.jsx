
import { useMemo, useState } from "react";
import {
  ClipboardCheck,
  Plus,
  Pencil,
  Trash2,
  CalendarDays,
  BookOpen,
  Layers3,
  Clock3,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  X,
  FileText,
  Search,
} from "lucide-react";

import {
  useTeacherData,
  teacherActions,
} from "../../data/teacherMockData";

import TeacherLayout from "./TeacherLayout";

import {
  PageHeader,
  Button,
  SearchField,
  StatusPill,
  Modal,
  Field,
  inputClass,
  textareaClass,
  EmptyState,
} from "./TeacherUI";

const blankForm = {
  courseId: "",
  moduleId: "",
  title: "",
  instructions: "",
  dueDate: "",
  totalMarks: 100,
  visible: true,
};

const getErrorMessage = (error, fallback) => {
  if (typeof error === "string" && error.trim()) {
    return error;
  }

  if (error?.response?.data?.detail) {
    return error.response.data.detail;
  }

  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.message) {
    return error.message;
  }

  return fallback;
};

export default function Assignments() {
  const data = useTeacherData();

  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [editing, setEditing] = useState(null);
  const [deletingAssignment, setDeletingAssignment] = useState(null);

  const [form, setForm] = useState(blankForm);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState(null);

  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Modules belonging to the selected course
  const visibleModules = useMemo(
    () =>
      data.modules.filter(
        (module) =>
          !form.courseId ||
          String(module.courseId) === String(form.courseId)
      ),
    [data.modules, form.courseId]
  );

  // Search and course filtering
  const assignments = useMemo(() => {
    return data.assignments
      .filter((assignment) => {
        const course = data.courses.find(
          (item) =>
            String(item.id) === String(assignment.courseId)
        );

        const module = data.modules.find(
          (item) =>
            String(item.id) === String(assignment.moduleId)
        );

        const text = `
          ${assignment.title || ""}
          ${assignment.instructions || ""}
          ${course?.fullName || ""}
          ${module?.name || ""}
        `.toLowerCase();

        const matchesSearch = text.includes(
          search.toLowerCase().trim()
        );

        const matchesCourse =
          courseFilter === "all" ||
          String(assignment.courseId) === courseFilter;

        return matchesSearch && matchesCourse;
      })
      .sort((a, b) =>
        String(a.dueDate || "9999").localeCompare(
          String(b.dueDate || "9999")
        )
      );
  }, [
    data.assignments,
    data.courses,
    data.modules,
    search,
    courseFilter,
  ]);

  // Statistics
  const totalAssignments = data.assignments.length;

  const visibleAssignments = data.assignments.filter(
    (item) => item.visible
  ).length;

  const coursesWithAssignments = new Set(
    data.assignments.map((item) => item.courseId)
  ).size;

  // Notification helper
  const showNotice = (message, type = "success") => {
    setNotice({ message, type });
  };

  const clearFieldError = (field) => {
    setErrors((previous) => {
      if (!previous[field]) return previous;

      const updated = { ...previous };
      delete updated[field];

      return updated;
    });
  };

  // Create assignment
  const openCreate = () => {
    setEditing(null);

    setForm({
      ...blankForm,
      courseId: data.courses[0]
        ? String(data.courses[0].id)
        : "",
    });

    setErrors({});
    setNotice(null);
    setModalOpen(true);
  };

  // Edit assignment
  const openEdit = (assignment) => {
    setEditing(assignment);

    setForm({
      ...blankForm,
      ...assignment,
      courseId: String(assignment.courseId),
      moduleId: assignment.moduleId
        ? String(assignment.moduleId)
        : "",
    });

    setErrors({});
    setNotice(null);
    setModalOpen(true);
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    if (!form.courseId) {
      newErrors.courseId = "Please select a course.";
    }

    if (!form.title.trim()) {
      newErrors.title = "Assignment title is required.";
    } else if (form.title.trim().length < 3) {
      newErrors.title =
        "Assignment title must contain at least 3 characters.";
    }

    if (!form.instructions.trim()) {
      newErrors.instructions =
        "Assignment instructions are required.";
    } else if (form.instructions.trim().length < 10) {
      newErrors.instructions =
        "Please provide more detailed instructions.";
    }

    const marks = Number(form.totalMarks);

    if (!form.totalMarks || !Number.isFinite(marks) || marks < 1) {
      newErrors.totalMarks =
        "Total marks must be at least 1.";
    }

    if (
      form.moduleId &&
      !visibleModules.some(
        (module) =>
          String(module.id) === String(form.moduleId)
      )
    ) {
      newErrors.moduleId =
        "Please select a module belonging to this course.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // Save assignment
  const submit = async (event) => {
    event.preventDefault();

    if (busy) return;

    setNotice(null);

    if (!validateForm()) {
      return;
    }

    setBusy(true);

    const payload = {
      ...form,
      courseId: Number(form.courseId),
      moduleId: form.moduleId
        ? Number(form.moduleId)
        : "",
      title: form.title.trim(),
      instructions: form.instructions.trim(),
      totalMarks: Number(form.totalMarks),
    };

    try {
      if (editing) {
        await teacherActions.updateAssignment(
          editing.id,
          payload
        );

        setModalOpen(false);
        setEditing(null);

        showNotice("Assignment updated successfully.");
      } else {
        await teacherActions.createAssignment(
          payload.courseId,
          payload
        );

        setModalOpen(false);

        showNotice("Assignment created successfully.");
      }

      setForm(blankForm);
      setErrors({});
    } catch (error) {
      showNotice(
        getErrorMessage(
          error,
          "Unable to save the assignment. Please try again."
        ),
        "error"
      );
    } finally {
      setBusy(false);
    }
  };

  // Open delete confirmation
  const openDelete = (assignment) => {
    setDeletingAssignment(assignment);
    setDeleteModalOpen(true);
    setNotice(null);
  };

  // Delete assignment
  const confirmDelete = async () => {
    if (!deletingAssignment || deleting) return;

    setDeleting(true);

    try {
      await teacherActions.deleteAssignment(
        deletingAssignment.id
      );

      setDeleteModalOpen(false);
      setDeletingAssignment(null);

      showNotice("Assignment deleted successfully.");
    } catch (error) {
      showNotice(
        getErrorMessage(
          error,
          "Unable to delete the assignment. Please try again."
        ),
        "error"
      );
    } finally {
      setDeleting(false);
    }
  };

  const closeFormModal = () => {
    if (busy) return;

    setModalOpen(false);
    setErrors({});
  };

  const closeDeleteModal = () => {
    if (deleting) return;

    setDeleteModalOpen(false);
    setDeletingAssignment(null);
  };

  return (
    <TeacherLayout>
      <div className="space-y-5">

        {/* Page Header */}
        <PageHeader
          title="Assignments"
          description="Create and manage assignments across your courses and modules."
          actions={
            <Button
              onClick={openCreate}
              disabled={!data.courses.length}
            >
              <Plus size={15} />
              Create assignment
            </Button>
          }
        />

        {/* Global Success / Error Notification */}
        {notice && (
          <div
            role={notice.type === "error" ? "alert" : "status"}
            className={`flex items-start gap-3 rounded-xl border px-4 py-3.5 animate-in fade-in slide-in-from-top-2 duration-200 ${
              notice.type === "error"
                ? "border-[#F0D6D1] bg-[#FFF5F3] text-[#A84E43]"
                : "border-[#D7E9DF] bg-[#F1F8F3] text-[#367653]"
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {notice.type === "error" ? (
                <AlertCircle size={17} />
              ) : (
                <CheckCircle2 size={17} />
              )}
            </div>

            <p className="flex-1 text-[11px] font-semibold leading-5">
              {notice.message}
            </p>

            <button
              type="button"
              onClick={() => setNotice(null)}
              aria-label="Dismiss notification"
              className="rounded-md p-1 opacity-70 transition hover:bg-black/5 hover:opacity-100"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Statistics */}
        <div className="grid gap-3 sm:grid-cols-3">

          <div className="group rounded-[17px] border border-[#E2EAEA] bg-white p-4 shadow-[0_3px_14px_rgba(18,59,67,0.025)] transition-all duration-300 hover:-translate-y-1 hover:border-[#D5E3E2] hover:shadow-[0_8px_22px_rgba(18,59,67,0.06)]">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold text-[#84999B]">
                Total assignments
              </p>

              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EAF2F1] text-[#06424B] transition-transform duration-300 group-hover:scale-110">
                <ClipboardCheck size={17} />
              </span>
            </div>

            <p className="mt-3 text-[25px] font-extrabold tracking-tight text-[#17464D]">
              {totalAssignments}
            </p>

            <p className="mt-1 text-[10px] text-[#91A1A3]">
              Across all courses
            </p>
          </div>

          <div className="group rounded-[17px] border border-[#E2EAEA] bg-white p-4 shadow-[0_3px_14px_rgba(18,59,67,0.025)] transition-all duration-300 hover:-translate-y-1 hover:border-[#EAD9A9] hover:shadow-[0_8px_22px_rgba(18,59,67,0.06)]">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold text-[#84999B]">
                Visible to students
              </p>

              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFF4D9] text-[#A87914] transition-transform duration-300 group-hover:scale-110">
                <CheckCircle2 size={17} />
              </span>
            </div>

            <p className="mt-3 text-[25px] font-extrabold tracking-tight text-[#17464D]">
              {visibleAssignments}
            </p>

            <p className="mt-1 text-[10px] text-[#91A1A3]">
              Currently published
            </p>
          </div>

          <div className="group rounded-[17px] border border-[#E2EAEA] bg-white p-4 shadow-[0_3px_14px_rgba(18,59,67,0.025)] transition-all duration-300 hover:-translate-y-1 hover:border-[#DCD2EB] hover:shadow-[0_8px_22px_rgba(18,59,67,0.06)]">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold text-[#84999B]">
                Courses with assignments
              </p>

              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F0ECF7] text-[#8063A6] transition-transform duration-300 group-hover:scale-110">
                <BookOpen size={17} />
              </span>
            </div>

            <p className="mt-3 text-[25px] font-extrabold tracking-tight text-[#17464D]">
              {coursesWithAssignments}
            </p>

            <p className="mt-1 text-[10px] text-[#91A1A3]">
              Courses containing assignments
            </p>
          </div>

        </div>

        {/* Search and Course Filter */}
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_240px]">
          <SearchField
            value={search}
            onChange={setSearch}
            placeholder="Search assignment, course or module..."
          />

          <select
            value={courseFilter}
            onChange={(event) =>
              setCourseFilter(event.target.value)
            }
            className={`${inputClass} transition-all duration-200 focus:border-[#06424B] focus:ring-2 focus:ring-[#06424B]/10`}
          >
            <option value="all">All courses</option>

            {data.courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.fullName}
              </option>
            ))}
          </select>
        </div>

        {/* Assignment List Header */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-[13px] font-bold text-[#17464D]">
              Assignment list
            </h2>

            <p className="mt-1 text-[10px] text-[#91A1A3]">
              {assignments.length} assignments found
            </p>
          </div>

          {(search || courseFilter !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCourseFilter("all");
              }}
              className="rounded-lg px-2.5 py-1.5 text-[10px] font-bold text-[#9B741B] transition hover:bg-[#FFF7E6]"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Assignment Cards */}
        {assignments.length ? (
          <div className="space-y-3">

            {assignments.map((assignment) => {
              const course = data.courses.find(
                (item) =>
                  String(item.id) === String(assignment.courseId)
              );

              const module = data.modules.find(
                (item) =>
                  String(item.id) === String(assignment.moduleId)
              );

              return (
                <article
                  key={assignment.id}
                  className="group relative overflow-hidden rounded-[18px] border border-[#E0E9E9] bg-white p-4 shadow-[0_4px_16px_rgba(18,59,67,0.025)] transition-all duration-300 hover:-translate-y-[2px] hover:border-[#D5E1E0] hover:shadow-[0_9px_24px_rgba(18,59,67,0.065)] sm:p-5"
                >
                  <div className="absolute bottom-0 left-0 top-0 w-[3px] origin-top scale-y-0 bg-[#FFAB0B] transition-transform duration-300 group-hover:scale-y-100" />

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start">

                    {/* Assignment Icon */}
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] border border-[#F0E2BD] bg-[#FFF6E2] text-[#A87914] transition-all duration-300 group-hover:bg-[#FFEFCA]">
                      <ClipboardCheck size={20} />
                    </div>

                    {/* Assignment Details */}
                    <div className="min-w-0 flex-1">

                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-[13px] font-extrabold text-[#17464D]">
                          {assignment.title}
                        </h2>

                        <StatusPill
                          visible={assignment.visible}
                        />
                      </div>

                      {/* Course and Module */}
                      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-semibold">
                        <span className="text-[#A87914]">
                          {course?.fullName || "Course unavailable"}
                        </span>

                        <span className="text-[#CBD5D5]">/</span>

                        <span className="text-[#71888B]">
                          {module?.name || "Entire course"}
                        </span>
                      </div>

                      {/* Instructions */}
                      <p className="mt-3 line-clamp-3 text-[11px] leading-[1.8] text-[#829497]">
                        {assignment.instructions ||
                          "No instructions provided."}
                      </p>

                      {/* Metadata */}
                      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[#F0F3F3] pt-3">

                        <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-[#6D8589]">
                          <CalendarDays
                            size={13}
                            className="text-[#B08A37]"
                          />

                          {assignment.dueDate || "No due date"}
                        </span>

                        <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-[#6D8589]">
                          <BookOpen
                            size={13}
                            className="text-[#06424B]"
                          />

                          {assignment.totalMarks} marks
                        </span>

                        <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-[#6D8589]">
                          {module ? (
                            <>
                              <Layers3
                                size={13}
                                className="text-[#8063A6]"
                              />
                              Module assignment
                            </>
                          ) : (
                            <>
                              <FileText
                                size={13}
                                className="text-[#8063A6]"
                              />
                              Entire course
                            </>
                          )}
                        </span>

                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 items-center gap-1 border-t border-[#F0F3F3] pt-3 sm:border-0 sm:pt-0">

                      <button
                        type="button"
                        onClick={() => openEdit(assignment)}
                        title="Edit assignment"
                        aria-label={`Edit ${assignment.title}`}
                        className="flex h-9 w-9 items-center justify-center rounded-xl text-[#819699] transition-all duration-200 hover:bg-[#FFF4DA] hover:text-[#A87914] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFAB0B]/40"
                      >
                        <Pencil size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={() => openDelete(assignment)}
                        title="Delete assignment"
                        aria-label={`Delete ${assignment.title}`}
                        className="flex h-9 w-9 items-center justify-center rounded-xl text-[#A4B0B1] transition-all duration-200 hover:bg-[#FFF1EF] hover:text-[#B65345] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B65345]/30"
                      >
                        <Trash2 size={15} />
                      </button>

                    </div>
                  </div>
                </article>
              );
            })}

          </div>
        ) : (
          <EmptyState
            icon={ClipboardCheck}
            title="No assignments found"
            description={
              data.courses.length
                ? "Create an assignment and attach it to a course or one of its modules."
                : "Create a course first, then you can add assignments to it."
            }
            action={
              data.courses.length ? (
                <Button onClick={openCreate}>
                  <Plus size={14} />
                  Create assignment
                </Button>
              ) : null
            }
          />
        )}

        {/* Create / Edit Assignment Modal */}
        <Modal
          open={modalOpen}
          onClose={closeFormModal}
          title={
            editing ? "Edit assignment" : "Create assignment"
          }
          description="Choose a course and optionally attach this assignment to one of its modules."
        >
          <form onSubmit={submit} className="space-y-4">

            {/* Course */}
            <Field label="Course" required>
              <select
                required
                value={form.courseId}
                onChange={(event) => {
                  setForm({
                    ...form,
                    courseId: event.target.value,
                    moduleId: "",
                  });

                  clearFieldError("courseId");
                  clearFieldError("moduleId");
                }}
                className={`${inputClass} ${
                  errors.courseId
                    ? "border-[#C75A4D] focus:border-[#C75A4D]"
                    : ""
                }`}
              >
                <option value="">Select course</option>

                {data.courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.fullName}
                  </option>
                ))}
              </select>

              {errors.courseId && (
                <p className="mt-1.5 flex items-center gap-1.5 text-[10px] font-medium text-[#B65345]">
                  <AlertCircle size={12} />
                  {errors.courseId}
                </p>
              )}
            </Field>

            {/* Module */}
            <Field label="Module (optional)">
              <select
                value={form.moduleId}
                disabled={!form.courseId}
                onChange={(event) => {
                  setForm({
                    ...form,
                    moduleId: event.target.value,
                  });

                  clearFieldError("moduleId");
                }}
                className={`${inputClass} ${
                  !form.courseId
                    ? "cursor-not-allowed bg-[#F4F6F6] text-[#A3B0B1]"
                    : ""
                } ${
                  errors.moduleId
                    ? "border-[#C75A4D]"
                    : ""
                }`}
              >
                <option value="">
                  Entire course assignment
                </option>

                {visibleModules.map((module) => (
                  <option key={module.id} value={module.id}>
                    {module.name}
                  </option>
                ))}
              </select>

              <p className="mt-1.5 text-[10px] text-[#91A1A3]">
                Leave empty to assign this to the entire course.
              </p>

              {errors.moduleId && (
                <p className="mt-1 flex items-center gap-1.5 text-[10px] font-medium text-[#B65345]">
                  <AlertCircle size={12} />
                  {errors.moduleId}
                </p>
              )}
            </Field>

            {/* Assignment Title */}
            <Field label="Assignment title" required>
              <input
                required
                maxLength={150}
                value={form.title}
                onChange={(event) => {
                  setForm({
                    ...form,
                    title: event.target.value,
                  });

                  clearFieldError("title");
                }}
                placeholder="e.g. Practical task 01"
                className={`${inputClass} ${
                  errors.title
                    ? "border-[#C75A4D] focus:border-[#C75A4D]"
                    : ""
                }`}
              />

              <div className="mt-1.5 flex items-center justify-between">
                {errors.title ? (
                  <p className="flex items-center gap-1 text-[10px] font-medium text-[#B65345]">
                    <AlertCircle size={12} />
                    {errors.title}
                  </p>
                ) : (
                  <span className="text-[10px] text-[#91A1A3]">
                    Enter a clear assignment title.
                  </span>
                )}

                <span className="text-[10px] text-[#A2B0B1]">
                  {form.title.length}/150
                </span>
              </div>
            </Field>

            {/* Instructions */}
            <Field label="Instructions" required>
              <textarea
                required
                rows={5}
                value={form.instructions}
                onChange={(event) => {
                  setForm({
                    ...form,
                    instructions: event.target.value,
                  });

                  clearFieldError("instructions");
                }}
                placeholder="Explain the task, submission requirements and evaluation criteria..."
                className={`${textareaClass} ${
                  errors.instructions
                    ? "border-[#C75A4D] focus:border-[#C75A4D]"
                    : ""
                }`}
              />

              {errors.instructions && (
                <p className="mt-1.5 flex items-center gap-1.5 text-[10px] font-medium text-[#B65345]">
                  <AlertCircle size={12} />
                  {errors.instructions}
                </p>
              )}
            </Field>

            {/* Due Date and Marks */}
            <div className="grid gap-4 sm:grid-cols-2">

              <Field label="Due date">
                <input
                  type="date"
                  value={form.dueDate || ""}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      dueDate: event.target.value,
                    })
                  }
                  className={inputClass}
                />
              </Field>

              <Field label="Total marks" required>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={form.totalMarks}
                  onChange={(event) => {
                    setForm({
                      ...form,
                      totalMarks: event.target.value,
                    });

                    clearFieldError("totalMarks");
                  }}
                  className={`${inputClass} ${
                    errors.totalMarks
                      ? "border-[#C75A4D]"
                      : ""
                  }`}
                />

                {errors.totalMarks && (
                  <p className="mt-1.5 flex items-center gap-1 text-[10px] font-medium text-[#B65345]">
                    <AlertCircle size={12} />
                    {errors.totalMarks}
                  </p>
                )}
              </Field>

            </div>

            {/* Student Visibility */}
            <label className="group flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-[#E3EBEB] bg-[#F8FAFA] px-3.5 py-3 transition-all duration-200 hover:border-[#E8D7A7] hover:bg-[#FFFCF4]">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FFF2D4] text-[#A87914]">
                  <BookOpen size={16} />
                </div>

                <div>
                  <p className="text-[11px] font-bold text-[#244E54]">
                    Visible to enrolled students
                  </p>

                  <p className="mt-1 text-[10px] text-[#91A1A3]">
                    Allow students to view this assignment.
                  </p>
                </div>
              </div>

              <input
                type="checkbox"
                checked={Boolean(form.visible)}
                onChange={(event) =>
                  setForm({
                    ...form,
                    visible: event.target.checked,
                  })
                }
                className="h-4 w-4 shrink-0 cursor-pointer accent-[#06424B]"
              />
            </label>

            {/* Form Footer */}
            <div className="flex flex-col-reverse gap-2 border-t border-[#EDF1F1] pt-4 sm:flex-row sm:justify-end">

              <Button
                variant="secondary"
                onClick={closeFormModal}
                disabled={busy}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={busy || !data.courses.length}
              >
                {busy ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Saving...
                  </>
                ) : (
                  <>
                    {editing ? (
                      <CheckCircle2 size={14} />
                    ) : (
                      <Plus size={14} />
                    )}

                    {editing
                      ? "Save changes"
                      : "Create assignment"}
                  </>
                )}
              </Button>

            </div>
          </form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          open={deleteModalOpen}
          onClose={closeDeleteModal}
          title="Delete assignment"
          description="Please confirm before deleting this assignment."
        >
          <div className="space-y-4">

            <div className="flex items-start gap-3 rounded-xl border border-[#F0D9D4] bg-[#FFF7F5] p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FCE8E4] text-[#B65345]">
                <AlertTriangle size={19} />
              </div>

              <div className="min-w-0">
                <p className="text-[12px] font-bold text-[#87473F]">
                  Are you sure you want to delete?
                </p>

                <p className="mt-1 break-words text-[11px] leading-5 text-[#9B7771]">
                  {deletingAssignment?.title}
                </p>

                <p className="mt-2 text-[10px] leading-5 text-[#A77C75]">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-[#EDF1F1] pt-4 sm:flex-row sm:justify-end">
              <Button
                variant="secondary"
                onClick={closeDeleteModal}
                disabled={deleting}
              >
                Cancel
              </Button>

              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="inline-flex h-[40px] items-center justify-center gap-2 rounded-xl bg-[#B65345] px-4 text-[11px] font-bold text-white shadow-sm transition-all duration-200 hover:bg-[#9F4338] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    Delete assignment
                  </>
                )}
              </button>
            </div>

          </div>
        </Modal>

      </div>
    </TeacherLayout>
  );
}
