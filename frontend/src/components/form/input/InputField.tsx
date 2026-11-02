'use client';

import { forwardRef, useState, useId } from 'react';
import { inputSizes } from '@/constants/sizeToken';
import clsx from 'clsx';

// components
import FormField from '@/components/form/element/FormField';
import CharCounter from '@/components/form/element/CharCounter';
import BaseInput, { BaseInputProps } from '@/components/form/input/BaseInput';

// icons
import Search from '@/components/icon/Search';
import Eye from '@/components/icon/Eye';
import EyeOff from '@/components/icon/EyeOff';
import Clear from '@/components/icon/Clear';

import type { ForwardedRef, ChangeEvent, FocusEvent, MouseEvent, ReactNode } from 'react';
import type { InputType, InputSize } from '@/types/forms';

export interface InputProps extends Omit<BaseInputProps, 'size'> {
  size?: InputSize;
  label?: string;
  required?: boolean;
  error?: boolean;
  clear?: boolean;
  charLimit?: number;
  icon?: ReactNode;
  helperText?: string;
  onClickIcon?: () => void;
}

const InputField = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className = '',
      size = 'md',
      label = '',
      required,
      type = 'text',
      value = '',
      disabled,
      readOnly,
      error,
      clear,
      charLimit,
      helperText,
      icon: iconProp,
      onChange,
      onFocus,
      onBlur,
      onClickIcon,
      ...rest
    }: InputProps,
    ref: ForwardedRef<HTMLInputElement>
  ) => {
    const id = useId();
    const [inputType, setInputType] = useState<InputType>(type);
    const [isFocus, setIsFocus] = useState(false);

    const sz = inputSizes[size];

    const handleChange = (value: string, e?: ChangeEvent<HTMLInputElement>) => {
      if (charLimit && value.length > charLimit) return;
      onChange(value, e);
    };

    const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
      setIsFocus(true);
      onFocus?.(e);
    };

    const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
      setIsFocus(false);
      onBlur?.(e);
    };

    const togglePassword = () => setInputType((prev) => (prev === 'password' ? 'text' : 'password'));

    const handleClear = () => onChange('');

    const handleDefaultIconAction = () => {
      if (type === 'password') togglePassword();
      if (clear && value) handleClear();
    };

    const handleIconClick = (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      if (disabled || readOnly) return;
      onClickIcon?.();
      handleDefaultIconAction();
    };

    const getIcon = () => {
      if (iconProp) return iconProp;
      if (clear && value) return <Clear />;
      if (type === 'search') return <Search />;
      if (type === 'password') return inputType === 'password' ? <EyeOff /> : <Eye />;
      return null;
    };

    const icon = getIcon();

    return (
      <FormField
        className={className}
        size={size}
        id={id}
        label={label}
        required={required}
        disabled={disabled}
        error={error}
        focused={isFocus}
        helperText={helperText}
        labelAddon={
          charLimit ? (
            <CharCounter className={sz.helper} value={value} charLimit={charLimit} disabled={disabled} />
          ) : null
        }
      >
        <BaseInput
          className={clsx('w-full', sz.input)}
          ref={ref}
          id={id}
          type={inputType}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          readOnly={readOnly}
          {...rest}
        />

        {icon && (
          <button
            type='button'
            className={clsx(
              'absolute top-1/2 right-3 flex -translate-y-1/2 cursor-pointer items-center justify-center',
              sz.icon
            )}
            disabled={disabled || readOnly}
            tabIndex={disabled || readOnly ? -1 : 0}
            onMouseDown={handleIconClick}
          >
            {icon}
          </button>
        )}
      </FormField>
    );
  }
);

InputField.displayName = 'InputField';

export default InputField;
