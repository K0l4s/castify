// src/pages/main/trendingPage/TrendingList.tsx
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { getTrendingPodcast } from '../../../services/PodcastService';
import { Podcast } from '../../../models/PodcastModel';
import { FiLoader } from 'react-icons/fi';
import { formatViewsToShortly } from '../../../utils/formatViews';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import Avatar from '../../../components/UI/user/Avatar';
import defaultAvatar from '../../../assets/images/default_avatar.jpg';
import { BsDot, BsThreeDotsVertical } from 'react-icons/bs';
import { FaClock, FaPlay } from 'react-icons/fa';
import { MdOutlineWatchLater, MdOutlinePlaylistAdd, MdShare, MdOutlineFlag } from 'react-icons/md';
import { CgEyeAlt } from 'react-icons/cg';
import { BsClock } from 'react-icons/bs';
import ShareModal from '../../../components/modals/podcast/ShareModal';
import ReportModal from '../../../components/modals/report/ReportModal';
import { ReportType } from '../../../models/Report';
import AddToPlaylistModal from '../playlistPage/AddToPlaylistModal';
import Tooltip from '../../../components/UI/custom/Tooltip';
import { useToast } from '../../../context/ToastProvider';
import { useClickOutside } from '../../../hooks/useClickOutside';
import { formatTimeDuration } from '../../../components/UI/podcast/video';

const TrendingList: React.FC = () => {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedPodcastId, setSelectedPodcastId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [, setCurrentPage] = useState<number>(0);
  const [, setTotalPages] = useState<number>(0);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const toast = useToast();

  useClickOutside(menuRef, () => {
    if (openMenuId) {
      setOpenMenuId(null);
    }
  });
  
  const fetchTrendingPodcasts = async (page: number, resetList: boolean = false) => {
    try {
      if (page === 0) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      const response = await getTrendingPodcast(page, 10);
      
      if (resetList) {
        setPodcasts(response.content);
      } else {
        setPodcasts((prevPodcasts) => [...prevPodcasts, ...response.content]);
      }
      
      setTotalPages(response.totalPages);
      setHasMore(page < response.totalPages - 1);
      setLoading(false);
      setLoadingMore(false);
    } catch (error) {
      setError('Failed to fetch trending podcasts');
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMorePodcasts = useCallback(() => {
    if (!loadingMore && hasMore) {
      setCurrentPage((prevPage) => {
        const nextPage = prevPage + 1;
        fetchTrendingPodcasts(nextPage);
        return nextPage;
      });
    }
  }, [loadingMore, hasMore]);

  // Initial load
  useEffect(() => {
    setPodcasts([]);
    setCurrentPage(0);
    setLoading(true);
    fetchTrendingPodcasts(0, true);
  }, []);

  // Setup intersection observer for infinite scroll
  useEffect(() => {
    // Disconnect previous observer if it exists
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    
    // Create new observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !loadingMore && !loading) {
          loadMorePodcasts();
        }
      },
      { threshold: 0.5 }
    );
    
    // Observe the loading element
    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMorePodcasts, hasMore, loadingMore, loading]);

  const toggleAddToPlaylistModal = (podcastId: string) => {
    setSelectedPodcastId(podcastId);
    setIsPlaylistModalOpen(!isPlaylistModalOpen);
    setOpenMenuId(null);
  };

  const toggleReportModal = (podcastId: string) => {
    setSelectedPodcastId(podcastId);
    setIsReportModalOpen(!isReportModalOpen);
    setOpenMenuId(null);
  };

  const toggleShareModal = (podcastId: string) => {
    setSelectedPodcastId(podcastId);
    setIsShareModalOpen(!isShareModalOpen);
    setOpenMenuId(null);
  };

  const toggleMenu = (podcastId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setOpenMenuId(openMenuId === podcastId ? null : podcastId);
  };

  const handlePodcastClick = (podcastId: string) => {
    navigate(`/watch?pid=${podcastId}`);
  };

  const onWatchLaterClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast.info("Coming soon!");
  }

  if (loading && podcasts.length === 0) {
    return (
      <div className="flex justify-center py-20">
        <FiLoader size={48} className="text-blue-500 animate-spin"/>
      </div>
    );
  }

  if (error && podcasts.length === 0) {
    return (
      <div className='text-black dark:text-white flex flex-col items-center justify-center py-20'>
        <img src="https://cdn.staticcrate.com/stock-hd/effects/footagecrate-red-error-icon@3X.png" alt="error" className="w-20 h-20 mb-4"/>
        <p>{error}</p>
      </div>
    );
  }

  // Help func
  const getRankStyles = (index: number) => {
    switch (index) {
      case 0: // 1st place
        return {
          badge: {
            className: "absolute -left-4 -top-4 w-10 h-10 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold shadow-lg border-2 border-yellow-300",
            text: "1"
          },
          card: "border-yellow-300 dark:border-yellow-700 shadow-md bg-gradient-to-r from-white to-yellow-200 dark:from-gray-800 dark:to-yellow-300/30"
        };
      case 1: // 2nd place
        return {
          badge: {
            className: "absolute -left-4 -top-4 w-9 h-9 bg-gray-400 text-white rounded-full flex items-center justify-center font-bold shadow-lg border-2 border-gray-300",
            text: "2"
          },
          card: "border-gray-300 dark:border-gray-600 shadow-md bg-gradient-to-r from-white to-slate-300 dark:from-gray-800 dark:to-slate-200/20"
        };
      case 2: // 3rd place
        return {
          badge: {
            className: "absolute -left-4 -top-4 w-9 h-9 bg-amber-700 text-white rounded-full flex items-center justify-center font-bold shadow-lg border-2 border-amber-600",
            text: "3"
          },
          card: "border-amber-200 dark:border-amber-900 shadow-md bg-gradient-to-r from-white to-orange-200 dark:from-gray-800 dark:to-orange-300/30"
        };
      default: // All others
        return {
          badge: {
            className: "absolute -left-4 -top-4 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold shadow-md",
            icon: null,
            text: (index + 1).toString()
          },
          card: "border-gray-100 dark:border-gray-700"
        };
    }
  };

  return (
    <div>
      <div className="space-y-6">
        {podcasts.map((podcast, index) => {
          const rankStyle = getRankStyles(index);
          
          return (
            <div 
              key={podcast.id}
              onClick={() => handlePodcastClick(podcast.id)}
              className={`flex flex-col md:flex-row items-start md:items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer border relative group ${rankStyle.card}`}
            >
              {/* Rank Badge - based on position */}
              <div className={rankStyle.badge.className}>
                {rankStyle.badge.text}
                {rankStyle.badge.icon}
              </div>
              
              {/* Thumbnail - add special effect for top 3 */}
              <div className={`relative w-full md:w-64 aspect-video rounded-lg overflow-hidden group-hover:shadow-md transition-all ${index < 3 ? 'ring-2 ring-offset-2 ' + (index === 0 ? 'ring-yellow-400' : index === 1 ? 'ring-gray-400' : 'ring-amber-600') : ''}`}>
                <img
                  src={podcast.thumbnailUrl || "https://img.freepik.com/free-photo/cement-texture_1194-6523.jpg?semt=ais_hybrid"}
                  alt={podcast.title}
                  className="w-full h-full object-cover"
                />
                
                {/* Special overlay effect for top 3 */}
                {index < 3 && (
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-yellow-500 to-transparent w-1/3 h-6 opacity-70"></div>
                )}
                
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <div className={`bg-white/90 p-3 rounded-full ${index < 3 ? 'shadow-lg' : ''}`}>
                    <FaPlay className={`${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-500' : index === 2 ? 'text-amber-700' : 'text-blue-600'} w-6 h-6`} />
                  </div>
                </div>
                
                <div className="flex absolute bottom-2 right-2 bg-black/70 text-white text-sm px-2 py-1 rounded">
                  <FaClock size={14} className='my-auto mr-1'/>
                  {formatTimeDuration(podcast.duration) || "10:00"}
                </div>
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Add a badge for top 3 */}
                {index < 3 && (
                  <div className={`inline-block px-2 py-1 rounded-full text-xs font-bold mb-2 ${
                    index === 0 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 shadow-md' : 
                    index === 1 ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 shadow-md' : 
                    'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 shadow-md'
                  }`}>
                    {index === 0 ? '🔥 Top Trending' : index === 1 ? '🔥 Highly Trending' : '🔥 Trending'}
                  </div>
                )}
                
                <h3 className={`text-lg font-bold text-black dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors ${index < 3 ? 'text-lg md:text-xl' : ''}`}>
                  {podcast.title}
                </h3>
                
                {/* Creator info */}
                <div className="flex items-center mt-1 mb-2">
                  <Avatar 
                    avatarUrl={podcast.user.avatarUrl || defaultAvatar} 
                    width="w-8" 
                    height="h-8" 
                    usedFrame={podcast.user.usedFrame}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/profile/${podcast.user.username}`);
                    }}
                  />
                  <span 
                    className="text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer ml-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/profile/${podcast.user.username}`);
                    }}
                  >
                    {podcast.user.fullname}
                  </span>
                  <BsDot className="text-gray-500" />
                  <span className="text-base text-gray-600 dark:text-gray-200 flex items-center">
                    <CgEyeAlt className="mr-1" />
                    {formatViewsToShortly(podcast.views)} views
                  </span>
                  <BsDot className="text-gray-500" />
                  <span className="text-base text-gray-600 dark:text-gray-200 flex items-center">
                    <BsClock className="mr-1" />
                    {formatDistanceToNow(new Date(podcast.createdDay), { addSuffix: true })}
                  </span>
                </div>
                
                {/* Description */}
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                  {podcast.content}
                </p>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {podcast.genres?.map(genre => (
                    <span 
                      key={genre.id}
                      className={`text-sm px-2 py-1 rounded-full ${
                        index < 3 
                          ? index === 0 
                            ? 'bg-yellow-100 text-yellow-900 dark:bg-yellow-900/30 dark:text-yellow-200 shadow-md' 
                            : index === 1 
                              ? 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 shadow-md' 
                              : 'bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200 shadow-md'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 shadow-md'
                      }`}
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Action buttons - rest remains the same */}
              <div className="flex md:flex-col items-center gap-2 relative">
                <Tooltip text="Add to Playlist">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleAddToPlaylistModal(podcast.id);
                    }}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                  >
                    <MdOutlinePlaylistAdd size={22} />
                  </button>
                </Tooltip>
                
                <Tooltip text="Share">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleShareModal(podcast.id);
                    }}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                  >
                    <MdShare size={20} />
                  </button>
                </Tooltip>
                
                <div className="relative">
                  <Tooltip text="More">
                    <button 
                      onClick={(e) => toggleMenu(podcast.id, e)}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                    >
                      <BsThreeDotsVertical size={20} />
                    </button>
                  </Tooltip>
                  
                  {openMenuId === podcast.id && (
                    <div ref={menuRef} className="absolute z-10 right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 border border-gray-200 dark:border-gray-700">
                      <button
                        className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleReportModal(podcast.id);
                        }}
                      >
                        <MdOutlineFlag className="mr-2" /> Report
                      </button>
                      <button
                        className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={(e) => onWatchLaterClick(e)}
                      >
                        <MdOutlineWatchLater className="mr-2" /> Watch Later
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* The rest of the component (loading indicators, modals) remains the same */}
      <div ref={loadMoreRef} className="py-10 flex justify-center">
        {loadingMore && (
          <div className="flex items-center">
            <FiLoader size={24} className="text-blue-500 animate-spin mr-2" />
            <span className="text-gray-600 dark:text-gray-300">Loading more podcasts...</span>
          </div>
        )}
        
        {!hasMore && podcasts.length > 0 && (
          <div className="text-gray-500 dark:text-gray-400 text-sm">
            You've reached the end of the list
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedPodcastId && (
        <>
          <AddToPlaylistModal
            isOpen={isPlaylistModalOpen}
            onClose={() => setIsPlaylistModalOpen(false)}
            podcastId={selectedPodcastId}
          />
          
          <ShareModal
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
            podcastLink={`${window.location.origin}/watch?pid=${selectedPodcastId}`}
          />
          
          <ReportModal
            isOpen={isReportModalOpen}
            onClose={() => setIsReportModalOpen(false)}
            targetId={selectedPodcastId}
            reportType={ReportType.P}
          />
        </>
      )}
    </div>
  );
};

export default TrendingList;