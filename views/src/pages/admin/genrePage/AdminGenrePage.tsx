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

  // Fetch all genres on component mount
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

  // Handle creating a new genre
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

  // Handle updating an existing genre
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

  // Handle deleting a genre
  const handleDeleteGenre = async (id: string) => {
    try {
      await deleteGenre(id);
      setGenres(genres.filter((genre) => genre.id !== id));
      setSuccessMessage('Genre deleted successfully!');
    } catch (error) {
      console.error('Error deleting genre:', error);
      setError('Failed to delete genre.');
    }
  };

  // Handle editing genre
  const handleEditGenre = (genre: Genre) => {
    setEditingGenre({ ...genre });
  };

  const handleCancelEdit = () => {
    setEditingGenre(null);
  };

  return (
    <div>
      <h1>Admin Genre Management</h1>
      {loading && <p>Loading genres...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}

      {/* Create Genre */}
      <div>
        <h3>Create New Genre</h3>
        <input
          type="text"
          value={newGenreName}
          onChange={(e) => setNewGenreName(e.target.value)}
          placeholder="Enter genre name"
        />
        <button onClick={handleCreateGenre}>Create</button>
      </div>

      {/* Edit Genre */}
      {editingGenre && (
        <div>
          <h3>Edit Genre</h3>
          <input
            type="text"
            value={editingGenre.name}
            onChange={(e) => setEditingGenre({ ...editingGenre, name: e.target.value })}
            placeholder="Enter genre name"
          />
          <button onClick={handleUpdateGenre}>Update</button>
          <button onClick={handleCancelEdit}>Cancel</button>
        </div>
      )}

      {/* Display list of genres */}
      <div>
        <h3>Genre List</h3>
        <ul>
          {genres.map((genre) => (
            <li key={genre.id}>
              <span>{genre.name} - {genre.isActive ? 'Active' : 'Inactive'}</span>
              <button onClick={() => handleEditGenre(genre)}>Edit</button>
              <button onClick={() => handleDeleteGenre(genre.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AdminGenrePage;
