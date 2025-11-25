import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T, debounceMs: number = 2000) {
  // Get from localStorage or use initial value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error loading ${key} from localStorage:`, error);
      return initialValue;
    }
  });

  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  // Save to localStorage with debounce
  useEffect(() => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    setSaveStatus('saving');
    
    const timeout = setTimeout(() => {
      try {
        window.localStorage.setItem(key, JSON.stringify(storedValue));
        setSaveStatus('saved');
      } catch (error) {
        console.error(`Error saving ${key} to localStorage:`, error);
        setSaveStatus('error');
      }
    }, debounceMs);

    setSaveTimeout(timeout);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [storedValue, key]);

  return [storedValue, setStoredValue, saveStatus] as const;
}
