import { getLocalizedValue, translateValue } from "../../i18n";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Code2,
  Compass,
  Cpu,
  GraduationCap,
  Scissors,
  ShoppingCart,
  Sparkles,
  Wrench,
  Search,
  X,
  AlertCircle,
  RefreshCw,
  FolderOpen,
  ChevronRight,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Link, useLocation } from "react-router-dom";

import StudentPageHeader from "../../components/student/StudentPageHeader";
import { PageShell } from "../../components/student/ui";

import { getCategories } from "../../api/category.api";
import { getCourses } from "../../api/course.api";
import { getApiErrorMessage } from "../../utils/apiErrorHandler";
import Loader from "../../components/Loader";

/* =====================================================
   CATEGORY ICONS
===================================================== */

const getCategoryIcon = (name = "") => {
  const value = String(name?.en || getLocalizedValue(name) || "").toLowerCase();

  if (value.includes("hair")) return Scissors;
  if (value.includes("welding")) return Wrench;
  if (value.includes("cnc") || value.includes("toolmaking")) return Cpu;
  if (value.includes("esthetic") || value.includes("beauty")) return Sparkles;
  if (value.includes("it") || value.includes("technology")) return Code2;
  if (value.includes("pos") || value.includes("retail")) return ShoppingCart;
  if (value.includes("health") || value.includes("medical")) return GraduationCap;
  if (value.includes("construction") || value.includes("automotive")) return Wrench;

  return FolderOpen;
};

/* =====================================================
   CARD THEMES
===================================================== */

const cardThemes = [
  {
    header: "bg-[#06424B]",
    icon: "bg-[#FFAB0B] text-[#06424B] shadow-sm",
    category: "text-[#D5E7E5]",
    decoration: "border-white/[0.08]",
  },
  {
    header: "bg-[#52676B]",
    icon: "bg-[#FFAB0B] text-[#06424B] shadow-sm",
    category: "text-[#E3ECEB]",
    decoration: "border-white/[0.08]",
  },
];

/* =====================================================
   API RESPONSE HELPERS
===================================================== */

const getResponseData = (response) => {
  if (response?.success === false) {
    throw new Error(getLocalizedValue(response.message || "Unable to load information."));
  }

  return response?.data;
};

const extractCategories = (response) => {
  const data = getResponseData(response);

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;

  return [];
};

const extractCourses = (response) => {
  const data = getResponseData(response);

  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data)) return data;

  return [];
};

const getPageError = (error) => {
  const backend = error?.response?.data;

  if (typeof backend === "string" && backend.trim()) {
    return backend;
  }

  if (backend?.message) return backend.message;

  if (backend?.detail) {
    return typeof backend.detail === "string"
      ? backend.detail
      : translateValue("Unable to load the requested information.");
  }

  if (!error?.response && !error?.request && error?.message) {
    return error.message;
  }

  return getApiErrorMessage(error, translateValue("Something went wrong. Please try again."));
};

/* =====================================================
   CATEGORY CARD
===================================================== */

function CategoryCard({ category, index, onClick }) {
  const Icon = getCategoryIcon(category.name);
  const theme = cardThemes[index % cardThemes.length];

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex min-w-0 flex-col overflow-hidden rounded-[19px] border border-[#DCE6E3] bg-white text-left shadow-[0_3px_12px_rgba(6,66,75,0.035)] transition-all duration-300 hover:-translate-y-1 hover:border-[#C5A45D] hover:shadow-[0_12px_28px_rgba(6,66,75,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFAB0B]"
    >
      <div className={`relative overflow-hidden ${theme.header} px-5 py-5`}>
        <div className={`pointer-events-none absolute -right-7 -top-12 h-36 w-36 rounded-full border-[20px] ${theme.decoration}`} />
        <div className="pointer-events-none absolute -right-2 -bottom-14 h-28 w-28 rounded-full bg-[#FFAB0B]/10 blur-2xl" />

        <div className="relative flex items-center justify-between gap-3">
          <div className={`flex h-12 w-12 items-center justify-center rounded-[14px] border border-white/10 ${theme.icon} transition-transform duration-300 group-hover:scale-105`}>
            <Icon size={24} strokeWidth={2.1} aria-hidden="true" />
          </div>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FFAB0B] text-[#06424B] shadow-sm">
            <ArrowRight size={16} strokeWidth={2.2} aria-hidden="true" />
          </span>
        </div>

        <div className="relative mt-5">
          <p className={`text-[10px] font-bold tracking-[1.5px] ${theme.category}`}>
            {translateValue("CATEGORY")}</p>
          <h3 className="mt-1 text-xl font-extrabold tracking-tight text-white">
            {getLocalizedValue(category.name)}
          </h3>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="min-h-[48px] text-xs leading-6 text-[#718486]">
          {getLocalizedValue(category.description || "Explore the available learning paths in this category.")}
        </p>

        <div className="mt-auto flex items-center justify-between border-t border-[#EAF0EE] pt-4">
          <span className="text-[11px] font-bold text-[#527477]">{translateValue("Explore Category")}</span>
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FFAB0B] text-[#06424B] transition-transform group-hover:translate-x-1">
            <ArrowRight size={15} />
          </span>
        </div>
      </div>
    </button>
  );
}

/* =====================================================
   COURSE CARD
   The selected backend course is passed to the overview
   page through React Router state. No overview API call.
===================================================== */

function CourseCard({ course, index, categoryName, categoryPath }) {
  const theme = cardThemes[index % cardThemes.length];
  const courseName = getLocalizedValue(course.fullName || course.shortName || "Untitled course");

  return (
    <Link
      to={`/student/topics/${course.id}`}
      state={{
        course,
        categoryName,
        categoryPath,
      }}
      className="group flex min-w-0 flex-col overflow-hidden rounded-[19px] border border-[#DCE6E3] bg-white !no-underline shadow-[0_3px_12px_rgba(6,66,75,0.035)] transition-all duration-300 hover:-translate-y-1 hover:border-[#C5A45D] hover:shadow-[0_12px_28px_rgba(6,66,75,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFAB0B]"
    >
      <div className={`relative overflow-hidden ${theme.header} px-5 py-5`}>
        <div className={`pointer-events-none absolute -right-7 -top-12 h-36 w-36 rounded-full border-[20px] ${theme.decoration}`} />

        <div className="relative flex items-center justify-between gap-3">
          <div className={`flex h-12 w-12 items-center justify-center rounded-[14px] border border-white/10 ${theme.icon}`}>
            <BookOpen size={24} strokeWidth={2.1} aria-hidden="true" />
          </div>

          <span className="rounded-lg bg-[#FFAB0B] px-3 py-1.5 text-[10px] font-extrabold text-[#06424B]">
            {translateValue("AVAILABLE COURSE")}</span>
        </div>

        <div className="relative mt-5">
          <p className="text-[10px] font-bold tracking-[1.5px] text-[#D5E7E5]">{translateValue("COURSE")}</p>
          <h3 className="mt-1 text-xl font-extrabold tracking-tight text-white">
            {courseName}
          </h3>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="min-h-[48px] text-xs leading-6 text-[#718486]">
          {getLocalizedValue(course.summary || "Open this course to review its overview.")}
        </p>

        <div className="mt-auto flex items-center justify-between rounded-xl bg-[#FFAB0B] px-4 py-3 text-[#06424B] transition group-hover:bg-[#FFC13C]">
          <span className="text-xs font-extrabold">{translateValue("View Course Overview")}</span>
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#06424B] text-[#FFAB0B] transition-transform group-hover:translate-x-1">
            <ArrowRight size={15} />
          </span>
        </div>
      </div>
    </Link>
  );
}

/* =====================================================
   LOADING, ERROR AND EMPTY STATES
===================================================== */

function LoadingState() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {[1, 2, 3].map((item) => (
        <div key={item} className="overflow-hidden rounded-[19px] border border-[#DCE6E3] bg-white">
          <div className="h-[155px] animate-pulse bg-[#E8EFED]" />
          <div className="space-y-4 p-5">
            <div className="h-4 w-3/4 animate-pulse rounded bg-[#E8EFED]" />
            <div className="h-3 w-full animate-pulse rounded bg-[#EEF3F3]" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-[#EEF3F3]" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="rounded-[19px] border border-red-200 bg-white px-6 py-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500">
        <AlertCircle size={23} />
      </div>
      <h3 className="mt-4 text-base font-extrabold text-[#06424B]">
        {translateValue("Unable to load information")}</h3>
      <p className="mx-auto mt-2 max-w-[450px] text-sm leading-6 text-[#718486]">
        {getLocalizedValue(message)}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#FFAB0B] px-5 py-3 text-xs font-extrabold text-[#06424B] transition hover:bg-[#FFC13C]"
      >
        <RefreshCw size={14} />
        {translateValue("Try Again")}</button>
    </div>
  );
}

function EmptyState({ searchTerm, onClear }) {
  return (
    <div className="rounded-[19px] border border-dashed border-[#C9DAD8] bg-white px-6 py-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF3F2] text-[#06424B]">
        <Search size={22} />
      </div>
      <h3 className="mt-4 text-base font-extrabold text-[#06424B]">
        {translateValue(searchTerm ? "No matching results" : "Nothing available yet")}
      </h3>
      <p className="mt-1 text-sm text-[#718486]">
        {translateValue(searchTerm
          ? "Try another search term."
          : "No subcategories or courses are available in this category yet.")}
      </p>
      {searchTerm && (
        <button
          type="button"
          onClick={onClear}
          className="mt-4 rounded-lg bg-[#FFAB0B] px-4 py-2.5 text-xs font-extrabold text-[#06424B]"
        >
          {translateValue("Clear Search")}</button>
      )}
    </div>
  );
}

/* =====================================================
   MAIN EXPLORE TOPICS
===================================================== */

function ExploreTopics() {
  const location = useLocation();
  const [categoryPath, setCategoryPath] = useState([]);
  const [visibleCategories, setVisibleCategories] = useState([]);
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [, refreshDynamicTranslations] = useState(0);

  // Course data is fetched from the API in its original form. When the
  // background translation service fills the dynamic cache, re-render these
  // cards so their fullName/shortName/summary values are read again in French.
  useEffect(() => {
    const handleDynamicTranslationsUpdated = () => {
      refreshDynamicTranslations((current) => current + 1);
    };

    window.addEventListener(
      "skillnext-dynamic-translations-updated",
      handleDynamicTranslationsUpdated,
    );

    return () => {
      window.removeEventListener(
        "skillnext-dynamic-translations-updated",
        handleDynamicTranslationsUpdated,
      );
    };
  }, []);

  // Ignore responses from an earlier category selection.
  const requestId = useRef(0);

  /* ---------------------------------------------------
     LOAD ROOT CATEGORIES
  --------------------------------------------------- */

  const loadRootCategories = useCallback(async () => {
    const currentRequest = ++requestId.current;

    setCategoryPath([]);
    setSearchTerm("");
    setError("");
    setIsLoading(true);
    setCourses([]);

    try {
      const response = await getCategories({ topLevel: true });
      if (currentRequest !== requestId.current) return;

      const items = extractCategories(response);
      setVisibleCategories(items.filter((item) => item.visible !== false));
    } catch (err) {
      if (currentRequest !== requestId.current) return;
      console.error("Root Categories Error:", err);
      setError(getPageError(err));
    } finally {
      if (currentRequest === requestId.current) setIsLoading(false);
    }
  }, []);

  /* ---------------------------------------------------
     LOAD SELECTED CATEGORY: CHILDREN + DIRECT COURSES
  --------------------------------------------------- */


  const loadCategoryContents = useCallback(async (category, nextPath) => {
    const currentRequest = ++requestId.current;

    setCategoryPath(nextPath);
    setSearchTerm("");
    setError("");
    setIsLoading(true);

    // Clear previous courses while loading the selected category.
    setCourses([]);

    try {
      const [categoryResponse, courseResponse] = await Promise.all([
        getCategories({ parentId: category.id }),
        getCourses({
          categoryId: category.id,
          includeSubcategories: false,
          page: 1,
          pageSize: 100,
        }),
      ]);

      if (currentRequest !== requestId.current) return;

      const childCategories = extractCategories(categoryResponse).filter(
        (item) => item.visible !== false
      );

      const directCourses = extractCourses(courseResponse).filter(
        (item) => item.visible !== false
      );

      setVisibleCategories(childCategories);

      // Show courses only at the last category level.
      setCourses(
        childCategories.length === 0 ? directCourses : []
      );
    } catch (err) {
      if (currentRequest !== requestId.current) return;

      console.error("Category Contents Error:", err);
      setError(getPageError(err));
    } finally {
      if (currentRequest === requestId.current) {
        setIsLoading(false);
      }
    }
  }, []);

  /* ---------------------------------------------------
     INITIAL LOAD / RESTORE LAST CATEGORY LEVEL
  --------------------------------------------------- */

  useEffect(() => {
    const restorePath = location.state?.restoreCategoryPath;

    if (Array.isArray(restorePath) && restorePath.length > 0) {
      const lastCategory = restorePath[restorePath.length - 1];
      loadCategoryContents(lastCategory, restorePath);
    } else {
      loadRootCategories();
    }

    return () => {
      requestId.current += 1;
    };
  }, [location.key, location.state, loadRootCategories, loadCategoryContents]);

  /* ---------------------------------------------------
     CATEGORY NAVIGATION
  --------------------------------------------------- */

  const handleCategoryClick = (category) => {
    loadCategoryContents(category, [...categoryPath, category]);
  };

  const handleBack = () => {
    if (categoryPath.length <= 1) {
      loadRootCategories();
      return;
    }

    const previousPath = categoryPath.slice(0, -1);
    loadCategoryContents(previousPath[previousPath.length - 1], previousPath);
  };

  const handleBreadcrumbClick = (index) => {
    if (index === -1) {
      loadRootCategories();
      return;
    }

    const nextPath = categoryPath.slice(0, index + 1);
    loadCategoryContents(nextPath[nextPath.length - 1], nextPath);
  };

  /* ---------------------------------------------------
     CURRENT-LEVEL SEARCH
  --------------------------------------------------- */

  const filteredCategories = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return visibleCategories;

    return visibleCategories.filter((category) =>
      [category.name, getLocalizedValue(category.name), category.description, getLocalizedValue(category.description), category.idNumber]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [visibleCategories, searchTerm]);

  const filteredCourses = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return courses;

    return courses.filter((course) =>
      [course.fullName, getLocalizedValue(course.fullName), course.shortName, getLocalizedValue(course.shortName), course.summary, getLocalizedValue(course.summary)]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [courses, searchTerm]);

  const hasResults = filteredCategories.length > 0 || filteredCourses.length > 0;
  const currentCategory = categoryPath[categoryPath.length - 1];

  /* ---------------------------------------------------
     RENDER
  --------------------------------------------------- */

  return (
    <PageShell>
      <div className="mx-auto w-full max-w-[1250px]">
        <StudentPageHeader
          title={translateValue("Explore Topics")}
          subtitle={translateValue("Discover career-focused courses, explore the curriculum and build practical skills.")}
        />

        {/* HERO */}
        <section className="relative mt-5 overflow-hidden rounded-[22px] bg-[#06424B] shadow-[0_8px_25px_rgba(6,66,75,0.10)]">
          <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full border-[32px] border-white/[0.045]" />
          <div className="pointer-events-none absolute -right-4 -top-12 h-40 w-40 rounded-full border border-[#FFAB0B]/20" />
          <div className="pointer-events-none absolute -bottom-20 right-[30%] h-44 w-44 rounded-full bg-[#FFAB0B]/[0.07] blur-3xl" />

          <div className="relative z-10 flex flex-col items-start justify-between gap-6 px-6 py-7 sm:px-8 sm:py-8 lg:flex-row lg:items-center lg:px-10">
            <div className="max-w-[650px]">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#FFAB0B]/30 bg-[#FFAB0B]/10 px-3 py-1.5 text-[10px] font-bold tracking-[1.4px] text-[#FFCB65]">
                <Sparkles size={13} />
                {translateValue("EXPLORE YOUR NEXT SKILL")}</div>
              <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-3xl lg:text-[36px]">
                {translateValue("What would you like")}{" "}<span className="text-[#FFAB0B]">{translateValue("to learn?")}</span>
              </h1>
              <p className="mt-3 max-w-[570px] text-xs leading-6 text-white/70 sm:text-sm sm:leading-7">
                {translateValue("Start with a category, discover its learning paths and choose the course you want to explore.")}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-[#063B43] px-3 py-2 text-[11px] font-semibold text-white">
                  <BookOpen size={14} className="text-[#FFAB0B]" /> {translateValue("Structured Lessons")}</span>
                <span className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-[#063B43] px-3 py-2 text-[11px] font-semibold text-white">
                  <Code2 size={14} className="text-[#FFAB0B]" /> {translateValue("Practical Learning")}</span>
                <span className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-[#063B43] px-3 py-2 text-[11px] font-semibold text-white">
                  <GraduationCap size={14} className="text-[#FFAB0B]" /> {translateValue("Topic Quizzes & Final Assessment")}</span>
              </div>
            </div>

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

        {/* BREADCRUMB + SECTION TITLE */}
        <section className="mt-7">
          <div className="mb-5">
            <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleBreadcrumbClick(-1)}
                className={`font-bold transition ${categoryPath.length === 0
                  ? "text-[#06424B]"
                  : "text-[#829596] hover:text-[#06424B]"
                  }`}
              >
                {translateValue("All Categories")}</button>

              {categoryPath.map((category, index) => (
                <div key={category.id} className="flex items-center gap-2">
                  <ChevronRight size={14} className="text-[#A4B2B2]" />
                  <button
                    type="button"
                    onClick={() => handleBreadcrumbClick(index)}
                    className={`font-bold transition ${index === categoryPath.length - 1
                      ? "text-[#06424B]"
                      : "text-[#829596] hover:text-[#06424B]"
                      }`}
                  >
                    {getLocalizedValue(category.name)}
                  </button>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                {categoryPath.length > 0 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    aria-label={translateValue("Go back to previous category")}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#DCE7E5] bg-white text-[#06424B] transition hover:bg-[#EEF3F3]"
                  >
                    <ArrowLeft size={17} />
                  </button>
                )}
                <div>
                  <h2 className="text-lg font-extrabold tracking-tight text-[#06424B]">
                    {getLocalizedValue(currentCategory?.name || "Explore Categories")}
                  </h2>
                  <p className="mt-1 text-xs text-[#829596]">
                    {translateValue(currentCategory
                      ? "Explore subcategories and available courses."
                      : "Choose a category to discover its learning paths.")}
                  </p>
                </div>
              </div>

              <span className="rounded-lg border border-[#DCE7E5] bg-white px-3 py-2 text-[10px] font-bold text-[#527477]">
                {isLoading
                  ? translateValue("LOADING...")
                  : translateValue("{{count}} RESULTS", { count: filteredCategories.length + filteredCourses.length })}
              </span>
            </div>

            {currentCategory?.description && (
              <p className="mt-3 max-w-[800px] text-xs leading-6 text-[#718486]">
                {getLocalizedValue(currentCategory.description)}
              </p>
            )}
          </div>

          {/* SEARCH */}
          <div className="mb-5">
            <div className="relative">
              <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#829596]" />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={translateValue(currentCategory ? "Search subcategories or courses..." : "Search main categories...")}
                aria-label={translateValue("Search categories and courses")}
                className="h-12 w-full rounded-xl border border-[#DCE7E5] bg-white pl-11 pr-11 text-sm text-[#29494D] shadow-[0_2px_8px_rgba(6,66,75,0.035)] outline-none transition placeholder:text-[#9AA9AA] focus:border-[#06424B] focus:ring-2 focus:ring-[#06424B]/10"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  aria-label={translateValue("Clear search")}
                  className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-[#829596] transition hover:bg-[#EEF3F3] hover:text-[#06424B]"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>

          {isLoading && <LoadingState />}

          {error && (
            <ErrorState
              message={error}
              onRetry={() =>
                currentCategory
                  ? loadCategoryContents(currentCategory, categoryPath)
                  : loadRootCategories()
              }
            />
          )}

          {!error && hasResults && (
            <div className="space-y-8">
              {filteredCategories.length > 0 && (
                <div>
                  <div className="mb-4 flex items-center gap-2">
                    <FolderOpen size={17} className="text-[#B88736]" />
                    <h3 className="text-sm font-extrabold text-[#06424B]">
                      {translateValue(categoryPath.length === 0 ? "Main Categories" : "Subcategories")}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {filteredCategories.map((category, index) => (
                      <CategoryCard
                        key={category.id}
                        category={category}
                        index={index}
                        onClick={() => handleCategoryClick(category)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {filteredCourses.length > 0 && (
                <div>
                  <div className="mb-4 flex items-center gap-2">
                    <BookOpen size={17} className="text-[#B88736]" />
                    <h3 className="text-sm font-extrabold text-[#06424B]">{translateValue("Courses")}</h3>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {filteredCourses.map((course, index) => (
                      <CourseCard
                        key={course.id}
                        course={course}
                        index={index}
                        categoryName={currentCategory?.name || ""}
                        categoryPath={categoryPath}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {!isLoading && !error && !hasResults && (
            <EmptyState
              searchTerm={searchTerm}
              onClear={() => setSearchTerm("")}
            />
          )}
        </section>

        {/* FOOTER */}
        <div className="mt-6 flex items-center justify-center gap-2 border-t border-[#DCE6E3] py-4">
          <Sparkles size={13} className="text-[#B88736]" />
          <p className="text-[10px] font-medium text-[#829596]">
            {translateValue("Skill Next · Every skill starts with curiosity.")}</p>
        </div>
      </div>
      <Loader
        open={isLoading}
        blur={true}
        text={
          translateValue(currentCategory
            ? "Loading courses..."
            : "Loading categories...")
        }
      />
    </PageShell>
  );
}

export default ExploreTopics;
