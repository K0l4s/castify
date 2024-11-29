import React, { useRef } from 'react';

interface TabNavigationProps {
  selectedTab: string;
  onSelectTab: (tab: string) => void;
  genres: { id: string; name: string }[];
}

const TabNavigation: React.FC<TabNavigationProps> = ({ selectedTab, onSelectTab, genres }) => {
  const tabs = ['Popular', 'Recent', ...genres.map((genre) => genre.name)];
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePrevClick = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const handleNextClick = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex items-center mb-4 w-full">
      <button onClick={handlePrevClick} className="px-2 py-1 bg-gray-600 hover:bg-gray-700 dark:bg-gray-600 dark:hover:bg-gray-700 transition-colors h-10 rounded-l">
        &lt;
      </button>
      <div ref={containerRef} className="flex overflow-x-auto w-full scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 mx-1 h-10 text-sm rounded-full whitespace-nowrap ${
              selectedTab === tab ? 'bg-blue-600 text-white' : 'bg-gray-500 hover:bg-gray-600 transition-colors text-white'
            }`}
            onClick={() => onSelectTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      <button onClick={handleNextClick} className="px-2 py-1 bg-gray-600 hover:bg-gray-700 dark:bg-gray-600 dark:hover:bg-gray-700 transition-colors h-10 rounded-r">
        &gt;
      </button>
    </div>
  );
};

export default TabNavigation;