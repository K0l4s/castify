import React, { useState } from "react";
import { Podcast } from "../../../models/PodcastModel";
import { Link } from "react-router-dom";
import { FaBookmark, FaEye, FaFlag, FaShareAlt } from "react-icons/fa";
import { IoCloseOutline } from "react-icons/io5";
import { HiDotsVertical } from "react-icons/hi";
import CustomOptionMenu from "../custom/CustomOptionMenu";
import ShareModal from "../../modals/podcast/ShareModal";
import defaultAvatar from "../../../assets/images/default_avatar.jpg";
import ReportModal from "../../modals/report/ReportModal";
import { ReportType } from "../../../models/Report";
import { useToast } from "../../../context/ToastProvider";

interface PodcastHistoryProps {
  podcast: Podcast;
  onDelete: () => void;
}

const PodcastHistory: React.FC<PodcastHistoryProps> = ({
  podcast,
  onDelete,
}) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const toast = useToast();
  const podcastLink = `${window.location.origin}/watch?pid=${podcast.id}`;
  const author = podcast.user.fullname;

  const handleSave = () => {
    toast.info("Save feature is coming soon");
  };

  const toggleShareModal = () => {
    setIsShareModalOpen(!isShareModalOpen);
  };

  const toggleReportModal = () => {
    setIsReportModalOpen(!isReportModalOpen);
  }

  return (
    <div className="flex flex-col sm:flex-row rounded-lg dark:bg-gray-900 p-3 sm:p-4">
      <Link to={`/watch?pid=${podcast.id}`} className="block flex-shrink-0 w-full sm:w-48 md:w-56 lg:w-64 xl:w-72 mb-4 sm:mb-0">
        <img
          src={podcast.thumbnailUrl || "/TEST.png"}
          alt={podcast.title}
          className="w-full h-48 sm:h-32 md:h-36 lg:h-40 object-cover rounded-lg"
        />
      </Link>
      <div className="flex-grow sm:ml-4">
        <Link to={`/watch?pid=${podcast.id}`} className="block">
          <h3 className="text-lg sm:text-xl font-semibold line-clamp-2 text-black dark:text-white">
            {podcast.title}
          </h3>
        </Link>
        <div className="flex flex-wrap items-center mt-2 gap-2 sm:gap-4">
          <Link
            to={`/profile/${podcast.user.username}`}
            className="flex items-center"
          >
            <img
              src={podcast.user.avatarUrl || defaultAvatar}
              alt={author}
              className="w-6 sm:w-8 h-6 sm:h-8 object-cover rounded-full mr-2"
            />
            <p className="text-sm sm:text-base text-black dark:text-white font-medium">{author}</p>
          </Link>
          <p className="text-sm sm:text-base font-medium text-black dark:text-white flex items-center">
            {podcast.views}
            <FaEye className="ml-1 sm:ml-2 mb-0.5" />
          </p>
        </div>
        <p className="text-sm sm:text-base text-gray-800 dark:text-gray-300 mt-2 line-clamp-2">
          {podcast.content}
        </p>
      </div>
      <div className="flex sm:flex-col items-center sm:items-start mt-3 sm:mt-0 sm:ml-4 gap-2">
        <button
          onClick={onDelete}
          className="text-black dark:text-white hover:bg-gray-400 hover:dark:bg-gray-700 p-1 rounded-full transition duration-200"
          aria-label="Delete"
        >
          <IoCloseOutline className="w-6 h-6 sm:w-8 sm:h-8" />
        </button>

        <CustomOptionMenu
          buttonContent={<HiDotsVertical className="w-6 h-6 sm:w-7 sm:h-7" />}
          position="bottom"
          trigger="click"
          size="sm"
          className="transition-colors rounded-full text-black dark:text-white hover:bg-gray-400 hover:dark:bg-gray-700"
        >
          <ul className="py-1 text-sm sm:text-base">
            <li className="px-3 sm:px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer" onClick={toggleReportModal}>
              <FaFlag className="inline-block mb-1 mr-2" />
              Report
            </li>
            <li className="px-3 sm:px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer" onClick={handleSave}>
              <FaBookmark className="inline-block mb-1 mr-2" />
              Save
            </li>
            <li className="px-3 sm:px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer" onClick={toggleShareModal}>
              <FaShareAlt className="inline-block mb-1 mr-2" />
              Share
            </li>
          </ul>
        </CustomOptionMenu>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={toggleShareModal}
        podcastLink={podcastLink}
      />

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={toggleReportModal}
        targetId={podcast.id}
        reportType={ReportType.P}
      />
    </div>
  );
};

export default PodcastHistory;
