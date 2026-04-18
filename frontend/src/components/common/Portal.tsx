'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
  children: React.ReactNode;
  container?: HTMLElement | null;
}

export default function Portal({ children, container }: PortalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Client-only portal: SSR renders null; flip after mount so hydration matches.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional post-hydration gate
    setMounted(true);
  }, []);

  const mountNode = container ?? (typeof document !== 'undefined' ? document.body : null);

  if (!mounted || !mountNode) return null;

  return createPortal(children, mountNode);
}
