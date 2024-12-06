import React, { useEffect, useState } from "react";
import ProfileMainContent from "../../../components/main/profile/ProfileMainContent";
import PodcastCard from "../../../components/UI/podcast/PodcastCard";
import CustomButton from "../../../components/UI/custom/CustomButton";
import { Podcast } from "../../../models/PodcastModel";
import { getUserPodcasts } from "../../../services/PodcastService";
import { FiLoader } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialSortBy = queryParams.get("sortBy") as 'newest' | 'views' | 'oldest' || 'newest';

  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'newest' | 'views' | 'oldest'>(initialSortBy);

  const username = location.pathname.split("/")[2];

  const fetchPodcasts = async (username: string, page: number, sortBy: 'newest' | 'views' | 'oldest') => {
    try {
      const response = await getUserPodcasts(username, page, 12, sortBy);
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

  useEffect(() => {
    fetchPodcasts(username, currentPage, sortBy);
  }, [currentPage, sortBy]);

  const loadMorePodcasts = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handleSortChange = (newSortBy: 'newest' | 'views' | 'oldest') => {
    if (sortBy === newSortBy) {
      fetchPodcasts(username, 0, newSortBy);
    } else {
      setSortBy(newSortBy);
      setCurrentPage(0);
      setPodcasts([]);
      navigate(`?sortBy=${newSortBy}`);
    }
  };

  if (loading && currentPage === 0) {
    return (
      <div className="min-h-screen">
        <div className="mx-auto flex justify-center ">
          <FiLoader size={48} className="text-black dark:text-white animate-spin"/>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <div className="mx-auto flex justify-center ">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto">
          <ProfileMainContent />
          {/* selection */}
          <div className="flex justify-center gap-4 mb-8 p-2 bg-white dark:bg-gray-800 backdrop-blur-sm rounded-3xl shadow-xl mt-5">
            <CustomButton variant={sortBy === 'newest' ? 'primary' : 'secondary'} onClick={() => handleSortChange('newest')}>Newest</CustomButton>
            <CustomButton variant={sortBy === 'views' ? 'primary' : 'secondary'} onClick={() => handleSortChange('views')}>Views</CustomButton>
            <CustomButton variant={sortBy === 'oldest' ? 'primary' : 'secondary'} onClick={() => handleSortChange('oldest')}>Oldest</CustomButton>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 min-h-[80vh]">
            {podcasts.map((podcast) => (
              <PodcastCard
                key={podcast.id}
                id={podcast.id}
                title={podcast.title}
                user={{
                  avatar: podcast.user.avatarUrl,
                  username: podcast.user.username,
                }}
                thumbnailUrl={podcast.thumbnailUrl || "/TEST.png"}
                views={podcast.views}
                duration={podcast.duration}
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
