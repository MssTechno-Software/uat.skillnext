
const STATUS_CLASS_MESSAGES = Object.freeze({
  1: "Your request is being processed. Please wait.",
  2: "Your request was completed successfully.",
  3: "We couldn't open the requested page. Please try again.",
  4: "We couldn't complete your request. Please check your details and try again.",
  5: "Something went wrong on our server. Please try again later.",
});

const SPECIFIC_STATUS_MESSAGES = Object.freeze({
  400: "Invalid request. Please check your details.",
  401: "Your session may have expired. Please sign in again.",
  403: "You don't have permission to perform this action.",
  404: "The requested resource was not found.",
  409: "This account may already exist. Please check your details.",
  422: "Please check the information you entered.",
  429: "Too many requests. Please try again later.",
});

export const getHttpStatusMessage = (status) => {
  if (
    !Number.isInteger(status) ||
    status < 100 ||
    status > 599
  ) {
    return "Something went wrong. Please try again.";
  }

  const statusClass = Math.floor(status / 100);

  return STATUS_CLASS_MESSAGES[statusClass];
};

export const getApiErrorMessage = (
  error,
  fallbackMessage = "Something went wrong. Please try again."
) => {
  // Request timeout
  if (
    error?.code === "ECONNABORTED" ||
    error?.code === "ETIMEDOUT"
  ) {
    return "The request took too long. Please try again.";
  }

  const status = error?.response?.status;

  // Network error
  if (!Number.isInteger(status)) {
    if (error?.request) {
      return "Unable to connect. Please check your internet connection and try again.";
    }

    return fallbackMessage;
  }

  // Successful responses are not errors
  if (status >= 200 && status < 300) {
    return fallbackMessage;
  }

  // Specific status messages take priority
  if (SPECIFIC_STATUS_MESSAGES[status]) {
    return SPECIFIC_STATUS_MESSAGES[status];
  }

  // Remaining errors use status-class messages
  return getHttpStatusMessage(status);
};
