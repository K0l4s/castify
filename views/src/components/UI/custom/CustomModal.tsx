import React, { useEffect, useState } from 'react';

interface ModalProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  isOpen: boolean;
  animation?: 'fade' | 'slide' | 'zoom' | 'none';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'auto';
  className?: string;
  style?: React.CSSProperties;
  onOpen?: () => void;
  closeOnOutsideClick?: boolean;
  closeOnEsc?: boolean;
}

const CustomModal: React.FC<ModalProps> = ({
  title,
  children,
  onClose,
  isOpen,
  animation = 'fade',
  size = 'md',
  className = '',
  style,
  onOpen,
  closeOnOutsideClick = true,
  closeOnEsc = true,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
      setTimeout(() => setIsAnimating(true), 10);
      onOpen?.();
    } else {
      setIsAnimating(false);
      setTimeout(() => {
        setIsVisible(false);
        document.body.style.overflow = 'unset';
      }, 300);
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (closeOnEsc && e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [closeOnEsc, isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnOutsideClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  const sizeClasses = {
    sm: 'max-w-md w-11/12',
    md: 'max-w-lg w-11/12',
    lg: 'max-w-2xl w-11/12',
    xl: 'max-w-4xl w-11/12',
    full: 'w-full min-h-screen',
    auto: 'w-auto',
  };

  const animationClasses = {
    fade: `transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'}`,
    slide: `transform transition-transform duration-300 ${isAnimating ? 'translate-y-0' : 'translate-y-full'}`,
    zoom: `transform transition-transform duration-300 ${isAnimating ? 'scale-100' : 'scale-95'}`,
    none: '',
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm
        ${animationClasses.fade} ${className}`}
      onClick={handleBackdropClick}
      style={style}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className={`bg-white dark:bg-gray-800 rounded-xl shadow-xl ${sizeClasses[size]} 
          ${animationClasses[animation]} overflow-hidden`}
        role="document"
      >
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 id="modal-title" className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h3>
          <button
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
            onClick={onClose}
            aria-label="Close modal"
          >
            <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-4 overflow-y-auto max-h-[calc(100vh-10rem)] text-gray-700 dark:text-gray-300">
          {children}
        </div>
      </div>
    </div>
  );
};

export default CustomModal;
