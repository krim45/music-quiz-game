'use client';

import { forwardRef, useState } from 'react';
import { formatSeconds, parseTime, type TimeParseError } from '@/utils/time';

import InputField, { type InputProps } from '@/components/form/input/InputField';

import type { ForwardedRef, KeyboardEvent } from 'react';

/**
 * 초. 비어 있으면 undefined, 입력이 시간 형식이 아니면 null.
 *
 * 틀린 입력은 입력칸에 그대로 남긴다. 그동안 이전 값이 살아 있으면 보이는 것과 다른 값으로
 * 곡이 추가되므로, 값을 null로 바꿔 쓰는 쪽이 추가·제출을 막게 한다.
 */
export type TimeValue = number | null | undefined;

export interface TimeInputProps extends Omit<InputProps, 'value' | 'onChange' | 'type' | 'charLimit' | 'keyFilter'> {
  value: TimeValue;
  onChange: (seconds: TimeValue) => void;
}

/** 무엇이 틀렸는지만 짚는다. 입력한 값은 입력칸에 그대로 보인다 */
const ERROR_MESSAGE: Record<TimeParseError, string> = {
  chars: '숫자와 :만 쓸 수 있습니다.',
  noColon: '분과 초 사이에 :가 필요합니다.',
  empty: ': 앞뒤에 비어 있는 자리가 있습니다.',
  parts: '시:분:초보다 길게 쓸 수 없습니다.',
  secondsDigits: '초는 두 자리로 씁니다.',
  minutesDigits: '시:분:초에서 분은 두 자리로 씁니다.',
  seconds: '초는 59를 넘을 수 없습니다.',
  minutes: '분은 59를 넘을 수 없습니다. 1시간이 넘으면 시:분:초로 씁니다.',
  minutesInHour: '분은 59를 넘을 수 없습니다.',
};

/** 틀린 이유를 모를 때 — 입력칸이 새로 그려져 친 글자를 잃은 경우(표 정렬 등) */
const INVALID_FALLBACK = '시간 형식이 올바르지 않습니다.';

/** 친 글자가 지금 값을 뜻하는가. 값이 틀린 입력(null)이면 친 글자를 그대로 보여준다 */
function sameTime(text: string, value: TimeValue): boolean {
  if (value === null) return true;
  if (!text.trim()) return value === undefined;

  const result = parseTime(text);
  return result.ok && result.seconds === value;
}

/**
 * 시간 입력. 밖으로는 초를 주고받는다.
 * 화면에 보이는 표기 그대로(분:초, 시:분:초)만 받는다 — 규칙은 utils/time.ts의 parseTime.
 *
 * 친 글자는 고쳐 쓰지 않는다. "01:30"은 "01:30"으로, 틀린 "1:4:55"도 그대로 남기고
 * 무엇이 틀렸는지만 알려준다. 해석은 입력을 마칠 때(포커스를 잃거나 Enter)만 한다.
 *
 * 밖에서 값이 바뀌면("여기서 시작") 친 글자는 더 이상 그 값을 뜻하지 않으므로 값을 표기해 보여준다.
 * 이 판단을 렌더 중에 하므로, 값을 따라가려고 effect로 상태를 맞출 필요가 없다.
 */
const TimeInput = forwardRef<HTMLInputElement, TimeInputProps>(
  (
    { value, onChange, error, helperText, onFocus, onBlur, onKeyDown, ...rest }: TimeInputProps,
    ref: ForwardedRef<HTMLInputElement>
  ) => {
    /** 사용자가 친 글자. 포커스를 잃어도 남긴다 */
    const [draft, setDraft] = useState<string | null>(null);
    const [isFocus, setIsFocus] = useState(false);
    /** 마지막으로 거절한 이유 */
    const [rejected, setRejected] = useState<TimeParseError | null>(null);
    /** 포커스를 얻었을 때(또는 Enter로 확정했을 때)의 글자. 고치지 않고 나가면 부모에 알리지 않는다 */
    const [textAtFocus, setTextAtFocus] = useState('');

    const formatted = value === null || value === undefined ? '' : formatSeconds(value);
    const shown = draft !== null && (isFocus || sameTime(draft, value)) ? draft : formatted;

    const commit = (text: string) => {
      if (!text.trim()) {
        setRejected(null);
        onChange(undefined);
        return;
      }

      const result = parseTime(text);
      setRejected(result.ok ? null : result.error);
      onChange(result.ok ? result.seconds : null);
    };

    /** ↑/↓ 1초, Shift를 누르면 5초. 친 게 아니라 조정한 값이므로 표기해서 보여준다 */
    const nudge = (delta: number) => {
      const typed = parseTime(shown);
      const base = typed.ok ? typed.seconds : (value ?? 0);
      const next = Math.max(0, base + delta);

      setDraft(formatSeconds(next));
      setRejected(null);
      onChange(next);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      onKeyDown?.(e);
      if (e.defaultPrevented || e.nativeEvent.isComposing) return;

      if (e.key === 'Enter') {
        commit(shown);
        setTextAtFocus(shown);
        return;
      }

      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        nudge((e.key === 'ArrowUp' ? 1 : -1) * (e.shiftKey ? 5 : 1));
      }
    };

    // 값이 틀린(null) 동안만 안내한다. 밖에서 정상 값으로 바뀌면 거절도 끝난 것이다.
    // 고치려고 다시 치는 중에는 거둔다 — 확정하면 다시 판단한다
    const isFixing = isFocus && shown !== textAtFocus;
    const invalidMessage = value !== null || isFixing ? null : rejected ? ERROR_MESSAGE[rejected] : INVALID_FALLBACK;

    return (
      <InputField
        {...rest}
        ref={ref}
        type='text'
        value={shown}
        error={invalidMessage !== null || error}
        helperText={invalidMessage ?? helperText}
        onChange={(v) => setDraft(v)}
        onFocus={(e) => {
          setIsFocus(true);
          setDraft(shown);
          setTextAtFocus(shown);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocus(false);
          if (shown !== textAtFocus) commit(shown);
          onBlur?.(e);
        }}
        onKeyDown={handleKeyDown}
      />
    );
  }
);

TimeInput.displayName = 'TimeInput';

export default TimeInput;
