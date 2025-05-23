// src/components/modals/user/ChooseGenreModal.tsx
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { getGenres } from '../../../services/GenreService';
import { userService } from '../../../services/UserService';
import { setUser } from '../../../redux/slice/authSlice';
import { useToast } from '../../../context/ToastProvider';
import CustomModal from '../../../components/UI/custom/CustomModal';

interface Genre {
  id: string;
  name: string;
}

interface ChooseGenreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChooseGenreModal: React.FC<ChooseGenreModalProps> = ({ isOpen, onClose }) => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchLoading, setFetchLoading] = useState<boolean>(true);
  
  const dispatch = useDispatch();
  const toast = useToast();

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        setFetchLoading(true);
        const response = await getGenres();
        setGenres(response);
        setFetchLoading(false);
      } catch (error) {
        console.error('Failed to fetch genres:', error);
        toast.error('Failed to load genres. Please try again.');
        setFetchLoading(false);
      }
    };

    if (isOpen) {
      fetchGenres();
    }
  }, [isOpen, toast]);

  const handleGenreToggle = (genreId: string) => {
    setSelectedGenres(prev => {
      if (prev.includes(genreId)) {
        return prev.filter(id => id !== genreId);
      } else {
        return [...prev, genreId];
      }
    });
  };

  const handleSubmit = async () => {
    if (selectedGenres.length === 0) {
      toast.warning('Please select at least one genre');
      return;
    }

    try {
      setLoading(true);
      await userService.updateGenreFavorites(selectedGenres);
      
      // Update user in Redux store with selected genres
      dispatch(setUser({ favoriteGenreIds: selectedGenres }));
      
      toast.success('Preferences saved successfully!');
      onClose();
    } catch (error) {
      console.error('Failed to update favorite genres:', error);
      toast.error('Failed to save preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // User opted to skip genre selection
    onClose();
  };

  return (
    <CustomModal
      title="Choose Your Favorite Genres"
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      closeOnEsc={false}
      closeOnOutsideClick={false}
    >
      <div className="p-4">
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Select genres you're interested in to personalize your podcast recommendations.
        </p>

        {fetchLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-8">
            {genres.map((genre) => (
              <div 
                key={genre.id}
                onClick={() => handleGenreToggle(genre.id)}
                className={`
                  cursor-pointer p-3 rounded-lg transition-all duration-200
                  ${selectedGenres.includes(genre.id) 
                    ? 'bg-blue-500 text-white shadow-lg transform scale-105' 
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'}
                `}
              >
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full mr-2 flex items-center justify-center border ${
                    selectedGenres.includes(genre.id) ? 'border-white bg-white' : 'border-gray-400 dark:border-gray-500'
                  }`}>
                    {selectedGenres.includes(genre.id) && (
                      <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                      </svg>
                    )}
                  </div>
                  <span className="text-sm font-medium">{genre.name}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <button
            onClick={handleSkip}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition"
          >
            Skip for now
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || selectedGenres.length === 0}
            className={`
              px-6 py-2 rounded-lg text-white font-medium transition-all
              ${loading || selectedGenres.length === 0 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'}
            `}
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : (
              'Save Preferences'
            )}
          </button>
        </div>
      </div>
    </CustomModal>
  );
};

export default ChooseGenreModal;