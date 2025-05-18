import React, { useEffect, useState } from 'react';
import PlaylistService from '../../../services/PlaylistService';
import { PlaylistModel } from '../../../models/PlaylistModel';
import { useToast } from '../../../context/ToastProvider';
import { FiLoader } from 'react-icons/fi';
import CustomButton from '../../../components/UI/custom/CustomButton';
import CustomModal from '../../../components/UI/custom/CustomModal';
import { FaPlus } from 'react-icons/fa';
import CreatePlaylistModal from './CreatePlaylistModal';

interface AddToPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  podcastId: string;
}

const AddToPlaylistModal: React.FC<AddToPlaylistModalProps> = ({ isOpen, onClose, podcastId }) => {
  const [playlists, setPlaylists] = useState<PlaylistModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlaylists, setSelectedPlaylists] = useState<{ [key: string]: boolean }>({});
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const toast = useToast();

  const fetchUserPlaylists = async () => {
    setLoading(true);
    try {
      const data = await PlaylistService.getAuthUserPlaylist();
      setPlaylists(data);
      
      // Check which playlists already contain the podcast
      const playlistMap: { [key: string]: boolean } = {};
      data.forEach(playlist => {
        const isInPlaylist = playlist.items.some(item => item.podcastId === podcastId);
        playlistMap[playlist.id] = isInPlaylist;
      });
      setSelectedPlaylists(playlistMap);
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching playlists:", error);
      setError('Failed to fetch playlists');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchUserPlaylists();
    }
  }, [isOpen, podcastId]);

  const handleTogglePlaylist = async (playlistId: string) => {
    try {
      const isSelected = selectedPlaylists[playlistId];
      
      if (isSelected) {
        // Remove podcast from playlist
        await PlaylistService.removePodcastToPlaylist(playlistId, podcastId);
        toast.success('Removed from playlist');
      } else {
        // Add podcast to playlist
        await PlaylistService.addPodcastToPlaylist(playlistId, podcastId);
        toast.success('Added to playlist');
      }
      
      // Update the selected state
      setSelectedPlaylists(prev => ({
        ...prev,
        [playlistId]: !isSelected
      }));
    } catch (error) {
      console.error("Error updating playlist:", error);
      toast.error('Failed to update playlist');
    }
  };

  return (
    <>
      <CustomModal
        title="Add to Playlist"
        isOpen={isOpen}
        onClose={onClose}
        size="md"
      >
        <div className="flex flex-col p-4 max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Your Playlists</h3>
            <CustomButton
              text="Create New"
              icon={<FaPlus />}
              variant="primary"
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
            />
          </div>

          {loading ? (
            <div className="flex justify-center my-8">
              <FiLoader size={32} className="animate-spin text-blue-500" />
            </div>
          ) : error ? (
            <div className="text-red-500 text-center my-4">{error}</div>
          ) : playlists.length === 0 ? (
            <div className="text-center my-4">
              <p className="text-gray-600 dark:text-gray-400">You don't have any playlists yet</p>
              <CustomButton 
                text="Create a Playlist" 
                variant="primary"
                className="mt-4"
                onClick={() => {
                  // Navigate to create playlist page or open create playlist modal
                  toast.info("Create playlist feature coming soon");
                }}
              />
            </div>
          ) : (
            <>
              {playlists.map(playlist => (
                <div 
                  key={playlist.id} 
                  className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700"
                >
                  <div className="flex-1">
                    <h3 className="text-md font-medium text-gray-800 dark:text-gray-200">{playlist.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {playlist.publish ? 'Public' : 'Private'}
                    </p>
                  </div>
                  <div>
                    <input
                      type="checkbox"
                      checked={selectedPlaylists[playlist.id] || false}
                      onChange={() => handleTogglePlaylist(playlist.id)}
                      className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>
                </div>
              ))}
            </>
          )}
          <div className="flex justify-end mt-4">
            <CustomButton text="Close" variant="ghost" onClick={onClose} />
          </div>
        </div>
      </CustomModal>

      {/* Create Playlist Modal */}
      <CreatePlaylistModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)}
        onPlaylistCreated={fetchUserPlaylists}
      />
    </>
  );
};

export default AddToPlaylistModal;