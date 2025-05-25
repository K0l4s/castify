
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
// import FancyCard from "../../../components/UI/custom/FancyCard";

const LandingPage = () => {
  const [selectedTab, setSelectedTab] = useState('Popular');
  const [genres, setGenres] = useState<{ id: string; name: string }[]>([]);
  const navigate = useNavigate();
  const location = useLocation();

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
  const {language} = useLanguage();
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
      {/* New Trending Carousel */}
      <TrendingCarousel />

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
