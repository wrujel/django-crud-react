import { useEffect, useState } from "react";

/**
 * Like useState, but persisted to localStorage under `key`. Reads the stored
 * value lazily on first render and writes back whenever it changes.
 */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage unavailable (private mode / quota) — ignore */
    }
  }, [key, value]);

  return [value, setValue];
}
