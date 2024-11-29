import React, { useEffect, useState } from 'react';
import { getPodcastRecent } from '../../../services/PodcastService';
import { Podcast } from '../../../models/PodcastModel';
import PodcastTag from '../../../components/UI/podcast/PodcastTag';

const RecentPodcast: React.FC = () => {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentPodcasts = async () => {
      try {
        const response = await getPodcastRecent(0, 20);
        setPodcasts(response.content);
        setLoading(false);
      } catch (error) {
        setError('Failed to fetch recent podcasts');
        setLoading(false);
      }
    };

    fetchRecentPodcasts();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-black dark:text-white">Recent Podcasts</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {podcasts.map((podcast) => (
          <PodcastTag key={podcast.id} podcast={podcast} />
        ))}
      </div>
    </div>
  );
};

export default RecentPodcast;