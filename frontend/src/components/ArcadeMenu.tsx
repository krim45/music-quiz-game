'use client';

import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import ArcadeButton from '@/components/buttons/ArcadeButton';

type Item = {
  label: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
};

interface ArcadeMenuType {
  className?: string;
  initialIndex?: number;
  items: Item[];
}

export default function ArcadeMenu({ className, initialIndex = 0, items }: ArcadeMenuType) {
  const [index, setIndex] = useState(initialIndex);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const focusCurrent = () => {
    const el = refs.current[index];
    el?.focus();
  };

  useEffect(() => {
    focusCurrent();
  }, [index]);

  useEffect(() => {
    const findNextIndex = (currentIndex: number, delta: number, items: Item[]): number => {
      let nextIndex = currentIndex;

      do {
        nextIndex = (nextIndex + delta + items.length) % items.length;
      } while (items[nextIndex]?.disabled && nextIndex !== currentIndex);

      return nextIndex;
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        setIndex((i) => findNextIndex(i, -1, items));
      } else if (e.key === 'ArrowDown') {
        setIndex((i) => findNextIndex(i, 1, items));
      }
    };

    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
    };
  }, [items]);

  return (
    <div className={clsx('flex flex-col', className)}>
      {items.map((item, i) => (
        <ArcadeButton
          className='w-fit mx-auto my-3'
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          selected={i === index}
          disabled={item.disabled}
          onClick={item.onClick}
          onMouseEnter={() => setIndex(i)}
          onFocus={() => setIndex(i)}
        >
          {item.label}
        </ArcadeButton>
      ))}
    </div>
  );
}
