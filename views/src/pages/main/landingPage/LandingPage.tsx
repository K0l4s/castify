
// import PodcastPlayer from "../../../components/UI/podcast/PodcastPlayer";
import { useEffect, useState } from "react";
import RecentPodcast from "./RecentPodcast";
import { getGenres } from "../../../services/GenreService";
import TabNavigation from "./TabNavigation";
import GenresPodcast from "./GenresPodcast";
import { useLocation, useNavigate } from "react-router-dom";
import PopularPodcast from "./PopularPodcast";
import FancyCard from "../../../components/UI/custom/FancyCard";
import { FaGlobe } from "react-icons/fa";

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

  const handleTabSelect = (tab: string) => {
    setSelectedTab(tab);
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
  return (
    <div className="px-8 py-4">
      
      {/* Tab Navigation */}
      <TabNavigation selectedTab={selectedTab} onSelectTab={handleTabSelect} genres={genres} />
      {/* Content */}
      <div className="m-auto">
        {renderContent()}
      </div>
      <FancyCard
        title="WEB DESIGNING"
        icon={<FaGlobe />}
        number={1963}
        cornorColor="bg-red-900"
        color="bg-gradient-to-t from-red-700 to-red-500" // Change to your desired color
      />
    </div>
  )
}

export default LandingPage
