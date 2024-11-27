import React, { useState } from 'react';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  let timeout = 0;

  const handleMouseEnter = () => {
    timeout = setTimeout(() => {
      setShowTooltip(true);
    }, 500); // 1 second delay
  };

  const handleMouseLeave = () => {
    clearTimeout(timeout);
    setShowTooltip(false);
  };

  return (
    <div
      className="relative flex items-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      <div
        className={`absolute -bottom-10 left-1/2 -translate-x-1/2 bg-gray-700 text-white text-sm rounded py-2 px-2 transition-opacity duration-200 z-50 ${
          showTooltip ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        {text}
      </div>
    </div>
  );
};

export default Tooltip;