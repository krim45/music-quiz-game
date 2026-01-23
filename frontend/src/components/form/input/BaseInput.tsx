'use client';

import { forwardRef, useState } from 'react';
import clsx from 'clsx';
import { mergeEvents } from '@/utils/events';

import type { InputHTMLAttributes, ForwardedRef, ChangeEvent, FocusEvent, FormEvent } from 'react';
import type { InputType } from '@/types/forms';

export interface BaseInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  className?: string;
  type?: InputType;
  keyFilter?: RegExp;
  value?: string | number;

  // events
  onChange: (value: string, e?: ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (e: FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
}

const BaseInput = forwardRef<HTMLInputElement, BaseInputProps>(
  (
    {
      className = '',
      keyFilter,
      disabled,
      readOnly,
      type = 'text',
      value,
      // events
      onChange,
      onWheel,
      onBeforeInput,
      ...rest
    }: BaseInputProps,
    ref: ForwardedRef<HTMLInputElement>
  ) => {
    const [isComposing, setIsComposing] = useState(false);

    const getNextValue = (el: HTMLInputElement, data: string | null) => {
      const nextValue = el.value;
      const start = el.selectionStart ?? nextValue.length;
      const end = el.selectionEnd ?? nextValue.length;

      if (data == null) return nextValue;

      return nextValue.slice(0, start) + data + nextValue.slice(end);
    };

    const handleBeforeInput = (e: FormEvent<HTMLInputElement>) => {
      if (isComposing || !keyFilter) return;

      const inputEvent = e.nativeEvent as InputEvent;
      if (inputEvent.isComposing || inputEvent.inputType !== 'insertText') return;

      const target = e.target as HTMLInputElement;
      const nextValue = getNextValue(target, inputEvent.data);

      if (!keyFilter.test(nextValue)) {
        inputEvent.preventDefault?.();
      }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.value, e);
    };

    const handleWheel = (e: React.WheelEvent<HTMLInputElement>) => {
      if (type === 'number') {
        e.currentTarget.blur();
      }
    };

    return (
      <input
        ref={ref}
        type={type}
        className={clsx(
          'placeholder:text-gray-500 disabled:placeholder-gray-600',
          'no-spin-button text-ellipsis disabled:text-gray-600',
          'outline-none',
          disabled ? 'cursor-not-allowed' : 'cursor-text',
          className
        )}
        value={value ?? ''}
        onCompositionStart={() => setIsComposing(true)}
        onCompositionEnd={() => setIsComposing(false)}
        onBeforeInput={mergeEvents(onBeforeInput, handleBeforeInput)}
        onWheel={mergeEvents(onWheel, handleWheel)}
        onChange={handleChange}
        disabled={disabled}
        readOnly={readOnly}
        {...rest}
      />
    );
  }
);

BaseInput.displayName = 'BaseInput';

export default BaseInput;
