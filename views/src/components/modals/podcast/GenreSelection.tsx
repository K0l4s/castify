import React from 'react';
import CustomModal from '../../UI/custom/CustomModal';

interface GenreSelectionProps {
  isOpen: boolean;
  onClose: () => void;
  genres: { id: string; name: string }[];
  selectedGenres: string[];
  setSelectedGenres: React.Dispatch<React.SetStateAction<string[]>>;
}

const GenreSelection: React.FC<GenreSelectionProps> = ({
  isOpen,
  onClose,
  genres,
  selectedGenres,
  setSelectedGenres,
}) => {
  const handleGenreChange = (genreId: string) => {
    setSelectedGenres((prevSelected) =>
      prevSelected.includes(genreId)
        ? prevSelected.filter((id) => id !== genreId)
        : prevSelected.length < 5
        ? [...prevSelected, genreId]
        : prevSelected
    );
  };

  return (
    <CustomModal isOpen={isOpen} onClose={onClose} title="Select genres for your podcast" animation='zoom' size='lg'>
      <span className='text-sm'>Click on tag to select or deselect. You can select up to 5.</span>
      <div className="flex flex-wrap gap-2">
        {genres.map((genre) => (
          <button
            key={genre.id}
            className={`px-4 py-2 rounded-full ${
              selectedGenres.includes(genre.id)
                ? 'text-white transition ease-in-out bg-blue-600 hover:-translate-y-1 hover:scale-110 hover:bg-indigo-600 duration-300'
                : 'text-white transition ease-in-out delay-150 bg-gray-500 hover:-translate-y-1 hover:scale-110 hover:bg-indigo-600 duration-300'
            }`}
            onClick={() => handleGenreChange(genre.id)}
          >
            {genre.name}
          </button>
        ))}
      </div>
    </CustomModal>
  );
};

export default GenreSelection;