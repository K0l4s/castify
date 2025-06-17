import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Genre } from '../../../models/GenreModel';
import { Podcast } from '../../../models/PodcastModel';
import { getPodcastsByGenre } from '../../../services/PodcastService';
import PodcastTag from '../../../components/UI/podcast/PodcastTag';
import { FaChevronLeft, FaChevronRight, FaHeart } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { FaSprayCanSparkles } from 'react-icons/fa6';
import "./podcastSection.css";
import { useLanguage } from '../../../context/LanguageContext';

interface PodcastSectionProps {
  title: string;
  genres: Genre[];
  type: 'favorites' | 'suggested';
  onReport: (podcastId: string) => void;
  onAddToPlaylist: (podcastId: string) => void;
  onShare: (podcastId: string, podcastTitle?: string) => void;
}

interface GenreLoadState {
  loaded: boolean;
  loading: boolean;
  podcasts: Podcast[];
  hasMore: boolean;
  page: number;
}

const PodcastSection: React.FC<PodcastSectionProps> = ({
  title,
  genres,
  type,
  onReport,
  onAddToPlaylist,
  onShare
}) => {
  const {language} = useLanguage();
  const [genreStates, setGenreStates] = useState<{ [key: string]: GenreLoadState }>({});
  const [scrollPositions, setScrollPositions] = useState<{ [key: string]: number }>({});
  // Sửa lỗi: unique option menu cho mỗi section và podcast
  const [optionMenuOpen, setOptionMenuOpen] = useState<string | null>(null);
  const observerRefs = useRef<{ [key: string]: IntersectionObserver }>({});
  const containerRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Initialize genre states
  useEffect(() => {
    const initialStates: { [key: string]: GenreLoadState } = {};
    genres.forEach(genre => {
      initialStates[genre.id] = {
        loaded: false,
        loading: false,
        podcasts: [],
        hasMore: true,
        page: 0
      };
    });
    setGenreStates(initialStates);
  }, [genres]);

  // Load podcasts for a specific genre
  const loadGenrePodcasts = useCallback(async (genreId: string, page: number = 0) => {
    setGenreStates(prev => ({
      ...prev,
      [genreId]: { ...prev[genreId], loading: true }
    }));

    try {
      const response = await getPodcastsByGenre(genreId, page, 6);
      
      setGenreStates(prev => ({
        ...prev,
        [genreId]: {
          ...prev[genreId],
          loaded: true,
          loading: false,
          podcasts: page === 0 ? response.content : [...prev[genreId].podcasts, ...response.content],
          hasMore: response.currentPage < response.totalPages - 1,
          page: page
        }
      }));
    } catch (error) {
      console.error(`Failed to load podcasts for genre ${genreId}:`, error);
      setGenreStates(prev => ({
        ...prev,
        [genreId]: { ...prev[genreId], loading: false, loaded: true, hasMore: false }
      }));
    }
  }, []);

  // Setup intersection observer for lazy loading
  useEffect(() => {
    genres.forEach(genre => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting && !genreStates[genre.id]?.loaded && !genreStates[genre.id]?.loading) {
              loadGenrePodcasts(genre.id, 0);
            }
          });
        },
        { 
          threshold: 0.1,
          rootMargin: '100px'
        }
      );

      observerRefs.current[genre.id] = observer;

      const container = containerRefs.current[genre.id];
      if (container) {
        observer.observe(container);
      }
    });

    return () => {
      Object.values(observerRefs.current).forEach(observer => {
        observer.disconnect();
      });
    };
  }, [genres, genreStates, loadGenrePodcasts]);

  const handleScroll = (genreId: string, direction: 'left' | 'right') => {
    const container = document.getElementById(`podcast-container-${type}-${genreId}`);
    if (container) {
      const scrollAmount = 420;
      const currentScroll = scrollPositions[genreId] || 0;
      const newScroll = direction === 'left' 
        ? Math.max(currentScroll - scrollAmount, 0)
        : currentScroll + scrollAmount;
      
      container.scrollTo({ left: newScroll, behavior: 'smooth' });
      setScrollPositions(prev => ({ ...prev, [genreId]: newScroll }));

      if (direction === 'right') {
        const state = genreStates[genreId];
        if (state && state.hasMore && !state.loading) {
          const scrollPercentage = (newScroll + container.clientWidth) / container.scrollWidth;
          if (scrollPercentage > 0.8) {
            loadGenrePodcasts(genreId, state.page + 1);
          }
        }
      }
    }
  };

  const handleToggleOptionMenu = (podcastId: string, genreId: string) => {
    const uniqueKey = `${type}-${genreId}-${podcastId}`;
    setOptionMenuOpen(optionMenuOpen === uniqueKey ? null : uniqueKey);
  };

  if (genres.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        {type === 'favorites' ? (
          <FaHeart className="text-2xl text-red-500" />
        ) : (
          <FaSprayCanSparkles className="text-2xl text-yellow-500" />
        )}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {title}
        </h1>
      </div>

      {/* Genres List */}
      <div className="space-y-10">
        {genres.map((genre) => {
          const genreState = genreStates[genre.id];
          
          return (
            <div 
              key={genre.id} 
              className="space-y-4"
              ref={(el) => containerRefs.current[genre.id] = el}
            >
              {/* Genre Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                    {genre.name}
                  </h2>
                </div>
                <Link 
                  to={`/genres/${genre.id}`}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-sm transition-colors"
                >
                  {language.common.viewAll || 'View All'}
                </Link>
              </div>

              {/* Loading State */}
              {genreState?.loading && !genreState?.loaded && (
                <div className="flex gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-96 h-80 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div>
                  ))}
                </div>
              )}

              {/* Podcasts Row */}
              {genreState?.podcasts && genreState.podcasts.length > 0 && (
                <div className="relative podcast-row-container">
                  <button
                    onClick={() => handleScroll(genre.id, 'left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 shadow-lg rounded-full p-3 opacity-0 row-nav-arrow transition-all duration-300 hover:scale-110 hover:shadow-xl -ml-4"
                  >
                    <FaChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>

                  <button
                    onClick={() => handleScroll(genre.id, 'right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 shadow-lg rounded-full p-3 opacity-0 row-nav-arrow transition-all duration-300 hover:scale-110 hover:shadow-xl -mr-4"
                  >
                    <FaChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>

                  {/* Podcasts Container */}
                  <div
                    id={`podcast-container-${type}-${genre.id}`}
                    className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4 px-4"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    {genreState.podcasts.map((podcast) => {
                      const uniqueKey = `${type}-${genre.id}-${podcast.id}`;
                      return (
                        <div key={uniqueKey} className="flex-shrink-0">
                          <PodcastTag
                            podcast={podcast}
                            onReport={() => onReport(podcast.id)}
                            onAddToPlaylist={() => onAddToPlaylist(podcast.id)}
                            onShare={() => onShare(podcast.id, podcast.title)}
                            onToggleOptionMenu={() => handleToggleOptionMenu(podcast.id, genre.id)}
                            isOptionMenuOpen={optionMenuOpen === uniqueKey}
                          />
                        </div>
                      );
                    })}
                    
                    {/* Loading more indicator */}
                    {genreState.loading && genreState.loaded && (
                      <div className="flex-shrink-0 w-96 h-80 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse flex items-center justify-center">
                        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {genreState?.loaded && genreState.podcasts.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No podcasts available in this genre yet.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PodcastSection;