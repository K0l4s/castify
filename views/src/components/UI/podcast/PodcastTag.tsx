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
    <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
      <Link to={`/watch?pid=${podcast.id}`} className="block">
        <div className="relative group">
          <img 
            src={podcast.thumbnailUrl || "/TEST.png"} 
            alt={podcast.title} 
            className="w-full h-56 object-cover rounded-t-xl"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute inset-0 flex items-center justify-center">
              <button className="bg-white/90 hover:bg-white p-4 rounded-full transform hover:scale-110 transition-all duration-300 shadow-xl">
                <FaPlay className="text-blue-600 w-6 h-6" />
              </button>
            </div>
          </div>
          {podcast.duration && (
            <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-sm text-white px-3 py-1.5 text-sm rounded-full shadow-lg">
              <FaClock className="inline-block mr-1.5 mb-0.5" size={14} />
              {formatTimeDuration(podcast.duration)}
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <div className="flex gap-3">
          <Link to={`/profile/${podcast.user.username}`} className="flex-shrink-0">
            <img 
              src={podcast.user.avatarUrl || default_avatar} 
              alt={author} 
              className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700"
            />
          </Link>
          <div className="flex-grow">
            <Link to={`/watch?pid=${podcast.id}`}>
              <h3 className="text-lg font-semibold line-clamp-2 mb-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                {podcast.title}
              </h3>
            </Link>
            <Link to={`/profile/${podcast.user.username}`}>
              <p className="text-gray-700 dark:text-gray-300 font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                {author}
              </p>
            </Link>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-1">
              <span>{formatViewsToShortly(podcast.views)} views</span>
              <span>•</span>
              <span>{createdDay}</span>
            </div>
          </div>
        </div>
      </div>

      <button
        className="absolute top-4 right-4 p-2 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-colors"
        onClick={() => onToggleOptionMenu(podcast.id)}
      >
        <HiDotsVertical size={20} />
      </button>

      {isOptionMenuOpen && (
        <div 
          ref={optionMenuRef} 
          className="absolute top-14 right-4 w-52 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
        >
          <ul className="py-1">
            {currentUsername === podcast.user.username ? (
              <>
                <Link to={`/creator/podcast/${podcast.id}`}>
                  <li className="px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                    <FaEdit className="inline-block mr-3" />
                    Edit podcast
                  </li>
                </Link>
                <li className="px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors" onClick={onReport}>
                  <FaFlag className="inline-block mr-3" />
                  Report issue
                </li>
              </>
            ) : (
              <>
                <li className="px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors" onClick={onReport}>
                  <FaFlag className="inline-block mr-3" />
                  Report content
                </li>
                <li className="px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors" onClick={onSave}>
                  <FaBookmark className="inline-block mr-3" />
                  Save to playlist
                </li>
                <li className="px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors" onClick={onShare}>
                  <FaShareAlt className="inline-block mr-3" />
                  Share podcast
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