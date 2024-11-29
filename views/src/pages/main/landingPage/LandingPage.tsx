
import PodcastPlayer from "../../../components/UI/podcast/PodcastPlayer";
import RecentPodcast from "./RecentPodcast";

const LandingPage = () => {

  return (
    <div className="px-8 py-4">
      {/* Recent Podcasts */}
      <div className="m-auto">
        <RecentPodcast />
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
