import { useEffect } from "react";
import i18n from "../../i18n";

function getValidationKey(input) {
  const { validity } = input;

  if (validity.valueMissing) return "Please fill out this field.";

  if (validity.typeMismatch) {
    if (input.type === "email") return "Please enter a valid email address.";
    if (input.type === "url") return "Please enter a valid URL.";
  }

  if (validity.tooShort) return "Please use at least {{count}} characters.";
  if (validity.tooLong) return "Please use no more than {{count}} characters.";
  if (validity.patternMismatch) return "Please match the requested format.";
  if (validity.rangeUnderflow) return "The value must be at least {{min}}.";
  if (validity.rangeOverflow) return "The value must be no more than {{max}}.";
  if (validity.stepMismatch) return "Please enter a valid value.";

  // Preserve custom validation messages authored by an individual form.
  if (validity.customError) return input.validationMessage;

  return "Please check this field.";
}

function getValidationOptions(input, key) {
  if (key === "Please use at least {{count}} characters.") {
    return { count: input.minLength };
  }
  if (key === "Please use no more than {{count}} characters.") {
    return { count: input.maxLength };
  }
  if (key === "The value must be at least {{min}}.") {
    return { min: input.min };
  }
  if (key === "The value must be no more than {{max}}.") {
    return { max: input.max };
  }
  return {};
}

function isValidatableControl(target) {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLSelectElement ||
    target instanceof HTMLTextAreaElement
  );
}

function applyLocalizedValidation(input) {
  if (!input.willValidate) return;

  const key = input.dataset.i18nValidationKey || getValidationKey(input);
  input.dataset.i18nValidationKey = key;
  input.setCustomValidity(
    i18n.t(key, {
      ns: "ui",
      defaultValue: key,
      ...getValidationOptions(input, key),
    })
  );
}

/** Keeps browser-native form validation bubbles in the currently selected app language. */
export default function NativeValidationLanguage() {
  useEffect(() => {
    const handleInvalid = (event) => {
      const input = event.target;
      if (!isValidatableControl(input)) return;
      applyLocalizedValidation(input);
    };

    const clearCustomValidity = (event) => {
      const input = event.target;
      if (!isValidatableControl(input)) return;
      input.setCustomValidity("");
      delete input.dataset.i18nValidationKey;
    };

    const refreshVisibleValidationMessages = () => {
      document
        .querySelectorAll("input[data-i18n-validation-key], select[data-i18n-validation-key], textarea[data-i18n-validation-key]")
        .forEach((input) => {
          if (isValidatableControl(input)) applyLocalizedValidation(input);
        });
    };

    document.addEventListener("invalid", handleInvalid, true);
    document.addEventListener("input", clearCustomValidity, true);
    document.addEventListener("change", clearCustomValidity, true);
    i18n.on("languageChanged", refreshVisibleValidationMessages);

    return () => {
      document.removeEventListener("invalid", handleInvalid, true);
      document.removeEventListener("input", clearCustomValidity, true);
      document.removeEventListener("change", clearCustomValidity, true);
      i18n.off("languageChanged", refreshVisibleValidationMessages);
    };
  }, []);

  return null;
}
