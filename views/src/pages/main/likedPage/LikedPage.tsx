import React, { useEffect, useState, useRef, useCallback } from "react";
import { getLikedPodcasts, likePodcast } from "../../../services/PodcastService";
import { FiLoader } from "react-icons/fi";
import { useToast } from "../../../context/ToastProvider";
import { Podcast } from "../../../models/PodcastModel";
import { IoCloseOutline } from "react-icons/io5";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import PodcastLiked from "./PodcastLiked";
import { useLanguage } from "../../../context/LanguageContext";

const LikedPage: React.FC = () => {
  const {language} = useLanguage();
  const [likedPodcasts, setLikedPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredPodcasts, setFilteredPodcasts] = useState<Podcast[]>([]);

  // Ref for infinite scrolling
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const toast = useToast();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const fetchLikedPodcasts = async (pageNum: number) => {
    try {
      if (pageNum === 0) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      const response = await getLikedPodcasts(pageNum, 10);
      
      if (pageNum === 0) {
        setLikedPodcasts(response.content);
      } else {
        setLikedPodcasts(prev => [...prev, ...response.content]);
      }
      
      setTotalPages(response.totalPages);
      setLoading(false);
      setLoadingMore(false);
    } catch (error) {
      console.error("Error fetching liked podcasts:", error);
      setError("Failed to load liked podcasts");
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Load more podcasts callback for infinite scrolling
  const loadMorePodcasts = useCallback(() => {
    if (!loadingMore && page < totalPages - 1) {
      setPage(prevPage => prevPage + 1);
    }
  }, [loadingMore, page, totalPages]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchLikedPodcasts(page);
    } else {
      setLoading(false);
    }
  }, [page, isAuthenticated]);

  // Setup intersection observer for infinite scrolling
  useEffect(() => {
    // Disconnect previous observer if it exists
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    
    // Create new observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !loadingMore && page < totalPages - 1) {
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
  }, [loadMorePodcasts, loadingMore, page, totalPages]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredPodcasts(likedPodcasts);
    } else {
      const filtered = likedPodcasts.filter(podcast => 
        podcast.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        podcast.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPodcasts(filtered);
    }
  }, [searchTerm, likedPodcasts]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const handleUnlike = async (podcastId: string) => {
    try {
      await likePodcast(podcastId); // This toggles the like status
      
      // Update the liked status in the local state, but keep the podcast in the list
      setLikedPodcasts(prev => 
        prev.map(podcast => 
          podcast.id === podcastId 
            ? { ...podcast, liked: false } 
            : podcast
        )
      );
    } catch (error) {
      console.error("Error unliking podcast:", error);
      toast.error("Failed to unlike podcast");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-8 py-12">
        <img 
          src="https://cdn-icons-png.flaticon.com/512/1698/1698535.png" 
          alt="Login Required" 
          className="w-32 h-32 mb-6 opacity-60"
        />
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-3">Login Required</h2>
        <p className="text-gray-600 dark:text-gray-400 text-center max-w-md text-lg">
          Please login to see your liked podcasts
        </p>
      </div>
    );
  }

  if (loading && page === 0) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <FiLoader size={48} className="text-blue-500 animate-spin"/>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 flex flex-col lg:flex-row rounded-lg">
      <div className="w-full lg:w-1/4 lg:pl-4 mb-6 lg:mb-0 order-first lg:order-last">
        <div className="rounded-lg p-3 md:p-4 mb-4 bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg md:text-xl text-black dark:text-white font-semibold mb-2">{language.likedPodcast.searchLiked}</h2>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full p-2 text-sm md:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              placeholder={language.likedPodcast.searchPlaceholder || "Search liked podcasts..."}
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-2 top-2 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100"
              >
                <IoCloseOutline size={20} className="md:w-6 md:h-6" />
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="w-full lg:w-3/4 lg:pr-4">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 text-black dark:text-white">{language.likedPodcast.title || "Liked Podcasts"}</h1>
        {error && (
          <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 p-4 rounded-lg mb-4">
            {error}
          </div>
        )}
        
        {filteredPodcasts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-gray-50 dark:bg-gray-800/30 rounded-xl">
            <img 
              src="https://cdn-icons-png.flaticon.com/512/7518/7518748.png" 
              alt="No liked podcasts" 
              className="w-32 h-32 mb-6 opacity-60"
            />
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-3">
              {language.likedPodcast.noResults}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
              {searchTerm ? language.likedPodcast.noResults : language.likedPodcast.noLikedYet}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPodcasts.map(podcast => (
              <PodcastLiked
                key={podcast.id}
                podcast={podcast}
                onUnlike={() => handleUnlike(podcast.id)}
              />
            ))}
          </div>
        )}
        
        {/* Infinite scroll loading indicator */}
        <div ref={loadMoreRef} className="h-24 flex items-center justify-center mt-6">
          {loadingMore && (
            <div className="flex items-center justify-center">
              <FiLoader size={30} className="text-blue-500 animate-spin mr-3" />
              <span className="text-gray-600 dark:text-gray-300">Loading more...</span>
            </div>
          )}
          
          {!loadingMore && page >= totalPages - 1 && filteredPodcasts.length > 0 && (
            <div className="text-gray-500 dark:text-gray-400 text-sm bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm">
              You've reached the end of your liked podcasts
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LikedPage;