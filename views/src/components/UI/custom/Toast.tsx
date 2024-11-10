import React, { useEffect } from 'react';

interface ToastProps {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning' | 'loading';
  duration?: number;
  onClose: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

const Toast: React.FC<ToastProps> = ({
  id,
  message,
  type = 'info',
  duration = 3000,
  onClose,
  position = 'top-right'
}) => {
  useEffect(() => {
    if (type !== 'loading') {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose, type]);

  const getToastIcon = () => {
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
      case 'loading':
        return (
          <div className="animate-spin mr-2 h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
        );
      default:
        return (
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  }[position];

  const bgColorClasses = {
    'success': 'bg-green-500',
    'error': 'bg-red-500',
    'warning': 'bg-yellow-500',
    'loading': 'bg-gray-500',
    'info': 'bg-blue-500'
  }[type];

  return (
    <div
      className={`fixed ${positionClasses} flex items-center min-w-[300px] px-4 py-3 rounded-lg shadow-lg z-100
        ${bgColorClasses} text-white backdrop-blur-sm bg-opacity-95
        animate-fade-in-out transition-all duration-300 ease-in-out transform hover:scale-105
        shadow-xl ring-1 ring-black/5`}
      role="alert"
      style={{ zIndex: 999999 }}
    >
      {getToastIcon()}
      <div className="flex-grow">
        <p className="font-medium tracking-wide">{message}</p>
      </div>
      {type !== 'loading' && (
        <button
          onClick={() => onClose(id)}
          className="ml-4 p-1.5 hover:bg-white/20 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label="Close notification"
        >
          <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      )}
    </div>
  );
};

export default Toast;
