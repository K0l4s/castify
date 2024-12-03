import React from "react";
import { Podcast } from "../../../models/PodcastModel";
import { Link } from "react-router-dom";
import { FaBookmark, FaEye, FaFlag, FaShareAlt } from "react-icons/fa";
import { IoCloseOutline } from "react-icons/io5";
import { HiDotsVertical } from "react-icons/hi";
import CustomOptionMenu from "../custom/CustomOptionMenu";

interface PodcastHistoryProps {
  podcast: Podcast;
  onDelete: () => void;
}

const PodcastHistory: React.FC<PodcastHistoryProps> = ({
  podcast,
  onDelete,
}) => {
  const author = podcast.user.fullname;

  const handleReport = () => {
    console.log("Report podcast");
    // Add report logic here
  };

  const handleSave = () => {
    console.log("Save podcast");
    // Add save logic here
  };

  const handleShare = () => {
    console.log("Shared");
  }

  return (
    <div className="flex rounded-lg dark:bg-gray-900">
      <Link to={`/watch?pid=${podcast.id}`} className="block flex-shrink-0 w-3/4 md:w-2/4 lg:w-1/4">
        <img
          src={podcast.thumbnailUrl || "/TEST.png"}
          alt={podcast.title}
          className="w-full h-44 object-fit rounded-lg"
        />
      </Link>
      <div className="flex-grow ml-4">
        <Link to={`/watch?pid=${podcast.id}`} className="block">
          <h3 className="text-xl font-semibold line-clamp-2 text-black dark:text-white">
            {podcast.title}
          </h3>
        </Link>
        <div className="flex items-center mt-2">
          <Link
            to={`/profile/${podcast.user.username}`}
            className="flex-shrink-0"
          >
            <img
              src={podcast.user.avatarUrl || "/default_avatar.jpg"}
              alt={author}
              className="w-8 h-8 object-cover rounded-full mr-2"
            />
          </Link>
          <Link to={`/profile/${podcast.user.username}`}>
            <p className="text-black dark:text-white font-medium">{author}</p>
          </Link>
          <p className="ml-8 font-medium text-black dark:text-white">
            {podcast.views}
            <FaEye className="inline-block mb-1 ml-2" />
          </p>
        </div>
        <p className="text-gray-800 dark:text-gray-300 mt-1 line-clamp-2">
          {podcast.content}
        </p>
      </div>
      <div className="flex items-start ml-4">
        <button
          onClick={onDelete}
          className="text-black dark:text-white hover:bg-gray-400 hover:dark:bg-gray-700 mr-2 p-1 rounded-full transition duration-200"
        >
          <IoCloseOutline size={32} />
        </button>

        <CustomOptionMenu
          buttonContent={<HiDotsVertical size={24} />}
          position="bottom"
          trigger="click"
          variant="light"
          size="sm"
        >
          <ul className="py-1">
            <li className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer" onClick={handleReport}>
              <FaFlag className="inline-block mb-1 mr-2" />
              Report
            </li>
            <li className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer" onClick={handleSave}>
              <FaBookmark className="inline-block mb-1 mr-2" />
              Save
            </li>
            <li className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer" onClick={handleShare}>
              <FaShareAlt className="inline-block mb-1 mr-2" />
              Share
            </li>
          </ul>
        </CustomOptionMenu>
      </div>
    </div>
  );
};

export default PodcastHistory;
