const MAX_DYNAMIC_TRANSLATIONS = 20000;
const DATABASE_NAME = "skill-next-dynamic-translations-v3";
const DATABASE_VERSION = 1;
const OBJECT_STORE_NAME = "translations";

const englishToFrench = new Map();
const frenchToEnglish = new Map();

let databasePromise = null;
let hydrationPromise = null;
let isHydrated = false;
const pendingPersistentWrites = new Map();
let persistentWriteScheduled = false;

function setLru(map, key, value) {
  if (!key || typeof key !== "string" || typeof value !== "string") return;
  if (map.has(key)) map.delete(key);
  map.set(key, value);

  while (map.size > MAX_DYNAMIC_TRANSLATIONS) {
    const oldestKey = map.keys().next().value;
    map.delete(oldestKey);
  }
}

function openDatabase() {
  if (typeof indexedDB === "undefined") return Promise.resolve(null);
  if (databasePromise) return databasePromise;

  databasePromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(OBJECT_STORE_NAME)) {
        database.createObjectStore(OBJECT_STORE_NAME, { keyPath: "englishText" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Could not open the translation cache."));
    request.onblocked = () => reject(new Error("The translation cache upgrade is blocked by another tab."));
  }).catch((error) => {
    // IndexedDB can be unavailable in private/restricted browser contexts.
    // In that case the in-memory cache still works for the current session.
    console.warn("Persistent French translation cache is unavailable.", error);
    databasePromise = null;
    return null;
  });

  return databasePromise;
}

function requestToPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Translation cache request failed."));
  });
}

/** Load previously translated content once so repeat visits do not call the API again. */
export async function hydrateDynamicTranslationStore() {
  if (isHydrated) return true;
  if (hydrationPromise) return hydrationPromise;

  hydrationPromise = (async () => {
    const database = await openDatabase();
    if (!database) {
      isHydrated = true;
      return false;
    }

    try {
      const transaction = database.transaction(OBJECT_STORE_NAME, "readonly");
      const rows = await requestToPromise(transaction.objectStore(OBJECT_STORE_NAME).getAll());

      rows.forEach((row) => {
        if (typeof row?.englishText === "string" && typeof row?.frenchText === "string") {
          setLru(englishToFrench, row.englishText, row.frenchText);
          setLru(frenchToEnglish, row.frenchText, row.englishText);
        }
      });

      isHydrated = true;
      return true;
    } catch (error) {
      console.warn("Could not read the persistent translation cache.", error);
      isHydrated = true;
      return false;
    }
  })().finally(() => {
    hydrationPromise = null;
  });

  return hydrationPromise;
}

async function flushPersistentWrites() {
  // Do not race an unfinished cache hydration with a write.
  if (hydrationPromise) await hydrationPromise;
  const database = await openDatabase();
  if (!pendingPersistentWrites.size) return;
  if (!database) {
    pendingPersistentWrites.clear();
    return;
  }

  const entries = [...pendingPersistentWrites.entries()];
  pendingPersistentWrites.clear();

  try {
    const transaction = database.transaction(OBJECT_STORE_NAME, "readwrite");
    const store = transaction.objectStore(OBJECT_STORE_NAME);
    entries.forEach(([englishText, frenchText]) => {
      store.put({ englishText, frenchText, updatedAt: Date.now() });
    });
  } catch (error) {
    console.warn("Could not save French translations for reuse.", error);
  }
}

function schedulePersistentWrite(englishText, frenchText) {
  pendingPersistentWrites.set(englishText, frenchText);
  if (persistentWriteScheduled) return;

  persistentWriteScheduled = true;
  Promise.resolve().then(async () => {
    try {
      await flushPersistentWrites();
    } finally {
      persistentWriteScheduled = false;
      // Include entries queued while the previous IndexedDB transaction ran.
      if (pendingPersistentWrites.size) schedulePersistentFlush();
    }
  });
}

function schedulePersistentFlush() {
  if (persistentWriteScheduled) return;
  persistentWriteScheduled = true;
  Promise.resolve().then(async () => {
    try {
      await flushPersistentWrites();
    } finally {
      persistentWriteScheduled = false;
      if (pendingPersistentWrites.size) schedulePersistentFlush();
    }
  });
}

/** Save a reversible English/French pair for display-only language switching. */
export function rememberDynamicTranslation(englishText, frenchText) {
  if (
    typeof englishText !== "string" ||
    typeof frenchText !== "string" ||
    !englishText.trim() ||
    !frenchText.trim() ||
    englishText === frenchText
  ) {
    return;
  }

  setLru(englishToFrench, englishText, frenchText);
  setLru(frenchToEnglish, frenchText, englishText);
  schedulePersistentWrite(englishText, frenchText);
}

/** Return a cached dynamic translation for the selected language. */
export function getDynamicTranslation(text, language) {
  if (typeof text !== "string") return undefined;

  const isFrench = String(language || "en").toLowerCase().startsWith("fr");
  const map = isFrench ? englishToFrench : frenchToEnglish;
  const value = map.get(text);

  if (value !== undefined) {
    map.delete(text);
    map.set(text, value);
  }

  return value;
}

export async function clearDynamicTranslationStore() {
  // Clear in-memory caches
  englishToFrench.clear();
  frenchToEnglish.clear();

  // Clear pending IndexedDB writes
  pendingPersistentWrites.clear();

  // Wait for any pending hydration
  if (hydrationPromise) {
    await hydrationPromise;
  }

  const database = await openDatabase();

  if (!database) {
    isHydrated = false;
    return;
  }

  // Clear all saved translations from IndexedDB
  await new Promise((resolve, reject) => {
    const transaction = database.transaction(
      OBJECT_STORE_NAME,
      "readwrite"
    );

    transaction.objectStore(OBJECT_STORE_NAME).clear();

    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });

  isHydrated = false;
}