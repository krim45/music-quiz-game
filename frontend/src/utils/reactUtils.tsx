export function isUpdater<T>(action: React.SetStateAction<T>): action is (prev: T) => T {
  return typeof action === 'function';
}

export function isTypingElement(el: Element | null) {
  if (!el) return false;

  const tag = el.tagName.toLowerCase();

  return (
    tag === 'input' ||
    tag === 'textarea' ||
    tag === 'select' ||
    tag === 'button' ||
    (el as HTMLElement).isContentEditable
  );
}
