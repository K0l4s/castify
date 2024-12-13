import React, { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  backgroundColor?: string;
  textColor?: string;
  padding?: string;
  borderRadius?: string;
  fontSize?: string;
  maxWidth?: string;
  showArrow?: boolean;
}

const Tooltip: React.FC<TooltipProps> = ({
  text,
  children,
  position = 'bottom',
  delay = 500,
  backgroundColor = '#374151',
  textColor = 'white',
  padding = '0.5rem',
  borderRadius = '0.375rem',
  fontSize = '0.875rem',
  maxWidth = '200px',
  showArrow = true
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState(position);
  const timeoutRef = useRef<number>();
  const tooltipRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    timeoutRef.current = window.setTimeout(() => {
      setShowTooltip(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setShowTooltip(false);
  };

  useEffect(() => {
    if (showTooltip && tooltipRef.current && containerRef.current) {
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let newPosition = position;

      // Check if tooltip would overflow right
      if (containerRect.right + tooltipRect.width > viewportWidth) {
        newPosition = 'left';
      }
      // Check if tooltip would overflow left
      else if (containerRect.left - tooltipRect.width < 0) {
        newPosition = 'right';
      }
      // Check if tooltip would overflow top
      else if (containerRect.top - tooltipRect.height < 0) {
        newPosition = 'bottom';
      }
      // Check if tooltip would overflow bottom
      else if (containerRect.bottom + tooltipRect.height > viewportHeight) {
        newPosition = 'top';
      }

      setTooltipPosition(newPosition);
    }
  }, [showTooltip, position]);

  const getPositionStyles = () => {
    switch (tooltipPosition) {
      case 'top':
        return 'bottom-full left-1/2 -translate-x-1/2 mb-2';
      case 'bottom':
        return 'top-full left-1/2 -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 -translate-y-1/2 ml-2';
      default:
        return 'top-full left-1/2 -translate-x-1/2 mt-2';
    }
  };

  const getArrowStyles = () => {
    switch (tooltipPosition) {
      case 'top':
        return 'bottom-[-4px] left-1/2 -translate-x-1/2 border-t-current border-x-transparent border-b-0';
      case 'bottom':
        return 'top-[-4px] left-1/2 -translate-x-1/2 border-b-current border-x-transparent border-t-0';
      case 'left':
        return 'right-[-4px] top-1/2 -translate-y-1/2 border-l-current border-y-transparent border-r-0';
      case 'right':
        return 'left-[-4px] top-1/2 -translate-y-1/2 border-r-current border-y-transparent border-l-0';
      default:
        return 'top-[-4px] left-1/2 -translate-x-1/2 border-b-current border-x-transparent border-t-0';
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative inline-flex items-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      <div
        ref={tooltipRef}
        className={`absolute ${getPositionStyles()} z-50 transition-all duration-200 ${
          showTooltip ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        style={{
          backgroundColor,
          color: textColor,
          padding,
          borderRadius,
          fontSize,
          maxWidth,
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          overflow: 'hidden'
        }}
      >
        {text}
        {showArrow && (
          <div
            className={`absolute w-0 h-0 border-4 ${getArrowStyles()}`}
            style={{ borderTopColor: backgroundColor }}
          />
        )}
      </div>
    </div>
  );
};

export default Tooltip;