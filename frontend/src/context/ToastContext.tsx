import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X, Copy } from 'lucide-react';

export interface ToastItem {
  id: string;
  message: string;
  subMessage?: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
}

interface ToastContextType {
  showToast: (toast: Omit<ToastItem, 'id'>) => void;
  copyAndNotify: (url: string, title?: string, subMessage?: string) => Promise<boolean>;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (toast: Omit<ToastItem, 'id'>) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const duration = toast.duration ?? 3500;
      const newToast: ToastItem = { ...toast, id };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const copyAndNotify = useCallback(
    async (url: string, title?: string, subMessage?: string) => {
      try {
        const fullUrl =
          url.startsWith('http://') || url.startsWith('https://')
            ? url
            : `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`;

        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(fullUrl);
        } else {
          const textArea = document.createElement('textarea');
          textArea.value = fullUrl;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
        }

        showToast({
          type: 'success',
          message: 'Đã sao chép liên kết chia sẻ vào bộ nhớ tạm!',
          subMessage: subMessage || (title ? `Nội dung: ${title}` : fullUrl),
          duration: 3500,
        });

        return true;
      } catch (err) {
        console.error('Lỗi khi sao chép liên kết:', err);
        showToast({
          type: 'error',
          message: 'Không thể tự động sao chép liên kết.',
          subMessage: 'Vui lòng sao chép thủ công từ ô hiển thị liên kết.',
          duration: 3500,
        });
        return false;
      }
    },
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, copyAndNotify }}>
      {children}

      {/* Floating Toasts Viewport Container */}
      <div className="fixed top-5 right-4 sm:right-6 z-[100] flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-xl border backdrop-blur-md transition-all duration-300 animate-in slide-in-from-top-3 fade-in ${
              toast.type === 'error'
                ? 'bg-rose-50/95 dark:bg-rose-950/90 border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-100'
                : toast.type === 'info'
                ? 'bg-blue-50/95 dark:bg-blue-950/90 border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-100'
                : 'bg-emerald-50/95 dark:bg-emerald-950/90 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {toast.type === 'error' ? (
                <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              ) : toast.type === 'info' ? (
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-bold leading-tight">{toast.message}</p>
              {toast.subMessage && (
                <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                  {toast.subMessage}
                </p>
              )}
              <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
                Nhấn Ctrl+V để dán và gửi ngay
              </span>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
