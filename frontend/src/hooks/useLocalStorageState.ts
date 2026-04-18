'use client';

import { useState } from 'react';
import { getLocalStorageItem, setLocalStorageItem } from '@/utils/localStorage';
import { isUpdater } from '@/utils/reactUtils';

function readLocalStorageOrDefault<T>(key: string, initialValue: T): T {
  const stored = getLocalStorageItem<T>(key);
  return stored !== null ? stored : initialValue;
}

export function useLocalStorageState<T>(key: string, initialValue: T) {
  const [state, setState] = useState<{ key: string; value: T }>(() => {
    return { key, value: readLocalStorageOrDefault(key, initialValue) };
  });

  const currentValue = state.key === key ? state.value : readLocalStorageOrDefault(key, initialValue);

  const update: React.Dispatch<React.SetStateAction<T>> = (action) => {
    setState((prev) => {
      const prevValue = prev.key === key ? prev.value : readLocalStorageOrDefault(key, initialValue);
      const next = isUpdater(action) ? action(prevValue) : action;
      setLocalStorageItem(key, next);
      return { key, value: next };
    });
  };

  return [currentValue, update] as const;
}
