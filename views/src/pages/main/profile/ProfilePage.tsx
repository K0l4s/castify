import React, { useEffect, useState } from "react";
import ProfileMainContent from "../../../components/main/profile/ProfileMainContent";
import CustomButton from "../../../components/UI/custom/CustomButton";
import { Podcast } from "../../../models/PodcastModel";
import { getUserPodcasts } from "../../../services/PodcastService";
import { FiLoader } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import PodcastTag from "../../../components/UI/podcast/PodcastTag";
import { useToast } from "../../../context/ToastProvider";
import ShareModal from "../../../components/modals/podcast/ShareModal";
import ReportModal from "../../../components/modals/report/ReportModal";
import { ReportType } from "../../../models/Report";

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const queryParams = new URLSearchParams(location.search);
  const initialSortBy = queryParams.get("sortBy") as 'newest' | 'views' | 'oldest' || 'newest';

  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'newest' | 'views' | 'oldest'>(initialSortBy);

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedPodcastId, setSelectedPodcastId] = useState<string | null>(null);
  const [openOptionMenuId, setOpenOptionMenuId] = useState<string | null>(null);

  const username = location.pathname.split("/")[2];

  const fetchPodcasts = async (username: string, page: number, sortBy: 'newest' | 'views' | 'oldest') => {
    try {
      const response = await getUserPodcasts(username, page, 12, sortBy);
      setPodcasts((prevPodcasts) => {
        const newPodcasts = response.content.filter(
          (newPodcast) => !prevPodcasts.some((podcast) => podcast.id === newPodcast.id)
        );
        return [...prevPodcasts, ...newPodcasts];
      });
      setTotalPages(response.totalPages);
      setLoading(false);
    } catch (error) {
      setError("Failed to fetch users");
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchPodcasts(username, currentPage, sortBy);
  }, [currentPage, sortBy]);

  // Reset state when username changes
  useEffect(() => {
    setPodcasts([]);
    setCurrentPage(0);
    setTotalPages(0);
    setLoading(true);
    setError(null);
    fetchPodcasts(username, 0, sortBy);
  }, [username]);
  
  const loadMorePodcasts = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handleSortChange = (newSortBy: 'newest' | 'views' | 'oldest') => {
    if (sortBy === newSortBy) {
      fetchPodcasts(username, 0, newSortBy);
    } else {
      setSortBy(newSortBy);
      setCurrentPage(0);
      setPodcasts([]);
      navigate(`?sortBy=${newSortBy}`);
    }
  };

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

  if (loading && currentPage === 0) {
    return (
      <div className="min-h-screen">
        <div className="mx-auto flex justify-center ">
          <FiLoader size={48} className="text-black dark:text-white animate-spin"/>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <div className="mx-auto flex justify-center ">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto">
          <ProfileMainContent />
          {/* selection */}
          <div className="flex justify-center gap-4 mb-8 p-2 bg-white dark:bg-gray-800 backdrop-blur-sm rounded-3xl shadow-xl mt-5">
            <CustomButton variant={sortBy === 'newest' ? 'primary' : 'secondary'} onClick={() => handleSortChange('newest')}>Newest</CustomButton>
            <CustomButton variant={sortBy === 'views' ? 'primary' : 'secondary'} onClick={() => handleSortChange('views')}>Views</CustomButton>
            <CustomButton variant={sortBy === 'oldest' ? 'primary' : 'secondary'} onClick={() => handleSortChange('oldest')}>Oldest</CustomButton>
          </div>
          <div className="min-h-[80vh]">
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
      </div>
    </div>
  );
};

export default ProfilePage;
