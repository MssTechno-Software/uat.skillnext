# Multilingual implementation guide

## Architecture

- Translation library: `i18next` + `react-i18next`.
- Default language: English (`en`).
- Secondary language: French (`fr`).
- One namespace: `ui`.
- One i18next instance: `src/i18n/index.js`.
- English catalog: `src/i18n/locales/en/ui.json`.
- French catalog: `src/i18n/locales/fr/ui.json`.
- Shared language selector: `src/components/common/LanguageSwitcher.jsx`.

The old custom DOM translation bridge, `MutationObserver`, custom regex translation engine, and old `LanguageProvider` implementation are not part of this project. Translation lookups are delegated to i18next. `translateValue()` is a thin compatibility utility that calls `i18next.t()` for existing JSX expressions; it does not scan or modify the DOM.

## Change an existing translation

1. Find the exact English source phrase in `src/i18n/locales/fr/ui.json`.
2. Change only the French value.
3. Leave the English key unchanged.
4. Keep the English and French JSON files in sync.

Example:

```json
{
  "My Learning": "Mon apprentissage"
}
```

## Add a phrase

Add the same key in both locale files and use `useTranslation('ui')` in the component:

```jsx
import { useTranslation } from "react-i18next";

function Example() {
  const { t } = useTranslation("ui");
  return <button>{t("Save changes")}</button>;
}
```

For dynamic phrases, use interpolation instead of constructing whole sentences with template strings:

```jsx
const { t } = useTranslation("ui");
return <p>{t("Welcome, {{name}}", { name })}</p>;
```

Add `Welcome, {{name}}` to both locale JSON files. Keep placeholders such as `{{name}}` identical in both translations.

## Popups and validation

- Use `i18n.t()` or the functions in `src/i18n/dialogs.js` for browser alerts and confirmations.
- Page inline errors and notices are rendered through the same central catalog.
- `src/utils/apiErrorHandler.js` maps HTTP and network conditions to source-language messages; the rendered message is translated via i18next.
- `src/components/common/NativeValidationLanguage.jsx` handles HTML native validation bubbles for required, email, URL, length, pattern, and range checks. It keeps the active custom-validation message aligned when the app language changes.
- Do not translate code samples, code-editor contents, or student-authored answers.

## Backend content

The frontend sends `Accept-Language: en|fr` through Axios and Teacher API calls. Backend-authored course/module/lesson/quiz/assessment content must be returned in the requested language or as bilingual fields, for example:

```json
{
  "title": {
    "en": "HTML Basics",
    "fr": "Notions de base du HTML"
  }
}
```

Use `LocalizedText` for those bilingual API fields. Do not automatically machine-translate quiz questions or answers in the browser; reviewed content translations are required to preserve meaning and assessment integrity.
