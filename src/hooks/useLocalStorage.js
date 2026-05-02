import { useState } from "react";

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value) => {
    // Mirror useState's functional-update support so callers can use
    // setX(prev => ...) exactly as they would with plain useState.
    setStoredValue((prev) => {
      const next = value instanceof Function ? value(prev) : value;
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch (err) {
        console.error(`useLocalStorage: could not write "${key}"`, err);
      }
      return next;
    });
  };

  return [storedValue, setValue];
}
