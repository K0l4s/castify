import React, { useEffect, useState } from 'react';

interface ModalProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  isOpen: boolean;
  animation?: 'fade' | 'slide' | 'zoom' | 'none';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'none';
  className?: string;
  style?: React.CSSProperties;
  onOpen?: () => void;
}

const CustomModal: React.FC<ModalProps> = ({
  title,
  children,
  onClose,
  isOpen,
  animation = 'none',
  size = 'md',
  className = '',
  style,
  onOpen,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setTimeout(() => setIsAnimating(true), 50); // Delay to trigger animation
      if (onOpen) {
        onOpen();
      }
    } else {
      setIsAnimating(false); // Trigger closing animation
      setTimeout(() => setIsVisible(false), 300); // Wait for animation before unmounting
    }
  }, [isOpen, onOpen]);

  const sizeClasses = {
    sm: 'w-1/4',
    md: 'w-1/2',
    lg: 'w-3/4',
    xl: 'w-5/6',
    full: 'w-full min-h-screen',
    none: '',
  };

  const animationClasses = {
    fade: isAnimating ? 'opacity-100' : 'opacity-0',
    slide: isAnimating ? 'translate-y-0' : 'translate-y-full',
    zoom: isAnimating ? 'scale-100' : 'scale-0',
    none: '',
  };

  if (!isVisible) return null; // Don't render if not visible

  return (
    <div
      className={`z-100 fixed overflow-y-auto inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 duration-300 ease-in-out ${className}`}
      style={style}
    >
      <div
        id="custom-modal"
        className={` bg-gray-800 rounded-lg shadow-lg ${sizeClasses[size]} duration-300 ease-in-out p-6 relative
        ${animationClasses[animation]}`}
      >
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            onClick={onClose}
          >
            &times;
          </button>
        </div>
        <div className="py-4">{children}</div>
      </div>
    </div>
  );
};

export default CustomModal;
