import React, { useState } from 'react';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

// Define the type for children and itemsPerPage prop
export interface CustomSwiperProps {
  children: React.ReactNode;
  itemsPerPage?: number; // Optional prop to specify how many items per slide
  className?: string
}

const CustomSwiper: React.FC<CustomSwiperProps> = ({ children, itemsPerPage = 4, className }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const totalItems = React.Children.count(children); // Get the total number of children

  const goToNext = () => {
    setCurrentIndex((prevIndex) => Math.min(prevIndex + 1, totalItems - itemsPerPage));
  };

  const goToPrev = () => {
    setCurrentIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  };

  // Render visible items for the current slide
  const renderItems = () => {
    const visibleItems = React.Children.toArray(children).slice(currentIndex, currentIndex + itemsPerPage);
    return visibleItems.map((child, index) => (
      <div key={index} className="swiper-slide">
        {child}
      </div>
    ));
  };

  return (
    <div className={`max-w-6xl m-auto ${className}`}>
      <div className="relative">
        <div className="flex gap-4 overflow-hidden">
          {renderItems()}
        </div>

        {/* Navigation buttons */}
        <button onClick={goToPrev} className="absolute left-0 top-1/2 transform -translate-y-1/2">
          <FaArrowLeft className="text-xl text-gray-600" />
        </button>
        <button onClick={goToNext} className="absolute right-0 top-1/2 transform -translate-y-1/2">
          <FaArrowRight className="text-xl text-gray-600" />
        </button>
      </div>
    </div>
  );
};

export default CustomSwiper;
