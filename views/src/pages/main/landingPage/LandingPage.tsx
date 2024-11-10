
import Podcast from "../../../components/UI/podcast/Podcast";
import videodemo from "../../../assets/videos/15283210-hd_1080_1920_30fps.mp4"
import { useToast } from "../../../context/ToastProvider";
import Popover from "../../../components/UI/custom/Popover";

const LandingPage = () => {
  const toast = useToast();
  const handleShowToast = () => {
    toast.addToast("This is an info toast", 3000, "info");
  };
  const handleShowSuccessToast = () => {
    toast.addToast("This is a success toast", 3000, "success");
  };
  const handleShowErrorToast = () => {
    toast.addToast("This is an error toast", 3000, "error");
  };
  const handleShowWarningToast = () => {
    toast.addToast("This is a warning toast", 3000, "warning");
  };
  const handleShowLoadingToast = () => {
    toast.addToast("This is a loading toast", 3000, "loading");
  };

  return (
    <div>
      <div>
      <button
        onClick={handleShowToast}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 mr-2"
      >
        Show Info Toast
      </button>
      <button
        onClick={handleShowSuccessToast}
        className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 mr-2"
      >
        Show Success Toast
      </button>
      <button
        onClick={handleShowErrorToast}
        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
      >
        Show Error Toast
      </button>
      <button
        onClick={handleShowWarningToast}
        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
      >
        Show Error Toast
      </button>
      <button
        onClick={handleShowLoadingToast}
        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
      >
        Show Error Toast
      </button>
    </div>
      <Popover buttonLabel="Click me">
        <p>This is the content inside the popover.</p>
      </Popover>
      <div className="grid grid-cols-1 grid-rows-1 gap-10">
      <Podcast
        videoSrc="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"
        avatarSrc="/path/to/avatar.png"
        title="Ngày hôm ấy - Phần 1"
        author="Huỳnh Trung Kiên"
        voteCount={55}
        dislikeCount={27}
        commentCount={33}
        isLiked={false}
        likedType="none"
        shareCount={55}
        description="Ngày hôm ấy tôi đi trong mưa, có nhớ phút giây yếu đuối không ngờ #viral #castify #modify #topten #year2024"
      />
      <Podcast
        videoSrc={videodemo}
        avatarSrc="/path/to/avatar.png"
        title="Ngày hôm ấy - Phần 1"
        author="Huỳnh Trung Kiên"
        voteCount={55}
        isLiked={false}
        likedType="none"
        dislikeCount={27}
        commentCount={33}
        shareCount={55}
        description="Ngày hôm ấy tôi đi trong mưa, có nhớ phút giây yếu đuối không ngờ #viral #castify #modify #topten #year2024"
      />
      </div>
    </div>
  ) 
}

export default LandingPage