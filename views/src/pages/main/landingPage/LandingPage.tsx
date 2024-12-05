
// import PodcastPlayer from "../../../components/UI/podcast/PodcastPlayer";
import { useEffect, useState } from "react";
import RecentPodcast from "./RecentPodcast";
import { getGenres } from "../../../services/GenreService";
import TabNavigation from "./TabNavigation";
import GenresPodcast from "./GenresPodcast";
import ReportModal from "../../../components/modals/report/ReportModal";
import { ReportType } from "../../../models/Report";

const LandingPage = () => {
  const [selectedTab, setSelectedTab] = useState('Recent');
  const [genres, setGenres] = useState<{ id: string; name: string }[]>([]);
  
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

  const renderContent = () => {
    switch (selectedTab) {
      case 'Popular':
        return <RecentPodcast />;
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
      <TabNavigation selectedTab={selectedTab} onSelectTab={setSelectedTab} genres={genres} />
      {/* Content */}
      <div className="m-auto">
        {renderContent()}
      </div>
      {/* <PodcastPlayer
        isPlaying={false}
        currentTime={0}
        duration={0}
        title="Test"
        author="Test"
        thumbnailUrl="https://tenten.vn/tin-tuc/wp-content/uploads/2023/08/podcast-la-gi-2.jpg"
        onPlay={() => { }}
        onPause={() => { }}
        onSeek={() => { }}
        onForward={() => { }}
        onBackward={() => { }}
      /> */}
    </div>
  )
}

export default LandingPage
