'use client';

import { useRef } from 'react';
import clsx from 'clsx';

import type { KeyboardEvent, ReactNode } from 'react';

export interface SegmentOption<T extends string> {
  value: T;
  label: ReactNode;
  /** 이 항목이 보여주는 영역의 id. 스크린리더가 둘을 이어서 읽는다 */
  panelId?: string;
}

export interface SegmentedControlProps<T extends string> {
  className?: string;
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** 스크린리더가 읽을 묶음 이름 */
  ariaLabel?: string;
}

/**
 * 같은 자리의 내용을 몇 가지 방식 중 하나로 바꿔 보여주는 선택기.
 *
 * 페이지를 오가는 탭과 달리 선택지가 적고 전환이 가볍다.
 * 하는 일은 탭과 같으므로 tablist/tab으로 표시하고, 좌우 화살표로 옮길 수 있게 한다.
 */
export default function SegmentedControl<T extends string>({
  className,
  options,
  value,
  onChange,
  ariaLabel,
}: SegmentedControlProps<T>) {
  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const move = (from: number, delta: number) => {
    const next = (from + delta + options.length) % options.length;
    onChange(options[next].value);
    buttonsRef.current[next]?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      move(index, 1);
    }

    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      move(index, -1);
    }
  };

  return (
    <div
      role='tablist'
      aria-label={ariaLabel}
      // 입력칸·버튼 기본 높이(40px)와 맞춘다
      className={clsx('flex h-10 rounded-lg border border-gray-700 bg-gray-900/40 p-1', className)}
    >
      {options.map((option, i) => {
        const selected = option.value === value;

        return (
          <button
            key={option.value}
            ref={(el) => {
              buttonsRef.current[i] = el;
            }}
            type='button'
            role='tab'
            aria-selected={selected}
            aria-controls={option.panelId}
            // 묶음 안에서는 화살표로 옮기므로, Tab 키로는 선택된 항목에만 들어온다
            tabIndex={selected ? 0 : -1}
            className={clsx(
              // 남는 폭은 똑같이 나눠 갖되, 글자보다 좁아지지는 않는다.
              // 폭을 내용에 맞춘 묶음(w-fit)에서 flex-1만 두면 글자가 말줄임으로 잘린다
              'min-w-fit flex-1 cursor-pointer rounded-md px-3 whitespace-nowrap transition-colors outline-none select-none',
              'focus-visible:ring-green focus-visible:ring-1',
              selected ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-white'
            )}
            onClick={() => onChange(option.value)}
            onKeyDown={(e) => handleKeyDown(e, i)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
