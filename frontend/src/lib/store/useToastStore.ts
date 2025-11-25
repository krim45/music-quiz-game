import { create } from 'zustand';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export type Toast = {
  id: number;
  message: string;
  variant: ToastVariant;
};

type ToastState = {
  toasts: Toast[];
  toast: (message: string, variant?: ToastVariant) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  remove: (id: number) => void;
};

let _id = 1;

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],

  toast: (message, variant = 'info') => {
    const id = _id++;
    const newToast = { id, message, variant };

    const current = get().toasts;
    const limited = [...current.slice(-4), newToast]; // 최대 5개 유지

    set({ toasts: limited });

    setTimeout(() => get().remove(id), 3000);
  },

  success: (msg) => get().toast(msg, 'success'),
  error: (msg) => get().toast(msg, 'error'),
  warning: (msg) => get().toast(msg, 'warning'),

  remove: (id) =>
    set({
      toasts: get().toasts.filter((t) => t.id !== id),
    }),
}));

export const toast = {
  success: (msg: string) => useToastStore.getState().success(msg),
  error: (msg: string) => useToastStore.getState().error(msg),
  warning: (msg: string) => useToastStore.getState().warning(msg),
  info: (msg: string) => useToastStore.getState().toast(msg),
};
