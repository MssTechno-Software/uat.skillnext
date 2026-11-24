import i18n from "./index";

/** Translate a browser alert at the moment it is displayed. */
export function translatedAlert(message) {
  const source = String(message ?? "");
  return window.alert(i18n.t(source, { ns: "ui", defaultValue: source }));
}

/** Translate a browser confirmation at the moment it is displayed. */
export function translatedConfirm(message) {
  const source = String(message ?? "");
  return window.confirm(i18n.t(source, { ns: "ui", defaultValue: source }));
}
