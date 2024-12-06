import React, { useEffect, useState } from 'react';
import { Podcast } from '../../../models/PodcastModel';
import { formatDistanceToNow } from 'date-fns';
import default_avatar from '../../../assets/images/default_avatar.jpg';
import { Link } from 'react-router-dom';
import { FaPlay, FaRegClock } from 'react-icons/fa';
import { getVideoDuration } from './video';
import { formatViewsToShortly } from '../../../utils/formatViews';

interface PodcastTagProps {
  podcast: Podcast;
}

const PodcastTag: React.FC<PodcastTagProps> = ({ podcast }) => {
  const [duration, setDuration] = useState<string | null>(null);

  const author = podcast.user.fullname;
  const createdDay = formatDistanceToNow(new Date(podcast.createdDay), { addSuffix: true });

  useEffect(() => {
    const fetchDuration = async () => {
      try {
        const durationInSeconds = await getVideoDuration(podcast.videoUrl);
        const minutes = Math.floor(durationInSeconds / 60);
        const seconds = Math.floor(durationInSeconds % 60);
        setDuration(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
      } catch (error) {
        console.error(error);
      }
    };

    fetchDuration();
  }, [podcast.videoUrl]);

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
          {duration && (
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-sm px-2 py-1 rounded">
              <FaRegClock className='inline-block mr-1' size={16} />
              {duration}
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
    </div>
  );
};

export default PodcastTag;