'use client';

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';

export type PopupMenuItem = {
  key: string;
  content: React.ReactNode;
  onSelect?: () => void | Promise<void>;
  disabled?: boolean;
};

type Align = 'left' | 'right';

type PopupMenuProps = {
  children: React.ReactNode;
  items: PopupMenuItem[];
  align?: Align;
  gap?: number;
  className?: string;
  overlay?: boolean;
};

export default function PopupMenu({ items, children, gap = 2, className, overlay = false }: PopupMenuProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const anchorRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const toggle = () => setOpen(!open);

  const close = () => setOpen(false);

  const computePosition = useCallback(() => {
    const anchor = anchorRef.current;
    const panel = panelRef.current;
    if (!anchor || !panel) return;

    const ar = anchor.getBoundingClientRect();
    const pr = panel.getBoundingClientRect();

    let top = ar.bottom + gap;
    let left = ar.left;

    // 화면 밖 보정
    left = Math.max(8, Math.min(left, window.innerWidth - pr.width - 8));

    // 아래 공간 없으면 위로
    if (ar.bottom + pr.height + gap > window.innerHeight) {
      top = ar.top - pr.height - gap;
    }

    setPos({ top, left });
  }, [gap]);

  /** 열릴 때 위치 계산 */
  useLayoutEffect(() => {
    if (open) computePosition();
  }, [open, computePosition]);

  // scroll/resize 시 재계산
  useEffect(() => {
    if (!open) return;

    window.addEventListener('resize', computePosition);
    window.addEventListener('scroll', computePosition, true);

    return () => {
      window.removeEventListener('resize', computePosition);
      window.removeEventListener('scroll', computePosition, true);
    };
  }, [open, computePosition]);

  // ESC 닫기
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  // 바깥 클릭 닫기 (portal에서도 정상 동작)
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      const panel = panelRef.current;
      const anchor = anchorRef.current;
      if (!panel || !anchor) return;

      const target = e.target;
      if (!(target instanceof Node)) return;

      if (panel.contains(target) || anchor.contains(target)) return;

      close();
    };

    window.addEventListener('pointerdown', onPointerDown);
    return () => window.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  const onItemClick = async (item: PopupMenuItem) => {
    if ('type' in item) return;
    if (item.disabled) return;

    await Promise.resolve(item.onSelect?.());
    close();
  };

  const panel = (
    <>
      {overlay && <div className='fixed inset-0 z-50 bg-transparent' aria-hidden='true' />}

      <div
        ref={panelRef}
        role='menu'
        aria-label='options'
        className={clsx('fixed rounded border bg-gray-200 py-1', className)}
        style={{ top: pos.top, left: pos.left }}
      >
        <ul>
          {items.map((item) => {
            if ('type' in item && item.type === 'separator') {
              return <li key={item.key} className='my-2 h-px bg-gray-200' />;
            }

            return (
              <li key={item.key}>
                <button
                  type='button'
                  role='menuitem'
                  disabled={!!item.disabled}
                  onClick={() => onItemClick(item)}
                  className={clsx(
                    'flex w-full items-center px-3 py-2 text-left text-sm transition',
                    item.disabled ? 'cursor-not-allowed text-gray-500' : 'cursor-pointer text-black hover:bg-white'
                  )}
                >
                  {item.content}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );

  return (
    <>
      <div ref={anchorRef} onClick={toggle} className='inline-flex'>
        {children}
      </div>
      {open ? createPortal(panel, document.body) : null}
    </>
  );
}
