// Create a new file: src/components/UI/podcast/PlaylistSidebar.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlaylistModel } from '../../../models/PlaylistModel';
import PlaylistService from '../../../services/PlaylistService';
import { FaBookmark, FaChevronDown, FaChevronUp, FaPlay, FaTrashAlt } from 'react-icons/fa';
import { FiLoader } from 'react-icons/fi';
import { formatTimeDuration } from '../../../components/UI/podcast/video';
import './style/PlaylistSidebar.css';
import { CSSTransition } from 'react-transition-group';
import { useToast } from '../../../context/ToastProvider';
import { HiDotsVertical } from 'react-icons/hi';

interface PlaylistSidebarProps {
  playlistId: string;
  currentPodcastId: string;
  onNextPodcast?: (podcastId: string) => void;
}

const PlaylistSidebar: React.FC<PlaylistSidebarProps> = ({ playlistId, currentPodcastId, onNextPodcast }) => {
  const [playlist, setPlaylist] = useState<PlaylistModel | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const navigate = useNavigate();
  const menuRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const transitionRef = useRef(null);
  const toast = useToast();

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const data = await PlaylistService.getPlaylistById(playlistId);
        setPlaylist(data);
      } catch (error) {
        console.error("Error fetching playlist:", error);
        setError("Failed to load playlist");
      } finally {
        setLoading(false);
      }
    };

    if (playlistId) {
      fetchPlaylist();
    }
  }, [playlistId]);
  
  useEffect(() => {
    if (!playlist || !currentPodcastId) return;
    
    // Find the current index
    const currentIndex = playlist.items.findIndex(item => item.podcastId === currentPodcastId);
    
    // Set up listener for video end to play the next video
    const videoElement = document.querySelector('video');
    if (!videoElement) return;

    const handleVideoEnd = () => {
      if (currentIndex !== -1 && currentIndex < playlist.items.length - 1) {
        const nextItem = playlist.items[currentIndex + 1];
        if (nextItem) {
          if (onNextPodcast) {
            onNextPodcast(nextItem.podcastId);
          } else {
            navigate(`/watch?pid=${nextItem.podcastId}&playlist=${playlistId}`);
          }
        }
      }
    };

    videoElement.addEventListener('ended', handleVideoEnd);
    return () => {
      videoElement.removeEventListener('ended', handleVideoEnd);
    };
  }, [playlist, currentPodcastId, navigate, playlistId, onNextPodcast]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeMenuId && menuRefs.current[activeMenuId] && 
          !menuRefs.current[activeMenuId]?.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };

    if (activeMenuId) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeMenuId]);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMenu = (podcastId: string) => {
    setActiveMenuId(activeMenuId === podcastId ? null : podcastId);
  };

  const handleSavePodcast = async (podcastId: string) => {
    try {
      // Implement save podcast functionality here
      toast.success("Podcast saved successfully: " + podcastId);
      setActiveMenuId(null);
    } catch (error) {
      toast.error("Failed to save podcast");
    }
  };

  const handleRemoveFromPlaylist = async (podcastId: string) => {
    try {
      await PlaylistService.removePodcastToPlaylist(playlistId, podcastId);
      
      // Update the playlist state to remove the item
      if (playlist) {
        const updatedItems = playlist.items.filter(item => item.podcastId !== podcastId);
        setPlaylist({
          ...playlist,
          items: updatedItems,
          totalItems: updatedItems.length
        });
      }
      
      toast.success("Removed from playlist");
      setActiveMenuId(null);
      
      // If the current podcast was removed, play the next one if available
      if (podcastId === currentPodcastId && playlist) {
        const currentIndex = playlist.items.findIndex(item => item.podcastId === currentPodcastId);
        if (currentIndex !== -1) {
          const nextIndex = currentIndex < playlist.items.length - 1 ? currentIndex + 1 : currentIndex - 1;
          if (nextIndex >= 0) {
            navigate(`/watch?pid=${playlist.items[nextIndex].podcastId}&playlist=${playlistId}`);
          } else {
            // No more podcasts in the playlist, navigate away
            navigate('/');
          }
        }
      }
    } catch (error) {
      toast.error("Failed to remove from playlist");
    }
  };

  const getCurrentIndexInfo = () => {
    if (!playlist) return null;
    const currentIndex = playlist.items.findIndex(item => item.podcastId === currentPodcastId);
    if (currentIndex === -1) return null;
    return {
      current: currentIndex + 1,
      total: playlist.items.length
    };
  };

  const indexInfo = getCurrentIndexInfo();

  if (loading) {
    return (
      <div className="w-80 h-full bg-white dark:bg-gray-800 p-4 flex justify-center items-center">
        <FiLoader size={32} className="animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !playlist) {
    return (
      <div className="w-80 h-full bg-white dark:bg-gray-800 p-4">
        <p className="text-red-500">{error || "Playlist not found"}</p>
      </div>
    );
  }

  return (
    <div className={`relative bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 overflow-hidden rounded-2xl transition-all duration-300 ease-in-out 
      ${isCollapsed ? 'max-h-20' : 'max-h-[600px]'}`}>
      {/* Header with collapse button */}
      <div className="sticky top-0 p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 z-10 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-black dark:text-white">{playlist.name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {indexInfo ? `${indexInfo.current}/${indexInfo.total} videos` : `${playlist.totalItems} videos`}
          </p>
        </div>
        <button 
          onClick={toggleCollapse}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          {isCollapsed ? 
            <FaChevronDown className="text-gray-700 dark:text-gray-300" size={20} /> : 
            <FaChevronUp className="text-gray-700 dark:text-gray-300" size={20} />
          }
        </button>
      </div>

      {/* Content - animated with height transition */}
      <CSSTransition
        in={!isCollapsed}
        timeout={300}
        classNames="playlist-items"
        unmountOnExit
        nodeRef={transitionRef}
      >
        <div ref={transitionRef} className="divide-y divide-gray-200 dark:divide-gray-700 overflow-y-auto max-h-[540px]">
          {playlist.items.map((item, index) => (
            <div 
              key={item.podcastId}
              className={`flex p-4 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-200 ${
                item.podcastId === currentPodcastId ? 'bg-blue-100 dark:bg-blue-900' : ''
              } relative`}
            >
              <div 
                className="flex-1 flex items-start"
                onClick={() => navigate(`/watch?pid=${item.podcastId}&playlist=${playlistId}`)}
              >
                <div className="w-8 text-gray-500 dark:text-gray-400 flex items-center justify-center mr-3">
                  {item.podcastId === currentPodcastId ? (
                    <FaPlay className="text-blue-500" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="relative w-30 h-16 mr-3 float-left">
                    <img
                      src={item.thumbnail || "https://via.placeholder.com/120x80"}
                      alt="Video thumbnail"
                      className="w-full h-full object-cover rounded"
                    />
                    {item.duration && (
                      <span className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-sm px-1 py-0.5 rounded">
                        {formatTimeDuration(item.duration)}
                      </span>
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium line-clamp-2 text-black dark:text-white mb-1">
                      {item.title}
                    </p>
                    <p className="text-sm line-clamp-1 text-gray-600 dark:text-gray-400">
                      {item.owner || "Unknown"}
                    </p>
                  </div>
                </div>
              </div>
              {/* Vertical Menu Button */}
              <div className="relative flex items-start ml-2">
                <button
                  className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                  onClick={() => toggleMenu(item.podcastId)}
                >
                  <HiDotsVertical size={16} className="text-gray-600 dark:text-gray-400" />
                </button>
                
                {/* Menu Options */}
                {activeMenuId === item.podcastId && (
                  <div 
                    ref={(el) => (menuRefs.current[item.podcastId] = el)}
                    className="absolute right-8 -top-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50"
                  >
                    <ul className="py-1">
                      <li 
                        className="px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center text-gray-700 dark:text-gray-300 transision ease-in-out duration-200"
                        onClick={() => handleSavePodcast(item.podcastId)}
                      >
                        <FaBookmark className="mr-2" />
                        Save podcast
                      </li>
                      <li 
                        className="px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center text-red-500 transision ease-in-out duration-200"
                        onClick={() => handleRemoveFromPlaylist(item.podcastId)}
                      >
                        <FaTrashAlt className="mr-2" />
                        Remove from playlist
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CSSTransition>
    </div>
  );
};

export default PlaylistSidebar;