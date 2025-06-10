import React, { useRef } from "react";
import { Podcast } from "../../../models/PodcastModel";
import { useNavigate } from "react-router-dom";
import { formatViewsToShortly } from "../../../utils/formatViews";
import { formatDistanceToNow } from "date-fns";
import Avatar from "../user/Avatar";
import defaultAvatar from "../../../assets/images/default_avatar.jpg";
import { BsDot, BsThreeDotsVertical } from "react-icons/bs";
import { CgEyeAlt } from "react-icons/cg";
import { BsClock } from "react-icons/bs";
import { MdOutlineWatchLater, MdOutlinePlaylistAdd, MdShare, MdOutlineFlag } from "react-icons/md";
import { formatTimeDuration } from "./video";
import { FaClock, FaPlay } from "react-icons/fa";
import Tooltip from "../custom/Tooltip";
import { useClickOutside } from "../../../hooks/useClickOutside";
import { useLanguage } from "../../../context/LanguageContext";

interface PodcastListItemProps {
  podcast: Podcast;
  onReport: () => void;
  onAddToPlaylist: () => void;
  onShare: () => void;
  onToggleOptionMenu: (podcastId: string, event: React.MouseEvent) => void;
  isOptionMenuOpen: boolean;
}

const PodcastListItem: React.FC<PodcastListItemProps> = ({
  podcast,
  onReport,
  onAddToPlaylist,
  onShare,
  onToggleOptionMenu,
  isOptionMenuOpen,
}) => {
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);
  const {language} = useLanguage();
  useClickOutside(menuRef, () => {
    if (isOptionMenuOpen) {
      onToggleOptionMenu(podcast.id, new MouseEvent("click") as unknown as React.MouseEvent);
    }
  });

  const handleClick = () => {
    navigate(`/watch?pid=${podcast.id}`);
  };

  return (
    <div 
      onClick={handleClick}
      className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-100 dark:border-gray-700 relative group"
    >
      {/* Thumbnail */}
      <div className="relative w-full md:w-64 aspect-video rounded-lg overflow-hidden group-hover:shadow-md transition-all">
        <img
          src={podcast.thumbnailUrl || "https://img.freepik.com/free-photo/cement-texture_1194-6523.jpg?semt=ais_hybrid"}
          alt={podcast.title}
          className="w-full h-full object-cover"
        />
        
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
          <div className="bg-white/90 p-3 rounded-full shadow-md">
            <FaPlay className="text-blue-600 w-6 h-6" />
          </div>
        </div>
        
        <div className="flex absolute bottom-2 right-2 bg-black/70 text-white text-sm px-2 py-1 rounded">
          <FaClock size={14} className='my-auto mr-1'/>
          {formatTimeDuration(podcast.duration) || "10:00"}
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-bold text-black dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {podcast.title}
        </h3>
        
        {/* Creator info */}
        <div className="flex items-center mt-1 mb-2">
          <Avatar 
            avatarUrl={podcast.user.avatarUrl || defaultAvatar} 
            width="w-8" 
            height="h-8" 
            usedFrame={podcast.user.usedFrame}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/profile/${podcast.user.username}`);
            }}
          />
          <span 
            className="text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer ml-2"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/profile/${podcast.user.username}`);
            }}
          >
            {podcast.user.fullname}
          </span>
          <BsDot className="text-gray-500" />
          <span className="text-base text-gray-600 dark:text-gray-200 flex items-center">
            <CgEyeAlt className="mr-1" />
            {formatViewsToShortly(podcast.views)} views
          </span>
          <BsDot className="text-gray-500" />
          <span className="text-base text-gray-600 dark:text-gray-200 flex items-center">
            <BsClock className="mr-1" />
            {formatDistanceToNow(new Date(podcast.createdDay), { addSuffix: true })}
          </span>
        </div>
        
        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
          {podcast.content}
        </p>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-2">
          {podcast.genres?.map(genre => (
            <span 
              key={genre.id}
              className="text-sm px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 shadow-md"
            >
              {genre.name}
            </span>
          ))}
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex md:flex-col items-center gap-2 relative">
        <Tooltip text={language.common.addToPlaylist || "Add to Playlist"}>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onAddToPlaylist();
            }}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <MdOutlinePlaylistAdd size={22} />
          </button>
        </Tooltip>
        
        <Tooltip text={language.common.share || "Share"}>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onShare();
            }}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <MdShare size={20} />
          </button>
        </Tooltip>
        
        <div className="relative">
          <Tooltip text={language.common.more || "More"}>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onToggleOptionMenu(podcast.id, e);
              }}
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            >
              <BsThreeDotsVertical size={20} />
            </button>
          </Tooltip>
          
          {isOptionMenuOpen && (
            <div 
              ref={menuRef} 
              className="absolute z-10 right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 border border-gray-200 dark:border-gray-700"
            >
              <button
                className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={(e) => {
                  e.stopPropagation();
                  onReport();
                }}
              >
                <MdOutlineFlag className="mr-2" /> {language.common.report || "Report"}
              </button>
              <button
                className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={(e) => {
                  e.stopPropagation();
                  // You can add watch later functionality here
                }}
              >
                <MdOutlineWatchLater className="mr-2" /> {language.common.watchLater || "Watch Later"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PodcastListItem;