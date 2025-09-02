import { useCallback } from 'react';
import { toast as sonnerToast } from 'sonner';

interface ToastOptions {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const useToast = () => {
  const toast = useCallback((options: ToastOptions) => {
    const { title, description, variant = 'default', duration, action } = options;
    
    const toastOptions = {
      duration: duration || 4000,
      action: action ? {
        label: action.label,
        onClick: action.onClick,
      } : undefined,
    };
    
    switch (variant) {
      case 'destructive':
        sonnerToast.error(title, {
          description,
          ...toastOptions,
        });
        break;
      case 'success':
        sonnerToast.success(title, {
          description,
          ...toastOptions,
        });
        break;
      default:
        sonnerToast(title, {
          description,
          ...toastOptions,
        });
        break;
    }
  }, []);

  return { toast };
};
