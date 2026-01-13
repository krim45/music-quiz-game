export function getLocalStorageItem<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;

    return JSON.parse(raw);
  } catch (e) {
    console.error('localStorage load error', e);
    return null;
  }
}

export function setLocalStorageItem<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('localStorage save error', e);
  }
}
