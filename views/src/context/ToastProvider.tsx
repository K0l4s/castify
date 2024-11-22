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
  clearAllToasts: () => void;
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

  const clearAllToasts = useCallback(() => {
    setToasts([]);
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
    <ToastContext.Provider value={{ success, error, info, warning, loading, removeToast, closeLoadingToast, clearAllToasts }}>
      {children}
      <div className="fixed bottom-4 right-4 flex flex-col space-y-2 z-[999999]">
       
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`min-w-[150px] px-4 py-2 rounded shadow-lg animate-line  ${
              toast.type === 'success' ? ' text-green-500 bg-green-200 dark:bg-green-900' :
              toast.type === 'error' ? ' text-red-500 bg-red-200 dark:bg-red-900' :
              toast.type === 'warning' ? ' text-yellow-500 bg-yellow-200 dark:bg-yellow-900' :
              toast.type === 'loading' ? ' text-yellow-500 bg-yellow-200 dark:bg-yellow-900' :
              ' text-blue-500 bg-blue-200 dark:bg-blue-900'
            } relative`}
          >
            <div className="flex items-center">
              {getToastIcon(toast.type)}
              <span>{toast.message}</span>
            </div>
            {toast.type !== 'loading' && (
              <button
                onClick={() => removeToast(toast.id)}
                className="absolute top-0 right-0 p-1 hover:text-gray-300"
              >
                &times;
              </button>
            )}
          </div>
        ))}
         {toasts.length > 1 && (
          <button
            onClick={clearAllToasts}
            className="self-end mb-2 px-3 py-1.5 bg-gray-500 hover:bg-gray-600 dark:bg-gray-700 dark:hover:bg-gray-800 text-white rounded-lg shadow-md transition-all duration-200 flex items-center gap-2 text-sm font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear All
          </button>
        )}
        <style>{`
          @keyframes line {
            0% { width: 100%; }
            100% { width: 0%; }
          }
          .animate-line::after {
            content: '';
            position: absolute;
            bottom: 0;
            right: 0;
            height: 2px;
            background-color: currentColor;
            animation: line 3s linear forwards;
          }
        `}</style>
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;
