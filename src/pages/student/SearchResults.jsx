
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  Search,
  FolderOpen,
  BookOpen,
  ArrowUpRight,
  ChevronRight,
  Loader2,
  SearchX,
  RefreshCw,
} from "lucide-react";

import { translateValue } from "../../i18n";
import StudentPageHeader from "../../components/student/StudentPageHeader";
import { searchGlobal } from "../../api/search.api";

/* --------------------------------------------------
   HELPERS
-------------------------------------------------- */

const getCategoryId = (item) =>
  item?.id ?? item?.categoryId ?? item?.category_id;

const getCourseId = (item) =>
  item?.id ?? item?.courseId ?? item?.course_id;

const getCategoryName = (item) =>
  item?.name ?? item?.categoryName ?? "Untitled Category";

const getCourseName = (item) =>
  item?.fullName ??
  item?.fullname ??
  item?.name ??
  item?.shortName ??
  "Untitled Course";

/* --------------------------------------------------
   SEARCH RESULTS
-------------------------------------------------- */

function SearchResults() {
  const { t } = useTranslation("ui");

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const query = searchParams.get("q") || "";

  const [searchText, setSearchText] = useState(query);
  const [activeFilter, setActiveFilter] = useState("all");

  const [categories, setCategories] = useState([]);
  const [courses, setCourses] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  /* --------------------------------------------------
     API
  -------------------------------------------------- */

  const fetchSearchResults = useCallback(async () => {
    if (!query.trim()) {
      setCategories([]);
      setCourses([]);
      setSearched(false);
      setError("");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await searchGlobal({
        q: query,
        type: activeFilter,
        limit: 10,
      });

      if (response?.success === false) {
        throw new Error(
          response?.message || "Unable to load search results."
        );
      }

      const result = response?.data ?? response;

      setCategories(
        Array.isArray(result?.categories)
          ? result.categories
          : []
      );

      setCourses(
        Array.isArray(result?.courses)
          ? result.courses
          : []
      );

      setSearched(true);
    } catch (err) {
      console.error("Global Search Error:", err);

      setCategories([]);
      setCourses([]);
      setSearched(false);

      setError(
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [query, activeFilter]);

  useEffect(() => {
    setSearchText(query);
  }, [query]);

  useEffect(() => {
    fetchSearchResults();
  }, [fetchSearchResults]);

  /* --------------------------------------------------
     SEARCH SUBMIT
  -------------------------------------------------- */

  const handleSearch = (e) => {
    e.preventDefault();

    const value = searchText.trim();

    if (!value) return;

    setActiveFilter("all");
    setSearchParams({ q: value });
  };

  /* --------------------------------------------------
     CATEGORY NAVIGATION
  -------------------------------------------------- */

  const handleCategoryClick = (category) => {
    const categoryId = getCategoryId(category);

    if (!categoryId) {
      navigate("/student/topics");
      return;
    }

    navigate(
      `/student/topics?category=${encodeURIComponent(categoryId)}`
    );
  };

  /* --------------------------------------------------
     COURSE NAVIGATION
  -------------------------------------------------- */

  const handleCourseClick = (course) => {
    const courseId = getCourseId(course);

    if (!courseId) return;

    const slug =
      course.technologySlug ||
      course.technology_slug ||
      course.slug ||
      course.shortName ||
      course.short_name ||
      courseId;

    navigate(
      `/student/topics/${encodeURIComponent(slug)}`
    );
  };

  const totalResults = categories.length + courses.length;

  const filters = [
    { label: "All Results", value: "all" },
    { label: "Categories", value: "category" },
    { label: "Courses", value: "course" },
  ];

  /* --------------------------------------------------
     UI
  -------------------------------------------------- */

  return (
    <div className="min-h-screen bg-[#F4F7F7] px-3 py-4 sm:px-5 lg:px-7">

      <div className="mx-auto w-full max-w-[1500px]">

        {/* HEADER */}

        <StudentPageHeader
          title="Search Results"
          subtitle="Discover courses and categories across Skill Next."
        />

        {/* SEARCH HERO */}

        <section className="mb-6 overflow-hidden rounded-2xl border border-[#DDE8E7] bg-white shadow-sm">

          <div className="bg-[#06424B] px-5 py-6 sm:px-8 sm:py-8">

            <p className="mb-2 text-xs font-bold uppercase tracking-[1.5px] text-[#FFAB0B]">
              SKILL NEXT LEARNING
            </p>

            <h2 className="text-xl font-bold text-white sm:text-2xl">
              {t("Find what you want to learn")}
            </h2>

            <p className="mt-2 text-sm text-[#D5E5E4]">
              {t("Search across courses and categories in one place.")}
            </p>

            <form
              onSubmit={handleSearch}
              role="search"
              className="mt-5 flex flex-col gap-2 rounded-xl bg-white p-2 shadow-lg sm:flex-row sm:items-center"
            >

              <div className="flex min-w-0 flex-1 items-center gap-3 px-2">

                <Search
                  size={21}
                  className="shrink-0 text-[#06424B]"
                />

                <input
                  type="search"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder={t("Search courses, categories...")}
                  aria-label={t("Search courses and categories")}
                  autoComplete="off"
                  className="h-11 min-w-0 flex-1 bg-transparent text-sm text-[#26464A] outline-none placeholder:text-[#91A5A7]"
                />

              </div>

              <button
                type="submit"
                disabled={!searchText.trim()}
                className="flex h-11 items-center justify-center gap-2 rounded-lg bg-[#FFAB0B] px-6 text-sm font-bold text-[#263D40] transition hover:bg-[#F5A000] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Search size={17} />
                {t("Search")}
              </button>

            </form>
          </div>

          {/* FILTERS */}

          <div className="flex flex-wrap items-center gap-2 border-b border-[#E8EEEE] px-4 py-4 sm:px-6">

            <span className="mr-2 text-xs font-semibold text-[#718487]">
              {t("Filter")}:
            </span>

            {filters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setActiveFilter(filter.value)}
                aria-pressed={activeFilter === filter.value}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                  activeFilter === filter.value
                    ? "bg-[#06424B] text-white shadow-sm"
                    : "border border-[#DDE8E7] bg-white text-[#547074] hover:bg-[#EEF3F4]"
                }`}
              >
                {t(filter.label)}
              </button>
            ))}

          </div>
        </section>

        {/* RESULTS SUMMARY */}

        {!loading && !error && searched && (
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2">

            <div>
              <h2 className="text-base font-bold text-[#06424B] sm:text-lg">
                {t("Search Results")}
              </h2>

              <p className="mt-1 text-xs text-[#718487]">
                {t("Showing results for")}{" "}
                <span className="font-semibold text-[#06424B]">
                  "{query}"
                </span>
              </p>
            </div>

            <span className="rounded-full bg-[#E6F0EF] px-3 py-1.5 text-xs font-bold text-[#06424B]">
              {totalResults} {t("results found")}
            </span>

          </div>
        )}

        {/* LOADING */}

        {loading && (
          <div
            className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-[#DDE8E7] bg-white"
            role="status"
            aria-live="polite"
          >
            <Loader2
              size={34}
              className="animate-spin text-[#06424B]"
            />

            <p className="mt-4 text-sm font-semibold text-[#06424B]">
              {t("Searching...")}
            </p>

            <p className="mt-1 text-xs text-[#819496]">
              {t("Finding matching courses and categories.")}
            </p>
          </div>
        )}

        {/* ERROR */}

        {!loading && error && (
          <div
            className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-red-100 bg-white px-5 text-center"
            role="alert"
          >
            <SearchX size={38} className="text-red-400" />

            <h3 className="mt-4 font-bold text-[#06424B]">
              {t("Search failed")}
            </h3>

            <p className="mt-2 max-w-md text-sm text-[#718487]">
              {translateValue(error)}
            </p>

            <button
              type="button"
              onClick={fetchSearchResults}
              className="mt-5 flex items-center gap-2 rounded-lg bg-[#06424B] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0A5963]"
            >
              <RefreshCw size={15} />
              {t("Try Again")}
            </button>
          </div>
        )}

        {/* RESULTS */}

        {!loading && !error && searched && (
          <div className="space-y-7">

            {/* CATEGORIES */}

            {(activeFilter === "all" ||
              activeFilter === "category") &&
              categories.length > 0 && (
                <section>

                  <div className="mb-4 flex items-center justify-between">

                    <div className="flex items-center gap-2">

                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E6F0EF]">
                        <FolderOpen
                          size={19}
                          className="text-[#06424B]"
                        />
                      </div>

                      <div>
                        <h3 className="font-bold text-[#06424B]">
                          {t("Categories")}
                        </h3>

                        <p className="text-xs text-[#819496]">
                          {t("Browse matching learning categories")}
                        </p>
                      </div>

                    </div>

                    <span className="text-xs font-semibold text-[#718487]">
                      {categories.length} {t("found")}
                    </span>

                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">

                    {categories.map((category, index) => {
                      const categoryId = getCategoryId(category);

                      return (
                        <button
                          key={categoryId ?? `category-${index}`}
                          type="button"
                          onClick={() => handleCategoryClick(category)}
                          className="group flex w-full items-center gap-4 rounded-2xl border border-[#DDE8E7] bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#A7C6C1] hover:shadow-md"
                        >

                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#EEF3F4] transition group-hover:bg-[#DDEBE9]">
                            <FolderOpen
                              size={23}
                              className="text-[#06424B]"
                            />
                          </div>

                          <div className="min-w-0 flex-1">

                            <h4 className="truncate text-sm font-bold text-[#06424B]">
                              {translateValue(getCategoryName(category))}
                            </h4>

                            <p className="mt-1 text-xs text-[#819496]">
                              {category.courseCount ??
                                category.course_count ??
                                0}{" "}
                              {t("courses")}
                            </p>

                            {(category.parentName ||
                              category.parent_name) && (
                              <p className="mt-1 truncate text-[11px] text-[#819496]">
                                {translateValue(
                                  category.parentName ||
                                  category.parent_name
                                )}
                              </p>
                            )}

                          </div>

                          <ArrowUpRight
                            size={18}
                            className="shrink-0 text-[#819496] transition group-hover:text-[#06424B]"
                          />

                        </button>
                      );
                    })}

                  </div>
                </section>
              )}

            {/* COURSES */}

            {(activeFilter === "all" ||
              activeFilter === "course") &&
              courses.length > 0 && (
                <section>

                  <div className="mb-4 flex items-center justify-between">

                    <div className="flex items-center gap-2">

                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFF3D8]">
                        <BookOpen
                          size={19}
                          className="text-[#946200]"
                        />
                      </div>

                      <div>
                        <h3 className="font-bold text-[#06424B]">
                          {t("Courses")}
                        </h3>

                        <p className="text-xs text-[#819496]">
                          {t("Explore matching learning courses")}
                        </p>
                      </div>

                    </div>

                    <span className="text-xs font-semibold text-[#718487]">
                      {courses.length} {t("found")}
                    </span>

                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">

                    {courses.map((course, index) => {
                      const courseId = getCourseId(course);

                      return (
                        <button
                          key={courseId ?? `course-${index}`}
                          type="button"
                          onClick={() => handleCourseClick(course)}
                          disabled={!courseId}
                          className="group flex w-full flex-col rounded-2xl border border-[#DDE8E7] bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#A7C6C1] hover:shadow-md disabled:cursor-not-allowed"
                        >

                          <div className="flex w-full items-start justify-between gap-3">

                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EEF3F4]">
                              <BookOpen
                                size={22}
                                className="text-[#06424B]"
                              />
                            </div>

                            <ChevronRight
                              size={20}
                              className="text-[#819496] transition group-hover:translate-x-1 group-hover:text-[#06424B]"
                            />

                          </div>

                          <h4 className="mt-4 line-clamp-2 text-sm font-bold leading-6 text-[#06424B]">
                            {translateValue(getCourseName(course))}
                          </h4>

                          <p className="mt-2 line-clamp-3 min-h-[54px] text-xs leading-5 text-[#718487]">
                            {translateValue(
                              course.summary ||
                              course.description ||
                              "Explore this course and discover its learning content."
                            )}
                          </p>

                          <div className="mt-4 flex w-full items-center justify-between gap-2 border-t border-[#EDF1F1] pt-3">

                            <span className="truncate rounded-full bg-[#EEF3F4] px-3 py-1 text-[11px] font-semibold text-[#547074]">
                              {translateValue(
                                course.categoryName ||
                                course.category_name ||
                                "Learning Course"
                              )}
                            </span>

                            <span className="shrink-0 text-xs font-bold text-[#06424B]">
                              {t("View Course")} →
                            </span>

                          </div>

                        </button>
                      );
                    })}

                  </div>
                </section>
              )}

            {/* NO RESULTS */}

            {totalResults === 0 && (
              <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-[#DDE8E7] bg-white px-5 text-center">

                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EEF3F4]">
                  <SearchX
                    size={30}
                    className="text-[#819496]"
                  />
                </div>

                <h3 className="mt-5 text-lg font-bold text-[#06424B]">
                  {t("No results found")}
                </h3>

                <p className="mt-2 max-w-md text-sm leading-6 text-[#819496]">
                  {t("We couldn't find anything matching")}{" "}
                  "{query}".{" "}
                  {t("Try another keyword or search for a different course.")}
                </p>

                <button
                  type="button"
                  onClick={() => navigate("/student/topics")}
                  className="mt-5 rounded-xl bg-[#06424B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0A5963]"
                >
                  {t("Explore Topics")}
                </button>

              </div>
            )}

          </div>
        )}

        {/* INITIAL STATE */}

        {!query.trim() && !loading && (
          <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-[#DDE8E7] bg-white px-5 text-center">

            <Search
              size={42}
              className="text-[#A0B5B5]"
            />

            <h3 className="mt-4 font-bold text-[#06424B]">
              {t("Start your search")}
            </h3>

            <p className="mt-2 text-sm text-[#819496]">
              {t("Enter a course or category name to find what you need.")}
            </p>

          </div>
        )}

      </div>
    </div>
  );
}

export default SearchResults;
