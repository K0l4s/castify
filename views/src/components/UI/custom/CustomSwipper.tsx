import React, { useRef } from 'react';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

export interface CustomSwiperProps {
  children: React.ReactNode;
  className?: string;
}

const CustomSwiper: React.FC<CustomSwiperProps> = ({ children, className }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollByAmount = (amount: number) => {
    if (containerRef.current) {
      containerRef.current.scrollBy({
        left: amount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className={`relative w-full ${className}`}>
      {/* Navigation buttons */}
      <button
        onClick={() => scrollByAmount(-300)}
        className="absolute left-2 z-20 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg hover:scale-110 transition"
      >
        <FaArrowLeft className="text-gray-600 dark:text-white" />
      </button>
      <button
        onClick={() => scrollByAmount(300)}
        className="absolute right-2 z-20 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg hover:scale-110 transition"
      >
        <FaArrowRight className="text-gray-600 dark:text-white" />
      </button>

      {/* Swiper content */}
      <div
        ref={containerRef}
        className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth py-8 px-8 snap-x snap-mandatory"
      >
        {React.Children.map(children, (child, index) => (
          <div
            key={index}
            className="shrink-0 snap-center transition-transform duration-300 hover:scale-105"
            style={{ width: '200px', flex: '0 0 auto' }}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomSwiper;
