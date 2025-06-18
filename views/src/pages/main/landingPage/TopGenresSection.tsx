import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { axiosInstance } from '../../../utils/axiosInstance';
import { useToast } from '../../../context/ToastProvider';
import { RiImageAddLine } from 'react-icons/ri';
import { getGenresByList } from '../../../services/GenreService';
import { Genre } from '../../../models/GenreModel';
import { useLanguage } from '../../../context/LanguageContext';

interface TopGenre {
  id: string;
  name: string;
  count: number;
  genre?: Genre;
}

const TopGenresSection = () => {
  const [topGenres, setTopGenres] = useState<TopGenre[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const { language } = useLanguage();

  useEffect(() => {
    fetchTopGenres();
  }, []);

  const fetchTopGenres = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/v1/genre/public/usage-count');
      const sortedGenres = response.data.sort((a: any, b: any) => b.count - a.count).slice(0, 3);
      
      // Lấy thông tin chi tiết của các genre
      const genreIds = sortedGenres.map((g: any) => g.id);
      const genreDetails = await getGenresByList(genreIds);
      
      // Kết hợp thông tin
      const enrichedGenres = sortedGenres.map((genre: any) => ({
        ...genre,
        genre: genreDetails.find((g: Genre) => g.id === genre.id)
      }));
      
      setTopGenres(enrichedGenres);
    } catch (error) {
      console.error('Error fetching top genres:', error);
      toast.error('Có lỗi xảy ra khi tải dữ liệu thể loại');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-950 via-indigo-900 to-gray-900 rounded-2xl shadow-2xl mb-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  if (topGenres.length === 0) {
    return null;
  }

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-950 via-indigo-900 to-gray-900 rounded-2xl shadow-2xl mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 text-white">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-center sm:text-left drop-shadow-md">
          🏆 {language.landingPage?.topGenresTitle || "Thể loại phổ biến nhất"}
        </h1>
        <Link 
          to="/genres" 
          className="mt-4 sm:mt-0 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold shadow-md transition duration-200"
        >
          {language.common?.viewAll || "Xem tất cả"}
        </Link>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {topGenres.map((genre, index) => {
          // Sử dụng màu thực tế của genre nếu có, nếu không thì dùng màu mặc định
          const bgColor = genre.genre?.color || '#3B82F6';
          const textColor = genre.genre?.textColor || '#ffffff';
          
          return (
            <Link
              key={genre.id}
              to={`/genres/${genre.id}`}
              className="group relative rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden p-4 min-h-[140px] flex flex-col justify-between cursor-pointer transform hover:scale-105"
              style={{ 
                backgroundColor: bgColor,
                backgroundImage: `linear-gradient(135deg, ${bgColor}, ${bgColor}dd)`
              }}
            >
              {/* Medal Icon */}
              <div className="absolute top-3 right-3 text-xl">
                {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
              </div>

              {/* Genre Name */}
              <div className="z-10">
                <h3 
                  className="text-xl font-bold truncate mb-2 group-hover:text-white transition-colors" 
                  style={{ color: textColor }}
                >
                  {genre.name}
                </h3>
                <p className="text-sm opacity-80" style={{ color: textColor }}>
                  {genre.count} podcast{genre.count !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Genre Image */}
              {genre.genre?.imageUrl ? (
                <div className="absolute bottom-0 right-0 transform translate-x-4 translate-y-4 w-24 h-24 overflow-hidden rounded-lg rotate-12 shadow-lg opacity-80 group-hover:opacity-100 transition-opacity">
                  <img
                    src={genre.genre.imageUrl}
                    alt={genre.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="absolute bottom-0 right-0 transform translate-x-4 translate-y-4 w-24 h-24 overflow-hidden rounded-lg rotate-12 shadow-lg opacity-60 group-hover:opacity-80 transition-opacity bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <RiImageAddLine className="w-8 h-8 text-white/60" />
                </div>
              )}

              {/* Hover Effect Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 rounded-xl"></div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default TopGenresSection; 