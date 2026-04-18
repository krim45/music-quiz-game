'use client';

import { createPortal } from 'react-dom';

interface PortalProps {
  children: React.ReactNode;
  container?: HTMLElement | null;
}

export default function Portal({ children, container }: PortalProps) {
  const mountNode = container ?? (typeof document !== 'undefined' ? document.body : null);

  if (!mountNode) return null;

  return createPortal(children, mountNode);
}
