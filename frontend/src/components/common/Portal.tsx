'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
  children: React.ReactNode;
  container?: HTMLElement | null;
}

export default function Portal({ children, container }: PortalProps) {
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setMountNode(container ?? document.body);
  }, [container]);

  if (!mountNode) return null;

  return createPortal(children, mountNode);
}
