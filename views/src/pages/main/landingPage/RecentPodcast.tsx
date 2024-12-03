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
        console.log(response.content);
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {podcasts.map((podcast) => (
          <PodcastTag key={podcast.id} podcast={podcast} />
        ))}
      </div>
    </div>
  );
};

export default RecentPodcast;