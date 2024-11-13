import React, { createContext, useContext, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface Toast {
  id: string;
  message: string;
  duration?: number;
  type?: 'success' | 'error' | 'info' | 'warning' | 'loading';
}

interface ToastContextType {
  success: (message: string, duration?: number) => string;
  error: (message: string, duration?: number) => string;
  info: (message: string, duration?: number) => string;
  warning: (message: string, duration?: number) => string;
  loading: (message: string) => string;
  removeToast: (id: string) => void;
  closeLoadingToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, duration = 3000, type: 'success' | 'error' | 'info' | 'warning' | 'loading' = 'info') => {
    const id = uuidv4();
    setToasts((prevToasts) => [...prevToasts, { id, message, duration, type }]);

    // Don't auto-remove loading toasts
    if (type !== 'loading') {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    return id;
  }, []);

  const success = useCallback((message: string, duration = 3000) => {
    return addToast(message, duration, 'success');
  }, [addToast]);

  const error = useCallback((message: string, duration = 3000) => {
    return addToast(message, duration, 'error');
  }, [addToast]);

  const info = useCallback((message: string, duration = 3000) => {
    return addToast(message, duration, 'info');
  }, [addToast]);

  const warning = useCallback((message: string, duration = 3000) => {
    return addToast(message, duration, 'warning');
  }, [addToast]);

  const loading = useCallback((message: string) => {
    return addToast(message, undefined, 'loading');
  }, [addToast]);

  const removeToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  const closeLoadingToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  const getToastIcon = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'loading':
        return (
          <div className="animate-spin mr-2 h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
        );
      default:
        return null;
    }
  };

  return (
    <ToastContext.Provider value={{ success, error, info, warning, loading, removeToast, closeLoadingToast }}>
      {children}
      <div className="fixed bottom-4 right-4 flex flex-col space-y-2 z-[999999]">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-4 py-2 rounded shadow-lg animate-fade-in-out ${
              toast.type === 'success' ? 'bg-green-500' : 
              toast.type === 'error' ? 'bg-red-500' : 
              toast.type === 'warning' ? 'bg-yellow-500' :
              toast.type === 'loading' ? 'bg-gray-500' :
              'bg-blue-500'
            } text-white relative`}
          >
            <div className="flex items-center">
              {getToastIcon(toast.type)}
              <span>{toast.message}</span>
            </div>
            {toast.type !== 'loading' && (
              <button
                onClick={() => removeToast(toast.id)}
                className="absolute top-0 right-0 p-1 text-white hover:text-gray-300"
              >
                &times;
              </button>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;
