import React, { useEffect, useState } from "react";
import ProfileMainContent from "../../../components/main/profile/ProfileMainContent";
import PodcastCard from "../../../components/UI/podcast/PodcastCard";
import CustomButton from "../../../components/UI/custom/CustomButton";
import { Podcast } from "../../../models/PodcastModel";
import { getSelfPodcastsInCreator } from "../../../services/PodcastService";

const ProfilePage: React.FC = () => {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);

  useEffect(() => {
    const fetchPodcasts = async (page: number) => {
      try {
        const response = await getSelfPodcastsInCreator(page, 12, undefined, undefined, "desc");
        setPodcasts((prevPodcasts) => {
          const newPodcasts = response.content.filter(
            (newPodcast) => !prevPodcasts.some((podcast) => podcast.id === newPodcast.id)
          );
          return [...prevPodcasts, ...newPodcasts];
        });
        setTotalPages(response.totalPages);
        setLoading(false);
      } catch (error) {
        setError("Failed to fetch podcasts");
        setLoading(false);
      }
    };

    fetchPodcasts(currentPage);
  }, [currentPage]);

  const loadMorePodcasts = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  if (loading && currentPage === 0) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto">
          <ProfileMainContent />
          {/* selection */}
          <div className="flex justify-center gap-4 mb-8 p-2 bg-white dark:bg-gray-800 backdrop-blur-sm rounded-3xl shadow-xl mt-5">
            <CustomButton variant="primary">All</CustomButton>
            <CustomButton variant="secondary">Popular</CustomButton>
            <CustomButton variant="secondary">Newest</CustomButton>
            <CustomButton variant="secondary">Oldest</CustomButton>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {podcasts.map((podcast) => (
              <PodcastCard
                key={podcast.id}
                title={podcast.title}
                user={{
                  avatar: podcast.user.avatarUrl,
                  username: podcast.user.username,
                }}
                thumbnailUrl={podcast.thumbnailUrl || "/TEST.png"}
                // duration="1:23"
              />
            ))}
          </div>
          {currentPage < totalPages - 1 && (
            <div className="flex justify-center mt-8">
              <CustomButton onClick={loadMorePodcasts} variant="primary">
                Load More
              </CustomButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
