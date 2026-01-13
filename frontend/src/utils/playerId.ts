import { v4 as uuid } from 'uuid';
import { getLocalStorageItem, setLocalStorageItem } from '@/utils/localStorage';

const KEY = 'playerId';

function createId(): string {
  return uuid();
}

export function getPlayerId(): string {
  if (typeof window === 'undefined') {
    throw new Error('getPlayerId must be used in the browser');
  }

  const stored = getLocalStorageItem<string>(KEY);
  if (stored) return stored;

  const newId = createId();
  setLocalStorageItem(KEY, newId);
  return newId;
}
