'use client';

import { useEffect, useRef } from 'react';
import { trapFocusOnTab } from '@/utils/trapFocusOnTab';

interface ModalProps {
  open: boolean;
  onClose: () => void;

  title?: React.ReactNode;
  children: React.ReactNode;

  // 옵션
  closeOnBackdrop?: boolean; // 배경 클릭 닫기
  closeOnEsc?: boolean; // ESC 닫기
  showCloseButton?: boolean; // X 버튼
  width?: number | string; // 기본 640
}

export default function Modal({
  open,
  onClose,
  title,
  children,
  closeOnBackdrop = true,
  closeOnEsc = true,
  showCloseButton = true,
  width = 640,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const lastActiveElRef = useRef<HTMLElement | null>(null);

  // 열릴 때: 포커스 이동, 스크롤 잠금, 닫힐 때 복원
  useEffect(() => {
    if (!open) return;

    lastActiveElRef.current = document.activeElement as HTMLElement | null;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const timer = setTimeout(() => panelRef.current?.focus(), 0);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = prevOverflow;
      lastActiveElRef.current?.focus?.();
    };
  }, [open]);

  // ESC + Tab 트랩
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (closeOnEsc && e.key === 'Escape') {
        onClose();
      }

      if (e.key === 'Tab') {
        trapFocusOnTab(e, panelRef.current!);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, closeOnEsc, onClose]);

  if (!open) return null;

  const hasHeader = Boolean(title) || showCloseButton;

  return (
    <div
      role='presentation'
      className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm'
      onMouseDown={(e) => {
        if (!closeOnBackdrop) return;
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role='dialog'
        tabIndex={-1}
        className='flex h-full w-full flex-col overflow-hidden border border-zinc-800 bg-zinc-900 outline-none md:h-[90vh] md:rounded-xl'
        style={{ width }}
      >
        {hasHeader && (
          <div className='flex items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3'>
            {title ? <h2 className='m-0 text-base font-semibold'>{title}</h2> : null}

            {showCloseButton && (
              <button
                className='inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg outline-none hover:bg-zinc-800 focus-visible:ring-2 focus-visible:ring-zinc-400 active:bg-zinc-700'
                onClick={onClose}
              >
                X
              </button>
            )}
          </div>
        )}

        <div className='h-full w-full overflow-auto p-4'>{children}</div>
      </div>
    </div>
  );
}
