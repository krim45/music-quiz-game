'use client';

import { forwardRef, ForwardedRef, useState, ChangeEvent, FocusEvent, useId } from 'react';
import { InputType, TextAlign } from '@/types/forms';
import clsx from 'clsx';

// components
import Label from '@/components/forms/element/Label';
import CharCounter from '@/components/forms/element/CharCounter';
import BaseInput, { BaseInputProps } from '@/components/forms/input/BaseInput';
import HelperText from '@/components/forms/element/HelperText';

// icons
import Search from '@/components/icons/Search';
import Eye from '@/components/icons/Eye';
import EyeOff from '@/components/icons/EyeOff';
import Clear from '@/components/icons/Clear';

export interface InputProps extends BaseInputProps {
  label?: string;
  required?: boolean;
  error?: boolean;
  charLimit?: number;
  helperText?: string;
  height?: number | string;
  textAlign?: TextAlign;
}

const InputField = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      // class
      className = '',

      // label
      label = '',
      type = InputType.Text,
      required,
      charLimit,

      // base input
      value = '',
      disabled,
      readOnly,
      error,
      clear,

      // helper text
      helperText,

      // events
      onChange,
      onFocus,
      onBlur,
      onClickIcon,
      ...rest
    }: InputProps,
    ref: ForwardedRef<HTMLInputElement>
  ) => {
    const [inputType, setInputType] = useState<InputType>(type);
    const [isFocus, setIsFocus] = useState<boolean>(false);
    const id = useId();

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

    const togglePasswordVisibility = () => {
      setInputType((prevType) => (prevType === InputType.Password ? InputType.Text : InputType.Password));
    };

    const handleClear = () => {
      onChange('');
    };

    const handleDefaultIconClick = () => {
      if (type === InputType.Password) {
        togglePasswordVisibility();
      }

      if (clear && value && !readOnly && !disabled) {
        handleClear();
      }
    };

    const handleClickIcon = () => {
      onClickIcon?.();
      handleDefaultIconClick();
    };

    const getDefaultIcon = () => {
      if (clear && value) return <Clear />;

      if (type === InputType.Search) return <Search />;

      if (type === InputType.Password) return inputType === InputType.Password ? <EyeOff /> : <Eye />;

      return null;
    };

    const icon = rest.icon ?? getDefaultIcon();

    const inputClassNames = clsx(
      'h-10',
      // border
      'rounded-sm border border-solid',
      error ? 'border-red' : isFocus ? 'border-green' : 'border-white'
    );

    const iconClassNames = clsx({ 'text-gray-500': disabled || readOnly });

    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        <div className='flex items-center justify-between gap-0.5'>
          <Label className='text-lg' id={id} label={label} required={required} disabled={disabled} />

          <CharCounter className='text-xs' value={value} charLimit={charLimit} disabled={disabled} />
        </div>

        <div className='relative flex flex-col gap-1.5'>
          <BaseInput
            className={inputClassNames}
            iconClassName={iconClassNames}
            ref={ref}
            id={id}
            type={inputType}
            value={value}
            disabled={disabled}
            readOnly={readOnly}
            icon={icon}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onClickIcon={handleClickIcon}
            {...rest}
          />

          <HelperText className='text-xs' text={helperText} disabled={disabled} error={error} />
        </div>
      </div>
    );
  }
);

InputField.displayName = 'InputField';

export default InputField;
