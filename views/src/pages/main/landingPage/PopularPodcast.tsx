import React, { useEffect, useState } from 'react';
import { getPodcastPopular } from '../../../services/PodcastService';
import { Podcast } from '../../../models/PodcastModel';
import PodcastTag from '../../../components/UI/podcast/PodcastTag';
import { FiLoader } from 'react-icons/fi';
// import { useToast } from '../../../context/ToastProvider';
import ShareModal from '../../../components/modals/podcast/ShareModal';
import ReportModal from '../../../components/modals/report/ReportModal';
import { ReportType } from '../../../models/Report';
import CustomButton from '../../../components/UI/custom/CustomButton';
import AddToPlaylistModal from '../playlistPage/AddToPlaylistModal';

const PopularPodcast: React.FC = () => {
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
  // const toast = useToast();

  const fetchPopularPodcasts = async (page: number) => {
    try {
      const response = await getPodcastPopular(page, 20);
      setPodcasts((prevPodcasts) => [...prevPodcasts, ...response.content]);
      setTotalPages(response.totalPages);
      setLoading(false);
    } catch (error) {
      setError('Failed to fetch recent podcasts');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPopularPodcasts(0);
  }, []);

  const toggleAddToPlaylistModal = (podcastId: string) => {
    setSelectedPodcastId(podcastId);
    setIsPlaylistModalOpen(!isPlaylistModalOpen);
  };
  
  const toggleReportModal = (podcastId: string) => {
    setSelectedPodcastId(podcastId);
    setIsReportModalOpen(!isReportModalOpen);
  }

  const toggleShareModal = (podcastId: string) => {
    setSelectedPodcastId(podcastId);
    setIsShareModalOpen(!isShareModalOpen);
  }

  const toggleOptionMenu = (podcastId: string) => {
    setOpenOptionMenuId(openOptionMenuId === podcastId ? null : podcastId);
  }

  const loadMorePodcasts = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((prevPage) => {
        const nextPage = prevPage + 1;
        fetchPopularPodcasts(nextPage);
        return nextPage;
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center h-screen"><FiLoader size={48} className="text-black dark:text-white animate-spin"/></div>;
  }

  if (error) {
    return <div className='text-black dark:text-white flex justify-center'>{error}</div>;
  }

  return (
    <div>
      {/* grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 */}
      <div className="
      flex flex-wrap 
       gap-6">
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
      
      {currentPage < totalPages - 1 && (
        <div className="flex justify-center mt-8">
          <CustomButton onClick={loadMorePodcasts} variant="primary">
            Load More
          </CustomButton>
        </div>
      )}
      
      {/* Add to Playlist Modal */}
      {selectedPodcastId && (
        <AddToPlaylistModal
          isOpen={isPlaylistModalOpen}
          onClose={() => setIsPlaylistModalOpen(false)}
          podcastId={selectedPodcastId}
        />
      )}

      {/* Share Modal */}
      {selectedPodcastId && (
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          podcastLink={`${window.location.origin}/watch?pid=${selectedPodcastId}`}
        />
      )}

      {/* Report Modal */}
      {selectedPodcastId && (
        <ReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          targetId={selectedPodcastId}
          reportType={ReportType.P}
        />
      )}
    </div>
  );
};

export default PopularPodcast;