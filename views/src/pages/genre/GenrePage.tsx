import { useState, useEffect } from 'react';
import { getGenres } from '../../services/GenreService';
import { Genre } from '../../models/GenreModel';
import { useToast } from '../../context/ToastProvider';
import { RiImageAddLine } from 'react-icons/ri';
import { Link } from 'react-router-dom';

const GenrePage = () => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [filteredGenres, setFilteredGenres] = useState<Genre[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchGenres();
  }, []);

  const fetchGenres = async () => {
    try {
      setLoading(true);
      const data = await getGenres();
      setGenres(data);
      setFilteredGenres(data);
    } catch (error) {
      console.error('Error fetching genres:', error);
      toast.error('Có lỗi xảy ra khi tải thể loại');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (!query.trim()) {
      setFilteredGenres(genres);
      return;
    }

    const filtered = genres.filter(genre => 
      genre.name.toLowerCase().includes(query)
    );
    setFilteredGenres(filtered);

    // if (filtered.length === 0) {
    //   toast.info('Không tìm thấy thể loại nào');
    // }
  };

  return (
    <div>
      <div className="container mx-auto px-4 py-8 min-h-screen">
        <h1 className="text-3xl font-bold mb-8 text-black dark:text-white text-center">Genres</h1>

        {/* Search Bar */}
        <div className="mb-8 flex justify-center">
          <div className="relative w-full max-w-xl">
            <div className="flex items-center px-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 hover:border-blue-500 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 dark:focus-within:ring-blue-800 transition-all duration-200 bg-white/5 backdrop-blur-sm">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192.904 192.904" width="18" className="flex-shrink-0 fill-gray-600 dark:fill-gray-400 mr-3 transition-colors duration-200">
                <path d="m190.707 180.101-47.078-47.077c11.702-14.072 18.752-32.142 18.752-51.831C162.381 36.423 125.959 0 81.191 0 36.422 0 0 36.423 0 81.193c0 44.767 36.422 81.187 81.191 81.187 19.688 0 37.759-7.049 51.831-18.751l47.079 47.078a7.474 7.474 0 0 0 5.303 2.197 7.498 7.498 0 0 0 5.303-12.803zM15 81.193C15 44.694 44.693 15 81.191 15c36.497 0 66.189 29.694 66.189 66.193 0 36.496-29.692 66.187-66.189 66.187C44.693 147.38 15 117.689 15 81.193z"></path>
              </svg>
              <input
                type="search"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search genre..."
                className="w-full bg-transparent text-black dark:text-white outline-none text-sm placeholder-gray-500 focus:placeholder-gray-400 transition-colors duration-200"
              />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Genre Grid - flex row card style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredGenres.map((genre) => (
            <Link
              key={genre.id}
              to={`/genres/${genre.id}`}
              className="relative rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-400 p-4 min-h-[140px] flex justify-between items-end"
              style={{ backgroundColor: genre.color || '#ffffff' }}
            >
              {/* Genre Name */}
              <div className="z-10 self-start">
                <h3 className="text-2xl font-bold truncate" style={{ color: genre.textColor || '#ffffff' }}>{genre.name}</h3>
              </div>

              {/* Genre Image */}
              <div className="absolute bottom-0 right-0 transform translate-x-8 translate-y-8 w-36 h-36 overflow-hidden rounded-lg rotate-12">
                {genre.imageUrl ? (
                  <img
                    src={genre.imageUrl}
                    alt={genre.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                    <RiImageAddLine className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* No Results */}
        {!loading && filteredGenres.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">Không tìm thấy thể loại nào</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenrePage; 