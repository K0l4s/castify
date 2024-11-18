
import Popover from "../../../components/UI/custom/Popover";
import PodcastPlayer from "../../../components/UI/podcast/PodcastPlayer";
import { useToast } from "../../../context/ToastProvider";

const LandingPage = () => {

  const toast = useToast();

  return (
    <div>
      <div>
      </div>
      <Popover buttonLabel="Click me">
        <p>This is the content inside the popover.</p>
      </Popover>
      <button onClick={() => toast.success("Hello")}>Click me</button>
      <PodcastPlayer
        isPlaying={false}
        currentTime={0}
        duration={0}
        title="Test"
        author="Test"
        thumbnailUrl="https://tenten.vn/tin-tuc/wp-content/uploads/2023/08/podcast-la-gi-2.jpg"
        onPlay={() => {}}
        onPause={() => {}}
        onSeek={() => {}}
        onForward={() => {}}
        onBackward={() => {}}
      />
    </div>
  )
}

export default LandingPage
