'use client';

import { useEffect, useId, useRef } from 'react';
import { trapFocusOnTab } from '@/utils/trapFocusOnTab';
import clsx from 'clsx';

interface ModalProps {
  open: boolean;
  onClose: () => void;

  title?: React.ReactNode;
  ariaLabel?: string;
  className?: string;
  children: React.ReactNode;

  // 옵션
  closeOnBackdrop?: boolean; // 배경 클릭 닫기
  closeOnEsc?: boolean; // ESC 닫기
  showCloseButton?: boolean; // X 버튼
  width?: number | string; // 기본 640
  height?: number | string;
}

/**
 * 열려 있는 모달. 뒤에 있을수록 위에 떠 있다.
 *
 * 모달마다 window에 keydown을 걸기 때문에, 모달 안에 모달을 띄우면(검색 → 미리보기)
 * ESC 한 번에 둘 다 닫히고 Tab 가두기도 서로 다툰다. 맨 위 모달만 키를 처리한다.
 */
const openModals: string[] = [];
const isTopmost = (id: string) => openModals[openModals.length - 1] === id;

export default function Modal({
  open,
  onClose,
  title,
  ariaLabel,
  children,
  className,
  closeOnBackdrop = true,
  closeOnEsc = true,
  showCloseButton = true,
  width = 640,
  height,
}: ModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const lastActiveElRef = useRef<HTMLElement | null>(null);

  // 열릴 때: 포커스 이동, 스크롤 잠금, 닫힐 때 복원
  useEffect(() => {
    if (!open) return;

    lastActiveElRef.current = document.activeElement as HTMLElement | null;
    openModals.push(titleId);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const timer = setTimeout(() => panelRef.current?.focus(), 0);

    return () => {
      clearTimeout(timer);
      openModals.splice(openModals.indexOf(titleId), 1);
      document.body.style.overflow = prevOverflow;
      lastActiveElRef.current?.focus?.();
    };
  }, [open, titleId]);

  // ESC + Tab 트랩
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (!isTopmost(titleId)) return;

      if (closeOnEsc && e.key === 'Escape') {
        onClose();
      }

      if (e.key === 'Tab') {
        trapFocusOnTab(e, panelRef.current!);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, closeOnEsc, onClose, titleId]);

  if (!open) return null;

  const hasHeader = Boolean(title) || showCloseButton;

  return (
    <div
      role='presentation'
      className='fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-xs'
      onMouseDown={(e) => {
        if (!closeOnBackdrop) return;
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role='dialog'
        aria-modal='true'
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : ariaLabel}
        tabIndex={-1}
        className={clsx(
          'flex h-full w-full flex-col overflow-hidden border border-gray-800 bg-gray-900 outline-none md:h-[90vh] md:rounded-xl',
          className
        )}
        style={{ width, height }}
      >
        {hasHeader && (
          <div className='flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-3'>
            {title ? (
              <h2 id={titleId} className='m-0 text-base font-semibold'>
                {title}
              </h2>
            ) : null}

            {showCloseButton && (
              <button
                type='button'
                aria-label='닫기'
                className='inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg outline-none hover:bg-gray-800 focus-visible:ring-2 focus-visible:ring-gray-400 active:bg-gray-700'
                onClick={onClose}
              >
                X
              </button>
            )}
          </div>
        )}

        <div className='scrollbar-custom h-full w-full overflow-auto p-4'>{children}</div>
      </div>
    </div>
  );
}
