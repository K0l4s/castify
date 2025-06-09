
// import PodcastPlayer from "../../../components/UI/podcast/PodcastPlayer";
import { useEffect, useState } from "react";
import RecentPodcast from "./RecentPodcast";
import { getGenres } from "../../../services/GenreService";
import TabNavigation from "./TabNavigation";
import GenresPodcast from "./GenresPodcast";
import { useLocation, useNavigate } from "react-router-dom";
import PopularPodcast from "./PopularPodcast";
import TrendingCarousel from "./TrendingCarousel";
import SEO from "../../../context/SEO";
import { useLanguage } from "../../../context/LanguageContext";
import en from "../../../locales/en.json";
import { CardItem } from "./CardItem";
import SuggestFollow from "./SuggestFollow";
import IntroVideoPage from "./IntroVideoPage";
import { useDocumentTitle } from "../../../hooks/useDocumentTitle";
// import FancyCard from "../../../components/UI/custom/FancyCard";

const LandingPage = () => {
  const [selectedTab, setSelectedTab] = useState('Popular');
  const [genres, setGenres] = useState<{ id: string; name: string }[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  useDocumentTitle(null, 'Castify - Chill with your audience');
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await getGenres();
        setGenres(response);
      } catch (error) {
        console.error('Failed to fetch genres:', error);
      }
    };

    fetchGenres();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab) {
      setSelectedTab(decodeURIComponent(tab));
    }
  }, [location.search]);
  const { language } = useLanguage();
  const handleTabSelect = (tab: string) => {
    setSelectedTab(tab);
    if (tab === language.tabNav.popular) {
      navigate(`?tab=${(en.tabNav.popular)}`);
    }
    else if (tab === language.tabNav.recent) {
      navigate(`?tab=${(en.tabNav.recent)}`);
    }
    // console.log('Selected tab:', tab);
    else
      navigate(`?tab=${encodeURIComponent(tab)}`);
  };

  const renderContent = () => {
    switch (selectedTab) {
      case 'Popular':
        return <PopularPodcast />;
      case 'Recent':
        return <RecentPodcast />;
      default:
        const selectedGenre = genres.find((genre) => genre.name === selectedTab);
        return selectedGenre ? <GenresPodcast genreId={selectedGenre.id} /> : <RecentPodcast />;
    }
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
    <div className="px-8 py-4">
      <IntroVideoPage />
      {/* New Trending Carousel */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 mb-4">
        <TrendingCarousel />
        <div className="flex flex-col items-center justify-center gap-4 w-full md:w-2/5 mx-auto">
          <CardItem
            title="VUI HƠN"
            subtitle="Khi xem nhóm cùng WATCH PARTY!"
            label="WATCH PARTY"
            image="https://png.pngtree.com/png-vector/20220709/ourmid/pngtree-friends-watching-movie-together-flat-illustration-png-image_5838894.png"
            linkText="Learn more"
            linkTo="/browse-rooms"
          />
          <CardItem
            title="NHẬP MÃ CHAOHE2025"
            subtitle="SALE 25% Tất cả frame trong cửa hàng"
            label="Flash Deal"
            image="https://cdn-icons-png.flaticon.com/512/3523/3523935.png"
            linkText="Shop Now"
            linkTo="/shop"
          />
        </div>
      </div>
      <SuggestFollow />
      {/* Tab Navigation */}
      <TabNavigation selectedTab={selectedTab} onSelectTab={handleTabSelect} genres={genres} />
      {/* Content */}
      <div className="m-auto">
        {renderContent()}
      </div>
    </div>
  )
}

export default LandingPage
