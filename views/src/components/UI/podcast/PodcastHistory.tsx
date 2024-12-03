import React from "react";
import { Podcast } from "../../../models/PodcastModel";
import { Link } from "react-router-dom";
import { FaEye } from "react-icons/fa";
import { IoCloseOutline } from "react-icons/io5";
import { HiDotsVertical } from "react-icons/hi";

interface PodcastHistoryProps {
  podcast: Podcast;
  onDelete: () => void;
  onMenuClick: () => void;
}

const PodcastHistory: React.FC<PodcastHistoryProps> = ({ podcast, onDelete, onMenuClick }) => {
  const author = podcast.user.fullname;

  return (
    <div className="flex rounded-lg dark:bg-gray-900">
      <Link to={`/watch?pid=${podcast.id}`} className="block flex-shrink-0">
        <img src={podcast.thumbnailUrl || "/TEST.png"} alt={podcast.title} className="w-62 h-44 object-fit rounded-lg" />
      </Link>
      <div className="flex-grow ml-4">
        <Link to={`/watch?pid=${podcast.id}`} className="block">
          <h3 className="text-xl font-semibold line-clamp-2 text-black dark:text-white">{podcast.title}</h3>
        </Link>
        <div className="flex items-center mt-2">
          <Link to={`/profile/${podcast.user.username}`} className="flex-shrink-0">
            <img src={podcast.user.avatarUrl || "/default_avatar.jpg"} alt={author} className="w-8 h-8 object-cover rounded-full mr-2" />
          </Link>
          <p className="text-black dark:text-white font-medium">{author}</p>
          <p className="ml-8 font-medium text-black dark:text-white">
            {podcast.views}
            <FaEye className="inline-block mb-1 ml-2" />
          </p>
        </div>
        <p className="text-gray-800 dark:text-gray-300 mt-1 line-clamp-2">{podcast.content}</p>
      </div>
      <div className="flex items-start ml-4">
        <button onClick={onDelete} className="text-black dark:text-white hover:bg-gray-400 hover:dark:bg-gray-700 mr-2 p-1 rounded-full transition duration-200">
          <IoCloseOutline size={32}/>
        </button>
        <button onClick={onMenuClick} className="text-black dark:text-white hover:bg-gray-400 hover:dark:bg-gray-700 mr-2 p-2 rounded-full transition duration-200">
          <HiDotsVertical size={24}/>
        </button>
      </div>
    </div>
  );
};

export default PodcastHistory;