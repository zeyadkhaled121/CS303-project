/**
 * DEBOUNCE UTILITY
 * Prevents rapid-fire function calls
 * 
 * Usage: const debouncedFn = debounce(fn, 300);
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * THROTTLE UTILITY
 * Limits function call frequency
 * 
 * Usage: const throttledFn = throttle(fn, 300);
 */
export const throttle = (func, limit = 300) => {
  let inThrottle;
  
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};
