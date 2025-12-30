'use client';

import { forwardRef, useId } from 'react';
import clsx from 'clsx';
import { checkboxSizes } from '@/constants/sizeToken';

export interface CheckboxProps {
  className?: string;
  label?: React.ReactNode;
  name?: string;
  disabled?: boolean;
  checked: boolean;

  size?: 'sm' | 'md' | 'lg';
  onChange?: (checked: boolean) => void;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      disabled,
      checked,
      onChange,
      name,
      className,
      size = 'md', // ✅ 기본값
    },
    ref
  ) => {
    const id = useId();
    const styles = checkboxSizes[size];

    return (
      <label
        htmlFor={id}
        className={clsx(
          'inline-flex items-center gap-2 select-none',
          styles.label,
          disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
          className
        )}
      >
        <span
          className={clsx(
            'relative inline-flex items-center justify-center rounded border transition-colors',
            styles.box,
            disabled ? 'border-zinc-700' : 'border-zinc-500',
            checked ? 'bg-orange border-orange' : 'bg-black'
          )}
        >
          {checked && (
            <svg className={clsx(styles.icon, 'text-black')} viewBox='0 0 20 20' fill='none' aria-hidden='true'>
              <path
                d='M16.5 5.5L8.25 13.75L3.5 9'
                stroke='currentColor'
                strokeWidth='4'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          )}

          <input
            type='checkbox'
            ref={ref}
            id={id}
            name={name}
            disabled={disabled}
            checked={checked}
            onChange={(e) => onChange?.(e.target.checked)}
            hidden
          />
        </span>

        {label && <span>{label}</span>}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
