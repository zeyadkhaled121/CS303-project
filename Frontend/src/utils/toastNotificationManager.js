/**
 * UNIFIED TOAST NOTIFICATION ENGINE
 * Centralized notification management to prevent toast spam and stacking.
 * 
 * Features:
 * - Deduplication (prevent duplicate toasts)
 * - Queue management
 * - Auto-clear previous errors on success
 * - Timeout management
 */

import { toast as reactToastify } from "react-toastify";

// Track active toasts to prevent duplicates
const activeToasts = new Map();
const DEDUP_KEY_PREFIX = "toast_";
const TOAST_DISPLAY_TIME = 5000;

/**
 * Create deduplication key from message and type
 */
const getDedupKey = (message, type) => {
  return `${DEDUP_KEY_PREFIX}${type}_${message.substring(0, 50)}`;
};

/**
 * Clear previous toast if exists
 */
const clearPreviousToast = (dedupKey) => {
  if (activeToasts.has(dedupKey)) {
    const toastId = activeToasts.get(dedupKey);
    reactToastify.dismiss(toastId);
    activeToasts.delete(dedupKey);
  }
};

/**
 * Show success notification
 * Auto-clears error notifications when success fires
 */
export const notifySuccess = (message) => {
  const dedupKey = getDedupKey(message, "success");
  clearPreviousToast(dedupKey);
  
  // Clear any error toasts
  activeToasts.forEach((toastId, key) => {
    if (key.includes("error")) {
      reactToastify.dismiss(toastId);
      activeToasts.delete(key);
    }
  });

  const toastId = reactToastify.success(message, {
    position: "top-right",
    autoClose: TOAST_DISPLAY_TIME,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });

  activeToasts.set(dedupKey, toastId);
};

/**
 * Show error notification
 */
export const notifyError = (message) => {
  const dedupKey = getDedupKey(message, "error");
  clearPreviousToast(dedupKey);

  const toastId = reactToastify.error(message, {
    position: "top-right",
    autoClose: TOAST_DISPLAY_TIME + 2000, // Errors stay longer
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });

  activeToasts.set(dedupKey, toastId);
};

/**
 * Show warning notification
 */
export const notifyWarning = (message) => {
  const dedupKey = getDedupKey(message, "warning");
  clearPreviousToast(dedupKey);

  const toastId = reactToastify.warning(message, {
    position: "top-right",
    autoClose: TOAST_DISPLAY_TIME,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });

  activeToasts.set(dedupKey, toastId);
};

/**
 * Show info notification
 */
export const notifyInfo = (message) => {
  const dedupKey = getDedupKey(message, "info");
  clearPreviousToast(dedupKey);

  const toastId = reactToastify.info(message, {
    position: "top-right",
    autoClose: TOAST_DISPLAY_TIME,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });

  activeToasts.set(dedupKey, toastId);
};

/**
 * Show loading notification (manual dismiss)
 */
export const notifyLoading = (message) => {
  const toastId = reactToastify.loading(message, {
    position: "top-right",
    hideProgressBar: false,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: false,
  });

  return toastId;
};

/**
 * Update or replace an existing loading toast
 */
export const updateToast = (toastId, message, type = "success") => {
  reactToastify.update(toastId, {
    render: message,
    type,
    isLoading: false,
    autoClose: TOAST_DISPLAY_TIME,
  });
};

/**
 * Clear all active toasts
 */
export const clearAllToasts = () => {
  reactToastify.dismiss();
  activeToasts.clear();
};

/**
 * Helper: Show operation result
 * Automatically picks success or error toast based on response
 */
export const notifyResult = (result, successMsg = "Success", errorMsg = "Failed") => {
  if (result?.ok || result?.success) {
    notifySuccess(result?.message || successMsg);
  } else {
    notifyError(result?.error || result?.message || errorMsg);
  }
};
