import React, { useEffect, useState, useRef, useCallback } from "react";
import { getFollowingPodcast, getFollowingPodcastByUsername } from "../../../services/PodcastService";
import { userService } from "../../../services/UserService";
import { Podcast } from "../../../models/PodcastModel";
import PodcastTag from "../../../components/UI/podcast/PodcastTag";
import PodcastListItem from "../../../components/UI/podcast/PodcastListItem";
import { FiLoader } from "react-icons/fi";
import ShareModal from "../../../components/modals/podcast/ShareModal";
import ReportModal from "../../../components/modals/report/ReportModal";
import { ReportType } from "../../../models/Report";
import AddToPlaylistModal from "../playlistPage/AddToPlaylistModal";
import Avatar from "../../../components/UI/user/Avatar";
import defaultAvatar from "../../../assets/images/default_avatar.jpg";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { BsGrid3X3Gap, BsListUl } from "react-icons/bs";
// import { useToast } from "../../../context/ToastProvider";

interface FollowedUser {
  id: string;
  fullname: string;
  username: string;
  avatarUrl: string | null;
  usedFrame: any | null;
  totalFollower: number;
  totalFollowing: number;
  totalPost: number;
  follow: boolean;
}

const FollowingPage: React.FC = () => {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [followingUsers, setFollowingUsers] = useState<FollowedUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedPodcastId, setSelectedPodcastId] = useState<string | null>(null);
  const [openOptionMenuId, setOpenOptionMenuId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [activeUser, setActiveUser] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(activeUser ? 'list' : 'grid');
  
  // Refs for infinite scrolling
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // const toast = useToast();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  // Fetch following podcasts
  const fetchPodcasts = async (page: number, username: string | null = null) => {
    try {
      setLoadingMore(page > 0);
      
      let response;
      if (username) {
        response = await getFollowingPodcastByUsername(username, page, 10);
      } else {
        response = await getFollowingPodcast(page, 10);
      }
      
      setPodcasts((prevPodcasts) => {
        if (page === 0) return response.content;
        return [...prevPodcasts, ...response.content];
      });
      
      setTotalPages(response.totalPages);
      setLoading(false);
      setLoadingMore(false);
    } catch (error) {
      console.error('Error fetching podcasts:', error);
      setError('Failed to fetch podcasts from users you follow');
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Fetch following users
  const fetchFollowingUsers = async () => {
    if (!isAuthenticated || !currentUser) {
      setLoadingUsers(false);
      return;
    }
    
    try {
      const response = await userService.getFollowings(currentUser.username, 0, 20);
      setFollowingUsers(response.data.data);
      setLoadingUsers(false);
    } catch (error) {
      console.error('Error fetching following users:', error);
      setLoadingUsers(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchFollowingUsers();
    fetchPodcasts(0, activeUser);
  }, []);

  // Reload podcasts when active user changes
  useEffect(() => {
    setPodcasts([]);
    setCurrentPage(0);
    setTotalPages(0);
    setLoading(true);
    fetchPodcasts(0, activeUser);
    
    // Set view mode based on active user
    setViewMode(activeUser ? 'list' : 'grid');
  }, [activeUser]);

  // Setup intersection observer for infinite scrolling
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !loadingMore && currentPage < totalPages - 1) {
          loadMorePodcasts();
        }
      },
      { threshold: 0.5 }
    );
    
    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadingMore, currentPage, totalPages]);

  // Handlers
  const loadMorePodcasts = useCallback(() => {
    if (!loadingMore && currentPage < totalPages - 1) {
      setCurrentPage((prevPage) => {
        const nextPage = prevPage + 1;
        fetchPodcasts(nextPage, activeUser);
        return nextPage;
      });
    }
  }, [loadingMore, currentPage, totalPages, activeUser]);

  const handleUserClick = (username: string | null) => {
    if (activeUser === username) return;
    setActiveUser(username);
  };

  const toggleAddToPlaylistModal = (podcastId: string) => {
    setSelectedPodcastId(podcastId);
    setIsPlaylistModalOpen(!isPlaylistModalOpen);
  };

  const toggleReportModal = (podcastId: string) => {
    setSelectedPodcastId(podcastId);
    setIsReportModalOpen(!isReportModalOpen);
  };

  const toggleShareModal = (podcastId: string) => {
    setSelectedPodcastId(podcastId);
    setIsShareModalOpen(!isShareModalOpen);
  };

  const toggleOptionMenu = (podcastId: string) => {
    setOpenOptionMenuId(openOptionMenuId === podcastId ? null : podcastId);
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === 'grid' ? 'list' : 'grid');
  };

  // Handle not authenticated case
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-8 py-4">
        <img 
          src="https://cdn-icons-png.flaticon.com/512/1698/1698535.png" 
          alt="Login Required" 
          className="w-32 h-32 mb-4 opacity-60"
        />
        <h2 className="text-2xl font-medium text-gray-700 dark:text-gray-300 mb-2">Login Required</h2>
        <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
          Please login to see podcasts from users you follow
        </p>
      </div>
    );
  }

  // Loading states
  if (loading && !podcasts.length) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] px-8 py-4">
        <FiLoader size={48} className="text-blue-500 animate-spin"/>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-8 py-4">
        <img 
          src="https://cdn.staticcrate.com/stock-hd/effects/footagecrate-red-error-icon@3X.png" 
          alt="error" 
          className="w-20 h-20 mb-4"
        />
        <p className="text-red-500 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="px-8 py-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-medium text-black dark:text-white">Following Feed</h1>
        
        {/* View mode toggle - only show when not in specific user view */}
        {activeUser === null && (
          <button 
            onClick={toggleViewMode}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            {viewMode === 'grid' ? (
              <BsListUl className="text-gray-700 dark:text-gray-300" size={20} />
            ) : (
              <BsGrid3X3Gap className="text-gray-700 dark:text-gray-300" size={20} />
            )}
          </button>
        )}
      </div>
      
      {/* Following Users Row */}
      <div className="mb-4 overflow-x-auto pb-4">
        <div className="flex space-x-4 min-w-max p-2">
          {/* All option */}
          <div 
            onClick={() => handleUserClick(null)}
            className={`flex flex-col items-center cursor-pointer transition-all ${
              activeUser === null ? 'transform scale-110' : 'opacity-80 hover:opacity-100'
            }`}
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 ${
              activeUser === null 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}>
              <span className="text-lg font-bold">All</span>
            </div>
            <span className="text-sm text-gray-700 dark:text-gray-300 text-center max-w-[80px] truncate">
              All
            </span>
          </div>
          
          {/* User avatars */}
          {loadingUsers ? (
            Array(5).fill(0).map((_, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-gray-300 dark:bg-gray-700 animate-pulse mb-2"></div>
                <div className="w-16 h-3 bg-gray-300 dark:bg-gray-700 animate-pulse rounded"></div>
              </div>
            ))
          ) : followingUsers.length === 0 ? (
            <div className="flex items-center justify-center min-w-[200px]">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                You're not following anyone yet
              </p>
            </div>
          ) : (
            followingUsers.map(user => (
              <div 
                key={user.id}
                onClick={() => handleUserClick(user.username)}
                className={`flex flex-col items-center cursor-pointer transition-all ${
                  activeUser === user.username ? 'transform scale-110' : 'opacity-80 hover:opacity-100'
                }`}
              >
                <div className={`relative w-16 h-16 mb-2 ${
                  activeUser === user.username ? 'ring-2 ring-blue-500 rounded-full' : ''
                }`}>
                  <Avatar
                    avatarUrl={user.avatarUrl || defaultAvatar}
                    width="w-16" 
                    height="h-16"
                    usedFrame={user.usedFrame}
                    alt={user.username}
                  />
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300 text-center max-w-[80px] truncate">
                  {user.fullname}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Content Header */}
      <div className="mb-6">
        <h2 className="text-xl font-medium text-black dark:text-white">
          {activeUser 
            ? `Latest from ${followingUsers.find(u => u.username === activeUser)?.fullname || activeUser}`
            : 'Latest from everyone you follow'
          }
        </h2>
      </div>
      
      {/* Podcasts */}
      {podcasts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <img 
            src="https://cdn-icons-png.flaticon.com/512/7486/7486744.png" 
            alt="No podcasts found" 
            className="w-32 h-32 mb-4 opacity-60"
          />
          <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
            No podcasts found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
            {activeUser 
              ? "This user hasn't uploaded any podcasts yet"
              : "Users you follow haven't uploaded any podcasts yet"
            }
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        // Grid View
        <div className="flex flex-wrap gap-6">
          {podcasts.map((podcast) => (
            <PodcastTag 
              key={podcast.id}
              podcast={podcast}
              onReport={() => toggleReportModal(podcast.id)}
              onAddToPlaylist={() => toggleAddToPlaylistModal(podcast.id)}
              onShare={() => toggleShareModal(podcast.id)}
              onToggleOptionMenu={toggleOptionMenu}
              isOptionMenuOpen={openOptionMenuId === podcast.id}
            />
          ))}
        </div>
      ) : (
        // List View
        <div className="space-y-4">
          {podcasts.map((podcast) => (
            <PodcastListItem 
              key={podcast.id}
              podcast={podcast}
              onReport={() => toggleReportModal(podcast.id)}
              onAddToPlaylist={() => toggleAddToPlaylistModal(podcast.id)}
              onShare={() => toggleShareModal(podcast.id)}
              onToggleOptionMenu={toggleOptionMenu}
              isOptionMenuOpen={openOptionMenuId === podcast.id}
            />
          ))}
        </div>
      )}
      
      {/* Infinite scroll loading indicator */}
      <div ref={loadMoreRef} className="h-20 flex items-center justify-center mt-6">
        {loadingMore && (
          <div className="flex items-center justify-center">
            <FiLoader size={30} className="text-blue-500 animate-spin mr-3" />
            <span className="text-gray-600 dark:text-gray-300">Loading more...</span>
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

export default FollowingPage;