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
              src={podcast.user.avatarUrl || defaultAvatar}
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
            <li className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer" onClick={toggleReportModal}>
              <FaFlag className="inline-block mb-1 mr-2" />
              Report
            </li>
            <li className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer" onClick={handleSave}>
              <FaBookmark className="inline-block mb-1 mr-2" />
              Save
            </li>
            <li className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer" onClick={toggleShareModal}>
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
