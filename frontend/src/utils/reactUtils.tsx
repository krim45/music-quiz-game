export function isUpdater<T>(action: React.SetStateAction<T>): action is (prev: T) => T {
  return typeof action === 'function';
}
