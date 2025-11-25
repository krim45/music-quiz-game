'use client';

import { ReactNode, forwardRef, useId } from 'react';
import clsx from 'clsx';

export interface RadioProps<T extends string | boolean | number> {
  className?: string;
  label?: ReactNode;
  value: T;
  disabled?: boolean;

  /** injected by RadioGroup */
  name?: string;
  checked?: boolean;
  onChange?: (value: T) => void;
}

const Radio = forwardRef(
  <T extends string | number | boolean>(
    { value, label, disabled, checked, onChange, name, className }: RadioProps<T>,
    ref: React.Ref<HTMLInputElement>
  ) => {
    const id = useId();

    return (
      <label
        htmlFor={id}
        className={clsx(
          'inline-flex items-center gap-2 select-none',
          disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
          className
        )}
        role='radio'
        tabIndex={disabled ? -1 : 0}
      >
        <span
          className={clsx(
            'relative  h-4 w-4 inline-flex items-center justify-center rounded-full transition-colors border',
            { 'border-orange bg-black': checked }
          )}
        >
          {checked && <span className='h-2.5 w-2.5 absolute top-1/2 -translate-y-1/2 bg-orange rounded-full'></span>}
          <input
            type='radio'
            ref={ref}
            id={id}
            name={name}
            disabled={disabled}
            onChange={() => onChange?.(value)}
            hidden
          />
        </span>

        {label && <span>{label}</span>}
      </label>
    );
  }
);

Radio.displayName = 'Radio';

export default Radio;
