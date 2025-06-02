import React from 'react';
import { FaPlay, FaClock } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { formatViewsToShortly } from '../../../utils/formatViews';
import { formatTimeDuration } from './video';
import defaultAvatar from '../../../assets/images/default_avatar.jpg';
import Avatar from '../user/Avatar';
import { UserFrame } from '../../../models/User';

interface PodcastCardProps {
  id: string;
  title: string;
  user: {
    avatarUrl: string;
    username: string;
    usedFrame?: UserFrame;
  };
  thumbnailUrl: string;
  views: number;
  duration: number;
}

const PodcastCard: React.FC<PodcastCardProps> = ({
  id,
  title,
  user,
  thumbnailUrl,
  views,
  duration,
}) => {
  return (
    <div className="bg-gradient-to-br from-white via-gray-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 max-w-2xl mx-auto border border-gray-200 dark:border-gray-700">
      {/* Thumbnail */}
      <Link
        to={`/watch?pid=${id}`}
        className="block relative group overflow-hidden"
      >
        <div className="aspect-video relative">
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-full shadow-xl animate-pulse">
              <FaPlay className="text-blue-600 dark:text-blue-400 text-xl" />
            </div>
          </div>
          {/* Duration */}
          <div className="absolute bottom-3 right-3 bg-black/75 px-2.5 py-1 rounded-md text-xs text-white flex items-center gap-1 font-medium shadow">
            <FaClock size={12} />
            <span>{formatTimeDuration(duration)}</span>
          </div>

        </div>
      </Link>

      {/* Info */}
      <div className="flex items-start gap-4 mt-4 px-5 pb-5">
        <div className='flex flex-col items-center justify-center'>
          <Avatar
            width="w-14"
            height="h-14"
            avatarUrl={user.avatarUrl || defaultAvatar}
            usedFrame={user.usedFrame}
            alt="avatar"
          />
          <Link
            to={`/profile/${user.username}`}
            className="text-sm text-gray-600 dark:text-gray-400 hover:underline hover:text-blue-500 dark:hover:text-blue-300 transition"
          >
            @{user.username}
          </Link>
        </div>
        <div className="flex-1">

          <Link to={`/watch?pid=${id}`}>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2 hover:underline hover:text-blue-700 dark:hover:text-blue-400 transition-colors duration-300">
              {title}
            </h3>
          </Link>

          <span className="text-sm text-gray-500 dark:text-gray-400">
            {formatViewsToShortly(views)} views
          </span>

        </div>
      </div>
    </div>


  );
};

export default PodcastCard;
