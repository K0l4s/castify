import React, { useEffect, useRef, useState } from "react";
import { getSuggestedPodcastsByGenres } from "../../../services/PodcastService";
import { Podcast } from "../../../models/PodcastModel";
import CustomButton from "../custom/CustomButton";
import { FiLoader } from "react-icons/fi";
import PodcastTag from "./PodcastTag";
import { getGenresByList } from "../../../services/GenreService";
import { IoChevronBackOutline, IoChevronForwardOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../../context/ToastProvider";
import ShareModal from "../../modals/podcast/ShareModal";
import ReportModal from "../../modals/report/ReportModal";
import { ReportType } from "../../../models/Report";
import AddToPlaylistModal from "../../../pages/main/playlistPage/AddToPlaylistModal";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { useLanguage } from "../../../context/LanguageContext";

interface SuggestedPodcastProps {
  genreIds: string[];
  currentPodcastId: string;
}

const SuggestedPodcast: React.FC<SuggestedPodcastProps> = ({ genreIds, currentPodcastId }) => {
  const {language} = useLanguage();
  const [suggestedPodcasts, setSuggestedPodcasts] = useState<Podcast[]>([]);
  const [genres, setGenres] = useState<{ id: string; name: string }[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const genreContainerRef = useRef<HTMLDivElement>(null);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedPodcastId, setSelectedPodcastId] = useState<string | null>(null);
  const [openOptionMenuId, setOpenOptionMenuId] = useState<string | null>(null);
  const toast = useToast();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const data = await getGenresByList(genreIds);
        setGenres(data);
      } catch (error) {
        console.error("Error fetching genres:", error);
      }
    };

    fetchGenres();
  }, [genreIds]);

  useEffect(() => {
    const fetchSuggestedPodcasts = async () => {
      try {
        setLoading(true);
        const suggestedData = await getSuggestedPodcastsByGenres(currentPodcastId, genreIds, page, 5);
        setSuggestedPodcasts((prev) => [...prev, ...suggestedData.content]);
        setHasMore(suggestedData.content.length > 0 && (page + 1) < suggestedData.totalPages);
      } catch (error) {
        console.error("Error fetching suggested podcasts:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSuggestedPodcasts();
  }, [page, currentPodcastId]);

  useEffect(() => {
    setSuggestedPodcasts([]);
    setPage(0);
    setHasMore(true);
  }, [currentPodcastId]);

  const handleLoadMore = () => {
    if (hasMore) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const scrollLeft = () => {
    if (genreContainerRef.current) {
      genreContainerRef.current.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (genreContainerRef.current) {
      genreContainerRef.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  const handleGenreClick = (genreId: string) => {
    navigate(`/genres/${encodeURIComponent(genreId)}`);
  };

  const toggleAddToPlaylistModal = (podcastId: string) => {
    if (!isAuthenticated) {
      toast.warning("Please login to do this action");
      return;
    }
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

  return (
    <div className="w-full mt-8 lg:mt-0">
      <h2 className="text-xl font-semibold mb-4">{language.suggestedPodcasts.title || "Suggested for You"}</h2>
      <div className="relative mb-4">
        <button
          className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-300 dark:bg-gray-700 p-2 rounded-full
            hover:opacity-90 transition duration-200"
          onClick={scrollLeft}
        >
          <IoChevronBackOutline />
        </button>
        <div
          ref={genreContainerRef}
          className="flex overflow-x-auto space-x-2 mx-10 scrollbar-hide"
        >
          {genres.map((genre) => (
            <button
              key={genre.id}
              onClick={() => handleGenreClick(genre.id)}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-black dark:text-white rounded-full whitespace-nowrap
                hover:bg-gray-400 hover:dark:bg-gray-700 transition duration-200"
            >
              {genre.name}
            </button>
          ))}
        </div>
        <button
          className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-300 dark:bg-gray-700 p-2 rounded-full
            hover:opacity-90 transition duration-200"
          onClick={scrollRight}
        >
          <IoChevronForwardOutline />
        </button>
      </div>
      {suggestedPodcasts.map((suggested) => (
        <PodcastTag 
          key={suggested.id}
          podcast={suggested}
          onReport={() => toggleReportModal(suggested.id)}
          onAddToPlaylist={() => toggleAddToPlaylistModal(suggested.id)}
          onShare={() => toggleShareModal(suggested.id)}
          onToggleOptionMenu={toggleOptionMenu}
          isOptionMenuOpen={openOptionMenuId === suggested.id}
        />
      ))}
      {loading && (
        <div className="text-center my-4">
          <FiLoader size={24} className="animate-spin" />
        </div>
      )}
      {hasMore && !loading && (
        <div className="text-center my-4">
          <CustomButton text={language.common.loadMore || "Load More"} onClick={handleLoadMore} />
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

export default SuggestedPodcast;