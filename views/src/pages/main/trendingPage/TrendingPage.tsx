// src/pages/main/trendingPage/TrendingPage.tsx
import React from "react";
import { BsFire } from "react-icons/bs";
import TrendingList from "./TrendingList";
import { useLanguage } from "../../../context/LanguageContext";

const TrendingPage: React.FC = () => {
  const { language } = useLanguage();
  return (
    <div className="py-4 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-black dark:text-white flex items-center gap-2">
          <BsFire className="text-red-500" /> {language.trending.title}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {language.trending.description}
        </p>
      </div>

      {/* Trending List */}
      <TrendingList />
    </div>
  );
};

export default TrendingPage;