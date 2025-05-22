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
    <div className="bg-transparent rounded-xl overflow-hidden  transition-all duration-300">
      {/* Thumbnail */}
      <Link to={`/watch?pid=${id}`} className="block relative group rounded-xl overflow-hidden">
        <div className="aspect-video relative">
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {/* Play overlay */}
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 p-3 rounded-full shadow-md">
              <FaPlay className="text-blue-500 dark:text-blue-400" />
            </div>
          </div>
          {/* Duration */}
          <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-0.5 rounded text-xs text-white flex items-center gap-1">
            <FaClock size={12} />
            <span>{formatTimeDuration(duration)}</span>
          </div>
        </div>
      </Link>

      {/* Info */}
      <div className="flex items-start gap-3 mt-3 px-1">
        <Avatar
          width="w-10"
          height="h-10"
          avatarUrl={user.avatarUrl || defaultAvatar}
          usedFrame={user.usedFrame}
          alt="avatar"
        />
        <div className="flex-1">
          <Link to={`/watch?pid=${id}`}>
            <h3 className="text-md font-semibold text-gray-800 dark:text-white line-clamp-2 hover:underline">
              {title}
            </h3>
          </Link>
          <div className='flex items-center justify-between mt-1'>
            <Link to={"/profile/"+user.username} className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 hover:underline hover:text-blue-500 dark:hover:text-blue-400">
              @{user.username}
            </Link>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {formatViewsToShortly(views)} views
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PodcastCard;
