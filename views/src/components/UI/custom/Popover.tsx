import React, { useState, useRef, useEffect } from 'react';

interface PopoverProps {
  buttonLabel: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const Popover = (props:PopoverProps
    ={
    buttonLabel: 'Popover',
    children: 'Popover content',
    position: 'top',
    }
) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  //xác định vị trí của popover
  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2',
    left: 'right-full top-1/2 transform -translate-y-1/2',
    right: 'left-full top-1/2 transform -translate-y-1/2',
  }[props.position || 'bottom'];
  // Đóng popover khi nhấp ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="z-100 relative inline-block" ref={popoverRef}>
      <button
        onMouseEnter={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none"
      >
        {props.buttonLabel}
      </button>

      {isOpen && (
        <div  onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className={`absolute left-0 mt-2 w-48 bg-gray-500 
        border border-gray-300 rounded-md shadow-lg z-10
        ${positionClasses}
        ` }>
          <div className="p-4">
            {props.children}
          </div>
        </div>
      )}
    </div>
  );
};

export default Popover;
