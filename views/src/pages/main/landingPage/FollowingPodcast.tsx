import React, { useEffect, useState } from 'react';
import { getFollowingPodcast } from '../../../services/PodcastService';
import { Podcast } from '../../../models/PodcastModel';
import PodcastTag from '../../../components/UI/podcast/PodcastTag';
import { FiLoader } from 'react-icons/fi';
import { useToast } from '../../../context/ToastProvider';
import ShareModal from '../../../components/modals/podcast/ShareModal';
import ReportModal from '../../../components/modals/report/ReportModal';
import { ReportType } from '../../../models/Report';

const FollowingPodcast: React.FC = () => {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedPodcastId, setSelectedPodcastId] = useState<string | null>(null);
  const [openOptionMenuId, setOpenOptionMenuId] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    const fetchFollowingPodcasts = async () => {
      try {
        const response = await getFollowingPodcast(0, 20);
        setPodcasts(response.content);
        setLoading(false);
      } catch (error) {
        setError('Failed to fetch recent podcasts');
        setLoading(false);
      }
    };

    fetchFollowingPodcasts();
  }, []);

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


  if (loading) {
    return <div className="flex justify-center h-screen"><FiLoader size={48} className="text-black dark:text-white animate-spin"/></div>;
  }

  if (error) {
    return <div className='text-black dark:text-white flex justify-center'>{error}</div>;
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

export default FollowingPodcast;