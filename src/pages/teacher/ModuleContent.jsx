import i18n, { translateValue } from "../../i18n";

import { useMemo, useState, useEffect } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  FileText,
  Pencil,
  Trash2,
  UploadCloud,
  Video,
  BookOpen,
  File,
  GripVertical,
  X,
  Code2,
  Copy,
  Play,
  RotateCcw,
  Check,
  Eye,
  ChevronDown,
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
  StatusPill,
  EmptyState,
} from "./TeacherUI";

/* =====================================================
   CONSTANTS
===================================================== */

const DEFAULT_HTML = `<!DOCTYPE html>
<html>
<head>
  <title>My First Page</title>
</head>
<body>
  <h1>My First Page</h1>
  <p>Learning HTML at Skill Next.</p>
</body>
</html>`;

const LANGUAGES = [
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
];

const createEmptyBlock = (type = "paragraph") => {
  if (type === "bullet_list" || type === "numbered_list") {
    return { type, items: [""] };
  }

  if (type === "code_example") {
    return {
      type,
      language: "html",
      code: DEFAULT_HTML,
      showPreview: true,
    };
  }

  return { type, text: "" };
};

const blankForm = {
  title: "",
  contentType: "text",
  body: "",
  blocks: [
    createEmptyBlock("heading"),
    createEmptyBlock("paragraph"),
  ],
  url: "",
  position: 1,
  visible: true,
};

const contentTypeOptions = [
  {
    value: "text",
    label: "Text lesson",
    description: "Structured text with headings, paragraphs and code examples",
    icon: BookOpen,
  },
  {
    value: "video",
    label: "Video",
    description: "Video lesson with a hosted URL or demo file record",
    icon: Video,
  },
  {
    value: "document",
    label: "Document",
    description: "PDF, notes or supporting study materials",
    icon: File,
  },
];

const blockTypes = [
  { value: "heading", label: "Heading", icon: "H" },
  { value: "subheading", label: "Subheading", icon: "H2" },
  { value: "paragraph", label: "Paragraph", icon: "P" },
  { value: "bullet_list", label: "Bullet list", icon: "•" },
  { value: "numbered_list", label: "Numbered list", icon: "1." },
  { value: "code_example", label: "Code example", icon: "</>" },
];

/* =====================================================
   HELPERS
===================================================== */

function blockToText(block) {
  if (block.type === "code_example") {
    return block.code || "";
  }

  if (Array.isArray(block.items)) {
    return block.items.filter(Boolean).join("\n");
  }

  return block.text || "";
}

function deriveBody(blocks, fallbackBody) {
  const fromBlocks = blocks
    .map(blockToText)
    .filter(Boolean)
    .join("\n\n");

  return fallbackBody.trim() || fromBlocks;
}

function formatFileSize(bytes) {
  if (!bytes) return "0 KB";

  return bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(2)} MB`
    : `${(bytes / 1024).toFixed(1)} KB`;
}

/* =====================================================
   CONTENT ICON
===================================================== */

function LessonIcon({ type }) {
  const config = {
    text: {
      icon: BookOpen,
      color: "text-[#06424B]",
      bg: "bg-[#EAF2F2]",
    },
    video: {
      icon: Video,
      color: "text-[#B27B20]",
      bg: "bg-[#FFF5E3]",
    },
    document: {
      icon: File,
      color: "text-[#55777D]",
      bg: "bg-[#EDF3F4]",
    },
  };

  const style = config[type] || config.text;
  const Icon = style.icon;

  return (
    <div
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] ${style.bg} ${style.color}`}
    >
      <Icon size={19} />
    </div>
  );
}

/* =====================================================
   CODE EXAMPLE BLOCK EDITOR
===================================================== */

function CodeExampleEditor({ block, onChange }) {
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(
    block.showPreview !== false
  );

  const code = block.code || "";
  const lines = code.split("\n");

  const update = (changes) => {
    onChange({
      ...block,
      ...changes,
    });
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const resetCode = () => {
    update({ code: DEFAULT_HTML, language: "html" });
  };

  const isHtml = block.language === "html";

  return (
    <div className="overflow-hidden rounded-[15px] border border-[#D8E4E4] bg-white">

      {/* CODE BLOCK HEADER */}

      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#123F46] px-4 py-3">

        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-[#FFAB0B]">
            <Code2 size={16} />
          </div>

          <div>
            <p className="text-[11px] font-extrabold text-white">
              {translateValue("Code example")}</p>
            <p className="mt-0.5 text-[9px] text-white/60">
              {translateValue("Add code to explain this topic")}</p>
          </div>
        </div>

        <select
          value={block.language || "html"}
          onChange={(event) =>
            update({ language: event.target.value })
          }
          className="rounded-lg border border-white/20 bg-[#234F55] px-3 py-2 text-[10px] font-bold text-white outline-none"
        >
          {LANGUAGES.map((language) => (
            <option
              key={language.value}
              value={language.value}
              className="bg-white text-[#17464D]"
            >
              {translateValue(language.label)}
            </option>
          ))}
        </select>

      </div>

      {/* EDITOR */}

      <div className="bg-[#282C34]">

        <div className="flex items-center justify-between border-b border-white/10 bg-[#20242B] px-4 py-2.5">

          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#FFAB0B]" />
            <span className="font-mono text-[10px] font-semibold text-[#D7E0E8]">
              {translateValue(block.language === "html"
                ? "index.html"
                : block.language === "css"
                  ? "style.css"
                  : block.language === "javascript"
                    ? "script.js"
                    : block.language === "python"
                      ? "main.py"
                      : "Main.java")}
            </span>
          </div>

          <button
            type="button"
            onClick={copyCode}
            className="flex items-center gap-1.5 text-[10px] text-[#AAB9C2] hover:text-white"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {translateValue(copied ? "Copied" : "Copy code")}
          </button>

        </div>

        <div className="flex min-h-[190px] max-h-[360px] overflow-auto">

          <div className="select-none px-3 py-3 text-right font-mono text-[10px] leading-[22px] text-[#788795]">
            {lines.map((_, index) => (
              <div key={index}>{translateValue(index + 1)}</div>
            ))}
          </div>

          <textarea
            spellCheck={false}
            value={code}
            onChange={(event) =>
              update({ code: event.target.value })
            }
            placeholder={translateValue("Write your code here...")}
            aria-label={translateValue("Code example editor")}
            className="min-h-[190px] min-w-0 flex-1 resize-y overflow-auto border-0 bg-transparent px-3 py-3 font-mono text-[11px] leading-[22px] text-[#E6EDF3] outline-none focus:ring-0"
            style={{
              tabSize: 2,
              whiteSpace: "pre",
            }}
          />

        </div>

      </div>

      {/* PREVIEW CONTROLS */}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E1EAEA] bg-[#F7F9F9] px-3.5 py-3">

        <button
          type="button"
          onClick={resetCode}
          className="flex items-center gap-1.5 rounded-lg border border-[#DCE6E6] bg-white px-3 py-2 text-[10px] font-semibold text-[#607A7E] hover:text-[#06424B]"
        >
          <RotateCcw size={12} />
          {translateValue("Reset")}</button>

        {isHtml ? (
          <button
            type="button"
            onClick={() => setShowPreview((value) => !value)}
            className="flex items-center gap-1.5 rounded-lg bg-[#06424B] px-3.5 py-2 text-[10px] font-bold text-white hover:bg-[#0B5963]"
          >
            <Eye size={13} />
            {translateValue(showPreview ? "Hide preview" : "Show preview")}
            <ChevronDown
              size={12}
              className={showPreview ? "rotate-180" : ""}
            />
          </button>
        ) : (
          <span className="text-[9px] text-[#899A9C]">
            {translateValue("Code display only")}</span>
        )}

      </div>

      {/* HTML PREVIEW */}

      {isHtml && showPreview && (
        <div className="border-t border-[#E3EAEA] bg-white">

          <div className="flex items-center justify-between border-b border-[#E9EEEE] px-4 py-3">

            <div className="flex items-center gap-2">
              <Eye size={14} className="text-[#06424B]" />
              <span className="text-[10px] font-extrabold text-[#17464D]">
                {translateValue("Expected output")}</span>
            </div>

            <span className="rounded-full bg-[#EAF5EF] px-2.5 py-1 text-[9px] font-bold text-[#26835C]">
              {translateValue("Preview")}</span>

          </div>

          <iframe
            title={translateValue("Code example preview")}
            sandbox=""
            srcDoc={code}
            className="h-[190px] w-full border-0 bg-white"
          />

        </div>
      )}

    </div>
  );
}

/* =====================================================
   MAIN MODULE CONTENT
===================================================== */

export default function ModuleContent() {
  const { courseId, moduleId } = useParams();

  const data = useTeacherData();

  const course = data.courses.find(
    (item) => String(item.id) === String(courseId)
  );

  const module = data.modules.find(
    (item) =>
      String(item.id) === String(moduleId) &&
      String(item.courseId) === String(courseId)
  );

  const contents = useMemo(
    () =>
      data.contents
        .filter(
          (item) => String(item.moduleId) === String(moduleId)
        )
        .sort(
          (a, b) =>
            Number(a.position || 0) -
            Number(b.position || 0)
        ),
    [data.contents, moduleId]
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blankForm);
  const [selectedFile, setSelectedFile] = useState(null);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  if (!course || !module) {
    return (
      <Navigate
        to={
          course
            ? `/teacher/courses/${course.id}/modules`
            : "/teacher/courses"
        }
        replace
      />
    );
  }

  /* =====================================================
     CREATE
  ===================================================== */

  const openCreate = () => {
    setEditing(null);

    setForm({
      ...blankForm,
      position: contents.length + 1,
      blocks: [
        createEmptyBlock("heading"),
        createEmptyBlock("paragraph"),
      ],
    });

    setSelectedFile(null);
    setNotice("");
    setModalOpen(true);
  };

  /* =====================================================
     EDIT
  ===================================================== */

  const openEdit = (content) => {
    setEditing(content);

    const existingBlocks =
      Array.isArray(content.blocks) && content.blocks.length
        ? content.blocks
        : [createEmptyBlock("paragraph")];

    setForm({
      title: content.title || "",
      contentType: content.contentType || "text",
      body: content.body || "",
      blocks: existingBlocks.map((block) => ({
        ...block,
        ...(block.type === "code_example"
          ? {
              language: block.language || "html",
              code: block.code || DEFAULT_HTML,
              showPreview: block.showPreview !== false,
            }
          : {}),
      })),
      url: content.url || "",
      position: content.position || 1,
      visible: content.visible !== false,
    });

    setSelectedFile(null);
    setNotice("");
    setModalOpen(true);
  };

  /* =====================================================
     BLOCK MANAGEMENT
  ===================================================== */

  const updateBlock = (index, nextBlock) => {
    setForm((current) => ({
      ...current,
      blocks: current.blocks.map((block, blockIndex) =>
        blockIndex === index ? nextBlock : block
      ),
    }));
  };

  const changeBlockType = (index, type) => {
    const previous = form.blocks[index];

    if (type === "code_example") {
      updateBlock(index, createEmptyBlock("code_example"));
      return;
    }

    const text = blockToText(previous);
    const next = createEmptyBlock(type);

    if (Array.isArray(next.items)) {
      next.items = text ? text.split("\n") : [""];
    } else {
      next.text = text;
    }

    updateBlock(index, next);
  };

  const addBlock = (type) => {
    setForm((current) => ({
      ...current,
      blocks: [
        ...current.blocks,
        createEmptyBlock(type),
      ],
    }));
  };

  const removeBlock = (index) => {
    setForm((current) => ({
      ...current,
      blocks: current.blocks.filter(
        (_, blockIndex) => blockIndex !== index
      ),
    }));
  };

  /* =====================================================
     SAVE
  ===================================================== */

  const submit = async (event) => {
    event.preventDefault();

    if (!form.title.trim()) return;

    setBusy(true);
    setNotice("");

    try {
      const url = form.url.trim();

      const fileMeta = selectedFile
        ? {
            name: selectedFile.name,
            size: selectedFile.size,
            type:
              selectedFile.type ||
              "application/octet-stream",
            lastModified: selectedFile.lastModified,
            demoOnly: true,
          }
        : form.contentType === "text"
          ? null
          : editing?.fileMeta || null;

      const blocks = form.blocks
        .map((block) => {
          if (block.type === "code_example") {
            return {
              type: "code_example",
              language: block.language || "html",
              code: String(block.code || ""),
              showPreview: block.showPreview !== false,
            };
          }

          if (
            block.type === "bullet_list" ||
            block.type === "numbered_list"
          ) {
            return {
              type: block.type,
              items: block.items
                .map((item) => item.trim())
                .filter(Boolean),
            };
          }

          return {
            type: block.type,
            text: String(block.text || "").trim(),
          };
        })
        .filter((block) => {
          if (block.type === "code_example") {
            return Boolean(block.code.trim());
          }

          if (Array.isArray(block.items)) {
            return block.items.length > 0;
          }

          return Boolean(block.text);
        });

      const payload = {
        title: form.title.trim(),
        contentType: form.contentType,
        body: deriveBody(blocks, form.body),
        blocks:
          form.contentType === "text" ? blocks : [],
        url,
        fileMeta,
        position: Number(form.position) || contents.length + 1,
        visible: Boolean(form.visible),
      };

      if (editing) {
        await teacherActions.updateContent(
          editing.id,
          payload
        );
      } else {
        await teacherActions.createContent(
          module.id,
          payload
        );
      }

      setModalOpen(false);
      setSelectedFile(null);
      setNotice(
        editing
          ? "Learning content updated successfully."
          : "Learning content created successfully."
      );

    } catch (error) {
      setNotice(
        error.message || "Unable to save learning content."
      );
    } finally {
      setBusy(false);
    }
  };

  /* =====================================================
     DELETE
  ===================================================== */

  const remove = async (content) => {
    if (!window.confirm(i18n.t("Delete \"{{name}}\"?", { name: content.title, ns: "ui" }))) {
      return;
    }

    try {
      await teacherActions.deleteContent(content.id);
      setNotice("Content deleted successfully.");
    } catch (error) {
      setNotice(
        error.message || "Unable to delete content."
      );
    }
  };

  const acceptedFiles =
    form.contentType === "video"
      ? "video/*"
      : ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt";

  const visibleCount = contents.filter(
    (item) => item.visible
  ).length;

  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <TeacherLayout>

      <div className="mx-auto w-full max-w-[1500px]">

        {/* PAGE HEADER */}

        <PageHeader
          title={translateValue("Module content")}
          description={translateValue("Manage lessons and learning resources inside your module.")}
          backLink={
            <Link
              to={`/teacher/courses/${course.id}/modules`}
              className="mb-3 inline-flex items-center gap-1.5 text-[11px] font-bold text-[#7D9295] hover:text-[#06424B]"
            >
              <ArrowLeft size={14} />
              {translateValue("Back to modules")}</Link>
          }
          actions={
            <Button onClick={openCreate}>
              <Plus size={15} />
              {translateValue("Add content")}</Button>
          }
        />

        {/* NOTICE */}

        {notice && (
          <div className="mb-5 flex items-center justify-between rounded-xl border border-[#E9DCC0] bg-[#FFF9EC] px-4 py-3 text-[11px] text-[#89651F]">
            {translateValue(notice)}

            <button
              type="button"
              onClick={() => setNotice("")}
              className="hover:text-[#5C4316]"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* MODULE OVERVIEW */}

        <section className="mb-7 overflow-hidden rounded-[20px] border border-[#DDE8E8] bg-white shadow-[0_3px_15px_rgba(18,59,67,0.035)]">

          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">

            <div className="min-w-0">

              <p className="text-[9px] font-extrabold uppercase tracking-[1.3px] text-[#B27B20]">
                {translateValue(course.fullName)}
              </p>

              <h2 className="mt-1 text-[18px] font-extrabold text-[#17464D]">
                {translateValue(module.name)}
              </h2>

              <p className="mt-1 text-[10px] text-[#8B9B9D]">
                {translateValue(module.summary || "Manage learning materials for this module.")}
              </p>

            </div>

            <div className="flex items-center gap-2">
              <StatusPill visible={module.visible} />

              <span className="rounded-full bg-[#EAF2F1] px-3 py-1.5 text-[10px] font-bold text-[#52777B]">
                {translateValue(contents.length)} {translateValue("content items")}</span>
            </div>

          </div>

          <div className="grid grid-cols-3 border-t border-[#EAF0F0] bg-[#FAFCFC]">

            <div className="px-4 py-4 sm:px-5">
              <p className="text-[9px] font-bold uppercase tracking-wider text-[#94A4A5]">
                {translateValue("Total content")}</p>
              <p className="mt-1 text-[20px] font-extrabold text-[#17464D]">
                {translateValue(contents.length.toString().padStart(2, "0"))}
              </p>
            </div>

            <div className="border-l border-[#EAF0F0] px-4 py-4 sm:px-5">
              <p className="text-[9px] font-bold uppercase tracking-wider text-[#94A4A5]">
                {translateValue("Visible")}</p>
              <p className="mt-1 text-[20px] font-extrabold text-[#17464D]">
                {translateValue(visibleCount.toString().padStart(2, "0"))}
              </p>
            </div>

            <div className="border-l border-[#EAF0F0] px-4 py-4 sm:px-5">
              <p className="text-[9px] font-bold uppercase tracking-wider text-[#94A4A5]">
                {translateValue("Hidden")}</p>
              <p className="mt-1 text-[20px] font-extrabold text-[#17464D]">
                {translateValue((contents.length - visibleCount).toString().padStart(2, "0"))}
              </p>
            </div>

          </div>

        </section>

        {/* LEARNING MATERIALS */}

        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">

          <div>
            <h2 className="text-[15px] font-extrabold text-[#17464D]">
              {translateValue("Learning materials")}</h2>

            <p className="mt-1 text-[10px] text-[#8B9B9D]">
              {translateValue("Text lessons, videos and documents are managed inside this module.")}</p>
          </div>

          <span className="text-[10px] font-semibold text-[#91A1A3]">
            {translateValue(visibleCount)} {translateValue("visible to students")}</span>

        </div>

        {/* CONTENT CARDS */}

        {contents.length ? (

          <div className="space-y-3">

            {contents.map((content, index) => (

              <article
                key={content.id}
                className="rounded-[18px] border border-[#E0E9E9] bg-white p-4 shadow-[0_4px_14px_rgba(18,59,67,0.025)] transition hover:border-[#BDD3D2] sm:p-5"
              >

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

                  <div className="flex items-center gap-3">

                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-[#F4F7F7] text-[10px] font-extrabold text-[#7C9295]">
                      {translateValue(String(content.position || index + 1).padStart(2, "0"))}
                    </span>

                    <LessonIcon type={content.contentType} />

                  </div>

                  <div className="min-w-0 flex-1">

                    <div className="flex flex-wrap items-center gap-2">

                      <h3 className="text-[12px] font-extrabold text-[#17464D]">
                        {translateValue(content.title)}
                      </h3>

                      <StatusPill visible={content.visible} />

                    </div>

                    <p className="mt-1 line-clamp-2 text-[10px] leading-5 text-[#87999B]">
                      {translateValue(content.body || "No description added.")}
                    </p>

                    {content.url && (
                      <a
                        href={content.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-flex items-center gap-1 text-[9px] font-semibold text-[#B27B20] hover:underline"
                      >
                        {translateValue("Open attached resource")}<UploadCloud size={11} />
                      </a>
                    )}

                    {content.fileMeta?.name && (
                      <p className="mt-1 inline-flex items-center gap-1 text-[9px] font-semibold text-[#52777B]">
                        <File size={11} />
                        {translateValue(content.fileMeta.name)}
                        <span className="font-normal text-[#91A1A3]">
                          {translateValue("(demo file record)")}</span>
                      </p>
                    )}

                    {content.contentType === "text" &&
                      content.blocks?.some(
                        (block) => block.type === "code_example"
                      ) && (
                        <span className="mt-2 inline-flex items-center gap-1 rounded-md bg-[#EAF2F1] px-2 py-1 text-[9px] font-bold text-[#315B60]">
                          <Code2 size={11} />
                          {translateValue(content.blocks.filter(
                            (block) => block.type === "code_example"
                          ).length)} {translateValue("code examples")}</span>
                      )}

                  </div>

                  <span className="w-fit rounded-lg bg-[#F6F8F8] px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wide text-[#71878A]">
                    {translateValue(content.contentType)}
                  </span>

                  <div className="flex items-center gap-1 border-t border-[#F0F3F3] pt-2 sm:border-0 sm:pt-0">

                    <button
                      type="button"
                      onClick={() => openEdit(content)}
                      title={translateValue("Edit content")}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-[#819699] hover:bg-[#EEF4F3] hover:text-[#06424B]"
                    >
                      <Pencil size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={() => remove(content)}
                      title={translateValue("Delete content")}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-[#A4B0B1] hover:bg-[#FFF1EF] hover:text-[#B65345]"
                    >
                      <Trash2 size={14} />
                    </button>

                  </div>

                </div>

              </article>

            ))}

          </div>

        ) : (

          <EmptyState
            icon={FileText}
            title={translateValue("No content in this module")}
            description={translateValue("Add text lessons, videos or supporting documents to start building this module.")}
            action={
              <Button onClick={openCreate}>
                <Plus size={14} />
                {translateValue("Add content")}</Button>
            }
          />

        )}

      </div>

      {/* =================================================
          ADD / EDIT MODAL
      ================================================= */}

      <Modal
        open={modalOpen}
        onClose={() => !busy && setModalOpen(false)}
        title={translateValue(editing ? "Edit learning content" : "Add learning content")}
        description={translateValue("Create a learning resource for {{module}}.", { module: translateValue(module.name) })}
        width="max-w-5xl"
      >

        <form onSubmit={submit} className="space-y-5">

          {/* BASIC INFORMATION */}

          <div className="rounded-[16px] border border-[#E5ECEC] bg-[#FAFCFC] p-4 sm:p-5">

            <div className="mb-4">
              <h3 className="text-[12px] font-extrabold text-[#17464D]">
                {translateValue("Basic information")}</h3>
              <p className="mt-1 text-[10px] text-[#87999B]">
                {translateValue("Enter the content title and select the learning format.")}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_120px]">

              <Field label={translateValue("Content title")} required>
                <input
                  required
                  maxLength={150}
                  value={form.title}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      title: event.target.value,
                    })
                  }
                  placeholder={translateValue("e.g. Introduction to HTML")}
                  className={inputClass}
                />
              </Field>

              <Field label={translateValue("Position")}>
                <input
                  type="number"
                  min="1"
                  required
                  value={form.position}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      position: event.target.value,
                    })
                  }
                  className={inputClass}
                />
              </Field>

            </div>

            <Field label={translateValue("Content type")}>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

                {contentTypeOptions.map((option) => {

                  const Icon = option.icon;
                  const selected =
                    form.contentType === option.value;

                  return (

                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setForm({
                          ...form,
                          contentType: option.value,
                        });
                        setSelectedFile(null);
                      }}
                      className={`relative flex items-center gap-3 rounded-[13px] border p-3 text-left transition ${
                        selected
                          ? "border-[#06424B] bg-[#EDF5F4] shadow-[0_0_0_1px_#06424B]"
                          : "border-[#E0E9E9] bg-white hover:border-[#B7CCCC]"
                      }`}
                    >

                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                          selected
                            ? "bg-[#06424B] text-white"
                            : "bg-[#F1F5F5] text-[#638084]"
                        }`}
                      >
                        <Icon size={18} />
                      </div>

                      <div className="min-w-0">
                        <p className="text-[11px] font-extrabold text-[#31565B]">
                          {translateValue(option.label)}
                        </p>
                        <p className="mt-1 text-[9px] leading-4 text-[#8B9B9D]">
                          {translateValue(option.description)}
                        </p>
                      </div>

                      {selected && (
                        <Check
                          size={14}
                          className="absolute right-2 top-2 text-[#06424B]"
                        />
                      )}

                    </button>

                  );
                })}

              </div>

            </Field>

          </div>

          {/* TEXT LESSON */}

          {form.contentType === "text" && (

            <div className="rounded-[16px] border border-[#E1EAEA] bg-white p-4 sm:p-5">

              <div className="mb-4">
                <h3 className="text-[13px] font-extrabold text-[#17464D]">
                  {translateValue("Lesson content")}</h3>

                <p className="mt-1 text-[10px] text-[#87999B]">
                  {translateValue("Organize your explanation with text, lists and coding examples.")}</p>
              </div>

              {/* CONTENT BLOCKS */}

              <div className="space-y-4">

                {form.blocks.map((block, index) => (

                  <div
                    key={`${index}-${block.type}`}
                    className="rounded-[13px] border border-[#E3EBEB] bg-[#FAFCFC] p-3.5 sm:p-4"
                  >

                    {/* BLOCK TOOLBAR */}

                    <div className="mb-3 flex items-center gap-2">

                      <GripVertical
                        size={15}
                        className="shrink-0 text-[#A6B4B5]"
                      />

                      <select
                        value={block.type}
                        onChange={(event) =>
                          changeBlockType(index, event.target.value)
                        }
                        className="h-9 max-w-[190px] rounded-lg border border-[#DDE7E7] bg-white px-3 text-[10px] font-bold text-[#31565B] outline-none focus:border-[#06424B]"
                      >
                        {blockTypes.map((type) => (
                          <option
                            key={type.value}
                            value={type.value}
                          >
                            {translateValue(type.label)}
                          </option>
                        ))}
                      </select>

                      {block.type === "code_example" && (
                        <span className="rounded-md bg-[#EAF2F1] px-2 py-1 text-[9px] font-bold text-[#315B60]">
                          {translateValue("Coding example")}</span>
                      )}

                      <span className="flex-1" />

                      <button
                        type="button"
                        onClick={() => removeBlock(index)}
                        aria-label={translateValue("Remove block")}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#A9B3B4] hover:bg-[#FFF2F0] hover:text-[#A94D40]"
                      >
                        <Trash2 size={14} />
                      </button>

                    </div>

                    {/* CODE EXAMPLE */}

                    {block.type === "code_example" && (

                      <CodeExampleEditor
                        block={block}
                        onChange={(nextBlock) =>
                          updateBlock(index, nextBlock)
                        }
                      />

                    )}

                    {/* LIST BLOCKS */}

                    {(block.type === "bullet_list" ||
                      block.type === "numbered_list") && (

                      <div className="space-y-2">

                        {block.items.map((item, itemIndex) => (

                          <div
                            key={itemIndex}
                            className="flex items-center gap-2"
                          >

                            <span className="w-5 text-center text-[11px] font-bold text-[#8B9B9D]">
                              {translateValue(block.type === "bullet_list"
                                ? "•"
                                : `${itemIndex + 1}.`)}
                            </span>

                            <input
                              value={item}
                              onChange={(event) => {
                                const items = [...block.items];
                                items[itemIndex] = event.target.value;

                                updateBlock(index, {
                                  ...block,
                                  items,
                                });
                              }}
                              placeholder={translateValue("List item {{number}}", { number: itemIndex + 1 })}
                              className={inputClass}
                            />

                            <button
                              type="button"
                              onClick={() =>
                                updateBlock(index, {
                                  ...block,
                                  items: block.items.filter(
                                    (_, currentIndex) =>
                                      currentIndex !== itemIndex
                                  ),
                                })
                              }
                              aria-label={translateValue("Remove list item")}
                              className="px-2 text-[#A9B3B4] hover:text-[#A94D40]"
                            >
                              <X size={14} />
                            </button>

                          </div>

                        ))}

                        <button
                          type="button"
                          onClick={() =>
                            updateBlock(index, {
                              ...block,
                              items: [...block.items, ""],
                            })
                          }
                          className="ml-7 text-[10px] font-bold text-[#B27B20] hover:underline"
                        >
                          {translateValue("+ Add list item")}</button>

                      </div>

                    )}

                    {/* TEXT BLOCKS */}

                    {[
                      "heading",
                      "subheading",
                      "paragraph",
                    ].includes(block.type) && (

                      <textarea
                        rows={
                          block.type === "paragraph"
                            ? 3
                            : 2
                        }
                        value={block.text}
                        onChange={(event) =>
                          updateBlock(index, {
                            ...block,
                            text: event.target.value,
                          })
                        }
                        placeholder={
                          translateValue(block.type === "heading"
                            ? "Enter heading..."
                            : block.type === "subheading"
                              ? "Enter subheading..."
                              : "Write your explanation here...")
                        }
                        className={textareaClass}
                      />

                    )}

                  </div>

                ))}

              </div>

              {/* ADD BLOCK TOOLBAR */}

              <div className="mt-4 rounded-xl border border-dashed border-[#C9D9D9] bg-[#F8FAFA] p-3">

                <p className="mb-2 text-[10px] font-extrabold text-[#527176]">
                  {translateValue("Add content block")}</p>

                <div className="flex flex-wrap gap-2">

                  {blockTypes.map((type) => (

                    <button
                      key={type.value}
                      type="button"
                      onClick={() => addBlock(type.value)}
                      className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[10px] font-bold transition ${
                        type.value === "code_example"
                          ? "border-[#06424B] bg-[#EAF2F1] text-[#06424B] hover:bg-[#DCEBE9]"
                          : "border-[#DCE7E7] bg-white text-[#527176] hover:border-[#8FB5B5] hover:text-[#06424B]"
                      }`}
                    >
                      {type.value === "code_example" ? (
                        <Code2 size={13} />
                      ) : (
                        <Plus size={12} />
                      )}

                      {translateValue(type.label)}

                    </button>

                  ))}

                </div>

              </div>

              {/* BODY FALLBACK */}

              <div className="mt-4">
                <Field
                  label={translateValue("Plain-text fallback")}
                  hint="Optional. If empty, the lesson body is generated from its content blocks."
                >
                  <textarea
                    rows={2}
                    value={form.body}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        body: event.target.value,
                      })
                    }
                    placeholder={translateValue("Optional lesson description...")}
                    className={textareaClass}
                  />
                </Field>
              </div>

            </div>

          )}

          {/* VIDEO / DOCUMENT */}

          {(form.contentType === "video" ||
            form.contentType === "document") && (

            <div className="rounded-[16px] border border-[#E1EAEA] bg-white p-4 sm:p-5">

              <div className="mb-4">
                <h3 className="text-[12px] font-extrabold text-[#17464D]">
                  {translateValue("Resource attachment")}</h3>

                <p className="mt-1 text-[10px] text-[#87999B]">
                  {translateValue("Add a hosted resource URL or select a local demo file.")}</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">

                <Field label={translateValue("Hosted resource URL")}>
                  <input
                    type="url"
                    value={form.url}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        url: event.target.value,
                      })
                    }
                    placeholder={translateValue("https://...")}
                    className={inputClass}
                  />
                </Field>

                <Field
                  label={
                    translateValue(form.contentType === "video"
                      ? "Upload video"
                      : "Upload document")
                  }
                >

                  <input
                    type="file"
                    accept={acceptedFiles}
                    onChange={(event) =>
                      setSelectedFile(
                        event.target.files?.[0] || null
                      )
                    }
                    className="block w-full rounded-xl border border-[#DDE7E7] bg-white p-2.5 text-[10px] text-[#607A7E] file:mr-3 file:rounded-lg file:border-0 file:bg-[#E7F0EF] file:px-3 file:py-2 file:text-[10px] file:font-bold file:text-[#315B60]"
                  />

                  {selectedFile && (
                    <div className="mt-2 flex items-center gap-2 rounded-lg bg-[#F4F8F7] p-3">

                      <File size={16} className="text-[#06424B]" />

                      <div className="min-w-0">
                        <p className="truncate text-[10px] font-bold text-[#31565B]">
                          {translateValue(selectedFile.name)}
                        </p>
                        <p className="text-[9px] text-[#91A1A3]">
                          {translateValue(formatFileSize(selectedFile.size))}
                        </p>
                      </div>

                    </div>
                  )}

                  <p className="mt-1.5 text-[9px] text-[#91A1A3]">
                    {translateValue("Demo only: file name and details are saved locally.")}</p>

                </Field>

              </div>

            </div>

          )}

          {/* VISIBILITY */}

          <div className="flex flex-col gap-3 rounded-[13px] border border-[#E5ECEC] bg-[#F8FAFA] p-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <p className="text-[11px] font-extrabold text-[#31565B]">
                {translateValue("Student visibility")}</p>

              <p className="mt-1 text-[10px] text-[#91A1A3]">
                {translateValue("Control whether students can access this learning material.")}</p>
            </div>

            <label className="flex cursor-pointer items-center gap-2.5">

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

              <span className="text-[10px] font-bold text-[#526F73]">
                {translateValue("Visible to students")}</span>

            </label>

          </div>

          {/* MODAL FOOTER */}

          <div className="flex flex-col-reverse gap-2 border-t border-[#EDF1F1] pt-4 sm:flex-row sm:justify-end">

            <Button
              variant="secondary"
              onClick={() => setModalOpen(false)}
              disabled={busy}
            >
              {translateValue("Cancel")}</Button>

            <Button type="submit" disabled={busy}>
              {translateValue(busy
                ? "Saving..."
                : editing
                  ? "Save changes"
                  : "Add content")}
            </Button>

          </div>

        </form>

      </Modal>

    </TeacherLayout>
  );
}
