import React, { useEffect, useState } from 'react';
import { getPodcastsByGenre } from '../../../services/PodcastService';
import { Podcast } from '../../../models/PodcastModel';
import PodcastTag from '../../../components/UI/podcast/PodcastTag';
import { FiLoader } from 'react-icons/fi';
import ShareModal from '../../../components/modals/podcast/ShareModal';
import ReportModal from '../../../components/modals/report/ReportModal';
import { ReportType } from '../../../models/Report';
import { useToast } from '../../../context/ToastProvider';
import CustomButton from '../../../components/UI/custom/CustomButton';

interface GenresPodcastProps {
  genreId: string;
}

const GenresPodcast: React.FC<GenresPodcastProps> = ({ genreId }) => {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedPodcastId, setSelectedPodcastId] = useState<string | null>(null);
  const [openOptionMenuId, setOpenOptionMenuId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const toast = useToast();

  const fetchPodcastsByGenre = async (genreId: string, page: number) => {
    setLoading(true);
    try {
      const response = await getPodcastsByGenre(genreId, page, 20);
      setPodcasts((prevPodcasts) => {
        const newPodcasts = response.content.filter(
          (newPodcast) => !prevPodcasts.some((podcast) => podcast.id === newPodcast.id)
        );
        return [...prevPodcasts, ...newPodcasts];
      });
      setTotalPages(response.totalPages);
      setLoading(false);
    } catch (error) {
      setError('Failed to fetch podcasts');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPodcastsByGenre(genreId, 0);
  }, [genreId]);

  // Reset state when genreId changes
  useEffect(() => {
    setPodcasts([]);
    setCurrentPage(0);
    setTotalPages(0);
    setLoading(true);
    setError(null);
    fetchPodcastsByGenre(genreId, 0);
  }, [genreId]);

  const handleSave = () => {
    toast.info("Save feature is coming soon");
  }

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
        fetchPodcastsByGenre(genreId, nextPage);
        return nextPage;
      });
    }
  };

  if (loading && currentPage === 0) {
    return <div className="flex justify-center items-center h-screen">
      <FiLoader size={48} className="text-black dark:text-white animate-spin"/>
    </div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen">
      <p className='text-xl text-red-700 dark:text-red-400'>{error}</p>
    </div>;
  }

  return (
    <div className="genres-podcast">
      <div className="flex flex-wrap 
       gap-6">
        {podcasts.map((podcast) => (
          <PodcastTag 
            key={podcast.id}
            podcast={podcast}
            onReport={() => toggleReportModal(podcast.id)}
            onSave={handleSave}
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

export default GenresPodcast;