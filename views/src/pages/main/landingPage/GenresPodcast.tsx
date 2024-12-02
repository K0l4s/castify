import React, { useEffect, useState } from 'react';
import { getPodcastsByGenre } from '../../../services/PodcastService';
import { Podcast } from '../../../models/PodcastModel';
import PodcastTag from '../../../components/UI/podcast/PodcastTag';

interface GenresPodcastProps {
  genreId: string;
}

const GenresPodcast: React.FC<GenresPodcastProps> = ({ genreId }) => {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPodcastsByGenre = async () => {
      setLoading(true);
      try {
        const response = await getPodcastsByGenre(genreId, 0, 10);
        setPodcasts(response.content);
        setLoading(false);
      } catch (error) {
        setError('Failed to fetch podcasts');
        setLoading(false);
      }
    };

    fetchPodcastsByGenre();
  }, [genreId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="genres-podcast">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {podcasts.map((podcast) => (
          <PodcastTag key={podcast.id} podcast={podcast} />
        ))}
      </div>
    </div>
  );
};

export default GenresPodcast;