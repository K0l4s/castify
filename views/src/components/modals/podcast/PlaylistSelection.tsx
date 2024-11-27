import React from 'react';
import CustomButton from '../../UI/custom/CustomButton';
import CustomModal from '../../UI/custom/CustomModal';

interface PlaylistSectionProps {
  selectedPlaylists: any[];
  setShowPlaylistModal: (value: boolean) => void;
  showPlaylistModal: boolean;
  playlists: any[];
  handlePlaylistChange: (playlistId: string) => void;
}

const PlaylistSection: React.FC<PlaylistSectionProps> = ({ selectedPlaylists, setShowPlaylistModal, showPlaylistModal, playlists, handlePlaylistChange }) => {
  return (
    <div className="col-span-2">
      <div className="flex flex-col w-1/2">
        <label className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          Playlist
        </label>
        <CustomButton
          onClick={() => setShowPlaylistModal(true)}
          text={
            selectedPlaylists.length > 0
              ? `${selectedPlaylists.length} Playlists Selected`
              : "Select Playlists"
          }
        />
      </div>

      <CustomModal
        isOpen={showPlaylistModal}
        onClose={() => setShowPlaylistModal(false)}
        animation="zoom"
        size="md"
        title="Select Playlists"
      >
        <div className="max-h-64 overflow-y-auto">
          {playlists.map((playlist) => (
            <div key={playlist._id} className="flex items-center mb-2">
              <input
                type="checkbox"
                id={`playlist-${playlist._id}`}
                checked={selectedPlaylists.includes(playlist._id)}
                onChange={() => handlePlaylistChange(playlist._id)}
              />
              <label htmlFor={`playlist-${playlist._id}`} className="ml-2">
                {playlist.name}
              </label>
            </div>
          ))}
        </div>
      </CustomModal>
    </div>
  );
};

export default PlaylistSection;