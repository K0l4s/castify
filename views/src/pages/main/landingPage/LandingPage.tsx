
import Podcast from "../../../components/UI/podcast/Podcast";
import videodemo from "../../../assets/videos/15283210-hd_1080_1920_30fps.mp4"
import Popover from "../../../components/UI/custom/Popover";
import CustomTable from "../../../components/UI/custom/CustomTable";
import CustomSearchbar from "../../../components/UI/custom/CustomSearchbar";

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
    </div>
  ) 
}

export default LandingPage
