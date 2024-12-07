import React from 'react';
import { FaPlay, FaClock } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { formatViewsToShortly } from '../../../utils/formatViews';
import { formatTimeDuration } from './video';
import defaultAvatar from '../../../assets/images/default_avatar.jpg';
interface PodcastCardProps {
  id: string;
  title: string;
  user: {
    avatar: string;
    username: string;
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
    <div className="bg-transparent rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-all duration-300">
      {/* Thumbnail Container */}
      <Link to={`/watch?pid=${id}`}>
        <div className="relative group">
          <div className="w-full pb-[56.25%] relative"> {/* 16:9 aspect ratio */}
            <img
              src={thumbnailUrl}
              alt={title}
              className="absolute top-0 left-0 w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <button className="bg-white dark:bg-gray-800 p-3 rounded-full transform hover:scale-110 transition-transform duration-300">
              <FaPlay className="text-blue-500 dark:text-blue-400" />
            </button>
          </div>
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 px-2 py-1 rounded-md flex items-center">
            <FaClock className="text-white mr-1 text-sm" size={18} />
            <span className="text-white text-sm">{formatTimeDuration(duration)}</span>
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        <Link to={`/watch?pid=${id}`}>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1 line-clamp-1">
            {title}
          </h3>
        </Link>
        <div className="flex justify-between">
          <div className=' flex items-center'>
            <img src={user.avatar || defaultAvatar} alt={user.username} className='w-5 h-5 rounded-full mr-1' />
            <span className='line-clamp-1 text-md text-gray-500 dark:text-gray-400'>{user.username}</span>
          </div>
          <span>{formatViewsToShortly(views)} views</span>
        </div>
      </div>
    </div>
  );
};

export default PodcastCard;
