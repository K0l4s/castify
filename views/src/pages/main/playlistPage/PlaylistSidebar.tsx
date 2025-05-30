// Create a new file: src/components/UI/podcast/PlaylistSidebar.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlaylistModel } from '../../../models/PlaylistModel';
import PlaylistService from '../../../services/PlaylistService';
import { FaBookmark, FaChevronDown, FaChevronUp, FaGripLines, FaPlay, FaTrashAlt } from 'react-icons/fa';
import { FiLoader } from 'react-icons/fi';
import { formatTimeDuration } from '../../../components/UI/podcast/video';
import './style/PlaylistSidebar.css';
import { CSSTransition } from 'react-transition-group';
import { useToast } from '../../../context/ToastProvider';
import { HiDotsVertical } from 'react-icons/hi';
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided, DraggableStateSnapshot } from 'react-beautiful-dnd';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';

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
  const [reordering, setReordering] = useState<boolean>(false);
  const navigate = useNavigate();
  const menuRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const transitionRef = useRef<HTMLDivElement | null>(null);
  const toast = useToast();
  
  // Get authentication status from Redux store
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const isOwnPlaylist = isAuthenticated && playlist?.owner.id === currentUser?.id;

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const data = await PlaylistService.getPlaylistById(playlistId, isAuthenticated);
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
    // Only allow opening menu if user is authenticated
    if (!isAuthenticated) {
      toast.warning("Please login to access additional options");
      return;
    }
    setActiveMenuId(activeMenuId === podcastId ? null : podcastId);
  };

  const handleSavePodcast = async (podcastId: string) => {
    if (!isAuthenticated) {
      toast.warning("Please login to save podcasts");
      return;
    }
    
    try {
      // Implement save podcast functionality here
      toast.success("Podcast saved successfully: " + podcastId);
      setActiveMenuId(null);
    } catch (error) {
      toast.error("Failed to save podcast");
    }
  };

  const handleRemoveFromPlaylist = async (podcastId: string) => {
    if (!isAuthenticated) {
      toast.warning("Please login to modify playlists");
      return;
    }
    
    // Check if user owns the playlist
    if (!isOwnPlaylist) {
      toast.warning("You can only modify your own playlists");
      return;
    }
    
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

  const handleDragEnd = async (result: DropResult) => {
    // Only allow reordering if user is authenticated and owns the playlist
    if (!isAuthenticated) {
      toast.warning("Please login to reorder playlists");
      return;
    }
    
    if (!isOwnPlaylist) {
      toast.warning("You can only reorder your own playlists");
      return;
    }
    
    const { destination, source } = result;
    
    // Return if dropped outside the list or at the same position
    if (!destination || 
        (destination.droppableId === source.droppableId && 
         destination.index === source.index)) {
      return;
    }
    
    if (!playlist) return;
    
    // Reorder the items locally
    const items = Array.from(playlist.items);
    const [reorderedItem] = items.splice(source.index, 1);
    items.splice(destination.index, 0, reorderedItem);
    
    // Update the local state immediately for responsive UI
    setPlaylist({
      ...playlist,
      items
    });
    
    // Extract podcast IDs in the new order
    const podcastIds = items.map(item => item.podcastId);
    
    // Save the new order to the server
    try {
      setReordering(true);
      await PlaylistService.reorderPlaylistItems(playlistId, podcastIds);
      toast.success('Playlist order updated');
    } catch (error) {
      console.error('Failed to update playlist order:', error);
      toast.error('Failed to update playlist order');
      
      // Fetch the original playlist if the API call fails
      try {
        const refreshedPlaylist = await PlaylistService.getPlaylistById(playlistId, isAuthenticated);
        setPlaylist(refreshedPlaylist);
      } catch (refreshError) {
        console.error('Failed to refresh playlist data:', refreshError);
      }
    } finally {
      setReordering(false);
    }
  };

  // const getCurrentIndexInfo = () => {
  //   if (!playlist) return null;
  //   const currentIndex = playlist.items.findIndex(item => item.podcastId === currentPodcastId);
  //   if (currentIndex === -1) return null;
  //   return {
  //     current: currentIndex + 1,
  //     total: playlist.items.length
  //   };
  // };

  // const indexInfo = getCurrentIndexInfo();

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
    <div className={`relative bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 overflow-hidden rounded-2xl transition-all duration-500 ease-in-out 
      ${isCollapsed ? 'max-h-40' : 'max-h-[600px]'}`}>
      {/* Header with collapse button */}
      <div className="sticky top-0 p-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 z-10 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-black dark:text-white">{playlist.name}</h3>
          <h3 className="text-sm text-black dark:text-white">{playlist.owner.lastName} {playlist.owner.middleName} {playlist.owner.firstName}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {playlist.hiddenCount > 0 
              ? `${playlist.totalItems} videos • (${playlist.hiddenCount} video has been hidden)`
              : `${playlist.totalItems} videos`
            }
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {reordering && (
            <span className="text-sm text-blue-500 animate-pulse">Saving...</span>
          )}
          <button 
            onClick={toggleCollapse}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
            aria-label={isCollapsed ? "Expand playlist" : "Collapse playlist"}
          >
            {isCollapsed ? 
              <FaChevronDown className="text-gray-700 dark:text-gray-300" size={20} /> : 
              <FaChevronUp className="text-gray-700 dark:text-gray-300" size={20} />
            }
          </button>
        </div>
      </div>

      {/* Content - animated with height transition */}
      <CSSTransition
        in={!isCollapsed}
        timeout={300}
        classNames="playlist-items"
        unmountOnExit
        nodeRef={transitionRef}
      >
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="playlist-items" isDropDisabled={!isOwnPlaylist}>
            {(provided: DroppableProvided) => (
              <div 
                ref={(el) => {
                  // Assign both the transitionRef and the provided ref
                  transitionRef.current = el;
                  provided.innerRef(el);
                }}
                {...provided.droppableProps}
                className="divide-y divide-gray-200 dark:divide-gray-700 overflow-y-auto max-h-[600px]"
              >
                {playlist.items.map((item, index) => (
                  <Draggable 
                    key={item.podcastId} 
                    draggableId={item.podcastId} 
                    index={index}
                    isDragDisabled={!isOwnPlaylist}
                  >
                    {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                      <div 
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`flex p-4 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-200 ${
                          item.podcastId === currentPodcastId ? 'bg-blue-100 dark:bg-blue-900' : ''
                        } ${snapshot.isDragging ? 'opacity-70 shadow-lg' : ''} relative`}
                      >
                        {/* Drag Handle - Only show if user owns playlist */}
                        {isOwnPlaylist && (
                          <div className="flex items-center">
                            <div 
                              {...provided.dragHandleProps}
                              className="px-2 py-1 cursor-grab active:cursor-grabbing"
                            >
                              <FaGripLines className="text-gray-400" />
                            </div>
                          </div>
                        )}

                        <div 
                          className="flex-1 flex items-start"
                          onClick={() => navigate(`/watch?pid=${item.podcastId}&playlist=${playlistId}`)}
                        >
                          <div className="w-8 text-gray-500 dark:text-gray-400 flex items-center justify-center mr-3 mt-5">
                            {item.podcastId === currentPodcastId ? (
                              <FaPlay className="text-blue-500 mt-1" />
                            ) : (
                              <span>{index + 1}</span>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="relative w-30 h-16 mr-3 float-left">
                              <img
                                src={item.thumbnail || "https://via.placeholder.com/120x80"}
                                alt="Video thumbnail"
                                className="w-full h-full object-cover rounded aspect-[16/9]"
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
                        
                        {/* Only show menu button for authenticated users */}
                        {isAuthenticated && (
                          <div className="relative flex items-start">
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
                                    className="px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center text-gray-700 dark:text-gray-300 transition ease-in-out duration-200"
                                    onClick={() => handleSavePodcast(item.podcastId)}
                                  >
                                    <FaBookmark className="mr-2" />
                                    Save podcast
                                  </li>
                                  {/* Only show remove option if user owns the playlist */}
                                  {isOwnPlaylist && (
                                    <li 
                                      className="px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center text-red-500 transition ease-in-out duration-200"
                                      onClick={() => handleRemoveFromPlaylist(item.podcastId)}
                                    >
                                      <FaTrashAlt className="mr-2" />
                                      Remove from playlist
                                    </li>
                                  )}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </CSSTransition>
    </div>
  );
};

export default PlaylistSidebar;