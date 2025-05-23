import React, { useRef } from 'react';
import { IoChevronBackOutline, IoChevronForwardOutline } from 'react-icons/io5';
import Tooltip from '../../../components/UI/custom/Tooltip';
import { useLanguage } from '../../../context/LanguageContext';
import en from '../../../locales/en.json';
interface TabNavigationProps {
  selectedTab: string;
  onSelectTab: (tab: string) => void;
  genres: { id: string; name: string }[];
}

const TabNavigation: React.FC<TabNavigationProps> = ({ selectedTab, onSelectTab, genres }) => {
  // const tabs = ['Popular', 'Recent', ...genres.map((genre) => genre.name)];
  const {language} = useLanguage();
  const tabs = [language.tabNav.popular, language.tabNav.recent, ...(Array.isArray(genres) ? genres.map((genre) => genre.name) : [])];

  console.log('Genres:', genres);

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
    <div className="flex items-center mb-6 w-full bg-white/40 dark:bg-gray-800/40 backdrop-blur-md p-4 rounded-3xl  border border-gray-200/30 dark:border-gray-700/30">
      <Tooltip text="Scroll left" position="left">
        <button
          onClick={handlePrevClick}
          className="p-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-white rounded-2xl shadow-lg hover:shadow-xl transform transition-all duration-300 mr-4 group"
        >
          <IoChevronBackOutline className="w-5 h-5 group-hover:animate-pulse" />
        </button>
      </Tooltip>

      <div
        ref={containerRef}
        className="flex overflow-x-auto w-full scrollbar-hide space-x-3 px-3"
      >
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`px-5 py-3 text-sm font-medium rounded-2xl whitespace-nowrap transform transition-all duration-300 ${selectedTab === tab || (selectedTab === en.tabNav.popular && tab === language.tabNav.popular ) || (selectedTab === en.tabNav.recent && tab === language.tabNav.recent )
                ? 'bg-blue-600 text-white shadow-xl hover:bg-blue-700 border border-white/10'
                : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white shadow-lg border border-gray-200/30 dark:border-gray-700/30'
              }`}
            onClick={() => onSelectTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <Tooltip text="Scroll right" position="right">
        <button
          onClick={handleNextClick}
          className="p-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-white rounded-2xl shadow-lg hover:shadow-xl transform transition-all duration-300 ml-4 group"
        >
          <IoChevronForwardOutline className="w-5 h-5 group-hover:animate-pulse" />
        </button>
      </Tooltip>
    </div>
  );
};

export default TabNavigation;