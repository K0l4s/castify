import Popover from "../../../components/UI/custom/Popover"
import Podcast from "../../../components/UI/podcast/Podcast";
import { useToast } from "../../../hooks/ToastProvider";



const LandingPage = () => {
  const { addToast } = useToast();

  const handleShowToast = () => {
    addToast('This is a toast notification!', 3000, 'info');
  };

  const handleShowSuccessToast = () => {
    addToast('Success! Operation completed.', 3000, 'success');
  };

  const handleShowErrorToast = () => {
    addToast('Error! Something went wrong.', 3000, 'error');
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
    </div>
      <Popover buttonLabel="Click me">
        <p>This is the content inside the popover.</p>
      </Popover>
      <Podcast
        videoSrc="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"
        avatarSrc="/path/to/avatar.png"
        title="Ngày hôm ấy - Phần 1"
        author="Huỳnh Trung Kiên"
        voteCount={55}
        dislikeCount={27}
        commentCount={33}
        shareCount={55}
        description="Ngày hôm ấy tôi đi trong mưa, có nhớ phút giây yếu đuối không ngờ #viral #castify #modify #topten #year2024"
      />
      <Podcast
        videoSrc="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4"
        avatarSrc="/path/to/avatar.png"
        title="Ngày hôm ấy - Phần 1"
        author="Huỳnh Trung Kiên"
        voteCount={55}
        dislikeCount={27}
        commentCount={33}
        shareCount={55}
        description="Ngày hôm ấy tôi đi trong mưa, có nhớ phút giây yếu đuối không ngờ #viral #castify #modify #topten #year2024"
      />
    </div>
  ) 
}

export default LandingPage