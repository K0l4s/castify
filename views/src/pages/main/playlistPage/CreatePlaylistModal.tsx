import React, { useState } from 'react';
import CustomModal from '../../../components/UI/custom/CustomModal';
import CustomButton from '../../../components/UI/custom/CustomButton';
import { useToast } from '../../../context/ToastProvider';
import PlaylistService from '../../../services/PlaylistService';
import { CreatePlaylistDTO } from '../../../models/PlaylistModel';

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlaylistCreated?: () => void;
}

const CreatePlaylistModal: React.FC<CreatePlaylistModalProps> = ({ isOpen, onClose, onPlaylistCreated }) => {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreatePlaylistDTO>({
    name: '',
    description: '',
    publish: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'radio') {
      const input = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: input.value === 'true'
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Please enter a playlist name');
      return;
    }
    
    setIsLoading(true);
    try {
      await PlaylistService.createPlaylist(formData);
      toast.success('Playlist created successfully');
      setFormData({
        name: '',
        description: '',
        publish: false,
      });
      if (onPlaylistCreated) {
        onPlaylistCreated();
      }
      onClose();
    } catch (error) {
      console.error('Failed to create playlist:', error);
      toast.error('Failed to create playlist');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CustomModal
      title="Create Playlist"
      isOpen={isOpen}
      onClose={onClose}
      size="md"
    >
      <form onSubmit={handleSubmit} className="p-4">
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Name*
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter playlist name"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-black dark:text-white"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter playlist description"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-black dark:text-white resize-none"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Visibility
          </label>
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="publish"
                value="true"
                checked={formData.publish === true}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600"
              />
              <span className="ml-2 text-gray-700 dark:text-gray-300">Public</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="publish"
                value="false"
                checked={formData.publish === false}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600"
              />
              <span className="ml-2 text-gray-700 dark:text-gray-300">Private</span>
            </label>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <CustomButton
            text="Cancel"
            variant="ghost"
            onClick={onClose}
          />
          <CustomButton
            text={isLoading ? "Creating..." : "Create Playlist"}
            variant="primary"
            type="submit"
            disabled={isLoading}
          />
        </div>
      </form>
    </CustomModal>
  );
};

export default CreatePlaylistModal;