import { useEffect, useState } from 'react';

export function useLocalStorageState(key: string, initialValue: string | (() => string) = '') {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) setValue(stored);
    } catch (e) {
      console.error('localStorage error', e);
    }
  }, [key]);

  const update = (next: string) => {
    setValue(next);
    try {
      localStorage.setItem(key, next);
    } catch (e) {
      console.error('localStorage save error', e);
    }
  };

  return [value, update] as const;
}
