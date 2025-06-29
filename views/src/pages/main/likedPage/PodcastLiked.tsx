import React, { useState } from "react";
import { Podcast } from "../../../models/PodcastModel";
import { Link } from "react-router-dom";
import { FaBookmark, FaEye, FaFlag, FaShareAlt, FaHeart, FaRegHeart, FaPlay, FaClock } from "react-icons/fa";
import { HiDotsVertical } from "react-icons/hi";
import defaultAvatar from "../../../assets/images/default_avatar.jpg";
import { ReportType } from "../../../models/Report";
// import { useToast } from "../../../context/ToastProvider";
import CustomOptionMenu from "../../../components/UI/custom/CustomOptionMenu";
import Avatar from "../../../components/UI/user/Avatar";
import ShareModal from "../../../components/modals/podcast/ShareModal";
import ReportModal from "../../../components/modals/report/ReportModal";
import { formatTimeDuration } from "../../../components/UI/podcast/video";
import AddToPlaylistModal from "../playlistPage/AddToPlaylistModal";
import { useLanguage } from "../../../context/LanguageContext";
// import { MdOutlineWatchLater } from "react-icons/md";

interface PodcastLikedProps {
  podcast: Podcast;
  onUnlike: () => void;
}

const PodcastLiked: React.FC<PodcastLikedProps> = ({
  podcast,
  onUnlike,
}) => {
  const {language} = useLanguage();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);

  const [isLiked, setIsLiked] = useState(true);

  // const toast = useToast();
  const podcastLink = `${window.location.origin}/watch?pid=${podcast.id}`;
  const author = podcast.user.fullname;
  
  // const handleSave = () => {
  //   toast.info("Save feature is coming soon");
  // };

  const toggleShareModal = () => {
    setIsShareModalOpen(!isShareModalOpen);
  };

  const toggleReportModal = () => {
    setIsReportModalOpen(!isReportModalOpen);
  }
  
  const toggleAddToPlaylistModal = () => {
    setIsPlaylistModalOpen(!isPlaylistModalOpen);
  };

  const handleLikeToggle = () => {
    setIsLiked(!isLiked);
    onUnlike();
  };

  return (
    <div className="flex flex-col sm:flex-row rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all p-3 sm:p-4">
      <Link to={`/watch?pid=${podcast.id}`} className="block flex-shrink-0 w-full sm:w-48 md:w-56 lg:w-64 xl:w-72 mb-4 sm:mb-0 relative">
        <img
          src={podcast.thumbnailUrl || "/TEST.png"}
          alt={podcast.title}
          className="w-full h-48 sm:h-32 md:h-36 lg:h-40 object-cover rounded-lg"
        />
        {/* Play button overlay */}
        <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
          <div className="bg-white/90 p-3 rounded-full shadow-md">
            <FaPlay className="text-blue-600 w-6 h-6" />
          </div>
        </div>
        {/* Duration indicator */}
        <div className="flex absolute bottom-2 right-2 bg-black/70 text-white text-sm px-2 py-1 rounded">
          <FaClock className="mt-[3px] mr-1" size={14}/>
          {formatTimeDuration(podcast.duration) || "10:00"}
        </div>
      </Link>
      <div className="flex-grow sm:ml-4">
        <Link to={`/watch?pid=${podcast.id}`} className="block">
          <h3 className="text-lg sm:text-xl font-semibold line-clamp-2 text-black dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            {podcast.title}
          </h3>
        </Link>
        <div className="flex flex-wrap items-center mt-2 gap-2 sm:gap-4">
          <Link
            to={`/profile/${podcast.user.username}`}
            className="flex items-center"
          >
            <Avatar
              width="w-6 sm:w-8"
              height="h-6 sm:h-8"
              avatarUrl={podcast.user.avatarUrl || defaultAvatar}
              usedFrame={podcast.user.usedFrame}
              alt="avatar"
            />
            <p className="text-sm sm:text-base text-black dark:text-white font-medium ml-2">{author}</p>
          </Link>
          <p className="text-sm sm:text-base font-medium text-gray-600 dark:text-gray-300 flex items-center">
            <FaEye className="mr-1" />
            {podcast.views} {language.common.views || "views"}
          </p>
        </div>
        <p className="text-sm sm:text-base text-gray-800 dark:text-gray-300 mt-2 line-clamp-2">
          {podcast.content}
        </p>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-2">
          {podcast.genres?.map(genre => (
            <span 
              key={genre.id}
              className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 shadow-md"
            >
              {genre.name}
            </span>
          ))}
        </div>
      </div>
      <div className="flex sm:flex-col items-center sm:items-start mt-3 sm:mt-0 sm:ml-4 gap-2">
        <button
          onClick={handleLikeToggle}
          className={`${isLiked 
              ? 'text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300' 
              : 'text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400'
            } hover:bg-gray-100 hover:dark:bg-gray-700 p-2 rounded-full transition duration-200`}
          aria-label={isLiked ? "Unlike" : "Like"}
          title={isLiked ? language.likedPodcast.unlikeThisPodcast : language.likedPodcast.likeThisPodcast}
        >
          {isLiked ? (
            <FaHeart className="w-5 h-5 sm:w-6 sm:h-6" />
          ) : (
            <FaRegHeart className="w-5 h-5 sm:w-6 sm:h-6" />
          )}
        </button>

        <CustomOptionMenu
          buttonContent={<HiDotsVertical className="w-5 h-5 sm:w-6 sm:h-6" />}
          position="bottom"
          trigger="click"
          size="md"
          className="transition-colors rounded-full text-black dark:text-white hover:bg-gray-100 hover:dark:bg-gray-700"
        >
          <ul className="py-1 text-sm">
            <li className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer" onClick={toggleReportModal}>
              <FaFlag className="inline-block mr-2" />
              {language.common.report}
            </li>
            {/* <li className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer" onClick={handleSave}>
              <MdOutlineWatchLater className="inline-block mr-2" />
              {language.common.watchLater}
            </li> */}
            <li className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer" onClick={toggleAddToPlaylistModal}>
              <FaBookmark className="inline-block mr-2" />
              {language.common.addToPlaylist}
            </li>
            <li className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer" onClick={toggleShareModal}>
              <FaShareAlt className="inline-block mr-2" />
              {language.common.share}
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

      <AddToPlaylistModal
        isOpen={isPlaylistModalOpen}
        onClose={() => setIsPlaylistModalOpen(false)}
        podcastId={podcast.id}
      />
    </div>
  );
};

export default PodcastLiked;