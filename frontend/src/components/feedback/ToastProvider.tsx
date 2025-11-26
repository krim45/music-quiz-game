'use client';

import { useToastStore } from '@/lib/store/useToastStore';
import Portal from '@/components/common/Portal';

export default function ToastProvider() {
  const toasts = useToastStore((s) => s.toasts);

  const variants: Record<string, string> = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    warning: 'bg-yellow-600 text-black',
    info: 'bg-gray-700',
  };

  return (
    <Portal container={document.body}>
      <div className='fixed top-4 right-4 z-[9999] flex flex-col gap-3'>
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`relative min-w-[220px] animate-[fadeInUp_0.25s_ease-out] rounded px-4 py-2 text-white ${variants[t.variant]} `}
          >
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </Portal>
  );
}
