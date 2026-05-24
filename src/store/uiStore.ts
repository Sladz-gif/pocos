import { create } from 'zustand';

interface UIStore {
  isBuyerPreview: boolean;
  setBuyerPreview: (value: boolean) => void;
  
  // Toast state
  toast: {
    message: string;
    type: 'success' | 'error' | 'info';
    visible: boolean;
  } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  hideToast: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isBuyerPreview: false,
  setBuyerPreview: (isBuyerPreview) => set({ isBuyerPreview }),
  
  toast: null,
  showToast: (message, type = 'info') => {
    set({ toast: { message, type, visible: true } });
    setTimeout(() => {
      set({ toast: null });
    }, 3000);
  },
  hideToast: () => set({ toast: null }),
}));
