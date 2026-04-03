/**
 * CONCURRENCY & RACE CONDITION MANAGER
 * Handles complex scenarios where multiple users attempt the same action simultaneously.
 * 
 * Enterprise Patterns:
 * - Request deduplication with timeout
 * - Exponential backoff retry logic
 * - Race condition (409 Conflict) detection and handling
 * - Request queue with priority
 * - Automatic cleanup of stale requests
 */

/**
 * Store of in-flight requests with their promises and metadata
 */
const requestRegistry = new Map();

/**
 * Request queue for deferred execution
 */
const requestQueue = [];

/**
 * Configuration constants
 */
const CONFIG = {
  MAX_RETRIES: 3,
  BASE_DELAY_MS: 500,
  MAX_DELAY_MS: 5000,
  REQUEST_TIMEOUT_MS: 30000,
  DUPLICATE_WINDOW_MS: 5000,
};

/**
 * Create a unique key for a request based on method, URL, and key payload fields
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
 * @param {string} url - Request URL
 * @param {Object} data - Request payload
 * @returns {string} Unique request key
 */
export const createRequestKey = (method, url, data) => {
  const baseKey = `${method.toUpperCase()}:${url}`;
  
  if (!data || typeof data !== 'object') {
    return baseKey;
  }

  // Extract key fields that identify the request's intent
  const keyFields = {};
  const fieldsToExtract = ['bookId', 'userId', 'borrowId', 'id', '_id'];
  
  fieldsToExtract.forEach(field => {
    if (field in data) {
      keyFields[field] = data[field];
    }
  });

  return keyFields && Object.keys(keyFields).length > 0
    ? `${baseKey}:${JSON.stringify(keyFields)}`
    : baseKey;
};

/**
 * Check if a duplicate request is already in flight
 * @param {string} key - Request key
 * @returns {Object} { isDuplicate: boolean, existingRequest?: Promise }
 */
export const checkDuplicateRequest = (key) => {
  if (requestRegistry.has(key)) {
    const request = requestRegistry.get(key);
    const ageMs = Date.now() - request.createdAt;
    
    // If original request is still recent, treat as duplicate
    if (ageMs < CONFIG.DUPLICATE_WINDOW_MS) {
      return {
        isDuplicate: true,
        existingRequest: request.promise,
        ageMs
      };
    } else {
      // Request is stale, remove it
      requestRegistry.delete(key);
      return { isDuplicate: false };
    }
  }
  
  return { isDuplicate: false };
};

/**
 * Register a new request
 * @param {string} key - Request key
 * @param {Promise} promise - Request promise
 * @returns {Object} Registration token for cleanup
 */
export const registerRequest = (key, promise) => {
  const registration = {
    key,
    createdAt: Date.now(),
    promise,
    retryCount: 0
  };

  requestRegistry.set(key, registration);

  // Auto-cleanup after request timeout
  const timeoutId = setTimeout(() => {
    requestRegistry.delete(key);
  }, CONFIG.REQUEST_TIMEOUT_MS);

  return { key, timeoutId };
};

/**
 * Unregister a completed request
 * @param {string} key - Request key
 * @param {number} timeoutId - Timeout ID to clear
 */
export const unregisterRequest = (key, timeoutId) => {
  if (timeoutId) {
    clearTimeout(timeoutId);
  }
  requestRegistry.delete(key);
};

/**
 * Calculate exponential backoff delay with jitter
 * @param {number} retryCount - Number of retries so far
 * @returns {number} Delay in milliseconds
 */
export const calculateBackoffDelay = (retryCount) => {
  // Exponential: 500ms, 1000ms, 2000ms, then cap at 5000ms
  const delay = Math.min(
    CONFIG.BASE_DELAY_MS * Math.pow(2, retryCount),
    CONFIG.MAX_DELAY_MS
  );

  // Add jitter (+/- 25%)
  const jitter = delay * 0.25 * (2 * Math.random() - 1);
  return Math.max(0, Math.round(delay + jitter));
};

/**
 * Check if an error is a recoverable conflict (409)
 * This indicates a race condition where another user got the last copy
 * @param {Error} error - Error object
 * @returns {Object} { isConflict: boolean, message?: string }
 */
export const detectConflictError = (error) => {
  if (!error) {
    return { isConflict: false };
  }

  // Check Axios response error
  const status = error?.response?.status;
  if (status === 409) {
    const data = error.response.data || {};
    return {
      isConflict: true,
      message: data.message || 'Resource conflict. Another operation may have succeeded.',
      reason: data.reason || 'conflict'
    };
  }

  // Check if error message indicates race condition
  const errorMsg = (error?.message || '').toLowerCase();
  if (errorMsg.includes('conflict') || errorMsg.includes('already') || errorMsg.includes('last copy')) {
    return {
      isConflict: true,
      message: error.message,
      reason: 'conflict'
    };
  }

  return { isConflict: false };
};

/**
 * Check if an error is retryable
 * @param {Error} error - Error object
 * @param {number} retryCount - Current retry count
 * @returns {Object} { isRetryable: boolean, reason?: string }
 */
export const isErrorRetryable = (error, retryCount = 0) => {
  if (retryCount >= CONFIG.MAX_RETRIES) {
    return { isRetryable: false, reason: 'max-retries-exceeded' };
  }

  if (!error?.response) {
    // Network error, possibly retryable
    return { isRetryable: true, reason: 'network-error' };
  }

  const status = error.response.status;

  // Retryable status codes
  const retryableStatuses = [408, 429, 500, 502, 503, 504];
  if (retryableStatuses.includes(status)) {
    return { isRetryable: true, reason: `http-${status}` };
  }

  // 409 Conflict is NOT retryable - it means someone else succeeded
  if (status === 409) {
    return { isRetryable: false, reason: 'conflict-not-retryable' };
  }

  // 4xx errors (except 408) are generally not retryable
  if (status >= 400 && status < 500) {
    return { isRetryable: false, reason: `client-error-${status}` };
  }

  return { isRetryable: false, reason: 'unknown' };
};

/**
 * Attempt to execute a request with retry logic and race condition handling
 * @param {Function} requestFn - Async function that performs the request
 * @param {Object} options - Configuration options
 * @returns {Promise} Result of request
 */
export const executeWithRetry = async (
  requestFn,
  options = {}
) => {
  const {
    onConflict = null,
    onRetry = null,
    onGiveUp = null,
    maxRetries = CONFIG.MAX_RETRIES
  } = options;

  let lastError = null;
  let retryCount = 0;

  while (retryCount <= maxRetries) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;

      // Handle race condition conflict
      const conflict = detectConflictError(error);
      if (conflict.isConflict) {
        const onConflictResult = onConflict?.(conflict);
        if (onConflictResult?.shouldAbort === true) {
          return {
            ok: false,
            error: conflict.message,
            reason: 'conflict',
            shouldNotRetry: true
          };
        }
        // If not aborting, fall through to retry logic
      }

      // Check if we should retry
      const { isRetryable, reason } = isErrorRetryable(error, retryCount);
      
      if (!isRetryable) {
        onGiveUp?.({ error, reason, retryCount });
        throw error;
      }

      // Calculate backoff and retry
      retryCount += 1;
      if (retryCount <= maxRetries) {
        const delay = calculateBackoffDelay(retryCount - 1);
        onRetry?.({ retryCount, delay, reason, error });
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // All retries exhausted
  onGiveUp?.({ error: lastError, reason: 'max-retries', retryCount });
  throw lastError;
};

/**
 * Deferred request queue for scenarios where requests need to be serialized
 * Useful for book borrow when we want one request at a time to prevent race conditions
 * @param {Function} requestFn - Async function for the request
 * @param {number} priority - Priority level (higher = earlier execution)
 * @returns {Promise} Result of queued request
 */
export const queueRequest = (requestFn, priority = 0) => {
  return new Promise((resolve, reject) => {
    const queueItem = {
      requestFn,
      priority,
      resolve,
      reject,
      createdAt: Date.now()
    };

    requestQueue.push(queueItem);
    
    // Sort by priority
    requestQueue.sort((a, b) => b.priority - a.priority);

    // Process queue if not already running
    processQueue();
  });
};

/**
 * Process the request queue
 * Executes queued requests one at a time
 */
let isProcessing = false;

const processQueue = async () => {
  if (isProcessing || requestQueue.length === 0) {
    return;
  }

  isProcessing = true;

  while (requestQueue.length > 0) {
    const item = requestQueue.shift();

    try {
      const result = await item.requestFn();
      item.resolve(result);
    } catch (error) {
      item.reject(error);
    }
  }

  isProcessing = false;
};

/**
 * Get current registry state (for debugging)
 * @returns {Object} Current request registry
 */
export const getRegistrySnapshot = () => {
  const snapshot = {};
  requestRegistry.forEach((request, key) => {
    snapshot[key] = {
      createdAt: request.createdAt,
      ageMs: Date.now() - request.createdAt,
      retryCount: request.retryCount
    };
  });
  return snapshot;
};

/**
 * Clear all registered requests (e.g., on logout)
 */
export const clearAllRequests = () => {
  requestRegistry.clear();
  requestQueue.length = 0;
};

export default {
  createRequestKey,
  checkDuplicateRequest,
  registerRequest,
  unregisterRequest,
  calculateBackoffDelay,
  detectConflictError,
  isErrorRetryable,
  executeWithRetry,
  queueRequest,
  getRegistrySnapshot,
  clearAllRequests
};
