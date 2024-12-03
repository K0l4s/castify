import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getPodcastByAnonymous, getPodcastById, getSelfPodcastsInCreator, incrementPodcastViews, likePodcast } from "../../../services/PodcastService";
import { Podcast } from "../../../models/PodcastModel";
import defaultAvatar from "../../../assets/images/default_avatar.jpg";
import CustomButton from "../custom/CustomButton";
import { HeartIcon } from "../custom/SVG_Icon";
import { FaBookmark, FaEye, FaFlag, FaShareAlt } from "react-icons/fa";
import { TfiMoreAlt } from "react-icons/tfi";
// import { formatDateTime } from "../../../utils/DateUtils";
import CommentSection from "./CommentSection";
import Tooltip from "../custom/Tooltip";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { useToast } from "../../../context/ToastProvider";
import { formatDistanceToNow } from 'date-fns';
import { setupVideoViewTracking } from "./video";

const PodcastViewport: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const id = queryParams.get("pid");

  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [suggestedPodcasts, setSuggestedPodcasts] = useState<any[]>([]);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [showDescToggle, setShowDescToggle] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const descriptionRef = useRef<HTMLPreElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const userRedux = useSelector((state: RootState) => state.auth.user);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const toast = useToast();
  const navigate = useNavigate();

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
        }
      } catch (error) {
        console.error("Error fetching podcast:", error);
      }
    };

    const fetchSuggestedPodcasts = async () => {
      try {
        const suggestedData = await getSelfPodcastsInCreator(); // Temporary
        setSuggestedPodcasts(suggestedData.content);
      } catch (error) {
        console.error("Error fetching suggested podcasts:", error);
      }
    };

    fetchPodcast();
    fetchSuggestedPodcasts();
  }, [id, isAuthenticated]);

  // increment podcast views
  useEffect(() => {
    if (videoRef.current) {
      const cleanup = setupVideoViewTracking(videoRef.current, incrementPodcastViews, id!);
      return cleanup;
    }
  }, [id, isAuthenticated, podcast]);

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

  if (!podcast) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
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
      setPodcast(updatedPodcast);
    } catch (error) {
      console.error("Error liking podcast:", error);
    }
  };

  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };

  const handleEdit = () => {
    console.log("Edit podcast");
    // Add edit logic here
  };

  const handleReport = () => {
    console.log("Report podcast");
    // Add report logic here
  };

  const handleSave = () => {
    console.log("Save podcast");
    // Add save logic here
  };

  // const userInfo = podcast?.user.lastName + " " + podcast?.user.middleName + " " +podcast?.user.firstName;
  const userInfo = podcast?.user.fullname;
  return (
    <div className="flex flex-col lg:flex-row p-4 lg:p-8 bg-white text-black dark:bg-gray-900 dark:text-white">
      <div className="flex-1 lg:mr-8">
        <video ref={videoRef} autoPlay className="w-full mb-4 rounded-lg" controls poster={podcast.thumbnailUrl || "/TEST.png"}>
          <source src={podcast.videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        <h1 className="text-2xl font-bold my-2">{podcast.title}</h1>

        {/* Info */}
        <div className="flex items-center justify-between mt-2 my-4 gap-3">
          <div className="flex items-center gap-3">
            <img 
              src={podcast.user.avatarUrl || defaultAvatar} 
              alt="avatar" 
              className="w-10 h-10 rounded-full cursor-pointer" 
              onClick={() => navigate(`/profile/${userRedux?.username}`)}
            />
            <div className="flex flex-col">
              <span 
                className="text-base font-medium text-black dark:text-white cursor-pointer" 
                onClick={() => navigate(`/profile/${userRedux?.username}`)}>
                {userInfo}
              </span>
              <span className="text-sm text-gray-700 dark:text-gray-300">100K Follow</span>
            </div>
            {podcast.user.id !== userRedux?.id ? (
              <CustomButton
                text="Follow"
                variant="primary"
                rounded="full"
                onClick={() => {
                  if (!isAuthenticated) {
                    toast.warning("Please login to do this action");
                  }
                }}
                className="bg-gray-600 hover:bg-gray-500 dark:bg-gray-600 hover:dark:bg-gray-500"
              />
            ): (
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
              text={podcast.views.toString() + " views"}
              icon={<FaEye size={22} />}
              variant="primary"
              rounded="full"
              className="bg-gray-600 hover:bg-gray-500 dark:bg-gray-600 hover:dark:bg-gray-600"
            />
            <Tooltip text="Reaction">
              <CustomButton
                text={podcast.totalLikes.toString()}
                icon={<HeartIcon filled={podcast.liked} color={podcast.liked ? "white" : "gray"} strokeColor="white" />}
                variant="primary"
                rounded="full"
                size="sm"
                onClick={() => handleLike(podcast.id)}
                className="bg-gray-600 hover:bg-gray-500 dark:bg-gray-600 hover:dark:bg-gray-500"
              />
            </Tooltip>
            <CustomButton
              text="Share"
              icon={<FaShareAlt size={20}/>}
              variant="primary"
              rounded="full"
              className="bg-gray-600 hover:bg-gray-500 dark:bg-gray-600 hover:dark:bg-gray-500"
            />
            <div className="relative">
            <CustomButton
              icon={<TfiMoreAlt size={20}/>}
              variant="primary"
              rounded="full"
              onClick={toggleOptions}
              className="bg-gray-600 hover:bg-gray-500 dark:bg-gray-600 hover:dark:bg-gray-500"
            />
            {showOptions && (
              <div className="podcast-options absolute -top-10 right-0 -translate-y-2/3 w-48 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg z-50">
                <ul className="py-1">
                  <li className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer" onClick={handleReport}>
                    <FaFlag className="inline-block mb-1 mr-2" />
                    Report
                  </li>
                  <li className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer" onClick={handleSave}>
                    <FaBookmark className="inline-block mb-1 mr-2" />
                    Save
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
            Uploaded:
            {/* {" " + formatDateTime(podcast.createdDay)} */}
            {" " + formatDistanceToNow(new Date(podcast.createdDay), { addSuffix: true })}
          </p>
          <pre ref={descriptionRef} className={`text-black dark:text-white whitespace-pre-wrap ${isDescriptionExpanded ? '' : 'line-clamp-5'}`} style={{ fontFamily: 'inherit', fontSize: 'inherit' }}>
            {podcast.content}
          </pre>
          {showDescToggle && (
            <button onClick={toggleDescription} className="text-blue-600 dark:text-blue-300 font-medium mt-2">
              {isDescriptionExpanded ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>

        {/* Comments */}
        <CommentSection podcastId={id!} totalComments={podcast.totalComments} currentUserId={userRedux?.id!}/>
      </div>

      <div className="w-full lg:w-1/4 mt-8 lg:mt-0">
        <h2 className="text-xl font-semibold mb-4">Suggested for you</h2>
        {suggestedPodcasts.map(suggested => (
          <div key={suggested.id} className="mb-4 p-4 border rounded-lg border-gray-300 dark:border-gray-700">
            <h3 className="text-lg font-bold">{suggested.title}</h3>
            <p className="text-gray-700 dark:text-gray-300">{suggested.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PodcastViewport;