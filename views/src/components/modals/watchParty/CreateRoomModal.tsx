import React, { useState } from 'react';
import { Podcast } from '../../../models/PodcastModel';
import { WatchPartyRoom } from '../../../models/WatchPartyModel';
import CustomModal from '../../../components/UI/custom/CustomModal';
import CustomButton from '../../../components/UI/custom/CustomButton';
import { FiLoader } from 'react-icons/fi';
// import { useLanguage } from '../../../context/LanguageContext';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (podcastId: string, roomName: string, publish: boolean) => Promise<WatchPartyRoom | null>;
  podcast: Podcast | null;
}

const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  podcast
}) => {
  const [roomName, setRoomName] = useState(podcast ? `${podcast.title} Watch Party` : '');
  const [publish, setPublish] = useState(true);
  const [loading, setLoading] = useState(false);
  // const { language } = useLanguage();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!podcast || !roomName.trim()) return;
    
    try {
      setLoading(true);
      await onSubmit(podcast.id, roomName.trim(), publish);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Watch Party"
      size="md"
    >
      {!podcast ? (
        <div className="p-4 text-center">
          <p className="text-red-500">Please select a podcast first</p>
          <CustomButton
            text="Close"
            variant="primary"
            onClick={onClose}
            className="mt-4"
          />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Room Name
            </label>
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
              maxLength={50}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Podcast
            </label>
            <div className="flex items-center gap-3">
              <img 
                src={podcast.thumbnailUrl || "https://via.placeholder.com/60x60"} 
                alt={podcast.title}
                className="w-12 h-12 object-cover rounded"
              />
              <div className="truncate flex-1">
                <p className="font-medium truncate">{podcast.title}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {podcast.user.fullname || podcast.user.username}
                </p>
              </div>
            </div>
          </div>
          
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={publish}
                onChange={(e) => setPublish(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Make this room public (visible to everyone)
              </span>
            </label>
          </div>
          
          <div className="flex justify-end gap-2 pt-2">
            <CustomButton
              text="Cancel"
              variant="ghost"
              onClick={onClose}
              disabled={loading}
            />
            <CustomButton
              text={loading ? 'Creating...' : 'Create Room'}
              type="submit"
              variant="primary"
              disabled={loading || !roomName.trim()}
              icon={loading ? <FiLoader className="animate-spin" /> : undefined}
            />
          </div>
        </form>
      )}
    </CustomModal>
  );
};

export default CreateRoomModal;