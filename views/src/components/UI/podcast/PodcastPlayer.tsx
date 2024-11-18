import React from 'react';
import { FaPlay, FaPause, FaForward, FaBackward } from 'react-icons/fa';

interface PodcastPlayerProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  title: string;
  author: string;
  thumbnailUrl: string;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (time: number) => void;
  onForward: () => void;
  onBackward: () => void;
}

const PodcastPlayer: React.FC<PodcastPlayerProps> = ({
  isPlaying,
  currentTime,
  duration,
  title,
  author,
  thumbnailUrl,
  onPlay,
  onPause,
  onSeek,
  onForward,
  onBackward
}) => {
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="fixed bottom-0 left-0 sm:left-52 right-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-lg p-4">
      <div className="container mx-auto flex items-center justify-between">
        {/* Thumbnail and Info */}
        <div className="flex items-center space-x-4">
          <img 
            src={thumbnailUrl} 
            alt={title} 
            className="w-12 h-12 rounded-lg object-cover"
          />
          <div>
            <h3 className="text-gray-800 dark:text-white font-medium line-clamp-1">{title}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{author}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-6">
          <button 
            onClick={onBackward}
            className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400"
          >
            <FaBackward />
          </button>
          
          <button 
            onClick={isPlaying ? onPause : onPlay}
            className="p-3 bg-blue-500/90 rounded-full text-white hover:bg-blue-600/90 transition-colors"
          >
            {isPlaying ? <FaPause /> : <FaPlay />}
          </button>
          
          <button 
            onClick={onForward}
            className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400"
          >
            <FaForward />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center space-x-3 w-1/3">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min={0}
            max={duration}
            value={currentTime}
            onChange={(e) => onSeek(Number(e.target.value))}
            className="w-full h-2 bg-gray-200/80 dark:bg-gray-700/80 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PodcastPlayer;
