import React from "react";
import TrendingPodcast from "./TrendingPodcast";

const TrendingPage : React.FC = () => {
  return (
    <div className="px-8 py-4">
      {/* Content */}
      <h1 className="text-2xl font-medium text-black dark:text-white py-2">Trending Podcasts</h1>
      <div className="m-auto">
        <TrendingPodcast />
      </div>
    </div>
  )
}

export default TrendingPage;