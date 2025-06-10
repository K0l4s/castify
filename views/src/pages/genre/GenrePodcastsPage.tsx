import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPodcastsByGenre } from '../../services/PodcastService';
import { Podcast } from '../../models/PodcastModel';
import { Genre } from '../../models/GenreModel';
import PodcastTag from '../../components/UI/podcast/PodcastTag';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { FaSpinner } from 'react-icons/fa';
import { RiImageAddLine } from 'react-icons/ri';
import ReportModal from '../../components/modals/report/ReportModal';
import ShareModal from '../../components/modals/podcast/ShareModal';
import AddToPlaylistModal from '../main/playlistPage/AddToPlaylistModal';
import { ReportType } from '../../models/Report';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { useToast } from '../../context/ToastProvider';
import { getGenreById } from '../../services/GenreService';
import { useLanguage } from '../../context/LanguageContext';

const PAGE_SIZE = 8;

const GenrePodcastsPage = () => {
  const { genreId } = useParams<{ genreId: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const {language} = useLanguage();
  // Data states
  const [genre, setGenre] = useState<Genre | null>(null);
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [, setTotalPodcasts] = useState(0);

  // Modal states - Tách riêng như LandingPage
  const [reportModal, setReportModal] = useState({
    isOpen: false,
    targetId: '',
    reportType: ReportType.P
  });
  
  const [shareModal, setShareModal] = useState({
    isOpen: false,
    podcastLink: ''
  });
  
  const [playlistModal, setPlaylistModal] = useState({
    isOpen: false,
    podcastId: ''
  });

  const [optionMenuOpen, setOptionMenuOpen] = useState<string | null>(null);

  // Current selected podcast for actions
  const [, setSelectedPodcast] = useState<{
    id: string;
    title?: string;
  } | null>(null);

  // Intersection Observer for infinite scroll
  const observerTarget = useRef<HTMLDivElement>(null);

  useDocumentTitle(genre?.name ? `${genre.name} Podcasts` : 'Genre Podcasts', 'Castify');

  // Fetch genre details
  useEffect(() => {
    const fetchGenre = async () => {
      if (!genreId) return;
      
      try {
        const genreData = await getGenreById(genreId);
        setGenre(genreData);
      } catch (error) {
        console.error('Failed to fetch genre:', error);
        toast.error('Failed to load genre information');
      }
    };

    fetchGenre();
  }, [genreId, toast]);

  // Fetch podcasts
  const fetchPodcasts = useCallback(async (pageNum: number, isLoadMore = false) => {
    if (!genreId) return;
    
    if (!isLoadMore) {
      setInitialLoading(true);
    } else {
      setLoading(true);
    }

    try {
      const res = await getPodcastsByGenre(genreId, pageNum, PAGE_SIZE);
      
      if (isLoadMore) {
        setPodcasts(prev => [...prev, ...res.content]);
      } else {
        setPodcasts(res.content);
      }
      
      setPage(res.currentPage);
      setHasMore(res.currentPage < res.totalPages - 1);
      setTotalPodcasts(res.totalPages * PAGE_SIZE);
    } catch (error) {
      console.error('Failed to fetch podcasts:', error);
      if (!isLoadMore) {
        setPodcasts([]);
      }
      // toast.error('Failed to load podcasts'); // REMOVE
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [genreId]);

  // Initial load
  useEffect(() => {
    if (genreId) {
      setPodcasts([]);
      setPage(0);
      setHasMore(true);
      fetchPodcasts(0, false);
    }
  }, [genreId, fetchPodcasts]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !initialLoading) {
          fetchPodcasts(page + 1, true);
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [fetchPodcasts, hasMore, loading, initialLoading, page]);

  // Modal handlers - Pattern giống LandingPage
  const handleReport = (podcastId: string) => {
    if (!isAuthenticated) {
      toast.warning("Please log in to do this action.");
      return;
    }
    setSelectedPodcast({ id: podcastId });
    setReportModal({
      isOpen: true,
      targetId: podcastId,
      reportType: ReportType.P
    });
  };

  const handleAddToPlaylist = (podcastId: string) => {
    if (!isAuthenticated) {
      toast.warning("Please log in to do this action.");
      return;
    }
    setSelectedPodcast({ id: podcastId });
    setPlaylistModal({
      isOpen: true,
      podcastId: podcastId
    });
  };

  const handleShare = (podcastId: string, podcastTitle?: string) => {
    setSelectedPodcast({ id: podcastId, title: podcastTitle });
    const podcastLink = `${window.location.origin}/watch?pid=${podcastId}`;
    setShareModal({
      isOpen: true,
      podcastLink: podcastLink
    });
  };

  const handleToggleOptionMenu = useCallback((podcastId: string) => {
    setOptionMenuOpen(prev => prev === podcastId ? null : podcastId);
  }, []);

  // Close modal handlers - Pattern giống LandingPage
  const closeReportModal = () => {
    setReportModal({
      isOpen: false,
      targetId: '',
      reportType: ReportType.P
    });
    setSelectedPodcast(null);
  };

  const closeShareModal = () => {
    setShareModal({
      isOpen: false,
      podcastLink: ''
    });
    setSelectedPodcast(null);
  };

  const closePlaylistModal = () => {
    setPlaylistModal({
      isOpen: false,
      podcastId: ''
    });
    setSelectedPodcast(null);
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading genre podcasts...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="lg:ml-10 min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Header Section */}
        <div className="relative overflow-hidden">
          {/* Background with genre color */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{ 
              background: genre?.color 
                ? `linear-gradient(135deg, ${genre.color}, ${genre.color}80)` 
                : 'linear-gradient(135deg, #3B82F6, #1E40AF)'
            }}
          />
          
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>

          <div className="relative container mx-auto px-6 py-16">

            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Genre Image */}
              <div className="relative">
                <div className="w-48 h-48 rounded-3xl overflow-hidden shadow-2xl ring-8 ring-white/20 dark:ring-gray-800/20">
                  {genre?.imageUrl ? (
                    <img
                      src={genre.imageUrl}
                      alt={genre.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div 
                      className="w-full h-full flex items-center justify-center"
                      style={{ 
                        backgroundColor: genre?.color || '#3B82F6',
                        color: genre?.textColor || '#ffffff'
                      }}
                    >
                      <RiImageAddLine className="w-16 h-16 opacity-60" />
                    </div>
                  )}
                </div>
                
                {/* Floating decoration */}
                <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-yellow-400 opacity-80 animate-pulse"></div>
                <div className="absolute -bottom-2 -left-2 w-8 h-8 rounded-full bg-blue-500 opacity-60 animate-bounce"></div>
              </div>

              {/* Genre Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="mb-4">
                  <span className="inline-block px-4 py-2 bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 border border-white/30 dark:border-gray-700/30">
                    {language.genrePodcast.title || 'Genre'}
                  </span>
                </div>
                
                <h1 
                  className="text-5xl md:text-6xl font-black mb-4 leading-tight"
                  style={{ 
                    color: genre?.textColor || 'inherit',
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  {genre?.name || 'Unknown Genre'}
                </h1>
                
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-6 max-w-4xl">
                  {language.genrePodcast.description || `Discover amazing podcasts in the ${genre?.name} category.`} {genre?.name}
                </p>

                {/* Stats */}
                <div className="flex flex-wrap gap-6 justify-center md:justify-start">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {podcasts.length}{hasMore ? '+' : ''}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Podcasts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {podcasts.reduce((acc, p) => acc + p.views, 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{language.genrePodcast.totalViews}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="container mx-auto px-6 py-12">
          {podcasts.length === 0 && !initialLoading ? (
            // Empty State
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="text-6xl mb-6">🎧</div>
                <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-4">
                  {language.genrePodcast.noPodcastYet || 'No Podcasts Found'}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-8">
                  {language.genrePodcast.noPodcastYetDescription || "This genre doesn't have any podcasts yet. Be the first to create one!"}
                </p>
                <button 
                  onClick={() => navigate('/creator/contents')}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  {language.genrePodcast.createPodcast || 'Create Podcast'}
                </button>
              </div>
            </div>
          ) : (
            // Podcasts Grid
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {language.genrePodcast.allPodcasts || 'All Podcasts'}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                {podcasts.map((podcast, index) => (
                  <div key={`${podcast.id}-${index}`} className="flex-shrink-0">
                    <PodcastTag
                      podcast={podcast}
                      onReport={() => handleReport(podcast.id)}
                      onAddToPlaylist={() => handleAddToPlaylist(podcast.id)}
                      onShare={() => handleShare(podcast.id, podcast.title)}
                      onToggleOptionMenu={() => handleToggleOptionMenu(podcast.id)}
                      isOptionMenuOpen={optionMenuOpen === podcast.id}
                    />
                  </div>
                ))}
              </div>

              {/* Loading More Indicator */}
              {loading && (
                <div className="flex justify-center items-center py-12">
                  <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                    <FaSpinner className="animate-spin" />
                    <span>Loading more podcasts...</span>
                  </div>
                </div>
              )}

              {/* Intersection Observer Target */}
              <div ref={observerTarget} className="h-20" />

              {/* End of Content */}
              {!hasMore && podcasts.length > 0 && (
                <div className="text-center py-12">
                  <div className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400">
                    <span>You've reached the end of this genre!</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals - Pattern giống LandingPage */}
      <ReportModal
        isOpen={reportModal.isOpen}
        onClose={closeReportModal}
        targetId={reportModal.targetId}
        reportType={reportModal.reportType}
      />

      <ShareModal
        isOpen={shareModal.isOpen}
        onClose={closeShareModal}
        podcastLink={shareModal.podcastLink}
      />

      <AddToPlaylistModal
        isOpen={playlistModal.isOpen}
        onClose={closePlaylistModal}
        podcastId={playlistModal.podcastId}
      />
    </>
  );
};

export default GenrePodcastsPage;