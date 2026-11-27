# Skill Next LMS — English and French

The LMS uses one centralized `i18next` instance with `react-i18next` integration.

## Languages

- English (`en`) is the default and fallback language.
- French (`fr`) is the secondary language.
- The selected language is stored under the `skillnext_language` local-storage key.
- Language selection is shared across Student, Teacher, authentication, and standalone pages.

## Requirements and setup

Use Node.js 22.12 or later.

```bash
npm ci
npm run dev
```

The project root contains `.env` and `.env.example`. The default API base URL is configured using `VITE_API_BASE_URL`. Keep your local `.env` file when merging or replacing project files; do not commit secrets to source control.

## Central translation architecture

- `src/i18n/index.js` creates and initializes the only i18next instance, registers both locales, restores/saves the selected language, and synchronizes language changes across browser tabs.
- `src/i18n/locales/en/ui.json` contains the English source phrases.
- `src/i18n/locales/fr/ui.json` contains the French translations for the same keys.
- `src/components/common/LanguageSwitcher.jsx` is the reusable global language selector.
- Existing JSX text, visible attributes, dynamic labels, and accessible labels use `translateValue()`, which delegates every lookup to `i18next.t()`; it is not a second translation engine or a DOM mutation observer.
- New components should use `useTranslation('ui')` and `t()` directly. Use i18next interpolation for dynamic values, for example `t('Welcome, {{name}}', { name })`.
- `src/i18n/LocalizedText.jsx` renders bilingual API values such as `{ "en": "HTML basics", "fr": "Notions de base du HTML" }`.

## Update an existing translation

Edit only the French value in `src/i18n/locales/fr/ui.json`. Keep the key unchanged because existing components refer to the English source phrase.

```json
{
  "My Learning": "Mon apprentissage"
}
```

Both locale files must contain matching keys. Do not add a French-only key.

## Add a new phrase

Add the same key to both files:

```json
// en/ui.json
{
  "Welcome, {{name}}": "Welcome, {{name}}"
}

// fr/ui.json
{
  "Welcome, {{name}}": "Bienvenue, {{name}}"
}
```

Then use it in a component:

```jsx
import { useTranslation } from "react-i18next";

function WelcomeMessage({ name }) {
  const { t } = useTranslation("ui");
  return <p>{t("Welcome, {{name}}", { name })}</p>;
}
```

## Popups, errors, and validations

- API error messages are returned as source phrases by `src/utils/apiErrorHandler.js` and translated when rendered through the shared catalog.
- The API error modal and session-expired popup use the i18next catalog.
- Existing form labels, placeholders, inline validation text, buttons, modal headings, toast/notice messages, and accessible labels are included in the UI translation catalog when their source phrase is present.
- `src/components/common/NativeValidationLanguage.jsx` localizes native HTML form-validation messages (required, email, URL, length, pattern, and range errors) and updates a visible validation message when the language changes.
- Native browser `alert()` / `confirm()` strings should be passed through `i18n.t()` or the helpers in `src/i18n/dialogs.js`.
- Code samples, editor contents, and learner-authored code are not translated.

## Backend-authored learning content (dynamic French translation)

- Existing Axios and Teacher API request payloads and API response structures are not changed. The translation helper request is separate from the original learning API call.
- All eligible learner-facing `/api/*` GET responses are captured centrally by the Axios response interceptor. Authentication, profile/personal data, users/students/teachers, admin routes, and the translation endpoint itself are excluded.
- Assessment start/submit, course enrollment, module completion, and module restart result responses are also translated when they contain learner-facing messages/content. API request payloads are never translated.
- When French is selected, `src/services/apiContentTranslation.js` recursively collects human-readable string fields from nested objects/arrays and sends them in batches to the authenticated backend route `POST /api/translation/translate`.
- The response translator preserves response keys, IDs, machine status/type values, answer values, scores, dates, URLs, personal/profile subtrees, and code/editor fields. It also registers source text already loaded in English, so switching to French can preload and display translations on the current page without resetting quiz state or reloading the route; switching back to English uses the reverse in-memory map. Teacher authoring input values and submitted writes remain the original English source; only read-only catalog labels can use the display lookup cache.
- English continues to display the original backend response. Translation failures safely fall back to original API content and do not fail the course/quiz request.
- The supplied archive is the frontend project; the existing backend source was not included. Mount the secure FastAPI router and configure Google Cloud Translation as described in `backend-integration/README.md` before expecting API-authored content to appear in French.
- Frontend environment variables: `VITE_DYNAMIC_CONTENT_TRANSLATION=true` and `VITE_TRANSLATION_API_PATH=/api/translation/translate`.

## Validation

```bash
npm run lint
npm run build
```


## Dynamic API Content Translation (English backend → French display)

Skill Next APIs continue to return their existing English JSON. The frontend collects learner-facing text from eligible API responses and sends only those text values to the authenticated `/api/translation/translate` helper. French translations are cached as display lookups; the original API response objects are never mutated, so IDs, enums, filters, progress rules, scores, answers, code, and write payloads remain unchanged. Existing `t()` / `translateValue()` calls resolve dynamic strings, including after an in-page language switch.

The frontend ZIP also contains `backend-integration/translation_router.py`. Mount that router once in the existing FastAPI backend with its current authentication dependency, enable Google Cloud Translation API, grant the Cloud Run service account `roles/cloudtranslate.user`, and set `GOOGLE_CLOUD_PROJECT`. Existing learning endpoints do not need to be changed. See `DYNAMIC_API_TRANSLATION.md` for the data-protection rules and setup steps.
