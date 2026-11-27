
import i18n from "../i18n";
import {
  clearDynamicTranslationStore,
  rememberDynamicTranslation,
  getDynamicTranslation,
  hydrateDynamicTranslationStore,
} from "../i18n/dynamicTranslationStore";
import { getAccessToken } from "./authSession";

const env = import.meta.env || {};
const API_BASE_URL = String(env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

// Set the backend translation API endpoint.
// If no endpoint is configured, use the default translation endpoint.
const TRANSLATION_API_PATH =
  env.VITE_TRANSLATION_API_PATH || "/api/translation/translate";

// Enable dynamic translation by default.
// Translation will be disabled only when the environment value is "false".
const TRANSLATION_ENABLED =
  String(env.VITE_DYNAMIC_CONTENT_TRANSLATION ?? "true").toLowerCase() !== "false";

// Define the target language for translation.
// "fr" means French.
const TARGET_LANGUAGE = "fr";

// Define the original language of the content.
// "en" means English.
const SOURCE_LANGUAGE = "en";

// Maximum number of text items sent in a single translation API request.
// Backend allows 200 items, but we send only 180 to keep a safety margin.
const MAX_TEXTS_PER_REQUEST = 180;

// Maximum number of text items allowed by the backend in one request.
const MAX_BACKEND_ITEMS_PER_REQUEST = 200;

// Maximum combined number of characters allowed in one translation API request.
// All text items in that request are counted together.
const MAX_CHARACTERS_PER_REQUEST = 24000;

// Maximum total characters allowed for translation processing in one operation.
const MAX_TRANSLATABLE_TEXT_LENGTH = 240000;

// Maximum number of characters allowed in one individual text chunk.
// We use 4500 to stay below the backend's 5000-character limit.
const MAX_TEXT_CHUNK_LENGTH = 4500;

// Maximum number of characters the backend accepts for one text item.
const MAX_BACKEND_TEXT_LENGTH = 5000;

// Maximum number of translation API requests allowed to run simultaneously.
// Other requests must wait until one of the active requests finishes.
const MAX_CONCURRENT_TRANSLATION_REQUESTS = 2;

// Maximum number of translation entries allowed in the in-memory cache.
// Previously translated text can be reused without another API request.
const MAX_CACHE_ENTRIES = 12000;

// Maximum time to wait for a translation API response.
// 30000 milliseconds means 30 seconds.
const REQUEST_TIMEOUT_MS = 30000;

// Maximum number of unique text items that can be registered
// for dynamic translation in the application.
const MAX_REGISTERED_TEXTS = 24000;

// Translate every human-readable string in learner-facing API responses.
// Machine values, identifiers, account data, and executable code are protected.
const TRANSLATABLE_ARRAY_FIELDS = new Set([
  "options",
  "choices",
  "answer_options",
  "answeroptions",
  "option_labels",
  "optionlabels",
  "alternatives",
  "benefits",
  "features",
  "learningoutcomes",
  "learning_outcomes",
  "learningobjectives",
  "learning_objectives",
  "objectives",
  "instructions",
  "points",
  "examples",
  "prerequisites",
  "competencies",
  "requirements",
  "criteria",
  "rubric",
  "skills",
  "steps",
  "items",
  "labels",
  "titles",
  "names",
  "messages",
  "feedback",
  "strengths",
  "improvement_areas",
  "improvementareas",
  "hints",
  "outcomes",
  "subtopics",
  "chapters",
  "sections",
  "topics",
  "categories",
  "courses",
  "modules",
  "contents",
  "lessons",
  "questions",
  "resources",
  "tags",
  "data",
  "errors",
]);

// Never enter these subtrees: they can contain personal names or account data.
const EXCLUDED_SUBTREES = new Set([
  "user",
  "users",
  "student",
  "students",
  "teacher",
  "teachers",
  "author",
  "authors",
  "createdby",
  "created_by",
  "updatedby",
  "updated_by",
  "owner",
  "profile",
  "account",
  "personalinfo",
  "personal_info",
  "contact",
  "contacts",
  "personaldata",
  "personal_data",
  "permissions",
  "roles",
]);

// These fields represent machine-readable values or executable assets, not prose.
const EXCLUDED_FIELDS = new Set([
  "id",
  "uuid",
  "key",
  "value",
  "email",
  "username",
  "user_name",
  "firstname",
  "first_name",
  "lastname",
  "last_name",
  "studentname",
  "student_name",
  "teachername",
  "teacher_name",
  "ownername",
  "owner_name",
  "createdbyname",
  "created_by_name",
  "updatedbyname",
  "updated_by_name",
  "phone",
  "mobile",
  "password",
  "token",
  "accesstoken",
  "access_token",
  "refreshtoken",
  "refresh_token",
  "authorization",
  "code",
  "coursecode",
  "course_code",
  "shortcode",
  "short_code",
  "referencecode",
  "reference_code",
  "idnumber",
  "id_number",
  "externalid",
  "external_id",
  "startercode",
  "starter_code",
  "sourcecode",
  "source_code",
  "javascript",
  "typescript",
  "css",
  "html",
  "sql",
  "language",
  "lang",
  "status",
  "state",
  "kind",
  "type",
  "slug",
  "url",
  "href",
  "uri",
  "image",
  "imageurl",
  "image_url",
  "fileurl",
  "file_url",
  "filename",
  "file_name",
  "mime_type",
  "mimetype",
  "correctanswer",
  "correct_answer",
  "answerkey",
  "answer_key",
  "answer",
  "expectedoutput",
  "expected_output",
  "expectedanswer",
  "expected_answer",
  "correctoption",
  "correct_option",
  "correctoptionid",
  "correct_option_id",
  "studentanswer",
  "student_answer",
  "useranswer",
  "user_answer",
  "submittedanswer",
  "submitted_answer",
  "selectedanswer",
  "selected_answer",
  "testcases",
  "test_cases",
  "attemptid",
  "attempt_id",
  "courseid",
  "course_id",
  "moduleid",
  "module_id",
  "questionid",
  "question_id",
  "assignmentid",
  "assignment_id",
  "userid",
  "user_id",
  "studentid",
  "student_id",
  "teacherid",
  "teacher_id",
  "date",
  "startdate",
  "start_date",
  "enddate",
  "end_date",
  "duedate",
  "due_date",
  "deadline",
  "deadline_at",
  "createdat",
  "created_at",
  "updatedat",
  "updated_at",
  "deletedat",
  "deleted_at",
  "publishedat",
  "published_at",
  "expiresat",
  "expires_at",
  "timestamp",
  "timezone",
  "locale",
  "currency",
  "countrycode",
  "country_code",
  "postalcode",
  "postal_code",
  "zip_code",
  "sortby",
  "sort_by",
  "orderby",
  "order_by",
  "httpstatus",
  "http_status",
  "requestid",
  "request_id",
  "traceid",
  "trace_id",
]);

const OPTION_ARRAY_FIELDS = new Set([
  "options",
  "choices",
  "answer_options",
  "answeroptions",
  "option_labels",
  "optionlabels",
  "alternatives",
]);

const QUESTION_TEXT_FIELDS = new Set([
  "question",
  "questiontext",
  "question_text",
  "prompt",
]);

const QUESTION_ANSWER_FIELDS = new Set([
  "answer",
  "correctanswer",
  "correct_answer",
]);

const normalizeKey = (key) =>
  String(key || "").replace(/[-\s]/g, "_").toLowerCase();

const MACHINE_VALUE_PATTERN =
  /^(?:true|false|null|undefined|none|yes|no|\d+(?:\.\d+)?|#[0-9a-f]{3,8}|[a-z][a-z0-9]*(?:_[a-z0-9]+)+)$/i;

const URL_OR_EMAIL_PATTERN =
  /^(?:https?:\/\/|mailto:|tel:|[^\s@]+@[^\s@]+\.[^\s@]+$)/i;

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}(?:[tT ].*)?$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f-]{27,}$/i;

function shouldTranslateField(key, value, insideCodeBlock, context = {}) {
  const normalized = normalizeKey(key);

  const isNaturalCorrectAnswer =
    context.allowCorrectAnswer === true &&
    typeof value === "string" &&
    value.trim().length >= 20 &&
    /\s/.test(value.trim());

  const isNaturalOptionValue =
    context.allowOptionValue === true &&
    typeof value === "string" &&
    value.trim().length >= 20 &&
    /\s/.test(value.trim());

  if (
    EXCLUDED_FIELDS.has(normalized) &&
    !isNaturalCorrectAnswer &&
    !isNaturalOptionValue
  ) {
    return false;
  }

  if (/(?:^|_)(?:id|uuid)$/.test(normalized) || /(?:id|uuid)$/.test(normalized)) {
    return false;
  }

  if (/(?:token|password|secret|authorization)/i.test(normalized)) {
    return false;
  }

  if (typeof value !== "string") return false;

  const trimmed = value.trim();

  if (!trimmed || trimmed.length > MAX_TRANSLATABLE_TEXT_LENGTH) {
    return false;
  }

  // Preserve short catalogue identifiers such as CRS029, PY-101 and HTML5.
  // These are codes/labels, not learner-facing prose, and should never consume
  // translation quota or be altered by a machine translation service.
  if (
    !/\s/.test(trimmed) &&
    (
      /^[A-Z0-9_+#./-]{2,24}$/.test(trimmed) ||
      (
        /[A-Za-z]/.test(trimmed) &&
        /\d/.test(trimmed) &&
        /^[A-Za-z][A-Za-z0-9._/#-]*$/.test(trimmed)
      )
    )
  ) {
    return false;
  }

  if (/(?:course|module|category|question|assignment|reference|external)?code$/.test(normalized)) {
    return false;
  }

  const isDisplayContentType =
    normalized === "contenttype" || normalized === "content_type";

  if (
    /(?:type|status|state|role|kind|format|method|mode|language|lang)$/.test(normalized) &&
    !isDisplayContentType
  ) {
    return false;
  }

  if (
    isDisplayContentType &&
    /^[a-z0-9.+-]+\/[a-z0-9.+-]+$/i.test(trimmed)
  ) {
    return false;
  }

  if (/(?:^|_)(?:code|source|snippet|testcase|test_case)(?:$|_)/i.test(normalized)) {
    return false;
  }

  if (/(?:responsevalue|selectedvalue)/i.test(normalized)) {
    return false;
  }

  if (
    (isNaturalCorrectAnswer || isNaturalOptionValue) &&
    /^\s*(?:def|class|function|const|let|var|return|import|export|SELECT|INSERT|UPDATE|DELETE)\b|console\.|print\s*\(|=>|<\/?[A-Za-z][\s>]/im.test(trimmed)
  ) {
    return false;
  }

  if (
    /(?:date|time|timestamp|(?:created|updated|deleted|published|expires|attempt|modified)at|_at)$/.test(normalized)
  ) {
    return false;
  }

  if (
    insideCodeBlock &&
    ["text", "content", "body", "example", "code"].includes(normalized)
  ) {
    return false;
  }

  if (MACHINE_VALUE_PATTERN.test(trimmed) || URL_OR_EMAIL_PATTERN.test(trimmed)) {
    return false;
  }

  if (/^[A-Z0-9_+#.-]{1,5}$/.test(trimmed)) return false;

  if (ISO_DATE_PATTERN.test(trimmed) || UUID_PATTERN.test(trimmed)) {
    return false;
  }

  // A source-language sentence/name/label needs at least one letter.
  return /[\p{L}]/u.test(trimmed);
}

const translationCache = new Map();
const registeredApiTexts = new Map();

// Requests for identical text share one promise, even when separate API
// responses are preloaded at the same time.
const inFlightChunkTranslations = new Map();

// Tracks failed chunks so a candidate field is never assembled from mixed languages.
const failedTranslationChunks = new Set();

let prewarmPromise = null;
let warnedAboutTranslationFailure = false;

const isPlainObject = (value) =>
  value !== null &&
  typeof value === "object" &&
  (
    Object.getPrototypeOf(value) === Object.prototype ||
    Object.getPrototypeOf(value) === null
  );

const isHtmlContent = (text) => /<\/?[a-z][\s\S]*>/i.test(text);

function cacheSet(key, value) {
  if (translationCache.has(key)) {
    translationCache.delete(key);
  }

  translationCache.set(key, value);

  if (translationCache.size > MAX_CACHE_ENTRIES) {
    const oldestKey = translationCache.keys().next().value;
    translationCache.delete(oldestKey);
  }
}

function protectContentTokens(text) {
  const tokens = [];

  const protectedText = String(text).replace(
    /```[\s\S]*?```|~~~[\s\S]*?~~~|<pre\b[\s\S]*?<\/pre>|<code\b[\s\S]*?<\/code>|<script\b[\s\S]*?<\/script>|<style\b[\s\S]*?<\/style>|\$\{[^{}]+\}|\{\{[^{}]+\}\}|`[^`\n]+`|\$\$[\s\S]*?\$\$|\$[^$\n]+\$|%\d*\$?[sdif]|:[A-Za-z_][A-Za-z0-9_]*|https?:\/\/[^\s<>"']+|&(?:[A-Za-z]+|#\d+|#x[0-9a-f]+);/g,
    (token) => {
      const marker = `SKILLNEXTTOKEN${tokens.length}PLACEHOLDER`;
      tokens.push([marker, token]);
      return marker;
    },
  );

  return {
    text: protectedText,
    restore: (translated) =>
      tokens.reduce(
        (result, [marker, token]) => result.replaceAll(marker, token),
        translated,
      ),
  };
}

function collectTranslatablePaths(root) {
  const candidates = [];

  const visit = (
    value,
    path = [],
    parentKey = "",
    insideCodeBlock = false,
    context = {},
  ) => {
    if (typeof value === "string") {
      if (shouldTranslateField(parentKey, value, insideCodeBlock, context)) {
        candidates.push({
          path,
          text: value,
          mimeType: isHtmlContent(value) ? "text/html" : "text/plain",
        });
      }

      return;
    }

    if (Array.isArray(value)) {
      const normalizedParent = normalizeKey(parentKey);

      const isOptionArray =
        context.insideOptionRecord === true ||
        OPTION_ARRAY_FIELDS.has(normalizedParent);

      value.forEach((item, index) => {
        if (
          typeof item === "string" &&
          TRANSLATABLE_ARRAY_FIELDS.has(normalizedParent) &&
          shouldTranslateField(parentKey, item, insideCodeBlock, context)
        ) {
          candidates.push({
            path: [...path, index],
            text: item,
            mimeType: isHtmlContent(item) ? "text/html" : "text/plain",
          });
        } else if (item !== null && typeof item === "object") {
          visit(
            item,
            [...path, index],
            parentKey,
            insideCodeBlock,
            {
              ...context,
              insideOptionRecord: isOptionArray,
            },
          );
        }
      });

      return;
    }

    if (!isPlainObject(value)) return;

    const blockType = normalizeKey(value.type);

    const isCodeBlock =
      insideCodeBlock ||
      [
        "code",
        "code_example",
        "code_practice",
        "coding",
        "codeexample",
        "codepractice",
      ].includes(blockType);

    const isQuestionRecord =
      context.isQuestionRecord === true ||
      Object.keys(value).some((field) =>
        QUESTION_TEXT_FIELDS.has(normalizeKey(field))
      );

    for (const [key, child] of Object.entries(value)) {
      const normalizedKey = normalizeKey(key);

      if (EXCLUDED_SUBTREES.has(normalizedKey)) continue;

      if (
        EXCLUDED_FIELDS.has(normalizedKey) &&
        !(
          isQuestionRecord &&
          QUESTION_ANSWER_FIELDS.has(normalizedKey)
        ) &&
        !(
          context.insideOptionRecord === true &&
          normalizedKey === "value"
        )
      ) {
        continue;
      }

      const childContext = {
        isQuestionRecord,
        insideOptionRecord: context.insideOptionRecord === true,
        allowCorrectAnswer:
          isQuestionRecord &&
          QUESTION_ANSWER_FIELDS.has(normalizedKey),
        allowOptionValue:
          context.insideOptionRecord === true &&
          normalizedKey === "value",
      };

      visit(
        child,
        [...path, key],
        key,
        isCodeBlock,
        childContext,
      );
    }
  };

  visit(root);

  return candidates;
}

function setImmutable(root, path, value) {
  if (!path.length) return value;

  const [head, ...tail] = path;
  const clone = Array.isArray(root) ? root.slice() : { ...root };

  clone[head] = setImmutable(root[head], tail, value);

  return clone;
}

function getTranslationEndpoint() {
  if (/^https?:\/\//i.test(TRANSLATION_API_PATH)) {
    return TRANSLATION_API_PATH;
  }

  if (!API_BASE_URL) return "";

  return `${API_BASE_URL}${TRANSLATION_API_PATH.startsWith("/") ? "" : "/"}${TRANSLATION_API_PATH}`;
}

async function requestTranslations(texts, mimeType) {
  // Enforce backend validation limits before sending any request.
  if (!Array.isArray(texts) || texts.length > MAX_BACKEND_ITEMS_PER_REQUEST) {
    throw new Error(
      `Translation batch exceeds the backend limit of ${MAX_BACKEND_ITEMS_PER_REQUEST} text items.`
    );
  }

  const oversizedIndex = texts.findIndex(
    (text) =>
      typeof text !== "string" ||
      text.length > MAX_BACKEND_TEXT_LENGTH,
  );

  if (oversizedIndex !== -1) {
    throw new Error(
      `Translation text at index ${oversizedIndex} exceeds ${MAX_BACKEND_TEXT_LENGTH} characters.`
    );
  }

  const token = getAccessToken();
  const endpoint = getTranslationEndpoint();

  if (!endpoint) {
    throw new Error("Translation endpoint is not configured.");
  }

  if (!token) {
    throw new Error("An authenticated session is required for translation.");
  }

  const controller = new AbortController();

  const timeoutId = window.setTimeout(
    () => controller.abort(),
    REQUEST_TIMEOUT_MS,
  );

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${String(token).replace(/^Bearer\s+/i, "")}`,
        "Accept-Language": TARGET_LANGUAGE,
      },
      body: JSON.stringify({
        texts,
        sourceLanguage: SOURCE_LANGUAGE,
        targetLanguage: TARGET_LANGUAGE,
        mimeType,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Translation endpoint returned HTTP ${response.status}.`
      );
    }

    const payload = await response.json();

    // Support the common response envelopes used by the translation API while
    // keeping array order aligned with the submitted `texts` array.
    const translated =
      payload?.translations ??
      payload?.data?.translations ??
      payload?.translatedTexts ??
      payload?.translated_texts ??
      (Array.isArray(payload?.data) ? payload.data : undefined);

    if (!Array.isArray(translated) || translated.length !== texts.length) {
      const message =
        payload?.message ||
        payload?.detail ||
        "Translation endpoint returned an unexpected response.";

      throw new Error(String(message));
    }

    return translated.map((item, index) => {
      const value =
        typeof item === "string"
          ? item
          : item?.translatedText ??
            item?.translated_text ??
            item?.translation ??
            item?.text;

      return typeof value === "string" && value.trim()
        ? value
        : texts[index];
    });
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function splitPlainText(text) {
  if (text.length <= MAX_TEXT_CHUNK_LENGTH) {
    return [text];
  }

  const chunks = [];
  let start = 0;

  while (start < text.length) {
    const hardEnd = Math.min(
      start + MAX_TEXT_CHUNK_LENGTH,
      text.length,
    );

    let end = hardEnd;

    if (hardEnd < text.length) {
      const searchFrom =
        start + Math.floor(MAX_TEXT_CHUNK_LENGTH * 0.55);

      const separators = [
        {
          token: "\n\n",
          index: text.lastIndexOf("\n\n", hardEnd),
        },
        {
          token: "\n",
          index: text.lastIndexOf("\n", hardEnd),
        },
        {
          token: ". ",
          index: text.lastIndexOf(". ", hardEnd),
        },
        {
          token: " ",
          index: text.lastIndexOf(" ", hardEnd),
        },
      ].filter(
        (item) =>
          item.index >= searchFrom &&
          item.index + item.token.length <= hardEnd
      );

      if (separators.length) {
        separators.sort((a, b) => b.index - a.index);

        end =
          separators[0].index +
          separators[0].token.length;
      }
    }

    // The hard boundary is authoritative: never produce a chunk over 4,500.
    end = Math.min(end, hardEnd);

    if (end <= start) {
      end = hardEnd;
    }

    chunks.push(text.slice(start, end));
    start = end;
  }

  return chunks;
}

async function translatePendingChunks(pendingChunks, mimeType) {
  const results = new Array(pendingChunks.length);
  const ownedRequests = [];
  const failedCandidateKeys = new Set();

  // Reuse completed translations and requests already running for the same text.
  pendingChunks.forEach((item, index) => {
    const cacheKey =
      `${TARGET_LANGUAGE}|chunk|${mimeType}|${item.text}`;

    if (translationCache.has(cacheKey)) {
      results[index] = translationCache.get(cacheKey);
      return;
    }

    const existingRequest =
      inFlightChunkTranslations.get(cacheKey);

    if (existingRequest) {
      results[index] = existingRequest;
      return;
    }

    let resolveRequest;

    const requestPromise = new Promise((resolve) => {
      resolveRequest = resolve;
    });

    inFlightChunkTranslations.set(cacheKey, requestPromise);

    results[index] = requestPromise;

    ownedRequests.push({
      index,
      item,
      cacheKey,
      resolve: resolveRequest,
    });
  });

  // Build request batches below both backend limits (200 items / 5,000 chars).
  const batches = [];

  for (let offset = 0; offset < ownedRequests.length;) {
    const batch = [];
    let totalCharacters = 0;

    while (
      offset < ownedRequests.length &&
      batch.length < MAX_TEXTS_PER_REQUEST
    ) {
      const entry = ownedRequests[offset];
      const itemLength = entry.item.text.length;

      if (itemLength > MAX_BACKEND_TEXT_LENGTH) {
        failedCandidateKeys.add(entry.item.key);
        entry.resolve(entry.item.text);
        inFlightChunkTranslations.delete(entry.cacheKey);
        offset += 1;
        continue;
      }

      if (
        batch.length > 0 &&
        totalCharacters + itemLength > MAX_CHARACTERS_PER_REQUEST
      ) {
        break;
      }

      batch.push(entry);
      totalCharacters += itemLength;
      offset += 1;
    }

    if (batch.length) {
      batches.push(batch);
    }
  }

  let nextBatchIndex = 0;

  const processBatch = async (batch) => {
    try {
      const translatedTexts = await requestTranslations(
        batch.map((entry) => entry.item.text),
        mimeType,
      );

      batch.forEach((entry, index) => {
        const translatedText =
          translatedTexts[index] || entry.item.text;

        // Cache unchanged results too, so technical terms are not requested again.
        cacheSet(entry.cacheKey, translatedText);

        failedTranslationChunks.delete(entry.cacheKey);
        entry.resolve(translatedText);
      });
    } catch (error) {
      // Do not cache failures. Other batches continue, and affected fields stay
      // entirely in English instead of rendering partially translated content.
      batch.forEach((entry) => {
        failedCandidateKeys.add(entry.item.key);
        failedTranslationChunks.add(entry.cacheKey);
        entry.resolve(entry.item.text);
      });

      console.error(
        "Skill Next translation batch failed. Strict French views will wait instead of displaying untranslated source text; remaining batches will continue.",
        error,
      );
    } finally {
      batch.forEach((entry) => {
        inFlightChunkTranslations.delete(entry.cacheKey);
      });
    }
  };

  // Small concurrency improves lesson load time without flooding the backend.
  const workerCount = Math.min(
    MAX_CONCURRENT_TRANSLATION_REQUESTS,
    batches.length,
  );

  await Promise.all(
    Array.from({ length: workerCount }, async () => {
      while (nextBatchIndex < batches.length) {
        const batchIndex = nextBatchIndex++;
        await processBatch(batches[batchIndex]);
      }
    }),
  );

  const translatedTexts = await Promise.all(
    results.map((result) => Promise.resolve(result)),
  );

  // A shared in-flight request may have failed in another response's worker.
  // Check the settled chunk keys as well so this candidate is not half translated.
  pendingChunks.forEach((item) => {
    const cacheKey =
      `${TARGET_LANGUAGE}|chunk|${mimeType}|${item.text}`;

    if (failedTranslationChunks.has(cacheKey)) {
      failedCandidateKeys.add(item.key);
    }
  });

  return {
    translatedTexts,
    failedCandidateKeys,
  };
}

function notifyDynamicTranslationsUpdated() {
  // Dynamic translations live in an external cache, not in React state or
  // i18next resources. App.jsx listens for this event and refreshes the active
  // routed tree so all getLocalizedValue()/translateValue() calls read the
  // completed French cache. Use a public browser event instead of i18next's
  // private emitter implementation.
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new Event("skillnext-dynamic-translations-updated")
    );
  }
}

function splitLargeHtmlIntoTextNodes(html) {
  const parts = [];
  const segments = [];

  const protectedTags = new Set([
    "script",
    "style",
    "pre",
    "code",
    "textarea",
    "svg",
    "math",
  ]);

  const openTags = [];

  const tagPattern =
    /<!--[\s\S]*?-->|<![^>]*>|<\/?[A-Za-z][A-Za-z0-9:-]*(?:\s+(?:"[^"]*"|'[^']*'|[^'">])*)?\s*\/?>/g;

  let lastIndex = 0;

  const addText = (text) => {
    if (!text) return;

    if (openTags.length || !text.trim()) {
      parts.push(text);
      return;
    }

    const segmentIndex = segments.length;
    const protectedSegment = protectContentTokens(text);

    segments.push({
      original: text,
      chunks: splitPlainText(protectedSegment.text),
      translatedChunks: [],
      restore: protectedSegment.restore,
    });

    parts.push({ segmentIndex });
  };

  for (const match of html.matchAll(tagPattern)) {
    addText(html.slice(lastIndex, match.index));

    const tag = match[0];
    parts.push(tag);

    const tagMatch = tag.match(/^<\s*(\/?)\s*([a-z0-9:-]+)/i);

    if (tagMatch && protectedTags.has(tagMatch[2].toLowerCase())) {
      const closing = Boolean(tagMatch[1]);
      const selfClosing = /\/\s*>$/.test(tag);
      const tagName = tagMatch[2].toLowerCase();

      if (closing) {
        const index = openTags.lastIndexOf(tagName);

        if (index >= 0) {
          openTags.splice(index, 1);
        }
      } else if (!selfClosing) {
        openTags.push(tagName);
      }
    }

    lastIndex = match.index + tag.length;
  }

  addText(html.slice(lastIndex));

  return {
    parts,
    segments,
  };
}

async function translateUniqueTexts(candidates, { strict = false } = {}) {
  // Restore translations from IndexedDB before checking the network-backed cache.
  await hydrateDynamicTranslationStore();

  const translatedByText = new Map();
  const preparedByKey = new Map();
  const pendingByMimeType = new Map();

  const addPending = (mimeType, item) => {
    if (!pendingByMimeType.has(mimeType)) {
      pendingByMimeType.set(mimeType, []);
    }

    pendingByMimeType.get(mimeType).push(item);
  };

  for (const candidate of candidates) {
    const key =
      `${TARGET_LANGUAGE}|${candidate.mimeType}|${candidate.text}`;

    if (
      translatedByText.has(key) ||
      preparedByKey.has(key)
    ) {
      continue;
    }

    if (translationCache.has(key)) {
      translatedByText.set(key, translationCache.get(key));
      continue;
    }

    // Exact full-field translations survive reloads in IndexedDB. Reuse them
    // before creating any chunks or making a translation API request.
    const persistedTranslation = getDynamicTranslation(
      candidate.text,
      TARGET_LANGUAGE,
    );

    if (persistedTranslation !== undefined) {
      cacheSet(key, persistedTranslation);
      translatedByText.set(key, persistedTranslation);
      continue;
    }

    const protectedHtml =
      candidate.mimeType === "text/html"
        ? protectContentTokens(candidate.text)
        : null;

    const htmlNeedsNodeSplit =
      candidate.mimeType === "text/html" &&
      (
        candidate.text.length > MAX_TEXT_CHUNK_LENGTH ||
        protectedHtml.text.length > MAX_TEXT_CHUNK_LENGTH
      );

    if (htmlNeedsNodeSplit) {
      const htmlParts = splitLargeHtmlIntoTextNodes(
        candidate.text
      );

      const prepared = {
        kind: "html",
        original: candidate.text,
        parts: htmlParts.parts,
        segments: htmlParts.segments,
      };

      preparedByKey.set(key, prepared);

      prepared.segments.forEach((segment, segmentIndex) => {
        segment.chunks.forEach((chunk, chunkIndex) => {
          addPending("text/plain", {
            key,
            segmentIndex,
            chunkIndex,
            text: chunk,
          });
        });
      });

      continue;
    }

    const protectedContent =
      protectedHtml || protectContentTokens(candidate.text);

    const chunks =
      candidate.mimeType === "text/plain"
        ? splitPlainText(protectedContent.text)
        : [protectedContent.text];

    if (
      chunks.some(
        (chunk) => chunk.length > MAX_BACKEND_TEXT_LENGTH
      )
    ) {
      throw new Error(
        "A translation chunk exceeded the backend 5,000-character limit after token protection."
      );
    }

    const prepared = {
      kind: "standard",
      original: candidate.text,
      chunks,
      translatedChunks: new Array(chunks.length),
      restore: protectedContent.restore,
    };

    preparedByKey.set(key, prepared);

    chunks.forEach((chunk, chunkIndex) => {
      addPending(candidate.mimeType, {
        key,
        chunkIndex,
        text: chunk,
      });
    });
  }

  const failedCandidateKeys = new Set();

  for (const [mimeType, pendingChunks] of pendingByMimeType.entries()) {
    const batchResult = await translatePendingChunks(
      pendingChunks,
      mimeType,
    );

    batchResult.failedCandidateKeys.forEach((key) => {
      failedCandidateKeys.add(key);
    });

    // FIX: Handle normal text and HTML segments independently.
    // For standard text, segmentIndex is undefined.
    // For HTML text, segmentIndex must be a valid integer.
    pendingChunks.forEach((item, index) => {
      const translatedChunk =
        batchResult.translatedTexts[index] || item.text;

      const prepared = preparedByKey.get(item.key);

      if (prepared?.kind === "standard") {
        prepared.translatedChunks[item.chunkIndex] =
          translatedChunk;
      } else if (
        prepared?.kind === "html" &&
        Number.isInteger(item.segmentIndex)
      ) {
        const segment = prepared.segments?.[item.segmentIndex];

        if (segment) {
          segment.translatedChunks[item.chunkIndex] =
            translatedChunk;
        } else {
          failedCandidateKeys.add(item.key);
        }
      } else {
        // Do not let an unexpected translation path crash the original API view.
        failedCandidateKeys.add(item.key);
      }
    });
  }

  for (const [key, prepared] of preparedByKey.entries()) {
    // If one chunk fails, preserve the complete original field. Never mix
    // English and French chunks inside a single lesson field.
    if (failedCandidateKeys.has(key)) {
      translatedByText.set(key, prepared.original);
      continue;
    }

    let combined;

    if (prepared.kind === "html") {
      const translatedSegments = prepared.segments.map(
        (segment) =>
          segment.restore(segment.translatedChunks.join("")),
      );

      combined = prepared.parts
        .map((part) =>
          typeof part === "string"
            ? part
            : translatedSegments[part.segmentIndex] ?? ""
        )
        .join("");
    } else {
      combined = prepared.restore(
        prepared.translatedChunks.join("")
      );
    }

    translatedByText.set(key, combined);

    if (combined !== prepared.original) {
      cacheSet(key, combined);
    }
  }

  for (const candidate of candidates) {
    const key =
      `${TARGET_LANGUAGE}|${candidate.mimeType}|${candidate.text}`;

    const translated = translatedByText.get(key);

    if (translated && translated !== candidate.text) {
      rememberDynamicTranslation(
        candidate.text,
        translated,
      );
    }
  }

  if (strict && failedCandidateKeys.size) {
    throw new Error(
      `French translation is incomplete: ${failedCandidateKeys.size} content field(s) could not be translated.`,
    );
  }

  return translatedByText;
}

/** Register original English API text even when English is currently selected. */
export function registerApiContent(data) {
  if (
    typeof data !== "string" &&
    !Array.isArray(data) &&
    !isPlainObject(data)
  ) {
    return;
  }

  for (const candidate of collectTranslatablePaths(data)) {
    const key = `${candidate.mimeType}|${candidate.text}`;

    if (registeredApiTexts.has(key)) {
      registeredApiTexts.delete(key);
    }

    registeredApiTexts.set(key, candidate);

    while (registeredApiTexts.size > MAX_REGISTERED_TEXTS) {
      const oldestKey = registeredApiTexts.keys().next().value;
      registeredApiTexts.delete(oldestKey);
    }
  }
}

/**
 * Translate API text already registered in the current application session.
 * The LanguageSwitcher activates French first; this function then prepares
 * registered API content in the background without blocking the language switch.
 */
export async function prewarmApiContentTranslations(
  targetLanguage = i18n.resolvedLanguage || i18n.language || "en",
) {
  if (!TRANSLATION_ENABLED) return;

  if (
    String(targetLanguage).toLowerCase().split("-")[0] !==
    TARGET_LANGUAGE
  ) {
    return;
  }

  if (prewarmPromise) return prewarmPromise;
  if (!registeredApiTexts.size) return;

  prewarmPromise = (async () => {
    const processedKeys = new Set();

    try {
      // Include API responses that arrive while prewarming is in progress.
      // Each registered source string is handled once in this prewarm run.
      while (true) {
        const pendingCandidates = [...registeredApiTexts.entries()]
          .filter(([key]) => !processedKeys.has(key));

        if (!pendingCandidates.length) break;

        pendingCandidates.forEach(([key]) => {
          processedKeys.add(key);
        });

        // Prewarming is background work. A failed translation batch should
        // keep that field in English, but must not stop the language switch
        // or prevent the remaining registered content from being processed.
        await translateUniqueTexts(
          pendingCandidates.map(([, candidate]) => candidate),
          { strict: false },
        );
      }
    } finally {
      // Refresh the UI after successful translations and also after partial
      // completion, so any translations already cached become visible.
      notifyDynamicTranslationsUpdated();
    }
  })()
    .catch((error) => {
      console.error(
        "Skill Next French API content prewarm encountered an unexpected error.",
        error,
      );

      throw error;
    })
    .finally(() => {
      prewarmPromise = null;
    });

  return prewarmPromise;
}

/**
 * Translates human-readable fields in learner-facing API responses.
 * The function preserves object keys, array positions, IDs, machine statuses,
 * scores, answer values, user/profile data, and executable code. Non-strict callers
 * retain the source object on failure; strict French display callers reject so
 * the UI can keep the content behind its existing loading state instead of
 * painting English text under a French selection.
 */
export async function translateApiContent(
  data,
  language = i18n.resolvedLanguage || i18n.language,
  { strict = false } = {},
) {
  const normalizedLanguage = String(language || "en")
    .toLowerCase()
    .split("-")[0];

  if (
    typeof data !== "string" &&
    !Array.isArray(data) &&
    !isPlainObject(data)
  ) {
    return data;
  }

  // Always register source-language content so a later French selection can
  // prepare everything already loaded in the current session.
  registerApiContent(data);

  if (!TRANSLATION_ENABLED || normalizedLanguage !== TARGET_LANGUAGE) {
    if (strict && normalizedLanguage === TARGET_LANGUAGE) {
      throw new Error(
        "Dynamic French content translation is disabled."
      );
    }

    return data;
  }

  const candidates = collectTranslatablePaths(data);

  if (!candidates.length) return data;

  try {
    const translatedByText = await translateUniqueTexts(
      candidates,
      { strict },
    );

    const translatedData = candidates.reduce(
      (result, candidate) => {
        const key =
          `${TARGET_LANGUAGE}|${candidate.mimeType}|${candidate.text}`;

        const translated =
          translatedByText.get(key) || candidate.text;

        return translated === candidate.text
          ? result
          : setImmutable(result, candidate.path, translated);
      },
      data,
    );

    notifyDynamicTranslationsUpdated();

    return translatedData;
  } catch (error) {
    if (strict) throw error;

    if (!warnedAboutTranslationFailure) {
      warnedAboutTranslationFailure = true;

      console.warn(
        "Skill Next dynamic translation is unavailable. Original API data was retained for non-strict callers.",
        error,
      );
    }

    return data;
  }
}

/**
 * Register an API response and translate it in the background when French is active.
 * The original API response is returned to its caller immediately and is never mutated.
 */
export function preloadApiContentTranslation(
  data,
  language = i18n.resolvedLanguage || i18n.language || "en",
) {
  registerApiContent(data);

  const normalizedLanguage = String(language || "en")
    .toLowerCase()
    .split("-")[0];

  if (
    !TRANSLATION_ENABLED ||
    normalizedLanguage !== TARGET_LANGUAGE
  ) {
    return Promise.resolve(data);
  }

  return translateApiContent(data, TARGET_LANGUAGE).then(
    (translatedDisplayClone) => {
      const activeLanguage = String(
        i18n.resolvedLanguage || i18n.language || "en"
      )
        .toLowerCase()
        .split("-")[0];

      if (activeLanguage === TARGET_LANGUAGE) {
        notifyDynamicTranslationsUpdated();
      }

      return translatedDisplayClone;
    }
  );
}

export async function clearApiContentTranslationCache() {
  translationCache.clear();
  registeredApiTexts.clear();
  inFlightChunkTranslations.clear();
  failedTranslationChunks.clear();

  await clearDynamicTranslationStore();
}

if (typeof window !== "undefined") {
  window.addEventListener(
    "skillnext-language-changed",
    (event) => {
      if (event.detail?.language === TARGET_LANGUAGE) {
        // This runs in the background. The prewarm function logs unexpected
        // failures itself; it must not block changeAppLanguage() or the UI.
        void prewarmApiContentTranslations().catch(() => {});
      }
    }
  );
}
