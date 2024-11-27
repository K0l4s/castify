
import UserInforCard from "../../../components/main/profile/UserInforCard";
import PodcastPlayer from "../../../components/UI/podcast/PodcastPlayer";

const LandingPage = () => {

  return (
    <div>
      <div>
        <h1 className="text-xl text-center mb-3">Have a nice day!</h1>
      </div>
      {/* for 1 -> 5 */}
      <div className="m-auto">
        <h1 className="text-xl text-center font-bold mb-3">Suggested Follow</h1>
        <div className="grid grid-cols-1 xl:grid-cols-4 md:grid-cols-1 gap-1 max-w-6xl m-auto">
          {Array.from({ length: 4 }).map((_, index) => (
            <UserInforCard key={index} />
          ))}
        </div>
      </div>
      <PodcastPlayer
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
      />
    </div>
  )
}

export default LandingPage
