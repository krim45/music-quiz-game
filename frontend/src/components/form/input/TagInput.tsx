'use client';

import { forwardRef, useId, useState } from 'react';
import clsx from 'clsx';
import { inputSizes } from '@/constants/sizeToken';

import FormField from '@/components/form/element/FormField';
import BaseInput from '@/components/form/input/BaseInput';

import type { ForwardedRef, KeyboardEvent } from 'react';
import type { InputSize } from '@/types/forms';

export interface TagInputProps {
  value: string[];
  onChange: (next: string[]) => void;

  size?: InputSize;
  label?: string;
  required?: boolean;
  error?: boolean;
  disabled?: boolean;
  helperText?: string;
  placeholder?: string;
  className?: string;

  /**
   * 추가하기 전에 검사한다. 거절할 이유를 문자열로 돌려주면 추가하지 않는다.
   * 중복 판단 기준처럼 쓰는 곳마다 다른 규칙은 여기로 받는다.
   */
  validate?: (tag: string, tags: string[]) => string | null | undefined;
  /** validate가 거절했을 때 그 이유와 함께 알려준다 */
  onReject?: (reason: string, tag: string) => void;
}

/**
 * 엔터로 태그를 확정하는 입력.
 *
 * 쉼표 구분 문자열은 값 자체에 쉼표가 들어가면 잘못 쪼개진다
 * ("이제 나만 믿어요, 그대"). 태그로 받으면 그 문제가 없다.
 */
const TagInput = forwardRef<HTMLInputElement, TagInputProps>(
  (
    {
      value,
      onChange,
      size = 'md',
      label = '',
      required,
      error,
      disabled,
      helperText,
      placeholder,
      className,
      validate,
      onReject,
    }: TagInputProps,
    ref: ForwardedRef<HTMLInputElement>
  ) => {
    const id = useId();
    const [draft, setDraft] = useState('');
    const [isFocus, setIsFocus] = useState(false);

    const sz = inputSizes[size];

    const commit = (raw: string) => {
      const tag = raw.trim();
      if (!tag) return;

      setDraft('');

      const reason = validate?.(tag, value);
      if (reason) {
        onReject?.(reason, tag);
        return;
      }

      onChange([...value, tag]);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.nativeEvent.isComposing) return;

      // 쉼표로도 확정할 수 있게 둔다 — 기존에 쉼표로 입력하던 사람이 헤매지 않도록
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        commit(draft);
        return;
      }

      // 입력이 비었을 때 백스페이스면 마지막 태그를 지운다
      if (e.key === 'Backspace' && draft === '' && value.length > 0) {
        e.preventDefault();
        onChange(value.slice(0, -1));
      }
    };

    return (
      <FormField
        className={className}
        boxClassName={clsx('gap-1.5 py-1', sz.inset)}
        size={size}
        id={id}
        label={label}
        required={required}
        disabled={disabled}
        error={error}
        focused={isFocus}
        helperText={helperText}
        grow
      >
        {value.map((tag, i) => (
          <span key={`${tag}-${i}`} className='flex items-center gap-1 rounded bg-gray-700 px-2 py-0.5 text-sm'>
            {tag}
            <button
              type='button'
              aria-label={`${tag} 삭제`}
              className='cursor-pointer leading-none text-gray-400 hover:text-white'
              onClick={() => onChange(value.filter((_, idx) => idx !== i))}
              disabled={disabled}
            >
              ×
            </button>
          </span>
        ))}

        <BaseInput
          // 좌우 여백은 박스(sz.inset)가 갖는다 — 태그와 입력의 시작선을 맞추기 위해
          className={clsx('min-w-24 flex-1', sz.text)}
          ref={ref}
          id={id}
          value={draft}
          placeholder={value.length === 0 ? placeholder : ''}
          disabled={disabled}
          onChange={setDraft}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocus(true)}
          // 입력만 해두고 다른 곳을 눌러도 잃지 않도록 확정한다
          onBlur={() => {
            setIsFocus(false);
            commit(draft);
          }}
        />
      </FormField>
    );
  }
);

TagInput.displayName = 'TagInput';

export default TagInput;
