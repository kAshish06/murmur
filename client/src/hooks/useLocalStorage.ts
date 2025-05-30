import { useState, useCallback } from "react";

export default function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] {
  const getStoredValue = (): T => {
    try {
      const storedValue = localStorage.getItem(key);
      if (storedValue === null) {
        return initialValue;
      }
      return JSON.parse(storedValue) as T;
    } catch (e) {
      console.error("Error retrieving or parsing value from local storage:", e);
      return initialValue;
    }
  };

  const [value, setValue] = useState<T>(getStoredValue);

  const updateValue = useCallback(
    (newValue: T) => {
      setValue(newValue);
      try {
        localStorage.setItem(key, JSON.stringify(newValue));
      } catch (e) {
        console.error("Error setting value in local storage:", e);
      }
    },
    [key]
  );

  return [value, updateValue];
}
