import React, { useEffect, useRef } from 'react';
import { Podcast } from '../../../models/PodcastModel';
import { formatDistanceToNow } from 'date-fns';
import default_avatar from '../../../assets/images/default_avatar.jpg';
import { Link } from 'react-router-dom';
import { FaClock, FaEdit, FaFlag, FaPlay, FaShareAlt } from 'react-icons/fa';
import { formatViewsToShortly } from '../../../utils/formatViews';
import { formatTimeDuration } from './video';
import { HiDotsVertical } from 'react-icons/hi';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import Avatar from '../user/Avatar';
import { CgEyeAlt } from 'react-icons/cg';
import { BsClock } from 'react-icons/bs';
import { RiAddBoxLine } from 'react-icons/ri';

interface PodcastTagProps {
  podcast: Podcast;
  onReport: () => void;
  onAddToPlaylist: () => void;
  onShare: () => void;
  onToggleOptionMenu: (podcastId: string) => void;
  isOptionMenuOpen: boolean;
}

const PodcastTag: React.FC<PodcastTagProps> = ({ podcast, onReport, onAddToPlaylist, onShare, onToggleOptionMenu, isOptionMenuOpen }) => {
  const author = podcast.user.fullname;

  const createdDay = podcast.createdDay
    ? formatDistanceToNow(new Date(podcast.createdDay), { addSuffix: true })
    : 'Unknown Date';

  // tính toán thủ công createdDay

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
    <div className="relative w-96 min-h-80 bg-gradient-to-br from-white via-gray-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-3xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-500 border border-gray-200 dark:border-gray-700">
      {/* Thumbnail */}
      <Link to={`/watch?pid=${podcast.id}`} className="block relative group overflow-hidden rounded-t-3xl">
        <div className="w-full h-40 relative">
          <img
            src={podcast.thumbnailUrl || "https://img.freepik.com/free-photo/cement-texture_1194-6523.jpg?semt=ais_hybrid"}
            alt={podcast.title}
            className="w-full h-full object-cover rounded-t-3xl transition-transform duration-500 group-hover:scale-110"
          />

          {/* Overlay Play Button */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
            <button className="bg-white dark:bg-gray-800 p-4 rounded-full shadow-lg hover:scale-110 transition-transform duration-300">
              <FaPlay className="text-blue-600 dark:text-blue-400 w-5 h-5" />
            </button>
          </div>

          {/* Duration */}
          {podcast.duration && (
            <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-md text-white px-3 py-1.5 text-xs rounded-full shadow-lg font-medium">
              <FaClock className="inline-block mr-1 mb-0.5" size={13} />
              {formatTimeDuration(podcast.duration)}
            </div>
          )}

          {/* Podcast Label */}
          <div className="absolute top-3 left-3 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md uppercase tracking-wide">
            {podcast.genres && podcast.genres.length > 0 ? (
              <span>
                {podcast.genres[0].name}
                {podcast.genres.length > 1 && ', ...'}
              </span>
            ) : (
              <span>No Genre</span>
            )}

          </div>
        </div>
      </Link>

      {/* Info */}
      <div className="p-4 flex flex-col gap-3">
        <div className="flex gap-3 items-start">
          <Link to={`/profile/${podcast.user.username}`}>
            <Avatar
              avatarUrl={podcast.user.avatarUrl || default_avatar}
              width="w-12"
              height="h-12"
              alt={author}
              usedFrame={podcast.user.usedFrame}
            />
          </Link>
          <div className="flex-1">
            <Link to={`/watch?pid=${podcast.id}`}>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition">
                {podcast.title}
              </h3>
            </Link>
            <Link to={`/profile/${podcast.user.username}`}>
              <p className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition">
                {author}
              </p>
            </Link>
          </div>
        </div>

        {/* Meta Info */}
        <div className="m-auto flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400 mt-1">
          <span className="flex items-center gap-1">
            {/* <CgEyeAlt className="text-base" /> */}
            {formatViewsToShortly(podcast.views) + " "}
            views
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <BsClock className="text-base" />
            {createdDay}
          </span>
        </div>
      </div>

      {/* Option Menu Button */}
      <button
        className="absolute top-4 right-4 p-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white transition"
        onClick={() => onToggleOptionMenu(podcast.id)}
      >
        <HiDotsVertical size={20} />
      </button>

      {/* Option Menu */}
      {isOptionMenuOpen && (
        <div
          ref={optionMenuRef}
          className="absolute top-14 right-4 w-52 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
        >
          <ul className="py-1">
            {currentUsername === podcast.user.username ? (
              <>
                <Link to={`/creator/podcast/${podcast.id}`}>
                  <li className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-700 dark:text-gray-300 flex items-center gap-3">
                    <FaEdit />
                    Edit podcast
                  </li>
                </Link>
                <li onClick={onAddToPlaylist} className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-700 dark:text-gray-300 flex items-center gap-3">
                  <RiAddBoxLine />
                  Add to playlist
                </li>
                <li onClick={onReport} className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-700 dark:text-gray-300 flex items-center gap-3">
                  <FaFlag />
                  Report issue
                </li>
              </>
            ) : (
              <>
                <li onClick={onReport} className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-700 dark:text-gray-300 flex items-center gap-3">
                  <FaFlag />
                  Report content
                </li>
                <li onClick={onAddToPlaylist} className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-700 dark:text-gray-300 flex items-center gap-3">
                  <RiAddBoxLine />
                  Add to playlist
                </li>
                <li onClick={onShare} className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-700 dark:text-gray-300 flex items-center gap-3">
                  <FaShareAlt />
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