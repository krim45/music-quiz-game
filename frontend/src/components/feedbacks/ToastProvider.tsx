'use client';

import { useToastStore } from '@/lib/store/useToastStore';
import { createPortal } from 'react-dom';

export default function ToastProvider() {
  if (typeof window === 'undefined') return null;

  const toasts = useToastStore((s) => s.toasts);

  const variants: Record<string, string> = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    warning: 'bg-yellow-600 text-black',
    info: 'bg-gray-700',
  };

  return createPortal(
    <div className='fixed top-4 right-4 z-[9999] flex flex-col gap-3'>
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`relative min-w-[220px] animate-[fadeInUp_0.25s_ease-out] rounded px-4 py-2 text-white ${variants[t.variant]} `}
        >
          <span>{t.message}</span>
        </div>
      ))}
    </div>,
    document.body
  );
}
