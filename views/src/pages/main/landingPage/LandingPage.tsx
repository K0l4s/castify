
import Podcast from "../../../components/UI/podcast/Podcast";
import videodemo from "../../../assets/videos/15283210-hd_1080_1920_30fps.mp4"
import Popover from "../../../components/UI/custom/Popover";
import CustomTable from "../../../components/UI/custom/CustomTable";
import CustomSearchbar from "../../../components/UI/custom/CustomSearchbar";
import PodcastCard from "../../../components/UI/podcast/PodcastCard";
import ThemeModeSwitch from "../../../components/UI/custom/ThemeModeSwitch";

const LandingPage = () => {



  return (
    <div>
      <div>
      </div>
      <Popover buttonLabel="Click me">
        <p>This is the content inside the popover.</p>
      </Popover>
      <div className="grid grid-cols-1 grid-rows-1 gap-10">
        <Podcast
          videoSrc="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"
          avatarSrc=""
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
          avatarSrc=""
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
      <CustomTable headers={["Name", "Email", "Role"]}>
        <tr>
          <td>1</td>
        </tr>
      </CustomTable>
      <CustomSearchbar
        placeholder="Search..."
        onSearch={(searchTerm: string) => console.log(searchTerm)}
        className="w-full"
      />
      {/* podcast card */}
      <PodcastCard
        title="Ngày hôm ấy - Phần 1"
        author="Huỳnh Trung Kiên"
        thumbnailUrl="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTaodZfdcYV-SP7udI-4QuPqbf_-8jVskzYn5ZOVqjjgbkGhdEToHgJ-ypof4UWEd4YMqU&usqp=CAU"
        duration="10:00"
        description="Ngày hôm ấy tôi đi trong mưa, có nhớ phút giây yếu đuối không ngờ #viral #castify #modify #topten #year2024"
        viewCount={1000}
        isNew={true}
        onClick={() => {
          console.log("clicked");
        }}
      />
      <ThemeModeSwitch />
    </div>
  )
}

export default LandingPage
