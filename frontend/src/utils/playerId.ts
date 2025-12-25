import { v4 as uuid } from 'uuid';

const KEY = 'playerId';

function createId(): string {
  return uuid();
}

export function getPlayerId(): string {
  if (typeof window === 'undefined') {
    throw new Error('getPlayerId must be used in the browser');
  }

  try {
    const stored = localStorage.getItem(KEY);
    if (stored) return stored;

    const newId = createId();
    localStorage.setItem(KEY, newId);
    return newId;
  } catch (err) {
    console.error('localStorage error:', err);
    return createId(); // fallback;
  }
}
