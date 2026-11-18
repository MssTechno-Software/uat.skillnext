
import { useMemo, useState } from "react";
import {
  Search,
  Users,
  UserCheck,
  Mail,
  BookOpen,
  UserPlus,
  X,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  MoreHorizontal,
  Eye,
  Trash2,
  RefreshCw,
  GraduationCap,
  CalendarDays,
  Layers,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ArrowUpRight,
  Plus,
  UsersRound,
  ShieldCheck,
  Clock3,
  SearchX,
} from "lucide-react";
import TeacherLayout from "./TeacherLayout";

/* =====================================================
   MOCK DATA
===================================================== */

const INITIAL_STUDENTS = [
  {
    id: "STU001",
    name: "Kiran Reddy",
    email: "kiran@example.com",
    phone: "+91 9876543210",
    status: "Active",
    joined: "2026-09-12",
  },
  {
    id: "STU002",
    name: "Rahul Kumar",
    email: "rahul@example.com",
    phone: "+91 9876543211",
    status: "Active",
    joined: "2026-09-15",
  },
  {
    id: "STU003",
    name: "Sneha Rao",
    email: "sneha@example.com",
    phone: "+91 9876543212",
    status: "Active",
    joined: "2026-09-18",
  },
  {
    id: "STU004",
    name: "Arjun Varma",
    email: "arjun@example.com",
    phone: "+91 9876543213",
    status: "Inactive",
    joined: "2026-09-20",
  },
  {
    id: "STU005",
    name: "Priya Sharma",
    email: "priya@example.com",
    phone: "+91 9876543214",
    status: "Active",
    joined: "2026-09-22",
  },
  {
    id: "STU006",
    name: "Vamsi Krishna",
    email: "vamsi@example.com",
    phone: "+91 9876543215",
    status: "Active",
    joined: "2026-09-25",
  },
  {
    id: "STU007",
    name: "Ananya Reddy",
    email: "ananya@example.com",
    phone: "+91 9876543216",
    status: "Active",
    joined: "2026-10-02",
  },
  {
    id: "STU008",
    name: "Sai Teja",
    email: "sai@example.com",
    phone: "+91 9876543217",
    status: "Inactive",
    joined: "2026-10-05",
  },
  {
    id: "STU009",
    name: "Divya Sri",
    email: "divya@example.com",
    phone: "+91 9876543218",
    status: "Active",
    joined: "2026-10-09",
  },
  {
    id: "STU010",
    name: "Rohit Kumar",
    email: "rohit@example.com",
    phone: "+91 9876543219",
    status: "Active",
    joined: "2026-10-12",
  },
];

const INITIAL_COURSES = [
  {
    id: "CRS001",
    name: "Full Stack Web Development",
    category: "Development",
    modules: 12,
    lessons: 36,
    assignments: 8,
    status: "Published",
  },
  {
    id: "CRS002",
    name: "React JS Masterclass",
    category: "Frontend",
    modules: 8,
    lessons: 24,
    assignments: 6,
    status: "Published",
  },
  {
    id: "CRS003",
    name: "HTML & CSS Fundamentals",
    category: "Frontend",
    modules: 6,
    lessons: 18,
    assignments: 4,
    status: "Published",
  },
  {
    id: "CRS004",
    name: "Python Programming",
    category: "Programming",
    modules: 10,
    lessons: 30,
    assignments: 5,
    status: "Published",
  },
  {
    id: "CRS005",
    name: "UI/UX Design",
    category: "Design",
    modules: 7,
    lessons: 21,
    assignments: 5,
    status: "Draft",
  },
];

const INITIAL_ENROLLMENTS = [
  {
    id: 1,
    studentId: "STU001",
    courseId: "CRS001",
    enrolledAt: "2026-10-10",
    status: "Active",
  },
  {
    id: 2,
    studentId: "STU001",
    courseId: "CRS002",
    enrolledAt: "2026-10-12",
    status: "Active",
  },
  {
    id: 3,
    studentId: "STU002",
    courseId: "CRS001",
    enrolledAt: "2026-10-14",
    status: "Active",
  },
  {
    id: 4,
    studentId: "STU003",
    courseId: "CRS003",
    enrolledAt: "2026-10-16",
    status: "Active",
  },
  {
    id: 5,
    studentId: "STU004",
    courseId: "CRS002",
    enrolledAt: "2026-10-18",
    status: "Inactive",
  },
  {
    id: 6,
    studentId: "STU005",
    courseId: "CRS004",
    enrolledAt: "2026-10-20",
    status: "Active",
  },
  {
    id: 7,
    studentId: "STU006",
    courseId: "CRS001",
    enrolledAt: "2026-10-22",
    status: "Active",
  },
  {
    id: 8,
    studentId: "STU007",
    courseId: "CRS002",
    enrolledAt: "2026-10-24",
    status: "Active",
  },
  {
    id: 9,
    studentId: "STU009",
    courseId: "CRS003",
    enrolledAt: "2026-10-26",
    status: "Active",
  },
];

/* =====================================================
   DESIGN CONSTANTS
===================================================== */

const TEAL = "#06424B";
const GOLD = "#FFAB0B";

const formatDate = (date) =>
  date
    ? new Date(date + "T00:00:00").toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const getInitials = (name = "") =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

/* =====================================================
   REUSABLE UI COMPONENTS
===================================================== */

function StatCard({ title, value, subtitle, icon: Icon, color }) {
  return (
    <div className="rounded-2xl border border-[#E5ECEC] bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-medium text-[#89999B]">
            {title}
          </p>
          <h3 className="mt-2 text-[27px] font-extrabold tracking-tight text-[#17464D]">
            {value}
          </h3>
          <p className="mt-1 text-[10px] text-[#91A1A3]">
            {subtitle}
          </p>
        </div>

        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl"
          style={{ backgroundColor: color + "15", color }}
        >
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const active = status === "Active";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${
        active
          ? "bg-[#EAF5EF] text-[#398064]"
          : "bg-[#F0F2F3] text-[#879497]"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active ? "bg-[#43A47C]" : "bg-[#A9B3B5]"
        }`}
      />
      {status}
    </span>
  );
}

function Avatar({ name, size = "md" }) {
  const colors = [
    "bg-[#E8F0EE] text-[#06424B]",
    "bg-[#FFF2D9] text-[#A16C08]",
    "bg-[#EAEFFA] text-[#566A9B]",
    "bg-[#F5EAF0] text-[#A05C7A]",
  ];

  const index = name.length % colors.length;

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-xl font-extrabold ${
        colors[index]
      } ${size === "lg" ? "h-14 w-14 text-base" : "h-10 w-10 text-[11px]"}`}
    >
      {getInitials(name)}
    </div>
  );
}

function Modal({ open, onClose, title, description, children, width = "max-w-lg" }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#102F34]/55 p-4 backdrop-blur-[5px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className={`my-auto w-full ${width} overflow-hidden rounded-[22px] border border-[#E5ECEC] bg-white shadow-[0_24px_80px_rgba(0,0,0,0.18)]`}
      >
        <div className="flex items-start justify-between border-b border-[#EDF1F1] px-5 py-5 sm:px-6">
          <div>
            <h2 className="text-[16px] font-extrabold text-[#17464D]">
              {title}
            </h2>
            {description && (
              <p className="mt-1.5 text-[11px] leading-5 text-[#8B9B9D]">
                {description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="ml-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#819395] transition hover:bg-[#F1F5F5] hover:text-[#17464D]"
          >
            <X size={17} />
          </button>
        </div>

        <div className="max-h-[75vh] overflow-y-auto p-5 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

function ActionButton({ children, variant = "primary", ...props }) {
  const styles = {
    primary:
      "bg-[#06424B] text-white hover:bg-[#0A5963] shadow-sm",
    secondary:
      "border border-[#DDE7E7] bg-white text-[#527176] hover:bg-[#F5F8F8]",
    gold:
      "bg-[#FFAB0B] text-[#173E43] hover:bg-[#F5A000] shadow-sm",
    danger:
      "bg-[#FFF1EF] text-[#B65345] hover:bg-[#FFE6E2]",
  };

  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[11px] font-bold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${props.className || ""}`}
    >
      {children}
    </button>
  );
}

/* =====================================================
   MAIN COMPONENT
===================================================== */

export default function StudentManagement() {
  const [students] = useState(INITIAL_STUDENTS);
  const [courses] = useState(INITIAL_COURSES);
  const [enrollments, setEnrollments] = useState(INITIAL_ENROLLMENTS);

  const [activeTab, setActiveTab] = useState("students");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [courseFilter, setCourseFilter] = useState("All");
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const [modal, setModal] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [profileStudent, setProfileStudent] = useState(null);
  const [pendingRemoval, setPendingRemoval] = useState(null);
  const [successData, setSuccessData] = useState(null);
  const [toast, setToast] = useState("");

  const [enrollmentSearch, setEnrollmentSearch] = useState("");

  /* ------------------------------
     DERIVED DATA
  ------------------------------ */

  const activeStudents = students.filter(
    (student) => student.status === "Active"
  );

  const activeEnrollments = enrollments.filter(
    (item) => item.status === "Active"
  );

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const searchText = [
        student.name,
        student.email,
        student.id,
        student.phone,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchText.includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || student.status === statusFilter;

      const matchesCourse =
        courseFilter === "All" ||
        enrollments.some(
          (item) =>
            item.studentId === student.id &&
            item.courseId === courseFilter &&
            item.status === "Active"
        );

      return matchesSearch && matchesStatus && matchesCourse;
    });
  }, [students, search, statusFilter, courseFilter, enrollments]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredStudents.length / pageSize)
  );

  const paginatedStudents = filteredStudents.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const selectedStudents = students.filter((student) =>
    selected.includes(student.id)
  );

  const courseEnrollments = useMemo(() => {
    return enrollments.filter((record) => {
      const student = students.find(
        (item) => item.id === record.studentId
      );

      const course = courses.find(
        (item) => item.id === record.courseId
      );

      const query = enrollmentSearch.toLowerCase();

      const matchesSearch = [
        student?.name,
        student?.email,
        course?.name,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);

      const matchesCourse =
        selectedCourse === "" ||
        record.courseId === selectedCourse;

      return matchesSearch && matchesCourse;
    });
  }, [enrollments, students, courses, enrollmentSearch, selectedCourse]);

  const getStudentCourseCount = (studentId) =>
    enrollments.filter(
      (item) =>
        item.studentId === studentId && item.status === "Active"
    ).length;

  const notify = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3000);
  };

  /* ------------------------------
     STUDENT SELECTION
  ------------------------------ */

  const toggleStudent = (studentId) => {
    setSelected((current) =>
      current.includes(studentId)
        ? current.filter((id) => id !== studentId)
        : [...current, studentId]
    );
  };

  const toggleAllVisible = () => {
    const visibleIds = paginatedStudents.map((student) => student.id);

    const allSelected = visibleIds.every((id) =>
      selected.includes(id)
    );

    setSelected((current) =>
      allSelected
        ? current.filter((id) => !visibleIds.includes(id))
        : [...new Set([...current, ...visibleIds])]
    );
  };

  /* ------------------------------
     COURSE ENROLMENT
  ------------------------------ */

  const openAssignModal = () => {
    setSelectedCourse("");
    setModal("assign");
  };

  const assignStudents = () => {
    if (!selectedCourse || !selectedStudents.length) return;

    const newEnrollments = [];
    const alreadyEnrolled = [];

    selectedStudents.forEach((student) => {
      const exists = enrollments.some(
        (item) =>
          item.studentId === student.id &&
          item.courseId === selectedCourse &&
          item.status === "Active"
      );

      if (exists) {
        alreadyEnrolled.push(student);
      } else {
        newEnrollments.push({
          id: Date.now() + Math.random(),
          studentId: student.id,
          courseId: selectedCourse,
          enrolledAt: new Date().toISOString().slice(0, 10),
          status: "Active",
        });
      }
    });

    setEnrollments((current) => [...newEnrollments, ...current]);

    const course = courses.find(
      (item) => item.id === selectedCourse
    );

    setSuccessData({
      courseName: course?.name,
      enrolled: newEnrollments.length,
      already: alreadyEnrolled.length,
      students: selectedStudents,
    });

    setSelected([]);
    setModal("success");
  };

  /* ------------------------------
     REMOVE ENROLMENT
  ------------------------------ */

  const confirmRemove = () => {
    if (!pendingRemoval) return;

    setEnrollments((current) =>
      current.filter((item) => item.id !== pendingRemoval.id)
    );

    const student = students.find(
      (item) => item.id === pendingRemoval.studentId
    );

    setPendingRemoval(null);
    notify(`${student?.name || "Student"} removed from course successfully.`);
  };

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setCourseFilter("All");
    setPage(1);
    setSelected([]);
  };

  /* ------------------------------
     RENDER
  ------------------------------ */

  return (
    <TeacherLayout>
      <div className="mx-auto w-full max-w-[1500px] space-y-6 pb-8">

        {/* HEADER */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold text-[#91A1A3]">
              <span>Teacher Portal</span>
              <ChevronRight size={12} />
              <span className="text-[#06424B]">Student Management</span>
            </div>

            <h1 className="text-[23px] font-extrabold tracking-tight text-[#17464D]">
              Student Management
            </h1>

            <p className="mt-1 text-[11px] text-[#87999B]">
              Manage your students, assign courses and track enrolments.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ActionButton
              variant="secondary"
              onClick={resetFilters}
            >
              <RefreshCw size={14} />
              Reset filters
            </ActionButton>

            <ActionButton
              variant="gold"
              onClick={openAssignModal}
              disabled={!selected.length}
            >
              <UserPlus size={15} />
              Assign course
              {selected.length > 0 && (
                <span className="ml-1 rounded-full bg-[#173E43]/10 px-2 py-0.5">
                  {selected.length}
                </span>
              )}
            </ActionButton>
          </div>
        </div>

        {/* TOAST */}

        {toast && (
          <div className="fixed right-5 top-5 z-[120] flex items-center gap-3 rounded-xl border border-[#D5E9DF] bg-white px-4 py-3 shadow-xl">
            <CheckCircle2 size={17} className="text-[#398366]" />
            <span className="text-[11px] font-semibold text-[#31565B]">
              {toast}
            </span>
            <button onClick={() => setToast("")}>
              <X size={14} />
            </button>
          </div>
        )}

        {/* SUMMARY CARDS */}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Students"
            value={students.length}
            subtitle="Registered students"
            icon={Users}
            color="#06424B"
          />

          <StatCard
            title="Active Students"
            value={activeStudents.length}
            subtitle="Currently active"
            icon={UserCheck}
            color="#38966E"
          />

          <StatCard
            title="Course Enrolments"
            value={activeEnrollments.length}
            subtitle="Active course assignments"
            icon={BookOpen}
            color="#B27B20"
          />

          <StatCard
            title="Available Courses"
            value={courses.filter((item) => item.status === "Published").length}
            subtitle="Published courses"
            icon={GraduationCap}
            color="#627BA8"
          />
        </div>

        {/* QUICK ASSIGN BANNER */}

        <div className="relative overflow-hidden rounded-[20px] bg-[#06424B] p-5 sm:p-6">
          <div className="pointer-events-none absolute -right-8 -top-16 h-48 w-48 rounded-full border-[30px] border-white/[0.035]" />
          <div className="pointer-events-none absolute -bottom-20 right-32 h-44 w-44 rounded-full bg-white/[0.035]" />

          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-[#FFAB0B]">
                <UsersRound size={23} />
              </div>

              <div>
                <h2 className="text-[15px] font-extrabold text-white">
                  Assign a complete course
                </h2>
                <p className="mt-1 max-w-[560px] text-[10px] leading-5 text-white/65">
                  Select students from your directory and give them access
                  to all modules, lessons and assignments in a course.
                </p>

                <div className="mt-3 flex flex-wrap gap-3 text-[10px] font-medium text-white/75">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-[#FFAB0B]" />
                    Bulk assignment
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-[#FFAB0B]" />
                    Duplicate detection
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-[#FFAB0B]" />
                    Instant demo updates
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={openAssignModal}
              disabled={!selected.length}
              className="relative inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#FFAB0B] px-5 py-3 text-[11px] font-extrabold text-[#173E43] transition hover:bg-[#FFC044] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus size={15} />
              Assign selected students
              <ArrowUpRight size={14} />
            </button>
          </div>
        </div>

        {/* TABS */}

        <div className="border-b border-[#E0E9E9]">
          <div className="flex flex-wrap gap-6">
            <button
              onClick={() => {
                setActiveTab("students");
                setPage(1);
              }}
              className={`relative flex items-center gap-2 pb-3 text-[12px] font-bold transition ${
                activeTab === "students"
                  ? "text-[#06424B]"
                  : "text-[#91A1A3] hover:text-[#31565B]"
              }`}
            >
              <Users size={15} />
              Student Directory
              <span className="rounded-full bg-[#EEF3F4] px-2 py-0.5 text-[9px]">
                {students.length}
              </span>
              {activeTab === "students" && (
                <span className="absolute bottom-0 left-0 h-[2.5px] w-full rounded-full bg-[#06424B]" />
              )}
            </button>

            <button
              onClick={() => setActiveTab("enrollments")}
              className={`relative flex items-center gap-2 pb-3 text-[12px] font-bold transition ${
                activeTab === "enrollments"
                  ? "text-[#06424B]"
                  : "text-[#91A1A3] hover:text-[#31565B]"
              }`}
            >
              <BookOpen size={15} />
              Course Enrolments
              <span className="rounded-full bg-[#EEF3F4] px-2 py-0.5 text-[9px]">
                {enrollments.length}
              </span>
              {activeTab === "enrollments" && (
                <span className="absolute bottom-0 left-0 h-[2.5px] w-full rounded-full bg-[#06424B]" />
              )}
            </button>
          </div>
        </div>

        {/* STUDENT DIRECTORY */}

        {activeTab === "students" && (
          <section className="overflow-hidden rounded-[20px] border border-[#E3EAEA] bg-white shadow-[0_4px_20px_rgba(18,59,67,0.025)]">

            {/* TABLE HEADER */}

            <div className="flex flex-col gap-4 border-b border-[#EDF1F1] p-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-[14px] font-extrabold text-[#17464D]">
                  Student directory
                </h2>
                <p className="mt-1 text-[10px] text-[#91A1A3]">
                  Browse students and select them for course assignment.
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="flex h-10 items-center gap-2 rounded-xl border border-[#E1E9E9] bg-[#FAFCFC] px-3 sm:w-[240px]">
                  <Search size={15} className="text-[#91A1A3]" />
                  <input
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value);
                      setPage(1);
                    }}
                    placeholder="Search students..."
                    className="w-full bg-transparent text-[11px] text-[#31565B] outline-none placeholder:text-[#AAB6B7]"
                  />
                  {search && (
                    <button onClick={() => setSearch("")}>
                      <X size={13} className="text-[#91A1A3]" />
                    </button>
                  )}
                </div>

                <div className="relative">
                  <Filter
                    size={13}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#819395]"
                  />
                  <select
                    value={statusFilter}
                    onChange={(event) => {
                      setStatusFilter(event.target.value);
                      setPage(1);
                    }}
                    className="h-10 w-full appearance-none rounded-xl border border-[#E1E9E9] bg-white pl-9 pr-8 text-[10px] font-semibold text-[#527176] outline-none focus:border-[#06424B] sm:w-[135px]"
                  >
                    <option value="All">All statuses</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  <ChevronDown
                    size={13}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#819395]"
                  />
                </div>

                <div className="relative">
                  <select
                    value={courseFilter}
                    onChange={(event) => {
                      setCourseFilter(event.target.value);
                      setPage(1);
                    }}
                    className="h-10 w-full appearance-none rounded-xl border border-[#E1E9E9] bg-white px-3 pr-8 text-[10px] font-semibold text-[#527176] outline-none focus:border-[#06424B] sm:w-[170px]"
                  >
                    <option value="All">All courses</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={13}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#819395]"
                  />
                </div>
              </div>
            </div>

            {/* SELECTION BAR */}

            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EDF1F1] bg-[#F8FAFA] px-5 py-3">
              <label className="flex cursor-pointer items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={
                    paginatedStudents.length > 0 &&
                    paginatedStudents.every((student) =>
                      selected.includes(student.id)
                    )
                  }
                  onChange={toggleAllVisible}
                  className="h-4 w-4 rounded accent-[#06424B]"
                />
                <span className="text-[10px] font-bold text-[#527176]">
                  Select all on this page
                </span>
              </label>

              <div className="flex items-center gap-3">
                <span className="text-[10px] font-semibold text-[#819395]">
                  {filteredStudents.length} students found
                </span>

                {selected.length > 0 && (
                  <button
                    onClick={() => setSelected([])}
                    className="text-[10px] font-bold text-[#B27B20] hover:underline"
                  >
                    Clear selection ({selected.length})
                  </button>
                )}
              </div>
            </div>

            {/* STUDENT TABLE */}

            {paginatedStudents.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[750px] text-left">
                    <thead>
                      <tr className="border-b border-[#EDF1F1] bg-white">
                        <th className="w-12 px-5 py-3" />
                        <th className="px-3 py-3 text-[9px] font-extrabold uppercase tracking-wider text-[#96A5A6]">
                          Student
                        </th>
                        <th className="px-3 py-3 text-[9px] font-extrabold uppercase tracking-wider text-[#96A5A6]">
                          Student ID
                        </th>
                        <th className="px-3 py-3 text-[9px] font-extrabold uppercase tracking-wider text-[#96A5A6]">
                          Courses
                        </th>
                        <th className="px-3 py-3 text-[9px] font-extrabold uppercase tracking-wider text-[#96A5A6]">
                          Joined
                        </th>
                        <th className="px-3 py-3 text-[9px] font-extrabold uppercase tracking-wider text-[#96A5A6]">
                          Status
                        </th>
                        <th className="px-5 py-3 text-right text-[9px] font-extrabold uppercase tracking-wider text-[#96A5A6]">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {paginatedStudents.map((student) => (
                        <tr
                          key={student.id}
                          className={`border-b border-[#F0F3F3] transition hover:bg-[#F9FBFB] ${
                            selected.includes(student.id)
                              ? "bg-[#F1F7F6]"
                              : ""
                          }`}
                        >
                          <td className="px-5 py-4">
                            <input
                              type="checkbox"
                              checked={selected.includes(student.id)}
                              onChange={() => toggleStudent(student.id)}
                              className="h-4 w-4 accent-[#06424B]"
                            />
                          </td>

                          <td className="px-3 py-3.5">
                            <div className="flex items-center gap-3">
                              <Avatar name={student.name} />
                              <div className="min-w-0">
                                <p className="truncate text-[11px] font-extrabold text-[#31565B]">
                                  {student.name}
                                </p>
                                <p className="mt-1 flex items-center gap-1 text-[10px] text-[#91A1A3]">
                                  <Mail size={10} />
                                  {student.email}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-3 py-3.5">
                            <span className="rounded-md bg-[#F3F6F6] px-2 py-1 text-[10px] font-bold text-[#607A7E]">
                              {student.id}
                            </span>
                          </td>

                          <td className="px-3 py-3.5">
                            <span className="flex items-center gap-1.5 text-[10px] font-semibold text-[#527176]">
                              <BookOpen size={12} />
                              {getStudentCourseCount(student.id)} courses
                            </span>
                          </td>

                          <td className="px-3 py-3.5 text-[10px] text-[#819395]">
                            {formatDate(student.joined)}
                          </td>

                          <td className="px-3 py-3.5">
                            <StatusBadge status={student.status} />
                          </td>

                          <td className="px-5 py-3.5 text-right">
                            <button
                              onClick={() => setProfileStudent(student)}
                              title="View student"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#819395] transition hover:bg-[#EAF2F1] hover:text-[#06424B]"
                            >
                              <Eye size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* PAGINATION */}

                <div className="flex flex-col gap-3 border-t border-[#EDF1F1] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-[10px] text-[#91A1A3]">
                    Showing{" "}
                    <strong className="text-[#527176]">
                      {(page - 1) * pageSize + 1}–
                      {Math.min(page * pageSize, filteredStudents.length)}
                    </strong>{" "}
                    of{" "}
                    <strong className="text-[#527176]">
                      {filteredStudents.length}
                    </strong>{" "}
                    students
                  </p>

                  <div className="flex items-center gap-1.5">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage((current) => current - 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E1E9E9] text-[#607A7E] hover:bg-[#F2F6F5] disabled:opacity-40"
                    >
                      <ChevronLeft size={14} />
                    </button>

                    {Array.from({ length: totalPages }, (_, index) => (
                      <button
                        key={index}
                        onClick={() => setPage(index + 1)}
                        className={`h-8 min-w-8 rounded-lg px-2 text-[10px] font-bold ${
                          page === index + 1
                            ? "bg-[#06424B] text-white"
                            : "border border-[#E1E9E9] text-[#607A7E] hover:bg-[#F2F6F5]"
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}

                    <button
                      disabled={page === totalPages}
                      onClick={() => setPage((current) => current + 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E1E9E9] text-[#607A7E] hover:bg-[#F2F6F5] disabled:opacity-40"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F1F5F5] text-[#819395]">
                  <SearchX size={23} />
                </div>
                <h3 className="mt-4 text-[13px] font-extrabold text-[#31565B]">
                  No students found
                </h3>
                <p className="mt-1 text-[10px] text-[#91A1A3]">
                  Try adjusting your search or filters.
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-3 text-[10px] font-bold text-[#B27B20] hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </section>
        )}

        {/* COURSE ENROLMENTS */}

        {activeTab === "enrollments" && (
          <section className="overflow-hidden rounded-[20px] border border-[#E3EAEA] bg-white shadow-[0_4px_20px_rgba(18,59,67,0.025)]">

            <div className="flex flex-col gap-4 border-b border-[#EDF1F1] p-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-[14px] font-extrabold text-[#17464D]">
                  Course enrolments
                </h2>
                <p className="mt-1 text-[10px] text-[#91A1A3]">
                  View and manage student access to complete courses.
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="flex h-10 items-center gap-2 rounded-xl border border-[#E1E9E9] bg-[#FAFCFC] px-3 sm:w-[240px]">
                  <Search size={14} className="text-[#91A1A3]" />
                  <input
                    value={enrollmentSearch}
                    onChange={(event) => setEnrollmentSearch(event.target.value)}
                    placeholder="Search student or course..."
                    className="w-full bg-transparent text-[11px] outline-none"
                  />
                </div>

                <select
                  value={selectedCourse}
                  onChange={(event) => setSelectedCourse(event.target.value)}
                  className="h-10 rounded-xl border border-[#E1E9E9] bg-white px-3 text-[10px] font-semibold text-[#527176] outline-none"
                >
                  <option value="">All courses</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-3 border-b border-[#EDF1F1] bg-[#FAFCFC] p-4 sm:grid-cols-3">
              <div className="rounded-xl border border-[#E7EEEE] bg-white p-3">
                <p className="text-[10px] text-[#91A1A3]">
                  Total enrolments
                </p>
                <p className="mt-1 text-[21px] font-extrabold text-[#17464D]">
                  {enrollments.length}
                </p>
              </div>

              <div className="rounded-xl border border-[#E7EEEE] bg-white p-3">
                <p className="text-[10px] text-[#91A1A3]">
                  Active enrolments
                </p>
                <p className="mt-1 text-[21px] font-extrabold text-[#398366]">
                  {activeEnrollments.length}
                </p>
              </div>

              <div className="rounded-xl border border-[#E7EEEE] bg-white p-3">
                <p className="text-[10px] text-[#91A1A3]">
                  Available courses
                </p>
                <p className="mt-1 text-[21px] font-extrabold text-[#17464D]">
                  {courses.length}
                </p>
              </div>
            </div>

            {courseEnrollments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left">
                  <thead>
                    <tr className="border-b border-[#EDF1F1]">
                      <th className="px-5 py-4 text-[9px] font-extrabold uppercase tracking-wider text-[#96A5A6]">
                        Student
                      </th>
                      <th className="px-3 py-4 text-[9px] font-extrabold uppercase tracking-wider text-[#96A5A6]">
                        Course
                      </th>
                      <th className="px-3 py-4 text-[9px] font-extrabold uppercase tracking-wider text-[#96A5A6]">
                        Enrolled date
                      </th>
                      <th className="px-3 py-4 text-[9px] font-extrabold uppercase tracking-wider text-[#96A5A6]">
                        Status
                      </th>
                      <th className="px-5 py-4 text-right text-[9px] font-extrabold uppercase tracking-wider text-[#96A5A6]">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {courseEnrollments.map((record) => {
                      const student = students.find(
                        (item) => item.id === record.studentId
                      );

                      const course = courses.find(
                        (item) => item.id === record.courseId
                      );

                      return (
                        <tr
                          key={record.id}
                          className="border-b border-[#F0F3F3] transition hover:bg-[#FAFCFC]"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <Avatar name={student?.name || "Unknown"} />
                              <div>
                                <p className="text-[11px] font-extrabold text-[#31565B]">
                                  {student?.name || "Unknown student"}
                                </p>
                                <p className="mt-1 text-[10px] text-[#91A1A3]">
                                  {student?.email || "—"}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-3 py-4">
                            <div className="max-w-[220px]">
                              <p className="truncate text-[11px] font-bold text-[#527176]">
                                {course?.name || "Course removed"}
                              </p>
                              <p className="mt-1 text-[9px] text-[#91A1A3]">
                                {course?.modules || 0} modules ·{" "}
                                {course?.lessons || 0} lessons
                              </p>
                            </div>
                          </td>

                          <td className="px-3 py-4 text-[10px] text-[#819395]">
                            {formatDate(record.enrolledAt)}
                          </td>

                          <td className="px-3 py-4">
                            <StatusBadge status={record.status} />
                          </td>

                          <td className="px-5 py-4 text-right">
                            <button
                              onClick={() => setPendingRemoval(record)}
                              title="Remove enrolment"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#9BA9AA] transition hover:bg-[#FFF0ED] hover:text-[#B65345]"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
                <BookOpen size={28} className="text-[#A6B5B6]" />
                <h3 className="mt-3 text-[13px] font-extrabold text-[#31565B]">
                  No enrolments found
                </h3>
                <p className="mt-1 text-[10px] text-[#91A1A3]">
                  There are no matching course enrolments.
                </p>
              </div>
            )}
          </section>
        )}
      </div>

      {/* =================================================
          ASSIGN COURSE MODAL
      ================================================= */}

      <Modal
        open={modal === "assign"}
        onClose={() => setModal("")}
        title="Assign course to students"
        description="Select a complete course and confirm the students who should receive access."
        width="max-w-2xl"
      >
        <div className="space-y-5">

          <div>
            <label className="mb-2 block text-[10px] font-extrabold text-[#527176]">
              SELECT COURSE <span className="text-[#C77A39]">*</span>
            </label>

            <select
              value={selectedCourse}
              onChange={(event) => setSelectedCourse(event.target.value)}
              className="h-11 w-full rounded-xl border border-[#DDE7E7] bg-[#FAFCFC] px-3 text-[11px] font-semibold text-[#31565B] outline-none transition focus:border-[#06424B] focus:ring-2 focus:ring-[#06424B]/10"
            >
              <option value="">Choose a course...</option>
              {courses
                .filter((course) => course.status === "Published")
                .map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
            </select>
          </div>

          {selectedCourse && (
            <div className="rounded-xl border border-[#DDE9E7] bg-[#F5F9F8] p-4">
              {(() => {
                const course = courses.find(
                  (item) => item.id === selectedCourse
                );

                return (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#06424B] text-white">
                        <BookOpen size={18} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="text-[12px] font-extrabold text-[#17464D]">
                          {course?.name}
                        </h3>
                        <p className="mt-1 text-[10px] text-[#819395]">
                          {course?.category}
                        </p>
                      </div>

                      <span className="rounded-full bg-[#E7F3EB] px-2.5 py-1 text-[9px] font-bold text-[#398366]">
                        Published
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {[
                        [Layers, course?.modules, "Modules"],
                        [BookOpen, course?.lessons, "Lessons"],
                        [CheckCircle2, course?.assignments, "Assignments"],
                      ].map(([Icon, value, label]) => (
                        <div
                          key={label}
                          className="rounded-lg border border-[#E4ECEA] bg-white p-3"
                        >
                          <Icon size={14} className="text-[#B27B20]" />
                          <p className="mt-2 text-[17px] font-extrabold text-[#17464D]">
                            {value}
                          </p>
                          <p className="text-[9px] text-[#91A1A3]">
                            {label}
                          </p>
                        </div>
                      ))}
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          <div>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <label className="text-[10px] font-extrabold text-[#527176]">
                  SELECTED STUDENTS
                </label>
                <p className="mt-1 text-[10px] text-[#91A1A3]">
                  Review the students before assigning access.
                </p>
              </div>

              <span className="rounded-full bg-[#EAF2F1] px-3 py-1 text-[10px] font-bold text-[#06424B]">
                {selectedStudents.length} selected
              </span>
            </div>

            <div className="max-h-[250px] space-y-2 overflow-y-auto rounded-xl border border-[#E4EBEB] p-3">
              {selectedStudents.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center gap-3 rounded-xl bg-[#FAFCFC] p-3"
                >
                  <Avatar name={student.name} />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-extrabold text-[#31565B]">
                      {student.name}
                    </p>
                    <p className="mt-1 text-[10px] text-[#91A1A3]">
                      {student.id} · {student.email}
                    </p>
                  </div>

                  <button
                    onClick={() => toggleStudent(student.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-[#9AA8AA] hover:bg-[#FFF0ED] hover:text-[#B65345]"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}

              {!selectedStudents.length && (
                <p className="py-8 text-center text-[11px] text-[#91A1A3]">
                  No students selected. Close this popup and select students
                  from the directory.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-xl bg-[#FFF8EA] p-3.5">
            <div className="flex items-start gap-2">
              <AlertCircle
                size={15}
                className="mt-0.5 shrink-0 text-[#B27B20]"
              />
              <p className="text-[10px] leading-5 text-[#8B754F]">
                Students who are already enrolled in this course will not
                receive duplicate enrolments. Only new assignments will
                be created.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-[#EDF1F1] pt-4">
            <ActionButton
              variant="secondary"
              onClick={() => setModal("")}
            >
              Cancel
            </ActionButton>

            <ActionButton
              variant="gold"
              onClick={assignStudents}
              disabled={!selectedCourse || !selectedStudents.length}
            >
              <UserPlus size={14} />
              Confirm assignment
            </ActionButton>
          </div>
        </div>
      </Modal>

      {/* =================================================
          SUCCESS MODAL
      ================================================= */}

      <Modal
        open={modal === "success"}
        onClose={() => setModal("")}
        title="Course assignment completed"
        description="The local demo enrolment records have been updated."
        width="max-w-lg"
      >
        {successData && (
          <div className="space-y-5">
            <div className="flex flex-col items-center rounded-2xl bg-[#F1F8F4] px-5 py-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#DDF0E4] text-[#398366]">
                <Check size={27} />
              </div>

              <h3 className="mt-3 text-[15px] font-extrabold text-[#17464D]">
                Assignment successful!
              </h3>

              <p className="mt-1 max-w-[300px] text-[10px] leading-5 text-[#819395]">
                {successData.courseName}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-[#E3ECE7] bg-white p-4">
                <p className="text-[10px] text-[#819395]">
                  Newly enrolled
                </p>
                <p className="mt-2 text-[25px] font-extrabold text-[#398366]">
                  {successData.enrolled}
                </p>
              </div>

              <div className="rounded-xl border border-[#E3ECE7] bg-white p-4">
                <p className="text-[10px] text-[#819395]">
                  Already enrolled
                </p>
                <p className="mt-2 text-[25px] font-extrabold text-[#B27B20]">
                  {successData.already}
                </p>
              </div>
            </div>

            {successData.students.map((student) => {
              const isAlready = enrollments.some(
                (item) =>
                  item.studentId === student.id &&
                  item.courseId === courses.find(
                    (course) => course.name === successData.courseName
                  )?.id &&
                  item.status === "Active"
              );

              return (
                <div
                  key={student.id}
                  className="flex items-center gap-3 rounded-lg bg-[#F8FAFA] p-2.5"
                >
                  <Avatar name={student.name} />

                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold text-[#31565B]">
                      {student.name}
                    </p>
                    <p className="text-[9px] text-[#91A1A3]">
                      {student.id}
                    </p>
                  </div>

                  <span
                    className={`text-[9px] font-bold ${
                      isAlready ? "text-[#B27B20]" : "text-[#398366]"
                    }`}
                  >
                    {isAlready ? "Already enrolled" : "Enrolled"}
                  </span>
                </div>
              );
            })}

            <ActionButton
              variant="primary"
              className="w-full"
              onClick={() => {
                setModal("");
                setActiveTab("enrollments");
              }}
            >
              View course enrolments
              <ArrowUpRight size={14} />
            </ActionButton>
          </div>
        )}
      </Modal>

      {/* =================================================
          STUDENT PROFILE MODAL
      ================================================= */}

      <Modal
        open={Boolean(profileStudent)}
        onClose={() => setProfileStudent(null)}
        title="Student profile"
        description="Student information and complete course enrolment history."
        width="max-w-lg"
      >
        {profileStudent && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 rounded-2xl bg-[#F5F8F8] p-4">
              <Avatar name={profileStudent.name} size="lg" />

              <div className="min-w-0 flex-1">
                <h3 className="text-[15px] font-extrabold text-[#17464D]">
                  {profileStudent.name}
                </h3>
                <p className="mt-1 text-[10px] text-[#819395]">
                  {profileStudent.id}
                </p>
                <div className="mt-2">
                  <StatusBadge status={profileStudent.status} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-[#E5ECEC] p-3">
                <p className="text-[9px] font-bold uppercase text-[#91A1A3]">
                  Email address
                </p>
                <p className="mt-2 break-all text-[10px] font-semibold text-[#31565B]">
                  {profileStudent.email}
                </p>
              </div>

              <div className="rounded-xl border border-[#E5ECEC] p-3">
                <p className="text-[9px] font-bold uppercase text-[#91A1A3]">
                  Phone number
                </p>
                <p className="mt-2 text-[10px] font-semibold text-[#31565B]">
                  {profileStudent.phone}
                </p>
              </div>

              <div className="rounded-xl border border-[#E5ECEC] p-3">
                <p className="text-[9px] font-bold uppercase text-[#91A1A3]">
                  Joined date
                </p>
                <p className="mt-2 text-[10px] font-semibold text-[#31565B]">
                  {formatDate(profileStudent.joined)}
                </p>
              </div>

              <div className="rounded-xl border border-[#E5ECEC] p-3">
                <p className="text-[9px] font-bold uppercase text-[#91A1A3]">
                  Enrolled courses
                </p>
                <p className="mt-2 text-[17px] font-extrabold text-[#06424B]">
                  {getStudentCourseCount(profileStudent.id)}
                </p>
              </div>
            </div>

            <div>
              <h4 className="mb-3 text-[11px] font-extrabold text-[#31565B]">
                Enrolled courses
              </h4>

              <div className="space-y-2">
                {enrollments
                  .filter(
                    (item) => item.studentId === profileStudent.id
                  )
                  .map((record) => {
                    const course = courses.find(
                      (item) => item.id === record.courseId
                    );

                    return (
                      <div
                        key={record.id}
                        className="flex items-center gap-3 rounded-xl border border-[#E7EEEE] p-3"
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EAF2F1] text-[#06424B]">
                          <BookOpen size={15} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[10px] font-bold text-[#31565B]">
                            {course?.name || "Unknown course"}
                          </p>
                          <p className="mt-1 text-[9px] text-[#91A1A3]">
                            Enrolled {formatDate(record.enrolledAt)}
                          </p>
                        </div>

                        <StatusBadge status={record.status} />
                      </div>
                    );
                  })}

                {!enrollments.some(
                  (item) => item.studentId === profileStudent.id
                ) && (
                  <p className="rounded-xl bg-[#F7F9F9] p-4 text-center text-[10px] text-[#91A1A3]">
                    No course enrolments yet.
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end border-t border-[#EDF1F1] pt-4">
              <ActionButton
                variant="secondary"
                onClick={() => setProfileStudent(null)}
              >
                Close
              </ActionButton>
            </div>
          </div>
        )}
      </Modal>

      {/* =================================================
          REMOVE ENROLMENT CONFIRMATION
      ================================================= */}

      <Modal
        open={Boolean(pendingRemoval)}
        onClose={() => setPendingRemoval(null)}
        title="Remove course access?"
        description="Please review this action before continuing."
        width="max-w-md"
      >
        {pendingRemoval && (
          <div className="space-y-5">
            <div className="flex items-start gap-3 rounded-xl border border-[#F0E1DE] bg-[#FFF8F6] p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FBE8E4] text-[#B65345]">
                <AlertCircle size={19} />
              </div>

              <div>
                <h3 className="text-[11px] font-extrabold text-[#77463F]">
                  This action will remove the enrolment.
                </h3>
                <p className="mt-1 text-[10px] leading-5 text-[#9B7772]">
                  The student will no longer have this course assignment
                  in the local demo data.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-[#E5ECEC] p-4">
              <p className="text-[9px] font-bold uppercase tracking-wider text-[#91A1A3]">
                Student
              </p>

              <p className="mt-1 text-[12px] font-extrabold text-[#31565B]">
                {students.find(
                  (item) => item.id === pendingRemoval.studentId
                )?.name}
              </p>

              <p className="mt-4 text-[9px] font-bold uppercase tracking-wider text-[#91A1A3]">
                Course
              </p>

              <p className="mt-1 text-[11px] font-bold text-[#31565B]">
                {courses.find(
                  (item) => item.id === pendingRemoval.courseId
                )?.name}
              </p>
            </div>

            <div className="flex justify-end gap-2 border-t border-[#EDF1F1] pt-4">
              <ActionButton
                variant="secondary"
                onClick={() => setPendingRemoval(null)}
              >
                Cancel
              </ActionButton>

              <ActionButton
                variant="danger"
                onClick={confirmRemove}
              >
                <Trash2 size={14} />
                Remove enrolment
              </ActionButton>
            </div>
          </div>
        )}
      </Modal>
    </TeacherLayout>
  );
}
