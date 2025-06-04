import React, { useState } from 'react';
import { Podcast } from '../../../models/PodcastModel';
import { WatchPartyRoom } from '../../../models/WatchPartyModel';
import CustomModal from '../../../components/UI/custom/CustomModal';
import CustomButton from '../../../components/UI/custom/CustomButton';
import { FiImage, FiLoader } from 'react-icons/fi';
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
      size="lg"
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
          
          {/*Podcast Preview with Thumbnail */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Selected Podcast
            </label>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              <div className="flex gap-4">
                {/* Thumbnail */}
                <div className="flex-shrink-0">
                  {podcast.thumbnailUrl ? (
                    <img 
                      src={podcast.thumbnailUrl} 
                      alt={podcast.title}
                      className="w-64 h-32 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                      onError={(e) => {
                        e.currentTarget.src = "/TEST.png";
                      }}
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-300 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                      <FiImage className="text-gray-500 dark:text-gray-400" size={24} />
                    </div>
                  )}
                </div>
                
                {/* Podcast Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1 line-clamp-2" title={podcast.title}>
                    {podcast.title} Watch Party Watch Party Watch Party
                  </h4>
                  <p className="text-sm text-blue-600 dark:text-blue-300 mb-2">
                    by {podcast.user.fullname || podcast.user.username}
                  </p>
                  {podcast.content && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                      {podcast.content.length > 100 
                        ? `${podcast.content.substring(0, 100)}...` 
                        : podcast.content
                      }
                    </p>
                  )}
                </div>
              </div>
              
              {/* Room Preview */}
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                <p className="text-sm text-gray-500 dark:text-gray-200 mb-1">
                  This thumbnail will be used for your watch party room
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600 dark:text-gray-300">
                    Viewers will see this when browsing rooms
                  </span>
                </div>
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
              <span className="ml-2 text-md text-gray-700 dark:text-gray-300">
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