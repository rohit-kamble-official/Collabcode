import { useEffect, useRef } from "react";

/**
 * Debounced auto-save hook
 * @param {Function} saveFn - async save function to call
 * @param {any} value - value to watch for changes
 * @param {number} delay - debounce delay in ms (default 3000)
 */
export const useAutoSave = (saveFn, value, delay = 3000) => {
  const timer = useRef(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip on first render (don't save on initial mount)
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try {
        await saveFn(value);
      } catch (err) {
        console.error("Auto-save failed:", err);
      }
    }, delay);

    return () => clearTimeout(timer.current);
  }, [value, delay]);
};
