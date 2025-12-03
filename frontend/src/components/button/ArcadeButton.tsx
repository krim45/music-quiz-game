'use client';

import { forwardRef } from 'react';
import clsx from 'clsx';
import Link from 'next/link';

interface ArcadeButtonProps {
  className?: string;
  children: React.ReactNode;
  selected?: boolean;
  disabled?: boolean;
  href?: string;
  onClick?: () => void;
  onMouseEnter?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLAnchorElement>) => void;
}

const ArcadeButton = forwardRef<HTMLAnchorElement, ArcadeButtonProps>(
  ({ className, children, selected, disabled, href = '#', onClick, onMouseEnter, onFocus }, ref) => {
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
      <Link
        ref={ref}
        href={disabled ? '#' : href}
        tabIndex={disabled ? -1 : 0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onMouseEnter={onMouseEnter}
        onFocus={onFocus}
        className={clsx(
          'relative rounded-md border-none px-5 py-2 outline-none select-none',
          'text-2xl text-white',
          disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer',
          { 'shadow-arcade-selected': selected },
          className
        )}
      >
        {children}

        {/* 선택된 항목 마커 */}
        <span
          className={clsx(
            'absolute top-1/2 -left-7 -translate-y-1/2 transition-opacity',
            selected ? 'opacity-100' : 'opacity-0'
          )}
          aria-hidden
        >
          &#62;
        </span>
      </Link>
    );
  }
);

ArcadeButton.displayName = 'ArcadeButton';

export default ArcadeButton;
