import { useSyncExternalStore } from "react";

// Teacher portal demo data. All catalogue edits, lesson content, assignments,
// student records and course enrolments are stored locally in the browser.
const STORAGE_KEY = "skillnext.teacher.catalogue.v2";

const initialTeacherData = {
  categories: [
    { id: 1, name: "Hairstyling", idNumber: "HAIR", description: "Hair care, styling techniques, salon practice and professional client service.", visible: true, sortOrder: 1 },
    { id: 2, name: "Welding", idNumber: "WELD", description: "Workshop safety, welding processes, joints, equipment and fabrication practice.", visible: true, sortOrder: 2 },
    { id: 3, name: "CNC and Toolmaking", idNumber: "CNC", description: "Engineering drawings, machining, tooling, measurement and production methods.", visible: true, sortOrder: 3 },
    { id: 4, name: "Esthetics", idNumber: "ESTH", description: "Skin care, sanitation, client consultation and professional esthetics services.", visible: true, sortOrder: 4 },
    { id: 5, name: "IT Courses", idNumber: "IT", description: "Software development, programming, databases and modern digital skills.", visible: true, sortOrder: 5 },
    { id: 6, name: "POS Training", idNumber: "POS", description: "Point-of-sale operations, transactions, customer service and retail workflows.", visible: true, sortOrder: 6 },
  ],
  courses: [
    { id: 101, categoryId: 1, fullName: "Hair Styling and Salon Practice", shortName: "Hairstyling", idNumber: "SN-HAIR-101", summary: "Build professional knowledge of hair structure, consultation, tools, styling methods and salon safety.", startDate: "2026-11-16", endDate: "2027-02-28", visible: true },
    { id: 102, categoryId: 2, fullName: "Welding Fundamentals", shortName: "Welding", idNumber: "SN-WELD-102", summary: "Learn welding safety, equipment preparation, common processes, joint preparation and inspection.", startDate: "2026-11-16", endDate: "2027-02-28", visible: true },
    { id: 103, categoryId: 3, fullName: "CNC Machining and Toolmaking", shortName: "CNC & Toolmaking", idNumber: "SN-CNC-103", summary: "Understand engineering drawings, machine setup, tooling, workholding, machining and quality checks.", startDate: "2026-11-16", endDate: "2027-03-15", visible: true },
    { id: 104, categoryId: 4, fullName: "Esthetics Foundations", shortName: "Esthetics", idNumber: "SN-ESTH-104", summary: "Develop safe client consultation, skin analysis, sanitation and foundational treatment knowledge.", startDate: "2026-11-16", endDate: "2027-02-28", visible: true },
    { id: 105, categoryId: 5, fullName: "React Frontend Development", shortName: "React", idNumber: "SN-IT-105", summary: "Create component-driven interfaces and production-ready React applications.", startDate: "2026-11-16", endDate: "2027-01-31", visible: true },
    { id: 106, categoryId: 6, fullName: "POS Operations Training", shortName: "POS Training", idNumber: "SN-POS-106", summary: "Practise point-of-sale setup, product lookup, transactions, payments, refunds and end-of-day procedures.", startDate: "2026-11-16", endDate: "2027-02-28", visible: true },
  ],
  modules: [
    { id: 1001, courseId: 101, name: "Hair & Scalp Fundamentals", summary: "Understand hair structure, growth, scalp condition and basic care selection.", position: 1, visible: true },
    { id: 1002, courseId: 101, name: "Tools, Products & Hygiene", summary: "Select, maintain and sanitise salon tools and products safely.", position: 2, visible: true },
    { id: 1003, courseId: 102, name: "Workshop Safety and Equipment", summary: "Prepare a safe workstation and inspect welding equipment before use.", position: 1, visible: true },
    { id: 1004, courseId: 105, name: "React Core Concepts", summary: "Components, props, state and hooks.", position: 1, visible: true },
    { id: 1005, courseId: 106, name: "POS Terminal Operations", summary: "Navigate the terminal and process common retail transactions.", position: 1, visible: true },
  ],
  contents: [
    { id: 2001, moduleId: 1001, title: "Introduction to Hair and Scalp", contentType: "text", body: "Hair services begin with understanding the hair and scalp. Hair texture, density, porosity and elasticity influence how it responds to washing, heat, styling and chemical services. A careful consultation helps a stylist choose a suitable service rather than relying on appearance alone.", blocks: [{ type: "heading", text: "Introduction to Hair and Scalp" }, { type: "paragraph", text: "Hair services begin with understanding the hair and scalp. Hair texture, density, porosity and elasticity influence how it responds to washing, heat, styling and chemical services." }, { type: "subheading", text: "Professional observation" }, { type: "bullet_list", items: ["Observe visible scalp condition and client comfort.", "Consider texture, density, porosity and elasticity.", "Choose services and products based on consultation and suitability."] }], url: "", position: 1, visible: true },
    { id: 2002, moduleId: 1002, title: "Salon Tool Hygiene Demonstration", contentType: "video", body: "A practical demonstration of cleaning, disinfecting and storing reusable salon tools between clients.", blocks: [{ type: "heading", text: "Salon Tool Hygiene" }, { type: "paragraph", text: "Clean tools to remove visible debris before applying the correct disinfecting process. Follow product directions for dilution and contact time, then store tools safely." }], url: "", position: 1, visible: true, fileMeta: null },
    { id: 2003, moduleId: 1003, title: "Welding Workstation Safety Notes", contentType: "document", body: "Review the workstation, PPE, ventilation, cables, workpiece stability and fire-prevention arrangements before welding.", blocks: [{ type: "heading", text: "Before Starting Work" }, { type: "numbered_list", items: ["Inspect the work area and remove combustible materials.", "Wear the PPE required for the process.", "Check cables, connections, work clamp and equipment condition.", "Secure the workpiece and confirm ventilation."] }], url: "", position: 1, visible: true, fileMeta: null },
    { id: 2004, moduleId: 1004, title: "React Components Overview", contentType: "text", body: "React applications are built from reusable components. A component receives data through props, can manage local state and describes the interface with JSX.", blocks: [{ type: "heading", text: "React Components" }, { type: "paragraph", text: "React applications are built from reusable components. A component receives data through props, can manage local state and describes the interface with JSX." }], url: "", position: 1, visible: true },
    { id: 2005, moduleId: 1005, title: "POS Transaction Workflow", contentType: "text", body: "A standard POS transaction begins by identifying items, confirming quantities and prices, applying authorised discounts, selecting a payment method and issuing a receipt.", blocks: [{ type: "heading", text: "Standard POS Transaction" }, { type: "numbered_list", items: ["Identify each product using the approved lookup or scan process.", "Confirm quantities, prices and authorised discounts.", "Select the correct payment method and complete the payment.", "Issue the receipt and verify the transaction is recorded."] }], url: "", position: 1, visible: true },
  ],
  assignments: [],
  students: [
    { id: 5001, name: "Aarav Sharma", email: "aarav.sharma@example.com", studentCode: "STU-5001", role: "student", status: "Active" },
    { id: 5002, name: "Ananya Reddy", email: "ananya.reddy@example.com", studentCode: "STU-5002", role: "student", status: "Active" },
    { id: 5003, name: "Rohan Kumar", email: "rohan.kumar@example.com", studentCode: "STU-5003", role: "student", status: "Active" },
    { id: 5004, name: "Meera Nair", email: "meera.nair@example.com", studentCode: "STU-5004", role: "student", status: "Active" },
    { id: 5005, name: "Arjun Patel", email: "arjun.patel@example.com", studentCode: "STU-5005", role: "student", status: "Active" },
    { id: 5006, name: "Diya Thomas", email: "diya.thomas@example.com", studentCode: "STU-5006", role: "student", status: "Active" },
    { id: 5007, name: "Kiran Reddy", email: "kiran.reddy@example.com", studentCode: "STU-5007", role: "student", status: "Active" },
    { id: 5008, name: "Sana Khan", email: "sana.khan@example.com", studentCode: "STU-5008", role: "student", status: "Active" },
  ],
  enrollments: [
    { id: 6001, courseId: 101, studentId: 5001, enrolledAt: "2026-11-16T09:00:00.000Z", status: "Active" },
    { id: 6002, courseId: 105, studentId: 5002, enrolledAt: "2026-11-16T09:15:00.000Z", status: "Active" },
    { id: 6003, courseId: 102, studentId: 5003, enrolledAt: "2026-11-16T09:30:00.000Z", status: "Active" },
  ],
};

function readInitialData() {
  if (typeof window === "undefined") return initialTeacherData;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return initialTeacherData;
    const parsed = JSON.parse(stored);
    const { apiStatus: _legacyApiStatus, apiError: _legacyApiError, ...mockRecords } = parsed;
    return {
      ...initialTeacherData,
      ...mockRecords,
      categories: (mockRecords.categories || initialTeacherData.categories).map(({ parentId, ...category }) => category),
      students: mockRecords.students || initialTeacherData.students,
      enrollments: mockRecords.enrollments || initialTeacherData.enrollments,
      assignments: mockRecords.assignments || [],
    };
  } catch {
    return initialTeacherData;
  }
}

let snapshot = readInitialData();
const listeners = new Set();

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return snapshot;
}

function commit(updater) {
  snapshot = updater(snapshot);
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch {
      // The local mock remains usable for the current tab if storage is unavailable.
    }
  }
  listeners.forEach((listener) => listener());
}

function nextId(items) {
  return items.reduce((maximum, item) => Math.max(maximum, Number(item.id) || 0), 0) + 1;
}

function normalizeCategory(item) {
  return {
    id: item.id ?? item.category_id,
    name: item.name ?? item.category_name ?? "",
    idNumber: item.idNumber ?? item.id_number ?? item.code ?? "",
    description: item.description ?? "",
    sortOrder: Number(item.sortOrder ?? item.sort_order ?? 0),
    visible: item.visible ?? item.is_visible ?? true,
  };
}

function normalizeCourse(item) {
  return {
    ...item,
    id: item.id ?? item.course_id,
    categoryId: item.categoryId ?? item.category_id,
    fullName: item.fullName ?? item.full_name ?? item.title ?? item.name ?? "",
    shortName: item.shortName ?? item.short_name ?? "",
    idNumber: item.idNumber ?? item.id_number ?? "",
    summary: item.summary ?? item.description ?? "",
    startDate: item.startDate ?? item.start_date ?? "",
    endDate: item.endDate ?? item.end_date ?? "",
    visible: item.visible ?? item.is_visible ?? true,
  };
}

function normalizeModule(item) {
  return {
    ...item,
    id: item.id ?? item.module_id,
    courseId: item.courseId ?? item.course_id,
    name: item.name ?? item.title ?? "",
    summary: item.summary ?? item.description ?? "",
    position: Number(item.position ?? item.sort_order ?? 1),
    visible: item.visible ?? item.is_visible ?? true,
  };
}

function normalizeContent(item) {
  return {
    ...item,
    id: item.id ?? item.content_id,
    moduleId: item.moduleId ?? item.module_id,
    contentType: item.contentType ?? item.content_type ?? "text",
    title: item.title ?? "",
    body: item.body ?? "",
    blocks: Array.isArray(item.blocks) ? item.blocks : [],
    url: item.url ?? "",
    fileMeta: item.fileMeta ?? item.file_meta ?? null,
    position: Number(item.position ?? item.sort_order ?? 1),
    visible: item.visible ?? item.is_visible ?? true,
  };
}

function normalizeAssignment(item) {
  return {
    ...item,
    id: item.id ?? item.assignment_id,
    courseId: item.courseId ?? item.course_id,
    moduleId: item.moduleId ?? item.module_id ?? "",
    title: item.title ?? "",
    instructions: item.instructions ?? item.description ?? "",
    dueDate: item.dueDate ?? item.due_date ?? "",
    totalMarks: Number(item.totalMarks ?? item.total_marks ?? 100),
    visible: item.visible ?? item.is_visible ?? true,
  };
}

function normalizeStudent(student) {
  return {
    id: student.id ?? student.student_id ?? nextId(snapshot.students || initialTeacherData.students),
    name: student.name ?? student.fullName ?? student.full_name ?? student.username ?? "New student",
    email: String(student.email ?? student.email_address ?? "").trim().toLowerCase(),
    studentCode: student.studentCode ?? student.student_code ?? `STU-${student.id ?? "NEW"}`,
    role: String(student.role || "student").toLowerCase(),
    status: student.status || "Active",
  };
}

export function useTeacherData() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export const teacherActions = {
  async createCategory(payload) {
    const created = normalizeCategory({ ...payload, id: nextId(snapshot.categories) });
    commit((current) => ({ ...current, categories: [...current.categories, created] }));
    return created;
  },

  async updateCategory(id, payload) {
    const updated = normalizeCategory({ ...payload, id: Number(id) });
    commit((current) => ({ ...current, categories: current.categories.map((item) => String(item.id) === String(id) ? { ...item, ...updated, id: item.id } : item) }));
  },

  async deleteCategory(id) {
    if (snapshot.courses.some((item) => String(item.categoryId) === String(id))) return false;
    commit((current) => ({ ...current, categories: current.categories.filter((item) => String(item.id) !== String(id)) }));
    return true;
  },

  async createCourse(payload) {
    const created = normalizeCourse({ ...payload, id: nextId(snapshot.courses) });
    commit((current) => ({ ...current, courses: [...current.courses, created] }));
    return created;
  },

  async updateCourse(id, payload) {
    const updated = normalizeCourse({ ...payload, id: Number(id) });
    commit((current) => ({ ...current, courses: current.courses.map((item) => String(item.id) === String(id) ? { ...item, ...updated, id: item.id } : item) }));
  },

  async deleteCourse(id) {
    const moduleIds = snapshot.modules.filter((item) => String(item.courseId) === String(id)).map((item) => String(item.id));
    commit((current) => ({
      ...current,
      courses: current.courses.filter((item) => String(item.id) !== String(id)),
      modules: current.modules.filter((item) => String(item.courseId) !== String(id)),
      contents: current.contents.filter((item) => !moduleIds.includes(String(item.moduleId))),
      assignments: current.assignments.filter((item) => String(item.courseId) !== String(id)),
      enrollments: current.enrollments.filter((item) => String(item.courseId) !== String(id)),
    }));
    return studentIds.length;
  },

  async createModule(courseId, payload) {
    const position = Number(payload.position) || snapshot.modules.filter((item) => String(item.courseId) === String(courseId)).reduce((max, item) => Math.max(max, Number(item.position) || 0), 0) + 1;
    const created = normalizeModule({ ...payload, id: nextId(snapshot.modules), courseId, position });
    commit((current) => ({ ...current, modules: [...current.modules, created] }));
    return created;
  },

  async updateModule(id, payload) {
    const updated = normalizeModule({ ...payload, id: Number(id) });
    commit((current) => ({ ...current, modules: current.modules.map((item) => String(item.id) === String(id) ? { ...item, ...updated, id: item.id, courseId: item.courseId } : item) }));
  },

  async deleteModule(id) {
    commit((current) => ({ ...current, modules: current.modules.filter((item) => String(item.id) !== String(id)), contents: current.contents.filter((item) => String(item.moduleId) !== String(id)), assignments: current.assignments.filter((item) => String(item.moduleId) !== String(id)) }));
  },

  async createContent(moduleId, payload) {
    const position = Number(payload.position) || snapshot.contents.filter((item) => String(item.moduleId) === String(moduleId)).reduce((max, item) => Math.max(max, Number(item.position) || 0), 0) + 1;
    const created = normalizeContent({ ...payload, id: nextId(snapshot.contents), moduleId, position });
    commit((current) => ({ ...current, contents: [...current.contents, created] }));
    return created;
  },

  async updateContent(id, payload) {
    const updated = normalizeContent({ ...payload, id: Number(id) });
    commit((current) => ({ ...current, contents: current.contents.map((item) => String(item.id) === String(id) ? { ...item, ...updated, id: item.id, moduleId: item.moduleId } : item) }));
  },

  async deleteContent(id) {
    commit((current) => ({ ...current, contents: current.contents.filter((item) => String(item.id) !== String(id)) }));
  },

  async createAssignment(courseId, payload) {
    const created = normalizeAssignment({ ...payload, id: nextId(snapshot.assignments), courseId });
    commit((current) => ({ ...current, assignments: [...current.assignments, created] }));
    return created;
  },

  async updateAssignment(id, payload) {
    const updated = normalizeAssignment({ ...payload, id: Number(id) });
    commit((current) => ({ ...current, assignments: current.assignments.map((item) => String(item.id) === String(id) ? { ...item, ...updated, id: item.id, courseId: item.courseId } : item) }));
  },

  async deleteAssignment(id) {
    commit((current) => ({ ...current, assignments: current.assignments.filter((item) => String(item.id) !== String(id)) }));
  },

  async addStudent(payload) {
    const email = String(payload.email || "").trim().toLowerCase();
    if (email && snapshot.students.some((item) => item.email === email)) {
      throw new Error("A student with this email already exists in the demo directory.");
    }
    const created = normalizeStudent({ ...payload, id: nextId(snapshot.students) });
    commit((current) => ({ ...current, students: [...current.students, created] }));
    return created;
  },

  async updateStudent(id, payload) {
    const updated = normalizeStudent({ ...payload, id: Number(id) });
    commit((current) => ({ ...current, students: current.students.map((student) => String(student.id) === String(id) ? { ...student, ...updated, id: student.id } : student) }));
  },

  async deleteStudent(id) {
    commit((current) => ({ ...current, students: current.students.filter((student) => String(student.id) !== String(id)), enrollments: current.enrollments.filter((item) => String(item.studentId) !== String(id)) }));
  },

  async enrollStudents(courseId, { studentIds = [], emails = [] } = {}) {
    const selectedStudents = snapshot.students.filter((student) =>
      studentIds.some((id) => String(id) === String(student.id)) ||
      emails.some((email) => String(email).trim().toLowerCase() === student.email),
    );
    const selectedKeys = new Set(selectedStudents.map((student) => String(student.id)));
    const unknown = [
      ...studentIds.filter((id) => !selectedKeys.has(String(id))),
      ...emails.filter((email) => !selectedStudents.some((student) => student.email === String(email).trim().toLowerCase())),
    ];
    const notStudents = selectedStudents.filter((student) => student.role !== "student" || student.status === "Inactive");
    const validStudents = selectedStudents.filter((student) => student.role === "student" && student.status !== "Inactive");
    const already = validStudents.filter((student) => snapshot.enrollments.some((item) => String(item.courseId) === String(courseId) && String(item.studentId) === String(student.id)));
    const alreadyIds = new Set(already.map((student) => String(student.id)));
    const enrolled = validStudents.filter((student) => !alreadyIds.has(String(student.id)));
    if (enrolled.length) {
      const firstEnrollmentId = nextId(snapshot.enrollments);
      const timestamp = new Date().toISOString();
      const newRecords = enrolled.map((student, index) => ({
        id: firstEnrollmentId + index,
        courseId: Number(courseId),
        studentId: student.id,
        enrolledAt: timestamp,
        status: "Active",
      }));
      commit((current) => ({ ...current, enrollments: [...current.enrollments, ...newRecords] }));
    }
    return { enrolled, already, unknown, notStudents, totalEnrolled: enrolled.length };
  },

  async removeEnrollment(courseId, studentId) {
    commit((current) => ({ ...current, enrollments: current.enrollments.filter((item) => !(String(item.courseId) === String(courseId) && String(item.studentId) === String(studentId))) }));
  },
};
