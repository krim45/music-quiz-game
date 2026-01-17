import { getLocalStorageItem, setLocalStorageItem } from '@/utils/localStorage';

const KEY = 'playerId';

export function getPlayerId(): string {
  if (typeof window === 'undefined') {
    throw new Error('getPlayerId must be used in the browser');
  }

  return getLocalStorageItem<string>(KEY) || '';
}

export function setPlayerId(id: string) {
  if (typeof window === 'undefined') {
    throw new Error('setPlayerId must be used in the browser');
  }

  setLocalStorageItem(KEY, id);
}
