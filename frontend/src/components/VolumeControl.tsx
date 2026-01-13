'use client';

import clsx from 'clsx';
import VolumeLow from '@/components/icon/VolumeLow';
import VolumeHigh from '@/components/icon/VolumeHigh';
import Mute from '@/components/icon/Mute';

type Props = {
  value: number;
  onChange: (next: number) => void;

  mute?: boolean;
  onToggleMute: () => void;

  step?: number; // default 0.01
  className?: string;
  disabled?: boolean;
};

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

export default function VolumeControl({
  value,
  onChange,
  mute,
  onToggleMute,
  step = 0.01,
  className,
  disabled = false,
}: Props) {
  const volume = mute ? 0 : clamp01(value);

  const Icon = mute || volume <= 0.0001 ? Mute : volume < 0.5 ? VolumeLow : VolumeHigh;

  return (
    <div className={clsx('items-center, inline-flex rounded-3xl hover:bg-gray-800', className)}>
      <div className='md:group relative inline-flex items-center'>
        <button
          type='button'
          disabled={disabled}
          onClick={onToggleMute}
          className={clsx(
            'relative inline-flex h-9 w-9 items-center justify-center rounded-md',
            'text-white/90 hover:text-white focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:outline-none',
            disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
          )}
        >
          <Icon className='h-5 w-5' />
        </button>

        <div
          className={clsx(
            'overflow-hidden',
            'hidden [@media(hover:hover)_and_(pointer:fine)]:block',
            '[@media(hover:hover)_and_(pointer:fine)]:transition-[width,opacity] [@media(hover:hover)_and_(pointer:fine)]:duration-150',
            '[@media(hover:hover)_and_(pointer:fine)]:w-0 [@media(hover:hover)_and_(pointer:fine)]:opacity-0',
            '[@media(hover:hover)_and_(pointer:fine)]:group-hover:w-22 [@media(hover:hover)_and_(pointer:fine)]:group-hover:opacity-100'
          )}
        >
          <div className='flex h-9 items-center'>
            <input
              type='range'
              min={0}
              max={1}
              step={step}
              value={volume}
              disabled={disabled}
              onChange={(e) => onChange(clamp01(Number(e.target.value)))}
              className={clsx(
                'h-0.5 w-20 cursor-pointer appearance-none rounded-full',
                'bg-white/80 outline-none',
                '[&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white',
                '[&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white',
                disabled && 'cursor-not-allowed'
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
