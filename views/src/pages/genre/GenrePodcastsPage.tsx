import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPodcastsByGenre } from '../../services/PodcastService';
import { Podcast } from '../../models/PodcastModel';
import PodcastCard from '../../components/UI/podcast/PodcastCard';
import MainHeader from '../../components/header/MainHeader';

const PAGE_SIZE = 10;

const GenrePodcastsPage = () => {
  const { genreId } = useParams<{ genreId: string }>();
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (genreId) fetchPodcasts(genreId, 0);
    // eslint-disable-next-line
  }, [genreId]);

  const fetchPodcasts = async (id: string, pageNum: number) => {
    setLoading(true);
    try {
      const res = await getPodcastsByGenre(id, pageNum, PAGE_SIZE);
      setPodcasts(res.content);
      setTotalPages(res.totalPages);
      setPage(res.currentPage);
    } catch (err) {
      setPodcasts([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (genreId) fetchPodcasts(genreId, newPage);
  };

  return (
    <div>
      <MainHeader />
      <div className="container mx-auto px-4 py-8 min-h-screen">
        <h1 className="text-2xl font-bold mb-6 text-black dark:text-white text-center">Podcasts by Genre</h1>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : podcasts.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">No podcasts found for this genre.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {podcasts.map((podcast) => (
              <PodcastCard
                key={podcast.id}
                id={podcast.id}
                title={podcast.title}
                user={podcast.user}
                thumbnailUrl={podcast.thumbnailUrl || ''}
                views={podcast.views}
                duration={podcast.duration}
              />
            ))}
          </div>
        )}
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8 gap-2">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => handlePageChange(idx)}
                className={`px-3 py-1 rounded ${page === idx ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GenrePodcastsPage; 