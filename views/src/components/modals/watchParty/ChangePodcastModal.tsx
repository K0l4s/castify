import React, { useState, useEffect } from 'react';
import { FiLoader } from 'react-icons/fi';
import { Podcast } from '../../../models/PodcastModel';
import CustomButton from '../../UI/custom/CustomButton';
import CustomModal from '../../UI/custom/CustomModal';
import { useToast } from '../../../context/ToastProvider';
import { getPodcastPopular } from '../../../services/PodcastService';
import { formatViewsToShortly } from '../../../utils/formatViews';

interface ChangePodcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (podcastId: string) => void;
  currentPodcast: Podcast | null;
}

const ChangePodcastModal: React.FC<ChangePodcastModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  currentPodcast
}) => {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPodcast, setSelectedPodcast] = useState<Podcast | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  const toast = useToast();

  const loadPodcasts = async (page: number = 0) => {
    try {
      setLoading(true);
      const response = await getPodcastPopular(page, 12);
      
      if (page === 0) {
        setPodcasts(response.content);
      } else {
        setPodcasts(prev => [...prev, ...response.content]);
      }
      
      setCurrentPage(response.currentPage);
      setHasMore(response.currentPage < response.totalPages - 1);
    } catch (error) {
      console.error('Error loading podcasts:', error);
      toast.error('Failed to load podcasts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadPodcasts(0);
      setSelectedPodcast(null);
    }
  }, [isOpen]);

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      loadPodcasts(currentPage + 1);
    }
  };

  const handleConfirm = () => {
    if (!selectedPodcast) {
      toast.warning('Please select a podcast');
      return;
    }

    if (selectedPodcast.id === currentPodcast?.id) {
      toast.warning('This podcast is already playing');
      return;
    }

    onConfirm(selectedPodcast.id);
  };

  return (
    <CustomModal
      title="Change Podcast"
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      animation="zoom"
      className="max-h-[100vh]"
    >
      <div className="flex flex-col h-[85vh]"> 
        
        {/* Header Info - Không cuộn */}
        <div className="flex-shrink-0">
          {/* Current Podcast Info */}
          {currentPodcast && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg mb-3">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <strong>Currently playing:</strong> {currentPodcast.title}
              </p>
            </div>
          )}

          {/* Info Note */}
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg mb-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-300">
              <strong>Note:</strong> Showing popular podcasts. Search functionality will be available soon.
            </p>
          </div>
        </div>

        {/*  Scrollable Podcast List */}
        <div className="flex-1 overflow-y-auto pr-2 -mr-2"> {/* Padding cho scrollbar */}
          {loading && podcasts.length === 0 ? (
            <div className="flex justify-center py-8">
              <FiLoader className="animate-spin text-blue-500" size={32} />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {podcasts.map((podcast) => (
                  <div
                    key={podcast.id}
                    onClick={() => setSelectedPodcast(podcast)}
                    className={`cursor-pointer rounded-lg border-2 transition-all hover:shadow-lg ${
                      selectedPodcast?.id === podcast.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-md'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    } ${podcast.id === currentPodcast?.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="relative">
                      <img
                        src={podcast.thumbnailUrl || '/TEST.png'}
                        alt={podcast.title}
                        className="w-full h-28 object-cover rounded-t-lg"
                      />
                      {selectedPodcast?.id === podcast.id && (
                        <div className="absolute inset-0 bg-blue-500/20 rounded-t-lg flex items-center justify-center">
                          <div className="bg-blue-500 text-white p-2 rounded-full">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-2.5">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate mb-1 text-sm">
                        {podcast.title}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate mb-2">
                        by {podcast.user.fullname}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                            {formatViewsToShortly(podcast.views)}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                            </svg>
                            {podcast.totalLikes}
                          </span>
                        </div>
                        {podcast.id === currentPodcast?.id && (
                          <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-1.5 py-0.5 rounded-full font-medium"> {/* ✅ Giảm padding */}
                            Playing
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Load More */}
              {hasMore && podcasts.length > 0 && (
                <div className="text-center mt-4 pb-2">
                  <CustomButton
                    text={loading ? 'Loading...' : 'Load More'}
                    variant="outline"
                    onClick={handleLoadMore}
                    disabled={loading}
                    icon={loading ? <FiLoader className="animate-spin" /> : undefined}
                  />
                </div>
              )}
            </>
          )}

          {podcasts.length === 0 && !loading && (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-3">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-500 dark:text-gray-400">No podcasts found</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Try refreshing the page</p>
            </div>
          )}
        </div>

        <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
          <div className="flex justify-end gap-3">
            <CustomButton
              text="Cancel"
              variant="outline"
              onClick={onClose}
            />
            <CustomButton
              text="Change Podcast"
              variant="primary"
              onClick={handleConfirm}
              disabled={!selectedPodcast || selectedPodcast.id === currentPodcast?.id}
              icon={selectedPodcast ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              ) : undefined}
            />
          </div>
        </div>
      </div>
    </CustomModal>
  );
};

export default ChangePodcastModal;