import React, { useState, useRef, useEffect } from 'react';

interface PopoverProps {
  buttonLabel: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  buttonClassName?: string;
  contentClassName?: string;
  showArrow?: boolean;
  trigger?: 'hover' | 'click';
  offset?: number;
}

const Popover: React.FC<PopoverProps> = ({
  buttonLabel,
  children,
  position = 'bottom',
  className = '',
  buttonClassName = '',
  contentClassName = '',
  showArrow = true,
  trigger = 'hover',
  offset = 8
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const positionClasses = {
    top: `bottom-full left-1/2 transform -translate-x-1/2 -translate-y-${offset}`,
    bottom: `top-full left-1/2 transform -translate-x-1/2 translate-y-${offset}`,
    left: `right-full top-1/2 transform -translate-y-1/2 -translate-x-${offset}`,
    right: `left-full top-1/2 transform -translate-y-1/2 translate-x-${offset}`,
  }[position];

  const arrowClasses = {
    top: 'bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full border-t-gray-500 border-l-transparent border-r-transparent border-b-transparent',
    bottom: 'top-0 left-1/2 transform -translate-x-1/2 -translate-y-full border-b-gray-500 border-l-transparent border-r-transparent border-t-transparent',
    left: 'right-0 top-1/2 transform translate-x-full -translate-y-1/2 border-l-gray-500 border-t-transparent border-b-transparent border-r-transparent',
    right: 'left-0 top-1/2 transform -translate-x-full -translate-y-1/2 border-r-gray-500 border-t-transparent border-b-transparent border-l-transparent'
  }[position];

  useEffect(() => {
    if (trigger === 'click') {
      const handleClickOutside = (event: MouseEvent) => {
        if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [trigger]);

  const handleMouseEvents = trigger === 'hover' ? {
    onMouseEnter: () => setIsOpen(true),
    onMouseLeave: () => setIsOpen(false)
  } : {};

  const handleClick = trigger === 'click' ? {
    onClick: () => setIsOpen(!isOpen)
  } : {};

  return (
    <div className={`relative inline-block ${className}`} ref={popoverRef}>
      <button
        ref={buttonRef}
        {...handleMouseEvents}
        {...handleClick}
        className={`px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors duration-200 ${buttonClassName}`}
      >
        {buttonLabel}
      </button>

      {isOpen && (
        <div
          {...handleMouseEvents}
          className={`absolute min-w-[12rem] bg-gray-500 text-white border border-gray-600 rounded-md shadow-lg z-50 ${positionClasses} ${contentClassName}`}
        >
          {showArrow && (
            <div className={`absolute w-0 h-0 border-solid border-8 ${arrowClasses}`} />
          )}
          <div className="p-4">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

export default Popover;
