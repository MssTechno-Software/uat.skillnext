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

## Backend-authored learning content

Axios and Teacher API requests send `Accept-Language: en|fr`. Course caches are language-specific. The backend must return localized course, module, lesson, quiz, assessment, and assignment content or bilingual values. The frontend does not automatically machine-translate assessment questions and answers, because changing their wording without a reviewed translation could affect learning meaning and scoring.

## Validation

```bash
npm run lint
npm run build
```
