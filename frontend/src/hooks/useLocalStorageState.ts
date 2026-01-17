'use client';

import { useEffect, useState } from 'react';
import { getLocalStorageItem, setLocalStorageItem } from '@/utils/localStorage';
import { isUpdater } from '@/utils/reactUtils';

export function useLocalStorageState<T>(key: string, initialValue: T | (() => T)) {
  const [state, setState] = useState<T>(initialValue);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = getLocalStorageItem<T>(key);

    if (stored !== null) {
      setState(stored);
    }
    setReady(true);
  }, [key]);

  const update: React.Dispatch<React.SetStateAction<T>> = (action) => {
    setState((prev) => {
      const next = isUpdater(action) ? action(prev) : action;
      setLocalStorageItem(key, next);
      return next;
    });
  };

  return [state, update, ready] as const;
}
