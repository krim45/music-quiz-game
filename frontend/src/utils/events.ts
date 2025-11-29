export function mergeEvents<Args extends unknown[]>(...handlers: Array<((...args: Args) => void) | undefined>) {
  return (...args: Args) => {
    handlers.forEach((fn) => fn?.(...args));
  };
}
