'use client';

import { useRef } from 'react';
import clsx from 'clsx';

import { toast } from '@/lib/store/useToastStore';
import { buttonSizes } from '@/constants/sizeToken';

import type { ButtonHTMLAttributes, ReactNode, MouseEvent } from 'react';

type ButtonColor = 'blue' | 'red' | 'gray' | 'green' | 'orange';

type ButtonSize = keyof typeof buttonSizes;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  children?: ReactNode;
  color?: ButtonColor;
  size?: ButtonSize;
  onClick?: (e?: MouseEvent<HTMLButtonElement>) => Promise<void> | void;
}

// TODO 나중에
// 1. 디자인 개선 fill or outline, focus outline

const Button = ({ className, color = 'blue', size = 'md', disabled, onClick, children, ...rest }: ButtonProps) => {
  const lockRef = useRef<boolean>(false);

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || !onClick || lockRef.current) return;

    lockRef.current = true;

    try {
      await onClick?.(e);
    } catch (err) {
      toast.error(JSON.stringify(err));
    } finally {
      lockRef.current = false;
    }
  };

  const colorClass: Record<ButtonColor, string> = {
    blue: 'bg-blue-600 text-white hover:not-disabled:bg-blue-700',
    red: 'bg-red-600 text-white hover:not-disabled:bg-red-700',
    gray: 'bg-gray-600 text-white hover:not-disabled:bg-gray-700',
    orange: 'bg-orange-600 text-white hover:not-disabled:bg-orange-700',
    green: 'bg-green-900 text-white hover:not-disabled:bg-green-800',
  };

  return (
    <button
      className={clsx(
        'rounded transition outline-none select-none',
        buttonSizes[size].wrapper,
        colorClass[color],
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer active:scale-95',
        className
      )}
      disabled={disabled}
      data-disabled={disabled}
      onClick={handleClick}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
