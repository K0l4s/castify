import { useState, useEffect } from 'react';
import { getAllGenres, createGenre, updateGenre, deleteGenre } from "../../../services/GenreService";
import { Genre } from "../../../models/GenreModel";

const AdminGenrePage = () => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [newGenreName, setNewGenreName] = useState<string>('');
  const [editingGenre, setEditingGenre] = useState<Genre | null>(null);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState<boolean>(false);  // Điều khiển modal xác nhận
  const [deleteGenreId, setDeleteGenreId] = useState<string | null>(null); // Lưu id thể loại muốn xóa

  useEffect(() => {
    setLoading(true);
    getAllGenres()
      .then((data) => {
        setGenres(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error loading genres:", error);
        setError('Failed to load genres.');
        setLoading(false);
      });
  }, []);

  const handleCreateGenre = async () => {
    if (!newGenreName.trim()) {
      setError('Genre name is required.');
      return;
    }

    try {
      const newGenre = await createGenre(newGenreName);
      setGenres([...genres, newGenre]);
      setNewGenreName('');
      setSuccessMessage('Genre created successfully!');
    } catch (error) {
      console.error('Error creating genre:', error);
      setError('Failed to create genre.');
    }
  };

  const handleUpdateGenre = async () => {
    if (!editingGenre || !editingGenre.name.trim()) {
      setError('Genre name is required.');
      return;
    }

    try {
      const updatedGenre = await updateGenre(editingGenre.id, editingGenre.name);
      setGenres(genres.map((genre) => (genre.id === updatedGenre.id ? updatedGenre : genre)));
      setEditingGenre(null);
      setSuccessMessage('Genre updated successfully!');
    } catch (error) {
      console.error('Error updating genre:', error);
      setError('Failed to update genre.');
    }
  };

  const handleDeleteGenre = async () => {
    if (deleteGenreId) {
      try {
        await deleteGenre(deleteGenreId);
        setGenres(genres.filter((genre) => genre.id !== deleteGenreId));
        setSuccessMessage('Genre deleted successfully!');
        setIsDeleting(false);
      } catch (error) {
        console.error('Error deleting genre:', error);
        setError('Failed to delete genre.');
        setIsDeleting(false);
      }
    }
  };

  const handleCancelDelete = () => {
    setIsDeleting(false);
    setDeleteGenreId(null);
  };

  const handleEditGenre = (genre: Genre) => {
    setEditingGenre({ ...genre });
  };

  const handleCancelEdit = () => {
    setEditingGenre(null);
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const filteredGenres = genres.filter((genre) =>
        genre.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setGenres(filteredGenres);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <h1 className="text-3xl font-bold mb-12">Quản lý thể loại</h1>

      {loading && <p className="text-blue-500">Loading genres...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {successMessage && <p className="text-green-500">{successMessage}</p>}

      <div className="mb-6">
        {/* Search input */}
        <div className="relative max-w-xl mx-auto">
          <div className="flex items-center px-4 py-2 mb-5 rounded-full border border-gray-300 dark:border-gray-600 hover:border-blue-500 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 dark:focus-within:ring-blue-800 transition-all duration-200 bg-white/5 backdrop-blur-sm">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192.904 192.904" width="18" className="flex-shrink-0 fill-gray-600 dark:fill-gray-400 mr-3 transition-colors duration-200">
              <path d="m190.707 180.101-47.078-47.077c11.702-14.072 18.752-32.142 18.752-51.831C162.381 36.423 125.959 0 81.191 0 36.422 0 0 36.423 0 81.193c0 44.767 36.422 81.187 81.191 81.187 19.688 0 37.759-7.049 51.831-18.751l47.079 47.078a7.474 7.474 0 0 0 5.303 2.197 7.498 7.498 0 0 0 5.303-12.803zM15 81.193C15 44.694 44.693 15 81.191 15c36.497 0 66.189 29.694 66.189 66.193 0 36.496-29.692 66.187-66.189 66.187C44.693 147.38 15 117.689 15 81.193z"></path>
            </svg>
            <input
              type="search"
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              value={searchQuery}
              placeholder="Search for genres..."
              className="w-full bg-transparent text-black dark:text-white outline-none text-sm placeholder-gray-500 focus:placeholder-gray-400 transition-colors duration-200"
              aria-label="Search"
              data-testid="search-input"
            />
          </div>
        </div>
      </div>

      {/* Create new genre */}
      <div className="mb-6">
        <h3 className="text-2xl font-bold mb-4">Thêm thể loại mới</h3>
        <div className="flex items-center gap-2">
        <input
          type="text"
          value={newGenreName}
          onChange={(e) => setNewGenreName(e.target.value)}
          placeholder="Enter genre name"
          className="flex-grow px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/5 dark:bg-gray-800 text-black dark:text-white"
        />    
          <button
            onClick={handleCreateGenre}
            className="px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Create
          </button>
        </div>
      </div>

      {/* Edit genre */}
      {/* Edit genre */}
      {editingGenre && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Edit Genre</h3>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={editingGenre.name}
              onChange={(e) => setEditingGenre({ ...editingGenre, name: e.target.value })}
              placeholder="Enter genre name"
              className="flex-grow px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/5 dark:bg-gray-800 text-black dark:text-white"
            />
            <button
              onClick={handleUpdateGenre}
              className="px-4 py-2 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Update
            </button>
            <button
              onClick={handleCancelEdit}
              className="px-4 py-2 bg-gray-400 text-white font-medium rounded-lg hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}


      {/* Genre list */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold mb-4">Danh sách thể loại</h2>
        {genres.map((genre) => (
          <div
            key={genre.id}
            className="flex justify-between items-center px-4 py-2 border border-gray-300 rounded-lg hover:shadow-md"
          >
            <span className="text-lg font-medium">{genre.name}</span>
            <div className="flex gap-2">
              <button
                onClick={() => handleEditGenre(genre)}
                className="px-3 py-1 text-sm bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
              >
                Edit
              </button>
              <button
                onClick={() => { setIsDeleting(true); setDeleteGenreId(genre.id); }}
                className="px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>


      {/* Modal xác nhận */}
      {isDeleting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96">
            <h3 className="text-xl font-semibold mb-4 text-center">Are you sure you want to delete this genre?</h3>
            <div className="flex justify-between">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 bg-gray-300 text-black rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteGenre}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGenrePage;
