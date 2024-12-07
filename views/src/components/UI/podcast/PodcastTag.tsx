import React, { useEffect, useRef } from 'react';
import { Podcast } from '../../../models/PodcastModel';
import { formatDistanceToNow } from 'date-fns';
import default_avatar from '../../../assets/images/default_avatar.jpg';
import { Link } from 'react-router-dom';
import { FaBookmark, FaClock, FaEdit, FaFlag, FaPlay, FaShareAlt } from 'react-icons/fa';
import { formatViewsToShortly } from '../../../utils/formatViews';
import { formatTimeDuration } from './video';
import { HiDotsVertical } from 'react-icons/hi';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';

interface PodcastTagProps {
  podcast: Podcast;
  onReport: () => void;
  onSave: () => void;
  onShare: () => void;
  onToggleOptionMenu: (podcastId: string) => void;
  isOptionMenuOpen: boolean;
}

const PodcastTag: React.FC<PodcastTagProps> = ({ podcast, onReport, onSave, onShare, onToggleOptionMenu, isOptionMenuOpen }) => {
  const author = podcast.user.fullname;
  const createdDay = formatDistanceToNow(new Date(podcast.createdDay), { addSuffix: true });
  const optionMenuRef = useRef<HTMLDivElement>(null);
  const currentUsername = useSelector((state: RootState) => state.auth.user?.username);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (optionMenuRef.current && !optionMenuRef.current.contains(event.target as Node)) {
        onToggleOptionMenu(podcast.id);
      }
    };

    if (isOptionMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOptionMenuOpen, onToggleOptionMenu, podcast.id]);

  return (
    <div className="relative rounded-lg overflow-hidden transform transition-transform duration-300">
      <Link to={`/watch?pid=${podcast.id}`} className="block">
        <div className="relative group">
          <img src={podcast.thumbnailUrl || "/TEST.png"} alt={podcast.title} className="w-full h-56 object-fit rounded-md" />
          <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <button className="bg-white dark:bg-gray-800 p-3 rounded-full transform hover:scale-110 transition-transform duration-300">
              <FaPlay className="text-blue-500 dark:text-blue-400" />
            </button>
          </div>
          {podcast.duration && (
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-sm px-2 py-1 rounded">
              <FaClock className="text-white mr-1 text-sm inline-block" size={18} />
              {formatTimeDuration(podcast.duration)}
            </div>
          )}
        </div>
      </Link>
      <div className="p-2 flex">
        <Link to={`/profile/${podcast.user.username}`} className='flex-shrink-0'>
          <img src={podcast.user.avatarUrl || default_avatar} alt={author} className="w-10 h-10 object-fit rounded-full mr-4" />
        </Link>
        <div className="flex flex-col justify-between flex-grow">
          <div>
            <Link to={`/watch?pid=${podcast.id}`}>
              <h3 className="text-lg font-bold line-clamp-2 text-black dark:text-white" title={podcast.title}>{podcast.title}</h3>
            </Link>
            <Link to={`/profile/${podcast.user.username}`}>
              <p className="text-base font-medium text-gray-800 dark:text-white">{author}</p>
            </Link>
          </div>
          <div className="flex gap-4 text-base text-gray-800 dark:text-gray-300">
            <p>{formatViewsToShortly(podcast.views)} views</p>
            <p>{createdDay}</p>
          </div>
        </div>
      </div>
      <button
        className="absolute bottom-10 transition-colors right-0 rounded-full p-1 text-black dark:text-white hover:bg-gray-400 hover:dark:bg-gray-700"
        onClick={() => onToggleOptionMenu(podcast.id)}
      >
        <HiDotsVertical size={24} />
      </button>
      {isOptionMenuOpen && (
        <div ref={optionMenuRef} className="absolute bottom-0 right-10 w-48 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg z-50">
          <ul className="py-1">
          {currentUsername === podcast.user.username ? (
              <>
                <Link to={`/creator/podcast/${podcast.id}`}>
                  <li className="px-4 py-2 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                    <FaEdit className="inline-block mb-1 mr-2" />
                    Edit
                  </li>
                </Link>
                <li className="px-4 py-2 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer" onClick={onReport}>
                  <FaFlag className="inline-block mb-1 mr-2" />
                  Report
                </li>
              </>
            ) : (
              <>
                <li className="px-4 py-2 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer" onClick={onReport}>
                  <FaFlag className="inline-block mb-1 mr-2" />
                  Report
                </li>
                <li className="px-4 py-2 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer" onClick={onSave}>
                  <FaBookmark className="inline-block mb-1 mr-2" />
                  Save
                </li>
                <li className="px-4 py-2 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer" onClick={onShare}>
                  <FaShareAlt className="inline-block mb-1 mr-2" />
                  Share
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PodcastTag;