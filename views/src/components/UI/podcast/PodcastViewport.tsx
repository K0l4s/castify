import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getPodcastByAnonymous, getPodcastById, incrementPodcastViews, likePodcast } from "../../../services/PodcastService";
import { Podcast } from "../../../models/PodcastModel";
import defaultAvatar from "../../../assets/images/default_avatar.jpg";
import CustomButton from "../custom/CustomButton";
import { HeartIcon } from "../custom/SVG_Icon";
import { FaEye, FaFlag, FaShareAlt, FaUsers } from "react-icons/fa";
import { TfiMoreAlt } from "react-icons/tfi";
import CommentSection from "./CommentSection";
import Tooltip from "../custom/Tooltip";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { useToast } from "../../../context/ToastProvider";
import { formatDistanceToNow } from 'date-fns';
import { setupVideoViewTracking } from "./video";
import { userService } from "../../../services/UserService";
import { FiLoader } from "react-icons/fi";
import SuggestedPodcast from "./SuggestedPodcast";
import ReportModal from "../../modals/report/ReportModal";
import { ReportType } from "../../../models/Report";
import ShareModal from "../../modals/podcast/ShareModal";
import { formatViewsWithSeparators } from "../../../utils/formatViews";
import { MdLockPerson } from "react-icons/md";
import CustomPodcastVideo from "./CustomPodcastVideo";
import Avatar from "../user/Avatar";
import PlaylistSidebar from "../../../pages/main/playlistPage/PlaylistSidebar";
import { useDocumentTitle } from "../../../hooks/useDocumentTitle";
import CounterAnimation from "../custom/animations/CounterAnimation";
import AddToPlaylistModal from "../../../pages/main/playlistPage/AddToPlaylistModal";
import { useTrackPodcastProgress } from "../../../hooks/useTrackPodcastProgress";
import { BaseApi } from "../../../utils/axiosInstance";
import { useLanguage } from "../../../context/LanguageContext";
// import { BsClockHistory } from "react-icons/bs";
import { RiPlayListAddFill } from "react-icons/ri";

const PodcastViewport: React.FC = () => {
  const { language } = useLanguage();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const id = queryParams.get("pid") as string | "";
  const playlistId = queryParams.get("playlist");
  const userId = useSelector((state: RootState) => state.auth.user?.id) as string | "";

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!id || !userId) return; // Ensure id and userId are available
      const video = document.getElementById('custom-podcast-video') as HTMLVideoElement | null;
      const currentTime = video?.currentTime ?? 0;
      // Use the correct server URL (should be https and with //)
      const url = BaseApi + '/api/v1/tracking';
      // sendBeacon requires a Blob or ArrayBuffer, not a string
      const data = JSON.stringify({
        podcastId: id,
        pauseTime: currentTime,
        userId: userId,
      });
      const blob = new Blob([data], { type: 'application/json' });
      navigator.sendBeacon(url, blob);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [id, userId]);
  useTrackPodcastProgress({ podcastId: id, userId });
  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [showDescToggle, setShowDescToggle] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [errorRes, setErrorRes] = useState<string | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const [views, setViews] = useState<number>(0);
  const [totalLikes, setTotalLikes] = useState<number>(0);
  const [liked, setLiked] = useState<boolean>(false);
  const [follow, setFollow] = useState<boolean>(false);
  const [totalFollower, setTotalFollower] = useState<number>(0);

  const descriptionRef = useRef<HTMLPreElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const podcastLink = `${window.location.origin}/watch?pid=${id}`;

  const [selectedPodcastId, setSelectedPodcastId] = useState<string | null>(null);

  const userRedux = useSelector((state: RootState) => state.auth.user);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const toast = useToast();
  const navigate = useNavigate();

  useDocumentTitle(
    podcast ? `${podcast?.title} - ${podcast?.user.fullname} | Castify` : null,
  );
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchPodcastData = useCallback(async () => {
    try {
      if (id) {
        let podcastData;
        if (isAuthenticated) {
          podcastData = await getPodcastById(id);
        } else {
          podcastData = await getPodcastByAnonymous(id);
        }
        setPodcast(podcastData);
        setViews(podcastData.views);
        setTotalLikes(podcastData.totalLikes);
        setLiked(podcastData.liked);
        setFollow(podcastData.user.follow);
        setTotalFollower(podcastData.user.totalFollower);
      }
    } catch (error) {
      if ((error as any).response?.data === "Error: Podcast not found") {
        setErrorRes("Podcast not found");
      } else {
        console.error("Error fetching podcast:", error);
        setErrorRes("An error occurred while fetching the podcast");
      }
    }
  }, [id, isAuthenticated]);

  useEffect(() => {
    const fetchPodcast = async () => {
      try {
        if (id) {
          let podcastData;
          if (isAuthenticated) {
            podcastData = await getPodcastById(id);
          } else {
            podcastData = await getPodcastByAnonymous(id);
          }
          setPodcast(podcastData);
          setViews(podcastData.views);
          setTotalLikes(podcastData.totalLikes);
          setLiked(podcastData.liked);
          setFollow(podcastData.user.follow);
          setTotalFollower(podcastData.user.totalFollower);
        }
      } catch (error) {
        if ((error as any).response?.data === "Error: Podcast not found") {
          setErrorRes("Podcast not found");
        } else {
          console.error("Error fetching podcast:", error);
          setErrorRes("An error occurred while fetching the podcast");
        }
      }
    };

    // Goi api sau khi check auth 1s
    fetchPodcast();

  }, [id, isAuthenticated]);

  // increment podcast views
  useEffect(() => {
    if (videoRef.current) {
      const cleanup = setupVideoViewTracking(
        videoRef.current,
        incrementPodcastViews,
        id!,
        handleViewIncrement
      );
      return cleanup;
    }
  }, [id, isAuthenticated, podcast]);

  const handleViewIncrement = () => {
    // Immediately update the UI by incrementing views
    setViews(prevViews => prevViews + 1);
  };

  // Add the "cronjob" to refresh data every 30 seconds
  useEffect(() => {
    // Start the refresh interval
    refreshIntervalRef.current = setInterval(() => {
      fetchPodcastData();
      console.log("Refreshing podcast data..."); // For debugging
    }, 30000); // 30 seconds

    // Clean up on component unmount
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [fetchPodcastData]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.src = podcast?.videoUrl || "";

      videoRef.current.load();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [podcast?.videoUrl]);

  useEffect(() => {
    if (descriptionRef.current) {
      const lineHeight = parseInt(window.getComputedStyle(descriptionRef.current).lineHeight, 10);
      const lines = descriptionRef.current.scrollHeight / lineHeight;
      setShowDescToggle(lines > 5);
    }
  }, [podcast?.content]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!(target as Element).closest(".podcast-options")) {
        setShowOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const memoizedGenreIds = useMemo(() => podcast?.genres?.map((genre) => genre.id) || [], [podcast?.genres]);

  if (errorRes) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{errorRes}</h1>
          <CustomButton text="Go back" onClick={() => navigate("/")} variant="primary" />
        </div>
      </div>
    );
  }

  if (!podcast) {
    return <div className="flex justify-center items-center h-screen">
      <FiLoader size={48} className="text-black dark:text-white animate-spin" />
    </div>;
  }

  const toggleDescription = () => {
    setIsDescriptionExpanded(!isDescriptionExpanded);
  };

  const handleLike = async (podcastId: string) => {
    if (!isAuthenticated) {
      toast.warning("Please login to do this action");
      return;
    }
    try {
      await likePodcast(podcastId);
      const updatedPodcast = await getPodcastById(podcastId);
      setTotalLikes(updatedPodcast.totalLikes);
      setLiked(updatedPodcast.liked);
      setViews(updatedPodcast.views);
    } catch (error) {
      console.error("Error liking podcast:", error);
    }
  };

  const handleFollow = async (targetUsername: string) => {
    if (!isAuthenticated) {
      toast.warning("Please login to do this action");
      return;
    }
    try {
      await userService.followUser(targetUsername);
      const updatedPodcast = await getPodcastById(id!);
      setFollow(updatedPodcast.user.follow);
      setTotalFollower(updatedPodcast.user.totalFollower);
      setViews(updatedPodcast.views);
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  const toggleShareModal = () => {
    setIsShareModalOpen(!isShareModalOpen);
  };

  const toggleReportModal = () => {
    if (!isAuthenticated) {
      toast.warning("Please login to report this podcast");
      return;
    }
    setIsReportModalOpen(!isReportModalOpen);
  };

  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };

  const handleEdit = () => {
    navigate(`/creator/podcast/${id}`);
  };

  // const handleSave = () => {
  //   toast.info("Save feature is coming soon");
  // };

  const toggleAddToPlaylistModal = (podcastId: string) => {
    setSelectedPodcastId(podcastId);
    setIsPlaylistModalOpen(!isPlaylistModalOpen);
  };

  // const userInfo = podcast?.user.lastName + " " + podcast?.user.middleName + " " +podcast?.user.firstName;
  const userInfo = podcast?.user.fullname;

  // Handle the next podcast navigation in playlist
  const handleNextPodcast = (nextPodcastId: string) => {
    // Navigate to the next podcast while maintaining the playlist parameter
    navigate(`/watch?pid=${nextPodcastId}&playlist=${playlistId}`);
  };

  // const userId = useSelector((state: RootState) => state.auth.user?.id);




  return (
    <div className="flex flex-col lg:flex-row p-4 lg:p-8 bg-white text-black dark:bg-gray-900 dark:text-white">
      <div className="flex-1 lg:max-w-[70%] lg:mr-8">
        {/* <video ref={videoRef} autoPlay className="w-full mb-4 rounded-lg" controls poster={podcast.thumbnailUrl || "/TEST.png"}>
          <source src={podcast.videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video> */}
        <CustomPodcastVideo podcastId={podcast.id} user={podcast.user} title={podcast.title} videoRef={videoRef} videoSrc={podcast.videoUrl} posterSrc={podcast.thumbnailUrl || "/TEST.png"}
          solutionModelList={podcast.solutionModelList} />

        {!podcast.active && (
          <div className="mt-4">
            <span className="font-medium py-2 px-4 rounded-full bg-gray-800 dark:bg-gray-700 text-white">
              <MdLockPerson className="mb-1 mr-1 inline-block" />
              Private
            </span>
          </div>
        )}
        <h1 className="text-2xl font-bold my-2">{podcast.title}</h1>

        {/* Info */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-2 my-4 gap-3">
          <div className="flex items-center gap-3">
            {/* <img 
              src={podcast.user.avatarUrl || defaultAvatar} 
              alt="avatar" 
              className="w-10 h-10 rounded-full cursor-pointer" 
              onClick={() => navigate(`/profile/${podcast.username}`)}
            /> */}
            <Avatar
              width='w-10'
              height='h-10'
              avatarUrl={podcast.user.avatarUrl || defaultAvatar}
              usedFrame={podcast.user.usedFrame}
              onClick={() => navigate(`/profile/${podcast.username}`)}
            />
            <div className="flex flex-col">
              <span
                className="text-base font-medium text-black dark:text-white cursor-pointer"
                onClick={() => navigate(`/profile/${podcast.username}`)}>
                {userInfo}
              </span>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {totalFollower} {language.common.followers}
              </span>
            </div>
            {podcast.user.id !== userRedux?.id ? (
              <CustomButton
                text={`${follow ? language.common.unfollow : language.common.follow} `}
                variant="ghost"
                rounded="full"
                onClick={() => handleFollow(podcast.user.username)}
                className={`bg-gray-600 hover:bg-gray-500 
                  ${!follow ? "bg-gray-800 text-white hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-800 hover:dark:bg-gray-400"
                    : "text-black bg-white border border-black hover:bg-gray-800 hover:text-white dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white"}`}
              />
            ) : (
              <CustomButton
                text="Edit video"
                variant="primary"
                rounded="full"
                onClick={handleEdit}
              />
            )}
          </div>
          <div className="flex items-center gap-3">
            <CustomButton
              children={
                <CounterAnimation
                  value={views}
                  formatter={formatViewsWithSeparators}
                  className="animate-pulse-once"
                />
              }
              icon={<FaEye size={22} />}
              variant="primary"
              rounded="full"
              className="bg-gray-600 hover:bg-gray-500 dark:bg-gray-600 hover:dark:bg-gray-600"
            />
            <Tooltip text="Reaction">
              <CustomButton
                text={totalLikes.toString()}
                icon={<HeartIcon filled={liked} color={liked ? "red" : "gray"} strokeColor="white" />}
                variant="primary"
                rounded="full"
                size="sm"
                onClick={() => handleLike(podcast.id)}
                className="bg-gray-600 hover:bg-gray-500 dark:bg-gray-600 hover:dark:bg-gray-500"
              />
            </Tooltip>
            <CustomButton
              text={language.common.share || "Share"}
              icon={<FaShareAlt size={20} />}
              variant="primary"
              rounded="full"
              onClick={toggleShareModal}
              className="bg-gray-600 hover:bg-gray-500 dark:bg-gray-600 hover:dark:bg-gray-500"
            />
            <CustomButton
              text={language.podcastView.watchParty || "Watch Party"}
              icon={<FaUsers size={20} />}
              variant="primary"
              rounded="full"
              onClick={() => {
                if (!isAuthenticated) {
                  toast.warning("Please login to do this action");
                  return;
                }
                navigate(`/watch-party?pid=${podcast.id}`)
              }}
              className="bg-purple-600 hover:bg-purple-500 dark:bg-purple-600 hover:dark:bg-purple-500"
            />
            <div className="relative">
              <CustomButton
                icon={<TfiMoreAlt size={20} />}
                variant="primary"
                rounded="full"
                onClick={toggleOptions}
                className="bg-gray-600 hover:bg-gray-500 dark:bg-gray-600 hover:dark:bg-gray-500"
              />
              {showOptions && (
                <div className="podcast-options absolute -top-10 right-0 -translate-y-2/3 w-48 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg z-50">
                  <ul className="py-1">
                    <li className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer" onClick={toggleReportModal}>
                      <FaFlag className="inline-block mb-1 mr-2" />
                      {language.common.report || "Report"}
                    </li>
                    {/* <li className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer" onClick={handleSave}>
                      <BsClockHistory className="inline-block mb-1 mr-2" />
                      {language.common.watchLater || "Watch Later"}
                    </li> */}
                    <li className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                      onClick={() => {
                        if (!isAuthenticated) {
                          toast.warning("Please login to do this action");
                          return;
                        }
                        toggleAddToPlaylistModal(podcast.id);
                      }}>
                      <RiPlayListAddFill className="inline-block mb-1 mr-2" />
                      {language.common.addToPlaylist || "Add to playlist"}
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="p-4 rounded-lg bg-gray-200 dark:bg-gray-800">
          <p className="text-gray-700 dark:text-white text-base font-bold mb-2">
            {language.podcastView.uploaded}:
            {/* {" " + formatDateTime(podcast.createdDay)} */}
            {" " + formatDistanceToNow(new Date(podcast.createdDay), { addSuffix: true })}
          </p>
          <pre ref={descriptionRef} className={`text-black dark:text-white whitespace-pre-wrap ${isDescriptionExpanded ? '' : 'line-clamp-5'}`} style={{ fontFamily: 'inherit', fontSize: 'inherit' }}>
            {podcast.content}
          </pre>
          {showDescToggle && (
            <button onClick={toggleDescription} className="text-blue-600 dark:text-blue-300 font-medium mt-2">
              {isDescriptionExpanded ? language.common.showLess : language.common.showMore}
            </button>
          )}
        </div>

        {/* Comments */}
        <CommentSection podcastId={id!} totalComments={podcast.totalComments} currentUserId={userRedux?.id!} />
      </div>
      <div className="lg:w-[30%] mt-6 lg:mt-0">
        {playlistId && (
          <div className="mb-8">
            <PlaylistSidebar
              playlistId={playlistId}
              currentPodcastId={id!}
              onNextPodcast={handleNextPodcast} />
          </div>
        )}

        {podcast?.genres &&
          <SuggestedPodcast
            // genreIds={podcast.genres.map((genre) => genre.id)} 
            genreIds={memoizedGenreIds}
            currentPodcastId={podcast.id}
          />
        }
      </div>
      {/* Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={toggleReportModal}
        targetId={id!}
        reportType={ReportType.P}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={toggleShareModal}
        podcastLink={podcastLink}
      />

      {/* Add to Playlist Modal */}
      {selectedPodcastId && (
        <AddToPlaylistModal
          isOpen={isPlaylistModalOpen}
          onClose={() => setIsPlaylistModalOpen(false)}
          podcastId={selectedPodcastId}
        />
      )}
    </div>
  );
};

export default PodcastViewport;