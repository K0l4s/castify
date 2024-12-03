import React, { useState, useRef, useEffect } from 'react';
import { FaEllipsisV } from 'react-icons/fa';

interface CustomOptionMenuProps {
  buttonLabel?: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  buttonClassName?: string;
  contentClassName?: string;
  showArrow?: boolean;
  trigger?: 'hover' | 'click';
  offset?: number;
  buttonContent?: React.ReactNode;
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
}

const CustomOptionMenu: React.FC<CustomOptionMenuProps> = ({
  buttonLabel,
  children,
  position = 'bottom',
  className = '',
  buttonClassName = '',
  contentClassName = '',
  showArrow = true,
  trigger = 'click',
  offset = 8,
  buttonContent,
  variant = 'light',
  size = 'md',
  disabled = false,
  onOpen,
  onClose
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const positionClasses = {
    top: `bottom-full left-1/2 transform -translate-x-1/2 -translate-y-${offset}`,
    bottom: `top-full left-1/2 transform -translate-x-1/2 translate-y-${offset}`,
    left: `right-full top-1/2 transform -translate-y-1/2 -translate-x-${offset}`,
    right: `left-full top-1/2 transform -translate-y-1/2 translate-x-${offset}`,
  }[position];

  const variantClasses = {
    light: 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700',
    dark: 'bg-gray-800 text-white border-gray-700'
  }[variant];

  const sizeClasses = {
    sm: 'min-w-[8rem] p-2 text-sm',
    md: 'min-w-[12rem] p-3 text-base',
    lg: 'min-w-[16rem] p-4 text-lg'
  }[size];

  const arrowClasses = {
    top: `bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full border-t-${variant === 'light' ? 'white dark:gray-800' : 'gray-800'} border-l-transparent border-r-transparent border-b-transparent`,
    bottom: `top-0 left-1/2 transform -translate-x-1/2 -translate-y-full border-b-${variant === 'light' ? 'white dark:gray-800' : 'gray-800'} border-l-transparent border-r-transparent border-t-transparent`,
    left: `right-0 top-1/2 transform translate-x-full -translate-y-1/2 border-l-${variant === 'light' ? 'white dark:gray-800' : 'gray-800'} border-t-transparent border-b-transparent border-r-transparent`,
    right: `left-0 top-1/2 transform -translate-x-full -translate-y-1/2 border-r-${variant === 'light' ? 'white dark:gray-800' : 'gray-800'} border-t-transparent border-b-transparent border-l-transparent`
  }[position];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    if (isOpen && trigger === 'click') {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, trigger]);

  const handleOpen = () => {
    if (!disabled) {
      setIsOpen(true);
      onOpen?.();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  const handleMouseEvents = trigger === 'hover' ? {
    onMouseEnter: handleOpen,
    onMouseLeave: handleClose
  } : {};

  const handleClick = trigger === 'click' ? {
    onClick: () => isOpen ? handleClose() : handleOpen()
  } : {};

  return (
    <div className={`relative inline-block ${className}`} ref={menuRef}>
      <button
        ref={buttonRef}
        {...handleMouseEvents}
        {...handleClick}
        disabled={disabled}
        className={`inline-flex items-center justify-center p-2 rounded-full 
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'}
          transition-all duration-200 ${buttonClassName}`}
      >
        {buttonContent || buttonLabel || <FaEllipsisV className={variant === 'light' ? 'text-black' : 'text-white'} />}
      </button>

      {isOpen && (
        <div  
          {...(trigger === 'hover' ? handleMouseEvents : {})}
          className={`absolute rounded-md shadow-lg z-50 border ${positionClasses} ${variantClasses} ${sizeClasses} ${contentClassName}`}
          role="tooltip"
        >
          {showArrow && (
            <div className={`absolute w-0 h-0 border-solid border-8 ${arrowClasses}`} />
          )}
          <div className="relative">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomOptionMenu;