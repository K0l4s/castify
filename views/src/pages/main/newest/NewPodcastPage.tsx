import React, { useEffect, useState, useRef, useCallback } from "react";
import { getPodcastRecent } from "../../../services/PodcastService";
import { Podcast } from "../../../models/PodcastModel";
import PodcastTag from "../../../components/UI/podcast/PodcastTag";
import PodcastListItem from "../../../components/UI/podcast/PodcastListItem";
import { FiLoader } from "react-icons/fi";
import ShareModal from "../../../components/modals/podcast/ShareModal";
import ReportModal from "../../../components/modals/report/ReportModal";
import { ReportType } from "../../../models/Report";
import AddToPlaylistModal from "../playlistPage/AddToPlaylistModal";
import { BsGrid3X3Gap, BsListUl } from "react-icons/bs";
import { useLanguage } from "../../../context/LanguageContext";

const NewestPodcastPage: React.FC = () => {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedPodcastId, setSelectedPodcastId] = useState<string | null>(null);
  const [openOptionMenuId, setOpenOptionMenuId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { language } = useLanguage();
  
  // Refs for infinite scrolling
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Fetch newest podcasts
  const fetchPodcasts = async (page: number) => {
    try {
      setLoadingMore(page > 0);
      
      const response = await getPodcastRecent(page, 12);
      
      setPodcasts((prevPodcasts) => {
        if (page === 0) return response.content;
        return [...prevPodcasts, ...response.content];
      });
      
      setTotalPages(response.totalPages);
      setLoading(false);
      setLoadingMore(false);
    } catch (error) {
      console.error('Error fetching newest podcasts:', error);
      setError('Failed to fetch newest podcasts');
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchPodcasts(0);
  }, []);

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
        fetchPodcasts(nextPage);
        return nextPage;
      });
    }
  }, [loadingMore, currentPage, totalPages]);

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

  // Loading state
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
    <div className="px-8 py-2">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-medium text-black dark:text-white">
          {language.newest.title}
        </h1>
        
        {/* View mode toggle */}
        <button 
          onClick={toggleViewMode}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          title={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
        >
          {viewMode === 'grid' ? (
            <BsListUl className="text-gray-700 dark:text-gray-300" size={20} />
          ) : (
            <BsGrid3X3Gap className="text-gray-700 dark:text-gray-300" size={20} />
          )}
        </button>
      </div>
      
      {/* Content Header */}
      <div className="mb-6">
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          {language.newest.description}
        </p>
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
            {language.newest.noResults}
          </h3>
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
        {!loadingMore && currentPage >= totalPages - 1 && podcasts.length > 0 && (
          <div className="text-gray-500 dark:text-gray-400 text-center py-4">
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

export default NewestPodcastPage;