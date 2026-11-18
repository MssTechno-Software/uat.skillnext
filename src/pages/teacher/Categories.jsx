
import { useMemo, useState } from "react";
import {
  Pencil,
  Plus,
  Trash2,
  Layers3,
  BookOpen,
  Eye,
  Search,
  Scissors,
  Monitor,
  BriefcaseBusiness,
  GraduationCap,
  Sparkles,
  X,
  Palette,
  Code2,
  Calculator,
  Camera,
  HeartPulse,
  Languages,
  Music,
  Globe,
  ShoppingBag,
  Utensils,
  Dumbbell,
  Wrench,
  Microscope,
  Laptop,
  FileText,
  ChartNoAxesCombined,
  Cpu,
  Presentation,
  Paintbrush,
  CameraIcon,
} from "lucide-react";

import { useTeacherData, teacherActions } from "../../data/teacherMockData";
import TeacherLayout from "./TeacherLayout";
import {
  PageHeader,
  Button,
  Modal,
  Field,
  inputClass,
  textareaClass,
  EmptyState,
} from "./TeacherUI";

const blankForm = {
  name: "",
  idNumber: "",
  description: "",
  sortOrder: 1,
  visible: true,
};

// Select meaningful icons based on category names.
const getCategoryIcon = (name = "") => {
  const value = name.toLowerCase();

  const iconMappings = [
    {
      keywords: ["hair", "beauty", "salon", "barber", "styling"],
      icon: Scissors,
    },
    {
      keywords: ["technology", "computer", "software", "it"],
      icon: Monitor,
    },
    {
      keywords: ["programming", "development", "coding", "web"],
      icon: Code2,
    },
    {
      keywords: ["business", "management", "finance"],
      icon: BriefcaseBusiness,
    },
    {
      keywords: ["education", "academic", "teaching"],
      icon: GraduationCap,
    },
    {
      keywords: ["design", "creative", "graphics"],
      icon: Palette,
    },
    {
      keywords: ["art", "painting", "drawing"],
      icon: Paintbrush,
    },
    {
      keywords: ["photography", "photo", "video"],
      icon: Camera,
    },
    {
      keywords: ["health", "medical", "nursing"],
      icon: HeartPulse,
    },
    {
      keywords: ["language", "english", "communication"],
      icon: Languages,
    },
    {
      keywords: ["music", "instrument"],
      icon: Music,
    },
    {
      keywords: ["science", "research", "laboratory"],
      icon: Microscope,
    },
    {
      keywords: ["math", "mathematics", "calculation"],
      icon: Calculator,
    },
    {
      keywords: ["marketing", "sales", "analytics"],
      icon: ChartNoAxesCombined,
    },
    {
      keywords: ["engineering", "electronics", "hardware"],
      icon: Cpu,
    },
    {
      keywords: ["food", "cooking", "culinary"],
      icon: Utensils,
    },
    {
      keywords: ["fitness", "sports", "gym"],
      icon: Dumbbell,
    },
    {
      keywords: ["travel", "geography", "global"],
      icon: Globe,
    },
    {
      keywords: ["presentation", "leadership"],
      icon: Presentation,
    },
    {
      keywords: ["shopping", "retail", "ecommerce"],
      icon: ShoppingBag,
    },
    {
      keywords: ["repair", "maintenance", "workshop"],
      icon: Wrench,
    },
    {
      keywords: ["document", "writing"],
      icon: FileText,
    },
    {
      keywords: ["computer science", "laptop"],
      icon: Laptop,
    },
  ];

  const matched = iconMappings.find(({ keywords }) =>
    keywords.some((keyword) => value.includes(keyword))
  );

  return matched?.icon || BookOpen;
};

export default function Categories() {
  const data = useTeacherData();

  const [search, setSearch] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blankForm);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const categories = useMemo(
    () =>
      data.categories
        .filter((item) => {
          const matchesSearch = `${item.name} ${item.idNumber} ${item.description}`
            .toLowerCase()
            .includes(search.toLowerCase());

          const matchesVisibility =
            visibilityFilter === "all" ||
            (visibilityFilter === "visible" && item.visible) ||
            (visibilityFilter === "hidden" && !item.visible);

          return matchesSearch && matchesVisibility;
        })
        .sort(
          (a, b) =>
            a.sortOrder - b.sortOrder ||
            a.name.localeCompare(b.name)
        ),
    [data.categories, search, visibilityFilter]
  );

  const totalCategories = data.categories.length;
  const totalCourses = data.courses.length;

  const visibleCategories = data.categories.filter(
    (item) => item.visible
  ).length;

  const hiddenCategories = totalCategories - visibleCategories;

  const openCreate = () => {
    setEditing(null);
    setForm({
      ...blankForm,
      sortOrder: data.categories.length + 1,
    });
    setNotice("");
    setModalOpen(true);
  };

  const openEdit = (category) => {
    setEditing(category);
    setForm({
      ...blankForm,
      ...category,
    });
    setNotice("");
    setModalOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setBusy(true);
    setNotice("");

    const payload = {
      ...form,
      name: form.name.trim(),
      idNumber: form.idNumber.trim(),
      description: form.description.trim(),
      sortOrder: Number(form.sortOrder) || 1,
    };

    try {
      if (editing) {
        await teacherActions.updateCategory(editing.id, payload);
      } else {
        await teacherActions.createCategory(payload);
      }

      setModalOpen(false);
    } catch (error) {
      setNotice(
        error.message ||
          "Unable to save this category. Please try again."
      );
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (category) => {
    if (
      !window.confirm(
        `Delete the category "${category.name}"?`
      )
    ) {
      return;
    }

    setNotice("");

    try {
      const deleted = await teacherActions.deleteCategory(
        category.id
      );

      setNotice(
        deleted
          ? "Category deleted successfully."
          : "This category still contains courses. Move or delete those courses before deleting the category."
      );
    } catch (error) {
      setNotice(
        error.message || "Unable to delete this category."
      );
    }
  };

  return (
    <TeacherLayout>
      <div className="space-y-6 pb-8">

        {/* Page Header */}
        <PageHeader
          title="Course Categories"
          description="Organise your learning catalogue with structured subject categories."
          actions={
            <Button onClick={openCreate}>
              <Plus size={15} />
              Add Category
            </Button>
          }
        />

        {/* Notification */}
        {notice && (
          <div className="flex items-start justify-between gap-3 rounded-2xl border border-[#EAD9AE] bg-[#FFF9EC] px-4 py-3 text-[12px] font-medium text-[#89651F]">
            <p>{notice}</p>
            <button
              type="button"
              onClick={() => setNotice("")}
              className="shrink-0 rounded-lg p-1 hover:bg-[#F8EED8]"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* Overview Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">

          <div className="group relative overflow-hidden rounded-[20px] border border-[#E5ECEB] bg-white p-5 shadow-[0_4px_18px_rgba(18,59,67,0.025)] transition-all duration-300 hover:-translate-y-1 hover:border-[#D6E2E0] hover:shadow-[0_10px_28px_rgba(18,59,67,0.07)]">
            <div className="absolute -right-5 -top-6 h-28 w-28 rounded-full bg-[#EAF2F1] opacity-60" />

            <div className="relative flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#06424B] text-white">
                <Layers3 size={20} />
              </div>
              <span className="rounded-full bg-[#EAF2F1] px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-[#06424B]">
                Catalogue
              </span>
            </div>

            <div className="relative mt-5">
              <p className="text-[29px] font-extrabold tracking-tight text-[#06424B]">
                {totalCategories.toString().padStart(2, "0")}
              </p>
              <p className="mt-1 text-[11px] font-semibold text-[#819497]">
                Total Categories
              </p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-[20px] border border-[#E5ECEB] bg-white p-5 shadow-[0_4px_18px_rgba(18,59,67,0.025)] transition-all duration-300 hover:-translate-y-1 hover:border-[#D6E2E0] hover:shadow-[0_10px_28px_rgba(18,59,67,0.07)]">
            <div className="absolute -right-5 -top-6 h-28 w-28 rounded-full bg-[#FFF5DC] opacity-70" />

            <div className="relative flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#FFAB0B] text-[#06424B]">
                <BookOpen size={20} />
              </div>
              <span className="rounded-full bg-[#FFF8E8] px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-[#AD811E]">
                Learning
              </span>
            </div>

            <div className="relative mt-5">
              <p className="text-[29px] font-extrabold tracking-tight text-[#06424B]">
                {totalCourses.toString().padStart(2, "0")}
              </p>
              <p className="mt-1 text-[11px] font-semibold text-[#819497]">
                Total Courses
              </p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-[20px] border border-[#E5ECEB] bg-white p-5 shadow-[0_4px_18px_rgba(18,59,67,0.025)] transition-all duration-300 hover:-translate-y-1 hover:border-[#D6E2E0] hover:shadow-[0_10px_28px_rgba(18,59,67,0.07)] sm:col-span-2 xl:col-span-1">
            <div className="absolute -right-5 -top-6 h-28 w-28 rounded-full bg-[#FFF5DC] opacity-70" />

            <div className="relative flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#06424B] text-white">
                <Eye size={20} />
              </div>
              <span className="rounded-full bg-[#EAF2F1] px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-[#06424B]">
                Published
              </span>
            </div>

            <div className="relative mt-5">
              <p className="text-[29px] font-extrabold tracking-tight text-[#06424B]">
                {visibleCategories.toString().padStart(2, "0")}
              </p>
              <p className="mt-1 text-[11px] font-semibold text-[#819497]">
                Visible Categories
                {hiddenCategories > 0 && (
                  <span className="ml-2 font-medium text-[#A1ADAF]">
                    · {hiddenCategories} hidden
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Category Directory */}
        <div className="space-y-5">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[15px] font-extrabold tracking-tight text-[#06424B]">
                  All Categories
                </h2>
                <span className="rounded-full bg-[#FFAB0B]/15 px-2.5 py-1 text-[10px] font-extrabold text-[#946A12]">
                  {categories.length}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-[#8A9B9D]">
                Manage your subject areas and their course collections.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative min-w-0 sm:w-[260px]">
                <Search
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#06424B]"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search categories..."
                  className="h-10 w-full rounded-xl border border-[#E3EBEA] bg-white pl-10 pr-4 text-[11px] font-medium text-[#06424B] outline-none transition placeholder:text-[#A6B3B4] focus:border-[#FFAB0B] focus:ring-2 focus:ring-[#FFAB0B]/10"
                />
              </div>

              <select
                value={visibilityFilter}
                onChange={(event) =>
                  setVisibilityFilter(event.target.value)
                }
                className="h-10 rounded-xl border border-[#E3EBEA] bg-white px-3 text-[11px] font-semibold text-[#06424B] outline-none transition focus:border-[#FFAB0B]"
              >
                <option value="all">All categories</option>
                <option value="visible">Visible</option>
                <option value="hidden">Hidden</option>
              </select>
            </div>
          </div>

          {/* Category Cards */}
          {categories.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {categories.map((category) => {
                const CategoryIcon = getCategoryIcon(category.name);

                const courseCount = data.courses.filter(
                  (course) =>
                    String(course.categoryId) ===
                    String(category.id)
                ).length;

                return (
                  <div
                    key={category.id}
                    className="group relative overflow-hidden rounded-[20px] border border-[#E4EBEB] bg-white p-5 shadow-[0_4px_18px_rgba(18,59,67,0.025)] transition-all duration-300 hover:-translate-y-1 hover:border-[#FFAB0B]/60 hover:shadow-[0_12px_30px_rgba(18,59,67,0.075)]"
                  >
                    {/* Top Accent */}
                    <div className="absolute left-0 top-0 h-[3px] w-0 bg-[#FFAB0B] transition-all duration-300 group-hover:w-full" />

                    {/* Category Information */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-[15px] bg-[#EAF2F1] text-[#06424B] transition-all duration-300 group-hover:bg-[#06424B] group-hover:text-[#FFAB0B]">
                          <CategoryIcon size={22} strokeWidth={1.9} />
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate text-[13px] font-extrabold text-[#06424B]">
                            {category.name}
                          </h3>
                          <p className="mt-1 truncate text-[10px] font-semibold tracking-wide text-[#8A9B9D]">
                            {category.idNumber || "Category"}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[9px] font-bold ${
                          category.visible
                            ? "bg-[#EAF2F1] text-[#06424B]"
                            : "bg-[#F1F3F3] text-[#819092]"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            category.visible
                              ? "bg-[#06424B]"
                              : "bg-[#9CA9AA]"
                          }`}
                        />
                        {category.visible ? "Visible" : "Hidden"}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="mt-5 min-h-[36px] text-[11px] leading-[19px] text-[#819497] line-clamp-2">
                      {category.description ||
                        "A main category for organising related courses and learning content."}
                    </p>

                    <div className="my-4 border-t border-dashed border-[#E8EEEE]" />

                    {/* Footer */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#EAF2F1] text-[#06424B]">
                          <BookOpen size={14} />
                        </div>

                        <div>
                          <p className="text-[12px] font-extrabold text-[#06424B]">
                            {courseCount.toString().padStart(2, "0")}
                            <span className="ml-1 font-semibold text-[#91A3A5]">
                              Courses
                            </span>
                          </p>
                          <p className="mt-0.5 text-[9px] text-[#A1ADAF]">
                            In this category
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEdit(category)}
                          title="Edit category"
                          className="flex h-8 w-8 items-center justify-center rounded-[10px] border border-[#E8EEEE] bg-white text-[#06424B] transition-all hover:border-[#FFAB0B] hover:bg-[#FFF8E8]"
                        >
                          <Pencil size={14} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(category)}
                          title="Delete category"
                          className="flex h-8 w-8 items-center justify-center rounded-[10px] border border-[#E8EEEE] bg-white text-[#819497] transition-all hover:border-[#F0D8D4] hover:bg-[#FFF1EF] hover:text-[#B65345]"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[20px] border border-[#E4EBEB] bg-white py-10">
              <EmptyState
                icon={BookOpen}
                title="No categories found"
                description="Try another search or create your first main category."
                action={
                  <Button onClick={openCreate}>
                    <Plus size={14} />
                    Add Category
                  </Button>
                }
              />
            </div>
          )}
        </div>

    
        {/* Create / Edit Modal */}
        <Modal
          open={modalOpen}
          onClose={() => !busy && setModalOpen(false)}
          title={
            editing
              ? "Edit Main Category"
              : "Create Main Category"
          }
          description="Set up your category details and control its visibility in the course catalogue."
        >
          <form onSubmit={handleSubmit} className="space-y-5">

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Category Name" required>
                <input
                  required
                  maxLength={100}
                  value={form.name}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      name: event.target.value,
                    })
                  }
                  placeholder="e.g. Hair & Beauty"
                  className={inputClass}
                />
              </Field>

              <Field label="Category ID">
                <input
                  maxLength={40}
                  value={form.idNumber}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      idNumber: event.target.value,
                    })
                  }
                  placeholder="e.g. BEAUTY"
                  className={inputClass}
                />
              </Field>
            </div>

            <Field label="Description">
              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm({
                    ...form,
                    description: event.target.value,
                  })
                }
                placeholder="Briefly describe this category..."
                className={textareaClass}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Display Position">
                <input
                  type="number"
                  min="1"
                  value={form.sortOrder}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      sortOrder: event.target.value,
                    })
                  }
                  className={inputClass}
                />
              </Field>

              <div className="flex flex-col justify-end">
                <label className="flex min-h-[43px] cursor-pointer items-center gap-2.5 rounded-xl border border-[#E5EBE9] bg-[#F8FAFA] px-3.5 py-2.5 text-[11px] font-semibold text-[#06424B] transition hover:border-[#FFAB0B]">
                  <input
                    type="checkbox"
                    checked={form.visible}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        visible: event.target.checked,
                      })
                    }
                    className="h-4 w-4 accent-[#06424B]"
                  />
                  Visible in catalogue
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-[#EDF1F1] pt-4">
              <Button
                variant="secondary"
                onClick={() => setModalOpen(false)}
                disabled={busy}
              >
                Cancel
              </Button>

              <Button type="submit" disabled={busy}>
                {busy ? (
                  "Saving..."
                ) : editing ? (
                  <>
                    <Pencil size={14} />
                    Save Changes
                  </>
                ) : (
                  <>
                    <Plus size={14} />
                    Create Category
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
