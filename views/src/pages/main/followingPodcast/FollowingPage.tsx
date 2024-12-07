import React from "react";
import FollowingPodcast from "../landingPage/FollowingPodcast";

const FollowingPage : React.FC = () => {
  return (
    <div className="px-8 py-4">
      {/* Content */}
      <h1 className="text-2xl font-medium text-black dark:text-white py-2">Latest</h1>
      <div className="m-auto">
        <FollowingPodcast />
      </div>
    </div>
  )
}

export default FollowingPage;