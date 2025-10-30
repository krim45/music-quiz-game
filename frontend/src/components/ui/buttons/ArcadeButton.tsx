'use client';

import { forwardRef } from 'react';
import clsx from 'clsx';

interface ArcadeButtonProps {
  className?: string;
  children: React.ReactNode;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  onMouseEnter?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLButtonElement>) => void;
}

const ArcadeButton = forwardRef<HTMLButtonElement, ArcadeButtonProps>(
  ({ className, children, selected, disabled, onClick, onMouseEnter, onFocus }, ref) => {
    const handleClick = () => {
      if (!disabled) {
        onClick?.();
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (disabled) return;

      if (e.key === 'Enter') {
        onClick?.();
      }
    };

    return (
      <button
        ref={ref}
        tabIndex={disabled ? -1 : 0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onMouseEnter={onMouseEnter}
        onFocus={onFocus}
        className={clsx(
          'relative px-5 py-2 rounded-md border-none outline-none select-none',
          'text-[20px] md:text-[24px] text-[#EDEDED]',
          disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:brightness-110',
          { 'shadow-[0_0_16px_rgba(0,255,255,.30),_0_0_28px_rgba(255,0,255,.20)]': selected },
          className
        )}
      >
        {children}

        {/* 선택된 항목 마커 */}
        <span
          className={clsx(
            'absolute -left-6 md:-left-7 top-1/2 -translate-y-1/2 transition-opacity',
            selected ? 'opacity-100' : 'opacity-0'
          )}
          aria-hidden
        >
          &#62;
        </span>
      </button>
    );
  }
);

ArcadeButton.displayName = 'ArcadeButton';

export default ArcadeButton;
