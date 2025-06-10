import React, { useEffect, useState } from 'react';
import { Genre } from '../../../models/GenreModel';
import { userService } from '../../../services/UserService';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import PodcastSection from './PodcastSection';

interface GenresPodcastListProps {
  onReport: (podcastId: string) => void;
  onAddToPlaylist: (podcastId: string) => void;
  onShare: (podcastId: string, podcastTitle?: string) => void;
}

const GenresPodcastList: React.FC<GenresPodcastListProps> = ({
  onReport,
  onAddToPlaylist,
  onShare
}) => {
  const [favoriteGenres, setFavoriteGenres] = useState<Genre[]>([]);
  const [suggestedGenres, setSuggestedGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        setLoading(true);
        
        if (isAuthenticated) {
          // User đã đăng nhập - lấy cả favorite và suggested
          try {
            const [favoriteResponse, suggestedResponse] = await Promise.all([
              userService.getFavoriteGenres(),
              userService.getSuggestedGenres()
            ]);
            
            const favorites = (favoriteResponse.data || []);
            const suggested = (suggestedResponse.data || []);
            
            setFavoriteGenres(favorites);
            setSuggestedGenres(suggested);
          } catch (error) {
            console.error('Failed to fetch user genres:', error);
            // Fallback to suggested genres only
            try {
              const suggestedResponse = await userService.getSuggestedGenres();
              setSuggestedGenres((suggestedResponse.data || []).slice(0, 8));
            } catch (fallbackError) {
              console.error('Failed to fetch suggested genres:', error);
            }
          }
        } else {
          // User chưa đăng nhập - chỉ lấy suggested (all genres) nhưng giới hạn số lượng
          try {
            const suggestedResponse = await userService.getSuggestedGenres();
            setSuggestedGenres((suggestedResponse.data || []).slice(0, 10)); // Tối đa 10 genres cho anonymous user
          } catch (error) {
            console.error('Failed to fetch genres for anonymous user:', error);
          }
        }
      } catch (error) {
        console.error('Failed to fetch genres:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGenres();
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="space-y-12">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-80 mb-8"></div>
          {[1, 2].map((i) => (
            <div key={i} className="space-y-4 mb-12">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
              <div className="flex gap-6">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="w-96 h-80 bg-gray-200 dark:bg-gray-700 rounded-2xl flex-shrink-0"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const hasFavorites = isAuthenticated && favoriteGenres.length > 0;
  const hasSuggested = suggestedGenres.length > 0;

  if (!hasFavorites && !hasSuggested) {
    return (
      <div className="text-center py-16">
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-4">🎧</div>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            No podcasts available yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {isAuthenticated 
              ? "Start exploring and liking genres to see personalized recommendations!"
              : "Sign in to get personalized podcast recommendations based on your preferences."
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-16">
      {/* Favorites Section */}
      {hasFavorites && (
        <PodcastSection
          title="Your Favorites"
          genres={favoriteGenres}
          type="favorites"
          onReport={onReport}
          onAddToPlaylist={onAddToPlaylist}
          onShare={onShare}
        />
      )}

      {/* Suggested Section */}
      {hasSuggested && (
        <PodcastSection
          title={isAuthenticated ? "You May Like" : "Discover Podcasts"}
          genres={suggestedGenres}
          type="suggested"
          onReport={onReport}
          onAddToPlaylist={onAddToPlaylist}
          onShare={onShare}
        />
      )}
    </div>
  );
};

export default GenresPodcastList;