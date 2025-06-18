// import PodcastPlayer from "../../../components/UI/podcast/PodcastPlayer";
// import { useEffect, useState } from "react";
// import { getGenres } from "../../../services/GenreService";
// import { useLocation, useNavigate } from "react-router-dom";
import TrendingCarousel from "./TrendingCarousel";
import SEO from "../../../context/SEO";
// import { useLanguage } from "../../../context/LanguageContext";
// import en from "../../../locales/en.json";
import { CardItem } from "./CardItem";
import SuggestFollow from "./SuggestFollow";
import TopGenresSection from "./TopGenresSection";
import IntroVideoPage from "./IntroVideoPage";
import { useDocumentTitle } from "../../../hooks/useDocumentTitle";
import GenresPodcastList from "./GenresPodcastList";
import { ReportType } from "../../../models/Report";
import {  useState } from "react";
import ReportModal from "../../../components/modals/report/ReportModal";
import ShareModal from "../../../components/modals/podcast/ShareModal";
import AddToPlaylistModal from "../playlistPage/AddToPlaylistModal";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { useToast } from "../../../context/ToastProvider";
// import FancyCard from "../../../components/UI/custom/FancyCard";

const LandingPage = () => {
  // const navigate = useNavigate();
  useDocumentTitle(null, 'Castify - Chill with your audience');
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  // const { language } = useLanguage();
  const toast = useToast();

  // Modal states
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

  // Current selected podcast for actions
  const [, setSelectedPodcast] = useState<{
    id: string;
    title?: string;
  } | null>(null);

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

  // Close modal handlers
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

  <SEO
    title="Castify - Homepage"
    description="Discover the latest and most popular podcasts on Castify. Explore a wide range of genres and find your next favorite show."
    robots="index, follow"
    keywords={"podcast, user profile, social media, "}
    canonical={window.location.href}
    // image={user.avatarUrl || defaultAvatar}
    jsonLd={{
      "@context": "https://schema.org",
      "@type": "User Profile",
      name: "Castify",
      description: "Discover the latest and most popular podcasts on Castify. Explore a wide range of genres and find your next favorite show.",
      url: window.location.href,
    }}
    alternateHrefs={[
      {
        href: window.location.href + "?lang=en",
        hrefLang: "en",
      },
      {
        href: window.location.href + "?lang=vi",
        hrefLang: "vi",
      },
    ]}
  />
  return (
    <>
    <div className="px-8 py-4">
      <IntroVideoPage />
      {/* New Trending Carousel */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 mb-4">
        <TrendingCarousel />
        <div className="flex flex-col items-center justify-center gap-4 w-full md:w-2/5 mx-auto">
          <CardItem
            title="WATCH PARTY"
            subtitle="Vui hơn khi xem nhóm!"
            label="WATCH PARTY"
            image="https://tascam.com/wp-content/uploads/images/products/_tascam/mixcast_4/mixcast_4_w_4_people.jpg"
            linkText="Learn more"
            linkTo="/browse-rooms"
          />
          <CardItem
            title="NHẬP MÃ CHAOHE2025"
            subtitle="SALE 25% Tất cả frame trong cửa hàng"
            label="Flash Deal"
            image="https://t3.ftcdn.net/jpg/13/61/25/40/360_F_1361254042_KOrLQuvUncyIW8PT4RpZaaEgCqOBcSrP.jpg"
            linkText="Shop Now"
            linkTo="/shop"
          />
        </div>
      </div>
      <SuggestFollow />
      
      {/* Top Genres Section */}
      <TopGenresSection />

      {/* Podcast Sections */}
      <div className="px-8 py-4">
        <GenresPodcastList
          onReport={handleReport}
          onAddToPlaylist={handleAddToPlaylist}
          onShare={handleShare}
        />
      </div>
    </div>

    {/* Modals */}
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
  )
}

export default LandingPage
