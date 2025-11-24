'use client';

import {
  forwardRef,
  ForwardedRef,
  ChangeEvent,
  FormEvent,
  useState,
  InputHTMLAttributes,
  ReactNode,
  FocusEvent,
} from 'react';
import clsx from 'clsx';
import { InputType } from '@/types/forms';

export interface BaseInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  className?: string;
  inputClassName?: string;
  iconClassName?: string;
  id?: string;
  type?: InputType;
  value: string | number;
  placeholder?: string;
  icon?: ReactNode;
  clear?: boolean;
  keyFilter?: RegExp;
  disabled?: boolean;
  readOnly?: boolean;

  // events
  onChange: (value: string, e?: ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (e: FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
  onClickIcon?: () => void;
}

const BaseInput = forwardRef<HTMLInputElement, BaseInputProps>(
  (
    {
      className = '',
      inputClassName = '',
      iconClassName = '',
      keyFilter,
      disabled,
      readOnly,
      icon,

      // events
      onChange,
      onClickIcon,
      ...rest
    }: BaseInputProps,
    ref: ForwardedRef<HTMLInputElement>
  ) => {
    const [isComposing, setIsComposing] = useState(false);

    const getNextValue = (el: HTMLInputElement, data: string | null) => {
      const value = el.value;
      const start = el.selectionStart ?? value.length;
      const end = el.selectionEnd ?? value.length;

      if (data == null) return value;

      return value.slice(0, start) + data + value.slice(end);
    };

    const handleBeforeInput = (e: FormEvent<HTMLInputElement>) => {
      if (isComposing || !keyFilter) return;

      const inputEvent = e.nativeEvent as InputEvent;
      const target = e.target as HTMLInputElement;
      const nextValue = getNextValue(target, inputEvent.data);

      if (!keyFilter.test(nextValue)) {
        inputEvent.preventDefault?.();
      }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.value, e);
    };

    const handleIconClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault(); // input 포커스 손실 방지

      if (disabled || readOnly) return;

      onClickIcon?.();
    };

    const inputClassNames = clsx(
      // placeholder
      'placeholder:text-gray-500 disabled:placeholder-gray-600',
      // text, font
      'text-ellipsis disabled:text-gray-600 no-spin-button',
      // border
      'outline-none',
      // box model
      'w-full h-full p-2',
      // cursor
      disabled ? 'cursor-not-allowed' : 'cursor-text',
      inputClassName
    );

    const iconClassNames = clsx(
      // box model
      'flex items-center h-5 w-5',
      // position
      'absolute right-3 top-1/2 -translate-y-1/2',
      // cursor
      disabled || readOnly ? 'cursor-not-allowed' : onClickIcon ? 'cursor-pointer' : '',
      iconClassName
    );

    return (
      <div className={`relative ${className}`}>
        <input
          className={inputClassNames}
          ref={ref}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          onBeforeInput={handleBeforeInput}
          onChange={handleChange}
          disabled={disabled}
          readOnly={readOnly}
          {...rest}
        />

        {icon && (
          <button
            type='button'
            className={iconClassNames}
            tabIndex={disabled || readOnly ? -1 : 0}
            disabled={disabled || readOnly}
            onMouseDown={handleIconClick}
          >
            {icon}
          </button>
        )}
      </div>
    );
  }
);

BaseInput.displayName = 'BaseInput';

export default BaseInput;
