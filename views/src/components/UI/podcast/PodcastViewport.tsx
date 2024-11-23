import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getPodcastById, getPodcastComments, getSelfPodcastsInCreator } from "../../../services/PodcastService";
import { Podcast } from "../../../models/PodcastModel";

const PodcastViewport: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const id = queryParams.get("pid");

  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [suggestedPodcasts, setSuggestedPodcasts] = useState<any[]>([]);

  useEffect(() => {
    const fetchPodcast = async () => {
      try {
        if (id) {
          const podcastData = await getPodcastById(id);
          setPodcast(podcastData);
        }
      } catch (error) {
        console.error("Error fetching podcast:", error);
      }
    };

    const fetchComments = async () => {
      try {
        if (id) {
          const commentsData = await getPodcastComments(id);
          setComments(commentsData);
        }
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

    const fetchSuggestedPodcasts = async () => {
      try {
        const suggestedData = await getSelfPodcastsInCreator();
        setSuggestedPodcasts(suggestedData.podcasts);
      } catch (error) {
        console.error("Error fetching suggested podcasts:", error);
      }
    };

    fetchPodcast();
    fetchComments();
    fetchSuggestedPodcasts();
  }, [id]);

  if (!podcast) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex flex-col lg:flex-row p-4 lg:p-8 bg-white text-black dark:bg-gray-900 dark:text-white">
      <div className="flex-1 lg:mr-8">
        <video className="w-full mb-4 rounded-lg" controls>
          <source src={podcast.videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <h1 className="text-2xl font-bold mb-4">{podcast.title}</h1>

        <p className="text-gray-700 dark:text-gray-300 mb-2">{podcast.content}</p>
        <div className="flex items-center text-gray-600 dark:text-gray-400 mb-4">
          <span className="mr-4">Views: {podcast.views}</span>
          <span className="mr-4">Likes: {podcast.totalLikes}</span>
          <span>Comments: {podcast.totalComments}</span>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Comments</h2>
          {comments.map(comment => (
            <div key={comment.id} className="mb-4 p-4 border rounded-lg border-gray-300 dark:border-gray-700">
              <p className="text-gray-800 dark:text-gray-200">{comment.content}</p>
              <div className="flex items-center text-gray-600 dark:text-gray-400 mt-2">
                <span className="mr-4">Likes: {comment.totalLikes}</span>
                <span>Replies: {comment.totalReplies}</span>
                <span className="ml-auto">{new Date(comment.timestamp).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
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