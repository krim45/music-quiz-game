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
  value: string;

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
      const value = el.value;
      const start = el.selectionStart ?? value.length;
      const end = el.selectionEnd ?? value.length;

      if (data == null) return value;

      return value.slice(0, start) + data + value.slice(end);
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
      if (rest.type === 'number') {
        e.currentTarget.blur();
      }
    };

    return (
      <input
        ref={ref}
        className={clsx(
          // placeholder
          'placeholder:text-gray-500 disabled:placeholder-gray-600',
          // text, font
          'no-spin-button text-ellipsis disabled:text-gray-600',
          // outline
          'outline-none',
          // cursor
          disabled ? 'cursor-not-allowed' : 'cursor-text',
          className
        )}
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

export default BaseInput;
