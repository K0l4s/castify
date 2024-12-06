import React, { useEffect, useState } from 'react';
import { getPodcastsByGenre } from '../../../services/PodcastService';
import { Podcast } from '../../../models/PodcastModel';
import PodcastTag from '../../../components/UI/podcast/PodcastTag';
import { FiLoader } from 'react-icons/fi';

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
    return <div className="flex justify-center items-center h-screen">
      <FiLoader size={48} className="text-black dark:text-white animate-spin"/>
    </div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen">
      <p className='text-xl text-red-700 dark:text-red-400'>{error}</p>
    </div>;
  }

  return (
    <div className="genres-podcast">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {podcasts.map((podcast) => (
          <PodcastTag key={podcast.id} podcast={podcast} />
        ))}
      </div>
    </div>
  );
};

export default GenresPodcast;